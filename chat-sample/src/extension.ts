import * as vscode from 'vscode';

const PARTICIPANT_ID = 'chat-sample.tools';

export function activate(context: vscode.ExtensionContext) {

    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
        const models = await vscode.lm.selectChatModels({
            vendor: 'copilot',
            family: 'gpt-4-turbo'
        });

        const chat = models[0];

        if (!chat) {
            console.log('NO MODELS')
            return {};
        }

        stream.markdown(`Available tools: ${vscode.lm.tools.map(tool => tool.id).join(', ')}\n\n`);

        const options: vscode.LanguageModelChatRequestOptions = {
            tools: vscode.lm.tools.map((tool): vscode.LanguageModelChatFunction => {
                return {
                    name: tool.id.replace(/\./g, '_'),
                    description: tool.description,
                    parametersSchema: tool.parametersSchema ?? {}
                }
            }),
            justification: 'Just because!',
        }

        const messages = [
            vscode.LanguageModelChatMessage.User(`There is a selection of tools that may give helpful context to answer the user's query. If you aren't sure which tool is relevant, you can call multiple tools.`),
            vscode.LanguageModelChatMessage.User(request.prompt)
        ];
        const runWithFunctions = async () => {

            let didReceiveFunctionUse = false;

            const response = await chat.sendRequest(messages, options, token);

            for await (const part of response.stream) {
                if (part instanceof vscode.LanguageModelChatResponseTextPart) {
                    stream.markdown(part.value)
                } else if (part instanceof vscode.LanguageModelChatResponseFunctionUsePart) {
                    const tool = vscode.lm.tools.find(tool => tool.id.replace(/\./g, '_') === part.name);
                    if (!tool) {
                        // BAD tool choice?
                        continue;
                    }

                    const resultPromise = vscode.lm.invokeTool(tool.id, JSON.parse(part.parameters), token);
                    stream.progress(`FUNCTION_CALL: ${tool.id} with \`${part.parameters}\``, async (progress) => {
                        await resultPromise;
                    });

                    const result = await resultPromise;

                    // NOTE that the result of calling a function is a special content type of a USER-message
                    let message = vscode.LanguageModelChatMessage.User('');
                    message.content2 = new vscode.LanguageModelChatMessageFunctionResultPart(tool.id, result)
                    messages.push(message)

                    // IMPORTANT 
                    // IMPORTANT working around CAPI always wanting to end with a `User`-message
                    // IMPORTANT 
                    messages.push(vscode.LanguageModelChatMessage.User(`Above is the result of calling the function ${tool.id}. The user cannot see this result, so you should explain it to the user if referencing it in your answer.`))
                    didReceiveFunctionUse = true;
                }
            }

            if (didReceiveFunctionUse) {
                // RE-enter
                return runWithFunctions();
            }
        };

        await runWithFunctions()
    };

    const toolUser = vscode.chat.createChatParticipant(PARTICIPANT_ID, handler);
    toolUser.iconPath = new vscode.ThemeIcon('tools');
}


export function deactivate() { }
