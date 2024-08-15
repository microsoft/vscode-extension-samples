import { BasePromptElementProps, PromptElement, PromptSizing, AssistantMessage, UserMessage, PromptPiece, JSONT, ITokenizer } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';

export interface PromptProps extends BasePromptElementProps {
    userQuery: JSONT.PromptElementJSON;
}

export interface PromptState {
    creationScript: string;
}

export class TestPrompt extends PromptElement<PromptProps> {
    async render(_state: void, sizing: PromptSizing) {
        return (
            <>
                <elementJSON data={this.props.userQuery} />
            </>
        );
    }
}

export class MyCustomPrompt extends PromptElement {
    render(state: void, sizing: PromptSizing): Promise<PromptPiece | undefined> | PromptPiece | undefined {
        return  <AssistantMessage>
            You are a SQL expert.<br />
            Your task is to help the user craft SQL queries that perform their task.<br />
            You should suggest SQL queries that are performant and correct.<br />
            Return your suggested SQL query in a Markdown code block that begins with ```sql and ends with ```.<br />
        </AssistantMessage>;
    }

}
