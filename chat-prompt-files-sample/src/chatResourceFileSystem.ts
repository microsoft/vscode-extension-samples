import * as vscode from 'vscode';

/**
 * A virtual file system provider for serving dynamically generated chat resource content.
 * Resources are registered with a URI and content generator function, allowing
 * content to be generated on-demand when VS Code reads the file.
 */
export class ChatResourceFileSystemProvider implements vscode.FileSystemProvider {
	static readonly scheme = 'my-chat-resource';

	private readonly _contentGenerators = new Map<string, () => string>();
	private readonly _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	readonly onDidChangeFile = this._onDidChangeFile.event;

	/**
	 * Register a resource with a content generator function.
	 * @param path The path portion of the URI (e.g., 'agents/workspace-helper.agent.md')
	 * @param contentGenerator A function that generates the content on demand
	 * @returns The full URI for the resource
	 */
	registerResource(path: string, contentGenerator: () => string): vscode.Uri {
		this._contentGenerators.set(path, contentGenerator);
		return vscode.Uri.parse(`${ChatResourceFileSystemProvider.scheme}:/${path}`);
	}

	/**
	 * Notify that a resource has changed, triggering VS Code to re-read the content.
	 * @param path The path of the resource that changed
	 */
	notifyResourceChanged(path: string): void {
		const uri = vscode.Uri.parse(`${ChatResourceFileSystemProvider.scheme}:/${path}`);
		this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
	}

	// FileSystemProvider implementation

	watch(): vscode.Disposable {
		return new vscode.Disposable(() => { });
	}

	stat(uri: vscode.Uri): vscode.FileStat {
		const path = uri.path.substring(1); // Remove leading /
		if (!this._contentGenerators.has(path)) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		return {
			type: vscode.FileType.File,
			ctime: Date.now(),
			mtime: Date.now(),
			size: 0 // Size is not known until content is generated
		};
	}

	readDirectory(): [string, vscode.FileType][] {
		return [];
	}

	createDirectory(): void {
		throw vscode.FileSystemError.NoPermissions('Read-only file system');
	}

	readFile(uri: vscode.Uri): Uint8Array {
		const path = uri.path.substring(1); // Remove leading /
		const generator = this._contentGenerators.get(path);
		if (!generator) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		const content = generator();
		return new TextEncoder().encode(content);
	}

	writeFile(): void {
		throw vscode.FileSystemError.NoPermissions('Read-only file system');
	}

	delete(): void {
		throw vscode.FileSystemError.NoPermissions('Read-only file system');
	}

	rename(): void {
		throw vscode.FileSystemError.NoPermissions('Read-only file system');
	}
}

// Singleton instance
let _instance: ChatResourceFileSystemProvider | undefined;

/**
 * Get the singleton ChatResourceFileSystemProvider instance.
 * Creates and registers it if it doesn't exist.
 */
export function getChatResourceFileSystem(context: vscode.ExtensionContext): ChatResourceFileSystemProvider {
	if (!_instance) {
		_instance = new ChatResourceFileSystemProvider();
		context.subscriptions.push(
			vscode.workspace.registerFileSystemProvider(
				ChatResourceFileSystemProvider.scheme,
				_instance,
				{ isReadonly: true }
			)
		);
	}
	return _instance;
}
