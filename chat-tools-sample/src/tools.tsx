import {
	BasePromptElementProps,
	PromptElement,
	PromptSizing,
	TextChunk,
	UserMessage
} from '@vscode/prompt-tsx';

export class CatVoiceToolResult extends PromptElement<BasePromptElementProps, void> {
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
