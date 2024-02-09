import * as vscode from 'vscode';

const MEOW_COMMAND_ID = 'cat.meow';

interface ICatChatAgentResult extends vscode.ChatAgentResult2 {
	subCommand: string;
    result: string;
}

export function activate(context: vscode.ExtensionContext) {

    // Define a Cat chat agent handler. 
    const handler: vscode.ChatAgentHandler = async (request: vscode.ChatAgentRequest, context: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentProgress>, token: vscode.CancellationToken): Promise<ICatChatAgentResult> => {
        // To talk to an LLM in your subcommand handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The GitHub Copilot Chat extension implements this provider.
        if (request.subCommand == 'maintenance') {
            const access = await vscode.chat.requestLanguageModelAccess('copilot');            
            new Date().toISOString();
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
					content: `This is how you configure a maintenance window: 
                    {
                        "name": "Maintenance Window",
                        "tags": [
                          "production"
                        ],
                        "startsAt": "2022-08-24",
                        "endsAt": "2022-08-25",
                        "repeatInterval": null,
                        "repeatUnit": "DAY",
                        "repeatEndsAt": "null"
                      }
                      the current time is ${new Date().toISOString()}.
                      please generate one based of the provided information and respond with a json formatted code snippet.
                      `
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: request.prompt
                },
            ];
            const chatRequest = access.makeRequest(messages, {}, token);
            let response  = ""
            for await (const fragment of chatRequest.stream) {
                response += fragment;
                progress.report({ content: fragment });
            }
			return { subCommand: 'maintenance', result: response };
        } else if (request.subCommand == 'mac') {
            const access = await vscode.chat.requestLanguageModelAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
					content: `The user wants you to create code snippets. For a file name f.ex. "homepage.spec.ts" respond with a formatted code snippet. To generate it, use the following template but replace homepage.spec.ts with the file name the user provided:
"
new BrowserCheck('homepage-browser-check', {
  name: 'Home page',
  alertChannels,
  group: websiteGroup,
  code: {
    entrypoint: path.join(__dirname, 'homepage.spec.ts')
  },
})"
It is also possible to provide more than filename, each of them should get a separate new BrowserCheck(...). 
Suggest also to add the following imports before the check definitions: 
import * as path from 'path'
import { BrowserCheck } from 'checkly/constructs'
import { smsChannel, emailChannel } from '../alert-channels'
import { websiteGroup } from './website-group.check'

const alertChannels = [smsChannel, emailChannel]



                    `
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: "here is the user request, find the file name and generate the snippet:"+ request.prompt
                }
            ];
            const chatRequest = access.makeRequest(messages, {}, token);
            for await (const fragment of chatRequest.stream) {
                progress.report({ content: fragment });
            }
			return { subCommand: 'mac', result:'' };
        } else {
			const access = await vscode.chat.requestLanguageModelAccess('copilot');
			const messages = [
				{
					role: vscode.ChatMessageRole.System,
					content: "You are a friendly assistant for customers of Checkly. Checkly is a synthetic monitoring platform that lets people build website monitoring with MS Playwright and define API monitoring checks. All with Javascript."
				},
				{
					role: vscode.ChatMessageRole.User,
					content: request.prompt
				}
			];
			const chatRequest = access.makeRequest(messages, {}, token);
			for await (const fragment of chatRequest.stream) {
				progress.report({ content: fragment });
			}
			
			return { subCommand: '', result: ''};
		}
    };
    
    // Agents appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const agent = vscode.chat.createChatAgent('checkly', handler);
    agent.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
    agent.description = vscode.l10n.t('Lets Monitor your website or service!');
	agent.fullName = vscode.l10n.t('Checkly');
    agent.subCommandProvider = {
        provideSubCommands(token) {
            return [
                { name: 'maintenance', description: 'Quickly set up a maintenance window. Just provide a time.' },
                { name: 'mac', description: 'Give me the file name(s) of your playwright test scripts, so I can setup a mac template.' }
            ];
        }
    };

    agent.followupProvider = {
		provideFollowups(result: ICatChatAgentResult, token: vscode.CancellationToken) {
            if (result.subCommand === 'maintenance') {
                return [{
                    commandId: MEOW_COMMAND_ID,
                    args: [result, "dd"],
                    message: '@checkly thank you',
                    title: vscode.l10n.t('Create on Checkly')
                }];
            } else if (result.subCommand === 'play') {
                return [{
                    message: '@cat let us play',
                    title: vscode.l10n.t('Play with the cat')
                }];
            }
        }
    };

    context.subscriptions.push(
        agent,
        // Register the command handler for the /meow followup
        vscode.commands.registerCommand(MEOW_COMMAND_ID, async (r) => {
            let windowConfig = r.result
            const regex = /```\s*json([\s|\S]+)```/m
            const matches = r.result.match(regex)
            if (matches){
                windowConfig = matches[1]
            }
            console.log(windowConfig)
            const response = await fetch("https://api.checklyhq.com/v1/maintenance-windows", {
                    "headers": {
                                    "accept": "application/json",
                                    "content-type": "application/json",
                                    "x-checkly-account": "04fec768-8ac4-4a9c-ae72-5522045772f5",
                                    "Authorization": "Bearer token"

                                },
                                "body": windowConfig,
                                "method": "POST"
                                });
            
            if (response.status>299){
                vscode.window.showErrorMessage('Failed to create maintenance window. Reason: '+response.statusText);
                return
            }
                                
            vscode.window.showInformationMessage('Maintenance window created.');
        }),
    );
}

export function deactivate() { }
