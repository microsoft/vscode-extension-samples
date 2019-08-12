import * as log4js from "log4js";
import { ensureDirSync, readJsonSync } from "fs-extra";
import { resolve } from "path";
import { window } from "vscode";

const pkgJsonPath = resolve(__dirname, "..", "package.json");
const extName = readJsonSync(pkgJsonPath).name;

let isConfigured = false;
let isDisabled = false;
let logger: log4js.Logger;

// The logger's <configure> function must be invoked before any Logging can take place.
export function configure(logPath: string, configLogLevel: string): void {
	// VSCode only guarantees the **parent** dir of the <logPath> to be initialized.
	ensureDirSync(logPath);
	if (configLogLevel === "None") {
		isDisabled = true;
		if (logger) {
			logger.info(`Disabling Logging`);
			log4js.shutdown((logShutdownErr) => {
				if (logShutdownErr) {
					console.error(`unable to shutdown Logger: <${logShutdownErr.message}>`)
				}
				isConfigured = false;
			});
		}
		return;
	}
	// re-configuration flow
	if (logger) {
		// ensure no attempts to log anything before before the logger is re-configured
		isDisabled = true;
		logger.info(`Re-configuring Logging, New Log Level will be: <${configLogLevel}>`);
		log4js.shutdown((logShutdownErr) => {
			if (logShutdownErr) {
				console.error(`unable to shutdown Logger: <${logShutdownErr.message}>`)
			}
			logger = configureLog4js(logPath, configLogLevel);
			isDisabled = false;
			isConfigured = true;
			logger.info(`Beginning Logging, Log Level: <${configLogLevel}>`);
		});
	} else {
		logger = configureLog4js(logPath, configLogLevel);
		isDisabled = false;
		isConfigured = true;
		logger.info(`Beginning Logging, Log Level: <${configLogLevel}>`);
	}
}

/**
 * Will configure Log4js to perform:
 * File logging with rotation.
 * VSCode's outputChannel Logging.
 */
function configureLog4js(logPath: string, configLogLevel: string) {
	const logFile = resolve(logPath, `${extName}.log`);
	const log4jsLogLevel = configToLog4jsLogLevel(configLogLevel);
	const ourExtOutChannel = window.createOutputChannel(extName);

	// See: https://log4js-node.github.io/log4js-node/writing-appenders.html
	// For docs on writing custom log4js appenders.
	const vscodeOutChannelAppender = {
		configure: (config: any, layouts: any) => {
			const vscodeAppender = (loggingEvent: log4js.LoggingEvent) => {
				const layout = layouts.basicLayout;
				ourExtOutChannel.appendLine(layout(loggingEvent, config.timezoneOffset));
			};
			vscodeAppender.shutdown = (done: Function) => {
				ourExtOutChannel.dispose();
				// It is unclear if the `dispose()` method is sync or async
				// It does not return a promise or accepts a callback so it may be sync
				// but channel/stream handling is often a-sync
				// So we will "wait" 10ms just in-case to avoid resource conflicts.
				setTimeout(done, 10);
			};
			return vscodeAppender;
		}
	};

	log4js.configure({
		appenders: {
			vscodeOutChannel: {
				type: vscodeOutChannelAppender
			}
			,
			file: {
				type: 'file',
				filename: logFile,
				// 10 * 1MB -> Avoid consuming too much disk space.
				maxLogSize: 1000000,
				backups: 10
			}
		},
		categories: {
			default: { appenders: ['vscodeOutChannel', 'file'], level: log4jsLogLevel }
		}
	});
	return log4js.getLogger();
}

/**
 * Converts the VSCode extension configuration
 * log Level value to one recognized by log4js
 * Note that this is another element in the **decoupling** of the logger library
 * used from the rest of the extension source code.
 */
function configToLog4jsLogLevel(configLogLevel: string): string {
	switch (configLogLevel) {
		case "Fatal":
		case "Error":
		case "Debug":
		case "Trace":
			return configLogLevel.toLowerCase();
		case "Information":
			return "info";
		case "Warning":
			return "warn";
		default:
			throw Error(`Unrecognized Log Level: <${configLogLevel}>!`);
	}
}

function assertInitialized() {
	if (isConfigured === false) {
		throw Error("<logger.configure> must be called **before** any attempt to actually log anything!");
	}
}

// By exposing our own logging functions we enable decoupling
// between the logger implementation (log4js / Winston / ...) and the extension's logger's API.
// -  Note that this naive implementation assumes that a logging method only accepts a single string argument.
//    Which is not true for all logging libraries...
export function trace(msg: string) {
	if (isDisabled) {
		return; // NOOP
	}
	assertInitialized();
	logger.trace(msg);
}

export function debug(msg: string) {
	if (isDisabled) {
		return; // NOOP
	}
	assertInitialized();
	logger.debug(msg);
}

export function info(msg: string) {
	if (isDisabled) {
		return; // NOOP
	}
	assertInitialized();
	logger.info(msg);
}

export function warn(msg: string) {
	if (isDisabled) {
		return; // NOOP
	}
	assertInitialized();
	logger.warn(msg);
}

export function error(msg: string) {
	if (isDisabled) {
		return; // NOOP
	}
	assertInitialized();
	logger.error(msg);
}

export function fatal(msg: string) {
	if (isDisabled) {
		return; // NOOP
	}
	assertInitialized();
	logger.fatal(msg);
}
