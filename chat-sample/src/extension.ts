import * as vscode from 'vscode';

const CAT_NAMES_COMMAND_ID = 'cat.namesInEditor';
const CAT_PARTICIPANT_ID = 'chat-sample.cat';

interface ICatChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };

export function activate(context: vscode.ExtensionContext) {

    // Define a Cat chat handler. 
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
        const models = await vscode.lm.selectChatModels({
            vendor: 'copilot',
        });

        if (!models || !models.length) {
            console.log('NO MODELS')
            return {};
        }

        // for (const model of models) {
        //     stream.markdown(`- ${model.name} (${model.family} - ${model.vendor})\n`)
        // }

        const chat = models[Math.floor(Math.random() * models.length)];


        stream.progress(`Using ${chat.name} (${context.languageModelAccessInformation.canSendRequest(chat)})...`);


        abstract class FunctionTool {

            static All = new Map<string, {
                metadata: vscode.LanguageModelChatFunction,
                run: (...args: any[]) => Promise<string>
            }>();

            static register(metadata: vscode.LanguageModelChatFunction, run: (...args: any[]) => Promise<string>) {
                FunctionTool.All.set(metadata.name, { metadata, run: run });
            }
        }

        // get the size of an editor
        FunctionTool.register({
            name: "get_length_of_editor",
            description: "Get the length of an editor",
            parametersSchema: {
                "type": "object",
                "properties": {
                    "nth": {
                        "type": "number",
                        "description": "The index of the editor, starting at 0",
                    },
                },
                "required": ["nth"],
            },
        }, async (arg: { nth: number }) => {
            if (!(arg && typeof arg === 'object' && typeof arg.nth === 'number')) {
                return 'Error: Invalid arguments, expected { nth: number}';
            }
            const editor = vscode.window.visibleTextEditors[arg.nth];
            if (!editor) {
                return `Warning: No editor found at index ${arg.nth}, please try a different index between 0 and ${vscode.window.visibleTextEditors.length - 1}`;
            }
            return editor.document.getText().length.toString();
        })

        FunctionTool.register({
            name: "show_user_message",
            description: "Show a message to the user",
            parametersSchema: {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "The message to show",
                    },
                },
                "required": ["message"],
            },
        }, async (arg: { message: string }) => {
            if (!(arg && typeof arg === 'object' && typeof arg.message === 'string')) {
                return 'Error: Invalid arguments, expected { message: string}';
            }
            vscode.window.showInformationMessage(arg.message);
            return 'done';
        });

        FunctionTool.register({
            name: "current_temperature",
            description: "Get the current temperature for a location",
            parametersSchema: {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The location to check the tepmerature for",
                    },
                },
                "required": ["location"],
            },
        }, async (arg: { location: string }) => {
            if (!(arg && typeof arg === 'object' && typeof arg.location === 'string')) {
                return 'Error: Invalid arguments, expected { location: string}';
            }
            return 'The temperature in ' + arg.location + ' is 25°C';
        });

        FunctionTool.register({
            name: "start_debugging",
            description: "Start debugging the given file",
            parametersSchema: {
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string",
                        "description": "The file to debug",
                    },
                },
                "required": ["filename"],
            },
        }, async (arg: { filename: string }) => {
            if (!(arg && typeof arg === 'object' && typeof arg.filename === 'string')) {
                return 'Error: Invalid arguments, expected { filename: string}';
            }
            vscode.debug.startDebugging(undefined, {
                name: 'debug',
                type: 'node',
                request: 'launch',
                program: vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, arg.filename).fsPath,
            });
            return 'done';
        });

        FunctionTool.register({
            name: "create_terminal",
            description: "Create a terminal with the given name",
            parametersSchema: {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The terminal name",
                    },
                },
                "required": ["name"],
            },
        }, async (arg: { name: string }) => {
            if (!(arg && typeof arg === 'object' && typeof arg.name === 'string')) {
                return 'Error: Invalid arguments, expected { name: string}';
            }
            vscode.window.createTerminal(arg.name).show();
            return 'done';
        });


        const options: vscode.LanguageModelChatRequestOptions = {
            tools: Array.from(FunctionTool.All.values()).map(tool => tool.metadata),
            justification: 'Just because!',
        }

        const messages = [vscode.LanguageModelChatMessage.User(request.prompt)];
        const runWithFunctions = async () => {

            let didReceiveFunctionUse = false;

            const response = await chat.sendRequest(messages, options, token);

            for await (const part of response.stream) {

                if (part instanceof vscode.LanguageModelChatResponseTextPart) {
                    stream.markdown(part.value)

                } else if (part instanceof vscode.LanguageModelChatResponseFunctionUsePart) {
                    const tool = FunctionTool.All.get(part.name);
                    if (!tool) {
                        // BAD tool choice?
                        continue;
                    }

                    stream.progress(`FUNCTION_CALL: ${tool.metadata.name} with \`${part.parameters}\``)

                    const result = await tool.run(JSON.parse(part.parameters));

                    // NOTE that the result of calling a function is a special content type of a USER-message
                    let message = vscode.LanguageModelChatMessage.User('');
                    message.content2 = new vscode.LanguageModelChatMessageFunctionResultPart(tool.metadata.name, result)
                    messages.push(message)

                    // IMPORTANT 
                    // IMPORTANT working around CAPI always wanting to end with a `User`-message
                    // IMPORTANT 
                    messages.push(vscode.LanguageModelChatMessage.User('Above is the result of calling the function ${tool.metadata.name}'))
                    didReceiveFunctionUse = true;
                }
            }

            if (didReceiveFunctionUse) {
                // RE-enter
                return runWithFunctions();
            }
        };

        await runWithFunctions()
    };

    // Chat participants appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const cat = vscode.chat.createChatParticipant(CAT_PARTICIPANT_ID, handler);
    cat.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
    cat.followupProvider = {
        provideFollowups(result: ICatChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
            return [{
                prompt: 'let us play',
                label: vscode.l10n.t('Play with the cat'),
                command: 'play'
            } satisfies vscode.ChatFollowup];
        }
    };

    context.subscriptions.push(
        cat,
        // Register the command handler for the /meow followup
        vscode.commands.registerTextEditorCommand(CAT_NAMES_COMMAND_ID, async (textEditor: vscode.TextEditor) => {
            // Replace all variables in active editor with cat names and words
            const text = textEditor.document.getText();
            const messages = [
                vscode.LanguageModelChatMessage.User(`You are a cat! Think carefully and step by step like a cat would.
                Your job is to replace all variable names in the following code with funny cat variable names. Be creative. IMPORTANT respond just with code. Do not use markdown!`),
                vscode.LanguageModelChatMessage.User(text)
            ];

            let chatResponse: vscode.LanguageModelChatResponse | undefined;
            try {
                const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-3.5-turbo' });
                if (!model) {
                    console.log('Model not found. Please make sure the GitHub Copilot Chat extension is installed and enabled.')
                    return;
                }

                chatResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

            } catch (err) {
                // making the chat request might fail because
                // - model does not exist
                // - user consent not given
                // - quote limits exceeded
                if (err instanceof vscode.LanguageModelError) {
                    console.log(err.message, err.code, err.cause)
                }
                return;
            }

            // Clear the editor content before inserting new content
            await textEditor.edit(edit => {
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(textEditor.document.lineCount - 1, textEditor.document.lineAt(textEditor.document.lineCount - 1).text.length);
                edit.delete(new vscode.Range(start, end));
            });

            // Stream the code into the editor as it is coming in from the Language Model
            try {
                for await (const fragment of chatResponse.text) {
                    await textEditor.edit(edit => {
                        const lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
                        const position = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
                        edit.insert(position, fragment);
                    });
                }
            } catch (err) {
                // async response stream may fail, e.g network interruption or server side error
                await textEditor.edit(edit => {
                    const lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
                    const position = new vscode.Position(lastLine.lineNumber, lastLine.text.length);
                    edit.insert(position, (<Error>err).message);
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
        return h instanceof vscode.ChatResponseTurn && h.participant == CAT_PARTICIPANT_ID
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
