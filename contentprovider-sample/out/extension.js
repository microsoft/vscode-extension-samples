/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode_1 = require('vscode');
var contentProvider_1 = require('./contentProvider');
function activate(context) {
    var contentProvider = new contentProvider_1.default();
    // register content provider for scheme `references`
    var providerRegistration = vscode_1.workspace.registerTextDocumentContentProvider(contentProvider_1.default.scheme, contentProvider);
    // register command that crafts an uri with the `references` scheme,
    // open the dynamic document, and shows it in the next editor
    var commandRegistration = vscode_1.commands.registerTextEditorCommand('editor.printReferences', function (editor) {
        var uri = contentProvider_1.encodeLocation(editor.document.uri, editor.selection.active);
        return vscode_1.workspace.openTextDocument(uri).then(function (doc) { return vscode_1.window.showTextDocument(doc, editor.viewColumn + 1); });
    });
    context.subscriptions.push(contentProvider, commandRegistration, providerRegistration);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map