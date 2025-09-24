import { CancellationToken, LanguageModelChatInformation, LanguageModelChatMessage, LanguageModelChatProvider, LanguageModelResponsePart, LanguageModelTextPart, Progress, ProvideLanguageModelChatResponseOptions, ProviderResult } from "vscode";

function getChatModelInfo(id: string, name: string): LanguageModelChatInformation {
	return {
		id,
		name,
		tooltip: "A sample chat model for demonstration purposes.",
		family: "sample-family",
		maxInputTokens: 120000,
		maxOutputTokens: 8192,
		version: "1.0.0",
		capabilities: {
			toolCalling: true,
			imageInput: true,
		}
	};
}

export class SampleChatModelProvider implements LanguageModelChatProvider {
	provideLanguageModelChatInformation(_options: { silent: boolean; }, _token: CancellationToken): ProviderResult<LanguageModelChatInformation[]> {
		return [
			getChatModelInfo("sample-dog-model", "Dog Model"),
			getChatModelInfo("sample-cat-model", "Cat Model"),
		];
	}
	async provideLanguageModelChatResponse(model: LanguageModelChatInformation, _messages: Array<LanguageModelChatMessage>, _options: ProvideLanguageModelChatResponseOptions, progress: Progress<LanguageModelResponsePart>, _token: CancellationToken): Promise<void> {
		if (model.id === "sample-dog-model") {
			progress.report(new LanguageModelTextPart("Woof! This is a dog model response."));
		} else if (model.id === "sample-cat-model") {
			progress.report(new LanguageModelTextPart("Meow! This is a cat model response."));
		} else {
			progress.report(new LanguageModelTextPart("Unknown model."));
		}
	}
	async provideTokenCount(_model: LanguageModelChatInformation, _text: string | LanguageModelChatMessage, _token: CancellationToken): Promise<number> {
		return 42;
	}

}