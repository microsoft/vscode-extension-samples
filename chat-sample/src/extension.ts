import { renderPrompt } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { PlayPrompt } from './play';

const CAT_NAMES_COMMAND_ID = 'cat.namesInEditor';
const CAT_PARTICIPANT_ID = 'chat-sample.cat';

interface ICatChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };

export function activate(context: vscode.ExtensionContext) {
    const options: vscode.LanguageModelChatRequestOptions = {
		tools: Array.from(FunctionTool.All.values()).map(tool => tool.metadata),
		justification: 'Voice assistant needs access to functions to run commands',
	};
    // Define a Cat chat handler. 
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<ICatChatResult> => {
        // To talk to an LLM in your subcommand handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The GitHub Copilot Chat extension implements this provider.
        try {
			const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
			
			if (model) {
				const messages = [
					vscode.LanguageModelChatMessage.User(request.prompt)
				];
				const chatResponse = await model.sendRequest(messages, options, token)
				
				for await (const part of chatResponse.stream) {
					// Process the output from the language model
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
					}
				}
			}
            return { metadata: { command: '' } };
		} catch (err) {
			handleError(err, stream);
		}
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

            let chatResponse: vscode.LanguageModelChatResponse | undefined;
            try {
                const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: 'gpt-3.5-turbo' });
                if (!model) {
                    console.log('Model not found. Please make sure the GitHub Copilot Chat extension is installed and enabled.')
                    return;
                }

                const messages = [
                    vscode.LanguageModelChatMessage.User(`You are a cat! Think carefully and step by step like a cat would.
                    Your job is to replace all variable names in the following code with funny cat variable names. Be creative. IMPORTANT respond just with code. Do not use markdown!`),
                    vscode.LanguageModelChatMessage.User(text)
                ];
                chatResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);

            } catch (err) {
                if (err instanceof vscode.LanguageModelError) {
                    console.log(err.message, err.code, err.cause)
                } else {
                    throw err;
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

function handleError(err: any, stream: vscode.ChatResponseStream): void {
    // making the chat request might fail because
    // - model does not exist
    // - user consent not given
    // - quote limits exceeded
    if (err instanceof vscode.LanguageModelError) {
        console.log(err.message, err.code, err.cause);
        if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
            stream.markdown(vscode.l10n.t('I\'m sorry, I can only explain computer science concepts.'));
        }
    } else {
        // re-throw other errors so they show up in the UI
        throw err;
    }
}

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
	name: "workbench.action.terminal.toggleTerminal",
	description: "Open or close the terminal",
	parametersSchema: {
		"type": "object",
		"properties": {
			"nth": {
				"type": "number",
				"description": "The index of the editor, starting at 0",
			},
		},
		// "required": ["nth"],
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
});

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
