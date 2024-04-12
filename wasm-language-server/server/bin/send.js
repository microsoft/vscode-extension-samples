const ContentLength = 'Content-Length: ';
const CRLF = '\r\n';

const parts = [
	'{"jsonrpc": "2.0", "method": "initialize", "id": 1, "params": {"capabilities": {}}}',
	'{"jsonrpc": "2.0", "method": "initialized", "params": {}}',
	'{"jsonrpc": "2.0", "method": "textDocument/definition", "id": 2, "params": {"textDocument": {"uri": "file://temp"}, "position": {"line": 1, "character": 1}}}'
];

process.stdin.on('data', (data) => {
	const content = data.toString();
	process.stderr.write(content);
});

setTimeout(() => {
	for (let item of parts) {
		const buffer = Buffer.from(item, 'utf8');
		const headers = [];
		headers.push(ContentLength + buffer.length.toString(), CRLF, CRLF);
		process.stdout.write(headers.join(''), 'ascii');
		process.stdout.write(buffer);
	}
}, 1000);