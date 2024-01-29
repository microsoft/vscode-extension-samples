# Jupyter Server Provider Sample

This is a very simple extension sample demonstrating the use of the Jupyter Extension API allowing other extensions to execute code against Jupyter Kernels.

- The sample lists finds kernels associated with notebooks that are currently open in the workspace.
- The sample the filters the kernels by language, focusing on Python kernels.
- Upon selecting a Python kernel, code selected by the user is executed against the selected kernel
- The output is displayed in an output panel.
- The sample demonstrates the ability to retrieve outputs of various mime types, including streamed output.

## Running this sample

 1. `cd jupyter-kernel-execution-sample`
 1. `code .`: Open the folder in VS Code
 1. Run `npm install` in terminal to install the dependencies
 1. Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
 1. Open a Jupyter Notebook and select a Python kernel and execute some code.
 1. Select the command `Jupyter Kernel API: Execute code against a Python Kernel`
 1. Select the a Kernel and then select the Code to execute.
 1. Watch the output panel for outputs returned by the kernel.

### Notes:

1. Make use of the `language` property of the kernel to ensure the language of the code matches the kernel.
2. `getKernel` API can can return `undefined` if the user does not grant the extension access to the kernel.
3. Access to kernels for each extension is managed via the command `Manage Access To Jupyter Kernels`.
