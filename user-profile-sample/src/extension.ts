import * as vscode from 'vscode';

// Interface for user profile
interface UserProfile {
	name: string;
	email: string;
	role?: string;
}

/**
 * VARIATION 1: In-Memory Storage
 * Simplest approach - data exists only during the extension's lifetime
 * Data is lost when VS Code is restarted
 */
class InMemoryProfileManager {
	private profile: UserProfile | null = null;

	setProfile(profile: UserProfile): void {
		this.profile = profile;
	}

	getProfile(): UserProfile | null {
		return this.profile;
	}
}

/**
 * VARIATION 2: Workspace State Storage
 * Data persists per workspace
 * Different workspaces can have different profiles
 */
class WorkspaceProfileManager {
	private static readonly PROFILE_KEY = 'userProfile';

	constructor(private workspaceState: vscode.Memento) {}

	async setProfile(profile: UserProfile): Promise<void> {
		await this.workspaceState.update(WorkspaceProfileManager.PROFILE_KEY, profile);
	}

	getProfile(): UserProfile | null {
		return this.workspaceState.get<UserProfile>(WorkspaceProfileManager.PROFILE_KEY) || null;
	}
}

/**
 * VARIATION 3: Global State Storage with Settings Integration
 * Data persists globally across all workspaces
 * Integrates with VS Code settings for default values
 */
class GlobalProfileManager {
	private static readonly PROFILE_KEY = 'userProfile';

	constructor(private globalState: vscode.Memento) {}

	async setProfile(profile: UserProfile): Promise<void> {
		await this.globalState.update(GlobalProfileManager.PROFILE_KEY, profile);
	}

	getProfile(): UserProfile | null {
		const profile = this.globalState.get<UserProfile>(GlobalProfileManager.PROFILE_KEY);
		
		if (profile) {
			return profile;
		}

		// Fallback to default values from settings
		const config = vscode.workspace.getConfiguration('userProfile');
		const defaultName = config.get<string>('defaultName', 'Guest');
		const defaultEmail = config.get<string>('defaultEmail', 'guest@example.com');

		return {
			name: defaultName,
			email: defaultEmail,
			role: 'Default User'
		};
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('User Profile Sample extension is now active!');

	// Initialize all three variations
	const inMemoryManager = new InMemoryProfileManager();
	const workspaceManager = new WorkspaceProfileManager(context.workspaceState);
	const globalManager = new GlobalProfileManager(context.globalState);

	// VARIATION 1 Commands: In-Memory
	context.subscriptions.push(
		vscode.commands.registerCommand('userProfile.variation1.set', async () => {
			const name = await vscode.window.showInputBox({
				prompt: 'Enter your name',
				placeHolder: 'John Doe'
			});

			if (!name) {
				return;
			}

			const email = await vscode.window.showInputBox({
				prompt: 'Enter your email',
				placeHolder: 'john.doe@example.com'
			});

			if (!email) {
				return;
			}

			inMemoryManager.setProfile({ name, email });
			vscode.window.showInformationMessage(
				`Profile saved (In-Memory). Note: This will be lost when VS Code restarts.`
			);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('userProfile.variation1.show', () => {
			const profile = inMemoryManager.getProfile();
			if (profile) {
				vscode.window.showInformationMessage(
					`In-Memory Profile: ${profile.name} (${profile.email})`
				);
			} else {
				vscode.window.showWarningMessage('No profile set for Variation 1');
			}
		})
	);

	// VARIATION 2 Commands: Workspace State
	context.subscriptions.push(
		vscode.commands.registerCommand('userProfile.variation2.set', async () => {
			const name = await vscode.window.showInputBox({
				prompt: 'Enter your name',
				placeHolder: 'John Doe'
			});

			if (!name) {
				return;
			}

			const email = await vscode.window.showInputBox({
				prompt: 'Enter your email',
				placeHolder: 'john.doe@example.com'
			});

			if (!email) {
				return;
			}

			await workspaceManager.setProfile({ name, email });
			vscode.window.showInformationMessage(
				`Profile saved (Workspace State). This persists per workspace.`
			);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('userProfile.variation2.show', () => {
			const profile = workspaceManager.getProfile();
			if (profile) {
				vscode.window.showInformationMessage(
					`Workspace Profile: ${profile.name} (${profile.email})`
				);
			} else {
				vscode.window.showWarningMessage('No profile set for Variation 2');
			}
		})
	);

	// VARIATION 3 Commands: Global State with Settings
	context.subscriptions.push(
		vscode.commands.registerCommand('userProfile.variation3.set', async () => {
			const name = await vscode.window.showInputBox({
				prompt: 'Enter your name',
				placeHolder: 'John Doe'
			});

			if (!name) {
				return;
			}

			const email = await vscode.window.showInputBox({
				prompt: 'Enter your email',
				placeHolder: 'john.doe@example.com'
			});

			if (!email) {
				return;
			}

			const role = await vscode.window.showInputBox({
				prompt: 'Enter your role (optional)',
				placeHolder: 'Developer'
			});

			await globalManager.setProfile({ name, email, role: role || 'User' });
			vscode.window.showInformationMessage(
				`Profile saved (Global State). This persists across all workspaces.`
			);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('userProfile.variation3.show', () => {
			const profile = globalManager.getProfile();
			if (profile) {
				const roleText = profile.role ? ` - ${profile.role}` : '';
				vscode.window.showInformationMessage(
					`Global Profile: ${profile.name} (${profile.email})${roleText}`
				);
			} else {
				vscode.window.showWarningMessage('No profile set for Variation 3');
			}
		})
	);
}

export function deactivate() {}
