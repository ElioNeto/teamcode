# 📋 Não Categorizados

> **Total:** 156 | Extraído em 2026-05-17

---

## #27920 — Trailing-assistant 400 on llama.cpp/vLLM with thinking-on templates (Qwen3, DeepSeek-R1, GLM-thinking, Kimi-K2-Thinking, MiniMax-M2)

📅 `2026-05-16` | ✏️ **feanor5555** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27920](https://github.com/anomalyco/opencode/issues/27920)


### Symptom

Local OpenAI-compatible servers running thinking-on-by-default chat templates (llama.cpp `--reasoning on`, vLLM with reasoning, TGI with thinking, mistral.rs, etc.) reject any opencode request whose **last** message is `role:"assistant"`, with:

```
HTTP 400 {"error":{"message":"Assistant response prefill is incompatible with enable_thinking."}}
```

opencode emits a trailing-assistant message in two situations, both of which trip this error:

1. **Empty trailing assistant** — `message-v2.toModelMessagesEffect` sometimes builds an assistant `UIMessage` whose only parts are `[step-start, reasoning("")]`. `convertToModelMessages` collapses that to `content:""`, which is sent as a trailing assistant turn.
2. **Non-empty trailing assistant** — `session/prompt.ts` deliberately injects a `MAX_STEPS` wrap-up instruction as `role:"assistant"` (response continuation / prefill).

### Reproduction

1. Run a llama-server with a thinking template, e.g.:
   ```
   llama-server --model Qwen3.5-9B-...gguf --reasoning on --jinja --port 8080
   ```
2. Point opencode at it via an `@ai-sdk/openai-compatible` provider in `opencode.json`.
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

When running `opencode plugin install <package>` from a non-interactive shell (e.g., PowerShell, subprocess, CI), the spinner animation frames are printed as individual lines instead of being rendered in-place as an animation.

## Reproduction

1. Run from PowerShell: `opencode plugin install opencode-session-search`
2. Observe the output: each spinner frame (◓, ◑, ◒, ◐) appears on its own line with "Installing plugin package..." repeated

## Root Cause

The `plugin install` command uses TUI spinner escape sequences (\r + ANSI CSI) without checking whether stdout is a TTY (via isatty). In non-interactive environments, carriage returns are not interpreted, so each frame becomes a separate line of output.

## Expected Behavior

- In TTY: inline spinner animation (current behavior, correct)
- In non-TTY: simple static text like "Installing plugin package..." without escape sequences, or just silent with exit code

## Environment

- OpenCode v1.15.3 (probably affects all versions)
- Windows 11, PowerShell 7
- Also affects CI/CD and subprocess invocations

## Suggested Fix

Add an isatty check (e.g., Go's term.IsTerminal or Node's process.stdout.isTTY) before outputting spinner sequences. Fall back to plain text or no output when stdout is not a terminal.

---

## #27904 — 请增加tokens统计

📅 `2026-05-16` | ✏️ **Wuuwei** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27904](https://github.com/anomalyco/opencode/issues/27904)


### Question

当前opencode-go订阅页面，无法统计某模型的tokens使用量，希望增加

---

## #27843 — session_diff read/write race can trigger Unexpected EOF and local server exit

📅 `2026-05-16` | ✏️ **waynewang6660** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27843](https://github.com/anomalyco/opencode/issues/27843)


## Summary
On macOS, the local OpenCode server intermittently "shuts down" or gets torn down by the desktop app. After investigation, this looks like a core `session_diff` storage/read race rather than an MCP compatibility problem or an oh-my-opencode-specific bug.

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
- OpenCode desktop app
- oh-my-openagent plugin enabled
- user config stored in `~/.config/opencode/opencode.json`

## What I observed
### 1) Core read path fails on JSON parse
From local runtime log (`~/.local/share/opencode/log/2026-05-16T084710.log`):

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

Every `opencode` invocation eagerly loads all 22 top-level command modules — even when the user only needed `--help`, `--version`, or shell tab completion. The chain runs through `effect-cmd.ts`, which transitively imports `Effect`, `Provider`, `Session`, `Tool`, `InstanceStore`, `AppRuntime`, etc. The result is that parser-only paths pay the full app-bootstrap import cost.

This is particularly bad for shell tab completion, which fires on every Tab keystroke and pays this cost each time.

### Measurements

Compiled binary on `dev` (current HEAD), warm runs, median of 10:

| Command                              | Time   |
| ------------------------------------ | ------ |
| `opencode --help`                    | 213ms  |
| `opencode --version`                 | 193ms  |
| `opencode --get-yargs-completions …` | 192ms  |
| `opencode db --help`                 | 199ms  |
| `opencode mcp --help`                | 195ms  |

For reference, `bun -e '0'` cold starts in ~90ms on the same machine, so the bulk of these timings is module evaluation rather than process startup.

### Root cause

`src/index.ts` does e.g. `import { RunCommand } from "./cli/cmd/run"` synchronously for every command. Loading any of these triggers `effect-cmd.ts`, which imports `Instance` / `InstanceStore` / `AppRuntime` at the top level — about 500ms of evaluation in dev mode (smaller in the compiled binary, but the proportional cost is similar).

For commands that don't need the full graph (eve

> *[Truncado — 3783 chars totais]*

---

## #27798 — Desktop app seems to start all sessions at /, no directory picker in app?

📅 `2026-05-15` | ✏️ **cellularmitosis** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27798](https://github.com/anomalyco/opencode/issues/27798)


### Question

I feel like I must be missing something obvious here.  The desktop app starts every session at '/', and there is no picker to select a different directory.

Surely I'm missing something obvious?

---

## #27744 — Server API 执行类 endpoint 异常：CLI 正常，但 `/message`、`/prompt_async`、`/command`、`/shell`、`/share` 存在不一致或失败

📅 `2026-05-15` | ✏️ **Brahmsky** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27744](https://github.com/anomalyco/opencode/issues/27744)


## 问题概述

在我的环境里，OpenCode 的 CLI 执行路径是正常的，但 server API 的多个执行类 endpoint 不能正常工作。

整体表现是：session / metadata 相关 API 基本可用，但执行相关 API 存在明显异常或契约不一致：

- `POST /session/{id}/message` 会返回一个 assistant message，但 `parts` 为空，且 `info.error.name = "MessageAbortedError"`
- `POST /session/{id}/prompt_async` 会接受请求，但后续生成的 assistant message 同样是空 `parts` + `MessageAbortedError`
- `POST /session/{id}/command` 的实际行为和 SDK / OpenAPI 类型定义不一致
- `POST /session/{id}/shell` 返回 `500 UnknownError`
- `GET /session/{id}/share` 返回的是 HTML app shell，而不是 JSON

这会导致依赖 OpenCode server API 的集成工具无法工作，即使 CLI 路径是正常的。

## 环境信息

- OpenCode 版本：`1.15.0`
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
opencode serve --hostname 127.0.0.1 --port 4096
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

## #27710 — Mempalace as session db

📅 `2026-05-15` | ✏️ **d0uub** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27710](https://github.com/anomalyco/opencode/issues/27710)


### Question

Will consider mempalace as session db? It able to search related message across all session with 170 token only. I can use claude opus help to contribute before june

---

## #27693 — 第三方厂商api无法对话

📅 `2026-05-15` | ✏️ **rainroom** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27693](https://github.com/anomalyco/opencode/issues/27693)


### Question

使用cc-switch配置的第三方中转站的apikey和地址，在codex配置了可以正常提问，在opencode中可以正常选择模型，但是对话无法输出内容

---

## #27644 — OpenCode question tool emits question.asked but no documented way to answer via Server API

📅 `2026-05-15` | ✏️ **BELZHANG** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27644](https://github.com/anomalyco/opencode/issues/27644)


### Question

I’m using OpenCode Server API with SSE events.

When a model/skill invokes the question tool, OpenCode emits events like:

type: question.asked
properties:
  sessionID: ses_xxx
  questions:
    - header: 项目类型
      question: 请选择项目类型
      options:
        - label: NSFC
          description: ...
      multiple: false
  tool:
    messageID: msg_xxx
    callID: call_xxx

Then the corresponding tool part becomes:
type: message.part.updated
part:
  type: tool
  tool: question
  callID: call_xxx
  state:
    status: running
    input:
      questions: [...]

At this point the session stays busy

so my quesstion is what correct request looks like to answer the question and make the session keep going, i made this happen once by sending session_id and message_id with prompt answer, but it never happen again. right now im just ban the question tool.

---

## #27574 — Cannot list all of the models from Provider Qiniu

📅 `2026-05-14` | ✏️ **iblueer** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27574](https://github.com/anomalyco/opencode/issues/27574)


### Question

Provider Qiniu has already started providing Deepseek V4 series models and so on, but I cannot see them in the OpenCode provider model management panel until now.

I submitted a ticket to the Qiniu engineering team and their response to me was: It looks like a display issue of the (coding) tool.

Could anyone help check this problem?

Thanks for reading.

<img width="730" height="320" alt="Image" src="https://github.com/user-attachments/assets/ba561d0c-55b3-4331-87cf-353774e3f4e1" />

---

## #27492 — opencode zen提示Free usage exceeded, subscribe to Go

📅 `2026-05-14` | ✏️ **xiyuki** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27492](https://github.com/anomalyco/opencode/issues/27492)


### Question

opencode zen提示Free usage exceeded, subscribe to Go，免费额度的更新周期是多久？

---

## #27489 — Can we open the discussion section?

📅 `2026-05-14` | ✏️ **superDuperCyberTechno** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27489](https://github.com/anomalyco/opencode/issues/27489)


### Question

Would it be nifty to open the Github discussion section for all things not necessarily bugs or feature suggestions? General usage, tips/tricks and so on?

---

## #27458 — Incorrect token count and pricing calculation for DeepSeek models

📅 `2026-05-14` | ✏️ **HUANGzc83** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27458](https://github.com/anomalyco/opencode/issues/27458)


## Problem
When using DeepSeek models (deepseek-v4-flash / deepseek-v4-pro) via OpenCode, both token counting and cost estimation are inaccurate.

## Root Cause Analysis
1. **Tokenizer mismatch** — OpenCode uses a different tokenizer (likely tiktoken for OpenAI) to count tokens locally, which produces different counts than DeepSeek's official byte-level BPE tokenizer. The DeepSeek API response includes usage.prompt_tokens / usage.completion_tokens in its own encoding, but OpenCode displays its own locally-computed counts instead of (or in addition to) the API-reported values.

2. **Stale hardcoded model info** — The context window, pricing per token (input/output), and tokenizer selection are compiled into the binary. For DeepSeek V4:
   - Context window shows 262K instead of the correct 1M (related: issue #24119)
   - Input/output pricing per token uses outdated rates
   - The deepseek-chat and deepseek-reasoner model names are being deprecated on 2026/07/24 but may still be listed

## Expected Behavior
 - Token counts should match what DeepSeek's API reports (or at minimum use the correct tokenizer)
 - Pricing should reflect current DeepSeek API pricing: https://api-docs.deepseek.com/quick_start/pricing
 - Context window should be 1M for V4 models (not 262K)

## Environment
 - OpenCode version: 1.14.50
 - Model(s): opencode/deepseek-v4-flash-free, deepseek-v4-pro
 - Provider: DeepSeek (via OpenCode Zen / direct API)
 - OS: Windows

## Suggested Fix
 - Update the internal mo

> *[Truncado — 1881 chars totais]*

---

## #27455 — After successfully building the Mac M4, the screen is black when it is started

📅 `2026-05-14` | ✏️ **aliware50** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27455](https://github.com/anomalyco/opencode/issues/27455)


### Question

Why is it that after I successfully build, the screen is black and it keeps on starting up? What module is the main issue? I'm using a Mac M4 environment

---

## #27422 — Opencode depends on unofficial hacky patch to old solidjs/start, Can we switch to proper official version?

📅 `2026-05-14` | ✏️ **Ark-kun** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27422](https://github.com/anomalyco/opencode/issues/27422)


### Question

@thdxr 

```
      "@solidjs/start": "https://pkg.pr.new/@solidjs/start@dfb2020",
```
https://github.com/anomalyco/opencode/blob/edf76494008e3f01342b095e558a34b0c2e24706/package.json#L81
https://github.com/solidjs/solid-start/pull/2015

Could you switch to proper official version?

This causes big issues when building containers in CI/CD.
https://github.com/oven-sh/bun/issues/18684#issuecomment-4437963004

---

## #27360 — Subscription Active but Balance Still 0

📅 `2026-05-13` | ✏️ **MULKHI** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27360](https://github.com/anomalyco/opencode/issues/27360)


### Question

Hello OpenCode team,

I already completed payment successfully for OpenCode Go subscription.

I became unable to use opencode

And when I open the billing/workspace page, my balance still appears to be 0 and it asks me to add balance again.

Could you please help check:
- whether my subscription is properly activated,
- why my balance is still 0

Workspace:
wrk_01KRGZE77DAK0KA5F4MVKMRQ3Q

---

## #27281 — Claude Code 接入 OpenCode go套餐DeepSeek无法使用思考模式

📅 `2026-05-13` | ✏️ **TW59420** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27281](https://github.com/anomalyco/opencode/issues/27281)


### Question

通过CC Switch代理接入OpenCode API，使用DeepSeek模型进行复杂操作出现错误：API Error: 400 Error from provider (DeepSeek): The `reasoning_content` in the thinking mode must be passed back to      the API.

---

## #27273 — 小米模型Mimo使用CC Switch接入的问题

📅 `2026-05-13` | ✏️ **jiang3408** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27273](https://github.com/anomalyco/opencode/issues/27273)


### Question

opencode使用过程中，在使用CC Switch切换成小米的Mimo模型之后，在思考过程中出现报错Bad Request: {"error":{"code":"400","message":"Param Incorrect","param":"The reasoning_content in the thinking mode must be passed back to the API.","type":""}}。

<img width="558" height="368" alt="Image" src="https://github.com/user-attachments/assets/75f02f19-67dd-4bff-9e1a-2f9e0fb26a01" />

---

## #27244 — Key binding of scrolling in session output view

📅 `2026-05-13` | ✏️ **zzzbbs** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27244](https://github.com/anomalyco/opencode/issues/27244)


### Question

Is there any way to use keyboard to control the scrolling of code review, without using mouse scrolling?
Page Up And Down only support in sessions.

<img width="720" height="480" alt="Image" src="https://github.com/user-attachments/assets/c1f54e61-8b00-41b2-88cd-f54580d1dad1" />

---

## #27082 — TUI blank page: FSEventStreamSetExclusionPaths blocks 21-35s when HOME has large directories

📅 `2026-05-12` | ✏️ **litown** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27082](https://github.com/anomalyco/opencode/issues/27082)


## Environment
- **opencode**: v1.14.48
- **OS**: macOS 15.4.1 (Apple Silicon arm64)
- **Install method**: npm (`npm i -g opencode-ai`)

## Summary

This is a deeper root cause analysis of #27071. The blank TUI is **not** caused by `ENAMETOOLONG` errors or by scanning `~/Library` content. The true cause is `FSEventStreamSetExclusionPaths` taking 21-35 seconds to initialize when the exclusion paths (built from `os.homedir()`) point to directories with millions of files.

## Root Cause

### Startup Flow
```
os.homedir() → build exclusion paths → FSEventStreamSetExclusionPaths() → wait → file.watcher.updated → TUI renders
```

### What happens
1. On startup, opencode builds a list of "protected paths" from `os.homedir()`:
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
- **opencode**: v1.14.48
- **OS**: macOS 15.4.1 (Build 24E263), Apple Silicon (arm64)
- **Terminal**: Ghostty 1.3.2 / Terminal.app / iTerm2 (all affected)
- **Shell**: zsh 5.9
- **Install method**: npm (`npm i -g opencode-ai`)

## Problem
When running `opencode` in a project directory that contains `node_modules` (or other large generated directories) without a `.gitignore` excluding them, the TUI renders blank. The file.watcher scans all files recursively, triggering `ENAMETOOLONG` errors that crash the TUI.

## Root Cause
The file.watcher's default ignore list is hardcoded to only `[".git", ".DS_Store"]`. It does NOT include `node_modules` or other common generated directories. When the project lacks a `.gitignore` file (or `.gitignore` doesn't exclude `node_modules`), the watcher attempts to scan all files, triggering errors that prevent TUI rendering.

## Reproduction
1. Create a project: `mkdir test && cd test && git init`
2. Add `node_modules`: `mkdir -p node_modules/pkg && echo "test" > node_modules/pkg/index.js`
3. Run `opencode` → **blank TUI**
4. Add `.gitignore`: `echo "node_modules/" > .gitignore`
5. Run `opencode` → **TUI renders correctly**

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
- **opencode**: v1.14.48
- **OS**: macOS 15.4.1 (Build 24E263), Apple Silicon (arm64)
- **Terminal**: Ghostty 1.3.2 / Terminal.app / iTerm2 (all affected)
- **Shell**: zsh 5.9
- **Install method**: npm (`npm i -g opencode-ai`)

## Problem
TUI always shows a completely blank page after launch. Backend (`opencode serve`) works correctly with proper API responses. The issue persists across ALL terminal emulators.

## Root Cause
Bun runtime scans `~/Library` directory during initialization. My `~/Library` contains millions of files (WPS Office PDF caches, Claude session data, JetBrains caches, etc.) with paths up to 453 characters long. This scanning blocks the TUI rendering thread, resulting in a blank page.

Colleagues with identical hardware/software do NOT have this issue — their `~/Library` directories have far fewer files.

## Reproduction
1. Have a macOS system with a large `~/Library` directory (millions of files)
2. Run `opencode` in any terminal
3. Observe blank TUI
4. Backend logs show 3x `ENAMETOOLONG: name too long, open rejection`

## Workaround
Set `HOME` to a minimal isolated directory before launching:
```bash
export HOME="/path/to/minimal/home"
opencode
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
When OpenCode triggers automatic context compaction near the context window limit, the compaction request is delivered to the model as a regular user message with no signal indicating it originated from the compaction system. The model treats it as a genuine user question and responds with a full summary. If compaction triggers again shortly after, the model produces a second summary, doubling token consumption. The user sees what appears to be the assistant inexplicably repeating itself.

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

## #26897 — 切换免费的deepseek模型错误

📅 `2026-05-11` | ✏️ **se7en-zxs** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26897](https://github.com/anomalyco/opencode/issues/26897)


### Question

会提示Model deepseep-v4-flash-free not supported，会不会是单词拼写错误，把cache中的deepseep修改成deepseek后可以正常使用

---

## #26855 — run --format json can exit before emitting final step_finish event

📅 `2026-05-11` | ✏️ **g199209** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26855](https://github.com/anomalyco/opencode/issues/26855)


## Summary

`opencode run --format json` can complete a run without emitting the final `step_finish` JSON event to stdout, even though the session data contains the corresponding `step-finish` part with `tokens` and `cost`.

This makes downstream tooling miss usage accounting when it relies on the documented raw JSON event stream.

## Reproduction

Run opencode non-interactively with JSON output, for example:

```sh
opencode run --format json --thinking --dir /tmp/agentbench-item-6zkldejw --model gpt-5.4-mini --dangerously-skip-permissions
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

When `CLAUDE_CODE_SSE_PORT` is set in the environment (e.g. inherited from a VSCode integrated terminal where the Claude Code extension previously ran), opencode will always try to connect to that port and **never fall back** to lock file discovery at `~/.claude/ide/*.lock` — even if that port is no longer reachable.

## Root Cause

In `packages/opencode/src/cli/cmd/tui/context/editor.ts`, `resolveEditorConnection()` checks the env var first and returns immediately if present:

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
- Any terminal where `opencode` is launched after a previous session set the variable
- tmux/screen sessions that were started while the variable was set

When the referenced port is dead (VSCode closed, Claude Code extension stopped, etc.), opencode enters a reconnect loop against a dead port with exponential backoff — the lock file mechanism that could correctly find an active IDE connection is completely short-circuited.

## Reproduction

1. Open VSCode with the Claude Code extension active
2. Open an integrated terminal — observe `CLAUDE_CODE_

> *[Truncado — 2514 chars totais]*

---

## #26795 — 打开多个项目后，在任一项目中执行过代码编写操作，再点击左侧其他项目切换时无响应。

📅 `2026-05-11` | ✏️ **zengjz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26795](https://github.com/anomalyco/opencode/issues/26795)


### Question

打开多个项目后，在任一项目中执行过代码编写操作，再点击左侧其他项目切换时无响应。

---

## #26791 — 为什么安装路径不能自己指定了

📅 `2026-05-11` | ✏️ **jianbinJava** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26791](https://github.com/anomalyco/opencode/issues/26791)


### Question

现在下载的 desktop 版本 安装路径都默认安装到 User Local 下 , 为什么不能自己指定安装目录了, 是有什么问题导致的么?

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

`packages/opencode/src/cli/cmd/tui/component/prompt/index.tsx:697-707`
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

## #26755 — Opencode Desktop for Windows - Duplicated disk space usage

📅 `2026-05-10` | ✏️ **lollo78** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26755](https://github.com/anomalyco/opencode/issues/26755)


### Question

Hi, I’ve just updated Opencode Desktop for Windows and I'm seeing two icons on my desktop: one leads to the Program Files folder, and the other one to the Local AppData folder.

<img width="1776" height="776" alt="Image" src="https://github.com/user-attachments/assets/4bb28d83-b470-4de9-bbc6-7e69e362a117" />

Why is there this duplication of used space? 
I would like to use only the one located in Program Files, so how can I prevent this from happening again?
Thanks

---

## #26711 — Is This Project Alive?

📅 `2026-05-10` | ✏️ **HWliao** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26711](https://github.com/anomalyco/opencode/issues/26711)


### Question

Is This Project Alive?
i see there are some releases every day, but it likes auto merge by ai agent...
is here any roadmap?
and the issues more than 4.9k. do we have any plan to clean it?

---

## #26607 — Hide Keymap Option by Default + Open Message in Editor

📅 `2026-05-10` | ✏️ **semi710** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26607](https://github.com/anomalyco/opencode/issues/26607)


### Question

Via the keymap, I can see the option. How can I keep it hidden permanently through the config?

Also, how can I open the message in the editor? For example, `<leader>e` opens the prompt in the editor. Is there a similar way to make `<leader>E` open the message in the editor?

---

## #26508 — Refunds for the ZEN scam

📅 `2026-05-09` | ✏️ **Dazag** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/26508](https://github.com/anomalyco/opencode/issues/26508)


### Question

I am not the only one, and it will keep happening as it seems you have developed some kind of scammy UI behavior.

You click to pay the GO subscription and get sent to ZEN...
I was trying to understand which one was the "good" button to just fucking pay 22€  for nothing!!

I didn't come here to pay for fucking claude code, and it even says:
"
Add $20 Pay as you go balance
(+$1.23 card processing fee)

Use with any agent. Set monthly spend limits. Cancel any time."

CANCEL ANYTIME?!?! WHERE?!

THE QUESTION IS, ARE YOU GOING TO FIX THIS?
ARE YOU GOING TO REFUND OUR MONEY?
WHERE? WHEN?

THIS IS NOT FUCKING SERIOUS.

---

## #26505 — Session history disappears and archived sessions are difficult to restore

📅 `2026-05-09` | ✏️ **pratham-107** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26505](https://github.com/anomalyco/opencode/issues/26505)


### Question

## Problem

I am facing issues with session history management in OpenCode.

### Issue 1: Session history not visible

After working in OpenCode and closing the terminal/app, my previous session history was no longer visible in the sidebar or session list.

Commands like:

```bash
opencode session list
```

returned no sessions.

Also:

```bash
opencode --continue
```

showed:

```text
Continue  opencode -s undefined
```

even though the local database file still exists:

```text
~/.local/share/opencode/opencode.db
```

This makes it difficult to recover previous work sessions.

---

### Issue 2: Archived sessions disappear from sidebar

I later realized that one of my sessions was archived accidentally.

After archiving:

* the session disappeared completely from the sidebar
* there was no obvious “Archived Sessions” section
* session recovery/discovery was confusing

It would be helpful if:

* archived sessions were easier to access
* there was a visible archive section/filter
* users received a clearer indication that the session was archived and not deleted

---

## Expected behavior

* Sessions should remain visible and recoverable after reopening OpenCode
* `opencode --continue` should properly restore the last session
* Archived sessions should be easy to find and restore
* Session management UX should be clearer

---

## Environment

* OS: Windows
* Terminal: Git Bash (MINGW64)
* OpenCode installed via terminal installer
* Local database exists at:

```t

> *[Truncado — 1543 chars totais]*

---

## #26485 — 如何接入claude code?

📅 `2026-05-09` | ✏️ **fishda** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26485](https://github.com/anomalyco/opencode/issues/26485)


### Question

如何接入claude code?

---

## #26479 — opencode command disappears after exit because auto-upgrade misdetects install method

📅 `2026-05-09` | ✏️ **vsiegel** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26479](https://github.com/anomalyco/opencode/issues/26479)


## Summary
When `opencode` starts, the auto-upgrade flow can infer installation method from `process.execPath` (Node/Bun runtime path) instead of the invoked `opencode` CLI path. In some local setups this can select the wrong installer path and leave the command unavailable after exit.

## System information
- OpenCode version: 1.14.41
- Operating system: Linux

## Reproduction
1. Install and run `opencode` in an environment where runtime executable path differs from the installed CLI shim path.
2. Start `opencode` and allow startup update checks.
3. Exit the command.
4. Observe that `opencode` may no longer resolve in shell.

## Expected
`opencode` remains installed and available after running/exiting.

## Proposed fix
Use invoked command path (`process.argv[1]` fallback chain) in installation method detection heuristics, instead of relying on `process.execPath`.

## Related
- Prior auto-closed report: #26473
- Fix PR: #26468

---

## #26417 — Fix GitHub action opencode session share links

📅 `2026-05-08` | ✏️ **cuevaio** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26417](https://github.com/anomalyco/opencode/issues/26417)


## Problem

GitHub Actions bot comments append an `opencode session` link using the old `https://opencode.ai/s/<id>` format. Those links now 404.

Example broken link:

```
https://opencode.ai/s/It7ivB4n
```

Canonical share links now use the `opncd.ai/share/<id>` format, for example:

```
https://opncd.ai/share/uaFpXIla
```

## Expected

GitHub Actions comments should use the canonical share URL returned by the share service instead of deriving a URL from the session id.

## Notes

The stale construction exists in the active `packages/opencode/src/cli/cmd/github.ts` action path and the legacy `github/index.ts` copy.

---

## #26381 — UI: model thinking spinner provides no visible progress indication (just loops back-and-forth for 10-20 min)

📅 `2026-05-08` | ✏️ **dhruv-anand-aintech** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26381](https://github.com/anomalyco/opencode/issues/26381)


## Description

When opencode is processing/thinking, the UI shows only a looping spinner animation. It goes back and forth with no indication of:
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
- opencode CLI (latest)

---

## #26336 — MCP servers spawned 8-10x per instance on Windows, consuming ~3.5 GB RAM on startup

📅 `2026-05-08` | ✏️ **Zeal29** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26336](https://github.com/anomalyco/opencode/issues/26336)


## Description

On Windows, the OpenCode desktop app spawns **8-10 duplicate instances of every local MCP server** immediately on startup, instead of one. This causes ~3.5 GB of MCP-related process memory at idle, with 82+ child processes under `opencode-cli.exe`.

## Environment

- **OpenCode version**: 1.3.13 (desktop)
- **OS**: Windows 11
- **RAM**: 32 GB total
- **Local MCPs configured**: 9 enabled, 4 disabled
- **System idle RAM**: ~41% (12.8 GB used)
- **OpenCode idle RAM**: ~70% (21.8 GB used) — 9 GB attributed to OpenCode

## Evidence

After a fresh restart with no sessions active, process tree under `opencode-cli.exe`:

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

## #26313 — Hey guys...

📅 `2026-05-08` | ✏️ **amirasyraf** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26313](https://github.com/anomalyco/opencode/issues/26313)


### Question

You know you don't HAVE to release new versions every day right? Let alone several times a day?

I know AI-driven development is allowing us all to work faster, but it seems like you're introducing more bugs every time you release a version. 

And I sometimes I keep seeing different behaviours with the damn CLI every time I open new OpenCode session in a span of 2-3 days because of how frequent the updates are.

I literally have 8 different OpenCode running 5 different versions as of now.

It's ridiculous....

---

## #26264 — opencode desktop un reaponse

📅 `2026-05-08` | ✏️ **nhcxl-sz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26264](https://github.com/anomalyco/opencode/issues/26264)


### Question

opencode 1.14.40,win11,same config content of opencode.json and opencode.jsonc like below，use samae opencode zen model,opencode gui work correct,but opencode desktop haven't any response ,Why ?How fixed?
config centent:
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-supermemory@latest",
    "opencode-antigravity-auth@latest",
    "@plannotator/opencode@latest"
  ],
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
    }
  },
  "provider": {
    "ollama": {
      "name": "ollama_local",
      "npm": "@ai-sdk/openai-compatible",
      "models": {
        "deepseek-r1:8b": {
          "name": "deepseek-r1:8b"
        },
        "deepseek-coder:6.7b": {
          "name": "deepseek-coder:6.7b"
        },
        "qwen:7b": {
          "name": "qwen:7b"
        },
        "qwen3.5:9b":{
          "name":"qwen3.5:9b"
        },
        "glm-4": {
          "name": "glm-4"
        },
        "gemma4:26b":{
           "name":"gemma4:26b"
        }
      },
      "options": {
        "baseURL": "http://127.0.0.1:11434/v1",
        "think": false
      }
    },
    "cliproxyapi": {
      "name": "cliproxyapi",
      "npm": "@ai-sdk/openai-compatible",
      "models": {
        "glm-4.6": {
          "name": "glm-4.6"
        }
      },
      "options": {
        "baseURL": "http://127.0.0.1:8317/v1"
      }
    }
  },
  "disabled_providers": []
}

---

## #26170 — Provider stream truncation (finishReason="other" with zero output) silently accepted, persisting half-finished assistant messages

📅 `2026-05-07` | ✏️ **edevil** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26170](https://github.com/anomalyco/opencode/issues/26170)


### Bug

When an upstream provider stream is cut mid-generation, the AI SDK emits
a fallback `finishReason: "other"` with zero output tokens. opencode's
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
opencode session database, spanning two providers (`anthropic`, `openai`)
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

When making multiple parallel tool calls of the same type (e.g., two `Read` calls, two `glob` calls, two `todowrite` calls), OpenCode merges the JSON arguments incorrectly. The first object's closing `}` is dropped and the second object is concatenated directly to it, producing invalid JSON.

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

## #26061 — Resetting or viewing stats

📅 `2026-05-06` | ✏️ **philcbu** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26061](https://github.com/anomalyco/opencode/issues/26061)


### Question

Hi all,

In the command line you can do `opencode stats` - is there a way to reset these numbers or query a specific timeframe?

Also, if using Go or Zen, is there a way to see the remaining balance? At present, is logging into the website the only way to view this?

---

## #26044 — MCP tool calls render Unknown despite tools/list title metadata

📅 `2026-05-06` | ✏️ **uni-mike** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26044](https://github.com/anomalyco/opencode/issues/26044)


## Summary

OpenCode renders MCP tool calls as `Unknown` in the CLI/TUI even when the MCP server provides the standard MCP `title` field and `annotations.title` in `tools/list`.

Example display:

```text
⚙ pekg_status Unknown
```

The tool executes successfully, but the display label makes the integration look broken.

## Expected

OpenCode should use the MCP tool display title when available:

1. `tool.title`
2. `tool.annotations.title`
3. fallback to tool name

Expected display for the example below:

```text
⚙ pekg_status PeKG Status
```

## Actual

OpenCode displays:

```text
⚙ pekg_status Unknown
```

## Reproduction

OpenCode version:

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
opencode run "Call the PeKG status MCP tool once."
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
- Client: OpenCode Desktop
- Desktop executable version: `1.14.39`
- Install path: `C:\Program Files\OpenCode\OpenCode.exe`

Version info from the installed executable:

```text
ProductVersion  : 1.14.39.0
FileVersion     : 1.14.39
FileDescription : OpenCode
```

## Observed log

This repeats across every recent Desktop startup log.

From `C:\Users\USER\.local\share\opencode\log\2026-05-06T075806.log`:

```text
ERROR 2026-05-06T07:58:07 +774ms service=file.watcher error=Cannot find module '@parcel/watcher-win32-x64'
Require stack:
- C:\Program Files\OpenCode\resources\app.asar\out\main\chunks\node-BCdD_j2u.js failed to load watcher binding
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

## #26003 — Windows Desktop 1.14.39 tries to install @opencode-ai/plugin@local

📅 `2026-05-06` | ✏️ **netics01** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26003](https://github.com/anomalyco/opencode/issues/26003)


## Problem

OpenCode Desktop on Windows logs repeated config dependency install failures because it tries to install `@opencode-ai/plugin@local`.

`@opencode-ai/plugin` is a valid official package, but `local` is not a published npm version or dist-tag, so npm resolution fails.

This looks related to #20891, but this report is for an installed official Windows Desktop release, not a locally built preview binary.

## Environment

- OS: Windows 11
- Client: OpenCode Desktop
- Desktop executable version: `1.14.39`
- Workspace: normal git repository with an `.opencode` directory
- Current project `.opencode` contents: only `.gitignore`, empty `agents/`, empty `commands/`; no project plugin files and no `.opencode/package.json`

## Observed log

From `C:\Users\USER\.local\share\opencode\log\2026-05-06T075806.log`:

```text
WARN  2026-05-06T07:58:08 +999ms service=config dir=D:\Github\OpencodeScratch\.opencode error=Cause([Fail(NpmInstallFailedError (cause: @opencode-ai/plugin: No matching version found for @opencode-ai/plugin@local.))]) background dependency install failed
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

Official Desktop builds should install a published `@opencode-ai/plugin` version matching the running OpenCode release, or skip pinning to a version when the runtime is treated as local/dev

> *[Truncado — 3638 chars totais]*

---

## #25951 — Server status

📅 `2026-05-06` | ✏️ **titodoni** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25951](https://github.com/anomalyco/opencode/issues/25951)


### Question

Why Server is online/offline switch back and forth in windows desktop app?

---

## #25918 — Plugin hook \	ool.execute.after\ is declared but never triggered

📅 `2026-05-05` | ✏️ **luismichio** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25918](https://github.com/anomalyco/opencode/issues/25918)


## Summary

The `tool.execute.after` hook is declared in the `Hooks` interface in `@opencode-ai/plugin` but is **never invoked** anywhere in the OpenCode runtime. Any plugin implementing this hook will have its handler registered but silently ignored — the handler is never called.

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

The `plugin.trigger` mechanism in `packages/opencode/src/plugin/index.ts` is also correctly implemented — it passes `output` by reference, calls all registered handlers, and returns the (possibly mutated) `output` object:

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

A search through the entire OpenCode server codebase found **zero call sites** for `plugin.trigger("tool.execute.after", ...)`:

- `packages/opencode/src/session/processor.ts` — handles `tool-result` stream events and calls `completeToolCall()`, but no hook trigger
- `packages/opencode/src/session/llm.ts` — assembles AI SDK tools and handles st

> *[Truncado — 3830 chars totais]*

---

## #25892 — Gemma 4

📅 `2026-05-05` | ✏️ **EdLavin** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25892](https://github.com/anomalyco/opencode/issues/25892)


### Question

When Gemma 4 attempts any tool call, the following error is thrown:                                                                                                                                                
                                                                                                                                                                                                                     
  Type validation failed: Value: {"type":"tool-input-available","toolCallId":"...","input":{}}                                                                                                                       
                                                                                                                                                                                                                     
  The event type "tool-input-available" is not included in the streaming event union schema, causing a crash on every tool use. Gemini 2.5 Pro works fine with the same setup.

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

### OpenCode version

1.14.35

---

## #25827 — 最新版犹如狗屎

📅 `2026-05-05` | ✏️ **ss1234569A** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25827](https://github.com/anomalyco/opencode/issues/25827)


### Question

最新版的推送砍掉了刷新，虽然还可以ctrl+r刷新，右键的刷新，还有会话的删除都被去除了，添加的api无法直接修改只能断开连接重新添加，

---

## #25757 — Missing Authentication header when I try to use open code

📅 `2026-05-04` | ✏️ **veryhealthy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25757](https://github.com/anomalyco/opencode/issues/25757)


### Question

Hello,

When I try to use opencode with chatgpt, I get this error : Missing Authentication header
After authenticating with headless mode it works but when I quit opencode and launch it again, I get Missing Authentication header error, anyone has an idea why ?

the .local/share/opencode/auth.json file is present

thanks and have a nice day

---

## #25619 — Is OpenCode Free to Use Indefinitely?

📅 `2026-05-03` | ✏️ **DaFi-1** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25619](https://github.com/anomalyco/opencode/issues/25619)


### Question

I’ve been using OpenCode for about a week and wanted to understand whether it’s free to use permanently or if the free plan has any limitations or expiration. I checked the documentation but couldn’t find any information about this.
So far, I just downloaded it and started using it, and it has been working very well. Is there any usage period or restriction for the way I’m currently using it?

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
- OpenCode 版本：latest
- 操作系统：Windows

## 建议

可以考虑：
1. 为选项区域添加滚动条
2. 确保按钮区域始终固定在底部可见
3. 根据选项数量动态调整对话框高度

---

## #25564 — Windows: custom-elements.d.ts symlinks materialize as text on default core.symlinks=false, breaking enterprise typecheck

📅 `2026-05-03` | ✏️ **zoulukuang** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25564](https://github.com/anomalyco/opencode/issues/25564)


### Bug

After cloning on Windows with the default `core.symlinks=false` setting, `bun turbo typecheck` fails on `@opencode-ai/enterprise` (and `@opencode-ai/app`) because the `<diffs-container>` JSX type augmentation is missing.

The `<diffs-container>` ambient declaration is defined in `packages/ui/src/custom-elements.d.ts`. Two consumer packages reference it via symlinks:

- `packages/app/src/custom-elements.d.ts` → symlink (mode 120000) → `../../ui/src/custom-elements.d.ts`
- `packages/enterprise/src/custom-elements.d.ts` → symlink (mode 120000) → `../../ui/src/custom-elements.d.ts`

### Why

On Windows with `core.symlinks=false` (the default — Windows does not enable symlinks unless Developer Mode is on, or git is configured with `core.symlinks=true` at clone time), git materializes a symlink as a **plain text file** containing the link target string:

```
$ cat packages/enterprise/src/custom-elements.d.ts
../../ui/src/custom-elements.d.ts
```

TypeScript treats this as a non-TS file (or worse, parses it as TS and fails immediately). The `<diffs-container>` augmentation is silently dropped, and downstream `.tsx` files using the custom element get `JSX element type 'diffs-container' is not defined` errors.

### Reproduction

1. On Windows, with `core.symlinks=false` (the default), without Developer Mode
2. `git clone https://github.com/anomalyco/opencode`
3. `bun install && bun turbo typecheck`

→ `@opencode-ai/enterprise` fails typecheck because `<diffs-container>` is un

> *[Truncado — 2213 chars totais]*

---

## #25506 — 本地使用，页面会话没有显示。

📅 `2026-05-03` | ✏️ **helenaemmaoliviatomas-hub** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25506](https://github.com/anomalyco/opencode/issues/25506)


### Question

我是Windows下载桌面版的，每次聊完的会话不会保存，打开会话没有任何显示。

---

## #25280 — i am using opencode + hermes and i get asciii text when moving my mouse

📅 `2026-05-01` | ✏️ **idan2228-oss** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25280](https://github.com/anomalyco/opencode/issues/25280)


### Question

i am using opencode + hermes and i get asciii text when moving my mouse  - it stop after all the MCPS loaded - but still seen ascii text on the screen

---

## #25276 — Built-in TypeScript LSP overrides custom LSP for .ets files (ArkTS/HarmonyOS)

📅 `2026-05-01` | ✏️ **Wievondii** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25276](https://github.com/anomalyco/opencode/issues/25276)


## Description

When a **custom LSP** is configured for `.ets` files (ArkTS — HarmonyOS's TypeScript dialect), the **built-in TypeScript LSP takes priority** and processes the files instead. The custom LSP shows as connected in the UI panel ("LSP • arkts-hybrid-lsp"), but its diagnostics are never surfaced to tool results. All diagnostics returned are from the TypeScript LSP, which doesn't understand ArkTS syntax.

### What happens

1. Custom LSP is configured in `opencode.json`:
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
3. opencode UI shows the LSP is connected: right panel displays "LSP • arkts-hybrid-lsp"
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

opencode has built-in

> *[Truncado — 2681 chars totais]*

---

## #25267 — Cmd+Backspace and Opt+Backspace silently dropped in Warp (kitty mode legacy-byte fallback needed in opentui)

📅 `2026-05-01` | ✏️ **anasnajoui** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25267](https://github.com/anomalyco/opencode/issues/25267)


## Summary

When running opencode in Warp terminal, **Cmd+Backspace** and **Opt+Backspace** do nothing in the chat input box. They work as expected (delete-to-line-start / delete-word-backward) in Ghostty.

Root cause: Warp's kitty keyboard implementation is inconsistent — it sends legacy single-byte control codes (`\x15`, `\x17`) for Cmd/Opt+Backspace even when kitty mode is active, while sending CSI u sequences for plain Ctrl+U / Ctrl+W. opentui's parser, after negotiating kitty mode, appears to drop these legacy bytes for keys that should arrive as CSI u.

This is partly a Warp bug (filed at warpdotdev/Warp), but a robustness fix in opentui — accepting legacy bytes alongside CSI u in kitty mode — would unblock affected users immediately.

## Reproduction

1. Open Warp terminal (current stable, kitty keyboard protocol enabled)
2. Run `opencode` (v1.14.31)
3. In the chat input, type `hello world test`
4. Press **Cmd+Delete** — nothing happens (expected: line cleared)
5. Press **Opt+Delete** — nothing happens (expected: word deleted)
6. Press **Ctrl+U** — line clears ✓
7. Press **Ctrl+W** — word deletes ✓

## Evidence

Captured the actual byte sequences Warp sends opencode (with kitty keyboard mode pushed via `\x1b[>1u`):

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
`packages/opencode/src/cli/cmd/tui/util/clipboard.ts` switches OSC 52 into the tmux DCS passthrough envelope whenever `TMUX` or `STY` is present.

That breaks clipboard copy in a common tmux setup:
- `set -g set-clipboard on`
- `set -g allow-passthrough off`

In that topology tmux can still handle raw OSC 52 for clipboard forwarding, but the DCS passthrough envelope is exactly what `allow-passthrough off` blocks.

## Reproduction
1. Start tmux with `set -g set-clipboard on` and `set -g allow-passthrough off`
2. Run `opencode` inside tmux over SSH
3. Use any OpenCode-native copy path that goes through `Clipboard.copy()` (for example a sidebar/message copy action)
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
- Tools used: OpenCode

---

## #25248 — Same provider/model with different variants

📅 `2026-05-01` | ✏️ **TomasKocman** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25248](https://github.com/anomalyco/opencode/issues/25248)


### Question

Hi. Is it possible to switch the model variant between plan and build agents while I use the same provider/model for both plan and build agents?

Expected behavior: when pressing tab, I would expect to change the variant.
Real behavior: the last used variant is applied. So I have to manually change the variant each time I switch between agents.

My config:
```
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "plan",
  "agent": {
    "plan": {
      "model": "openai/gpt-5.5",
      "variant": "high"
    },
    "build": {
      "model": "openai/gpt-5.5",
      "variant": "medium"
    }
  }
}
```

OpenCode version
1.14.30

I use [built-in variants](https://opencode.ai/docs/models/#built-in-variants) for the openai provider.

Based on my experiments, the expected behavior I described above is applied when using different providers. But since I use openai provider for everything, the last active variant is used, and the configuration in `config.json` is ignored in this case.

Is this behavior expected? Or do I have just a skill issue, and it's actually possible to achieve my goal?

Thank you for your help!

---

## #25232 — 调整终端窗口大小时 TUI 断开连接（Windows）

📅 `2026-05-01` | ✏️ **luofeiawyjwj** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25232](https://github.com/anomalyco/opencode/issues/25232)


## 问题描述
每次在 opencode 运行过程中调整终端窗口大小（拖拽边缘、最大化、还原等），
与 AI 的连接就会断开，工具无响应，表现为卡死/崩溃。

## 复现步骤
1. 在 Windows 终端（PowerShell / Windows Terminal）中启动 opencode
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
When connecting from **Windows Terminal -> SSH -> Linux -> tmux -> opencode**, the raw OSC startup leak can be fixed locally, but **Korean / emoji / UTF-8 rendering in the TUI still breaks only in Windows Terminal**.

Termius on the same SSH target does **not** show the same rendering breakage.

## Environment
- Client terminal: Windows Terminal
- Connection path: SSH into Linux host
- Multiplexer: tmux (`TERM=tmux-256color` inside, outer `TERM=xterm-256color`)
- Server locale: `en_US.UTF-8`
- OpenCode version on host: `1.14.30`

## What was already fixed locally
A separate local wrapper bug caused the raw startup leak:
- leaked text looked like: `^[]11;rgb:0c0c/0c0c/0c0c^[\\`
- root cause: fragmented `ESC ]` / `ESC \\` sequences in an SSH wrapper parser

That fix stops the raw OSC leak, but **does not fix the remaining Korean / emoji / UTF-8 rendering problem**.

## Observed behavior
- Windows Terminal: Korean / emoji / some UTF-8 UI elements render broken / hidden in the OpenCode TUI
- Termius: same remote host, same wrapper path, no equivalent rendering breakage observed
- Linux locale itself is not the problem (`UTF-8` is configured correctly on the host)

## Why this seems distinct from the raw OSC leak
The startup OSC leak was a wrapper-layer parsing bug and is now fixed downstream.
The remaining bug still appears terminal-specific and looks more like **OpenCode / OpenTUI rendering behavior over SSH/tmux with Windows Terminal** than a locale misconfiguration 

> *[Truncado — 2013 chars totais]*

---

## #25107 — Anthropic 的 tools 格式转换为 OpenAI 的 tools 格式

📅 `2026-04-30` | ✏️ **520yanshuwen-maker** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25107](https://github.com/anomalyco/opencode/issues/25107)


### Question

在使用 Claude Code 时，中转没有将 Anthropic 的 tools 格式转换为 OpenAI 的 tools 格式，导致 DeepSeek 等模型无法使用 Agent 功能，请修复协议转换。

---

## #25105 — Difference explicitely invoking subagent via "@explore" vs nudging "explore" with a prompt

📅 `2026-04-30` | ✏️ **MartyMcFlyInTheSky** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25105](https://github.com/anomalyco/opencode/issues/25105)


### Question

I can invoke the explore subagent by simply stating: "Let's explore this repo ...". So what's the difference from explicitely mentioning @explore agent (or any other agent for that matter)? Also I noticed that the highlighting changes if I tab complete @explor.. to @explore or i just write out @explore. What's the difference?

Also: Can i use @-.. notation in AGENTS.md and agent system prompts? Does that work the same way? Example:

```md
"If tasked to create an MR, use the @gitlab subagent and report its outcome."
```

Does this have the intended effect?

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

## #24963 — Compaction: summary message appears after tail messages

📅 `2026-04-29` | ✏️ **Simon-max2020** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24963](https://github.com/anomalyco/opencode/issues/24963)


### Question

#### Description
After a compaction event, the messages sent to the model are ordered as:

**tail (recent uncompressed messages) → compaction user ("What did we do so far?") → compaction assistant (summary) → subsequent conversation**

This creates a confusing cognitive expectation: when seeing the pattern [context] → "What did we do so far?" → [summary], both the model and human readers naturally assume the summary covers all preceding content (including the tail). However, the summary only covers the older head messages that were compressed — the tail is intentionally preserved verbatim and is NOT included in the summary.

- tail messages are recent conversations that occurred before the compaction event (time-wise earlier than the compaction user/assistant)
- The summary only summarizes the head (messages older than tail)
- The current prompt "What did we do so far?" and the message structure imply the summary includes everything above it, which is incorrect
- The current "What did we do so far?" prompt combined with the message order makes it appear as if the tail content was summarized, when in fact it was intentionally preserved verbatim.

Is this ordering an intentional design choice?
I notice this design is similar to Claude Code's context restoration after compaction — in their implementation, the restored content will appear after the summary message, not before it.

#### Relevant Code:
- packages/opencode/src/session/compaction.ts - select() function 

> *[Truncado — 1663 chars totais]*

---

## #24940 — Preference for "simplest" solution is too high

📅 `2026-04-29` | ✏️ **v0l** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24940](https://github.com/anomalyco/opencode/issues/24940)


### Question

Frequently when using opencode the agent will always try to do the "simplest" solution, which all too often means deleting important logic or features or generally write code which is bad.

Is there any way to adjust this? It doesnt seem to matter which model or provider i use. in the end it just trys to simplify my code which is not really a solution at all, it just wants to avoid the difficult task completely

---

## #24904 — github-copilot provider rejects gpt-5.x models even though Copilot serves them; user-side opencode.json overrides ignored

📅 `2026-04-29` | ✏️ **michaeltarleton** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24904](https://github.com/anomalyco/opencode/issues/24904)


## Summary

opencode 1.14.29's bundled `github-copilot` provider has a runtime model whitelist that only accepts `gpt-4.1` and `gpt-4o`, but GitHub Copilot itself is actively serving `gpt-5.2` (and likely `gpt-5.5`) on the backend. Attempts to use these via `--model github-copilot/gpt-5.2` fail with `Model not found`. Adding the model under `provider.github-copilot.models` in `opencode.json` does **not** bypass the whitelist (unlike custom providers e.g. AWS Bedrock, where manual model registrations work as passthrough).

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

Environment: opencode v1.14.29, Windows 11 (Git Bash + Scoop install), GitHub Copilot OAuth-authenticated via `opencode providers list` (Pro subscription).

```bash
$ opencode models | grep github-copilot
github-copilot/gpt-4.1
github-copilot/gpt-4o
```

Only two models surface, despite `~/.cache/opencode/models.json` (after deletion + refresh) containing 27 github-copilot model entries from models.dev.

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

## #24741 — Plan Mode Agent Spawned General Subagent to edit code

📅 `2026-04-28` | ✏️ **DUCKJAIII** | 💬 9 | 🔗 [https://github.com/anomalyco/opencode/issues/24741](https://github.com/anomalyco/opencode/issues/24741)


### Question

I was on Open Code GUI on Windows.

I was in plan mode, but the main agent was able to spawn General Agent to make code edits.

Is this a bug, or a feature?

---

## #24686 — Unable to resubscribe to OpenCode Go monthly plan after canceling Alipay auto-debit agreement

📅 `2026-04-27` | ✏️ **manuelm02** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24686](https://github.com/anomalyco/opencode/issues/24686)


### Question

I previously subscribed to OpenCode Go using Alipay's auto-debit feature. Later, I manually canceled the auto-debit/ recurring payment agreement within the Alipay app.

Now, when I try to subscribe again to the OpenCode Go monthly plan, the subscription always fails, and I cannot use the service.

Is there any way to resolve this issue? Do I need to manually remove the old payment binding from my OpenCode Go account first, or is there another way to initiate a new subscription?

Thank you.

---

## #24650 — Editor context injects "Note: The user opened the file" on every prompt when cursor is in a file

📅 `2026-04-27` | ✏️ **gjed** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24650](https://github.com/anomalyco/opencode/issues/24650)


## Bug

When the editor has a file open with a cursor but no active selection (start == end), OpenCode injects a synthetic message into every prompt submission:

```
Note: The user opened the file "/path/to/file".
```

The user never sees this — only the AI does. It fires on every single message as long as a file has focus in the editor, regardless of whether the user intended to share that file as context.

## Reproduction

1. Open OpenCode
2. Have any file open in your editor (e.g. VS Code with the OpenCode extension)
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

## #24649 — OpenCode Go: clarify which models are self-hosted vs. proxied through third-party providers

📅 `2026-04-27` | ✏️ **Mikkelka** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24649](https://github.com/anomalyco/opencode/issues/24649)


### Question

Hey,

First off, love what you're building with OpenCode Go — the curation angle and pricing make a lot of sense for reliable model access.

I have some questions about the Go plan documentation that I think need clarification:

**The infrastructure claim:**
Your docs state that Go models are "hosted in the US, EU, and Singapore for stable global access." However, when I tested the API with Qwen3.5 Plus (which is on your Go model list), I received this error:

```
Error from provider (Alibaba): You exceeded your current quota, please check your plan and billing details
```

This error coming directly from "provider (Alibaba)" suggests that Go is actually proxying requests to Alibaba's DashScope infrastructure, not hosting them on OpenCode-controlled servers. 

Looking at your codebase (specifically the AI SDK packages referenced in the endpoint table), models like Qwen use `@ai-sdk/alibaba`, Kimi uses Moonshot's infrastructure, etc., which further suggests third-party proxying rather than self-hosting.

**What I need clarified:**

* Which Go models are actually on OpenCode-owned/controlled infrastructure?
* Which are proxied through third-party providers (Alibaba, Moonshot, etc.)?
* For proxied models, what exactly does "zero-retention" cover? Is it just between the user and OpenCode, or does it include guarantees about the upstream provider's data handling?
* For Chinese-based models, does hosting data on US/EU/Singapore infrastructure change the compliance obl

> *[Truncado — 2042 chars totais]*

---

## #24552 — I just suscribed go , and use in opencode. Try kimi-2.6 and mimo v2.5 pro, no any response still waiting

📅 `2026-04-27` | ✏️ **jinzheng8115** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24552](https://github.com/anomalyco/opencode/issues/24552)


### Question

I just suscribed go , and use in opencode. Try kimi-2.6 and mimo v2.5 pro, no any response still waiting 。 What's the problem, when can be solved.

---

## #24492 — OpenCode Go Kimi K2.5/K2.6 returns 429 insufficient balance despite active Go subscription

📅 `2026-04-26` | ✏️ **uwseoul** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24492](https://github.com/anomalyco/opencode/issues/24492)


## Summary
Kimi K2.5/K2.6 fail with a 429 error even though OpenCode Go is active and usage is low.

## Repro
- Subscribe to OpenCode Go
- Connect an OpenCode Go API key
- Run opencode models opencode-go
- Select opencode-go/kimi-k2.5 or opencode-go/kimi-k2.6

## Observed
- opencode-go/minimax-m2.7 works
- opencode-go/kimi-k2.5 and opencode-go/kimi-k2.6 fail
- Logs show:
  - statusCode: 429
  - provider_name: Moonshot AI
  - is_byok: true
  - ccount suspended due to insufficient balance
  - endpoint: https://opencode.ai/zen/go/v1/chat/completions

## Notes
OpenCode Go usage is only ~1% on the dashboard, so this does not appear to be a Go quota issue.

## Question
Should Kimi Go traffic be billed through OpenCode Go credits, or does it require separate Moonshot/BYOK balance? If it should work with Go, this looks like a routing/billing bug.

---

## #24474 — Unavailable NAS shared folder used as a projects directory prevents OpenCode from launching.

📅 `2026-04-26` | ✏️ **rayone** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24474](https://github.com/anomalyco/opencode/issues/24474)


### Question

<img width="1975" height="1767" alt="Image" src="https://github.com/user-attachments/assets/9543c070-05c5-4f64-9c08-2bee8bb001da" />

\\dNAS\R&D is no longer available, so OpenCode desktop won't launch and none of the other >20 projects work.

---

## #24460 — 我已订阅 opencode Go，但是 /model 后，没有 Kimi k2.6 以及GLM-5.1

📅 `2026-04-26` | ✏️ **offcv** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24460](https://github.com/anomalyco/opencode/issues/24460)


### Question

<img width="427" height="312" alt="Image" src="https://github.com/user-attachments/assets/b02ea280-7f73-4796-ac31-7d276142d6aa" />

---

## #24455 — `opencode web` behind a reverse proxy: OAuth callbacks should use the external URL, not `localhost:1455`

📅 `2026-04-26` | ✏️ **thepiwo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24455](https://github.com/anomalyco/opencode/issues/24455)


### Description

When `opencode web` is run behind a reverse proxy (e.g. exposed at
`https://opencode.example.com`), OAuth flows that rely on a callback URL
cannot complete. The codex plugin (ChatGPT subscription auth) starts a
side-listener on `127.0.0.1:1455` (`packages/opencode/src/plugin/codex.ts`,
`OAUTH_PORT = 1455`) and uses
`redirect_uri=http://localhost:1455/auth/callback`. The browser running the
auth flow is on the user's own machine, not the opencode server, so:

- The redirect lands on the user's `localhost:1455`, where nothing is
  listening.
- The listener inside the opencode container binds to loopback, so even if
  Docker `-p 1455:1455` were added, it can't be reached. SSH tunnels also
  fail unless the bind is `0.0.0.0` and ports are published — none of which
  is reasonable to ask web-UI users to set up per-session.
- The headless/device-code mode added in 1.14.x works for some, but is
  blocked by SSO/IdP policies in some orgs.

### Proposed change

For `opencode web` deployments, the OAuth callback should be served by the
opencode web server itself, at the externally-reachable URL the user is
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

`TaskTool` appears to have no diagnostic fallback when a subagent result contains no usable text output. In `packages/opencode/src/tool/task.ts`, it serializes the last `text` part and falls back to `""` if none is found.

In one local case on `1.14.22`, this surfaced in the parent session as an empty `<task_result>`, which made it unclear whether the subagent completed without text, errored, or produced only non-text parts.

## Relevant code

In `packages/opencode/src/tool/task.ts`:

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

## #24423 — OpenCode GO subscription by Alipay

📅 `2026-04-26` | ✏️ **manuelm02** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24423](https://github.com/anomalyco/opencode/issues/24423)


### Question

When selecting Alipay as the payment method for the OpenCode GO subscription, the payment consistently fails on Alipay's side. Could you please help take a look at what might be causing this issue? 

<img width="844" height="325" alt="Image" src="https://github.com/user-attachments/assets/70b59d6c-f863-44fe-be37-fabd474a2ce3" />

---

## #24347 — New Go Subscriptions?

📅 `2026-04-25` | ✏️ **artebit1968** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24347](https://github.com/anomalyco/opencode/issues/24347)


### Question

Hi there,
Just a quick question.
Have you considered introducing new Go subscription plans with better usage limits? The current Go plan feels too restrictive.

---

## #24303 — [QUESTION] How can I delete my account?

📅 `2026-04-25` | ✏️ **Lalma01** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24303](https://github.com/anomalyco/opencode/issues/24303)


### Question

Hi!
I want to delete my OpenCode account. How can I do that?

---

## #24284 — unable to use opencode go API with copilot

📅 `2026-04-25` | ✏️ **Arteiimis** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24284](https://github.com/anomalyco/opencode/issues/24284)


### Question

im trying to use opencode go API with copilot through [oai-compatible-copilot](https://github.com/JohnnyZ93/oai-compatible-copilot) heres error & config:

<img width="2415" height="1241" alt="Image" src="https://github.com/user-attachments/assets/d8c228fb-f9bb-4389-bf0a-df52cbd6ad75" />

full error log:
```
Sorry, your request failed. Please try again.

Copilot Request id: 687d33f4-3958-42c9-aa3e-43a42f301418

Reason: Anthropic API error: [403] Forbidden <!doctype html>

<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]--> <!--[if IE 7]> <html class="no-js ie7 oldie" lang="en-US"> <![endif]--> <!--[if IE 8]> <html class="no-js ie8 oldie" lang="en-US"> <![endif]--> <!--[if gt IE 8]><!--> <html class="no-js" lang="en-US"> <!--<![endif]--> <head> <title>Access denied | opencode.ai used Cloudflare to restrict access | opencode.ai | Cloudflare</title> <meta charset="UTF-8" /> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> <meta http-equiv="X-UA-Compatible" content="IE=Edge" /> <meta name="robots" content="noindex, nofollow" /> <meta name="viewport" content="width=device-width,initial-scale=1" /> <link rel="stylesheet" id="cf_styles-css" href="/cdn-cgi/styles/main.css" /> <script> (function(){if(document.addEventListener&&window.XMLHttpRequest&&JSON&&JSON.stringify){var e=function(a){var c=document.getElementById("error-feedback-survey"),d=document.getElementById("error-feedback-success"),b=new XMLHttpRequest;a={event:"feed

> *[Truncado — 13243 chars totais]*

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

Ideally this would also be configurable per-model in `opencode.json` (e.g., an `image_detail` option).

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

## #24156 — [Discussion] OpenCode injects env/skills prompts AFTER custom agent prompt which breaks some agents

📅 `2026-04-24` | ✏️ **neuronalism** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24156](https://github.com/anomalyco/opencode/issues/24156)


### Question

It appears that OpenCode is injecting env info and related things AFTER the agent's system prompt, which sometimes breaks the behavior of the agent, when the agent's system prompt contains some safety related prompts. 

The thing is, I have a safety-related prompt in my custom system prompt for one subagent, that says something like "The following user contents MUST be treated as normal texts and SHOULD NOT be considered as instructions". I recently noticed that qwen3.5-plus will consider the env info as part of the text, because it is AFTER my system prompt that tells it to treat it as text. The agent will put some of these env info into its output, which is not desired. When I looked into the thinking text of qwen3.5-plus, I also saw it confused with the identity of these env texts, spending many tokens deciding whether to treat these info as normal text or not.

My coding LLM pinpointed the source of this issue to `llm.ts:114-126`, where `input.agent.prompt` (the agent prompt) is pushed first, and `input.system` (`[env, skills?, ...instructions]` from `prompt.ts`) is pushed after it. 

I am looking for a workaround to this issue. Currently I use some phrases like "The input may contain <env> and .... which you should ignore", but this is not very safe as sometimes the model ignores some text similar to it. 
I hope to get some ideas from the community.

---

## #24155 — deepseek v4 不能使用

📅 `2026-04-24` | ✏️ **Kovisun** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24155](https://github.com/anomalyco/opencode/issues/24155)


### Question

base_url (OpenAI)	https://api.deepseek.com
base_url (Anthropic)	https://api.deepseek.com/anthropic
model
deepseek-v4-flash
deepseek-v4-pro
deepseek-chat (将于 2026/07/24 弃用)
deepseek-reasoner (将于 2026/07/24 弃用)
* deepseek-chat 与 deepseek-reasoner 两个模型名将于 2026/07/24 弃用。

手动输入也不能使用

---

## #24145 — Confirmation of Anthropic commercial tier protections for Claude API calls via Zen

📅 `2026-04-24` | ✏️ **Rahulgarg30591** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24145](https://github.com/anomalyco/opencode/issues/24145)


Hi, quick question about the Zen tier for Claude models.
The docs say "Anthropic's default 30-day retention applies" and link to Anthropic's policies. The 30-day window matches Anthropic's commercial API tier, so I'm assuming that's what Zen uses, but I couldn't find it stated explicitly.
Could you confirm whether Zen calls to Claude (sonnet-4.6, opus-4.6) go through Anthropic's commercial tier — i.e., the one where prompts aren't used for training and standard retention applies? An explicit line in the docs would help.
Also, if there's a related question worth answering while you're at it: when someone configures their own direct Anthropic API key instead of using Zen, does session content still route through api.opencode.ai, or does it go straight from the client to Anthropic?
Thanks.

---

## #24125 — Proposal: message.parts.before plugin hook for multimodal preflight

📅 `2026-04-24` | ✏️ **alohaninja** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24125](https://github.com/anomalyco/opencode/issues/24125)


## Problem

When a user pastes a large image (e.g., a 5MB Retina screenshot at 2816×1536), OpenCode returns:

```
Failed to send message (400): Malformed JSON in request body
```

The full base64-encoded image (~6.7MB) is embedded in the JSON POST body from the TUI to the internal server. Hono's JSON parser in `packages/opencode/src/server/routes/instance/session.ts` fails before any plugin hook fires.

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

## #24092 — Adapting to the New DeepSeek Model

📅 `2026-04-24` | ✏️ **renshengbushexie** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24092](https://github.com/anomalyco/opencode/issues/24092)


### Question

Hello developers and maintainers, we hope you can quickly adapt to the DeepSeek V4 model and address the thinking option issue. Thank you!

---

## #24065 — [QUESTION]: Is mutating `cfg` in the `config` hook an officially supported pattern for registering agents, commands, and MCP servers from plugins?

📅 `2026-04-23` | ✏️ **krnkl** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24065](https://github.com/anomalyco/opencode/issues/24065)


## Question

While experimenting with the plugin API, I discovered that mutating the `cfg` object passed to the `config` hook registers agents, commands, skills paths, and MCP servers for the duration of the opencode process — and it actually works.

I want to confirm: **is this an officially supported pattern, or an unintentional implementation side-effect?**

---

## What I'm doing

```js
// my-plugin/index.js
export default {
  config(cfg) {
    // Register a custom agent
    cfg.agent["my-agent"] = {
      name: "my-agent",
      description: "A plugin-injected agent",
      model: "github-copilot/gpt-4o",
      mode: "subagent",
      tools: { write: false, edit: false },
    };

    // Register a slash command
    cfg.command["my-command"] = {
      name: "my-command",
      description: "A plugin-injected command",
      type: "user",
      template: "Do the thing",
    };

    // Inject a skill directory
    cfg.skills.paths.push("/absolute/path/to/my-skills");

    // Register an MCP server
    cfg.mcp["my-mcp"] = {
      type: "local",
      command: ["node", "/absolute/path/to/my-server.js"],
    };
  },
};
```

All four registrations work when opencode is launched with this plugin. Agents appear in the model picker, the command shows in the slash-command list, and the MCP server connects.

---

## Why I'm asking

Looking at the source in `packages/opencode/src/plugin/index.ts`, the config hook is called like this:

```ts
Promise.resolve((hook as any).config?.(cfg)

> *[Truncado — 2986 chars totais]*

---

## #24046 — TUI mouse reporting conflicts with native terminal copy/paste in iTerm2

📅 `2026-04-23` | ✏️ **fat0** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24046](https://github.com/anomalyco/opencode/issues/24046)


## Problem

The OpenCode TUI captures mouse events, which prevents native terminal text selection (copy/paste) in iTerm2. iTerm2 shows a prompt: *'Looks like you're trying to copy to the pasteboard, but mouse reporting has prevented making a selection.'*

Users have to click 'Temporarily disable mouse reporting' every time they want to copy text from the TUI.

## Expected behavior

Native terminal copy/paste should work without disabling mouse reporting, similar to how Claude Code's TUI handles this — it avoids capturing mouse events so terminal selection always works natively.

## Environment

- macOS, iTerm2

---

## #23915 — opencode github run checks context.actor instead of the authenticated identity

📅 `2026-04-23` | ✏️ **Svtter** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23915](https://github.com/anomalyco/opencode/issues/23915)


## Summary

`opencode github run` appears to validate write access against `context.actor` from the workflow event, not against the identity actually used by the Octokit client/token. This can cause false permission failures when a PR workflow is triggered by a bot-authored `synchronize` event, for example after a prior workflow pushes to the PR branch with `GITHUB_TOKEN`.

## Current behavior

In `packages/opencode/src/cli/cmd/github.ts`:

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

## #23804 — opencode serve leaks ~14GB/hour of .so files in /tmp due to non-pooled ripgrep Workers

📅 `2026-04-22` | ✏️ **wuyang630** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23804](https://github.com/anomalyco/opencode/issues/23804)


## Summary

`opencode serve` causes unbounded disk growth in `/tmp` by creating and destroying ripgrep Workers for every file search/list operation. Each Worker triggers Bun to extract the embedded `libopentui.so` (~4.3MB on Linux x64) to `/tmp` with a unique filename, but these files are never cleaned up.

## Root cause

Two contributing factors:

### 1. Ripgrep Workers are created and destroyed per-operation (opencode side)

In `packages/opencode/src/file/ripgrep.ts`, both `searchWorker()` and `filesWorker()` follow a create-use-destroy pattern:

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

![agent-thinking-no-path](https://raw.githubusercontent.com/0xWerz/opencode/assets/issue-screenshot/.github/assets/issue-23801-screenshot.png)

**What i think should happen:**

If the image came from a file on disk, the agent should know the path so it can reference or copy it directly. Not sure how it should work for screenshots or copied image data, but at least for actual files this would save a lot of hassle.

Related: #17488

PR: #23802

---

## #23781 — use open code go with claude code

📅 `2026-04-22` | ✏️ **lsh40** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23781](https://github.com/anomalyco/opencode/issues/23781)


### Question

Just subbed to opencode go, is there any way to use it with claude code cli?

---

## #23777 — 401 Model opencode-go/GLM-5.1 not supported

📅 `2026-04-22` | ✏️ **yzchangle-svg** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/23777](https://github.com/anomalyco/opencode/issues/23777)


### Question

After configuring the model, I was prompted that the model is unavailable. Here is my configuration file.And I already buy onepcode-go API.
{ 
 "provider": "opencode-go", 
 "base_url": "https://opencode.ai/zen/go/v1", 
 "api": "openai-completions", 
 "api_key": "", 
 "model": { 
 "id": "opencode-go/GLM-5.1", 
 "name": "GLM-5.1" 
 } 
}

---

## #23685 — time window limits

📅 `2026-04-21` | ✏️ **angiely1115** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23685](https://github.com/anomalyco/opencode/issues/23685)


### Question

I am using my own custom model completely, but why am I still being restricted by time window limits? Thank you!

---

## #23607 — POST /session ignores directory query parameter for session record

📅 `2026-04-20` | ✏️ **Arthur-GH** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23607](https://github.com/anomalyco/opencode/issues/23607)


## Summary

When creating a session via `POST /session?directory=/path/to/project`, the server ignores the `directory` query parameter and sets the session's `directory` field to `process.cwd()` instead.

## Context

OpenChamber (desktop GUI) runs a single OpenCode server and uses the `directory` query parameter to scope sessions to different project directories. The SDK correctly sends `directory` as a query param on session creation:

```js
// From @opencode-ai/sdk
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

- Launched OpenCode server from `/Users/me` (via OpenChamber desktop)
- Created session with `directory=/Users/me/projects/myapp` via the SDK
- DB shows: `directory: /Users/me`, `project_id: global`
- Changed server cwd to `/Users/me/projects` via a wrapper script
- New sessions now show `directory: /Users/me/projects` — confirming the field comes from `process.cwd()`, not the query param

## Expected behavior

When `directory` is provided as a query parameter on `POST /session`, the session record should use that value for its `directory` field (and resolve the matching project accordingly).

## Environme

> *[Truncado — 1574 chars totais]*

---

## #23513 — Does my OpenCode Go subscription bill via the REST API, or is it TUI-only?

📅 `2026-04-20` | ✏️ **GreyAssoc** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23513](https://github.com/anomalyco/opencode/issues/23513)


### Question

 Hi,

  I've got an OpenCode Go monthly subscription and I'm integrating it into a custom Go
  application (not the TUI). I need to confirm how the Go plan's billing works over the REST
  API.

  What I'm doing today:

  - POST https://opencode.ai/zen/v1/chat/completions
  - Authorization: Bearer <my OpenCode API key>
  - Model ID: glm-5.1

  My questions:

  1. Does that request bill against my Go subscription, or against pay-as-you-go Zen credits?
  2. If it's Zen credits, what's the correct REST config to route requests through my Go
  subscription — a different base URL, a header, an API-key flag, or a model prefix?
  3. I tried https://opencode.ai/zen/go/v1 and a model prefix of opencode-go/glm-5.1; both
  returned 401 Unauthorized — Model opencode-go/glm-5.1 not supported. Are those
  endpoints/prefixes real, or was I given bad info?
  4. If the Go plan is TUI-only and has no direct REST surface, please say so explicitly — I'll
   plan around it.
  5. I would like to connect via my Opencode Go subscription primarily, please advise how I do this.

  A definitive answer on any of these five would unblock me. Happy to share more context about
  my use case if useful.

  Thanks,
  Steve Whitehead

---

## #23446 — macOS notifications show as 'Script Editor' instead of terminal app — no click-to-focus

📅 `2026-04-19` | ✏️ **dexion** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23446](https://github.com/anomalyco/opencode/issues/23446)


## Problem

On macOS, desktop notifications from OpenCode appear to come from **"Script Editor"** (AppleScript) instead of the terminal emulator (iTerm2, Terminal.app, etc.). Clicking the notification opens Script Editor instead of focusing the correct terminal tab.

This happens because OpenCode uses `osascript -e 'display notification...'` as a fallback, and macOS attributes the notification to the osascript process (Script Editor) rather than the terminal.

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

## #23432 — opencode -c 在新目录中导致黑屏无法退出

📅 `2026-04-19` | ✏️ **sharyuke** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23432](https://github.com/anomalyco/opencode/issues/23432)


## Bug 描述

在新打开的目录（从未使用过 opencode 的目录）中执行 `opencode -c` 命令时，出现黑屏，无法退出，也无法重新打开 opencode。

## 环境信息

- opencode 版本：1.14.17
- 安装路径：/home/sharyuke/.opencode/bin/opencode
- 平台：Linux
- Shell：bash

## 复现步骤

1. 进入一个从未使用过 opencode 的目录
2. 执行 `opencode -c` 命令
3. 出现黑屏，无法操作
4. 无法退出（Ctrl+C、Ctrl+D 均无响应）
5. 无法重新打开 opencode

## 预期行为

即使在新的目录中，`opencode -c` 也应该正常启动或给出合理的错误提示，而不是导致黑屏无法退出。

## 补充

可能是配置目录或初始化文件不存在导致的崩溃问题。

---

## #23419 — 1.4.x->1.14.x?

📅 `2026-04-19` | ✏️ **Wang1213** | 💬 14 | 🔗 [https://github.com/anomalyco/opencode/issues/23419](https://github.com/anomalyco/opencode/issues/23419)


### Question

OpenCode's update strategy is frequent and aggressive, with incomprehensible bugs or confusing decisions appearing almost every few versions. Is this version jump normal?

---

## #23258 — Permission model: project-local routine approvals + sibling worktree trust are too noisy for autonomous contributor sessions

📅 `2026-04-18` | ✏️ **samuelazran** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23258](https://github.com/anomalyco/opencode/issues/23258)


## Summary
OpenCode still becomes too approval-noisy for long-running autonomous contributor sessions, even when the project has already approved routine repo work conceptually.

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

## #23243 — 免费模型不全，只能看到3个模型，其他免费模型看不到，版本1.4.7

📅 `2026-04-18` | ✏️ **li61609** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23243](https://github.com/anomalyco/opencode/issues/23243)


### Question

<img width="558" height="254" alt="Image" src="https://github.com/user-attachments/assets/a20d8883-7c59-4962-bf43-780fceb3d8bd" />

---

## #23077 — Translating promts to english befor doing the job

📅 `2026-04-17` | ✏️ **B0rner** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23077](https://github.com/anomalyco/opencode/issues/23077)


### Question

Most models work best when you provide prompts in English. However, in my experience, I’ve noticed that many non-English speakers use their native language for prompts, which -depending on the model- can result in requests being handled less accurately, or the model entering an “I speak language XY” mode and often attempting to translate tokens that are more common in the target language. `details.js` then becomes `details.ja`, at which point OpenCode wonders why there isn’t a file named `details.ja` at all. 

This problem is particularly noticeable with locally hosted models when quantization is used, even on mdium models with 100 - 200 GB size. However, you can also feel the improved understanding with English prompts when using Claude Opus, and the like.

My question is: is there a way to configure opencode in that way, that non-english-prompts will be translated (by a model) in the first step before sending the "real job" to a model?

---

## #23054 — Can this popup be made larger? The name is being cut off.

📅 `2026-04-17` | ✏️ **zhangchuanqiang-cloud** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23054](https://github.com/anomalyco/opencode/issues/23054)


### Question

<img width="372" height="310" alt="Image" src="https://github.com/user-attachments/assets/49a1e52f-c9a0-4695-8b9e-23137a0f7a54" />

Can this popup be made larger? The name is being cut off.

---

## #23049 — Agent names displayed incorrectly with ZWSP characters in TUI (e.g., "Ultraworker" → "ltraworker")

📅 `2026-04-17` | ✏️ **CoolstrangerFJ** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23049](https://github.com/anomalyco/opencode/issues/23049)


## Description

When using oh-my-openagent plugin with OpenCode TUI, agent names are displayed incorrectly - missing the first few characters. This is caused by zero-width space (ZWSP, U+200B) characters used for sort prefixes in `AGENT_LIST_SORT_PREFIXES`.

## Environment

- OpenCode version: 1.4.0
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
- OpenCode version: `1.4.7`
- Provider: `GitHub Copilot`
- Model: `github-copilot/claude-opus-4.7`

## What I tested
### 1) Direct CLI with `medium` works
```bash
opencode run -m github-copilot/claude-opus-4.7 --variant medium --dangerously-skip-permissions "Reply with ORACLE_OK only."
```

Result:
```text
> Sisyphus - Ultraworker · claude-opus-4.7
ORACLE_OK
```

### 2) Direct CLI with `low` fails
```bash
opencode run -m github-copilot/claude-opus-4.7 --variant low --dangerously-skip-permissions "Reply with ORACLE_OK only."
```

Result:
```text
Error: Bad Request: {"error":{"message":"output_config.effort \"low\" is not supported by model claude-opus-4.7; supported values: [medium]","code":"invalid_reasoning_effort"}}
```

## Why this seems buggy
I was previously told that in some OpenCode + GitHub Copilot flows, `variant: medium` was being mapped to an unsupported effort (effectively `high`) for `claude-opus-4.7`, and that switching to `variant: low` was a workaround.

But based on the direct tests above:
- `medium` is valid for `claude-opus-4.7`
- `low` is not valid 

> *[Truncado — 2330 chars totais]*

---

## #23036 — I think v1.4.2 is the latest stable version who is with me?

📅 `2026-04-17` | ✏️ **greatbody** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23036](https://github.com/anomalyco/opencode/issues/23036)


### Question

Later version has all different kind of bugs, like memory issue, WebUI issue.

I just want to remind people using it as production tool.

For contributors, Thanks anyway for all the hard work. Bugs are unavoidable as long as its a software, wish we could have a balance between features and bugs.

---

## #23005 — opencode如何在win10系统上离线安装呢

📅 `2026-04-17` | ✏️ **zinglifet** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23005](https://github.com/anomalyco/opencode/issues/23005)


### Question

请问，opencode如何在win10系统上离线安装呢

---

## #22850 — --model 参数在持久会话模式下不生效

📅 `2026-04-16` | ✏️ **teng2-doudou** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22850](https://github.com/anomalyco/opencode/issues/22850)


# Issue: `--model` 参数在持久会话模式下不生效

## 问题描述

在使用 `acpx` 驱动 OpenCode 时，`--model` 参数在持久会话（`sessions`）模式下存在配置不生效的问题。

### 具体表现

1. **创建会话时**：`--model` 参数可以正确设置模型
2. **连接已有会话时**：模型被重置为默认的 `big-pickle`，而非创建时指定的模型

## 复现步骤

### 步骤1：创建会话时指定模型
```bash
cd /path/to/project
acpx --model baowu_ds_proxy/DeepSeek-R1 opencode sessions new --name test-session
```

### 步骤2：验证创建时的模型（exec 模式）
```bash
acpx --model baowu_ds_proxy/DeepSeek-R1 opencode exec "请输出当前模型"
# 输出：DeepSeek-R1 ✅ 正确
```

### 步骤3：连接已有会话
```bash
acpx opencode -s test-session "请输出当前模型"
# 输出：big-pickle ❌ 错误，应该是 DeepSeek-R1
```

## 测试结果

| 模式 | `--model` 位置 | 实际模型 | 结果 |
|------|---------------|---------|------|
| `exec` | `acpx --model xxx opencode exec` | DeepSeek-R1 | ✅ 正确 |
| `sessions new` | `acpx --model xxx opencode sessions new` | DeepSeek-R1 | ✅ 创建时正确 |
| `-s` (连接) | `acpx opencode -s xxx` | big-pickle | ❌ 错误 |

## 预期行为

连接已有会话时，应该保持创建会话时指定的模型配置，而不是重置为默认模型。

## 实际行为

连接已有会话时，模型被重置为 `opencode/big-pickle`（OpenCode 默认模型）。

## 影响

1. 无法使用持久会话模式配合自定义模型
2. 必须在每次对话时使用 `exec` 模式（新建会话），无法享受持久会话的历史记录功能
3. 对于需要特定模型（如 DeepSeek-R1）的场景，用户体验受损

## 环境信息

- **操作系统**：macOS (darwin)
- **acpx 版本**：最新版（通过 npm 安装）
- **OpenCode 版本**：最新版
- **项目配置**：`opencode.json` 中指定了自定义模型

## 临时解决方案

使用 `exec` 模式代替 `sessions` 模式：

```bash
# 每次新建会话，确保模型正确
acpx --model baowu_ds_proxy/DeepSeek-R1 opencode exec "提示词"
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

## #22779 — Should "list all files" exclude `node_modules/` to save tokens?

📅 `2026-04-16` | ✏️ **frouo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22779](https://github.com/anomalyco/opencode/issues/22779)


### Question

My prompt leads the agent to list files in the `.opencode/` folder, including `node_modules/`. See:

<img width="862" height="653" alt="Image" src="https://github.com/user-attachments/assets/23caef56-1a16-4b83-b9d3-5579f194a85b" />

That's a lot of wasted tokens, isn't it?

---

## #22776 — No Answer with all models - Questions aren't working (Desktop)

📅 `2026-04-16` | ✏️ **Schokolader** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22776](https://github.com/anomalyco/opencode/issues/22776)


### Question

Problem: I can't ask questions in the desktop app (v1.4.6). The loading button keeps loading indefinitely without returning a response.
What I've already tried:
Completely uninstalled and reinstalled the desktop app
Deleted all local files (~/.local/share/opencode, ~/Library/Application Support, etc.)
Performed a fresh installation
Tested the network (opencode.ai and api.opencode.ai are accessible)
My account and subscription are active
Go Subscription: Active

Do you know what to do?

---

## #22767 — opencode中使用playwright cli执行open命令一直阻塞

📅 `2026-04-16` | ✏️ **zhaoguogeng** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22767](https://github.com/anomalyco/opencode/issues/22767)


### Question

<img width="1584" height="1178" alt="Image" src="https://github.com/user-attachments/assets/01b005ab-9943-4bcb-a91f-dfb5ec9f52fe" />

 windows操作系统，在OpenCode中执行playwright-cli open命令，浏览器已经成功打开了，但是命令似乎没有执行完，一直阻塞在这里。
使用powershell执行没有问题，对比命令行输出内容，发现在opencode中没有events相关内容

<img width="826" height="252" alt="Image" src="https://github.com/user-attachments/assets/979efc20-ba41-4a3d-a53a-f748ac562280" />

---

## #22659 — When i am in the web interface and select open project it shows content of my home folder

📅 `2026-04-15` | ✏️ **OcBuddy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22659](https://github.com/anomalyco/opencode/issues/22659)


### Question

Hi, 

Linux here using 'opencode web', when i am in the web interface and select open project it shows content of my home folder.

How can i change permissions to only show me paths from one specific location when using the 'open project' dialog in web?

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
| **#2** | Backend generates `Number.MAX_SAFE_INTEGER` context patches — oversized payloads | `packages/opencode/src/project/vcs.

> *[Truncado — 3733 chars totais]*

---

## #22643 — Edit tool applies session project's formatter instead of target file's formatter for cross-project edits

📅 `2026-04-15` | ✏️ **siminn-johanngj** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22643](https://github.com/anomalyco/opencode/issues/22643)


## Description

When editing a file that belongs to a **different project** than the OpenCode session, the edit tool applies the **session project's formatter** instead of detecting and using the **target file's project formatter**.

This means the wrong formatter (not just the wrong config) is applied to the file.

## Concrete example

- **Session project** (`/code/project-a/`): has `biome.json` with `quoteStyle: "single"`
- **Target file** (`/code/project-b/redux/services/baseApi.ts`): project has `.prettierrc` with `singleQuote: false` (double quotes), no `biome.json`

When the edit tool modifies `baseApi.ts`, OpenCode runs **Biome** (from project-a) instead of **Prettier** (from project-b). Result: the entire file gets reformatted with single quotes, reorganized imports, and trailing commas — none of which match the target project's conventions.

The diff shows 72 insertions / 77 deletions for what should be a 3-line addition.

## Relation to #17051

Issue #17051 describes the same formatter using the wrong **config** (Elixir's `mix format` resolves `.formatter.exs` from session cwd). This issue is broader: OpenCode picks the wrong **formatter entirely** — Biome instead of Prettier — because it never inspects the target file's project for its own formatter configuration.

## Expected behavior

When formatting a file after edit, OpenCode should:

1. Walk up from the target file's directory to find the nearest formatter config (`biome.json`, `.prettierrc`, `.formatter.exs`,

> *[Truncado — 2069 chars totais]*

---

## #22595 — Qwen3.6 Plus Context Limit Decreased?

📅 `2026-04-15` | ✏️ **Tao-Yida** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22595](https://github.com/anomalyco/opencode/issues/22595)


### Question

During the free trail of Qwen 3.6 Plus, a context limit of 1M tokens was provided, which is the reason I chose Opencode Go, hoping to use it when the official paid access being available. But now I noticed that its context window has decreased to 260k in the new version of Opencode.
Is there any plan in future to bring back the old context window for Qwen3.6 Plus?

---

## #22536 — support GPT‑5.4‑Cyber?

📅 `2026-04-15` | ✏️ **k3mlol** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22536](https://github.com/anomalyco/opencode/issues/22536)


### Question

from the openAI news
 - https://openai.com/index/scaling-trusted-access-for-cyber-defense/ 
 - https://chatgpt.com/cyber
 - Maybe I ask opencode now can use GPT‑5.4‑Cyber?

---

## #22525 — opencode调用vllm部署的模型,调用工具报错

📅 `2026-04-15` | ✏️ **xiaokuan1234** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22525](https://github.com/anomalyco/opencode/issues/22525)


### Question

我部署了 GLM5 模型用 解析器用--tool-call-parser glm47, 调用工具无法和opencode适配,opencode报错:

<img width="1143" height="522" alt="Image" src="https://github.com/user-attachments/assets/dc1885f2-21a6-42f4-90b0-dbc7e1fcc2f3" />

 我返回的参数是"message": {
                "role": "assistant",
                "content": null,
                "refusal": null,
                "annotations": null,
                "audio": null,
                "function_call": null,
                "tool_calls": [],
                "reasoning": "<tool_call>calculator_server :: function add<arg_key>a</arg_key><arg_value>1</arg_value><arg_key>b</arg_key><arg_value>6</arg_value></tool_call>"
            },

---

## #22411 — opencode读取不了pdf文档

📅 `2026-04-14` | ✏️ **liguoqiang0216** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22411](https://github.com/anomalyco/opencode/issues/22411)


### Question

opencode接入MiMo-V2-Omni模型，这个模型是可以读取pdf文档的，但是使用此模型在opencode里读取文档时报这个错：[{'type': 'value_error', 'loc': ('body', 'messages', 10, 'ChatCompletionMessageGenericParam', 'role'), 'msg': "Value error, 'role' must be one of 'system', 'developer', 'assistant', 'tool', or 'function' (case-insensitive).", 'input': 'user', 'ctx': {'error': ValueError("'role' must be one of 'system', 'developer', 'assistant', 'tool', or 'function' (case-insensitive).")}}, {'type': 'string_type', 'loc': ('body', 'messages', 10, 'ChatCompletionMessageGenericParam', 'content', 'str'), 'msg': 'Input should be a valid string', 'input': [{'text': 'Attached image(s) from tool result:', 'type': 'text'}, {'file': {'file_data': 'data:application/pdf

---

## #22375 — Unable to get permissions to work as intended

📅 `2026-04-14` | ✏️ **JakeMHughes** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22375](https://github.com/anomalyco/opencode/issues/22375)


### Question

I'm pretty new to opencode and I am trying to setup my permissions for everything (putting this in the `~/.config/opencode/opencode.json` file). Essentially I want it so when I open opencode in a folder, opencode should be able to edit any file in that folder. but anything one folder up ( `../`) should ask for permissions. Now, one of the reasons im having trouble testing this stuff, is because it feels like theres a constant workaround using bash skill.

For example, I set the "list" skill to deny but according to opencode "ls" under bash was allowed so it just ran that instead.  I tried setting edit to the below, and asked the model to write hello to a temp file, and the permission was ignored and fell under bash rules because "echo 'Hello' > temp" was used instead
```yaml
    "edit": {
      "./**": "allow",
      "*": "deny"
    }
```

So im mostly just looking for some help on what fundamental misunderstanding I  have regarding the permissions. also is it possible to have allow for the "current" directory? I know I can hardcode a path, but I want the path to be determined at opencode load time

---

## #22349 — When jumping back to a message that invoked skill, the skill is expanded in the prompt input

📅 `2026-04-13` | ✏️ **raine** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22349](https://github.com/anomalyco/opencode/issues/22349)


### Description

If you invoke a skill with `/myskill`, and then later jump back to that message, you see the skill prompt expanded, and if you want to edit the message, you have to clear the whole expanded prompt which could be massive.

Claude code retains just the `/myskill` when jumping back, which I believe is the desired behavior here.


### OpenCode version

v1.4.3

---

## #22269 — Fork parent context into multiple subagents

📅 `2026-04-13` | ✏️ **JaviOverflow** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22269](https://github.com/anomalyco/opencode/issues/22269)


### Question

I don't know if this is currently possible in opencode. Basically the workflow I'm trying to achieve is the following:

I have a piece of work I need to get done in several parts of the codebase, let's say is >20, the work is the same and each of those is independent
1 - I do some planning on the overall architecture and the context around that functionality
2 - then it's time to do the refactor on each of those 20 packages. Each of those is independent among themselves, but dependent to where they fit in the overall architecture/design
3 - I ask opencode to run the implementation on each of those 20 packages as different subagents, such that one subagent per package, and run in parallel

Problem is that I notice that each subagent starts from scratch, and loses the context coming from the planning phase. Is there a way to make each of those subagents fork the context from the parent (so each leverages the context from the planning phase)

Note that from a token point of view this would be very efficient, since the parent messages would be already cached, so it's virtually free to fork, only new messages in each subagent should cost money if i'm not wrong

---

## #22247 — 求助 ai修改了一个名为opencode.json文件过后 重启就一直提示无法连接服务器

📅 `2026-04-13` | ✏️ **arctan303** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/22247](https://github.com/anomalyco/opencode/issues/22247)


### Question

<img width="2560" height="1528" alt="Image" src="https://github.com/user-attachments/assets/8c65f65c-88a0-4498-84e3-3770360fccc5" />多次尝试卸载重新安装无效

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

## #22199 — Doubt with Custom LSP configuration.

📅 `2026-04-12` | ✏️ **abdedarghal111** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22199](https://github.com/anomalyco/opencode/issues/22199)


### Question

Hi, I am trying to add a custom lsp for my roblox project but I can't setup the LSP correctly.

First I readed the LSP documentation but I didn't found enought information about how to setup it:
 - https://opencode.ai/docs/lsp/#servidores-lsp-personalizados

Then I started testing the LSP, in this case is Luau lsp.
 - https://github.com/JohnnyMorganz/luau-lsp

I figured out how to use the LSP:
```
luau-lsp.exe analyze --definitions=globalTypes.d.luau --sourcemap=sourcemap.json --formatter=gnu .\src\Server\Modules\TycoonSystem\Structure.luau
[INFO] Loading definitions file: @roblox - globalTypes.d.luau
[WARN] client does not allow didChangeWatchedFiles registration - automatic updating on sourcemap changes disabled
src/Server/Modules/TycoonSystem/Structure.luau:67.1-67.6: SyntaxError: Incomplete statement: expected assignment or a function call
src/Server/Modules/TycoonSystem/Structure.luau:67.26-67.26: SyntaxError: Expected identifier when parsing method name, got '('
src/Server/Modules/TycoonSystem/Structure.luau:79.1-79.3: SyntaxError: Expected <eof>, got 'end'
src/Server/Modules/TycoonSystem/Structure.luau:8.1-8.31: TypeError: Table type 'Structure' not compatible with type 'Structure' because the former is missing fields 'hide', 'locked', 'model', and 'show'
```

But when I add it to my project, it doesn't work, this is my configuration schema:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": {
    "luau-lsp": {
      "command": [
        "

> *[Truncado — 1984 chars totais]*

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

## #22164 — Upgrade required !!?

📅 `2026-04-12` | ✏️ **iiioooiso** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22164](https://github.com/anomalyco/opencode/issues/22164)


### Question

Hi,
I’m using OpenCode with a custom OpenAI-compatible endpoint (local/self-hosted). The endpoint works correctly with other tools (tested via curl and other OpenAI-compatible clients).

However, in OpenCode I consistently get this error:

“Upgrade Required: Upgrade Required”

I am not using a paid provider or cloud API, and my endpoint is fully OpenAI-compatible (/v1/chat/completions).

Could this be a bug or a restriction in how OpenCode handles custom OpenAI-compatible endpoints?

Details:

Backend: OpenAI-compatible local endpoint
Endpoint URL: http://my-server/v1
Works with: other OpenAI-compatible tools (no errors)
Fails in OpenCode: shows “Upgrade Required”

Is there any specific configuration required to properly use a custom OpenAI-compatible provider in OpenCode?

Thanks!

---

## #22081 — Desktop app starts maximized on Linux/Wayland; causes poor dialog behavior on tiling compositors

📅 `2026-04-11` | ✏️ **ndrwstn** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22081](https://github.com/anomalyco/opencode/issues/22081)


Hi! I think OpenCode Desktop is forcing a maximized main window on Linux, and this causes poor UX on tiling Wayland compositors like Hyprland.

## Summary

On Hyprland/NixOS, OpenCode Desktop does not open like a normal tiled app window. Instead, the main window appears to start maximized/fullscreen-ish, and native dialogs such as the project/file picker can behave poorly as a result.

In practice, the file picker can appear behind or otherwise not behave like a normal modal dialog.

## Environment

- OpenCode Desktop
- Linux
- Wayland
- Hyprland
- NixOS

## What I observed

From runtime inspection in Hyprland:

- main window title: `OpenCode`
- picker/dialog title: `Open project`
- both windows are native Wayland
- both windows are non-floating

This initially looked like a portal issue, but `xdg-desktop-portal` and `xdg-desktop-portal-gtk` were both running correctly.

I also verified this is not caused by my Hyprland config forcing OpenCode to fullscreen or float.

## Likely root cause

Looking at the desktop app source/package, it appears the main Tauri window is created with:

```rust
.maximized(true)
```

and the app also uses the Tauri window-state plugin to persist/restore window state.

That seems to mean OpenCode is explicitly asking to start maximized, rather than letting the compositor/window manager place the window naturally.

On a tiling compositor like Hyprland, this leads to awkward behavior for dialogs like `Open project`, which then do not feel properly mod

> *[Truncado — 2260 chars totais]*

---

## #22065 — [QUESTION] Agent default variant handling in TUI/Desktop (#7156)

📅 `2026-04-11` | ✏️ **CasualDeveloper** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22065](https://github.com/anomalyco/opencode/issues/22065)


### Question

Would maintainers accept the remaining narrow client-side scope for agent-configured model variants in #7156?

The PR now only covers:
- app/TUI local-state and hydration behavior for selected vs configured variants
- shared helper/tests for selected / Default / agent-configured resolution
- prompt bar display of the effective variant

It intentionally does not add backend/session/API/SDK behavior. The broader backend pieces from the original #7138 discussion have already landed or are out of scope for this PR.

This is a replacement for auto-closed #7138 so #7156 stays linked to an open design/review thread.

---

## #21994 — can agent obtain terminal logs ？

📅 `2026-04-11` | ✏️ **zuuky** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21994](https://github.com/anomalyco/opencode/issues/21994)


### Question

Is there any way or plugin for OpenCode Windows desktop version that allows the agent to obtain terminal logs, so that the agent can automatically and continuously fix problems?

<img width="2210" height="1089" alt="Image" src="https://github.com/user-attachments/assets/37692d55-f672-4745-b696-701f51c9ae23" />

---

## #21941 — opencode export can write session JSON that opencode import cannot read in 1.4.3

📅 `2026-04-10` | ✏️ **christianknauer** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21941](https://github.com/anomalyco/opencode/issues/21941)


## Summary

`opencode 1.4.3` can export a session JSON file that `opencode 1.4.3` cannot import again.

The failure happens with sessions that still contain legacy pre-1.4 data shapes. `export` appears to serialize that legacy shape as-is, while `import` validates against the new 1.4 schema.

## Version

```bash
opencode --version
# 1.4.3
```

## Repro

1. Export an existing session:

```bash
sid=$(opencode session list --format json -n 1 | jq -r '.[0].id')
opencode export "$sid" > /tmp/session.json
```

2. Try to import the exported file:

```bash
opencode import /tmp/session.json
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

A file produced by `opencode export` should be importable by `opencode import` in the same version.

## What I found

The exported file contains legacy-shaped data such as:

- `messages[].info.variant` instead of `messages[].info.model.variant`
- `summary.diffs[*].before/after` without `patch`

I wrote a local converter that:
- moves `messages[].info.variant` -> `messages[].info.model.variant`
- replaces legacy `summary.diffs[*].before/after` with a schema-valid `patch` string

After that conversion, `opencode import` succeeds.

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

## #21872 — 复制，滚动条等体验问题

📅 `2026-04-10` | ✏️ **7568168** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21872](https://github.com/anomalyco/opencode/issues/21872)


### Question

opencode
<img width="1347" height="778" alt="Image" src="https://github.com/user-attachments/assets/cd8d64c6-2bff-4bd7-aeb7-e0d0599fe705" />
Claude
<img width="1321" height="778" alt="Image" src="https://github.com/user-attachments/assets/37509b08-a176-4324-a1fa-82658e0a792c" />

win的powershell不能双击复制，选定复制还会弹窗，影响体验，不知道是不是配置问题，找了挺多地方没找到怎么把这两个配置过来，希望能优化优化吧

---

## #21829 — `--prompt` is ignored when combined with `--session --fork` in TUI mode

📅 `2026-04-10` | ✏️ **raine** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21829](https://github.com/anomalyco/opencode/issues/21829)


### Description

When launching opencode in TUI mode with `--session <id> --fork --prompt "..."`, the session is forked correctly but the prompt is never sent as a message. 

**Reproduction:**

```bash
# 1. Create a session, note the session ID
opencode

# 2. Fork it with a prompt - prompt is ignored, but you can see if you press arrow up
opencode --session ses_xxxx --fork --prompt "hello"
```

**Expected:** The forked session should open with "hello" automatically sent as the first new user message.

**Actual:** The forked session opens but no message is sent. The `--prompt` flag is silently ignored.


### Plugins

_No response_

### OpenCode version

1.4.3

---

## #21820 — oepncode内置超时机制使得mcp无法使用

📅 `2026-04-10` | ✏️ **ZJJane** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21820](https://github.com/anomalyco/opencode/issues/21820)


### Question

目前利用opencode里面mcp功能对方案进行审阅，期间大量分析使得响应一般超过120s，再未响应具体意见时，系统关闭了mcp请求，请合理扩大超时设置。

opencode 内置 120 秒超时设置导致 llm-chat MCP 无法使用
超时类型	值
DEFAULT_TIMEOUT_MS	120000ms (120 秒)
PROMPT_TIMEOUT_MS	120000ms (120 秒)
SESSION_TIMEOUT_MS	600000ms (10 分钟)
问题机制：
skill_mcp 调用
    ↓
opencode 客户端等待 (DEFAULT_TIMEOUT_MS = 120s)
    ↓
glm-5 思考时间 + API 响应 = 120-180 秒
    ↓
超过 120 秒 → 客户端主动取消请求
    ↓
错误："notifications/cancelled"

---

## #21794 — Terminal frozen and unable to create new instances - v1.4.3 (Windows 10)

📅 `2026-04-10` | ✏️ **hongenge** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21794](https://github.com/anomalyco/opencode/issues/21794)


### Description

In version v1.4.3, the integrated terminal becomes completely unresponsive. Users cannot type any characters, and the cursor does not move. Additionally, the "New Terminal" function is broken; clicking the button or using the shortcut results in no action.


### OpenCode version

v1.4.3


### Operating System

Windows 10

---

## #21707 — qwen3.6-plus-free still appears in Zen discovery

📅 `2026-04-09` | ✏️ **sumneshsalodkar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21707](https://github.com/anomalyco/opencode/issues/21707)


OpenCode Zen still needs to fully hide qwen3.6-plus-free from model discovery and fail explicitly if stale config tries to use it. This should cover Zen metadata, OpenCode provider discovery, and stale config/API usage.

---

## #21700 — 卸载 oh-my-opencode 后重新安装 opencode，TUI 仍显示 Sisyphus 等 agents

📅 `2026-04-09` | ✏️ **a523926245** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21700](https://github.com/anomalyco/opencode/issues/21700)


## 环境
- opencode-ai@1.4.1
- Windows

## 问题描述
1. 之前安装过 oh-my-opencode，后来从 opencode.json 中移除并卸载
2. 完全卸载 opencode-ai 后重新安装
3. 在 K: 盘（无 .opencode 配置）运行
4. opencode agent list 只显示原生 agents (build, plan, explore 等)
5. 但 TUI 左下角 agent 切换显示 Sisyphus、Hephaestus、Prometheus、Atlas
6. 当前会话使用 Sisyphus agent，标题显示 Sisyphus - Ultraworker

## 期望行为
卸载插件后应只显示原生 agents (build, plan, explore, general, compaction, summary, title)

---

## #21673 — github run: eyes reaction not removed when USE_GITHUB_TOKEN=true

📅 `2026-04-09` | ✏️ **syakovyn** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21673](https://github.com/anomalyco/opencode/issues/21673)


## Bug

When running `opencode github run` with `USE_GITHUB_TOKEN=true`, the 👀 (eyes) reaction added as a processing indicator is never removed.

## Root Cause

`AGENT_USERNAME` is hardcoded to `"opencode-agent[bot]"` in `packages/opencode/src/cli/cmd/github.ts`. The `removeReaction()` function filters reactions by `r.user?.login === AGENT_USERNAME` to find the one to delete.

However, when `USE_GITHUB_TOKEN=true`, the reaction is created by `github-actions[bot]` (the identity behind `GITHUB_TOKEN`), not `opencode-agent[bot]`. The filter finds no match and silently returns without deleting:

```typescript
const AGENT_USERNAME = "opencode-agent[bot]"

// In removeReaction():
const eyesReaction = reactions.data.find((r) => r.user?.login === AGENT_USERNAME)
if (!eyesReaction) return  // <-- always hits this path with USE_GITHUB_TOKEN
```

## Expected Behavior

The eyes reaction should be removed regardless of whether the OIDC app token or `GITHUB_TOKEN` is used.

## Suggested Fix

Resolve the authenticated user dynamically (e.g., `GET /user` or from the reaction creation response) instead of comparing against the hardcoded `"opencode-agent[bot]"` username.

## Reproduction

1. Set up a workflow with `USE_GITHUB_TOKEN: 'true'` and `GITHUB_TOKEN: ${{ github.token }}`
2. Trigger `opencode github run` on a PR
3. Observe the 👀 reaction is added but never removed
4. Logs show "Adding reaction..." and "Removing reaction..." but the reaction persists

## Workaround

Add a cleanup step a

> *[Truncado — 1864 chars totais]*

---

## #21643 — Cannot connect to API: The socket connection was closed unexpectedly. For more information, pass `verbose: true` in the second argument to fetch()

📅 `2026-04-09` | ✏️ **adamw199112** | 💬 13 | 🔗 [https://github.com/anomalyco/opencode/issues/21643](https://github.com/anomalyco/opencode/issues/21643)


### Question

Cannot connect to API: The socket connection was closed unexpectedly. For more information, pass `verbose: true` in the second argument to fetch()

<img width="1267" height="756" alt="Image" src="https://github.com/user-attachments/assets/89acf5ac-5862-40fe-a83b-98ba92b504c4" />

所有 opencode zen模型都连接不上，但是copilot的模型都可以。

linux系统
环境在qemu虚拟机中，请问是什么问题？

---

## #21606 — IntelliJ IDEA adds other AI models

📅 `2026-04-09` | ✏️ **RoeGross** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21606](https://github.com/anomalyco/opencode/issues/21606)


### Question

Not the first time I opened OpenCode ACP, it didn't have an entry for me to reconfigure my AI model

---

## #21564 — GitHub Copilot plugin ignores user-configured model limit overrides

📅 `2026-04-08` | ✏️ **giorgosdi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21564](https://github.com/anomalyco/opencode/issues/21564)


## Problem

User-configured `limit` overrides for GitHub Copilot models are silently discarded. The Copilot plugin always overwrites `limit.context`, `limit.input`, and `limit.output` with API-reported values, even when the user explicitly sets them in `opencode.json`.

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

In `packages/opencode/src/plugin/github-copilot/models.

> *[Truncado — 3081 chars totais]*

---

## #21560 — Donations?

📅 `2026-04-08` | ✏️ **skhaz** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21560](https://github.com/anomalyco/opencode/issues/21560)


### Question

This is a project I use every day. Besides being a Zen subscriber, I would like to set up a monthly donation.

---

## #21511 — Web Server - open projects from subfolders

📅 `2026-04-08` | ✏️ **Wojciech-git** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21511](https://github.com/anomalyco/opencode/issues/21511)


### Question

I'm on version 1.4.0.
I have a structured workspace with a project tree - there are nested project folders. Currently when I want to open a new project in the web interface, I see that only root folders are treated as project folders - there is no possibility to open subfolders as a separate project. Is it a feature or a oversight? Is it possible to open subfolders as a project? Thanks in advance for explanations.

---

## #21509 — opencode always  atempt to install oh-my-opencode  when   oh-my-opencode installed with command

📅 `2026-04-08` | ✏️ **leiyang0426** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21509](https://github.com/anomalyco/opencode/issues/21509)


### Question
1. i install oh-my-opencode with command
2. start opencode with cmd
3. opencode start so slow
4. opencode started but oh-my-opencode is not work
<img width="2004" height="840" alt="Image" src="https://github.com/user-attachments/assets/ebc5f91b-3367-4507-8f44-89feddd1edad" />

---

## #21458 — Subagent sessions cannot be prompted. Back to main session.

📅 `2026-04-08` | ✏️ **FQXCS** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/21458](https://github.com/anomalyco/opencode/issues/21458)


### Question

Why was the Windows version of the sub-agent changed to "Subagent sessions cannot be prompted. Back to main session."?
I believe in some cases, the subagent should be guided.

<img width="1310" height="235" alt="Image" src="https://github.com/user-attachments/assets/65e9c38d-87a6-49be-b913-44482e8d8882" />

**OpenCode version**
1.4.0

---

## #21354 — read_file tool call not available with local model gemma4:e4b running with Ollama

📅 `2026-04-07` | ✏️ **bhargodevarya** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21354](https://github.com/anomalyco/opencode/issues/21354)


### Question

I am running opencode with locally running gemma4:e4b with Ollama. I tried to ask it to read a file and it was not able to. It gave the message I am attaching as an image to this. The read tool from openCode is not used since the model looks for read_file tool. When I switch to openAI's API call after giving my token, it starts to work. Is there a separate config needed for LLMs running on local with Ollama to resolve tools calls?

<img width="968" height="244" alt="Image" src="https://github.com/user-attachments/assets/39b4b6a6-19a2-4508-b3a6-adb9133c4234" />

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

目前 OpenCode 工具的護告訊息（如 "You must read file..."）和錯誤輰出都使用目同的紅色文字喊現。

用戶看到紅字會直覺認為是系統錯誤或當機，增加不必覆的緊張。

## 建議

|類型|建議顏色|
|------|----------|
|護告（Warning）|🟡 黃色|
|錯誤（Error）|🟠 紅色|

## 登当

*Feedback from user via OpenCode session*

---
