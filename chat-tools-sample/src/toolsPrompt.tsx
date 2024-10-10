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
} from '@vscode/prompt-tsx';
import { ToolMessage, ToolResult } from '@vscode/prompt-tsx/dist/base/promptElements';
import * as vscode from 'vscode';

export interface ToolUserProps extends BasePromptElementProps {
	request: vscode.ChatRequest;
	context: vscode.ChatContext;
	toolCalls: vscode.LanguageModelToolCallPart[];
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
				<ToolCalls toolCalls={this.props.toolCalls} toolInvocationToken={this.props.request.toolInvocationToken}></ToolCalls>
			</>
		);
	}
}

interface ToolCallsProps extends BasePromptElementProps {
	toolCalls: vscode.LanguageModelToolCallPart[];
	toolInvocationToken: vscode.ChatParticipantToolToken;
}

class ToolCalls extends PromptElement<ToolCallsProps, void> {
	render(state: void, sizing: PromptSizing) {
		// TODO- prompt-tsx export this type?
		// TODO- at what level do the parameters get stringified?
		const assistantToolCalls: any[] = this.props.toolCalls.map(tc => ({ type: 'function', function: { name: tc.name, arguments: JSON.stringify(tc.parameters) }, id: tc.toolCallId }));
		// TODO@prompt-tsx- don't remove "empty" assistant messages!
		return <>
			<AssistantMessage toolCalls={assistantToolCalls}>todo</AssistantMessage>
			{this.props.toolCalls.map(toolCall => {
				const tool = vscode.lm.tools.find(t => t.id === toolCall.name);
				if (!tool) {
					console.error(`Tool not found: ${toolCall.name}`);
					return undefined;
				}

				return <ToolCall tool={tool} toolCall={toolCall} toolInvocationToken={this.props.toolInvocationToken}></ToolCall>;
			})}
			<UserMessage priority={100}>Above is the result of calling one or more tools. The user cannot see the results, so you should explain them to the user if referencing them in your answer.</UserMessage>
		</>;
	}
}

interface ToolCallProps extends BasePromptElementProps {
	tool: vscode.LanguageModelToolDescription;
	toolCall: vscode.LanguageModelToolCallPart;
	toolInvocationToken: vscode.ChatParticipantToolToken;
}

const agentSupportedContentTypes = [promptTsxContentType, 'text/plain'];

const dummyCancellationToken: vscode.CancellationToken = new vscode.CancellationTokenSource().token;
class ToolCall extends PromptElement<ToolCallProps, void> {
	async render(state: void, sizing: PromptSizing) {
		const contentType = agentSupportedContentTypes.find(type => this.props.tool.supportedContentTypes.includes(type));
		if (!contentType) {
			console.error(`Tool does not support any of the agent's content types: ${this.props.tool.id}`);
			return <ToolMessage toolCallId={this.props.toolCall.toolCallId}>Tool unsupported</ToolMessage>;
		}

		const tokenOptions: vscode.LanguageModelToolInvocationOptions<unknown>['tokenOptions'] = {
			tokenBudget: sizing.tokenBudget,
			countTokens: async (content: string) => sizing.countTokens(content),
		};

		const result = await vscode.lm.invokeTool(this.props.toolCall.name, { parameters: this.props.toolCall.parameters, requestedContentTypes: [contentType], toolInvocationToken: this.props.toolInvocationToken, tokenOptions }, dummyCancellationToken);
		return <>
			<ToolMessage toolCallId={this.props.toolCall.toolCallId}>
				{contentType === 'text/plain' ?
					result[contentType] :
					<elementJSON data={result[contentType]}></elementJSON>}
			</ToolMessage>
		</>
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
