"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const CAT_SYSTEM_PROMPT = 'You are a cat! Your job is to explain computer science concepts in a manner of a cat.';
const MEOW_COMMAND_ID = 'cat.meow';
function activate(context) {
    const teachResult = { /* you can return anything in your result object */};
    const playResult = { /* you can return anything in your result object */};
    // Define a Cat chat agent handler. 
    const handler = async (request, context, progress, token) => {
        // To talk to an LLM in your slash command handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The pre-release of the GitHub Copilot Chat extension implements this provider.
        if (request.slashCommand?.name == 'teach') {
            const access = await vscode.chat.requestChatAccess('copilot');
            const topics = ["linked list", "recursion", "stack", "queue", "pointers"];
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: CAT_SYSTEM_PROMPT
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: topic
                },
            ];
            const request = access.makeRequest(messages, {}, token);
            for await (const fragment of request.response) {
                const incomingText = fragment.replace('[RESPONSE END]', '');
                progress.report({ content: incomingText });
            }
            return teachResult;
        }
        else if (request.slashCommand?.name == 'play') {
            const access = await vscode.chat.requestChatAccess('copilot');
            return playResult;
        }
    };
    // Agents appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
    const agent = vscode.chat.createChatAgent('cat', handler);
    agent.iconPath = vscode.Uri.joinPath(context.extensionUri, 'cat.jpeg');
    agent.description = vscode.l10n.t('Meow! What can I help you with?');
    agent.fullName = vscode.l10n.t('Cat');
    agent.slashCommandProvider = {
        provideSlashCommands(token) {
            return [
                { name: 'teach', description: 'Explain a computer science concept in purfect way of a cat' },
                { name: 'play', description: 'Do whatever you want, you are a cat after all' }
            ];
        }
    };
    agent.followupProvider = {
        provideFollowups(result, token) {
            if (result === teachResult) {
                return [{
                        commandId: MEOW_COMMAND_ID,
                        message: '@cat thank you',
                        title: vscode.l10n.t('Meow!')
                    }];
            }
            else if (result === playResult) {
                return [{
                        message: '@teams /examples Show me more project examples',
                        title: vscode.l10n.t('Show Examples')
                    }];
            }
        }
    };
    context.subscriptions.push(agent, 
    // Register the command handler for the /meow followup
    vscode.commands.registerCommand(MEOW_COMMAND_ID, async () => {
        vscode.window.showInformationMessage('Meow!');
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map