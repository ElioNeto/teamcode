# 📋 Não Categorizados

> **Total:** 155 | Extraído em 2026-05-18

---

## #27920 — Trailing-assistant 400 on llama.cpp/vLLM with thinking-on templates (Qwen3, DeepSeek-R1, GLM-thinking, Kimi-K2-Thinking, MiniMax-M2)

📅 `2026-05-16` | ✏️ **feanor5555** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27920](https://github.com/anomalyco/opencode/issues/27920)


### Symptom

Local OpenAI-compatible servers running thinking-on-by-default chat templates (llama.cpp `--reasoning on`, vLLM with reasoning, TGI with thinking, mistral.rs, etc.) reject any teamcode request whose **last** message is `role:"assistant"`, with:

```
HTTP 400 {"error":{"message":"Assistant response prefill is incompatible with enable_thinking."}}
```

teamcode emits a trailing-assistant message in two situations, both of which trip this error:

1. **Empty trailing assistant** — `message-v2.toModelMessagesEffect` sometimes builds an assistant `UIMessage` whose only parts are `[step-start, reasoning("")]`. `convertToModelMessages` collapses that to `content:""`, which is sent as a trailing assistant turn.
2. **Non-empty trailing assistant** — `session/prompt.ts` deliberately injects a `MAX_STEPS` wrap-up instruction as `role:"assistant"` (response continuation / prefill).

### Reproduction

1. Run a llama-server with a thinking template, e.g.:
   ```
   llama-server --model Qwen3.5-9B-...gguf --reasoning on --jinja --port 8080
   ```
2. Point teamcode at it via an `@ai-sdk/openai-compatible` provider in `teamcode.json`.
3. Run any agent with a `steps` limit small enough to trigger MAX_STEPS, or any flow that emits an empty-reasoning assistant turn.
4. Observe HTTP 400s in the llama-server log.

### Affected model families

Every 2025-2026 open-weight thinking family using `enable_thinking`-branching templates:

- Qwen3 hybrid (all sizes), Qwen3-Thinking-2507, Qwen3-

> *[Truncado — 3404 chars totais]*

---

## #27908 — plugin install spinner outputs garbage in non-TTY environment

📅 `2026-05-16` | ✏️ **lunqin123** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27908](https://github.com/anomalyco/opencode/issues/27908)
 | 🏷️ `bug` `tui`


## Description

When running `teamcode plugin install <package>` from a non-interactive shell (e.g., PowerShell, subprocess, CI), the spinner animation frames are printed as individual lines instead of being rendered in-place as an animation.

## Reproduction

1. Run from PowerShell: `teamcode plugin install teamcode-session-search`
2. Observe the output: each spinner frame (◓, ◑, ◒, ◐) appears on its own line with "Installing plugin package..." repeated

## Root Cause

The `plugin install` command uses TUI spinner escape sequences (\r + ANSI CSI) without checking whether stdout is a TTY (via isatty). In non-interactive environments, carriage returns are not interpreted, so each frame becomes a separate line of output.

## Expected Behavior

- In TTY: inline spinner animation (current behavior, correct)
- In non-TTY: simple static text like "Installing plugin package..." without escape sequences, or just silent with exit code

## Environment

- TeamCode v1.15.3 (probably affects all versions)
- Windows 11, PowerShell 7
- Also affects CI/CD and subprocess invocations

## Suggested Fix

Add an isatty check (e.g., Go's term.IsTerminal or Node's process.stdout.isTTY) before outputting spinner sequences. Fall back to plain text or no output when stdout is not a terminal.

---

## #27843 — session_diff read/write race can trigger Unexpected EOF and local server exit

📅 `2026-05-16` | ✏️ **waynewang6660** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27843](https://github.com/anomalyco/opencode/issues/27843)


## Summary
On macOS, the local TeamCode server intermittently "shuts down" or gets torn down by the desktop app. After investigation, this looks like a core `session_diff` storage/read race rather than an MCP compatibility problem or an oh-my-teamcode-specific bug.

The strongest signal is a runtime error in the core read path:
- `FileSystem.readJson`
- `SessionSummary.diff`
- `SessionHttpApi.diff`
- `JSON Parse error: Unexpected EOF`

At the same time, the desktop side later records:
- `Killed server`
- `Received Exit`
- `Server state missing`

## Environment
- macOS
- TeamCode desktop app
- oh-my-openagent plugin enabled
- user config stored in `~/.config/teamcode/teamcode.json`

## What I observed
### 1) Core read path fails on JSON parse
From local runtime log (`~/.local/share/teamcode/log/2026-05-16T084710.log`):

```text
ERROR ... service=server error=JSON Parse error: Unexpected EOF cause=SyntaxError: JSON Parse error: Unexpected EOF
at FileSystem.readJson
at SessionSummary.diff
at SessionHttpApi.diff
```

Relevant excerpt:

```text
ERROR 2026-05-16T08:47:22 +4449ms service=server error=JSON Parse error: Unexpected EOF cause=SyntaxError: JSON Parse error: Unexpected EOF
    at FileSystem.readJson (/$bunfs/root/chunk-n2xqxvv1.js:39:2871)
    at FileSystem.readJson (definition) (/$bunfs/root/chunk-pves1snx.js:679:69219)
    at SessionSummary.diff (/$bunfs/root/chunk-7az0q54r.js:9:19672)
    at SessionSummary.diff (definition) (/$bunfs/root/chunk-tt4khxbr.js:907:1334)
   

> *[Truncado — 4193 chars totais]*

---

## #27799 — CLI parser-only paths (--help, --version, completion) pay full app-bootstrap import cost

📅 `2026-05-15` | ✏️ **danfry1** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27799](https://github.com/anomalyco/opencode/issues/27799)


### Description

Every `teamcode` invocation eagerly loads all 22 top-level command modules — even when the user only needed `--help`, `--version`, or shell tab completion. The chain runs through `effect-cmd.ts`, which transitively imports `Effect`, `Provider`, `Session`, `Tool`, `InstanceStore`, `AppRuntime`, etc. The result is that parser-only paths pay the full app-bootstrap import cost.

This is particularly bad for shell tab completion, which fires on every Tab keystroke and pays this cost each time.

### Measurements

Compiled binary on `dev` (current HEAD), warm runs, median of 10:

| Command                              | Time   |
| ------------------------------------ | ------ |
| `teamcode --help`                    | 213ms  |
| `teamcode --version`                 | 193ms  |
| `teamcode --get-yargs-completions …` | 192ms  |
| `teamcode db --help`                 | 199ms  |
| `teamcode mcp --help`                | 195ms  |

For reference, `bun -e '0'` cold starts in ~90ms on the same machine, so the bulk of these timings is module evaluation rather than process startup.

### Root cause

`src/index.ts` does e.g. `import { RunCommand } from "./cli/cmd/run"` synchronously for every command. Loading any of these triggers `effect-cmd.ts`, which imports `Instance` / `InstanceStore` / `AppRuntime` at the top level — about 500ms of evaluation in dev mode (smaller in the compiled binary, but the proportional cost is similar).

For commands that don't need the full graph (eve

> *[Truncado — 3783 chars totais]*

---

## #27744 — Server API 执行类 endpoint 异常：CLI 正常，但 `/message`、`/prompt_async`、`/command`、`/shell`、`/share` 存在不一致或失败

📅 `2026-05-15` | ✏️ **Brahmsky** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27744](https://github.com/anomalyco/opencode/issues/27744)


## 问题概述

在我的环境里，TeamCode 的 CLI 执行路径是正常的，但 server API 的多个执行类 endpoint 不能正常工作。

整体表现是：session / metadata 相关 API 基本可用，但执行相关 API 存在明显异常或契约不一致：

- `POST /session/{id}/message` 会返回一个 assistant message，但 `parts` 为空，且 `info.error.name = "MessageAbortedError"`
- `POST /session/{id}/prompt_async` 会接受请求，但后续生成的 assistant message 同样是空 `parts` + `MessageAbortedError`
- `POST /session/{id}/command` 的实际行为和 SDK / OpenAPI 类型定义不一致
- `POST /session/{id}/shell` 返回 `500 UnknownError`
- `GET /session/{id}/share` 返回的是 HTML app shell，而不是 JSON

这会导致依赖 TeamCode server API 的集成工具无法工作，即使 CLI 路径是正常的。

## 环境信息

- TeamCode 版本：`1.15.0`
- 运行环境：WSL / Linux
- 本地 provider / auth 状态：
  - OpenAI OAuth
  - GitHub Copilot OAuth
- 成功执行的 CLI 路径实际命中：
  - `providerID=openai`
  - `modelID=gpt-5.4`

## 正常工作的 API

在同一环境中，下列 API 目前看起来是可用的：

- `GET /global/health`
- `POST /session?directory=...`
- `GET /session`
- `GET /session/{id}`
- `GET /session/status`
- `GET /session/{id}/children`
- `GET /session/{id}/todo`
- `GET /session/{id}/diff`
- `GET /session/{id}/message`
- `POST /session/{id}/fork`
- `POST /session/{id}/abort`

## 无法正常工作的 API

### 1. `POST /session/{id}/message`

最小复现：

```bash
teamcode serve --hostname 127.0.0.1 --port 4096
```

```bash
curl -sS -X POST 'http://127.0.0.1:4096/session?directory=%2Fhome%2Flifei%2FPrograms' \
  -H 'content-type: application/json' \
  -d '{"title":"api-default"}'
```

然后：

```bash
curl -sS -X POST 'http://127.0.0.1:4096/session/<SESSION_ID>/message' \
  -H 'content-type: applicat

> *[Truncado — 3918 chars totais]*

---

## #27458 — Incorrect token count and pricing calculation for DeepSeek models

📅 `2026-05-14` | ✏️ **HUANGzc83** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27458](https://github.com/anomalyco/opencode/issues/27458)


## Problem
When using DeepSeek models (deepseek-v4-flash / deepseek-v4-pro) via TeamCode, both token counting and cost estimation are inaccurate.

## Root Cause Analysis
1. **Tokenizer mismatch** — TeamCode uses a different tokenizer (likely tiktoken for OpenAI) to count tokens locally, which produces different counts than DeepSeek's official byte-level BPE tokenizer. The DeepSeek API response includes usage.prompt_tokens / usage.completion_tokens in its own encoding, but TeamCode displays its own locally-computed counts instead of (or in addition to) the API-reported values.

2. **Stale hardcoded model info** — The context window, pricing per token (input/output), and tokenizer selection are compiled into the binary. For DeepSeek V4:
   - Context window shows 262K instead of the correct 1M (related: issue #24119)
   - Input/output pricing per token uses outdated rates
   - The deepseek-chat and deepseek-reasoner model names are being deprecated on 2026/07/24 but may still be listed

## Expected Behavior
 - Token counts should match what DeepSeek's API reports (or at minimum use the correct tokenizer)
 - Pricing should reflect current DeepSeek API pricing: https://api-docs.deepseek.com/quick_start/pricing
 - Context window should be 1M for V4 models (not 262K)

## Environment
 - TeamCode version: 1.14.50
 - Model(s): teamcode/deepseek-v4-flash-free, deepseek-v4-pro
 - Provider: DeepSeek (via TeamCode Zen / direct API)
 - OS: Windows

## Suggested Fix
 - Update the internal mo

> *[Truncado — 1881 chars totais]*

---

## #27082 — TUI blank page: FSEventStreamSetExclusionPaths blocks 21-35s when HOME has large directories

📅 `2026-05-12` | ✏️ **litown** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27082](https://github.com/anomalyco/opencode/issues/27082)


## Environment
- **teamcode**: v1.14.48
- **OS**: macOS 15.4.1 (Apple Silicon arm64)
- **Install method**: npm (`npm i -g teamcode-ai`)

## Summary

This is a deeper root cause analysis of #27071. The blank TUI is **not** caused by `ENAMETOOLONG` errors or by scanning `~/Library` content. The true cause is `FSEventStreamSetExclusionPaths` taking 21-35 seconds to initialize when the exclusion paths (built from `os.homedir()`) point to directories with millions of files.

## Root Cause

### Startup Flow
```
os.homedir() → build exclusion paths → FSEventStreamSetExclusionPaths() → wait → file.watcher.updated → TUI renders
```

### What happens
1. On startup, teamcode builds a list of "protected paths" from `os.homedir()`:
   ```javascript
   var home = os.homedir();
   var dirs = ["Music","Pictures","Movies","Downloads","Desktop","Documents","Public","Applications","Library"];
   // + sub-paths under Library: Application Support, Caches, etc.
   ```
2. These paths are passed to `FSEventStreamSetExclusionPaths()` to exclude them from FSEvents monitoring
3. `FSEventStreamSetExclusionPaths` interacts with the volume's FSEvents database to register exclusions
4. When exclusion paths point to directories with millions of files (e.g., a 150GB `~/Library`), this registration takes 21-35 seconds
5. The TUI blocks on `file.watcher.updated` event which only fires after FSEvents initialization completes
6. User sees a blank page for 21-35 seconds

### Key Evidence

| Test | Result |
|-----

> *[Truncado — 3778 chars totais]*

---

## #27072 — TUI renders blank when project has node_modules without .gitignore exclusion

📅 `2026-05-12` | ✏️ **litown** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27072](https://github.com/anomalyco/opencode/issues/27072)


## Environment
- **teamcode**: v1.14.48
- **OS**: macOS 15.4.1 (Build 24E263), Apple Silicon (arm64)
- **Terminal**: Ghostty 1.3.2 / Terminal.app / iTerm2 (all affected)
- **Shell**: zsh 5.9
- **Install method**: npm (`npm i -g teamcode-ai`)

## Problem
When running `teamcode` in a project directory that contains `node_modules` (or other large generated directories) without a `.gitignore` excluding them, the TUI renders blank. The file.watcher scans all files recursively, triggering `ENAMETOOLONG` errors that crash the TUI.

## Root Cause
The file.watcher's default ignore list is hardcoded to only `[".git", ".DS_Store"]`. It does NOT include `node_modules` or other common generated directories. When the project lacks a `.gitignore` file (or `.gitignore` doesn't exclude `node_modules`), the watcher attempts to scan all files, triggering errors that prevent TUI rendering.

## Reproduction
1. Create a project: `mkdir test && cd test && git init`
2. Add `node_modules`: `mkdir -p node_modules/pkg && echo "test" > node_modules/pkg/index.js`
3. Run `teamcode` → **blank TUI**
4. Add `.gitignore`: `echo "node_modules/" > .gitignore`
5. Run `teamcode` → **TUI renders correctly**

## Log Evidence (without .gitignore)
```
INFO  service=file.watcher directory=/path/to/project init
ERROR service=default e=ENAMETOOLONG: name too long, open rejection (x3)
INFO  service=default worker shutting down  (user quit - blank screen)
```

## Log Evidence (with .gitignore)
```
INFO  service=file.watch

> *[Truncado — 1891 chars totais]*

---

## #27071 — TUI shows blank page when ~/Library contains large number of files

📅 `2026-05-12` | ✏️ **litown** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27071](https://github.com/anomalyco/opencode/issues/27071)


## Environment
- **teamcode**: v1.14.48
- **OS**: macOS 15.4.1 (Build 24E263), Apple Silicon (arm64)
- **Terminal**: Ghostty 1.3.2 / Terminal.app / iTerm2 (all affected)
- **Shell**: zsh 5.9
- **Install method**: npm (`npm i -g teamcode-ai`)

## Problem
TUI always shows a completely blank page after launch. Backend (`teamcode serve`) works correctly with proper API responses. The issue persists across ALL terminal emulators.

## Root Cause
Bun runtime scans `~/Library` directory during initialization. My `~/Library` contains millions of files (WPS Office PDF caches, Claude session data, JetBrains caches, etc.) with paths up to 453 characters long. This scanning blocks the TUI rendering thread, resulting in a blank page.

Colleagues with identical hardware/software do NOT have this issue — their `~/Library` directories have far fewer files.

## Reproduction
1. Have a macOS system with a large `~/Library` directory (millions of files)
2. Run `teamcode` in any terminal
3. Observe blank TUI
4. Backend logs show 3x `ENAMETOOLONG: name too long, open rejection`

## Workaround
Set `HOME` to a minimal isolated directory before launching:
```bash
export HOME="/path/to/minimal/home"
teamcode
```

## Log Evidence
```
INFO  service=file.watcher init
ERROR service=default e=ENAMETOOLONG: name too long, open rejection
ERROR service=default e=ENAMETOOLONG: name too long, open rejection
ERROR service=default e=ENAMETOOLONG: name too long, open rejection
ERROR service=default e=EIO: i/o error

> *[Truncado — 1797 chars totais]*

---

## #27037 — Auto-compaction is invisible to the model, causing duplicate summaries and wasted tokens

📅 `2026-05-12` | ✏️ **byAries** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27037](https://github.com/anomalyco/opencode/issues/27037)


Summary
When TeamCode triggers automatic context compaction near the context window limit, the compaction request is delivered to the model as a regular user message with no signal indicating it originated from the compaction system. The model treats it as a genuine user question and responds with a full summary. If compaction triggers again shortly after, the model produces a second summary, doubling token consumption. The user sees what appears to be the assistant inexplicably repeating itself.

刚才你让我"停一停，先总结现状"，我总结完后你又问了一次"What did we do so far?"，我又重复总结了一遍。现在这条 continue 指令出现得有点突兀

Reproduction
Have a long conversation that approaches the context window limit
Continue interacting until auto-compaction triggers
Observe that the assistant produces a summary response
Continue further until compaction triggers again
Observe a second, near-identical summary
In my session, the model received two consecutive prompts:

What did we do so far?
Continue if you have next steps, or stop and ask for clarification if you are unsure how to proceed.
Both were auto-compaction triggers, but indistinguishable from real user input. The model summarized twice and once asked for clarification on what to continue, neither of which served the actual user.

Impact
Token waste: Each compaction trigger spends output tokens on a summary the user did not request
User confusion: From the user's perspective, the assistant appears to be repeating itself for no reason
Workflow disruption: When the model int

> *[Truncado — 2771 chars totais]*

---

## #26855 — run --format json can exit before emitting final step_finish event

📅 `2026-05-11` | ✏️ **g199209** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26855](https://github.com/anomalyco/opencode/issues/26855)


## Summary

`teamcode run --format json` can complete a run without emitting the final `step_finish` JSON event to stdout, even though the session data contains the corresponding `step-finish` part with `tokens` and `cost`.

This makes downstream tooling miss usage accounting when it relies on the documented raw JSON event stream.

## Reproduction

Run teamcode non-interactively with JSON output, for example:

```sh
teamcode run --format json --thinking --dir /tmp/agentbench-item-6zkldejw --model gpt-5.4-mini --dangerously-skip-permissions
```

with stdin:

```text
Calculate `46457 * 352456`.
```

Observed stdout JSONL contained only:

```jsonl
{"type":"step_start","timestamp":1778479990756,"sessionID":"ses_1ea551140ffedVQFo35xGxPtJ8","part":{"id":"prt_e15ab07df001XgfGRrfSczzEEt","messageID":"msg_e15aaef93001ze1a2JzDi9w19F","sessionID":"ses_1ea551140ffedVQFo35xGxPtJ8","type":"step-start"}}
{"type":"text","timestamp":1778479990912,"sessionID":"ses_1ea551140ffedVQFo35xGxPtJ8","part":{"id":"prt_e15ab07e5001kU51w946TPSWit","messageID":"msg_e15aaef93001ze1a2JzDi9w19F","sessionID":"ses_1ea551140ffedVQFo35xGxPtJ8","type":"text","text":"`46457 * 352456 = 16,374,048,392`","time":{"start":1778479990757,"end":1778479990907}}}
```

No `step_finish` event was emitted to stdout.

However, the SQLite session DB contained both the assistant message usage and the final `step-finish` part:

```json
{
  "reason": "stop",
  "type": "step-finish",
  "tokens": {
    "total": 19362,
    "input": 20

> *[Truncado — 3127 chars totais]*

---

## #26852 — IDE context awareness: stale CLAUDE_CODE_SSE_PORT env var blocks lock file fallback

📅 `2026-05-11` | ✏️ **Dawnfz-Lenfeng** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26852](https://github.com/anomalyco/opencode/issues/26852)


## Bug

When `CLAUDE_CODE_SSE_PORT` is set in the environment (e.g. inherited from a VSCode integrated terminal where the Claude Code extension previously ran), teamcode will always try to connect to that port and **never fall back** to lock file discovery at `~/.claude/ide/*.lock` — even if that port is no longer reachable.

## Root Cause

In `packages/teamcode/src/cli/cmd/tui/context/editor.ts`, `resolveEditorConnection()` checks the env var first and returns immediately if present:

```typescript
const port = parsePort(process.env.CLAUDE_CODE_SSE_PORT || process.env.OPENCODE_EDITOR_SSE_PORT)
if (port) {
  return { url: `ws://127.0.0.1:${port}`, source: `env:${port}` }
}
// lock file path is never reached when env var is set
const lock = resolveEditorLockFile(directory)
```

Since `CLAUDE_CODE_SSE_PORT` is inherited by child processes, it persists in:
- All terminals opened from the same VSCode window after Claude Code was running
- Any terminal where `teamcode` is launched after a previous session set the variable
- tmux/screen sessions that were started while the variable was set

When the referenced port is dead (VSCode closed, Claude Code extension stopped, etc.), teamcode enters a reconnect loop against a dead port with exponential backoff — the lock file mechanism that could correctly find an active IDE connection is completely short-circuited.

## Reproduction

1. Open VSCode with the Claude Code extension active
2. Open an integrated terminal — observe `CLAUDE_CODE_

> *[Truncado — 2514 chars totais]*

---

## #26785 — 对话框焦点不恢复：切换程序后光标不在输入框内

📅 `2026-05-11` | ✏️ **LifetimeVip** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26785](https://github.com/anomalyco/opencode/issues/26785)


## 问题描述

当鼠标点击本程序对话框以外的界面（例如侧边栏、会话列表、文件树等），此时切换到其他程序以后，再返回本程序，鼠标停留位置不是对话框以内。

这是一个重大缺陷，会造成用户每次都要多点一次对话框才能继续输入，操作非常繁琐。

## 复现步骤

1. 在对话框内输入内容
2. 用鼠标点击程序内对话框以外的区域（如侧边栏、会话列表）
3. 切换到其他程序（如浏览器）
4. 再切回本程序
5. 此时焦点/光标不在对话框内 → 需额外点击一次对话框才能继续打字

## 根因分析

TUI 的 prompt 组件通过一个 `createEffect` 管理焦点状态，位于：

`packages/teamcode/src/cli/cmd/tui/component/prompt/index.tsx:697-707`
```tsx
createEffect(() => {
  if (!input || input.isDestroyed) return
  if (props.visible === false || dialog.stack.length > 0) {
    if (input.focused) input.blur()
    return
  }
  // Slot/plugin updates can remount the background prompt while a dialog is open.
  // Keep focus with the dialog and let the prompt reclaim it after the dialog closes.
  if (!input.focused) input.focus()
})
```

该 effect 的依赖项只有 `props.visible` 和 `dialog.stack.length`。当用户点击侧边栏等区域后，prompt 失去焦点（`input.blur()`），但 `visible` 和 `dialog.stack.length` 均未变化。

切换程序再返回时：
- `renderer.resume()` 恢复了渲染管线 (`app.tsx:686-697`)
- 但 prompt 的 `createEffect` 不会重新触发（依赖项无变化）
- 因此 `input.focus()` 不会被调用
- 用户必须手动点击输入框

`app.tsx:686-697` — 仅处理了 SIGCONT，未处理焦点恢复：
```tsx
{
  name: "terminal.suspend",
  title: "Suspend terminal",
  category: "System",
  hidden: true,
  enabled: process.platform !== "win32",
  run: () => {
    process.once("SIGCONT", () => {
      renderer.resume()  // 恢复渲染，但不恢复 prompt 焦点
    })
    renderer.suspend()
    process.kill(0, "SIGTSTP")
  },
},
```

## 建议修复

在 `renderer.resume()` 之后或监听终端 focus-gain 事件时，主动调用 `promptRef.current?.focus()` 将焦点恢复至对话框

> *[Truncado — 1602 chars totais]*

---

## #26479 — teamcode command disappears after exit because auto-upgrade misdetects install method

📅 `2026-05-09` | ✏️ **vsiegel** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26479](https://github.com/anomalyco/opencode/issues/26479)


## Summary
When `teamcode` starts, the auto-upgrade flow can infer installation method from `process.execPath` (Node/Bun runtime path) instead of the invoked `teamcode` CLI path. In some local setups this can select the wrong installer path and leave the command unavailable after exit.

## System information
- TeamCode version: 1.14.41
- Operating system: Linux

## Reproduction
1. Install and run `teamcode` in an environment where runtime executable path differs from the installed CLI shim path.
2. Start `teamcode` and allow startup update checks.
3. Exit the command.
4. Observe that `teamcode` may no longer resolve in shell.

## Expected
`teamcode` remains installed and available after running/exiting.

## Proposed fix
Use invoked command path (`process.argv[1]` fallback chain) in installation method detection heuristics, instead of relying on `process.execPath`.

## Related
- Prior auto-closed report: #26473
- Fix PR: #26468

---

## #26417 — Fix GitHub action teamcode session share links

📅 `2026-05-08` | ✏️ **cuevaio** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26417](https://github.com/anomalyco/opencode/issues/26417)


## Problem

GitHub Actions bot comments append an `teamcode session` link using the old `https://teamcode.ai/s/<id>` format. Those links now 404.

Example broken link:

```
https://teamcode.ai/s/It7ivB4n
```

Canonical share links now use the `opncd.ai/share/<id>` format, for example:

```
https://opncd.ai/share/uaFpXIla
```

## Expected

GitHub Actions comments should use the canonical share URL returned by the share service instead of deriving a URL from the session id.

## Notes

The stale construction exists in the active `packages/teamcode/src/cli/cmd/github.ts` action path and the legacy `github/index.ts` copy.

---

## #26381 — UI: model thinking spinner provides no visible progress indication (just loops back-and-forth for 10-20 min)

📅 `2026-05-08` | ✏️ **dhruv-anand-aintech** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26381](https://github.com/anomalyco/opencode/issues/26381)


## Description

When teamcode is processing/thinking, the UI shows only a looping spinner animation. It goes back and forth with no indication of:
- Whether progress is being made
- How far along the thinking is
- Time elapsed or estimated time remaining
- Any stateful change at all

This is especially frustrating when thinking takes 10-20 minutes — users are left staring at an unchanging spinner with no feedback that anything is actually happening.

## Expected

Some form of visible progress would be helpful, such as:
- A token count / characters streamed showing output is being generated
- Time elapsed since thinking started
- A progress bar or step indicator
- Even a small animated cursor that shows the model is actively producing tokens

## Environment

- macOS (Apple Silicon)
- teamcode CLI (latest)

---

## #26336 — MCP servers spawned 8-10x per instance on Windows, consuming ~3.5 GB RAM on startup

📅 `2026-05-08` | ✏️ **Zeal29** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26336](https://github.com/anomalyco/opencode/issues/26336)


## Description

On Windows, the TeamCode desktop app spawns **8-10 duplicate instances of every local MCP server** immediately on startup, instead of one. This causes ~3.5 GB of MCP-related process memory at idle, with 82+ child processes under `teamcode-cli.exe`.

## Environment

- **TeamCode version**: 1.3.13 (desktop)
- **OS**: Windows 11
- **RAM**: 32 GB total
- **Local MCPs configured**: 9 enabled, 4 disabled
- **System idle RAM**: ~41% (12.8 GB used)
- **TeamCode idle RAM**: ~70% (21.8 GB used) — 9 GB attributed to TeamCode

## Evidence

After a fresh restart with no sessions active, process tree under `teamcode-cli.exe`:

```
MCP Server               Instances   Process Type
─────────────────────    ─────────   ────────────
zai-mcp-server           10x         cmd.exe -> node.exe (via npx)
exa-search               9x          cmd.exe -> node.exe (via npx)
replicant                9x          cmd.exe -> node.exe (via npx)
chrome-mcp               9x          node.exe
cdp-browser              9x          node.exe
edge-tts                 8x          uvx.exe
windows-mcp              9x          uvx.exe
flaui-mcp                9x          dotnet.exe
playwright (DISABLED)    7x          cmd.exe -> node.exe (via npx)

Total: 82 direct children, ~3465 MB RAM
```

Key observations:
- **Disabled MCPs still spawn** (`playwright` is `enabled: false` but spawns 7 instances)
- Each MCP is spawned via a separate `cmd.exe` wrapper (from `npx`/`uvx`)
- The multiplier varies between 8

> *[Truncado — 4061 chars totais]*

---

## #26170 — Provider stream truncation (finishReason="other" with zero output) silently accepted, persisting half-finished assistant messages

📅 `2026-05-07` | ✏️ **edevil** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26170](https://github.com/anomalyco/opencode/issues/26170)


### Bug

When an upstream provider stream is cut mid-generation, the AI SDK emits
a fallback `finishReason: "other"` with zero output tokens. teamcode's
session processor accepts this as a normal end-of-step, persists a
truncated assistant message, and continues — no error, no retry, no
recovery indicator.

### Symptom

The session stores a half-finished message and the user gets a partial
response with no warning. Users typically respond by manually
re-prompting, get a few good turns, then hit the bug again — the
"session degradation" pattern reported in #16214.

### Trigger

```
{ type: "text-delta", delta: "..." }
{ type: "text-delta", delta: "..." }   ← upstream stream cuts here
{ type: "finish", finishReason: "other", usage: { outputTokens: 0 } }
                                                 ↑
                       AI SDK's "no stop reason was given" fallback
```

The session processor sees `finish-step` with
`finishReason === "other"` and `usage.tokens.output === 0`.

### Real-world evidence

I found more than a dozen instances of this exact pattern in my own
teamcode session database, spanning two providers (`anthropic`, `openai`)
and four models (`gpt-5.3-codex`, `claude-opus-4-6`, `claude-opus-4-7`,
`claude-haiku-4-5`). All exhibit the shape:

```json
{
  "role": "assistant",
  "finish": "other",
  "tokens": { "input": 0, "output": 0, "reasoning": 0, "cache": {...} },
  "cost": 0
}
```

In one diagnostic example the reasoning text literally ends mid-word
(`"...wh

> *[Truncado — 2523 chars totais]*

---

## #26138 — Desktop: `~text~` and `~~text~~` render as strikethrough

📅 `2026-05-07` | ✏️ **NitsanCohen770** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26138](https://github.com/anomalyco/opencode/issues/26138)


### Bug

In the desktop app, single-tilde and double-tilde wrapping is rendered as strikethrough by `marked`'s GFM-extended `del` rule (`/^(~~?)…/`).

For an AI coding assistant this is undesirable — LLMs commonly emit text like `~/Downloads/foo` (home dir), regex `[^~]`, or other tilde-using fragments, and these should not be styled.

### Repro

1. Run `bun run --cwd packages/desktop dev`
2. In a chat, send: `~hello~ and ~/Downloads/foo and ~~bye~~`
3. Observe: tilde-wrapped runs render with a line through them.

### Expected

Tildes pass through as plain text. The desktop renderer should not apply strikethrough.

### Source

`packages/desktop/src/main/markdown.ts` calls `marked(input, { gfm: true, … })`. GFM enables the `del` inline rule.

---

## #26131 — Parallel tool calls of same type produce malformed JSON (missing closing brace)

📅 `2026-05-07` | ✏️ **d7an** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26131](https://github.com/anomalyco/opencode/issues/26131)


## Bug

When making multiple parallel tool calls of the same type (e.g., two `Read` calls, two `glob` calls, two `todowrite` calls), TeamCode merges the JSON arguments incorrectly. The first object's closing `}` is dropped and the second object is concatenated directly to it, producing invalid JSON.

## Reproduction

When the AI (or a skill workflow) makes multiple parallel tool calls of the same type, the tool arguments are serialized incorrectly.

### Example 1: `read` (parallel)

**Expected (two separate valid JSON objects):**
```json
{"filePath": "/path/to/requirements.md"}
{"filePath": "/path/to/new-project.md"}
```

**Actual:**
```json
{"filePath": "/path/to/requirements.md"{"filePath": "/path/to/new-project.md", "filePath": "/path/to/questioning.md", "filePath": "/path/to/ui-brand.md", "filePath": "/path/to/project.md", "filePath": "/path/to/requirements.md"}
```

### Example 2: `glob` (parallel)

**Expected:**
```json
{"path": "/path/a", "pattern": "**/*new-project*"}
{"path": "/path/b", "pattern": "**/*new-project*"}
```

**Actual:**
```json
{"path": "/path/a", "pattern": "**/*new-project*"{"path": "/path/b", "pattern": "**/*new-project*", "path": "/path/a", "pattern": "**/*new-project*"}
```

### Example 3: `todowrite` (parallel)

**Expected:**
```json
{"todos": [{"content": "Task 1", "priority": "high", "status": "completed"}]}
{"todos": [{"content": "Task 2", "priority": "high", "status": "in_progress"}]}
```

**Actual:**
```json
{"todos": [{"content": "Task 1", "

> *[Truncado — 2769 chars totais]*

---

## #26044 — MCP tool calls render Unknown despite tools/list title metadata

📅 `2026-05-06` | ✏️ **uni-mike** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26044](https://github.com/anomalyco/opencode/issues/26044)


## Summary

TeamCode renders MCP tool calls as `Unknown` in the CLI/TUI even when the MCP server provides the standard MCP `title` field and `annotations.title` in `tools/list`.

Example display:

```text
⚙ pekg_status Unknown
```

The tool executes successfully, but the display label makes the integration look broken.

## Expected

TeamCode should use the MCP tool display title when available:

1. `tool.title`
2. `tool.annotations.title`
3. fallback to tool name

Expected display for the example below:

```text
⚙ pekg_status PeKG Status
```

## Actual

TeamCode displays:

```text
⚙ pekg_status Unknown
```

## Reproduction

TeamCode version:

```text
1.14.39
```

Configure a remote MCP server whose `tools/list` includes this tool definition:

```json
{
  "name": "status",
  "title": "PeKG Status",
  "annotations": {
    "title": "PeKG Status",
    "readOnlyHint": true
  },
  "description": "Return KB status.",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

Then run:

```bash
teamcode run "Call the PeKG status MCP tool once."
```

Observed:

```text
⚙ pekg_status Unknown
```

Raw MCP verification confirms the server is sending both display fields:

```json
{
  "name": "status",
  "title": "PeKG Status",
  "annotations": {
    "title": "PeKG Status",
    "readOnlyHint": true
  }
}
```

## Why this matters

For MCP integrations, especially onboarding users to a new tool suite, `Unknown` makes a successful tool call look misconfigured or failed. The MCP 

> *[Truncado — 1975 chars totais]*

---

## #26008 — Windows Desktop 1.14.39 release artifact is missing @parcel/watcher-win32-x64

📅 `2026-05-06` | ✏️ **netics01** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26008](https://github.com/anomalyco/opencode/issues/26008)


## Problem

The official Windows Desktop `1.14.39` installation logs a file watcher native binding error on every startup because the release artifact is missing `@parcel/watcher-win32-x64`.

This appears to be the Windows counterpart of #25842. I noticed #25996 was merged after #25842 was closed, so this may already be fixed on `dev`. This issue is to clearly document that the current Windows Desktop `1.14.39` release artifact is still affected and may need a release/backport if the fix is not yet shipped.

## Environment

- OS: Windows 11
- Client: TeamCode Desktop
- Desktop executable version: `1.14.39`
- Install path: `C:\Program Files\TeamCode\TeamCode.exe`

Version info from the installed executable:

```text
ProductVersion  : 1.14.39.0
FileVersion     : 1.14.39
FileDescription : TeamCode
```

## Observed log

This repeats across every recent Desktop startup log.

From `C:\Users\USER\.local\share\teamcode\log\2026-05-06T075806.log`:

```text
ERROR 2026-05-06T07:58:07 +774ms service=file.watcher error=Cannot find module '@parcel/watcher-win32-x64'
Require stack:
- C:\Program Files\TeamCode\resources\app.asar\out\main\chunks\node-BCdD_j2u.js failed to load watcher binding
```

Other recent logs with the same error:

```text
2026-05-06T075017.log
2026-05-06T055553.log
2026-05-06T040512.log
2026-05-06T035703.log
2026-05-06T035536.log
2026-05-06T021404.log
2026-05-05T174744.log
2026-05-05T164141.log
2026-05-05T155514.log
2026-05-05T142710.log
```

## Installed artifact inspe

> *[Truncado — 3712 chars totais]*

---

## #26003 — Windows Desktop 1.14.39 tries to install @teamcode-ai/plugin@local

📅 `2026-05-06` | ✏️ **netics01** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26003](https://github.com/anomalyco/opencode/issues/26003)


## Problem

TeamCode Desktop on Windows logs repeated config dependency install failures because it tries to install `@teamcode-ai/plugin@local`.

`@teamcode-ai/plugin` is a valid official package, but `local` is not a published npm version or dist-tag, so npm resolution fails.

This looks related to #20891, but this report is for an installed official Windows Desktop release, not a locally built preview binary.

## Environment

- OS: Windows 11
- Client: TeamCode Desktop
- Desktop executable version: `1.14.39`
- Workspace: normal git repository with an `.teamcode` directory
- Current project `.teamcode` contents: only `.gitignore`, empty `agents/`, empty `commands/`; no project plugin files and no `.teamcode/package.json`

## Observed log

From `C:\Users\USER\.local\share\teamcode\log\2026-05-06T075806.log`:

```text
WARN  2026-05-06T07:58:08 +999ms service=config dir=D:\Github\OpencodeScratch\.teamcode error=Cause([Fail(NpmInstallFailedError (cause: @teamcode-ai/plugin: No matching version found for @teamcode-ai/plugin@local.))]) background dependency install failed
```

The same warning repeated across several recent startup logs:

```text
2026-05-06T075806.log
2026-05-06T075017.log
2026-05-06T055553.log
2026-05-06T040512.log
2026-05-06T035703.log
2026-05-06T035536.log
```

## Expected

Official Desktop builds should install a published `@teamcode-ai/plugin` version matching the running TeamCode release, or skip pinning to a version when the runtime is treated as local/dev

> *[Truncado — 3638 chars totais]*

---

## #25918 — Plugin hook \	ool.execute.after\ is declared but never triggered

📅 `2026-05-05` | ✏️ **luismichio** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25918](https://github.com/anomalyco/opencode/issues/25918)


## Summary

The `tool.execute.after` hook is declared in the `Hooks` interface in `@teamcode-ai/plugin` but is **never invoked** anywhere in the TeamCode runtime. Any plugin implementing this hook will have its handler registered but silently ignored — the handler is never called.

## Details

### Hook declaration

The hook is correctly typed in `packages/plugin/src/index.ts`:

```ts
"tool.execute.after"?: (
  input: { tool: string; sessionID: string; callID: string; args: any },
  output: {
    title: string
    output: string
    metadata: any
  },
) => Promise<void>
```

The `plugin.trigger` mechanism in `packages/teamcode/src/plugin/index.ts` is also correctly implemented — it passes `output` by reference, calls all registered handlers, and returns the (possibly mutated) `output` object:

```ts
const trigger = Effect.fn("Plugin.trigger")(function* (name, input, output) {
  if (!name) return output
  const s = yield* InstanceState.get(state)
  for (const hook of s.hooks) {
    const fn = hook[name] as any
    if (!fn) continue
    yield* Effect.promise(async () => fn(input, output))
  }
  return output
})
```

### Missing call site

A search through the entire TeamCode server codebase found **zero call sites** for `plugin.trigger("tool.execute.after", ...)`:

- `packages/teamcode/src/session/processor.ts` — handles `tool-result` stream events and calls `completeToolCall()`, but no hook trigger
- `packages/teamcode/src/session/llm.ts` — assembles AI SDK tools and handles st

> *[Truncado — 3830 chars totais]*

---

## #25835 — Subagent asking for permission even though it has already

📅 `2026-05-05` | ✏️ **MartyMcFlyInTheSky** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25835](https://github.com/anomalyco/opencode/issues/25835)


### Description

My gitlab subagent has these permissions:

```
---
description: Use for GitLab tasks via the glab CLI, including issues, merge requests, pipelines, releases, and GitLab API queries.
mode: subagent
permission:
  edit: deny
  bash:
    "*": ask
    "glab *": allow
    "cat *": allow
    "git status *": allow
    "git diff *": allow
    "git log *": allow
    "git branch *": allow
    "git fetch *": allow
---
```

And it still always asks when accessing glab. So when I accept, it says it "added rule to allow `glab *` for this session" - which I already have? So why does it ask? Seems like a bug.

### TeamCode version

1.14.35

---

## #25583 — UI问题：当选项过多时确认按钮无法显示（非100%缩放分辨率）

📅 `2026-05-03` | ✏️ **LifetimeVip** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25583](https://github.com/anomalyco/opencode/issues/25583)


## 问题描述

在使用 `/question` 命令向用户提问时，如果选项过多，在显示器分辨率设置为非100%缩放（如125%、150%等）的情况下，确认按钮会被遮挡或无法看到。

## 复现步骤

1. 将显示器缩放设置为非100%（如125%、150%）
2. 触发一个包含多个选项的 `question` 命令
3. 观察对话框底部，确认按钮可能不可见

## 预期行为

无论显示器缩放比例如何，确认按钮（如"确定"按钮）应该始终可见，可能需要添加滚动条或调整布局。

## 环境信息

- 显示器缩放：非100%（如125%、150%等）
- TeamCode 版本：latest
- 操作系统：Windows

## 建议

可以考虑：
1. 为选项区域添加滚动条
2. 确保按钮区域始终固定在底部可见
3. 根据选项数量动态调整对话框高度



## #25276 — Built-in TypeScript LSP overrides custom LSP for .ets files (ArkTS/HarmonyOS)

📅 `2026-05-01` | ✏️ **Wievondii** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25276](https://github.com/anomalyco/opencode/issues/25276)


## Description

When a **custom LSP** is configured for `.ets` files (ArkTS — HarmonyOS's TypeScript dialect), the **built-in TypeScript LSP takes priority** and processes the files instead. The custom LSP shows as connected in the UI panel ("LSP • arkts-hybrid-lsp"), but its diagnostics are never surfaced to tool results. All diagnostics returned are from the TypeScript LSP, which doesn't understand ArkTS syntax.

### What happens

1. Custom LSP is configured in `teamcode.json`:
```json
{
  "lsp": {
    "arkts": {
      "command": ["ets-language-server", "--stdio"],
      "extensions": [".ets", ".arkts"]
    }
  }
}
```

2. `ets-language-server` is installed and works correctly (`--version` returns `0.1.0-hybrid`)
3. teamcode UI shows the LSP is connected: right panel displays "LSP • arkts-hybrid-lsp"
4. When editing a `.ets` file, the diagnostics returned are **all from the built-in TypeScript LSP**:

```
ERROR [4:7] Declaration expected.
ERROR [4:8] Unexpected keyword or identifier.
ERROR [4:15] Unexpected keyword or identifier.
```

These errors are TypeScript not understanding ArkTS decorators (`@Component`, `@Prop`), `build()` methods, and other ArkTS-specific syntax. The custom ArkTS LSP's diagnostics are never returned.

### Expected behavior

When a custom LSP is configured for a file extension, diagnostics from the custom LSP should be returned to tool results instead of (or in addition to) the built-in TypeScript LSP.

### Root cause (likely)

teamcode has built-in

> *[Truncado — 2681 chars totais]*

---

## #25267 — Cmd+Backspace and Opt+Backspace silently dropped in Warp (kitty mode legacy-byte fallback needed in opentui)

📅 `2026-05-01` | ✏️ **anasnajoui** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25267](https://github.com/anomalyco/opencode/issues/25267)


## Summary

When running teamcode in Warp terminal, **Cmd+Backspace** and **Opt+Backspace** do nothing in the chat input box. They work as expected (delete-to-line-start / delete-word-backward) in Ghostty.

Root cause: Warp's kitty keyboard implementation is inconsistent — it sends legacy single-byte control codes (`\x15`, `\x17`) for Cmd/Opt+Backspace even when kitty mode is active, while sending CSI u sequences for plain Ctrl+U / Ctrl+W. opentui's parser, after negotiating kitty mode, appears to drop these legacy bytes for keys that should arrive as CSI u.

This is partly a Warp bug (filed at warpdotdev/Warp), but a robustness fix in opentui — accepting legacy bytes alongside CSI u in kitty mode — would unblock affected users immediately.

## Reproduction

1. Open Warp terminal (current stable, kitty keyboard protocol enabled)
2. Run `teamcode` (v1.14.31)
3. In the chat input, type `hello world test`
4. Press **Cmd+Delete** — nothing happens (expected: line cleared)
5. Press **Opt+Delete** — nothing happens (expected: word deleted)
6. Press **Ctrl+U** — line clears ✓
7. Press **Ctrl+W** — word deletes ✓

## Evidence

Captured the actual byte sequences Warp sends teamcode (with kitty keyboard mode pushed via `\x1b[>1u`):

```
Cmd+Delete  → 15                              (legacy \x15, single byte)
Opt+Delete  → 17                              (legacy \x17, single byte)
Ctrl+U      → 1b 5b 31 31 37 3b 35 75        (= ESC[117;5u, kitty CSI u)
Ctrl+W      → 1b 5b 31 31 39 3b 35

> *[Truncado — 2875 chars totais]*

---

## #25252 — Clipboard copy path hard-codes tmux passthrough

📅 `2026-05-01` | ✏️ **rich-jojo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25252](https://github.com/anomalyco/opencode/issues/25252)


## Summary
`packages/teamcode/src/cli/cmd/tui/util/clipboard.ts` switches OSC 52 into the tmux DCS passthrough envelope whenever `TMUX` or `STY` is present.

That breaks clipboard copy in a common tmux setup:
- `set -g set-clipboard on`
- `set -g allow-passthrough off`

In that topology tmux can still handle raw OSC 52 for clipboard forwarding, but the DCS passthrough envelope is exactly what `allow-passthrough off` blocks.

## Reproduction
1. Start tmux with `set -g set-clipboard on` and `set -g allow-passthrough off`
2. Run `teamcode` inside tmux over SSH
3. Use any TeamCode-native copy path that goes through `Clipboard.copy()` (for example a sidebar/message copy action)
4. The terminal clipboard does not update

## Current behavior
The helper currently does this when `TMUX`/`STY` is set:

```ts
const sequence = passthrough ? "\x1bPtmux;\x1b${osc52}\x1b\\" : osc52
```

## Expected behavior
Please support an explicit OSC 52 mode, for example:
- `raw`
- `tmux-passthrough`
- `off`

That would let tmux users keep `allow-passthrough off` while still using tmux's own `set-clipboard on` path for raw OSC 52.

## Traceability
- Tools used: TeamCode

---

## #25232 — 调整终端窗口大小时 TUI 断开连接（Windows）

📅 `2026-05-01` | ✏️ **luofeiawyjwj** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25232](https://github.com/anomalyco/opencode/issues/25232)


## 问题描述
每次在 teamcode 运行过程中调整终端窗口大小（拖拽边缘、最大化、还原等），
与 AI 的连接就会断开，工具无响应，表现为卡死/崩溃。

## 复现步骤
1. 在 Windows 终端（PowerShell / Windows Terminal）中启动 teamcode
2. 拖拽窗口边缘调整大小，或最大化/还原窗口
3. TUI 立即断开连接、无响应

## 预期行为
窗口大小调整应被正常处理，不应导致连接断开。

## 运行环境
- 操作系统：Windows
- 终端：PowerShell / Windows Terminal

---

## #25133 — Windows Terminal over SSH: UTF-8/CJK rendering still breaks after filtering OSC startup leak

📅 `2026-04-30` | ✏️ **rich-jojo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25133](https://github.com/anomalyco/opencode/issues/25133)


## Summary
When connecting from **Windows Terminal -> SSH -> Linux -> tmux -> teamcode**, the raw OSC startup leak can be fixed locally, but **Korean / emoji / UTF-8 rendering in the TUI still breaks only in Windows Terminal**.

Termius on the same SSH target does **not** show the same rendering breakage.

## Environment
- Client terminal: Windows Terminal
- Connection path: SSH into Linux host
- Multiplexer: tmux (`TERM=tmux-256color` inside, outer `TERM=xterm-256color`)
- Server locale: `en_US.UTF-8`
- TeamCode version on host: `1.14.30`

## What was already fixed locally
A separate local wrapper bug caused the raw startup leak:
- leaked text looked like: `^[]11;rgb:0c0c/0c0c/0c0c^[\\`
- root cause: fragmented `ESC ]` / `ESC \\` sequences in an SSH wrapper parser

That fix stops the raw OSC leak, but **does not fix the remaining Korean / emoji / UTF-8 rendering problem**.

## Observed behavior
- Windows Terminal: Korean / emoji / some UTF-8 UI elements render broken / hidden in the TeamCode TUI
- Termius: same remote host, same wrapper path, no equivalent rendering breakage observed
- Linux locale itself is not the problem (`UTF-8` is configured correctly on the host)

## Why this seems distinct from the raw OSC leak
The startup OSC leak was a wrapper-layer parsing bug and is now fixed downstream.
The remaining bug still appears terminal-specific and looks more like **TeamCode / OpenTUI rendering behavior over SSH/tmux with Windows Terminal** than a locale misconfiguration 

> *[Truncado — 2013 chars totais]*

---

## #25094 — Agent stalls during long thinking blocks and plan→build mode transitions

📅 `2026-04-30` | ✏️ **zj247647898** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/25094](https://github.com/anomalyco/opencode/issues/25094)


## Description

During an extended interactive coding session (red-blue adversarial review with large file writes ~300 lines), two distinct stalls occurred where the agent appeared frozen with no user-visible output:

### Stall 1: plan → build mode transition

- The session was in `plan` (read-only) mode reviewing a 353-line markdown file
- User prompted to continue → system transitioned from `plan` → `build` mode
- Agent entered an internal reasoning block (`<thinking>`) but output **zero visible content** for an extended period
- The TUI showed no indication that processing was ongoing — appeared completely frozen
- User had to prompt "？？？？？？" twice to get a response

### Stall 2: Long thinking block with no streaming

- Agent was verifying claims against source code (multiple parallel tool calls)
- After tool results returned, agent entered a long reasoning block synthesizing ~9 complex findings
- Again, zero visible output — TUI appeared hung
- User eventually got a response after the thinking block completed

## Environment

- **OS**: Linux
- **Shell**: bash
- **Model**: deepseek-v4-pro (via API, thinking mode enabled)
- **TUI mode**: terminal CLI

## Likely causes

1. **Thinking blocks produce no streaming output** — When the model enters an extended `<thinking>` phase (30+ seconds), the TUI shows no progress indicator, spinner, or "thinking…" message. Users cannot distinguish between "model is thinking" and "process is hung."

2. **Mode transitions may drop the render 

> *[Truncado — 2495 chars totais]*

---

## #24904 — github-copilot provider rejects gpt-5.x models even though Copilot serves them; user-side teamcode.json overrides ignored

📅 `2026-04-29` | ✏️ **michaeltarleton** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24904](https://github.com/anomalyco/opencode/issues/24904)


## Summary

teamcode 1.14.29's bundled `github-copilot` provider has a runtime model whitelist that only accepts `gpt-4.1` and `gpt-4o`, but GitHub Copilot itself is actively serving `gpt-5.2` (and likely `gpt-5.5`) on the backend. Attempts to use these via `--model github-copilot/gpt-5.2` fail with `Model not found`. Adding the model under `provider.github-copilot.models` in `teamcode.json` does **not** bypass the whitelist (unlike custom providers e.g. AWS Bedrock, where manual model registrations work as passthrough).

## Evidence Copilot serves these models

GitHub Copilot's own diagnostic telemetry, captured in a recent session:

```json
{
  "gh.autofind.github_request_id": "7399:34B56A:544FAEE:5CD3145:69F197F8",
  "gh.autofind.client": "no_client_name",
  "model": "gpt-5.2",
  "message_count": 3,
  "tools_count": 7,
  "options": {"reasoning":{"effort":"medium"},"temperature":1}
}
```

`models.dev`'s public catalog also lists 27 models for the github-copilot provider including `gpt-5.2`, `gpt-5.5`, `gpt-5.4-mini`, `gpt-5.1-codex`, `gpt-5.3-codex`, etc.

## Repro

Environment: teamcode v1.14.29, Windows 11 (Git Bash + Scoop install), GitHub Copilot OAuth-authenticated via `teamcode providers list` (Pro subscription).

```bash
$ teamcode models | grep github-copilot
github-copilot/gpt-4.1
github-copilot/gpt-4o
```

Only two models surface, despite `~/.cache/teamcode/models.json` (after deletion + refresh) containing 27 github-copilot model entries from models.dev.

Direct 

> *[Truncado — 3385 chars totais]*

---

## #24862 — Instruction resolution can load AGENTS.md from sibling paths

📅 `2026-04-28` | ✏️ **rubencu** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24862](https://github.com/anomalyco/opencode/issues/24862)


## Summary
Instruction resolution walks up from a file path using a string-prefix project boundary check. A sibling path such as `/tmp/project-sibling` can be treated as inside `/tmp/project`, so its `AGENTS.md` can be attached incorrectly.

## Reproduction
1. Open a project rooted at `/tmp/project`.
2. Read a file under `/tmp/project-sibling/nested/file.ts`.
3. If `/tmp/project-sibling/AGENTS.md` exists, it can be loaded as nearby instructions.

## Expected
Only instruction files inside the active project boundary should be attached.

---

## #24650 — Editor context injects "Note: The user opened the file" on every prompt when cursor is in a file

📅 `2026-04-27` | ✏️ **gjed** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24650](https://github.com/anomalyco/opencode/issues/24650)


## Bug

When the editor has a file open with a cursor but no active selection (start == end), TeamCode injects a synthetic message into every prompt submission:

```
Note: The user opened the file "/path/to/file".
```

The user never sees this — only the AI does. It fires on every single message as long as a file has focus in the editor, regardless of whether the user intended to share that file as context.

## Reproduction

1. Open TeamCode
2. Have any file open in your editor (e.g. VS Code with the TeamCode extension)
3. Place cursor in the file without selecting any text
4. Send any prompt to the AI
5. The AI receives `Note: The user opened the file "/path/to/file".` prepended to the message

Every subsequent prompt also includes it, as long as the cursor remains in any file.

## Root cause

In the prompt submission logic, the editor selection is checked:

```js
let C0 = Y.selection()
let b0 = C0 ? [{
  id: ...,
  type: "text",
  text: (() => {
    let u0 = C0.selection.start
    let $0 = C0.selection.end
    if (u0.line === $0.line && u0.character === $0.character)
      return `Note: The user opened the file "${C0.filePath}".`
    // ... selection cases
  })(),
  synthetic: true
}] : []
```

`Y.selection()` returns a value whenever the editor has focus on a file. The `start === end` branch (no selection, just a cursor position) always resolves to the "opened the file" note. This means the note is injected on every prompt as long as the editor has any file open — which is

> *[Truncado — 1775 chars totais]*

---

## #24492 — TeamCode Go Kimi K2.5/K2.6 returns 429 insufficient balance despite active Go subscription

📅 `2026-04-26` | ✏️ **uwseoul** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24492](https://github.com/anomalyco/opencode/issues/24492)


## Summary
Kimi K2.5/K2.6 fail with a 429 error even though TeamCode Go is active and usage is low.

## Repro
- Subscribe to TeamCode Go
- Connect an TeamCode Go API key
- Run teamcode models teamcode-go
- Select teamcode-go/kimi-k2.5 or teamcode-go/kimi-k2.6

## Observed
- teamcode-go/minimax-m2.7 works
- teamcode-go/kimi-k2.5 and teamcode-go/kimi-k2.6 fail
- Logs show:
  - statusCode: 429
  - provider_name: Moonshot AI
  - is_byok: true
  - ccount suspended due to insufficient balance
  - endpoint: https://teamcode.ai/zen/go/v1/chat/completions

## Notes
TeamCode Go usage is only ~1% on the dashboard, so this does not appear to be a Go quota issue.

## Question
Should Kimi Go traffic be billed through TeamCode Go credits, or does it require separate Moonshot/BYOK balance? If it should work with Go, this looks like a routing/billing bug.

---

## #24455 — `teamcode web` behind a reverse proxy: OAuth callbacks should use the external URL, not `localhost:1455`

📅 `2026-04-26` | ✏️ **thepiwo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24455](https://github.com/anomalyco/opencode/issues/24455)


### Description

When `teamcode web` is run behind a reverse proxy (e.g. exposed at
`https://teamcode.example.com`), OAuth flows that rely on a callback URL
cannot complete. The codex plugin (ChatGPT subscription auth) starts a
side-listener on `127.0.0.1:1455` (`packages/teamcode/src/plugin/codex.ts`,
`OAUTH_PORT = 1455`) and uses
`redirect_uri=http://localhost:1455/auth/callback`. The browser running the
auth flow is on the user's own machine, not the teamcode server, so:

- The redirect lands on the user's `localhost:1455`, where nothing is
  listening.
- The listener inside the teamcode container binds to loopback, so even if
  Docker `-p 1455:1455` were added, it can't be reached. SSH tunnels also
  fail unless the bind is `0.0.0.0` and ports are published — none of which
  is reasonable to ask web-UI users to set up per-session.
- The headless/device-code mode added in 1.14.x works for some, but is
  blocked by SSO/IdP policies in some orgs.

### Proposed change

For `teamcode web` deployments, the OAuth callback should be served by the
teamcode web server itself, at the externally-reachable URL the user is
already using:

1. **Public URL config**, e.g. env var `OPENCODE_PUBLIC_URL` (or config field
   `server.publicUrl`). Could also be auto-detected from the request that
   initiated the OAuth flow (`X-Forwarded-Host` / `X-Forwarded-Proto` or
   `Host`).
2. **Serve the callback on the web server**, not a side-listener. When
   `OPENCODE_PUBLIC_URL` is set, OAuth flows 

> *[Truncado — 2597 chars totais]*

---

## #24447 — TaskTool returns no diagnostic context when subagent result text is empty or missing

📅 `2026-04-26` | ✏️ **gmnstr** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24447](https://github.com/anomalyco/opencode/issues/24447)


## Summary

`TaskTool` appears to have no diagnostic fallback when a subagent result contains no usable text output. In `packages/teamcode/src/tool/task.ts`, it serializes the last `text` part and falls back to `""` if none is found.

In one local case on `1.14.22`, this surfaced in the parent session as an empty `<task_result>`, which made it unclear whether the subagent completed without text, errored, or produced only non-text parts.

## Relevant code

In `packages/teamcode/src/tool/task.ts`:

```ts
result.parts.findLast((item) => item.type === "text")?.text ?? ""
```

This appears to collapse "no text part exists" into an empty result with no diagnostic context.

## Observed behavior

I hit this while invoking a `code-reviewer` subagent through the `task` tool. The parent session received:

```xml
<task_result>

</task_result>
```

Smaller subagent calls worked, so the subagent type was available and functional.

I do not yet have a minimal standalone reproduction. This issue combines a local observed symptom with the source behavior above.

## Why this is hard to debug

From the parent session, there is no indication whether the subagent:

- completed without text
- errored before producing text
- produced only tool/reasoning parts
- was interrupted
- hit an adapter/provider edge case

The parent receives an empty `<task_result>` body, with no diagnostic context explaining why.

## Expected behavior

If the subagent final message has no `text` part, the task result shoul

> *[Truncado — 2577 chars totais]*

---

## #24242 — Image detail parameter missing in OpenAI-compatible provider image payloads

📅 `2026-04-25` | ✏️ **gabrielttavares** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24242](https://github.com/anomalyco/opencode/issues/24242)


## Problem

When sending images to custom OpenAI-compatible providers (e.g., Z.AI GLM 5.1), the `detail` field is not included in the `image_url` object. The current payload looks like:

```json
{
  "type": "image_url",
  "image_url": {
    "url": "data:image/png;base64,..."
  }
}
```

Without `detail`, some providers default to `"low"`, which heavily downscales the image. The model receives the image without error but can barely interpret its contents.

## Expected behavior

The payload should include a `detail` field, defaulting to `"high"` or `"auto"`:

```json
{
  "type": "image_url",
  "image_url": {
    "url": "data:image/png;base64,...",
    "detail": "high"
  }
}
```

Ideally this would also be configurable per-model in `teamcode.json` (e.g., an `image_detail` option).

## Location

`internal/llm/provider/openai.go` — where `ChatCompletionContentPartImageImageURLParam` is constructed. Only the `URL` field is set; `Detail` is omitted.

Note: the `ImageURLContent` struct in `internal/message/content.go` already has a `Detail` field, but it's never used in the OpenAI provider's `convertMessages()`.

## Reproduction

1. Configure a custom provider using `@ai-sdk/openai-compatible` (e.g., Z.AI GLM 5.1)
2. Attach an image in a conversation
3. The model accepts the image but gives vague or incorrect descriptions — consistent with receiving a low-resolution thumbnail

---

## #24198 — Polish translations need improvement for clarity and natural phrasing

📅 `2026-04-24` | ✏️ **zielinsm** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24198](https://github.com/anomalyco/opencode/issues/24198)


## Description

The Polish translations in the console app and homepage could use some improvements for better clarity, consistency, and more natural phrasing.

## Specific issues

- CTA text "Zacznij za darmo" is awkward; "Zacznij bez opłat" sounds more natural
- Form validation uses "Rola" which is ambiguous; "Stanowisko" is clearer
- Homepage subtitle "Darmowe modele w zestawie" is clunky
- FAQ answers have some awkward phrasing
- Workspace labels like "Przynieś własny klucz" are literal translations
- Go pricing page has some unclear translations

## Proposed fix

Update Polish translations in  to be more natural and clear for Polish users.

---

## #24125 — Proposal: message.parts.before plugin hook for multimodal preflight

📅 `2026-04-24` | ✏️ **alohaninja** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24125](https://github.com/anomalyco/opencode/issues/24125)


## Problem

When a user pastes a large image (e.g., a 5MB Retina screenshot at 2816×1536), TeamCode returns:

```
Failed to send message (400): Malformed JSON in request body
```

The full base64-encoded image (~6.7MB) is embedded in the JSON POST body from the TUI to the internal server. Hono's JSON parser in `packages/teamcode/src/server/routes/instance/session.ts` fails before any plugin hook fires.

Beyond the crash, there's a broader problem: **no coding assistant today preprocesses images to reduce token waste.** A single Retina screenshot consumes ~1,568 Anthropic tokens. Four screenshots in a session burn ~26,000 tokens on images alone before the model reads a word of the prompt.

## Root cause

The image pipeline has no preprocessing or size limits at any stage:

```
Clipboard paste → pasteAttachment() → data:image/png;base64,<FULL_SIZE>
    ↓
POST /session/{id}/message (7MB+ JSON body)
    ↓  ← JSON.parse() fails here (400)
createUserMessage() → resolvePart()
    ↓
plugin.trigger("chat.message")  ← never reached
    ↓
AI SDK → LLM API
```

The existing `chat.message` hook fires after the JSON body is parsed — too late to prevent the crash.

## Proposal: `message.parts.before` hook

Add a hook that fires **in the TUI**, after parts are collected but before the HTTP POST is constructed:

```typescript
"message.parts.before"?: (
  input: { sessionID: string; agent?: string },
  output: { parts: PartInput[] },  // mutable
) => Promise<void>;
```

**Where it fires** — in

> *[Truncado — 5434 chars totais]*

---

## #24046 — TUI mouse reporting conflicts with native terminal copy/paste in iTerm2

📅 `2026-04-23` | ✏️ **fat0** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24046](https://github.com/anomalyco/opencode/issues/24046)


## Problem

The TeamCode TUI captures mouse events, which prevents native terminal text selection (copy/paste) in iTerm2. iTerm2 shows a prompt: *'Looks like you're trying to copy to the pasteboard, but mouse reporting has prevented making a selection.'*

Users have to click 'Temporarily disable mouse reporting' every time they want to copy text from the TUI.

## Expected behavior

Native terminal copy/paste should work without disabling mouse reporting, similar to how Claude Code's TUI handles this — it avoids capturing mouse events so terminal selection always works natively.

## Environment

- macOS, iTerm2

---

## #23915 — teamcode github run checks context.actor instead of the authenticated identity

📅 `2026-04-23` | ✏️ **Svtter** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23915](https://github.com/anomalyco/opencode/issues/23915)


## Summary

`teamcode github run` appears to validate write access against `context.actor` from the workflow event, not against the identity actually used by the Octokit client/token. This can cause false permission failures when a PR workflow is triggered by a bot-authored `synchronize` event, for example after a prior workflow pushes to the PR branch with `GITHUB_TOKEN`.

## Current behavior

In `packages/teamcode/src/cli/cmd/github.ts`:

```ts
const actor = isScheduleEvent ? undefined : context.actor

async function assertPermissions() {
  console.log(`Asserting permissions for user ${actor}...`)
  const response = await octoRest.repos.getCollaboratorPermissionLevel({
    owner,
    repo,
    username: actor!,
  })
  ...
}
```

The log message makes it look like the authenticated GitHub identity is being checked, but the code is actually checking the event actor.

## Why this breaks

For `pull_request` workflows, `context.actor` can be `github-actions[bot]` on a follow-up `synchronize` event if an earlier workflow pushed to the PR branch using `GITHUB_TOKEN`. `github-actions[bot]` is often not a collaborator on personal repos, so the check returns `permission: none` even though the workflow/token setup may be otherwise valid.

## Evidence

I verified this against multiple workflow runs:

- failed run: workflow run metadata had `actor=github-actions[bot]`, and the log showed `Asserting permissions for user github-actions[bot]...`
- successful run: workflow run metadata had 

> *[Truncado — 3119 chars totais]*

---

## #23804 — teamcode serve leaks ~14GB/hour of .so files in /tmp due to non-pooled ripgrep Workers

📅 `2026-04-22` | ✏️ **wuyang630** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23804](https://github.com/anomalyco/opencode/issues/23804)


## Summary

`teamcode serve` causes unbounded disk growth in `/tmp` by creating and destroying ripgrep Workers for every file search/list operation. Each Worker triggers Bun to extract the embedded `libopentui.so` (~4.3MB on Linux x64) to `/tmp` with a unique filename, but these files are never cleaned up.

## Root cause

Two contributing factors:

### 1. Ripgrep Workers are created and destroyed per-operation (teamcode side)

In `packages/teamcode/src/file/ripgrep.ts`, both `searchWorker()` and `filesWorker()` follow a create-use-destroy pattern:

```typescript
// Line 283 - new Worker every call
function worker() {
  return target().pipe(
    Effect.flatMap((file) => Effect.sync(() => new Worker(file, { env: env() })))
  )
}

// searchWorker: acquire → use → release(terminate)
Effect.acquireUseRelease(
  worker(),
  (w) => /* use */,
  (w) => Effect.sync(() => w.terminate()),
)
```

Every file search, file listing, or grep operation creates a fresh Worker, which is terminated immediately after.

### 2. Bun compiled binary extracts native modules per Worker (Bun side)

When running as a compiled binary, each `new Worker()` extracts embedded native modules to `/tmp` with unique hash-based filenames. These are not cleaned up on `worker.terminate()`. (Reported separately: https://github.com/oven-sh/bun/issues/29585)

## Impact

- **File size**: ~4.3 MB each (`.so` on Linux x64)
- **Rate**: ~9 files / 10 seconds under active use → **~14 GB/hour**
- **Real-world scenario**: fills

> *[Truncado — 2743 chars totais]*

---

## #23801 — Pasted images lose their original file path

📅 `2026-04-22` | ✏️ **0xWerz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23801](https://github.com/anomalyco/opencode/issues/23801)


When I paste an image into the prompt, the agent gets the image data but not the path. So if I say "copy this logo to the project" or "use this image," the agent has no idea where the original file is. It has to try to decode the base64 and save it manually, which doesn't really work.

**What happens now:**

Paste an image from disk → agent sees `[Image 1]` with raw pixel data → agent thinks "I don't have a direct file path" → tries to decode base64 and re-save the image, which breaks the workflow.

For example, I pasted an image and told the agent to copy it somewhere. It couldn't because there was no path to reference. It just got stuck trying to extract the image from the attachment instead of using the original file.

![agent-thinking-no-path](https://raw.githubusercontent.com/0xWerz/teamcode/assets/issue-screenshot/.github/assets/issue-23801-screenshot.png)

**What i think should happen:**

If the image came from a file on disk, the agent should know the path so it can reference or copy it directly. Not sure how it should work for screenshots or copied image data, but at least for actual files this would save a lot of hassle.

Related: #17488

PR: #23802

---

## #23607 — POST /session ignores directory query parameter for session record

📅 `2026-04-20` | ✏️ **Arthur-GH** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23607](https://github.com/anomalyco/opencode/issues/23607)


## Summary

When creating a session via `POST /session?directory=/path/to/project`, the server ignores the `directory` query parameter and sets the session's `directory` field to `process.cwd()` instead.

## Context

OpenChamber (desktop GUI) runs a single TeamCode server and uses the `directory` query parameter to scope sessions to different project directories. The SDK correctly sends `directory` as a query param on session creation:

```js
// From @teamcode-ai/sdk
create(D, B) {
  let F = p0([D], [{args: [
    {in: "query", key: "directory"},  // ← sent but ignored
    {in: "query", key: "workspace"},
    {in: "body", key: "parentID"},
    {in: "body", key: "title"},
    ...
  ]}]);
  return this.client.post({url: "/session", ...});
}
```

But the resulting session in the SQLite DB always has `directory = process.cwd()`, regardless of the query param value.

## Evidence

- Launched TeamCode server from `/Users/me` (via OpenChamber desktop)
- Created session with `directory=/Users/me/projects/myapp` via the SDK
- DB shows: `directory: /Users/me`, `project_id: global`
- Changed server cwd to `/Users/me/projects` via a wrapper script
- New sessions now show `directory: /Users/me/projects` — confirming the field comes from `process.cwd()`, not the query param

## Expected behavior

When `directory` is provided as a query parameter on `POST /session`, the session record should use that value for its `directory` field (and resolve the matching project accordingly).

## Environme

> *[Truncado — 1574 chars totais]*

---

## #23446 — macOS notifications show as 'Script Editor' instead of terminal app — no click-to-focus

📅 `2026-04-19` | ✏️ **dexion** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23446](https://github.com/anomalyco/opencode/issues/23446)


## Problem

On macOS, desktop notifications from TeamCode appear to come from **"Script Editor"** (AppleScript) instead of the terminal emulator (iTerm2, Terminal.app, etc.). Clicking the notification opens Script Editor instead of focusing the correct terminal tab.

This happens because TeamCode uses `osascript -e 'display notification...'` as a fallback, and macOS attributes the notification to the osascript process (Script Editor) rather than the terminal.

## Expected Behavior

- Notifications should be attributed to the terminal emulator (iTerm2, Terminal.app, etc.)
- Clicking a notification should focus the correct terminal tab/window
- On iTerm2 specifically, notifications should use OSC 9 escape sequences for native integration

## Current State

I found **PR #23212** (`feat(tui): add terminal notifications` by @kitlangton) which addresses this by adding:
- OSC 9 escape sequences (`\x1b]9;message\x07`) for iTerm2, Ghostty, Apple Terminal, Warp
- OSC 777 for Kitty, WezTerm, VTE-based terminals
- Bell (`\x07`) as fallback
- Auto-detection based on `TERM_PROGRAM`

However, this PR is:
- **Draft** status
- Has **merge conflicts**
- Open since April 18

## Suggested Fix

The notification resolution logic from PR #23212 looks correct:

```typescript
// For iTerm2
if (env.TERM_PROGRAM === "iTerm.app") return "osc9"  // \x1b]9;title:body\x07

// For Kitty/WezTerm
if (env.KITTY_WINDOW_ID || env.TERM === "xterm-kitty") return "osc777"  // \x1b]777;notify;title;body\x07

// Fall

> *[Truncado — 2004 chars totais]*

---

## #23432 — teamcode -c 在新目录中导致黑屏无法退出

📅 `2026-04-19` | ✏️ **sharyuke** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23432](https://github.com/anomalyco/opencode/issues/23432)


## Bug 描述

在新打开的目录（从未使用过 teamcode 的目录）中执行 `teamcode -c` 命令时，出现黑屏，无法退出，也无法重新打开 teamcode。

## 环境信息

- teamcode 版本：1.14.17
- 安装路径：/home/sharyuke/.teamcode/bin/teamcode
- 平台：Linux
- Shell：bash

## 复现步骤

1. 进入一个从未使用过 teamcode 的目录
2. 执行 `teamcode -c` 命令
3. 出现黑屏，无法操作
4. 无法退出（Ctrl+C、Ctrl+D 均无响应）
5. 无法重新打开 teamcode

## 预期行为

即使在新的目录中，`teamcode -c` 也应该正常启动或给出合理的错误提示，而不是导致黑屏无法退出。

## 补充

可能是配置目录或初始化文件不存在导致的崩溃问题。

---

## #23258 — Permission model: project-local routine approvals + sibling worktree trust are too noisy for autonomous contributor sessions

📅 `2026-04-18` | ✏️ **samuelazran** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23258](https://github.com/anomalyco/opencode/issues/23258)


## Summary
TeamCode still becomes too approval-noisy for long-running autonomous contributor sessions, even when the project has already approved routine repo work conceptually.

The main pain point is not dangerous commands. It is repeated prompts for normal project work like:
- git fetch / branch / merge / commit / push
- gh issue/pr status/comment/update commands
- file reads/writes inside sibling worktrees for the same repo family
- subagent/task launches used for review + queue triage pressure

## Why this matters
In a multi-worktree contributor workflow, an autonomous agent may keep:
- one write lane on `repo-A`
- another write lane on `repo-A-389`
- a third read-only research lane on `repo-A-515`

Even when the operator wants these to run without hand holding, the effective permission experience is still too noisy unless every project config is tuned very aggressively.

Two specific problems:

1. `always` approvals are still session-scoped and do not solve the “same routine action tomorrow / next restart / next connected client” problem well enough.
2. `external_directory` defaults to `ask`, so sibling worktrees of the same trusted repo family can still trigger approval churn unless the project explicitly whitelists the broader parent path.

## Current documented behavior
The docs currently say:
- most permissions default to `allow`
- `external_directory` defaults to `ask`
- `always` approvals are for the rest of the current session
- project config can override with `

> *[Truncado — 3456 chars totais]*

---

## #23049 — Agent names displayed incorrectly with ZWSP characters in TUI (e.g., "Ultraworker" → "ltraworker")

📅 `2026-04-17` | ✏️ **CoolstrangerFJ** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23049](https://github.com/anomalyco/opencode/issues/23049)


## Description

When using oh-my-openagent plugin with TeamCode TUI, agent names are displayed incorrectly - missing the first few characters. This is caused by zero-width space (ZWSP, U+200B) characters used for sort prefixes in `AGENT_LIST_SORT_PREFIXES`.

## Environment

- TeamCode version: 1.4.0
- oh-my-openagent version: 3.17.4
- Terminal: iTerm2 on macOS
- TERM: xterm-256color
- Locale: zh_CN.UTF-8

## Symptoms

| Expected | Actual |
|----------|--------|
| Sisyphus - Ultraworker | Sisyphus - ltraworker (missing 'U') |
| Prometheus - Plan Builder | Prometheus - Plan lder (missing 'Bui') |

The number of missing characters correlates with the number of ZWSP characters in `AGENT_LIST_SORT_PREFIXES`:
- sisyphus: 1 ZWSP → 1 char missing
- prometheus: 3 ZWSPs → 3 chars missing

## Root Cause

oh-my-openagent uses ZWSP characters for sorting agent names in the dropdown:

```typescript
AGENT_LIST_SORT_PREFIXES = {
  sisyphus: "\u200B",
  hephaestus: "\u200B\u200B",
  prometheus: "\u200B\u200B\u200B",
  atlas: "\u200B\u200B\u200B\u200B"
};
```

While v3.17.3/v3.17.4 added `stripInvisibleAgentCharacters()` for agent lookups, the TUI display still shows these ZWSP characters, and certain terminals/font configurations render them as having actual width, causing the first visible characters to be "eaten".

## Related Issues

- code-yeongyu/oh-my-openagent#3457 - Strange agent displayName
- code-yeongyu/oh-my-openagent#22131 - Agent label renders incorrectly
- code-yeongyu/oh-my-ope

> *[Truncado — 1886 chars totais]*

---

## #23043 — GitHub Copilot claude-opus-4.7: configured/subagent variant handling appears inconsistent; 'low' workaround is invalid

📅 `2026-04-17` | ✏️ **i010542** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23043](https://github.com/anomalyco/opencode/issues/23043)


## Summary
When using `github-copilot/claude-opus-4.7`, `--variant medium` works in direct CLI invocation, but the recommended workaround of switching to `variant: low` is invalid because the model rejects `low` outright.

This suggests the real problem is likely in the configured/subagent/provider path that maps `medium` incorrectly in some flows, not in the model's support for `medium` itself.

## Environment
- TeamCode version: `1.4.7`
- Provider: `GitHub Copilot`
- Model: `github-copilot/claude-opus-4.7`

## What I tested
### 1) Direct CLI with `medium` works
```bash
teamcode run -m github-copilot/claude-opus-4.7 --variant medium --dangerously-skip-permissions "Reply with ORACLE_OK only."
```

Result:
```text
> Sisyphus - Ultraworker · claude-opus-4.7
ORACLE_OK
```

### 2) Direct CLI with `low` fails
```bash
teamcode run -m github-copilot/claude-opus-4.7 --variant low --dangerously-skip-permissions "Reply with ORACLE_OK only."
```

Result:
```text
Error: Bad Request: {"error":{"message":"output_config.effort \"low\" is not supported by model claude-opus-4.7; supported values: [medium]","code":"invalid_reasoning_effort"}}
```

## Why this seems buggy
I was previously told that in some TeamCode + GitHub Copilot flows, `variant: medium` was being mapped to an unsupported effort (effectively `high`) for `claude-opus-4.7`, and that switching to `variant: low` was a workaround.

But based on the direct tests above:
- `medium` is valid for `claude-opus-4.7`
- `low` is not valid 

> *[Truncado — 2330 chars totais]*

---

## #22850 — --model 参数在持久会话模式下不生效

📅 `2026-04-16` | ✏️ **teng2-doudou** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22850](https://github.com/anomalyco/opencode/issues/22850)


# Issue: `--model` 参数在持久会话模式下不生效

## 问题描述

在使用 `acpx` 驱动 TeamCode 时，`--model` 参数在持久会话（`sessions`）模式下存在配置不生效的问题。

### 具体表现

1. **创建会话时**：`--model` 参数可以正确设置模型
2. **连接已有会话时**：模型被重置为默认的 `big-pickle`，而非创建时指定的模型

## 复现步骤

### 步骤1：创建会话时指定模型
```bash
cd /path/to/project
acpx --model baowu_ds_proxy/DeepSeek-R1 teamcode sessions new --name test-session
```

### 步骤2：验证创建时的模型（exec 模式）
```bash
acpx --model baowu_ds_proxy/DeepSeek-R1 teamcode exec "请输出当前模型"
# 输出：DeepSeek-R1 ✅ 正确
```

### 步骤3：连接已有会话
```bash
acpx teamcode -s test-session "请输出当前模型"
# 输出：big-pickle ❌ 错误，应该是 DeepSeek-R1
```

## 测试结果

| 模式 | `--model` 位置 | 实际模型 | 结果 |
|------|---------------|---------|------|
| `exec` | `acpx --model xxx teamcode exec` | DeepSeek-R1 | ✅ 正确 |
| `sessions new` | `acpx --model xxx teamcode sessions new` | DeepSeek-R1 | ✅ 创建时正确 |
| `-s` (连接) | `acpx teamcode -s xxx` | big-pickle | ❌ 错误 |

## 预期行为

连接已有会话时，应该保持创建会话时指定的模型配置，而不是重置为默认模型。

## 实际行为

连接已有会话时，模型被重置为 `teamcode/big-pickle`（TeamCode 默认模型）。

## 影响

1. 无法使用持久会话模式配合自定义模型
2. 必须在每次对话时使用 `exec` 模式（新建会话），无法享受持久会话的历史记录功能
3. 对于需要特定模型（如 DeepSeek-R1）的场景，用户体验受损

## 环境信息

- **操作系统**：macOS (darwin)
- **acpx 版本**：最新版（通过 npm 安装）
- **TeamCode 版本**：最新版
- **项目配置**：`teamcode.json` 中指定了自定义模型

## 临时解决方案

使用 `exec` 模式代替 `sessions` 模式：

```bash
# 每次新建会话，确保模型正确
acpx --model baowu_ds_proxy/DeepSeek-R1 teamcode exec "提示词"
```

**缺点**：不保留对话历史记录。

## 建议修复

1. 在连接已有会话（`-s`）时，检查并恢复会话创建时的模型配置
2. 或者允许在连接会话时通过 `--model` 参数覆盖模型配置
3. 在文档中明确说明 `--model` 参数在不同模式下的行为差异

## 相关配置

###

> *[Truncado — 1808 chars totais]*

---

## #22650 — perf: diff pipeline causes severe UI lag on desktop — full-context patches + synchronous parsing on main thread

📅 `2026-04-15` | ✏️ **cpkt9762** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22650](https://github.com/anomalyco/opencode/issues/22650)


## Description

The diff pipeline (both VCS diff and Session diff) causes **severe UI jank on the desktop app**. Disabling both systems completely eliminates the lag — confirming the diff subsystem as the root cause.

This affects two independent diff systems:
- **VCS diff** (`/vcs/diff` endpoint) — git working tree / branch diff
- **Session diff** (`SessionSummary`) — AI-generated file change diffs per session

## Root Cause Analysis

The core design issue is using **full-context unified patches as the universal transport format** between backend and frontend, which creates triple redundant work:

1. **Backend** generates full-file patches with `formatPatch(structuredPatch(..., { context: Number.MAX_SAFE_INTEGER }))` — expensive git ops + string processing
2. **Frontend** parses the patch back into before/after content via `parsePatch()` in `session-diff.ts`
3. **Frontend** feeds reconstructed content to `@pierre/diffs` `parseDiffFromFile()` which re-diffs it — **synchronously on the main thread**

### Bottleneck Ranking (by perceived lag contribution)

| Rank | Bottleneck | Location | Impact |
|------|-----------|----------|--------|
| **#1** | `SessionReview.items()` eagerly runs `normalize()` → `parseDiffFromFile()` for ALL files synchronously on main thread | `packages/ui/src/components/session-review.tsx` + `session-diff.ts` | **UI freeze** |
| **#2** | Backend generates `Number.MAX_SAFE_INTEGER` context patches — oversized payloads | `packages/teamcode/src/project/vcs.

> *[Truncado — 3733 chars totais]*

---

## #22643 — Edit tool applies session project's formatter instead of target file's formatter for cross-project edits

📅 `2026-04-15` | ✏️ **siminn-johanngj** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22643](https://github.com/anomalyco/opencode/issues/22643)


## Description

When editing a file that belongs to a **different project** than the TeamCode session, the edit tool applies the **session project's formatter** instead of detecting and using the **target file's project formatter**.

This means the wrong formatter (not just the wrong config) is applied to the file.

## Concrete example

- **Session project** (`/code/project-a/`): has `biome.json` with `quoteStyle: "single"`
- **Target file** (`/code/project-b/redux/services/baseApi.ts`): project has `.prettierrc` with `singleQuote: false` (double quotes), no `biome.json`

When the edit tool modifies `baseApi.ts`, TeamCode runs **Biome** (from project-a) instead of **Prettier** (from project-b). Result: the entire file gets reformatted with single quotes, reorganized imports, and trailing commas — none of which match the target project's conventions.

The diff shows 72 insertions / 77 deletions for what should be a 3-line addition.

## Relation to #17051

Issue #17051 describes the same formatter using the wrong **config** (Elixir's `mix format` resolves `.formatter.exs` from session cwd). This issue is broader: TeamCode picks the wrong **formatter entirely** — Biome instead of Prettier — because it never inspects the target file's project for its own formatter configuration.

## Expected behavior

When formatting a file after edit, TeamCode should:

1. Walk up from the target file's directory to find the nearest formatter config (`biome.json`, `.prettierrc`, `.formatter.exs`,

> *[Truncado — 2069 chars totais]*

---

## #22349 — When jumping back to a message that invoked skill, the skill is expanded in the prompt input

📅 `2026-04-13` | ✏️ **raine** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22349](https://github.com/anomalyco/opencode/issues/22349)


### Description

If you invoke a skill with `/myskill`, and then later jump back to that message, you see the skill prompt expanded, and if you want to edit the message, you have to clear the whole expanded prompt which could be massive.

Claude code retains just the `/myskill` when jumping back, which I believe is the desired behavior here.


### TeamCode version

v1.4.3

---

## #22208 — perf: session loop re-reads all messages from DB every iteration

📅 `2026-04-12` | ✏️ **tobias-weiss-ai-xr** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22208](https://github.com/anomalyco/opencode/issues/22208)


## Bug

`filterCompactedEffect` reads every message from the DB (via paginated SQL) at the start of each runLoop iteration, then discards pre-compaction messages. For compacted sessions with hundreds of messages, this means re-reading and discarding the same pre-compaction messages on every tool call round-trip.

## Details

In `prompt.ts:1314`, `filterCompactedEffect(sessionID)` is called every loop step. This calls `stream(sessionID)` which does `ceil(N/50)` paginated SQL queries for all N messages in the session. Then `filterCompacted()` scans forward to find the last compaction boundary and discards everything before it.

For a session with 500 messages (300 pre-compaction, 200 post-compaction), each iteration does ~10 SQL queries but only uses ~200 messages. The pre-compaction messages are read and discarded every time.

## Suggested Fix

Cache the compaction boundary (first post-compaction message ID/timestamp) per session and pass it as a `since` parameter to `stream()` so it adds a `WHERE` clause to skip older rows. The cache invalidates when a new compaction is created.

This would reduce DB reads by ~60% per iteration for compacted sessions.

- [x] I've verified this exists in the latest version

---

## #22189 — Windows backslash paths break tool titles and glob patterns

📅 `2026-04-12` | ✏️ **tobias-weiss-ai-xr** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22189](https://github.com/anomalyco/opencode/issues/22189)


## Problem

On Windows, file paths contain backslashes (C:\Users\...). Several tool titles and glob patterns use these raw paths, which breaks:

1. **Tool titles** — backslashes are interpreted as escape characters
2. **Glob patterns** — backslash-prefixed paths don't match on POSIX-based pattern matching
3. **Display** — inconsistent path representation across the UI

## Expected Behavior

All internal path handling should normalize backslashes to forward slashes, consistent with how Node.js and most tooling handle cross-platform paths.

## Environment

- OS: Windows 10/11
- Shell: PowerShell / WSL

---

## #22081 — Desktop app starts maximized on Linux/Wayland; causes poor dialog behavior on tiling compositors

📅 `2026-04-11` | ✏️ **ndrwstn** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22081](https://github.com/anomalyco/opencode/issues/22081)


Hi! I think TeamCode Desktop is forcing a maximized main window on Linux, and this causes poor UX on tiling Wayland compositors like Hyprland.

## Summary

On Hyprland/NixOS, TeamCode Desktop does not open like a normal tiled app window. Instead, the main window appears to start maximized/fullscreen-ish, and native dialogs such as the project/file picker can behave poorly as a result.

In practice, the file picker can appear behind or otherwise not behave like a normal modal dialog.

## Environment

- TeamCode Desktop
- Linux
- Wayland
- Hyprland
- NixOS

## What I observed

From runtime inspection in Hyprland:

- main window title: `TeamCode`
- picker/dialog title: `Open project`
- both windows are native Wayland
- both windows are non-floating

This initially looked like a portal issue, but `xdg-desktop-portal` and `xdg-desktop-portal-gtk` were both running correctly.

I also verified this is not caused by my Hyprland config forcing TeamCode to fullscreen or float.

## Likely root cause

Looking at the desktop app source/package, it appears the main Tauri window is created with:

```rust
.maximized(true)
```

and the app also uses the Tauri window-state plugin to persist/restore window state.

That seems to mean TeamCode is explicitly asking to start maximized, rather than letting the compositor/window manager place the window naturally.

On a tiling compositor like Hyprland, this leads to awkward behavior for dialogs like `Open project`, which then do not feel properly mod

> *[Truncado — 2260 chars totais]*

---

## #21941 — teamcode export can write session JSON that teamcode import cannot read in 1.4.3

📅 `2026-04-10` | ✏️ **christianknauer** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21941](https://github.com/anomalyco/opencode/issues/21941)


## Summary

`teamcode 1.4.3` can export a session JSON file that `teamcode 1.4.3` cannot import again.

The failure happens with sessions that still contain legacy pre-1.4 data shapes. `export` appears to serialize that legacy shape as-is, while `import` validates against the new 1.4 schema.

## Version

```bash
teamcode --version
# 1.4.3
```

## Repro

1. Export an existing session:

```bash
sid=$(teamcode session list --format json -n 1 | jq -r '.[0].id')
teamcode export "$sid" > /tmp/session.json
```

2. Try to import the exported file:

```bash
teamcode import /tmp/session.json
```

## Actual result

Import fails with:

```json
[
  {
    "expected": "string",
    "code": "invalid_type",
    "path": ["summary", "diffs", 0, "patch"],
    "message": "Invalid input: expected string, received undefined"
  }
]
```

I also see legacy user message fields like top-level `variant` in the exported JSON.

## Expected result

A file produced by `teamcode export` should be importable by `teamcode import` in the same version.

## What I found

The exported file contains legacy-shaped data such as:

- `messages[].info.variant` instead of `messages[].info.model.variant`
- `summary.diffs[*].before/after` without `patch`

I wrote a local converter that:
- moves `messages[].info.variant` -> `messages[].info.model.variant`
- replaces legacy `summary.diffs[*].before/after` with a schema-valid `patch` string

After that conversion, `teamcode import` succeeds.

## Important follow-up finding

Ev

> *[Truncado — 2783 chars totais]*

---

## #21913 — Multi-step tool calls overwrite token counts instead of accumulating (output, reasoning, cache.write lost)

📅 `2026-04-10` | ✏️ **KonstantinMirin** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21913](https://github.com/anomalyco/opencode/issues/21913)


## Bug

In multi-step tool-call assistant messages, `processor.ts` overwrites `assistantMessage.tokens` on each `finish-step` event instead of accumulating additive fields. Only the last step's token counts survive.

**Root cause:** `processor.ts` line ~362:
```ts
ctx.assistantMessage.tokens = usage.tokens  // overwrite!
```

While `ctx.assistantMessage.cost += usage.cost` correctly accumulates, `tokens` is replaced wholesale.

## Impact

For an assistant message with N tool-call steps:

| Field | Current | Correct | Why |
|---|---|---|---|
| `input` | Last step's value | Last step's value | Each step's `inputTokens` includes the full conversation prompt → last step is already correct |
| `cache.read` | Last step's value | Last step's value | Cache read reflects current cache state → snapshot, not cumulative |
| `output` | Last step only | **Sum across all steps** | Each step produces new output tokens |
| `reasoning` | Last step only | **Sum across all steps** | Each step produces new reasoning tokens |
| `cache.write` | Last step only | **Sum across all steps** | Each step may write new entries to cache |
| `total` | API `totalTokens` from last step | **Derived from components** | `totalTokens` = `inputTokens + outputTokens`, but our `input` is adjusted (cache subtracted) |
| `cost` | Correctly accumulated | No change | Already uses `+=` |

Also fixes:
- Context % display and compaction used `total` (which double-counted cached tokens) instead of deriving from components
- 

> *[Truncado — 3656 chars totais]*

---

## #21829 — `--prompt` is ignored when combined with `--session --fork` in TUI mode

📅 `2026-04-10` | ✏️ **raine** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21829](https://github.com/anomalyco/opencode/issues/21829)


### Description

When launching teamcode in TUI mode with `--session <id> --fork --prompt "..."`, the session is forked correctly but the prompt is never sent as a message. 

**Reproduction:**

```bash
# 1. Create a session, note the session ID
teamcode

# 2. Fork it with a prompt - prompt is ignored, but you can see if you press arrow up
teamcode --session ses_xxxx --fork --prompt "hello"
```

**Expected:** The forked session should open with "hello" automatically sent as the first new user message.

**Actual:** The forked session opens but no message is sent. The `--prompt` flag is silently ignored.


### Plugins

_No response_

### TeamCode version

1.4.3

---

## #21794 — Terminal frozen and unable to create new instances - v1.4.3 (Windows 10)

📅 `2026-04-10` | ✏️ **hongenge** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21794](https://github.com/anomalyco/opencode/issues/21794)


### Description

In version v1.4.3, the integrated terminal becomes completely unresponsive. Users cannot type any characters, and the cursor does not move. Additionally, the "New Terminal" function is broken; clicking the button or using the shortcut results in no action.


### TeamCode version

v1.4.3


### Operating System

Windows 10

---

## #21707 — qwen3.6-plus-free still appears in Zen discovery

📅 `2026-04-09` | ✏️ **sumneshsalodkar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21707](https://github.com/anomalyco/opencode/issues/21707)


TeamCode Zen still needs to fully hide qwen3.6-plus-free from model discovery and fail explicitly if stale config tries to use it. This should cover Zen metadata, TeamCode provider discovery, and stale config/API usage.

---

## #21700 — 卸载 oh-my-teamcode 后重新安装 teamcode，TUI 仍显示 Sisyphus 等 agents

📅 `2026-04-09` | ✏️ **a523926245** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21700](https://github.com/anomalyco/opencode/issues/21700)


## 环境
- teamcode-ai@1.4.1
- Windows

## 问题描述
1. 之前安装过 oh-my-teamcode，后来从 teamcode.json 中移除并卸载
2. 完全卸载 teamcode-ai 后重新安装
3. 在 K: 盘（无 .teamcode 配置）运行
4. teamcode agent list 只显示原生 agents (build, plan, explore 等)
5. 但 TUI 左下角 agent 切换显示 Sisyphus、Hephaestus、Prometheus、Atlas
6. 当前会话使用 Sisyphus agent，标题显示 Sisyphus - Ultraworker

## 期望行为
卸载插件后应只显示原生 agents (build, plan, explore, general, compaction, summary, title)

---

## #21673 — github run: eyes reaction not removed when USE_GITHUB_TOKEN=true

📅 `2026-04-09` | ✏️ **syakovyn** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21673](https://github.com/anomalyco/opencode/issues/21673)


## Bug

When running `teamcode github run` with `USE_GITHUB_TOKEN=true`, the 👀 (eyes) reaction added as a processing indicator is never removed.

## Root Cause

`AGENT_USERNAME` is hardcoded to `"teamcode-agent[bot]"` in `packages/teamcode/src/cli/cmd/github.ts`. The `removeReaction()` function filters reactions by `r.user?.login === AGENT_USERNAME` to find the one to delete.

However, when `USE_GITHUB_TOKEN=true`, the reaction is created by `github-actions[bot]` (the identity behind `GITHUB_TOKEN`), not `teamcode-agent[bot]`. The filter finds no match and silently returns without deleting:

```typescript
const AGENT_USERNAME = "teamcode-agent[bot]"

// In removeReaction():
const eyesReaction = reactions.data.find((r) => r.user?.login === AGENT_USERNAME)
if (!eyesReaction) return  // <-- always hits this path with USE_GITHUB_TOKEN
```

## Expected Behavior

The eyes reaction should be removed regardless of whether the OIDC app token or `GITHUB_TOKEN` is used.

## Suggested Fix

Resolve the authenticated user dynamically (e.g., `GET /user` or from the reaction creation response) instead of comparing against the hardcoded `"teamcode-agent[bot]"` username.

## Reproduction

1. Set up a workflow with `USE_GITHUB_TOKEN: 'true'` and `GITHUB_TOKEN: ${{ github.token }}`
2. Trigger `teamcode github run` on a PR
3. Observe the 👀 reaction is added but never removed
4. Logs show "Adding reaction..." and "Removing reaction..." but the reaction persists

## Workaround

Add a cleanup step a

> *[Truncado — 1864 chars totais]*

---

## #21564 — GitHub Copilot plugin ignores user-configured model limit overrides

📅 `2026-04-08` | ✏️ **giorgosdi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21564](https://github.com/anomalyco/opencode/issues/21564)


## Problem

User-configured `limit` overrides for GitHub Copilot models are silently discarded. The Copilot plugin always overwrites `limit.context`, `limit.input`, and `limit.output` with API-reported values, even when the user explicitly sets them in `teamcode.json`.

This causes compaction to trigger much earlier than expected — around 11-13% of the configured context window — because:

1. The user sets `limit.context: 1000000` in config
2. The Copilot plugin fetches model info from the API and rebuilds limits entirely from the response (`max_context_window_tokens`, `max_prompt_tokens`, `max_output_tokens`)
3. The `prev` model (carrying user config) is passed to `build()` but only used for `family`, `name`, `options`, `variants`, `capabilities`, etc. — **not** for `limit`
4. Compaction checks `limit.input` (= `max_prompt_tokens`, ~128K from API), not `limit.context`
5. The UI percentage is calculated against `limit.context`, so compaction at ~128K tokens shows as ~12.8% of 1M

## Config example

```json
{
  "provider": {
    "github-copilot": {
      "models": {
        "claude-opus-4.6": {
          "limit": {
            "context": 1000000,
            "output": 64000
          }
        }
      }
    }
  },
  "compaction": {
    "auto": true,
    "prune": true,
    "reserved": 2000
  }
}
```

Despite this config, compaction triggers at ~128K tokens (the API-reported `max_prompt_tokens`), not at ~1M.

## Root cause

In `packages/teamcode/src/plugin/github-copilot/models.

> *[Truncado — 3081 chars totais]*

---

## #21325 — Missing validation for .env access

📅 `2026-04-07` | ✏️ **itpropro** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21325](https://github.com/anomalyco/opencode/issues/21325)


### Description

I often see models in plan mode accessing the .env file with python without any validation coming up, but it comes up when using native tools like bash:

```
$ python - <<'PY'
from pathlib import Path
vals = {}
for line in Path('.env').read_text().splitlines():
    line=line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    k,v=line.split('=',1)
    vals[k]=v
for k in ['ENV_KEY_THE_LLM_WANTS']:
    v=vals.get(k,'')
    print(f"{k}_len={len(v)}")
PY
ENV_KEY_THE_LLM_WANTS=XYZ
```

---

## #21298 — [UI/UX] 護告與錯誤訊息應般用不同顏色化分

📅 `2026-04-07` | ✏️ **vito0527opencode** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21298](https://github.com/anomalyco/opencode/issues/21298)


## 問題描述

目前 TeamCode 工具的護告訊息（如 "You must read file..."）和錯誤輰出都使用目同的紅色文字喊現。

用戶看到紅字會直覺認為是系統錯誤或當機，增加不必覆的緊張。

## 建議

|類型|建議顏色|
|------|----------|
|護告（Warning）|🟡 黃色|
|錯誤（Error）|🟠 紅色|

## 登当

*Feedback from user via TeamCode session*

---
