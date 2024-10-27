import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "tabs-api-sample" is now active!');

	/**
	 * You can use proposed API here. `vscode.` should start auto complete
	 * Proposed API as defined in vscode.proposed.<proposalName>.d.ts.
	 */
	const activityMap = new Map<vscode.Tab, number>();

	context.subscriptions.push(vscode.window.tabGroups.onDidChangeTabGroups(() => {
		const tabs = vscode.window.tabGroups.all.map(group => group.tabs).flat(1);
		activityMap.clear();
		// Update activity map saying everything is active
		tabs.forEach(t => activityMap.set(t, Date.now()));
	}));
	context.subscriptions.push(vscode.window.tabGroups.onDidChangeTabs(tabChangeEvent => {
		// If tabs are closed no longer track their activity
		for (const removedTab of tabChangeEvent.closed) {
			activityMap.delete(removedTab);
		}
		// Update activity map last active time on changed tabs
		const changedTabs = [...tabChangeEvent.opened, ...tabChangeEvent.changed];
		for (const tab of changedTabs) {
			// Reset the timer for the tabs last activity
			activityMap.set(tab, Date.now());
		}
	}));
	// Check every second for inactive tabs
	const interval = setInterval(() => {
		const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;
		if (activeTab) {
			// Update the activity map for the active tab, since it's still being used.
			activityMap.set(activeTab, Date.now());
		}
		const inactiveTime = (vscode.workspace.getConfiguration().get<number>('tabs.maxInactiveTime') ?? 30) * 1000;
		// Check if any tabs have been inactive for more than 30 seconds
		const inactiveTabs = Array.from(activityMap.entries()).filter(([tab, lastActive]) => Date.now() - lastActive > inactiveTime && !tab.isActive && !tab.isDirty);
		inactiveTabs.forEach(async ([tab]) => {
			// Close the tab
			await vscode.window.tabGroups.close(tab);
			activityMap.delete(tab);
		});
	}, 1000);

	// Create a small disposable to clean up the interval when extension is deactivated
	context.subscriptions.push({
		dispose: () => {
			clearInterval(interval);
		}
	});
}
