import {
	CancellationToken,
	ExtensionContext,
	ProgressLocation,
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
	context.subscriptions.push(jupyterLab);
	// // Commands are optional.
	jupyterLab.commandProvider = {
		provideCommands: () => {
			return [
				{
					label: 'Start Jupyter Lab',
					description: 'Start a new server in the terminal',
				},
			];
		},
		handleCommand: async (command, token) => {
			if (command.label === 'Start Jupyter Lab') {
				return startJupyterInTerminal('lab', token);
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
				return startJupyterInTerminal('notebook', token);
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
async function startJupyterInTerminal(type: 'lab' | 'notebook', token: CancellationToken) {
	return await window.withProgress(
		{
			location: ProgressLocation.Notification,
			title: 'Starting Jupyter Lab',
		},
		async () => {
			const servers = await findLocallyRunningServers(type);
			const existingPids = new Set(servers.map((s) => s.pid));
			const terminal = window.createTerminal(
				type === 'lab' ? 'Jupyter Lab' : 'Jupyter Notebook'
			);
			terminal.show();
			terminal.sendText(`jupyter ${type}`);
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
			} else {
				window.showInformationMessage(
					'Timeout waiting for Jupyter to start in the terminal'
				);
			}
		}
	);
}
