# README
## This is the README for the "languageprovider-sample" 
-------------------

This folder contains a sample VS code extension that demonstrates an extension that runs a language server

The extension observes all 'plaintext' documents (documents from all editors not associated with a language)
and uses the server to provide validation and completion proposals.

The code for the extension is in the 'client' folder. It uses the 'vscode-languageclient' node module to launch the language server.

The language server is located in the 'server' folder. 


# How to run locally
* `npm install` to initialize the extension and the server
* `npm run compile` to compile the extension and the server
* open this folder in VS Code. In the Debug viewlet, run 'Launch Client & Server' from drop-down to launch the extension and attach to both the extension and the server.
* create a file `foo.bar`, and type `typescript`. You should see a validation error.
* set breakpoints in the server or the client