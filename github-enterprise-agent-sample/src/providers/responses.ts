import * as vscode from 'vscode';

/**
 * Responses-style events, shaped after the OpenAI Responses API. The
 * orchestrator produces them client-side over a chat/completions upstream,
 * so endpoints that only serve chat/completions still get a responses-style
 * agent loop: session start, upstream call, subagents (search, thinking,
 * plan, tool call, test), output.
 */
export type ResponsesEvent =
	| { type: 'response.created'; response_id: string; model: string }
	| { type: 'response.output_item.added'; item: ResponsesOutputItem }
	| { type: 'response.reasoning_summary_text.delta'; delta: string }
	| { type: 'response.output_text.delta'; delta: string }
	| { type: 'response.function_call_arguments.delta'; call_id: string; delta: string }
	| { type: 'response.output_item.done'; item: ResponsesOutputItem }
	| { type: 'response.completed'; response_id: string };

export type ResponsesOutputItem =
	| { type: 'reasoning'; summary: string }
	| { type: 'message'; role: 'assistant'; content: string }
	| { type: 'function_call'; call_id: string; name: string; arguments: string }
	| { type: 'function_call_output'; call_id: string; output: string };

export interface ResponsesSession {
	id: string;
	model: string;
	instructions: string;
	messages: { role: string; content: string }[];
	iterations: number;
}

/** A parsed upstream turn: what the model produced in one chat/completions call. */
export interface UpstreamTurn {
	thinking: string;
	plan: string;
	text: string;
	toolCalls: { name: string; arguments: string }[];
}

export interface Subagent {
	readonly name: string;
	run(args: Record<string, unknown>, token: vscode.CancellationToken): Promise<string>;
}

/** The system prompt that teaches any chat/completions model the agent protocol. */
export function agentProtocolPrompt(instructions: string): string {
	return [
		'You are a coding agent. ' + instructions,
		'For multi-step tasks you may use tools by emitting markers in your reply:',
		'<thinking>short reasoning about the next step</thinking>',
		'<plan>step 1; step 2; ...</plan>',
		'<tool name="search">{"include": "glob pattern"}</tool>',
		'<tool name="test">{"command": "shell command to run"}</tool>',
		'After tool results are provided in the next message, continue the task.',
		'When you have the final answer, reply with plain text only and no markers.'
	].join('\n');
}

let sessionCounter = 0;

export class ResponsesOrchestrator {
	private static readonly MAX_ITERATIONS = 5;

	constructor(
		private readonly upstream: (session: ResponsesSession, token: vscode.CancellationToken) => Promise<UpstreamTurn>,
		private readonly subagents: Map<string, Subagent>
	) { }

	startSession(model: string, instructions: string): ResponsesSession {
		sessionCounter += 1;
		return {
			id: `resp_${Date.now().toString(36)}_${sessionCounter}`,
			model,
			instructions,
			messages: [],
			iterations: 0
		};
	}

	/**
	 * Runs the agent loop for one user input and emits responses-style events:
	 * session start, upstream turns (thinking, plan, tool calls), subagent
	 * results, and the final output text.
	 */
	async run(session: ResponsesSession, input: string, emit: (event: ResponsesEvent) => void, token: vscode.CancellationToken): Promise<void> {
		// session start
		emit({ type: 'response.created', response_id: session.id, model: session.model });
		session.messages.push({ role: 'user', content: input });

		let lastText = '';
		while (session.iterations < ResponsesOrchestrator.MAX_ITERATIONS && !token.isCancellationRequested) {
			session.iterations += 1;
			// upstream: one chat/completions call against the session history
			const turn = await this.upstream(session, token);
			lastText = turn.text;

			if (turn.thinking) {
				const item: ResponsesOutputItem = { type: 'reasoning', summary: turn.thinking };
				emit({ type: 'response.output_item.added', item });
				emit({ type: 'response.reasoning_summary_text.delta', delta: turn.thinking });
				emit({ type: 'response.output_item.done', item });
			}
			if (turn.plan) {
				const item: ResponsesOutputItem = { type: 'reasoning', summary: `plan: ${turn.plan}` };
				emit({ type: 'response.output_item.added', item });
				emit({ type: 'response.output_item.done', item });
			}

			if (turn.toolCalls.length === 0) {
				// output: the model produced the final answer
				const item: ResponsesOutputItem = { type: 'message', role: 'assistant', content: turn.text };
				emit({ type: 'response.output_item.added', item });
				emit({ type: 'response.output_text.delta', delta: turn.text });
				emit({ type: 'response.output_item.done', item });
				emit({ type: 'response.completed', response_id: session.id });
				return;
			}

			// subagent: execute each tool call and feed the results back upstream
			session.messages.push({ role: 'assistant', content: turn.text || JSON.stringify(turn.toolCalls) });
			for (const call of turn.toolCalls) {
				const callId = `call_${session.iterations}_${call.name}`;
				const callItem: ResponsesOutputItem = { type: 'function_call', call_id: callId, name: call.name, arguments: call.arguments };
				emit({ type: 'response.output_item.added', item: callItem });
				emit({ type: 'response.function_call_arguments.delta', call_id: callId, delta: call.arguments });
				emit({ type: 'response.output_item.done', item: callItem });

				let output: string;
				const subagent = this.subagents.get(call.name);
				if (!subagent) {
					output = `unknown tool: ${call.name}`;
				} else {
					try {
						let args: Record<string, unknown> = {};
						try { args = JSON.parse(call.arguments) as Record<string, unknown>; } catch { /* model emitted non-JSON args */ }
						output = await subagent.run(args, token);
					} catch (error) {
						output = `tool failed: ${error instanceof Error ? error.message : String(error)}`;
					}
				}
				const outputItem: ResponsesOutputItem = { type: 'function_call_output', call_id: callId, output };
				emit({ type: 'response.output_item.added', item: outputItem });
				emit({ type: 'response.output_item.done', item: outputItem });
				session.messages.push({ role: 'user', content: `tool ${call.name} result: ${output}` });
			}
		}

		// The loop hit max iterations or cancellation: still surface the
		// model's last words so the user always gets an answer.
		if (lastText) {
			const item: ResponsesOutputItem = { type: 'message', role: 'assistant', content: lastText };
			emit({ type: 'response.output_item.added', item });
			emit({ type: 'response.output_text.delta', delta: lastText });
			emit({ type: 'response.output_item.done', item });
		}
		emit({ type: 'response.completed', response_id: session.id });
	}
}

/**
 * Parses one upstream chat/completions turn into its thinking, plan, tool
 * calls, and remaining text. Uses text markers so it works with any
 * chat/completions model, with or without function calling.
 */
export function parseUpstreamTurn(raw: string): UpstreamTurn {
	const turn: UpstreamTurn = { thinking: '', plan: '', text: '', toolCalls: [] };
	// The closing tag is optional: small models do not always emit it, so a
	// marker block also ends at the next marker or the end of the text.
	const marker = /<(thinking|plan|tool)(\s[^>]*)?>([\s\S]*?)(?:<\/\1>|(?=<(?:thinking|plan|tool)(?:\s[^>]*)?>)|$)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = marker.exec(raw)) !== null) {
		turn.text += raw.slice(lastIndex, match.index);
		lastIndex = match.index + match[0].length;
		const body = match[3].trim();
		if (match[1] === 'thinking') {
			turn.thinking += (turn.thinking ? ' ' : '') + body;
		} else if (match[1] === 'plan') {
			turn.plan += (turn.plan ? ' ' : '') + body;
		} else {
			const nameMatch = /name\s*=\s*"([^"]+)"/.exec(match[2] ?? '');
			turn.toolCalls.push({ name: nameMatch?.[1] ?? 'unknown', arguments: body });
		}
	}
	turn.text += raw.slice(lastIndex);
	turn.text = turn.text.trim();
	return turn;
}