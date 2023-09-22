import {
	CancellationError,
	CancellationToken,
	Disposable,
	ExtensionContext,
	ProgressLocation,
	QuickInputButtons,
	Uri,
	extensions,
	window,
} from 'vscode';
import { Jupyter } from '@vscode/jupyter-extension';
import { findLocallyRunningServers } from './jupyter';

export function activate(context: ExtensionContext) {
	const jupyterExt = extensions.getExtension<Jupyter>('ms-toolsai.jupyter');
	if (!jupyterExt) {
		throw new Error('Jupyter Extension not installed');
	}
	if (!jupyterExt.isActive) {
		jupyterExt.activate();
	}

	const jupyterLab = jupyterExt.exports.createJupyterServerCollection(
		`${context.extension.id}:lab`,
		'Local JupyterLab Servers...',
		{
			provideJupyterServers: () => provideJupyterServers('lab'),
			resolveJupyterServer: (server) => server,
		}
	);
	// Link to documentation explaining this Jupyter Collection is optional.
	jupyterLab.documentation = Uri.parse('https://github.com/microsoft/vscode-jupyter-hub/wiki/Connecting-to-JupyterHub-from-VS-Code');
	context.subscriptions.push(jupyterLab);
	// // Commands are optional.
	jupyterLab.commandProvider = {
		provideCommands: () => {
			return [
				{
					label: 'Start JupyterLab',
					description: 'Start a new server in the terminal',
				},
				{
					label: 'Configure and start JupyterLab',
					description: 'Start a new server in the terminal',
				},
			];
		},
		handleCommand: async (command, token) => {
			switch (command.label) {
				case 'Start JupyterLab': {
					// Upon staring a server, return that server back to the Jupyter Extension.
					return startJupyterInTerminal('lab', undefined, token);
				}
				case 'Configure and start JupyterLab': {
					// This is a sample of how to use QuickPick to get additional user input and ensure a back button is displayed.
					const disposables: Disposable[] = [];
					const options = await new Promise<
						{ emptyToken: boolean; allowOtherWebsites: boolean } | undefined
					>((resolve, reject) => {
						const quickPick = window.createQuickPick();
						disposables.push(quickPick);
						quickPick.title = 'Start Jupyter Lab';
						quickPick.items = [
							'Empty Token',
							'Allow access from other Websites (bypass CORS)',
						].map((label) => ({ label }));
						quickPick.canSelectMany = true;
						quickPick.buttons = [QuickInputButtons.Back];
						quickPick.onDidTriggerButton((e) => {
							if (e === QuickInputButtons.Back) {
								// The user has opted to go back to the previous UI in the workflow,
								// Returning `undefined` to Jupyter extension as part of `handleCommand`
								// will trigger Jupyter Exetnsion to display the previous UI
								resolve(undefined);
								quickPick.hide();
							}
						}, disposables);
						quickPick.onDidHide(() => {
							// The user has opted to get out of this workflow,
							// Throwing cancellation error will exit the Kernle Picker completely.
							reject(new CancellationError());
						}, disposables);
						quickPick.onDidAccept(() => {
							const options = {
								allowOtherWebsites: false,
								emptyToken: false,
							};
							quickPick.selectedItems.forEach((item) => {
								if (item.label === 'Empty Token') {
									options.emptyToken = true;
								}
								if (
									item.label ===
									'Allow access from other Websites (bypass CORS)'
								) {
									options.allowOtherWebsites = true;
								}
							}, disposables);
							resolve(options);
						}, disposables);
						quickPick.show();
					}).finally(() => Disposable.from(...disposables).dispose());

					if (!options) {
						// User hit back button, hence return `undefined` to Jupyter Extension
						return;
					}
					// Upon staring a server, return that server back to the Jupyter Extension.
					return startJupyterInTerminal('lab', options, token);
				}
			}
		},
	};
	// Each collection is treated as a logical collection of Jupyter Servers.
	// Thus an extension can contribute more than one collection of servers.
	const jupyterNotebook = jupyterExt.exports.createJupyterServerCollection(
		`${context.extension.id}:notebook`,
		'Local Jupyter Notebook Servers...',
		{
			provideJupyterServers: () => provideJupyterServers('notebook'),
			resolveJupyterServer: (server) => server,
		}
	);
	context.subscriptions.push(jupyterNotebook);
	// Commands are optional.
	jupyterNotebook.commandProvider = {
		provideCommands: () => {
			return [
				{
					label: 'Start Jupyter Notebook',
					description: 'Start a new server in the terminal',
				},
			];
		},
		handleCommand: async (command, token) => {
			if (command.label === 'Start Jupyter Notebook') {
				// Upon staring a server, return that server back to the Jupyter Extension.
				return startJupyterInTerminal('notebook', undefined, token);
			}
		},
	};
}

async function provideJupyterServers(type: 'lab' | 'notebook') {
	const servers = await findLocallyRunningServers(type);
	return servers.map((server) => {
		return {
			id: `${server.pid}:${server.port}`,
			label: server.url,
			connectionInformation: {
				baseUrl: Uri.parse(server.url),
				token: server.token,
			},
		};
	});
}
async function startJupyterInTerminal(
	type: 'lab' | 'notebook',
	options: { emptyToken: boolean; allowOtherWebsites: boolean } | undefined,
	token: CancellationToken
) {
	return await window.withProgress(
		{
			location: ProgressLocation.Notification,
			title: type === 'lab' ? 'Starting JupyterLab' : 'Staring Jupyter Notebook',
		},
		async () => {
			const servers = await findLocallyRunningServers(type);
			const existingPids = new Set(servers.map((s) => s.pid));
			const terminal = window.createTerminal(
				type === 'lab' ? 'JupyterLab' : 'Jupyter Notebook'
			);
			terminal.show();
			const args: string[] = [type, '--no-browser'];
			if (options?.emptyToken) {
				args.push('--NotebookApp.token=""');
			}
			if (options?.allowOtherWebsites) {
				args.push('--NotebookApp.allow_origin="*"');
			}
			terminal.sendText(`jupyter ${args.join(' ')}`);
			// Wait for 5 seconds, then give up, this is only a sample.
			await new Promise((resolve) => setTimeout(resolve, 5_000));

			const newServers = (await findLocallyRunningServers(type)).filter(
				(s) => !existingPids.has(s.pid)
			);
			if (token.isCancellationRequested) {
				return;
			}
			if (newServers.length) {
				const server = newServers[0];
				return {
					id: `${server.pid}:${server.port}`,
					label: new URL(server.url).hostname,
					connectionInformation: {
						baseUrl: Uri.parse(server.url),
						token: server.token,
					},
				};
			}
			// This is only a sample, possible Jupyter isn't installed,
			// Or the terminal isn't configured correctly.
			// Or there are delays in starting Jupyter.
			window.showInformationMessage(
				'Timeout waiting for Jupyter to start in the terminal (check terminal output)'
			);
		}
	);
}
