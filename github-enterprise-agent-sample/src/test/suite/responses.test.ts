import * as assert from 'assert';
import * as vscode from 'vscode';
import { ResponsesEvent, ResponsesOrchestrator, Subagent, UpstreamTurn, agentProtocolPrompt, parseUpstreamTurn } from '../../providers/responses';

function collect(): { events: ResponsesEvent[]; emit: (event: ResponsesEvent) => void } {
	const events: ResponsesEvent[] = [];
	return { events, emit: event => events.push(event) };
}

function types(events: ResponsesEvent[]): string[] {
	return events.map(event => event.type);
}

suite('parseUpstreamTurn', () => {
	test('parses plain text with no markers', () => {
		const turn = parseUpstreamTurn('just the answer');
		assert.strictEqual(turn.thinking, '');
		assert.strictEqual(turn.plan, '');
		assert.strictEqual(turn.text, 'just the answer');
		assert.strictEqual(turn.toolCalls.length, 0);
	});

	test('parses thinking, plan, and tool markers', () => {
		const turn = parseUpstreamTurn('<thinking>need to find files</thinking><plan>search; read</plan>prefix <tool name="search">{"include": "**/*.ts"}</tool> suffix');
		assert.strictEqual(turn.thinking, 'need to find files');
		assert.strictEqual(turn.plan, 'search; read');
		assert.strictEqual(turn.text, 'prefix  suffix');
		assert.strictEqual(turn.toolCalls.length, 1);
		assert.strictEqual(turn.toolCalls[0].name, 'search');
		assert.strictEqual(turn.toolCalls[0].arguments, '{"include": "**/*.ts"}');
	});

	test('parses multiple tool calls and multiline markers', () => {
		const turn = parseUpstreamTurn('<tool name="test">\n{"command": "npm test"}\n</tool><tool name="search">{"include": "src/**"}</tool>');
		assert.strictEqual(turn.toolCalls.length, 2);
		assert.strictEqual(turn.toolCalls[0].name, 'test');
		assert.strictEqual(turn.toolCalls[0].arguments, '{"command": "npm test"}');
		assert.strictEqual(turn.toolCalls[1].name, 'search');
	});

	test('handles a tool marker with a missing name', () => {
		const turn = parseUpstreamTurn('<tool>{"include": "x"}</tool>');
		assert.strictEqual(turn.toolCalls.length, 1);
		assert.strictEqual(turn.toolCalls[0].name, 'unknown');
	});

	test('handles tool markers without closing tags', () => {
		const turn = parseUpstreamTurn('<tool name="search">{"include": "a"}; <tool name="search">{"include": "b"}');
		assert.strictEqual(turn.toolCalls.length, 2);
		assert.strictEqual(turn.toolCalls[0].name, 'search');
		assert.ok(turn.toolCalls[0].arguments.includes('"a"'));
		assert.strictEqual(turn.toolCalls[1].name, 'search');
		assert.ok(turn.toolCalls[1].arguments.includes('"b"'));
		assert.strictEqual(turn.text, '', 'no raw markers should leak into the text');
	});
});

suite('agentProtocolPrompt', () => {
	test('includes the instructions and the tool markers', () => {
		const prompt = agentProtocolPrompt('Fix the bug.');
		assert.ok(prompt.includes('Fix the bug.'));
		assert.ok(prompt.includes('<tool name="search">'));
		assert.ok(prompt.includes('<tool name="test">'));
	});
});

suite('ResponsesOrchestrator', () => {
	function fakeSubagent(name: string, result: string, calls: { args: Record<string, unknown> }[] = []): Subagent {
		return {
			name,
			run: async (args, _token) => {
				calls.push({ args });
				return result;
			}
		};
	}

	test('emits session start, output, and completed for a plain turn', async () => {
		const { events, emit } = collect();
		const orchestrator = new ResponsesOrchestrator(
			async () => ({ thinking: '', plan: '', text: 'final answer', toolCalls: [] }),
			new Map()
		);
		const session = orchestrator.startSession('test-model', '');
		await orchestrator.run(session, 'hello', emit, new vscode.CancellationTokenSource().token);

		assert.deepStrictEqual(types(events), [
			'response.created',
			'response.output_item.added',
			'response.output_text.delta',
			'response.output_item.done',
			'response.completed'
		]);
		const created = events[0] as Extract<ResponsesEvent, { type: 'response.created' }>;
		assert.strictEqual(created.model, 'test-model');
		assert.strictEqual(created.response_id, session.id);
		const delta = events[2] as Extract<ResponsesEvent, { type: 'response.output_text.delta' }>;
		assert.strictEqual(delta.delta, 'final answer');
	});

	test('emits reasoning and plan events when the model thinks', async () => {
		const { events, emit } = collect();
		const orchestrator = new ResponsesOrchestrator(
			async () => ({ thinking: 'why', plan: 'step 1; step 2', text: 'done', toolCalls: [] }),
			new Map()
		);
		const session = orchestrator.startSession('test-model', '');
		await orchestrator.run(session, 'hello', emit, new vscode.CancellationTokenSource().token);

		assert.ok(types(events).includes('response.reasoning_summary_text.delta'));
		const planItem = events.find(event => event.type === 'response.output_item.done' && (event as { item: { summary?: string } }).item.summary?.startsWith('plan: '));
		assert.ok(planItem, 'expected a plan item');
	});

	test('runs subagents for tool calls and feeds results back upstream', async () => {
		const { events, emit } = collect();
		const searchCalls: { args: Record<string, unknown> }[] = [];
		let upstreamCalls = 0;
		const turns: UpstreamTurn[] = [
			{ thinking: '', plan: '', text: '', toolCalls: [{ name: 'search', arguments: '{"include": "**/*.ts"}' }] },
			{ thinking: '', plan: '', text: 'found 2 files', toolCalls: [] }
		];
		const orchestrator = new ResponsesOrchestrator(
			async () => {
				const turn = turns[Math.min(upstreamCalls, turns.length - 1)];
				upstreamCalls += 1;
				return turn;
			},
			new Map([['search', fakeSubagent('search', 'a.ts\nb.ts', searchCalls)]])
		);
		const session = orchestrator.startSession('test-model', '');
		await orchestrator.run(session, 'find ts files', emit, new vscode.CancellationTokenSource().token);

		assert.strictEqual(upstreamCalls, 2, 'expected one upstream call per iteration');
		assert.strictEqual(searchCalls.length, 1);
		assert.deepStrictEqual(searchCalls[0].args, { include: '**/*.ts' });
		assert.ok(types(events).includes('response.function_call_arguments.delta'));
		const outputItem = events.find(event => event.type === 'response.output_item.done' && (event as { item: { type?: string; output?: string } }).item.type === 'function_call_output') as { item: { output: string } } | undefined;
		assert.ok(outputItem, 'expected a function_call_output item');
		assert.strictEqual(outputItem.item.output, 'a.ts\nb.ts');
		// the tool result is fed back into the session history for the next upstream call
		assert.ok(session.messages.some(message => message.role === 'user' && message.content.includes('tool search result: a.ts\nb.ts')));
		assert.strictEqual(types(events).at(-1), 'response.completed');
	});

	test('reports unknown tools without failing the loop', async () => {
		const { events, emit } = collect();
		let upstreamCalls = 0;
		const turns: UpstreamTurn[] = [
			{ thinking: '', plan: '', text: '', toolCalls: [{ name: 'nope', arguments: '{}' }] },
			{ thinking: '', plan: '', text: 'gave up', toolCalls: [] }
		];
		const orchestrator = new ResponsesOrchestrator(
			async () => {
				const turn = turns[Math.min(upstreamCalls, turns.length - 1)];
				upstreamCalls += 1;
				return turn;
			},
			new Map()
		);
		const session = orchestrator.startSession('test-model', '');
		await orchestrator.run(session, 'hello', emit, new vscode.CancellationTokenSource().token);

		const outputItem = events.find(event => event.type === 'response.output_item.done' && (event as { item: { type?: string; output?: string } }).item.type === 'function_call_output') as { item: { output: string } } | undefined;
		assert.ok(outputItem);
		assert.strictEqual(outputItem.item.output, 'unknown tool: nope');
		assert.strictEqual(types(events).at(-1), 'response.completed');
	});

	test('stops after max iterations when the model keeps calling tools', async () => {
		const { events, emit } = collect();
		let upstreamCalls = 0;
		const orchestrator = new ResponsesOrchestrator(
			async () => {
				upstreamCalls += 1;
				return { thinking: '', plan: '', text: '', toolCalls: [{ name: 'search', arguments: '{}' }] };
			},
			new Map([['search', fakeSubagent('search', 'x')]])
		);
		const session = orchestrator.startSession('test-model', '');
		await orchestrator.run(session, 'hello', emit, new vscode.CancellationTokenSource().token);

		assert.strictEqual(upstreamCalls, 5, 'expected the loop to stop at 5 iterations');
		assert.strictEqual(session.iterations, 5);
		assert.strictEqual(types(events).at(-1), 'response.completed');
	});

	test('stops immediately when cancelled', async () => {
		const { events, emit } = collect();
		const source = new vscode.CancellationTokenSource();
		source.cancel();
		const orchestrator = new ResponsesOrchestrator(
			async () => ({ thinking: '', plan: '', text: 'never', toolCalls: [] }),
			new Map()
		);
		const session = orchestrator.startSession('test-model', '');
		await orchestrator.run(session, 'hello', emit, source.token);

		assert.deepStrictEqual(types(events), ['response.created', 'response.completed']);
		assert.strictEqual(session.iterations, 0);
	});
});
