/* eslint-disable @typescript-eslint/no-explicit-any */
import * as util from 'util';
import { exec as execCallback } from 'child_process';
import * as vscode from 'vscode';

const exec = util.promisify(execCallback);

interface SimulatorDevice {
	name: string;
	udid: string;
	state: string;
}

export async function listSimulators(): Promise<SimulatorDevice[]> {
	try {
		const { stdout } = await exec('xcrun simctl list devices available --json');
		const result = JSON.parse(stdout);
		const devices: SimulatorDevice[] = [];

		// Parse the devices from all runtimes
		Object.values(result.devices).forEach((runtime: any) => {
			(runtime as any[]).forEach(device => {
				if (device.state === 'Booted' || device.state === 'Shutdown') {
					devices.push({
						name: device.name,
						udid: device.udid,
						state: device.state
					});
				}
			});
		});

		return devices;
	} catch (error) {
		console.error('Failed to list simulators:', error);
		return [];
	}
}

export async function captureScreenshot(udid: string): Promise<Uint8Array | undefined> {
	try {
		// Ensure the simulator is booted
		const devices = await listSimulators();
		const device = devices.find(d => d.udid === udid);

		if (!device) {
			throw new Error(`No simulator found with UDID ${udid}`);
		}

		if (device.state !== 'Booted') {
			await exec(`xcrun simctl boot ${udid}`);
			// Wait a moment for the simulator to fully boot
			await new Promise(resolve => setTimeout(resolve, 5000));
		}

		// Create a temporary file for the screenshot
		const tempDir = vscode.Uri.joinPath(vscode.Uri.file(process.env.TMPDIR || '/tmp'), 'vscode-simulator-capture');
		const tempFile = vscode.Uri.joinPath(tempDir, `${udid}.png`);

		// Ensure temp directory exists
		await vscode.workspace.fs.createDirectory(tempDir);

		// Capture the screenshot
		await exec(`xcrun simctl io ${udid} screenshot ${tempFile.fsPath}`);

		// Read the file
		const imageData = await vscode.workspace.fs.readFile(tempFile);

		// Clean up
		await vscode.workspace.fs.delete(tempFile);

		return imageData;
	} catch (error) {
		console.error('Failed to capture screenshot:', error);
		return undefined;
	}
}
