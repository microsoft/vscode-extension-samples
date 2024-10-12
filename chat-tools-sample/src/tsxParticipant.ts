import * as vscode from 'vscode';
import { FindFilesTool, RunInTerminalTool, TabCountTool } from './tools';
import { renderPrompt } from '@vscode/prompt-tsx';
import { ToolCallRound, ToolResultMetadata, ToolUserPrompt } from './toolsPrompt';

export interface TsxToolUserMetadata {
    toolCallsMetadata: ToolCallsMetadata;
}

export interface ToolCallsMetadata {
    toolCallRounds: ToolCallRound[];
    toolCallResults: Record<string, vscode.LanguageModelToolResult>;
}

export function isTsxToolUserMetadata(obj: unknown): obj is TsxToolUserMetadata {
    // If you change the metadata format, you would have to make this stricter or handle old objects in old ChatRequest metadata
    return !!obj &&
        !!(obj as TsxToolUserMetadata).toolCallsMetadata &&
        Array.isArray((obj as TsxToolUserMetadata).toolCallsMetadata.toolCallRounds);
}

export function registerTsxChatParticipant(context: vscode.ExtensionContext) {
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
        if (request.command === 'list') {
            stream.markdown(`Available tools: ${vscode.lm.tools.map(tool => tool.name).join(', ')}\n\n`);
            return;
        }

        const models = await vscode.lm.selectChatModels({
            vendor: 'copilot',
            family: 'gpt-4o'
        });

        const model = models[0];
        const allTools = vscode.lm.tools.map((tool): vscode.LanguageModelChatTool => {
            return {
                name: tool.name,
                description: tool.description,
                parametersSchema: tool.parametersSchema ?? {}
            };
        });

        const options: vscode.LanguageModelChatRequestOptions = {
            justification: 'Just because!',
        };

        let { messages, references } = await renderPrompt(
            ToolUserPrompt,
            {
                context: chatContext,
                request,
                toolCallRounds: [],
                toolCallResults: {}
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            model);
        references.forEach(ref => {
            if (ref.anchor instanceof vscode.Uri || ref.anchor instanceof vscode.Location) {
                stream.reference(ref.anchor);
            }
        });

        const toolReferences = [...request.toolReferences];
        const accumulatedToolResults: Record<string, vscode.LanguageModelToolResult> = {};
        const toolCallRounds: ToolCallRound[] = [];
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
                    toolCalls.push(part);
                }
            }

            if (toolCalls.length) {
                toolCallRounds.push({
                    response: responseStr,
                    toolCalls
                });
                const result = (await renderPrompt(
                    ToolUserPrompt,
                    {
                        context: chatContext,
                        request,
                        toolCallRounds,
                        toolCallResults: accumulatedToolResults
                    },
                    { modelMaxPromptTokens: model.maxInputTokens },
                    model));
                messages = result.messages;
                const toolResultMetadata = result.metadatas.getAll(ToolResultMetadata)
                if (toolResultMetadata?.length) {
                    toolResultMetadata.forEach(meta => accumulatedToolResults[meta.toolCallId] = meta.result);
                }

                return runWithFunctions();
            }
        };

        await runWithFunctions();

        return {
            metadata: {
                toolCallsMetadata: {
                    toolCallResults: accumulatedToolResults,
                    toolCallRounds
                }
            } satisfies TsxToolUserMetadata,
        }
    };

    const toolUser = vscode.chat.createChatParticipant('chat-tools-sample.tools2', handler);
    toolUser.iconPath = new vscode.ThemeIcon('tools');
    context.subscriptions.push(toolUser);
}