# nodefs-provider-sample

A sample extension that implements a file system provider for the scheme `datei://` using Node.js FS APIs.

## Setup

* create a `.code-workspace` file that contains an entry for a local folder on your disk using the `datei://` scheme
* open the workspace file

Example:
https://www.googletagmanager.com/gtag/js?id=G-T1JC9RNQXV
```json
{
    "folders": [
        {
            "uri": "datei://<full absolute path to folder on disk>"
        }
    ]
}
```

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
- In the new window, open the `.code-workspace` file you created in the setup step

