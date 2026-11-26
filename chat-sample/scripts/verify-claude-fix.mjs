/**
 * Standalone verification for Claude tool-calling fix (no VS Code instance required).
 * Run: node scripts/verify-claude-fix.mjs
 */

function getToolsForRequest(command, allTools) {
	if (command === 'all') {
		return allTools;
	}
	return allTools.filter(tool => tool.tags.includes('chat-tools-sample'));
}

function toLanguageModelChatTools(tools) {
	return tools.map(tool => ({
		name: tool.name,
		description: tool.description,
		inputSchema: tool.inputSchema ?? { type: 'object', properties: {} },
	}));
}

function resolveReferencedChatTools(reference, allTools) {
	const tool = allTools.find(
		t => t.name === reference.name || t.name.endsWith(`_${reference.name}`)
	);
	return tool ? toLanguageModelChatTools([tool]) : [];
}

const sampleTools = [
	{
		name: 'chat-tools-sample_findFiles',
		description: 'Search for files in the current workspace',
		inputSchema: {
			type: 'object',
			properties: { pattern: { type: 'string' } },
			required: ['pattern'],
		},
		tags: ['files', 'search', 'chat-tools-sample'],
	},
	{
		name: 'chat-tools-sample_tabCount',
		description: 'The number of active tabs in a tab group',
		inputSchema: undefined,
		tags: ['editors', 'chat-tools-sample'],
	},
	{
		name: 'other_tool',
		description: 'Unrelated',
		inputSchema: { type: 'object', properties: {} },
		tags: ['other'],
	},
];

let passed = 0;
let failed = 0;

function assert(condition, message) {
	if (condition) {
		passed++;
		console.log(`  ✓ ${message}`);
	} else {
		failed++;
		console.error(`  ✗ ${message}`);
	}
}

console.log('Verifying Claude tool-calling fix...\n');

console.log('1. Default tools filter');
const defaultTools = toLanguageModelChatTools(getToolsForRequest(undefined, sampleTools));
assert(defaultTools.length === 2, 'returns only chat-tools-sample tools');
assert(defaultTools.every(t => t.inputSchema && typeof t.inputSchema === 'object'), 'every tool has inputSchema object');
assert(
	defaultTools.find(t => t.name === 'chat-tools-sample_tabCount')?.inputSchema?.type === 'object',
	'missing inputSchema gets a default object schema'
);

console.log('\n2. Tool reference resolution (findFiles)');
const referenced = resolveReferencedChatTools({ name: 'findFiles' }, sampleTools);
assert(referenced.length === 1, 'resolves findFiles reference');
assert(referenced[0].name === 'chat-tools-sample_findFiles', 'maps to full tool name');
assert(referenced[0].inputSchema?.required?.includes('pattern'), 'preserves required pattern field');

console.log('\n3. All tools command');
const all = toLanguageModelChatTools(getToolsForRequest('all', sampleTools));
assert(all.length === 3, 'all command includes every registered tool');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
