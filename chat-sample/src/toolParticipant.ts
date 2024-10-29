import { renderPrompt } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
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

export function registerToolUserChatParticipant(context: vscode.ExtensionContext) {
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
        if (request.command === 'list') {
            stream.markdown(`Available tools: ${vscode.lm.tools.map(tool => tool.name).join(', ')}\n\n`);
            return;
        }

        let model = request.model;
        if (model.vendor === 'copilot' && model.family.startsWith('o1')) {
            // The o1 models do not currently support tools
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: 'gpt-4o'
            });
            model = models[0];
        }

        // Use all tools, or tools with the tags that are relevant.
        const tools = request.command === 'all' ?
            vscode.lm.tools :
            vscode.lm.tools.filter(tool => tool.tags.includes('chat-tools-sample'));
        const options: vscode.LanguageModelChatRequestOptions = {
            justification: 'To make a request to @toolsTSX',
        };

        // Render the initial prompt
        const result = await renderPrompt(
            ToolUserPrompt,
            {
                context: chatContext,
                request,
                toolCallRounds: [],
                toolCallResults: {}
            },
            { modelMaxPromptTokens: model.maxInputTokens },
            model);
        let messages = result.messages;
        result.references.forEach(ref => {
            if (ref.anchor instanceof vscode.Uri || ref.anchor instanceof vscode.Location) {
                stream.reference(ref.anchor);
            }
        });

        const toolReferences = [...request.toolReferences];
        const accumulatedToolResults: Record<string, vscode.LanguageModelToolResult> = {};
        const toolCallRounds: ToolCallRound[] = [];
        const runWithTools = async (): Promise<void> => {
            // If a toolReference is present, force the model to call that tool
            const requestedTool = toolReferences.shift();
            if (requestedTool) {
                options.toolMode = vscode.LanguageModelChatToolMode.Required;
                options.tools = vscode.lm.tools.filter(tool => tool.name === requestedTool.name);
            } else {
                options.toolMode = undefined;
                options.tools = [...tools];
            }

            // Send the request to the LanguageModelChat
            const response = await model.sendRequest(messages, options, token);

            // Stream text output and collect tool calls from the response
            const toolCalls: vscode.LanguageModelToolCallPart[] = [];
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
                // If the model called any tools, then we do another round- render the prompt with those tool calls (rendering the PromptElements will invoke the tools)
                // and include the tool results in the prompt for the next request.
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
                const toolResultMetadata = result.metadatas.getAll(ToolResultMetadata);
                if (toolResultMetadata?.length) {
                    // Cache tool results for later, so they can be incorporated into later prompts without calling the tool again
                    toolResultMetadata.forEach(meta => accumulatedToolResults[meta.toolCallId] = meta.result);
                }

                // This loops until the model doesn't want to call any more tools, then the request is done.
                return runWithTools();
            }
        };

        await runWithTools();

        return {
            metadata: {
                // Return tool call metadata so it can be used in prompt history on the next request
                toolCallsMetadata: {
                    toolCallResults: accumulatedToolResults,
                    toolCallRounds
                }
            } satisfies TsxToolUserMetadata,
        };
    };

    const toolUser = vscode.chat.createChatParticipant('chat-tools-sample.tools', handler);
    toolUser.iconPath = new vscode.ThemeIcon('tools');
    context.subscriptions.push(toolUser);
}