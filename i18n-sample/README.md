# README
## This is the README for the "i18n-sample" 
-------------------

This folder contains a sample VS code extension that shows how to use the
package.nls.json and vscode-nls library for localization. For this sample, it
shows two commands: Hello and Bye.

The text for the commands are defined in the top-level package.nls.json (for
English) and package.nls.ja.json (for Japanese). This is how you would localize
your text in the package.json file.

The actual text that is shown by the invocation of the commands are in
`src/extension.ts` and `src/command/sayBye.ts`. It shows how to use `nls.config`
and `nls.loadMessageBundle`.

# How to run locally

Localization values are only applied in the VSIX package.

1. Run `npm install` to bring in the dependencies.
1. Follow the steps at
   https://code.visualstudio.com/docs/extensions/publish-extension to ensure
   that you have installed vsce and have a publisher account. 
1. Run `vsce package` to produce a .vsix file.
1. Install the .vsix file following the instructions at
   https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix
1. Change your locale to Japanese by invoking "Configure Language" from the Command Palette.

# History

## 0.0.1:

Manually transform the calls to localize to illustrate explicitly what is going
on.