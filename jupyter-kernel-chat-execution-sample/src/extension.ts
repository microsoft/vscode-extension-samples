import {
	CancellationTokenSource,
	CancellationToken,
	Disposable,
	ExtensionContext,
	NotebookCellOutputItem,
	OutputChannel,
	QuickPickItem,
	commands,
	extensions,
	window,
	workspace,
} from 'vscode';
import { Jupyter, Kernel } from '@vscode/jupyter-extension';
import path = require('path');
import { TextDecoder } from 'util';

export function activate(context: ExtensionContext) {
	const jupyterExt = extensions.getExtension<Jupyter>('ms-toolsai.jupyter');
	if (!jupyterExt) {
		throw new Error('Jupyter Extension not installed');
	}
	if (!jupyterExt.isActive) {
		jupyterExt.activate();
	}
	const output = window.createOutputChannel('Jupyter Kernel Execution');
	context.subscriptions.push(output);
	context.subscriptions.push(
		commands.registerCommand('jupyterKernelExecution.executePythonCode', async () => {
			const notebook = window.activeNotebookEditor?.notebook;
			if (!notebook) {
				window.showErrorMessage('No active notebook');
				return;
			}
			const kernel = await jupyterExt.exports.kernels.getKernel(notebook.uri);
			if (!kernel) {
				window.showErrorMessage('No active Kernel');
				return;
			}
			if (kernel.language !== 'python') {
				window.showErrorMessage('Please select a Python kernel');
				return;
			}
			const token = new CancellationTokenSource();
			const result = await executePythonCode(kernel, token.token).finally(() =>
				token.dispose()
			);
			if (result) {
				window.showInformationMessage(
					`Result Status = ${result.status}, Output = ${result.output}`
				);
			} else {
				window.showErrorMessage('No result');
			}
		})
	);
}

const textMimes = [NotebookCellOutputItem.text(''), NotebookCellOutputItem.stdout('')];
const errorMimes = [
	NotebookCellOutputItem.error(new Error('')),
	NotebookCellOutputItem.stderr(''),
];

type ProcessingResult = {
	status: 'ok' | 'error';
	output: string;
};
const textDecoder = new TextDecoder();
async function executePythonCode(
	kernel: Kernel,
	token: CancellationToken
): Promise<ProcessingResult | undefined> {
	const code = `
from vscode import chat

def step1():
    print("Started Step1")
    chat.send_message("generatePandaSummary", {"name": "df", "shape": [10, 5]}, step2)

def step2(data):
    print(f"Inside Step2, got data {data['summary']}")
    chat.send_message("generatePlot", {"name": "df", "type": "histogram", }, step3)

def step3(data):
    print(f"Inside Step3, got data {data['output']}")
    import IPython.display
    display({"application/vnd.custom.extension.message": {"status":"ok", "output": data["output"]}}, raw=True)

step1()
`;

	const handlers: Record<string, (...data: any[]) => Promise<any>> = {
		generatePandaSummary: async (_data: {
			df: string;
			shape: [rows: number, columns: number];
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return { summary: 'Panda Summary' };
		},
		generatePlot: async (_data: {
			df: string;
			type: 'histogram' | 'line' | 'scatter';
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return { output: 'df.plot(...)' };
		},
	};
	for await (const output of kernel.executeChatCode(code, handlers, token)) {
		output.items.forEach((item) => {
			if (textMimes.some((mime) => mime.mime === item.mime)) {
				console.log(textDecoder.decode(item.data));
			}
			if (errorMimes.some((mime) => mime.mime === item.mime)) {
				const errorMessage = textDecoder.decode(item.data);
				console.error(errorMessage);
				throw new Error(errorMessage);
			}
		});
		const result = output.items.find(
			(item) => item.mime === 'application/vnd.custom.extension.message'
		);
		if (result) {
			return JSON.parse(textDecoder.decode(result.data));
		}
	}
}
