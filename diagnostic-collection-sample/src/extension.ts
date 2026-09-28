import * as vscode from 'vscode';
import * as path from 'path';

const demoFileName = 'diagnostic-test.txt';
const markerPattern = /\b(ERROR|WARNING|INFO):\s*(.*)$/;

export function activate(context: vscode.ExtensionContext): void {
	const collection = vscode.languages.createDiagnosticCollection('diagnosticCollectionSample');
	const output = vscode.window.createOutputChannel('Diagnostic Collection Sample');

	function updateDiagnostics(document: vscode.TextDocument): void {
		if (!isDemoDocument(document)) {
			return;
		}

		const diagnostics: vscode.Diagnostic[] = [];
		for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
			const line = document.lineAt(lineNumber);
			const match = markerPattern.exec(line.text);
			if (!match) {
				continue;
			}

			const marker = match[1];
			const severity = marker === 'ERROR'
				? vscode.DiagnosticSeverity.Error
				: marker === 'WARNING'
					? vscode.DiagnosticSeverity.Warning
					: vscode.DiagnosticSeverity.Information;
			const range = new vscode.Range(
				lineNumber,
				match.index,
				lineNumber,
				match.index + match[0].length
			);
			const diagnostic = new vscode.Diagnostic(range, match[2] || `${marker} marker`, severity);
			diagnostic.code = `DEMO_${marker}`;
			diagnostic.source = 'Diagnostic Collection Sample';
			diagnostics.push(diagnostic);
		}

		collection.set(document.uri, diagnostics);
	}

	context.subscriptions.push(
		collection,
		output,
		vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
		vscode.workspace.onDidChangeTextDocument(event => updateDiagnostics(event.document)),
		vscode.workspace.onDidCloseTextDocument(document => {
			if (isDemoDocument(document)) {
				collection.delete(document.uri);
			}
		}),
		vscode.commands.registerCommand('diagnosticCollectionSample.scan', () => {
			const document = vscode.window.activeTextEditor?.document;
			if (!document || !isDemoDocument(document)) {
				void vscode.window.showWarningMessage(`Open ${demoFileName} to scan it.`);
				return;
			}
			updateDiagnostics(document);
		}),
		vscode.commands.registerCommand('diagnosticCollectionSample.clear', () => collection.clear()),
		vscode.commands.registerCommand('diagnosticCollectionSample.inspect', () => {
			const activeUri = vscode.window.activeTextEditor?.document.uri;
			const activeDiagnostics = activeUri ? collection.get(activeUri) : undefined;
			const lines = [
				activeUri
					? `Active document has diagnostics: ${collection.has(activeUri)} (${activeDiagnostics?.length ?? 0})`
					: 'No active document'
			];

			collection.forEach((uri, diagnostics) => {
				lines.push(`${uri.fsPath}: ${diagnostics.length} diagnostic(s)`);
			});

			output.clear();
			output.appendLine(lines.join('\n'));
			output.show();
		})
	);

	for (const document of vscode.workspace.textDocuments) {
		updateDiagnostics(document);
	}
}

function isDemoDocument(document: vscode.TextDocument): boolean {
	return document.uri.scheme === 'file' && path.basename(document.uri.fsPath) === demoFileName;
}
