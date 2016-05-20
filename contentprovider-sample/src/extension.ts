/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';

import {workspace, window, commands, ExtensionContext} from 'vscode';
import ContentProvider, {encodeLocation} from './contentProvider';

export function activate(context: ExtensionContext) {

    const contentProvider = new ContentProvider();

    // register content provider for scheme `references`
    const providerRegistration = workspace.registerTextDocumentContentProvider(ContentProvider.scheme, contentProvider);

    // register command that crafts an uri with the `references` scheme,
    // open the dynamic document, and shows it in the next editor
    const commandRegistration = commands.registerTextEditorCommand('editor.printReferences', editor => {
        const uri = encodeLocation(editor.document.uri, editor.selection.active);
        return workspace.openTextDocument(uri).then(doc => window.showTextDocument(doc, editor.viewColumn + 1));
    });

    context.subscriptions.push(
        contentProvider,
        commandRegistration,
        providerRegistration
    );
}
