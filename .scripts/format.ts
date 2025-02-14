import * as fs from 'fs';
import * as glob from 'glob';
import * as ts from 'typescript';

class LanguageServiceHost implements ts.LanguageServiceHost {
	files: ts.MapLike<ts.IScriptSnapshot> = {};
	addFile(fileName: string, text: string) {
		this.files[fileName] = ts.ScriptSnapshot.fromString(text);
	}

	fileExists(path: string): boolean {
		return !!this.files[path];
	}

	readFile(path: string): string | undefined {
		return this.files[path]?.getText(0, this.files[path]!.getLength());
	}

	// for ts.LanguageServiceHost

	getCompilationSettings = () => ts.getDefaultCompilerOptions();
	getScriptFileNames = () => Object.keys(this.files);
	getScriptVersion = (_fileName: string) => '0';
	getScriptSnapshot = (fileName: string) => this.files[fileName];
	getCurrentDirectory = () => process.cwd();
	getDefaultLibFileName = (options: ts.CompilerOptions) => ts.getDefaultLibFilePath(options);
}

const defaults: ts.FormatCodeSettings = {
	baseIndentSize: 0,
	indentSize: 4,
	tabSize: 4,
	indentStyle: ts.IndentStyle.Smart,
	newLineCharacter: '\r\n',
	convertTabsToSpaces: false,
	insertSpaceAfterCommaDelimiter: true,
	insertSpaceAfterSemicolonInForStatements: true,
	insertSpaceBeforeAndAfterBinaryOperators: true,
	insertSpaceAfterConstructor: false,
	insertSpaceAfterKeywordsInControlFlowStatements: true,
	insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
	insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
	insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
	insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
	insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
	insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
	insertSpaceAfterTypeAssertion: false,
	insertSpaceBeforeFunctionParenthesis: false,
	placeOpenBraceOnNewLineForFunctions: false,
	placeOpenBraceOnNewLineForControlBlocks: false,
	insertSpaceBeforeTypeAnnotation: false,
};

function format(fileName: string, text: string) {

	const host = new LanguageServiceHost();
	host.addFile(fileName, text);

	const languageService = ts.createLanguageService(host);
	const edits = languageService.getFormattingEditsForDocument(fileName, { ...defaults });
	edits
		.sort((a, b) => a.span.start - b.span.start)
		.reverse()
		.forEach(edit => {
			const head = text.slice(0, edit.span.start);
			const tail = text.slice(edit.span.start + edit.span.length);
			text = `${head}${edit.newText}${tail}`;
		});

	return text;
}

if (require.main === module) {
	glob.sync(`${__dirname}/../**/*.ts`).forEach((file) => {
		if (file.endsWith('.d.ts') || file.includes('node_modules')) {
			return;
		}

		const out = format(file, fs.readFileSync(file, 'utf8'));
		fs.writeFileSync(file, out);
	});
}