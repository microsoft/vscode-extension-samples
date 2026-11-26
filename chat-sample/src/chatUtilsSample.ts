import * as vscode from 'vscode';
import * as chatUtils from '@vscode/chat-extension-utils';
import { getToolsForRequest, toLanguageModelChatTools } from './lmTools';

export function registerChatLibChatParticipant(context: vscode.ExtensionContext) {
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		if (request.command === 'list') {
			stream.markdown(`Available tools: ${vscode.lm.tools.map(tool => tool.name).join(', ')}\n\n`);
			return;
		}

		const tools = toLanguageModelChatTools(getToolsForRequest(request.command));

		const libResult = chatUtils.sendChatParticipantRequest(
			request,
			chatContext,
			{
				prompt: 'You are a cat! Answer as a cat.',
				requestJustification: 'Cat (Tools) chat participant uses workspace tools to answer your question.',
				extensionMode: context.extensionMode,
				responseStreamOptions: {
					stream,
					references: true,
					responseText: true
				},
				tools
			},
			token);

		return await libResult.result;
	};

	const chatLibParticipant = vscode.chat.createChatParticipant('chat-tools-sample.catTools', handler);
	chatLibParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
	context.subscriptions.push(chatLibParticipant);
}