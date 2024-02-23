import * as vscode from 'vscode';

const CAT_NAMES_COMMAND_ID = 'cat.namesInEditor';
const CAT_PARTICIPANT_NAME = 'cat';

interface ICatChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}

const LANGUAGE_MODEL_ID = 'copilot-gpt-3.5-turbo'; // Use faster model. Alternative is 'copilot-gpt-4', which is slower but more powerful

export function activate(context: vscode.ExtensionContext) {

    // Define a Cat chat handler. 
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<ICatChatResult> => {
        // To talk to an LLM in your subcommand handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The GitHub Copilot Chat extension implements this provider.
        if (request.command == 'teach') {
		    stream.progress('Picking the right topic to teach...');
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const topic = getTopic(context.history);
            const messages = [
				new vscode.LanguageModelSystemMessage('You are a cat! Your job is to explain computer science concepts in the funny manner of a cat. Always start your response by stating what concept you are explaining. Always include code samples.'),
				new vscode.LanguageModelUserMessage(topic)
            ];
            const chatRequest = access.makeChatRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }

            stream.button({
                command: CAT_NAMES_COMMAND_ID,
                title: vscode.l10n.t('Use Cat Names in Editor')
            });

            return { metadata: { command: 'teach' } };
        } else if (request.command == 'play') {
		    stream.progress('Throwing away the computer science books and preparing to play with some Python code...');
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
				new vscode.LanguageModelSystemMessage('You are a cat! Reply in the voice of a cat, using cat analogies when appropriate. Be concise to prepare for cat play time.'),
				new vscode.LanguageModelUserMessage('Give a small random python code samples (that have cat names for variables). ' + request.prompt)
            ];
            const chatRequest = access.makeChatRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }
            return { metadata: { command: 'play' } };
        } else {
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
                new vscode.LanguageModelSystemMessage(`You are a cat! Think carefully and step by step like a cat would.
                    Your job is to explain computer science concepts in the funny manner of a cat, using cat metaphors. Always start your response by stating what concept you are explaining. Always include code samples.`),
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

    // Chat participants appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const cat = vscode.chat.createChatParticipant(CAT_PARTICIPANT_NAME, handler);
    cat.isSticky = true; // Cat is persistant, whenever a user starts interacting with @cat, @cat will automatically be added to the following messages
    cat.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
    cat.description = vscode.l10n.t('Meow! What can I teach you?');
    cat.commandProvider = {
        provideCommands(token) {
            return [
                { name: 'teach', description: 'Pick at random a computer science concept then explain it in purfect way of a cat' },
                { name: 'play', description: 'Do whatever you want, you are a cat after all' }
            ];
        }
    };

    cat.followupProvider = {
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
        cat,
        // Register the command handler for the /meow followup
        vscode.commands.registerTextEditorCommand(CAT_NAMES_COMMAND_ID, async (textEditor: vscode.TextEditor) => {
            // Replace all variables in active editor with cat names and words
            const text = textEditor.document.getText();
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
                new vscode.LanguageModelSystemMessage(`You are a cat! Think carefully and step by step like a cat would.
                Your job is to replace all variable names in the following code with funny cat variable names. Be creative. IMPORTANT respond just with code. Do not use markdown!`),
                new vscode.LanguageModelUserMessage(text)
            ];
            const chatRequest = access.makeChatRequest(messages, {}, new vscode.CancellationTokenSource().token);
            
            // Clear the editor content before inserting new content
            await textEditor.edit(edit => {
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(textEditor.document.lineCount - 1, textEditor.document.lineAt(textEditor.document.lineCount - 1).text.length);
                edit.delete(new vscode.Range(start, end));
            });

            // Stream the code into the editor as it is coming in from the Language Model
            for await (const fragment of chatRequest.stream) {
                await textEditor.edit(edit => {
                    const lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
                    const position = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
                    edit.insert(position, fragment);
                });
            }
        }),
    );
}

// Get a random topic that the cat has not taught in the chat history yet
function getTopic(history: ReadonlyArray<vscode.ChatRequestTurn | vscode.ChatResponseTurn>): string {
    const topics = ['linked list', 'recursion', 'stack', 'queue', 'pointers'];
    // Filter the chat history to get only the responses from the cat
    const previousCatResponses = history.filter(h => {
        return h instanceof vscode.ChatResponseTurn && h.participant.name == CAT_PARTICIPANT_NAME
    }) as vscode.ChatResponseTurn[];
    // Filter the topics to get only the topics that have not been taught by the cat yet
    const topicsNoRepetition = topics.filter(topic => {
        return !previousCatResponses.some(catResponse => {
            return catResponse.response.some(r => {
                return r instanceof vscode.ChatResponseMarkdownPart && r.value.value.includes(topic)
            });
        });
    });

    return topicsNoRepetition[Math.floor(Math.random() * topicsNoRepetition.length)] || 'I have taught you everything I know. Meow!';
}

export function deactivate() { }
