import * as vscode from 'vscode';
import * as rdf from 'rdf-ext';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    const createShapeCommand = vscode.commands.registerCommand('shaclExtension.createShape', async () => {
        const shapeName = await vscode.window.showInputBox({ prompt: 'Enter the name of the SHACL Shape' });
        if (!shapeName) {
            return;
        }

        const shape = rdf.namedNode(`http://example.org/${shapeName}`);
        const shapeGraph = rdf.dataset();
        shapeGraph.add(rdf.quad(shape, rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), rdf.namedNode('http://www.w3.org/ns/shacl#NodeShape')));

        const shapeContent = shapeGraph.toString();
        const shapeDocument = await vscode.workspace.openTextDocument({ content: shapeContent, language: 'turtle' });
        await vscode.window.showTextDocument(shapeDocument);

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const folderPath = workspaceFolders[0].uri.fsPath;
            const filePath = path.join(folderPath, `${shapeName}.ttl`);
            fs.writeFileSync(filePath, shapeContent);

            const document = await vscode.workspace.openTextDocument(filePath);
            const editor = await vscode.window.showTextDocument(document);

            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(event => {
                if (event.document.uri.fsPath === filePath) {
                    const updatedContent = event.document.getText();
                    fs.writeFileSync(filePath, updatedContent);
                }
            });

            context.subscriptions.push(changeDocumentSubscription);
        }
    });

    context.subscriptions.push(createShapeCommand);

    const validateGraphCommand = vscode.commands.registerCommand('shaclExtension.validateGraph', async () => {
        const shapeDocument = await vscode.window.showOpenDialog({ filters: { 'Turtle Files': ['ttl'] } });
        if (!shapeDocument || shapeDocument.length === 0) {
            return;
        }

        const dataDocument = await vscode.window.showOpenDialog({ filters: { 'Turtle Files': ['ttl'] } });
        if (!dataDocument || dataDocument.length === 0) {
            return;
        }

        const shapeContent = fs.readFileSync(shapeDocument[0].fsPath, 'utf8');
        const dataContent = fs.readFileSync(dataDocument[0].fsPath, 'utf8');

        const shapeGraph = rdf.dataset().import(rdf.parse(shapeContent));
        const dataGraph = rdf.dataset().import(rdf.parse(dataContent));

        const validationReport = await rdf.validate(dataGraph, shapeGraph);

        const validationResult = validationReport.conforms ? 'Validation successful!' : 'Validation failed!';
        vscode.window.showInformationMessage(validationResult);

        if (!validationReport.conforms) {
            const annotations = validationReport.results.map(result => {
                return {
                    range: new vscode.Range(
                        new vscode.Position(result.focusNode.line - 1, result.focusNode.column - 1),
                        new vscode.Position(result.focusNode.line - 1, result.focusNode.column - 1 + result.focusNode.length)
                    ),
                    message: result.message,
                    severity: vscode.DiagnosticSeverity.Error
                };
            });

            const diagnosticCollection = vscode.languages.createDiagnosticCollection('shacl');
            diagnosticCollection.set(dataDocument[0], annotations);
            context.subscriptions.push(diagnosticCollection);
        }
    });

    context.subscriptions.push(validateGraphCommand);

    const showFocusNodesCommand = vscode.commands.registerCommand('shaclExtension.showFocusNodes', async () => {
        const shapeDocument = await vscode.window.showOpenDialog({ filters: { 'Turtle Files': ['ttl'] } });
        if (!shapeDocument || shapeDocument.length === 0) {
            return;
        }

        const shapeContent = fs.readFileSync(shapeDocument[0].fsPath, 'utf8');
        const shapeGraph = rdf.dataset().import(rdf.parse(shapeContent));

        const focusNodes = shapeGraph.match(null, rdf.namedNode('http://www.w3.org/ns/shacl#targetClass')).toArray().map(quad => quad.subject.value);

        vscode.window.showQuickPick(focusNodes, { placeHolder: 'Select a focus node' });
    });

    context.subscriptions.push(showFocusNodesCommand);
}
