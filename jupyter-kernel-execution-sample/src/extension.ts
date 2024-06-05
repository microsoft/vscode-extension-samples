import {
	CancellationTokenSource,
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
		commands.registerCommand('jupyterKernelExecution.listKernels', async () => {
			const kernel = await selectKernel();
			if (!kernel) {
				return;
			}
			const code = await selectCodeToRunAgainstKernel();
			if (!code) {
				return;
			}
			await executeCode(kernel, code, output);
		})
	);
}

const ErrorMimeType = NotebookCellOutputItem.error(new Error('')).mime;
const StdOutMimeType = NotebookCellOutputItem.stdout('').mime;
const StdErrMimeType = NotebookCellOutputItem.stderr('').mime;
const MarkdownMimeType = 'text/markdown';
const HtmlMimeType = 'text/html';
const textDecoder = new TextDecoder();
async function executeCode(kernel: Kernel, code: string, logger: OutputChannel) {
	logger.show();
	logger.appendLine(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);
	logger.appendLine(`Executing code against kernel ${code}`);
	const tokenSource = new CancellationTokenSource();
	try {
		for await (const output of kernel.executeCode(code, tokenSource.token)) {
			for (const outputItem of output.items) {
				if (outputItem.mime === ErrorMimeType) {
					const error = JSON.parse(textDecoder.decode(outputItem.data)) as Error;
					logger.appendLine(
						`Error executing code ${error.name}: ${error.message},/n ${error.stack}`
					);
				} else {
					logger.appendLine(
						`${outputItem.mime} Output: ${textDecoder.decode(outputItem.data)}`
					);
				}
			}
		}
		logger.appendLine('Code execution completed');
		logger.appendLine(`<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
	} catch (ex){
		logger.appendLine(`Code execution failed with an error '${ex}'`);
		logger.appendLine(`<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
	} finally {
		tokenSource.dispose();
	}
}

const printHelloWorld = `print('Hello World')`;
const throwAnError = `raise Exception('Hello World')`;
const displayMarkdown = `from IPython.display import display, Markdown
display(Markdown('*some markdown*'))`;
const displayHtml = `from IPython.display import display, HTML
display(HTML('<div>Hello World</div>'))`;
const printToStdErr = `import sys
print('Hello World', file=sys.stderr)`;
const streamOutput = `import time
for i in range(10):
	print(i)
	time.sleep(1)`;

const codeSnippets = new Map([
	['Print Hello World', printHelloWorld],
	['Stream Output', streamOutput],
	['Display Markdown', displayMarkdown],
	['Display HTML', displayHtml],
	['Print to StdErr', printToStdErr],
	['Throw an Error', throwAnError],
]);

async function selectCodeToRunAgainstKernel() {
	const selection = await window.showQuickPick(Array.from(codeSnippets.keys()), {
		placeHolder: 'Select code to execute against the kernel',
	});
	if (!selection) {
		return;
	}
	return codeSnippets.get(selection);
}

async function selectKernel(): Promise<Kernel | undefined> {
	const extension = extensions.getExtension<Jupyter>('ms-toolsai.jupyter');
	if (!extension) {
		throw new Error('Jupyter extension not installed');
	}
	await extension.activate();

	if (workspace.notebookDocuments.length === 0) {
		window.showErrorMessage(
			'No notebooks open. Open a notebook, run a cell and then try this command'
		);
		return;
	}
	const toDispose: Disposable[] = [];

	return new Promise<Kernel | undefined>((resolve) => {
		const quickPick = window.createQuickPick<QuickPickItem & { kernel: Kernel }>();
		toDispose.push(quickPick);
		const quickPickItems: (QuickPickItem & { kernel: Kernel })[] = [];
		quickPick.title = 'Select a Kernel';
		quickPick.placeholder = 'Select a Python Kernel to execute some code';
		quickPick.busy = true;
		quickPick.show();

		const api = extension.exports;
		Promise.all(
			workspace.notebookDocuments.map(async (document) => {
				const kernel = await api.kernels.getKernel(document.uri);
				if (kernel && (kernel as any).language === 'python') {
					quickPickItems.push({
						label: `Kernel for ${path.basename(document.uri.fsPath)}`,
						kernel,
					});
					quickPick.items = quickPickItems;
				}
			})
		).finally(() => {
			quickPick.busy = false;
			if (quickPickItems.length === 0) {
				quickPick.hide();
				window.showErrorMessage(
					'No active kernels associated with any of the open notebooks, try opening a notebook and running a Python cell'
				);
				return resolve(undefined);
			}
		});

		quickPick.onDidAccept(
			() => {
				quickPick.hide();
				if (quickPick.selectedItems.length > 0) {
					return resolve(quickPick.selectedItems[0].kernel);
				}
				resolve(undefined);
			},
			undefined,
			toDispose
		);
		quickPick.onDidHide(() => resolve(undefined), undefined, toDispose);
	}).finally(() => Disposable.from(...toDispose).dispose());
}
