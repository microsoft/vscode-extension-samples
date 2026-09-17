# GitHub Enterprise Agent Sample

A VS Code extension sample that combines four things:

1. **GitHub + GitHub Enterprise integration (desktop + web)** — signs in with VS Code's built-in GitHub authentication providers and talks to the GitHub REST API with [Octokit](https://github.com/octokit/rest.js#readme). Works in desktop VS Code **and** in VS Code for the Web (vscode.dev) via the `browser` entry point.
2. **Agent app with a dedicated entry** — a chat participant (`@enterprise-agent`) plus a dedicated command (`GitHub Enterprise Agent: Open Enterprise Agent Chat`) that opens the Chat view with the agent pre-mentioned.
3. **NVIDIA model provider** — registers NVIDIA NIM models (OpenAI-compatible endpoint) through the LM API, so they show up in the model picker.
4. **Mistral model provider** — registers Mistral models (OpenAI-compatible endpoint) through the LM API; the agent falls back to a Mistral model when no model is selected.

## Setup

- **GitHub.com** (default): nothing to configure. Run `GitHub Enterprise Agent: Show GitHub Account` and sign in.
- **GitHub Enterprise Server**: set `githubEnterpriseAgent.host` to your GHES URL (e.g. `https://ghe.example.com`) **and** set the built-in `github-enterprise.uri` setting to the same URL, then reload. The extension uses the `github.enterprise` authentication provider and points Octokit at `https://<host>/api/v3`.
- **Model providers**: run `GitHub Enterprise Agent: Set NVIDIA API Key` / `Set Mistral API Key` (keys are stored in VS Code's secret storage).

## Run

- Desktop: press `F5` (Run Extension).
- Web: `npm run start-web`, or press `F5` with *Run Web Extension in VS Code*.

## Testing

The sample ships with an integration test suite that runs in a real VS Code instance (`@vscode/test-electron`):

```bash
npm test   # compiles first, then runs the suite in VS Code 1.138.0
```

The suite covers extension activation, command registration, chat participant and language model provider wiring (`vscode.lm.selectChatModels`), token counting, the `GitHubService` host/auth logic, agent handler behavior (free-form chat and the `/orgs` error path), and the Mistral provider's SSE streaming end-to-end against a local HTTP server (deltas, auth header, error handling, cancellation).

### Real-API tests

A second suite runs against the real `https://integrate.api.nvidia.com/v1` endpoint and is skipped unless `NVIDIA_API_KEY` is set:

```bash
NVIDIA_API_KEY=nvapi-... npm test
```

It verifies the full path — VS Code language model API → provider → real NVIDIA cloud — by discovering the live model catalog, streaming a real completion, and asserting that API errors surface for retired models. The key is read from the environment only and is never stored in the repository.

### Dynamic model discovery

The NVIDIA and Mistral providers fetch the live `/models` catalog at runtime (5-minute cache) instead of relying on a hardcoded model list, so retired or account-unavailable models never appear in the picker. A static fallback list is used when the catalog cannot be fetched.

### Responses-style orchestration (推論層)

Endpoints like `https://integrate.api.nvidia.com/v1` only serve `chat/completions` — there is no `/responses` route. This sample adds an inference layer (`src/providers/responses.ts`) that turns every model call into a **Responses-style agent loop** orchestrated client-side, so any chat/completions model gets the full agent architecture:

1. **Session start** — a `response.created` event opens a session (`resp_...` id, model, instructions, message history).
2. **Upstream** — one `chat/completions` call per iteration against the session history, with a system prompt that teaches the model a text-marker protocol (`<thinking>`, `<plan>`, `<tool name="...">`), so it works with or without function calling.
3. **Subagents** — tool calls are executed by real subagents (`src/agents/subagents.ts`): `search` (workspace file search) and `test` (shell command), and their results are fed back upstream as the next message.
4. **Output** — when the model stops calling tools, its answer is emitted as `output_text.delta` and the session completes with `response.completed`.

The loop is capped at 5 iterations; if the cap is hit the model's last words are still surfaced. The provider maps the events onto VS Code's language model stream, so the agent transcript (thinking, plan, tool calls, results) is visible in the chat as `[thinking]`, `[plan]`, `[tool: ...]`, `[result]` lines.

## Try it

- `@enterprise-agent /orgs` — list the organizations you belong to
- `@enterprise-agent /repos <org>` — list repositories of an organization
- `@enterprise-agent <question>` — free-form chat using the selected model
- Command palette: `Show GitHub Account`, `List Organization Repositories`

## Deploy

```bash
npx @vscode/vsce package   # produces github-enterprise-agent-sample-0.0.1.vsix
```

- **Local / desktop**: install the `.vsix` via the Extensions view (`Install from VSIX...`).
- **Online (vscode.dev)**: the extension has a `browser` entry point, so publishing it to the Marketplace (`npx @vscode/vsce publish`) makes it available on vscode.dev automatically.
- **Organization-internal distribution**: publish as *unlisted* on the Marketplace (only people with the link can find it), or distribute the `.vsix` file directly.

## Git sync

```bash
git add github-enterprise-agent-sample
git commit -m "Add GitHub Enterprise Agent sample"
git push -u origin <branch>
```
