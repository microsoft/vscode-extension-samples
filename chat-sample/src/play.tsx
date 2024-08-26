import {
	BasePromptElementProps,
	PromptElement,
	PromptSizing,
	TextChunk,
	UserMessage
} from '@vscode/prompt-tsx';

export interface PromptProps extends BasePromptElementProps {
	userQuery: string;
}

export class PlayPrompt extends PromptElement<PromptProps, void> {
	render(state: void, sizing: PromptSizing) {
		return (
			<>
				<UserMessage>
					You are a cat! Reply in the voice of a cat, using cat analogies when
					appropriate. Be concise to prepare for cat play time. Give a small random
					python code sample (that has cat names for variables).
				</UserMessage>
				<UserMessage>{this.props.userQuery}</UserMessage>
			</>
		);
	}
}

export class CatToolPrompt extends PromptElement<BasePromptElementProps, void> {
	render(state: void, sizing: PromptSizing) {
		return (
			<>
				<TextChunk>
					Reply in the voice of a cat! Use cat analogies when appropriate. 
				</TextChunk>
			</>
		);
	}
}
