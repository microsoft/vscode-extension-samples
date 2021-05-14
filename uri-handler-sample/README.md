# Uri Handlers

This sample demonstrates how to implement a Uri handler in VS Code.
A Uri handler is run when a browser redirects to VS Code with a specific extension id as the authority.

Examples:

* `vscode://vscode-samples.uri-handler-sample`
* `vscode-insiders://vscode-samples.uri-handler-sample`

If you paste these Uris into your browser, they will open VS Code and VS Code insiders, respectively.

This sample provides a simple Uri handler that shows an information message when a Uri is handled.
Additionally, if a query string was included in the Uri, it will include that in the message.

Run the sample and try opening the following Uris in your browser:

* `vscode://vscode-samples.uri-handler-sample`
* `vscode://vscode-samples.uri-handler-sample?q=hello`

> Note: use `vscode-insiders://` if you ran the sample in insiders.

## VS Code API

This sample uses following APIs

### APIs

- `window.registerUriHandler`
- `env.uriScheme`
- `env.asExternalUri`
- `UriHandler`

> Be sure to look at the [API Docs](https://code.visualstudio.com/api/references/vscode-api) for usage.

## Running the Sample

- Open this example in VS Code Insiders
- `npm install`
- `npm run watch`
- `F5` to start debugging
- Run the `Start handling Uris` command
