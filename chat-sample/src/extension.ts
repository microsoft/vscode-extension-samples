import * as vscode from 'vscode';
import { FindFilesTool, RunInTerminalTool, TabCountTool } from './tools';
import { registerToolUserChatParticipant } from './toolParticipant';
import { registerSimpleParticipant } from './simple';

export function activate(context: vscode.ExtensionContext) {
    registerSimpleParticipant(context);
    registerChatTools(context);
    registerToolUserChatParticipant(context);
}

function registerChatTools(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_tabCount', new TabCountTool()));
    context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_findFiles', new FindFilesTool()));
    context.subscriptions.push(vscode.lm.registerTool('chat-tools-sample_runInTerminal', new RunInTerminalTool()));
}

export function deactivate() { }
