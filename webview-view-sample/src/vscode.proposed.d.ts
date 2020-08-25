/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * This is the place for API experiments and proposals.
 * These API are NOT stable and subject to change. They are only available in the Insiders
 * distribution and CANNOT be used in published extensions.
 *
 * To test these API in local environment:
 * - Use Insiders release of VS Code.
 * - Add `"enableProposedApi": true` to your package.json.
 * - Copy this file to your project.
 */

declare module 'vscode' {

	//#region https://github.com/microsoft/vscode/issues/46585

	/**
	 * A webview based view.
	 */
	export interface WebviewView {
		/**
		 * Identifies the type of the webview view, such as `'hexEditor.dataView'`.
		 */
		readonly viewType: string;

		/**
		 * The underlying webview for the view.
		 */
		readonly webview: Webview;

		/**
		 * View title displayed in the UI.
		 *
		 * The view title is initially taken from the extension `package.json` contribution.
		 */
		title?: string;

		/**
		 * Event fired when the view is disposed.
		 *
		 * Views are disposed of in a few cases:
		 *
		 * - When a view is collapsed and `retainContextWhenHidden` has not been set.
		 * - When a view is hidden by a user.
		 *
		 * Trying to use the view after it has been disposed throws an exception.
		 */
		readonly onDidDispose: Event<void>;

		/**
		 * Tracks if the webview is currently visible.
		 *
		 * Views are visible when they are on the screen and expanded.
		 */
		readonly visible: boolean;

		/**
		 * Event fired when the visibility of the view changes
		 */
		readonly onDidChangeVisibility: Event<void>;
	}

	interface WebviewViewResolveContext<T = unknown> {
		/**
		 * Persisted state from the webview content.
		 *
		 * To save resources, VS Code normally deallocates webview views that are not visible. For example, if the user
		 * collapse a view or switching to another top level activity, the underlying webview document is deallocates.
		 *
		 * You can prevent this behavior by setting `retainContextWhenHidden` in the `WebviewOptions`. However this
		 * increases resource usage and should be avoided wherever possible. Instead, you can use persisted state to
		 * save off a webview's state so that it can be quickly recreated as needed.
		 *
		 * To save off a persisted state, inside the webview call `acquireVsCodeApi().setState()` with
		 * any json serializable object. To restore the state again, call `getState()`. For example:
		 *
		 * ```js
		 * // Within the webview
		 * const vscode = acquireVsCodeApi();
		 *
		 * // Get existing state
		 * const oldState = vscode.getState() || { value: 0 };
		 *
		 * // Update state
		 * setState({ value: oldState.value + 1 })
		 * ```
		 *
		 * VS Code ensures that the persisted state is saved correctly when a webview is hidden and across
		 * editor restarts.
		 */
		readonly state: T | undefined;
	}

	/**
	 * Provider for creating `WebviewView` elements.
	 */
	export interface WebviewViewProvider {
		/**
		 * Revolves a webview view.
		 *
		 * `resolveWebviewView` is called when a view first becomes visible. This may happen when the view is
		 * first loaded or when the user hides and then shows a view again.
		 *
		 * @param webviewView Webview panel to restore. The serializer should take ownership of this panel. The
		 *    provider must set the webview's `.html` and hook up all webview events it is interested in.
		 * @param context Additional metadata about the view being resolved.
		 * @param token Cancellation token indicating that the view being provided is no longer needed.
		 *
		 * @return Optional thenable indicating that the view has been fully resolved.
		 */
		resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken): Thenable<void> | void;
	}

	namespace window {
		/**
		 * Register a new provider for webview views.
		 *
		 * @param viewId Unique id of the view. This should match the `id` from the
		 *   `views` contribution in the package.json.
		 * @param provider Provider for the webview views.
		 *
		 * @return Disposable that unregisters the provider.
		 */
		export function registerWebviewViewProvider(viewId: string, provider: WebviewViewProvider, options?: {
			/**
			 * Content settings for the webview created for this view.
			 */
			readonly webviewOptions?: {
				/**
				 * Controls if the webview panel's content (iframe) is kept around even when the panel
				 * is no longer visible.
				 *
				 * Normally the webview's html context is created when the panel becomes visible
				 * and destroyed when it is hidden. Extensions that have complex state
				 * or UI can set the `retainContextWhenHidden` to make VS Code keep the webview
				 * context around, even when the webview moves to a background tab. When a webview using
				 * `retainContextWhenHidden` becomes hidden, its scripts and other dynamic content are suspended.
				 * When the panel becomes visible again, the context is automatically restored
				 * in the exact same state it was in originally. You cannot send messages to a
				 * hidden webview, even with `retainContextWhenHidden` enabled.
				 *
				 * `retainContextWhenHidden` has a high memory overhead and should only be used if
				 * your panel's context cannot be quickly saved and restored.
				 */
				readonly retainContextWhenHidden?: boolean;
			};
		}): Disposable;
	}
	//#endregion
}
