// We've set up this sample using CSS modules, which lets you import class
// names into JavaScript: https://github.com/css-modules/css-modules
// You can configure or change this in the webpack.config.js file.
import * as style from './style.css';
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

// This function is called to render your contents.
export function render({ container, value }: IRenderInfo) {
	// Format the JSON and insert it as <pre><code>{ ... }</code></pre>
	// Replace this with your custom code!
	const pre = document.createElement('pre');
	pre.classList.add(style.json);

	// Create a simple table with issue titles and links
	const table = document.createElement('table');
	table.className = 'issues-list';
	const headerRow = document.createElement('tr');
	const tableHeaders = ['Issue', 'Description'];

	tableHeaders.forEach(label => {
		const header = document.createElement('th');
		header.textContent = label;
		headerRow.appendChild(header);
	});

	table.appendChild(headerRow);

	value.forEach(item => {
		const row = document.createElement('tr');

		const title = document.createElement('td');
		const link = document.createElement('a');
		link.href = item.url;
		link.textContent = item.title;
		title.appendChild(link);
		row.appendChild(title);

		const body = document.createElement('td');
		body.textContent = item.body;
		row.appendChild(body);

		table.appendChild(row);
	});

	pre.appendChild(table);
	container.appendChild(pre);
}

