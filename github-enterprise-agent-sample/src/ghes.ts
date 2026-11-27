import * as vscode from 'vscode';
import * as Octokit from '@octokit/rest';

const GITHUB_COM = 'https://github.com';
const GITHUB_COM_PROVIDER_ID = 'github';
// Provider id registered by VS Code's built-in GitHub Enterprise support,
// which is enabled by setting `github-enterprise.uri`.
const GHES_PROVIDER_ID = 'github.enterprise';
// The GitHub authentication providers accept the scopes described here:
// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/understanding-scopes-for-oauth-apps
const SCOPES = ['user:email', 'read:org'];

/**
 * GitHub / GitHub Enterprise connection shared by the desktop and the web
 * extension host. Uses VS Code's built-in authentication providers, so no
 * token handling is done by the extension itself.
 */
export class GitHubService implements vscode.Disposable {
	private octokit: Octokit.Octokit | undefined;
	private readonly disposables: vscode.Disposable[] = [];

	constructor(private readonly context: vscode.ExtensionContext) { }

	async initialize(): Promise<void> {
		// Sessions change when a user logs in or logs out.
		this.disposables.push(vscode.authentication.onDidChangeSessions(async e => {
			if (e.provider.id === this.providerId) {
				this.octokit = undefined;
			}
		}));
	}

	get host(): string {
		const host = vscode.workspace.getConfiguration('githubEnterpriseAgent').get<string>('host', GITHUB_COM);
		return host.replace(/\/+$/, '');
	}

	get providerId(): string {
		return this.host === GITHUB_COM ? GITHUB_COM_PROVIDER_ID : GHES_PROVIDER_ID;
	}

	// GitHub Enterprise Server serves its REST API under https://<host>/api/v3
	get apiBaseUrl(): string | undefined {
		return this.host === GITHUB_COM ? undefined : `${this.host}/api/v3`;
	}

	async getOctokit(createIfNone = false): Promise<Octokit.Octokit | undefined> {
		if (this.octokit) {
			return this.octokit;
		}

		let session: vscode.AuthenticationSession | undefined;
		try {
			// By passing the `createIfNone` flag, a numbered badge will show up on the
			// accounts activity bar icon, allowing quietly prompting the user to sign in.
			session = await vscode.authentication.getSession(this.providerId, SCOPES, { createIfNone });
		} catch (err) {
			// The `github.enterprise` provider only exists once `github-enterprise.uri` is set.
			if (this.providerId === GHES_PROVIDER_ID) {
				throw new Error(
					`No GitHub Enterprise authentication provider found. Set "github-enterprise.uri" to "${this.host}" and reload the window.`,
					{ cause: err as Error }
				);
			}
			throw err;
		}

		if (!session) {
			return undefined;
		}

		this.octokit = new Octokit.Octokit({
			auth: session.accessToken,
			baseUrl: this.apiBaseUrl
		});
		return this.octokit;
	}

	async getOctokitOrThrow(): Promise<Octokit.Octokit> {
		const octokit = await this.getOctokit(true);
		if (!octokit) {
			throw new Error(`Not signed in to ${this.host}.`);
		}
		return octokit;
	}

	dispose(): void {
		for (const disposable of this.disposables) {
			disposable.dispose();
		}
	}
}
