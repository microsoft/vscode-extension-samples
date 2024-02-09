// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CancellationToken } from 'vscode';

declare module '@vscode/jupyter-extension' {
    /**
     * Represents a Jupyter Kernel.
     */
    export interface Kernel {
        /**
         * Executes code specific to chat in the Python kernel without affecting the execution count & execution history.
         * Supports the ability to handle messages from the kernel.
         *
         * @param code Code to be executed.
         * @param handlers Callbacks for handling messages from the kernel.
         * @param token Triggers the cancellation of the execution.
         * @returns Async iterable of outputs, that completes when the execution is complete.
         */
        executeChatCode(
            code: string,
            handlers: Record<string, (...data: any[]) => Promise<any>>,
            token: CancellationToken
        ): AsyncIterable<Output>;
    }
}
