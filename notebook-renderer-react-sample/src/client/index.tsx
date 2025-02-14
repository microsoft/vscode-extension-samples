import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';

import errorOverlay from 'vscode-notebook-error-overlay';
import type { ActivationFunction } from 'vscode-notebook-renderer';
import { IssuesList } from './render';

// ----------------------------------------------------------------------------
// This is the entrypoint to the notebook renderer's webview client-side code.
// This contains some boilerplate that calls the `render()` function when new
// output is available. You probably don't need to change this code; put your
// rendering logic inside of the `render()` function.
// ----------------------------------------------------------------------------

export const activate: ActivationFunction = context => {
	return {
		renderOutputItem(outputItem, element) {
			let shadow = element.shadowRoot;
			if (!shadow) {
				shadow = element.attachShadow({ mode: 'open' });
				const root = document.createElement('div');
				root.id = 'root';
				shadow.append(root);
			}

			const root = shadow.querySelector<HTMLElement>('#root');
			if (!root) {
				throw new Error('Could not find root element');
			}

			errorOverlay.wrap(root, () => {
				root.innerHTML = '';
				const node = document.createElement('div');
				root.appendChild(node);

				ReactDOM.render(<IssuesList info={{ container: node, mime: outputItem.mime, value: outputItem.json(), context }} />, root);
			});
		},
		disposeOutputItem(_outputId) {
			// Do any teardown here. outputId is the cell output being deleted, or
			// undefined if we're clearing all outputs.
		}
	};
};
