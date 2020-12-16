# Test Provider Sample

This sample demonstrates usage of the Test Provider API. It looks for tests as additions in `.md` files, with heading as groups, for example:

```
# Easy Math

2 + 2 = 4 // this test will pass
2 + 2 = 5 // this test will fail

# Harder Math

230230 + 5819123 = 6049353
```

## VS Code API

todo

## Running the Sample

- Run `npm install` in terminal to install dependencies
- Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
- Create a `test.md` file containing the given content
