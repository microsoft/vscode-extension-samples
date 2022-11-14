/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { l10n, window } from 'vscode';

export function sayByeCommand() {
	const message = l10n.t('Bye');
	window.showInformationMessage(message);
	const message2 = l10n.t({
		message: 'Bye {0}',
		args: ['Joey'],
		comment: ['{0} is a person\'s name']
	});
	window.showInformationMessage(message2);
}
