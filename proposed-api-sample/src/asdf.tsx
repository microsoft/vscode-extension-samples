import { BasePromptElementProps, PromptElement, PromptSizing, AssistantMessage, UserMessage, PromptPiece } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';

export interface PromptProps extends BasePromptElementProps {
    userQuery: PromptPiece;
}

export interface PromptState {
    creationScript: string;
}

export class TestPrompt extends PromptElement<PromptProps, PromptState> {

    render(state: PromptState, sizing: PromptSizing) {
        return (
            <>
                <UserMessage>
                    Here are the creation scripts that were used to create the tables in my database. Pay close attention to the tables and columns that are available in my database:<br />
                </UserMessage>
                {this.props.userQuery}
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
        </AssistantMessage>
    }

}

export const myPromptEl = <MyCustomPrompt />;