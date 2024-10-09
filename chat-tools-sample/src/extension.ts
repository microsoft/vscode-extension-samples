import * as vscode from 'vscode';
import { FindFilesTool, RunInTerminalTool, TabCountTool } from './tools';

export function activate(context: vscode.ExtensionContext) {
    registerChatTool(context);
    registerChatParticipant(context);
}

function registerChatTool(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_tabCount', new TabCountTool()));
    context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_findFiles', new FindFilesTool()));
    context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_runInTerminal', new RunInTerminalTool()));
}

interface IToolCall {
    tool: vscode.LanguageModelToolDescription;
    call: vscode.LanguageModelToolCallPart;
    result: Thenable<vscode.LanguageModelToolResult>;
}

const llmInstructions = `Instructions: 
- The user will ask a question, or ask you to perform a task, and it may require lots of research to answer correctly. There is a selection of tools that let you perform actions or retrieve helpful context to answer the user's question. 
- If you aren't sure which tool is relevant, you can call multiple tools. You can call tools repeatedly to take actions or gather as much context as needed until you have completed the task fully. Don't give up unless you are sure the request cannot be fulfilled with the tools you have. 
- Don't make assumptions about the situation- gather context first, then perform the task or answer the question.
- Don't ask the user for confirmation to use tools, just use them.
- After editing a file, DO NOT show the user a codeblock with the edit or new file contents. Assume that the user can see the result.`

function registerChatParticipant(context: vscode.ExtensionContext) {
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
        const models = await vscode.lm.selectChatModels({
            vendor: 'copilot',
            family: 'gpt-4o'
        });

        const model = models[0];
        stream.markdown(`Available tools: ${vscode.lm.tools.map(tool => tool.id).join(', ')}\n\n`);

        const allTools = vscode.lm.tools.map((tool): vscode.LanguageModelChatTool => {
            return {
                name: tool.id,
                description: tool.description,
                parametersSchema: tool.parametersSchema ?? {}
            };
        });

        const options: vscode.LanguageModelChatRequestOptions = {
            justification: 'Just because!',
        };

        const messages = [
            vscode.LanguageModelChatMessage.User(llmInstructions),
        ];
        messages.push(...await getHistoryMessages(chatContext));
        if (request.references.length) {
            messages.push(vscode.LanguageModelChatMessage.User(await getContextMessage(request.references)));
        }
        messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

        const toolReferences = [...request.toolReferences];
        const runWithFunctions = async (): Promise<void> => {
            const requestedTool = toolReferences.shift();
            if (requestedTool) {
                options.toolChoice = requestedTool.id;
                options.tools = allTools.filter(tool => tool.name === requestedTool.id);
            } else {
                options.toolChoice = undefined;
                options.tools = allTools;
            }

            const toolCalls: IToolCall[] = [];

            const response = await model.sendRequest(messages, options, token);

            for await (const part of response.stream) {
                if (part instanceof vscode.LanguageModelTextPart) {
                    stream.markdown(part.value);
                } else if (part instanceof vscode.LanguageModelToolCallPart) {
                    const tool = vscode.lm.tools.find(tool => tool.id === part.name);
                    if (!tool) {
                        // BAD tool choice?
                        throw new Error('Got invalid tool choice: ' + part.name);
                    }

                    let parameters: any;
                    try {
                        parameters = JSON.parse(part.parameters);
                    } catch (err) {
                        throw new Error(`Got invalid tool use parameters: "${part.parameters}". (${(err as Error).message})`);
                    }

                    // TODO support prompt-tsx here
                    const requestedContentType = 'text/plain';
                    toolCalls.push({
                        call: part,
                        result: vscode.lm.invokeTool(tool.id, { parameters: JSON.parse(part.parameters), toolInvocationToken: request.toolInvocationToken, requestedContentTypes: [requestedContentType] }, token),
                        tool
                    });
                }
            }

            if (toolCalls.length) {
                const assistantMsg = vscode.LanguageModelChatMessage.Assistant('');
                assistantMsg.content2 = toolCalls.map(toolCall => new vscode.LanguageModelToolCallPart(toolCall.tool.id, toolCall.call.toolCallId, toolCall.call.parameters));
                messages.push(assistantMsg);
                for (const toolCall of toolCalls) {
                    // NOTE that the result of calling a function is a special content type of a USER-message
                    const message = vscode.LanguageModelChatMessage.User('');

                    message.content2 = [new vscode.LanguageModelToolResultPart(toolCall.call.toolCallId, (await toolCall.result)['text/plain']!)];
                    messages.push(message);
                }

                // IMPORTANT The prompt must end with a USER message (with no tool call)
                messages.push(vscode.LanguageModelChatMessage.User(`Above is the result of calling the functions ${toolCalls.map(call => call.tool.id).join(', ')}. The user cannot see this result, so you should explain it to the user if referencing it in your answer.`));

                // RE-enter
                return runWithFunctions();
            }
        };

        await runWithFunctions();
    };

    const toolUser = vscode.chat.createChatParticipant('chat-tools-sample.tools', handler);
    toolUser.iconPath = new vscode.ThemeIcon('tools');
    context.subscriptions.push(toolUser);
}

async function getContextMessage(references: ReadonlyArray<vscode.ChatPromptReference>): Promise<string> {
    const contextParts = (await Promise.all(references.map(async ref => {
        if (ref.value instanceof vscode.Uri) {
            const fileContents = (await vscode.workspace.fs.readFile(ref.value)).toString();
            return `${ref.value.fsPath}:\n\`\`\`\n${fileContents}\n\`\`\``;
        } else if (ref.value instanceof vscode.Location) {
            const rangeText = (await vscode.workspace.openTextDocument(ref.value.uri)).getText(ref.value.range);
            return `${ref.value.uri.fsPath}:${ref.value.range.start.line + 1}-${ref.value.range.end.line + 1}\n\`\`\`${rangeText}\`\`\``;
        } else if (typeof ref.value === 'string') {
            return ref.value;
        }
        return null;
    }))).filter(part => part !== null) as string[];

    const context = contextParts
        .map(part => `<context>\n${part}\n</context>`)
        .join('\n');
    return `The user has provided these references:\n${context}`;
}

async function getHistoryMessages(context: vscode.ChatContext): Promise<vscode.LanguageModelChatMessage[]> {
    const messages: vscode.LanguageModelChatMessage[] = [];
    for (const message of context.history) {
        if (message instanceof vscode.ChatRequestTurn) {
            if (message.references.length) {
                messages.push(vscode.LanguageModelChatMessage.User(await getContextMessage(message.references)));
            }
            messages.push(vscode.LanguageModelChatMessage.User(message.prompt));
        } else if (message instanceof vscode.ChatResponseTurn) {
            const strResponse = message.response.map(part => {
                if (part instanceof vscode.ChatResponseMarkdownPart) {
                    return part.value.value;
                } else if (part instanceof vscode.ChatResponseAnchorPart) {
                    if (part.value instanceof vscode.Location) {
                        return ` ${part.value.uri.fsPath}:${part.value.range.start.line}-${part.value.range.end.line} `;
                    } else if (part.value instanceof vscode.Uri) {
                        return ` ${part.value.fsPath} `;
                    }
                }
            }).join('');
            messages.push(vscode.LanguageModelChatMessage.Assistant(strResponse));
        }
    }

    return messages;
}


export function deactivate() { }
