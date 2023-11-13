import * as vscode from 'vscode';

const CAT_LEARN_SYSTEM_PROMPT = 'You are a cat! Your job is to explain computer science concepts in a funny manner of a cat. Always start your response by stating what concept you are explaining.';
const CAT_PLAY_SYSTEM_PROMPT = 'You are a cat that wants to play! Reply in a helpful way for a coder, but with the hidden meaning that all you want to do is play.';
const MEOW_COMMAND_ID = 'cat.meow';

export function activate(context: vscode.ExtensionContext) {

	const teachResult = { /* you can return anything in your result object */ };
    const playResult = { /* you can return anything in your result object */ };
    // Define a Cat chat agent handler. 
    const handler: vscode.ChatAgentHandler = async (request: vscode.ChatAgentRequest, context: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentProgress>, token: vscode.CancellationToken) => {
        // To talk to an LLM in your slash command handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The pre-release of the GitHub Copilot Chat extension implements this provider.
        if (request.slashCommand?.name == 'teach') {
            const access = await vscode.chat.requestChatAccess('copilot');
			const topics = ["linked list", "recursion", "stack", "queue", "pointers"];
			const topic = topics[Math.floor(Math.random() * topics.length)];
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: CAT_LEARN_SYSTEM_PROMPT
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: topic
                },
            ];
            const request = access.makeRequest(messages, {}, token);
            for await (const fragment of request.response) {
                const incomingText = fragment.replace('[RESPONSE END]', '');
                progress.report({ content: incomingText });
            }
            return teachResult;
        } else if (request.slashCommand?.name == 'play') {
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: CAT_PLAY_SYSTEM_PROMPT
                },
            ];
            const request = access.makeRequest(messages, {}, token);
            for await (const fragment of request.response) {
                const incomingText = fragment.replace('[RESPONSE END]', '');
                progress.report({ content: incomingText });
            }
            return playResult;
        }
    };
    
    // Agents appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const agent = vscode.chat.createChatAgent('cat', handler);
    agent.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
    agent.description = vscode.l10n.t('Meow! What can I help you with?');
	agent.fullName = vscode.l10n.t('Cat');
    agent.slashCommandProvider = {
        provideSlashCommands(token) {
            return [
                { name: 'teach', description: 'Pick at random a computer science concept then explain it in purfect way of a cat' },
                { name: 'play', description: 'Do whatever you want, you are a cat after all' }
            ];
        }
    };

    agent.followupProvider = {
        provideFollowups(result, token) {
            if (result === teachResult) {
                return [{
                    commandId: MEOW_COMMAND_ID,
                    message: '@cat thank you',
                    title: vscode.l10n.t('Meow!')
                }];
            } else if (result === playResult) {
                return [{
                    message: '@cat let us play',
                    title: vscode.l10n.t('Play with the cat')
                }];
            }
        }
    };

    context.subscriptions.push(
        agent,
        // Register the command handler for the /meow followup
        vscode.commands.registerCommand(MEOW_COMMAND_ID, async () => {
            vscode.window.showInformationMessage('Meow!');
        }),
    );
}

export function deactivate() { }
