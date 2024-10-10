import * as vscode from 'vscode';
import { FindFilesTool, RunInTerminalTool, TabCountTool } from './tools';
import { renderPrompt } from '@vscode/prompt-tsx';
import { ToolResultMetadata, ToolUserPrompt } from './toolsPrompt';

export function activate(context: vscode.ExtensionContext) {
    registerChatTool(context);
    registerChatParticipant(context);
    registerChatParticipant2(context);
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
                // options.tools = allTools.filter(tool => tool.name === requestedTool.id);
                options.tools = JSON.parse(`[{"type":"function","function":{"name":"copilot_codebase","description":"Search for relevant file chunks, symbols, and other info about the current workspace or codebase","parameters":{"type":"object","properties":{"query":{"type":"string","description":"The query to search the codebase for. Should contain all relevant context. Can be a full natural language sentence, or keywords."}},"required":["query"]}}},{"type":"function","function":{"name":"copilot_vscodeAPI","description":"Use VS Code API references to answer questions about VS Code extension development.","parameters":{"type":"object","properties":{"query":{"type":"string","description":"The query to search vscode documentation for. Should contain all relevant context."}},"required":["query"]}}},{"type":"function","function":{"name":"ada-data_findFiles","description":"Search for files in the current workspace","parameters":{"type":"object","properties":{"pattern":{"type":"string","description":"Search for files that match this glob pattern"}},"required":["pattern"]}}},{"type":"function","function":{"name":"ada-data_runPython","description":"Execute Python code locally using Pyodide, providing access to Python's extensive functionality. This tool extends the LLM's capabilities by allowing it to run Python code for a wide range of computational tasks and data manipulations that it cannot perform directly. When you know the workspace folder path and the file path, use the relative path to the file when generating code.","parameters":{"type":"object","properties":{"code":{"type":"string","description":"The Python code to run"}},"required":["code"]}}}`)
            } else {
                options.toolChoice = undefined;
                options.tools = allTools;
            }

            const toolCalls: IToolCall[] = [];

            messages.splice(0, messages.length,
                vscode.LanguageModelChatMessage.User(`Instructions: - The user will ask a question, or ask you to perform a task, and it may require lots of research to answer correctly. There is a selection of tools that let you perform actions or retrieve helpful context to answer the user's question. - If you aren't sure which tool is relevant, you can call multiple tools. You can call tools repeatedly to take actions or gather as much context as needed until you have completed the task fully. Don't give up unless you are sure the request cannot be fulfilled with the tools you have. - Don't make assumptions about the situation- gather context first, then perform the task or answer the question. - Don't ask the user for confirmation to use tools, just use them. - Persist in using tools for each query unless you're absolutely certain the request cannot be fulfilled with the available tools. - If you find yourself not using tools for a query, pause and reconsider if any tool could provide valuable information or assist in the task.`),
                vscode.LanguageModelChatMessage.User(`Think of yourself as a data scientist who is analyzing a csv file using Python programming language. Ask user to clean up their missing data value and ask them for updated csv file. Provide them with code to remove the missing data value to remain interactive. Make sure to generate a pandas dataframe using the given csv file before performing data analysis. Make sure to perform statistical analysis on the data with actual numbers. Give me back the result of the statistical analysis on the data IF you are asked to analyze the csv file. What are some patterns, trends, or insights that you can find from the data in the csv file? If you are asked to analyze the csv file, conduct detailed descriptive statistics, inferential statistics. Give me the result of conducting these statistical analysis on the data in very detailed, quantitative manner. Be detailed and descriptive in your analysis. Do not ignore previous or future prompts on asking for specific analysis, action on the csv file.`),
                vscode.LanguageModelChatMessage.User(`analyze housing.csv`),
                vscode.LanguageModelChatMessage.Assistant(`Here is the full content of the \`housing.csv\` dataset:

\`\`\`plaintext
       longitude  latitude  housing_median_age  total_rooms  total_bedrooms  \
                    0 - 122.23     37.88                41.0        880.0           129.0   
1 - 122.22     37.86                21.0       7099.0          1106.0   
2 - 122.24     37.85                52.0       1467.0           190.0   
3 - 122.25     37.85                52.0       1274.0           235.0   
4 - 122.25     37.85                52.0       1627.0           280.0   
...          ...       ...                 ...          ...             ...
                20635 - 121.09     39.48                25.0       1665.0           374.0   
20636 - 121.21     39.49                18.0        697.0           150.0   
20637 - 121.22     39.43                17.0       2254.0           485.0   
20638 - 121.32     39.43                18.0       1860.0           409.0   
20639 - 121.24     39.37                16.0       2785.0           616.0   

       population  households  median_income  median_house_value  \
                    0           322.0       126.0         8.3252            452600.0   
1          2401.0      1138.0         8.3014            358500.0   
2           496.0       177.0         7.2574            352100.0   
3           558.0       219.0         5.6431            341300.0   
4           565.0       259.0         3.8462            342200.0   
...           ...         ...            ...                 ...
                20635       845.0       330.0         1.5603             78100.0   
20636       356.0       114.0         2.5568             77100.0   
20637      1007.0       433.0         1.7000             92300.0   
20638       741.0       349.0         1.8672             84700.0   
20639      1387.0       530.0         2.3886             89400.0   

      ocean_proximity  
0            NEAR BAY  
1            NEAR BAY  
2            NEAR BAY  
3            NEAR BAY  
4            NEAR BAY  
...               ...
                20635          INLAND  
20636          INLAND  
20637          INLAND  
20638          INLAND  
20639          INLAND

                [20640 rows x 10 columns]
                    \`\`\``),
                vscode.LanguageModelChatMessage.User(`Code executed from the tool:
\`\`\`import pandas as pd

# Load the dataset
file_path = 'housing.csv'
df = pd.read_csv(file_path)
df\`\`\``),
                vscode.LanguageModelChatMessage.User(`Make sure to use tools (copilot_codebase, copilot_vscodeAPI, ada-data_findFiles, ada-data_runPython) unless you're absolutely certain the request cannot be fulfilled with the available tools.`),
                vscode.LanguageModelChatMessage.User(`help me visualize it`),
            );
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

function registerChatParticipant2(context: vscode.ExtensionContext) {
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

        let { messages } = await renderPrompt(
            ToolUserPrompt,
            {
                context: chatContext,
                request,
                toolCalls: [],
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            model)

        const toolReferences = [...request.toolReferences];
        const accumulatedToolCalls = new Map<string, vscode.LanguageModelToolResult>();
        const runWithFunctions = async (): Promise<void> => {
            const requestedTool = toolReferences.shift();
            if (requestedTool) {
                options.toolChoice = requestedTool.id;
                options.tools = allTools.filter(tool => tool.name === requestedTool.id);
            } else {
                options.toolChoice = undefined;
                options.tools = allTools;
            }

            const toolCalls: vscode.LanguageModelToolCallPart[] = [];

            const response = await model.sendRequest(messages, options, token);
            let responseStr = '';
            for await (const part of response.stream) {
                if (part instanceof vscode.LanguageModelTextPart) {
                    stream.markdown(part.value);
                    responseStr += part.value;
                } else if (part instanceof vscode.LanguageModelToolCallPart) {
                    // TODO vscode should be doing this
                    part.parameters = JSON.parse(part.parameters);

                    toolCalls.push(part);
                }
            }

            if (toolCalls.length) {
                const result = (await renderPrompt(
                    ToolUserPrompt,
                    {
                        context: chatContext,
                        request,
                        toolCalls,
                    },
                    { modelMaxPromptTokens: model.maxInputTokens },
                    model));
                messages = result.messages;
                const toolResultMetadata = result.metadatas.get(ToolResultMetadata)
                if (toolResultMetadata) {
                    toolResultMetadata.resultMap.forEach((value, key) => accumulatedToolCalls.set(key, value));
                }

                // RE-enter
                return runWithFunctions();
            }
        };

        await runWithFunctions();
    };

    const toolUser = vscode.chat.createChatParticipant('chat-tools-sample.tools2', handler);
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
