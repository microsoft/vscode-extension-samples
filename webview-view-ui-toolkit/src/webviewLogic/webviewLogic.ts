
import { provideVSCodeDesignSystem, vsCodeButton, Button } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton());

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {

  const howdyButton = document.getElementById("howdy") as Button;
  howdyButton?.addEventListener("click", handleHowdyClick);
}

function handleHowdyClick() {
  vscode.postMessage({
    command: "hello",
    text: "Hey there! We welcome you to explore Simple View-WebView with VS Code Extension UI Toolkit design 🤠.",
  });
}
