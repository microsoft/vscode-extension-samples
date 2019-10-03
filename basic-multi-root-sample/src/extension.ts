/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { ExtensionContext, StatusBarAlignment, window, StatusBarItem, Selection, workspace, TextEditor, commands } from 'vscode';
import { basename } from 'path';

export function activate(context: ExtensionContext) {

    // Create a status bar item
    const status = window.createStatusBarItem(StatusBarAlignment.Left, 1000000);
    context.subscriptions.push(status);

    // Update status bar item based on events for multi root folder changes
    context.subscriptions.push(workspace.onDidChangeWorkspaceFolders(e => updateStatus(status)));

    // Update status bar item based on events for configuration
    context.subscriptions.push(workspace.onDidChangeConfiguration(e => updateStatus(status)));

    // Update status bar item based on events around the active editor
    context.subscriptions.push(window.onDidChangeActiveTextEditor(e => updateStatus(status)));
    context.subscriptions.push(window.onDidChangeTextEditorViewColumn(e => updateStatus(status)));
    context.subscriptions.push(workspace.onDidOpenTextDocument(e => updateStatus(status)));
    context.subscriptions.push(workspace.onDidCloseTextDocument(e => updateStatus(status)));

    updateStatus(status);
}

function updateStatus(status: StatusBarItem): void {
    const info = getEditorInfo();
    status.text = info ? info.text || '' : '';
    status.tooltip = info ? info.tooltip : undefined;
    status.color = info ? info.color : undefined;

    if (info) {
        status.show();
    } else {
        status.hide();
    }
}

function getEditorInfo(): { text?: string; tooltip?: string; color?: string; } | null {
    const editor = window.activeTextEditor;

    // If no workspace is opened or just a single folder, we return without any status label
    // because our extension only works when more than one folder is opened in a workspace.
    if (!editor || !workspace.workspaceFolders || workspace.workspaceFolders.length < 2) {
        return null;
    }

    let text: string | undefined;
    let tooltip: string | undefined;
    let color: string | undefined;

    // If we have a file:// resource we resolve the WorkspaceFolder this file is from and update
    // the status accordingly.
    const resource = editor.document.uri;
    if (resource.scheme === 'file') {
        const folder = workspace.getWorkspaceFolder(resource);
        if (!folder) {
            text = `$(alert) <outside workspace> → ${basename(resource.fsPath)}`;
        } else {
            text = `$(file-submodule) ${basename(folder.uri.fsPath)} (${folder.index + 1} of ${workspace.workspaceFolders.length}) → $(file-code) ${basename(resource.fsPath)}`;
            tooltip = resource.fsPath;

            const multiRootConfigForResource = workspace.getConfiguration('multiRootSample', resource);
            color = multiRootConfigForResource.get('statusColor');
        }
    }

    return { text, tooltip, color };
}
