// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('decorator sample is activated');

	// create a decorator type that we use to decorate small numbers
	var smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
	});

	// create a decorator type that we use to decorate large numbers
	var largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		backgroundColor: 'rgba(255,0,0,0.3)'
	});

	var activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	var timeout = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		var regEx = /\d+/g;
		var text = activeEditor.document.getText();
		var smallNumbers: vscode.DecorationOptions[] = [];
		var largeNumbers: vscode.DecorationOptions[] = [];
		var match;
		while (match = regEx.exec(text)) {
			var startPos = activeEditor.document.positionAt(match.index);
			var endPos = activeEditor.document.positionAt(match.index + match[0].length);
			var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
			if (match[0].length < 3) {
				smallNumbers.push(decoration);
			} else {
				largeNumbers.push(decoration);
			}


		}
		activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
		activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
	}
}

