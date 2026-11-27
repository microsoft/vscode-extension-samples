import * as vscode from 'vscode';
import { GitHubService } from './ghes';
import { registerAgent } from './agent';
import { NvidiaChatModelProvider } from './providers/nvidia';
import { MistralChatModelProvider } from './providers/mistral';

export async function activate(context: vscode.ExtensionContext) {
	// GitHub / GitHub Enterprise connection (desktop + web)
	const github = new GitHubService(context);
	github.initialize();
	context.subscriptions.push(github);

	// Agent app with a dedicated entry point
	context.subscriptions.push(
		vscode.commands.registerCommand('github-enterprise-agent-sample.openAgentChat', () => {
			vscode.commands.executeCommand('workbench.action.chat.open', { query: '@enterprise-agent ' });
		}),
		vscode.commands.registerCommand('github-enterprise-agent-sample.whoami', async () => {
			const octokit = await github.getOctokitOrThrow();
			const userInfo = await octokit.users.getAuthenticated();
			vscode.window.showInformationMessage(`Signed into ${github.host} as ${userInfo.data.login}`);
		}),
		vscode.commands.registerCommand('github-enterprise-agent-sample.listOrgRepos', async () => {
			const octokit = await github.getOctokitOrThrow();
			const org = await vscode.window.showQuickPick(
				(await octokit.orgs.listForAuthenticatedUser({ per_page: 100 })).data.map(o => o.login),
				{ placeHolder: 'Select an organization' }
			);
			if (!org) {
				return;
			}
			const repos = (await octokit.repos.listForOrg({ org, per_page: 100, sort: 'updated' })).data;
			const repo = await vscode.window.showQuickPick(
				repos.map(r => ({ label: r.full_name, description: r.description ?? '', url: r.html_url })),
				{ placeHolder: `Repositories in ${org}` }
			);
			if (repo) {
				vscode.env.openExternal(vscode.Uri.parse(repo.url));
			}
		}),
		registerAgent(context, github)
	);

	// Model providers: NVIDIA NIM + Mistral (OpenAI-compatible endpoints)
	vscode.lm.registerLanguageModelChatProvider('nvidia', new NvidiaChatModelProvider(context.secrets));
	vscode.lm.registerLanguageModelChatProvider('mistral', new MistralChatModelProvider(context.secrets));

	// Dev convenience: when the extension host is launched with NVIDIA_API_KEY
	// in the environment (the demo launch and the test harness do this) and no
	// key is stored yet, provision it so the provider works with zero manual
	// setup. The key is read from the environment at runtime and never stored
	// in the repository.
	const nvidiaKey = process.env.NVIDIA_API_KEY;
	if (nvidiaKey && !(await context.secrets.get('github-enterprise-agent-sample.nvidiaApiKey'))) {
		await context.secrets.store('github-enterprise-agent-sample.nvidiaApiKey', nvidiaKey);
		vscode.window.showInformationMessage('NVIDIA API key provisioned from the NVIDIA_API_KEY environment variable.');
	}

	// API key management for the model providers. The commands accept an
	// optional key argument so automation and tests can set a key without UI
	// interaction; interactive callers still get the input box.
	context.subscriptions.push(
		vscode.commands.registerCommand('github-enterprise-agent-sample.setNvidiaApiKey', (key?: string) => setApiKey(context, 'github-enterprise-agent-sample.nvidiaApiKey', 'NVIDIA', key)),
		vscode.commands.registerCommand('github-enterprise-agent-sample.setMistralApiKey', (key?: string) => setApiKey(context, 'github-enterprise-agent-sample.mistralApiKey', 'Mistral', key))
	);
}

async function setApiKey(context: vscode.ExtensionContext, storageKey: string, label: string, providedKey?: string): Promise<void> {
	const key = providedKey ?? await vscode.window.showInputBox({
		prompt: `Enter your ${label} API key`,
		password: true,
		ignoreFocusOut: true
	});
	if (key) {
		await context.secrets.store(storageKey, key);
		vscode.window.showInformationMessage(`${label} API key saved.`);
	}
}

export function deactivate() { }
