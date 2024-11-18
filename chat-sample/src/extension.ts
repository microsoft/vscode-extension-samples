import * as vscode from 'vscode';
import { registerChatLibChatParticipant } from './chatUtilsSample';
import { registerSimpleParticipant } from './simple';
import { registerToolUserChatParticipant } from './toolParticipant';
import { registerChatTools } from './tools';

export function activate(context: vscode.ExtensionContext) {
    registerSimpleParticipant(context);
    registerToolUserChatParticipant(context);
    registerChatLibChatParticipant(context);

    registerChatTools(context);
}

export function deactivate() { }
