# Semantic tokens sample

This is an extension sample showing a very simple semantic tokens provider. This semantic tokens provider always returns all the tokens in a file.

For more background on semantic highlighting read [here](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide)

![Screenshot](demo.png)

## How to run

Launch the extension and open the file `sample/sample.semanticLanguage` and use the following settings:

```jsonc
"editor.semanticTokenColorCustomizations": {
	"enabled": true, // enable for all themes
	"rules": {
		"*.static": {
			"foreground": "#ff0000",
			"fontStyle": "bold"
		},
		"type": {
			"foreground": "#00aa00"
		}
	}
}
```
