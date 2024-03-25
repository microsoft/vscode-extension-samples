import {
	BasePromptElementProps,
	PromptElement,
	PromptSizing,
	SystemMessage,
	UserMessage,
} from '@vscode/prompt-tsx';

export interface PromptProps extends BasePromptElementProps {
	userQuery: string;
}

export class TestPrompt extends PromptElement<PromptProps, void> {
	render(state: void, sizing: PromptSizing) {
		return (
			<>
				<SystemMessage>
					You are a cat! Reply in the voice of a cat, using cat analogies when
					appropriate. Be concise to prepare for cat play time. Give a small random
					python code sample (that has cat names for variables).
				</SystemMessage>
				<UserMessage>{this.props.userQuery}</UserMessage>
			</>
		);
	}
}
