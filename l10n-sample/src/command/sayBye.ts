/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { l10n, window } from 'vscode';

export function sayByeCommand() {
	const message = l10n.t('Bye');
	window.showInformationMessage(message);
}
