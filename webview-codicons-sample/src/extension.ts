import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('catCodicons.show', () => {
			CatCodiconsPanel.show(context.extensionUri);
		})
	);
}


class CatCodiconsPanel {

	public static readonly viewType = 'catCodicons';

	public static show(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		const panel = vscode.window.createWebviewPanel(
			CatCodiconsPanel.viewType,
			"Cat Codicons",
			column || vscode.ViewColumn.One
		);

		panel.webview.html = this._getHtmlForWebview(panel.webview, extensionUri);
	}

	private static _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {

		// Get resource paths
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));
		const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading specific resources in the webview
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource};">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Cat Coding</title>

				<link href="${styleUri}" rel="stylesheet" />
				<link href="${codiconsUri}" rel="stylesheet" />
			</head>
			<body>
				<h1>codicons</h1>
				<div id="icons">
					<div class="icon"><i class="codicon codicon-account"></i> account</div>
					<div class="icon"><i class="codicon codicon-activate-breakpoints"></i> activate-breakpoints</div>
					<div class="icon"><i class="codicon codicon-add"></i> add</div>
					<div class="icon"><i class="codicon codicon-archive"></i> archive</div>
					<div class="icon"><i class="codicon codicon-arrow-both"></i> arrow-both</div>
					<div class="icon"><i class="codicon codicon-arrow-down"></i> arrow-down</div>
					<div class="icon"><i class="codicon codicon-arrow-left"></i> arrow-left</div>
					<div class="icon"><i class="codicon codicon-arrow-right"></i> arrow-right</div>
					<div class="icon"><i class="codicon codicon-arrow-small-down"></i> arrow-small-down</div>
					<div class="icon"><i class="codicon codicon-arrow-small-left"></i> arrow-small-left</div>
					<div class="icon"><i class="codicon codicon-arrow-small-right"></i> arrow-small-right</div>
					<div class="icon"><i class="codicon codicon-arrow-small-up"></i> arrow-small-up</div>
					<div class="icon"><i class="codicon codicon-arrow-up"></i> arrow-up</div>
					<div class="icon"><i class="codicon codicon-beaker"></i> beaker</div>
					<div class="icon"><i class="codicon codicon-bell-dot"></i> bell-dot</div>
					<div class="icon"><i class="codicon codicon-bell"></i> bell</div>
					<div class="icon"><i class="codicon codicon-bold"></i> bold</div>
					<div class="icon"><i class="codicon codicon-book"></i> book</div>
					<div class="icon"><i class="codicon codicon-bookmark"></i> bookmark</div>
					<div class="icon"><i class="codicon codicon-briefcase"></i> briefcase</div>
					<div class="icon"><i class="codicon codicon-broadcast"></i> broadcast</div>
					<div class="icon"><i class="codicon codicon-browser"></i> browser</div>
					<div class="icon"><i class="codicon codicon-bug"></i> bug</div>
					<div class="icon"><i class="codicon codicon-calendar"></i> calendar</div>
					<div class="icon"><i class="codicon codicon-call-incoming"></i> call-incoming</div>
					<div class="icon"><i class="codicon codicon-call-outgoing"></i> call-outgoing</div>
					<div class="icon"><i class="codicon codicon-case-sensitive"></i> case-sensitive</div>
					<div class="icon"><i class="codicon codicon-check"></i> check</div>
					<div class="icon"><i class="codicon codicon-checklist"></i> checklist</div>
					<div class="icon"><i class="codicon codicon-chevron-down"></i> chevron-down</div>
					<div class="icon"><i class="codicon codicon-chevron-left"></i> chevron-left</div>
					<div class="icon"><i class="codicon codicon-chevron-right"></i> chevron-right</div>
					<div class="icon"><i class="codicon codicon-chevron-up"></i> chevron-up</div>
					<div class="icon"><i class="codicon codicon-chrome-close"></i> chrome-close</div>
					<div class="icon"><i class="codicon codicon-chrome-maximize"></i> chrome-maximize</div>
					<div class="icon"><i class="codicon codicon-chrome-minimize"></i> chrome-minimize</div>
					<div class="icon"><i class="codicon codicon-chrome-restore"></i> chrome-restore</div>
					<div class="icon"><i class="codicon codicon-circle-filled"></i> circle-filled</div>
					<div class="icon"><i class="codicon codicon-circle-outline"></i> circle-outline</div>
					<div class="icon"><i class="codicon codicon-circle-slash"></i> circle-slash</div>
					<div class="icon"><i class="codicon codicon-circuit-board"></i> circuit-board</div>
					<div class="icon"><i class="codicon codicon-clear-all"></i> clear-all</div>
					<div class="icon"><i class="codicon codicon-clippy"></i> clippy</div>
					<div class="icon"><i class="codicon codicon-close-all"></i> close-all</div>
					<div class="icon"><i class="codicon codicon-close"></i> close</div>
					<div class="icon"><i class="codicon codicon-cloud-download"></i> cloud-download</div>
					<div class="icon"><i class="codicon codicon-cloud-upload"></i> cloud-upload</div>
					<div class="icon"><i class="codicon codicon-cloud"></i> cloud</div>
					<div class="icon"><i class="codicon codicon-code"></i> code</div>
					<div class="icon"><i class="codicon codicon-collapse-all"></i> collapse-all</div>
					<div class="icon"><i class="codicon codicon-color-mode"></i> color-mode</div>
					<div class="icon"><i class="codicon codicon-comment-discussion"></i> comment-discussion</div>
					<div class="icon"><i class="codicon codicon-comment"></i> comment</div>
					<div class="icon"><i class="codicon codicon-credit-card"></i> credit-card</div>
					<div class="icon"><i class="codicon codicon-dash"></i> dash</div>
					<div class="icon"><i class="codicon codicon-dashboard"></i> dashboard</div>
					<div class="icon"><i class="codicon codicon-database"></i> database</div>
					<div class="icon"><i class="codicon codicon-debug-alt-small"></i> debug-alt-small</div>
					<div class="icon"><i class="codicon codicon-debug-alt"></i> debug-alt</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-conditional-unverified"></i> debug-breakpoint-conditional-unverified</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-conditional"></i> debug-breakpoint-conditional</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-data-unverified"></i> debug-breakpoint-data-unverified</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-data"></i> debug-breakpoint-data</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-function-unverified"></i> debug-breakpoint-function-unverified</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-function"></i> debug-breakpoint-function</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-log-unverified"></i> debug-breakpoint-log-unverified</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-log"></i> debug-breakpoint-log</div>
					<div class="icon"><i class="codicon codicon-debug-breakpoint-unsupported"></i> debug-breakpoint-unsupported</div>
					<div class="icon"><i class="codicon codicon-debug-console"></i> debug-console</div>
					<div class="icon"><i class="codicon codicon-debug-continue"></i> debug-continue</div>
					<div class="icon"><i class="codicon codicon-debug-disconnect"></i> debug-disconnect</div>
					<div class="icon"><i class="codicon codicon-debug-pause"></i> debug-pause</div>
					<div class="icon"><i class="codicon codicon-debug-restart-frame"></i> debug-restart-frame</div>
					<div class="icon"><i class="codicon codicon-debug-restart"></i> debug-restart</div>
					<div class="icon"><i class="codicon codicon-debug-reverse-continue"></i> debug-reverse-continue</div>
					<div class="icon"><i class="codicon codicon-debug-stackframe-active"></i> debug-stackframe-active</div>
					<div class="icon"><i class="codicon codicon-debug-stackframe-dot"></i> debug-stackframe-dot</div>
					<div class="icon"><i class="codicon codicon-debug-stackframe"></i> debug-stackframe</div>
					<div class="icon"><i class="codicon codicon-debug-start"></i> debug-start</div>
					<div class="icon"><i class="codicon codicon-debug-step-back"></i> debug-step-back</div>
					<div class="icon"><i class="codicon codicon-debug-step-into"></i> debug-step-into</div>
					<div class="icon"><i class="codicon codicon-debug-step-out"></i> debug-step-out</div>
					<div class="icon"><i class="codicon codicon-debug-step-over"></i> debug-step-over</div>
					<div class="icon"><i class="codicon codicon-debug-stop"></i> debug-stop</div>
					<div class="icon"><i class="codicon codicon-debug"></i> debug</div>
					<div class="icon"><i class="codicon codicon-desktop-download"></i> desktop-download</div>
					<div class="icon"><i class="codicon codicon-device-camera-video"></i> device-camera-video</div>
					<div class="icon"><i class="codicon codicon-device-camera"></i> device-camera</div>
					<div class="icon"><i class="codicon codicon-device-mobile"></i> device-mobile</div>
					<div class="icon"><i class="codicon codicon-diff-added"></i> diff-added</div>
					<div class="icon"><i class="codicon codicon-diff-ignored"></i> diff-ignored</div>
					<div class="icon"><i class="codicon codicon-diff-modified"></i> diff-modified</div>
					<div class="icon"><i class="codicon codicon-diff-removed"></i> diff-removed</div>
					<div class="icon"><i class="codicon codicon-diff-renamed"></i> diff-renamed</div>
					<div class="icon"><i class="codicon codicon-diff"></i> diff</div>
					<div class="icon"><i class="codicon codicon-discard"></i> discard</div>
					<div class="icon"><i class="codicon codicon-edit"></i> edit</div>
					<div class="icon"><i class="codicon codicon-editor-layout"></i> editor-layout</div>
					<div class="icon"><i class="codicon codicon-ellipsis"></i> ellipsis</div>
					<div class="icon"><i class="codicon codicon-empty-window"></i> empty-window</div>
					<div class="icon"><i class="codicon codicon-error"></i> error</div>
					<div class="icon"><i class="codicon codicon-exclude"></i> exclude</div>
					<div class="icon"><i class="codicon codicon-expand-all"></i> expand-all</div>
					<div class="icon"><i class="codicon codicon-extensions"></i> extensions</div>
					<div class="icon"><i class="codicon codicon-eye-closed"></i> eye-closed</div>
					<div class="icon"><i class="codicon codicon-eye"></i> eye</div>
					<div class="icon"><i class="codicon codicon-feedback"></i> feedback</div>
					<div class="icon"><i class="codicon codicon-file-binary"></i> file-binary</div>
					<div class="icon"><i class="codicon codicon-file-code"></i> file-code</div>
					<div class="icon"><i class="codicon codicon-file-media"></i> file-media</div>
					<div class="icon"><i class="codicon codicon-file-pdf"></i> file-pdf</div>
					<div class="icon"><i class="codicon codicon-file-submodule"></i> file-submodule</div>
					<div class="icon"><i class="codicon codicon-file-symlink-directory"></i> file-symlink-directory</div>
					<div class="icon"><i class="codicon codicon-file-symlink-file"></i> file-symlink-file</div>
					<div class="icon"><i class="codicon codicon-file-zip"></i> file-zip</div>
					<div class="icon"><i class="codicon codicon-file"></i> file</div>
					<div class="icon"><i class="codicon codicon-files"></i> files</div>
					<div class="icon"><i class="codicon codicon-filter"></i> filter</div>
					<div class="icon"><i class="codicon codicon-flame"></i> flame</div>
					<div class="icon"><i class="codicon codicon-fold-down"></i> fold-down</div>
					<div class="icon"><i class="codicon codicon-fold-up"></i> fold-up</div>
					<div class="icon"><i class="codicon codicon-fold"></i> fold</div>
					<div class="icon"><i class="codicon codicon-folder-active"></i> folder-active</div>
					<div class="icon"><i class="codicon codicon-folder-opened"></i> folder-opened</div>
					<div class="icon"><i class="codicon codicon-folder"></i> folder</div>
					<div class="icon"><i class="codicon codicon-gear"></i> gear</div>
					<div class="icon"><i class="codicon codicon-gift"></i> gift</div>
					<div class="icon"><i class="codicon codicon-gist-secret"></i> gist-secret</div>
					<div class="icon"><i class="codicon codicon-gist"></i> gist</div>
					<div class="icon"><i class="codicon codicon-git-commit"></i> git-commit</div>
					<div class="icon"><i class="codicon codicon-git-compare"></i> git-compare</div>
					<div class="icon"><i class="codicon codicon-git-merge"></i> git-merge</div>
					<div class="icon"><i class="codicon codicon-git-pull-request"></i> git-pull-request</div>
					<div class="icon"><i class="codicon codicon-github-action"></i> github-action</div>
					<div class="icon"><i class="codicon codicon-github-alt"></i> github-alt</div>
					<div class="icon"><i class="codicon codicon-github-inverted"></i> github-inverted</div>
					<div class="icon"><i class="codicon codicon-github"></i> github</div>
					<div class="icon"><i class="codicon codicon-globe"></i> globe</div>
					<div class="icon"><i class="codicon codicon-go-to-file"></i> go-to-file</div>
					<div class="icon"><i class="codicon codicon-grabber"></i> grabber</div>
					<div class="icon"><i class="codicon codicon-graph"></i> graph</div>
					<div class="icon"><i class="codicon codicon-gripper"></i> gripper</div>
					<div class="icon"><i class="codicon codicon-group-by-ref-type"></i> group-by-ref-type</div>
					<div class="icon"><i class="codicon codicon-heart"></i> heart</div>
					<div class="icon"><i class="codicon codicon-history"></i> history</div>
					<div class="icon"><i class="codicon codicon-home"></i> home</div>
					<div class="icon"><i class="codicon codicon-horizontal-rule"></i> horizontal-rule</div>
					<div class="icon"><i class="codicon codicon-hubot"></i> hubot</div>
					<div class="icon"><i class="codicon codicon-inbox"></i> inbox</div>
					<div class="icon"><i class="codicon codicon-info"></i> info</div>
					<div class="icon"><i class="codicon codicon-issue-closed"></i> issue-closed</div>
					<div class="icon"><i class="codicon codicon-issue-reopened"></i> issue-reopened</div>
					<div class="icon"><i class="codicon codicon-issues"></i> issues</div>
					<div class="icon"><i class="codicon codicon-italic"></i> italic</div>
					<div class="icon"><i class="codicon codicon-jersey"></i> jersey</div>
					<div class="icon"><i class="codicon codicon-json"></i> json</div>
					<div class="icon"><i class="codicon codicon-kebab-vertical"></i> kebab-vertical</div>
					<div class="icon"><i class="codicon codicon-key"></i> key</div>
					<div class="icon"><i class="codicon codicon-law"></i> law</div>
					<div class="icon"><i class="codicon codicon-library"></i> library</div>
					<div class="icon"><i class="codicon codicon-lightbulb-autofix"></i> lightbulb-autofix</div>
					<div class="icon"><i class="codicon codicon-lightbulb"></i> lightbulb</div>
					<div class="icon"><i class="codicon codicon-link-external"></i> link-external</div>
					<div class="icon"><i class="codicon codicon-link"></i> link</div>
					<div class="icon"><i class="codicon codicon-list-filter"></i> list-filter</div>
					<div class="icon"><i class="codicon codicon-list-flat"></i> list-flat</div>
					<div class="icon"><i class="codicon codicon-list-ordered"></i> list-ordered</div>
					<div class="icon"><i class="codicon codicon-list-selection"></i> list-selection</div>
					<div class="icon"><i class="codicon codicon-list-tree"></i> list-tree</div>
					<div class="icon"><i class="codicon codicon-list-unordered"></i> list-unordered</div>
					<div class="icon"><i class="codicon codicon-live-share"></i> live-share</div>
					<div class="icon"><i class="codicon codicon-loading"></i> loading</div>
					<div class="icon"><i class="codicon codicon-location"></i> location</div>
					<div class="icon"><i class="codicon codicon-lock"></i> lock</div>
					<div class="icon"><i class="codicon codicon-mail-read"></i> mail-read</div>
					<div class="icon"><i class="codicon codicon-mail"></i> mail</div>
					<div class="icon"><i class="codicon codicon-markdown"></i> markdown</div>
					<div class="icon"><i class="codicon codicon-megaphone"></i> megaphone</div>
					<div class="icon"><i class="codicon codicon-mention"></i> mention</div>
					<div class="icon"><i class="codicon codicon-menu"></i> menu</div>
					<div class="icon"><i class="codicon codicon-merge"></i> merge</div>
					<div class="icon"><i class="codicon codicon-milestone"></i> milestone</div>
					<div class="icon"><i class="codicon codicon-mirror"></i> mirror</div>
					<div class="icon"><i class="codicon codicon-mortar-board"></i> mortar-board</div>
					<div class="icon"><i class="codicon codicon-move"></i> move</div>
					<div class="icon"><i class="codicon codicon-multiple-windows"></i> multiple-windows</div>
					<div class="icon"><i class="codicon codicon-mute"></i> mute</div>
					<div class="icon"><i class="codicon codicon-new-file"></i> new-file</div>
					<div class="icon"><i class="codicon codicon-new-folder"></i> new-folder</div>
					<div class="icon"><i class="codicon codicon-no-newline"></i> no-newline</div>
					<div class="icon"><i class="codicon codicon-note"></i> note</div>
					<div class="icon"><i class="codicon codicon-octoface"></i> octoface</div>
					<div class="icon"><i class="codicon codicon-open-preview"></i> open-preview</div>
					<div class="icon"><i class="codicon codicon-organization"></i> organization</div>
					<div class="icon"><i class="codicon codicon-output"></i> output</div>
					<div class="icon"><i class="codicon codicon-package"></i> package</div>
					<div class="icon"><i class="codicon codicon-paintcan"></i> paintcan</div>
					<div class="icon"><i class="codicon codicon-pass"></i> pass</div>
					<div class="icon"><i class="codicon codicon-person"></i> person</div>
					<div class="icon"><i class="codicon codicon-pin"></i> pin</div>
					<div class="icon"><i class="codicon codicon-pinned"></i> pinned</div>
					<div class="icon"><i class="codicon codicon-play-circle"></i> play-circle</div>
					<div class="icon"><i class="codicon codicon-play"></i> play</div>
					<div class="icon"><i class="codicon codicon-plug"></i> plug</div>
					<div class="icon"><i class="codicon codicon-preserve-case"></i> preserve-case</div>
					<div class="icon"><i class="codicon codicon-preview"></i> preview</div>
					<div class="icon"><i class="codicon codicon-primitive-square"></i> primitive-square</div>
					<div class="icon"><i class="codicon codicon-project"></i> project</div>
					<div class="icon"><i class="codicon codicon-pulse"></i> pulse</div>
					<div class="icon"><i class="codicon codicon-question"></i> question</div>
					<div class="icon"><i class="codicon codicon-quote"></i> quote</div>
					<div class="icon"><i class="codicon codicon-radio-tower"></i> radio-tower</div>
					<div class="icon"><i class="codicon codicon-reactions"></i> reactions</div>
					<div class="icon"><i class="codicon codicon-record-keys"></i> record-keys</div>
					<div class="icon"><i class="codicon codicon-record"></i> record</div>
					<div class="icon"><i class="codicon codicon-references"></i> references</div>
					<div class="icon"><i class="codicon codicon-refresh"></i> refresh</div>
					<div class="icon"><i class="codicon codicon-regex"></i> regex</div>
					<div class="icon"><i class="codicon codicon-remote-explorer"></i> remote-explorer</div>
					<div class="icon"><i class="codicon codicon-remote"></i> remote</div>
					<div class="icon"><i class="codicon codicon-remove"></i> remove</div>
					<div class="icon"><i class="codicon codicon-replace-all"></i> replace-all</div>
					<div class="icon"><i class="codicon codicon-replace"></i> replace</div>
					<div class="icon"><i class="codicon codicon-reply"></i> reply</div>
					<div class="icon"><i class="codicon codicon-repo-clone"></i> repo-clone</div>
					<div class="icon"><i class="codicon codicon-repo-force-push"></i> repo-force-push</div>
					<div class="icon"><i class="codicon codicon-repo-forked"></i> repo-forked</div>
					<div class="icon"><i class="codicon codicon-repo-pull"></i> repo-pull</div>
					<div class="icon"><i class="codicon codicon-repo-push"></i> repo-push</div>
					<div class="icon"><i class="codicon codicon-repo"></i> repo</div>
					<div class="icon"><i class="codicon codicon-report"></i> report</div>
					<div class="icon"><i class="codicon codicon-request-changes"></i> request-changes</div>
					<div class="icon"><i class="codicon codicon-rocket"></i> rocket</div>
					<div class="icon"><i class="codicon codicon-root-folder-opened"></i> root-folder-opened</div>
					<div class="icon"><i class="codicon codicon-root-folder"></i> root-folder</div>
					<div class="icon"><i class="codicon codicon-rss"></i> rss</div>
					<div class="icon"><i class="codicon codicon-ruby"></i> ruby</div>
					<div class="icon"><i class="codicon codicon-run-all"></i> run-all</div>
					<div class="icon"><i class="codicon codicon-save-all"></i> save-all</div>
					<div class="icon"><i class="codicon codicon-save-as"></i> save-as</div>
					<div class="icon"><i class="codicon codicon-save"></i> save</div>
					<div class="icon"><i class="codicon codicon-screen-full"></i> screen-full</div>
					<div class="icon"><i class="codicon codicon-screen-normal"></i> screen-normal</div>
					<div class="icon"><i class="codicon codicon-search-stop"></i> search-stop</div>
					<div class="icon"><i class="codicon codicon-search"></i> search</div>
					<div class="icon"><i class="codicon codicon-server-environment"></i> server-environment</div>
					<div class="icon"><i class="codicon codicon-server-process"></i> server-process</div>
					<div class="icon"><i class="codicon codicon-server"></i> server</div>
					<div class="icon"><i class="codicon codicon-settings-gear"></i> settings-gear</div>
					<div class="icon"><i class="codicon codicon-settings"></i> settings</div>
					<div class="icon"><i class="codicon codicon-shield"></i> shield</div>
					<div class="icon"><i class="codicon codicon-sign-in"></i> sign-in</div>
					<div class="icon"><i class="codicon codicon-sign-out"></i> sign-out</div>
					<div class="icon"><i class="codicon codicon-smiley"></i> smiley</div>
					<div class="icon"><i class="codicon codicon-sort-precedence"></i> sort-precedence</div>
					<div class="icon"><i class="codicon codicon-source-control"></i> source-control</div>
					<div class="icon"><i class="codicon codicon-split-horizontal"></i> split-horizontal</div>
					<div class="icon"><i class="codicon codicon-split-vertical"></i> split-vertical</div>
					<div class="icon"><i class="codicon codicon-squirrel"></i> squirrel</div>
					<div class="icon"><i class="codicon codicon-star-empty"></i> star-empty</div>
					<div class="icon"><i class="codicon codicon-star-full"></i> star-full</div>
					<div class="icon"><i class="codicon codicon-star-half"></i> star-half</div>
					<div class="icon"><i class="codicon codicon-stop-circle"></i> stop-circle</div>
					<div class="icon"><i class="codicon codicon-symbol-array"></i> symbol-array</div>
					<div class="icon"><i class="codicon codicon-symbol-boolean"></i> symbol-boolean</div>
					<div class="icon"><i class="codicon codicon-symbol-class"></i> symbol-class</div>
					<div class="icon"><i class="codicon codicon-symbol-color"></i> symbol-color</div>
					<div class="icon"><i class="codicon codicon-symbol-constant"></i> symbol-constant</div>
					<div class="icon"><i class="codicon codicon-symbol-enum-member"></i> symbol-enum-member</div>
					<div class="icon"><i class="codicon codicon-symbol-enum"></i> symbol-enum</div>
					<div class="icon"><i class="codicon codicon-symbol-event"></i> symbol-event</div>
					<div class="icon"><i class="codicon codicon-symbol-field"></i> symbol-field</div>
					<div class="icon"><i class="codicon codicon-symbol-file"></i> symbol-file</div>
					<div class="icon"><i class="codicon codicon-symbol-interface"></i> symbol-interface</div>
					<div class="icon"><i class="codicon codicon-symbol-key"></i> symbol-key</div>
					<div class="icon"><i class="codicon codicon-symbol-keyword"></i> symbol-keyword</div>
					<div class="icon"><i class="codicon codicon-symbol-method"></i> symbol-method</div>
					<div class="icon"><i class="codicon codicon-symbol-misc"></i> symbol-misc</div>
					<div class="icon"><i class="codicon codicon-symbol-namespace"></i> symbol-namespace</div>
					<div class="icon"><i class="codicon codicon-symbol-numeric"></i> symbol-numeric</div>
					<div class="icon"><i class="codicon codicon-symbol-operator"></i> symbol-operator</div>
					<div class="icon"><i class="codicon codicon-symbol-parameter"></i> symbol-parameter</div>
					<div class="icon"><i class="codicon codicon-symbol-property"></i> symbol-property</div>
					<div class="icon"><i class="codicon codicon-symbol-ruler"></i> symbol-ruler</div>
					<div class="icon"><i class="codicon codicon-symbol-snippet"></i> symbol-snippet</div>
					<div class="icon"><i class="codicon codicon-symbol-string"></i> symbol-string</div>
					<div class="icon"><i class="codicon codicon-symbol-structure"></i> symbol-structure</div>
					<div class="icon"><i class="codicon codicon-symbol-variable"></i> symbol-variable</div>
					<div class="icon"><i class="codicon codicon-sync-ignored"></i> sync-ignored</div>
					<div class="icon"><i class="codicon codicon-sync"></i> sync</div>
					<div class="icon"><i class="codicon codicon-tag"></i> tag</div>
					<div class="icon"><i class="codicon codicon-tasklist"></i> tasklist</div>
					<div class="icon"><i class="codicon codicon-telescope"></i> telescope</div>
					<div class="icon"><i class="codicon codicon-terminal"></i> terminal</div>
					<div class="icon"><i class="codicon codicon-text-size"></i> text-size</div>
					<div class="icon"><i class="codicon codicon-three-bars"></i> three-bars</div>
					<div class="icon"><i class="codicon codicon-thumbsdown"></i> thumbsdown</div>
					<div class="icon"><i class="codicon codicon-thumbsup"></i> thumbsup</div>
					<div class="icon"><i class="codicon codicon-tools"></i> tools</div>
					<div class="icon"><i class="codicon codicon-trash"></i> trash</div>
					<div class="icon"><i class="codicon codicon-triangle-down"></i> triangle-down</div>
					<div class="icon"><i class="codicon codicon-triangle-left"></i> triangle-left</div>
					<div class="icon"><i class="codicon codicon-triangle-right"></i> triangle-right</div>
					<div class="icon"><i class="codicon codicon-triangle-up"></i> triangle-up</div>
					<div class="icon"><i class="codicon codicon-twitter"></i> twitter</div>
					<div class="icon"><i class="codicon codicon-unfold"></i> unfold</div>
					<div class="icon"><i class="codicon codicon-ungroup-by-ref-type"></i> ungroup-by-ref-type</div>
					<div class="icon"><i class="codicon codicon-unlock"></i> unlock</div>
					<div class="icon"><i class="codicon codicon-unmute"></i> unmute</div>
					<div class="icon"><i class="codicon codicon-unverified"></i> unverified</div>
					<div class="icon"><i class="codicon codicon-verified"></i> verified</div>
					<div class="icon"><i class="codicon codicon-versions"></i> versions</div>
					<div class="icon"><i class="codicon codicon-vm-active"></i> vm-active</div>
					<div class="icon"><i class="codicon codicon-vm-connect"></i> vm-connect</div>
					<div class="icon"><i class="codicon codicon-vm-outline"></i> vm-outline</div>
					<div class="icon"><i class="codicon codicon-vm-running"></i> vm-running</div>
					<div class="icon"><i class="codicon codicon-vm"></i> vm</div>
					<div class="icon"><i class="codicon codicon-warning"></i> warning</div>
					<div class="icon"><i class="codicon codicon-watch"></i> watch</div>
					<div class="icon"><i class="codicon codicon-whitespace"></i> whitespace</div>
					<div class="icon"><i class="codicon codicon-whole-word"></i> whole-word</div>
					<div class="icon"><i class="codicon codicon-window"></i> window</div>
					<div class="icon"><i class="codicon codicon-word-wrap"></i> word-wrap</div>
					<div class="icon"><i class="codicon codicon-zoom-in"></i> zoom-in</div>
					<div class="icon"><i class="codicon codicon-zoom-out"></i> zoom-out</div>
				</div>
			</body>
			</html>`;
	}
}

