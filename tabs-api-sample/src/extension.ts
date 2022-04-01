import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "tabs-api-sample" is now active!');

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */
	const activityMap: Map<vscode.Tab, number> = new Map();
	const disposables: vscode.Disposable[] = [];

	disposables.push(vscode.window.tabGroups.onDidChangeTabGroups(() => {
		const tabs = vscode.window.tabGroups.groups.map(group => group.tabs).flat(1);
		activityMap.clear();
		// Update activity map saying everything is active
		tabs.forEach(t => activityMap.set(t, Date.now()));
	}));
	disposables.push(vscode.window.tabGroups.onDidChangeTabs(tabs => {
		for (const tab of tabs) {
			// Reset the timer for the tabs last activity
			activityMap.set(tab, Date.now());
		}
	}));
	// Check every second for inactive tabs
	setInterval(() => {
		const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
		if (activeTab) {
			// Update the activity map for the active tab, since it's still being used.
			activityMap.set(activeTab, Date.now());
		}
		const inactiveTime = (vscode.workspace.getConfiguration().get<number>('tabs.maxInactiveTime') ?? 30) * 1000;
		// Check if any tabs have been inactive for more than 30 seconds
		const inactiveTabs = Array.from(activityMap.entries()).filter(([tab, lastActive]) => Date.now() - lastActive > inactiveTime && vscode.window.tabGroups.activeTabGroup.activeTab !== tab && !tab.isDirty);
		inactiveTabs.forEach(async ([tab]) => {
			// Close the tab
			await vscode.window.tabGroups.close(tab);
			activityMap.delete(tab);
		});
	}, 1000);
	disposables.forEach(d => context.subscriptions.push(d));
}
