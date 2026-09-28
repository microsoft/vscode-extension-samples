import * as assert from 'assert';
import * as vscode from 'vscode';

const fixtureName = 'sample-demo.txt';
const extensionId = 'vscode-samples.diagnostic-collection-sample';

suite('Diagnostic Collection Sample', () => {
	let document: vscode.TextDocument;

	suiteSetup(async () => {
		await vscode.extensions.getExtension(extensionId)?.activate();
		document = await vscode.workspace.openTextDocument(vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, fixtureName));
		await vscode.window.showTextDocument(document);
		await waitForDiagnostics(document, 3);
	});

	suiteTeardown(async () => {
		await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor');
	});

	test('reports diagnostics with the expected severity and metadata', () => {
		const diagnostics = vscode.languages.getDiagnostics(document.uri);

		assert.deepStrictEqual(diagnostics.map(diagnostic => diagnostic.severity), [
			vscode.DiagnosticSeverity.Error,
			vscode.DiagnosticSeverity.Warning,
			vscode.DiagnosticSeverity.Information,
		]);
		assert.deepStrictEqual(diagnostics.map(diagnostic => diagnostic.code), ['DEMO_ERROR', 'DEMO_WARNING', 'DEMO_INFO']);
		assert.deepStrictEqual(diagnostics.map(diagnostic => diagnostic.message), [
			'This is an error diagnostic.',
			'This is a warning diagnostic.',
			'This is an informational diagnostic.',
		]);
	});

	test('updates, clears, and rescans diagnostics', async () => {
		const infoDiagnostic = vscode.languages.getDiagnostics(document.uri).find(diagnostic => diagnostic.code === 'DEMO_INFO');
		assert.ok(infoDiagnostic);

		const edit = new vscode.WorkspaceEdit();
		const line = infoDiagnostic.range.start.line;
		edit.replace(document.uri, new vscode.Range(line, 0, line, document.lineAt(line).text.length), 'INFO: Changed diagnostic.');
		await vscode.workspace.applyEdit(edit);
		await waitForDiagnostics(document, 3, diagnostics => diagnostics.some(diagnostic => diagnostic.code === 'DEMO_INFO' && diagnostic.message === 'Changed diagnostic.'));

		await vscode.commands.executeCommand('diagnosticCollectionSample.clear');
		await waitForDiagnostics(document, 0);

		await vscode.commands.executeCommand('diagnosticCollectionSample.scan');
		await waitForDiagnostics(document, 3);
	});

});

async function waitForDiagnostics(
	document: vscode.TextDocument,
	count: number,
	predicate: (diagnostics: readonly vscode.Diagnostic[]) => boolean = diagnostics => diagnostics.length === count
): Promise<void> {
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		const diagnostics = vscode.languages.getDiagnostics(document.uri);
		if (predicate(diagnostics)) {
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}

	const diagnostics = vscode.languages.getDiagnostics(document.uri);
	assert.ok(predicate(diagnostics), `Diagnostics did not match the expected state: ${diagnostics.length}`);
}