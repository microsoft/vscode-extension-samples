import { renderPrompt } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { ToolCallRound, ToolResultMetadata, ToolUserPrompt } from './toolsPrompt';
import { TsxToolUserMetadata } from './toolParticipant';
import { toLanguageModelChatTools, getToolsForRequest } from './lmTools';

const FIND_FILES_TOOL = 'chat-tools-sample_findFiles';

function inferRequiredToolFromPrompt(
	prompt: string,
	tools: readonly vscode.LanguageModelToolInformation[]
): string | undefined {
	const findFilesTool = tools.find(tool => tool.name === FIND_FILES_TOOL);
	if (!findFilesTool) {
		return undefined;
	}

	if (/\b(search|find|look\s+for|locate)\b/i.test(prompt) && /\.\w{1,10}\b/.test(prompt)) {
		return findFilesTool.name;
	}

	return undefined;
}

export function registerChatLibChatParticipant(context: vscode.ExtensionContext) {
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		if (request.command === 'list') {
			stream.markdown(`Available tools: ${vscode.lm.tools.map(tool => tool.name).join(', ')}\n\n`);
			return;
		}

		let model = request.model;
		if (model.vendor === 'copilot' && model.family.startsWith('o1')) {
			const models = await vscode.lm.selectChatModels({
				vendor: 'copilot',
				family: 'gpt-4o'
			});
			model = models[0];
		}

		const tools = getToolsForRequest(request.command);
		const options: vscode.LanguageModelChatRequestOptions = {
			justification: 'To make a request to @catTools',
		};

		const result = await renderPrompt(
			ToolUserPrompt,
			{
				context: chatContext,
				request,
				toolCallRounds: [],
				toolCallResults: {},
				additionalInstructions: 'You are a cat! Answer as a cat, but still use tools whenever they help complete the user\'s request.'
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
		const inferredTool = inferRequiredToolFromPrompt(request.prompt, tools);
		if (inferredTool && !toolReferences.some(ref => ref.name === inferredTool)) {
			toolReferences.unshift({ name: inferredTool } as vscode.ChatLanguageModelToolReference);
		}

		const accumulatedToolResults: Record<string, vscode.LanguageModelToolResult> = {};
		const toolCallRounds: ToolCallRound[] = [];
		const runWithTools = async (): Promise<void> => {
			const requestedTool = toolReferences.shift();
			if (requestedTool) {
				options.toolMode = vscode.LanguageModelChatToolMode.Required;
				options.tools = toLanguageModelChatTools(
					vscode.lm.tools.filter(tool => tool.name === requestedTool.name)
				);
			} else {
				options.toolMode = undefined;
				options.tools = toLanguageModelChatTools(tools);
			}

			const response = await model.sendRequest(messages, options, token);

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
				toolCallRounds.push({
					response: responseStr,
					toolCalls
				});
				const nextResult = (await renderPrompt(
					ToolUserPrompt,
					{
						context: chatContext,
						request,
						toolCallRounds,
						toolCallResults: accumulatedToolResults,
						additionalInstructions: 'You are a cat! Answer as a cat, but still use tools whenever they help complete the user\'s request.'
					},
					{ modelMaxPromptTokens: model.maxInputTokens },
					model));
				messages = nextResult.messages;
				const toolResultMetadata = nextResult.metadatas.getAll(ToolResultMetadata);
				if (toolResultMetadata?.length) {
					toolResultMetadata.forEach(meta => accumulatedToolResults[meta.toolCallId] = meta.result);
				}

				return runWithTools();
			}
		};

		await runWithTools();

		return {
			metadata: {
				toolCallsMetadata: {
					toolCallResults: accumulatedToolResults,
					toolCallRounds
				}
			} satisfies TsxToolUserMetadata,
		};
	};

	const chatLibParticipant = vscode.chat.createChatParticipant('chat-tools-sample.catTools', handler);
	chatLibParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
	context.subscriptions.push(chatLibParticipant);
}
