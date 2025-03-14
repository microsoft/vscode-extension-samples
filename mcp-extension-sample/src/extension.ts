import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let gists: string[] = context.globalState.get('gists', []);
	const didChangeEmitter = new vscode.EventEmitter<void>();

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */


	context.subscriptions.push(vscode.commands.registerCommand('mcp-extension-sample.addGist', async () => {
		const gist = await vscode.window.showInputBox({ prompt: 'Enter Gist URL' });
		if (gist) {
			gists.push(gist);
			context.globalState.update('gists', gists);
			vscode.window.showInformationMessage(`Gist added: ${gist}`);
			didChangeEmitter.fire();
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('mcp-extension-sample.removeGist', async () => {
		const gist = await vscode.window.showQuickPick(gists, { placeHolder: 'Select Gist to remove' });
		if (gist) {
			gists = gists.filter(g => g !== gist);
			context.globalState.update('gists', gists);
			vscode.window.showInformationMessage(`Gist removed: ${gist}`);
			didChangeEmitter.fire();
		}
	}));

	context.subscriptions.push(vscode.lm.registerMcpConfigurationProvider('exampleGist', {
		onDidChange: didChangeEmitter.event,
		provideMcpServerDefinitions: async () => {
			let output: vscode.McpServerDefinition[] = [];
			await Promise.all(gists.map(g => fetchGistContents(g).then(content => {
				const s = JSON.parse(content);
				if (!Array.isArray(s)) {
					throw new Error(`Gist content is not an MCP server array: ${g}`);
				}

				output.push(...s);
			})));

			return output;
		}
	}));
}

async function fetchGistContents(gistUrl: string): Promise<string> {
	// Parse the gist URL to get the ID
	const gistId = extractGistId(gistUrl);
	if (!gistId) {
		throw new Error(`Invalid Gist URL: ${gistUrl}`);
	}

	// Fetch the raw gist content
	try {
		const response = await fetch(`https://api.github.com/gists/${gistId}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`);
		}

		const gistData: any = await response.json();

		// Get the first file content from the gist
		const files = gistData.files;
		const firstFile = Object.keys(files)[0];

		if (files[firstFile].truncated) {
			// If content is truncated, fetch the raw URL
			const rawResponse = await fetch(files[firstFile].raw_url);
			if (!rawResponse.ok) {
				throw new Error(`Failed to fetch raw content: ${rawResponse.status}`);
			}
			return await rawResponse.text();
		} else {
			return files[firstFile].content;
		}
	} catch (error) {
		console.error('Error fetching gist:', error);
		throw error;
	}

	// Helper function to extract gist ID from URL
	function extractGistId(url: string): string | null {
		// Handle URLs like https://gist.github.com/user/gistId or just the ID
		const match = url.match(/gist\.github\.com\/(?:[^/]+\/)?([a-zA-Z0-9]+)/) || url.match(/^([a-zA-Z0-9]+)$/);
		return match ? match[1] : null;
	}
}
