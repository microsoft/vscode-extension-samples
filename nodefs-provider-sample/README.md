# nodefs-provider-sample

A sample extension that implements a file system provider for the scheme `datei://` using node.js FS APIs. 

## Setup

* create a `.code-workspace` file that contains an entry for a local folder on your disk using the `datei://` scheme
* open the workspace file

Example:

```json
{
    "folders": [
        {
            "uri": "datei://<full absolute path to folder on disk>"
        }
    ]
}
```