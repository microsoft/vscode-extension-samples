import * as vscode from 'vscode';
import * as Octokit from '@octokit/rest';
import { GitHubService } from './ghes';

const AGENT_PARTICIPANT_ID = 'github-enterprise-agent-sample.agent';

interface IAgentChatResult extends vscode.ChatResult {
	metadata: {
		command: string;
	};
}

/**
 * The agent request handler. Exported separately so it can be tested without
 * the chat UI.
 */
export function createAgentHandler(github: GitHubService): vscode.ChatRequestHandler {
	return async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<IAgentChatResult> => {
		if (request.command === 'orgs') {
			stream.progress('Fetching your organizations...');
			const octokit = await github.getOctokitOrThrow();
			const orgs = await octokit.orgs.listForAuthenticatedUser({ per_page: 100 });
			stream.markdown(orgs.data.length > 0
				? orgs.data.map(org => `- **${org.login}**${org.description ? ` — ${org.description}` : ''}`).join('\n')
				: 'No organizations found for this account.');
			return { metadata: { command: 'orgs' } };
		}

		if (request.command === 'repos') {
			stream.progress('Fetching organization repositories...');
			const octokit = await github.getOctokitOrThrow();
			const org = request.prompt.trim() || await pickOrg(octokit);
			if (!org) {
				stream.markdown('No organization selected.');
				return { metadata: { command: 'repos' } };
			}
			const repos = await octokit.repos.listForOrg({ org, per_page: 100, sort: 'updated' });
			stream.markdown(repos.data.length > 0
				? repos.data.map(repo => `- **${repo.full_name}**${repo.description ? ` — ${repo.description}` : ''}`).join('\n')
				: `No repositories found in \`${org}\`.`);
			return { metadata: { command: 'repos' } };
		}

		// Free-form chat: answer with the model selected in the model picker,
		// including the NVIDIA and Mistral models provided by this extension.
		const model = request.model ?? await pickFallbackModel();
		if (!model) {
			stream.markdown('No language model available. Pick a model in the model picker, for example one of the NVIDIA or Mistral models from this extension.');
			return { metadata: { command: '' } };
		}

		const messages = [
			vscode.LanguageModelChatMessage.User(`You are the Enterprise Agent for ${github.host}. Help the user with GitHub and GitHub Enterprise questions, organizations and repositories. Be concise.`),
			...historyToMessages(context),
			vscode.LanguageModelChatMessage.User(request.prompt)
		];
		const chatResponse = await model.sendRequest(messages, {}, token);
		for await (const fragment of chatResponse.text) {
			stream.markdown(fragment);
		}
		return { metadata: { command: '' } };
	};
}

/**
 * Rebuilds the chat conversation history as language model messages so
 * multi-turn conversations keep their context. Duck-typed instead of
 * instanceof because the turn classes have private constructors and tests
 * build plain objects.
 */
export function historyToMessages(context: vscode.ChatContext): vscode.LanguageModelChatMessage[] {
	const messages: vscode.LanguageModelChatMessage[] = [];
	for (const turn of context.history ?? []) {
		if ('prompt' in turn) {
			messages.push(vscode.LanguageModelChatMessage.User(turn.prompt));
		} else if ('response' in turn) {
			const text = turn.response
				.map(part => part instanceof vscode.ChatResponseMarkdownPart ? part.value.value : '')
				.join('');
			if (text) {
				messages.push(vscode.LanguageModelChatMessage.Assistant(text));
			}
		}
	}
	return messages;
}

/**
 * The agent app. It appears as a top-level option in the chat input when you
 * type `@`, and has a dedicated entry point via the
 * `github-enterprise-agent-sample.openAgentChat` command.
 */
export function registerAgent(context: vscode.ExtensionContext, github: GitHubService): vscode.Disposable {
	const participant = vscode.chat.createChatParticipant(AGENT_PARTICIPANT_ID, createAgentHandler(github));
	participant.followupProvider = {
		provideFollowups(_result: IAgentChatResult, _context: vscode.ChatContext, _token: vscode.CancellationToken) {
			return [{
				prompt: '/orgs',
				label: 'List my organizations',
				command: 'orgs'
			} satisfies vscode.ChatFollowup];
		}
	};

	return participant;
}

async function pickOrg(octokit: Octokit.Octokit): Promise<string | undefined> {
	const orgs = await octokit.orgs.listForAuthenticatedUser({ per_page: 100 });
	return vscode.window.showQuickPick(orgs.data.map(org => org.login), {
		placeHolder: 'Select an organization'
	});
}

async function pickFallbackModel(): Promise<vscode.LanguageModelChat | undefined> {
	// Prefer a Mistral model provided by this extension, fall back to any model.
	const models = await vscode.lm.selectChatModels({ vendor: 'mistral' });
	if (models.length > 0) {
		return models[0];
	}
	const all = await vscode.lm.selectChatModels({});
	return all[0];
}
