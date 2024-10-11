import {
	AssistantMessage,
	BasePromptElementProps,
	contentType as promptTsxContentType,
	PrioritizedList,
	PromptElement,
	PromptElementProps,
	PromptPiece,
	PromptSizing,
	UserMessage,
	PromptMetadata,
} from '@vscode/prompt-tsx';
import { Chunk, ToolMessage, ToolResult } from '@vscode/prompt-tsx/dist/base/promptElements';
import * as vscode from 'vscode';
import { isTsxToolUserMetadata } from './extension';

export interface ToolCallRound {
	response: string;
	toolCalls: vscode.LanguageModelToolCallPart[];
}

export interface ToolUserProps extends BasePromptElementProps {
	request: vscode.ChatRequest;
	context: vscode.ChatContext;
	toolCallRounds: ToolCallRound[];
	toolCallResults: Record<string, vscode.LanguageModelToolResult>;
}

export class ToolUserPrompt extends PromptElement<ToolUserProps, void> {
	render(state: void, sizing: PromptSizing) {
		return (
			<>
				<UserMessage priority={50}>
					Instructions: <br />
					- The user will ask a question, or ask you to perform a task, and it may
					require lots of research to answer correctly. There is a selection of
					tools that let you perform actions or retrieve helpful context to answer
					the user's question. <br />
					- If you aren't sure which tool is relevant, you can call multiple
					tools. You can call tools repeatedly to take actions or gather as much
					context as needed until you have completed the task fully. Don't give up
					unless you are sure the request cannot be fulfilled with the tools you
					have. <br />
					- Don't make assumptions about the situation- gather context first, then
					perform the task or answer the question. <br />
					- Don't ask the user for confirmation to use tools, just use them.
					<br />- After editing a file, DO NOT show the user a codeblock with the
					edit or new file contents. Assume that the user can see the result.
				</UserMessage>
				<History context={this.props.context} priority={20}></History>
				<PromptReferences
					references={this.props.request.references}
					priority={30}
				/>
				<UserMessage priority={40}>{this.props.request.prompt}</UserMessage>
				<ToolCalls
					toolCallRounds={this.props.toolCallRounds}
					toolInvocationToken={this.props.request.toolInvocationToken}
					toolCallResults={this.props.toolCallResults}>
				</ToolCalls>
			</>
		);
	}
}

interface ToolCallsProps extends BasePromptElementProps {
	toolCallRounds: ToolCallRound[];
	toolCallResults: Record<string, vscode.LanguageModelToolResult>;
	toolInvocationToken: vscode.ChatParticipantToolToken | undefined;
}

const agentSupportedContentTypes = [promptTsxContentType, 'text/plain'];
const dummyCancellationToken: vscode.CancellationToken = new vscode.CancellationTokenSource().token;

class ToolCalls extends PromptElement<ToolCallsProps, void> {
	async render(state: void, sizing: PromptSizing) {
		if (!this.props.toolCallRounds.length) {
			return undefined;
		}

		return <>
			{await Promise.all(this.props.toolCallRounds.map(round => this.renderOneToolCallRound(round, sizing)))}
			<UserMessage priority={100}>Above is the result of calling one or more tools. The user cannot see the results, so you should explain them to the user if referencing them in your answer.</UserMessage>
		</>
	}

	private async renderOneToolCallRound(round: ToolCallRound, sizing: PromptSizing) {
		// TODO- prompt-tsx export this type?
		// TODO- at what level do the parameters get stringified?
		const assistantToolCalls: any[] = round.toolCalls.map(tc => ({ type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.parameters) }, id: tc.toolCallId }));

		const toolResultMap = new Map<string, vscode.LanguageModelToolResult>();
		const budget = Math.floor(sizing.tokenBudget / round.toolCalls.length);
		// TODO refactor into multiple elements
		const toolCallSizing: PromptSizing = {
			...sizing,
			tokenBudget: budget,
		};

		return <Chunk>
			<meta value={new ToolResultMetadata(toolResultMap)}></meta>
			<AssistantMessage toolCalls={assistantToolCalls}>{round.response}</AssistantMessage>
			{await Promise.all(round.toolCalls.map(async toolCall => {
				const result = await this.renderOneToolCall(toolCall, toolCallSizing, this.props.toolInvocationToken);
				if (result.toolResult) {
					toolResultMap.set(toolCall.toolCallId, result.toolResult);
				}
				return result.message;
			}))}
		</Chunk>;
	}

	private async renderOneToolCall(toolCall: vscode.LanguageModelToolCallPart, sizing: PromptSizing, toolInvocationToken: vscode.ChatParticipantToolToken): Promise<{ message: ToolMessage; toolResult?: vscode.LanguageModelToolResult; }> {
		const tool = vscode.lm.tools.find(t => t.id === toolCall.name);
		if (!tool) {
			console.error(`Tool not found: ${toolCall.name}`);
			return { message: <ToolMessage toolCallId={toolCall.toolCallId}>Tool not found</ToolMessage> };
		}

		const contentType = agentSupportedContentTypes.find(type => tool.supportedContentTypes.includes(type));
		if (!contentType) {
			console.error(`Tool does not support any of the agent's content types: ${tool.id}`);
			return { message: <ToolMessage toolCallId={toolCall.toolCallId}>Tool unsupported</ToolMessage> };
		}

		const tokenOptions: vscode.LanguageModelToolInvocationOptions<unknown>['tokenOptions'] = {
			tokenBudget: sizing.tokenBudget,
			countTokens: async (content: string) => sizing.countTokens(content),
		};

		const toolResult = this.props.toolCallResults[toolCall.toolCallId] ??
			await vscode.lm.invokeTool(toolCall.name, { parameters: toolCall.parameters, requestedContentTypes: [contentType], toolInvocationToken: toolInvocationToken, tokenOptions }, dummyCancellationToken);
		const message = <ToolMessage toolCallId={toolCall.toolCallId}>
			{contentType === 'text/plain' ?
				toolResult[contentType] :
				<elementJSON data={toolResult[contentType]}></elementJSON>}
		</ToolMessage>;
		return {
			message, 
			toolResult: toolResult
		};
	}
}

export class ToolResultMetadata extends PromptMetadata {
	constructor(
		public resultMap: Map<string, vscode.LanguageModelToolResult>,
	) {
		super();
	}
}

interface HistoryProps extends BasePromptElementProps {
	priority: number;
	context: vscode.ChatContext;
}

class History extends PromptElement<HistoryProps, void> {
	render(state: void, sizing: PromptSizing) {
		return (
			<PrioritizedList priority={this.props.priority} descending={false}>
				{this.props.context.history.map((message) => {
					if (message instanceof vscode.ChatRequestTurn) {
						return (
							<>
								{<PromptReferences references={message.references} />}
								<UserMessage>{message.prompt}</UserMessage>
							</>
						);
					} else if (message instanceof vscode.ChatResponseTurn) {
						const toolInfo = message.result.metadata?.toolInfo;
						if (isTsxToolUserMetadata(toolInfo)) {
							return <ToolCalls toolCallResults={toolInfo.toolCallResults} toolCallRounds={toolInfo.toolCallRounds} toolInvocationToken={undefined}></ToolCalls>
						}
						
						return (
							<AssistantMessage>
								{chatResponseToString(message)}
							</AssistantMessage>
						);
					}
				})}
			</PrioritizedList>
		);
	}
}

function chatResponseToString(response: vscode.ChatResponseTurn): string {
	return response.response
		.map((r) => {
			if (r instanceof vscode.ChatResponseMarkdownPart) {
				return r.value.value;
			} else if (r instanceof vscode.ChatResponseAnchorPart) {
				if (r.value instanceof vscode.Uri) {
					return r.value.fsPath;
				} else {
					return r.value.uri.fsPath;
				}
			}

			return '';
		})
		.join('');
}

interface PromptReferencesProps extends BasePromptElementProps {
	references: ReadonlyArray<vscode.ChatPromptReference>;
}

class PromptReferences extends PromptElement<PromptReferencesProps, void> {
	render(state: void, sizing: PromptSizing): PromptPiece {
		return (
			<UserMessage>
				{this.props.references.map((ref, index) => (
					<PromptReference ref={ref}></PromptReference>
				))}
			</UserMessage>
		);
	}
}

interface PromptReferenceProps extends BasePromptElementProps {
	ref: vscode.ChatPromptReference;
}

class PromptReference extends PromptElement<PromptReferenceProps> {
	async render(state: void, sizing: PromptSizing): Promise<PromptPiece | undefined> {
		const value = this.props.ref.value;
		if (value instanceof vscode.Uri) {
			const fileContents = (await vscode.workspace.fs.readFile(value)).toString();
			return (
				<Tag name="context">
					{value.fsPath}:<br />
					``` <br />
					{fileContents}<br />
					```<br />
				</Tag>
			);
		} else if (value instanceof vscode.Location) {
			const rangeText = (await vscode.workspace.openTextDocument(value.uri)).getText(value.range);
			return (
				<Tag name="context">
					{value.uri.fsPath}:{value.range.start.line + 1}-$<br />
					{value.range.end.line + 1}: ```<br />
					{rangeText}<br />
					```
				</Tag>
			);
		} else if (typeof value === 'string') {
			return <Tag name="context">{value}</Tag>;
		}
	}
}

export type TagProps = PromptElementProps<{
	name: string;
}>;

export class Tag extends PromptElement<TagProps> {
	private static readonly _regex = /^[a-zA-Z_][\w\.\-]*$/;

	render() {
		const { name } = this.props;

		if (!Tag._regex.test(name)) {
			throw new Error(`Invalid tag name: ${this.props.name}`);
		}

		return (
			<>
				{'<' + name + '>'}<br />
				<>
					{this.props.children}<br />
				</>
				{'</' + name + '>'}<br />
			</>
		);
	}
}
