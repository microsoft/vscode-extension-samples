import * as l10n from '@vscode/l10n';

if (process.env['EXTENSION_BUNDLE_PATH']) {
	l10n.config({
		fsPath: process.env['EXTENSION_BUNDLE_PATH']
	});
}

const message = l10n.t('Hello {0}', 'CLI');
console.log(message + '\n');
