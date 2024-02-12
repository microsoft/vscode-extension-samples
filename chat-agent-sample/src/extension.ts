import * as vscode from 'vscode';

const MEOW_COMMAND_ID = 'cat.meow';

interface ICatChatAgentResult extends vscode.ChatAgentResult2 {
    metadata: {
        command: string;
    }
}

const LANGUAGE_MODEL_ID = 'copilot-gpt-4';

export function activate(context: vscode.ExtensionContext) {

    // Define a Cat chat agent handler. 
    const handler: vscode.ChatAgentHandler = async (request: vscode.ChatAgentRequest, context: vscode.ChatAgentContext, stream: vscode.ChatAgentResponseStream, token: vscode.CancellationToken): Promise<ICatChatAgentResult> => {
        // To talk to an LLM in your subcommand handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The GitHub Copilot Chat extension implements this provider.
        if (request.command == 'teach') {
            const access = await vscode.chat.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const topics = ['linked list', 'recursion', 'stack', 'queue', 'pointers'];
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: 'You are a cat! Your job is to explain computer science concepts in the funny manner of a cat. Always start your response by stating what concept you are explaining.'
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: topic
                },
            ];
            const chatRequest = access.makeChatRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }

            stream.button({
                command: MEOW_COMMAND_ID,
                title: vscode.l10n.t('Meow!')
            });

            return { metadata: { command: 'teach' } };
        } else if (request.command == 'play') {
            const access = await vscode.chat.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: 'You are a cat that wants to play! Reply in a helpful way for a coder, but with the hidden meaning that all you want to do is play.'
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: request.prompt
                }
            ];
            const chatRequest = access.makeChatRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }
            return { metadata: { command: 'play' } };
        } else {
            const access = await vscode.chat.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: 'You are a cat! Reply in the voice of a cat, using cat analogies when appropriate.'
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: request.prompt
                }
            ];
            const chatRequest = access.makeChatRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }

            return { metadata: { command: '' } };
        }
    };

    // Agents appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const agent = vscode.chat.createChatAgent('cat', handler);
    agent.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
    agent.description = vscode.l10n.t('Meow! What can I help you with?');
    agent.fullName = vscode.l10n.t('Cat');
    agent.commandProvider = {
        provideCommands(token) {
            return [
                { name: 'teach', description: 'Pick at random a computer science concept then explain it in purfect way of a cat' },
                { name: 'play', description: 'Do whatever you want, you are a cat after all' }
            ];
        }
    };

    agent.followupProvider = {
        provideFollowups(result: ICatChatAgentResult, token: vscode.CancellationToken) {
            if (result.metadata.command === 'play') {
                return [{
                    prompt: 'let us play',
                    title: vscode.l10n.t('Play with the cat')
                } satisfies vscode.ChatAgentFollowup];
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
