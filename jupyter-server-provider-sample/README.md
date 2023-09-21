# jupyter-servedr-provider-sample

This is a very simple extension sample demonstrating the use of the Jupyter Extension API allowing other extensions to contribute [Jupyter](https://jupyter.org/) Servers via the Kernel Picker for Jupyter notebooks:

- The sample extension finds Jupyter Servers running locally on the current machine
- This list of servers is then provided to the Jupyter extension via the Jupyter Extension API
- Upon opening a notebook and selecting a kernel the option `Local JupyterLab Servers...` will display the above servers.
- From there, the user can select a kernel and run code in the notebook against one of the local kernels.

## Running this sample

 1. `cd jupyter-server-provider-sample`
 1. `code .`: Open the folder in VS Code
 1. Hit `F5` to build+debug
 1. Select the kernel Picker for a notebook and select the option `Local JupyterLab Servers...`
 1. To see servers show up in this list, start Jupyter Lab or Jupyter Notebook outside VS Code or from within the integrated terminal (e.g. [jupyter lab](https://jupyterlab.readthedocs.io/en/stable/getting_started/starting.html))
