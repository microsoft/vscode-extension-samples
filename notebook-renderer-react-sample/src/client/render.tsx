/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";
import type { RendererContext } from 'vscode-notebook-renderer';

interface IRenderInfo {
  container: HTMLElement;
  mime: string;
  value: GitHubIssuesValue[];
  context: RendererContext<unknown>;
}

interface GitHubIssuesValue {
	title: string;
	url: string;
  body: string;
}

export const IssuesList: React.FC<{info: IRenderInfo}> = ({info}) => {
    return <div><h1>Hello from Create React App</h1><p>I am in a React Component!</p></div>;
};

if (module.hot) {
  module.hot.addDisposeHandler(() => {
    // In development, this will be called before the renderer is reloaded. You
    // can use this to clean up or stash any state.
  });
}
