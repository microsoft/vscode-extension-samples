import * as l10n from '@vscode/l10n';

if (process.env['EXTENSION_BUNDLE_URI']) {
	l10n.config({
		uri: process.env['EXTENSION_BUNDLE_URI']
	});
}

const message = l10n.t('Hello {0}', 'CLI');
console.log(message + '\n');
