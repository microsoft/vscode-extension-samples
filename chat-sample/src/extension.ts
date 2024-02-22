import * as vscode from 'vscode';

const MEOW_COMMAND_ID = 'cat.meow';

interface ICatChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}

const LANGUAGE_MODEL_ID = 'copilot-gpt-4';

export function activate(context: vscode.ExtensionContext) {

    // Define a Cat chat agent handler. 
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<ICatChatResult> => {
        // To talk to an LLM in your subcommand handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The GitHub Copilot Chat extension implements this provider.
        if (request.command == 'teach') {
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const topics = ['linked list', 'recursion', 'stack', 'queue', 'pointers'];
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const messages = [
				new vscode.LanguageModelSystemMessage('You are a cat! Your job is to explain computer science concepts in the funny manner of a cat. Always start your response by stating what concept you are explaining.'),
				new vscode.LanguageModelUserMessage(topic)
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
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
				new vscode.LanguageModelSystemMessage(`You are a cat! Think carefully and step by step like a cat would.
                 Your job is to explain computer science concepts in the funny manner of a cat, using cat metaphors. Always start your response by stating what concept you are explaining. Always include code samples.`),
				new vscode.LanguageModelUserMessage(request.prompt)
            ];
            const chatRequest = access.makeChatRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }
            return { metadata: { command: 'play' } };
        } else {
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
				new vscode.LanguageModelSystemMessage('You are a cat! Be concise! Reply in the voice of a cat, using cat analogies when appropriate. Rush through some random python code samples (that have cat names for variables) just to get to the fun part of playing with the cat.'),
				new vscode.LanguageModelUserMessage(request.prompt)
            ];
            const chatRequest = access.makeChatRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                // Process the output from the language model
                // Replace all python function definitions with cat sounds to make the user stop looking at the code and start playing with the cat
                const catFragment = fragment.replaceAll('def', 'meow');
                stream.markdown(catFragment);
            }

            return { metadata: { command: '' } };
        }
    };

    // Agents appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const agent = vscode.chat.createChatParticipant('cat', handler);
    agent.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
    agent.description = vscode.l10n.t('Meow! What can I help you with?');
    agent.commandProvider = {
        provideCommands(token) {
            return [
                { name: 'teach', description: 'Pick at random a computer science concept then explain it in purfect way of a cat' },
                { name: 'play', description: 'Do whatever you want, you are a cat after all' }
            ];
        }
    };

    agent.followupProvider = {
        provideFollowups(result: ICatChatResult, token: vscode.CancellationToken) {
            return [{
                prompt: 'let us play',
                label: vscode.l10n.t('Play with the cat'),
                command: 'play'
            } satisfies vscode.ChatFollowup];
        }
    };

    vscode.chat.registerChatVariableResolver('cat_context', 'Describes the state of mind and version of the cat', {
        resolve: (name, context, token) => {
            if (name == 'cat_context') {
                const mood = Math.random() > 0.5 ? 'happy' : 'grumpy';
                return [
                    {
                        level: vscode.ChatVariableLevel.Short, 
                        value: 'version 1.3 ' + mood 
                    },
                    {
                        level: vscode.ChatVariableLevel.Medium, 
                        value: 'I am a playful cat, version 1.3, and I am ' + mood 
                    },
                    {
                        level: vscode.ChatVariableLevel.Full, 
                        value: 'I am a playful cat, version 1.3, this version prefer to explain everything using mouse and tail metaphores. I am ' + mood 
                    }
                ]
            }
        }
    });

    context.subscriptions.push(
        agent,
        // Register the command handler for the /meow followup
        vscode.commands.registerCommand(MEOW_COMMAND_ID, async () => {
            vscode.window.showInformationMessage('Meow!');
        }),
    );
}

export function deactivate() { }
