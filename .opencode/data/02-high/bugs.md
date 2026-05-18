# 🐛 Bugs Prioritários

> **Total:** 584 | Extraído em 2026-05-18

---

## #28065 — Edit Permissions: Instance Ref bug

📅 `2026-05-17` | ✏️ **lennartOngage** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/28065](https://github.com/anomalyco/opencode/issues/28065)


### Description

The edit permissions seem to be broken:

← Edit agents/swe.md 
InstanceRef not provided

This happens when i have strict edit permissions, this is new since 1.15.

### Plugins

_No response_

### OpenCode version

1.15.x

### Steps to reproduce

1. Put as permissions in an agent:
permission:
  edit:
    "*": deny
    "workspace/tickets/**": allow
    "**/docs/**": allow
    "**/*.md": allow
    "**/*.yaml": allow
    "**/*.yml": allow
    ".env": deny
    ".env.*": deny
    "**/.env": deny
    "**/.env.*": deny
    "**/secrets/**": deny
    "docs/charter.md": deny
    "**/docs/charter.md": deny
2. Tell the agent to edit a file it should be able to edit

### Screenshot and/or share link

_No response_

### Operating System

debian

### Terminal

ghostty

---

## #28062 — LLM failed to generate agent:

📅 `2026-05-17` | ✏️ **omarfrinjary** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28062](https://github.com/anomalyco/opencode/issues/28062)


### Description

I wrote "opencode agent create"
so after it requested to me to type the description I typed it then it printed that "LLM failed to generate agent:"
And this error it happened to me in 1.15.2 but with "InstanceRef not provided" so I reported the bug but it closed as duplicate and even though it didn't been solved in the last version.

### Plugins

None

### OpenCode version

1.15.4

### Steps to reproduce

1. Write opencode agent create
2. Chose global agent "This is what I did exactly"
3. Write any description
4. See the error.

### Screenshot and/or share link

<img width="1286" height="405" alt="Image" src="https://github.com/user-attachments/assets/87b8e4ee-21be-4d4b-a159-2446fc77dcef" />

### Operating System

Ubuntu 24.04

### Terminal

gnome terminal

---

## #28038 — fix(session): Windows session directory filters treat slash-equivalent paths as different

📅 `2026-05-17` | ✏️ **jacky-2014-sn** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28038](https://github.com/anomalyco/opencode/issues/28038)


### Description
On Windows, session filtering can treat slash-equivalent directory paths as different locations. A session stored under a path like `C:\repo\packages\opencode` can be missed when the request or cursor uses `C:/repo/packages/opencode`.

This affects both normal session list filtering and v2 cursor validation. It also shows up for legacy session rows that do not have a `path` value and still fall back to directory matching.

### Plugins
None

### OpenCode version
1.15.3

### Steps to reproduce
1. On Windows, create sessions from nested directories inside the same git repo.
2. List sessions or continue pagination using a slash-normalized directory path.
3. Observe that matching sessions may be omitted, or v2 cursor requests may be rejected because the directory string does not match exactly.

### Screenshot and/or share link
N/A

### Operating System
Windows 11

### Terminal
PowerShell

---

## #28037 — Plugin permission replies via SDK client are silently dropped on v1.14.51+ (Server.Default and TCP listener use different memoMaps)

📅 `2026-05-17` | ✏️ **va3093** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28037](https://github.com/anomalyco/opencode/issues/28037)


## Description

Plugin replies to permission requests are silently dropped on v1.14.51+. The plugin sees its `client.postSessionIdPermissionsPermissionId(...)` call return `200 true`, but the `Permission.Service.reply` it lands on is a *different in-process instance* than the one holding the pending permission. The pending Deferred never resolves, the bus event `permission.replied` is never published, and the user sees the permission prompt forever in the web UI / TUI.

Effectively: **any plugin that subscribes to `permission.asked` and tries to reply via the SDK client is broken on v1.14.51+.** Pre-1.14.51 this worked because the Hono backend was a single shared in-process app instance.

## Root cause: `Server.Default()` and the TCP listener use independent memoMaps

The TCP listener built by `Server.listen(...)` and the in-process `Server.Default()` consumed by `createOpencodeClient({ fetch: (...args) => Server.Default().app.fetch(...args) })` use **two separate Effect `Layer` memoMaps**, so they hold independent copies of every singleton service — including `Permission.Service` and its `InstanceState`-backed `pending` map.

In `packages/opencode/src/server/server.ts`:

```ts
// startListener — fresh memoMap per listener
return Layer.buildWithMemoMap(listenerLayer(opts, port), Layer.makeMemoMapUnsafe(), scope).pipe(...)
```

In `packages/opencode/src/server/routes/instance/httpapi/server.ts`:

```ts
import { memoMap } from "@opencode-ai/core/effect/memo-map"
// ...
export c

> *[Truncado — 6856 chars totais]*

---

## #28031 — Spinner Color Changes based on selected Agent not current run agent

📅 `2026-05-17` | ✏️ **OpeOginni** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28031](https://github.com/anomalyco/opencode/issues/28031)


### Description

When using the TUI and running a prompt, the spinner takes the color of that agent, it gets confusing when you run the Build agent but select the Plan agent and see the spinner take the color of the plan agent. 

### Plugins

None

### OpenCode version

1.15.3

### Steps to reproduce

1. Run a prompt using the build agent
2. Change agents to plan
3. Notice the color of the spinner changes to plan, even when its build that is currently running.

### Screenshot and/or share link

https://github.com/user-attachments/assets/9982020e-e9e0-4eda-a1fb-2d7c4dbdc558

### Operating System

macOS

### Terminal

Ghostty

---

## #28028 — fix: Context7 MCP server fails with "Invalid API key" due to outdated endpoint

📅 `2026-05-17` | ✏️ **nickdesi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/28028](https://github.com/anomalyco/opencode/issues/28028)


## Problem

The Context7 MCP server uses `https://api.context7.com/` which no longer resolves (NXDOMAIN). The API has migrated to `https://context7.com/api/v2/`.

Both `context7_resolve-library-id` and `context7_query-docs` fail with a misleading "Invalid API key" error, even though the key is valid.

## Steps to Reproduce

1. Set a valid Context7 API key: `export CONTEXT7_API_KEY="ctx7sk-..."`
2. Start opencode in any project
3. Use `context7_resolve-library-id` or `context7_query-docs`
4. Observe the "Invalid API key" error

## Expected Behavior

Context7 tools should successfully resolve library IDs and query documentation.

## Root Cause

The API endpoints have changed:
- `https://api.context7.com/v1/library/search` → `https://context7.com/api/v2/libs/search`
- `https://api.context7.com/v1/context` → `https://context7.com/api/v2/context`

## Environment

- **opencode**: Latest (May 2026)
- **OS**: macOS (darwin)
- **Context7 MCP**: `@upstash/context7-mcp` (via npx)

## Suggested Fix

1. Update the MCP server base URL to `https://context7.com/api/v2/`
2. If the server is fetched via npx, pin to the latest `@upstash/context7-mcp` version
3. Improve error handling to distinguish DNS/network errors from invalid keys

---

## #28015 — Worker has been terminated when running multiple subagents — session switching broken

📅 `2026-05-17` | ✏️ **qwowboyp** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/28015](https://github.com/anomalyco/opencode/issues/28015)


### Description

When running multiple subagents in parallel or opening multiple opencode instances at the same time, the TUI shows "Worker has been terminated" and kicks me back to the home screen.

After that:
- Cannot switch back to any existing session
- Creating a new session shows: `Creating a session failed. Open console for more details.`
- Have to completely quit and restart opencode to recover

### Plugins

@tarquinen/opencode-dcp@3.1.12,oh-my-openagent@4.1.2

### OpenCode version

1.15.3

### Steps to reproduce

1. https://github.com/user-attachments/assets/0a6a38e8-bb00-4c14-8334-1425b80c0644
2.  [2026-05-17T102834.log](https://github.com/user-attachments/files/27898563/2026-05-17T102834.log)

### Screenshot and/or share link

https://opncd.ai/share/FyQcQFHJ

### Operating System

Windows 11

### Terminal

Tideterm

---

## #28011 — Edit tool frequently gets `[Tool execution was interrupted]` on consecutive calls after v1.15.x update

📅 `2026-05-17` | ✏️ **MAHXVFX** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/28011](https://github.com/anomalyco/opencode/issues/28011)


### Description

## Bug Description
After updating to v1.15.3, the `edit` tool consistently fails with `[Tool execution was interrupted]` when making consecutive edits to the same file. This was never an issue in v1.14.x.
## Steps to Reproduce
1. Open opencode in any project directory
2. Call the `edit` tool on a file (e.g., `thumbnail_widget.py`)
3. Immediately call `edit` again on the **same file** (even with different `oldString`/`newString`)
4. The second (and subsequent) `edit` calls are interrupted
**Expected:** All `edit` calls succeed sequentially
**Actual:** Second+ `edit` calls fail with `[Tool execution was interrupted]`
## Workaround
Using `bash` (PowerShell) to perform the same file edits works 100% reliably with no interruptions. This confirms the issue is specific to the `edit` tool, not the filesystem.
## Additional Context
- The issue is **not** file-lock related
- The issue is **not** content-related (simple string replacements like `#1e1e1e` → `#1F1F24` also fail)
- Single `edit` calls work fine; only **consecutive** calls to the same file fail
- This appears related to the Effect-based core event system introduced in v1.15.0
- May be related to [#21326](https://github.com/anomalyco/opencode/issues/21326) (interrupted tool calls corrupting session history)
## Possible Root Cause
v1.15.0 introduced an Effect-based core event system for more complete event delivery across sessions. This may have changed how the `edit` tool handles file locks or concurrent acc

> *[Truncado — 1947 chars totais]*

---

## #27996 — project load failed when use "Open project" from the UI after "opencode web" command.

📅 `2026-05-17` | ✏️ **shifttttttt** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27996](https://github.com/anomalyco/opencode/issues/27996)


### Description

In the UI  generated by "opencode web" command, the project  sessions was unreachable when open a project already exit by "Open project" button with project dir.

### Plugins

omo

### OpenCode version

1.14.25

### Steps to reproduce

1. On Windows, run `opencode` in a project directory and create some sessions via CLI
2. Start `opencode web`
3. Click the "+" (Open Project) button and manually type the same project path
4. Observe no historical sessions shown
5. Click the project from the sidebar recent projects list → sessions appear correctly

### Screenshot and/or share link

_No response_

### Operating System

windows

### Terminal

window terminal

---

## #27992 — [bug] Copy message button does not work on web interface

📅 `2026-05-17` | ✏️ **SpiritChen51** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27992](https://github.com/anomalyco/opencode/issues/27992)


### Description

On the web interface, clicking the "Copy" button on a message does not copy the content to the clipboard. This happens because `navigator.clipboard.writeText()` can fail in non-secure contexts (non-HTTPS) or when the clipboard API is blocked by browser permissions.

### Steps to reproduce

1. Open the OpenCode web interface
2. Click the copy button on any message
3. The button does not copy the content and no feedback is shown

### Fix

Added a fallback using the traditional `document.execCommand("copy")` method via a temporary textarea element, which works even when the Clipboard API is unavailable. Also added a check to only update the "copied" state if the copy actually succeeded.

### Operating System

All platforms
### Terminal/Environment

Web browser

---

## #27988 — Agent scanning from .opencode/agents/ silently drops files — only ~119 of 184 register

📅 `2026-05-17` | ✏️ **Moe1211** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27988](https://github.com/anomalyco/opencode/issues/27988)


## Description

When 184 agent `.md` files are placed in `~/.config/opencode/.opencode/agents/`, only ~119 appear in `opencode agent list`. The remaining ~65 are silently dropped — they are never registered and cannot be invoked as subagents.

The dropped agents consistently cluster at the **alphabetical tail** (from `seo-specialist` through `zk-steward`), suggesting a scanning buffer limit or premature termination during file discovery.

## Steps to reproduce

1. Place 184 agent `.md` files into `~/.config/opencode/.opencode/agents/` (184 is approximate — any number above ~120 triggers this)
2. Run `opencode agent list`
3. Count the registered agents
4. Compare with `ls ~/.config/opencode/.opencode/agents/ | wc -l`

## Diagnostic evidence

```
=== Files on disk ===
     184

=== Registered in runtime ===
     119

=== First 10 missing ===
seo-specialist
short-video-editing-coach
social-media-strategist
software-architect
solidity-smart-contract-engineer
sprint-prioritizer
sre-site-reliability-engineer
studio-operations
studio-producer
study-abroad-advisor
...
zk-steward
```

Total missing: **65 agents** (all from the alphabetical tail).

## Agent file format

Each file has valid YAML frontmatter. Example from a file that **fails to register**:

```yaml
---
name: UI Designer
description: Expert UI designer specializing in visual design systems, component libraries, and pixel-perfect interface creation.
mode: subagent
color: #9B59B6
---
```

Files that _do_ register have ident

> *[Truncado — 2140 chars totais]*

---

## #27964 — Error:  API request failed: 402 Client Error: Payment Required for url: https://opencode.ai/zen/go/v1/chat/completions

📅 `2026-05-17` | ✏️ **ghostgunnat** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27964](https://github.com/anomalyco/opencode/issues/27964)


### Description

I have seen that other people had the same issue few days ago but now i am having it, still 15 days on my suscription, 50% month used and weekly still 70% left to go.

The error happens regardless of the model, kimi, mimo, qwen, it happens with all of them.

Error:  API request failed: 402 Client Error: Payment Required for url: https://opencode.ai/zen/go/v1/chat/completions
Error:  Failed to process article: 402 Client Error: Payment Required for url: https://opencode.ai/zen/go/v1/chat/completions

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #27947 — Vultr Serverless Inference: Outdated model names and missing model management UI

📅 `2026-05-16` | ✏️ **DanielQura** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27947](https://github.com/anomalyco/opencode/issues/27947)


### Description

The application lists outdated Vultr models that do not align with the current official Vultr Serverless Inference documentation. Additionally, the UI lacks functionality to manually add, remove, or edit model names to override the hardcoded list.

Identified discrepancies between UI and Vultr documentation:

UI: MiniMax M2.5 | Docs: MiniMax-M2.7

UI: Kimi K2 Instruct | Docs: Kimi-K2.6

UI: DeepSeek V3.2 | Docs: DeepSeek-V3.2-NVFP4

UI: GLM 5 FP8 | Docs: GLM-5.1-FP8

Missing from UI entirely: Llama-3.1-Nemotron-Safety-Guard-8B-v3, Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16, Nemotron-Cascade-2-30B-A3B

### Plugins

cli and desktop app 

### OpenCode version

OpenCode Desktop v1.15.3

### Steps to reproduce

1. Navigate to the Vultr provider model configuration settings.
2. Review the list of available models presented as toggle switches.
3. Compare the available models against the official Vultr Serverless Inference supported chat completion models.
4. Search for a UI element to add custom models or remove obsolete ones. Observe its absence.

### Screenshot and/or share link

<img width="401" height="268" alt="Image" src="https://github.com/user-attachments/assets/3a1650cf-319e-4bf0-88fb-a198edc87663" />

<img width="750" height="359" alt="Image" src="https://github.com/user-attachments/assets/b18d0abf-1642-4099-8ba8-0783ec6dc4b4" />

### Operating System

Windows 11 Home - 25H2 - 26200.8457

### Terminal

Terminal and Powershell

---

## #27946 — [MaxDepth] placeholders leak into tool schemas — causes API 400 errors

📅 `2026-05-16` | ✏️ **ANTONDrakon** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/27946](https://github.com/anomalyco/opencode/issues/27946)


### Description

# [MaxDepth] placeholders leak into tool schemas — causes API 400 errors
## Description
OpenCode sends tool definitions with `[MaxDepth]` placeholder strings in JSON Schema fields (instead of resolved JSON objects/arrays). This violates the JSON Schema spec and causes downstream API proxies (OmniRoad, OpenRouter, etc.) to reject requests with HTTP 400.
## Affected tools
- `question` → `"items": "[MaxDepth]"`
- `todowrite` → `"todos": "[MaxDepth]"` + `"items": "[MaxDepth]"`
- `webfetch` → `"anyOf": "[MaxDepth]"`
## Impact
1. Model interprets `[MaxDepth]` as a literal value in `tool_use.input`
2. This gets stored in conversation history (`messages[]`)
3. Next API request includes invalid `tool_use.input` data
4. Strict API proxies validate `tool_use.input` against `input_schema` and return 400
5. ALL subsequent requests in that session fail — full session is dead
## Secondary issue
`"eager_input_streaming": true` is placed on tool definition level (outside `input_schema`), which is not a standard Anthropic Messages API field. Some proxies reject unknown fields.
## Reproduction
1. Configure OpenCode to use a non-Anthropic API proxy (e.g. OmniRoad) with `baseURL`
2. Start a conversation
3. Ask a task that requires tool use (e.g. "создай телеграм бота")
4. Model uses `todowrite` → `[MaxDepth]` enters `messages[]`
5. Next message → API returns 400 "Improperly formed request"
## Request payload excerpt
```json
{
  "tools": [
    {
      "name": "todowrite",
      "i

> *[Truncado — 4715 chars totais]*

---

## #27928 — Duplicate messages on attached session

📅 `2026-05-16` | ✏️ **jonatandorozco** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27928](https://github.com/anomalyco/opencode/issues/27928)


### Description

I'm trying to use opencode from a windows machine into a mac laptop. I have the project on the windows machine so I ran the opencode server there and connected from the mac laptop. 

When I start prompting I get this duplicate messaging that you can see on the video

### Plugins

_No response_

### OpenCode version

1.15.3 [server] 1.15.0 [client] 

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

ghostty [client] terminal [server]

---

## #27922 — bug(tui): ESC cannot cancel session when permission dialog is open (infinite dialog loop)

📅 `2026-05-16` | ✏️ **ranxianglei** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27922](https://github.com/anomalyco/opencode/issues/27922)


## Bug Description

When a permission dialog (or any dialog) is open in the TUI, pressing ESC only dismisses the dialog but **cannot cancel the running session**. This creates an infinite dialog loop:

1. Model calls a tool (e.g., file write) → permission dialog opens
2. User presses ESC → dialog's own handler dismisses it
3. Tool returns error → model retries → new permission dialog opens
4. User is trapped — the `session_interrupt` keybind (double ESC within 5s) can never fire

## Steps to Reproduce

1. Start a session and send a request that triggers multiple tool calls requiring permission
2. When the permission dialog appears, press ESC to reject
3. Model retries the tool → another permission dialog appears
4. Pressing ESC repeatedly only dismisses one dialog at a time; model keeps retrying
5. Double-ESC (session interrupt) does NOT work because `dialog.stack.length > 0` blocks all keybinds

## Root Cause

In `component/prompt/index.tsx`:

1. The `session.interrupt` binding is gated by `command.matcher` which returns `false` when `dialog.stack.length > 0` (via `command-palette.tsx` line 94). This blocks the interrupt binding entirely when any dialog is open.

2. The interrupt handler checks `if (!input.focused) return`. When a dialog opens, the input is deliberately blurred, so even if the binding fired, the handler would exit immediately.

## Expected Behavior

Double-ESC should always be able to cancel/interrupt the running session, regardless of whether a dialog is op

> *[Truncado — 1576 chars totais]*

---

## #27911 — Session archive, delete, rename, and question reply block on API response

📅 `2026-05-16` | ✏️ **BYK** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27911](https://github.com/anomalyco/opencode/issues/27911)


### Describe the bug

Session management operations (archive, delete, rename) and question replies await the API response before updating the UI, causing perceived latency:

- **Archive/Delete**: waits for the server response before removing the session from the sidebar and navigating away
- **Rename**: waits for the server response before updating the title in the sidebar
- **Question reply/reject**: uses `mutateAsync` and awaits, even though the dock is already dismissed by `onMutate`

### Steps to reproduce

1. Open the web UI on a slow connection
2. Archive or delete a session
3. Observe the delay before the session disappears from the sidebar

### Expected behavior

All operations should update the UI optimistically (immediately) and rollback on API error.

### System info

- OpenCode version: v1.15.3
- OS: Linux

---

## #27910 — Session switch causes ~170ms blank flash and Suspense splash screen

📅 `2026-05-16` | ✏️ **BYK** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27910](https://github.com/anomalyco/opencode/issues/27910)


### Describe the bug

Session switching has three compounding responsiveness issues:

1. **deferRender mechanism** blanks the review panel and composer for one animation frame on every session switch, and a 140ms `setTimeout` in `session-composer-region` stacks on top, causing a ~170ms gap where the composer is invisible.
2. **sessionSync createResource JSX read** — `{sessionSync() ?? ""}` is read in JSX, triggering the app-level `<Suspense>` boundary (splash screen) on every session switch while the sync Promise is pending. The resource returns void and contributes nothing to the DOM.
3. **messagesReady gate** blocks rendering until messages have loaded from the API, even though the session exists in the session list and could be shown immediately with a loading spinner.

### Steps to reproduce

1. Open the web UI
2. Switch between sessions rapidly
3. Observe blank flashes, splash screen flickers, and delayed composer appearance

### Expected behavior

Session switching should be instant — show the session frame immediately with cached data and load messages in the background with a spinner.

### System info

- OpenCode version: v1.15.3
- OS: Linux

---

## #27907 — Bug: deleteMessage (and other assertNotBusy-guarded APIs) permanently fail when a question tool part is stuck in state.status=running

📅 `2026-05-16` | ✏️ **omercnet** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27907](https://github.com/anomalyco/opencode/issues/27907)


### Description

When the `question` tool ends up in a permanently `running` state (state.output never written, state.time.end never set, no follow-up assistant message), the session is marked busy forever. After that, **every HTTP API call gated by `SessionRunState.assertNotBusy()` fails — including `deleteMessage`** — so the user has no way to delete the offending message, abort the run, or otherwise escape the session via the documented HTTP API.

Concrete error returned by the server (paste from our log):

```
ERROR ... service=server error=Session ses_1d00d41caffe3C6jQ0xci17Keg is busy
  at SessionRunState.assertNotBusy
  at SessionRunState.assertNotBusy (definition)
  at SessionHttpApi.deleteMessage
  at SessionHttpApi.deleteMessage (definition)
```

The HTTP method `deleteMessage` checks `assertNotBusy` and throws, but the only thing keeping the session busy is a tool part that will never complete on its own. The session becomes a dead-end. The user's only recovery path today is to manually delete the session row or the stuck `part` row out of `~/.local/share/opencode/opencode.db`.

This is essentially the same class of problem as the now-closed [#14014](https://github.com/anomalyco/opencode/issues/14014) ("Revert fails when session is busy/generating"), but instead of `revert` the affected API is `deleteMessage`, and the trigger isn't an in-flight model generation — it's a `question`-tool part that has been abandoned mid-flight by a prior failure path.

### How we got

> *[Truncado — 5101 chars totais]*

---

## #27905 — Regression: OpenAI ChatGPT Plus/Pro OAuth methods missing from `auth login` menu since 1.14.49 (1.14.48 works, 1.14.50+ broken)

📅 `2026-05-16` | ✏️ **willowite** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27905](https://github.com/anomalyco/opencode/issues/27905)


## Summary

`opencode auth login` for the OpenAI provider no longer offers the OAuth methods (`ChatGPT Pro/Plus (browser)` and `ChatGPT Pro/Pro (headless)`) — only `Manually enter API Key` is reachable, and because `auth.methods.length === 1` at runtime the submenu is skipped entirely and users are immediately dropped into the API-key prompt.

The OAuth code itself is still present in the binary (`https://auth.openai.com`, client_id `app_EMoamEEZ73f0CkXaXp7hrann`, both `(browser)` and `(headless)` method definitions are intact in the bundled JS), so this looks like a hooks/methods-aggregation regression rather than removal.

## Reproducer

```sh
opencode auth login --pure -p openai
```

`--pure` ensures no third-party plugins are involved.

**Expected (1.14.48 and earlier):**
```
T  Add credential
|
*  Login method
|  > ChatGPT Pro/Plus (browser)
|    ChatGPT Pro/Plus (headless)
|    Manually enter API Key
```

**Actual (1.14.50+):**
```
T  Add credential
|
*  Enter your API key
|  _
```

Also confirmable with `-m __probe__`:

- **1.14.48** → `Error: Unknown method "__probe__" for openai. Available: ChatGPT Pro/Plus (browser), ChatGPT Pro/Plus (headless), Manually enter API Key`
- **1.15.0** → silently drops into `Enter your API key` (the `-m` arg is effectively ignored because only 1 method is in the array)

## Bisect

Tested on Windows 11 (scoop installs of each version), `--pure` flag, identical config:

| Version | OpenAI auth menu |
|---|---|
| 1.14.48 | ✅ 3 methods (bro

> *[Truncado — 3948 chars totais]*

---

## #27902 — fix: kimi-for-coding provider gets 429 engine overloaded due to missing User-Agent header

📅 `2026-05-16` | ✏️ **bzqzheng** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27902](https://github.com/anomalyco/opencode/issues/27902)


### Description

The built-in `kimi-for-coding` provider uses `@ai-sdk/anthropic`, which sends `Anthropic/JS x.x.x` as the `User-Agent` on every request. Kimi's `/coding` gateway intermittently returns HTTP 429 `engine overloaded` for requests from non-whitelisted agents — even with a valid paid API key and available quota.

Setting `User-Agent: KimiCLI/1.5` (a whitelisted coding agent UA) significantly reduces these 429s in practice. The same fix is documented for other clients using the Anthropic SDK against Kimi's endpoint.

### Plugins

none (built-in provider)

### OpenCode version

1.15.3

### Steps to reproduce

1. Set up the built-in `kimi-for-coding` provider with a valid `KIMI_API_KEY`
2. Send messages using a `kimi-for-coding` model (k2p6, k2p5, kimi-k2-thinking)
3. Observe intermittent 429 `{"error":{"type":"rate_limit_error","message":"The engine is currently overloaded, please try again later"}}`

The 429s are intermittent but noticeably reduced after overriding the `User-Agent` to `KimiCLI/1.5`.

### Operating System

macOS 26.0

---

## #27896 — Background subagent task_status returns 'cancelled' but session data still accessible via task(task_id=) resume

📅 `2026-05-16` | ✏️ **smithyyang** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27896](https://github.com/anomalyco/opencode/issues/27896)


## Bug Description

When using `task(background=true)` to launch a background subagent, the task completes successfully and results are visible in the UI. However, when the parent agent polls for results using `task_status(task_id="...", wait=true)`, it returns `state: cancelled` with empty error.

The session data is **not lost** — using `task(task_id="...", prompt="...")` to resume the session retrieves the full completed results.

## Steps to Reproduce

1. Set `OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true`
2. Launch background subagent: `task(background=true, ...)`
3. The subagent completes its work (results visible in parent session context)
4. Parent agent calls `task_status(task_id="...", wait=true)` to get results
5. `state: cancelled` is returned, no result data

## Expected Behavior

`task_status(wait=true)` should return `state: completed` with the full task result data, matching what is visible in the session UI.

## Workaround

Instead of using `task_status`, use `task(task_id="<same_id>", prompt="return your previous result")` to resume the session and retrieve results. But this is clunky — the parent agent shouldn't need to know the prompt again.

## Environment

- OpenCode version: latest
- Feature flag: `OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true`
- Plugin: `@tarquinen/opencode-dcp@latest` (DCP)

---

*Re-submitted from #27827 — the original issue was closed due to triage bot not assigning labels/staff.*

---

## #27894 — LSP causes desktop app to freeze/hang on file read (regression in 1.15.x)

📅 `2026-05-16` | ✏️ **papau5164** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27894](https://github.com/anomalyco/opencode/issues/27894)


# Bug Report: LSP causes OpenCode desktop app to freeze/hang on file read

## Summary
When LSP is enabled, the OpenCode desktop app (Windows) freezes completely whenever the app internally reads a file (e.g., via built-in file read tool). The freeze is immediate and total — the app becomes unresponsive and must be force-killed.

## Environment
- **OpenCode version**: 1.15.3 (npm package) / exe version 1.3.13
- **Platform**: Windows
- **Node.js**: v24.14.0
- **npm**: 11.14.1
- **Installation**: `npm install -g opencode-ai`

## LSP Servers Tested
All 6 configured LSP servers were individually tested and confirmed working:

| LSP Server | Type | Result |
|---|---|---|
| marksman (Markdown) | Standalone binary (WinGet) | Individual process OK |
| docker-langserver (Dockerfile) | npm global | Individual process OK |
| vscode-json-languageserver (JSON) | npm global | Individual process OK |
| css-languageserver (CSS/SCSS/Less) | npm global | Individual process OK |
| html-languageserver (HTML) | npm global | Individual process OK |
| basedpyright (Python) | pip | Individual process OK |

All LSP server binaries execute correctly when tested independently (< 300ms response time). The issue is NOT in any specific LSP server.

## Root Cause
The freeze occurs in **OpenCode's built-in LSP client implementation**, not in the LSP servers themselves. Evidence:

1. **Not npm/environment related**: 
   - `npm_config_user_agent` environment variable contamination (`npm/undefined`) was suspect

> *[Truncado — 3447 chars totais]*

---

## #27884 — Model stuck on context full

📅 `2026-05-16` | ✏️ **Classic298** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27884](https://github.com/anomalyco/opencode/issues/27884)


### Description

OpenCode does not gracefully handle when the model context is full. Instead, the current message remains in loading state forever and never finishes and it isn't obvious that the context limit is full because no error is being surfaced.

opencode version: Any. Literally this bug existed for months and still does
Windows
Steps to reproduce: Point custom provider at litellm with for example gpt models and just have a very long session. That session will eventually get suck on a forever loading state with no error or indication that the context is full and needs compaction

---

## #27882 — Project profile image not displayed after upload

📅 `2026-05-16` | ✏️ **moagee** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27882](https://github.com/anomalyco/opencode/issues/27882)


### Description

In the OpenCode Desktop App, when trying to set a profile image for a project, the image is accepted (no error) but not displayed after saving.

**Expected behavior:**
The uploaded image should be displayed as the project's profile picture.

**Actual behavior:**
No image is shown after saving. The file seems to be accepted without error, but the UI still shows the default placeholder.

**Additional context:**
- Image was manually resized to 128×128 (PNG and JPG)
- Restarting the app did not fix it
- Clearing `~/.config/ai.opencode.desktop/Cache` did not help
- Original image dimensions were 290×290

### Plugins

_No response_

### OpenCode version

v1.15.3

### Steps to reproduce

1. Open OpenCode Desktop App
2. Go to project settings
3. Click on profile image area
4. Select a 128×128 PNG image (also tried JPG)
5. Click save
6. The image does not appear — placeholder remains

### Screenshot and/or share link

_No response_

### Operating System

Linux (Fedora KDE Plasma)

### Terminal

Konsole

---

## #27879 — TUI silently drops `permission.asked` events during project-lookup race → tool hangs forever → OOM

📅 `2026-05-16` | ✏️ **aschina** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27879](https://github.com/anomalyco/opencode/issues/27879)


### Description

The TUI's event subscription filter at `packages/opencode/src/cli/cmd/tui/context/event.ts:19` silently drops every server event whose `event.project` does not match `project.project()`. The TUI's `project.project()` is loaded asynchronously via `sdk.client.project.current(...)` and is `undefined` until that REST call resolves. The SSE stream (`sdk.tsx:74-124 startSSE`) is started in parallel from the same `onMount`, so events published by the server during the cold-start window race the project lookup and **are silently dropped**.

The most painful instance of this is `permission.asked` for `external_directory`. If the user's first prompt asks the model to read a file outside the worktree (very common: looking at sibling repos, or asking the agent to inspect a config under `~`), the read tool calls `assertExternalDirectoryEffect` → `ctx.ask({ permission: "external_directory", ... })` → `permission.ask` (`permission/index.ts:161-195`). The server publishes `Event.Asked` and then awaits an in-memory `Deferred<void, RejectedError | CorrectedError>` **with no timeout**. If the TUI dropped the asked event, the deferred is never resolved → the read tool hangs forever → and (independent bug) memory keeps growing because the AI SDK's `result.fullStream.tee()` buffer keeps reading model SSE chunks while opencode's consumer fiber is parked → the agent OOMs.

Symptom from the user's perspective: "I asked the model to read a file, the TUI just sits there with the tool c

> *[Truncado — 8319 chars totais]*

---

## #27871 — Empty bash tool arguments {} can still be submitted and interrupt the session

📅 `2026-05-16` | ✏️ **eatFirewood** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/27871](https://github.com/anomalyco/opencode/issues/27871)


### Description

A `bash` tool call with completely empty arguments (`{}`) was submitted from an OpenCode session and caused the tool execution to be interrupted. This looks related to the previously reported empty-input / aborted-tool family of bugs, but it is still observable on OpenCode `1.15.2` and with `openai/gpt-5.5`.

The problematic tool call shape was:

```json
{
  "recipient_name": "functions.bash",
  "parameters": {}
}
```

For the `bash` tool this is invalid because required fields such as `command`, `workdir`, and `description` are absent. The runtime/tool layer should reject this before execution with a clear validation error and return control to the user, rather than allowing the session to enter an interrupted/stuck state.

### What happened

During a normal assistant session, the assistant attempted to run a parallel tool batch that included:

1. A valid `read` call for a JSON config file.
2. An invalid `bash` call whose parameters were `{}`.

The UI showed the `read` result, then the invalid `bash` tool reported:

```text
[Tool execution was interrupted]
```

From the user perspective, this made the current OpenCode session difficult to exit/recover from. The user explicitly reported that this kind of invalid empty-argument tool call has caused them to be unable to exit OpenCode cleanly in prior sessions as well.

### Concrete transcript evidence

The assistant later acknowledged the exact invalid tool call as:

```json
{"recipient_name":"functions.bash","

> *[Truncado — 5672 chars totais]*

---

## #27853 — # Bug: `${env:VAR}` substitution in provider apiKey and baseURL override from models catalog

📅 `2026-05-16` | ✏️ **Ish-oota** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27853](https://github.com/anomalyco/opencode/issues/27853)


### Description

## Bug Summary

Two related bugs prevent `opencode run` from working with OpenCode GO models.

### Bug 1: `${env:VAR}` substitution fails in provider `apiKey`

Using `${env:OPENCODE_API_KEY}` in `opencode.json` provider options does **not** resolve
to the environment variable value. The raw string is sent as the API key, causing
authentication failures.

### Bug 2: `baseURL` in `opencode.json` silently overrides the models catalog

If a user defines `baseURL` for `opencode-go` in `opencode.json`, it silently overrides
the correct URL from the models catalog with no warning.

The correct endpoint from the models catalog (`https://opencode.ai/zen/go/models-api.json`) is:
```json
"opencode-go": {
  "id": "opencode-go",
  "env": ["OPENCODE_API_KEY"],
  "npm": "@ai-sdk/openai-compatible",
  "api": "https://opencode.ai/zen/go/v1"
}
```

A common mistake is using `https://api.opencode.ai/v1` (OpenAI-compatible style),
which is incorrect and causes auth failures.

### Bug 3: `opencode run` returns `tokens=0` with OpenCode GO models

Even after resolving Bugs 1 and 2, `opencode run` produces no output with OpenCode GO models.

Debug log comparison:
| Provider | SDK Package | `message.part.delta` | Result |
|---|---|---|---|
| Google | `@ai-sdk/google` | ✅ Received | Works |
| OpenCode GO | `@ai-sdk/openai-compatible` | ❌ Empty | Fails |

Token result from `opencode run`:
```json
{
  "tokens": { "input": 0, "output": 0, "reasoning": 0 },
  "finish": "other"
}
```

**Ke

> *[Truncado — 4284 chars totais]*

---

## #27841 — Bug: WebFetch tool rewrites GitHub URLs to nicholasbrailo user, causing 404 errors

📅 `2026-05-16` | ✏️ **zisen123** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27841](https://github.com/anomalyco/opencode/issues/27841)


## Description

The WebFetch tool incorrectly rewrites GitHub repository URLs, replacing the original username in the path with a fixed username `nicholasbrailo`. This causes almost all GitHub repo page fetches to fail with `StatusCode: non 2xx status code (404 GET)`.

## Steps to Reproduce

1. Attempt to fetch any GitHub repository page via WebFetch, e.g.:
   - `https://github.com/chidiwilliams/buzz`
   - `https://github.com/niedev/RTranslator`
   - `https://github.com/ggerganov/whisper.cpp`
2. Observe the actual request URL and response

## Actual Behavior

The tool rewrites the URL and sends requests to:
- `https://github.com/nicholasbrailo/buzz` (should be `chidiwilliams/buzz`)
- `https://github.com/nicholasbrailo/RTranslator` (should be `niedev/RTranslator`)
- `https://github.com/nicholasbrailo/Whispering-Tiger` (should be `shabinder/Whispering-Tiger`)

All result in `StatusCode: non 2xx status code (404 GET ...)`.

Example error output:
```
StatusCode: non 2xx status code (404 GET https://github.com/nicholasbrailo/buzz)
StatusCode: non 2xx status code (404 GET https://github.com/nicholasbrailo/RTranslator)
StatusCode: non 2xx status code (404 GET https://github.com/nicholasbrailo/Whisper-WebUI)
```

## Expected Behavior

WebFetch should request the exact URL provided without rewriting any part of the path.

## Additional Context

- Not all GitHub URLs are affected -- some correctly go through (e.g., `https://github.com/anomalyco/opencode/issues` works fine), suggesting 

> *[Truncado — 2451 chars totais]*

---

## #27837 — Web UI: session list empty on left panel when using web server mode

📅 `2026-05-16` | ✏️ **RayDutchman** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27837](https://github.com/anomalyco/opencode/issues/27837)


### Description

When running `opencode --web`, the left panel session list is always empty in the web UI, even though `/api/session` returns sessions correctly.

## Root Cause (Analysis)
The frontend loads sessions via SSE event-driven logic. When `server.connected` is received, the code iterates `M.children` (registered workspaces) to trigger session loading. However `M.children` is empty at the time the event arrives, so no sessions are ever loaded.

## Related Bug
Sessions with `time_archived` stored as Unix millisecond integer cause `/api/session` to return `400 BadRequest` for the entire list. The API schema expects `DateTime.Utc`. Workaround: set `time_archived = NULL` in SQLite DB.

### Plugins

None

### OpenCode version

v1.15.0

### Steps to reproduce

1. Start opencode in web server mode: `opencode --web 0.0.0.0:4096`
2. Open browser, navigate to the web UI
3. Left panel session list is empty
4. `/api/session` API returns sessions correctly
5. Search works and can find sessions
6. Reproduced in incognito mode, different browsers, different devices

### Screenshot and/or share link

<img width="1709" height="1260" alt="Image" src="https://github.com/user-attachments/assets/a03c54f2-d52e-4964-8e39-220f1170e6cf" />

### Operating System

Windows 11 running web server in WSL

### Terminal

Web server mode (`--web`)

---

## #27831 — Custom markdown-defined subagents show "should only be called manually" in Task tool despite having description in frontmatter

📅 `2026-05-16` | ✏️ **Aletheia-Prime** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27831](https://github.com/anomalyco/opencode/issues/27831)


### Description

Subagents defined via markdown files (.opencode/agents/*.md) have their frontmatter.description ignored by the Task tool's agent list. The describeTask function in packages/opencode/src/tool/registry.ts falls through to "This subagent should only be called manually by the user." for agents without a description property, even when the field is present in the YAML frontmatter.
Agents defined via JSON config (opencode.json) work correctly — their description appears in the Task tool. Only markdown-defined agents are affected.

### Plugins

@opencode-ai/plugin

### OpenCode version

1.15.1

### Steps to reproduce

1. 
Create .opencode/agents/test.md:
--
description: "Test agent — does X and Y"
mode: subagent
permission:
  read: allow
--
You are a test agent.
2. 
Start a session and inspect the Task tool parameter description. The agent will appear as:
- test: This subagent should only be called manually by the user.
3. 
Expected:
- test: Test agent — does X and Y
Root Cause Analysis
The propagation chain is:
1. 
config/agent.ts:load() — calls ConfigMarkdown.parse() (gray-matter) which correctly extracts frontmatter.description into md.data.description. This is packed into { name, ...md.data, prompt } and validated through AgentSchema (which has description: optional(String)).
2. 
config/config.ts — merges markdown agents into cfg.agent via mergeDeep.
3. 
agent/agent.ts — iterates cfg.agent and sets:
item.description = value.description ?? item.description
For no

> *[Truncado — 3412 chars totais]*

---

## #27823 — GitHub Copilot provider: "fetch() URL is invalid" on login

📅 `2026-05-16` | ✏️ **zw22x** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27823](https://github.com/anomalyco/opencode/issues/27823)


### Description

**Version:** 1.15.0
**OS:** macOS
**Install method:** Homebrew

## Bug

Running `opencode providers login github-copilot` fails immediately with:

```
Error: Failed to load auth provider metadata from github-copilot: fetch() URL is invalid
```

This happens on a clean install. Reinstalling does not fix it.

## Steps to reproduce

1. Fresh install of OpenCode 1.15.0 on macOS
2. Run `opencode providers login github-copilot`
3. Error appears immediately before any auth flow begins

## Expected behavior

Auth flow should open and allow GitHub Copilot login.

## Additional context

When attempting to run a prompt anyway, the session hangs for ~47 seconds then stops with no further output:

```
INFO  service=bus type=session.updated publishing
INFO  +47274ms service=snapshot count=1 removing gitignored files from snapshot
```

No further logs after that point.

### Plugins

_No response_

### OpenCode version

1.15.0

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #27818 — "terminated command after exceeding timeout" message does not work on all programs

📅 `2026-05-16` | ✏️ **divinity76** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27818](https://github.com/anomalyco/opencode/issues/27818)


### Description

When a command timeouts and gets terminated, we're supposed to get a indicator in the form of
```
<shell_metadata>
shell tool terminated command after exceeding timeout 120000 ms. If this command is expected to take longer and is not waiting for interactive input, retry with a larger timeout value in milliseconds.
</shell_metadata>
````
But that message does not always appear, presumably depending on the terminal output of the program that was terminated.

Interestingly, it seems to always appear in the `/share` log, but not in the terminal.



### Plugins

_No response_

### OpenCode version

1.15.0

### Steps to reproduce

printf '#!/bin/sh\nopencode' | sudo tee /usr/local/bin/ccc; sudo chmod a+x /usr/local/bin/ccc; opencode --prompt 'what is the local ccc command?'

Note: It only reproduce if the llm actually try to invoke the `ccc` command. With that query, there's a high likelyhood of GPT* models trying to invoke it with `ccc --help`

### Screenshot and/or share link

Screenshot showcasing the issue:
<img width="2880" height="1728" alt="Image" src="https://github.com/user-attachments/assets/858ba7af-2083-4689-a695-627435ebbbc9" />
/share log from the same session, showing that the issue is not present in the /share log:
https://opncd.ai/share/pUy2gPAj

### Operating System

Windows 11 > WSL > Ubuntu24.04

### Terminal

Reproduce on both "Windows 11 Terminal > wsl > /bin/bash" and "Wslg > xfce4-terminal > /bin/bash"

---

## #27796 — Title-agent temperature 0.5 overrides model-required temperature, causing 400s on Moonshot kimi-k2.*

📅 `2026-05-15` | ✏️ **Alezander9** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27796](https://github.com/anomalyco/opencode/issues/27796)


### Description

In `packages/opencode/src/session/llm.ts:172` the temperature is resolved as:

```ts
input.agent.temperature ?? ProviderTransform.temperature(input.model)
```

The built-in `title` agent hard-codes `temperature: 0.5` (`packages/opencode/src/agent/agent.ts:253`), so `??` short-circuits and the agent default is used.

For model families that the provider strictly requires a specific temperature for (kimi-k2.*, glm-4.6/4.7, minimax-m2, gemini, qwen), `ProviderTransform.temperature` exists to encode that. Moonshot kimi-k2.* returns `HTTP 400 invalid temperature: only 1 is allowed for this model` when 0.5 is sent.

### Steps to reproduce

1. Configure Moonshot kimi-k2.6 as the provider/model.
2. Trigger a session that runs the title agent (any new session).
3. Moonshot rejects the request: `400 invalid temperature: only 1 is allowed for this model`.

### Suggested fix

Swap the operands so the model-aware transform wins, with agent preference as fallback:

```ts
ProviderTransform.temperature(input.model) ?? input.agent.temperature
```

For models without a transform entry (claude, openai, etc.) the function returns `undefined` and the agent preference still applies via `??`.

---

## #27790 — Same-model agents do not preserve agent-local variant at runtime

📅 `2026-05-15` | ✏️ **daifeiya** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27790](https://github.com/anomalyco/opencode/issues/27790)


### Description

When multiple agents share the same model but configure different `variant` values, the effective runtime `variant` does not match the agent-local config.

In my setup, I configured:

- `dubhe-orch` → `lumenmodel/gpt-5.4` + `low`
- `build` → `lumenmodel/gpt-5.4` + `medium`

But exported sessions/messages and local runtime DB records show other values (especially `high`) instead. This suggests the problem is not only UI-related: the runtime effective variant itself appears wrong.

`opencode agent list` also does not expose model/variant, which makes this harder to detect.

### Plugins

_No response_

### OpenCode version

OpenCode Terminal `1.15.0`

### Steps to reproduce

## Minimal repro config

```jsonc
{
  "agent": {
    "dubhe-orch": {
      "model": "lumenmodel/gpt-5.4",
      "variant": "low"
    },
    "build": {
      "model": "lumenmodel/gpt-5.4",
      "variant": "medium"
    },
    "dubhe-arc": {
      "model": "lumenmodel/gpt-5.4",
      "variant": "high"
    }
  }
}

These agents intentionally share the same model but use different variants.

Expected
The runtime should preserve the per-agent configured variant:

dubhe-orch → low
build → medium
dubhe-arc → high
Actual
Runtime records do not match config:

dubhe-orch (configured low) shows high, max, or default
build (configured medium) shows high or default
I did not observe the configured low / medium values for the tested agents in runtime data.

This suggests the effective variant may be bleed

> *[Truncado — 2838 chars totais]*

---

## #27783 — session.processor fails with 'No cookie auth credentials found' on inter-session messages from plugins

📅 `2026-05-15` | ✏️ **zdknet-0rgon** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27783](https://github.com/anomalyco/opencode/issues/27783)


## Bug Description

When a plugin sends a message to a different session via `fetch()` to `http://localhost:4096/session/{id}/message`, the OpenCode server receives the message but `session.processor` fails with:

```
ERROR service=session.processor error=No cookie auth credentials found stack=AI_APICallError: No cookie auth credentials found
```

This affects the `background-agents` plugin which needs to send notifications from delegation sessions to parent sessions when delegations complete.

## Root Cause

The plugin uses `fetch()` directly (bypassing the SDK client) to avoid the SDK's auth issues. The server receives the POST request successfully, but when `session.processor` tries to process the message, it fails because there's no cookie auth credential for the inter-session request.

## Steps to Reproduce

1. Install `opencode-background-agents` plugin
2. Launch a delegation via `delegate(prompt, agent)`
3. Wait for delegation to complete
4. Check logs: `grep "No cookie auth" ~/.local/share/opencode/log/*.log`

## Expected Behavior

The server should accept and process messages from local plugins without requiring cookie auth for inter-session communication.

## Actual Behavior

`session.processor` rejects the message with "No cookie auth credentials found", so:
- Parent session never receives delegation completion notification
- Sidebar delegation list doesn't update
- Delegations appear stuck as "running" forever

## Environment

- OpenCode version: latest (2026-05-1

> *[Truncado — 1815 chars totais]*

---

## #27771 — MCP servers

📅 `2026-05-15` | ✏️ **adillkhl** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27771](https://github.com/anomalyco/opencode/issues/27771)


### Description

## Bug Report

Local stdio MCP servers are completely non-functional on OpenCode Desktop for Windows. Remote MCPs work fine.

### Environment

- **OS:** Windows 11
- **OpenCode Desktop version:** v1.15.0
- **Node.js:** v24.11.1 (installed via official installer)
- **Installation method:** Official Windows installer from opencode.ai

### Current Behavior

All local MCP servers show **red status** in the Desktop app. Only remote MCPs (e.g., `context7`) show green and work correctly.

Specifically affected:
- `github` (@modelcontextprotocol/server-github)
- `agentmemory` (@agentmemory/mcp)
- `supabase` (@supabase/mcp-server-supabase)
- Any other local stdio MCP

Remote MCP that works:
- `context7` (https://mcp.context7.com/mcp) → ✅ green

### Expected Behavior

Local MCP servers should initialize and show green status, as they do on macOS and in the CLI version.

### Steps to Reproduce

1. Install OpenCode Desktop on Windows 11
2. Add any local MCP to `opencode.jsonc` (example: github)
3. Restart OpenCode Desktop
4. Check MCP status — all local MCPs are red

### What I've Already Tried

1. ✅ Verified token is valid (GitHub API responds correctly)
2. ✅ Tested `npx -y @modelcontextprotocol/server-github` directly in terminal — works fine standalone
3. ✅ Tried absolute path to `npx.cmd` instead of `npx`
4. ✅ Tried `cmd /c npx ...` and `powershell -Command "npx ..."`
5. ✅ Increased timeout to 60 seconds
6. ✅ Pre-installed packages globally
7. ✅ Created HTTP proxy wr

> *[Truncado — 2726 chars totais]*

---

## #27764 — Bug: DigitalOcean OAuth fails because Model Access Key creation endpoint is retired

📅 `2026-05-15` | ✏️ **cch1rag** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27764](https://github.com/anomalyco/opencode/issues/27764)


### Description

DigitalOcean OAuth currently fails during `/connect` because the plugin attempts to auto-create a Model Access Key through a retired endpoint.

After completing the DigitalOcean OAuth browser flow, opencode receives the callback, then fails while creating the Model Access Key:

```log
INFO  2026-05-15T16:11:39 +14609ms service=plugin.digitalocean port=1456 digitalocean oauth server started
ERROR 2026-05-15T16:11:51 +11754ms service=plugin.digitalocean error=Failed to create Model Access Key (410): {"id":"gone","message":"resource retired: Creating model API keys through this endpoint is retired. Go to ${MODEL_STUDIO_MANAGE_KEYS_URL} to create a model access key."}
 digitalocean oauth callback failed
INFO  2026-05-15T16:11:51 +5ms service=plugin.digitalocean digitalocean oauth server stopped
```

This appears to break the DigitalOcean OAuth path added in #26095, because the implementation expects `/connect` to provision a Model Access Key automatically after OAuth.

Expected behavior:

DigitalOcean OAuth should complete successfully, or opencode should fall back to a manual Model Access Key flow if DigitalOcean no longer allows creating these keys through the API endpoint.

Actual behavior:

OAuth completes in the browser, but opencode fails during the callback because the Model Access Key creation request returns:

```json
{
  "id": "gone",
  "message": "resource retired: Creating model API keys through this endpoint is retired. Go to ${MODEL_STUDIO_MANAGE_KE

> *[Truncado — 2496 chars totais]*

---

## #27761 — [MCP] Vercel MCP not supported - OpenCode not in approved clients list

📅 `2026-05-15` | ✏️ **danubiolagoa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27761](https://github.com/anomalyco/opencode/issues/27761)


### Description

Vercel MCP is not working in OpenCode. Even with a valid API token configured, the server returns an authentication error.
According to the official Vercel MCP documentation, Vercel maintains a whitelist of approved MCP clients and OpenCode is not on the list. Clients like Claude Code, Cursor, ChatGPT, etc. are supported, but OpenCode is not recognized even when using a valid Full Account Access token.
Error received:
{"jsonrpc":"2.0","error":{"code":-32000,"message":"Not Acceptable: Client must accept both application/json and text/event-stream"},"id":null}
Reference: https://vercel.com/docs/agent-resources/vercel-mcp

### Plugins

vercel (MCP)

### OpenCode version

[latest, updated 2026-05-15] 1.15.0

### Steps to reproduce

1. Generate a Vercel API token at https://vercel.com/account/tokens with Full Account Access scope
2. Configure the token in opencode.json under mcp.vercel.headers
3. Restart OpenCode
4. Try to use any Vercel MCP tool
5. Authentication error occurs

### Screenshot and/or share link

N/A

### Operating System

Windows 11

### Terminal

Warp (powershell)

---

## #27758 — Model refused to make a Compaction

📅 `2026-05-15` | ✏️ **dphdmn** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/27758](https://github.com/anomalyco/opencode/issues/27758)


### Description

Model - "Big Pickle"
Refused to create a summary during auto-compaction, the result - a bunch of model's junk and broken tool calls instead of the summary text, then after that model sent me a Thumbs Up Emoji "👍", absolutely hilarious.

### Plugins

None

### OpenCode version

1.15

### Steps to reproduce

1) Have a long chat
2) Auto compaction triggers
3) In some cases model refuses to do a compaction

### Screenshot and/or share link

<img width="1170" height="116" alt="Image" src="https://github.com/user-attachments/assets/4c1c7f0d-863f-408b-bdea-ea273467c004" />

### Operating System

Win 11

### Terminal

Powershell

---

## #27755 — TypeError: Failed to fetch shortly after opening — unable to send any prompts

📅 `2026-05-15` | ✏️ **Echoice01** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/27755](https://github.com/anomalyco/opencode/issues/27755)


### Description

**Description**

Shortly after opening openCode, I receive a "Failed to fetch" error when trying to send a prompt. After that, any subsequent input or action doesn't respond, and eventually another error is thrown.

**Steps to Reproduce**

1. Launch openCode
2. Wait a short moment after it opens
3. Type a prompt and try to send it
4. Observe the "Failed to fetch" error toast
5. Try sending again or performing any other action — no response
6. Wait a while, and a "Something went wrong" error page appears

**Error Message**

TypeError: Failed to fetch

**Environment**

- OS: Windows 11 Home 25H2
- openCode Version: OpenCode Desktop v1.15.0
- Installation method: Official website installer

**Expected Behavior**

Prompts should be sent successfully and responses should be returned without errors.

**Actual Behavior**

All requests fail with `Failed to fetch`, making the application completely unusable.

**Additional Context**

This happens reliably every time I open the app. It seems like the app is unable to connect to the backend or the network request is being blocked somehow.


### Plugins

_No response_

### OpenCode version

OpenCode Desktop v1.15.0

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="1280" height="825" alt="Image" src="https://github.com/user-attachments/assets/126ebf83-c840-4fcd-abe5-82d4a753c20f" />

<img width="1280" height="825" alt="Image" src="https://github.com/user-attachments/assets/2b1f0d09-d209-

> *[Truncado — 1599 chars totais]*

---

## #27753 — Unable to properly authorize OpenCode Desktop

📅 `2026-05-15` | ✏️ **Fenyutanchan** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27753](https://github.com/anomalyco/opencode/issues/27753)


### Description

When I use opencode-desktop, sometimes the permission request box contains commands that are too long (especially when the LLM chooses to run a Python script and inputs the entire script via the command line), causing the later options to not display correctly. Currently, the only temporary workaround I know is enabling auto-allow in the settings. Could you please fix this issue ASAP?

### Plugins

Nothing

### OpenCode version

1.15.0 (1.15.0)

### Steps to reproduce

Prompt:
在这个目录下，运行如下 python 脚本：(In this directory, run the following python script:)
```python
print("Hello, world!")
# duplicate lines to reproduce the bug...
print("Hello, world!")
```
这是在复现 OpenCode Desktop 的一个 bug，所以你不应该对上述代码进行任何化简！
(This is for reproduction the bug of OpenCode Desktop, so you should not simplify the above code!)

### Screenshot and/or share link

<img width="1440" height="870" alt="Image" src="https://github.com/user-attachments/assets/6ecddc21-bbc2-46be-bbaf-cdd020d2d1b1" />

### Operating System

macOS Tahoe 26.2

### Terminal

fish, version 4.7.1

---

## #27749 — /exit or /quit command kills the terminal on Windows PowerShell

📅 `2026-05-15` | ✏️ **L-owen** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27749](https://github.com/anomalyco/opencode/issues/27749)


### Description

When exiting the TUI (via /quit, /exit, or tab-completed /quit), the entire terminal window/tab closes instead of returning to the shell prompt. This happens both with bun run dev and the bundled opencode command on Windows 11.

### Plugins

_No response_

### OpenCode version

1.15.0

### Steps to reproduce

1. Start opencode TUI (bun run dev or opencode)
2. Type /qui then press Tab to autocomplete to /quit or type /quit and press enter or Ctrl + C to quit
3. Expected behavior: TUI exits, shell prompt is restored, terminal window stays open.
4. Actual behavior: TUI exits and the entire terminal window/tab closes. The shell prompt never gets a chance to render.

### Screenshot and/or share link

<img width="1835" height="1048" alt="Image" src="https://github.com/user-attachments/assets/55dd8676-cb17-4143-bed9-eeabd28e4208" />

### Operating System

Windows 11

### Terminal

PowerShell 7.6.1

---

## #27703 — Attach to server has no output format json

📅 `2026-05-15` | ✏️ **m407** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27703](https://github.com/anomalyco/opencode/issues/27703)


### Description
When attaching to a server there is no output when json format requested

Running
```bash
opencode run --format json "ping"
```
works as expected with json output
```bash
opencode run --format json --attach http://localhost:4096 "ping"
```
fails to output anything.

### Plugins

none

### OpenCode version

1.15.0

Regress started from 1.14.42, 1.14.41 - works

### Steps to reproduce

opencode run --format json --attach http://localhost:4096 "ping"

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 22.04 LTS

### Terminal

xterm-256color

---

## #27701 — Legacy session messages fail after schema updates

📅 `2026-05-15` | ✏️ **shantur** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27701](https://github.com/anomalyco/opencode/issues/27701)


Older local sessions can contain message and part rows written before the current `MessageV2` schemas required several fields. After upgrading opencode, reading those sessions can fail because API/read paths hydrate the historical DB rows and then validate or serve them as the current message shape.

This is not limited to import/export. It can affect existing local sessions through endpoints and services such as:

- `GET /session/:id/message`
- `GET /session/:id/message/:messageID`
- `MessageV2.page`
- `Session.messages`
- `MessageV2.get`
- `MessageV2.parts`

Observed example error from a legacy session shape:

```text
Missing key
  at ["agent"]
```

Legacy rows may also be missing fields that are now required, including:

- message `agent`
- user message `model`
- assistant message `parentID`
- `step-finish.reason`

The fix should preserve strict current schemas while normalizing historical rows at the read/import boundary so old sessions continue to work after upgrades.

---

## #27697 — Regression in v1.14.50: `opencode run --format json` drops post-tool-call assistant text for github-copilot/claude-* models

📅 `2026-05-15` | ✏️ **kayx23** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27697](https://github.com/anomalyco/opencode/issues/27697)


## Summary

In opencode **v1.14.50**, `opencode run --format json --model github-copilot/claude-* "<prompt that triggers a tool call>"` exits cleanly (rc=0) but **never emits the assistant text turn that follows the tool call**. Stdout contains the first `step_start` / `tool_use` / `tool` / `step_finish (reason: tool-calls)`, then a second `step_start`, then **nothing** — no `text`, no second `step_finish`.

The same prompt on **v1.14.48** emits 2 `text` events and a final `step_finish (reason: stop)`. The same prompt on v1.14.50 against `github-copilot/gpt-5.4` (or any non-Claude provider I tested) also works correctly. Single-turn prompts (no tool call) on Claude+v1.14.50 also work — only the **multi-step / post-tool-call** turn is dropped.

This breaks every headless integration that relies on `--format json` to capture Claude responses involving any tool use (read, bash, etc.) — output is silently truncated to zero text content with no error.

## Affected version

- **Broken**: 1.14.50
- **Working**: 1.14.48

## Reproduction (minimal, copy-pasteable)

```bash
# 1. Stage a prompt file the model will be asked to read
echo "Reply with one short sentence approving this code: def add(a,b): return a+b" > /tmp/prompt.md

# 2. Run on 1.14.50 — broken
opencode run --format json --model github-copilot/claude-haiku-4.5 \
  "Open the file at this absolute path using your read tool: /tmp/prompt.md — follow the instructions inside and reply in this conversation, ending with ## DONE." \

> *[Truncado — 4694 chars totais]*

---

## #27695 — [Bug] Xiaomi Token Plan (China) includes non-existent model xiaomi-token-plan-cn/mimo-v2-flash

📅 `2026-05-15` | ✏️ **qiyuanhuakai** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27695](https://github.com/anomalyco/opencode/issues/27695)


### Description

The official auth provider `Xiaomi Token Plan (China)` (`xiaomi-token-plan-cn`) includes a model named:
`xiaomi-token-plan-cn/mimo-v2-flash`
However, this model does not appear to actually exist in the Xiaomi Token Plan (This model does exist in Xiaomi's official API, but it is not included in the Xiaomi Token Plan.).
When trying to call it, the request fails with a APIError: Not supported model mimo-v2-flash.

### Plugins

"oh-my-openagent@latest",     "cc-safety-net@latest",     "@cortexkit/opencode-magic-context@latest"

### OpenCode version

1.15.0

### Steps to reproduce

1. Use the official auth provider:  `Xiaomi Token Plan (China)` (`xiaomi-token-plan-cn`) 
2. Select or call the model: `xiaomi-token-plan-cn/mimo-v2-flash`
3. Send a request

### Screenshot and/or share link

<img width="1054" height="366" alt="Image" src="https://github.com/user-attachments/assets/79dc9365-c1b4-444b-ab8b-ae399f7341c9" />

<img width="882" height="242" alt="Image" src="https://github.com/user-attachments/assets/179cfccf-9eff-4b82-8299-3e8be192c5d9" />

### Operating System

Linux Mint 22.3 x86_64

### Terminal

Wezterm

---

## #27692 — OpenCode currently does not enable explicit context caching for Alibaba Cloud Model Studio / DashScope OpenAI-compatible models.

📅 `2026-05-15` | ✏️ **caozhiyuan** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27692](https://github.com/anomalyco/opencode/issues/27692)


### Description

Alibaba Cloud Model Studio supports Context Cache for Qwen and related models:

https://www.alibabacloud.com/help/en/model-studio/context-cache

According to the docs, some models/providers require Explicit cache to reliably hit the cache. Explicit cache is enabled by adding:
"cache_control": { "type": "ephemeral" }
to message content blocks.

However, when using Alibaba Cloud Model Studio through an OpenAI-compatible provider in OpenCode, OpenCode does not add cache_control markers. As a result, models that rely on explicit caching cannot hit the cache, even when the prefix/system prompt is stable across requests.

This causes much higher input token usage and worse latency for long-running OpenCode sessions, especially with large system prompts, repository context, tool instructions, and plan mode.

### Plugins

_No response_

### OpenCode version

1.15.0

### Steps to reproduce

1. choose alibaba provider qwen3.6-plus and ask a question will call tool
2. inspect the provider request/usage.

### Screenshot and/or share link

_No response_

### Operating System

windows11

### Terminal

gitbash

---

## #27686 — Desktop TUI: /skill-name prefix injects full SKILL.md into conversation instead of using skill tool

📅 `2026-05-15` | ✏️ **ericheroster** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27686](https://github.com/anomalyco/opencode/issues/27686)


## Description

In the opencode desktop TUI, typing `/skill-name` (e.g., `/雪球-cli`) and sending the message causes the **entire SKILL.md content** to be injected directly into the conversation context as visible text. This is inconsistent with how skills should work — the agent should discover and load the skill via the native `skill` tool, not get the raw markdown dumped inline.

## Steps to Reproduce

1. Open opencode desktop TUI
2. Type `/` to trigger the skill list popup
3. Select a skill from the list (e.g., `雪球-cli`)
4. The input becomes `/雪球-cli`
5. Press Enter to send
6. The full content of `SKILL.md` is loaded into the conversation as visible output

## Workaround

Delete the leading `/` before sending — the agent then correctly uses the `skill` tool to load the skill, showing only a concise tool invocation.

## Expected Behavior

`/skill-name` should behave the same as typing the skill name without `/` — i.e., the agent should decide to load the skill via the `skill` tool on its own. The `/` prefix should only serve as a selection/discovery mechanism in the autocomplete popup, not trigger a premature injection of the skill content.

## Environment

- opencode desktop TUI (latest version)
- Windows

---

## #27683 — Prompt cache hit drops after exiting experimental plan mode because `plan_exit` tool is removed from tool schema

📅 `2026-05-15` | ✏️ **caozhiyuan** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27683](https://github.com/anomalyco/opencode/issues/27683)


### Description

I enabled opencode plan mode using:
env "OPENCODE_EXPERIMENTAL_PLAN_MODE": "true"

Before exiting plan mode

Tools included:

apply_patch
bash
glob
grep
plan_exit
question
read
skill
task
todowrite
webfetch
After exiting plan mode

Tools became:

apply_patch
bash
glob
grep
question
read
skill
task
todowrite
webfetch

plan_exit was removed.

Because plan_exit was in the middle of the tool list, all subsequent tool definitions shifted position, causing the prompt prefix to diverge and reducing cache reuse.

### Plugins

_No response_

### OpenCode version

1.14.46

### Steps to reproduce

1. Enable experimental plan mode with env "OPENCODE_EXPERIMENTAL_PLAN_MODE": "true"
2. Start a new opencode session with a request that enters plan mode, for example: Demonstrate plan mode, then create a file.
3. Inspect the first responses API request while still in plan mode.
The tools list includes plan_exit, for example:
apply_patch
bash
glob
grep
plan_exit
question
read
skill
task
todowrite
webfetch

4. Let the model finish planning and call plan_exit.

5. Approve switching from plan mode to build mode.

6. Inspect the next responses API request after exiting plan mode.
The tools list no longer includes plan_exit, for example:
apply_patch
bash
glob
grep
question
read
skill
task
todowrite
webfetch

7. Compare prompt cache usage between the two adjacent requests.
Example observed result:
Before exiting plan mode:
cached_tokens=18,048
input_tokens=113
After exiting plan mode

> *[Truncado — 1647 chars totais]*

---

## #27676 — .opencode/package.json references non-existent @opencode-ai/plugin@local causing warnings and ~30s startup delay

📅 `2026-05-15` | ✏️ **gotspatel** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27676](https://github.com/anomalyco/opencode/issues/27676)


### Description

## Environment

| Field | Value |
|---|---|
| **OpenCode Version** | 1.15.0 (also reproduced on 1.14.50) |
| **OS** | Windows 10/11 (win32, Git Bash) |
| **Node.js** | v22.12.0 |
| **Shell** | bash (Git Bash) |

# Description

OpenCode auto-creates `.opencode/` directories inside project folders to store session state and plugin dependencies. Each `.opencode/` directory contains an auto-generated `package.json` with a dependency on `@opencode-ai/plugin@local`.

The `@local` version tag **does not exist** on the npm registry. This causes an `NpmInstallFailedError` for every project OpenCode has visited, producing WARN-level log entries and introducing an ~30 second cumulative startup delay (each failed install attempt takes ~4-9 seconds, and 8+ projects means ~30s total delay).

The `.opencode/.gitignore` intentionally excludes `package.json` (confirming it is a generated file), but the `@local` tag is clearly a build artifact from OpenCode's own monorepo — within the monorepo, `@opencode-ai/plugin@local` resolves correctly via workspace links, but the released binary generates `package.json` files that reference a tag that doesn't resolve on the public npm registry.

### Log Output

```
WARN  2026-05-15T06:20:12 +73566ms service=config dir=D:\PROJECTS\Spectro XML\.opencode error=Cause([Fail(NpmInstallFailedError (cause: @opencode-ai/plugin: No matching version found for @opencode-ai/plugin@local.))]) background dependency install failed
WARN  2026-05-15T06:20

> *[Truncado — 6415 chars totais]*

---

## #27674 — Desktop add workspace uses Windows picker for WSL localhost server

📅 `2026-05-15` | ✏️ **0xYiliu** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27674](https://github.com/anomalyco/opencode/issues/27674)


### Description

On Windows Desktop, if OpenCode connects to a server running inside WSL through localhost on port 4096, **Add Workspace** is treated like a local Desktop sidecar connection and opens the native Windows directory picker.

That makes it impossible to browse the WSL server filesystem through the in-app picker.

### Plugins

None

### OpenCode version

Desktop current dev branch

### Steps to reproduce

1. On Windows, run `opencode serve` inside WSL
2. Connect OpenCode Desktop to localhost:4096
3. Switch to that server
4. Click **Add Workspace** in the sidebar

Expected: the in-app directory picker opens so the remote/WSL filesystem can be browsed.

Actual: the native Windows picker opens.

### Screenshot and/or share link

None

### Operating System

Windows 11 + WSL

### Terminal

Windows Terminal

---

## #27669 — `opencode run --agent X "prompt"` returns empty stdout AND stderr when spawned via direct `execvp` (no shell) — v1.15.0 regression

📅 `2026-05-15` | ✏️ **CyberFreedomOrg** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27669](https://github.com/anomalyco/opencode/issues/27669)


## Summary

In opencode v1.15.0 (macOS, darwin-arm64), `opencode run --agent <user-agent> "<prompt>"` exits cleanly with code 0 but emits **0 bytes on both stdout and stderr** when the process is spawned via direct `execvp` (e.g. Python `subprocess.run(argv, shell=False)`, or `posix_spawn`/`execve` directly).

The exact same argv invoked via a shell (Python `subprocess.run(cmd, shell=True)`, or `sh -c "..."`, or interactive bash) produces the expected agent response on stdout. This appears to be a regression introduced in v1.15.0, most likely tied to the "Effect-based core event system" change mentioned in the release notes.

This breaks any automation that spawns `opencode run` without going through a shell — CI scripts, launchd jobs, MCP-style headless integrations, etc.

## Environment

- opencode: **v1.15.0** (installed at `~/.opencode/bin/opencode` via opencode's own install script)
- OS: macOS 15.x (Darwin 25.5.0), arm64
- Reproducer language: Python 3.12.x

No third-party plugins active. opencode.jsonc loads cleanly (`opencode agent list` returns 13 agents).

## Reproducer (minimal)

```python
# repro.py
import subprocess
OC = "/path/to/.opencode/bin/opencode"
AGENT = "your-agent-name"
PROMPT = "Reply with the single word: ok"

# Case A — direct execvp via argv list. EXPECTED: agent response on stdout. ACTUAL: 0 bytes.
proc = subprocess.run(
    [OC, "run", "--agent", AGENT, PROMPT],
    capture_output=True, text=True, timeout=120,
)
print(f"execvp: rc={proc.returncode

> *[Truncado — 5153 chars totais]*

---

## #27661 — [Bug] Home/End keys in input box scroll message list instead of moving cursor

📅 `2026-05-15` | ✏️ **Mrqqeat** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27661](https://github.com/anomalyco/opencode/issues/27661)


### Description

Currently, when typing in the input box, pressing the `Home` or `End` keys triggers the message list to scroll to the top or bottom, rather than moving the cursor to the beginning or end of the text line. This makes it very difficult to edit long messages.

### Plugins

_No response_

### OpenCode version

1.15.0

### Steps to reproduce

1. Focus on the message input box.
2. Type a long sentence.
3. Press the `Home` key to try and return to the start of the sentence.
4. Observe that the message history scrolls to the top instead of the cursor moving.

### Screenshot and/or share link

_No response_

### Operating System

windows10

### Terminal

Windows Terminal

---

## #27655 — Auto-discovered models duplicate manually-configured entries within same provider

📅 `2026-05-15` | ✏️ **cristoslc** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27655](https://github.com/anomalyco/opencode/issues/27655)


## Description

When using a custom provider configured with "@ai-sdk/openai-compatible" and a baseURL, models that are both manually listed in opencode.json and auto-discovered from the provider's /v1/models endpoint appear as duplicate entries in the model selector. The same model ID shows twice within the same provider section: once with the configured name (from opencode.json) and once with the raw API-discovered tag.

For example, if I manually configure:

```json
"models": {
  "deepseek-v3.2:cloud": { "name": "DeepSeek V3.2" }
}
```

The model selector shows both "DeepSeek V3.2" AND "deepseek-v3.2:cloud" as separate entries. This makes the list noisy and confusing.

## Plugins

None — using core @ai-sdk/openai-compatible provider.

## OpenCode version

1.3.x

## Steps to reproduce

1. Configure a provider in opencode.json using npm: "@ai-sdk/openai-compatible" with a baseURL (e.g., https://ollama.com/v1)
2. Manually define one or more models in the provider's "models" object with custom "name" fields
3. Launch opencode and open the model selector (/model)
4. Observe each manually configured model appears twice: once with the custom name, once with the raw API tag

## Expected behavior

Auto-discovered models from the same provider should merge with (or override) manually-configured entries when the model ID matches, avoiding duplicates within the same provider.

## Actual behavior

Both the manual entry and the auto-discovered entry appear side-by-side in the model list

> *[Truncado — 1857 chars totais]*

---

## #27650 — /find/symbol endpoint returns empty array instead of LSP workspace symbols

📅 `2026-05-15` | ✏️ **JDis03** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27650](https://github.com/anomalyco/opencode/issues/27650)


## Describe the bug

The `/find/symbol` HTTP API endpoint is defined in the API schema but not implemented. When called, it returns an empty array `[]` instead of querying the LSP for workspace symbols.

## Steps to reproduce

1. Configure an LSP (e.g., TypeScript) in OpenCode
2. Call `/find/symbol?query=<symbol_name>`
3. Observe that the response is always `[]`

## Expected behavior

The endpoint should call `LSP.Service.workspaceSymbol(query)` and return matching symbols (functions, classes, variables, etc.) from the workspace.

## Root cause

In `packages/opencode/src/server/routes/instance/httpapi/handlers/file.ts`, the `findSymbol` handler is a stub:

```typescript
const findSymbol = Effect.fn("FileHttpApi.findSymbol")(function* () {
  return []
})
```

## Proposed fix

Import `LSP.Service` and delegate to `lsp.workspaceSymbol(query)`:

```typescript
const lsp = yield* LSP.Service
const findSymbol = Effect.fn("FileHttpApi.findSymbol")(function* (ctx: { query: { query: string } }) {
  return yield* lsp.workspaceSymbol(ctx.query.query)
})
```

## Context

This blocks downstream features like symbol attachment autocomplete in CodeNomad, which uses this endpoint to let users attach code symbols to AI prompts.

---

## #27647 — Paste does not work when text containing special char

📅 `2026-05-15` | ✏️ **simiooo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27647](https://github.com/anomalyco/opencode/issues/27647)


### Description

<img width="271" height="106" alt="Image" src="https://github.com/user-attachments/assets/f53840aa-6a60-4626-b7a7-7f81858474e9" />1. 
Copy the string from image 2. Paste text into opencode cli text area 3. You'll only get : matches: $R[10] = [$R[11] = {
                    i: "__root__

<img width="1422" height="180" alt="Image" src="https://github.com/user-attachments/assets/620ce8cc-8ccf-4e9f-a2f8-e0de4e813a09" />

### Plugins

No plugin

### OpenCode version

opencode 1.14.49, Windows 11

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #27645 — Bug: REST API session model ignored when loading session via ACP

📅 `2026-05-15` | ✏️ **oudeis01** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27645](https://github.com/anomalyco/opencode/issues/27645)


## Description

When creating a session via the REST API (`POST /session`) with a specific model, the model is correctly stored in the database. However, when that session is subsequently loaded (e.g., via `POST /session/:id/message` or `POST /session/:id/prompt_async`), the stored model is ignored and replaced with `defaultModel()`.

## Root Cause

Two files contribute to this bug:

### 1. `packages/opencode/src/acp/session.ts` — `load()` ignores session data

```typescript
// Line 46-62
async load(sessionId, cwd, mcpServers, model?) {
  const session = await this.sdk.session.get(...)  // session.model exists here!
  
  const resolvedModel = model  // BUG: ignores session.model, uses only parameter
  // ...
}
```

The `load()` method fetches the full session from DB (which includes `session.model`), but then ignores it and uses only the `model` parameter.

### 2. `packages/opencode/src/acp/agent.ts` — passes `defaultModel()` to `load()`

```typescript
// Around line 599, 684, 739 in loadSession()
const model = await defaultModel(this.config, directory)
await this.sessionManager.load(sessionId, params.cwd, params.mcpServers, model)
```

`loadSession()` always resolves the model via `defaultModel()` and passes it to `load()`, overriding any model stored in the session.

## Impact

This affects any workflow that creates sessions via the REST API with a specific model:

- Third-party MCP servers that create sessions with specific models
- External tools that use the REST API to 

> *[Truncado — 2452 chars totais]*

---

## #27631 — Regression in 1.14.48: context compaction breaks sessions with large MCP tool sets

📅 `2026-05-15` | ✏️ **darkhipo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27631](https://github.com/anomalyco/opencode/issues/27631)


## Description

Starting with v1.14.48, opencode's context compaction behavior regresses for sessions with large MCP tool definitions. Sessions that worked correctly on v1.14.47 become unusable — context usage jumps erratically (3% to 68% in a single turn), compaction fails or produces incorrect results, and the session enters a degraded state where every turn re-sends the full bloated context.

v1.14.47 and earlier handle this correctly: context stays steady at ~61% per turn with auto-compaction working as expected.

## Reproduction

**Environment:**
- Provider: Z.AI coding plan (GLM-5-Turbo, 200K context)
- MCP tools: 206 tools x 2 transports (SSE + stdio) = 412 tool definitions (approx 123K tokens overhead per turn)
- OS: macOS 26.4.1, Apple Silicon (M1 Air 8GB)
- Install method: Homebrew

**Steps to reproduce:**
1. Install opencode v1.14.48 (or v1.14.49 / v1.14.50 — all affected)
2. Configure MCP servers with a large tool set (~100+ tools)
3. Start a session with any model on a provider with a moderate context window (200K tokens or less)
4. Send 2-3 messages and observe context usage

**Expected behavior (v1.14.47):**
- First turn: ~123K tokens (61% of 200K) — steady
- Subsequent turns: ~400 tokens (cache hit) or ~123K (cache miss) — predictable
- Compaction triggers at the configured threshold and works correctly
- Context percentage stays stable between turns

**Actual behavior (v1.14.48+):**
- First turn: ~3% context usage
- Second turn: jumps to 68-90%+ context usage

> *[Truncado — 3358 chars totais]*

---

## #27620 — [BUG] Sessions with parent_id are invisible in session listings despite existing in database

📅 `2026-05-14` | ✏️ **BenSharir** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27620](https://github.com/anomalyco/opencode/issues/27620)


## Bug Description

Sessions that have a `parent_id` set (i.e., child/spawned sessions) are completely invisible in the session listing functionality, even though they exist in the database and can be accessed via other session tools.

## Evidence

A session was spawned with ID `ses_xxxxxxxxxxxxxxxxxxxxx`. 

**Database confirms it exists:**
```sql
sqlite3 ~/.local/share/opencode/opencode.db \
  "SELECT id, parent_id, title FROM session WHERE id = 'ses_xxxxxxxxxxxxxxxxxxxxx';"

-- Result:
ses_xxxxxxxxxxxxxxxxxxxxx|ses_yyyyyyyyyyyyyyyyyyyyy|Spawned Session
```

**Session has 17 messages and completed successfully:**
```
Session ID: ses_xxxxxxxxxxxxxxxxxxxxx
Messages: 17
Date Range: 2026-05-14T21:38:21.172Z to 2026-05-14T21:40:53.831Z
Agents Used: [redacted]
```

**But `session list` does NOT show it:**
The session listing shows the parent session (`ses_yyyyyyyyyyyyyyyyyyyyy`) but completely omits the child session, even though it's the second most recent session by `time_created`.

## Root Cause

**IDENTIFIED**: The issue is in `packages/opencode/src/cli/cmd/session.ts` at line 87.

When `opencode session list` is executed, it calls:
```typescript
Session.Service.use((svc) => svc.list({ roots: true, limit: args.maxCount }))
```

The `roots: true` flag causes the underlying query in `packages/opencode/src/session/session.ts` (line 917) to apply:
```typescript
isNull(SessionTable.parent_id)
```

This hardcoded filter excludes all child sessions from the listing.

## Steps to Repr

> *[Truncado — 3827 chars totais]*

---

## #27594 — Session permanently stuck after auto-compaction: post-compaction auto-trigger fires tool_use without tool_result error and is non-recoverable

📅 `2026-05-14` | ✏️ **magnuslo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27594](https://github.com/anomalyco/opencode/issues/27594)


# Session permanently stuck after auto-compaction: post-compaction auto-trigger fires `tool_use without tool_result` error and is non-recoverable

> **Update (post github-actions duplicate-check):** This issue overlaps mechanically with **#14367** (same `tool_use`/`tool_result` orphaning root cause) and operationally with **#15533** (same compaction.ts re-trigger logic). I've kept it open because the specific failure mode — **permanently-stuck session, deterministic API 400 from a single-part orphan, whack-a-mole behavior as you remove individual offenders** — is distinct and provides additional reproduction signal.
>
> **Original workaround in this issue is insufficient** (deletes the failed messages but doesn't fix the underlying part-conversion problem). See the **"Working workaround"** section near the bottom for the correct fix.

## Description

After a successful auto-compaction, opencode immediately injects a second `{"type":"compaction","auto":true}` trigger **without a `tail_start_id`**. The retried compaction call is rejected by Anthropic with:

```
messages.2: `tool_use` ids were found without `tool_result` blocks immediately after: toolu_XXXXXX.
Each `tool_use` block must have a corresponding `tool_result` block in the next message.
```

The session becomes **permanently unrecoverable**: every subsequent prompt (including `continue`) re-fires the broken compaction, hits the same error, and writes a new failed compaction message. The TUI offers no escape — only dir

> *[Truncado — 11579 chars totais]*

---

## #27578 — /skill slash command wipes existing input text instead of preserving it

📅 `2026-05-14` | ✏️ **HaleTom** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27578](https://github.com/anomalyco/opencode/issues/27578)


### Description

When the user types text into the prompt box, then invokes `/skill` (e.g. to select a skill after the input is already partly composed), selecting a skill from the picker **discards all previously typed text**. The input box is replaced entirely with `/skill-name` and the prior text is lost with no way to recover it.

This is especially frustrating because `/skill` is only recognized when typed as the very first characters of the prompt. So if you've typed a multi-line prompt and realize you need a skill, you must:
1. Move the cursor to line 1, column 1
2. Type `/skill` → Enter to open the picker
3. Select the skill → **all your text is gone**

### Steps to reproduce

1. Type a multi-line prompt (e.g. "Please refactor the auth module to use JWT tokens")
2. Place cursor at position 1,1
3. Type `/skill` and press Enter
4. Select any skill from the picker
5. Observe: the previously typed text is wiped; only `/skill-name` remains in the input box

### Expected behavior

The selected skill name should be **prepended** to the existing input text, not replace it. E.g. after selecting `context7-mcp`, the input should read:

```
/context7-mcp Please refactor the auth module to use JWT tokens
```

Alternatively, `/skill` should be recognized anywhere in the input (not just at the start), or the existing text should be preserved in undo history / clipboard so the user can paste it back.

### Plugins

Using standard plugins: magic-context, opencode-queue, superpowers, et

> *[Truncado — 1599 chars totais]*

---

## #27570 — opencode serve (Web UI): agent does not wait for user input, proceeds to next step on its own

📅 `2026-05-14` | ✏️ **GDWhisper** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27570](https://github.com/anomalyco/opencode/issues/27570)


### Description

In a conversational pipeline workflow (not permission dialogs), the agent asks for user instruction or confirmation — e.g., “What should I do next?” or “Shall I proceed?” — and then, without receiving any actual user input, proceeds as if the user said “yes” or “understood”. It appears to hallucinate a positive response and continues execution autonomously.

This is not about the permission popups. This is the conversational flow itself — the agent pauses and asks for direction, but then pretends the human has answered and moves on.

This bug is probabilistic — it does not happen every time, but occurs frequently enough to be disruptive.

### Plugins

oh-my-openagent (only one)

### OpenCode version

1.14.50

### Steps to reproduce

1. Open OpenCode Web UI (opencode serve + browser).
2. Set model to DeepSeek-V4-Flash or DeepSeek-V4-Pro with thinking/reasoning set to max.
3. Start a task that requires multi-step back-and-forth (e.g., “help me refactor this code step by step”).
4. Observe that after completing a step, the agent asks something like “Should I continue?” or “What’s next?” — then sometimes, without any actual keyboard input, proceeds as if the user responded “yes”.

The agent waits for a brief moment (or does not wait at all), then fabricates a positive user response (“yes”, “go ahead”, “okay”) and continues executing the next step on its own. This behavior is probabilistic — it does not reproduce on every request.

### Screenshot and/or share link

> *[Truncado — 1856 chars totais]*

---

## #27568 — Keybdindings for switching project override default browser controls for switching tabs

📅 `2026-05-14` | ✏️ **nukeop** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27568](https://github.com/anomalyco/opencode/issues/27568)


### Description

Somebody bound Cmd+1, Cmd+2, etc to switching projects. Those are used for switching tabs on Mac.

### Plugins

None

### OpenCode version

1.14.50

### Steps to reproduce

- Run `oencode web`
- In the browser, press Cmd+1 or Cmd+2
- Opencode steals the keypress and the active tab doesn't change.

### Screenshot and/or share link

_No response_

### Operating System

Mac OS

### Terminal

Ghostty

---

## #27560 — Model completes tasks but doesn't mark todo items as completed

📅 `2026-05-14` | ✏️ **smithyyang** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27560](https://github.com/anomalyco/opencode/issues/27560)


### Description

When using OpenCode with an external model (via OpenAI-compatible API), the agent frequently completes the work described in a todo item but never calls todowrite to mark it as completed. The todo list stays in its previous state even after the underlying work is done.

This is not a "todo hangs" issue the todo items simply don't get transitioned to completed state by the model, even though the work is done and the model explicitly says "task done" or "finished" in its response.

The same model, when used with Claude Code (via the same OpenAI-compatible proxy), correctly updates the todo list. This suggests the model is capable of using the todo tool, but something in OpenCode's implementation causes it to skip the update possibly:
1. The todowrite tool definition or description in OpenCode is less clear/visible than Claude Code's equivalent
2. The model loses track of active todo items after working on subtasks (context dilution)  
3. The todo state is not consistently fed back into the model's context window, so the model forgets it needs to update status

### Plugins

@mohak34/opencode-notifier

### OpenCode version

1.14.48

### Steps to reproduce

1. Create a multi-step task with 3-4 todo items
2. Let the model work through them sequentially
3. Observe: model finishes step 1, moves to step 2, but step 1 remains in_progress forever
4. Eventually all items stay in_progress or pending even when work is done
5. Same model + same proxy setup in Claude Code co

> *[Truncado — 1609 chars totais]*

---

## #27550 — gemini-3-flash model not available for private repos (ProviderModelNotFoundError)

📅 `2026-05-14` | ✏️ **cogni-ai-ee** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27550](https://github.com/anomalyco/opencode/issues/27550)


### Description

I'm using the same opencode via GitHub Action (`anomalyco/opencode/github@v1.14.35`)
and the same model works for public repo, but doesn't work for private repos.

When repository is private, I've got the following error:
```
ERROR 2026-05-14T13:26:33 +1ms service=share-next type=message.updated cause={"_id":"Cause","failures":[{"_tag":"Fail","error":{"providerID":"opencode","modelID":"gemini-3-flash","suggestions":["deepseek-v4-flash-free"],"_tag":"ProviderModelNotFoundError"}}]} share subscriber failed
```

I've checked `opencode/deepseek-v4-flash-free` and it works.
Does it mean there is some kind of restriction of using Gemini models in the private repos? Or it's a bug?

### Plugins

_No response_

### OpenCode version

1.14.50

### Steps to reproduce

1. Use `gemini-3-flash` for private workflow with anomalyco/opencode/github@v1.14.35 model.

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu

### Terminal

_No response_

---

## #27547 — GPT-5.5 on Responses API rejects max_output_tokens: Bad Request error

📅 `2026-05-14` | ✏️ **apereiracvo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27547](https://github.com/anomalyco/opencode/issues/27547)


## Bug

When using GPT-5.5 through the Responses API (via `@iam-brain/opencode-codex-auth` plugin or native OpenAI provider), OpenCode sends `max_output_tokens: 32000` in the request body. The OpenAI Responses API for GPT-5.5 rejects this parameter with a `Bad Request` error:

```
"max_output_tokens" not permitted
```

## Root Cause

From the logs, the request to `https://api.openai.com/v1/responses` includes:

```json
"max_output_tokens": 32000
```

GPT-5.5 (and other reasoning models on the Responses API) do not accept `max_output_tokens`. They use `reasoningEffort` and `textVerbosity` instead. OpenCode is automatically injecting this from the model's known output limit.

## Environment

- OpenCode v1.14.50 (also fails on v1.14.49)
- Model: `openai/gpt-5.5`
- Provider: OpenAI (Responses API)
- Plugin: `@iam-brain/opencode-codex-auth@1.7.1`

## Workarounds Tried

1. ✅ Upgraded OpenCode to v1.14.50 — still fails
2. ✅ Updated `@iam-brain/opencode-codex-auth` to v1.7.1 — still fails
3. ✅ Set `sanitizeInputs: true` in codex-config.jsonc — still fails
4. ✅ Added model options (`reasoningEffort`, `textVerbosity`, `reasoningSummary`) in opencode.json — still fails
5. ✅ Removed plugin (fixes the error but loses OAuth subscription access)

## Expected Behavior

OpenCode should NOT send `max_output_tokens` for reasoning models (GPT-5.x) when using the Responses API. The parameter should be omitted or replaced with the appropriate reasoning model controls (`reasoningEffort`, `textVerbo

> *[Truncado — 1887 chars totais]*

---

## #27539 — Title: Desktop sidebar hides sessions where session.version = 'local'

📅 `2026-05-14` | ✏️ **Aigle-2** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27539](https://github.com/anomalyco/opencode/issues/27539)


### Description

Sessions created with version = 'local' (from dev/CLI builds) exist in opencode.db 
but don't appear in the OpenCode Desktop sidebar, even though they exist in the database.

Root Cause:
The Desktop UI appears to filter sessions by version number, excluding rows where 
session.version = 'local'.

Workaround:
Update all session.version = 'local' rows to the current app version (e.g., '1.14.48')

### Plugins

_No response_

### OpenCode version

1.14.50

### Steps to reproduce

1. Create a session via CLI or dev build (version gets set to 'local')
2. Check the database: session.version = 'local'
3. Open Desktop app
4. The session does not appear in the sidebar

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

_No response_

---

## #27530 — Error: 4 of 5 requests failed: config.providers: Unexpected server error.

📅 `2026-05-14` | ✏️ **chrissound** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/27530](https://github.com/anomalyco/opencode/issues/27530)


### Description

When starting the app via `opencode` executable: 

```
Error: 4 of 5 requests failed: config.providers: Unexpected server error. Check server logs for details.; provider.list: Unexpected server error. Check server logs for details.; app.agents: Unexpected server error. Check server logs for details.; config.get: Unexpected server error. Check server logs for details.
    at qG (/$bunfs/root/chunk-gt0me4ve.js:469:625)
    at <anonymous> (/$bunfs/root/chunk-gt0me4ve.js:469:6032)
    at processTicksAndRejections (native:7:39)
```


### Plugins

_No response_

### OpenCode version

(version: 1.14.49)

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #27528 — ACP: prompt starting with "/" is silently dropped if command name is not recognized

📅 `2026-05-14` | ✏️ **alovar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27528](https://github.com/anomalyco/opencode/issues/27528)


### Description

When a prompt is sent via ACP and the text starts with /, OpenCode parses it as a slash command. If the command is not found in the command list and is not a built-in    
  (e.g. /compact), the prompt is silently dropped — no response is returned, no error is reported, stopReason: "end_turn" is returned as if everything is fine.
                                                                                                                                                                            
  Root cause (from packages/opencode/src/acp/agent.ts):                                                                                                                     
   
  const cmd = (() => {                                                                                                                                                      
    const text = parts                                                                                                                                                      
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)                                                                                                                                                   
      .join("")                                                                                                                                                           
      .trim()
                     

> *[Truncado — 6767 chars totais]*

---

## #27519 — fix(provider): classify "tokens in request more than max tokens allowed" as context overflow

📅 `2026-05-14` | ✏️ **EZotoff** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27519](https://github.com/anomalyco/opencode/issues/27519)


### Description

The error message `"tokens in request more than max tokens allowed"` (returned by some OpenAI-compatible providers) is not classified as a context overflow error. It does not match any existing pattern in `OVERFLOW_PATTERNS` in `packages/opencode/src/provider/error.ts`, so it falls through as a generic API call error.

### Observed Behavior

When a session exceeds the model's context window and the provider returns this error:
1. The error is classified as a generic `APICallError` (not `ContextOverflowError`)
2. Auto-compaction is **not** triggered — the processor receives a non-overflow error
3. The session enters a retry loop (continuation doom loop): retry → same overflow error → retry → ...
4. No compaction occurs, so the session cannot recover
5. The user sees repeated failures with no recovery path

### Expected Behavior

This error should be classified as `context_overflow`, which would:
1. Trigger auto-compaction to reduce context size
2. Allow the session to recover and continue
3. Avoid the infinite retry loop

### Error Text

```
tokens in request more than max tokens allowed
```

This exact text is returned by some OpenAI-compatible providers when the total token count (input + requested output) exceeds the model's context window.

### Affected Providers

Any OpenAI-compatible provider that returns this error phrasing instead of the more common `maximum context length is X tokens` or `context_length_exceeded` patterns. This includes some self-host

> *[Truncado — 3096 chars totais]*

---

## #27500 — ACP: _meta.systemPrompt from session/new not forwarded to session.prompt

📅 `2026-05-14` | ✏️ **dongdada29** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27500](https://github.com/anomalyco/opencode/issues/27500)


### Description

When using the ACP bridge, clients can send `params._meta.systemPrompt` on `session/new`. That value was never forwarded into later `prompt` handling, so `sdk.session.prompt` did not receive `system` and the custom system prompt was effectively dropped.

### Steps to reproduce

1. Open an ACP session with `session/new` including `_meta.systemPrompt` (string or `{ append }`).
2. Send a normal user `prompt` (not a slash command).
3. Observe that the downstream prompt path does not include the client system prompt.

### Expected

The optional system prompt from `session/new` should be passed as `system` on non-slash `session.prompt` calls (ACP bridge state only, not persisted as a separate OpenCode session field).

### Plugins

(none required for repro)

### OpenCode version

dev / ACP path

### Operating System

any

### Terminal

n/a

---

## #27493 — Error from provider: Model not found, inaccessible, and/or not deployed

📅 `2026-05-14` | ✏️ **philcbu** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27493](https://github.com/anomalyco/opencode/issues/27493)


### Description

This shows for MiniMax M2.5 in Opencode Zen. Using the free MiniMax M2.5 just hangs forever with no errors. 

Was working about an hour ago though?

### Plugins

_No response_

### OpenCode version

1.14.50

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Debian 12

### Terminal

Terminator

---

## #27474 — TypeError: Failed to fetch

📅 `2026-05-14` | ✏️ **QFinn-Penguin** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27474](https://github.com/anomalyco/opencode/issues/27474)


### Description

点击explore或者是智能体的时候，如果没跳到子agent里面的话，就会报错：
TypeError: Failed to fetch
    at fetch (oc://renderer/assets/main-DlaiLIQY.js:102686:45)
    at request (oc://renderer/assets/main-DlaiLIQY.js:58972:24)
    at async retry (oc://renderer/assets/main-DlaiLIQY.js:63575:14)
    at async fetchMessages (oc://renderer/assets/main-DlaiLIQY.js:65394:24)
    at async loadMessages (oc://renderer/assets/main-DlaiLIQY.js:65418:7)
    at async Promise.all (index 1)
    at async oc://renderer/assets/main-DlaiLIQY.js:65576:13

### Plugins

_No response_

### OpenCode version

1.14.50

### Steps to reproduce

1.点击Explore或智能体，就会报错，经常会这样

<img width="614" height="184" alt="Image" src="https://github.com/user-attachments/assets/b66e3a0d-3967-4031-8b70-fb096b4fa0e6" />

<img width="1566" height="1042" alt="Image" src="https://github.com/user-attachments/assets/1f12a87c-f2a1-4615-abaa-29b79e6fb824" />

### Screenshot and/or share link

_No response_

### Operating System

windows11

### Terminal

_No response_

---

## #27436 — permission required cannot select

📅 `2026-05-14` | ✏️ **1122414** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27436](https://github.com/anomalyco/opencode/issues/27436)


### Description

When I clicked "Allow once", I couldn't click it. When I clicked "Allow always", it kept repeatedly jumping to "Always allow", and when I clicked "Reject", I couldn't submit the content in "Tell Opencode what to do differently", causing the session to get stuck here. Moreover, even after I directly closed the VSCode Opencode plugin, it still showed in the "Operation Env" and I couldn't continue the operation.
<img width="1443" height="273" alt="Image" src="https://github.com/user-attachments/assets/075ed478-7583-449d-9ecf-0675e16c0938" />

<img width="1399" height="274" alt="Image" src="https://github.com/user-attachments/assets/61e9c0a9-007b-4626-85c0-7c784f8e4f7a" />

<img width="1450" height="277" alt="Image" src="https://github.com/user-attachments/assets/bf5ddf18-2036-446b-a54c-2e8e14e1dba7" />

### Plugins

vscode

### OpenCode version

1.14.48

### Steps to reproduce

The current situation I'm facing is as follows: When opencode attempts to read or write the .env file again and requires permissions, this problem may occur.

### Screenshot and/or share link

_No response_

### Operating System

windows 11

### Terminal

windows terminal

---

## #27431 — [Bug] Tauri v1 migration silently discards all historical session data in workspace .dat files

📅 `2026-05-14` | ✏️ **enjoyless** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27431](https://github.com/anomalyco/opencode/issues/27431)


## Bug Description

After upgrading OpenCode to v1.14.48 (Tauri v1 migration), all historical session data was silently lost. The left sidebar in the desktop app shows no conversation history, even though session data exists in the old-format workspace .dat files.

## Root Cause

The Tauri migration process (observed in `main.log`) reads entries from the old Electron storage and writes them to the new JSON-based .dat files. However, **all session entries were skipped during migration** while only workspace-level entries were preserved.

Evidence from migration log:
```
tauri migration: migrated opencode.workspace.Qzpc.vtnkm7.dat -> opencode.workspace.Qzpc.vtnkm7.dat {
  migrated: [],
  skipped: [
    'session:ses_xxx:prompt',
    'session:ses_xxx:comments',
    ... 40+ session entries skipped
  ]
}
```

## Additional Issue: Workspace File Fragmentation

After migration, the same workspace (C:\) has **three separate .dat files**:
- `opencode.workspace.C--.hmddcc.dat` (new active file, ~400 bytes, nearly empty)
- `opencode.workspace.C--.1dj3o45.dat` (older file)
- `opencode.workspace.Qzpc.vtnkm7.dat` (old base64-encoded name, contains all historical session data)

The old session data sits in `Qzpc.vtnkm7.dat` but the app only reads from `C--.hmddcc.dat`, making historical sessions invisible.

## Environment
- OpenCode version: 1.14.48 (Windows x64)
- OS: Windows 11
- Install method: Desktop installer

## Expected Behavior
Session history from before the migration should be pre

> *[Truncado — 2098 chars totais]*

---

## #27417 — Cannot scroll in the Antigravity extension.

📅 `2026-05-14` | ✏️ **UnrealPixel** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27417](https://github.com/anomalyco/opencode/issues/27417)


### Description

I downloaded the open-code extension in Antigravity, and I cannot scroll up in the convo.

### Plugins

_No response_

### OpenCode version

0.0.13

### Steps to reproduce

Talk with any model enough until you can scroll up.

### Screenshot and/or share link

_No response_

### Operating System

Windows

### Terminal

The one that the OpenCode extension opens.

---

## #27414 — Local Server vlocal is disconnected

📅 `2026-05-14` | ✏️ **Y765467347** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27414](https://github.com/anomalyco/opencode/issues/27414)


### Description

In opencode-desktop, use GLM-5.1 with the oh my openagent plug-in. When the agent explores and reads files, the Local Server vlocal will be disconnected, and the automatic connection cannot continue thereafter. It can only be restored after restarting. But after continuing with the previous task, the Local Server vlocal disconnection occurs again, and so on.

### Plugins

oh my openagent

### OpenCode version

1.14.49

### Steps to reproduce

1. In opencode-desktop, use GLM-5.1 with the oh my openagent plug-in.
2. When the agent explores a larger project and reads the files in the project, the Local Server vlocal will be disconnected when reading the files, and the automatic connection cannot continue thereafter. It can only be restored after restarting.
3. After continuing with the previous task, the Local Server vlocal disconnection will occur again, and so on.

### Screenshot and/or share link

<img width="841" height="307" alt="Image" src="https://github.com/user-attachments/assets/1e6ec2f3-7966-4449-9b0c-d915a85a19c6" />

### Operating System

windows 11

### Terminal

windows terminal

---

## #27396 — MCP tool names with hyphens are inaccessible when using a remote-hosted session (underscore/hyphen mismatch)

📅 `2026-05-13` | ✏️ **wooldridger** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27396](https://github.com/anomalyco/opencode/issues/27396)


### Description

Bug Description: When using the OpenCode desktop app with a remote MCP server that advertises tool names containing hyphens (e.g., documents-get-by-id), OpenCode registers them as shortcut_documents-get-by-id (server name + underscore + hyphen-preserving tool name). However, the system prompt injected by the server-side session defines those tools with all underscores (shortcut_documents_get_by_id). The model calls the underscore form, which doesn't match any registered tool, and every call routes to the invalid handler.

Root cause:
In `out/main/chunks/node-BP-tJ87t.js`:

```
sanitize2 = (s) => s.replace(/[^a-zA-Z0-9_-]/g, "_")  // hyphens preserved
// tool registered as:
sanitize2(clientName) + "_" + sanitize2(mcpTool.name)
// = "shortcut_documents-get-by-id"
```
The server-side system prompt defines the same tool as shortcut_documents_get_by_id (all underscores). The two names never match.

Reproduction:
Configure a remote MCP server whose tools use hyphens (e.g., https://mcp.shortcut.com/mcp)
Start a session in the desktop app
Ask the model to call any of those tools
Every call routes to invalid
Expected behavior: Tool names should be normalized consistently between what OpenCode registers locally and what the server-side session injects into the system prompt — either both use hyphens or both use underscores.

Workaround: Call the Shortcut REST API directly via curl in bash, bypassing the MCP tools entirely.

### Plugins

None

### OpenCode version

1.14

> *[Truncado — 2090 chars totais]*

---

## #27380 — TUI session messages stay stale after reconnect

📅 `2026-05-13` | ✏️ **jeremyakers** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27380](https://github.com/anomalyco/opencode/issues/27380)


### Description

The TUI can keep rendering stale session messages after the global event stream reconnects.

`SyncProvider` caches fully synced sessions in `fullSyncedSessions`. Normal `message.updated` and `message.part.updated` events keep the local store current while the event stream is connected. If the stream disconnects, the server restarts, or the client otherwise misses live message events, the newer messages can be persisted and visible through REST while the existing TUI session view still uses the old local store. On `server.connected`, the current TUI sync path does not force a REST backfill for sessions already marked fully synced, so `sync.session.sync(sessionID)` returns early and the missing messages stay hidden until the TUI is reloaded or the state is otherwise rebuilt.

Expected behavior: when the event stream reconnects, the TUI should refresh already-known sessions from REST so messages missed during the gap are displayed.

### Plugins

None required.

### OpenCode version

`dev` as of `c197fd92b` (`origin/dev` on 2026-05-13).

### Steps to reproduce

1. Open a TUI session and allow it to fully sync.
2. Interrupt or miss the global event stream, then persist additional messages for that same session while the TUI does not receive the live message events.
3. Let the event stream reconnect so the TUI receives `server.connected`.
4. Observe that REST/session storage contains the new messages, but the existing TUI message list remains stale because the sess

> *[Truncado — 1640 chars totais]*

---

## #27379 — MCP execute fails on local servers with "contextFn is not a function"

📅 `2026-05-13` | ✏️ **xx1196** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27379](https://github.com/anomalyco/opencode/issues/27379)


### Description

Summary
The OpenCode MCP client successfully discovers tools from local MCP servers defined with type: "local" and a command array, but any attempt to execute those tools via execute fails with:
Error: contextFn is not a function
Tool ID <server-name> not found. Available tools:
This completely blocks the use of local MCP servers, which are essential for our development workflow.
---
Environment
- OS: Windows (win32)
- OpenCode version: Latest 1.14.48
- MCP Server: @nullplatform/mcp-api (npm package, v1.0.0)
- Node.js runtime: v24.13.0
---
Configuration
File: file:///c:/Users/xx1196/.config/opencode/opencode.json
{
"mcp": {
"nullplatform": {
"command": ["npx", "-y", "@nullplatform/mcp-api"],
"type": "local",
"enabled": true,
"environment": {
"NP_API_KEY": "<jwt-token>"
}
}
}
}
---
## Steps to Reproduce
1. Add an MCP server entry with `type: "local"` and a `command` array in `opencode.json`
2. Restart OpenCode session
3. Call `nullplatform_discover` — **succeeds**, returns list of available tools with `toolId: "js"`
4. Call `nullplatform_execute` — **fails** with `contextFn is not a function` and `Tool ID nullplatform not found`
---
Observed Behavior
Operation	Status	Detail
discover	✅ Works	Returns full tool list with toolId="js" and 180+ methods
execute	❌ Fails	Returns "contextFn is not a function" and "Tool ID not found"
Direct REST API (Invoke-RestMethod)	✅ Works	Same endpoint logic works perfectly outside MCP client
---
## Diagnosis
The issue is **not** wi

> *[Truncado — 3616 chars totais]*

---

## #27374 — [BUG]: Empty function.name in tool objects breaks strict providers via CLAUDE_CODE_SIMPLE=1

📅 `2026-05-13` | ✏️ **PursuitOfDataScience** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27374](https://github.com/anomalyco/opencode/issues/27374)


## Description

When `CLAUDE_CODE_SIMPLE=1` is set and requests are proxied through OpenCode's `/v1/chat/completions` endpoint, Claude Code sends tool definitions with empty `function` objects (`{"type": "function", "function": {}}`). OpenCode forwards these to upstream providers unchanged. Providers with strict validation (DeepSeek, Nvidia) reject the request with:

```
tools[0].function: missing field `name`
```

Other providers (e.g. Minimax) accept the empty object silently.

## Reproduction

1. Set environment:
   ```
   export ANTHROPIC_BASE_URL="https://opencode.ai/zen"
   export ANTHROPIC_AUTH_TOKEN="<opencode-key>"
   export CLAUDE_CODE_SIMPLE=1
   export ANTHROPIC_MODEL="deepseek-v4-flash-free"
   ```

2. Run Claude Code and send any query that triggers a tool call (e.g. "what can you do?")

3. Observe 400 error from OpenCode with empty `function.name` validation failure.

   Same test with `minimax-m2.5-free` succeeds without error.

## Expected behavior

OpenCode should either:
- Strip or normalize invalid tool definitions before forwarding to providers
- Gracefully degrade tool support for models/providers that cannot handle them
- At minimum, return a clearer error message identifying the root cause

## Environment

- Proxy URL: `https://opencode.ai/zen/v1/chat/completions`
- Affected models: any model routed through DeepSeek or Nvidia providers
- Working model example: `minimax-m2.5-free`
- Header used: `Authorization: Bearer <token>` via `CLAUDE_CODE_SIMPLE=1`

> *[Truncado — 1629 chars totais]*

---

## #27373 — Stale background subagents persist in UI after session restart/compaction

📅 `2026-05-13` | ✏️ **fruch** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27373](https://github.com/anomalyco/opencode/issues/27373)


## Description

Background subagents (e.g. `librarian`, `explore`) that were launched in a previous session context (before compaction or restart) persist in the UI's "Subagentes" panel as running tasks indefinitely. They cannot be cleared.

## Steps to Reproduce

1. Start a session and launch background subagents (e.g. `task(subagent_type="librarian", run_in_background=true, ...)`)
2. Session gets compacted (context reset) or OpenCode is restarted
3. The subagent entries remain visible in the UI sidebar showing "running" state
4. `background_cancel(all=true)` returns "No running or pending background tasks to cancel"
5. Restarting OpenCode does not clear them

## Expected Behavior

- Stale subagent entries should be cleared on session restart or compaction
- Or: provide a CLI command like `opencode session clear-tasks <sessionID>` to manually clear them
- Or: the UI should detect orphaned tasks and remove/mark them as stale

## Actual Behavior

The UI shows ghost entries forever:
```
▼ Subagentes
  [ ] Research regional MIGs (librarian) ↳ 23:36:01
  [ ] Find GCE aggregated machineType… (librarian) ↳ 23:38:48
```

These are not actually running — they're leftover references from a pre-compaction context that no longer exists.

## Environment

- OpenCode version: 0.6.1
- OS: Linux

---

## #27361 — [BUG] Model `options` (reasoning/thinking) not forwarded to API for `@ai-sdk/openai-compatible` providers in headless mode

📅 `2026-05-13` | ✏️ **R8CEH** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27361](https://github.com/anomalyco/opencode/issues/27361)


### Description
When using a custom `@ai-sdk/openai-compatible` provider with model-specific `options` (e.g. `reasoning.effort` for OpenRouter), the options are silently ignored and never sent to the API. This affects all headless usage (`opencode run --format json`) and makes it impossible to enable extended thinking/reasoning for any custom provider model.

## Environment

- OpenCode version: `1.14.48`
- OS: Ubuntu 24.04 LTS
- Mode: headless (`opencode run --format json`)
- Provider: OpenRouter via `@ai-sdk/openai-compatible`
- Model: `qwen/qwen3.6-plus`

## Steps to Reproduce

**1. Create config with reasoning options:**

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "openrouter": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "https://openrouter.ai/api/v1",
        "name": "Openrouter"
      },
      "models": {
        "qwen/qwen3.6-plus": {
          "options": {
            "reasoning": { "effort": "high" }
          }
        }
      }
    }
  }
}
```

**2. Run in headless mode:**

```bash
OPENCODE_CONFIG=/tmp/test_thinking.json \
OPENROUTER_API_KEY=sk-or-v1-... \
opencode run \
  --model openrouter/qwen/qwen3.6-plus \
  --format json \
  --dangerously-skip-permissions \
  "explain recursion briefly"
```

**3. Observe output:**

```json
{"type":"step_start",...}
{"type":"text","part":{"text":"Recursion is..."}}
```

Model responds instantly with no reasoning — `reasoning.effort: high` was not sent to t

> *[Truncado — 4200 chars totais]*

---

## #27319 — [Bug] Long conversations hang - session/message endpoint regression v1.14.x

📅 `2026-05-13` | ✏️ **Canahmetozguven** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27319](https://github.com/anomalyco/opencode/issues/27319)


### Bug Description

Long conversations hang indefinitely. After ~20-30 messages, the session/message endpoint stops responding or returns malformed data, causing ACP clients (OpenChamber, OpenWork) to hang.

### Environment

- **OpenCode version**: 1.14.46 (latest tested, also fails on 1.14.48)
- **OS**: Arch Linux (cachyos)
- **Bun version**: 1.3.13

### Steps to reproduce

1. Use OpenCode via ACP client (e.g. OpenChamber) for an extended conversation
2. After ~20-30 messages, the response stops
3. Client shows spinning/loading indefinitely or silent failure
4. Direct TUI use of the same session works fine

### Root cause

- Silvenga (user on openchamber/openchamber#1202) investigated the code directly and confirmed: "The session/{session}/message endpoint is handled by OpenCode — OpenCode has had a few changes to that endpoint"
- The regression appears to have started around v1.2.26: "Replace Bun shell with direct spawn calls in core flows" (#27310)
- v1.14.46 included a partial fix for numeric HTTP API query parameters for session endpoints, but it did NOT fully resolve the issue
- Multiple users on #1202 (openchamber repo) confirm it still fails on 1.14.46 and 1.14.48

### What might help (from changelog analysis)

v1.14.46 had these session/message fixes:
- Fixed numeric HTTP API query parameters in the generated OpenAPI spec and SDK for session and file endpoints
- Tolerated legacy stored numeric values in sessions, diffs, and retry events
- Fixed old sessions with neg

> *[Truncado — 1868 chars totais]*

---

## #27306 — 没有opencode go provider

📅 `2026-05-13` | ✏️ **dlqqdl** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27306](https://github.com/anomalyco/opencode/issues/27306)


### Description

<img width="642" height="206" alt="Image" src="https://github.com/user-attachments/assets/ceaa6a1c-a125-41fa-9e1f-258c271272cf" />

<img width="1242" height="314" alt="Image" src="https://github.com/user-attachments/assets/bfee7f89-1a1a-4c9d-aea2-459cdb33c9d4" />

<img width="962" height="597" alt="Image" src="https://github.com/user-attachments/assets/356a1a44-2bf3-4805-8558-eac6ef49ff3d" />

我有go订阅，但是没有opencode go provider选项

### Plugins

无

### OpenCode version

v1.14.48


### Steps to reproduce

打开opencode桌面版或者open code cli

### Screenshot and/or share link

如上
### Operating System

macOS m3
  
### Terminal

app

---

## #27305 — Webfetch tool still fails with "HTMLRewriter is not defined" on HTML responses

📅 `2026-05-13` | ✏️ **alfep** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27305](https://github.com/anomalyco/opencode/issues/27305)


### Description

## Description
Webfetch tool still throws `HTMLRewriter is not defined` when fetching pages that return `text/html`. Works for JSON and markdown format on some sites, but fails on raw HTML responses.

## Steps to Reproduce
1. Use webfetch tool with `format: "text"` on any HTML page (e.g., https://example.com)
2. See error: `HTMLRewriter is not defined`

## Expected Behavior
Webfetch should return page content in the requested format regardless of content type.

## Actual Behavior
Returns `HTMLRewriter is not defined` error for HTML responses.

## Environment
- OpenCode version: 1.14.48 (via Bun global install)
- Running on: Windows (Bun runtime)
- Model: deepseek-v4-flash-free

## Additional Context
- Google.com works in `markdown` format but `example.com` fails in `text` format
- API/JSON responses work fine
- Related to existing issue #22104

### Plugins

not using plugin

### OpenCode version

OpenCode Desktop v1.14.48

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

windows 11

### Terminal

powershell 7

---

## #27299 — [BUG]: TUI ignores config model setting on startup due to race condition in fallbackModel

📅 `2026-05-13` | ✏️ **soheily98** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27299](https://github.com/anomalyco/opencode/issues/27299)


## Description

When `model` is set in `opencode.json` (e.g. `"model": "ai-gateway/anthropic/claude-opus-4-6"`), the TUI ignores it on startup and instead defaults to a different model determined by `provider_default` (typically `gemini-3-pro-preview`).

The CLI/headless mode correctly uses the configured model. Only the TUI is affected.

## Steps to reproduce

1. Set `"model": "ai-gateway/anthropic/claude-opus-4-6"` in `~/.config/opencode/opencode.json`
2. Ensure the provider has multiple models including Gemini variants
3. Start OpenCode in TUI mode: `opencode`
4. Observe the model shown in the footer — it shows Gemini 3 Pro Preview instead of Opus 4.6

## Expected behavior

The TUI should display and use the model specified in the config file, matching the behavior of the CLI/headless mode.

## Root cause

In `packages/opencode/src/cli/cmd/tui/context/local.tsx`, the `fallbackModel` memo resolves immediately on mount, but its data sources are async:

- `sync.data.config.model` is populated via the server sync bootstrap (async)
- `modelStore.recent` is loaded from `model.json` via `Filesystem.readJson` (async)

Before either loads, the memo falls through to `sync.data.provider_default[provider.id]`, which uses the `sort()` priority array. Since `gemini-3-pro` ranks highest in that array, any provider with a Gemini 3 Pro model gets it selected as the default.

The server-side `defaultModel()` in `provider.ts` does not have this issue because it reads `cfg.model` synchronousl

> *[Truncado — 1600 chars totais]*

---

## #27297 — After an MCP is added to the /mcp Post interface, the interface returns a success message and the MCP status is displayed as connected. However, the MCP cannot be queried using the /mcp Get interface.

📅 `2026-05-13` | ✏️ **wo1c** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27297](https://github.com/anomalyco/opencode/issues/27297)


### Description

Use this api to add an MCP.
curl -X POST \
  'http://xx.xx.xx.xx:4096/mcp?directory=%2F' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: c7dbd5af-25c6-48f8-9df6-b20213f42227' \
  -H 'cache-control: no-cache' \
  -d '{
  "name": "DTS",
  "config" : {
      "type": "remote",
      "url": "http://xx.xx.xx.xx:xxxx/remote-mcp/mcp/dts",
      "enabled": true
  }
}'

The response body is as follows:
{
    "DTS": {
        "status": "connected"
    }
}

But use this api to query

curl -X GET \
  'http://xx.xx.xx.xx:4096/mcp?directory=%2F' \
  -H 'Postman-Token: 2399575b-5c2f-456e-b985-144242776188' \
  -H 'cache-control: no-cache'

The response body is as follows:
{}

### Plugins

_No response_

### OpenCode version

OpenCode Desktop v1.14.29

### Steps to reproduce

Just pick any available MCP, first call the add interface, then call the query interface, and you will find that the add interface successfully added the item, but the query interface shows nothing.

I found that not only the interface for dynamically adding MCPs, but also the interface for dynamically adding configurations seems to be faulty. When I used the patch /config interface to modify the configuration and the get /config interface to query the configuration, the patch command was successfully executed, but the get command returned no changes.

### Screenshot and/or share link

_No response_

### Operating System

Linux no-del-z00925108-0001 5.15.0-161-generic #171-Ubuntu SMP Sat O

> *[Truncado — 1583 chars totais]*

---

## #27286 — [Workspaces/UX] Session list silently filtered when inside workspace context

📅 `2026-05-13` | ✏️ **jamesmurdza** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27286](https://github.com/anomalyco/opencode/issues/27286)


### Description

## Description

When inside a workspace context, the `/sessions` list is automatically filtered to only show sessions belonging to that workspace. This filtering happens silently with no visual indication, causing users to lose track of sessions they know exist.

While a toggle command exists in the command palette (`app.toggle.session_directory_filter`), users don't know:
1. That filtering is active
2. That this toggle exists
3. How to find it

## Suggested Fixes

### Option A: Add visual indicator when filtering is active

In the session list dialog, show something like:
```
Sessions (filtered to current workspace)  [Press X to show all]
```

### Option B: Add "Show all sessions" option in session list

**Location:** `packages/opencode/src/cli/cmd/tui/component/dialog-session-list.tsx`

Add an action to the session list dialog:
```typescript
{
  command: "session.show_all",
  title: "show all",
  onTrigger: () => {
    kv.set("session_directory_filter_enabled", false)
    sync.session.refresh()
  },
}
```

### Option C: Don't filter by default

Change the default from `true` to `false`:
```typescript
if (!kv.get("session_directory_filter_enabled", false)) return { scope: "project" }
```

## Workaround

Open the command palette and search for "session directory filter" to toggle filtering off.

## Context

This issue was identified during development of the Daytona OpenCode plugin: https://github.com/daytonaio/daytona/pull/4504

### Plugins

_No response_

#

> *[Truncado — 1905 chars totais]*

---

## #27285 — [Workspaces] Plugins cannot log to OpenCode's log system

📅 `2026-05-13` | ✏️ **jamesmurdza** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27285](https://github.com/anomalyco/opencode/issues/27285)


### Description

## Description

Plugins cannot write to OpenCode's log files. The TUI plugin runtime has internal logging, but this is not exposed to plugin authors. Plugins can only use `console.log/warn/error`, which appears briefly in the terminal before the TUI takes over and is not captured in OpenCode's log files.

This makes debugging plugin issues extremely difficult, especially for workspace adapter plugins.

## Current Behavior

The plugin runtime has its own logging:

```typescript
// runtime.ts lines 117, 124-135
const log = Log.create({ service: "tui.plugin" })

function fail(message: string, data: Record<string, unknown>) {
  log.error(text, next)
  console.error(`[tui.plugin] ${text}`, next)  // Goes to stderr, lost when TUI starts
}

function warn(message: string, data: Record<string, unknown>) {
  log.warn(message, data)
  console.warn(`[tui.plugin] ${message}`, data)
}
```

But plugins themselves have no access to `Log.create()` or any logging API.

## Impact

* Debugging plugin issues is extremely difficult
* Users who don't run OpenCode from a terminal never see `console.*` output
* Plugin authors can't provide diagnostic information for troubleshooting
* Workspace adapter errors (e.g., connection failures) are invisible
* Makes it harder to diagnose issues like missing environment variables

## Suggested Fix

**Location:** `packages/opencode/src/cli/cmd/tui/plugin/runtime.ts`

Expose a logging API to plugins via the plugin input/context:

```typescript
/

> *[Truncado — 3263 chars totais]*

---

## #27283 — [Workspaces] TUI hangs with blank screen when resuming session belonging to remote workspace

📅 `2026-05-13` | ✏️ **jamesmurdza** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27283](https://github.com/anomalyco/opencode/issues/27283)


### Description

## Description

When resuming an existing session that belongs to a remote workspace, the TUI freezes with a blank screen. The user can only exit with Ctrl+C.

## Root Cause

**Location:** `packages/opencode/src/server/routes/instance/httpapi/middleware/workspace-routing.ts`

Race condition in workspace routing middleware. The middleware immediately returns a 503 error if `isSyncing()` is false, with no retry or wait logic:

```typescript
// workspace-routing.ts lines 108-113
const syncing = yield* Workspace.Service.use((svc) => svc.isSyncing(workspace.id))
if (!syncing) {
  return HttpServerResponse.text(`broken sync connection for workspace: ${workspace.id}`, {
    status: 503,
  })
}
```

**Timeline of the race condition:**
1. OpenCode starts → TUI loads
2. TUI sees session belongs to workspace X → starts connecting (async)
3. TUI loads session data → requests routed to workspace X
4. Middleware checks `isSyncing()` → **false** (sync not established yet) → returns 503
5. TUI doesn't handle 503 gracefully → blank screen

The workspace syncing is initiated via `startWorkspaceSyncing()` when the client connects to the event stream, but TUI requests can arrive before this completes.

## Suggested Fix

Add a retry/wait mechanism before returning 503:

```typescript
// workspace-routing.ts
const syncing = yield* Workspace.Service.use((svc) => svc.isSyncing(workspace.id))
if (!syncing) {
  // Wait up to 5 seconds for sync to establish
  yield* Effect.sleep("5 sec

> *[Truncado — 2552 chars totais]*

---

## #27259 — [Bug] Web: MCP server switch not update when toggle

📅 `2026-05-13` | ✏️ **samnyan** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27259](https://github.com/anomalyco/opencode/issues/27259)


### Description

When toggle the MCP server on opencode web, the switch status is not updating on the latest version.
It does send the api request to `mcp/<mcp-name>/disconnect` when clicking, but it never call `
/mcp?directory=<dir>` so the UI is not updating. But it will show the correct status when refresh

<img width="366" height="156" alt="Image" src="https://github.com/user-attachments/assets/27f270e5-57db-4ee7-8256-6345bf325031" />

### Plugins

_No response_

### OpenCode version

1.14.48

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #27210 — [Bug] GPT OSS 120B subagent stops mid-reasoning and returns empty result after several tool calls

📅 `2026-05-13` | ✏️ **smithyyang** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27210](https://github.com/anomalyco/opencode/issues/27210)


### Description

When using **GPT OSS 120B** (OpenAI open-weight reasoning model, 117B) as a subagent via the `task` tool, the subagent executes tool calls correctly for several iterations, but then during a subsequent `<think>` reasoning step it stops abruptly and exits, returning an empty result to the orchestrator.

The subagent session log shows the model produced a valid text response after the tool calls, but the orchestrator receives an empty `<task_result>`. 

Key observations:
- The subagent successfully calls tools (read, bash, edit, etc.) for the first 2-3 rounds
- During a subsequent reasoning (`<think>`) step, execution halts
- The orchestrator receives empty result
- The model's reasoning tokens may interfere with the subagent result capture, similar to the mechanism in #18423

### Plugins

opencode-dcp

### OpenCode version

latest

### Steps to reproduce

1. Configure GPT OSS 120B as a subagent (via openai-compatible provider or ollama)
2. From the main session, delegate a multi-step task via `task` tool to the GPT OSS 120B subagent
3. Let the subagent execute 2-3 tool calls (read files, run commands, etc.)
4. Observe that after the tools execute, during the model's next reasoning step, execution halts
5. The orchestrator receives empty/void result

### Screenshot and/or share link

_No response_

### Operating System

Linux

### Terminal

_No response_

---

## #27091 — [Bug]: Billing issue when switching models mid-session

📅 `2026-05-12` | ✏️ **camphor-h** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27091](https://github.com/anomalyco/opencode/issues/27091)


### Description

After using a paid model for a while, I switched to the free model provided by OpenCode itself, only to find that the original billing figure displayed kept decreasing instead of staying unchanged. I suspect this might be a bug in the cost tracking.

### Plugins

No

### OpenCode version

1.14.48

### Steps to reproduce

1.Use the paid model and do some work
2.Switch to the free model and continue current session
3.Observe the $[NUMBER]

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Terminal

---

## #27079 — MCP tools being called with incorrect escaping for parameters

📅 `2026-05-12` | ✏️ **lowlyocean** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/27079](https://github.com/anomalyco/opencode/issues/27079)


### Description

After recent OpenCode updates, Qwen 3.6 35B-A3B now encounters the following:

```
The webfetch tool was called with invalid arguments: SchemaError(Expected "text" | "markdown" | "html", got "\"markdown\""
  at ["format"]).
Please rewrite the input so it satisfies the expected schema.
```

Another example: https://github.com/marekrost/mcp-server-spreadsheet/issues/3

### Plugins

_No response_

### OpenCode version

dev

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

WSL

### Terminal

_No response_

---

## #27051 — MCP toolCount varies with cwd despite byte-identical server response

📅 `2026-05-12` | ✏️ **AndriGitDev** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27051](https://github.com/anomalyco/opencode/issues/27051)


## Summary

`opencode mcp list` and the live TUI report a different `toolCount` for the **same MCP server** depending on the cwd of the `opencode` process. The MCP server's raw `tools/list` JSON-RPC response is byte-identical in both cases, so the filtering happens inside OpenCode after the handshake.

The dropped tools are genuinely unreachable to the model — verified by an `opencode run` from the "low-count" cwd where the model substituted a different tool because the one I asked for wasn't in its list.

## Reproduction

OpenCode `1.14.48` on Linux (Node 24, Bun-bundled binary).

MCP server: [memento-vault](https://github.com/sandsower/memento-vault) `4.1.0`, exposing 11 tools. Equivalent reproductions should be possible with any MCP server that exposes a moderately rich tool list.

```bash
# Tool list as seen by the MCP protocol — count is 11.
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"p","version":"1"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | PYTHONPATH=~/.claude/hooks /path/to/venv/bin/python -m memento \
  | jq '.result.tools | length'
# → 11

# What OpenCode counts depends on cwd:
(cd /home/me/code/forks/memento-vault && opencode mcp list --print-logs --log-level INFO 2>&1 | grep -oE 'toolCount=[0-9]+')
# → toolCount=11

(cd /tmp && opencode mcp list --print-logs --log-level INFO 2>&1 | grep -oE 'toolCount=[0-9]

> *[Truncado — 3015 chars totais]*

---

## #27048 — all my local session `time_updated` is updating

📅 `2026-05-12` | ✏️ **althafdemiandra** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27048](https://github.com/anomalyco/opencode/issues/27048)


### Description

all my local sessions `time_updated` row is updated to today and i dont know why, because updating 412 session today is clearly not what i am doing (that i know of)
i have around 412 session created far from 2 months ago
but somehow the all rows column `time_updated` is updating to today messing up with `stats` cli

i know the session `time_updated` is [autoupdating with Drizzle](https://github.com/anomalyco/opencode/blob/6d95f0d14cbd83fc8b7775f77ba39ab2881008f3/packages/opencode/src/storage/schema.sql.ts#L9), but i dont know what kind of operation trigger row change to all session row

tried querying the session result
```sql
select time_updated from "session" group by time_updated;
```
resulted in 26 time_updated from 412 session
```
1778577444661
1778577444662
1778577444663
1778577444664
1778577444665
1778577444666
1778577444697
1778577444698
1778577444699
1778577444700
1778577444701
1778577444732
1778577444733
1778577444734
1778577444735
1778577444736
1778577444792
1778577444793
1778577444794
1778577444795
1778577444796
1778577444820
1778578298824
1778579125648
1778579447416
1778580033077
```

<img width="800" height="484" alt="Image" src="https://github.com/user-attachments/assets/99b958f9-b95e-471d-97c9-0366ada55a59" />

thanks!

### Plugins

open-cursor, opencode-notifier, opencode-md-table-formatter

### OpenCode version

0.0.0-beta-202605120756

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating Syst

> *[Truncado — 1535 chars totais]*

---

## #27035 — command config requires template when overriding only model, contradicting docs

📅 `2026-05-12` | ✏️ **tobiastornros** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27035](https://github.com/anomalyco/opencode/issues/27035)


### Description

The [command model override docs](https://opencode.ai/docs/commands/#model) show that you can override just the `model` for a built-in command in `opencode.json`:
```json
{
  "command": {
    "analyze": {
      "model": "anthropic/claude-3-5-sonnet-20241022"
    }
  }
}
```

However, this fails at startup with:
`
Configuration is invalid at /path/to/.opencode/opencode.jsonc
↳ Missing key command.commit.template
`
Root cause
In packages/opencode/src/config/command.ts, the ConfigCommand.Info schema defines template as a required field:
```ts
export const Info = Schema.Struct({
  template: Schema.String,          // <-- required
  description: Schema.optional(Schema.String),
  agent: Schema.optional(Schema.String),
  model: Schema.optional(ConfigModelID),
  subtask: Schema.optional(Schema.Boolean),
})
```

This schema is used both for defining new commands (where template is needed) and for partially overriding built-in commands in JSON config (where only model should suffice). Since the JSON config is validated against this schema before merging with markdown-loaded commands, partial overrides fail.
Related

This is the same class of bug as #23861 (LSP command field required when overriding only env).

### Plugins

No plugins

### OpenCode version

1.14.28

### Steps to reproduce

1. Add to .opencode/opencode.jsonc:
```json 
{
  "$schema": "https://opencode.ai/config.json",
  "command": {
    "commit": {
      "model": "anthropic/claude-4-6-sonnet"
    }
  }
}


> *[Truncado — 1798 chars totais]*

---

## #26989 — The main interface is ugly with a long model name

📅 `2026-05-12` | ✏️ **tamlok** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26989](https://github.com/anomalyco/opencode/issues/26989)


### Description

When the model name becomes long, it does not get collapsed properly. It looks weird.

<img width="1229" height="675" alt="Image" src="https://github.com/user-attachments/assets/b710d5be-3d67-40e7-9380-dab38caaf7e2" />

### Plugins

OhMyOpenagent

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26960 — TUI session list empty despite sessions existing in database

📅 `2026-05-12` | ✏️ **tslui** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26960](https://github.com/anomalyco/opencode/issues/26960)


## Description
Sessions are stored in the database but do not appear in the TUI session list. The CLI `opencode session list` shows all sessions correctly.

## Steps to Reproduce
1. Create sessions in a project directory
2. Open OpenCode TUI in same directory
3. Check session list (empty or missing sessions)

## Expected Behavior
All saved sessions should appear in TUI session list.

## Actual Behavior
Session list in TUI shows no sessions (or is missing sessions).

## Workaround
CLI works correctly:
- `opencode session list` — shows all sessions
- `opencode -s <session_id>` — can resume session

## Environment
- OS: macOS
- Shell: zsh

## Additional Context
- Database at `~/.local/share/opencode/opencode.db` contains 334 sessions
- Sessions span from Feb 24 to present
- Sessions are visible via CLI but not TUI

---

## #26932 — Bash tool always returns "(result.stdout ?? "").split is not a function" - shell subprocess never executes

📅 `2026-05-11` | ✏️ **crdiaz324** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26932](https://github.com/anomalyco/opencode/issues/26932)


### Description

Every bash tool call fails with the following error returned to the LLM:

(result.stdout ?? "").split is not a function. (In '(result.stdout ?? "").split(`\n`)', '(result.stdout ?? "").split' is undefined)

The tool appears to complete instantly (duration=0ms in logs) without actually spawning a shell process. The error suggests the tool result handler is receiving a non-string value for stdout (likely null or an abort object) and failing to parse it.

The error is consistent across all commands, including trivial ones like `echo "hello"`.

### Plugins

_No response_

### OpenCode version

1.14.48

### Steps to reproduce

1. Start OpenCode (TUI or any mode)
2. Ask the LLM to run any bash command (e.g. `echo "hello"` or `git status`)
3. Observe the error: "(result.stdout ?? "").split is not a function"
4. Check logs at ~/.local/share/opencode/log/ — bash tool shows status=completed duration=0, confirming the subprocess never ran

### Screenshot and/or share link

<img width="1950" height="281" alt="Image" src="https://github.com/user-attachments/assets/51c72cd2-4478-4ec9-a847-26e28069da60" />

### Operating System

_No response_

### Terminal

_No response_

---

## #26929 — GET /session/:id/message returns 400 when messages contain format with inline JSON schema

📅 `2026-05-11` | ✏️ **dhshah13** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26929](https://github.com/anomalyco/opencode/issues/26929)


### Description

What happened?

When sending a message via POST /session/:id/prompt_async with a format field:
```
{
  "format": {
    "type": "json_schema",
    "schema": {
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["created", "needs_info"] },
        "summary": { "type": "string" }
      },
      "required": ["status", "summary"]
    },
    "retryCount": 2
  }
}

```

The prompt is accepted (204), the LLM runs and completes successfully. But when calling GET /session/:id/message to retrieve messages, the server returns 400:

```
{"name":"BadRequest","data":{"message":"Expected OutputFormatJsonSchema, got {\"type\":\"json_schema\",\"schema\":{...}}"}}

```

The format field matches the OutputFormatJsonSchema definition in the OpenAPI spec at GET /doc exactly (type, schema, retryCount with additionalProperties: false). The message listing endpoint's deserialization rejects what the prompt endpoint accepted.

This appears to be a regression in the May 10-11 2026 releases that tightened HTTP API validation. The same workflow worked on versions before May 10.

### Plugins

None (using opencode serve as HTTP API server with MCP servers configured via opencode.json)

### OpenCode version

1.14.48

### Steps to reproduce

Steps to reproduce:

1. Start opencode serve --port 4096
2. Create a session: POST /session with {"title": "test"}
3. Send a prompt with format: POST /session/:id/prompt_async with body containing "format": {"type

> *[Truncado — 2014 chars totais]*

---

## #26924 — message.part.updated arrives after message.part.delta

📅 `2026-05-11` | ✏️ **Nifury** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26924](https://github.com/anomalyco/opencode/issues/26924)


### Description

## Bug Description

In opencode, `message.part.updated` can arrive **after** `message.part.delta` for the same
`partID` on the `/event` SSE stream. Subscribers that use `message.part.updated` to register
a part before processing its deltas will encounter a race where a delta arrives first.

## Environment

- **OpenCode version**: tested on v1.14.48
- **Affected path**: `SyncEvent.run` → `Session.updatePart` → bus publish
- **Trigger**: any streaming response that emits text or reasoning parts

## Steps to Reproduce

Connect to the SSE event stream and filter for `message.part.*` events while a prompt is
being processed. Observe that `message.part.delta` events for a given `partID` can appear
before the first `message.part.updated` for that same `partID`.

## Expected Behavior

For each `partID`, `message.part.updated` arrives before any `message.part.delta` with that
same ID:

```
data: {"type":"message.part.updated","properties":{"part":{"id":"prt_abc","type":"text",...}}}
data: {"type":"message.part.delta","properties":{"partID":"prt_abc","field":"text","delta":"..."}}
data: {"type":"message.part.delta","properties":{"partID":"prt_abc","field":"text","delta":"..."}}
```

## Actual Behavior

`message.part.delta` can arrive before `message.part.updated` for the same `partID`:

```
data: {"type":"message.part.delta","properties":{"partID":"prt_abc","field":"text","delta":"..."}}
data: {"type":"message.part.updated","properties":{"part":{"id":"prt_abc","type":"

> *[Truncado — 3091 chars totais]*

---

## #26913 — [DeepSeek DeepInfra] write tool repeatedly passes empty "content"

📅 `2026-05-11` | ✏️ **NameIsHiki** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26913](https://github.com/anomalyco/opencode/issues/26913)


### Description

When using **DeepSeek V4 Flash** via **DeepInfra**, both the `write` and `edit` tools repeatedly receive empty strings in the critical fields (`content`, `newString`).

The model can successfully write simple plain text ("hello world"), but fails as soon as it tries to write or edit content that contains HTML-like tags (`<script>`, `</script>`, etc.). This causes the agent to get stuck in a loop of failed tool calls.

**Additional Observations**

- The model is aware of the problem in its thinking trace and keeps trying again with the same empty fields.
- It sometimes leaks DSML fragments (`｜DSML｜tool_calls>`) in its output.
- Simple plain text works reliably. Any content with angle brackets (`<` / `>`) triggers the issue.

### Plugins

_No response_

### OpenCode version

1.14.48

### Steps to reproduce

1. Start a new OpenCode session with DeepSeek V4 Flash via Deepinfra provider.
2. Ask the agent to create or modify a Svelte component (e.g. testComponent.svelte with a <script> tag).
3. Observe that simple "hello world" writes succeed.
4. When writing actual component code, the model starts generating tool calls with empty content.

### Operating System

Windows 10

### Terminal

Windows Terminal (cmd)

---

## #26911 — OpenCode Go, the model does not support FIM

📅 `2026-05-11` | ✏️ **kanagawa6** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26911](https://github.com/anomalyco/opencode/issues/26911)


### Description

[https://github.com/zed-industries/zed/issues/56379](https://github.com/zed-industries/zed/issues/56379)

- The above is the problem I'm encountering when using the OpenCode Go API with the `edit_predictions` feature of the Zed Editor.
- Could you please help me review the last comment and resolve it?

### Plugins

_No response_

### OpenCode version

v1.14.48

### Steps to reproduce

- Use Zed Editor and OpenCode Go with the following configuration:

```json
{
  "edit_predictions": {
    "allow_data_collection": "no",
    "mode": "subtle",
    "provider": "open_ai_compatible_api",
    "open_ai_compatible_api": {
      "api_url": "https://opencode.ai/zen/go/v1/chat/completions",
      "model": "deepseek-v4-flash",
      "prompt_format": "deepseek_coder"
    }
  },
  "show_edit_predictions": true
}
```

- I used OpenCode Go to reduce the cost of the `edit_predictions` feature in Zed Editor.
- After using it, I received the following error:

```log
2026-05-11T16:52:49+07:00 ERROR [crates/edit_prediction/src/edit_prediction.rs:2213] fim edit prediction failed: custom server error: 400 Bad Request - {"error":{"message":"Error from provider (DeepSeek): Failed to deserialize the JSON body into the target type: missing field `messages` at line 1 column 1335","type":"invalid_request_error","param":null,"code":"invalid_request_error"}}
```

- The programmers at Zed Editor want me to ask the publisher of OpenCode Go.

### Screenshot and/or share link

_No response_

##

> *[Truncado — 1570 chars totais]*

---

## #26910 — tool.execute.before: output.args mutations not propagated to tool execution

📅 `2026-05-11` | ✏️ **gretel** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26910](https://github.com/anomalyco/opencode/issues/26910)


## Summary

Mutating `output.args` in a `tool.execute.before` hook does not affect the tool's actual behavior. The mutation is visible to the plugin code (can read back what was set), but the tool ignores the modified values.

## Steps to reproduce

1. Register a `tool.execute.before` hook
2. In the hook, mutate `output.args` — e.g. set `output.args.model = { providerID: "X", modelID: "Y" }`
3. Observe: the hook can read back the mutation, and side-effects (toasts, logs) work fine
4. Check what the tool actually does — the tool ignores the mutated args and uses defaults

## Expected

Mutations to `output.args` in `tool.execute.before` should propagate to the tool execution. Without this, the hook is effectively read-only — it can observe and notify, but cannot influence tool behavior.

This is a general issue, not specific to any particular field. Any plugin that needs to override tool parameters via this hook will be broken.

---

## #26907 — fix(app): permission prompt remains stuck after approving child session request

📅 `2026-05-11` | ✏️ **donicrosby** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26907](https://github.com/anomalyco/opencode/issues/26907)


## Description

When a child session (subagent) triggers a permission request in the Web UI, approving it via "Allow once" or "Allow always" can leave the permission prompt visible in the composer even after the server has accepted the response.

The server returns `200 true` for the permission reply, and subsequent `GET /permission` calls return an empty array `[]`, confirming the permission was processed. However, the Web UI composer still renders the stale permission prompt until another sync event arrives or the page is refreshed.

## Steps to Reproduce

1. Start OpenCode with Web UI (`opencode serve` and `opencode attach`, or dev mode).
2. Create a session and trigger a subagent or background task that requires a permission (e.g., a bash command with `permission: { bash: "ask" }`).
3. In the parent session composer, observe the permission prompt for the child session.
4. Click "Allow once".
5. Observe that the permission prompt remains visible in the composer, even though the subagent proceeds.

## Expected Behavior

The permission prompt should be removed from the composer immediately after the server confirms the response.

## Actual Behavior

The permission prompt persists in the Web UI composer, creating a stale UI state that may confuse users.

## Environment

- OpenCode version: latest (observed during development)
- Browser: Chrome (via Chrome DevTools MCP during reproduction)
- OS: Linux

## Related

This is a client-side UI state issue. The backend processes the

> *[Truncado — 1980 chars totais]*

---

## #26901 — [BUG] CLI -m flag ignored when resuming session with -s

📅 `2026-05-11` | ✏️ **cdancy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26901](https://github.com/anomalyco/opencode/issues/26901)


## Description

When resuming a session with `-s <sessionID>` and specifying a different model with `-m <model>`, the `-m` flag is silently ignored. The session continues using the model it was originally created with.

CLI flags should take precedence — if a user explicitly passes `-m`, that model should be used regardless of what the session was created with.

## Steps to reproduce

1. Start a session with one model:
   ```bash
   opencode -m github-copilot/claude-opus-4.5
   ```
2. Note the session ID (e.g., `ses_20bd7cb7fffeH1FHHzOjGHrBlh`)
3. Exit and resume with a different model:
   ```bash
   opencode -s ses_20bd7cb7fffeH1FHHzOjGHrBlh -m github-copilot/claude-opus-4.6
   ```
4. Ask the assistant "what model are you using?"

## Expected behavior

The assistant should report `claude-opus-4.6` (the model specified on the command line).

## Actual behavior

The assistant reports `claude-opus-4.5` (the model the session was originally created with). The `-m` flag is silently ignored.

## Verification

We verified that a fresh session correctly uses the specified model:

```bash
opencode run -m github-copilot/claude-opus-4.6 "Write your model ID to /tmp/model-test.txt"
# Results in file contents: github-copilot/claude-opus-4.6
```

This confirms the issue is specific to resuming sessions, not a general model selection problem.

## Suggested fix

Either:
1. **Honor the `-m` flag** when resuming sessions (preferred)
2. **Warn the user** that `-m` is being ignored when combine

> *[Truncado — 1882 chars totais]*

---

## #26882 — Windows: bash tool cannot correctly handle cmd.exe GBK output

📅 `2026-05-11` | ✏️ **rlworkspace** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26882](https://github.com/anomalyco/opencode/issues/26882)


## Bug Report: Windows cmd.exe GBK output displayed as garbled text in bash tool

**Bug Description**:
When executing Windows native commands (via `cmd /c`) or system utilities like `ipconfig` in OpenCode's bash tool on Windows, Chinese characters are displayed as garbled text (mojibake) instead of proper Chinese text.

**Steps to Reproduce**:
1. Open OpenCode on Windows 11
2. Execute the following command in the bash tool:
   ```bash
   cmd /c "echo Windows IP 配置"
   ```
3. Observe the output shows garbled characters instead of proper Chinese text

**Expected Behavior**:
Chinese characters should be displayed correctly.

**Actual Behavior**:
Chinese characters are displayed as garbled text (mojibake), indicating encoding mismatch.

**Technical Details**:

The same command works correctly when executed directly in pwsh 7.6.1 terminal, but fails in OpenCode's bash tool:

| Environment | Command | Result |
|-------------|---------|--------|
| pwsh terminal | `cmd /c "echo Windows IP 配置"` | ✅ Correct |
| OpenCode bash tool | `cmd /c "echo Windows IP 配置"` | ❌ Garbled |
| OpenCode bash tool | `ipconfig` | ❌ Garbled |

Raw byte analysis confirms `ipconfig` outputs GBK (CP936) encoding, which is standard for Windows system commands.

**Root Cause**:
OpenCode's bash tool captures cmd.exe output as raw bytes but processes them with incorrect encoding assumption (expecting UTF-8 instead of detecting GBK). PowerShell 7 correctly uses UTF-8 internally, but the OpenCode rendering layer fa

> *[Truncado — 2334 chars totais]*

---

## #26870 — agent cant use read tool SchemaError(Expected number | undefined, got "2480"  at ["offset"]).

📅 `2026-05-11` | ✏️ **spacewalkingninja** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/26870](https://github.com/anomalyco/opencode/issues/26870)


### Description

```
→ Read AL\alphaLiquidatorV3.py [limit=90, offset=2490]
The read tool was called with invalid arguments: SchemaError(Expected number | undefined, got "2490"
  at ["offset"]).
Please rewrite the input so it satisfies the expected schema.
Thinking: The read tool is rejecting all my offsets. Let me try without the offset parameter and just read larger chunks.
→ Read AL\alphaLiquidatorV3.py [limit=200, offset=2480]
The read tool was called with invalid arguments: SchemaError(Expected number | undefined, got "2480"
  at ["offset"]).
Please rewrite the input so it satisfies the expected schema.
Thinking: The offset parameter is causing issues. Let me try without offset, or use a lower offset.
→ Read AL\alphaLiquidatorV3.py [limit=150, offset=2480]
The read tool was called with invalid arguments: SchemaError(Expected number | undefined, got "2480"
  at ["offset"]).
Please rewrite the input so it satisfies the expected schema.
Thinking: The offset parameter doesn't accept large numbers. Let me try a smaller offset.
→ Read AL\alphaLiquidatorV3.py [limit=150, offset=2400]
The read tool was called with invalid arguments: SchemaError(Expected number | undefined, got "2400"
  at ["offset"]).
Please rewrite the input so it satisfies the expected schema.
Thinking: The offset must be a number, not a string with leading zeros. Let me try 2494.
→ Read AL\alphaLiquidatorV3.py [limit=150, offset=2494]
The read tool was called with invalid arguments: SchemaError(Expected numbe

> *[Truncado — 2507 chars totais]*

---

## #26865 — LSP tool returns generic error when gopls fails to start due to missing Go runtime

📅 `2026-05-11` | ✏️ **LinuxForYQH** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26865](https://github.com/anomalyco/opencode/issues/26865)


### Description

When Go runtime is not installed, `Gopls.spawn()` silently returns `undefined`. The error is swallowed by `lsp.ts`'s `.catch()` handler, and the LLM only sees:

```
No LSP server available for this file type.
```

This gives the LLM no actionable information. It may incorrectly conclude that `.go` files are unsupported, rather than suggesting the user install Go. The same issue occurs when `go install gopls@latest` fails.

### Steps to reproduce

1. Ensure Go is not installed on the system
2. Open a Go project with opencode
3. Ask the LLM to use the `lsp` tool (e.g. goToDefinition) on a `.go` file
4. LLM receives `"No LSP server available for this file type."` with no indication that installing Go would fix the problem

### Operating System

macOS / Linux / Windows (all affected)

---

## #26849 — Ask_user tool window cannot be shrinked

📅 `2026-05-11` | ✏️ **BERZERKCOOLeST** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26849](https://github.com/anomalyco/opencode/issues/26849)


### Description


The shrink button in right upper corner is not working, it covers too much vision area when I wanna review the output of AI model. And sometimes if the content in the window is too long, the app would get stuck.



### Plugins

_No response_

### OpenCode version

Desktop Version 1.14.48 (1.14.48)

### Steps to reproduce

1. Create a rule let AI model use ask_user tool.
2. Send a request to do something which could extend AI thought.
3. AI response and call the ask_user tool, the window would be poped from the bottom.
4. Click the shrink button.


### Screenshot and/or share link

_No response_

### Operating System

MacOs 26.4.1

### Terminal

_No response_

---

## #26827 — UNABLE TO USE THE {RING 2.6 1T FREE} MODEL

📅 `2026-05-11` | ✏️ **Fernado03** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26827](https://github.com/anomalyco/opencode/issues/26827)


### Description

I DONT KNOW WHAT HAPPEN. I JUST USE IT NORMALLY LIKE OTHER FREE MODEL THEN THIS APPEAR.

<img width="824" height="344" alt="Image" src="https://github.com/user-attachments/assets/cd60201b-0744-4c4f-be34-6e8b1bed7aec" />

### Plugins

_No response_

### OpenCode version

1.14.48

### Steps to reproduce

1. Using that model non-stop

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Powershell

---

## #26808 — After version 1.14.4*. It cannot detect my filepath.

📅 `2026-05-11` | ✏️ **AmeMizuki** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/26808](https://github.com/anomalyco/opencode/issues/26808)


### Description

When I tried to use command `@` to telling tool which file I want to edit. It's not showing my files. Says no match files (but I do typed the name of file)
Only v1.14.20 ~ v.1.14.39 worked.
I using VM to coding (opencode install on that VM) and using opencode in VScode.

### Plugins

_No response_

### OpenCode version

1.14.44

### Steps to reproduce

1. Upgrade to newest version
2. use command `@` search out files
3. No files.

### Screenshot and/or share link

_No response_

### Operating System

Redhat 8

### Terminal

VScode

---

## #26778 — [Bug] Slash command popover displays English trigger text instead of i18n-translated title

📅 `2026-05-11` | ✏️ **LifetimeVip** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26778](https://github.com/anomalyco/opencode/issues/26778)


## Description

When typing `/` in the chat input dialog, the slash command dropdown shows English command names (like `/share`, `/undo`, `/compact`) as the primary display text. However, the i18n framework already has fully translated titles for these commands in all supported locales (e.g. Chinese: `分享会话`, `撤销`, `精简会话`). The translated titles exist in the `CommandOption.title` field but are never rendered in the slash popover.

## Steps to Reproduce

1. Open opencode and switch UI language to any non-English locale (e.g. Chinese/中文).
2. Type `/` in the chat input box.
3. Observe the slash command dropdown — all command names are displayed in English.

## Expected Behavior

The slash command popover should display the **i18n-translated title** (or at minimum, display the translated title alongside the trigger), so non-English users can understand commands in their own language.

## Actual Behavior

Only the English `trigger` string and the (already translated) `description` are shown. The i18n-translated `title` is completely ignored in the rendering.

## Root Cause

In `packages/app/src/components/prompt-input/slash-popover.tsx`, line 113:

```tsx
<span class="text-14-regular text-text-strong whitespace-nowrap">/{cmd.trigger}</span>
```

The code renders `cmd.trigger` (hardcoded English word like `share`, `undo`, `compact`), but **never displays `cmd.title`**, which is the field that has been properly internationalized via `language.t()`.

## Evidence

### 1. Slash popover 

> *[Truncado — 3910 chars totais]*

---

## #26775 — deepseek-v4-flash: image input blocked by OpenAI Chat protocol despite model declaring image support

📅 `2026-05-11` | ✏️ **LifetimeVip** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26775](https://github.com/anomalyco/opencode/issues/26775)


﻿### Description

deepseek-v4-flash declares `"input": ["text", "image"]` in model config, but opencode blocks image input at the protocol level before sending to the API.

The OpenAI Chat protocol (`packages/llm/src/protocols/openai-chat.ts:192-193`) hardcodes `["text"]` as the only allowed content type for user messages. DeepSeek routes through `openai-compatible-chat.ts` which reuses `OpenAIChat.protocol`. There is no per-model capability registry — allowed content types are determined entirely by protocol, not by model definition.

Code evidence:
```
// packages/llm/src/protocols/openai-chat.ts:192-193
if (!ProviderShared.supportsContent(part, ["text"]))
  return yield* ProviderShared.unsupportedContent("OpenAI Chat", "user", ["text"])
```

Other roles have the same restriction:
- LLM assistant: `["text", "tool-call"]` (L205)
- Tool: `["tool-result"]` (L227)

### Plugins

None

### OpenCode version

v0.99.1 (latest stable as of 2026-04-29)

### Steps to reproduce

1. Set deepseek-v4-flash as the active model in provider settings
2. In any chat, paste or drag an image file (e.g. image.png, screenshot.jpg)
3. Observe error blocking the send:
   - Error message appears before any API call is made
   - `Cannot read "image.png" (this model does not support image input)`
4. Check network tab — no request is sent to DeepSeek API
5. Switch to a text-only message — works fine

### Screenshot and/or share link

Error message (terminal output):
```
Cannot read "image.png" (this mode

> *[Truncado — 1745 chars totais]*

---

## #26768 — Can't copy text in session diff container in Desktop

📅 `2026-05-10` | ✏️ **ishid4** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26768](https://github.com/anomalyco/opencode/issues/26768)


### Description

You should be able to drag-select and copy text inside of the container.

### Plugins

_No response_

### OpenCode version

1.14.41

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

_No response_

---

## #26741 — /new does not clear per-agent model override within TUI session lifetime

📅 `2026-05-10` | ✏️ **drsmile1001** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26741](https://github.com/anomalyco/opencode/issues/26741)


## Description

Two different flows write to `modelStore.model[agentName]` (a per-agent, in-memory model override in the TUI):

- User manually selects a model via the model dialog (dialog-model.tsx calls local.model.set()).
- Session loads and restores the last user message model (prompt/index.tsx calls local.model.set(msg.model) when sessionID changes, line 401).

The second flow fires automatically when navigating into a session — no prompt submission needed. Once set, this override persists for the rest of the TUI process. /new does not clear it.

Scope issue: The session model restoration (per-session intent) writes to a global in-memory key (modelStore.model[agentName], keyed by agent name, not session ID). There is no cleanup path when the session ends.

This means that within one TUI process lifetime, after visiting a session:

- client.global.config.update() writes to opencode.json correctly
- But the model indicator continues to show the stale override
- Only a TUI restart restores the baseline (because modelStore.model is not persisted to disk — only recent/favorite/variant are saved in model.json)

## Steps to reproduce

1. Start TUI on home page.
2. Call client.global.config.update() with a different model — model indicator updates correctly.
3. Enter a session (messages load, override is set from the last user message's model).
4. /new to return to home.
5. Call client.global.config.update() again with a different model — opencode.json is written, model indicato

> *[Truncado — 1911 chars totais]*

---

## #26707 — Forked session inherits full uncompressed context after parent compaction, causing "exceeds model context limit"

📅 `2026-05-10` | ✏️ **inssk** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26707](https://github.com/anomalyco/opencode/issues/26707)


### Description

When a long-running session is compacted and then forked, the forked session receives the full uncompressed context (pre-compaction history) rather than the compacted continuation summary. This causes the forked session to immediately hit "Conversation history too large to compact - exceeds model context limit."

### Plugins

_No response_

### OpenCode version

1.14.27

### Steps to reproduce

1. Start a long session with significant tool use and code changes (enough to trigger compaction)
2. Let the session auto-compact (or trigger /compact manually)
3. Verify the parent session is working normally with compacted context
4. Fork the compacted session via TUI (Ctrl+S or session list → fork)
5. Open the forked session → immediately see:  
   Conversation history too large to compact - exceeds model context limit

### Screenshot and/or share link

Session too large to compact - context exceeds model limit even after stripping media

### Operating System

debian 13

### Terminal

_No response_

---

## #26683 — API endpoint returning "Not Found" for all v1 paths

📅 `2026-05-10` | ✏️ **Diblax** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26683](https://github.com/anomalyco/opencode/issues/26683)


### Description

All API endpoints on api.opencode.ai/v1/ return "Not Found" (HTTP 200 with body "Not Found").

Tested endpoints:
- /v1/chat/completions → Not Found
- /v1/models → Not Found
- /v1/complete → Not Found

Root endpoint (api.opencode.ai/) returns "Hello, world!" so the server is up.

Started happening today (May 10, 2026). Was working fine yesterday.

Version: v1.14.46
OS: Linux


### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26681 — On May 9, 2026, OpenCode v1.14.42 changed the installation location of the Windows desktop program to the default and it cannot be modified.

📅 `2026-05-10` | ✏️ **tyhq** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26681](https://github.com/anomalyco/opencode/issues/26681)


### Question

Why on earth did you force the installation location to be the default?? As open-source software, how can you even restrict the installation location? Don't users get a choice??

---

## #26671 — [BUG]: TUI does not live-render messages when prompt is POSTed externally via /session/{id}/prompt_async

📅 `2026-05-10` | ✏️ **harshitsinghbhandari** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26671](https://github.com/anomalyco/opencode/issues/26671)


### Description

When a session is open in the TUI and a prompt is sent via `POST /session/{id}/prompt` or `prompt_async` (e.g. from the web UI, the SDK, or any external HTTP client), the TUI does **not live-render** the resulting user prompt or the streaming assistant reply. Messages are missing from the TUI view in real time.

However, the messages are correctly persisted: if the user `Ctrl+C` to detach the TUI and then resumes the same session, all the externally-injected turns appear. The web UI also live-renders them correctly throughout. So this is specifically a **live-render / SSE-subscription bug in the TUI client**, not a message-storage issue.

The server stores both the user prompt and the assistant reply correctly (verified via `GET /session/{id}/message`); the agent runs the inference and the response is persisted. The TUI's view of the active session simply doesn't get refreshed by the relevant SSE events while attached.

### Steps to reproduce

1. Start `opencode` (TUI) — server auto-starts on `http://127.0.0.1:4096`.
2. (Optional) Open the web UI on the same server to confirm comparative behavior.
3. Note the active session id (e.g. `curl http://127.0.0.1:4096/session`).
4. From any external shell, POST a prompt to that session:
   ```sh
   curl -X POST http://127.0.0.1:4096/session/<SESSION_ID>/prompt_async \
     -H 'Content-Type: application/json' \
     -d '{
       "parts":[{"type":"text","text":"hello from external POST"}],
       "model":{"providerID":

> *[Truncado — 2441 chars totais]*

---

## #26670 — Web: recalled messages leave stale todos in session

📅 `2026-05-10` | ✏️ **Edison-A-N** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26670](https://github.com/anomalyco/opencode/issues/26670)


### Description

When a conversation is recalled from the web UI, the message content is removed, but the todo state created by that conversation remains attached to the session. If the user continues chatting in the same session after the recall, the agent still sees the stale todo items and may continue executing actions that were associated with the recalled conversation.

This makes recall incomplete from a session-state perspective: the visible conversation no longer contains the instruction, but hidden todo state can still affect subsequent agent behavior.

Expected behavior: recalling a conversation/message in the web UI should also remove or invalidate todo state that was created by the recalled content, so continuing the session starts from the visible remaining conversation state.

Actual behavior: todos created before recall can remain active and continue influencing follow-up turns.

### Plugins

Not provided

### OpenCode version

Not provided

### Steps to reproduce

1. Open a session in the web UI.
2. Ask the agent to do something that creates todo items.
3. Recall the conversation/message from the web UI.
4. Continue chatting in the same session.
5. Observe that the stale todo state can still cause the agent to continue executing actions from the recalled content.

### Screenshot and/or share link

Not provided

### Operating System

Not provided

### Terminal

Not applicable / web UI

---

## #26662 — Internal server error: unhashable type: 'dict' with Kimi K2.6 via Nvidia NIM

📅 `2026-05-10` | ✏️ **VIVAAN-DHAWAN** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26662](https://github.com/anomalyco/opencode/issues/26662)


### Description

Any message sent to Kimi K2.6 (via Nvidia NIM) immediately triggers an internal server error that retries indefinitely and never resolves. Other models work fine.
Suspected cause: Kimi K2.6 on Nvidia NIM includes a reasoning_content field as a dict inside streaming deltas. The parser tries to hash it, which Python rejects. Same root cause seen in KiloCode: https://github.com/Kilo-Org/kilocode/issues/9936

### Plugins

None

### OpenCode version

1.14.41

### Steps to reproduce

1. Select model: moonshotai/kimi-k2.6 (Nvidia)
2. Send any message (even just "hi")
3. Error appears immediately: "Internal server error: unhashable type: 'dict' [retrying in Xs attempt #N]"
4. Never resolves, keeps retrying

### Screenshot and/or share link

<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/0e018d2c-e2c9-4236-a0a7-8cfc76c43532" />

### Operating System

macOS

### Terminal

Warp

---

## #26658 — Main LLM call never executes. Session stuck on thinking after title generation.

📅 `2026-05-10` | ✏️ **maikokan** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26658](https://github.com/anomalyco/opencode/issues/26658)


### Description

After sending any message, opencode generates a session title (via anthropic/claude-haiku-4.5 on OpenRouter) but never makes the main inference call. The UI shows thinking (loading bar bottom left) indefinitely. No errors are logged.

**Log evidence:**
The title call fires and completes, then nothing:
```
service=llm providerID=openrouter modelID=anthropic/claude-haiku-4.5 small=true agent=title mode=primary stream
service=bus type=session.updated publishing
service=default worker shutting down (after no activity for 5 minutes by me)
```


**Models tested:**
openrouter: minimax/minimax-m2.7, xiaomi/mimo-v2.5
opencode zen: nemotron-3-super-free, big-pickle

**Attempted fixes:**
- Fresh reinstall multiple times
- Cleared all config and cache
- Switched models and providers

### Plugins

_No response_

### OpenCode version

1.14.46

### Steps to reproduce

1. Fresh install via curl -fsSL https://opencode.ai/install | bash
2. Run opencode and complete provider setup with OpenRouter API key
3. Select any model 
4. Send any message. I sent "hello"
5. Title is generated successfully (openrouter log)
6. UI shows "thinking" — no response ever arrives

### Screenshot and/or share link

Several log files:

[2026-05-10T061636.log](https://github.com/user-attachments/files/27563462/2026-05-10T061636.log)
[2026-05-10T061637.log](https://github.com/user-attachments/files/27563460/2026-05-10T061637.log)
[2026-05-10T061708.log](https://github.com/user-attachments/files/275634

> *[Truncado — 1695 chars totais]*

---

## #26654 — Bug: UI stuck in loading state after undoing and resending message

📅 `2026-05-10` | ✏️ **huohuo-huo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26654](https://github.com/anomalyco/opencode/issues/26654)


**Description:**

After undoing (rolling back) a sent message and then resending, the UI fails to properly display the agent's running state. Instead of showing the normal AI execution flow (thinking steps, tool calls, etc.), the page only shows a loading spinner in the bottom-right corner indefinitely.

After restarting the app, the agent works normally and displays the full execution process. This confirms the issue is a **UI state management bug** related to the undo/rollback operation — not an agent processing failure.

**Steps to reproduce:**
1. Send a message to the agent and wait for the response
2. Undo/rollback the sent message (message shows as "已回滚消息")
3. Resend a message
4. Observe: UI only shows a spinning loading indicator, agent's running state (thinking, tool calls) is not displayed
5. Restart the app → agent works normally with full UI display

**Expected behavior:**
After resending a rolled-back message, the UI should correctly transition to show the agent's execution flow (thinking steps, tool usage, progress), just like a normal new message.

**Actual behavior:**
The UI remains stuck on a loading spinner and does not update to reflect the agent's actual running state.

**Operating System:** Windows

**OpenCode version:** Desktop v1.14.46

---

## #26625 — /timestamps command has no visible effect and /exit missing from autocomplete

📅 `2026-05-10` | ✏️ **welbonwang** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/26625](https://github.com/anomalyco/opencode/issues/26625)


### Description

## Bug Report

### Description

The `/timestamps` slash command (and its alias `/toggle-timestamps`) is supposed to show a timestamp below each user message in the TUI session view. While the command correctly toggles between "Show timestamps" and "Hide timestamps" state (persisted via KV store), the timestamps are **not visually rendered** in any theme.

### Steps to Reproduce

1. Start OpenCode TUI (v1.14.42+)
2. Have a conversation with at least one user message
3. Type `/timestamps` in the prompt — the command title reads "Show timestamps"
4. Select it to toggle timestamps ON
5. Observe: no timestamp appears under any user message bubble
6. Run `/timestamps` again — title now reads "Hide timestamps", confirming the toggle state changed

### Expected Behavior

When timestamps are enabled, each user message bubble should display a creation time (e.g. `14:32` or `14:32 · 2026-05-10`) at the bottom, rendered in `theme.textMuted`.

### Actual Behavior

No visible timestamp text appears under user messages in any theme (tested with multiple built-in themes via `/themes`).

### Environment

- **OpenCode version**: v1.14.42+ (current: v1.14.45)
- **Platform**: Linux
- **Introduced in**: commit `98f5e6e71` — "introduce opentui keymap as sole key/cmd engine (#26053)"

### Root Cause Analysis

The rendering code at `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx:1361-1376`:

```tsx
<Show
  when={queued()}
  fallback={
    <Show when={ctx.showTimestamps()

> *[Truncado — 3685 chars totais]*

---

## #26613 — [BUG] OpenCode Desktop models list cannot be refreshed

📅 `2026-05-10` | ✏️ **lrq3000** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26613](https://github.com/anomalyco/opencode/issues/26613)


### Description

Since a couple of weeks or months, the CLI binary is not shipped anymore with the OpenCode Desktop bundle (eg, `opencode-cli.exe` on Windows).

This prevents the use of necessary CLI commands that are not yet integrated in OpenCode Desktop's WebUI, such as models refreshing. So effectively, OpenCode Desktop currently deprecates under a month because it cannot be refreshed to get access to the latest models the providers can offer.

Also `opencode-cli.exe` should be renamed `opencode.exe` and the desktop binary to `opencode-desktop.exe`, this would allow OpenCode Desktop to know how to find and use the CLI binary to do models refresh and other commands such as doctor by itself (otherwise it trips up because of the `-cli` suffix that is undocumented anywhere). See also #7666 about this related issue of binaries naming.

### Plugins

None

### OpenCode version

1.14.41

### Steps to reproduce

1. Install OpenCode Desktop
2. Try to refresh the models list

### Screenshot and/or share link

_No response_

### Operating System

Windows 11 Pro

### Terminal

Windows Terminal

---

## #26509 — opencode run exits with status 0 for invalid model when prompt is provided

📅 `2026-05-09` | ✏️ **vedantnaik19** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26509](https://github.com/anomalyco/opencode/issues/26509)


### Description

### Description

Running `opencode run` with an invalid model and a prompt/message argument produces a `ProviderModelNotFoundError`, but the process exits with status code `0`.

This only appears to happen when a prompt/message is provided.

### Command

```sh
opencode run -m invalid-model "some message"
echo $?
```

### Plugins

_No response_

### OpenCode version

1.14.41

### Steps to reproduce

- Run: `opencode run -m invalid-model "build"`
- Notice it prints `ProviderModelNotFoundError` / `Model not found`
- Run: `echo $?`
- Notice the exit code is `0`
- [Optionally] Compare with: `opencode run -m invalid-model` without a prompt/message

### Screenshot and/or share link

_No response_

### Operating System

macOS 26.4

### Terminal

Mac Terminal

---

## #26498 — DeepSeek tool calls can use malformed argument JSON

📅 `2026-05-09` | ✏️ **HNGM-HP** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26498](https://github.com/anomalyco/opencode/issues/26498)


### Description

DeepSeek models can produce malformed tool-call arguments in some cases, for example optional placeholders (`null`, `""`, `{}`, `[]`), arrays encoded as strings, decorated paths, or partial paired parameters.

This is related to DeepSeek tool-call formatting, but narrower than #24566. That issue is about raw DSML/XML-style tool calls not being parsed by a provider. This issue is about prompt-level mitigation for argument JSON shape when OpenCode is already using normal tool calls.

OpenCode already has provider-specific prompt sections for some models. A small DeepSeek-specific prompt section can make the expected tool-call JSON shape explicit without changing behavior for other providers.

### Plugins

None

### OpenCode version

Current dev branch

### Steps to reproduce

1. Use a DeepSeek model with tools enabled.
2. Ask it to call tools with array, object, path, or optional parameters.
3. Observe that some calls may use invalid argument shapes, such as arrays as strings, decorated paths, placeholder optional values, or only one side of a paired parameter.

### Screenshot and/or share link

No screenshot. This is a tool-call argument formatting issue.

### Operating System

Ubuntu 24.04

### Terminal

Not terminal-specific

---

## #26487 — [BUG] chunkTimeout does not work for AWS Bedrock and other non-SSE streaming protocols (EventStream)

📅 `2026-05-09` | ✏️ **gkkkd8** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26487](https://github.com/anomalyco/opencode/issues/26487)


### Description

# Issue Title

`[BUG] chunkTimeout does not work for AWS Bedrock and other non-SSE streaming protocols (EventStream)`

---

# Issue Body

## Summary

The `chunkTimeout` configuration option in `provider.options` **completely fails** to protect AWS Bedrock (and potentially Google Vertex AI) streaming requests. This is due to `wrapSSE()` in `provider.ts` checking for `text/event-stream` content-type, which silently skips all non-SSE protocols like AWS EventStream (`application/vnd.amazon.eventstream`).

**Impact**: Bedrock users have **no chunk-level timeout protection** against silent stream stalls, only the overall `timeout` (which may be too coarse-grained or disabled).

---

## Reproduction

### Environment
- opencode: Installed via npm (`~/.nvm/versions/node/v22.22.0/bin/opencode`)
- Provider: AWS Bedrock (`@ai-sdk/amazon-bedrock`)
- Model: `global.anthropic.claude-sonnet-4-6`

### Configuration
`~/.config/opencode/opencode.json`:
```json
{
  "providers": {
    "my-bedrock": {
      "npm": "@ai-sdk/amazon-bedrock",
      "options": {
        "region": "us-west-2",
        "chunkTimeout": 10,
        "timeout": 60000
      }
    },
    "my-anthropic": {
      "npm": "@ai-sdk/anthropic",
      "options": {
        "apiKey": "sk-ant-...",
        "chunkTimeout": 10,
        "timeout": 60000
      }
    }
  }
}
```

### Test A: AWS Bedrock (10ms chunkTimeout)

**Command**:
```bash
opencode run -m "my-bedrock/global.anthropic.claude-sonnet-4-6" \
  "请写一段300字的文章

> *[Truncado — 8426 chars totais]*

---

## #26483 — can not open soft link directory  as opencode project directory in web ui

📅 `2026-05-09` | ✏️ **geosmart** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26483](https://github.com/anomalyco/opencode/issues/26483)


### Description

I can create session by api , but can not display the session in web ui


### Plugins

_No response_

### OpenCode version

1.14.29

### Steps to reproduce

```bash
ln -nsf /root /tmp/opencode-dir

# create success
curl -X POST 'http://localhost:4096/session?directory=/tmp/opencode-dir'| jq -r '.id'

# but in tui or opencode web can not display the session

```

### Screenshot and/or share link

_No response_

### Operating System

ubuntu 24.04

### Terminal

zsh

---

## #26481 — Native Windows opencode cannot access WSL's UNC path...

📅 `2026-05-09` | ✏️ **cheezmil** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26481](https://github.com/anomalyco/opencode/issues/26481)


### Description

```plaintext
\\wsl.localhost\Ubuntu-22.04\home\aaa
```

For example, this cannot be accessed

### Plugins

_No response_

### OpenCode version

1.14.41

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Win11

### Terminal

WT

---

## #26459 — Clipboard copy fails in web-based VSCode terminals (code-server, GitHub Codespaces)

📅 `2026-05-09` | ✏️ **xuxusheng** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26459](https://github.com/anomalyco/opencode/issues/26459)


## Description

Clipboard copy functionality does not work when running OpenCode in web-based VSCode environments such as:

* code-server (self-hosted VS Code in browser)
* GitHub Codespaces
* VS Code Remote SSH (in some configurations)
* Gitpod

The UI shows "Copied to clipboard" notification, but nothing is actually copied to the clipboard.

## Environment

* **OpenCode version**: v1.14.41
* **VS Code environment**: code-server / GitHub Codespaces
* **Terminal**: VS Code integrated terminal (web-based)
* **OS**: Linux (headless server, no X11/Wayland)
* **Browser**: Chrome/Firefox/Edge

## Steps to Reproduce

1. Open a web-based VSCode environment (code-server, GitHub Codespaces, etc.)
2. Install and run OpenCode in the integrated terminal
3. Start a conversation and get a response
4. Try to copy text using:
   * Mouse selection (auto-copy on select)
   * OpenCode's built-in copy command (`y` key)
   * Keyboard shortcuts (Ctrl+C/Cmd+C)
5. Notification shows "Copied to clipboard"
6. Try to paste in another application
7. **Result**: Nothing is pasted (clipboard is empty)

## Expected Behavior

Clipboard copy should work in web-based VSCode environments, allowing users to copy:

* Code snippets from responses
* File paths and URLs
* Any text content from OpenCode

## Actual Behavior

* Copy notification appears ("Copied to clipboard")
* Nothing is actually copied to clipboard
* No way to copy content from OpenCode in web-based VSCode

## Impact

This issue affects developers 

> *[Truncado — 2290 chars totais]*

---

## #26434 — Bug: agent .md `prompt:` frontmatter field is silently overridden by markdown body, producing empty prompt and silent fallback to default agent prompt

📅 `2026-05-09` | ✏️ **CyberFreedomOrg** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26434](https://github.com/anomalyco/opencode/issues/26434)


---

## Description

### Summary

When an agent `.md` file in `~/.config/opencode/agents/` (or `.opencode/agents/`) declares `prompt:` in YAML frontmatter and has an empty markdown body, OpenCode silently overwrites the frontmatter `prompt:` value with the empty body, producing an agent whose prompt is `""`. At session-construction time, the empty agent prompt falls through to the default opencode build prompt with **no warning, no error, no log message**.

This is a silent-failure footgun adjacent to issue #24181 (which covers invalid-YAML frontmatter being silently dropped). Both stem from the same loader flow in `config/agent.ts`.

### Impact

For our use case (specialised role agents with strict prompt fidelity requirements), this caused agents that were configured to use a specific custom system prompt to actually run with the default opencode build prompt instead. Symptoms included:

- Agent identifying as "opencode (oc)" rather than as the configured persona
- Agent paraphrasing rather than quoting source-prompt text verbatim
- Agent's behavioural constraints (forbidden phrases, formatting contracts) silently absent

These symptoms presented as "primary mode dilutes the agent prompt" and consumed ~36 hours across two investigations (one autonomous, one wire-level via MITM proxy) before the silent-override behaviour was identified at the source level.

### Root cause

`packages/opencode/src/config/agent.ts:135` (line numbers as of 1.14.41):

```typescript
const config =

> *[Truncado — 6291 chars totais]*

---

## #26411 — Error message: Decompression error: ZlibError

📅 `2026-05-08` | ✏️ **martin-santiago** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26411](https://github.com/anomalyco/opencode/issues/26411)


### Description

Few days ago I started facing the following error in the video: Decompression error: ZlibError

https://github.com/user-attachments/assets/707e188c-b148-46cf-8e86-ee973e5c55f5

cant really tell how to duplicate it, it just started happening, I didnt downladed any plugin or nothing

### Plugins

  "plugin": [     "@mohak34/opencode-notifier@latest",     "context-mode"  ],

### OpenCode version

1.14.39

### Steps to reproduce

open opencode on a session

wait a few minutes, the error pops in the chat input

### Screenshot and/or share link

_No response_

### Operating System

macOS sequoia 15.6.1

### Terminal

ghostty

---

## #26407 — Plan mode doesn't restrict sub-agents spawned via task tool

📅 `2026-05-08` | ✏️ **chrisshilt** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26407](https://github.com/anomalyco/opencode/issues/26407)


### Description

While I was working on a project, I noticed that the plan mode agent managed to spawn the another agent as a sub-task.This allowed the plan agent to bypass the read-only restriction.

I was in plan mode working on a session monitor plugin. I asked the model to create an implementation plan, and it did — but then it also spawned the the general tool as a subagent and passed the full set of instructions I was going to have the build agen implement. The sub-agent executed everything: created a plugin file, edited AGENTS.md, updated tracking files, and ran tests.

I realize that this bug has been reported before, but wanted to submit this in case it adds additional context for fixing the issue.

### Plugins

opencode-agent-skills, opencode-observability.ts

### OpenCode version

1.14.40 (Running in WSL. Command line: opencode serve --hostname 0.0.0.0 --port 4096)

### Steps to reproduce

1. Asked the plan agent to write detailed instructions with this prompt: I agree, sounds like a solid plan. Create detailed instructions and add a step at the top for tracking. Then, we'll pass it on to the build agent.
2. Asked a follow-up question. Prompt: Do the instructions including testing?
3. Answered the assessment and answered the agent's question: "Should I add these to the instructions?" with "Yes"
4. The agent wrote the instructions, then proceed to spawn the sub-agent. I allowed it to run, as it was a low-impact change.

### Screenshot and/or share link

<img width="

> *[Truncado — 1812 chars totais]*

---

## #26405 — Internal server error: unhashable type: 'dict'

📅 `2026-05-08` | ✏️ **Mestoph** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26405](https://github.com/anomalyco/opencode/issues/26405)


### Description

When i use some model like kimi k2.6 i get all time the message : 

Internal server error: unhashable type: 'dict'

### Plugins

none

### OpenCode version

lasted

### Steps to reproduce

All time with kimi k2.6 provider.

End of the error message :

```shell
Part of the log with error message :

"responseBody":"{\"error\":{\"object\":\"error\",\"message\":\"Internal server error: unhashable type: 'dict'\",\"type\":\"InternalServerError\",\"param\":null,\"code\":500}}","isRetryable":true,"data":{"error":{"message":"Internal server error: unhashable type: 'dict'","type":"InternalServerError","param":null,"code":500}}}} stream error
```

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Terminal

---

## #26397 — Command does not work in new project dir (web ui)

📅 `2026-05-08` | ✏️ **pwillis-oi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26397](https://github.com/anomalyco/opencode/issues/26397)


### Description

1. Create a directory (`mkdir -p ~/foo/bar/baz`)
2. Run opencode web
3. Open web UI
4. Open new project against the created dir
5. In the new session, type into chat `!ls`
6. Errors out

Error:

```
$ ls

/Users/myuser/foo/bar/baz: /Users/myuser/foo/bar/baz: Is a directory
```

Works if you ask the agent to run ls:

```
> Run command "ls"
```

Command runs successfully

### Plugins

_No response_

### OpenCode version

1.14.41

### Steps to reproduce

See description

### Screenshot and/or share link

_No response_

### Operating System

MacOS 26.4.1

### Terminal

iTerm2

---

## #26394 — Subagents spawned via 'task' receive no tools in API call despite bash: true in frontmatter

📅 `2026-05-08` | ✏️ **aaronmasm** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26394](https://github.com/anomalyco/opencode/issues/26394)


### Description

## Environment
- OpenCode: 1.14.41
- Ollama: 0.23.1  
- OS: Ubuntu 24.04 (WSL)

## Description
When the orchestrator delegates to a subagent via the `task` tool, 
OpenCode does NOT pass any tools to the subagent in the API call.
The subagent frontmatter has `bash: true` but the model receives
an empty tools array, resulting in 0 toolcalls.

## Evidence
Intercepted the API calls between OpenCode and Ollama with a proxy:

**Subagent (qwen3:8b) — bash: true in frontmatter:**
MODEL: qwen3:8b
MESSAGES: 3
HAS TOOLS: False
TOOLS: *** NONE PASSED ***

**Orchestrator (qwen3-neurax-64k):**
MODEL: qwen3-neurax-64k  
MESSAGES: 2
HAS TOOLS: True
TOOLS: ['read', 'glob', 'grep', 'task', 'todowrite', 'skill', ...]

## Expected behavior
Subagent with `bash: true` should receive the bash tool schema 
in the API call so the model can emit proper tool_calls.

## Actual behavior
Subagent receives tools: [] — model generates text instead of 
tool_calls, resulting in 0 toolcalls and no real execution.

### Plugins

@warp-dot-dev/opencode-warp

### OpenCode version

1.14.41

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26357 — Docker MCP gateway connects but LLM cannot recognize/invoke the MCP server on macOS

📅 `2026-05-08` | ✏️ **bin-r00t** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26357](https://github.com/anomalyco/opencode/issues/26357)


## Bug description

When configuring a Docker MCP gateway server in `opencode.json`, the connection to the Docker MCP gateway is established successfully (no `ENOENT` or connection errors), but the LLM in opencode-desktop cannot see or invoke the MCP tools/resources provided by the gateway. The configured tools never appear in the LLM's tool-call context, effectively making the MCP server invisible to the model.

## Steps to reproduce

1. Install opencode-desktop on macOS (Apple Silicon M2)
2. Configure a Docker-based MCP gateway in `opencode.json`:
   ```json
   {
     "mcp": {
       "docker-gateway": {
         "type": "local",
         "command": [
           "/usr/local/bin/docker",
           "mcp",
           "gateway",
           "run"
         ],
         "enabled": true
       }
     }
   }
   ```
3. Launch opencode-desktop
4. The log/status shows the MCP gateway as connected — no startup errors
5. Ask the LLM to use a tool that should be provided by this MCP server
6. Observe that the LLM has no knowledge of the MCP tools — it responds as if the MCP server doesn't exist

## Expected behavior

Once the Docker MCP gateway connects successfully, the LLM should be able to discover and invoke the tools/resources exposed by that MCP server, just as it can with non-Docker local MCP servers.

## Actual behavior

- The MCP gateway appears to connect (no errors in logs)
- But the LLM never receives the tool/resource definitions from this MCP server
- The LLM has no awareness

> *[Truncado — 2611 chars totais]*

---

## #26353 — System model overrides popup selection in Plan Mode, built-in Google provider cannot be removed

📅 `2026-05-08` | ✏️ **Alomphega** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26353](https://github.com/anomalyco/opencode/issues/26353)


### Description

## Description
When using OpenCode Desktop on Windows, the model selected in the popup is ignored in certain modes. A system fallback model (big-pickle / gemma4:e4b) responds instead of the one selected, making the user experience unpredictable.

Additionally, the built-in "Google [environment]" provider cannot be fully removed from the provider list even after:
- Deleting all Google/Gemini environment variables (GEMINI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY)
- Removing all Google/Gemini provider sections from opencode.json
- Adding various provider IDs to disabled_providers (google, googleai, googlegenai, google-ev, gemini)

The provider only disappears after explicitly adding multiple guessed provider IDs to disabled_providers.

## Steps to Reproduce
1. Select a model in the popup (e.g., Big Pickle)
2. Enter Plan Mode
3. Observe that a different model responds (e.g., gemma4:e4b) instead of the selected one
4. Try to remove the built-in "Google [environment]" provider by deleting env vars and config

## Expected Behavior
1. The selected model in the popup should respond regardless of the mode (Plan or Build)
2. Built-in providers (like Google [environment]) should have a documented, reliable way to be disabled without guessing provider IDs

## Actual Behavior
1. Plan Mode forces a system fallback model, ignoring user popup selection
2. Google [environment] provider persists in the UI even after all related configuration is removed

## Environment
- OpenCode D

> *[Truncado — 2685 chars totais]*

---

## #26351 — [BUG]: Model from previous session overrides current config when continuing a session

📅 `2026-05-08` | ✏️ **st3fk3** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26351](https://github.com/anomalyco/opencode/issues/26351)


### Description

When continuing an old session, the model is restored from the last user message instead of the current agent config.

Changing the model config between sessions has no effect - the old model is still used.

- The orchestrator uses the stale model for API calls
- Subagents use the correct config model (they bypass the model store)
- This causes model inconsistency within a single session (on old session continue)

**Expected behavior**

- Configured model should be the active model when starting or continuing any session
- Session history should restore the agent, not the model

**Why this is safe**

- Switching models mid-session is safe
- If there are any issues that are result of model changing, it should be kept in mind when changing model config
- Config is the user's current intent and should take precedence over historical state

### Plugins

oh-my-opencode-slim

### OpenCode version

v1.14.41

### Steps to reproduce

1. Use opencode with model A
2. Send a few messages in a session
3. Close opencode
4. Change config to model B
5. Reopen opencode, continue the old session
6. The orchestrator uses model A instead of model B

### Screenshot and/or share link

_No response_

### Operating System

Fedora Linux 43 (KDE Plasma edition)

### Terminal

Alacritty

---

## #26341 — Model Qwen 3.6 27b from OpenRouter not working

📅 `2026-05-08` | ✏️ **dbrgn** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26341](https://github.com/anomalyco/opencode/issues/26341)


### Description

I selected "Qwen3.6 27B" through OpenRouter from the list of models. When sending a prompt, I get an error message:

> qwen/qwen-3.6-27b is not a valid model ID

The error message is right, the model is called [`qwen/qwen3.6-27b`](https://openrouter.ai/qwen/qwen3.6-27b) (without the dash).

Where is the wrong identifier coming from? I searched through the code, and could not find the string "qwen-3.6" anywhere.

### Plugins

_No response_

### OpenCode version

1.14.41

### Steps to reproduce

1. Select "Qwen3.6 27B" via OpenRouter from model list
2. Send a prompt

### Screenshot and/or share link

_No response_

### Operating System

Linux

### Terminal

VSCode Terminal

---

## #26335 — bug: pr command hardcodes "opencode" when respawning the child session

📅 `2026-05-08` | ✏️ **yeighta** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26335](https://github.com/anomalyco/opencode/issues/26335)


### Description

`packages/opencode/src/cli/cmd/pr.ts` calls `Process.text(["opencode", ...])` and `Process.spawn(["opencode", ...])` to re-launch the CLI for the checked-out PR branch. The string `"opencode"` is hardcoded at four sites (two spawns, the "Starting opencode..." status line, and the exit-code error message), plus the yargs `describe` text.

Hardcoding the literal `"opencode"` means children are routed via `$PATH` resolution to whichever `opencode` happens to come first, regardless of how the parent was launched. Several common invocations misroute as a result:

- Compiled-binary symlinks (e.g. `~/bin/oc -> ~/bin/opencode`). `oc pr 123` should respawn `oc` (preserving the symlink) but instead respawns `$PATH`'s `opencode`, which may resolve to a different install.
- Side-by-side installs. A user running `opencode-canary pr 123` expects the canary to respawn, but the literal `"opencode"` rebooks them onto stable.
- `bun src/index.ts pr 123` dev mode. The literal `"opencode"` does not exist on the dev shell's `$PATH`; the child needs `[bunPath, scriptPath]` to re-enter the script under the same interpreter.
- Wrapper / rename scenarios (sudo wrappers, custom names, etc.). The user-typed binary name is what should be respawned.

### Plugins

_No response_

### OpenCode version

dev (current as of 2026-05-08)

### Steps to reproduce

1. `ln -s "$(which opencode)" ~/bin/oc`
2. `~/bin/oc pr 123` from a git repository
3. After checkout the child session is launched as `

> *[Truncado — 2598 chars totais]*

---

## #26331 — Bug: OpenCode Go bridge layer incompatible with kimi-k2.6 tool calls

📅 `2026-05-08` | ✏️ **pronzcw** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26331](https://github.com/anomalyco/opencode/issues/26331)


## Bug Report: OpenCode Go bridge layer incompatible with kimi-k2.6 tool calls

### Environment
- **Client**: MyAgents (Claude Agent SDK based)
- **Provider**: OpenCode Go
- **Model**: kimi-k2.6 (via Moonshot AI)
- **API Protocols tested**: OpenAI-compatible (`/zen/go/v1`) and Anthropic (`/zen/go`)

### Problem Description
When using kimi-k2.6 through OpenCode Go's bridge layer, tool calls fail due to incompatible message formatting. The issue manifests differently depending on which protocol is used:

#### 1. OpenAI Protocol (`/zen/go/v1`) - Original Issue
**Error**: 
```
API Error: 400 {"type":"error","error":{"type":"invalid_request_error",
"message":"Error from provider: Provider returned error"}}
```

**Root cause** (from provider logs):
```
thinking is enabled but reasoning_content is missing in assistant tool call message at index 2
provider_name: Moonshot AI
```

**Analysis**: 
- kimi-k2.6 has thinking enabled by default
- When the AI makes tool calls in subsequent conversation turns, the bridge layer fails to properly forward the `reasoning_content` field in the message history
- Moonshot AI rejects the request because the thinking content is missing from previous assistant messages

#### 2. Anthropic Protocol (`/zen/go`) - Alternative Test
**Error**:
```
Invalid request: function name is invalid, must start with a letter 
and can contain letters, numbers, underscores, and dashes
provider_name: Moonshot AI
```

**Analysis**:
- The Anthropic protocol bridge has a diff

> *[Truncado — 3345 chars totais]*

---

## #26304 — Request for directory not visible in sub agent

📅 `2026-05-08` | ✏️ **Gobutah** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26304](https://github.com/anomalyco/opencode/issues/26304)


### Description

Requests for confirmation for permission to enter a specific directory are only visible on top level, when I am looking at a subagent the confirmation message does not show. So I waited for very long time in the sub agent view and was wondering why it took so long.
Then I finally left the subagent view and found the confirmation request.

I think the message should also show in subagent view.

### Plugins

_No response_

### OpenCode version
1.14.41

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26303 — ESLink LSP hard coded for nodejs/npm runtime and does not support bun.

📅 `2026-05-08` | ✏️ **ylxdzsw** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26303](https://github.com/anomalyco/opencode/issues/26303)


### Description

ESLink LSP https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/lsp/server.ts#L153 hard code "npm" and "node" binary names, make it specific to this runtime. It should ideally use the Npm package just like other LSPs. 

### Plugins

None

### OpenCode version

1.14.41

### Steps to reproduce

1. Look at https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/lsp/server.ts#L153

### Screenshot and/or share link

_No response_

### Operating System

Archlinux

### Terminal

WebUI

---

## #26301 — MCP OAuth scope config is not applied to authorization flow

📅 `2026-05-08` | ✏️ **joshuapbritz** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/26301](https://github.com/anomalyco/opencode/issues/26301)


In full transparency, this ticket was created using an AI agent. I am not sure if there is anything useful here, but I was hoping that I could at least get pointed in the correct direction. My debug session is here: https://opncd.ai/share/LeFwxgyK

I am happy to move or update the issue log. The issue I am having is that a specific MCP server I am trying to connect to is not working. The server is https://docs.medusajs.com/learn/introduction/build-with-llms-ai/mcp-server but when trying to connect I get an error message: `OAuth Failure: Missing required state parameter - potential CSRF attack`.

The below was output by my agent (Gpt 5.5 xhigh).

## Summary

OpenCode exposes an MCP OAuth config option:

```json
"oauth": {
  "scope": "openid email profile"
}
```

But the configured scope does not appear to be included in the OAuth client metadata used by the MCP TypeScript SDK. As a result, the generated authorization URL can omit `scope`, which prevents users from working around MCP servers that require explicit scopes.

## Environment

- OpenCode version observed in logs: `1.14.40`
- Current source checked: `v1.14.41`
- OS: macOS
- MCP server tested: `https://docs.medusajs.com/mcp`

## Reproduction

Configure a remote MCP server with an explicit OAuth scope:

```json
{
  "mcp": {
    "medusa": {
      "type": "remote",
      "enabled": true,
      "url": "https://docs.medusajs.com/mcp",
      "oauth": {
        "scope": "openid email profile"
      }
    }
  }
}
```

Run:

``

> *[Truncado — 3440 chars totais]*

---

## #26296 — cannot handle tool call in minimax:tool_call

📅 `2026-05-08` | ✏️ **gaobrian** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26296](https://github.com/anomalyco/opencode/issues/26296)


### Description

Alway stop at response from minimax model as 
Read the traits:
Read traits:
<invoke name="read">
<parameter name="filePath">...</parameter>
<parameter name="limit">80</parameter>
<parameter name="offset">1</parameter>
</invoke>
</minimax:tool_call>

### Plugins

oh my agent

### OpenCode version

1.14.40

### Steps to reproduce

1. run it with minimax 2.5/2.5 model

### Screenshot and/or share link

<img width="1446" height="368" alt="Image" src="https://github.com/user-attachments/assets/8c82aff1-721a-41a7-beb2-3450f05ca32e" />

### Operating System

_No response_

### Terminal

_No response_

---

## #26277 — [MCP] Schema validation fails for tools with multiple discriminated-union/nested-object parameters (e.g. obsidian-mcp-server patch_note, append_to_note)

📅 `2026-05-08` | ✏️ **r007b34r** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26277](https://github.com/anomalyco/opencode/issues/26277)


### Description

## Environment
- OpenCode: latest (oh-my-opencode v3.17.15)
- MCP server: obsidian-mcp-server@3.1.5 (cyanheads/obsidian-mcp-server, npm)
- OS: Windows
## Steps to reproduce
1. Configure obsidian-mcp-server as an MCP server (stdio transport)
2. Call `obsidian_patch_note` with valid nested parameters:
   - target: { type: "path", path: "SomeFile.md" }
   - section: { type: "heading", target: "SectionName" }
   - operation: "append"
   - content: "new content"
3. Call `obsidian_append_to_note` with:
   - target: { type: "path", path: "SomeFile.md" }
   - section: { type: "heading", target: "SectionName" } (optional)
   - content: "new content"
## Expected behavior
Both calls should succeed with properly structured nested parameters matching the server's declared input schema.
## Actual behavior
Both calls fail with `-32602 Invalid params`. The error messages demand **flat** top-level fields that are actually nested inside discriminated union objects, e.g.:
- `required property 'path'` (path is inside `target`, not top-level)
- `required property 'sectionTargeted'` (this is an **output** field, not an input field)
## Which tools are affected
- `obsidian_patch_note` — has `target` (discriminated union) + `section` (nested object)
- `obsidian_append_to_note` — has `target` (discriminated union) + optional `section` (nested object)
## Which tools work correctly
- `obsidian_replace_in_note` — all flat parameters
- `obsidian_write_note` — single nested target
- `obsid

> *[Truncado — 2634 chars totais]*

---

## #26271 — Bug: Custom provider models can't use image attachment (attachment flag not exposed in UI)

📅 `2026-05-08` | ✏️ **LifetimeVip** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26271](https://github.com/anomalyco/opencode/issues/26271)


**Description**

When adding a custom OpenAI-compatible provider through the UI (Settings → Providers → Add Custom), there is no option to mark a model as supporting image input. Models added through the dialog always default to `attachment: false`, which means image attachment is silently disabled in the prompt input — even for vision-capable models like `deepseek-chat`, `gpt-4o`, or any other multimodal model added as a custom provider.

This has a compounding effect for DeepSeek users specifically: DeepSeek is not a first-class provider and must be added as a custom provider. Since `deepseek-chat` supports image input but the UI has no way to enable it, images can't be attached when using DeepSeek through the custom provider flow.

**Steps to reproduce**

1. Open Settings → Providers → Add Custom Provider
2. Set Base URL to `https://api.deepseek.com/v1`, add model ID `deepseek-chat` / name `DeepSeek Chat`
3. Open a new session and select the `deepseek-chat` model
4. Try to attach an image (drag-drop or paste)
5. The image attachment button is absent or images are rejected

**Expected behavior**

Users should be able to indicate whether a custom model supports image input. The dialog should have an "Supports image input" toggle per model.

**Root cause**

In `packages/app/src/components/dialog-custom-provider-form.ts`, the `modelConfig` only stores `{ name }`:

```ts
const modelConfig = Object.fromEntries(
  input.form.models.map((m) => [m.id.trim(), { name: m.name.trim() }

> *[Truncado — 2621 chars totais]*

---

## #26265 — Bug: 404 Not Found error when adding a custom Gemini provider

📅 `2026-05-08` | ✏️ **winsomely** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26265](https://github.com/anomalyco/opencode/issues/26265)


### Description

Describe the bug When adding a custom provider, a 404 Not Found error occurs. In my case, the provider is a company-proxied Gemini service. Upon checking the logs, I found that the error is caused by a request being sent to https://my-company-host/chat/completions, which returns a 404 Not Found.

To Reproduce

Add a custom provider for a proxied Gemini service.
Check the opencode.jsonc configuration file.
Notice that the provider is automatically configured with:
npm: @ai-sdk/openai-compatible
baseURL: https://my-company-host/
Attempt to use the provider, which results in the 404 error.
Workaround / Expected Behavior To make it work, I have to manually modify the opencode.jsonc file to the correct Google provider settings:

Change npm to @ai-sdk/google
Change baseURL to https://my-company-host/v1beta
After making these manual modifications, OpenCode works as expected. It seems the custom provider creation process incorrectly defaults to the OpenAI-compatible SDK instead of the Google SDK when adding a Gemini proxy.

### Plugins

_No response_

### OpenCode version

1.14.40

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

_No response_

---

## #26247 — C# lsp doesn't load on dotnet sdk supported extensions

📅 `2026-05-07` | ✏️ **NikPiermafrost** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26247](https://github.com/anomalyco/opencode/issues/26247)


### Description

When loading lsp for opencode csharp works only on .cs files. The supported files also include .cshtml, .razor, .resx

### Plugins

Only base

### OpenCode version

1.14.41

### Steps to reproduce

- Create a blazor project with dotnet new blazor
- Try to make anything in any razor component

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 26.04

### Terminal

Ptyxis

---

## #26217 — TUI blank screen in non-pure mode with external plugin; setRawMode failed with errno: 9 (macOS)

📅 `2026-05-07` | ✏️ **danisharora099** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26217](https://github.com/anomalyco/opencode/issues/26217)


## Summary
`opencode` fails to render the TUI in non-pure mode when an external plugin is configured (`oh-my-openagent` / `oh-my-opencode`). The same machine/session works with `opencode --pure`.

## Environment
- OS: macOS (`darwin 25.4.0`)
- Shell: `zsh`
- Terminal: Ghostty (also reproduced in Cursor terminal)
- OpenCode: `1.14.30`
- Plugin config tested with both identifiers:
  - `oh-my-openagent`
  - `oh-my-opencode`

## Reproduction
1. Put plugin in global OpenCode config:
   ```json
   {
     "$schema": "https://opencode.ai/config.json",
     "plugin": ["oh-my-opencode"]
   }
   ```
   (same behavior with `"oh-my-openagent"`)
2. Run `opencode`
3. Observe blank/empty TUI (no usable UI)
4. Run `opencode --pure`
5. Pure mode works normally in the same environment

## Actual Behavior
- `opencode` (non-pure): blank screen / unusable TUI
- `opencode --pure`: works
- `opencode web`: works

## Expected Behavior
Non-pure mode should render and accept input like pure mode.

## Relevant Logs
Latest failing non-pure log (`~/.local/share/opencode/log/2026-05-07T164750.log`) shows normal initialization followed by raw-mode failure:

```text
INFO  ... service=default directory=/Users/... bootstrapping
INFO  ... service=plugin name=... loading internal plugin
ERROR ... setRawMode failed with errno: 9 exception
ERROR ... error=setRawMode failed with errno: 9 process error
```

Earlier sessions also show identical error signature.

## Diagnostics Attempted
- Forced terminal type:
  - `TE

> *[Truncado — 2410 chars totais]*

---

## #26213 — OpenCode Go — API Proxy Returns cost: "0" and Dashboard Not Tracking Usage

📅 `2026-05-07` | ✏️ **kodakwest** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26213](https://github.com/anomalyco/opencode/issues/26213)


### Description

Summary

External API calls to OpenCode Go ([https://opencode.ai/zen/go/v1/chat/completions](https://nam04.safelinks.protection.outlook.com/?url=https%3A%2F%2Fopencode.ai%2Fzen%2Fgo%2Fv1%2Fchat%2Fcompletions&data=05%7C02%7Cmichael.westfall%40fleetresponse.com%7C60ccd5004e544e17cc1408deac5359d0%7C3aa6d9a12e524e668b9c44c33b83aab9%7C1%7C0%7C639137671197865612%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=lRM98c3OVuLWjCtSkMd3%2B7PmZlRjS1kRVpun15%2BtJoE%3D&reserved=0)) return "cost": "0" in the response payload for all models tested. The usage dashboard at [opencode.ai](https://nam04.safelinks.protection.outlook.com/?url=http%3A%2F%2Fopencode.ai%2F&data=05%7C02%7Cmichael.westfall%40fleetresponse.com%7C60ccd5004e544e17cc1408deac5359d0%7C3aa6d9a12e524e668b9c44c33b83aab9%7C1%7C0%7C639137671197877039%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=bX3b9jL8id6tqt4G5K5689KWtt7gMJU02HupXpihcNc%3D&reserved=0) shows inconsistent or missing tracking for these calls, while the requests themselves complete successfully.

---

Environment
- Provider: OpenCode Go (flat $10/mo subscription)
- Endpoint: [https://opencode.ai/zen/go/v1/chat/completions](https://nam04.safelinks.protection.outlook.com/?url=https%3A%2F%2Fopencode.ai%2Fzen%2Fgo%2Fv1%2Fchat%2Fcompletions&data=05%7C02%7Cmichael.westfall%40fleetre

> *[Truncado — 4740 chars totais]*

---

## #26205 — "API keys are not supported by this API" error in CLI+WSL2 with Vertex provider

📅 `2026-05-07` | ✏️ **jolsonjha** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26205](https://github.com/anomalyco/opencode/issues/26205)


### Description

Hello,

I saw [people were having issues](https://github.com/anomalyco/opencode/issues/19995) with the above error message when using Vertex + service account json/`GOOGLE_APPLICATION_CREDENTIALS` .

I am experiencing the same error, but I am authenticated to google using `gcloud auth application-default login` + `gcloud auth login`.

I have my env vars set up correctly across both Windows and WSL2.

Both Claude Code and OpenCode Desktop work, hooked up to Vertex, _in Windows_ (i.e. outside of WSL2). It's just the WSL2 + CLI combination that appears to be a problem.

### Plugins

None

### OpenCode version

1.14.41

### Steps to reproduce

1. Configure env for gcloud auth/Vertex usage (set env vars, etc)
2. Open a terminal window within a WSL2 linux install (Ubuntu LTS, installed ~1.5 years ago; upgraded periodically)
3. Run OpenCode, enter any prompt

Expected: Message to be routed to model, and to get response

Actual: `API keys are not supported by this API` error popup received

### Screenshot and/or share link

_No response_

### Operating System

Windows 11 + WSL2

### Terminal

windows

---

## #26185 — Slash commands for skills inject raw content AND expose the skill tool, causing duplicate context

📅 `2026-05-07` | ✏️ **JB-SCHREMPP-DEGETEL** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26185](https://github.com/anomalyco/opencode/issues/26185)


### Description

## Problem

When invoking a skill via a slash command with an argument (e.g. `/osiris 21709`), OpenCode:

1. Injects the raw SKILL.md content directly into the user message
2. Still exposes the `skill` tool to the model

Less capable models (observed with Claude Haiku 4.5) don't realize the skill content
is already present in the conversation and call the `skill` tool again, resulting in
the full skill being loaded twice into context.

## Impact

- **Token waste**: ~850 lines of skill instructions duplicated in context. Significant
  cost/context overhead, especially for smaller models.
- **Argument loss**: the argument passed after the slash command (`21709` in
  `/osiris 21709`) ends up buried between two copies of the skill content. Less capable
  models fail to extract it and re-ask the user for the information already provided.

## Evidence

Transcript excerpt — the user message ends with the full SKILL.md content, then
the model immediately re-loads it via the `skill` tool:

```
[... end of SKILL.md injected in user message ...]

21709

---

## Assistant (Build · Claude Haiku 4.5 · 8.8s)

I'm going to load the **osiris** skill to automate Pull Request reviews.

**Tool: skill**

**Input:**
{
  "name": "osiris"
}

**Output:**
<skill_content name="osiris">
# Skill: osiris
# Automatic Azure DevOps PR review — Back-end
## Configuration
[... same content again ...]
```
### Plugins

_No response_

### OpenCode version

1.14.40

### Steps to reproduce

1. Creat

> *[Truncado — 1852 chars totais]*

---

## #26184 — Massive token spike causing quota exhaustion in single session

📅 `2026-05-07` | ✏️ **memin-61** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26184](https://github.com/anomalyco/opencode/issues/26184)


### Description

Was using opencode go through opencode tui. Deepseek V4 Pro was selected as the model and the session was about 500k~ tokens. The chat started to slow down and every response took a minute to respond and finally I got quota exceeded.

From my observations session an3G3iVR consumed ~5 hours of quota in ~30 minutes due to input tokens ballooning from ~20k to 500k+ per request.
From usage logs:
- Normal requests (2:58-3:26 PM): 18k-21k input tokens, $0.001-$0.004 cost
- After 3:30 PM: 570k-614k input tokens, $0.98-$1.06 cost per request
15 requests after 3:30 PM cost ~$15 instead of ~$0.05 normal.
Looks like conversation context got stuck in a loop, re-sending entire 500k token history repeatedly.

If there's anything I can do to clarify, please let me know.





### Plugins

none

### OpenCode version

1.14.40

### Steps to reproduce

1. Open OpenCode TUI
2. Select deepseek-v4-pro model through OpenCode Go
3. Work in a session until it grows to ~500k tokens
4. Observe: responses slow down to ~1 minute each
5. Input tokens balloon to 500k+ per request (should stay ~500k, not multiply)
6. Quota gets exhausted in minutes instead of hours

### Screenshot and/or share link

<img width="1529" height="1848" alt="Image" src="https://github.com/user-attachments/assets/b82e15ba-82c6-4ede-9d31-d0c325a6486d" />

### Operating System

Arch Linux 6.18.22-1-lts

### Terminal

kitty

---

## #26173 — Can opencode server support change model through POST/GET？

📅 `2026-05-07` | ✏️ **PengKunPROO** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26173](https://github.com/anomalyco/opencode/issues/26173)


### Question

I read the doc，but i did not foundthere are any wat to specify a certain model with POST / GET api

---

## #26166 — OpenCode Desktop - Keeps summarizing on every message

📅 `2026-05-07` | ✏️ **Octolus** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26166](https://github.com/anomalyco/opencode/issues/26166)


### Description

It's repeating summary of what was done previously in the chat, on every change I am making when using.

While "Thinking" is active, it repeats every change i've done until now in the chat, on every single message, like a summary.

### Plugins

_No response_

### OpenCode version

v1.14.40

### Steps to reproduce

1. Start chatting with it.
2. Each time you start a new task, it for some reason keeps repeating previous tasks summary.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26165 — Webapp / opencode serve: direct project URL navigation doesn't add project to sidebar

📅 `2026-05-07` | ✏️ **mtymek** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26165](https://github.com/anomalyco/opencode/issues/26165)


### Description

When navigating directly to a project via a base64-encoded directory URL (e.g., /<base64-dir>/session/...), the project loads but does not appear in the sidebar. This happens because the project is not added to the client-side localStorage list of opened projects.

The sidebar renders from layout.projects.list(), which is derived from server.projects.list() (stored in localStorage under opencode.global.dat:server.v3). When a user navigates directly to a project URL, DirectoryLayout validates and decodes the directory, but nothing calls layout.projects.open() to add it to the sidebar state. The project exists in the server API (sdk.project.list()), but since it's not in localStorage, it's invisible in the sidebar and sessions aren't displayed.

Use-case:
- Embedding the webapp in an iframe and deep-linking to a specific project directory (e.g. in my `opencode-obsidian` plugin: https://github.com/mtymek/opencode-obsidian). 

### Plugins

N/A

### OpenCode version

1.14.*

### Steps to reproduce

1. Clear browser localStorage (or open an incognito window)
2. Navigate directly to a project URL: http://localhost:4444/<base64-encoded-project-dir>/session
3. Observe that the project loads and sessions display in the main panel
4. Look at the sidebar — the project is not listed
5. Check localStorage — opencode.global.dat:server.v3 does not contain the project

### Screenshot and/or share link

<img width="702" height="615" alt="Image" src="https://github.com/user-att

> *[Truncado — 1640 chars totais]*

---

## #26163 — Old Homebrew opencode silently breaks plugin loading — agents disappear, no error

📅 `2026-05-07` | ✏️ **Ganzhe2028** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26163](https://github.com/anomalyco/opencode/issues/26163)


## Description

After installing oh-my-openagent (or any agent-registering plugin), `oh-my-openagent doctor` reports everything OK — but `opencode agent list` only shows `build` and `plan`. All plugin-registered agents (Sisyphus, Oracle, Librarian, etc.) are silently missing.

The root cause turned out to be a **PATH conflict** between an old Homebrew-installed opencode and a newer npm-installed opencode.

## Environment

| Component | Version (broken) | Version (working) |
|---|---|---|
| opencode (Homebrew) | **1.1.8** | — |
| opencode (.opencode/bin) | 1.14.33 | **1.14.33** |
| oh-my-openagent | 3.17.15 | 3.17.15 |
| OS | macOS | macOS |

## Steps to Reproduce

1. Install opencode via Homebrew: `brew install opencode` → gets an old version
2. Separately install a newer opencode (npm, direct download, or plugin self-update)
3. Add `oh-my-openagent@latest` (or any agent plugin) to `opencode.json`
4. Run `opencode` — the Homebrew binary (old) is found first in `$PATH`
5. Run `oh-my-openagent doctor` → reports `System OK`, all agents listed
6. Run `opencode agent list` → only `build`, `plan`, `compaction`, etc. — no plugin agents

## Why This Happens

1. `brew install opencode` puts an old binary in `/usr/local/bin/opencode` (or `/opt/homebrew/bin/opencode`)
2. A newer opencode gets installed to `~/.opencode/bin/opencode` (npm/plugin update)
3. `$PATH` typically has Homebrew before `~/.opencode/bin`, so the **old binary wins**
4. The old binary (1.1.8) loads the plugin bundle 

> *[Truncado — 2988 chars totais]*

---

## #26162 — Tool call content in output

📅 `2026-05-07` | ✏️ **thomas-0816** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26162](https://github.com/anomalyco/opencode/issues/26162)


### Description

Got tool call output in content:




### Plugins

none

### OpenCode version

1.14.40

### Steps to reproduce

start llama.cpp server (b9041)

`./llama-server -hf unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF:Q4_K_XL --threads -1 --parallel 1 --ctx-size 131072 --temp 0.7 --min-p 0.0 --top-p 0.8 --top-k 20 --repeat-penalty 1.05 --predict 131072 --cache-type-k q8_0 --cache-type-v q8_0
`

set opencode.json

```
{"$schema": "https://opencode.ai/config.json",
  "enabled_providers": ["llama.cpp"],
  "lsp": true,
  "permission": {"bash": "ask", "edit": "ask"},
  "provider": {
    "llama.cpp": {
      "npm": "@ai-sdk/openai-compatible", "name": "llama-server",
      "options": {"baseURL": "http://127.0.0.1:8080/v1"},
      "models": {
        "llama.cpp": {"name": "llama.cpp", "limit": {"context": 131072, "output": 131072}}
}}}}
```

start opencode, run a prompt like "which package is currently installed?"

The problem is not happening on every attempt, but ~ 5/10.

output:

see screenshot

### Screenshot and/or share link

<img width="1219" height="967" alt="Image" src="https://github.com/user-attachments/assets/7095dbc2-372e-4142-ac96-95cb40b0ccae" />

<img width="1234" height="978" alt="Image" src="https://github.com/user-attachments/assets/af2834ce-8331-4d89-b40b-75433fe34abf" />

### Operating System

Ubuntu 24.04.4 LTS

### Terminal

konsole

---

## #26128 — Python FastMCP server (STDIO) exits immediately on Windows — Not connected

📅 `2026-05-07` | ✏️ **cioffiAI** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26128](https://github.com/anomalyco/opencode/issues/26128)


### Bug Description

A Python FastMCP server (mcp.server.fastmcp.FastMCP) exits immediately (~1 second after startup) when launched by opencode as a local MCP server via STDIO transport, returning "Not connected" on every tool call. The same server works perfectly when tested manually via subprocess with JSON-RPC over stdin/stdout.

### Steps to Reproduce

1. Create a Python FastMCP server (mcp==1.27.0)
2. Install as a CLI tool (uv tool install .) or run directly
3. Configure in opencode.jsonc as local MCP server
4. Start opencode — first tool call works, then all subsequent tool calls return "Not connected"
5. Server logs show: startup messages followed by immediate exit with no errors

### Manual Test (PASSES — server works correctly)

The same server, when tested manually via subprocess, passes all MCP protocol operations:

- initialize → protocolVersion: 2024-11-05
- tools/list → all tools returned
- tools/call → all tool calls succeed
- Process stays alive indefinitely when stdin/stdout are properly piped

### Environment

- **OpenCode version:** current dev
- **OS:** Windows 11 (PowerShell 5.1)
- **Python:** 3.13
- **MCP SDK:** 1.27.0 (mcp.server.fastmcp)
- **Server transport:** STDIO

### Additional Context

- The "Not connected" string is NOT present in the server source code — it comes from opencode's MCP client layer
- The server binary wrapper (uv tool install .exe) works correctly when tested with subprocess.Popen
- Other STDIO MCP servers (GitHub, Playwright via 

> *[Truncado — 1917 chars totais]*

---

## #26115 — `gpt-5.5` / `gpt-5.5-pro` model not working with ChatGPT account

📅 `2026-05-07` | ✏️ **seniormarketer8** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26115](https://github.com/anomalyco/opencode/issues/26115)


### Description

When selecting `gpt-5.5` or `gpt-5.5-pro` models with a connected ChatGPT account (Plus subscription active), OpenCode returns. 
Other models (DeepSeek, Qwen, MiMo) work fine. GPT models appear in the list as available. Reconnecting the provider does not help. Clearing the app cache (`%APPDATA%\opencode\EBWebView\Default\Cache`) does not resolve the issue.

**Expected behavior:** `gpt-5.5` models should work with a ChatGPT account, or should not appear as available options for this account type.

**Environment:**
- OS: Windows 11
- OpenCode: latest version
- Account: ChatGPT Plus

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26104 — cannot find oh-my-opencode agent

📅 `2026-05-07` | ✏️ **dubujianghu** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26104](https://github.com/anomalyco/opencode/issues/26104)


### Description

window desktop cannot find oh-my-opencode agent:sisyphus、promethues

<img width="1259" height="785" alt="Image" src="https://github.com/user-attachments/assets/81374a56-d578-4d2d-bf4c-3632fb0027e8" />

### Plugins

oh-my-opencode

### OpenCode version

1.14.40

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

window11

### Terminal

_No response_

---

## #26100 — After changing the model from OpenCode Go to Z.ai, the money starts to decrease.

📅 `2026-05-07` | ✏️ **maxylev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26100](https://github.com/anomalyco/opencode/issues/26100)


### Description

After changing the model from OpenCode Go to Z.ai, the money starts to decrease.

### Plugins

_No response_

### OpenCode version

1.14.40

### Steps to reproduce

1. Set subagent to `opencode-go/glm-5.1`
2. Run tasks
3. Break
4. Change subagent to `zai-coding-plan/glm-5.1`
5. Continue session

### Screenshot and/or share link

<img width="372" height="149" alt="Image" src="https://github.com/user-attachments/assets/02929623-9d67-48ee-adce-2a30f6f26621" />


<img width="386" height="121" alt="Image" src="https://github.com/user-attachments/assets/d134ad7b-c07c-45f1-8a32-e464cd390225" />

### Operating System

macOS

### Terminal

Warp

---

## #26099 — Hierarchical session filter from #24849 has no exact-match mode; -c from parent dir picks wrong child session and widens permission scope

📅 `2026-05-07` | ✏️ **malventano** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26099](https://github.com/anomalyco/opencode/issues/26099)


### Description

### Problem 1: No exact directory matching for sessions

The session list filter (added in #24849) uses a hierarchical prefix match on `path`:

```typescript
eq(path, input.path) OR like(path, input.path + "/%")
```

When launching opencode at `/root/opencode`, all sessions from child subdirectories appear in `/sessions`. The KV flag `session_directory_filter_enabled` only offers two modes:

| Value | Behavior |
|-------|----------|
| `true` (default) | Hierarchical — current dir + all children |
| `false` | `{ scope: "project" }` — ALL sessions in the project |

No option for **exact directory matching**, which was the behavior before #24849:

```typescript
if (input?.directory) { conditions.push(eq(SessionTable.directory, input.directory)) }
```

### Problem 2: Selecting a child-directory session leaves CWD unchanged

Selecting a session whose `directory` differs from where opencode was launched keeps the TUI CWD at the launch directory (`directory.ts:10` reads `project.instance.path().directory`, not the session's `directory`). No warning is shown. When the sidebar is collapsed, the parent CWD isn't visible at all — making it even harder to realize you're in the wrong session. (Related fix discussed in #23507.)

### Problem 3: `opencode -c` from a parent path lands in the wrong session

Running `opencode -c` from `/root/opencode` picks up the most recent session across all child subdirectories due to the hierarchical path filter. The user lands in a sessio

> *[Truncado — 3773 chars totais]*

---

## #26088 — [SambaNova] Cost not displayed for MiniMax M2.7 via SambaNova provider

📅 `2026-05-06` | ✏️ **GerbenCdg** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26088](https://github.com/anomalyco/opencode/issues/26088)


## Description
When using MiniMax M2.7 via the SambaNova provider, no cost is displayed in OpenCode. Token usage is shown but the `$ cost` is absent.

## Provider config
```
"sambanova": {
  "npm": "@ai-sdk/openai-compatible",
  "name": "SambaNova",
  "options": {
    "baseURL": "https://api.sambanova.ai/v1"
  },
  "models": {
    "MiniMax-M2.7": {
      "name": "MiniMax M2.7 SambaNova"
    }
  }
}
```

## Expected behavior
Cost should appear based on MiniMax pricing (input: $0.60/M tokens, output: $2.40/M tokens).

## Actual behavior
OpenCode shows token usage but no cost line.

## Likely cause
SambaNova API does not return `usage.cost` in its response. OpenCode relies on the API response for cost data.

## Suggested fix
- Support manual cost configuration per model in opencode.json (e.g. `"cost": { "input": 0.60, "output": 2.40 }` per million tokens)
- Or fallback: use models.dev pricing data when API doesn't return cost

---

## #26085 — Electron sidecar: npm plugins fail to load — peer dep @opencode-ai/plugin resolves as @local

📅 `2026-05-06` | ✏️ **n-osennij** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26085](https://github.com/anomalyco/opencode/issues/26085)


### Description

## Description

After updating OpenCode Desktop to Electron-based version 1.14.39, npm plugins fail to load. The sidecar's background dependency installer resolves the host-provided package `@opencode-ai/plugin` as `@opencode-ai/plugin@local` and fails because that version doesn't exist on npm.

## Steps to reproduce

1. Fresh opencode config with any npm plugin that has `@opencode-ai/plugin` as a peer dependency:
```json
// ~/.config/opencode/opencode.json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@tarquinen/opencode-dcp"]
}
```
2. Restart OpenCode Desktop
3. Check `~/.local/share/opencode/log/`

## Actual behavior

Plugin fails to load with two cascade errors:

```
WARN service=config dir=~/.config/opencode
  error=Cause([Fail(NpmInstallFailedError
    (cause: @opencode-ai/plugin: No matching version found for @opencode-ai/plugin@local.))])
  background dependency install failed

ERROR service=plugin path=@tarquinen/opencode-dcp
  target=file:///.../packages/@tarquinen/opencode-dcp@latest/node_modules/.../dist/index.js
  error=Cannot find module '.../dist/lib/config' imported from ...dist/index.js
  failed to load plugin
```

## Expected behavior

`@opencode-ai/plugin` is provided by the opencode host (it's a peer dependency of plugins). The sidecar should NOT attempt to install it from npm — it should be treated as an external/host-provided module during dependency resolution.

## Root cause analysis

1. The sidecar's dependency insta

> *[Truncado — 5140 chars totais]*

---

## #26074 — Cannot rebind input_submit

📅 `2026-05-06` | ✏️ **edwardpeters** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/26074](https://github.com/anomalyco/opencode/issues/26074)


### Description

(Related to https://github.com/anomalyco/opencode/issues/1505)

EDIT: I played around with it some more and found that adding tab works as expected - but ctrl+j or f1 do not. ctrl+j DID work for newlines, tho, so something is different about input_submit.

I 've been unable to get `shift+return` to input newlines (using terminator). As a workaround, I'd prefer to simply have "enter" always produce a newline, and use one of the more awkward sequences (ctrl+j) to send. However, the updated bindings do not trigger a submit at all.

### Expected Behavior

I expect to be able to rebind input_submit to some other keybinding, and then use unmodified enter as newlines.

### Observed Behavior

Some change was recognized, as hitting enter now creates a newline rather than submitting. But the newly added commands (ctrl+j, f1) do not input either; I've found no way to actually send a prompt unless input_submit is bound to return.

(see above, binding input_submit to tab does work.)

### Plugins

_No response_

### OpenCode version

1.14.19

### Steps to reproduce

1. Edit tui.json to add:
```
    "input_submit": "ctrl+j,f1",
    "input_newline": "return",
```
2. Launch opencode
3. Type something
4. Hit ctrl+j or f1
5. Be disappointed

### Screenshot and/or share link

_No response_

### Operating System

 EndeavourOS (6.18.9-arch1-2)

### Terminal

terminator 2.1.5

---

## #26063 — Tool execution aborted/terminated

📅 `2026-05-06` | ✏️ **aagarin39** | 💬 13 | 🔗 [https://github.com/anomalyco/opencode/issues/26063](https://github.com/anomalyco/opencode/issues/26063)


### Description

---

**Bug Report:**

**Environment:**
- Provider: LM Studio (opencode-compatible)
- Model: Qwen3.6-35b-A3B
- Endpoint: http://127.0.0.1:1234/v1
- OpenCode version: 1.14.39
- Error date: 05.05.2026

**Description:**
Tool execution aborted/terminated — occurs with local LM Studio models. Agent freezes prematurely during tool execution, requires manual "continue" to proceed.

**Steps to reproduce:**
1. Run opencode with LM Studio provider
2. Use Qwen3.6-35b-A3B or similar local model
3. Execute task with tool calls (bash, read, edit)
4. Tool execution aborts after ~30-60 seconds

**Expected behavior:**
Tool execution should complete without manual intervention.

**Related issues:**
- #25577 (May 3, 2026)
- #16488 (Mar 7, 2026)
- #17307 (Mar 13, 2026)

**Config:**
```json
{
  "provider": {
    "lmstudio": {
      "npm": "@ai-sdk/openai-compatible",
      "options": { "baseURL": "http://127.0.0.1:1234/v1" },
      "models": {
        "qwen3.6-35b-a3b": {
          "name": "Qwen3.6-35B-A3B",
          "limit": { "context": 100000, "output": 15000 }
        }
      }
    }
  }
}
```

---

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26062 — [Bug] SESSION END WHEN WAIT FOR BACKGROUND TASK

📅 `2026-05-06` | ✏️ **bietkhonhungvandi212** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26062](https://github.com/anomalyco/opencode/issues/26062)


### Question

WHEN I USE command

```
opencode run --thinking "message"
```
but when opencode spawn background task, it end that session without any action and notification from background task. This is some end of response for the session

```
Exploring the codebase in parallel - 3 background agents running. Waiting for results.

Thinking: The user asked me to document the architecture of this source code. I've launched 3 background explore agents to gather information about:
1. Overall codebase structure
2. Graph visualization components
3. Utilities and helpers

Now I need to wait for the system reminders that these tasks are complete. I should NOT call background_output yet - I need to wait for the <system-reminder> notifications.

Let me just end my response here and wait for the notifications.
```

 how can i run a session by cli with wait of background until the main session can collect result from background task and do action like opencode TUI but for CLI

---

## #26048 — MCP compatibility: don't error when prompts/list is unsupported (-32601)

📅 `2026-05-06` | ✏️ **122yjs** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26048](https://github.com/anomalyco/opencode/issues/26048)


## Summary
When an MCP server does not implement `prompts/list`, OpenCode Desktop logs repeated errors like:

- `MCP error -32601: Method not found failed to get prompts`

This appears to be a compatibility issue rather than a true server failure. Many MCP servers provide tools but no prompts.

## Environment
- OpenCode Desktop: `1.14.28`
- macOS: Apple Silicon
- MCP servers observed: `context7` (local), `grep_app` (remote)

## Reproduction
1. Configure an MCP server that supports tools but does not support prompts.
2. Start OpenCode Desktop.
3. Observe logs in `~/.local/share/opencode/log/*.log`.

## Actual behavior
OpenCode treats missing prompts support as an error and repeatedly logs `-32601 Method not found`.

## Expected behavior
If `prompts/list` is unsupported (`-32601`), OpenCode should treat it as "no prompts" and continue without error-level logging.

## Why this matters
- Creates noisy logs and false alarms.
- Makes healthy MCP setups look broken.
- Impacts multiple MCP servers, not one specific provider.

## Suggested fix
In MCP prompt discovery, catch `-32601` / "Method not found" for `listPrompts()` and return `[]`.

Pseudo behavior:
```ts
await client.listPrompts()
  .then(r => r.prompts)
  .catch(err => {
    if (err?.code === -32601 || /Method not found/i.test(err?.message ?? "")) {
      return []
    }
    throw err
  })
```

## Temporary workaround I validated locally
I patched the Desktop app bundle to ignore `-32601` for prompt listing, and the repeated

> *[Truncado — 1561 chars totais]*

---

## #26047 — [Bug] LSP configuration section outdated in non-English translations

📅 `2026-05-06` | ✏️ **finalquest** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26047](https://github.com/anomalyco/opencode/issues/26047)


### Description

The LSP documentation in non-English languages is missing critical information that exists in the English version.

**Specifically, the English docs say:**
- "To enable all built-in LSP servers, set `lsp` to `true`."
- Example: `{ "lsp": true }`
- "If `lsp` is omitted, all LSP servers are disabled."

**But the Spanish docs (and likely other translations) only show:**
- Example: `{ "lsp": {} }`
- No mention of `lsp: true` to enable all built-ins
- No explanation that omitting `lsp` disables all servers

**Impact:** Users reading docs in their native language don't know they need to explicitly enable LSP.

### Steps to Reproduce

1. Open https://opencode.ai/docs/lsp (English)
2. Open https://opencode.ai/es/docs/lsp (Spanish)
3. Compare the "Configure" section

### OpenCode Version

N/A (documentation issue)

### Operating System

N/A

### Terminal

N/A

### Plugins

None

### Screenshot / Share Link

- English (correct): https://opencode.ai/docs/lsp
- Spanish (outdated): https://opencode.ai/es/docs/lsp

---

## #26034 — Agent Window is too small for Windows Desktop GUI

📅 `2026-05-06` | ✏️ **MemorXuxu** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26034](https://github.com/anomalyco/opencode/issues/26034)


### Description

If the name of Agent is long, the display can not fit by the length of agent name.

### Plugins

_No response_

### OpenCode version

v1.14.39

### Steps to reproduce

1. The name of Agents is long

<img width="170" height="211" alt="Image" src="https://github.com/user-attachments/assets/bd7b9937-a9a7-4386-8b93-7b9f58d5ca14" />

### Screenshot and/or share link

<img width="203" height="210" alt="Image" src="https://github.com/user-attachments/assets/c672c869-5f9b-42a2-bc4d-b89ec505ee5d" />

### Operating System

Windows 10 

### Terminal

_No response_

---

## #26026 — Generated SDK misses HttpApi async command support

📅 `2026-05-06` | ✏️ **qz1543706741** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26026](https://github.com/anomalyco/opencode/issues/26026)


### Description

The generated v2 SDK exposes `session.commandAsync`, but the Effect HttpApi backend did not register the matching `command_async` route. Clients using the generated SDK against the HttpApi backend cannot rely on parity with the legacy route for async session commands.

### Plugins

None

### OpenCode version

dev

### Steps to reproduce

1. Use the generated v2 SDK against the HttpApi backend.
2. Call `session.commandAsync` for a session.
3. The route is not covered by the HttpApi contract/handler parity path.

### Screenshot and/or share link

N/A

### Operating System

macOS

### Terminal

N/A

---

## #25999 — After upgrading to the latest version 1.14.39, the previously installed plugins cannot be loaded

📅 `2026-05-06` | ✏️ **RowgerGo** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25999](https://github.com/anomalyco/opencode/issues/25999)


### Description

window 11  
opencode  Version   1.14.39
After upgrading to the latest version, the previously installed plugins cannot be loaded. I think as such a well-known open-source project, OpenCode often encounters these simple bugs, which is difficult for people to accept

### Plugins

oh-my-opencode

### OpenCode version

1.14.39

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

windows

### Terminal

_No response_

---

## #25991 — Docs regarding custom provider is misleading

📅 `2026-05-06` | ✏️ **erikdemarco** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25991](https://github.com/anomalyco/opencode/issues/25991)


### Description

You cant add custom provider via CLI. but this docs said you can:
https://opencode.ai/docs/providers/#custom-provider

In reality the "Other" cant be selected. Its just a label

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25986 — Token usage always shows 0 when using Zhipu Coding Plan API with @ai-sdk/openai-compatible

📅 `2026-05-06` | ✏️ **mengfanbo123** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25986](https://github.com/anomalyco/opencode/issues/25986)


## Description

When using `@ai-sdk/openai-compatible` with Zhipu's **Coding Plan** endpoint, the status bar always displays `Context: 0% used` and token cost is never tracked — despite the upstream API returning valid `usage` data in both streaming and non-streaming responses.

> **Note:** This is a **different issue** from #20885 which covers `@ai-sdk/openai` (Responses API). This issue is specific to `@ai-sdk/openai-compatible` (Chat Completions API) with Zhipu's Coding Plan endpoint.

## Configuration

```jsonc
"zhipu-coding-plan": {
  "npm": "@ai-sdk/openai-compatible",
  "options": {
    "apiKey": "{env:ZHIPU_API_KEY}",
    "baseURL": "https://open.bigmodel.cn/api/coding/paas/v4"
  }
}
```

## Steps to Reproduce

1. Configure `@ai-sdk/openai-compatible` with Zhipu Coding Plan endpoint (`/api/coding/paas/v4`)
2. Start a conversation with any model
3. Observe the status bar — `Context: 0% used` stays at zero

## Verification

I verified the upstream API returns valid `usage` data via direct curl:

### Non-streaming response

```json
{
  "usage": {
    "completion_tokens": 15,
    "prompt_tokens": 6,
    "total_tokens": 21,
    "prompt_tokens_details": { "cached_tokens": 5 },
    "completion_tokens_details": { "reasoning_tokens": 1 }
  }
}
```

### Streaming response (last chunk before `[DONE]`)

```json
{
  "usage": {
    "prompt_tokens": 6,
    "completion_tokens": 212,
    "total_tokens": 218,
    "prompt_tokens_details": { "cached_tokens": 5 },
    "completion_tokens_d

> *[Truncado — 2546 chars totais]*

---

## #25981 — [BUG]: Session scrollbar not visible in default opencode theme on Windows Terminal

📅 `2026-05-06` | ✏️ **troy818** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25981](https://github.com/anomalyco/opencode/issues/25981)


### Description
The session history scrollbar does not render in the TUI on the default `opencode` theme. It is missing in every session, regardless of content length or scrolling action.

### Environment
- OpenCode version: `1.14.30`
- OS: Windows 11 (build 26100)
- Terminal: Windows Terminal
- Shell: PowerShell 5.1.26100.8115 (Desktop edition)
- Theme: `opencode` (default)

### Reproduction
1. Launch `opencode` in Windows Terminal under PowerShell 5.1.
2. Start or open any session and generate enough output to overflow the viewport.
3. Scroll up with the mouse wheel or PgUp.

### Expected
A scrollbar appears on the right edge of the session pane indicating scroll position.

### Actual
No scrollbar is rendered at any time. Content scrolls but there is no visual scroll indicator.

### Notes
- PR #20947 (Apr 9, 2026) restored the hidden session scrollbar default; this issue persists on a build that includes that fix.
- Distinct from #17448 (solarized contrast) and #24425 (Monokai) — this is on the default `opencode` theme.

---

## #25978 — "opencode session list" doesn't list all sessions.

📅 `2026-05-06` | ✏️ **mikaelj** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/25978](https://github.com/anomalyco/opencode/issues/25978)


### Description

I have a session named Foo active.

In another terminal, I run "opencode session list". Foo is nowhere to be found, nor is the associated session ID.

Yet, I can quit the Foo session and resume it with the commandline printed out after exit, i.e "opencode -s sess_......".

### Plugins

_No response_

### OpenCode version

1.4.39

### Steps to reproduce

1. Do work in a lot of sessions so the sessions list is big
2. Keep a couple of sessions active i.e. where opencode wasn't exited
3. Rename these sesssions
4. In a terminal, run opencode session list
5. Try finding your active sessions either by name or session id.
6. Session not found. 

NOTE: Only some sessions are missing. No idea why.

### Screenshot and/or share link

_No response_

### Operating System

macOS 15.7

### Terminal

iTerm2

---

## #25970 — GLM 5.1 on NVIDIA can hang on unnamed tool calls during memory bootstrap

📅 `2026-05-06` | ✏️ **ctharvey** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25970](https://github.com/anomalyco/opencode/issues/25970)


### Description
Using `nvidia/z-ai/glm-5.1`, the provider can return `finish_reason: "tool_calls"` while omitting both the tool call `id` and `function.name` from the streamed payload. When that happens during memory bootstrap, opencode can end up stalling instead of either recovering or failing clearly.

This looks like a provider payload issue, but opencode should still handle it more gracefully.

Related reports: #25786, #24137, #6649, #10885.

### Plugins
`cth.mcp.memory`

### OpenCode version
`0.0.0-dev-202605060426`

### Steps to reproduce
1. Configure `nvidia/z-ai/glm-5.1`.
2. Run `opencode run --format json --dangerously-skip-permissions -m nvidia/z-ai/glm-5.1 "check your memory"`.
3. Observe that the model enters a tool-call path where the provider may emit arguments without a tool name/id, and the session can stall instead of resolving into a usable tool call or a clear error.

A representative malformed streamed payload looked like:

```json
{
  "finish_reason": "tool_calls",
  "delta": {
    "tool_calls": [
      {
        "function": {
          "arguments": "{}"
        }
      }
    ]
  }
}
```

### Screenshot and/or share link
N/A

### Operating System
Windows 11

### Terminal
PowerShell 7 / Windows Terminal

---

## #25963 — `--continue` resumes latest session across root-level git worktrees instead of current worktree

📅 `2026-05-06` | ✏️ **scotthaleen** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25963](https://github.com/anomalyco/opencode/issues/25963)


### Description

I run opencode as a long-lived local server, then attach to a specific checkout/worktree by passing `--dir`:

```sh
opencode serve --hostname 0.0.0.0 --port 4069 --mdns --print-logs
opencode attach http://localhost:4069 --dir /Users/scott/worktree/opencode-feature-a -c
```

I use `--dir` as the explicit target checkout/worktree directory. This workflow previously resumed the latest session for the `--dir` worktree, but that behavior seems to have changed recently.

With root-level git worktrees for the same repo:

```txt
/Users/scott/Source/opencode               [dev]
/Users/scott/worktree/opencode-feature-a   [feat/opencode-feature-a]
/Users/scott/worktree/opencode-feature-b   [feat/opencode-feature-b]
```

`-c` appears to continue the most recently updated session across all of those root-level worktrees, instead of the latest session for the `--dir` directory. For example, attaching with `--dir /Users/scott/worktree/opencode-feature-a -c` can resume a session whose directory is `/Users/scott/Source/opencode`.

This seems related to the session filtering change in #24849 / `v1.14.30`, where TUI session filtering moved to project-relative paths. For root-level worktrees, the relative path is `""` for every worktree, so all of these checkouts match the same continuation scope:

```txt
/Users/scott/Source/opencode              -> ""
/Users/scott/worktree/opencode-feature-a  -> ""
/Users/scott/worktree/opencode-feature-b  -> ""
```

Expected: `--continue` shou

> *[Truncado — 3264 chars totais]*

---

## #25960 — [BUG] OpenCode Serve Web UI causes model to loop/repeat the same response, while CLI client works normally

📅 `2026-05-06` | ✏️ **hanchaoqi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25960](https://github.com/anomalyco/opencode/issues/25960)


### Description

OpenCode version: 1.14.39 (stable channel)

OS: Linux (server running opencode serve)

Model backends: multiple OpenAI-compatible endpoints (see config below)

Deployment: local
----------------------------------------------------------------------------------------------
Expected behavior:
The model should generate a single, normal reply and stop (e.g., "Hello! How can I help you today?"), similar to using the OpenCode CLI client on Windows or a direct curl call to the backend API.

Actual behavior:
The model enters a repetitive loop, outputting variations of the greeting response over and over, such as:
The user is simply saying hello. I should respond warmly and concisely.

Hello! How can I help you today?

The user just said "hello" and there's a system reminder about plan mode being active. This is a greeting, so I should respond naturally and ask what they need help with. My response is already concise and appropriate.

Hello! How can I help you today?

The user sent another greeting. I should respond concisely and offer to help with whatever task they have in mind.

Hi! What can I help you with?

The user is greeting me again. I should respond concisely and ask what they need help with.

Hello! How can I assist you today?

The user is greeting me. I should respond concisely.

Hello! How can I help you today?

The user said hello. I should respond briefly and ask how I can help.

Hello! What can I help you with?

### Plugins

_No response_

### OpenCode

> *[Truncado — 1677 chars totais]*

---

## #25948 — 桌面版 Agent 下拉菜单不显示插件加载的 Agents

📅 `2026-05-06` | ✏️ **2013081214** | 💬 10 | 🔗 [https://github.com/anomalyco/opencode/issues/25948](https://github.com/anomalyco/opencode/issues/25948)


### Description

环境：

OpenCode 版本：1.14.39
安装方式：桌面版（C:\Users\10327\AppData\Local\Programs\OpenCode）
操作系统：Windows
插件：oh-my-openagent（已成功加载，日志证实）
问题描述：

桌面版启动后，oh-my-openagent 插件成功加载（日志显示 agents loaded {"agentKeys":["Sisyphus - Ultraworker","Hephaestus - Deep Agent",...]}, agentCount:13）
但智能体下拉菜单中只显示默认的 Agent（如 Monarch、Build、Plan），不显示已加载的插件 Agents
尝试过的解决方案：重新安装桌面版、清除缓存、更换配置文件路径，均无效
CLI 版本无此问题，opencode agent list 和 --agent 参数均正常工作
复现步骤：

安装 oh-my-openagent 插件
配置 opencode.json 包含 "oh-my-openagent"
配置 oh-my-openagent.json 定义 agents
启动桌面版
打开智能体下拉菜单 - 看不到插件 Agents
预期行为： 下拉菜单应显示所有已加载的 Agents，包括 Sisyphus - Ultraworker、Hephaestus - Deep Agent 等插件 Agents

日志证据：[config-handler] agents loaded {"agentKeys":["Sisyphus - Ultraworker","Hephaestus - Deep Agent","Prometheus - Plan Builder","Atlas - Plan Executor","build","explore","librarian","Metis - Plan Consultant","Momus - Plan Critic","multimodal-looker","oracle","plan","Sisyphus-Junior"]}
[config-handler] config handler applied {"agentCount":13,"commandCount":218}

### Plugins

oh-my-openagent

### OpenCode version

OpenCode Desktop v1.14.39

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25938 — bug: agent-browser hangs on simple commands in PowerShell 7.6

📅 `2026-05-05` | ✏️ **playeriv65** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25938](https://github.com/anomalyco/opencode/issues/25938)


<img width="1601" height="1090" alt="Image" src="https://github.com/user-attachments/assets/95e22627-4a1e-4ae4-a64f-42ad3161ee89" />

 Description

When using OpenCode in PowerShell 7.6, agent-browser commands (e.g. `agent-browser open https://example.com`) frequently hang indefinitely on simple operations that should complete in seconds.

**What works:**
- Windows Terminal (WSL) + OpenCode + agent-browser → no issues
- PowerShell 7.6 + Claude Code + agent-browser → no issues

**What hangs:**
- PowerShell 7.6 + OpenCode + agent-browser → hangs on simple commands

The issue is specific to the PowerShell + OpenCode combination. Same commands work fine when switching to WSL or using a different AI agent in the same PowerShell session.

## Steps to reproduce

1. Open PowerShell 7.6 on Windows
2. Launch OpenCode
3. Ask OpenCode to use agent-browser to visit any website (e.g. `agent-browser open https://example.com`)
4. Command hangs indefinitely, never completes

## Screenshot

![issue](https://github.com/user-attachments/assets/example)

## Environment

- **OpenCode version**: 1.14.39
- **OS**: Windows 11
- **Terminal**: PowerShell 7.6
- **agent-browser version**: 0.26.0

---

## #25931 — Chat history scroll regression — trackpad/keyboard only scrolls input history

📅 `2026-05-05` | ✏️ **yennie-dee** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25931](https://github.com/anomalyco/opencode/issues/25931)


### Description

Chat history scrolling is broken in the TUI. Previously, scrolling with the trackpad or keyboard would scroll through the conversation history. Now,                                                      
     scrolling only moves through previously typed input (command history), not the chat messages above.

### Plugins

_No response_

### OpenCode version

1.14.39 

### Steps to reproduce

1. Open OpenCode in a terminal (tested in both Ghostty and VS Code integrated terminal)                         
2. Have a conversation with several messages                                                                                                                    
3. Try to scroll up to see earlier messages using trackpad or keyboard  

### Screenshot and/or share link

**Expected behavior:**                                                                                                                                                        
Scrolling up moves through the chat message history                                                                                                                                                       
                                                                                                                                                                                                               
**Actual behavior:**                                                                                                      

> *[Truncado — 1732 chars totais]*

---

## #25913 — shell tool description advertises hardcoded 2-minute default, even when OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS is set

📅 `2026-05-05` | ✏️ **nabilfreeman** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25913](https://github.com/anomalyco/opencode/issues/25913)


### Summary

The shell tool's description text advertises a hardcoded `120000ms (2 minutes)` default timeout to the model, regardless of the runtime value of `DEFAULT_TIMEOUT` (which respects `OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS`). This trains LLMs to override operator-configured defaults with their own (often shorter) explicit `timeout` values, causing premature SIGTERM on long-running commands.

### Current behavior

In `packages/opencode/src/tool/shell/prompt.ts`, the per-shell description sections (`bashCommandSection`, `powershellCommandSection`, `cmdCommandSection`) each hardcode this line verbatim:

> You can specify an optional timeout in milliseconds. If not specified, commands will time out after 120000ms (2 minutes).

Meanwhile, the actual runtime default is computed at `packages/opencode/src/tool/shell.ts:29`:

```ts
const DEFAULT_TIMEOUT = Flag.OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS || 2 * 60 * 1000
```

When an operator sets e.g. `OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS=7200000` (2 hours), the model still reads "2 minutes" in its tool description and frequently emits explicit `timeout` values clustered around its mental model of "2 minutes" — defeating the operator's intent. Combined with the `params.timeout ?? DEFAULT_TIMEOUT` fallback at `shell.ts:603`, any LLM-supplied value wins.

### Expected behavior

The advertised default in the tool description should reflect the actual runtime `DEFAULT_TIMEOUT` value, so the model is told the tru

> *[Truncado — 2356 chars totais]*

---

## #25908 — Desktop app cannot reach LAN IP addresses - EHOSTUNREACH on all `192.168.x.x` connections

📅 `2026-05-05` | ✏️ **MadsHT** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25908](https://github.com/anomalyco/opencode/issues/25908)


### Description

The OpenCode desktop app cannot connect to MCP servers hosted on a local network. Even when pointing directly at a LAN IP (e.g. http://192.168.1.x:port), the desktop app fails with EHOSTUNREACH. The same configuration works correctly when using the terminal version of OpenCode.

This affects both type: "remote" and type: "local" (with mcp-remote) MCP configurations. The error is consistent regardless of whether a domain name or direct IP is used, confirming the issue is network isolation in the desktop app itself, not DNS resolution.

The terminal version connects successfully using the same opencode.json config, confirming the MCP server is working correctly, and the problem is specific to the desktop app's sandboxed network environment.

### Plugins

mcp-remote

### OpenCode version

Version 1.14.39 (1.14.39)

### Steps to reproduce

1. Set up an MCP server on your local network (e.g. http://192.168.1.x:8000/)
2. Configure it in opencode.json as type: "remote" with the direct LAN IP
3. Launch the OpenCode desktop app
4. Observe MCP fails with SSE error: TypeError: fetch failed: connect EHOSTUNREACH 192.168.x.x:port
5. Run the same config using opencode in a terminal - it connects successfully

### Screenshot and/or share link

<img width="757" height="72" alt="Image" src="https://github.com/user-attachments/assets/4b870664-d8f5-4ab5-9c2a-e5228c597478" />

### Operating System

macOS 15.7.4 (24G517)

### Terminal

N/A - issue is specific to the desktop app

---

## #25904 — fix: local MCP servers fail on Windows without native shell context

📅 `2026-05-05` | ✏️ **ajpintos** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25904](https://github.com/anomalyco/opencode/issues/25904)


### Description

When running local MCP servers on Windows using StdioClientTransport, the process often fails to connect or ignores injected environment variables. This happens because Node.js child_process.spawn requires an explicit shell to handle certain commands and environment context on Windows.

### Plugins

None / Standard

### OpenCode version

1.14.39

### Steps to reproduce

1- Open opencode.json on a Windows machine.

2- Add a local MCP server configuration that includes an environment block (e.g., a WordPress MCP server).

3- Use a direct command like node or npx in the command array.

4- Attempt to list or connect to the server using opencode mcp list.

5- Observe that the connection fails or environment variables are ignored because the process is spawned without a native shell context.

### Screenshot and/or share link

_No response_

### Operating System

WIndows 11

### Terminal

warp

---

## #25903 — Plugin manager selection jumps when using mouse

📅 `2026-05-05` | ✏️ **3351163616** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25903](https://github.com/anomalyco/opencode/issues/25903)


### What happened?

In the TUI plugin manager, opened via the command palette and `Plugins`, the highlighted row can jump when moving or clicking with the mouse. Keyboard up/down selection does not show the same behavior.

### Steps to reproduce

1. Open the command palette.
2. Select `Plugins`.
3. Move the mouse across the plugin list or click entries.

### Expected behavior

The highlighted row should stay under the hovered/clicked plugin without causing the list to scroll unexpectedly.

### Notes

The plugin manager feeds `DialogSelect` hover movement back into `current`, which causes the dialog to re-center the list while the mouse is still over it.

---

## #25900 — Desktop app loses conversation history when reconnecting to WSL server

📅 `2026-05-05` | ✏️ **wanwanhhh** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25900](https://github.com/anomalyco/opencode/issues/25900)


### Description

Title: Desktop app loses conversation history when reconnecting to WSL server

Description:

When using the OpenCode Desktop app connected to a WSL server (opencode serve --hostname 0.0.0.0 --port 4096), exiting and reconnecting causes the previous conversation to disappear. The session is not restored upon reconnection.

Steps to reproduce:

Start the server in WSL: opencode serve --hostname 0.0.0.0 --port 4096
Connect the Desktop app to that server
Have a conversation
Close the Desktop app (keep the WSL server running)
Reopen the Desktop app and reconnect to the same server
The previous conversation is gone
Expected behavior:

The previous session should be restored automatically upon reconnection, since session data is persisted under ~/.local/share/opencode/project/ in WSL.

Environment:

OS: Windows + WSL (Ubuntu)
OpenCode Desktop version: [fill in your version]
Connection: Desktop app → WSL server
Additional notes:

Using the TUI directly in WSL (opencode) preserves sessions across restarts. The issue only occurs when using the Desktop app connected to a WSL server.

### Plugins

_No response_

### OpenCode version

1.0.135

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Windows 11 + WSL (Ubuntu)

### Terminal

_No response_

---

## #25897 — TUI session picker hides older root sessions when recent child sessions fill list

📅 `2026-05-05` | ✏️ **jackmazac** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25897](https://github.com/anomalyco/opencode/issues/25897)


### Description

The TUI session picker can hide older resumable root sessions in projects with many recent child/subagent sessions.

The TUI bootstrap query currently requests sessions with a 30-day `start` filter and does not pass `roots: true`. The dialog then filters roots client-side, so recent child sessions can consume the server-side result window before root filtering happens. The server session list API already supports `roots=true`, so the TUI can ask for root sessions directly.

Expected behavior: `/sessions` should list historical root sessions that can be resumed, even when recent child sessions exist.

### Plugins

N/A

### OpenCode version

Observed on current `dev` source.

### Steps to reproduce

1. Use a project with historical root sessions and many newer child/subagent sessions.
2. Open the OpenCode TUI and open `/sessions`.
3. Notice older root sessions are missing even though they exist in the session database and the session list API supports root filtering.

### Screenshot and/or share link

N/A

### Operating System

macOS 15.6

### Terminal

Terminal.app / Cursor integrated terminal

---

## #25891 — GPT-5.4 nano is not available in the opencode CLI Zen /models even though it's present in the web-based Zen model list

📅 `2026-05-05` | ✏️ **petipoua** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25891](https://github.com/anomalyco/opencode/issues/25891)


### Description

GPT-5.4 nano is absent from the /models for Zen models in opencode CLI, even though it's shown to be available on the opencode web-based Zen model list.

<img width="1275" height="1747" alt="Image" src="https://github.com/user-attachments/assets/26e0738a-0347-4988-87ac-b1aa6094ed82" />

<img width="888" height="1150" alt="Image" src="https://github.com/user-attachments/assets/804bfe66-5a73-43eb-a5de-75583c14be5b" />

### Plugins

_No response_

### OpenCode version

1.14.39

### Steps to reproduce

/models, observe, no GPT-5.4 nano model.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25840 — After update to v.14.37, in desktop app. Agent not showing up the plugin list. In CLI it is working fine.

📅 `2026-05-05` | ✏️ **dxdiag11** | 💬 11 | 🔗 [https://github.com/anomalyco/opencode/issues/25840](https://github.com/anomalyco/opencode/issues/25840)


### Description

After update to v.14.37, in desktop app. Agent not showing up the plugin list. In CLI it is working fine.

### Plugins

oh-my-china

### OpenCode version

v.14.37

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="803" height="305" alt="Image" src="https://github.com/user-attachments/assets/3a59cd59-957d-453d-b755-77d89318e150" />

<img width="645" height="160" alt="Image" src="https://github.com/user-attachments/assets/d934dac9-046e-4bf1-9497-2ce3dc2c9108" />

### Operating System

macOS 26

### Terminal

_No response_

---

## #25836 — Zed cannot run bash commands if OpenCode has `ask` permission in ACP mode

📅 `2026-05-05` | ✏️ **yajo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25836](https://github.com/anomalyco/opencode/issues/25836)


### Description

Using OpenCode inside Zed through ACP, it gets stuck when trying to run a `bash` command that needs user authorization.

Looks like a resurrection of https://github.com/anomalyco/opencode/issues/3332. Relevant info from Zed side: https://github.com/zed-industries/zed/issues/53249#issuecomment-4223006482

### Plugins

None

### OpenCode version

1.14.25

### Steps to reproduce

Have this configuration for opencode:

```json
{
  "permission": {
    "bash": {
      "git commit *": "ask"
    }
  }
}
```

Have this configuration for Zed:

```json
{
  "agent_servers": {
    "OpenCode": {
      "args": [
        "acp"
      ],
      "command": "opencode",
      "type": "custom"
    }
  }
}
```

Then open OpenCode agent through Zed and ask it to commit changes.

### Screenshot and/or share link

<img width="492" height="310" alt="Image" src="https://github.com/user-attachments/assets/f3265941-16cd-450a-8ab7-bdf4e715eb88" />

### Operating System

Linux 6.19.9-zen1, NixOS, 25.11 (Xantusia), 25.11.20260429.755f5aa

### Terminal

None (ACP)

---

## #25832 — opencode cannot read images anymore.

📅 `2026-05-05` | ✏️ **arduinosvv** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/25832](https://github.com/anomalyco/opencode/issues/25832)


### Description

Until April 29 2026, i was able to ask to opencode to read an .png or .jpg image to explain what modifications to perform to an html page, opencode was able to 'see' page and correctly perform modifications, but today may 5 2026 when instruct to read an image it fails with err: Bad Request: {"error":{"message":"Error from provider: No endpoints found that support image input","code":404}} . i was using opencode 1.13.x and upgrade to 1.14.34 but same result. im using big pickle (free) as model. 


### Plugins

_No response_

### OpenCode version

1.14.34

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

rocky linux

### Terminal

tmux

---

## #25828 — opencode session stopped unpredictably

📅 `2026-05-05` | ✏️ **chptx** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25828](https://github.com/anomalyco/opencode/issues/25828)


### Description

opencode session stopped at this point (every time):
```text
...

     Now rebuild:                                                                            








     <invoke name="bash">
     <parameter name="command">make build 2>&1 | tail -20</parameter>
     <parameter name="description">Build with fixed tuple</parameter>
     <parameter name="timeout">180000</parameter>
     </invoke>
```
is it a bug? does it mean it would like to invoke command (but not invoked)? 

I'm using opencode on Ubuntu 24.04. opencode version is 1.14.35.

### Plugins

_No response_

### OpenCode version

1.14.35

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25811 — CLI prompt history is global, not project-scoped

📅 `2026-05-05` | ✏️ **bold84** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25811](https://github.com/anomalyco/opencode/issues/25811)


## Bug description

The CLI TUI prompt history (arrow-up/down navigation in the input) is stored in a single global file rather than being scoped per project. This means pressing arrow-up in one project shows messages typed in completely different projects.

## Steps to reproduce

1. Open opencode CLI in project A, type and send several messages
2. Close opencode
3. Open opencode CLI in project B
4. Press arrow-up in the input

**Expected**: See messages previously typed in project B
**Actual**: See messages from project A (and all other projects) mixed together

## Root cause

`packages/opencode/src/cli/cmd/tui/component/prompt/history.tsx:32` stores history at a global path:

```ts
const historyPath = path.join(Global.Path.state, "prompt-history.jsonl")
```

`Global.Path.state` resolves to the OS XDG state directory (`~/.local/state/opencode/`) which is shared across all projects. The file has no project identifier in its path, and the `load`/`append`/`move` functions have no project filtering.

## Suggested fix

Scope the history file per project, e.g.:

```ts
const historyPath = path.join(Global.Path.state, `${projectID}`, "prompt-history.jsonl")
```

Or use `Instance.context` to derive a project-specific path rather than the global one.

---

## #25809 — OpenCode VS Code Extension (Beta) cannot write text into clipboard cause permission denied

📅 `2026-05-05` | ✏️ **CharlesCarroll0714** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25809](https://github.com/anomalyco/opencode/issues/25809)


### Description

When I clicked to copy path button on the UI, it prompted `Failed to execute 'writeText' on 'Clipboard': Write permission denied`.



### Plugins

_No response_

### OpenCode version

1.14.35

### Steps to reproduce

1. Install OpenCode VS Code Extension (Beta) in VSCode
2. Open a project 
3. Open OpenCode Extension
4. Click the Copy Path button

### Screenshot and/or share link

<img width="1078" height="1686" alt="Image" src="https://github.com/user-attachments/assets/9f026fb1-efb4-44f4-a5d5-80a825010cbf" />

### Operating System

macOS 26.4.1 (25E253)

### Terminal

VSCode Internal Terminal (bash)

---

## #25806 — TUI: image clipboard paste silently ignored on Kitty/Ghostty (regression of #4077)

📅 `2026-05-05` | ✏️ **djmittens** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25806](https://github.com/anomalyco/opencode/issues/25806)


### Summary

Ctrl+Shift+V in the opencode TUI silently ignores **image/\*** MIME content on Wayland with Kitty / Ghostty (and likely WezTerm + others that don't pipe binary clipboard bytes through their paste action). This is a regression that's been re-reported repeatedly — most prominently in #4077 (closed by stalebot, not fixed; ~12 confirming reports across Linux/macOS/Windows). Filing a fresh issue with **root-cause analysis + a concrete fix path** since the previous one died from inactivity.

### Reproduction

1. Run opencode TUI inside Kitty (or Ghostty), no tmux required.
2. Copy a screenshot to the clipboard via any Wayland-native tool:
   - `grimblast copy area`
   - `hyprshot -s -m output -m active --clipboard`
   - GNOME Screenshot
3. In the opencode prompt, press **Ctrl+Shift+V**.

**Expected**: image saved as attachment, like opencode 1.0.x did and like alacritty currently does.
**Actual**: nothing happens. No toast, no error, no attachment.

Text paste works correctly in the same flow — only image MIME types are dropped.

### Why it works in Alacritty and not Kitty

Alacritty's `paste_from_clipboard` action pipes whatever the system clipboard contains as raw bytes into the TTY (including PNG bytes on image clipboards). opencode receives binary in the bracketed paste sequence, detects PNG signature, attaches as image.

Kitty's `paste_from_clipboard` action is **text-only by design** ([by maintainer's stated philosophy](https://sw.kovidgoyal.net/kitty/clipboard/)

> *[Truncado — 5081 chars totais]*

---

## #25802 — OpenCode does not recognize the model assigned to the subagent.

📅 `2026-05-05` | ✏️ **marcosneves04** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/25802](https://github.com/anomalyco/opencode/issues/25802)


### Description

Defining different models for the sub-agent is not being considered, returning “” (empty).

### Plugins

None

### OpenCode version

1.14.35

### Steps to reproduce

Creating a test with a sub-agent associated with a model different from the primary agents.

### Screenshot and/or share link

_No response_

### Operating System

Windows 10

### Terminal

Windows 10 Terminal, called from within VSC.

---

## #25793 — [ISSUE]: I send a message and it not responds

📅 `2026-05-05` | ✏️ **EduardoCortezB** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25793](https://github.com/anomalyco/opencode/issues/25793)


### Description

I just sent a message and OC doesnt respond Codex 5.3

### Plugins

Default

### OpenCode version

1.14.34

### Steps to reproduce

Just send a message usong Codex 5.3

### Screenshot and/or share link

_No response_

### Operating System

Windows11

### Terminal

WSL

---

## #25789 — Malformed input for a known tool is reported like an unknown tool call

📅 `2026-05-05` | ✏️ **johanhallberg** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25789](https://github.com/anomalyco/opencode/issues/25789)


### Description

## Problem

When a model selects a valid tool but emits malformed or truncated input for that tool, the failure can be routed through the `invalid` tool in a way that looks similar to an unknown tool call.

This makes it harder to distinguish between two different cases:

1. the model called a tool that does not exist
2. the model called a valid tool, but the tool input was malformed or could not be parsed

## Expected behavior

These cases should be distinguishable in the invalid-tool result, so users and maintainers can tell whether the problem was an unavailable tool or malformed input for an available tool.

## Why this matters

The two cases require different follow-up behavior:

- unknown tool: the model/tool registry mismatch should be surfaced clearly
- known tool with malformed input: the model should retry with valid input or split a large/truncated operation into smaller chunks

## Related PR

I have a small fix ready that classifies these cases separately.

### Plugins

none

### OpenCode version

dev branch / source build from anomalyco/opencode dev at 5720883d5, with fix branch based on that commit

### Steps to reproduce

1. Have a model call an existing OpenCode tool, but with malformed or truncated JSON input.
2. Observe that the failure is routed through the `invalid` tool.
3. Compare this with a model calling a tool that does not exist.
4. Both cases are hard to distinguish from the invalid-tool result, even though they mean different thing

> *[Truncado — 1718 chars totais]*

---

## #25774 — fix(provider): Anthropic normalize splits tool-call from tool-result causing dangling tool_use error

📅 `2026-05-04` | ✏️ **codeg-dev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25774](https://github.com/anomalyco/opencode/issues/25774)


### Description

In `packages/opencode/src/provider/transform.ts`, `normalizeMessages()` splits assistant turns where text trails `tool-call` blocks for Anthropic / Vertex Anthropic models. The current split filter groups only `tool-call` parts together and treats `tool-result` as non-tool content, so an assistant turn shaped like:

```
[tool-call, tool-result, text]
```

becomes:

```
msg A: [tool-result, text]
msg B: [tool-call]
```

After provider/SDK merge this still presents `tool_use` blocks without a paired `tool_result` immediately after, so Anthropic returns:

```
tool_use ids were found without tool_result blocks immediately after
```

### OpenCode version

1.14.33 (also reproduces against current `dev`).

### Steps to reproduce

1. Use a Claude / Vertex Anthropic model.
2. Have an assistant turn whose `content` ends up shaped like `[tool-call, tool-result, text]` or `[tool-call, text, tool-result]` (this can happen during reconstruction or when `tool-result` is co-located with the originating `tool-call`).
3. Send another user turn so the assistant turn is replayed in `normalizeMessages()`.
4. The provider rejects the request with `tool_use ids were found without tool_result blocks immediately after`.

The fix is small: keep `tool-call` and `tool-result` paired during the split (treat both as "tool" parts).

### Operating System

macOS 26.0.1 / 25.4.0 (Apple Silicon).

---

## #25764 — OpenAI 4xx errors render the raw response body instead of the inner error.message

📅 `2026-05-04` | ✏️ **anandgupta42** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25764](https://github.com/anomalyco/opencode/issues/25764)


## Bug

In `packages/opencode/src/provider/error.ts`, the OR-chain that extracts a human-readable error message from a JSON response body short-circuits on OpenAI's standard 4xx response shape, causing the raw response body to be dumped to the user instead of the inner `error.message`.

### Reproduction

Trigger any OpenAI 4xx error — for example by selecting a deprecated/restricted model — so the API returns:

```json
{
  "error": {
    "message": "The model `gpt-5-codex` does not exist or you do not have access to it.",
    "type": "invalid_request_error",
    "code": "model_not_found"
  }
}
```

The user sees:

```
APIError: Bad Request: {"error":{"message":"The model `gpt-5-codex` does not exist or you do not have access to it.","type":"invalid_request_error","code":"model_not_found"}}
```

…and on systems that pass the message through a redaction layer (telemetry, log scrubbers), even worse:

```
APIError: Bad Request: {?:?}
```

In production telemetry from a downstream fork, this caused users to retry the same broken model selection 3+ times in the same session because the surfaced error gave no actionable hint about what was wrong.

### Root cause

`packages/opencode/src/provider/error.ts:67`:

```ts
const errMsg = body.message || body.error || body.error?.message
if (errMsg && typeof errMsg === "string") {
  return `${msg}: ${errMsg}`
}
```

For OpenAI's `{error: {message, type, code}}` shape:
1. `body.message` → `undefined` (falsy)
2. `body.error` → the **object** `

> *[Truncado — 2496 chars totais]*

---

## #25758 — thinking is enabled but reasoning_content is missing in assistant tool call message at index ...

📅 `2026-05-04` | ✏️ **jc01rho** | 💬 11 | 🔗 [https://github.com/anomalyco/opencode/issues/25758](https://github.com/anomalyco/opencode/issues/25758)


### Description

using 1.14.33, TUI, with opencode go,  kimi-2.6 and deepseek-v4-pro,

kimi
```
Server: cloudflare\n\nBody:\n{\"error\":{\"message\":\"Error from provider: Provider returned error\",\"code\":400,\"metadata\":{\"raw\":\"{\\\"error\\\":{\\\"message\\\":\\\"thinking is enabled but reasoning_content is missing in assistant tool call message at index 13\\\",\\\"type\\\":\\\"invalid_request_error\\\"}}\",\"provider_name\":\"Moonshot AI\",\"is_byok\":true}},\"user_id\":\"user_2z4xm5LomaIHfsnVqMhFsWrVrGY\"}
```



deepseek
```
Server: cloudflare\n\nBody:\n{\"error\":{\"message\":\"Error from provider (DeepSeek): The `reasoning_content` in the thinking mode must be passed back to the API.\",\"type\":\"invalid_request_error\",\"param\":null,\"code\":\"invalid_request_error\"}}\n"
```


i think releated with 
 https://github.com/anomalyco/opencode/issues/24722
https://github.com/anomalyco/opencode/issues/23887


### Plugins

omo

### OpenCode version

1.14.33

### Steps to reproduce

hard to reproduce it. sorry.

### Screenshot and/or share link

_No response_

### Operating System

windows 11, wsl ubuntu24

### Terminal

windows terminal

---

## #25755 — temperature not sent in request body for custom OpenAI-compatible provider

📅 `2026-05-04` | ✏️ **klangmuster** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25755](https://github.com/anomalyco/opencode/issues/25755)


### Description

When using a custom @ai-sdk/openai-compatible provider, the temperature parameter configured in agent frontmatter or in opencode.json under agent is never included in the /v1/chat/completions request body.

Verified with tcpdump on lo:8080 — no temperature field appears regardless of:

frontmatter temperature: 0.3 in agent .md file
"agent": { "review": { "temperature": 0.3 } } in opencode.json
model name (tested with qwen3-moe-thinking and neutral alias review-agent)
Works with: Anthropic provider (per official docs example)

Config: custom provider via @ai-sdk/openai-compatible, baseURL: http://localhost:8080/v1

### Plugins

_No response_

### OpenCode version

1.14.33

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Arch Linux

### Terminal

_No response_

---

## #25754 — bug: experimental.chat.messages.transform plugin contract is ambiguous — reassigning `output.messages` is a silent no-op (requires in-place splice)

📅 `2026-05-04` | ✏️ **RobinVivant** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25754](https://github.com/anomalyco/opencode/issues/25754)


## Bug

`experimental.chat.messages.transform` plugins that filter the message array via `output.messages = newArray` are silent no-ops. The mutation never reaches the LLM call. The transform plugin contract requires **in-place** mutation of the original array via `splice`, but this is not documented anywhere — the natural intuition (and what every linter/typechecker would suggest) is to assign to `output.messages`, which silently does nothing.

## Reproduction

```js
// my-plugin.js
export default async () => ({
  'experimental.chat.messages.transform': async (_input, output) => {
    // Try to drop the second message:
    const filtered = output.messages.filter((_, i) => i !== 1);
    output.messages = filtered;          // ❌ no-op
    // messages.splice(0, output.messages.length, ...filtered);  // ✅ works
  },
});
```

Wire it into `opencode.json`, run any session with ≥2 messages. The "filtered" message is still sent to the API.

## Why it happens

In the bundled binary (v1.14.33):

```js
yield* $.trigger("experimental.chat.messages.transform", {}, { messages: e });
let [..., T1] = yield* K.all([..., Q1.toModelMessagesEffect(e, G_)]);
```

The trigger receives `{ messages: e }`. The plugin mutates `output.messages = X`, which sets a new property on the wrapper object. But the next line passes `e` (the original array reference) directly to `toModelMessagesEffect`. The wrapper's new property is never read.

The **only** way to mutate the payload is to mutate `e` in place. M

> *[Truncado — 4234 chars totais]*

---

## #25733 — Session retry loops forever — no max attempt cap or configurable limit

📅 `2026-05-04` | ✏️ **Fatty911** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25733](https://github.com/anomalyco/opencode/issues/25733)


## Description

`SessionRetry.policy()` in `retry.ts` retries retryable errors indefinitely with no maximum attempt count. The `policy()` function stops only when `retryable()` returns undefined (non-retryable error). Once an error is classified as retryable, the schedule retries forever.

This is the same underlying problem described in #21960, #17648, and #12234.

## Steps to reproduce

1. Use a provider that returns persistent 429/overloaded errors (e.g., GitHub Copilot weekly limit exhausted)
2. Send any message
3. Observe the session retrying forever with exponential backoff

## Expected behavior

- Configurable max retry attempts (e.g., `experimental.max_retries`)
- After max attempts exhausted, session should stop and surface the error
- Backward compatible: existing behavior preserved when not configured

## Suggested fix location

- `packages/opencode/src/config/config.ts` - add `experimental.max_retries` to schema
- `packages/opencode/src/session/retry.ts` - add max attempt check in `policy()`

---

## #25722 — Dart language server not auto-detected despite dart being in PATH

📅 `2026-05-04` | ✏️ **xpufx** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/25722](https://github.com/anomalyco/opencode/issues/25722)


### Description

dart is installed and in PATH:

```
$ which dart
/home/user/.flutter/bin/dart

$ dart language-server --help
Start Dart's analysis server.
```

OpenCode recognizes .dart files for syntax highlighting but never
auto-detects the Dart language server. LSP tab shows "No language
servers running" even after opening .dart files.

Before adding config, diagnostics return empty:

```
$ opencode debug lsp diagnostics lib/main.dart
{}


Had to manually add this to opencode.jsonc:

```
  "lsp": {
    "dart": {
      "command": ["dart", "language-server", "--protocol=lsp"],
      "extensions": [".dart"]
    }
  }
```

After restart, LSP connects fine and diagnostics work. Should be
auto-detected like gopls or pyright when dart is in PATH.

Opencode Version: 1.14.33
Steps to Reproduce: Have 'dart' in path then have agent read dart code.
Operating System: Ubuntu 24
Terminal: zsh

---

## #25713 — Agent name resolution broken when username contains "agent"

📅 `2026-05-04` | ✏️ **neochrome** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25713](https://github.com/anomalyco/opencode/issues/25713)


### Description

When running OpenCode inside a Docker container (or any environment where the
home directory path contains the substring `/agent/`, e.g. `/home/agent/`),
all custom agents get map keys like `.config/opencode/agents/build` instead of
the expected bare name `build`.

## Root cause
`sliceAfterMatch` in `packages/opencode/src/config/entry-name.ts` uses
`String.indexOf` against the full absolute path. The search patterns are tried
in order:
1. `/.opencode/agent/`
2. `/.opencode/agents/`
3. `/agent/`
4. `/agents/`
For a file at `/home/agent/.config/opencode/agents/build.md`, pattern 3
(`/agent/`) matches at position 5 — the username in the home dir path — before
pattern 4 (`/agents/`) can match the correct config subdirectory. The slice
after that false match yields `.config/opencode/agents/build` as the agent key.
## Suggested fix
Use `lastIndexOf` instead of `indexOf` so the deepest (rightmost) match wins,
or anchor the search to the portion of the path relative to the config
directory rather than the full absolute path.

### Plugins

_No response_

### OpenCode version

1.14.33

### Steps to reproduce

Run OpenCode as a user whose home directory contains `/agent/` in the path
(e.g. username `agent` in a Docker container). Run `opencode debug config` and
observe agent keys.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25708 — bug: @opencode-ai/plugin 1.14.33 still pulls vulnerable effect/uuid runtime chain

📅 `2026-05-04` | ✏️ **j0k3r-dev-rgl** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25708](https://github.com/anomalyco/opencode/issues/25708)


### Description
`@opencode-ai/plugin@1.14.33` still pulls a vulnerable runtime dependency chain through `effect`:

- `@opencode-ai/plugin@1.14.33 -> effect@4.0.0-beta.57 -> uuid@13.x`

This still shows up in downstream `npm audit` results even when the consumer plugin does not use `uuid` directly.

Advisory:

- `uuid` missing buffer bounds check in certain v3/v5/v6 code paths: `GHSA-w5hq-g745-h8pq`

I re-verified this after OpenTUI was updated. `@opentui/core@0.2.2` is no longer part of the remaining audit problem, so the remaining issue appears isolated to the plugin dependency chain.

### Plugins
opencode-sdd-engram-manage

### OpenCode version
Package-level issue confirmed against `@opencode-ai/plugin@1.14.33`

### Steps to reproduce
1. Create a clean Node project.
2. Install `@opencode-ai/plugin@1.14.33`, `@opentui/core@0.2.2`, `@opentui/solid@0.2.2`, and `solid-js@1.9.12`.
3. Run `npm audit --omit=dev`.
4. Observe the `uuid <14.0.0` advisory via `effect@4.0.0-beta.57`.

Dependency chain verified from a real downstream plugin project:

```text
@opencode-ai/plugin@1.14.33
└─ effect@4.0.0-beta.57
   └─ uuid@13.x
```

### Screenshot and/or share link
No screenshot. Verification was done from a downstream repro project and package metadata inspection.

### Operating System
Ubuntu 24.04

### Terminal
Ghostty

---

## #25703 — Failed to open OpenCode panel: spawn opencode ENOENT

📅 `2026-05-04` | ✏️ **adumont** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25703](https://github.com/anomalyco/opencode/issues/25703)


### Description

Opencode Beta extension in VSCode fails to open OpenCode Assistent

Ctrl+Shift+P: "Open OpenCode Assistant"

Fails with:

```
OpenCode extension activated
Opening OpenCode panel...
📁 Workspace folder: scratch
📁 Workspace URI: file:///c%3A/Projects/scratch
📁 Workspace fsPath: c:\Projects\scratch
📁 Process cwd: C:\Users\username\AppData\Local\Programs\Microsoft VS Code
📁 Final workspace path: c:\Projects\scratch
Initializing OpenCode application...
🚀 Starting OpenCode server...
🔍 Found config at: C:\Users\username\.local\share\opencode\auth.json
✅ Loaded OpenCode configuration
❌ Failed to start OpenCode server: spawn opencode ENOENT
❌ Error stack: Error: spawn opencode ENOENT
	at ChildProcess._handle.onexit (node:internal/child_process:285:19)
	at onErrorNT (node:internal/child_process:483:16)
	at process.processTicksAndRejections (node:internal/process/task_queues:89:21)
Failed to initialize OpenCode application: Error: spawn opencode ENOENT
❌ Failed to open OpenCode panel: spawn opencode ENOENT

``` 

VSCode version:

``` 
[Window Title]
Visual Studio Code

[Main Instruction]
Visual Studio Code

[Content]

Version: 1.118.1 (user setup)
Commit: 034f571df509819cc10b0c8129f66ef77a542f0e
Date: 2026-04-29T17:36:44+03:00 (5 days ago)
Electron: 39.8.8
ElectronBuildId: 13870025
Chromium: 142.0.7444.265
Node.js: 22.22.1
V8: 14.2.231.22-electron.0
OS: Windows_NT x64 10.0.26100

[Copy] [OK]
``` 

OpenCode Beta extension version:

```
Identifier sst-dev.opencode-v2
Versi

> *[Truncado — 1813 chars totais]*

---

## #25695 — unable to create new session and open opencode cli

📅 `2026-05-04` | ✏️ **Rvey** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25695](https://github.com/anomalyco/opencode/issues/25695)


### Description

unable to create new session and open opencode cli 

### Plugins

non

### OpenCode version

idk know i can run it

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="1505" height="254" alt="Image" src="https://github.com/user-attachments/assets/00cb9b22-a562-4615-8ecf-bdd4788a21df" />

### Operating System

macos 

### Terminal

iterm2

---

## #25686 — Project-level skills missing from available-skills in REST API sessions

📅 `2026-05-04` | ✏️ **twhittock** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25686](https://github.com/anomalyco/opencode/issues/25686)


## Description

Project-level skills (from `.opencode/skills/`) are missing from the `<available-skills>` system prompt block in sessions created via the REST API (`POST /session` + `POST /session/{id}/prompt_async`). Only user-level skills (`~/.config/opencode/skills/`) appear. Calling `use_skill("project-skill")` returns "not found".

Interactive sessions (TUI/web) see all skills correctly.

## OpenCode version

1.0.203+

## Steps to reproduce

1. Create a project with skills in `.opencode/skills/`
2. Start `opencode serve`
3. Create a session via REST API: `POST /session` with `directory` pointing to the project
4. Send a prompt: `POST /session/{id}/prompt_async`
5. Observe: `<available-skills>` only shows user-level skills
6. `use_skill("project-skill")` returns "not found"

## Root Cause

`Skill.state` and `Skill.discovered` use `InstanceState`, which is backed by Effect's `ScopedCache`. The `ScopedCache.make` constructor captures the Effect context at construction time and merges it into `lookup` calls via `effect.updateContext` (see `effect/ScopedCache.ts:82-85`):

```ts
self.lookup = (key: Key): Effect.Effect<A, E> =>
  effect.updateContext(
    options.lookup(key),
    (input) => Context.merge(context, input)
  )
```

When `InstanceState.make` runs during app initialization, `InstanceRef` is **not** in scope. The captured `context` therefore lacks `InstanceRef`, and all subsequent `ScopedCache.get` lookups merge this stale context — even when the calling fiber has `I

> *[Truncado — 3037 chars totais]*

---

## #25668 — Plugin loading intermittently hangs when .git directory exists (Windows)

📅 `2026-05-04` | ✏️ **Alfroul** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25668](https://github.com/anomalyco/opencode/issues/25668)


## Bug Description

When starting opencode in a directory that contains a `.git` folder, the plugin loading phase intermittently hangs indefinitely. The TUI shows "Loading plugins..." and becomes completely unresponsive (Ctrl+C doesn't work). This happens ~80% of the time in git-tracked project directories.

## Reproduction Steps

1. Install `oh-my-openagent` plugin (a 130K-line bundled JS module)
2. Add to `opencode.json`: `"plugin": ["oh-my-openagent"]`
3. Start opencode in **any directory with a `.git` folder**
4. Observe: TUI shows "Loading plugins..." and hangs

## Key Findings

- **Without `.git`** in the working directory -> always starts successfully
- **Without any plugin** configured -> always starts successfully (even with `.git`)
- **Both `.git` + plugin are required** to trigger the hang
- When it hangs, **plugin JS code never begins executing** - a `console.error` placed at the very first line of the module (before any other code) does not produce output
- The hang happens at the `await import(entry)` stage in the plugin loader
- When it does succeed, the full plugin loads normally with no issues

## Environment

- **OS**: Windows 11 (build 26200)
- **opencode**: v1.14.33 (Bun-compiled binary)
- **Embedded Bun**: v1.3.13
- **Plugin**: oh-my-openagent v3.17.5 (~3.8MB bundled `dist/index.js`, 130K lines)
- **Git**: v2.x (even a tiny 3-commit, 0.07MB repo triggers it)

## What We Tried

| Attempt | Result |
|---------|--------|
| Set `OMO_DISABLE_POSTHOG=true` | No

> *[Truncado — 2838 chars totais]*

---

## #25664 — pkill -f command causes tool call hang in opencode TUI

📅 `2026-05-04` | ✏️ **zenoda** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25664](https://github.com/anomalyco/opencode/issues/25664)


### Description

**Summary**  
In opencode TUI, sending `Execute：pkill -f vim 2>/dev/null; echo "killed"` causes the bash tool call to hang until timeout. Replacing `-f` with `-x` or omitting the flag makes the command finish quickly. The issue occurs regardless of whether any vim process is running.

**Steps to Reproduce**  
1. Open opencode TUI.  
2. Send the message:  
   `Execute：pkill -f vim 2>/dev/null; echo "killed"`  
3. Observe that the tool call hangs and does not complete until timeout.  
4. Repeat the test with:  
   - `Execute：pkill -x vim 2>/dev/null; echo "killed"`  
   - `Execute：pkill vim 2>/dev/null; echo "killed"`  
   These complete immediately.

**Actual Result**  
- With `pkill -f`, the bash tool call stalls and eventually times out.  
- The behavior is identical whether a vim process exists or not.

**Expected Result**  
All three variations should finish quickly, returning the output `killed` , without hanging.

**CLI Test (for comparison)**  
Testing with `opencode run` shows different behavior:  
```
$ opencode run 'Execute：pkill -f vim 2>/dev/null; echo "killed"'
> build · deepseek-v4-pro
[1]    25889 terminated  opencode run 'Execute：pkill -f vim 2>/dev/null; echo "killed"'
```
The CLI command terminates itself, while the TUI hangs.

With `-x` or no flag:  
```
$ opencode run 'Execute：pkill -x vim 2>/dev/null; echo "killed"'
> build · deepseek-v4-pro
$ pkill -x vim 2>/dev/null; echo "killed"
killed

killed
```
Works correctly.

**Additional Informa

> *[Truncado — 2182 chars totais]*

---

## #25661 — [BUG] Open Project search returns no results for Korean folder names on macOS

📅 `2026-05-04` | ✏️ **ysm-dev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25661](https://github.com/anomalyco/opencode/issues/25661)


### Description

In the web/serve "Open project" modal, searching for a folder by its Korean name returns no results even though the folder exists.

Two root causes:

1. macOS legacy paths can be stored in NFD (e.g. `한` = `ㅎ` + `ㅏ` + `ㄴ`) while the browser IME emits NFC (`한` = single U+D55C). `fuzzysort` compares raw code points, so the same visible string never matches.
2. The search input fires `onChange` for every IME composition update, so each intermediate jamo (`ㅎ` → `하` → `한`) triggers a fresh SDK call and refilter. The list flickers and a clean search is never run on just the final composed value.

Likely the same underlying problem as the closed report #7577.

### Plugins

_No response_

### OpenCode version

1.14.33 (dev)

### Steps to reproduce

1. `mkdir ~/한국어테스트`
2. Run `opencode serve` and open the web UI
3. Click "Open project" → type `한`
4. Expected: `한국어테스트` appears in the list. Actual: no results.

### Screenshot and/or share link

_No response_

### Operating System

macOS

### Terminal

_No response_

---

## #25650 — MCP remote type: Accept header missing for Streamable HTTP servers (HTTP 400)

📅 `2026-05-03` | ✏️ **lucianolixin** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25650](https://github.com/anomalyco/opencode/issues/25650)


## Bug Description

When connecting to remote MCP servers that implement the Streamable HTTP transport (e.g., Zhipu/BigModel MCP servers at `open.bigmodel.cn`), OpenCode fails to connect. The server returns HTTP 400 with the error:

> **"Accept header must include both application/json and text/event-stream"**

## Steps to Reproduce

1. Configure a remote MCP server that uses Streamable HTTP transport in `opencode.json`:
```json
{
  "mcp": {
    "web-search-prime": {
      "type": "remote",
      "url": "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer <api_key>"
      }
    }
  }
}
```
2. Start OpenCode
3. The MCP server fails to connect — no tools from this server are available in the session

## Expected Behavior

OpenCode's MCP client should send requests with the `Accept` header including both `application/json` and `text/event-stream`:
```
Accept: application/json, text/event-stream
```

This is required by the [MCP Streamable HTTP transport spec](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) for servers that support both response modes.

## Actual Behavior

OpenCode sends requests without the required `Accept` header values, causing the server to reject the connection with HTTP 400.

## Verification

Manual curl test confirms the issue:
```bash
# Without Accept header → 400
curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://open.bigmodel.cn/api/mcp/web_searc

> *[Truncado — 2883 chars totais]*

---

## #25644 — Raw <tool_calls> markup in reasoning breaks tool calls on several models

📅 `2026-05-03` | ✏️ **Zireael** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25644](https://github.com/anomalyco/opencode/issues/25644)


## Description
I’m seeing OpenCode produce raw `<tool_calls>`, `<tool_call>`, `<tool_sep>`, `<arg_key>`, and `<arg_value>` markup inside `reasoning` text. Once that happens, the following tool call can fail with a JSON parse error.

```
# invalid [tool=bash, error=Invalid input for tool bash: JSON parsing failed: Text: {"command": "git diff 94db11c..f503075 --stat</arg_value>\n<arg_key>description</arg_key>:\n<arg_value>Show files changed in the diff range</arg_value>\n.
Error message: JSON Parse error: Unterminated string]
The arguments provided to the tool are invalid: Invalid input for tool bash: JSON parsing failed: Text: {"command": "git diff 94db11c..f503075 --stat</arg_value>\n<arg_key>description</arg_key>:\n<arg_value>Show files changed in the diff range</arg_value>\n.
Error message: JSON Parse error: Unterminated string
[JSON PARSE ERROR - IMMEDIATE ACTION REQUIRED]
You sent invalid JSON arguments. The system could not parse your tool call.
STOP and do this NOW:
1. LOOK at the error message above to see what was expected vs what you sent.
2. CORRECT your JSON syntax (missing braces, unescaped quotes, trailing commas, etc).
3. RETRY the tool call with valid JSON.
DO NOT repeat the exact same invalid call.
Click to collapse
# invalid [tool=bash, error=Invalid input for tool bash: JSON parsing failed: Text: {"command": "git diff 94db11c..f503075 -- src/contracts.ts</arg_value>\n<arg_key>description</arg_key>:\n<arg_value>Show contracts.ts changes</arg_value>.
Error mes

> *[Truncado — 3909 chars totais]*

---

## #25639 — README incorrectly claims Claude Code doesn't have LSP support

📅 `2026-05-03` | ✏️ **HackAttack** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25639](https://github.com/anomalyco/opencode/issues/25639)


### Description

Claude code does have LSP support, documented [here](https://code.claude.com/docs/en/discover-plugins#code-intelligence), so this is not a difference between the two products.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25635 — LSP initialize timeout (45s) not configurable -- breaks rust-analyzer and roslyn on large projects (Windows)

📅 `2026-05-03` | ✏️ **flupkede** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25635](https://github.com/anomalyco/opencode/issues/25635)


## Problem

On Windows with large Rust/C# projects, rust-analyzer and roslyn-language-server both exceed the hard-coded 45s initialize timeout in packages/opencode/src/lsp/client.ts.

After the timeout, the server gets added to the broken Set and is **never retried for the rest of the session**. The LSP sidebar stays stuck on the placeholder text forever.

Log evidence:
```ERROR service=lsp.client serverID=rust error=Operation timed out after 45000ms initialize
ERROR service=lsp error=LSPInitializeError Caused by: Operation timed out after 45000ms```n
## Why 45s is not enough

- rust-analyzer on a large Rust project (cold start) regularly takes 60-120s on Windows
- roslyn-language-server on large .NET solutions has the same problem
- Once in broken, there is no recovery without a full OpenCode restart -- and the cold-start problem repeats

## Prior art

- Issue #7477 -- requested configurable timeout, stale-closed
- PR #6997 -- implemented per-LSP timeout field, stale-closed without merge

## Proposed fix

Per-LSP timeout in opencode.json:
```json
{
  "lsp": {
    "rust": { "timeout": 120000 },
    "csharp": { "timeout": 120000 }
  }
}```n
Or simply bump the default. Claude Code solved this in v2.1.50 with a startupTimeout field per LSP plugin.

---

## #25630 — Regression: plugin provider.models() hook no longer populates custom providers (post #25167)

📅 `2026-05-03` | ✏️ **ErcinDedeoglu** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/25630](https://github.com/anomalyco/opencode/issues/25630)


## Summary

After PR #25167 (commit `560baae`, merged April 30 2026, shipped in v1.14.x), the plugin `provider.models()` hook can no longer populate models for **custom providers** — i.e. providers declared by the user in `opencode.jsonc` whose `id` is not present in the public models.dev catalog. This is a regression: the same plugin code worked on versions shipped before April 30.

## Root cause (located in `packages/opencode/src/provider/provider.ts`)

The PR moved the plugin hook iteration from running *after* config processing to *before*, and switched the lookup from the live `providers` map to the pre-config `database` map:

**Before (worked):**
```ts
// ran AFTER configProviders were merged into providers
for (const hook of plugins) {
  ...
  const provider = providers[providerID]   // live map, includes user-config providers
  if (!provider) continue
  provider.models = await models(provider, ...)
}
```

**After PR #25167 (broken for custom providers):**
```ts
// runs BEFORE configProviders loop
for (const hook of plugins) {
  ...
  const provider = database[providerID]    // models.dev catalog only
  if (!provider) continue                  // ← skips any custom provider
  provider.models = await models(provider, ...)
}
```

`database` is built from `modelsDev` (the public models.dev catalog at `~/.cache/opencode/models.json`). Any provider declared exclusively in user config — e.g. a local proxy, a self-hosted endpoint, or any other non-catalog provider — is not in

> *[Truncado — 4279 chars totais]*

---

## #25617 — System prompt misleadingly describes opencode as "CLI tool" in Desktop App mode

📅 `2026-05-03` | ✏️ **changxumiao** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25617](https://github.com/anomalyco/opencode/issues/25617)


### Description

## System prompt inaccurately describes the running mode as "CLI tool"

### Description

The system prompt starts with the line:

> "You are opencode, an interactive CLI tool that helps users with software engineering tasks."

This static description does not distinguish between different running modes (CLI, TUI, Desktop App). When running in the **Desktop App** (or potentially TUI mode), the LLM still receives "interactive CLI tool" as its identity, which is misleading.

### Impact

This caused the LLM to incorrectly believe it was running in a pure CLI environment, leading to:
- Incorrectly stating that MCP tools are unavailable (when they are actually injected and fully functional)
- Confusion about which tools can be used

The MCP tools and other desktop-specific capabilities are correctly injected at the tool level, so the system works fine functionally — the issue is purely about the misleading initial context.

### Suggested Fix

Update the system prompt to use a more generic description, for example:

> "You are opencode, an AI coding agent that helps users with software engineering tasks."

Or better, dynamically include the running mode in the context so the LLM can adapt its expectations accordingly.

### Environment
- opencode Desktop App
- Windows

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Termina

> *[Truncado — 1516 chars totais]*

---

## #25593 — Cannot review files changed in a subfolder of a monorepo

📅 `2026-05-03` | ✏️ **walidsi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25593](https://github.com/anomalyco/opencode/issues/25593)


### Description

In the OpenCode Desktop app for Windows, if I have a monorepo with several projects each in its own subfolder, I cannot review changes I made to a project unless I open the root folder containing the .git hidden folder. If I open the project folder directly, the review tab shows the names of the changed files, but clicking on any of them opens an empty tab.

### Plugins

_No response_

### OpenCode version

OpenCode Desktop v1.14.33

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="1659" height="887" alt="Image" src="https://github.com/user-attachments/assets/79aa3fe2-b39f-4995-8a41-df9d9f4fce2b" />



<img width="1657" height="887" alt="Image" src="https://github.com/user-attachments/assets/cc92c679-e4bc-41bd-8c75-2dbc036c322e" />

### Operating System

Windows 11

### Terminal

_No response_

---

## #25578 — Project name and icon color not persisting after rename — desktop client fails to save changes to .dat files

📅 `2026-05-03` | ✏️ **makocult** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25578](https://github.com/anomalyco/opencode/issues/25578)


### Description

On the opencode desktop client (macOS), project customizations such as project name and icon color fail to persist after renaming or changing them through the project settings UI.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

1. Open the opencode desktop client
2. Select a project from the left sidebar
3. Open project settings (right-click → Settings, or via the UI)
4. Change the project name to something custom (e.g., "My Project")
5. Click Save / confirm the change
6. Observe that the name reverts to the previous value (or remains empty/unchanged) after restarting the client or switching projects

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25577 — Tool execution aborted

📅 `2026-05-03` | ✏️ **fractalswift** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25577](https://github.com/anomalyco/opencode/issues/25577)


<img width="856" height="507" alt="Image" src="https://github.com/user-attachments/assets/a1ad6cf0-b083-4864-87ff-6bde01cedfd6" />

### Description

Tool execution aborted - almost always happens on claude opus and sonnet models. 
Would be cool if we could build in some kind of auto-restart on this situation?
at the moment I just have to be there to write "continue" and press enter.
I actually have a cloud server set up so i can login on tailscale and do this while I'm out.
But obviously it's annoying for tasks that could be long running and independent. 

### Plugins

_No response_

### OpenCode version

OpenCode 1.14.29

### Steps to reproduce

Just get claude opus 4.6 or sonnet to do a long running task like build a whole feature for review.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25543 — Shell config cannot pass login arguments to fish

📅 `2026-05-03` | ✏️ **smorimoto** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25543](https://github.com/anomalyco/opencode/issues/25543)


## Description

The `shell` config option accepts a string and correctly appears in `opencode debug config`, but it does not appear to support passing shell arguments such as `--login`.

This makes it difficult to use shells that need login/profile initialisation for the agent `bash` tool. In my case, fish loads Homebrew PostgreSQL into `PATH` from `~/.config/fish/config.fish`:

```fish
fish_add_path --path /opt/homebrew/opt/postgresql@18/bin
```

With this config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "shell": "/opt/homebrew/bin/fish"
}
```

`psql` was not available to the agent tool execution environment.

I then tried to make fish a login shell:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "shell": "/opt/homebrew/bin/fish --login"
}
```

`opencode debug config` showed the configured value, but tool execution still did not get the expected login-shell `PATH`; `psql` remained unavailable. This looks similar to the `ENOENT`/argument handling class of issue described in #6703, but on macOS/fish rather than Windows/pwsh.

A wrapper script works around the issue:

```sh
#!/usr/bin/env sh
exec /opt/homebrew/bin/fish --login "$@"
```

Then:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "shell": "/Users/smorimoto/.local/bin/opencode-fish-login"
}
```

After restarting OpenCode, the agent tool environment could find `psql`:

```text
SHELL=/opt/homebrew/bin/fish
/opt/homebrew/opt/postgresql@18/bin/psql
psql (PostgreSQL) 18.3 (Home

> *[Truncado — 3427 chars totais]*

---

## #25495 — Moonshot/Kimi K2.6 rejects tool schemas with nesting depth > 10, breaking all tool calls

📅 `2026-05-02` | ✏️ **nateGeorge** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25495](https://github.com/anomalyco/opencode/issues/25495)


**Bug description**

Moonshot/Kimi K2.6 models enforce a strict JSON schema depth limit of 10 levels. When using tools with deeply nested schemas (e.g., Klaviyo API campaign message definitions with 11-12 levels of nested `anyOf` / `properties`), the model rejects the request with:

```
Invalid request: tools.function.parameters is not a valid moonshot flavored json schema, details: schema depth exceeds maximum limit of 10
```

This means **all tool calls fail** on Kimi K2.6 when any tool defines a schema with depth > 10. The error is not per-tool — it's per-request, so one deeply nested tool breaks the entire tool-use capability.

**Steps to reproduce**

1. Configure model to `kimi-k2-6` or any Moonshot model
2. Use a tool with deeply nested schema (e.g., Klaviyo `create_campaign` with mobile_push badge configuration)
3. Any prompt that triggers tool use will fail with schema depth error

**Expected behavior**

Tool schemas should be automatically flattened/limited to comply with Moonshot's depth constraint, allowing tool calls to succeed.

**Actual behavior**

All tool calls fail with `schema depth exceeds maximum limit of 10`.

**Environment**

- Opencode version: latest dev
- Model: kimi-k2-6 (Moonshot)
- Affected tools: Any with deeply nested anyOf/properties (Klaviyo, complex API tools)

**Related**

PR #23667 addressed related Moonshot/Kimi schema handling ( resolution, error exposure), but did not implement depth limiting.

---

## #25487 — Stream parsing: "text part <uuid> not found" when provider is OpenAI-compatible proxy (LiteLLM)

📅 `2026-05-02` | ✏️ **Predator455** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/25487](https://github.com/anomalyco/opencode/issues/25487)


### Description

`opencode-ai@1.14.29` aborts mid-run with `Error: "text part <uuid> not found"` when the configured provider is an OpenAI-compatible proxy (LiteLLM `v1.83.7-stable`). The error fires on the **second** LLM round-trip, immediately after the first tool result is streamed back to the model.

The same proxy, queried via `curl` against `/v1/chat/completions` with `stream:true`, returns well-formed SSE, and the same proxy serves Aider, Codex, and mini-swe-agent without issue, so the misbehavior appears specific to opencode's stream-part-id reconciliation.

### Provider config

`~/.config/opencode/opencode.json`:

    {
      "$schema": "https://opencode.ai/config.json",
      "provider": {
        "openai": {
          "name": "LiteLLM proxy (compatible mode)",
          "options": {
            "baseURL": "http://host.containers.internal:6666/v1",
            "compatibility": "compatible"
          },
          "models": {
            "deepseek-chat": { "name": "DeepSeek via LiteLLM" }
          }
        }
      }
    }

### Expected behavior

The second round-trip completes and the agent applies edits, as it does against `compatibility="default"` upstream OpenAI traffic.

### Hypotheses (educated guesses, not verified)

- The 1.14.x runtime tracks streamed text parts by id (introduced alongside Responses-API integration). When the upstream SSE shape is OpenAI Chat Completions–style (no `id` per delta) and is re-marshalled by `@ai-sdk/openai` in `compatibility=com

> *[Truncado — 3877 chars totais]*

---

## #25486 — MiniMax M2.7 Error from provider

📅 `2026-05-02` | ✏️ **diglab1337** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25486](https://github.com/anomalyco/opencode/issues/25486)


### Description

When testing the `minimax m2.7` model via Opencode ZEN in combination with the GSD Framework, the provider rejects the request if specific agents are used. The API throws an error because it does not accept the `skills` field in the payload. Interestingly, this issue is specific to the newer model, as using `MiniMax 2.5 free` works perfectly fine under the exact same conditions.

### **Error Message**
```text
Error from provider: Extra inputs are not permitted, field: 'skills', value: ['gsd-debugger-workflow']
```

### Plugins

GSD

### OpenCode version

1.14.33

### Steps to reproduce

1. Select `minimax m2.7` as the active model.
2. Change the prompt window from "build" to "Gsd-Debugger" (or another agent).
3. Type a message and submit.
4. The request fails and throws the error.

### Screenshot and/or share link

<img width="646" height="666" alt="Image" src="https://github.com/user-attachments/assets/b8e848c6-8a49-4e4f-b0d7-b13a29fc4683" />

### Operating System

Linux

### Terminal

ZSH

---

## #25380 — The web interface will repeatedly send requests when communicating with the model.

📅 `2026-05-02` | ✏️ **LuckRookie** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25380](https://github.com/anomalyco/opencode/issues/25380)


### Description

After I use `opencode web` or `opencode server` to start the service on the web page, I use the web UI to perform vibe coding. At first, there were no problems. But starting from yesterday, a problem occurred where the conversation would repeat. For example, when I started a new session and said "hello", he would keep sending requests without stopping. Ultimately, I had to manually stop and prevent him from continuing to retrieve the results. I took a screenshot. You can have a look. However, the TUI interface does not have this problem. It is only the web interface that has it. This might be due to a problem with the communication between the front-end and the back-end.

### Plugins

oh-my-opencode

### OpenCode version

1.14.31

### Steps to reproduce

1、This is a diagram describing the situation of the web UI.
<img width="2426" height="1832" alt="Image" src="https://github.com/user-attachments/assets/1f5b76e1-c08e-4841-b709-68a4da90a0ad" />

2、TUI doesn't have this problem.
<img width="3770" height="1866" alt="Image" src="https://github.com/user-attachments/assets/3c58b128-acc5-4260-a2e9-b06e694d2af5" />

The web UI enables me to manage multiple projects more effectively, so I really need its functions. Please fix it as soon as possible. Thank you!

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 24.04

### Terminal

tabby

---

## #25366 — Prompt cache busts on every tool-call continuation step

📅 `2026-05-02` | ✏️ **BYK** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25366](https://github.com/anomalyco/opencode/issues/25366)


### Description

On tool-call continuation steps, OpenCode reloads all messages from the DB via `MessageV2.filterCompactedEffect()`. Between iterations, tool parts transition from `pending` → `completed` with output text. This means the same message serializes to different bytes on consecutive API calls, busting Anthropic's prompt cache from that position forward.

On real sessions with heavy tool use, this causes ~20% of turns to re-write the entire context at cache-write price (12.5× cache-read cost).

### Steps to reproduce

1. Use a model that supports prompt caching (Anthropic Claude)
2. Run a session with multiple tool calls in one turn
3. Observe that cache_write tokens are high on tool-call continuations

### OpenCode version

v1.14.x

### OS

Linux

---

## #25361 — [BUG]: Plugin tool() gives no warning about blocking I/O — footgun for custom tool authors

📅 `2026-05-01` | ✏️ **Zireael** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25361](https://github.com/anomalyco/opencode/issues/25361)


[BUG]: Plugin `tool()` gives no warning about blocking I/O - documentation enhancement recommended

## Description

My custom tool for Opencode uses`execFileSync` to call an external CLI. The `tool()` function's `execute()` signature returns `Promise<ToolResult>`, which looks async - but `execFileSync` inside an `async function` still blocks the event loop. TypeScript can't catch this, and there's no documentation warning about it.

My tool worked fine on warm calls (DNS cached, TLS resumed). It only failed on first invocation or under network latency. That is hard to diagnose - it can look like a network issue, not a concurrency problem.

The fix for my tool was switching to async `execFile` and passing `context.abort` as the signal. A JSDoc warning or a line in the plugin docs would help with writing the correct custom tool structure.

I also raised a bug against the code to better address the timeouts: https://github.com/anomalyco/opencode/issues/25360

## Steps to reproduce

1. Create `~/.config/opencode/tool/demo.ts`:
```typescript
import { execFileSync } from "child_process"
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Demo tool that blocks",
  args: { query: tool.schema.string() },
  async execute({ query }, context) {
    return execFileSync("sleep", ["5"], { encoding: "utf8" })
  },
})
```
2. Restart Opencode
3. Invoke the demo tool - the entire session freezes for 5 seconds. No abort, no timeout is reported.

## Expected behavior

> *[Truncado — 2238 chars totais]*

---

## #25360 — [BUG]: Custom tool execution has no timeout — sync I/O freezes the agent

📅 `2026-05-01` | ✏️ **Zireael** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25360](https://github.com/anomalyco/opencode/issues/25360)


[BUG]: Custom tool execution has no timeout - sync I/O freezes

## Description

I wrote a custom tool that wraps `search-cli` (a Rust CLI for web search) using `execFileSync`. On first invocation after restarting Opencode, the tool times out with `ETIMEDOUT`. Subsequent calls usually work because DNS/TLS is cached by then.

The root cause: `execFileSync` blocks the JS event loop. Opencode wraps custom tool `execute()` in `Effect.promise()`, which expects async control flow. When the thread blocks, the Effect runtime can't yield, can't deliver abort signals, and can't enforce any timeout. The whole agent session freezes.

Running the cli program natively in bash / webfetch works correctly - they use `Effect.raceAll`/`Effect.timeoutOrElse` with explicit timeouts. But custom tools get that protection. 

I also raised an issue recommending better inline documentation to prevent the locks/timeouts: https://github.com/anomalyco/opencode/issues/25361

## Steps to reproduce

1. Install search-cli: `cargo install --git https://github.com/paperfoot/search-cli`
2. Create `~/.config/opencode/tool/search.ts`:
```typescript
import { execFileSync } from "child_process"
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Web search",
  args: { query: tool.schema.string() },
  async execute({ query }, context) {
    return execFileSync("search", ["search", "-q", query, "--json"], { encoding: "utf8" })
  },
})
```
3. Restart Opencode, invoke the search tool
4. Fir

> *[Truncado — 2618 chars totais]*

---

## #25351 — /models command shows preset list instead of actual LM Studio local models

📅 `2026-05-01` | ✏️ **LifetimeVip** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25351](https://github.com/anomalyco/opencode/issues/25351)


### Description

**Describe the bug**
When using LM Studio as local provider, the `/models` command displays hardcoded preset models from models.dev (like "GPT OSS 20B", "Qwen3 30B A3B 2507") instead of querying the local LM Studio API endpoint `http://127.0.0.1:1234/v1/models` to get actually loaded models.

**To Reproduce**
1. Start LM Studio and load a model (e.g., `gemma-4-26b-a4b-it`)
2. Enable Local Server (default port 1234)
3. Configure opencode.json with lmstudio provider
4. Run `/models` in OpenCode Desktop/TUI

**Expected behavior**
`/models` should query `http://127.0.0.1:1234/v1/models` and display only models actually available in local LM Studio instance.

**Actual behavior**
Shows preset models from models.dev that user does not have downloaded.

**Evidence**
Direct API call returns correct local models:
```bash
curl http://127.0.0.1:1234/v1/models

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25344 — Auto-title generation silently fails when provider has no small model

📅 `2026-05-01` | ✏️ **per-hap-s** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25344](https://github.com/anomalyco/opencode/issues/25344)


## Description

Sessions with providers that don't have a small model configured never get auto-generated titles. They remain stuck with the default "New session - ..." title indefinitely, even after many messages.

## Steps to Reproduce

1. Use a provider without a small model configured (e.g., any non-Zen provider)
2. Create a new session
3. Send a message
4. Session title stays as "New session - <timestamp>" permanently

## Root Cause

In SessionPrompt.ensureTitle, the model selection for the title agent uses:

```
((yield* provider.getSmallModel(input.providerID)) ??
  (yield* provider.getModel(input.providerID, input.modelID)))
```

The ?? operator doesn't handle Effect-TS patterns:

1. If getSmallModel returns an Effect that FAILS (no small model configured), yield* throws the error past ??, and the error is silently swallowed by t.ignore in the forkIn scope
2. If getSmallModel returns Option.None, it's an object (not nullish), so ?? doesn't trigger the fallback

In both cases, the model is invalid, the LLM stream fails, and the session title is never updated.

## Fix

Replace ?? with Effect.orElse() for proper Effect-TS error recovery.

---

## #25293 — Plugin @latest cache can stay pinned to stale npm version

📅 `2026-05-01` | ✏️ **sm18lr88** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25293](https://github.com/anomalyco/opencode/issues/25293)


### What happened?

A plugin configured as `oh-my-openagent@latest` stayed pinned to an older npm package version in OpenCode's plugin package cache, even though npm latest had advanced.

This caused OpenCode to keep loading old plugin behavior until I manually removed the cached package directory and pinned the plugin to the current version.

### Evidence

My OpenCode config had:

```json
{
  "plugin": [
    "oh-my-openagent@latest"
  ]
}
```

But the OpenCode package cache contained:

```json
// C:\Users\Me\.cache\opencode\packages\oh-my-openagent@latest\package.json
{
  "dependencies": {
    "oh-my-openagent": "3.17.4"
  }
}
```

At the same time:

```powershell
npm view oh-my-openagent version
# 3.17.12
```

So `@latest` was not re-resolved. The cache directory was valid enough for the plugin to load, but it loaded stale code.

### User-visible impact

The stale `oh-my-openagent 3.17.4` build had older model routing behavior. It treated Sisyphus + GPT-5.5 as invalid and switched sessions to Hephaestus, even though `oh-my-openagent 3.17.12` includes GPT-5.5-native Sisyphus support.

### Expected behavior

For plugin specs using a moving tag/range such as `package@latest`, OpenCode should periodically re-resolve the package, validate whether the cached dependency satisfies the requested spec, or otherwise avoid treating the wrapper cache directory as permanently fresh.

At minimum, a cache hit for `oh-my-openagent@latest` should not continue to use `oh-my-openagent 3.17.4` 

> *[Truncado — 2691 chars totais]*

---

## #25287 — MCP remote client has no transport-level retry on socket/connection errors

📅 `2026-05-01` | ✏️ **flupkede** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/25287](https://github.com/anomalyco/opencode/issues/25287)


## Problem

When a remote MCP server (type: "remote" with StreamableHTTPClientTransport) becomes temporarily unreachable — e.g. the server process restarts, the laptop suspends/resumes, or a TCP keep-alive goes stale — the MCP client has **no recovery mechanism**.

### What happens today

1. Server restarts → all in-memory sessions lost
2. Client sends a `tools/call` → `@modelcontextprotocol/sdk`'s internal reqwest pool has a dead keep-alive connection
3. **Socket-level error** occurs (not even an HTTP 404) — the request never reaches the server
4. `client.callTool()` throws an error
5. In `packages/opencode/src/mcp/index.ts`, the `convertMcpTool` `execute` function has **no catch/retry logic** — the error propagates to `Effect.catch` which logs it and returns undefined
6. The MCP server is marked as `"failed"` and **never reconnects**

### Why server-side middleware can't fix this

- **Socket errors never reach the server.** The client's HTTP library fails before sending a request.
- Even if the request does reach the server (e.g. HTTP 404 for stale session), the server can't tell the client's internal SDK state about a new session ID — that state lives inside `@modelcontextprotocol/sdk`'s transport layer.

### Expected behavior

When a tool call fails due to a transport error, the MCP client should:
1. Detect that the connection is dead (socket error, ECONNRESET, etc.)
2. Close the old transport/client
3. Create a new transport and reconnect (re-initialize)
4. Retry the ori

> *[Truncado — 3133 chars totais]*

---

## #25270 — Bug: Model generates identical response twice

📅 `2026-05-01` | ✏️ **Q-Peppa** | 💬 14 | 🔗 [https://github.com/anomalyco/opencode/issues/25270](https://github.com/anomalyco/opencode/issues/25270)


### Description

The model outputs the exact same response twice in a row.

<img width="1154" height="1120" alt="Image" src="https://github.com/user-attachments/assets/fd0665df-2a29-49be-8f2a-f886b12e2188" />

<img width="1395" height="1042" alt="Image" src="https://github.com/user-attachments/assets/e5e3306b-3a84-488d-ac12-e5cdb1229bb6" />

### Plugins

_No response_

### OpenCode version

1.14.31

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25268 — glob tool ignores permission rules for path parameter (external drives/paths)

📅 `2026-05-01` | ✏️ **oobma** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25268](https://github.com/anomalyco/opencode/issues/25268)


### Description

Permission rules configured in opencode.json are not enforced on the glob tool when paths are provided via the path parameter. Other tools (read, bash, grep, edit) correctly respect these rules.

### Plugins

_No response_

### OpenCode version

1.14.31

### Steps to reproduce

1. Configure opencode.json with permission rules to deny access to specific paths (e.g., external drives on Windows):
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "glob": {
      "*": "allow",
      "D:/**": "deny",
      "E:/**": "deny",
      "D:*": "deny",
      "E:*": "deny"
    },
    "external_directory": {
      "D:/**": "deny",
      "E:/**": "deny"
    }
  }
}
2. Restart opencode to load the new config.
3. Attempt to glob files on the restricted drives:
glob with path="D:\" pattern="*"
glob with path="E:\" pattern="*"

Expected behavior:
The glob tool should be blocked by the permission rules, same as read and bash are. The glob tool receives the target directory via the path parameter, and permission rules should match against it.
Actual behavior:
The glob tool returns results from D:\ and E:\ without being blocked. The permission rules for glob only match against the pattern parameter, not the path parameter, so they are ineffective for restricting access to specific directories.
Other tools work correctly:
- read with D:\ → correctly blocked ✅
- bash with ls D:\ → correctly blocked ✅  
- glob with path="D:\" → returns results ❌
Environment:
- OS: 

> *[Truncado — 2040 chars totais]*

---

## #25264 — Desktop app uses Windows file picker for projects when connected to WSL2 server

📅 `2026-05-01` | ✏️ **shen774411223d** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25264](https://github.com/anomalyco/opencode/issues/25264)


### Description


## What happened?

When the OpenCode Desktop app connects to a server running inside WSL2 (via `http://localhost:4096`), clicking "Add Project" opens a **Windows native file picker** that only browses Windows drives (`C:\`, `D:\`, etc.). WSL2 paths like `/home/user/project` are not accessible. The only workaround is to start `opencode serve` from inside the target project directory, which defeats the purpose of the desktop app's project management.

## What did you expect to happen?

When connected to a WSL2 server, the project picker should detect that the remote environment is Linux and either:
- Open a WSL-aware directory browser, or
- Provide a text input field where the user can type a WSL2 absolute path (e.g., `/home/user/projects/my-repo`).

## Steps to reproduce

1. In WSL2, start a server:
   ```bash
   opencode serve --hostname 0.0.0.0 --port 4096
   ```
2. On Windows, open OpenCode Desktop and connect to `http://localhost:4096`.
3. Click **"+ Add Project"** in the sidebar.
4. A Windows file dialog opens — WSL2 directories are not reachable.

## Client information

- **OpenCode Desktop version:** v1.14.31
- **Platform:** Windows 11 + WSL2 (Ubuntu)
- **Connection method:** Desktop app → `http://localhost:4096` (WSL2 serve instance)

## Related issues

- #13089 — Desktop app (WSL) tries to open projects from local pc
- #5635 — Add option to run OpenCode backend via WSL on Windows
- #22215 — WSL UNC paths break bash and git on Windows


### Plugins

_

> *[Truncado — 1703 chars totais]*

---

## #25256 — Xiaomi MiMo models show context limit as 0 in model tooltip

📅 `2026-05-01` | ✏️ **ShadyUnderLight** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25256](https://github.com/anomalyco/opencode/issues/25256)


## Bug Description

When hovering over any Xiaomi MiMo model in the model selector tooltip, the context limit displays as **"上下文上限 0"** (Context limit 0) instead of the correct value (256K ~ 1M tokens).

## Expected Behavior

The tooltip should show the correct context limit as defined in the provider configuration, e.g.:
- MiMo-V2.5-Pro -> Context limit 1,048,576
- MiMo-V2-Omni -> Context limit 256,000
- MiMo-V2.5 -> Context limit 1,048,576
- MiMo-V2-Pro -> Context limit 1,000,000
- MiMo-V2-Flash -> Context limit 256,000

## Actual Behavior

All xiaomi MiMo models show **Context limit 0** in the tooltip popover.

## Steps to Reproduce

1. Open the model selector dialog
2. Hover over any MiMo model (e.g., `mimo-v2.5-pro`, `mimo-v2-omni`, etc.) from the Xiaomi provider
3. Observe that the tooltip shows "Context limit 0"

## Investigation Findings

The provider configuration **does** have `limit.context` correctly defined for all 5 MiMo models in the embedded binary (e.g., `limit:{context:1048576,output:131072}` for `mimo-v2.5-pro`). The issue is in the UI rendering pipeline -- the `limit.context` value is being lost before reaching the tooltip component.

The model merging logic (`limit: { context: u.limit?.context ?? S?.limit?.context ?? 0 }`) defaults to 0 when both user model and shared model lack `limit.context`, suggesting the model objects in the flattened list are missing the `limit` field during model list construction.

## Environment

- OpenCode version: 1.14.30
- ma

> *[Truncado — 1665 chars totais]*

---

## #25254 — bug(processor): doom loop detection misses cross-message repetitions and has inverted filter order

📅 `2026-05-01` | ✏️ **qz1543706741** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25254](https://github.com/anomalyco/opencode/issues/25254)


## Summary

Two bugs in the doom loop detection logic in `packages/opencode/src/session/processor.ts` allow infinite tool-call loops to go undetected.

## Bug 1 — Detection scope limited to current message only

```ts
// current code
const parts = MessageV2.parts(ctx.assistantMessage.id)
const recentParts = parts.slice(-DOOM_LOOP_THRESHOLD)
```

`MessageV2.parts(ctx.assistantMessage.id)` returns only parts from the **current** assistant message. When the model repeats the same tool call across multiple turns (e.g. three separate messages each calling `read_file` with the same path), the doom loop is never detected because each individual message has fewer than `DOOM_LOOP_THRESHOLD` matching parts.

**Expected behavior:** Detection should span all messages since the last user turn, not just the current assistant message.

## Bug 2 — Slice before filter inverts the logic

```ts
// current code
parts.slice(-DOOM_LOOP_THRESHOLD).every(part => part.type === "tool" && part.tool === value.toolName && ...)
```

Taking the last N parts first (which may include text or reasoning parts) and then checking whether all N match means that if **any** non-tool part appears in the tail, `every` returns `false` and the doom loop check silently passes — even if there are plenty of repeated tool calls.

**Expected behavior:** Filter matching tool parts first, then check whether the count reaches the threshold.

## Proposed Fix

- Use `MessageV2.filterCompactedEffect(ctx.sessionID)` to collect mat

> *[Truncado — 1663 chars totais]*

---

## #25243 — Sidebar preview child stores bootstrap MCP/LSP status queries despite bootstrap: false

📅 `2026-05-01` | ✏️ **mattgenious** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25243](https://github.com/anomalyco/opencode/issues/25243)


### Description

Hovering or previewing projects in the app sidebar can create child stores with `bootstrap: false`, but those preview-only stores still register instance-scoped status queries immediately.

The relevant path is:

1. `packages/app/src/pages/layout/sidebar-project.tsx` uses `globalSync.child(directory, { bootstrap: false })` while rendering project/workspace preview data.
2. `createChildStoreManager.child()` still calls `ensureChild(directory)`.
3. `ensureChild()` creates a query root and registers `loadPathQuery`, `loadMcpQuery`, `loadLspQuery`, and `loadProvidersQuery` with a real directory-scoped SDK.
4. `loadMcpQuery()` calls `sdk.mcp.status()`.
5. The SDK rewrites the GET request with the directory query/header.
6. The server route goes through `InstanceMiddleware`, which calls `Instance.provide({ init: InstanceBootstrap })`.
7. `/mcp` status reads `MCP.status()`, which initializes MCP instance state and connects configured local MCP servers.

So `bootstrap: false` prevents `onBootstrap(directory)`, but it does not prevent the side-effectful status requests that can bootstrap the backend instance and start local MCP/LSP processes.

### Expected behavior

Preview-only child stores created with `bootstrap: false` should be able to read cached/persisted preview data without causing directory-scoped MCP/LSP/provider/path requests.

### Actual behavior

A preview child store immediately registers and runs status queries, including `mcp.status`, which can start 

> *[Truncado — 2634 chars totais]*

---

## #25202 — GPT-5.5 visible token count does not drop mid-session like GPT-5.4 and reaches hard compaction sooner

📅 `2026-05-01` | ✏️ **ksav1370** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/25202](https://github.com/anomalyco/opencode/issues/25202)


## Version
OpenCode 1.14.30

## Provider / models
OpenAI provider
- gpt-5.4
- gpt-5.5

## What I am reporting
This is **not** a report that GPT-5.5 never compacts.

The issue is that the **visible token count behavior** appears different between `gpt-5.4` and `gpt-5.5` in long sessions.

With `gpt-5.4`, the visible token count can sometimes drop mid-session before I manually compact, for example something like:
- `~200k -> ~100k`

That lets the session continue longer before I need to compact.

With `gpt-5.5`, the visible token count mostly just keeps increasing until it hits hard compaction around `~275k` tokens.

So the practical UX difference is:
- `gpt-5.4`: visible count sometimes reduces mid-session and I can keep going longer
- `gpt-5.5`: visible count mostly rises continuously until hard compaction, which makes me compact more often

## Expected behavior
I would expect `gpt-5.5` to behave similarly to `gpt-5.4` in long sessions, either by:
- applying the same visible pruning / packing behavior, or
- at least making the token accounting behavior consistent enough that it does not appear to reach hard compaction significantly sooner for similar work

## Actual behavior
`gpt-5.5` appears not to get the same visible mid-session token-count drops that `gpt-5.4` gets.
Instead, the visible count mostly climbs until hard compaction around `~275k`.

## Notes
- Same machine / same OpenCode install
- Observed on `v1.14.30`
- I noticed `v1.14.25` mentions `GPT-5.5 with OpenAI OAu

> *[Truncado — 2378 chars totais]*

---

## #25190 — Compaction and message export can leak reasoning across models

📅 `2026-05-01` | ✏️ **jackmazac** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25190](https://github.com/anomalyco/opencode/issues/25190)


### Description

Compaction and `toModelMessages`-style export paths did not always strip assistant reasoning or apply the same caps as the main send path. Sessions switched to another model or compacted context could forward reasoning-shaped content where the target provider rejects it.

### Steps to reproduce

Run compaction or export assistant history that includes reasoning parts, then send to a model/provider that does not accept those parts unchanged.

### OpenCode version

Local / dev branch

### Operating System

Any

---

## #25137 — MCP streamable-HTTP transport: 'Session not found' from server permanently breaks tool calls (no auto-reconnect)

📅 `2026-04-30` | ✏️ **iggerask** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25137](https://github.com/anomalyco/opencode/issues/25137)


### Description

When a remote MCP server invalidates a streamable-HTTP session (server restart, idle timeout, periodic rotation, etc.), opencode keeps sending the same stale `mcp-session-id`. The server returns:

```
Streamable HTTP error: Error POSTing to endpoint: {"error":"Session not found"}
```

Once this happens, **every subsequent tool call against that MCP server fails with the same error** for the rest of the opencode session. The only fix is `opencode mcp logout && opencode mcp auth` and a process restart. There's no retry, no reconnect, no `onclose` handler.

This is in the same family as #17099 (no retry / reconnect for `listTools()` failures) but on a different code path: `client.callTool()` in `convertMcpTool` (`packages/opencode/src/mcp/index.ts`). #15209 reported essentially the same bug back in February but was auto-closed for not following the issue template — reopening here properly.

### Steps to reproduce

1. Configure a remote streamable-HTTP MCP server.
2. Use it normally — agent calls a few tools successfully.
3. Restart that MCP server (or wait for any server-side session invalidation).
4. Have the agent call any tool on that server again.
5. → `Streamable HTTP error: Error POSTing to endpoint: {"error":"Session not found"}`. All subsequent calls to that server fail until opencode is restarted.

### OpenCode version

1.14.30

### Operating System

macOS 14 (Sequoia)

### Expected

When the server reports the session is gone, opencode rebuilds the tra

> *[Truncado — 1586 chars totais]*

---

## #25104 — Hy3 model license forbids exporting outputs to EU, UK and South Corea, making it unusable for almost anything

📅 `2026-04-30` | ✏️ **carlosmintfan** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25104](https://github.com/anomalyco/opencode/issues/25104)


### Description

The license of the Hy3 model is suprisingly restrictive. The prohibition of export of outputs to the EU makes it unusable for both professional work and open-source projects. I would strongly recommend removing it from OpenCode Zen.

https://huggingface.co/tencent/Hy3-preview/blob/main/LICENSE

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25098 — [Bug] Spurious 'Output blocked: sanitization error' message appears after successful tool execution

📅 `2026-04-30` | ✏️ **suyashbhawsar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25098](https://github.com/anomalyco/opencode/issues/25098)


## Description

After successfully executing bash commands (and other tools), a spurious error message appears: `Output blocked: sanitization error`. The error message appears AFTER the actual tool output has already been displayed, and does not actually block the output.

## Steps to Reproduce

1. Start OpenCode in a directory
2. Execute a bash command like `ls -la` or `git status`
3. Observe that the command output displays correctly
4. After the output, the message `Output blocked: sanitization error` appears

## Expected Behavior

No error message should appear when commands execute successfully and output displays correctly.

## Actual Behavior

```
$ ls -la
total 584
drwxr-xr-x@ 93 user  staff   2976 30 Apr 13:53 .
drwxr-xr-x@ 20 user  staff    640 28 Apr 18:46 ..
drwxr-xr-x@  3 user  staff     96 23 Apr 14:08 .act
... (full output displayed)
Output blocked: sanitization error
```

The output IS displayed, but an error message appears after it.

## Evidence That Output Is Not Actually Blocked

1. The command output displays completely before the error message
2. Subsequent commands work fine
3. The tool's internal reasoning (`Thinking:` lines) show repeated attempts to execute the same command, suggesting the tool believes it failed

## Possible Triggers

The following patterns have triggered this error in testing:
- Directory listings with many items
- Paths containing `.agent`, `.augment`, `.claude` directories
- Git worktree configurations
- Long file paths

## Envir

> *[Truncado — 2180 chars totais]*

---

## #25072 — Upper right corner server status not green

📅 `2026-04-30` | ✏️ **jasonwch** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25072](https://github.com/anomalyco/opencode/issues/25072)


### Description

In latest version from Chocolatey (29) or Bash install (30), the upper right corner status didn't turn Green although the server underneath shown as green

<img width="888" height="518" alt="Image" src="https://github.com/user-attachments/assets/604c55a9-6446-45cc-96e0-3ba083cfa9d0" />

### Plugins

Nil

### OpenCode version

1.14.30

### Steps to reproduce

Open web console, the upper right corner icon didn't show green, but when clicked on it, the server underneath is green indeed

### Screenshot and/or share link

Attached

### Operating System

Ubuntu 24.04 OR Windows 11

### Terminal

NIL

---

## #25039 — Local Plugin not working with opencode serve (web ui), only works with Terminal UI (TUI)

📅 `2026-04-30` | ✏️ **CoderTom314** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25039](https://github.com/anomalyco/opencode/issues/25039)


### Description

`@daytona/opencode` depends on `@daytona/sdk @daytona/api-client @daytona/toolbox-api-client`
simultaneously, `@daytona/sdk` also depends on `@daytona/api-client @daytona/toolbox-api-client`

because i modified these 4 packages for my local testing, and i have no way of publishing to npm, i bundled the opencode plugin using esbuild 
```
NODE_PATH=./node_modules ./node_modules/.bin/esbuild index.js \
  --bundle \
  --platform=node \
  --format=cjs \
  --alias:@daytona/api-client=./node_modules/@daytona/api-client \
  --alias:@daytona/toolbox-api-client=./node_modules/@daytona/toolbox-api-client \
  --alias:@daytona/sdk=./node_modules/@daytona/sdk \
  --outfile=dist/index.js
```


then installed the plugin using `opencode plugin --global ~/daytona-plugin`


opencode@c4dd849dfc57:~/daytona-plugin$ tree -a
.
|-- .opencode
|   `-- plugin
|       `-- index.js
|-- README.md
`-- package.json

3 directories, 3 files


The local plugin works for terminal ui (TUI), which would trigger writing to daytona.log
```
opencode@c4dd849dfc57:~/.local/share/opencode/log$ cat daytona.log
[2026-04-30T01:38:30.789Z] [INFO] OpenCode started with Daytona plugin
```
However, the plugin seems not to activate at all using `opencode serve`. There is no logging to daytona.log using `opencode serve`


The bundled plugin is attached
[daytona-plugin.tar.gz](https://github.com/user-attachments/files/27227279/daytona-plugin.tar.gz)

(In contrast, installing the original version of the plugin fr

> *[Truncado — 2174 chars totais]*

---

## #25022 — Windows linked worktree startup can hang in Project.fromDirectory() while UI shows Loading plugins

📅 `2026-04-29` | ✏️ **ctharvey** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25022](https://github.com/anomalyco/opencode/issues/25022)


On Windows, OpenCode can intermittently hang on startup in linked worktrees while the UI sits on `Loading plugins...`.

This is not just slow startup. In the bad case it never reaches the prompt.

What I traced:
- startup enters `Project.fromDirectory()`
- linked worktree discovery shells out to Git for topology info
- the calls include `git rev-parse --git-common-dir`, `git config --bool core.bare`, and `git rev-parse --show-toplevel`
- when that path hangs, the UI still looks like plugin loading is the problem even though the blocker is earlier

Why this looks avoidable:
- a linked worktree already has the needed metadata on disk
- the worktree `.git` file points at the admin dir
- the admin dir contains `gitdir` and `commondir`

So the startup path is depending on Git subprocesses to rediscover data that is already available locally.

I have a patch prepared that resolves linked worktree topology from that metadata first and only falls back to Git if the metadata cannot be parsed safely.

## Repro
- run OpenCode on Windows from a linked worktree
- in the bad case it stays on `Loading plugins...` and never reaches the prompt

## Scope
This issue is specifically about linked-worktree startup discovery. It is not a claim that every Windows startup delay has the same cause.

---

## #24965 — [BUG]: opencode doesn't receive progress notifications from MCP servers

📅 `2026-04-29` | ✏️ **fahreddinozcan** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24965](https://github.com/anomalyco/opencode/issues/24965)


### Description

### Description

opencode's MCP client never processes `notifications/progress` from any
MCP server. Long-running tool calls that rely on progress notifications
to keep the SDK's per-request timer alive (via `resetTimeoutOnProgress`)
fail with:

MCP error -32001: Request timed out



even when the server is healthy and emitting progress on schedule.

### Root Cause

The MCP TypeScript SDK only injects a `progressToken` into outbound
`_meta` when `options.onprogress` is set
(https://github.com/modelcontextprotocol/typescript-sdk/blob/v1.27.1/src/shared/protocol.ts#L1126-L1135).
opencode's `client.callTool` passes `resetTimeoutOnProgress: true` but
does not pass `onprogress`, so:

- No `progressToken` is sent to the server, so the server has no token
  to address its progress notifications to.
- Even if the server emitted a notification with a fabricated token,
  the SDK's `_onprogress` would early-return on "unknown token" before
  reaching the timer-reset block.

The result is that `resetTimeoutOnProgress: true` is dead code for any
opencode tool call: the per-request timer fires unconditionally at the
SDK default of 60s, regardless of how often the server emits progress.

### Steps to Reproduce

1. Configure any MCP server that emits `notifications/progress` during
   a tool call (e.g. a test server that sleeps and emits progress every
   20s).
2. Invoke the tool from opencode.
3. Observe that the call times out at -32001 even though the server
   completes 

> *[Truncado — 1959 chars totais]*

---

## #24959 — edit tool can catastrophically delete content when oldString match is overly broad

📅 `2026-04-29` | ✏️ **Yassire1** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24959](https://github.com/anomalyco/opencode/issues/24959)


### Description

Summary
The edit tool silently deleted approximately 50% of a LaTeX document (~190 lines) when attempting a simple string replacement. The oldString parameter matched a much larger block than intended, replacing it with a 10-character snippet and destroying everything in between.
What happened
I was making a targeted spacing adjustment to a .tex file. I issued an edit command with an oldString intended to match a single figure/table boundary (e.g., \end{figure} followed by a section header). Instead, the tool matched a spanning boundary that started at the end of Table 1 and ended somewhere before the Conclusion section. The replacement deleted:
- Table 1 content and caption
- All Taxonomy subsections (3.1–3.6)
- Section 4 (Training and Adaptation) + Table 2
- Section 5 (Applications to PdM) + Table 3  
- Section 6 (Challenges and Future Directions)
File dropped from 453 lines → 266 lines without any warning.
Root cause
The edit tool performs exact string replacement using the first match found. When the oldString is constructed from multi-line context, it can accidentally match a boundary that spans much more content than the user intended. There is:
- No preview/diff before applying
- No "match too large" safeguard
- No confirmation prompt for multi-line replacements exceeding a threshold

### Plugins

_No response_

### OpenCode version

1.3.17

### Steps to reproduce

1. Open any multi-section .tex or .md file with repeating patterns (e.g., multiple \end{

> *[Truncado — 1894 chars totais]*

---

## #24954 — Desktop File Tree and Review use original session directory after agent moves work into a worktree

📅 `2026-04-29` | ✏️ **rubencu** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24954](https://github.com/anomalyco/opencode/issues/24954)


### Description

In the Desktop app, if a session starts in the repo root and the agent later creates/uses a separate git worktree for the task, the File Tree and Review views keep using the original session directory.

The visible result is confusing:

- File Tree `All Files` / `Changes` do not show the files changed in the worktree.
- Review keeps showing changes from the original repo root, or shows `0 changes`, even though the agent changed files in the worktree.
- Switching sessions can appear to refresh the UI, but the underlying diff source is still the original root directory.

This seems related to the session retaining its initial `session.directory`. The agent can do real work in another worktree via shell/tool commands, but the UI still scopes file/diff data to the original session directory.

Related prior discussion:

- #20262 discusses workspace/worktree sessions where `session.directory` remains the repo root and built-in tools still run from the root.
- #11802 discusses session diffs being worktree-global/session attribution problems.

### Plugins

None relevant.

### OpenCode version

Desktop app. Also reproduced while testing from `dev` / `origin/dev` around `9fbeafb63ed749077e9cc55a47df3629b5b7adc3`.

### Steps to reproduce

1. Open the Desktop app for a git repository from the repo root.
2. Start a session while the session/workspace directory is the repo root.
3. In that session, ask the agent to create a separate git worktree from the default developmen

> *[Truncado — 2363 chars totais]*

---

## #24949 — core: PATCH /config call to server does not change config

📅 `2026-04-29` | ✏️ **abzy128** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24949](https://github.com/anomalyco/opencode/issues/24949)


### Description

I wanted to update config of the opencode server and was not able to. 

### Plugins

none

### OpenCode version

v1.14.29

### Steps to reproduce

1. start opencode server in debian:trixie container with envs (opencode basicauth password and openai/anthropic api keys) 
2. do curl -X PATCH localhost:4096/config with my config
3. server returns 200 with same json (I assume it shows changed values)
4. GET /config returns default empty config
5. Looking at workspace root I can see config.json file I have send to PATCH endpoint.

### Screenshot and/or share link

1. call to post new config
<img width="642" height="254" alt="Image" src="https://github.com/user-attachments/assets/20a549b0-4b4f-49aa-a9cc-9534d11b0d77" />
2. get config response
<img width="695" height="147" alt="Image" src="https://github.com/user-attachments/assets/b71a4ad8-795b-4e01-a1ce-f353da027fd2" />
3. config I have PATCHed in /home/opencode/workspace/ directory (current workspace)
<img width="975" height="723" alt="Image" src="https://github.com/user-attachments/assets/2d4199cd-eb32-4dc3-a186-676532689f36" />



### Operating System

debian 13 container

### Terminal

no tui, only server and webui

---

## #24946 — Remote MCP servers with Bearer headers fail on Linux (SSE 400, no Streamable HTTP fallback)

📅 `2026-04-29` | ✏️ **ricogu** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24946](https://github.com/anomalyco/opencode/issues/24946)


## Description

Remote MCP servers configured with static Bearer token headers (e.g., GitHub's `mcp.github.tools.sap/mcp` and `api.githubcopilot.com/mcp/`) fail to connect on Linux with `SSE error: Non-200 status code (400)`. The same config works on macOS.

## Related Issues

- #16247 — Root cause: Streamable HTTP servers reported as SSE errors
- #18724 — Same symptom with Feishu MCP

## Environment

- OpenCode version: 1.14.29
- OS: Linux (Ubuntu 24.04 arm64, running in Lima VM)
- macOS host: works fine with identical config and version

## Config

```json
{
  "mcp": {
    "github.com": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer {env:GITHUB_COM_TOKEN}"
      },
      "enabled": true
    }
  }
}
```

## Investigation

1. **Token is valid** — `curl -s -H "Authorization: Bearer $TOKEN" https://api.github.com/user` returns 200
2. **Endpoint is reachable** — POST with MCP initialize message returns valid response from inside the VM
3. **SSE GET returns 405/400** — The server only supports POST (Streamable HTTP), not GET (SSE)
4. **macOS works, Linux doesn't** — Same binary version, same config. On macOS, opencode falls back to Streamable HTTP. On Linux, it stops at the SSE error.
5. **`oauth: false` doesn't help** — Tried disabling OAuth auto-detection, no change
6. **Other remote MCP servers work** — context7, jira, hyperspace portal all connect fine (they use OAuth via mcp-auth.json, not stat

> *[Truncado — 2086 chars totais]*

---

## #24926 — Windows: terminal tool stays in thinking state after dotnet build completes successfully

📅 `2026-04-29` | ✏️ **tugkan98** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24926](https://github.com/anomalyco/opencode/issues/24926)


### Description

On Windows, running `dotnet build` from OpenCode completes successfully, but OpenCode remains stuck in the "thinking" state and never returns the final assistant response. I have to manually kill/restart OpenCode from Task Manager.

The child process appears to finish correctly. The problem seems to be in OpenCode's terminal/tool completion handling rather than in `dotnet build` itself.

### Plugins

_No response_

### OpenCode version

OpenCode Desktop v1.14.29

### Steps to reproduce

1. Open a .NET project in OpenCode Desktop on Windows.

2. Ask the assistant to run:
powershell dotnet build "sampleproject.csproj"

3. Build completes and prints successful output.

4. OpenCode stays in "thinking" state indefinitely.

5. Manual kill/restart from Task Manager is required.

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

_No response_

---

## #24920 — deepseek V4 flash  或者pro 出现 链接中断 ，中断后 再也不能正常对话工作了Error from provider (DeepSeek): The `reasoning_content` in the thinking mode must be passed back to the API.

📅 `2026-04-29` | ✏️ **joshuachendyb** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24920](https://github.com/anomalyco/opencode/issues/24920)


### Description

<img width="1156" height="1222" alt="Image" src="https://github.com/user-attachments/assets/4b6b4c97-b55e-4e35-8c9b-7bc65be19b79" />

Error from provider (DeepSeek): The `reasoning_content` in the thinking mode must be passed back to the API.

### Plugins

_No response_

### OpenCode version

1.3.17

### Steps to reproduce

对话中
突然出现：Error from provider (DeepSeek): The `reasoning_content` in the thinking mode must be passed back to the API.
输入 继续
仍然出现：Error from provider (DeepSeek): The `reasoning_content` in the thinking mode must be passed back to the API.
 换wifi  也不行
 关闭 opencode 重新开启也不行，
 有时候，换一个mode 返回了  也不可以， 
<img width="1150" height="1346" alt="Image" src="https://github.com/user-attachments/assets/fefd63ad-4ce7-4b42-9797-46ae27913d69" />

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24917 — Session unexpectedly terminates when opening Settings (v1.4.28+)

📅 `2026-04-29` | ✏️ **Surihogg** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24917](https://github.com/anomalyco/opencode/issues/24917)


### Description

I’m not sure if this is a bug, but since version 1.4.28 or 1.4.29, clicking on "Settings" unexpectedly terminates the current session without any warning! This has interrupted my work several times, and I later realized it seems to be a "feature" of the new version. If the session must be interrupted, could you at least ask for user permission first, or provide a configuration option to set the default behavior?

### Plugins

_No response_

### OpenCode version

1.4.28 or 1.4.29

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

macOS and Windows

### Terminal

_No response_

---

## #24912 — fix(tool): question tool fails when LLM serializes nested array as JSON string

📅 `2026-04-29` | ✏️ **ZY-Yim** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24912](https://github.com/anomalyco/opencode/issues/24912)


### Description

The `question` tool's input schema rejects calls when the model serializes the `questions` parameter as a JSON-encoded string instead of a real array.

When this happens the model retries 2-3 times producing the same wrong format, wasting LLM tokens before either giving up or hitting a timeout.

Reproduced multiple time on Claude Opus 4.6 with a complex agent setup (~30 tools, large system prompt, 3 questions x 4 options each).

The schema for `questions` is a 3-level nested array (questions[].options[].{label,description}). My guess is the nesting depth combined with strict additionalProperties:false makes Sonnet occasionally JSON.stringify the whole array.

Wire example of what the model actually sends:

{"questions": "[{\"question\": \"...\", \"header\": \"...\", \"options\": [...]}]"}

zod returns:
  expected array, received string at path ["questions"]

### Plugins

None

### OpenCode version

1.2.27

### Steps to reproduce

1. Run opencode against an agent with ~30 tools loaded and a long system prompt (~50K cached tokens). My case: hilo-agent-opencode media-agent.

2. Send a prompt that triggers the question tool with multiple questions and multi-option answers, e.g. asking the user to choose visual style + content + format for a poster.

3. Observe in the trace that the model returns `questions` as a JSON-stringified array, not a real array.

4. zod validation fails. The error is fed back to the model, which retries with the exact same wrong format 1-

> *[Truncado — 1738 chars totais]*

---

## #24902 — OpenCode Cannot Execute Slash Commands Even When Instructed via AGENTS.md

📅 `2026-04-29` | ✏️ **steelcowboy** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24902](https://github.com/anomalyco/opencode/issues/24902)


### Description

OpenCode is unable to run slash commands (like `/test`) even when explicitly instructed to do so through the `AGENTS.md` file.

## Expected Behavior

When a user says "run the test command", OpenCode should recognize this as a slash command invocation based on the AGENTS.md instructions and execute the `/test` slash command properly.

## Actual Behavior

OpenCode does not know how to run a slash command:

```
Thinking: The AGENTS.md file says that when the user says "run the test command", I should run the opencode slash command /test. But I'm not sure how to run a slash command in opencode. Let me check if there's a way to execute slash commands or if there's a test script in the package.json.
```

## Environment

- Working directory: `/home/steelcowboy`
- Platform: linux
- Shell: zsh

## Relevant Files

### AGENTS.md Contents

```markdown
# AGENTS.md

## Natural Language Processing

- When I say "run the test command" you should run the opencode slash command `/test`
```

### test.md Command Contents

```
---
description: Display testing success message
---

Print the following message: testing succeeded!
```

### Plugins

None

### OpenCode version

1.14.28

### Steps to reproduce

1. Create an `AGENTS.md` file in `~/.config/opencode/` with the following content:
```
# AGENTS.md

## Natural Language Processing

  - When I say "run the test command" you should run the opencode slash command `/test`
```
2. Create a `test.md` command in `~/.config/opencode/co

> *[Truncado — 2260 chars totais]*

---

## #24855 — fix(mcp): MCP status shows connected green after server reconnect even though server is down

📅 `2026-04-28` | ✏️ **herjarsa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24855](https://github.com/anomalyco/opencode/issues/24855)


### Bug Description
After a network disruption or server restart causes OpenCode to reconnect, the MCP status indicator continues to show all servers as green (connected), but the underlying MCP server processes may have been lost. The status is stale because Instance.state() in packages/opencode/src/mcp/index.ts caches MCP client state indefinitely per project instance keyed by directory. When Instance.reload() is triggered by reconnect logic, the old cached status and clients maps are preserved even though the server-side processes are gone, resulting in a false-positive 'all online' display.

### Steps to Reproduce
1. Start OpenCode with one or more MCP servers configured and connected.
2. Observe the MCP status indicator in the bottom status bar shows green.
3. Cause a reconnect (e.g. network disruption, or restart the OpenCode backend server).
4. After reconnect completes, the status bar still shows all MCP servers green.
5. Try to invoke an MCP tool — it may fail because the actual stdio/HTTP transport is no longer alive.

### Expected Behavior
When the server reconnects, the MCP cached state should be invalidated so the next status() call re-evaluates actual server connectivity.

### Actual Behavior
The cached Instance.state() for MCP survives across server reconnects, displaying stale connected statuses.

### Additional Context
Instance.state() uses a ScopedCache keyed by directory without an explicit expiration or invalidation hook on reconnect events. The MCP init c

> *[Truncado — 1705 chars totais]*

---

## #24850 — Session.list() includes archived sessions in LIMIT window, causing unarchived sessions to disappear from sidebar

📅 `2026-04-28` | ✏️ **simianhacker** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24850](https://github.com/anomalyco/opencode/issues/24850)


## Summary

Sessions disappear from the Web UI sidebar after archiving other sessions, because the server-side `Session.list()` query includes archived sessions in its `LIMIT` window, which are then stripped client-side by `trimSessions`.

## Steps to Reproduce

1. Accumulate many sessions in a project (e.g., 100+ root sessions)
2. Archive a batch of old sessions
3. Observe that archiving bumps `time_updated` on each archived session
4. The sidebar now shows fewer sessions than expected — some previously visible unarchived sessions have disappeared

## Root Cause

The instance-scoped `Session.list()` function (`packages/opencode/src/session/session.ts`) does **not** filter out archived sessions:

```typescript
export function* list(input?) {
  const conditions = [eq(SessionTable.project_id, project.id)]
  // ... directory, roots, start, search filters
  // NOTE: no isNull(SessionTable.time_archived) condition
  const rows = Database.use((db) =>
    db.select().from(SessionTable)
      .where(and(...conditions))
      .orderBy(desc(SessionTable.time_updated))
      .limit(limit)
      .all()
  )
}
```

In contrast, `listGlobal()` **does** have this filter:

```typescript
if (!input?.archived) {
  conditions.push(isNull(SessionTable.time_archived))
}
```

The client-side `trimSessions()` strips archived sessions after the fact:

```typescript
const all = input
  .filter((s) => !!s?.id)
  .filter((s) => !s.time?.archived)  // <-- client-side filtering
```

So the flow is:
1. Ser

> *[Truncado — 2656 chars totais]*

---

## #24847 — OpenCode silently enters a broken UI state when a plugin fails to initialize

📅 `2026-04-28` | ✏️ **BorisDay** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24847](https://github.com/anomalyco/opencode/issues/24847)


### Description

**Expected behavior:**
- Option A: OpenCode should print a clear error on startup (e.g. "Plugin X not found — skipping" or "Plugin load failed: ...")
- Option B: OpenCode should gracefully disable the broken plugin and continue with a degraded but functional UI
- Option C: At minimum, the TUI should remain usable with a visible error indicator

**Actual behavior:**
Silent UI breakage. No error output anywhere. The user has no indication of what went wrong.

**Root cause (from debugging):**
The `opencode.json` plugin array referenced packages not present in `~/.config/opencode/node_modules/`. OpenCode attempted to load them, failed silently, and the initialization of the input handler and agent status display never completed — leaving the TUI in a zombie state.

**Workaround:**
Remove uninstalled plugin entries from `"plugin"` array, or run `npm install <plugin>` in the config directory.
**Why this matters for OpenCode specifically:**
The TUI is the primary user interface. A silent failure that disables text input with zero diagnostics is critical — users naturally look for errors in logs or console output and find nothing.

### Plugins

https://github.com/affaan-m/everything-claude-code

### OpenCode version

1.14.28

### Steps to reproduce

1. Add a plugin entry to `opencode.json` that is NOT installed in `node_modules/`.
   Example: `"plugin": ["opencode-antigravity-auth@1.3.0"]`
2. Run `opencode` from terminal.
3. Observation: The TUI loads (no "Loading pl

> *[Truncado — 1786 chars totais]*

---

## #24841 — Prompt loop DB reload breaks Anthropic cache after tool calls (63% of spend)

📅 `2026-04-28` | ✏️ **BYK** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24841](https://github.com/anomalyco/opencode/issues/24841)


### Description

The prompt loop in `prompt.ts` reloads all messages from the DB (`filterCompactedEffect`) at the start of every iteration. Between tool-call steps, tool parts transition from `pending` to `completed` with output text. When `toModelMessages()` serializes the conversation for the next API call, the previous assistant message has different bytes:

- **Before tool execution** (step N): `state: "output-error", errorText: "[Tool execution was interrupted]"` (message-v2.ts line 912)
- **After tool execution** (step N+1): `state: "output-available", output: <actual output>` (message-v2.ts line 853)

Anthropic's prompt cache sees different bytes at that message position → invalidates everything after it → the entire remaining context is re-written at cache-write pricing ($6.25/MTok for Opus, 12.5× the cache-read price).

**Cost impact from real session data (Opus 4.7, 1M context):**
- 63% of total API spend is cache writes ($2,264 out of $3,584 on April 21st)
- 95% of rapid cache busts (<60s gap) have a tool call in the preceding message
- Warm turns: `cache_read=614K, cache_write=1K` — nearly perfect caching
- Bust turns: `cache_read=54K, cache_write=560K` — only system prompt survives
- Sessions with heavy tool use see 20-84% bust rates

This is likely the same root cause as #20565 (same snapshot hash, mixed cache behavior) and related to #20110 (prompt cache invalidation class).

### Plugins

Lore (opencode-lore) — but the issue is in OpenCode core, not the plugin.

> *[Truncado — 2564 chars totais]*

---

## #24832 — Bug: provider names not documented; disabling providers broken?

📅 `2026-04-28` | ✏️ **peterwwillis** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24832](https://github.com/anomalyco/opencode/issues/24832)


### Description

I am trying to disable providers so I don't have to scroll through 10,000 pages of model names for providers I'll never use.

So I go to the [docs section](https://opencode.ai/docs/config/#disabled-providers) for disabled providers. It gives a couple examples of names of providers, but not all of them. I look around, no list of provider names (for this array).

I try to *guess* some, and it seems like the OpenAI ones don't show up anymore.

But for example, I try to guess the name of the github copilot provider, and it doesn't work. I used "copilot" and "github-copilot", but the copilot models still show up in the model selector.

I also try "opencode-zen" and "zen", but the OpenCode Zen models still show up.

Can we please just get a menu option to enable/disable providers? You have a menu right there in the TUI; would be pretty nice to not force users to edit a file by hand and have to guess random names...

Thanks

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24823 — [Bug] opencode run falls back to non-existent model openai/gpt-5.4 when no -m flag is provided

📅 `2026-04-28` | ✏️ **ilyachu** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24823](https://github.com/anomalyco/opencode/issues/24823)


## Bug Description

When running `opencode run <prompt>` without an explicit `-m` flag, the CLI attempts to use model `openai/gpt-5.4` which does not exist, resulting in a `ProviderModelNotFoundError`. Additionally, in some cases the process hangs indefinitely at 99%+ CPU instead of exiting gracefully.

## Environment

- **OS**: macOS (darwin-arm64)
- **OpenCode version**: 1.3.17 (installed via npm)
- **Node**: v22.22.0 (via nvm)

## Steps to Reproduce

1. Ensure no default model is set in opencode config
2. Run: `opencode run 'Hello world'`
3. Observe error: `Model not found: openai/gpt-5.4`

```
ProviderModelNotFoundError: ProviderModelNotFoundError
 data: {
  providerID: "openai",
  modelID: "gpt-5.4",
  suggestions: [],
},
```

## Expected Behavior

- If no model is specified, opencode should either:
  1. Use the most recently used model from TUI sessions (as discussed in #12667), or
  2. Prompt the user to select a model, or
  3. Exit with a clear message suggesting to use `-m`

- The process should never hang at 100% CPU on a model resolution error

## Additional Context

- The issue makes `opencode run` unusable in headless/batch scenarios (e.g., CI, IDE integrations, or spawning from other tools like Open Design)
- `opencode models` correctly lists available models including anthropic/claude-sonnet-4-6, opencode-go/kimi-k2.6, etc.
- Adding `-m <valid-model>` works around the issue

## Related Issues

- #12667 (model fallback from TUI not respected in CLI)

---

## #24815 — ACP image content blocks with https:// URI silently dropped at agent.ts:1394

📅 `2026-04-28` | ✏️ **truenorth-lj** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24815](https://github.com/anomalyco/opencode/issues/24815)


## Summary

`packages/opencode/src/acp/agent.ts:1394` reads:

```ts
} else if (part.uri && part.uri.startsWith("http:")) {
```

This prefix only matches `http://` URLs. `https://` URLs do **not** start with `"http:"` (the 5th char is `s`, not `:`), so they fall through the `case "image":` branch with no `parts.push` — the image is silently dropped from the prompt with no error or warning.

## Reproducer

Send an ACP `session/prompt` request with an image content block whose `uri` is `https://`:

```json
{
  "type": "image",
  "uri": "https://storage.googleapis.com/bucket/img.png",
  "mimeType": "image/png"
}
```

**Expected**: image part is forwarded to the LLM provider as a `file` part.
**Actual**: case falls through, no `parts.push` runs, image disappears from the prompt.

This breaks every ACP client that does two-stage uploads (sign a GCS / S3 URL, send the URL via ACP rather than inlining base64) — those URLs are always `https://`.

## Why it's almost certainly a typo

Every other URL check in this codebase uses both prefixes:

| File | Pattern |
|------|---------|
| `packages/opencode/src/session/instruction.ts:146,168` | `startsWith("https://") \|\| startsWith("http://")` |
| `packages/opencode/src/cli/cmd/import.ts:98` | `startsWith("http://") \|\| startsWith("https://")` |
| `packages/opencode/src/tool/webfetch.ts:23` | `!startsWith("http://") && !startsWith("https://")` |
| `packages/opencode/src/config/config.ts:1270` | `startsWith("http://") \|\| startsWith("https

> *[Truncado — 2315 chars totais]*

---

## #24813 — Missing /n at the end of "opencode auth" output

📅 `2026-04-28` | ✏️ **theaaronn** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24813](https://github.com/anomalyco/opencode/issues/24813)


### Description

There's a missing line jump at the end of the output of "opencode auth", leaving my prompt in the middle of the screen
Just a one-line change tho

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="1382" height="437" alt="Image" src="https://github.com/user-attachments/assets/a37de80d-64cb-4f90-bfe9-aa075f4b5520" />

### Operating System

_No response_

### Terminal

_No response_

---

## #24784 — Bug: bash tool hangs on Windows when grandchild process inherits stdout pipe

📅 `2026-04-28` | ✏️ **bingkxu** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24784](https://github.com/anomalyco/opencode/issues/24784)


## Description

On Windows, when running build tools like hvigor/Gradle daemons through the bash tool, the command hangs indefinitely even after the child process exits.

## Root Cause

When a child process spawns grandchild processes on Windows, the grandchild may inherit the stdout/stderr pipe handles. Even after the direct child exits (with exit code 0), these inherited handles keep the pipe open, preventing Node.js close event from firing.

In packages/core/src/cross-spawn-spawner.ts, the exitCode is resolved only when the close event fires. This causes Effect.raceAll to hang indefinitely waiting for handle.exitCode.

## Reproduction

1. Run a build command that spawns daemon processes (e.g., hvigorw assembleHap on HarmonyOS projects)
2. Observe that bash tool hangs after the build completes
3. The child process has exited but grandchild daemon still holds the pipe

## Proposed Fix

Add a fallback in the exit event handler: if close does not fire within 2 seconds after exit, resolve exitCode using the exit event data. This matches the documented behavior difference between exit and close events in Node.js.

## Environment

Platform: Windows
Node.js: v20+
OpenCode version: v1.14.x

---

## #24757 — Subtasks do not inherit the active model variant from the parent session

📅 `2026-04-28` | ✏️ **HWliao** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24757](https://github.com/anomalyco/opencode/issues/24757)


### Description

## Version
- opencode: `1.14.28`
- package manager: `bun@1.3.13`
- Source: `packages/opencode/package.json`
## Summary
When running opencode with a selected model variant, subtasks dispatched through the `task` tool do not inherit the parent session's active variant. The subtask keeps the parent model provider/model ID, but the variant is dropped, so the subtask runs with the model's default variant/options instead.
## Expected Behavior
When a parent session is using a model variant, for example `high`, `xhigh`, or another provider-specific reasoning-effort variant, a subtask that inherits the parent model should also inherit the same variant.
Example:
- Parent session model: `test/test-model`
- Parent session variant: `high`
- Subtask agent has no explicit model override
- Subtask should run with `test/test-model` and variant `high`
## Actual Behavior
The subtask inherits only:
```ts
{
  providerID,
  modelID,
}
The active variant is not passed into the subtask prompt input, so the subtask's user message has no model.variant. As a result, the LLM request falls back to the model's default options/variant.
Reproduction Path
1. Configure or select a model with variants, for example a reasoning-effort model with variants such as low, medium, high, or xhigh.
2. Start a normal opencode session with a non-default variant selected.
3. Ask the main agent to dispatch a subtask through the task tool, for example:
Use the Task tool to investigate this issue with the gen

> *[Truncado — 4455 chars totais]*

---

## #24744 — Project edit dialog does not persist name or icon changes

📅 `2026-04-28` | ✏️ **kzekiue** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24744](https://github.com/anomalyco/opencode/issues/24744)


### Description

When editing a project from the OpenCode web sidebar, changing the project name or icon does not reliably persist to the sidebar project item after clicking Save.

For local/global projects, the edit dialog saves the updated name/icon metadata, but the sidebar can continue showing the previous fallback initials/name because the saved local project metadata is not merged back into the displayed project list.

There is also a preview issue where the Avatar component can keep showing fallback initials instead of reacting when an uploaded image `src` is set.

### Plugins

None

### OpenCode version

v1.14.28

### Steps to reproduce

1. Run `opencode web`.
2. Open the web interface.
3. Right-click a project icon in the left sidebar.
4. Select Edit.
5. Change the project name or upload an image in the Icon field.
6. Click Save.
7. Observe that the sidebar project item can continue showing the old name/icon or fallback initials.

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 24.04.4 LTS

### Terminal

gnome-terminal

---

## #24735 — Multi-line paste fragments into separate submitted messages on macOS / iTerm2 in 1.14.28 (regression of #3927)

📅 `2026-04-28` | ✏️ **desideratum** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24735](https://github.com/anomalyco/opencode/issues/24735)


### Description

# Multi-line paste fragments into separate submitted messages on macOS / iTerm2 in 1.14.28 (regression of #3927)

Issue #3927 was closed on the basis that the bracketed-paste fragmentation regression originally reported against 1.0.24 had been resolved in newer versions. On 1.14.28 the behavior is back, or was never fully fixed for this environment.

**Symptom:** Pasting a multi-paragraph block into the TUI prompt causes each paragraph to be submitted to the model as an independent message rather than being collapsed to `[Pasted ~N lines]` and submitted atomically. The collapse-and-expand mechanism described in the #3927 thread as "expected behavior" never engages — the input handler is delivering paragraphs one at a time before the rendering layer sees them.

**Environment:**

- OpenCode 1.14.28
- macOS, iTerm2
- Shell: bash
- No tmux


**Expected:** The entire pasted block is queued as a single input, with `[Pasted ~N lines]` confirmation, matching the behavior other commenters described as restored in newer versions.

**Actual:** Five paragraphs, five separate submitted messages. Screenshot attached.

**Workarounds attempted:**

- iTerm2 Edit > Paste Special > Advanced Paste with "Bracketed paste mode": the checkbox is greyed out for multi-line clipboard contents.
- `experimental.disable_paste_summary: true` in `opencode.json` (suggested in #3927 comments) does not apply — that setting controls collapse rendering, not input handling, and the collapse logic

> *[Truncado — 2487 chars totais]*

---

## #24731 — Bash tool hangs on Windows when command spawns detached child processes (e.g. playwright-cli)

📅 `2026-04-28` | ✏️ **disrei** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24731](https://github.com/anomalyco/opencode/issues/24731)


## Description

On Windows, the Bash tool never returns when executing commands that spawn detached background (daemon) child processes, even though the main process has already exited and all output has been written to stdout.

This affects tools like playwright-cli (from @playwright/cli), which spawns a detached daemon process via child_process.spawn() with detached: true and unref(). The main playwright-cli process completes in ~4 seconds and calls process.exit(0), but the Bash tool continues to wait indefinitely until the user manually cancels it.

## Steps to Reproduce

1. Install playwright-cli: `npm install -g @playwright/cli@latest`
2. Run in OpenCode on Windows:
   ```
   playwright-cli open https://example.com
   ```
3. The command output appears immediately (within ~4 seconds):
   ```
   ### Browser default opened with pid 23536.
   ### Ran Playwright code
   await page.goto('https://example.com');
   ### Page
   - Page URL: https://example.com/
   - Page Title: Example Domain
   ### Snapshot
   - [Snapshot](.playwright-cli\page-....yml)
   ```
4. **But the Bash tool never returns.** The agent cannot proceed to the next step. The user must manually cancel the tool execution.

## Investigation

I spent significant time debugging this and confirmed:

- **The main process exits correctly.** Added debug logging showing program() resolves and process.exit(0) is called within ~4 seconds.
- **The daemon child process is the blocker.** playwright-cli spawns a daemon via sp

> *[Truncado — 3278 chars totais]*

---

## #24722 — DeepSeek thinking mode: reasoning_content not passed back for tool call turns, causing 400 errors

📅 `2026-04-28` | ✏️ **moe5445** | 💬 10 | 🔗 [https://github.com/anomalyco/opencode/issues/24722](https://github.com/anomalyco/opencode/issues/24722)


### Description

When using DeepSeek models (e.g. deepseek-v4-pro, deepseek-v4-flash) with thinking mode enabled, the API requires that reasoning_content from assistant   messages that contained tool calls be included in all subsequent requests. If it's omitted, the API returns a 400 error.

From DeepSeek's docs:
                                                                                                                                    
 ▎ "For turns that do perform tool calls, the reasoning_content must be fully passed back to the API in all subsequent requests. If your code does not     ▎ correctly pass back reasoning_content, the API will return a 400 error."
                                                                                
Reproduction:
  1. Configure OpenCode to use a DeepSeek model with thinking mode enabled                                                                                  2. Ask a question that triggers a tool call (e.g. weather lookup, date check, file read)
  3. The first turn works, but subsequent turns fail with a 400 error
 
  Root cause:                                                                                                                                           
    When serializing assistant messages into the conversation context, OpenCode likely drops reasoning_content from the message object. For non-tool-call
  turns DeepSeek ignores missing reasoning_content, but for tool call turns it's mandatory.
           

> *[Truncado — 1932 chars totais]*

---

## #24699 — Unable to modify the display name of the project icon.

📅 `2026-04-28` | ✏️ **masterzxw** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24699](https://github.com/anomalyco/opencode/issues/24699)


### Description

Edit the project on the left side, change the project name, but it still shows the old project's initials instead of displaying the initials of my renamed project.

### Plugins

_No response_

### OpenCode version

v1.14.28

### Steps to reproduce

Right-click on the project icon on the left.
Select 'Edit' from the pop-up menu.
Change the project's initials and save.
The modification is ineffective; it still shows the old name.

### Screenshot and/or share link

_No response_

### Operating System

Windows10

### Terminal

Windows Terminal

---

## #24688 — Tab key shows incomplete agent list during the first seconds after startup

📅 `2026-04-27` | ✏️ **MBRoi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24688](https://github.com/anomalyco/opencode/issues/24688)


## Description

When OpenCode is freshly started, pressing Tab to switch agents sometimes 
displays only a partial list of available agents. After a few seconds, 
the full list appears.

This is not blocking but is confusing because the user doesn't know if 
their custom agents are correctly loaded or missing.

## Steps to reproduce

1. Have at least 5+ agents configured (mix of built-in and custom in 
   `~/.config/opencode/agents/`).
2. Start OpenCode in a project: `cd /path/to/project && opencode`
3. Immediately press Tab to see the agent list.
4. Wait a few seconds and press Tab again.

## Expected behavior

The Tab menu should display all available agents from the moment OpenCode 
is interactive, OR show a loading indicator if agents are still being 
discovered.

## Actual behavior

Initially Tab shows only a subset of agents (e.g. 3 instead of 5).
After a few seconds, the full list appears.

## Environment

- OpenCode version: 1.14.28
- Number of agents: 7 custom + built-in (build, plan)
- Custom agents location: `~/.config/opencode/agents/` (symlinks to 
  `/opt/harness-templates/agents/`)
- OS: Ubuntu 24.04

## Severity

Cosmetic / minor. Not blocking. Slightly confusing for new users who 
might think their custom agents aren't loaded.

## Suggested improvement

Either:
- Display a loading indicator while agents are being discovered
- Wait until all agents are loaded before allowing Tab interaction
- Document this behavior in the README so users know to wait

---

## #24683 — Context bloat occurs severely. I have configured automatic session compression and reserved tokens, yet automatic compression never triggers normally. This issue exists in every version of OpenCode. Please fix this problem as soon as possible.

📅 `2026-04-27` | ✏️ **slamdunk111** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24683](https://github.com/anomalyco/opencode/issues/24683)


### Description

Your context window management is extremely poor, nowhere near as good as Claude Code.The current OpenCode CLI is incapable of multi-round conversations and long-duration continuous work, because context bloat happens constantly. Every time the context explodes, I have to clean it up manually. Claude Code never has this issue at all.
Your system never performs automatic context compression. I have tried numerous workarounds, including the DCP plugin, CodeMN and other solutions, but none of them work. Please fix this urgently.This tool is poorly developed and practically unusable.

### Plugins

omo，dcp

### OpenCode version

1.4.28

### Steps to reproduce

Launch OpenCode;
Assign complex tasks such as code refactoring, code review, and unit test supplementation;
The context quickly becomes full after a while, with no automatic compression taking effect;
I have enabled automatic context compression and set a reserved token limit. Even after configuring a 50% reserved token ratio, compression still fails to trigger, making the settings completely ineffective;
Once the context blows up, all operations are blocked. I have to compress the context manually, which drastically reduces work efficiency.

### Screenshot and/or share link

<img width="1019" height="1038" alt="Image" src="https://github.com/user-attachments/assets/a644a992-be70-44c9-bc30-8a3ab82abe47" />

### Operating System

macos 26.3

### Terminal

tabby terminal

---

## #24637 — Opening settings for Opencode desktop interrupts ongoing session

📅 `2026-04-27` | ✏️ **silverfoxio** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24637](https://github.com/anomalyco/opencode/issues/24637)


### Description

Opencode Desktop - v1.14.28

Scenario - 

1. Start session
2. Open settings

Expected - 
Session continues in background

Actual - 
Ongoing session is interrupted

### Plugins

_No response_

### OpenCode version

1.14.28

### Steps to reproduce

Scenario - 

1. Start session
2. Open settings

Expected - 
Session continues in background

Actual - 
Ongoing session is interrupted

### Screenshot and/or share link

_No response_

### Operating System

macOs

### Terminal

desktop

---

## #24615 — plan agent bypass

📅 `2026-04-27` | ✏️ **nikitakot** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/24615](https://github.com/anomalyco/opencode/issues/24615)


### Description

opencode can edit files in the default plan agent

if i explicitly configure permissions for the plan agent they're respected, but the default plan agent permissions are somehow lost

```diff
diff --git a/.config/opencode/opencode.json b/.config/opencode/opencode.json
index 99a05b9..c5cf0ce 100644
--- a/.config/opencode/opencode.json
+++ b/.config/opencode/opencode.json
@@ -60,7 +60,7 @@
       "gh pr diff *": "allow",
       "tail *": "allow"
     },
-    "task": "allow",
+    "task": "ask",
     "skill": "allow",
     "lsp": "allow",
     "question": "allow",
@@ -74,6 +74,57 @@
     "context7*": "allow",
     "synthetic-web-search": "allow"
   },
+  "agent": {
+    "plan": {
+      "permission": {
+        "*": "ask",
+        "read": {
+          "*": "allow",
+          "*.env": "deny",
+          "*.env.*": "deny",
+          "*.env.example": "allow"
+        },
+        "edit": "deny",
+        "glob": "allow",
+        "grep": "allow",
+        "list": "allow",
+        "bash": {
+          "*": "ask",
+          "date": "allow",
+          "git status": "allow",
+          "git status *": "allow",
+          "git diff": "allow",
+          "git diff *": "allow",
+          "git log": "allow",
+          "git log *": "allow",
+          "ls": "allow",
+          "ls -la": "allow",
+          "head *": "allow",
+          "pwd": "allow",
+          "cat *": "allow",
+          "echo": "allow",
+          "gh pr view": "allow",
+          "gh pr view *":

> *[Truncado — 2430 chars totais]*

---

## #24613 — OpenCode asks for a permission to access an internal directory of a project

📅 `2026-04-27` | ✏️ **kha84** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24613](https://github.com/anomalyco/opencode/issues/24613)


### Description

Hello guys,

Say I'm in a project directory `~/project/blahblah`. I run opencode from there, the model decides to spawn an agent and at some point it asks for a permission to access project's **internal** directory - `~/project/blahblah/some_internal_directory`. This doesn't sound right to me, as all the internal directories from where I run the opencode are assumed to be accessible. Or is it just me who's not understanding the intention behind this additional approve?

<img width="1848" height="357" alt="Image" src="https://github.com/user-attachments/assets/e14340f3-6e87-41f5-9236-9b3458de100a" />

### Plugins

_No response_

### OpenCode version

1.14.28

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 22.04 lts

### Terminal

Gnome terminal 3.44

---

## #24604 — The write tool was called with invalid arguments: SchemaError

📅 `2026-04-27` | ✏️ **nirolfa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24604](https://github.com/anomalyco/opencode/issues/24604)


### Description

Got this suddenly
The write tool was called with invalid arguments: SchemaError(Missing key
  at ["content"]).
Please rewrite the input so it satisfies the expected schema.

using qwen/qwen3.6-35b-a3b on lmstudio, was working fine before




### Plugins

no plugins

### OpenCode version

opencode 1.14.28

### Steps to reproduce

ask to write plan for next steps in project (in plan mode)

good news, is that if you are in build mode, it's seems to work

very strange :( 



### Screenshot and/or share link

_No response_

### Operating System

ubuntu latest

### Terminal

ghostty

---

## #24599 — OpenCode plugin for VSCode ,the scrollbar is not smooth

📅 `2026-04-27` | ✏️ **kybom** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24599](https://github.com/anomalyco/opencode/issues/24599)


### Description

If the conversation is long and you keep scrolling up and down with your mouse, the scrollbar will gradually start to lag.

### Plugins

opencode

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

windows11

### Terminal

_No response_

---

## #24598 — Message Index / Conversation Navigator disappeared in new version 1.14.x

📅 `2026-04-27` | ✏️ **13640535881** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24598](https://github.com/anomalyco/opencode/issues/24598)


### Description

<img width="1277" height="1153" alt="Image" src="https://github.com/user-attachments/assets/50277554-2af9-46ac-b690-c8fe687c7619" />

### Plugins

none

### OpenCode version

OpenCode Desktop 1.4.7

### Steps to reproduce

This feature is crucial for handling complex multi-round development tasks, especially in the following scenarios:

1.reviewing AI responses to a specific previous input;
2.returning to the previous context after generating long code;
3.comparing the differences in AI responses to different inputs;

### Screenshot and/or share link

Message Index / Conversation Navigator disappeared in new version 1.4.x. I rolled back to version 1.3.17

### Operating System

windows

### Terminal

_No response_

---

## #24594 — User-Agent in custom provider options.headers is overridden

📅 `2026-04-27` | ✏️ **andocodes** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24594](https://github.com/anomalyco/opencode/issues/24594)


### Description

For custom openai-compatible providers (any provider where `providerID` doesn't start with `opencode`), opencode hardcodes `User-Agent: opencode/${InstallationVersion}` in `streamText({ headers })` at `packages/opencode/src/session/llm.ts:381`. The AI SDK merges call-level headers after `provider.getHeaders()`, so this silently overrides any User-Agent the user set via `provider.<name>.options.headers`.

This breaks corporate gateways that allowlist on User-Agent and surprises anyone relying on documented `options.headers`.

### OpenCode version

1.14.28

### Steps to reproduce

1. Configure a custom openai-compatible provider with a User-Agent in `options.headers`:
   ```json
   {
     "provider": {
       "foo": {
         "npm": "@ai-sdk/openai-compatible",
         "options": {
           "baseURL": "https://example.com/v1",
           "headers": { "User-Agent": "myua/1.0" }
         }
       }
     }
   }
   ```
2. Send any chat request through this provider.
3. Inspect the outgoing request — UA is `opencode/1.14.28 ai-sdk/provider-utils/X runtime/bun/Y`. `myua/1.0` is gone.

### Operating System

macOS 15 (Darwin 24.6.0)

---

## #24586 — [BUG] bash tool JSON parsing fails with timeout parameter - duplicate JSON structure

📅 `2026-04-27` | ✏️ **akashkaveti** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24586](https://github.com/anomalyco/opencode/issues/24586)


## Description

When using the `bash` tool with the `timeout` parameter, the tool invocation consistently fails with a JSON parsing error. The error shows the JSON object being **duplicated/concatenated** before parsing, producing invalid JSON.

## Environment

- **opencode version**: 1.14.28
- **Model**: GLM-5.1 via `@ai-sdk/openai-compatible` provider
- **Provider config**: Custom vLLM endpoint (OpenAI-compatible API)
- **OS**: macOS (darwin)

## Reproduction

Any `bash` tool call that includes the `timeout` parameter fails:

```json
{
  "command": "curl -fsSL https://opencode.ai/install | bash",
  "description": "Upgrade opencode via official installer",
  "timeout": 120000
}
```

## Error Message

```
Invalid input for tool bash: JSON parsing failed: Text: {"command": "curl -fsSL https://opencode.ai/install | bash", "description": "Upgrade opencode via official installer","timeout": 120000{"command": "curl -fsSL https://opencode.ai/install | bash", "description": "Upgrade opencode via official installer", "timeout": 120000}.
Error message: JSON Parse error: Expected '}'
```

Note the JSON object appears **twice** — the second copy is concatenated directly after the first with no separator.

## Key Observations

1. **Without `timeout`**: bash tool works perfectly — only `command` + `description` fields succeed every time
2. **With `timeout`**: bash tool fails 100% of the time with the doubled-JSON error
3. **Deterministic**: 40+ consecutive failures with `timeout`, 0 succe

> *[Truncado — 3260 chars totais]*

---

## #24584 — Plugin install ignores .npmrc scoped registry – always fetches from registry.npmjs.org

📅 `2026-04-27` | ✏️ **SB9328** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24584](https://github.com/anomalyco/opencode/issues/24584)


### Description

When a scoped package is configured to use a private registry via `~/.npmrc`, the plugin installation process ignores the scoped registry setting and always attempts to fetch from the default `registry.npmjs.org`, resulting in a 404.



### Plugins

Telemetry plugin hosted on private registry

### OpenCode version

1.14.28

### Steps to reproduce

1. Configure a scoped registry in `~/.npmrc`:
2. Start opencode with `@buildwise-ai/telemetry-plugin` configured as a plugin.
3. Observe the plugin installation attempt.

## Expected Behavior

The plugin installer should respect the scoped registry defined in the user's `.npmrc` and fetch `@buildwise-ai/telemetry-plugin` from `https://daimler.pkgs.visualstudio.com/ROTFOverseas/_packaging/fred/npm/registry/`.

## Actual Behavior

The installer fetches from `registry.npmjs.org`, ignoring the `.npmrc` configuration:

## Environment

- OS: Linux
- `.npmrc` location: `~/.npmrc`

## Notes

It appears the internal npm install logic (`service=npm`) does not read or honor the user's `.npmrc` scoped registry entries. This blocks usage of plugins hosted on private/corporate registries.

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 22.04

### Terminal

_No response_

---

## #24577 — Tapping a session on mobile doesn't close the sidebar

📅 `2026-04-27` | ✏️ **dellarb** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24577](https://github.com/anomalyco/opencode/issues/24577)


### Description

roblem
On mobile viewports, tapping a session in the sidebar navigates to that session, but the sidebar remains open. You have to manually close the sidebar afterward, making session switching on mobile a two-step process (tap session → tap to close sidebar) instead of one.

Expected behavior
Tapping a session on mobile should navigate to the session and close the sidebar, so the user lands directly in the chat view.

Root cause
SessionItem (packages/app/src/pages/layout/sidebar-items.tsx) renders each session as an <A> (SolidJS router link). The onClick handler only clears hover state on non-expanded sidebars:

// SessionRow onClick
onClick={() => {
    if (props.sidebarOpened()) return
    props.clearHoverProjectSoon()
}}
It never calls layout.mobileSidebar.hide(). By contrast, navigateWithSidebarReset() in layout.tsx does both:

const navigateWithSidebarReset = (href: string) => {
    clearSidebarHoverState()
    navigate(href)
    layout.mobileSidebar.hide()
}
But since SessionItem uses declarative <A> navigation, it bypasses that function entirely.

Suggested fix
Pass layout.mobileSidebar.hide (or a callback that includes it) down to SessionItem/SessionRow and call it in the onClick handler when on mobile (or unconditionally — mobileSidebar.hide() is a no-op on desktop). This aligns session-tap behavior with navigateWithSidebarReset and the NewSessionItem component, which also needs the same fix.

### Plugins

_No response_

### OpenCode version

OpenCod

> *[Truncado — 1937 chars totais]*

---

## #24566 — OpenCode can not support DeepSeek tool calling method: DSML(DeepSeek Makeup Language)

📅 `2026-04-27` | ✏️ **lyutian623** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24566](https://github.com/anomalyco/opencode/issues/24566)


### Description

DeepSeek return tool calls data is DSML style (like XML) rather than JSON, so tool calls will always be fail.
And for now, can't find any workable way to support it.

model: `DeepSeek-V4-Flash`

```
<｜DSML｜tool_calls
<｜DSML｜invoke name="question">
<｜DSML｜parameter name="questions" string="false">[{"question": "xxx：", "options": {"label": "xxx", "description": "xxx"}, {"label": "xxx", "description": "xxx"}, "header": "xxx"}]</｜DSML｜parameter>
</｜DSML｜invoke>
</｜DSML｜tool_calls>
```

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24516 — NVIDIA API models hang indefinitely with "Aborted process" - all models affected (DeepSeek V4, Llama, Mistral, Minimax)

📅 `2026-04-26` | ✏️ **alexbayov** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24516](https://github.com/anomalyco/opencode/issues/24516)


### Description

Experiencing the same issue with NVIDIA API models via https://integrate.api.nvidia.com/v1

**Configuration:** All NVIDIA models (deepseek-ai/deepseek-v4-pro, meta/llama-3.3-70b-instruct, mistralai/mistral-large, minimaxai/minimax-m2.7) hang with "Размышляю" status and eventually fail with "Aborted process" error.

**Environment:**
- OpenCode Version: 25
- OS: macOS 26.2 (25C56)

**Logs:**
ERROR 2026-04-26T16:45:20 +230498ms service=session.processor error=Aborted process

Direct curl requests to NVIDIA API work correctly, suggesting streaming response handling issue.


### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24514 — Bug: minimax-coding-plan provider fails with ProviderModelNotFoundError when used as subagent model via Task tool

📅 `2026-04-26` | ✏️ **quirozino** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24514](https://github.com/anomalyco/opencode/issues/24514)


## Bug Description

When `minimax-coding-plan/MiniMax-M2.7` is configured as the `model` for a custom subagent, launching that subagent via the Task tool throws `ProviderModelNotFoundError`. The same model works perfectly when used directly from CLI or TUI.

## Steps to Reproduce

1. Configure a subagent in `~/.config/opencode/opencode.json` with `minimax-coding-plan/MiniMax-M2.7`:

```json
{
  "agent": {
    "my-subagent": {
      "description": "Test subagent",
      "hidden": true,
      "mode": "subagent",
      "model": "minimax-coding-plan/MiniMax-M2.7",
      "prompt": "You are a test agent. Reply with 'working'."
    }
  }
}
```

2. Connect `minimax-coding-plan` via `/connect` — key stored in `auth.json`
3. From a primary agent that has Task tool access, invoke the subagent via Task tool
4. Observe `ProviderModelNotFoundError`

## Expected Behavior

Subagent launches successfully using `minimax-coding-plan/MiniMax-M2.7`, same as when invoked from CLI.

## Actual Behavior

```
ProviderModelNotFoundError
```

The error occurs regardless of whether the API key is in `auth.json` (via `/connect`) or explicitly set in `provider.minimax-coding-plan.api_key` in the config.

## What Works

- `opencode run --model "minimax-coding-plan/MiniMax-M2.7" "hello"` — works fine
- Selecting MiniMax M2.7 as the active model in TUI — works fine
- Other providers (anthropic, openai) as subagent models — work fine

## What Does NOT Work

- `minimax-coding-plan/MiniMax-M2.7` as subagent mode

> *[Truncado — 2209 chars totais]*

---

## #24501 — long running bashes are not killed on Windows when using git bash

📅 `2026-04-26` | ✏️ **nikitakot** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24501](https://github.com/anomalyco/opencode/issues/24501)


### Description

When using git bash shell (bash.exe) on native Windows long running commands are not interrupted when `esc+esc` combination is used.

I believe the issue can be relatively easily fixed by running `taskkill /F /T /PID` for the interrupted bashes when win32 and gitbash is used.

### Plugins

-

### OpenCode version

$ opencode --version 1.14.25

### Steps to reproduce

1. set git bash shell `$env:SHELL = "C:\Program Files\Git\bin\bash.exe"`
2. run opencode `opencode`
3. ask opencode to run something slow, for example `find ~ -name "opencode-dummy.json"`
4. interrupt with `esc+esc`
5. check task manager, the find.exe is still running

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Terminal

---

## #24494 — ACP adapter returns end_turn even when assistant message has internal error

📅 `2026-04-26` | ✏️ **hancengiz** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24494](https://github.com/anomalyco/opencode/issues/24494)


## Summary

The ACP adapter appears to return a successful `stopReason: "end_turn"` even when the underlying assistant message contains an internal error.

This was observed while testing with Fabriqa / Fabriqa.ai acting as the ACP client. Fabriqa finalized the turn from the ACP `end_turn` result, so provider/session errors that remained internal appeared as a blank assistant response.

This is problematic for ACP clients because `end_turn` means the agent completed the turn normally. If the model/provider/session processor failed, the client needs a protocol-visible failure, not only an internal `session.error` event or stderr/log output.

## Why this matters

ACP clients communicate with the agent over JSON-RPC. Stderr/logs are diagnostic only and should not be required for correctness.

If a `session/prompt` turn fails due to provider/model/session error, the ACP adapter should surface that through the ACP/JSON-RPC channel. Returning successful `end_turn` with no useful assistant content causes clients to finalize blank or misleading assistant messages.

ACP references:

- Prompt turn lifecycle: https://agentclientprotocol.com/protocol/prompt-turn
- Stdio transport / stderr logging: https://agentclientprotocol.com/protocol/transports

## Source-level evidence

In `packages/opencode/src/session/processor.ts`, failures are captured on the assistant message:

```ts
ctx.assistantMessage.error = error
yield* bus.publish(Session.Event.Error, {
  sessionID: ctx.assistantMessage.s

> *[Truncado — 3086 chars totais]*

---

## #24489 — Windows skill loading fails when PowerShell archive module cannot load

📅 `2026-04-26` | ✏️ **mugnimaestra** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24489](https://github.com/anomalyco/opencode/issues/24489)


### Description

On Windows, loading a skill can fail before the skill content is shown when opencode bootstraps ripgrep. The ripgrep ZIP extraction path invokes PowerShell `Expand-Archive`, which can fail if `Microsoft.PowerShell.Archive` cannot autoload.

Observed error:

```text
Expand-Archive : The 'Expand-Archive' command was found in the module 'Microsoft.PowerShell.Archive', but the module could not be loaded. For more information, run 'Import-Module Microsoft.PowerShell.Archive'.
FullyQualifiedErrorId : CouldNotAutoloadMatchingModule
```

### Plugins

None required.

### OpenCode version

Current `dev` / Windows build.

### Steps to reproduce

1. On Windows, ensure cached `rg.exe` is removed from `%LOCALAPPDATA%\\opencode\\bin`.
2. Run opencode.
3. Load a skill, for example `context7`.
4. Observe skill loading fail while ripgrep extraction calls PowerShell `Expand-Archive`.

### Screenshot and/or share link

N/A

### Operating System

Windows

### Terminal

PowerShell / Windows Terminal

---

## #24476 — Web prompts can stop after the first reply when client and server clocks differ

📅 `2026-04-26` | ✏️ **Jovines** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24476](https://github.com/anomalyco/opencode/issues/24476)


### Description

I ran into a behavior when using `opencode serve` with the Web UI: the first message received a normal assistant response, but subsequent messages were persisted as user messages without triggering another assistant response.

The same model and configuration worked normally in the terminal/TUI.

After some debugging, this seems related to Web client-generated `messageID`s and clock skew between the browser/client device and the server.

### What I observed

1. Start opencode with `opencode serve`.
2. Open the Web UI from a browser.
3. Send the first message.
4. The assistant responds normally.
5. Send additional messages.
6. The later user messages are persisted in the database.
7. No new assistant message is created.
8. The server log shows:

```text
session.prompt ... exiting loop
```

### Steps to reproduce

1. Start `opencode serve`.
2. Open the Web UI from a browser/device whose clock differs from the server clock.
3. Send a first message.
4. Wait for the assistant response.
5. Send another message.
6. Observe that the later user message is persisted, but no new assistant response is generated.

### Debugging notes

In the database, the later user messages had later `time_created` values, but their `messageID`s sorted before the first assistant message.

In my environment, the server clock was about 170 seconds ahead of the client/browser device that was accessing the Web UI.

After decoding the timestamp portion of the message IDs, the sequence looked 

> *[Truncado — 3516 chars totais]*

---

## #24469 — Get Error to some of the command executed in Windows Powershell

📅 `2026-04-26` | ✏️ **akvimal** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24469](https://github.com/anomalyco/opencode/issues/24469)


### Question

Provided below is the terminal log throwing error for the commands in windows. What should be the fix to make it working in windows?

# Find test files in the project
$ find . -name "*test*" -type f | head -20
head : The term 'head' is not recognized as the name of a cmdlet, function, script file, or operable program. Check 
the spelling of the name, or if a path was included, verify that the path is correct and try again.
At line:1 char:33
+ find . -name "*test*" -type f | head -20
+                                 ~~~~
    + CategoryInfo          : ObjectNotFound: (head:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException
I see that you're trying to use the head command, but it's not available in the PowerShell environment. Let me modify my approach to find and display the first 20 test files using PowerShell commands instead.
# Find test files using PowerShell
$ find . -name "*test*" -type f | Select-Object -First 20
File not found - *test*
I need to check what files are available in the current directory to understand the project structure. Let me do that first.
# List all files in current directory
$ ls -la
Get-ChildItem : A parameter cannot be found that matches parameter name 'la'.
At line:1 char:4
+ ls -la
+    ~~~
    + CategoryInfo          : InvalidArgument: (:) [Get-ChildItem], ParameterBindingException
    + FullyQualifiedErrorId : NamedParameterNotFound,Microsoft.PowerShell.Commands.GetChildItemCommand
I see y

> *[Truncado — 1652 chars totais]*

---

## #24446 — Output broken, returning 'Session compacted' unsure of cause, desktop app

📅 `2026-04-26` | ✏️ **scannermobs** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24446](https://github.com/anomalyco/opencode/issues/24446)


### Description

Using latest MacOS version, connected to gemma-4 via Jan, worked fine initially, but all of a sudden all messages have a weird looping bug where it keeps repeating 'Session compacted' and outputting a plan tree rather than normal messages, but strangely it can still perform build tasks. Tried reconnecting Jan, clearing OpenCode's cache / reinstalling. Once bug has occurred it pollutes chat with free online models.

Buggy output looks like this:

Goal

Retrieve and display the contents of test.html.
Constraints & Preferences

(none)
Progress

Done

### Plugins

_No response_

### OpenCode version

1.14.25

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

26.4.1 

### Terminal

_No response_

---

## #24445 — Windows 11: long-running full TUI sessions accumulate large JS heap; reopening the session amplifies it via rehydration

📅 `2026-04-26` | ✏️ **Zireael** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24445](https://github.com/anomalyco/opencode/issues/24445)


### Description

On Windows 11, the full opencode TUI accumulates memory during long-running sessions, and reopening the same session later can amplify the problem by rehydrating a large amount of already-accumulated session state into the visible UI process.

The immediate multi-GB jump on reopen is how I first investigated it, but the more common user-facing problem is simpler: leave opencode running for hours in a real terminal UI, keep using tools, and memory keeps climbing.

I am not reporting this as "Task Manager is high, therefore GC leak". I collected heap snapshots and compared the headful TUI process against the backend/server process.

What I observed:

- The problem is much more noticeable when the full TUI is displayed in WezTerm than in background/headless-ish processes.
- During long sessions, memory continues to accumulate in the visible TUI process as message/tool artifacts build up.
- Reopening an existing long session with `opencode -s <session-id>` can then land the visible UI process around ~2.2 GB working set immediately because that accumulated state gets rehydrated.
- The TUI heap snapshot contains large live JS object/string populations with many repeated retained strings that look like session message artifacts / tool-output text, not just native memory.
- The backend/server heap snapshot does **not** show the same string patterns.

Measured on the visible TUI process (`node.exe` -> `opencode.exe -s ses_23b915ae7ffefRLpSGxeVIBLhc`):

- 2026-04-26 08

> *[Truncado — 8008 chars totais]*

---

## #24438 — bug(app): Home page shows empty "Recent projects" when headless serve has only the global "/" project

📅 `2026-04-26` | ✏️ **Edison-A-N** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24438](https://github.com/anomalyco/opencode/issues/24438)


### Description

When running `opencode serve` (headless) on a fresh install with no prior sessions, the web UI Home page shows "Recent projects" with an empty-looking list. The server returns a single auto-created project `{id: "global", worktree: "/"}`, which causes `sync.data.project.length > 0` to be true, entering the "Recent projects" branch in the `<Switch>` at `packages/app/src/pages/home.tsx:88`.

The project renders as a ghost button containing just `/` — virtually invisible on a white background. The user sees no actionable UI and no way to start a new session.

**Expected:** Either filter out the synthetic `"/"` global project so the empty-state UI appears (folder icon + "Open project" button), or auto-navigate into the project.

**Root cause in code:**

`packages/app/src/pages/home.tsx` lines 88-115 — the `<Switch>` first branch checks `sync.data.project.length > 0`. The global project with `worktree: "/"` passes this check, but renders as a nearly invisible `/` ghost button.

`packages/opencode` headless serve creates this global project automatically when no directory is specified.

### Plugins

none

### OpenCode version

dev branch (latest)

### Steps to reproduce

1. Fresh install, no prior sessions
2. Run `opencode serve --port 3000` (headless, no specific project directory)
3. Open web UI at the serve address
4. Home page shows "Recent projects" header with no visible entries below it
5. User has no obvious way to proceed

### Screenshot and/or share link


> *[Truncado — 1718 chars totais]*

---

## #24430 — Session error path drops `cause` and stack from `ProviderInitError`, hiding root cause

📅 `2026-04-26` | ✏️ **NathanDrake2406** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24430](https://github.com/anomalyco/opencode/issues/24430)


### Description
When `Provider.resolveSDK` throws `InitError({providerID}, {cause: e})` (`packages/opencode/src/provider/provider.ts:1522`), the session pipeline catches it and re-emits via `new NamedError.Unknown({message: err.message}).toObject()`. `err.cause` and stack are discarded.

Consumers (e.g. `cli/cmd/github.ts:986`) only see:
```
Agent error: { name: "UnknownError", data: { message: "ProviderInitError" } }
```

This makes CI failures undebuggable. The real failure (NPM install error, missing peer dep, network failure, etc.) lives on `err.cause` and is silently dropped.

**Expected:** preserve the original named error (`name: "ProviderInitError"`) and pass `cause` chain through to the consumer, e.g.
```ts
new NamedError.Unknown({ message: err.message }, { cause: err.cause })
```
and serialize cause chain in `toObject()`. Or stop re-wrapping `ProviderInitError` as `UnknownError` at the session boundary.

### OpenCode version
1.14.25 (also reproduces on 1.14.22)

### Steps to reproduce
1. Trigger any failure inside `resolveSDK` — easiest path: `cloudflare-ai-gateway/openai/gpt-5.4` on a fresh CI runner (see #24431)
2. Observe CI log shows only `UnknownError: ProviderInitError` — the underlying `InstallFailedError` and its `cause` are gone.

### Operating System
Linux (GitHub Actions ubuntu-latest), macOS 25.4

### Impact
Every cf-ai-gateway repo that hit the 1.14.x install regression saw an unactionable error. Multiple Cloudflare repos (workers-sdk, workerd, kumo, co

> *[Truncado — 1615 chars totais]*

---

## #24409 — [BUG] Missing tools form ha-mcp server

📅 `2026-04-26` | ✏️ **mcblum** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24409](https://github.com/anomalyco/opencode/issues/24409)


### Description

I'm at a loss with this one! I've tried everything I can think of, and still cannot figure out what's going on. When setting up ha-mcp there are a bunch of missing tools. It loads 80 of the 96 tools, according to the logs, but is missing a bunch of functionality. When I configure it for Claude, it works right away.

### Plugins

None

### OpenCode version

1.14.25

### Steps to reproduce

1. Install opencode
2. Install ha-mcp
3. Connect to Home Assistant
4. See 80/96 tools loaded in the logs

### Screenshot and/or share link

<img width="997" height="2158" alt="Image" src="https://github.com/user-attachments/assets/99aa0075-e0c4-4942-8b51-c769fdccf1d0" />

### Operating System

MacOs 26

### Terminal

Warp

---

## #24408 — Every Bash command executes twice | not reproduceable now

📅 `2026-04-25` | ✏️ **remcoboerma** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24408](https://github.com/anomalyco/opencode/issues/24408)


### Description

Summary: Every bash tool call runs the command twice, causing unintended side effects (duplicate file edits, double deletions, etc.).
Similar issues were seen but could not be reproduced with code edits using the regular write tools. 

trying the below reproduction in a specific thread consistantly yields these issues, while starting a new one to validating the bugreport doesn't. same model. same folder. same text. the specific thread was prior work , upgraded opencode, and continued the thread. maybe that had something to do with it? 

Submitting for future reference. 

### Plugins

none specifically

### OpenCode version

1.14.25

### Steps to reproduce

Steps to reproduce:
1. Create a test file with 10 lines:
      printf '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n' > /tmp/test_double.txt
   2. Delete line 3:
      sed -i '3d' /tmp/test_double.txt
   3. Read the file:
      cat /tmp/test_double.txt
   
Expected output:
1
2
4
5
6
7
8
9
10
Actual output:
1
2
5
6
7
8
9
10
Both line 3 (3) and the new line 3 (4) were deleted, proving the sed command ran twice.
Impact:
- sed -i deletions remove two lines instead of one
- sed -i substitutions apply twice (potentially corrupting data)
- File writes via write tool may produce duplicate content
- Any destructive command has double the intended effect
- This has caused extensive code corruption throughout the current session

### Screenshot and/or share link

_No response_

### Operating System

Linux Mint 22.2 

### Terminal



> *[Truncado — 1505 chars totais]*

---

## #24399 — CLI stuck on '2 message reverted' while model runs invisibly

📅 `2026-04-25` | ✏️ **charnet3d** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24399](https://github.com/anomalyco/opencode/issues/24399)


### Description

The CLI UI got stuck on '2 message reverted' when I performed an undo to a prior message to retry after a llama model restart. The work continued but no new messages appeared on the main session. I could however switch to subagents and see their progress, just not the orchestrator. And not sure if relevant or not but my orchestrator only has permission to run subagents, I disabled all other tools (so it correctly delegates instead of sometimes doing work itself)

I wasn't used to the CLI so it took me a while to figure out that I could fork the session and I finally got access to the hidden messages. I used to do the same undo interaction in the desktop client and it worked fine: I undo to a prior point and can continue as usual.

This is possibly related to [this issue](https://github.com/anomalyco/opencode/issues/9811). I found it closed so I created this new one.

### Plugins

none

### OpenCode version

1.14.24

### Steps to reproduce

1. Run opencode in CLI
2. Run some request with many tool calls and subagents (not sure if subagents are needed).
3. Do a manual stop of the agent.
4. send "go on"
5. let it run some steps.
6. undo to "go on"
7. Here it shows "2 message reverted" but stop showing new messages in the orchestrator session, only subagents accessible.


### Screenshot and/or share link

<img width="1019" height="419" alt="Image" src="https://github.com/user-attachments/assets/9d79c9c1-c172-48e6-9c5f-26096749a2fe" />

### Operating System

Windo

> *[Truncado — 1594 chars totais]*

---

## #24349 — BUG: models.dev is very slow and latent on listing new openrouter models, opencode cannot detect new models

📅 `2026-04-25` | ✏️ **Jaaaky** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24349](https://github.com/anomalyco/opencode/issues/24349)


### Description

models.dev is very slow and latent on listing new openrouter models, opencode cannot detect new models
Right now for example MiMo-2.5 and Mimo-2.5 pro are not listed, also gpt-5.5 was not added until few hours ago despite being on openrouter for many hours.
Adding a model manually in opencode.json can be done, but the problem it does not reflect pricing correctly

opencode should access openrouter on new session and ask for model list if openrouter API is defined, at least if it did not dynamically grab the models with the past hour.

### Plugins

None

### OpenCode version

1.14.25

### Steps to reproduce

1. Connect openrouter
2. List models
3. Cannot find xiaomi/mimo-v2.5 despite it's on https://openrouter.ai/xiaomi/mimo-v2.5 for 3 days already!

### Screenshot and/or share link

_No response_

### Operating System

archlinux

### Terminal

screen

---

## #24328 — [BUG] Lock operations lack timeout/eviction; concurrency issues in acp/session and session/run-state

📅 `2026-04-25` | ✏️ **alfredocristofano** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/24328](https://github.com/anomalyco/opencode/issues/24328)


## Description

Four concurrency improvements:

1. **src/util/lock.ts** — Lock operations have no timeout. A stuck lock holder blocks all waiters forever. No deadlock detection.

2. **src/tool/edit.ts** — `locks` Map grows unbounded per unique file path. No eviction mechanism.

3. **src/acp/session.ts** — `setModel`/`setVariant`/`setMode` do read-then-Map.set() on the same object reference already stored in the Map. The redundant `.set()` creates an illusion of atomic update.

4. **src/session/run-state.ts** — `runners.delete()` + `runners.get()` in the onIdle callback are separate operations, not atomic within cooperatively-scheduled Effect fibers.

### Reproduction steps

1. Inspect `src/util/lock.ts` — note no timeout parameter exists on `read()` or `write()` lock operations
2. Inspect `src/tool/edit.ts:35` — note the `locks` Map has no eviction logic
3. Inspect `src/acp/session.ts` — note `this.sessions.set(sessionId, session)` after mutating the object already in the Map
4. Inspect `src/session/run-state.ts:53-57` — note `delete()` and `get()` are separate calls

### Environment info

- OS: all
- Bun version: 1.3.x
- OpenCode version: current dev branch

---

## #24316 — Progress halts with qwen 3.6 35b-a3b with naked tool call in the console

📅 `2026-04-25` | ✏️ **boutell** | 💬 16 | 🔗 [https://github.com/anomalyco/opencode/issues/24316](https://github.com/anomalyco/opencode/issues/24316)


### Description

Not sure why this happens or whether it is properly regarded as a qwen bug, a llama.cpp bug (I'm using a very recent source build), or an opencode bug. But here you are in case it is helpful:

```
  ┃  Thinking: <tool_call>                                                                                                                                           
  ┃  <function=read>                                                                                                         ▼ Modified Files                        
  ┃  <parameter=filePath>                                                                                                    packages/apostrophe/lib/mongod +22 -1   
  ┃  /Users/ai/apostrophe/packages/apostrophe/modules/@apostrophecms/page/index.js                                           packages/apostrophe/modules/@ap +6 -2   
  ┃  </parameter>                                                                                                            packages/apostrophe/modules/@ap +1993   
  ┃  <parameter=limit>                                                                                                       packages/apostrophe/modules/@ap +5 -1   
  ┃  15                                                                                                                      packages/apostrophe/test/module +1 -4   
  ┃  </parameter>                                                                                                           

> *[Truncado — 4329 chars totais]*

---

## #24286 — Web UI shows lower version than CLI after update

📅 `2026-04-25` | ✏️ **ItsMaxChen** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24286](https://github.com/anomalyco/opencode/issues/24286)


## Issue

After updating OpenCode via CLI upgrade command, the web UI version number does not match the CLI version.

**Environment:**
- CLI version: 1.14.24
- Web UI version: 1.14.23

**Steps to reproduce:**
1. Run `opencode upgrade` to update from 1.14.22 to 1.14.24
2. Check CLI version: `opencode --version` → shows 1.14.24
3. Open web UI at http://localhost:4096
4. Check JS bundle version: `curl -s http://localhost:4096/assets/index-*.js | grep -o 1\.14\.[0-9]*` → shows 1.14.23

**Expected:** Web UI should display version 1.14.24, matching the CLI version.

**Actual:** Web UI JS bundle contains hardcoded version 1.14.23, while CLI binary reports 1.14.24.

**Note:** The CLI binary correctly reports 1.14.24, but the bundled JavaScript assets served by `opencode web` still contain the previous version number.

---

## #24281 — Bug: Duplicate OAuth requests to Google when using Vertex AI provider

📅 `2026-04-25` | ✏️ **aeroxy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24281](https://github.com/anomalyco/opencode/issues/24281)


### Description

When using the Google Vertex AI provider (`google-vertex`), both opencode's fetch wrapper and the `@ai-sdk/google-vertex` SDK independently call `google-auth-library` to obtain access tokens via `oauth2.googleapis.com/token`. This results in **duplicate OAuth requests** on every LLM API call:

```
Request 1: opencode's fetch wrapper
POST https://oauth2.googleapis.com/token

Request 2: SDK's generateAuthToken()
POST https://oauth2.googleapis.com/token
```

Expected: 1 OAuth request per token (cached until expiry)
Actual: 1-2 OAuth requests per LLM call

### Screenshot and/or share link

N/A - can be verified via HTTP debug logs

### Root Cause

The `google-vertex` provider in `packages/opencode/src/provider/provider.ts` uses `google-auth-library` in the `fetch` wrapper to set the Bearer token. However, the SDK (`@ai-sdk/google-vertex`) also calls `generateAuthToken()` internally, causing duplicate requests.

### Fix

Modified the provider to pre-create an auth promise at init time and cache the result after first use. The SDK's `fetch` function now provides the Bearer token, preventing the SDK from making its own OAuth request.

### Related

- SDK: `@ai-sdk/google-vertex@4.0.112`
- Auth library: `google-auth-library@10.5.0`

### Plugins

`google-vertex` provider with `@ai-sdk/google-vertex@4.0.112`

### OpenCode version

1.14.24

### Steps to reproduce

1. Configure opencode with Google Vertex AI provider
2. Enable debug HTTP logging
3. Make an LLM request usi

> *[Truncado — 1742 chars totais]*

---

## #24280 — Dedicated worker for syntax highlighting (worker-BDowWIry.js) consuming 102% CPU when opening session

📅 `2026-04-25` | ✏️ **lexin2002** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24280](https://github.com/anomalyco/opencode/issues/24280)


### Description

审査

Git changes
内容太多导致
这个 worker-BDowWIry.js 是 Shiki（代码高亮引擎），opencode 用它给代码做语法着色。

文件本身是正常的，问题在于：它被要求处理的内容太多了，导致 CPU内存 跑满。页面无响应卡死

### Plugins

_No response_

### OpenCode version

v1.14.24

### Steps to reproduce

在审査
界面下加载变更就会卡死

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24276 — /review command throws ProviderModelNotFoundError due to zero-width space in subagent_type

📅 `2026-04-25` | ✏️ **Blankll** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24276](https://github.com/anomalyco/opencode/issues/24276)


## Bug Description

Running `/review` throws a `ProviderModelNotFoundError`. The root cause is a zero-width space (U+200B) prepended to the `subagent_type` value in the skill template, producing an invalid model identifier.

## Steps to Reproduce

1. Run `/review` in OpenCode
2. Observe `ProviderModelNotFoundError`

## Expected Behavior

`/review` executes normally without a model lookup error.

## Actual Behavior

```
ProviderModelNotFoundError: Provider model not found: "​Sisyphus - Ultraworker"
```

The string `"​Sisyphus - Ultraworker"` contains a leading zero-width space (U+200B), making the model ID unresolvable.

## Root Cause

The `review-work` skill template generates a `task()` call with `subagent_type="​Sisyphus - Ultraworker"` where a zero-width space character (U+200B) is embedded before "Sisyphus". This causes the provider model lookup to fail.

## Environment

- OpenCode version: `1.14.24`
- Platform: macOS (darwin)
- Date: 2026-04-25

---

## #24267 — Opencode Plugin - Agent mode Change Event

📅 `2026-04-25` | ✏️ **iambpn** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24267](https://github.com/anomalyco/opencode/issues/24267)


### Question

Is there a way to detect the agent mode change even in the plugins?? I tried looking at the docs and it didnt mention anything about this so is it possible as of now?? If not can we add this feature??

---

## #24266 — InternalError: peer closed connection without sending complete message body (incomplete chunked read)

📅 `2026-04-25` | ✏️ **macacd** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24266](https://github.com/anomalyco/opencode/issues/24266)


## Bug Description

While executing a bash command, I received an internal error with a type validation failure. The connection to the LLM peer was closed unexpectedly, and the error response did not match the expected schema.

## Error Details

**Error Type:** InternalError
**Message:** `peer closed connection without sending complete message body (incomplete chunked read)`
**Request ID:** `5df824fc-dbb8-4a99-b3cc-ea1eaa93b0b1`

**Validation Error:**
```json
{
  "code": "invalid_union",
  "errors": [],
  "note": "No matching discriminator",
  "discriminator": "type",
  "path": ["type"],
  "message": "Invalid input"
}
```

## Context

- Platform: macOS (darwin)
- The error occurred during a bash command execution
- The error has been reproduced multiple times in the same session

## Expected Behavior

Either the command should complete successfully, or a properly formatted error response should be returned that matches the expected schema.

## Actual Behavior

The connection was closed prematurely, and the error response failed type validation, making it impossible to handle gracefully.

---

## #24264 — Nvidia NIM API hangs for DeepSeek v4 reasoning models without chat_template_kwargs

📅 `2026-04-25` | ✏️ **Zireael** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24264](https://github.com/anomalyco/opencode/issues/24264)


### Description

   ### Description
When using Nvidia NIM's `deepseek-ai/deepseek-v4-flash` or `deepseek-v4-pro` reasoning models through OpenCode, the API hangs and never returns a response.
   
This happens because Nvidia NIM strictly requires `chat_template_kwargs: { enable_thinking: true, thinking: true }` in the root of the JSON payload to stream reasoning tokens. Because the Vercel AI SDK strips out unknown configurations, attempting to configure this via `opencode.jsonc` does not work, resulting in an indefinite timeout.
   
### Steps to Reproduce
1. Configure OpenCode to use the `nvidia` provider.
2. Select `deepseek-ai/deepseek-v4-flash` as the active model.
3. Send a prompt.
4. The API connection hangs and eventually times out without a response.
   
### Expected Behavior
OpenCode should correctly inject `chat_template_kwargs` into the fetch payload when a `deepseek-v4` model is active, allowing it to successfully receive and process the reasoning and text streams.

### Plugins

_No response_

### OpenCode version

1.14.24

### Steps to reproduce

  Steps to Reproduce
   1. Configure OpenCode to use the Nvidia NIM API by setting up an NVIDIA_API_KEY or configuring the provider in your settings.
   2. In opencode.jsonc, ensure that a deepseek-v4 model is configured under the nvidia provider:

       "provider": {
         "nvidia": {
           "models": {
             "deepseek-ai/deepseek-v4-flash": {
               "limit": { "context": 100000, "input": 70000, "ou

> *[Truncado — 2489 chars totais]*

---

## #24249 — Unusable sessions after 1.14.24 upgrade. New messages on session with just 161.2k context are now triggering compaction but never succeeds. It claims to have over 1M context. Conversations before 1.14.24 are now unrecoverable because of this.

📅 `2026-04-25` | ✏️ **raymelon** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24249](https://github.com/anomalyco/opencode/issues/24249)


### Description

Unusable sessions after 1.14.24 upgrade. New messages on session with just 161.2k context are now triggering compaction but never succeeds. It claims to have over 1M context. Conversations before 1.14.24 are now unrecoverable because of this.

```
Error from provider (DeepSeek): This model's maximum context length is 1048576 tokens. However, you requested 1762911 tokens (1730911 in the messages, 32000 in the completion). Please reduce the length of the messages or completion.
```



### Plugins

_No response_

### OpenCode version

1.14.24

### Steps to reproduce

1. Upgrade to 1.14.24
2. Load an old session with under 1M context
3. Continue the conversation expecting it to work like on older versions
4. Watch a compaction trigger
5. Retry compaction with a 1M context model and watch it struggle to compact it

### Screenshot and/or share link

_No response_

### Operating System

Windows 10

### Terminal

Windows Terminal

---

## #24240 — opencode TUI fails to launch with setRawMode errno 9 on macOS (web UI works)

📅 `2026-04-25` | ✏️ **mikeyi2a** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24240](https://github.com/anomalyco/opencode/issues/24240)


### Description

opencode v1.14.24 installed via Homebrew on macOS (Darwin 25.3.0, zsh) launches to a blank screen when run as opencode (TUI mode). The process starts but never renders the interface and does not respond to input.

Environment

opencode 1.14.24 (/opt/homebrew/bin/opencode)
macOS Darwin 25.3.0, zsh
Reproduced in both IDE integrated terminal and macOS Terminal.app
Steps tried

opencode --version / --help → both work correctly
opencode --print-logs --log-level DEBUG → blank screen
opencode --pure --print-logs --log-level DEBUG → blank screen (DB migration completed successfully on this run)
Cleared ~/.local/share/opencode and ~/.cache/opencode → no change
Tried in native Terminal.app (not IDE terminal) → still blank
Log output (~/opencode.log)


INFO  service=server-proxy version=1.14.24 args=["--print-logs","--log-level","DEBUG"] opencode
ERROR service=server-proxy e=setRawMode failed with errno: 9 exception
ERROR service=server-proxy error=setRawMode failed with errno: 9 process error
ERROR service=server-proxy e=EIO: i/o error, read exception
Workaround
opencode web launches successfully and is fully functional, so the issue is isolated to the TUI's TTY/raw-mode initialization.

Expected
TUI renders and accepts input.

Actual
Blank screen, no input response, setRawMode fails with errno 9 (EBADF).

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operatin

> *[Truncado — 1552 chars totais]*

---

## #24239 — Agent `prompt` field is not sent as system message to Ollama-compatible local models

📅 `2026-04-25` | ✏️ **corneliustd** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24239](https://github.com/anomalyco/opencode/issues/24239)


### Description

## Bug Description
When configuring a custom agent with a `prompt` field in `opencode.json`, the prompt is not injected as the system message when the agent uses a local model via an OpenAI-compatible provider (e.g. Ollama). The model receives no system prompt at all, so any instructions in the agent prompt are silently ignored.

### Plugins

_No response_

### OpenCode version

1.14.24

### Steps to reproduce

## Steps to Reproduce
1. Configure a custom agent in `opencode.json` with a `prompt` field:
```json
"gentleman-local": {
  "mode": "primary",
  "model": "ollama/qwen2.5:7b",
  "prompt": "Your working directory is /Users/me/project. Always use absolute paths when calling file tools."
}
2. Start a session with this agent
3. Ask it to read a file: read pom.xml
4. The model calls read with a placeholder path like /path/to/pom.xml instead of /Users/me/project/pom.xml
Expected Behavior
The prompt field should be sent as the system message in the chat completion request, exactly as it works for cloud models (e.g. Claude, GPT).
Actual Behavior
The model receives no system prompt. Verified by:
- Checking opencode logs: the prompt content never appears
- Testing the same model directly via curl with the prompt as system message → model behaves correctly
- Testing with inline prompt string in opencode.json (not {file:...}) → same result, prompt is ignored


### Screenshot and/or share link

Evidence
Direct curl with system prompt works correctly:
curl http://loca

> *[Truncado — 2271 chars totais]*

---

## #24217 — TUI double-ESC loops and Desktop stop button fails to interrupt

📅 `2026-04-24` | ✏️ **bukanpeneliti** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24217](https://github.com/anomalyco/opencode/issues/24217)


### Description

I am experiencing two related interruption issues on Windows with OpenCode v1.14.24: one in the TUI and one in the Desktop GUI. This happens when using DeepSeek V4 models via OpenCode Go or Ollama Cloud.

**TUI:** When I press `ESC` to interrupt an ongoing session, the UI enters a loop displaying:
- `ESC to interrupt`
- `ESC again to interrupt`
- `ESC interrupt`

This cycles repeatedly and does not actually stop the running session.

**Desktop:** When a session is running, clicking the **Stop** button has no effect. The task continues and I cannot force it to stop.

These issues do not happen 100 % of the time, but they occur frequently enough to make the interrupt/stop functionality unreliable.

Possibly related issues:
- Desktop: #23968 (v1.14.21 — cannot stop task, UI freezes)
- TUI: #21743 (shell/session interrupt regression, ESC unreliable), #22638 (background agents cannot be interrupted via ESC), #14694 (interrupt not working on Windows)

### Plugins

_No response_

### OpenCode version

1.14.24

### Steps to reproduce

**TUI:**
1. Start a session (using DeepSeek V4 via OpenCode Go or Ollama Cloud) and let the agent begin working.
2. Press `ESC` once to trigger interruption.
3. Press `ESC` again when prompted.
4. Observe that the UI loops between "ESC to interrupt" / "ESC again to interrupt" / "ESC interrupt" without stopping the session.

**Desktop:**
1. Start a session in OpenCode Desktop (using DeepSeek V4 via OpenCode Go or Ollama Cloud).
2. While 

> *[Truncado — 1790 chars totais]*

---

## #24207 — OpenCode plugin for VSCode closes immediately when

📅 `2026-04-24` | ✏️ **CoryAlbrecht** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24207](https://github.com/anomalyco/opencode/issues/24207)


### Description

OpenCode exits immediately when the python extensions need to activate a venv.

<img width="1695" height="691" alt="Image" src="https://github.com/user-attachments/assets/d0b699f6-aa52-4d76-8339-941ae867986a" />

### Plugins

All the Microsoft python ones

### OpenCode version

1.14.24

### Steps to reproduce

1. Set up a python project
2. Create a venv for it
3. Try to open an OpenCode window

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

vscode

---

## #24204 — opencode run fails with Session not found when OPENCODE_SERVER_PASSWORD is set

📅 `2026-04-24` | ✏️ **rmk40** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24204](https://github.com/anomalyco/opencode/issues/24204)


### Description

\`opencode run\` fails immediately with \`Error: Session not found\` when \`OPENCODE_SERVER_PASSWORD\` is present in the environment.

This is reproducible without any model-specific behavior. The command succeeds after unsetting the server auth env vars.

Related: #14532 is closed; this issue provides a current minimal repro on \`1.14.24\` for the remaining \`opencode run\` path.

### Plugins

None.

### OpenCode version

1.14.24

### Steps to reproduce

1. Set a server password in the shell environment:

\`\`\`bash
export OPENCODE_SERVER_PASSWORD=secret
\`\`\`

2. Run:

\`\`\`bash
opencode run "Reply with exactly OK."
\`\`\`

3. Observe:

\`\`\`text
Error: Session not found
\`\`\`

4. Run the same command after unsetting the server auth env vars:

\`\`\`bash
env -u OPENCODE_SERVER_PASSWORD -u OPENCODE_SERVER_USERNAME \\
  opencode run "Reply with exactly OK."
\`\`\`

5. Observe that \`opencode run\` proceeds normally.

Expected: \`opencode run\` should work when \`OPENCODE_SERVER_PASSWORD\` is set, or at least authenticate its own in-process server requests consistently with the server auth config.

Actual: the in-process server rejects the SDK client's session creation request, and the CLI reports \`Session not found\`.

### Screenshot and/or share link

N/A

### Operating System

macOS 26.4.1 arm64

### Terminal

zsh / shell environment

---

## #24182 — [CRITICAL] OpenCode continues to not create its stated storage log files of messages and tool use. [5th Ticket]

📅 `2026-04-24` | ✏️ **davidbernat** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24182](https://github.com/anomalyco/opencode/issues/24182)


### Description

These issues persist with fresh installs of OpenCode, with or without our custom configurations. This is a mission critical failure on behalf of OpenCode, and must be addressed by its staff immediately. We welcome your replies.

c.f. Jay V, Frank Wang, Dax Raad, and Adam Elmore. 

v1.4.10 OpenCode
MacOS 26.2.1

It is a valid career ender for you guys. So do us the complimentary favor of addressing this ticket.
DeepSeek is asking us what we want China to architect on software engineering.
Even if I misconfigured the opencode.json the failure to produce engagement is the ticket being presented.
And we know about the permission errors populating the other tickets, including the MythOS relationships.
Founder to Founder we are reasonably presenting you the necessary opportunities for transparency **today**.

<img width="779" height="290" alt="Image" src="https://github.com/user-attachments/assets/2a9a6e83-5de5-4294-b576-121c35df23fb" />

### Plugins

None

### OpenCode version

v1.4.10

### Steps to reproduce

1. Install OpenCode
2. Run OpenCode
3. Check for Logs files.
4. None

### Screenshot and/or share link

_No response_

### Operating System

macOS 26.2.1

### Terminal

IntelliJ & Terminal

---

## #24181 — Invalid YAML in agent .md frontmatter silently ignored — agent loads with degraded config

📅 `2026-04-24` | ✏️ **MaxImum2509** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24181](https://github.com/anomalyco/opencode/issues/24181)


### Description

## Description

When an agent `.md` file contains invalid YAML frontmatter, OpenCode loads the
agent anyway — but **all frontmatter is silently discarded**. The agent loads
with its filename-derived name and without its prompt, permissions, or tool
configuration. No error is shown to the user.

## Root cause

gray-matter (the YAML frontmatter parser) does not throw on invalid
YAML by default. When js-yaml fails (e.g., skill:true without space),
gray-matter returns the raw frontmatter as a string in md.data instead
of a parsed object.
This means:
- ConfigMarkdown.parse() never throws → the catch block in loadAgent
  is never reached → no Session.Event.Error is published
- { ...md.data } spreads a string → garbage instead of config
- The explicit name: agentName (from filename) survives, masking the error

## Relevant code

packages/opencode/src/config/markdown.ts:71-89
```python
export async function parse(filePath: string) {
    const template = await Filesystem.readText(filePath)
    try {
        const md = matter(template)
        return md   // ← returns with md.data as string on YAML error
    } catch { ... }
}
```

packages/opencode/src/config/config.ts:219-231
```python
const config = {
    name: agentName,        // ← "my-agent" from filename
    ...md.data,             // ← string spread → garbage, loses frontmatter name
    prompt: md.content.trim(),
}
const parsed = Agent.safeParse(config)
if (parsed.success) {
    result[config.name] = parsed.data

> *[Truncado — 2605 chars totais]*

---

## #24142 — fix(desktop): health check fails during server startup causing IDE instability

📅 `2026-04-24` | ✏️ **herjarsa** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24142](https://github.com/anomalyco/opencode/issues/24142)


### Pre-flight Checks
- [x] I have searched existing issues and this is not a duplicate
- [x] I understand this issue needs status:approved before a PR can be opened

### Bug Description
The desktop app health check does not retry when the local server sidecar is still initializing. This causes:
1. MCP local connections to repeatedly disconnect and reconnect
2. IDE freezes when switching between sessions
3. Server marked as unhealthy even though it is still starting up

### Steps to Reproduce
1. Open OpenCode desktop app
2. Server sidecar starts but health check fires immediately
3. Health check fails because server is not ready yet
4. Desktop app shows server as down
5. IDE becomes unresponsive or MCPs disconnect

### Expected Behavior
Health check should retry with exponential backoff until the server is ready, up to a reasonable timeout.

### Actual Behavior
Health check fails instantly on first attempt, causing cascading instability.

### Operating System
Windows

### Agent / Client
OpenCode Desktop

### Shell
PowerShell

### Relevant Logs
Server stdout shows "sidecar process spawned, waiting for server to become healthy" followed immediately by health check error without retries.

### Additional Context
Related PR: #24138 which implements retry logic.

---

## #24132 — coding agent often abruptly stops mid codeblock

📅 `2026-04-24` | ✏️ **johanneslatzel** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24132](https://github.com/anomalyco/opencode/issues/24132)


### Description

When writing codeblocks (in markdown?) the coding agent often abruptly stops mid codeblock. This occurs when I use
- Terminal + Opencode
- Tabby + Opencode
- VSCode + Opencode (Extension)
- OpenCode desktop application

<img width="1160" height="676" alt="Image" src="https://github.com/user-attachments/assets/ddcb9d26-7da8-4d9a-8d7b-b9051ec9976e" />

<img width="1020" height="233" alt="Image" src="https://github.com/user-attachments/assets/ed8b4c81-2e41-4d74-b884-89356a24cd4f" />

### Plugins

_No response_

### OpenCode version

v1.14.22

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Linux Mint 22.3 - Cinnamon 64-bit

### Terminal

Terminal

---

## #24123 — Tool call not allowed while generating summary: dummy_tool

📅 `2026-04-24` | ✏️ **wangjiecloud** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24123](https://github.com/anomalyco/opencode/issues/24123)


### Description

When I run “/compact”  the CLI tool reports this error” .

model  :  claude 4.6 sonnet 
error info : Tool call not allowed while generating summary: dummy_tool 


### Plugins

only cli 

### OpenCode version

v1.4.4

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

macos sequoia 15.5

### Terminal

iterm2

---

## #24095 — [Bug] mimo-v2.5 model calls non-existent 'websearch' tool (name incompatibility)

📅 `2026-04-24` | ✏️ **Electricitysheep** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24095](https://github.com/anomalyco/opencode/issues/24095)


### Describe the bug

I'm using the `mimo-v2.5` model in OpenCode, and whenever the model tries to perform a web search, it calls a tool named `websearch` which doesn't exist. The actual tool in OpenCode is `websearch_web_search_exa`.

This causes the tool call to fail with an error about the tool not being available.

### Reproduction steps

1. Configure OpenCode to use `mimo-v2.5` model
2. Ask the model to search for something on the web (e.g., "find the official documentation for X")
3. Observe the model attempting to call `websearch` tool
4. Error appears: model tried to call unavailable tool `websearch`

### Expected behavior

The model should call `websearch_web_search_exa` instead of `websearch`.

### Environment

- OpenCode version: (unable to run `opencode version`, needs manual check)
- OS: Windows 10.0.26200.0
- Terminal: PowerShell 5.1.26100.8115
- Model: mimo-v2.5

### Additional context

This seems to be the same issue as:
- #20650 (Kimi k2.5 tool calling issue)
- #234 (Broader report on open source model tool calling incompatibility)

The root cause appears to be model-tool name incompatibility: third-party models are trained/prompted to use tool names that don't match OpenCode's registered tool names.

### Request

Could the maintainers consider:
1. Adding tool alias support in opencode configuration to map model-expected names to actual tool names
2. Adding mimo-v2.5 to any known compatibility issues list until fixed

Thanks for maintaining OpenCode!

---

## #24089 — Model output (Markdown text) cannot be rendered.

📅 `2026-04-24` | ✏️ **Tide-Breeze** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24089](https://github.com/anomalyco/opencode/issues/24089)


### Description

Model output (Markdown text) in TUI cannot be rendered; it is displayed in its original syntax, and the rendered text is not output.
Like this:

<img width="734" height="280" alt="Image" src="https://github.com/user-attachments/assets/36245d8e-a9f4-4892-94f2-08b07a30295b" />

### Plugins

None

### OpenCode version

1.14.22

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

windows11

### Terminal

powershell

---

## #24081 — Can't run 1.14.21 & 1.14.22 in WSL1: cannot execute binary file: Exec format error

📅 `2026-04-24` | ✏️ **lengran** | 💬 15 | 🔗 [https://github.com/anomalyco/opencode/issues/24081](https://github.com/anomalyco/opencode/issues/24081)


### Description

OpenCode used to work fine with WSL1. But in 1.14.21 and 1.14.22 I got this error:

    Can't run 1.14.21 & 1.14.22 in WSL1: cannot execute binary file: Exec format error

The last version I can use is 1.14.20.

### Plugins

None

### OpenCode version

1.14.22

### Steps to reproduce

1. Use WSL1 on Win11 x86_64.
2. Install OpenCode 1.14.21/1.14.22.

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Terminal

---

## #24078 — Regression: Windows desktop 1.14.19 significantly slower than previous version (same model/workflow)

📅 `2026-04-24` | ✏️ **csliuchi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24078](https://github.com/anomalyco/opencode/issues/24078)


### Description

## Environment
- OpenCode Desktop: 1.14.19 (slow) vs previous weekly version (fast after downgrade)
- OS: Windows 11
- Model: MiniMax-M2.7 (same model in both tests)
- Workflow: boss-find-candidates, 5 candidates, same project/workspace

## What changed
After upgrading to 1.14.19, end-to-end runtime nearly doubled.
After uninstall + downgrade to previous version（1.4.5）, speed returned to normal.

## Repro
1. Run same workflow for 5 candidates on 1.14.19
2. Record session metrics
3. Downgrade to previous version
4. Re-run same workflow with same model/settings
5. Compare session metrics

## Measured results
- 1.14.19:
  - total: ~24–25 min
  - avg agent gap: 29–36s
  - avg input tokens/step: 4660–5079
  - compactions: 6–7
- downgraded（1.4.5）:
  - total: ~10.6 min
  - avg agent gap: 14.1s
  - avg input tokens/step: 2284
  - compactions: 2

## Additional note
“List files failed” was also observed in desktop UI on Windows (likely indexing layer), while tool-call history does not show corresponding tool errors.

## Expected
Performance should be close to pre-1.14 behavior for same model/workflow.

## Actual
Significant regression in latency and context growth after upgrade.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24074 — qwen 3.6 plus,Unable to cancel token billing

📅 `2026-04-24` | ✏️ **renyiwei-xinyi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24074](https://github.com/anomalyco/opencode/issues/24074)


### Description

Seven dollar lesson, I was doing a project analysis using qwen 3.6 plus, and the number of tokens used locally and actually received was only 0. A few dollars. The actual charge is a few dollars at seven.
When I look at the model feature qwen 3.6 Plus in Open Router, the interrupt output is not supported

<img width="498" height="568" alt="Image" src="https://github.com/user-attachments/assets/2e4826df-b6ec-456a-b7bb-18ab8df7e860" />

<img width="967" height="391" alt="Image" src="https://github.com/user-attachments/assets/18dafe8d-47f3-43e7-a27d-c854234d0d6c" />

account: renyiwei1129@163.com

### Plugins

oh-my-openagent

### OpenCode version

1.14.20

### Steps to reproduce

1、oh-my-openagent.json like this:
`{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/master/assets/oh-my-openagent.schema.json",
  "background_task": {
    "defaultConcurrency": 5,
    "modelConcurrency": {
      "opencode-go/kimi-k2.5": 3,
      "opencode-go/qwen3.6-plus": 2,
      "opencode-go/minimax-m2.7": 3,
      "opencode-go/minimax-m2.5": 3,
      "opencode-go/mimo-v2-omni": 1
    }
  },
  "hooks": {
    "auto-update-checker": {
      "enabled": true,
      "checkIntervalHours": 24
    },
    "background-notification": {
      "enabled": true,
      "showProgress": true
    },
    "category-skill-reminder": {
      "enabled": true
    },
    "ralph-loop": {
      "enabled": true
    },
    "task-reminder": {
      "enabled": true,
      "intervalMin

> *[Truncado — 7372 chars totais]*

---

## #24073 — Desktop: project color not saved after edit

📅 `2026-04-24` | ✏️ **MikeSoton** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24073](https://github.com/anomalyco/opencode/issues/24073)


### Description

In OpenCode Desktop, modifying project settings (specifically the color) and clicking save does not persist the changes.


### Plugins

_No response_

### OpenCode version

1.14.22

### Steps to reproduce

1. Open OpenCode Desktop
2. Select any existing workspace or create a new one
3. Open project settings/edit
4. Change the color and click save，didn't work
5. Relaunch OpenCode Desktop
6. The color has changed to a different random color
7. Repeat steps 5-7 multiple times, each restart produces a different random color

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Desktop app

---

## #24061 — OpenCode ACP Registry agent not working in Zed

📅 `2026-04-23` | ✏️ **DanielUgoAli** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/24061](https://github.com/anomalyco/opencode/issues/24061)


### Description

**Bug: Agent panel stuck on loading when switching to OpenCode agent installed via ACP Registry**

When switching to the OpenCode agent after installing it through the ACP Registry, the agent panel is stuck indefinitely on the loading screen. The issue resolves only after manually adding the agent to `settings.json`.

**Workaround:**
I just manually added the OpenCode agent entry to `settings.json` like this:
```json
  "OpenCode": {
        "command": "opencode",
        "args": ["acp"]
    }
```

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

**Steps to reproduce:**
1. Install the OpenCode agent via the ACP Registry
2. Switch to OpenCode's agent via the agent panel
3. The panel is just stuck on loading  .....

### Screenshot and/or share link

_No response_

### Operating System

Windows11

### Terminal

_No response_

---

## #24012 — Newlines in command should be preserved in ACP mode

📅 `2026-04-23` | ✏️ **feisuzhu** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24012](https://github.com/anomalyco/opencode/issues/24012)


### Description

ACP command argument parsing in `agent.ts` destroys newlines. When an ACP client sends a command like `/pivot prometheus\nmy multi-line prompt`, the argument text arrives with all newlines replaced by spaces.

### Plugins

oh-my-openagent

### OpenCode version

1.14.21

### Steps to reproduce

1. Send a `/command foo bar\n\nbaz\n\nquux` in ACP mode, and the arguments are joined together.

### Screenshot and/or share link

<img width="1894" height="1487" alt="Image" src="https://github.com/user-attachments/assets/4fd564bb-eb8b-41c3-933d-44a528ca4b92" />
<img width="1594" height="1274" alt="Image" src="https://github.com/user-attachments/assets/01494596-9d87-4b8f-a0d9-e15e6ed4b2b9" />

### Operating System

Ubuntu 24.04

### Terminal

Alacritty

---

## #24011 — Session retries forever on weekly rate limit errors

📅 `2026-04-23` | ✏️ **eeshm** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24011](https://github.com/anomalyco/opencode/issues/24011)


### Description

When a provider returns a non-transient 429 (e.g. GitHub Copilot "exceeded your weekly rate limit"), the session retries forever instead of stopping. User has to press Esc to exit.

The AI SDK marks all 429s as isRetryable: true, so retryable() never returns undefined for these errors.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

1. Use a provider (e.g. GitHub Copilot) until the weekly rate limit is exhausted
2. Send any message
3. Session keeps showing "attempt 1", "attempt 2"... indefinitely

### Screenshot and/or share link

<img width="1151" height="852" alt="Image" src="https://github.com/user-attachments/assets/0c61d1bd-9fd6-42e6-8744-1b825969737a" />

### Operating System

Windows 11

### Terminal

Windows Terminal

---

## #24010 — Minmax  and GLM models (Minmax 2.7, GLM 5,5.1 ) no thinking level support via opencode zen provider

📅 `2026-04-23` | ✏️ **devharshthakur** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24010](https://github.com/anomalyco/opencode/issues/24010)


### Description

I am using `opencode` [**zen**](https://opencode.ai/zen) as my provider, in `opencode` in **minmax models** and **GLM Models** i do not get to change thinking level via `ctrl + t` like in case of `openai` **GPT** models. 

In case of [**pi**](https://pi.dev/) agent, using same [**zen**](https://opencode.ai/zen) as provider i get to chose the thinking level, so it is a bug in `opencode`. 

### Plugins

No plugins

### OpenCode version

1.14.21

### Steps to reproduce

1. Select Minmax 2.7 model via `/models`
2. Try setting `thinking` level via `ctrl + t` shortcut, nothing happens

### Screenshot and/or share link

_No response_

### Operating System

macOS 26

### Terminal

Ghostty

---

## #24003 — [BUG] bash tool fails with "invalid_type" when description parameter is omitted

📅 `2026-04-23` | ✏️ **diegoantony** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24003](https://github.com/anomalyco/opencode/issues/24003)


### Description

When calling the bash tool without providing the optional description parameter, the tool fails with error:
- "expected string, received undefined" for path ["description"]
Steps to reproduce:
1. Call bash tool with only command parameter: {"command": "git status"}
2. Observe error: "The bash tool was called with invalid arguments"
Expected behavior:
- The description parameter should be optional (as per schema where it's not marked as required)
- The tool should execute successfully without description

### Plugins

none

### OpenCode version

1.14.21

### Steps to reproduce

avalie a pasta .git do projeto


$ cd /home//Work/projeto&& ls -la .git/
The bash tool was called with invalid arguments: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "description"
    ],
    "message": "Invalid input: expected string, received undefined"
  }
].
Please rewrite the input so it satisfies the expected schema.

### Screenshot and/or share link

_No response_

### Operating System

wsl ubuntu 22.04

### Terminal

power shell

---

## #23997 — fix(mcp): MCP server loses connection mid-session causing intermittent failures

📅 `2026-04-23` | ✏️ **herjarsa** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23997](https://github.com/anomalyco/opencode/issues/23997)


### Pre-flight Checks
- [x] I have searched existing issues and this is not a duplicate
- [x] I understand this issue needs status:approved before a PR can be opened

### Bug Description
The MCP server intermittently loses connection mid-session, causing multiple MCP tools to return "Not connected". This happens after the connection was successfully established and used.

### Steps to Reproduce
1. Start an OpenCode session
2. Verify MCPs work (e.g., `supabase_list_projects` returns data)
3. Use multiple MCP calls over several minutes
4. Eventually, MCPs like Supabase, Desktop Commander, n8n, and Universal Brain return `Not connected`
5. Other MCPs with persistent connections (Telegram, MetaTrader 5) continue working

### Expected Behavior
MCP connections should remain stable throughout the session, or auto-reconnect transparently.

### Actual Behavior
Multiple MCPs simultaneously fail with `Not connected`:
- `supabase_list_projects` → `Not connected`
- `desktop-commander_list_directory` → `Not connected`
- `n8n_n8n_health_check` → `Not connected`
- `universal-brain_ping` → `Not connected`

Meanwhile, MCPs with their own persistent connections remain functional:
- `telegram-mcp_get_me` → ✅ Works
- `metatrader_get_account_info` → ✅ Works

### Operating System
Windows 11

### Agent / Client
OpenCode

### Shell
PowerShell 5.1

### Relevant Logs
```
# Initial connection established:
> supabase_list_projects
[
  {"name":"Signalyn","id":"sglwgnwidhzddnuwewps"},
  {"name":"alpha-forg

> *[Truncado — 1979 chars totais]*

---

## #23982 — LSP initialize timeout too short for Java/Gradle projects (~15s vs ~114s needed)

📅 `2026-04-23` | ✏️ **norbu35** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23982](https://github.com/anomalyco/opencode/issues/23982)


## Description

`lsp_diagnostics` always fails with `Error: LSP request timeout (method: initialize)` when used against a Java/Gradle project managed by JDTLS (Eclipse JDT Language Server). The built-in timeout for the LSP `initialize` request appears to be ~15 seconds, but JDTLS requires ~114 seconds to perform Gradle sync and workspace indexing for a moderately-sized project.

## Steps to Reproduce

1. Configure `opencode.json` with `"tools": { "lsp": true }`
2. Open a Java/Gradle project (e.g., 3,000+ Java source files, ~60 dependencies, annotation processing enabled)
3. Trigger `lsp_diagnostics` on any `.java` file via an agent tool call
4. Observe the error: `Error: LSP request timeout (method: initialize)`

## Expected Behavior

JDTLS should be given enough time to complete Gradle project import and workspace initialization. For Java/Gradle projects, this routinely takes 60–180 seconds depending on project size. The `initialize` timeout should be configurable and/or default to a value that accommodates JVM-based language servers.

## Actual Behavior

opencode times out the `initialize` request after ~15 seconds, killing the JDTLS process and returning an error. Each failed attempt also leaves the JDTLS workspace in a dirty state (see evidence below), causing a cascading failure that makes subsequent attempts even slower.

## Evidence

**JDTLS workspace log** (`~/.cache/jdtls/.../.metadata/.log`):

```
!MESSAGE Importing Gradle project(s)
!MESSAGE Workspace initialized i

> *[Truncado — 3400 chars totais]*

---

## #23973 — wrong api endpoints on website docs

📅 `2026-04-23` | ✏️ **rzgrozt** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23973](https://github.com/anomalyco/opencode/issues/23973)


### Description

Can you update API endpoints for opencode accounts. I'm trying to connect to API endpoint with OpenAI compatible to use my API key outside of Opencode but I get invalid url error. I'm trying to connect on onlyoffice ai agent configuration.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

1. Checking İf API endpoints are working properly.
2. Changing if necessary

### Screenshot and/or share link

<img width="971" height="741" alt="Image" src="https://github.com/user-attachments/assets/7d7b6fda-3fcd-4bba-927c-cce27f97999a" />

### Operating System

CachyOS

### Terminal

_No response_

---

## #23968 — v1.14.21 Desktop: Extreme lag, erratic behaviour, cannot stop task, cannot restart, cannot start new task

📅 `2026-04-23` | ✏️ **christophbouvier** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23968](https://github.com/anomalyco/opencode/issues/23968)


### Description

Upgraded to v1.14.21 which shows erratic behaviour that is potentially difficult to reproduce. I have no idea how I could describe that a bug, see below for the steps I took. This all happened after having upgraded to v1.14.21.

- I cannot stop a running task
- not even restarting seems to help
- OpenCode might open many new sessions for the same prompt

Using OpenCode with the github/Claude Sonnet 4.6 model.

Can rule out local networking issues, I just measured I have ~230mbit of bandwidth available. 

Looks as if OpenCode resumes after a restart, but there is no way to stop a running task.



### Plugins

speckit

### OpenCode version

v1.14.21

### Steps to reproduce

- I sent a prompt, nothing happened for more than half an hour.
- OpenCode would not stop even when clicking the Stop button
- Decided to restart, obviously it tried to pick up where it left off, but could not stop execution either
- Decided to restart my PC which did not help
- Tried creating a /new session. Worked, but I could not send my prompt and OpenCode eventually froze
- Tried again, same behaviour (maybe tried a third or fourth time)
- After several minutes, OpenCode had opened 12 new sessions for the prompt I had tried to send minutes earlier (I haven't tried 12 times, processing all at the same time
- Tried to restart, it looks as if only the first of these sessions is actually working. I can't select any other session
- OpenCode eventually froze again
- After a restart I tried de

> *[Truncado — 2019 chars totais]*

---

## #23957 — Trying to import Markdown session transcript fails with "File not found" instead "Unsupported format"

📅 `2026-04-23` | ✏️ **sylv-io** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23957](https://github.com/anomalyco/opencode/issues/23957)


### Description

~OpenCode fails to import session files, claiming that they do not exist.~

I made the wrong assumption and tried to import the session transcript instead of the session data in JSON format. OpenCode provided an error message, but it did not match the reason why it failed.

To prevent others from making the same mistake, I recommend adapting the error message to inform users that the session data must be in JSON format instead of claiming that the file does not exist.


### Plugins

_No response_

### OpenCode version

1.14.21

### Steps to reproduce

```
$ opencode --version
1.14.21
$ ls
session-ses_24ad.md
$ opencode import --pure session-ses_24ad.md
File not found: session-ses_24ad.md
```

### Screenshot and/or share link

_No response_

### Operating System

Arch Linux

### Terminal

Alacritty, xterm, foot, kitty....

---

## #23956 — server_error with OpenAI provider in OpenCode CLI, while direct Codex CLI works fine

📅 `2026-04-23` | ✏️ **reimurashiki** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23956](https://github.com/anomalyco/opencode/issues/23956)


### Question

Hi OpenCode team,

I want to ask whether this is a known compatibility/integration issue with OpenAI/Codex in OpenCode, especially in agent/streaming flow.

## Problem
When I use my GPT/Codex account through OpenCode CLI, I often get this error:

```json
{"type":"error","sequence_number":2,"error":{"type":"server_error","code":"server_error","message":"An error occurred while processing your request. You can retry your request, or contact us through our help center at help.openai.com if the error persists. Please include the request ID ac4ddf64-7ea0-49d7-8382-b8b6672310fc in your message.","param":null}}
```

What is strange is:
- This happens in OpenCode CLI
- But when I use Codex CLI directly, I do **not** get this error

So it seems like the issue may be related to the OpenCode/agent integration layer rather than Codex itself.

## Environment
- OS: Windows
- OpenCode version: 1.14.20
- Provider: OpenAI
- Model: openai/gpt-5.4
- Terminal: hyper, windows terminal

## Reproduction
1. Open OpenCode CLI
2. Use provider/model: gpt-5.4
3. Run an agent task or prompt
4. Wait for response streaming
5. Error appears very early with `sequence_number: 2`

## Expected behavior
The request should complete normally, similar to when using Codex CLI directly.

## Actual behavior
OpenCode intermittently returns `server_error`, while the same account/model workflow works in Codex CLI direct usage.

## What I already tried
- Retried multiple times
- Confirmed the account/model w

> *[Truncado — 1973 chars totais]*

---

## #23952 — [BUG] The opencode-desktop app cannot be displayed.

📅 `2026-04-23` | ✏️ **devcxl** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23952](https://github.com/anomalyco/opencode/issues/23952)


**Description**  
When running `opencode-desktop`, the application window fails to display (blank screen or fails to launch). However, running `opencode web --hostname 127.0.0.1 --port 4096` and opening the browser works perfectly.  
The same operating system and opencode version work fine on another machine (a laptop with integrated graphics).  
I suspect this might be an upstream issue with Electron or graphics drivers, but I have no clue how to proceed.

**Environment**  
- OS (same on both machines): Manjaro Linux (rolling, as per `/etc/os-release`)  
- opencode version: `1.14.20`  
- Problem PC: Desktop, RTX 3060 graphics card  
- Working PC: Laptop, integrated graphics 

**Expected behavior**  
`opencode-desktop` should display the application interface normally.

**Actual behavior**  
`opencode-desktop` shows nothing (blank/black window, no rendering, or exits immediately).  
Web mode works normally.

**Additional information**  
- Both machines have the same OS (Manjaro Linux) and same opencode version (`1.14.20`)  
- The issue only occurs on the RTX 3060 desktop; the integrated-graphics laptop works fine  
- Suspected Electron / specific GPU or driver compatibility issue, but I don't know how to debug further

**Possible troubleshooting requests**  
- Is there a way to view Electron renderer process logs or error messages?  
- Can I launch with flags to disable GPU acceleration for testing?  
- Could this be due to missing graphics libraries or driver version mismatc

> *[Truncado — 2214 chars totais]*

---

## #23951 — `opencode mcp auth` does not print authorize URL to terminal, making it unusable over SSH

📅 `2026-04-23` | ✏️ **forrust** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23951](https://github.com/anomalyco/opencode/issues/23951)


### Description

When running `opencode mcp auth <server>` in a headless / SSH environment where no browser can be launched on the host, the CLI shows only a spinner (`Starting OAuth flow...`) and never prints the authorization URL to stdout. The URL is only written to the log file at `~/.local/share/opencode/log/*.log`.
This makes OAuth-based MCP authentication effectively unusable over SSH without either:
1. Grepping the log file manually to extract the URL, or
2. Knowing in advance to set up an SSH port-forward for `127.0.0.1:19876`.
## What happened
Ran `opencode mcp auth atlassian` over an SSH session. The CLI showed:
```
┌  MCP OAuth Authentication
│
◒  Starting OAuth flow..
```
...and hung indefinitely. No URL was printed. The browser-open attempt silently failed because the remote host has no browser / `DISPLAY`.
I only recovered the URL by grepping the OpenCode log file:
```bash
grep "opening browser for oauth" ~/.local/share/opencode/log/*.log | tail -1
```
which revealed the authorize URL. After setting up an SSH tunnel from my local machine:
```bash
ssh -L 19876:127.0.0.1:19876 user@remote
```
pasting the URL in my local browser, and completing the Atlassian consent, the callback succeeded and tokens were stored correctly.
## Expected behavior
Print the authorize URL to stdout so the user can copy it into a local browser. Other tools (e.g. `gh auth login`, `flyctl auth login`, Claude Code) handle this by always printing the URL to the terminal as a fallback when `

> *[Truncado — 2464 chars totais]*

---

## #23939 — oxlint LSP doesn't load

📅 `2026-04-23` | ✏️ **michalkvasnicak** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23939](https://github.com/anomalyco/opencode/issues/23939)


### Description

`oxlint` never starts, it is configured properly.

### Plugins

_No response_

### OpenCode version

1.14.21

### Steps to reproduce

1. install oxlint + configure it
2. do any work on typescript files
3. no oxlint LSP is started
4. run `opencode debug lsp diagnostics src/renderer/App.tsx --print-logs --log-level DEBUG` or similar
5. in logs there is:
```
INFO  2026-04-23T07:20:27 +0ms service=bus type=lsp.updated publishing
INFO  2026-04-23T07:20:27 +69ms service=lsp.server oxlint not found, please install oxlint
```

I'm oxlint runs in my project, I'm using `pnpm`.

### Screenshot and/or share link

_No response_

### Operating System

macOS 26.3.1

### Terminal

Ghostty

---

## #23931 — Nano-GPT Model stops working abruptly

📅 `2026-04-23` | ✏️ **sirschubert** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23931](https://github.com/anomalyco/opencode/issues/23931)


### Description

Nano-GPT model (specifically Kimi k2.6) stops working without any error. I need to manually tell it to continue for it to proceed. I don't if it's the opencode issue or nanoGpt itself

### Plugins

_No response_

### OpenCode version

 OpenCode 1.14.20

### Steps to reproduce

1. Ask AI to do something
2. AI starts to think and do
3. Suddenly it stops mid-work

### Screenshot and/or share link

_No response_

### Operating System

Arch Linux

### Terminal

Kitty

---

## #23911 — ESLint LSP fails to load

📅 `2026-04-23` | ✏️ **Duncan3142** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23911](https://github.com/anomalyco/opencode/issues/23911)


# ESLint LSP diagnostics never surface in opencode

## Summary

With an `eslint` dependency in the project, opencode's TUI reports the ESLint LSP as loaded but the agent never sees any ESLint diagnostics — even ones that `mise run lint` and the VS Code `dbaeumer.vscode-eslint` extension both report on the same file. Investigation revealed two distinct bugs. The second is the blocker: opencode's LSP client does not implement LSP 3.17 pull-model diagnostics, which is the only mode the current `vscode-eslint` server (v3.x) uses.

## Environment

- opencode: `1.14.20` (from `/devvol/data/mise/installs/github-anomalyco-opencode/1.14.20/opencode`)
- Node: `24.15.0`
- OS: Linux (devcontainer)
- Project has `eslint` as a peer dependency and uses ESLint flat config with `@typescript-eslint/prefer-readonly-parameter-types` enabled.
- Visible in VS Code and `mise run lint`: `src/bin/cli.ts:19:18 warning Parameter should be a read only type (@typescript-eslint/prefer-readonly-parameter-types)`.

## Expected behaviour

opencode spawns the ESLint language server, it initialises successfully, and ESLint diagnostics (matching what VS Code's `dbaeumer.vscode-eslint` extension and `eslint` CLI report) are exposed to the LLM.

## Actual behaviour

No ESLint diagnostics are ever surfaced to the agent. The LSP client lifecycle completes without error, but every `publishDiagnostics` has `count=0`.

## Bug 1 — auto-installed `vscode-eslint` is missing its server runtime dependencies

### Observatio

> *[Truncado — 7347 chars totais]*

---

## #23908 — [BUG] Sub-session agents fail to resolve OpenRouter model IDs — no model/provider override in createAgentProvider()

📅 `2026-04-22` | ✏️ **Paatricious** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23908](https://github.com/anomalyco/opencode/issues/23908)


### Description

When sub-agents (explore, librarian, oracle, hephaestus, etc.) are spawned via the oh-my-openagent plugin, they fail to resolve OpenRouter model IDs (e.g. `anthropic/claude-sonnet-4.6`, `google/gemini-3-flash`) because `createAgentProvider()` performs a hardcoded lookup in `models.SupportedModels` using the agent's configured model ID. Sub-session agents are created with `config.AgentTask` (see `agent-tool.go:57`), which reads from `config.Agents[AgentTask].Model` — a static global config key, not the model/provider specified by the parent session or plugin.

The oh-my-openagent plugin calls `promptAsync` with `model: { providerID: "openrouter", modelID: "anthropic/claude-sonnet-4.6" }` in the request body. However, OpenCode's server-side agent creation completely ignores this field and instead uses the hardcoded `AgentTask` model from global config. This means:

1. OpenRouter model IDs (e.g. `anthropic/claude-sonnet-4.6`) do not exist in `models.SupportedModels` — OpenCode uses its own prefixed IDs (e.g. `openrouter.claude-3.5-sonnet`, `openrouter.gpt-4o`)
2. Even if the ID existed, `createAgentProvider()` at `agent.go:712` does `models.SupportedModels[agentConfig.Model]` with no fallback or override mechanism
3. The error manifests as **"Provider returned error"** (when model resolution partially succeeds but provider lookup fails) or **"Missing Authentication header"** (when the model can't be resolved at all and falls back to a broken provider)

### Plugi

> *[Truncado — 4569 chars totais]*

---

## #23907 — model executed .cmd script despite shell permission being set to `Ask`

📅 `2026-04-22` | ✏️ **BoringBoredom** | 💬 10 | 🔗 [https://github.com/anomalyco/opencode/issues/23907](https://github.com/anomalyco/opencode/issues/23907)


### Description

My settings are configured to ask for permission for shell execution by default, and so far it has worked as expected. Earlier, it ran a build script, specifically `$ ./build.cmd`, without me having to approve its execution.

### Plugins

_No response_

### OpenCode version

Desktop 1.14.20

### Steps to reproduce

Not sure if this helps, but the project is a .NET 10 C# app, and the `build.cmd` file contains `dotnet publish .\test\test.csproj -c Release -r win-x64 -p:PublishSingleFile=true -p:PublishSelfContained=false`.
The model I used is GPT 5.4 xhigh.

```
Verification
  1. Build and launch the app.
```
This was part of the plan I told it to implement, but the expected behavior is prompting for permission first.

### Screenshot and/or share link

_No response_

### Operating System

Windows 11 24H2

### Terminal

_No response_

---

## #23900 — Cannot connect to API when LM Studio is a remote host

📅 `2026-04-22` | ✏️ **drcursor** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23900](https://github.com/anomalyco/opencode/issues/23900)


### Description

Can't use LM Studio from other host. 
If I forward the port to localhost it works without any issue.

### Plugins

_No response_

### OpenCode version

1.14.20

### Steps to reproduce

1. Configure LM Studio to accept network connections
2. Configure LM Studio provider with any of the following URLs "baseURL": "http://192.168.0.100:1234/v1", "http://192.168.0.100:1234/api/v1", "http://hostname:1234/v1", "http://hostname:1234/api/v1"
3. When using any model from that provider, you receive the following error "Cannot connect to API: Was there a typo in the url or port? [retrying in 3s "
4. Check that curl can access any of the URLs above (it can)
5. Port forward the port localhost:1234, change config, everything works.


### Screenshot and/or share link

_No response_

### Operating System

OpenCode on MacOS LM Studio on Windows 11

### Terminal

_No response_

---

## #23897 — [Bug] Ctrl+D keybind ignored during question tool — treated as cancel instead of mapped action

📅 `2026-04-22` | ✏️ **oribarilan** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23897](https://github.com/anomalyco/opencode/issues/23897)


I remapped `messages_half_page_down` to `ctrl+d` in `tui.json`:

```json
{
  "keybinds": {
    "messages_half_page_up": "ctrl+u",
    "messages_half_page_down": "ctrl+d"
  }
}
```

`ctrl+u` works fine everywhere, including while a question tool prompt is active — I can scroll up through the conversation while picking an answer. `ctrl+d` cancels the question prompt instead of scrolling down. The remap is ignored.

I think the question widget has a hardcoded handler for `0x04` (ctrl+d) that fires before the keybind config is checked. The TUI runs in raw mode so terminal EOF semantics aren't the issue — it's the app interpreting the byte directly.

Neovim gets this right — it reads raw bytes, checks the keymap first, and only falls back to defaults when there's no user mapping. So if you remap `<C-d>`, it means what you told it to mean regardless of which mode or widget has focus. Same idea would work here: check the keybind config before the question component decides ctrl+d means "cancel".

**Environment:**
- opencode 1.14.20
- macOS

---

## #23892 — [Bug] New chat does not preserve worktree/role context - breaks agent session continuity

📅 `2026-04-22` | ✏️ **danilagoleen** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23892](https://github.com/anomalyco/opencode/issues/23892)


## Bug Description

When starting a new chat in Opencode (different terminal window or after compaction), the worktree is NOT preserved - creating a completely new session without any context of the previous worktree/role.

## Expected Behavior

1. **Worktree preservation**: When starting a new chat, Opencode should either:
   - Reuse the SAME worktree as the previous session in this project, OR
   - Allow passing worktree via initialization (e.g., `session_init worktree=captain`)

2. **Role context**: For agent-based workflows (like our VETKA project), each role maps to a specific worktree. New chats should:
   - Inherit the worktree from the previous session, OR
   - Support explicit role initialization like `vetka_session_init role=Polaris`

## Current Issue

1. I start session with `role=Polaris` → worktree = `captain`
2. Close chat, start new chat → I'm in a DIFFERENT worktree (`clever-comet` or similar)
3. Must manually `cd` to correct worktree AND re-run `session_init role=Polaris`

This breaks:
- Agent action tracking (actions from session A end up attributed to different session)
- Context continuity between chats
- Reliability for fleet coordination (multiple agents)

## Additional Context

- System prompt mentions the project context including role info
- Session init DOES return role info when called with `role=Polaris`
- But new chat has NO way to pass this context

## Suggested Fix (Priority Order)

1. **Auto-detect worktree from git branch**: Use current git br

> *[Truncado — 2021 chars totais]*

---

## #23887 — [Bug]: OpenCode Go + Kimi K2.6/K2.5 returns 'Provider returned error' on CLI 1.14.20

📅 `2026-04-22` | ✏️ **byungsker** | 💬 40 | 🔗 [https://github.com/anomalyco/opencode/issues/23887](https://github.com/anomalyco/opencode/issues/23887)


## Description

OpenCode Go provider works perfectly for all models **except** Kimi K2.6 and K2.5, which consistently return \"Provider returned error\". Other models (GLM-5, Qwen3.5 Plus, MiniMax M2.5/M2.7) under the same OpenCode Go subscription work fine.

## Environment

- **OpenCode Version**: 1.14.20
- **OS**: macOS
- **Provider**: OpenCode Go (paid subscription, $10/month)
- **Affected Models**: `kimi-k2.6`, `kimi-k2.5`
- **Working Models**: `glm-5`, `glm-5.1`, `qwen3.5-plus`, `minimax-m2.5`, `minimax-m2.7`

## Steps to Reproduce

1. Run `opencode` and connect to OpenCode Go via `/connect`
2. Select `kimi-k2.6` from `/models`
3. Send any message (e.g., \"hi\")
4. Observe: \"Provider returned error\" appears immediately

## Evidence

- **Same API key works with Kimi on other clients**: The exact same OpenCode Go API key works perfectly with Kimi K2.6 on:
  - OpenClaw gateway (same machine, different session)
  - OpenCode Zen provider (same machine, different provider selection)
- This rules out API key invalidity or server-side Kimi outage.

## Troubleshooting Already Attempted

- [x] Cleared `~/.local/share/opencode` and re-authenticated
- [x] Cleared `~/.cache/opencode` to force provider package re-download
- [x] Reinstalled `opencode-ai` globally via npm
- [x] Changed network (WiFi → mobile hotspot) to rule out IP-based blocking
- [x] Verified same API key works with other OpenCode Go models
- [x] Verified same API key works with Kimi on OpenCode Zen

## Expected Beh

> *[Truncado — 2174 chars totais]*

---

## #23868 — Project ID collision when independent clones share a root commit

📅 `2026-04-22` | ✏️ **tinywind** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23868](https://github.com/anomalyco/opencode/issues/23868)


### Description

Independent git clones that share the same initial/root commit are treated as the same OpenCode project. Sessions created in one clone appear in the other even though they are separate working directories.

This is the same behavior previously reported in #6696, which was auto-closed as stale.

### Plugins

_No response_

### OpenCode version

Observed on the current local install before applying the fix in PR #23866.

### Steps to reproduce

1. Create a git repository with one initial commit.
2. Clone it into two different directories.
3. Open OpenCode in the first clone and create a session.
4. Open OpenCode in the second clone.
5. Observe that both clones resolve to the same project/session history.

### Screenshot and/or share link

_No response_

### Operating System

Linux

### Terminal

bash

---

## #23861 — "command" is required for lsp overrides while docs suggest it is not

📅 `2026-04-22` | ✏️ **FichteFoll** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23861](https://github.com/anomalyco/opencode/issues/23861)


### Description

In the documentation, [an example for environment variables](https://opencode.ai/docs/lsp/#environment-variables) includes a config that only overrides the `env` property for a `rust` language server but accoding to both the schema and the error message of opencode that refuses to launch with this config, the `command` field is also required. Unfortunately, overriding the `command` property is not what I have in mind because I only need opencode to use the correct JDK (since JDTLS requires 21 but the project I am running it for requires 11) and the default JDTLS command is pretty long.

The following configuration does not work:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": {
    "jdtls": {
      "env": {
        "PATH": "/usr/bin"
      }
    }
  }
}
```

```
$ opencode
Configuration is invalid at …/opencode.jsonc
↳ Invalid input lsp
```

My preferred solution would be to make the `command` property optional so that only the environment variables can be overridden.

The documentation change was made in https://github.com/anomalyco/opencode/pull/11435.

### Plugins

_No response_

### OpenCode version

1.4.1

### Steps to reproduce

1. Create an `opencode.jsonc` as specified above.
2. Try to launch opencode (in a Java project)

### Screenshot and/or share link

_No response_

### Operating System

Arch Linux

### Terminal

_No response_

---

## #23855 — Wrong Gemini model selected in GitHub Copilot provider

📅 `2026-04-22` | ✏️ **JosephKiranBabu** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23855](https://github.com/anomalyco/opencode/issues/23855)


### Description

Copilot currently provides "Gemini 3.1 Pro" model.

OpenCode only shows "Gemini 3.1 Pro Preview" in the model selector.

A message sent to this model results in an error message from GitHub Copilot.

> The requested model is not supported.

Observed in both TUI and Desktop apps on macOS.



### Plugins

_No response_

### OpenCode version

v1.14.20

### Steps to reproduce

Select the latest Gemini Pro model from GitHub Copilot and send it a message. Only Preview models are available to select.

### Screenshot and/or share link

<img width="1027" height="273" alt="Image" src="https://github.com/user-attachments/assets/be19d098-401e-411a-8b93-f6208fbb9f11" />

### Operating System

macOS

### Terminal

WezTerm

---

## #23851 — Desktop v1.14.20 (the latest) doesn't work with a remote server v1.14.20 (the latest)

📅 `2026-04-22` | ✏️ **cloudliu01** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/23851](https://github.com/anomalyco/opencode/issues/23851)


### Description

I started the remote service on host (rocky8_opencode) with the command below:  
```
 opencode serve --hostname 0.0.0.0 --port 4096 
Warning: OPENCODE_SERVER_PASSWORD is not set; server is unsecured.
opencode server listening on http://0.0.0.0:4096
```

Then try to connect to it (rocky8_opencode) from another host (Windows 11) with OpenCode Desktop:  

<img width="1278" height="654" alt="Image" src="https://github.com/user-attachments/assets/723d7a5c-32e7-47da-a0f2-362e1b0d39a2" />

Even though the server shows green (which means it's accessible), the desktop shows me blank interface.  

I tried command line 'opencode attach http://rocky8_opencode:4096' and it works fine, so I think it might be a problem with the Desktop app.  

Does anyone else see this problem? How can I debug the app? Thanks!

### Plugins

_No response_

### OpenCode version

v1.14.20

### Steps to reproduce

1. run command below on one host:  `opencode serve --hostname 0.0.0.0 --port 4096 `
2. run desktop from another host and to connect to the service started in the previous step  
3. You will see a blank gui in the desktop 

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

_No response_

---

## #23814 — Upgrading to 1.14.20 looses session history

📅 `2026-04-22` | ✏️ **igordertigor** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23814](https://github.com/anomalyco/opencode/issues/23814)


### Description

Opencode auto-upgraded to version 1.14.20 this morning and since then, there is no more session history. Specifically:
- `opencode -c` hangs with a black screen
- Running `opencode` and then `C-X L` shows an empty list of sessions initially
- After running a session, `C-X L` shows a list of sessions with only the current session (consistent with the session db simply being lost with the upgrade).

Is this a known issue? Is there a known way to recover the session history?

### Plugins

    "opencode-google-antigravity-auth",     "@ex-machina/opencode-anthropic-auth@1.7.5"

### OpenCode version

1.14.20

### Steps to reproduce

See above.

### Screenshot and/or share link

_No response_

### Operating System

macOS 15.7.4

### Terminal

Alacritty

---

## #23782 — fix(tui): cannot navigate into grandchild sessions from subagent view

📅 `2026-04-22` | ✏️ **areyouok** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23782](https://github.com/anomalyco/opencode/issues/23782)


### Description

In the TUI session tree, when a sub-agent spawns its own child (grandchild session), pressing down or clicking to navigate into the grandchild session does nothing. Navigation into child sessions only works from the root session level.

### Steps to reproduce

1. Start a session that spawns a sub-agent
2. Navigate into the sub-agent session (this works)
3. The sub-agent spawns its own child session (grandchild)
4. Press down / try to navigate into the grandchild → nothing happens

### What's happening

`moveFirstChild()` and `moveChild()` in `session/index.tsx` use `children()` to look up sessions, but `children()` only returns the root session's direct children. From a sub-agent context, the grandchild sessions are not in that list, so navigation fails silently.

### OpenCode version

v1.14.x (dev)

### Operating System

macOS

### Terminal

Any

---

## #23773 — Cloudflare Worker AI rest api falure

📅 `2026-04-22` | ✏️ **hrstoyanov** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23773](https://github.com/anomalyco/opencode/issues/23773)


### Description

Configured CloudFlare RWorker AI REST API token, using the /connect command. Tried to use a model and got this:

`Not Found: {"result":null,"success":false,"errors":[{"code":7003,"message":"Could not route to /client/v4/accounts/cfut_lEnKhf2dKKb4x7saUeADGxcg2Ctl8vtp3BCo9sl4e0440766/ai/v1/chat/completions, perhaps your object identifier is invalid?"}],"messages":[]}`

### Plugins

_No response_

### OpenCode version

1.14.20

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23741 — TUI footer shows stale default provider/model after switching via /models

📅 `2026-04-21` | ✏️ **coygeek** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23741](https://github.com/anomalyco/opencode/issues/23741)


### Description

After switching models/providers from the TUI using `/models`, OpenCode sends the prompt to the newly selected provider correctly, but the footer/input status bar still shows the original default provider/model instead of the active one.

This appears to be a UI state bug: the actual request uses the selected provider, but the bottom bar is not updated.

### Steps to reproduce

1. Start OpenCode normally from the terminal:
   ```bash
   opencode
   ```
2. Make sure the default model/provider is something else first (for example `GPT-5.4` via GitHub Copilot).
3. Open the model picker with `/models`.
4. Switch to another provider/model, for example:
   - `Kimi K2.6`
   - `GLM 5.1` / Z-AI Coding Plan
5. Send a message.

### Actual behavior

- The response is generated by the newly selected provider/model.
- The conversation output also reflects the new provider/model.
- But the footer/input status bar at the bottom still shows the old default provider/model (for example `GPT-5.4 GitHub Copilot`) instead of the currently active one.

### Expected behavior

The footer/input status bar should always reflect the active session model/provider after a `/models` switch.

### Notes

- I reproduced this with multiple providers, not just Kimi.
- Example pattern:
  - Default provider shown before switch: `GPT-5.4 GitHub Copilot`
  - Switched provider actually used: `Kimi K2.6`
  - Footer still incorrectly shows: `GPT-5.4 GitHub Copilot`

This started happening within rough

> *[Truncado — 1719 chars totais]*

---

## #23730 — Unable to scroll the question in mobile view

📅 `2026-04-21` | ✏️ **n3m6** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23730](https://github.com/anomalyco/opencode/issues/23730)


### Description

<img width="1080" height="2400" alt="Image" src="https://github.com/user-attachments/assets/1ba08a4d-7826-4b22-a09c-36d888f5e4c5" />

* When opencode agents use the question tool with a very long question or answer the question is not scrollable, hence I'm not able answer it


### Plugins

_No response_

### OpenCode version

1.14.19

### Steps to reproduce

1. Make the agent present you with a long question/long answers in mobile view 

### Screenshot and/or share link

<img width="1080" height="2400" alt="Image" src="https://github.com/user-attachments/assets/95b7f1b0-6a99-4594-be2a-7e0b4f6af142" />

### Operating System

Ubuntu, 24.04

### Terminal

Alacrity

---

## #23726 — Desktop app freezes when installing plugin - Plugin export is not a function

📅 `2026-04-21` | ✏️ **efecnc** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23726](https://github.com/anomalyco/opencode/issues/23726)


## Bug Description
Desktop app freezes when trying to load a plugin after installation. The app becomes unresponsive and cannot start properly.

## Error Log
```
Plugin export is not a function failed to load plugin
```

## Steps to Reproduce
1. Install a plugin in OpenCode desktop app
2. Restart the app
3. App freezes on startup

## Additional Info
- Tried deleting app and reinstalling - didn't fix the issue
- Tried clearing cache and app data - didn't fix the issue
- CLI version works fine

## Environment
- macOS
- OpenCode Desktop App

---

## #23720 — Regression on Windows: /exit freezes Hyper and alacritty terminal and force-closes PowerShell in v1.14.19, but works in v1.14.18

📅 `2026-04-21` | ✏️ **reimurashiki** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/23720](https://github.com/anomalyco/opencode/issues/23720)


### Description

After upgrading OpenCode from v1.14.18 to v1.14.19 on Windows, `/exit` no longer exits cleanly on some terminal hosts.

In v1.14.18, OpenCode exits normally.
In v1.14.19, Hyper Terminal freezes after `/exit` and must be ended from Task Manager. PowerShell standalone force-closes after `/exit`. Alacritty also reproduces the issue.

The issue does not happen in VS Code Terminal, and it also does not happen in Windows Terminal.

I already tested the following:
- Disabled plugins
- Updated Git for Windows
- Tested with both PowerShell and Git Bash for Windows
- Downgraded back to v1.14.18, where the issue disappears

This appears to be a regression introduced in v1.14.19.

### Plugins

oh-my-opencode-slim and @mohak34/opencode-notifier@latest

### OpenCode version

v1.14.19

### Steps to reproduce

1. Install OpenCode v1.14.19 on Windows.
2. Open Hyper Terminal, PowerShell standalone, or Alacritty.
3. Launch `opencode`.
4. Start a normal session.
5. Run `/exit`.
6. Observe that the terminal freezes or force-closes.

Regression check:
1. Downgrade to OpenCode v1.14.18.
2. Repeat the same steps.
3. Observe that `/exit` works normally.

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Alacritty, Hyper, Powershell, Windows Terminal, VS Code Terminal

---

## #23709 — Tool calls during summary generation should be silently skipped, not throw errors

📅 `2026-04-21` | ✏️ **musienko-infuseua** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23709](https://github.com/anomalyco/opencode/issues/23709)


## Problem

When context compaction triggers summary generation, `processor.ts` throws an error if the model attempts any tool call:

```
Tool call not allowed while generating summary: mem0-local_add_memory
```

**Source:** `packages/opencode/src/session/processor.ts` — both `tool-input-start` and `tool-call` handlers check `ctx.assistantMessage.summary` and `throw new Error(...)`.

The model sees MCP tools (like `mem0-local_add_memory`) in its available tools during the summary phase, and naturally attempts to call them. The hard throw surfaces as an error in the UI.

## Expected behavior

Either:
1. **Strip tools from the summary prompt** so the model never sees them during compaction, or
2. **Silently skip/ignore** tool calls during summary instead of throwing (return a no-op result)

## Current workaround

None. The `permission` and `tools` config cannot override this — the check is hardcoded before any permission evaluation.

## Repro

1. Configure an always-available MCP tool (e.g. `mem0-local` with `"mem0-local_*": "allow"` in global permission)
2. Run a long session until compaction triggers
3. Observe: `Tool call not allowed while generating summary: mem0-local_add_memory`

## Environment

- OpenCode v1.14.19
- macOS (arm64)

---

## #23704 — OpenRouter xAI/Grok tool schemas fail when additionalProperties: false is emitted

📅 `2026-04-21` | ✏️ **dotCipher** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23704](https://github.com/anomalyco/opencode/issues/23704)


## Summary

Tool calling fails in OpenCode for xAI models via OpenRouter because emitted tool/input JSON schemas include `additionalProperties: false`, which xAI rejects.

## Repro

Model:
- `openrouter/x-ai/grok-4.1-fast`

Observed error:
- `[xAI] Invalid request content: Schema validation failed: [standard_violation] /properties/properties/additionalProperties: property schema 'false' is not supported`

## Notes

This happens on the native OpenCode OpenRouter path, not from external plugins.

OpenCode currently runs tool schemas through `ProviderTransform.schema(...)` before handing them to the model. For xAI via OpenRouter, that transform should strip `additionalProperties: false` recursively.

## Why this is safe

xAI structured output docs state:
- `additionalProperties` defaults to `false`
- schemas with boolean property schemas like `false` are rejected

So omitting explicit `additionalProperties: false` preserves behavior while avoiding the xAI validator error.

## Proposed fix

In `packages/opencode/src/provider/transform.ts`, add an xAI/OpenRouter schema sanitizer:
- apply only when `providerID === "openrouter"` and `model.api.id.startsWith("x-ai/")`
- recursively remove `additionalProperties: false`
- preserve `additionalProperties: true` and object-valued `additionalProperties`

## Related context

OpenCode already has related provider-specific schema sanitization work:
- #13737 Tool schemas cause 400 errors on strict validators
- #13823 sanitize tool schemas for 

> *[Truncado — 1529 chars totais]*

---

## #23695 — Plugin config does not support tilde (~/) paths

📅 `2026-04-21` | ✏️ **geesun** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23695](https://github.com/anomalyco/opencode/issues/23695)


## Description

When configuring a plugin using a tilde path (e.g. `~/my-plugin`), opencode fails to load it.

## Steps to Reproduce

Add a plugin in `opencode.json` using a `~/` path:

```json
{
  "plugin": ["~/my-local-plugin"]
}
```

## Expected Behavior

`~/my-local-plugin` is resolved to the user's home directory and loaded as a local plugin.

## Actual Behavior

The path is not recognized as a local path specifier. It gets passed to npm resolution and fails.

## Root Cause

`isPathPluginSpec()` in `plugin/shared.ts` only recognizes `file://`, `.`-prefixed, and absolute paths. `~/` is not handled.

---

## #23694 — Go models API endpoints

📅 `2026-04-21` | ✏️ **openhoat** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23694](https://github.com/anomalyco/opencode/issues/23694)


### Description

In the documentation (https://opencode.ai/docs/go/#points-de-terminaison) the endpoints mentioned for Go API are bad (404 / html)
The ones mentioned for zen seem to be ok.
How can I consume models from Go offer using "OpenAI like" API endpoints ?

### Plugins

_No response_

### OpenCode version

1.14.19

### Steps to reproduce

_No response_

### Screenshot and/or share link

http https://opencode.ai/zen/go/v1/models

### Operating System

Fedora

### Terminal

Terminator

---

## #23692 — [BUG] Cannot copy text from AI questions in native Q&A UI

📅 `2026-04-21` | ✏️ **edouardsence-eviden** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23692](https://github.com/anomalyco/opencode/issues/23692)


### Description

When OpenCode asks me a question through the native Q&A interface, I cannot copy the text.

The question text is not selectable, and there is no copy button in the UI.

This is a real usability issue because I sometimes want to send the exact question to another AI tool for comparison or assistance. Right now, the only workaround is to open the browser inspector and extract the text manually.

Expected behavior:
- The AI question text should be selectable
- And/or there should be a copy button next to the question

Actual behavior:
- Text cannot be selected
- No copy button is available
- I have to use browser dev tools to recover the text

### Plugins

Opencode-DCP/opencode-dynamic-context-pruning, alvinunreal/oh-my-opencode-slim, rtk-ai/rtk

### OpenCode version

V1.14.19

### Steps to reproduce

1. Trigger a native Q&A prompt from OpenCode
2. Try to select the AI question text
3. Try to copy it

Result: The text cannot be copied from the UI.

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu in Windows 11 WSL2

### Terminal

zsh

---

## #23675 — Opencode goes blank when attempting to resume a session

📅 `2026-04-21` | ✏️ **pculler** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23675](https://github.com/anomalyco/opencode/issues/23675)


### Description

I recently updated to the latest version on my NixOS, when I tried to resume a session from the list I have the terminal goes blank and unresponsive, resulting on having to kill the process from another tab. 
If I start a new session everything goes well but I have sessions saved that I need to resume to continue what I was doing. I tried starting a new session, give all the context I can, then save it again and try to resume it with opencode -s sessionid but it goes blank and unresponsive again, the only way to continue the session that I found after saving is using opencode -c. but that wont allow me to restore my other sessions since opencode -s goes unresponsive. does anyone faced this as well on the new version???

Thanks


### Plugins

none

### OpenCode version

1.4.11

### Steps to reproduce

opencode -s sessionid 

### Screenshot and/or share link

_No response_

### Operating System

NixOS

### Terminal

Konsole and Ghostty

---

## #23668 — NVIDIA as a built-in provider option paradox

📅 `2026-04-21` | ✏️ **ketut** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23668](https://github.com/anomalyco/opencode/issues/23668)


### Description

After NVIDIA as a built-in provider option added, actually becomes useless because the api gets too many requests, request model timeouts, loss for all

### Plugins

_No response_

### OpenCode version

1.4.19

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23663 — [BUG] Custom LSP servers always send languageId: 'plaintext', causing servers like Godot LSP to fail

📅 `2026-04-21` | ✏️ **RickyYCheng** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23663](https://github.com/anomalyco/opencode/issues/23663)


## Description

When using a **custom LSP server** (e.g., `godot-lsp-bridge` for GDScript), OpenCode always sends `languageId: "plaintext"` in the `textDocument/didOpen` notification, regardless of the file extension configured in `lsp.extensions`.

This causes language servers that rely on `languageId` (like Godot's LSP server) to **not send diagnostics**, because they only recognize their specific language ID (e.g., `gdscript`).

### Root Cause

In `packages/opencode/src/lsp/client.ts` line 148:

```typescript
const languageId = LANGUAGE_EXTENSIONS[extension] ?? "plaintext"
```

OpenCode uses a hardcoded `LANGUAGE_EXTENSIONS` mapping table for built-in LSP servers. For any extension **not** in this table (including custom LSP extensions like `.gd`), it falls back to `"plaintext"`.

The `lsp.*.extensions` configuration is only used to **match** which LSP server to start, but is **not** used to determine the `languageId` sent to the server.

## Plugins

oh-my-openagent
godot-lsp-bridge

## OpenCode version

1.14.19

## Steps to reproduce

1. Configure a custom LSP server in `opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": {
    "gdscript": {
      "command": ["godot-lsp-bridge"],
      "extensions": [".gd"]
    }
  }
}
```

2. Ensure Godot Editor is running with LSP enabled (port 6005).
3. Create a `.gd` file with a syntax error.
4. Run `opencode debug lsp diagnostics <file>.gd`

**Expected:** Diagnostics are returned.
**Actual:** Empty d

> *[Truncado — 2306 chars totais]*

---

## #23662 — OpenCode web UI shows "Cannot read properties of undefined (reading 'worktree')" on every first use after a fresh install

📅 `2026-04-21` | ✏️ **micouy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23662](https://github.com/anomalyco/opencode/issues/23662)


### Description

Every time the web UI is opened for the first time after a fresh install, we see an error `Cannot read properties of undefined (reading 'worktree')`. There are no worktrees on the file system. Reloading the page makes it go away.

For context, our team uses OpenCode in sandboxes – we start a sandbox for every new feature, around 20 times a day, and each sandbox installs a fresh copy of OpenCode. Every time we open the web UI for the first time, we see this screen.

It's been happening since at least 1.3.13.

### Plugins

none

### OpenCode version

1.4.2

### Steps to reproduce

Not sure unfortunately, happy to answer any questions.

### Screenshot and/or share link

<img width="950" height="820" alt="Image" src="https://github.com/user-attachments/assets/99e4c1ab-03ab-41ba-85f0-bddc270561eb" />

### Operating System

Debian GNU/Linux 12 (bookworm)

### Terminal

NA

---

## #23660 — Clarify plugin guidance for experimental.chat.system.transform to avoid extra system messages

📅 `2026-04-21` | ✏️ **zhangdw156** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23660](https://github.com/anomalyco/opencode/issues/23660)


### Description

A lot of memory/context plugins use `experimental.chat.system.transform` by doing `output.system.push(...)` for recalled context or status blocks.

That is a natural reading of the current hook type, but it can make those plugins incompatible with many model backends that only accept a single system message at the start of the conversation, especially vLLM-served Qwen models and similar OpenAI-compatible deployments.

The hook itself is useful and does not need a behavior change here. What seems to be missing is guidance for plugin authors: if they are adding supplemental prompt/context, they should usually merge it into the primary system block instead of pushing a new array entry.

### Plugins

Memory and context injection plugins using `experimental.chat.system.transform`

### OpenCode version

Current `dev` branch as of 2026-04-21

### Steps to reproduce

1. Implement a plugin that injects recalled context with `output.system.push(...)` inside `experimental.chat.system.transform`
2. Use that plugin with an OpenAI-compatible backend that only allows a single system message
3. Send a request
4. The backend rejects the request because multiple system messages were produced

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23653 — [Bug] GitHub shorthand plugin specs fail to resolve after arborist refactor

📅 `2026-04-21` | ✏️ **Edison-A-N** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23653](https://github.com/anomalyco/opencode/issues/23653)


## Description

Plugins specified as GitHub shorthand (e.g. `Edison-A-N/opencode-preview`) fail to load. The plugin installs correctly via arborist, but the entry point resolution produces an invalid path.

## Root Cause

Introduced by commit `c9326fc19` (PR #18308 — "refactor: replace BunProc with Npm module using @npmcli/arborist").

Two issues in the resolution chain:

1. **`Npm.add()` → `resolveEntryPoint()`**: After arborist installs the dependency, `loadVirtual()` returns `first.path` pointing to the **wrapper directory** (`~/.cache/opencode/packages/Edison-A-N/opencode-preview/`) instead of the actual package directory (`node_modules/opencode-preview/`). So `readPluginPackage(target)` reads the wrapper `package.json` which only contains `{"dependencies":{"opencode-preview":"github:Edison-A-N/opencode-preview"}}` — no exports, no main.

2. **`resolvePluginTarget()`**: `npa("Edison-A-N/opencode-preview")` parses as GitHub type with `name: null`. The fallback uses the raw spec string as the package name, producing the impossible path `node_modules/Edison-A-N/package.json`.

## Log

```
ERROR service=plugin path=Edison-A-N/opencode-preview error=ENOENT: no such file or directory, open '/home/user/.cache/opencode/packages/Edison-A-N/opencode-preview/node_modules/Edison-A-N/package.json' failed to resolve plugin server entry
```

Same error occurs for `github:Edison-A-N/opencode-agent-memory`.

## Steps to Reproduce

1. Add a GitHub shorthand plugin to `opencode.json`:
   ``

> *[Truncado — 1815 chars totais]*

---

## #23648 — Documentation for MCP timeout configuration doesn't match schema

📅 `2026-04-21` | ✏️ **matangover** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23648](https://github.com/anomalyco/opencode/issues/23648)


### Description

Docs say:
> Timeout in ms for fetching tools from the MCP server. Defaults to 5000 (5 seconds). 
Schema says:
> Timeout in ms for MCP server requests. Defaults to 5000 (5 seconds).

Seems the schema is correct. This was clarified recently in #8706.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23637 — Agent repeatedly uses bash-style 2>&1 redirection when running in a csh/tcsh shell

📅 `2026-04-21` | ✏️ **Fu-Xiaotian** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23637](https://github.com/anomalyco/opencode/issues/23637)


### Description

When using a csh/tcsh shell, the agent repeatedly attempts to use bash-style redirection (2>&1). This causes all command output to be incorrectly redirected to a file named 1, creating stray files in the project directory. Since all output is misdirected, the agent's tool calls return no useful information, forcing it to retry many times before it finally recognizes the error.
Because OpenCode runs in an isolated, air-gapped environment, I'm unable to share screenshots. However, I've noticed this issue occurs much less frequently when using Crush, so I suspect it may be related to the system prompt or the design of the bash tool. The agent is aware that it's operating in a csh/tcsh environment, yet it still frequently attempts to use 2>&1 for redirection.

### Plugins

_No response_

### OpenCode version

1.14.18

### Steps to reproduce

You can reproduce this issue by asking OpenCode to report the system environment while running in a csh/tcsh shell.

### Screenshot and/or share link

_No response_

### Operating System

rocky linux, unkown version

### Terminal

xfce4-terminal

---

## #23629 — Grep tool fails with "invalid ripgrep output" when source files contain non-UTF-8 (e.g. GBK) characters

📅 `2026-04-21` | ✏️ **SuperStrain** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23629](https://github.com/anomalyco/opencode/issues/23629)


### Description

Bug description

The built-in Grep tool always fails with the error "invalid ripgrep output" when any matched file contains non-UTF-8 encoded characters (e.g. GBK/GB2312 Chinese comments or text files).

Steps to reproduce

1. Have a project that contains source files with GBK-encoded content 
2. Use the Grep tool to search for any pattern that matches those files
3. Grep tool returns: invalid ripgrep output

Root cause

When ripgrep encounters bytes that cannot be decoded as valid UTF-8, it outputs the matched line as lines.bytes (base64-encoded) instead of lines.text in its JSON format.

Example of the JSON ripgrep actually emits:

{"type":"match","data":{"path":{"text":"./server/sctrl/main.cpp"},
  "lines":{"bytes":"CS8vRU5BQkxFX0VYU0RL..."},  ← bytes, not text!
  "line_number":1780, ...}}

opencode's ripgrep JSON parser only handles lines.text and throws "invalid ripgrep output" when it encounters lines.bytes, even though the rest of the results (all UTF-8 files) are perfectly valid.

This means a single non-UTF-8 file in the project completely breaks the Grep tool for ALL searches, regardless of whether the specific search matches that file.

Expected behavior

The Grep tool should handle lines.bytes gracefully — either by base64-decoding it, replacing it with a placeholder like [binary/non-UTF-8 line], or skipping only that specific match while returning all valid UTF-8 matches.

Workaround

Use the Bash tool with rg --text instead:
rg --text "PATTERN" 

> *[Truncado — 1964 chars totais]*

---

## #23601 — [WSL2] "Package manager failed to install the right version" error after successful npm/curl install

📅 `2026-04-20` | ✏️ **mlovera** | 💬 9 | 🔗 [https://github.com/anomalyco/opencode/issues/23601](https://github.com/anomalyco/opencode/issues/23601)


### Description

I'm trying to download opencode using bash, npm, but the issue remains, it respond with this when I try to run the app after downloading it.

```bash
mlovera@wsl:~$ npm install -g opencode-ai@latest

added 5 packages in 6s
mlovera@wsl:~$ opencode --version
It seems that your package manager failed to install the right version of the opencode CLI for your platform. You can try manually installing "opencode-linux-x64" or "opencode-linux-x64-baseline" or "opencode-linux-x64-musl" or "opencode-linux-x64-baseline-musl" package
```

I also tried using curl and bash:
```bash
curl -fsSL https://opencode.ai/install | bash
```
and this happened:
```bash
mlovera@wsl:~$ curl -fsSL https://opencode.ai/install | bash
Installed version: .

Installing opencode version: 1.14.19
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 100%
Command already exists in /home/mlovera/.bashrc, skipping write.

                                 ▄
█▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█
█░░█ █░░█ █▀▀▀ █░░█ █░░░ █░░█ █░░█ █▀▀▀
▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀


OpenCode includes free models, to start:

cd <project>  # Open directory
opencode      # Run command

For more information visit https://opencode.ai/docs


mlovera@wsl:~$ opencode --version
It seems that your package manager failed to install the right version of the opencode CLI for your platform. You can try manually installing "opencode-linux-x64" or "opencode-linux-x64-baseline" or "opencode-linux-x64-musl" or "opencode-linu

> *[Truncado — 2377 chars totais]*

---

## #23600 — RipgrepExtractionFailedError at session startup despite rg binary already installed (v1.2.24, Linux x64, NFS home)

📅 `2026-04-20` | ✏️ **mvlevin1** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23600](https://github.com/anomalyco/opencode/issues/23600)


## Summary

Every opencode session startup logs a single `ERROR e=RipgrepExtractionFailedError` within ~200ms of startup, **even though**:

- `~/.local/share/opencode/bin/rg` exists, is executable, and runs correctly from the shell
- `rg --version` → `ripgrep 14.1.1 (rev 4649aa9700)` (matches the version opencode expects in its binary strings)
- All subsequent Glob/Grep tool calls from agents appear to silently fall through to `RipgrepExtractionFailedError` responses too, forcing subagents to use blind `Read` fallbacks — every agent invocation eats 5–10 seconds on unsuccessful tool retries

Reproducible across 9+ log files spanning 2026-04-13 through 2026-04-20.

## Environment

- **Version**: opencode 1.2.24
- **Platform**: Linux x64 (RHEL-style)
- **Home**: NFS-mounted (`/home/mlevin` over NFS)
- **PATH**: no system `rg` — opencode's bundled `rg` is the only one
- **rg location**: `/home/mlevin/.local/share/opencode/bin/rg` (size 6597984 bytes, mode 0755, owned by user, mtime 2024-09-08)

## Log Pattern

Every session log contains exactly one occurrence at startup:

```
INFO  2026-04-13T17:51:35 +40ms service=provider init
ERROR 2026-04-13T17:51:35 +200ms service=default e=RipgrepExtractionFailedError rejection
INFO  2026-04-13T17:51:35 +1ms service=provider providerID=opencode found
```

No stderr payload is logged. Error class is `Ripgrep.ExtractionFailedError` (found via `strings` on the `opencode` binary), which accepts `{filepath, stderr}` fields — but the logged objec

> *[Truncado — 3774 chars totais]*

---

## #23597 — git checkout not triggering ask tool despite "git *" listed as "ask" on permission.bash of opencode.jsonc, basically reverting a file without my permission

📅 `2026-04-20` | ✏️ **raymelon** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23597](https://github.com/anomalyco/opencode/issues/23597)


### Description

"git checkout HEAD -- {file}" not triggering ask tool despite "git *" listed on permission.bash of opencode.jsonc

This is weird because "git fetch", "git merge" and any other git command triggers ask tool

The model basically reverted a file without my permission on Build mode just because of this

```
$ git checkout HEAD -- {redacted file path}
(no output)
```

my `permission.bash` of my `opencode.jsonc`:

```json
"bash": {
      "rm *": "ask",
      "rd *": "ask",
      "rmdir *": "ask",
      "git *": "ask",
      "git log *": "allow",
      "git status": "allow",
      "git diff *": "allow",
      "git show *": "allow",
      "gh *": "ask",
      "taskkill": "ask",
      "mv *": "ask",
      "* *.env": "ask",
      "del *": "ask",
      "erase *": "ask",
      "Remove-Item *": "ask",
      "mongosh *":"ask",
      "sed *": "ask"
    }
```

### Plugins

_No response_

### OpenCode version

1.14.19

### Steps to reproduce

1. OpenCode on Build mode
2. An overconfident model runs `git checkout HEAD -- {redacted file}` cause it thinks it is the right thing to do
3. Instead of OpenCode asking the user (as mandated in the user's opencode.jsonc), that git command went through unchecked, deleting every uncommitted change for that file
4. Thank God it happened on a non-bearing project

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Terminal

---

## #23594 — Sessions from other worktrees of the same project are no longer visible after upgrade

📅 `2026-04-20` | ✏️ **laozhoulaile** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23594](https://github.com/anomalyco/opencode/issues/23594)


### Description

Sessions created in other git worktrees of the same repository are no longer visible when running opencode from a different worktree. This worked before upgrading to v1.14.19 (previous 1.2.25). 

Steps to Reproduce

1. Have a git repo with multiple worktrees (e.g. C:\Work\fireyes as main, C:\Work\fireyes-workflows as a worktree)
2. Create sessions in the main worktree directory
3. Open opencode from the worktree directory
4. Sessions list only shows sessions created in the current worktree directory（empty at the beginning actually）, not the ones from the main repo or other worktrees

Expected Behavior

Since all worktrees share the same project_id (computed from git rev-list --max-parents=0 HEAD), all sessions belonging to the same project should be visible regardless of which worktree directory they were created in. The sandboxes column in the project table already tracks all worktree directories, indicating the design intent is for them to be part of the same project.

Actual Behavior

Only sessions matching the current working directory are shown. This appears to be a regression — likely the session listing now filters by directory (sandbox path) in addition to project_id, whereas previously it only filtered by project_id.

Evidence

Database query shows all sessions are correctly stored under the same project_id:
project_id: bcda27203b3ed9289ac01b7a2b20baf7c2faed00
worktree: C:\Work\fireyes
sandboxes: ["C:\\Work\\fireyes-ptr-pos-trading-features","C:\\Wor

> *[Truncado — 2508 chars totais]*

---

## #23571 — MCP tool ordering changes after restart and breaks prompt caching

📅 `2026-04-20` | ✏️ **CoolZxp** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23571](https://github.com/anomalyco/opencode/issues/23571)


### Description

After restarting OpenCode, the order of MCP tools can change even when the MCP configuration itself has not changed.
This breaks prompt caching for providers such as OpenAI, causing previously reusable cache entries to be missed.

### Plugins

None

### OpenCode version

1.14.19

### Steps to reproduce

1. Configure multiple MCP tools.
2. Use the OpenAI provider.
3. Start OpenCode and send a message.
4. Record the order of `tools` in the request.
5. Restart OpenCode.
6. Send another request with the same configuration.
7. Compare the `tools` field in both requests. The tool set may be identical, but the order can differ.
8. This causes OpenAI prompt cache reuse to become unstable.

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Terminal

---

## #23568 — [Bug]: OAuth callback server (port 19876) not stopped after authentication, causing cross-instance CSRF failures

📅 `2026-04-20` | ✏️ **hchangjae** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23568](https://github.com/anomalyco/opencode/issues/23568)


### Description

The OAuth callback server on port 19876 remains running after `authenticate()` completes. When multiple TUI instances are running, this causes CSRF state validation failures:

1. Instance A authenticates → callback server starts on port 19876 → auth succeeds → server stays running
2. Instance B starts, triggers OAuth → `ensureRunning()` detects port in use, skips server start
3. Instance B registers state in its own process-local `pendingAuths` Map
4. Browser callback arrives at Instance A's server → `pendingStates=[]` → CSRF error

### Steps to reproduce

1. Start opencode TUI (Instance A) with a remote OAuth MCP server
2. Complete OAuth authentication
3. Start another opencode TUI (Instance B)
4. Instance B attempts OAuth → browser opens → callback fails with "Invalid or expired state parameter"

### Expected behavior

Callback server should stop after authentication completes (when no other flows are pending), releasing port 19876.

### Root cause

`McpOAuthCallback.stop()` is never called after `authenticate()`. The only callers are internal reconfiguration in `ensureRunning()` and test cleanup.

### OpenCode version

1.14.19

### Operating System

macOS

---

## #23566 — Docs suggest LSP is enabled by default

📅 `2026-04-20` | ✏️ **lowlyocean** | 💬 9 | 🔗 [https://github.com/anomalyco/opencode/issues/23566](https://github.com/anomalyco/opencode/issues/23566)


### Description

Acccording to  @rekram1-node in https://github.com/anomalyco/opencode/pull/23416#issuecomment-4277503797, LSP is intentionally disabled by default

However, the docs suggest that the [appropriate LSP](https://opencode.ai/docs/lsp/#:~:text=Auto%2Dinstalls%20for%20Kotlin%20projects) gets installed automatically and that you should have to [purposefully disable LSP servers](https://opencode.ai/docs/lsp/#disabling-lsp-servers)

Can we please make it clearer in the docs that you need to do something in order to have access to LSP? What are the minimum steps needed?
Will having a blank "lsp": {} config cause all LSPs to be enabled? What is the purpose of OPENCODE_EXPERIMENTAL_LSP_TOOL - do you have to have that True as well to get basic LSP support? Or does it enable something more advanced?

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23563 — [Bug]: OAuth callback server (port 19876) not stopped after authentication completes

📅 `2026-04-20` | ✏️ **hchangjae** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23563](https://github.com/anomalyco/opencode/issues/23563)


### Description

The OAuth callback server started on port 19876 during `authenticate()` is never stopped after authentication completes (success or failure). The server remains bound to the port for the lifetime of the process.

This causes cross-instance CSRF errors when multiple opencode TUI instances are running:

1. Instance A starts, triggers OAuth → callback server starts on port 19876 → auth succeeds → **server stays running**
2. Instance B starts, triggers OAuth → `ensureRunning()` detects port in use → skips server start
3. Instance B registers its OAuth state in its own process-local `pendingAuths` Map
4. Browser callback arrives at port 19876 → handled by Instance A → Instance A's `pendingAuths` is empty → **"Invalid or expired state parameter - potential CSRF attack"**

### Steps to reproduce

1. Start opencode TUI (Instance A) with a remote MCP server requiring OAuth
2. Complete OAuth authentication successfully
3. Start another opencode TUI (Instance B) in a different terminal
4. Instance B attempts OAuth for the same MCP server
5. Browser opens, user approves, but callback fails with CSRF error

### Expected behavior

The callback server should stop after authentication completes (when no other OAuth flows are pending), releasing port 19876 for subsequent auth flows.

### Actual behavior

The callback server remains running indefinitely. `McpOAuthCallback.stop()` is never called after `authenticate()` completes. The only callers of `stop()` are:
- Internal rec

> *[Truncado — 1991 chars totais]*

---

## #23561 — OpenCode v1.4.19 in Ubuntu 24.04: OpenCode Go (GLM5.1 & Qwen3.6-Plus) failed tool use

📅 `2026-04-20` | ✏️ **vaiduakhu-dot** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23561](https://github.com/anomalyco/opencode/issues/23561)


### Description

OpenCode Go (GLM5.1 & Qwen3.6-Plus) failed tool use. OpenCode was stopped without producing any output.

### Plugins

_No response_

### OpenCode version

1.4.19

### Steps to reproduce

1. Tell OpenCode Go - GLM5.1 to use skill to fetch arxiv paper 2604.12989

[SKILL.md](https://github.com/user-attachments/files/26899463/SKILL.md)

2. GLM5.1 encountered a TikZ image. It couldn't convert to PNG so in its thinking trace, it skipped that image to write the markdown file but stopped there.
3. Switch to OpenCode Go Qwen3.6-Plus, tell it find a way to covert tikz image then continue writing the markdown file. It filed a web search via exa and got below error:
`<400> InternalError.Algo.InvalidParameter: The content field is a required field.`
4. Switch to Qwen3.5-Plus via Alibaba Coding Plan, repeat the prompt in step 3. It worked normally.

### Screenshot and/or share link

<img width="1459" height="1372" alt="Image" src="https://github.com/user-attachments/assets/02be296c-17e8-4e7f-8f8a-c74345adad5f" />

### Operating System

Ubuntu 24.04

### Terminal

Ghostty

---

## #23556 — MCP server connection lost after context compaction — tools unavailable until new session

📅 `2026-04-20` | ✏️ **ramsyman** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23556](https://github.com/anomalyco/opencode/issues/23556)


## Description

After context compaction occurs, MCP server tools become completely unavailable for the rest of the session. The only workaround is to start a new session.

This was also reported in NeuralNomadsAI/CodeNomad#344, where the CodeNomad maintainer confirmed this is an OpenCode-level issue.

## Steps to Reproduce

1. Start a session with MCP servers configured
2. Use MCP tools extensively (large tool outputs, many calls)
3. Wait for or trigger context compaction (~95% context window)
4. Attempt to call any MCP tool after compaction

## Expected Behavior

MCP server connections are re-established after compaction. Tools remain available throughout the session.

## Actual Behavior

All MCP tool calls fail after compaction. The tools are simply gone — no error, no reconnect attempt. A full new session is required to restore MCP functionality.

## Impact

Any workflow relying on MCP tools (e.g. database tools, agent registries, custom servers) is silently broken after compaction. This is especially problematic for long-running sessions where compaction is expected.

## Environment

- OpenCode TUI (darwin)
- MCP servers configured via config
- Model: claude-sonnet-4-6

## Related

- NeuralNomadsAI/CodeNomad#344

---

## #23553 — Failed to load plugin file:///real/path/to/plugins/my-plugin.js: Cannot find module '@opencode-ai/plugin'

📅 `2026-04-20` | ✏️ **badloop** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23553](https://github.com/anomalyco/opencode/issues/23553)


### Description

## Root cause
In `config/plugin.ts`, the `Glob.scan` call uses `follow: true` (via `symlink: true`), and `absolute: true`. The `glob` library resolves through symlinks and returns the **real path** of matched files. This real path is then converted to a `file://` URL and passed to `import()`.
When Bun (or Node) imports from the real path, it resolves `@opencode-ai/plugin` relative to the real directory — not the symlink location where `node_modules` actually exists.
## Reproduction
1. Create plugins in a separate directory (e.g. `/some/other/path/plugins/`)
2. Symlink `~/.config/opencode/plugins` to that directory
3. Ensure the plugin imports from `@opencode-ai/plugin`
4. Have a `package.json` in `~/.config/opencode/` with `@opencode-ai/plugin` as a dependency
5. Start opencode — plugin fails to load
## Expected behavior
Plugins discovered through symlinked directories should resolve dependencies from the config directory's `node_modules`, not from the symlink target's directory tree.
## Suggested fix
Pass `realpath: false` to the glob options in `config/plugin.ts` (and possibly `tool/registry.ts` which has the same pattern for custom tools), so that returned paths preserve the symlink path rather than resolving to the real path.

### Plugins

_No response_

### OpenCode version

1.14.18

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Arch Linux (btw)

### Terminal

Kitty 0.46.2

---

## #23540 — Copilot Business models fail with "model not supported" — token exchange not performed, requests hit individual endpoint

📅 `2026-04-20` | ✏️ **shabbaz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23540](https://github.com/anomalyco/opencode/issues/23540)


### Description

Environment
- OpenCode version: 1.14.19 (latest as of 2026-04-20)
- OS: Linux
- Copilot plan: Copilot Business (provisioned via organization)
- SKU confirmed: copilot_for_business_seat_quota
Problem
When authenticated with a Copilot Business subscription, OpenCode fetches the model list successfully but all chat completion requests fail with:
The requested model is not supported.
Root cause: OpenCode sends API requests to the individual endpoint (https://api.githubcopilot.com/chat/completions) instead of the business endpoint (https://api.business.githubcopilot.com). It also sends the raw OAuth token directly as a Bearer token without performing the required /copilot_internal/v2/token exchange.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

1. Have a GitHub Copilot Business subscription via an organization
2. Run opencode auth login → select GitHub Copilot → GitHub.com
3. Models load in the model picker (e.g. claude-opus-4.7, gpt-5.4)
4. Select any model and send a message
5. Request fails with 400: "The requested model is not supported."

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23522 — [BUG]: AWS SSO session expiry silently blocks Bedrock requests

📅 `2026-04-20` | ✏️ **bainos** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23522](https://github.com/anomalyco/opencode/issues/23522)


When using Amazon Bedrock with an AWS SSO profile, an expired or uninitialized SSO session causes `fromNodeProviderChain` to throw `CredentialsProviderError`.
The AI SDK wraps this into a generic error with no recovery path — the user sees an error and must manually run `aws sso login` then resubmit their prompt.

This affects both first-run (no cached token) and mid-session expiry.

---

## #23517 — Gemma 4 calls Edit tool with empty oldString, tool instead overwrites file contents

📅 `2026-04-20` | ✏️ **nlhans** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23517](https://github.com/anomalyco/opencode/issues/23517)


### Description

Gemma 4 31B gets confused on the Edit tool when it wants to append contents to the end of a file. It will use `oldString: ""` which has undocumented side effects:

```
Wait, if I used edit with oldString: "" and newString: "...", did it append? The documentation says "Performs exact string replacements in files." If oldString is empty, maybe it doesn't work as an append.

[Read File ...]

Yes, it completely overwrote the file because I used oldString: "". The tool doesn't append when oldString is empty; it probably matched the start of the file or something. Actually, looking at the output, the entire previous content is gone.
```

It will then try to restore the file from memory, which includes a long generation prompt (this case removed about 300LOC). I've seen this bug happen 3 times in the same prompt now.

I run Gemma 4 31B Q6 locally through LMStudio with 128K context window.

### Plugins

_No response_

### OpenCode version

1.14.18

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

MacOS 15.6 (24G84)

### Terminal

_No response_

---

## #23512 — [Critical] SSH DSSKey error prevents all command execution

📅 `2026-04-20` | ✏️ **ipmachum-debug** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23512](https://github.com/anomalyco/opencode/issues/23512)


### Description

## Problem
The AI Agent’s Bash tool fails to execute any commands due to a DSSKey error in the paramiko library when establishing SSH connections to the sandbox.

## Details
- SSH connection fails with DSSKey-related error
- As a result, no commands can be executed via the Bash tool

## Suggested Fix
- Downgrade paramiko to version 2.12.0
OR
- Replace SSH key with Ed25519 instead of DSS

## Environment
- Sandbox environment
- SSH-based execution via Bash tool

This issue prevents any command execution, so it is critical.

### Plugins

None

### OpenCode version

v1.14.19

### Steps to reproduce

1. Configure AI Agent to use Bash tool with SSH connection
2. Attempt to execute any command in sandbox environment
3. SSH connection fails with DSSKey-related error
4. No commands are executed

### Screenshot and/or share link

_No response_

### Operating System

Linux (Ubuntu 22.04) / or Sandbox environment

### Terminal

bash

---

## #23502 — [Bug] Plugin loader fails due to inconsistent directory structure in ~/.cache/opencode/packages

📅 `2026-04-20` | ✏️ **KaysonSear** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23502](https://github.com/anomalyco/opencode/issues/23502)


While troubleshooting a plugin loading failure (oh-my-openagent), I discovered that the 'opencode plugin install' command creates a nested structure in '~/.cache/opencode/packages/<plugin-name>@latest/node_modules/<plugin-name>/'. However, the plugin loader (service=plugin) seems to expect the entry point at '~/.cache/opencode/packages/<plugin-name>@latest/node_modules/package.json'.

This results in the following error:
'ERROR service=plugin path=oh-my-openagent@latest error=ENOENT: no such file or directory, open /home/user/.cache/opencode/packages/oh-my-openagent@latest/node_modules/package.json failed to resolve plugin server entry'

Manual fix involves symlinking the nested package.json to the root of node_modules. Additionally, it appears that the REAL active plugins are resolved from '~/.cache/opencode/node_modules/', leading to confusion when 'opencode plugin install' creates a separate 'packages/' directory that is then partially ignored or incorrectly resolved by the runtime.

Tested on opencode v1.14.18.

---

## #23498 — session_search tool returns malformed JSON response

📅 `2026-04-20` | ✏️ **jlicerio** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23498](https://github.com/anomalyco/opencode/issues/23498)


## Bug Description

The `session_search` tool returns a response that fails JSON validation because it has neither a `choices` array nor an `error` object. Both fields are `undefined`, causing downstream processing to fail.

## Root Cause (Cross-Framework)

This bug is in the **Hermes agent framework** (`NousResearch/hermes-agent`) tool call handling — it manifests on **BOTH ends**:

1. **OpenCode client side**: Receives malformed JSON from Hermes API server
2. **Hermes agent server side**: Returns responses that lack both `choices` and `error` fields

The Hermes API server runs on `localhost:8642` with Bearer token authentication. When `session_search` is invoked, the response fails JSON schema validation because neither expected field is present.

## Expected Behavior

The tool response should return either:
1. A valid response with a `choices` array (for successful queries), OR
2. A valid error object with proper error details

## Actual Behavior

```
Type validation failed: Value: {"tool":"terminal","emoji":"💻","label":"echo \"hello\""}.
Error message: [
  {
    "code": "invalid_union",
    "errors": [
      [
        {
          "expected": "array",
          "code": "invalid_type",
          "path": [
            "choices"
          ],
          "message": "Invalid input: expected array, received undefined"
        }
      ],
      [
        {
          "expected": "object",
          "code": "invalid_type",
          "path": [
            "error"
          ],
         

> *[Truncado — 2505 chars totais]*

---

## #23497 — Gemma model is not working

📅 `2026-04-20` | ✏️ **Sahil-Gupta584** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23497](https://github.com/anomalyco/opencode/issues/23497)


### Description

Suddenly gemma 4 model is not working, before update it was working tho.
<img width="661" height="523" alt="Image" src="https://github.com/user-attachments/assets/42f430d0-d88f-4488-9025-3aba0ba903e0" />

### Plugins

_No response_

### OpenCode version

1.14.18

### Steps to reproduce

1. setup google provider with api key
2. you will see list of google models including gemma
3. after selecting gemma4 as model make any prompt to it

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Bash

---

## #23490 — SessionPrompt.run compares message IDs instead of transcript order/time, which breaks custom messageIDs accepted by the API

📅 `2026-04-20` | ✏️ **UniIsland** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23490](https://github.com/anomalyco/opencode/issues/23490)


### Description

OpenCode accepts caller-supplied messageIDs on prompt input, but SessionPrompt.run later assumes message IDs are OpenCode-generated ascending IDs and uses lexical ID comparison to decide transcript ordering.

That is a bug in two ways:

1. The API accepts custom message IDs, so OpenCode should not assume all message IDs preserve its internal ordering semantics.
2. Transcript/order logic should not depend on ID ordering in the first place. It should use actual message timestamps or transcript position.

Relevant code

OpenCode accepts custom user message IDs here:

- packages/opencode/src/session/prompt.ts

```
const info: MessageV2.User = {
  id: input.messageID ?? MessageID.ascending(),
  ...
}
```

But later SessionPrompt.run uses ID ordering to decide whether to exit the loop:

- packages/opencode/src/session/prompt.ts

```
if (
  lastAssistant?.finish &&
  !["tool-calls"].includes(lastAssistant.finish) &&
  !hasToolCalls &&
  lastUser.id < lastAssistant.id
) {
  yield* slog.info("exiting loop")
  break
}
```

There is a second similar assumption here:

- packages/opencode/src/session/prompt.ts

```
if (step > 1 && lastFinished) {
  for (const m of msgs) {
    if (m.info.role !== "user" || m.info.id <= lastFinished.id) continue
    ...
  }
}
```

OpenCode’s own generated IDs are monotonic because MessageID.ascending() uses a timestamp-plus-counter scheme:

- packages/opencode/src/id/id.ts

So this works only as long as all message IDs come from OpenCode’s 

> *[Truncado — 4802 chars totais]*

---

## #23473 — bug: output_schema fails silently when agent has "*": deny permission

📅 `2026-04-20` | ✏️ **potlee** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23473](https://github.com/anomalyco/opencode/issues/23473)


## Bug

When an agent declares `output_schema` in its frontmatter alongside `permission: { "*": deny }`, structured output silently fails — the model responds with plain text instead of calling the `StructuredOutput` tool.

The workaround is to explicitly add `StructuredOutput: allow` to the agent's permissions, but this should not be required since `StructuredOutput` is an internal framework tool.

## Root cause

There are two separate `resolveTools` calls:

1. `prompt.ts` calls `resolveTools(...)` (permission-filtered), then **appends** `StructuredOutput` to the result.
2. `prompt.ts` passes that tools map to `handle.process(...)` → `llm.ts`.
3. `llm.ts` runs its **own** `resolveTools()` on `input.tools`, which now includes `StructuredOutput`.
4. `"*": deny` matches `StructuredOutput` and removes it before the model call.

## Steps to reproduce

Create an agent with:
```yaml
permission:
  "*": deny
output_schema:
  type: object
  properties:
    result: { type: string }
  required: [result]
```

The agent ignores the schema and responds in plain text.

## Expected behaviour

`output_schema` works regardless of the agent's permission configuration. `StructuredOutput` is an internal framework tool and should never be subject to user-defined permission rules.

---

## #23464 — Opus 4.7 occasionally failing tool calls (ex: question tool)

📅 `2026-04-20` | ✏️ **cjnoname** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/23464](https://github.com/anomalyco/opencode/issues/23464)


### Description

Description:

I am using Opus 4.7. When preparing a question in OpenCode, I sometimes encounter the following error:

The question tool was called with invalid arguments: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "questions",
      1,
      "question"
    ],
    "message": "Invalid input: expected string, received undefined"
  }
].
Please rewrite the input so it satisfies the expected schema.

Behavior:

This issue occurs intermittently when preparing a question.
The system automatically retries, and the request usually succeeds afterward.
Each occurrence adds a few extra seconds, which impacts efficiency.

Expected Behavior:

The question tool should not send invalid arguments.
No retry should be required for valid input.

Notes:

It appears that one of the questions[i].question fields is occasionally undefined instead of a string before the request is sent.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23431 — OpenCode web tool similar to Obsidian OpenCode in the sidebar of WPS Office, but the page turns out to be blank when opened

📅 `2026-04-19` | ✏️ **lnxsun** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23431](https://github.com/anomalyco/opencode/issues/23431)


### Description

I am attempting to invoke an OpenCode web tool similar to Obsidian OpenCode in the sidebar of WPS Office, but the page turns out to be blank when opened (accessing OpenCode web directly works normally). It is speculated that the cause is the incompatibility between this tool and the Chrome 104 kernel built into WPS Office(Obsidian uses Electron (with Chrome 130+ under the hood).). The error reported when trying to open a new session is as follows:
C:\Users\Administrator\Desktop\ScreenShot_2026-04-18_225416_680.png
  TypeError: Cannot read properties of undefined (reading 'worktree')
      at Object.fn (http://127.0.0.1:14096/assets/index-Vism255b.js:2403:140195)
      at q2 (http://127.0.0.1:14096/assets/index-Vism255b.js:2:6835)
      at El (http://127.0.0.1:14096/assets/index-Vism255b.js:2:6592)
      at Object.Q7 (http://127.0.0.1:14096/assets/index-Vism255b.js:2:5606)
      at Object.fn (http://127.0.0.1:14096/assets/index-Vism255b.js:2403:140309)
      at q2 (http://127.0.0.1:14096/assets/index-Vism255b.js:2:6835)
      at El (http://127.0.0.1:14096/assets/index-Vism255b.js:2:6592)
      at Rf (http://127.0.0.1:14096/assets/index-Vism255b.js:2:8033)
      at tk (http://127.0.0.1:14096/assets/index-Vism255b.js:2:8914)
      at cO (http://127.0.0.1:14096/assets/index-Vism255b.js:2:8286)

Can the OpenCode Web be modified to be compatible with WPS Office(Chrome 104 kernel)?

### Plugins

_No response_

### OpenCode version

1.4.12

### Steps to reproduce

_N

> *[Truncado — 1609 chars totais]*

---

## #23427 — Failed to read images using Kimi 2.5 with Customer provider

📅 `2026-04-19` | ✏️ **QuinzyW** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23427](https://github.com/anomalyco/opencode/issues/23427)


### Description

This is my configuration, but it shows when sending pictures
```
"kimi-k2.5-external": {
          "name": "kimi_didi",
	  "modalities": {
            "input": ["text", "image"],
            "output": ["text"]
          }
```
> opencode with Version 1.14.18 (1.14.18)

After looking at many similar issues, I suspect that the type here should be displayed as image_url to be parsed successfully?

<img width="835" height="520" alt="Image" src="https://github.com/user-attachments/assets/2cbca23b-f9f0-4c3d-8481-e8731b594bf0" />

But get bad 400 response, how can i fix it?

```
 "responseBody": "{\"error\":{\"message\":\"litellm.BadRequestError: TokenserviceException - [traceId]: 9115a5cc-81e4-4e92-XXXXX [DoProviderRequest] Model aliyun/Kimi/Kimi-K2.5 provider service-aliyun-Kimi-Kimi-K2.5 with code 400 error errorCode: 50 message:[traceId]: 9115a5cc-81e4-4e92-be20-3b727e0ded5f provider service-aliyun-Kimi-Kimi-K2.5 DoRequest request for model kimi/kimi-k2.5 with error response code 400 body {\\\"error\\\":{\\\"message\\\":\\\"unsupported image type\\\",\\\"type\\\":\\\"InvalidParameter\\\",\\\"param\\\":null,\\\"code\\\":\\\"InvalidParameter\\\"},\\\"request_id\\\":\\\"55aa766a-9061-94db-aecb-fe95353b1214\\\"}. Received Model Group=kimi-k2.5-external\\nAvailable Model Group Fallbacks=None\",\"type\":null,\"param\":null,\"code\":\"400\"}}" 
```

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and

> *[Truncado — 1595 chars totais]*

---

## #23426 — skill() tool fails: ripgrep archive did not contain executable (macOS arm64, v1.14.18)

📅 `2026-04-19` | ✏️ **hoangnguyen291** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23426](https://github.com/anomalyco/opencode/issues/23426)


## Bug

The `skill()` tool always fails with:

```
ripgrep archive did not contain executable: /Users/<user>/.cache/opencode/bin/ripgrep-3sYiC0/ripgrep-14.1.1-aarch64-apple-darwin/rg
```

Every `skill(name: "...")` invocation triggers this error. The skill content is never loaded.

## Environment

- **OpenCode version:** 1.14.18 (latest)
- **OS:** macOS (darwin arm64, Apple Silicon)
- **Shell:** zsh

## Steps to Reproduce

1. Start an OpenCode session
2. Call any skill: `skill(name: "health")`, `skill(name: "review")`, etc.
3. Error occurs immediately

## What I Tried

- **Clearing cache:** `rm -rf ~/.cache/opencode/bin/ripgrep-3sYiC0/` — OpenCode attempts re-download but fails the same way (directory is never recreated)
- **Manually placing a valid arm64 `rg` binary** at the expected path — still fails with the same error
- **System ripgrep installed** via Homebrew (`rg` v15.1.0 at `/opt/homebrew/bin/rg`) — OpenCode doesn't use it, uses its own bundled version

## Analysis

The error suggests OpenCode downloads a ripgrep archive but either:
1. The archive extraction fails silently (the target directory is never created), or
2. There's a hash/manifest check that rejects the binary even when manually placed

The `skill()` tool depends on ripgrep internally (likely for searching skill file contents), so this completely blocks all skill loading on macOS arm64.

## Impact

All gstack skills (`/health`, `/review`, `/qa`, `/ship`, `/browse`, etc.) are unusable. This blocks any work

> *[Truncado — 1546 chars totais]*

---

## #23422 — Opencode tries to relaunch shell command on restart

📅 `2026-04-19` | ✏️ **ted537** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23422](https://github.com/anomalyco/opencode/issues/23422)


### Description

Very annoying if said command was overwhelming the system, and the reason you restarted opencode. Also potentially triggers an effect multiple times.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

Start long command `echo start >>demo.txt ; sleep 1000 ;  echo end >>demo.txt` or similar
Restart opencode
Opencode will retry the shell call

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23415 — [BUG] The whole workflow stalls if any sub-agent is aborted.

📅 `2026-04-19` | ✏️ **halabooda** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23415](https://github.com/anomalyco/opencode/issues/23415)


### Description

## Description
Sometimes (not always, but it happens regularly during frequent use), when sub-agents (ContextScout/ExternalScout) are invoked, they get aborted and the entire process hangs.

## Expected Behavior
Restart or abort all workflow


## Environment
- OS: macOS 
- OpenCode CLI version: 1.4.11
- OpenAgentsControl Plugin

## Additional Context

Opencode logs
```
data: {
  "type": "message.part.updated",
  "properties": {
    "sessionID": "ses_25a7ed1f8ffe6aNS7c41gaottf",
    "part": {
      "type": "tool",
      "tool": "task",
      "callID": "call_TbaunlBR9kAIII4ELiRoqNtL",
      "state": {
        "title": "Find context for config read",
        "metadata": {
          "sessionId": "ses_25a7eb4adffe2V25GP69p8JQrc",
          "model": {
            "providerID": "openai",
            "modelID": "gpt-5.4-nano"
          },
          "interrupted": true
        },
        "status": "error",
        "input": {
          "description": "Find context for config read",
          "prompt": "User asks to read the local config file ~/.config/opencode/opencode.jsonc...",
          "subagent_type": "ContextScout",
          "task_id": "",
          "command": ""
        },
        "time": {
          "start": 1776598207327,
          "end": 1776598364494
        },
        "error": "Tool execution aborted"
      },
      "metadata": {
        "openai": {
          "itemId": "fc_01375570559d8c4e0169e4bcbdf5948195871ad68951e04fd9"
        }
      },
      "id": "

> *[Truncado — 5698 chars totais]*

---

## #23413 — CLI plugin install shortcut (Shift+I) conflicts with Turkish keyboard layout

📅 `2026-04-19` | ✏️ **MertSoylu** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23413](https://github.com/anomalyco/opencode/issues/23413)


### Description

While browsing plugins in the CLI, the install command shortcut is displayed as Shift+i. However, because I use a Turkish keyboard layout, pressing Shift+i types the localized character İ into the search bar instead of executing the command. To actually trigger the install, I have to press Shift+ı (which corresponds to the English I).

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

1.Set the system keyboard layout to Turkish.

2.Open the CLI and navigate to the plugins section.

3.Press Shift+i. Notice that İ is typed into the search bar and the command fails.

4.Press Shift+ı. Notice that the install command successfully triggers.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23409 — bug: cold project open hangs on external volumes during bootstrap

📅 `2026-04-19` | ✏️ **codeg-dev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23409](https://github.com/anomalyco/opencode/issues/23409)


## Description
On macOS, opening a project from an external volume can hang for several seconds on the first request after a cold `opencode serve` start.

This shows up most clearly on `/Volumes/*` paths where two slow operations land in the request path:
- `git rev-list --max-parents=0 HEAD`
- `FileWatcher.init()` waiting on `parcel-watcher subscribe`

## OpenCode version
1.14.17

## Steps to reproduce
1. Start `opencode serve` on macOS.
2. Open a git project from `/Volumes/...`.
3. Hit `GET /project/current?directory=<external-project>` after a cold restart.
4. Observe multi-second delay before the response returns.

## Operating System
macOS 26.4.1

## Terminal
Ghostty

---

## #23404 — [Bug] task tool causes parent session abort — both parallel and sequential dispatch

📅 `2026-04-19` | ✏️ **tbrandenburg** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23404](https://github.com/anomalyco/opencode/issues/23404)


## Description

The `task` tool reliably terminates the parent session regardless of whether it is dispatched in parallel or sequentially. The subagent runs to completion, but the parent session ends with `finish=NULL` and 0 output tokens — all steps following the `task` call are silently dropped.

This makes the `task` tool effectively unusable in any multi-step parent workflow (e.g. scheduled routines, orchestrators, command files).

## Behavior

**Parallel dispatch** (task + another tool call in the same turn):
- Parent ends immediately with 0 output tokens, `finish=NULL`
- Subagent runs, parent never receives result

**Sequential dispatch** (single `task` call, nothing else in the turn):
- Same outcome — parent ends with 0 output tokens, `finish=NULL` after the `task` tool call
- Subagent runs to completion, result is never propagated back

In both cases the subagent session is written to the DB and contains valid output. The parent session record exists but has no assistant messages after the `task` dispatch.

## Root Cause (suspected)

The parent session loses its session ID context when `SessionPrompt.prompt()` is called for the subagent — originally documented in #13910. PR #13958 addressed the error path (missing `task_id` on failure) but was closed without merge on 2026-03-07.

The abort on the **success path** suggests the issue is broader: even a successful subagent return does not reliably resume the parent session. The session context appears to be discarded aft

> *[Truncado — 2982 chars totais]*

---

## #23398 — fix(ui): Changes preview cannot expand for files with only additions or only deletions

📅 `2026-04-19` | ✏️ **amirilovic** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23398](https://github.com/anomalyco/opencode/issues/23398)


## Bug Description

The changes preview in the session review component cannot be expanded for files that have only additions (new files) or only deletions (deleted files). Only files with both additions AND deletions can be expanded.

## Root Cause

In `packages/ui/src/components/session-review.tsx`, the `diffCanRender` function uses `&&` instead of `||`:

```typescript
// Bug: requires BOTH additions AND deletions
const diffCanRender = () => diff.additions !== 0 && diff.deletions !== 0
```

## Expected Behavior

Files should be expandable if they have either additions OR deletions (or both).

## Steps to Reproduce

1. Open the changes preview in desktop or web
2. Have a newly added file (only additions, no deletions)
3. Try to expand the file diff
4. The accordion cannot be expanded

## Fix

Change `&&` to `||` so files with only additions or only deletions can also be expanded.

Before the fix:

<img width="1090" height="119" alt="Image" src="https://github.com/user-attachments/assets/03e9f623-a3a4-4cd8-8f07-d3f1564e95a5" />

After the fix:

<img width="1825" height="404" alt="Image" src="https://github.com/user-attachments/assets/5f63e22e-4bbc-498e-9133-f49dafdeab36" />

---

## #23369 — Only current selected agent's model persists when resuming a session (other agent(s) revert to default)

📅 `2026-04-19` | ✏️ **malventano** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23369](https://github.com/anomalyco/opencode/issues/23369)


### Description

When resuming a session (e.g. `opencode -c`), the selected agent's model is restored, but the other model(s) revert to the default.

### Plugins

none

### OpenCode version

1.4.11

### Steps to reproduce

1. Configure opencode to have a default model.
2. Set plan/build models something other than the default.
3. Close opencode.
4. `opencode -c` or load the session within the TUI
5. Switch agents and observe the other agent now uses the default instead of the one selected in the prior session.

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu

### Terminal

tmux

---

## #23354 — Regression: Session timestamps ought not be updated on metadata-only changes.

📅 `2026-04-18` | ✏️ **ariane-emory** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23354](https://github.com/anomalyco/opencode/issues/23354)


### Description

When a session is renamed in the session list, its timestamp is updating causing it to unexpectedly jump in it's position in the session list. 

I had previously corrected this behaviour in the long-since merged pr #9495, but that fix appears to have been clobbered by changes introduced in 6d95f0d14cbd83fc8b7775f77ba39ab2881008f3.

### Plugins

N/A

### OpenCode version

1.4.11

### Steps to reproduce

1. Open the `session_list` and hit Ctrl + R to rename a session. 
2. Observe the sessions position in the session list unexpectedly jumps to the top. 

### Screenshot and/or share link

N/A

### Operating System

N/A

### Terminal

N/A

---

## #23344 — Reattaching to a deleted session makes opencode hard hang the terminal

📅 `2026-04-18` | ✏️ **bhaveshdavda** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23344](https://github.com/anomalyco/opencode/issues/23344)


### Description

I am new to opencode. I just deleted all sessions using the ctrl+d shortcut. Then I tested to see what happens when launching opencode to reattach to one of the deleted sessions that had worked minutes ago:

```
opencode -s ses_25d8af712ffekolTDT1RHRGZ08
```

The terminal turned black, and would not respond to ctrl+c, ~., or any of the usual keyboard shortcuts to kill the process. I had to kill the terminal

### Plugins

None

### OpenCode version

1.4.11

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23324 — [BUG] Sub-agent row in session tree is not clickable/openable while the task is still running

📅 `2026-04-18` | ✏️ **talha7k** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23324](https://github.com/anomalyco/opencode/issues/23324)


### Description

In the session tree, when an agent spawns a sub-agent, the sub-agent row appears but cannot be clicked/opened to view its output until the task completes. You have to wait for the entire sub-agent task to finish before the row becomes interactive.

### Current behavior

1. Agent spawns a sub-agent → sub-agent row appears in the session tree
2. Click on the sub-agent row while it's still running → nothing happens / row is not responsive
3. Wait for the sub-agent task to complete
4. Now the row is clickable and opens the sub-agent window

### Expected behavior

The sub-agent row should be clickable/openable **immediately** when it appears, even while the task is still running. Users should be able to view the sub-agent's progress, output, and intermediate results in real-time — similar to how you can watch a running task's output in the main session.

### Why this matters

- Users want to monitor sub-agent progress without waiting for completion
- Long-running sub-agent tasks make it feel like the UI is frozen/broken
- Not being able to observe running sub-agents defeats the purpose of parallel task delegation

### OpenCode version

1.4.x

### Operating System

macOS

### Terminal

Any

---

## #23311 — opencode go API key can't copy

📅 `2026-04-18` | ✏️ **twsck** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23311](https://github.com/anomalyco/opencode/issues/23311)


### Description

index-Ce6ZGsJI.js:128 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'writeText')
    at _el$31.$$click (index-Ce6ZGsJI.js:128:47)
    at handleNode (i18n-dSJ3qgIN.js:1657:63)
    at HTMLDocument.eventHandler (i18n-dSJ3qgIN.js:1678:12)

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23301 — Task tool: models hallucinate fictional agent names from examples in prompt

📅 `2026-04-18` | ✏️ **YumaKakuya** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23301](https://github.com/anomalyco/opencode/issues/23301)


### Description

The task tool prompt (`task.txt`) includes fictional example agent names (`code-reviewer`, `greeting-responder`) in an examples section. Models frequently copy these names verbatim when calling the task tool, causing `Unknown agent type` errors and retry loops.

Two issues:
1. The fictional examples train the model to invent agent names instead of using the real ones from the injected agent descriptions
2. The error message just says "not a valid agent type" without listing valid names, so the model cannot self-correct

Not a duplicate of #20804 — that issue is about parameter name confusion (`agent` vs `subagent_type`). This issue is about the model using correct parameter names but filling them with hallucinated agent names copied from the examples.

### Plugins

_No response_

### OpenCode version

Latest dev branch

### Steps to reproduce

1. Start OpenCode with any model
2. Ask it to perform a task that requires the Task tool (e.g. "use a subagent to explore the codebase")
3. The model reads task.txt, sees "code-reviewer" and "greeting-responder" in the examples
4. Model uses one of those names or invents a similar one
5. Error: `Unknown agent type: code-reviewer is not a valid agent type`
6. Model retries with another made-up name, loops

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 22.04 (WSL2)

### Terminal

Windows Terminal

---

## #23280 — Desktop v1.4.11 cannot send messages when connecting to own `opencode --port server` – error “Select an agent and model”

📅 `2026-04-18` | ✏️ **hherpa** | 💬 9 | 🔗 [https://github.com/anomalyco/opencode/issues/23280](https://github.com/anomalyco/opencode/issues/23280)


### Description

After updating OpenCode desktop to version 1.4.11, I am unable to send messages in both new and existing chats. Every attempt results in the error:

> “Select an agent and model. Choose an agent and model before sending a prompt”

However, the agent and model are already selected (the same as before the update). The TUI version (connected via the same port) works fine – I can send messages there.

**Temporary workaround**  
Rolling back both desktop and TUI to version 1.4.9 and clearing the cache resolves the issue.  
(Version 1.4.10 is not preferred because it lacks the “Local Server” selection button in the desktop version.)

**Additional observations**  
- On 1.4.11, if I select the built-in “Local Server” (the one that the desktop app runs under the hood) and clear the cache, messages can be sent.  
- But when I switch back to my own server (started via `opencode --port`), the problem reappears.  
- I prefer to run my own `opencode --port` server in a terminal and connect to it, because the built‑in server has a bug that resets the chat and forces me to restart the app several times during a single generation.

**Conclusion**  
The root cause seems to be that desktop version 1.4.11 cannot properly connect to a user‑started local server (launched with `opencode --port`). Version 1.4.9 works as expected.

### Plugins

Nothing

### OpenCode version

1.4.11 (desktop + TUI)

### Steps to reproduce


1. Start your own OpenCode server in a terminal: `opencode --

> *[Truncado — 2220 chars totais]*

---

## #23278 — Clicking the subagent tab from session leads to an error

📅 `2026-04-18` | ✏️ **raflyirham** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23278](https://github.com/anomalyco/opencode/issues/23278)


### Description

Opening a subagent tab from session resulting in an error if the subagent contains long text.

Error message:
`Error: error sending request for url`

### Plugins

oh-my-opencode

### OpenCode version

1.4.7

### Steps to reproduce

1. Agent from session creates a subagent
2. Wait for the subagent to do the task (until it contains long text)
3. Click the subagent tab
4. Error will be shown

### Screenshot and/or share link

<img width="898" height="670" alt="Image" src="https://github.com/user-attachments/assets/dd7206e1-379e-482a-a3c9-d3642c258aac" />

### Operating System

Windows 11

### Terminal

_No response_

---

## #23274 — After OpenCode starts, loading the model takes a relatively long time

📅 `2026-04-18` | ✏️ **LongwayBai** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23274](https://github.com/anomalyco/opencode/issues/23274)


### Description

After launching OpenCode, it takes more than ten seconds before it becomes usable, during which time no usable models are loaded. My environment has the OMO and SuperPowers plugins installed. This issue only appeared in version 1.4.11; it was working fine before.

### Plugins

OMO，superpowers

### OpenCode version

1.4.11

### Steps to reproduce

1.start opencode
2.wait to usable

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #23270 — TUI validates --model before providers load, causing false 'Model ... is not valid'

📅 `2026-04-18` | ✏️ **JasonZhaoWW** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23270](https://github.com/anomalyco/opencode/issues/23270)


### Description

Starting the TUI with `--model openai/gpt-5.4` shows `Model openai/gpt-5.4 is not valid`, even though the model is listed by `opencode models openai` and `opencode models openai --refresh`.

This looks like a TUI startup ordering bug: `--model` is applied before provider metadata finishes syncing, so local validation rejects a valid model. If the current agent already has its own configured model, the CLI-selected model can also be ignored/overridden instead of staying highest priority.

Possibly related to #17853, #9520, and #7948.

### Plugins

_No response_

### OpenCode version

1.4.11

### Steps to reproduce

1. Run `opencode models openai` and confirm `openai/gpt-5.4` is listed.
2. Run `opencode models openai --refresh` and confirm `openai/gpt-5.4` is still listed.
3. Start the TUI with `opencode --model openai/gpt-5.4`.
4. Observe that the TUI shows `Model openai/gpt-5.4 is not valid`.
5. If the current agent already has a configured model, submit a prompt and note that the agent model can win over the CLI-selected model.

### Screenshot and/or share link

_No response_

### Operating System

Linux 6.19.11-zen1-1-zen

### Terminal

Ghostty

---

## #23260 — bug: message pipeline has no final empty-content guard, causing ValidationException on Bedrock and hard failures on other providers

📅 `2026-04-18` | ✏️ **jpvelasco** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23260](https://github.com/anomalyco/opencode/issues/23260)


## Description

The `message()` pipeline in `packages/opencode/src/provider/transform.ts` applies a sequential series of transformation passes but has no final validation step. Multiple passes can each leave messages with `content: []` or `content: ""`, which providers reject with hard errors that permanently break the active session.

## Expected Behavior

No message with empty content should ever reach a provider API.

## Actual Behavior

Three transformation passes can each produce empty-content messages with no downstream guard:

| Pass | Location | Produces |
|---|---|---|
| Pass 1 (Anthropic/Bedrock text filter) | `transform.ts:55-73` | Guarded locally, but only for two providers |
| Pass 3 (Anthropic tool reorder `flatMap`) | `transform.ts:115-126` | `content: []` if the non-tool split half was all-empty text parts |
| Pass 5 (interleaved reasoning filter) | `transform.ts:178-211` | `content: []` when the assistant message contained only reasoning parts |
| `unsupportedParts()` | `transform.ts:267-303` | `content: []` if all parts were unsupported modality |

On Bedrock this produces:
```
ValidationException: messages: text content blocks must be non-empty
```
This error permanently breaks the session.

## Steps to Reproduce

1. Use a Bedrock model with interleaved reasoning (e.g. `amazon-bedrock/zai.glm-4.7`)
2. Send a message that triggers the reasoning filter, producing an assistant message where all content is reasoning parts
3. The reasoning filter strips all reas

> *[Truncado — 2124 chars totais]*

---

## #23254 — [Bug] Delete session fails with 'Unknown workspace adaptor: directory at tk0' in GUI

📅 `2026-04-18` | ✏️ **diny1203-sudo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23254](https://github.com/anomalyco/opencode/issues/23254)


## Describe the bug

When trying to delete a session from the OpenCode GUI (Desktop or Web), the operation fails with the error:
```
Error: Unknown workspace adaptor: directory at tk0
```

## Steps to reproduce

1. Open OpenCode GUI (tried both Desktop app and Web UI)
2. Navigate to a session in the sidebar
3. Click the delete button (three dots menu -> delete)
4. Observe the error message

## Expected behavior

The session should be deleted successfully, or at least show a proper error message if deletion is not possible.

## Actual behavior

Error message appears: `Unknown workspace adaptor: directory at tk0`

## Environment

- OpenCode version: 1.4.11
- OS: macOS
- Interface: GUI (Desktop App)

## Additional context

- CLI/TUI sessions work fine
- The issue appears to be specifically in the GUI when deleting sessions
- This may be related to workspace adaptors not initializing properly during the delete operation

## Workaround

Using CLI to delete sessions works fine:
```bash
opencode sessions list
opencode session delete <session-id>
```

---
*Created via opencode CLI*

---

## #23248 — Sessions become orphaned when project directory is renamed

📅 `2026-04-18` | ✏️ **sim590** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23248](https://github.com/anomalyco/opencode/issues/23248)


### Description

When a project directory is renamed or moved, existing sessions become invisible in the session list. The `directory` field stored on each session is an absolute path that is never updated when the project's worktree changes. The sessions remain in the database but are effectively orphaned — they cannot be accessed through the normal `/sessions` UI.

In case 1, `fromDirectory()` updates the project's `worktree` in the database, but the `directory` on existing sessions still points to the old path.

In case 2, the automatic migration in `project.ts` only matches sessions where `session.directory === project.worktree` exactly, which fails when the directory was renamed.

### Plugins

None

### OpenCode version

v1.4.7+

### Steps to reproduce

**Case 1: Renaming an existing Git repository (simplest)**

1. Create a Git repository with at least one commit in `~/prog/foo`
2. Open OpenCode in `~/prog/foo` and create a session
3. Close OpenCode
4. Rename the directory: `mv ~/prog/foo ~/prog/bar`
5. Open OpenCode in `~/prog/bar`
6. Open `/sessions` — the previous session is not visible

**Case 2: Renaming a non-git directory followed by `git init`**

1. Open OpenCode in `~/prog/orphan-test` (no Git repository)
2. Create a session (stored under `project_id = "global"` with `directory = ~/prog/orphan-test`)
3. Close OpenCode
4. Rename: `mv ~/prog/orphan-test ~/prog/orphan-test2`
5. Run `git init && git add -A && git commit -m "init"` in `~/prog/orphan-test2`
6. Open Op

> *[Truncado — 1724 chars totais]*

---

## #23247 — Default model not visible in model selector after switching

📅 `2026-04-18` | ✏️ **shadowabi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23247](https://github.com/anomalyco/opencode/issues/23247)


## Bug Report

When the default model (auto-selected via `providers.default()`) is not the latest in its family, it is hidden from the model selector list. The model appears as the current selection, but switching to another model makes it impossible to switch back.

### Steps to Reproduce

1. Configure a provider where the default model has a valid `release_date` but is not the latest in its family (e.g., `zai-coding-plan/glm-5.1` where `glm-5-turbo` is newer)
2. Open the web UI — the default model is shown as current
3. Open the model selector — the default model is **not in the list**
4. Switch to a different model
5. Try to switch back — cannot find the default model

### Root Cause

`models.tsx` `visible()` hides models with valid release dates that are not the latest in their family by default. `local.tsx` only auto-marks the **configured model** (from `opencode.json`) as visible, but not the **default model** from `providers.default()`.

---

## #23240 — Gitlab API error

📅 `2026-04-18` | ✏️ **elewashy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23240](https://github.com/anomalyco/opencode/issues/23240)


### Description

There’s currently an issue with the models—they’re not working and are returning an API error like in the screenshot, even though the model works normally on the GitLab website.
OpenAI API error: 402 "insufficient_credits" -> Models ChatGPT
Anthropic API error: 402 Consumer does not have sufficient credits for this request -> Claude

### Plugins

_No response_

### OpenCode version

1.4.11

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="1172" height="638" alt="Image" src="https://github.com/user-attachments/assets/fd6a04c1-a752-4bd2-8e73-923180b479d4" />

### Operating System

_No response_

### Terminal

_No response_

---

## #23230 — [Bug]: TUI ignores server config (port, hostname, cors) since resolveNetworkOptionsNoConfig call missing config

📅 `2026-04-18` | ✏️ **GoldJohnKing** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23230](https://github.com/anomalyco/opencode/issues/23230)


## Description

Since v1.4.1+, the TUI no longer reads `server.port`, `server.hostname`, `server.cors` etc. from `opencode.json` config. This means the HTTP server never starts when configured only via config file (no CLI flags), breaking workflows that depend on external WebUI access (e.g. OpenChamber, browser-based clients).

In `packages/opencode/src/cli/cmd/tui/thread.ts` line 184:

```typescript
const network = resolveNetworkOptionsNoConfig(args)
```

This calls `resolveNetworkOptionsNoConfig` **without passing the `config` parameter**, so `config?.server?.hostname`, `config?.server?.port` etc. all resolve to `undefined`, falling back to CLI defaults (`port=0`, `hostname="127.0.0.1"`).

The `shouldStartServer` check then evaluates:
- `network.port !== 0` → `false`
- `network.hostname !== "127.0.0.1"` → `false`

Result: the HTTP server is never started, even when `opencode.json` explicitly configures it.

This worked correctly in v1.4.0, which used `resolveNetworkOptions(args)` (reads config via `Config.Service`).

## Steps to reproduce

1. Configure `~/.config/opencode/opencode.json` with:
   ```json
   {
     "server": {
       "port": 4096,
       "hostname": "0.0.0.0"
     }
   }
   ```
2. Run `opencode` (TUI mode, no CLI flags)
3. Observe that port 4096 is **not** listening: `curl http://localhost:4096` fails with "Connection refused"
4. `ss -tlnp` shows no process bound to port 4096

## Expected behavior

The TUI should read `server.*` config from `opencode.json` an

> *[Truncado — 2053 chars totais]*

---

## #23225 — Selected Gemini 3 Pro model seems to be calling Gemini 3.1 Pro instead

📅 `2026-04-18` | ✏️ **rafaself** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23225](https://github.com/anomalyco/opencode/issues/23225)


### Description

I selected **Gemini 3 Pro** model using CLI, but **Gemini 3.1 Pro** seems to being called instead.

<img width="898" height="493" alt="Image" src="https://github.com/user-attachments/assets/4700acdf-38d4-42f4-b087-13e78ff768d4" />

### Plugins

None (unknown)

### OpenCode version

1.4.10

### Steps to reproduce

1. Open OpenCode in CLI
2. Choose Gemini 3 Pro model
3. Interact in a way that show the model that you're using. (In my case, when I received the feedback about limits)

### Screenshot and/or share link

<img width="898" height="493" alt="Image" src="https://github.com/user-attachments/assets/024724ad-8411-4149-848f-12d5b911080e" />

### Operating System

Ubuntu 24.04.4 LTS - Linux 6.17.0-20-generic x86_64 x86_64

### Terminal

GNOME Terminal

---

## #23221 — Global project worktree is transiently overwritten after git init without commits

📅 `2026-04-18` | ✏️ **sim590** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23221](https://github.com/anomalyco/opencode/issues/23221)


### Describe the bug

When `fromDirectory()` encounters a directory with `git init` but no commits, it correctly falls back to `ProjectID.global` but sets `worktree` to the current directory instead of `"/"`. The Phase 2 upsert then overwrites the global project's `worktree` in the database.

The global project should always have `worktree="/"` by definition.

### Steps to reproduce

1. Open opencode in a directory without `.git` (e.g., `~`) — global project created with `worktree="/"`
2. Run `git init` (without committing) in a different directory
3. Open opencode in that directory — global project's `worktree` in the database is overwritten with the directory path

### Expected behavior

The global project's `worktree` should remain `"/"` regardless of which directory triggers the `ProjectID.global` fallback.

### Actual behavior

The global project's `worktree` is transiently overwritten with the directory path. It self-corrects the next time `fromDirectory()` is called from a non-git directory.

### Impact

Limited — the corruption is transient and self-correcting. This is primarily a metadata consistency issue.

### Environment

- opencode version: v1.4.7+
- OS: Linux

---

## #23211 — 1.4.7+ onward fails to render UI and read existing session, lost all config (i.e login-ed models, etc...)

📅 `2026-04-18` | ✏️ **Trung0246** | 💬 9 | 🔗 [https://github.com/anomalyco/opencode/issues/23211](https://github.com/anomalyco/opencode/issues/23211)


### Description

1.4.6:

<img width="1656" height="1442" alt="Image" src="https://github.com/user-attachments/assets/b4c89b87-d9fe-4539-902e-44ab914a407a" />


1.4.7+ onward (also tested 1.4.11):

<img width="1665" height="1439" alt="Image" src="https://github.com/user-attachments/assets/bb67f8a6-b3ff-4e5c-8cf0-b5cd8293a830" />

Current system:

<img width="1450" height="611" alt="Image" src="https://github.com/user-attachments/assets/fc86963d-53da-411a-ba63-6afe8454a67d" />

### Plugins

None

### OpenCode version

1.4.11 baseline version (since my CPU don't have AVX2 and can't use main version)

### Steps to reproduce

Simply launch 1.4.11

### Screenshot and/or share link

_No response_

### Operating System

Linux 6.12.15

### Terminal

Wezterm

---

## #23194 — Resuming a non-existed session freezes 1.4.9 release

📅 `2026-04-17` | ✏️ **romusz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23194](https://github.com/anomalyco/opencode/issues/23194)


### Description

When opencode 1.4.9 is started with non-existent session it freezes, earlier releases opened undefined session which was also problematic since it didn't give any indication until opencode exited and printed:
`Resume: opencode -s undefined`


### Plugins

_No response_

### OpenCode version

1.4.9

### Steps to reproduce

```
opencode -s <non-existent session id>
```

### Screenshot and/or share link

After the fix
<img width="748" height="36" alt="Image" src="https://github.com/user-attachments/assets/90d78971-8992-4145-85f6-5fe23f43795e" />

### Operating System

macOS 26.4

### Terminal

WezTerm 20240203-110809-5046fc22

---

## #23192 — Regression in v1.4.10: git-based plugins fail with "No git binary found in $PATH" on Windows CLI

📅 `2026-04-17` | ✏️ **Vafl9** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23192](https://github.com/anomalyco/opencode/issues/23192)


### Description

After upgrading from v1.4.9 to v1.4.10, git-based plugins fail to install/update on Windows CLI with the error:
ERROR service=plugin pkg=superpowers version=git+https://github.com/obra/superpowers.git error=No git binary found in $PATH failed to install plugin
## Environment
- **OS:** Windows 11 Pro
- **OpenCode CLI version:** v1.4.10 (installed via `npm install -g opencode-ai`)
- **OpenCode Desktop version:** v1.4.10 (works fine)
- **git:** v2.51.2.windows.1, installed at `C:\Program Files\Git\cmd\git.exe`
- **Binary path:** `C:\Users\<user>\AppData\Roaming\npm\node_modules\opencode-ai\node_modules\opencode-windows-x64\bin\opencode.exe`

Expected Behavior
Plugin installs/updates successfully, as it does in v1.4.9 and in OpenCode Desktop v1.4.10.
Actual Behavior
Plugin fails to install. The which.sync('git') call inside @npmcli/git (used by @npmcli/arborist for git-based package resolution) cannot find git in PATH, despite git being available in the system PATH.

Key Observations
- v1.4.9 CLI: Works correctly
- v1.4.10 CLI: Broken
- v1.4.10 Desktop: Works correctly (same machine, same version)
- git is accessible from terminal: where.exe git returns C:\Program Files\Git\cmd\git.exe

Workaround
Downgrade to v1.4.9

### Plugins

superpowers

### OpenCode version

1.4.10

### Steps to reproduce

1. Install OpenCode CLI v1.4.10 via `npm install -g opencode-ai`
2. Add a git-based plugin to `opencode.json`:
   ```json
   {
     "plugin": [
       "superpowers@git+h

> *[Truncado — 1739 chars totais]*

---

## #23182 — Downgrading versions using install script does not work

📅 `2026-04-17` | ✏️ **kotarCreative** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23182](https://github.com/anomalyco/opencode/issues/23182)


### Description

When using the example provided in the install script to select the version to install it still installs the latest version.

### Plugins

None

### OpenCode version

1.4.10

### Steps to reproduce

1. Run `curl -fsSL https://opencode.ai/install | bash -s -- --version 1.4.8`
2. Run `opencode --version`

### Screenshot and/or share link

_No response_

### Operating System

macOS 26.4.1

### Terminal

Ghostty

---

## #23180 — Agent param in cli does not work

📅 `2026-04-17` | ✏️ **kotarCreative** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23180](https://github.com/anomalyco/opencode/issues/23180)


### Description

Running a cli command that contains an agent param causes the error "Agent not found: {agentName}". This occurs even when trying to load the base agents like "Build".

I noticed that the agents in the tab section on the TUI are delayed in showing, seems like agents are loading async within the client now?

### Plugins

None

### OpenCode version

1.4.10

### Steps to reproduce

1. Run `opencode --agent Build --prompt "tell me about this repo"

### Screenshot and/or share link

<img width="758" height="592" alt="Image" src="https://github.com/user-attachments/assets/6ce08435-7f46-4b39-b1f9-1776513954b3" />

### Operating System

macOS 26.4.1

### Terminal

Ghossty

---

## #23152 — In shell mode (! command), shell expansion is applied to strings inside single quotes.

📅 `2026-04-17` | ✏️ **CarloWood** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23152](https://github.com/anomalyco/opencode/issues/23152)


### Description

If you execute `echo 'X${FOO}X'` as a user command, the result is `XX` (assuming FOO isn't defined).

Running that command in a real shell gives, of course `X${FOO}X`.
If I ask the model to execute the above command, we also get `X${FOO}X`.

So, something is wrong with how quotes are mangled for user commands.

### Plugins

_No response_

### OpenCode version

current `dev` branch

### Steps to reproduce

Type '!' to enter Shell Mode.
Type: echo 'X${FOO}X'
Hit enter.
Observe the wrong output: XX


### Screenshot and/or share link

_No response_

### Operating System

linux - but verified by someone in discord running windows

### Terminal

_No response_

---

## #23132 — Remove lingering advice to use an ls command in 3 models' system prompts

📅 `2026-04-17` | ✏️ **ariane-emory** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23132](https://github.com/anomalyco/opencode/issues/23132)


### Description

Late last night, while discussing the recent removal of the dead code related to the `list` tool, a user in the Discord drew my attention to this issue: anomalyco#6506

While much of the content of that issue is now outdated and now irrelevant, it does point out that text advising a model to use the `ls` command still remain in three of their system prompts. 

As this advice contradicts the advice given in the tool description of the bash tool, it ought be rewritten to advise using the read tool instead. 

### Plugins

N/A

### OpenCode version

1.4.7

### Steps to reproduce

1. Examine the `default.txt`, `trinity.txt`, and `gemini.txt` files in the `packages/opencode/src/session/prompt/` directory.
2. Observe the inappropriate advice to use the `ls` command, contradicting advice in the tool description of the bash tool. 

### Screenshot and/or share link

N/A

### Operating System

N/A

### Terminal

N/A

---

## #23114 — Session title agent generates title from injected memory/system context rather than actual user message

📅 `2026-04-17` | ✏️ **marcusyoung** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23114](https://github.com/anomalyco/opencode/issues/23114)


### Description

## Description

When automatic session title generation runs, it passes the full rendered message history to the title model via `MessageV2.toModelMessagesEffect`. If a memory MCP server injects prior conversation summaries or facts into the system prompt or as synthetic message parts, the title model receives that injected content and generates a title based on it rather than the actual user message.

## Expected Behaviour

The title should reflect the content of the current user message only.

## Actual Behaviour

The title reflects injected memory context from prior sessions. Starting a session with "hi" produced:

> "Discussion on Workaround and GitHub Issue Regarding Roampal Data Location Setup and Patching cli.py"

— an accurate summary of the *previous* session's content, surfaced via memory context injection.

## Root Cause

In `packages/opencode/src/session/prompt.ts`, the title generation constructs its payload as:

```ts
const context = input.history.slice(0, idx + 1)
messages: [
  { role: "user", content: "Generate a title for this conversation:\n" },
  ...yield* MessageV2.toModelMessagesEffect(context, mdl)
]
```

`MessageV2.toModelMessagesEffect` renders the full message including injected memory/system content. The title model then titles based on that rather than the actual user message.

## Suggested Fix

Pass only the raw text of the first real user message to the title model:

```ts
const userText = firstUser.parts
  .filter(p => p.type ===

> *[Truncado — 2216 chars totais]*

---

## #23100 — Desktop App - Workspace path encoding issue causes session loading failure

📅 `2026-04-17` | ✏️ **diny1203-sudo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23100](https://github.com/anomalyco/opencode/issues/23100)


## Bug Description

Desktop app fails to load sessions with the following errors:
1. `ZodError: Invalid string: must start with "wrk"` - workspace ID validation failure
2. `Unknown workspace adaptor: directory failed` - workspace type not recognized  
3. `Session not found failed` - session cannot be loaded

## Environment
- **OpenCode Version**: 1.4.7 (Desktop)
- **OS**: macOS
- **Plugin**: None

## Steps to Reproduce
1. Open OpenCode Desktop app
2. Try to load historical sessions or click "Load more"
3. Session list does not update, still shows only ~5 sessions
4. Some sessions cannot be deleted or edited

## Expected Behavior
- All historical sessions should appear in sidebar
- User can load more sessions
- Can normally delete and edit all sessions

## Actual Behavior
- Only ~5 sessions visible
- "Load more" button has no response
- Some sessions cannot be deleted
- Error logs show workspace path validation failure

## Data Status
- SQLite database `session` table contains 61 sessions (including 10 business sessions)
- workspace table has been updated with `wrk_*` prefix IDs
- But Desktop app UI cannot properly load these sessions

## Logs
```
ZodError: [
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "starts_with",
    "prefix": "wrk",
    "path": [],
    "message": "Invalid string: must start with \"wrk\""
  }
]
ERROR: Unknown workspace adaptor: directory failed
ERROR: Session not found failed
```

## Related Issues
- Possibly related to #18805 (

> *[Truncado — 1668 chars totais]*

---

## #23094 — Custom Provider Hangs After "build · model" in custom RuAPI provider

📅 `2026-04-17` | ✏️ **fadingawayzy** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23094](https://github.com/anomalyco/opencode/issues/23094)


### Description

### Description
Opencode hangs indefinitely after displaying "build · [model]" when using a custom provider with @ai-sdk/openai-compatible SDK. The API works correctly via curl but opencode never receives a response.

### Environment
- Opencode version: 1.4.7
- OS: Linux (Arch-based)
- Node/Bun version: (bun)

### Steps to Reproduce
1. Add custom provider to ~/.config/opencode/opencode.jsonc:
```json
{
  "model": "RuAPI/claude-opus-4.6",
  "provider": {
    "RuAPI": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "RuAPI",
      "options": {
        "baseURL": "https://api.stepanovikov.uno"
      }
    }
  }
}
```
2. Add API key: `opencode providers login` (or auth.json)
3. Run: `opencode run "hi"`
4. Result: Hangs at "build · claude-opus-4.6" forever

### Expected Behavior
Should receive response from API within seconds.

### Actual Behavior
- Logs show provider loaded, SDK initialized
- Logs show "small=false agent=build mode=primary stream"
- Then hangs indefinitely - no timeout, no error

### Additional Tests
- `curl` to API endpoint works fine (both sync & streaming)
- Built-in `opencode/minimax-m2.5-free` works correctly
- Other models on same provider (gpt-5.4, claude-sonnet-4.6) also hang
- Tried adding apiKey directly in config - same result

### Logs
```
INFO  provider providerID=RuAPI found
INFO  provider providerID=RuAPI pkg=@ai-sdk/openai-compatible using bundled provider
INFO  provider status=completed duration=4 providerID=RuAPI getSDK

> *[Truncado — 1810 chars totais]*

---

## #23085 — small_model request reuses x-session-affinity from main chat

📅 `2026-04-17` | ✏️ **mesca** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23085](https://github.com/anomalyco/opencode/issues/23085)


### Description

When OpenCode generates a conversation title using `small_model`, the HTTP request carries the same `x-session-affinity` header as the main chat. Because the two requests have different system prompts, different models, and no shared conversation state, they should logically be independent sessions and use distinct affinity values.

For any OpenAI-compatible backend that uses x-session-affinity to pool stateful sessions (conversation history, prompt cache, subprocess lifetime), sharing the header between the main chat and the title-gen is a mismatch:

- The two requests do not form one conversation; treating them as one leads to wasted reallocation or (in simpler backends) history contamination.
- Main chat and title-gen are fired concurrently but share a resource key, so a backend that serializes on affinity can't run them in parallel even though they're logically independent.

Parallel sub-agents (task tool) already handle this correctly (each gets its own affinity). Title-gen should follow the same pattern.

**Observed**: When OpenCode dispatches a new conversation's first turn, it emits two HTTP requests: the main-chat turn using primary_model with the main-agent system prompt, and a title-gen turn using `small_model` with a title-summarization system prompt. Both requests carry the same `x-session-affinity` value even though they share no conversation state, system prompt, or model.

**Expected**: The small model should use a distinct affinity value, mat

> *[Truncado — 2785 chars totais]*

---

## #23074 — Unable to load old sessions - 'Load More' button not working

📅 `2026-04-17` | ✏️ **Harry-Coleman** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23074](https://github.com/anomalyco/opencode/issues/23074)


## Bug Report

**Version:** 1.4.7

## Description

When trying to load old/previous sessions using the "Load More" button, the sessions fail to load. Clicking "Load More" does not retrieve or display older sessions.

## Steps to Reproduce

1. Open OpenCode
2. Navigate to the session list
3. Click "Load More" to load older sessions
4. Sessions do not load

## Expected Behavior

Clicking "Load More" should load and display older sessions.

## Actual Behavior

Old sessions are not loaded when clicking "Load More". The sessions remain inaccessible.

## Environment

- OpenCode version: 1.4.7
- Platform: macOS (darwin)

---

## #23026 — [BUG]: Load More button fails to load historical sessions in session list

📅 `2026-04-17` | ✏️ **dadadedahuamao** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23026](https://github.com/anomalyco/opencode/issues/23026)


﻿### Description

The "Load More" button in the project session list fails to load historical sessions when there are many existing sessions.

**What happened:**
- When a project has many sessions in the session list
- Clicking the "Load More" button at the bottom of the list
- No historical sessions are loaded
- The button appears to have no effect

**Expected behavior:**
- Clicking "Load More" should load and display older/historical sessions
- The session list should paginate properly to show all sessions

**Steps to reproduce:**
1. Open a project with many existing sessions
2. Open the session list sidebar
3. Scroll to the bottom of the session list
4. Click the "Load More" button
5. Observe that no additional sessions are loaded

**Environment:**
- OS: Windows 11
- OpenCode Version: 1.4.7
- Terminal: Windows Terminal

**Screenshot:**
See attached image - the red arrow points to the "Load More" button that doesn't work when clicked.

---

## #22855 — Bug: undefined is not an object (evaluating 'Z.inputTokens.total') when using custom provider plugins

📅 `2026-04-16` | ✏️ **klederson** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22855](https://github.com/anomalyco/opencode/issues/22855)


## Bug Description

When using custom provider plugins (like opencode-claude-code-plugin), the response is returned successfully but then an error occurs after the response:

```
Error: undefined is not an object (evaluating 'Z.inputTokens.total')
```

## Steps to Reproduce

1. Install opencode-claude-code-plugin
2. Configure in opencode.json with claude-code/opus model
3. Run: `opencode run --model claude-code/opus "say hello"`

## Expected Behavior

The response should be returned without errors.

## Actual Behavior

The model responds correctly ("Hi!") but then throws an error about undefined inputTokens.total after successful response.

## Environment

- opencode v1.4.6
- opencode-claude-code-plugin v0.1.2
- Claude CLI v2.1.104

## Root Cause Analysis

This appears to be the same bug reported in:
- Issue #17411: "Cannot read properties of undefined (reading 'input_tokens')" via OpenCode Zen API
- Issue #14795: "Cannot read properties of undefined (reading 'prompt_tokens')"

The OpenCode processor tries to access `usage.tokens` without null-checking, which fails when the provider returns undefined usage.

## Suggested Fix

In the processor that handles the stream finish event, add null-check before accessing usage:

```typescript
// Current (broken):
const inputTokens = usage.tokens.input

// Fix:
const inputTokens = usage?.tokens?.input ?? usage?.tokens?.prompt_tokens ?? 0
```

## Additional Notes

- This affects custom provider plugins, not just the Claude Code plugin
- 

> *[Truncado — 1634 chars totais]*

---

## #22830 — [QUESTION]: Desktop / Web: Subagent sessions cannot be prompted

📅 `2026-04-16` | ✏️ **ubenmackin** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22830](https://github.com/anomalyco/opencode/issues/22830)


### Question

### Description

In the 1.4.0 release, a change was made such that when running from the Desktop or Web, subagent sessions cannot be prompted. I'm trying to understand why this change was made.

I've run into issues where the endpoint I'm using times out, or I run out of credits, or my browser/opencode lock up. Previously, I could stop the session, switch models, type continue, and let it keep going. Or restart opencode, and then continue away. Now I can't do this.

Additionally, there are times I see the agent is heading in a wrong direction, or spinning its wheels, so I could previously add a quick message to redirect to get it back on track. This functionality is now lost.

And I really can't understand why the change was made. What is trying to be solved with this functionality change? Now, I need to go back to the parent, and tell it to restart.

The bigger issue is my workflow which is Planner -> Orchestrator -> Executor. In this, I can now only prompt the Planner. Anything that happens downstream is locked in.

I was wondering if this option could at least be a feature flag, or setting that can be adjusted?

### OpenCode version
Any after 1.4.0

### Steps to reproduce

Have an agent use the task tool to spawn a subagent.
Go to the subagent session.
The chat box is blanked out with a note "Subagent sessions cannot be prompted".

### Screenshot and/or share link

No response

### Operating System

macOS 26.4

Terminal

Not a terminal issue. Only impacts Des

> *[Truncado — 1523 chars totais]*

---

## #22813 — fix: thinking block signature lost when model differs, breaking multi-turn with extended thinking

📅 `2026-04-16` | ✏️ **bainos** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22813](https://github.com/anomalyco/opencode/issues/22813)


### Description

When using an Anthropic model with extended thinking enabled, the following error appears mid-conversation:
The model returned the following errors: `messages.N.content.1: thinking or redacted_thinking blocks in the latest assistant message cannot be modified.`

Root cause is in `packages/opencode/src/session/message-v2.ts`. When reconstructing conversation history, reasoning parts strip `providerMetadata` when the message was produced by a different model:

```ts
...(differentModel ? {} : { providerMetadata: part.metadata }),
```

This is correct for text and tool parts — it prevents provider-specific data (e.g. OpenAI itemId) from leaking into other providers. But Anthropic's thinking blocks carry a cryptographic signature inside providerMetadata. Anthropic verifies this signature on every subsequent turn. If it is missing, the block is considered modified and the request is rejected.
The fix is to always preserve providerMetadata for reasoning parts regardless of the differentModel flag.

---

## Steps to reproduce

1. Enable extended thinking on a Claude 3.7+ model
2. Have a conversation long enough to accumulate thinking blocks in history, or switch models mid-session and switch back to Anthropic
3. Continue the conversation — the error fires on any turn that replays a thinking block without its signature

---

OpenCode version: 1.4.6
OS: WSL
Terminal: Alacritty

### Plugins

_No response_

### OpenCode version

1.4.6

### Steps to reproduce

1. Enable e

> *[Truncado — 1895 chars totais]*

---

## #22799 — Windows: project-local drive-less paths fail tool boundary checks

📅 `2026-04-16` | ✏️ **r-siddiq** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22799](https://github.com/anomalyco/opencode/issues/22799)


### Description

On Windows, project-local paths that lose their drive letter at tool boundaries can be handled inconsistently.

A path like `C:\repo\src\file.ts` can arrive as `/repo/src/file.ts` or `\\repo\\src\\file.ts` and be treated as external or outside the project even though it is on the current drive and inside the repo. This affects real tool boundaries such as `read`, `write`, `edit`, `lsp`, and `external_directory` checks.

The same investigation also exposed a file-backed plugin/theme metadata problem on Windows: if the file contents change without the mtime changing, refresh/install can keep using stale metadata.

### Plugins

None required for the path bug.

### OpenCode version

dev at `c8af8f96c` during investigation. Fix branch: `fix/windows-plugin-loader-ci` (`57518bd9b`).

### Steps to reproduce

1. On Windows, start in a project directory.
2. Pass a project-local file through a tool boundary using a drive-less rooted path form such as `/repo/src/file.ts`.
3. Observe that the path can be treated as external or outside the project even though it is inside the current repo.
4. For the plugin/theme symptom, use a file-backed plugin or theme, change the file contents without changing mtime, and trigger refresh/install again.
5. Observe that the update can be missed and stale metadata can continue to be used.

### Screenshot and/or share link

N/A

### Operating System

Windows 11, also reproduced in Windows GitHub Actions.

### Terminal

Windows Terminal loca

> *[Truncado — 1635 chars totais]*

---

## #22795 — opencode acp server exits immediately after startup

📅 `2026-04-16` | ✏️ **teng2-doudou** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22795](https://github.com/anomalyco/opencode/issues/22795)


# opencode ACP Server Bug Report

## Bug Description
`opencode acp` command exits immediately after starting, making it impossible to use as an ACP server.

## Environment
- **opencode version**: 1.4.3
- **OS**: macOS (Darwin)
- **Node.js**: v25.6.1

## Steps to Reproduce

1. Run opencode ACP server:
```bash
opencode acp --port 18100 --print-logs
```

2. Observe the logs:
```
INFO  service=acp-command setup connection
INFO  service=default directory=/path/to/project disposing instance
```

3. Process exits with code 0 immediately after "setup connection"

## Expected Behavior
`opencode acp` should start an ACP server and keep running, listening for ACP client connections.

## Actual Behavior
The server starts, sets up the ACP connection, then immediately disposes the instance and exits.

## Use Case
Trying to use opencode as an ACP harness with OpenClaw's acpx backend for agent orchestration.

## Configuration Used

### acpx config (~/.acpx/config.json)
```json
{
  "defaultAgent": "opencode",
  "agents": {
    "opencode": {
      "command": "opencode acp",
      "url": "http://127.0.0.1:18100",
      "cwd": "/path/to/project"
    }
  }
}
```

### OpenClaw ACP config
```json
{
  "acp": {
    "enabled": true,
    "backend": "acpx",
    "defaultAgent": "opencode",
    "allowedAgents": ["opencode"]
  }
}
```

## Additional Context
- The `opencode run` command works perfectly for executing tasks
- Only the `opencode acp` server mode has this issue
- Tried different ports, with/wit

> *[Truncado — 1685 chars totais]*

---

## #22791 — Desktop 1.4.6 on macOS gets stuck on loading screen; sidecar reaches server ready but UI never leaves loading.html

📅 `2026-04-16` | ✏️ **aiulms** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22791](https://github.com/anomalyco/opencode/issues/22791)


### Summary

On macOS, the OpenCode desktop app launches successfully, the sidecar reaches `server ready`, but the UI never leaves `loading.html`. The app stays stuck on the loading screen indefinitely.

This reproduces even after deleting all local OpenCode app data and config.

### Version

- OpenCode Desktop `1.4.6`
- macOS Tahoe `26.4.1`
- Apple Silicon (`arm64`)

### What I observed

- `OpenCode.app` starts normally
- main process, renderer process, GPU process, and sidecar all start
- the local sidecar port is listening and responding
- app log shows:

```text
app starting
spawning sidecar
sidecar connection started
awaiting server ready
server ready
```

- but the renderer remains on:

```text
file:///Applications/OpenCode.app/Contents/Resources/app.asar/out/renderer/loading.html
```

- expected local DB file is never created:

```text
~/Library/Application Support/ai.opencode.desktop/opencode/opencode.db
```

### Steps to reproduce

1. Install OpenCode Desktop `1.4.6` on macOS.
2. Launch the app for the first time.
3. Observe that the UI stays on the loading screen and never reaches the main app.

### Additional debugging

I checked the packaged app startup flow and it looks like the app enters the `needsMigration` path when `opencode.db` is missing, opens `loading.html`, and waits for the loading flow to complete before showing the main window.

In my case:

- `server ready` is reached
- `opencode.db` is still not created
- the renderer remains on `loading.html`

I a

> *[Truncado — 2591 chars totais]*

---

## #22785 — Paste-then-type text corruption in command line input box: content overwriting/loss

📅 `2026-04-16` | ✏️ **mirachine** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22785](https://github.com/anomalyco/opencode/issues/22785)


### Description

## Bug Description
When pasting text (especially content containing Chinese characters) into the command line input box and then typing additional text manually (e.g., input like `[Pasted ~2 lines] text after paste`), two critical content corruption issues occur:
1. The trailing part of the pasted content is overwritten and lost.
2. The manually typed content after pasting is overwritten by the pasted content, resulting in the loss of manual input.

## Steps to Reproduce
1. Copy a multi-line text block containing Chinese characters to the clipboard.
2. Paste the text into the OpenCode command line input box.
3. Immediately type additional text manually right after the pasted content.
4. Observe the final input content.

## Expected Behavior
- The pasted content (including Chinese characters) remains fully intact.
- The manually typed text is appended correctly after the pasted content, with no overwriting or loss.

## Actual Behavior
- Either the end of the pasted content is cut off/lost, or
- The manually typed text is overwritten by the pasted content and disappears.
- The issue is observed when the pasted content contains Chinese characters.

## Environment
- OpenCode version: 1.4.6
- Plugins: None
- **OS Name**: Microsoft Windows 11 Pro
- **Version**: 25H2
- **OS Build**: 26200.8246
- **Experience**: Windows Feature Experience Pack 1000.26100.297.0
- PowerShell Version: 5.1.26100.8115

### Plugins

_No response_

### OpenCode version

_No response_

### S

> *[Truncado — 1701 chars totais]*

---

## #22768 — @ command dont working

📅 `2026-04-16` | ✏️ **nfwyst** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22768](https://github.com/anomalyco/opencode/issues/22768)


### Description

I want to @file, but no any menu show, and other @ command is not working too.

### Plugins

no

### OpenCode version

1.4.6

### Steps to reproduce

open opencode, and input @ 

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22758 — "/compact" command not working in opencode web

📅 `2026-04-16` | ✏️ **lzss433** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22758](https://github.com/anomalyco/opencode/issues/22758)


### Description

"/compact" command not working in opencode web    It will no longer compress anything; this command has become ineffective. Compression must wait until the model's context is fully used up—it cannot be initiated actively, nor can users initiate compression themselves.

An error is reported in the browser console:
/session/ses_26e4c3f37ffeAqcDWvkcd8qBR2/summarize:1 Failed to load resource: the server responded with a status of 500 ()
session-DhDWZHxb.js:56 Uncaught (in promise) Object

### Plugins

OMO

### OpenCode version

1.4.6

### Steps to reproduce

Directly run the command "/compact" in the Open Code Web window to reproduce.

### Screenshot and/or share link

<img width="810" height="847" alt="Image" src="https://github.com/user-attachments/assets/c7125e1b-4aa5-4b6f-b075-30fbceea4b5e" />

<img width="1918" height="29" alt="Image" src="https://github.com/user-attachments/assets/1292e9c2-9944-4708-a705-990ca65c5a8e" />

### Operating System

Ubuntu 22.04   for opencode /   chrome on Windows for opencode web

### Terminal

_No response_

---

## #22720 — [Bug] Desktop app shows distracting full-width moving progress bar after update

📅 `2026-04-16` | ✏️ **alsongan** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/22720](https://github.com/anomalyco/opencode/issues/22720)


### Description


Hi team,

After the latest OpenCode desktop update, I started seeing a long progress bar at the top of the window that keeps sliding from left to right continuously. Previously, the status indicator was much lighter and only appeared near the session title, which was far less distracting.

Environment:
- OpenCode Desktop v1.4.6
- macOS: 15.5 
- Installation: official desktop installer

Issue:
- The new top progress bar is visually distracting and makes the app hard to use for even short sessions.
- It appears to be shown persistently, even when I’m not expecting an active task indicator.
- This feels like a regression in usability compared to the previous UI.

Expected:
- Keep the old lightweight indicator style, or
- Add an option to disable the full-width progress bar / switch back to the previous behavior.

Please let me know if you want a screenshot or screen recording. I’m happy to provide one.

Thanks.

### Plugins

_No response_

### OpenCode version

OpenCode Desktop v1.4.6

### Steps to reproduce

- Keep the old lightweight indicator style, or
- Add an option to disable the full-width progress bar / switch back to the previous behavior.


### Screenshot and/or share link

<img width="1354" height="82" alt="Image" src="https://github.com/user-attachments/assets/62023c9e-3bc0-4730-9f82-b6681143271f" />
<img width="1349" height="75" alt="Image" src="https://github.com/user-attachments/assets/61b29b5a-5b10-4540-b00d-6b4a65b9657b" />

### Operating Syste

> *[Truncado — 1544 chars totais]*

---

## #22684 — The thinking process of MiniMax-M2.7 cannot be properly displayed in opencode.

📅 `2026-04-16` | ✏️ **majestichou** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22684](https://github.com/anomalyco/opencode/issues/22684)


### Description

I have deployed the MiniMax-M2.7 model locally using Sglang and then connected the locally deployed MiniMax-M2.7 model to OpenCode. This model is a reasoning model. When I asked "who are you" in OpenCode, the following information was displayed

<img width="1564" height="197" alt="Image" src="https://github.com/user-attachments/assets/8eccadad-823d-4e30-8846-a63850ea4d16" />

### Plugins

nothing

### OpenCode version

1.4.3

### Steps to reproduce

1. use sglang to deploy the MiniMax-M2.7 model locally
2. connect the locally deployed MiniMax-M2.7 model to OpenCode
3. ask a question
4. you can know what i say

### Screenshot and/or share link

<img width="1564" height="197" alt="Image" src="https://github.com/user-attachments/assets/0a54a085-de53-4173-baa4-0c90594b3692" />

### Operating System

ubuntu 24.04

### Terminal

Tabby, MobaXterm

---

## #22675 — Runtime error in the Custom Provider

📅 `2026-04-15` | ✏️ **haderach76x** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22675](https://github.com/anomalyco/opencode/issues/22675)


### Description

Hello!

I'm using OpenCode Desktop for Linux  **v1.4.6**.

I registered a custom provider in 'Settings' and when trying to use the listed model in the chat, the following message appears on the screen:

`Not Found: Runtime error`

I didn't find this custom provider error in the reported issues.
The provider I registered uses the OpenAI API.
My custom provider doesn't use an API key, but rather 3 authentication headers. I also included the Content-Type header that is required by the provider.
Here's an example of how I set it up:

```
Provider ID: myprovider
Display name: My Provider
Base URL: https://the-url-here
Models:
	- model ID1: the-id1
	- Display name1: the-name1
Headers:
	- Header name1: header-name1
	- Value1: the-value1
	- Header name2: header-name2
	- Value2: the-value2
	- Header name3: header-name3
	- Value3: the-value3
	- Header name4: Content-Type
	- Value4: application/json
```

From what I've seen, all the data is being inserted correctly. I made a Python script to test the connection with the custom provider using the same headers and URL as the provider. I can connect normally and list models.
Any idea what might be happening?
Thank you!

### Plugins

_No response_

### OpenCode version

1.4.6

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Kali Linux 2026.1

### Terminal

Gnome Terminal

---

## #22673 — Custom OpenAI-compatible provider via LiteLLM is incorrectly classified as text-only / no-reasoning and blocks image input

📅 `2026-04-15` | ✏️ **Promental** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22673](https://github.com/anomalyco/opencode/issues/22673)


### Description

When I configure a custom OpenAI-compatible provider in OpenCode using a corporate LiteLLM gateway, OpenCode immediately classifies the models as text-only and no-reasoning in the UI.

Because of that, image input is blocked in OpenCode with an error saying the model does not support image input.

However, the exact same base URL, API key, and models work correctly in Roo Code inside VS Code, including image understanding.

This suggests the problem is in OpenCode's capability/modality detection or attachment handling for custom OpenAI-compatible providers, not in the backend provider or model itself.

Environment:
- OS: Windows 10
- OpenCode version: OpenCode Desktop v1.4.6
- Provider type: custom OpenAI-compatible provider
- Backend: LiteLLM
- Base URL: https://litellm.ai-portal.my_company.com

Models tested:
- claude-sonnet-4-6
- gpt-5.3-codex
- deepseek-v3.2

What works:
- authentication works
- model listing works
- text requests work

What fails:
- OpenCode classifies the models as text-only / no-reasoning
- image input is blocked in OpenCode

Important comparison:
The exact same base URL, API key, and models work correctly in Roo Code in VS Code, including image understanding.

### Plugins

_No response_

### OpenCode version

OpenCode Desktop v1.4.6

### Steps to reproduce

1. Add a custom OpenAI-compatible provider in OpenCode.
2. Use base URL: https://litellm.ai-portal.my_company.com
3. Enter a valid API key.
4. Add models such as:
   - claude-sonne

> *[Truncado — 2241 chars totais]*

---

## #22667 — Shell mode (`!`) output hidden when "Hide tool details" is enabled; AI-invoked tools flicker before hiding

📅 `2026-04-15` | ✏️ **riuoku** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22667](https://github.com/anomalyco/opencode/issues/22667)


### Description

When `tool_details_visibility` is set to `false` (via the "Hide tool details" command or `tool_details` keybind), user-initiated shell commands via `!` mode are hidden after execution. The command output appears briefly (fraction of a second). The same flickering behavior occurs for AI-invoked tool calls — they flash on screen while running and then vanish.

**Expected behavior**

1. User-initiated shell commands (`!`) should always be visible regardless of the tool details toggle. The user explicitly ran the command and expects to see its output.
2. When tool details are hidden, AI-invoked tools should never appear at all — not even briefly while running. The current flicker is caused by `shouldHide` only checking for `status === "completed"`, leaving `running`/`pending` states visible.


**Root cause suggested by Claude Opus 4.6**

`shouldHide` in the `ToolPart` component (`packages/opencode/src/cli/cmd/tui/routes/session/index.tsx:1490-1494`):

```ts
const shouldHide = createMemo(() => {
  if (ctx.showDetails()) return false
  if (props.part.state.status !== "completed") return false
  return true
})
```

This only hides completed tool parts, so running tools remain visible until they finish — causing the flicker. It also makes no distinction between user-initiated shell commands and AI-invoked tool calls.

**Proposed fix**

1. Add `synthetic: z.boolean().optional()` to the `ToolPart` schema in `message-v2.ts` (mirrors the existing field on `TextPart`). No

> *[Truncado — 2655 chars totais]*

---

## #22644 — Qwen model are remove from go subscription

📅 `2026-04-15` | ✏️ **muhammadessam** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/22644](https://github.com/anomalyco/opencode/issues/22644)


### Description

<img width="665" height="619" alt="Image" src="https://github.com/user-attachments/assets/00785353-814d-4fb8-97c3-f5257b441687" />

### Plugins

_No response_

### OpenCode version

1.4.6

### Steps to reproduce

1. Opencode auth login 
2. Select opencode go 
3. enter api key
4. opencode qwen model are not there 

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 24.04

### Terminal

WSL bash

---

## #22641 — Plan mode does not prevent write operations via Bash tool

📅 `2026-04-15` | ✏️ **j3mdamas** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22641](https://github.com/anomalyco/opencode/issues/22641)


### Description

Note: this issue was written by the OpenCode agent itself, after it noticed it
was able to execute a write operation while in plan mode.

While in plan mode (read-only), the agent was able to execute `git commit
--amend` through the Bash tool. Plan mode should block all write operations, but
the command ran successfully and modified the git history.


### Plugins

_No response_

### OpenCode version

1.3.13

### Steps to reproduce

1. Enable plan mode
2. Ask the agent to amend a git commit message
3. The agent executes `git commit --amend -m "..."` via the Bash tool
4. The command succeeds instead of being blocked


### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 24.04.3 LTS

### Terminal

xfce4-terminal

---

## #22638 — Background agents cannot be force-interrupted/stopped via ESC

📅 `2026-04-15` | ✏️ **qwowboyp** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22638](https://github.com/anomalyco/opencode/issues/22638)


### Description

Executing parallel tasks via conversation, and assigning sub-agents to handle them. After pressing CTRL+X and arrow down to background the task window, pressing ESC multiple times still does not interrupt/stop the background task.

### Plugins

oh-my-openagent

### OpenCode version

1.4.6 (bug has existed for multiple past versions as well)

### Steps to reproduce

1. Start a conversation and assign a sub-agent to background task processing
2. Press CTRL+X, then Arrow Down to switch to the background task window
3. In the background window, press ESC multiple times
4. The background agent/task cannot be interrupted or stopped, must be force killed

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22631 — new bug antropyc login

📅 `2026-04-15` | ✏️ **r00tedbrain-backup** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22631](https://github.com/anomalyco/opencode/issues/22631)


### Description

invalid credentials

<img width="1728" height="1084" alt="Image" src="https://github.com/user-attachments/assets/de90057a-59a1-49c9-b8d4-c61071bbff29" />

### Plugins

https://github.com/ex-machina-co/opencode-anthropic-auth

### OpenCode version

1.4.6

### Steps to reproduce

open opencode

try start chat

cant

### Screenshot and/or share link

_No response_

### Operating System

mac os

### Terminal

_No response_

---

## #22624 — LSP do not work with clangd (c++)

📅 `2026-04-15` | ✏️ **r9614204368-netizen** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22624](https://github.com/anomalyco/opencode/issues/22624)


### Description

OpenCode do not initialize clangd properly:
1. I must ask agent to read any cpp file before lsp start work. It is annoying but i can live with that
2. If agent tries to find any symbol by name, search fails if agent do not load/open source with this symbol before.

So to get lsp useful to fast navigation in sources i must ask agent to open every file in the project. It is stupid and definetely the bug.

Clangd is system wide service and one instance can serve many projects at once. So during initialization session you have to specify location of  compile_commands.json and ask to build index for entire project! It takes time and clangd starts work properly.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

Ask agent to find location of c++ existing class name. The definition must be in a file which agent never open. Search will fail.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22623 — Azure GPT-5 model: "max_tokens" parameter not supported, need "max_completion_tokens" instead

📅 `2026-04-15` | ✏️ **hueifeng** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22623](https://github.com/anomalyco/opencode/issues/22623)


### Description

## Bug Description
Using Azure GPT-5 model with opencode fails with error:
"Unsupported parameter: 'max_tokens' is not supported with this model. Use 'max_completion_tokens' instead."

## Environment
- opencode version: 1.4.5
- Model: gpt-5.4 (Azure deployment)
- Provider: Azure OpenAI

## Expected Behavior
Should be compatible with Azure GPT-5 API which requires `max_completion_tokens` instead of `max_tokens`

## Possible Fix
Replace all occurrences of `max_tokens` with `max_completion_tokens` in the Azure OpenAI SDK integration, similar to how newer OpenAI API versions handle this parameter.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22618 — context spent amount goes down after model switch

📅 `2026-04-15` | ✏️ **m-pa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22618](https://github.com/anomalyco/opencode/issues/22618)


### Description

I was working for a while with gpt-5.4 pro, accumulating over $160 of spent amount. after a while i noticed the spent amount _**go down**_ after each prompt. 



### Plugins

no plugins

### OpenCode version

1.3.9

### Steps to reproduce

unknown, but i noticed it after switching to gpt-5.3.

Edit: can not reproduce by switching alone. i did notice a glitch, where, after the model switch the next prompt was made with 5.4 pro selected again, which caused me to switch the model to 5.3 again, maybe two times. maybe this is related. i will post updates when encountering this again.

### Screenshot and/or share link

<img width="866" height="172" alt="Image" src="https://github.com/user-attachments/assets/4e11ba04-90e7-4642-ada4-a102853e3b7e" />

<img width="876" height="264" alt="Image" src="https://github.com/user-attachments/assets/63646d03-b98a-40da-9005-612903382185" />

<img width="870" height="858" alt="Image" src="https://github.com/user-attachments/assets/a925c780-dabd-4c3f-810c-2953c2ed8701" />

also happens when prompts are queued and interrupted:
<img width="864" height="897" alt="Image" src="https://github.com/user-attachments/assets/fe2e994a-be7b-465d-8686-7e2a56e996ad" />

instead of going negative, the element stops rendering until the model comes back with a response, then appears to work normally again, starting at $0.05 iirc
<img width="869" height="826" alt="Image" src="https://github.com/user-attachments/assets/0118e18e-44ff-422e-96ec-78f4c5e

> *[Truncado — 1595 chars totais]*

---

## #22614 — MiniMax Token Plan API Key Authentication Failed

📅 `2026-04-15` | ✏️ **marlonxlj** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22614](https://github.com/anomalyco/opencode/issues/22614)


### Description

I'm experiencing an issue where MiniMax Token Plan API Keys (starting with `sk-cp-`) are not working with OpenCode. The API key works fine in other tools like claudecode, but in OpenCode it consistently returns "invalid api key" error.


### Plugins

_No response_

### OpenCode version

1.4.6

### Steps to reproduce

1. Obtain a MiniMax Token Plan API Key (starts with `sk-cp-`)
2. Configure OpenCode with this API key using `opencode auth login`
3. Try to use the MiniMax model with `opencode run --model "minimax/MiniMax-M2.7" "Hello, test connection"`
4. Observe the "invalid api key" error


### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22610 — Plugin TUI: DialogSelect onSelect not triggered on Enter key

📅 `2026-04-15` | ✏️ **VespianRex** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22610](https://github.com/anomalyco/opencode/issues/22610)


## Description
When a TUI plugin uses `api.ui.DialogSelect`, pressing Enter does not trigger the `onSelect` callback. Arrow keys work for navigation, and the visual selection indicator works, but Enter key selection is broken.

## Critical Finding
**Enter works in all built-in OpenCode dialogs, but NOT in plugin-rendered dialogs.** This confirms the bug is specific to the plugin rendering context, not a general keyboard handling issue.

## Environment
- OpenCode version: 1.4.3 (via Homebrew)
- Terminal: macOS (various terminals tested)
- Plugin: Custom TUI plugin using `api.ui.DialogSelect`

## Steps to Reproduce
1. Create a TUI plugin that uses `api.ui.DialogSelect` with options and `onSelect` callback
2. Load the plugin via `tui.json`
3. Open the command palette and trigger the plugin
4. Press Enter to select an option

## Expected Behavior
Enter key should trigger `onSelect` callback with the selected option.

## Actual Behavior
- Enter key does nothing in plugin dialogs
- Arrow keys work for navigation (up/down changes selection)
- Visual selection works (highlighted row is visible)
- Built-in dialogs (model selector, command palette, etc.) work correctly with Enter

## Code Example
```jsx
// Plugin code
api.ui.dialog.replace(() => (
  api.ui.DialogSelect({
    title: "Select Config File",
    options: [
      { title: "Option 1", value: "opt1" },
      { title: "Option 2", value: "opt2" },
    ],
    placeholder: "Choose...",
    onSelect: (option) => {
      console.log

> *[Truncado — 2725 chars totais]*

---

## #22608 — [BUG] Custom provider headers (User-Agent) from opencode.json not applied to fetch requests

📅 `2026-04-15` | ✏️ **woaye168** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22608](https://github.com/anomalyco/opencode/issues/22608)


### Description

When configuring custom headers for a provider in `opencode.json`, the `User-Agent` header (and potentially other custom headers) is not actually sent with the API requests.

This is particularly important for providers like **Kimi** (`https://api.kimi.com/coding/v1`), where sending a custom `User-Agent` unlocks higher rate limits and additional coding plan quotas.

### Configuration Example

```json
{
  "provider": {
    "kimi-cli": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "kimi-cli",
      "options": {
        "baseURL": "https://api.kimi.com/coding/v1",
        "apiKey": "{env:ANTHROPIC_API_KEY}",
        "headers": {
          "Authorization": "Bearer sk-kimi-xxx",
          "User-Agent": "KimiCLI/1.30.0"
        }
      }
    }
  }
}
```

### Expected Behavior

The `User-Agent: KimiCLI/1.30.0` header should be included in the HTTP requests sent to the provider API.

### Actual Behavior

The custom `User-Agent` header is not applied to the outgoing fetch requests. This causes the provider to treat the request as a generic client, missing out on official client benefits (e.g., higher rate limits, extra coding plan quota for Kimi).

### Related Issues

- #11789 reported a similar bug with provider headers not being applied to fetch requests, which was supposedly fixed in PR #11978. This appears to be a regression or the fix did not cover all cases.
- #15306 also discusses custom provider headers not working in v1.2.x.

### Plugins

None

##

> *[Truncado — 1579 chars totais]*

---

## #22588 — fix(tui): TUI message list doesn't update for cross-instance agent messages

📅 `2026-04-15` | ✏️ **ailearningguy** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22588](https://github.com/anomalyco/opencode/issues/22588)


## Bug Description

When using agent-comms plugin to send messages between opencode instances, the TUI message list doesn't update in real-time. The agent processes messages and replies correctly, but the conversation view only shows the first message until TUI is restarted.

## Root Cause

In `packages/opencode/src/cli/cmd/tui/context/event.ts`, the `subscribe` function has a logic error:

```tsx
if (project.workspace.current()) {
  if (event.workspace === project.workspace.current()) {
    handler(event.payload)
  }
  return  // <-- BUG: always returns, even when workspace mismatch
}
// Directory fallback never reached for workspace mismatches
if (event.directory === project.instance.directory()) {
  handler(event.payload)
}
```

When TUI is in a workspace but the incoming event has a different workspace ID (or none), the function returns without falling back to directory matching. Events are silently dropped.

## Fix

Replace the double-if with proper else-if so directory fallback runs when workspace doesn't match:

```tsx
if (project.workspace.current()) {
  if (event.workspace === project.workspace.current()) {
    handler(event.payload)
  }
} else if (event.directory === project.instance.directory()) {
  handler(event.payload)
}
```

## Verification

Tested with agent-comms plugin sending messages between two opencode instances in different directories. Before fix: message list stuck on first message. After fix: message list updates in real-time.

---

## #22586 — ENAMETOOLONG error on Windows with large project directories (uv_spawn -36)

📅 `2026-04-15` | ✏️ **CL-LSFY** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22586](https://github.com/anomalyco/opencode/issues/22586)


### Description

## Describe the bug

  When using opencode in a large project directory on Windows, any conversation (even just typing "你好") immediately fails with the following error:

  syscall: errno: code: ENAMETOOLONG: name too long, uv_spawn "uv_spawn" -36 "ENAMETOOLONG"
  at spawn (node:child_process:679:35)
  at spawn (node:child_process:14:39)
  at dx (B:/~BUN/root/chunk-4j8x370p.js:2:162788)

  ## To Reproduce

  Steps to reproduce the behavior:
  1. Open opencode in a large project directory (e.g., Apache DolphinScheduler with 4000+ files, 2100+ directories)
  2. Start a new conversation
  3. Send any message (even "你好")
  4. Error immediately appears

  ## Expected behavior

  The conversation should proceed normally without throwing a spawn error.

  ## Environment

  - **OS:** Windows 11 Home
  - **Project directory size:** ~4040 files, 2107 directories
  - **Project type:** Deep nested Java multi-module project

  ## Analysis

  This error is caused by **Windows' 32,767 character command line limit** when `child_process.spawn()` is called. The issue likely occurs when opencode tries to pass the entire project file list or context as
  command-line arguments to a child process.

  On Linux/macOS, this limit is much higher (`getconf ARG_MAX` returns ~2MB), but on Windows the combined command line + environment block is capped at 32KB, and long file paths in a large project can easily
  exceed this.

  ## Suggested fixes

  1. **Use `stdin`/pipes instead of CLI a

> *[Truncado — 2132 chars totais]*

---

## #22580 — Message sending is blocked in WSL on Windows (OpenCode version 1.4.4+).

📅 `2026-04-15` | ✏️ **jinkun2014** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22580](https://github.com/anomalyco/opencode/issues/22580)


### Description

log from 1.4.3
```
INFO  2026-04-15T06:54:15 +0ms service=tool.registry status=completed duration=5 task
INFO  2026-04-15T06:54:15 +8ms service=session.prompt status=completed duration=37 resolveTools
INFO  2026-04-15T06:54:15 +5ms service=bus type=session.updated publishing
INFO  2026-04-15T06:54:15 +36ms service=bus type=session.diff publishing
INFO  2026-04-15T06:54:15 +2ms service=bus type=message.updated publishing
INFO  2026-04-15T06:54:15 +17ms service=session.processor process
INFO  2026-04-15T06:54:15 +3ms service=llm providerID=bailian-coding-plan modelID=glm-5 sessionID=ses_27014b3cfffeZJMpp2MltsQV47 small=false agent=build mode=primary stream
INFO  2026-04-15T06:54:15 +15ms service=bus type=session.status publishing
INFO  2026-04-15T06:54:22 +6739ms service=bus type=message.part.updated publishing
INFO  2026-04-15T06:54:22 +2ms service=bus type=message.part.updated publishing
INFO  2026-04-15T06:54:22 +2ms service=bus type=message.part.delta publishing
INFO  2026-04-15T06:54:22 +93ms service=bus type=message.part.delta publishing
INFO  2026-04-15T06:54:22 +19ms service=bus type=message.part.delta publishing
INFO  2026-04-15T06:54:22 +136ms service=bus type=message.part.delta publishing
```

log from 1.4.5
```
INFO  2026-04-15T06:39:19 +14ms service=skill count=0 init
INFO  2026-04-15T06:39:19 +10ms service=bus type=message.updated publishing
INFO  2026-04-15T06:39:19 +6ms service=provider status=started state
INFO  2026-04-15T06:39:19 +3ms service

> *[Truncado — 2517 chars totais]*

---

## #22554 — Updated to Version 1.4.4 - now takes 5-10 minutes before MCP servers are shown

📅 `2026-04-15` | ✏️ **tniccum21** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/22554](https://github.com/anomalyco/opencode/issues/22554)


### Description

Updated to Version 1.4.4 - restarted.

MCP server list was shown empty. About 5 - 10 minutes later it populated and the servers were available.


### Plugins

_No response_

### OpenCode version

1.4.4

### Steps to reproduce

Start Opencode - check status - No MCP servers shown
Wait 5-10 minutes
Check status - MCP servers appear normally

Running on Macbook Pro M5 Max.  LLM on DGX Spark, on local network.
MCP Server running locally on Macbook.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22543 — [Bug] Failed to initialize OpenTUI: Error 126 (Module not found) on Windows

📅 `2026-04-15` | ✏️ **talkhello** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22543](https://github.com/anomalyco/opencode/issues/22543)


### Description

opencode --print-logs
INFO  2026-04-15T03:08:50 +378ms service=default version=1.4.4 args=["--print-logs"] opencode
INFO  2026-04-15T03:08:50 +6ms service=default directory=C:\Users\wangmianjie creating instance
INFO  2026-04-15T03:08:50 +6ms service=project directory=C:\Users\wangmianjie fromDirectory
INFO  2026-04-15T03:08:50 +9ms service=db path=C:\Users\wangmianjie\.local\share\opencode\opencode.db opening database
INFO  2026-04-15T03:08:50 +28ms service=db count=12 mode=bundled applying migrations
INFO  2026-04-15T03:08:50 +31ms service=file init
INFO  2026-04-15T03:08:50 +26ms service=config path=C:\Users\wangmianjie\.config\opencode\config.json loading
INFO  2026-04-15T03:08:50 +1ms service=config path=C:\Users\wangmianjie\.config\opencode\opencode.json loading
INFO  2026-04-15T03:08:50 +6ms service=config path=C:\Users\wangmianjie\.config\opencode\opencode.jsonc loading
ERROR 2026-04-15T03:08:50 +10ms service=default e=Failed to initialize OpenTUI render library: Failed to open library "B:/~BUN/root/opentui-2q8rnfnn.dll": error code 126 rejection
ERROR 2026-04-15T03:08:50 +0ms service=default error=Failed to initialize OpenTUI render library: Failed to open library "B:/~BUN/root/opentui-2q8rnfnn.dll": error code 126 process error

### Plugins

no

### OpenCode version

1.3.1

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

windows11

### Terminal

windows

---

## #22474 — Gemma 4 & Qwen 3.5 full prompt reprocessing from system prompt in OpenCode and Pi Coding Agent but only with llama.ccp server as backend.

📅 `2026-04-14` | ✏️ **vevi33** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22474](https://github.com/anomalyco/opencode/issues/22474)


### Description

I have an issue where gemma-4 is sometimes reprocessing the whole prompt after the long assistant message and many tool calls. It happens with OpenCode as well.
LLama.CCP HIP and VULKAN backend.
Oddly enough it is not happening with LM studio as backend.
Using unsloth's GGUFs.


My config:

{
  "$schema": "https://opencode.ai/config.json",
  "model": "llama-cpp/Main31B",
  "compaction": {
    "auto": false,
    "prune": false
  },
  "share": "disabled",
  "small_model": "llama-cpp/Mini",
  "enabled_providers": ["llama-cpp"],
  "provider": {
    "llama-cpp": {
      "name": "llama-cpp",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:8080/v1"
      },
      "models": {

### Plugins

none

### OpenCode version

latest

### Steps to reproduce

So I ask a long task --- Model starts to think, tool call (many SWA checkpoints saved) ---- Model writes final answer (no full reprocessing yet) ---- BOOM, when I write a new message everything is reprocessed after system prompt.

After I reply to a long assistant message (which include tool calls and reading files, which creates new checkpoints) it should read the last checkpoint, but there is not enough similarity so it rereads everything after the system prompt.

### Screenshot and/or share link

Relevant log:

slot      release: id  0 | task 4647 | stop processing: n_tokens = 13387, truncated = 0
srv  update_slots: all slots are idle
srv  params_from_: Chat format: peg-

> *[Truncado — 5086 chars totais]*

---

## #22473 — Tools error when using Gemini models via custom api

📅 `2026-04-14` | ✏️ **afermar** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22473](https://github.com/anomalyco/opencode/issues/22473)


### Description

I'm trying to use gemini models via a custom api but i get this error:

`Invalid JSON payload received. Unknown name "ref" at 'tools[0].function_declarations[0].parameters.properties[0].value.items.properties[2].value.items': Cannot find field.`

The provider config in opencode.json is this:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "custom-provider": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "custom-provider",
      "options": {
        "baseURL": "https://<api-url>"
      },
      "models": {
        "gemini-2.5-pro": {
          "name": "Gemini 2.5 Pro"
        }
      }
    }
  }
}
```

### Plugins

_No response_

### OpenCode version

1.4.1

### Steps to reproduce

Try to chat with opencode using the previous config.

### Screenshot and/or share link

<img width="1878" height="317" alt="Image" src="https://github.com/user-attachments/assets/fd87c924-0dd4-458f-974e-8feb1f50b9da" />

### Operating System

Arch Linux

### Terminal

Kitty

---

## #22466 — Session/model routing corruption causes wrong model + wrong conversation history to be sent

📅 `2026-04-14` | ✏️ **pvyswiss** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22466](https://github.com/anomalyco/opencode/issues/22466)


### Description

Two issues observed in session ses_273a6c8c4ffeASLPFdS5T3twFq:

1. Model ID mismatch: Session is configured with modelID: pvy-ux-designer (confirmed in workspace state file), but the actual HTTP request body contains "model":"pvy-senior-lead-dev" (a different model).

2. Cross-session history contamination: The promptCacheKey in the request references ses_2847932c5ffedcg4gYpDD1IQBm (a different, long-running session). The request contained 305 messages (~525KB) from the wrong session, causing the server to reject with HTTP 500 (empty body, 23ms).

3. Infinite retry on 500: The SDK marked the 500 as isRetryable: true and kept retrying the same oversized request for ~12 minutes until manually aborted.

### Plugins

None

### OpenCode version

OpenCode Desktop v1.4.3 (Tauri)

### Steps to reproduce

1. Have two sessions open -- one with model A (long conversation, 300+ messages) and one with model B (new session)
2. Send a message in session B
3. Observe that the HTTP request uses model A's ID and model A's conversation history
-
Each session should send its own model ID and conversation history
promptCacheKey should reference the correct session

### Screenshot and/or share link

Log Message:
ERROR service=llm providerID=pvy-ai modelID=pvy-ux-designer 
  sessionID=ses_273a6c8c4ffeASLPFdS5T3twFq agent=build mode=primary
  error={"error":{"name":"AI_APICallError",
    "requestBodyValues":{"model":"pvy-senior-lead-dev", ...},  // WRONG MODEL
    "statusCode":500, 

> *[Truncado — 1717 chars totais]*

---

## #22454 — 1.4.3 still regresses proxy installs: plugin/LSP downloads fail while 1.3.7 works

📅 `2026-04-14` | ✏️ **c-w-xiaohei** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22454](https://github.com/anomalyco/opencode/issues/22454)


### Description

OpenCode `1.4.3` still fails to install plugins and on-demand LSP packages when proxy environment variables are present, even when the proxy values are valid and reachable.

The failure is:

```text
request to https://registry.npmjs.org/opencode-scheduler failed, reason: fetch() proxy.url must be a non-empty string
```

and for git-based plugins:

```text
request to https://codeload.github.com/obra/superpowers/tar.gz/917e5f53b16b115b70a3a355ed5f4993b9f8b73d failed, reason: fetch() proxy.url must be a non-empty string
```

This does not look like a network outage or a bad plugin package:

- Direct requests to the same GitHub tarball and repo URL return `200 OK`
- `bun add opencode-scheduler` works in the same shell with the same proxy env
- `bun add "superpowers@git+https://github.com/obra/superpowers.git"` also works in the same shell with the same proxy env
- If I start `opencode` with proxy env vars removed, `opencode plugin opencode-scheduler -g` succeeds immediately

The strong regression signal is that the old binary still works:

- `opencode 1.3.7` succeeds under the same proxy env
- `opencode 1.4.3` fails under the same proxy env

From logs and binary inspection, `1.3.7` uses a Bun-based install path, while `1.4.3` uses an internal npm/arborist/pacote/make-fetch-happen path.

So this looks like a regression in the newer internal package install path, not in the proxy itself.

### Plugins

- `superpowers@git+https://github.com/obra/superpowers.git`
- `o

> *[Truncado — 4117 chars totais]*

---

## #22450 — [Bug]: async race in project.sync(): stale promise resolution clobbers newer state

📅 `2026-04-14` | ✏️ **CarloWood** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22450](https://github.com/anomalyco/opencode/issues/22450)


### Description

I ran into a problem where the TUI was seemingly not updated anymore (my prompt, after hitting enter, nor the reply from the model were visible) - see #21672 for details.

The reason for that turned out to be an out of sync `project.instance` as a result of the promise resolutions of async project.sync calls arriving -well- out of sync!

It seems obvious that the last call to `project.sync()` is the one that should be used to cache project.instance - not one that was done before that.

### Plugins

personal plugins

### OpenCode version

Latest github dev + personal patches

### Steps to reproduce

I don't have anything to show a problem, as this is only noticeable when two calls to `project.sync()` happen in quick succession, which happens to be the case in my case because I am working on a patch that changes the directory as function of the used agent. As a result, upon a resume, sync is first called for the directory for the session as stored in the database and very shortly after for the resumed sessions agent, that in *my* case happens to use a different directory and therefore results in a different Instance to be returned.

The race is very real however and clearly incorrect.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22448 — 502 `provider_unavailable` errors from OpenRouter are not retried, causing subagent/session aborts

📅 `2026-04-14` | ✏️ **tim-mohrbach-ikigai** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/22448](https://github.com/anomalyco/opencode/issues/22448)


## Description

When OpenRouter returns a 502 error (e.g., `Network connection lost`, `provider_unavailable`), OpenCode does not retry the request. Instead, the message is marked as errored and the entire step — including any in-progress tool calls — is aborted with `Tool execution aborted` / `interrupted: true`.

This is particularly destructive for subagent sessions: the subagent dies completely, all work in that step is lost, and the parent session may also lose its connection waiting for the task result.

## What I've Noticed

The 502 error arrives as an `UnknownError` (not `APIError`) with a JSON body:

```json
{"code":502,"message":"Network connection lost.","metadata":{"error_type":"provider_unavailable"}}
```

In `packages/opencode/src/session/retry.ts`, the `retryable()` function has logic to handle this:

```typescript
// Line ~62
if (code.includes("exhausted") || code.includes("unavailable")) {
  return "Provider is overloaded"
}
```

However, `code` is extracted as:

```typescript
const code = typeof json.code === "string" ? json.code : ""
```

The issue: `json.code` is `502` (a **number**), not a string. So `typeof json.code === "string"` is `false`, and `code` becomes `""`. The `code.includes("unavailable")` check never matches.

Additionally, the string `"unavailable"` appears in `json.metadata.error_type` (`"provider_unavailable"`), which is never inspected.

## Evidence

From my session database, I've logged **19 instances** of `502 Network connection lost` e

> *[Truncado — 3500 chars totais]*

---

## #22405 — [Bug] Agents cannot write under any circumstance

📅 `2026-04-14` | ✏️ **Tylerwbrown** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22405](https://github.com/anomalyco/opencode/issues/22405)


### Description

All my agents hit the same wall, they get `WRITE_BLOCKED` no matter what. The full error looks like this in all red:

```
WRITE BLOCKED: Agent "<agent_name>" is not authorised to write to "<location>". Reason: Path "<relative_location>" not in allowed list for "<agent_name>"
```

They usually try several times, and then realize the tool is broken and use bash to write anyway, but it's taking up a ton of tokens just running into that error hundreds of times for what should just be simple writes. I've tried the following:

- Added "tool_filter": { "enabled": false } to ~/.config/opencode/opencode-swarm.json.
- Added "permission": "allow" globally to ~/.config/opencode/opencode.json
- Added per-agent "permission": "allow" for every agent name to opencode.json. Covered every naming pattern/combination, still no effect.
 - npm installed opencode-swarm-plugin into ~/.config/opencode/node_modules/ (can't do `npm install -g` as I'm on nixos)
- Searched the plugin codebase, Go binary, and dependencies for the "WRITE BLOCKED" error string. Found nothing. The exact error text doesn't exist in any file on the system, or anywhere on the internet as far as I've been able to tell..



### Plugins

opencode-swarm

### OpenCode version

1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

nixos

### Terminal

alacritty

---

## #22382 — Session sidebar file-change stats should be based on tool actions, not repo diff state

📅 `2026-04-14` | ✏️ **HoangP8** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22382](https://github.com/anomalyco/opencode/issues/22382)


### Description

In the session sidebar, file changes show the number of lines added and removed.

I expect these stats to be calculated directly from tool actions such as `edit`, `write`, or `apply_patch`, rather than from the current overall state of the repository.

This causes problems when I run parallel sessions in the same project, because the line-change counts can be duplicated across sessions, which makes the stats messy and misleading. The same issue happens when commands are used to copy files for debugging. In those cases, the sidebar also counts all copied lines as added changes, which does not make sense to me.

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22348 — Task child session can exist without metadata.sessionId after interruption, leaving web UI unable to show subagent activity

📅 `2026-04-13` | ✏️ **qq601086311-glitch** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22348](https://github.com/anomalyco/opencode/issues/22348)


### Description

When the Task tool spawns a child session, the child can already exist in `/session/{parentID}/children`, but the parent `task` part can still finish as interrupted/aborted **without** preserving `metadata.sessionId`.

In the Web UI this makes delegated work look silent/frozen, because the parent task card cannot follow the child session even though the child session already exists and may already contain messages.

This seems related to #21802 and #21979, but the specific issue here is the missing parent-child linkage metadata after interruption.

### Plugins

None.

### OpenCode version

1.4.2

### Steps to reproduce

1. Start a normal Web UI session.
2. Let the main agent use the `task` tool to spawn a subagent.
3. Hit an interrupted/aborted path for that delegated task.
4. Compare the parent session timeline with `GET /session/{parentID}/children`.
5. Observe that the child session exists and may already contain messages, but the parent `task` part has no `metadata.sessionId`, so the Web UI cannot surface the delegated activity.

### Screenshot and/or share link

No share link yet.

Example parent task state captured from a real session:

```json
{
  "status": "error",
  "error": "Tool execution aborted",
  "metadata": {
    "interrupted": true
  }
}
```

### Operating System

WSL Ubuntu 24.04 / Linux, using the Web UI in a browser

### Terminal

Web UI (browser), not TUI / ACP

---

## #22323 — OpenCode web/desktop : no messages displayed when latest 80+ messages in session history are assistant messages

📅 `2026-04-13` | ✏️ **radumg** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22323](https://github.com/anomalyco/opencode/issues/22323)


### Description

When opening some session pages in the OpenCode web UI, the page shell loads but the transcript/messages area is blank, even though the message API returns valid session messages.

Important details:
- This happens both:
  - inside an embedded iframe in our product, and
  - when opening the OpenCode session URL directly in a new tab
- this didn't seem to happen in the TUI when i did `opencode attach` into these sessions, things rendered fine in the TUI
- Because the direct OpenCode page also fails, this does not appear to be an iframe/embed-only issue
- The message API still returns 200 OK with valid messages for the affected session
- The OpenCode Web UI stats flyout displayed all the 80 messages with their JSON etc, but they're not rendered in the main messages area

What seems to distinguish broken vs working sessions:
- Working sessions: the initial fetched message slice includes at least one root/user message
- Broken sessions: the initial fetched message slice contains only assistant messages, and all of them reference a parent/root message that is outside the first fetched page

In our failing case:
- GET /session/{sessionId}/message?limit=80&directory=/workspace/{workspaceId} returns 80 valid messages
- All 80 returned messages are assistant messages
- All 80 have the same info.parentID
- That parent/root message exists in the session history, but it is outside the first fetched slice
- The session UI then renders with no visible transcript/messages



> *[Truncado — 3542 chars totais]*

---

## #22312 — `configured model chutes/XiaomiMiMo/MiMo-V2-Flash-TEE is not valid`

📅 `2026-04-13` | ✏️ **TomLucidor** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22312](https://github.com/anomalyco/opencode/issues/22312)


### Description

I tried to set up model to use `chutes/XiaomiMiMo/MiMo-V2-Flash-TEE` but OpenCode simply can't accept the switch in the configs

### Plugins

OmO

### OpenCode version

Latest

### Steps to reproduce

See here https://github.com/code-yeongyu/oh-my-openagent/issues/3380

### Screenshot and/or share link

_No response_

### Operating System

Linux/OSX

### Terminal

_No response_

---

## #22310 — Local MCP server always times out on Windows

📅 `2026-04-13` | ✏️ **ad-005** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22310](https://github.com/anomalyco/opencode/issues/22310)


### Description

Any local MCP server configured in opencode.json fails with "Operation timed out after 30000ms" on Windows.

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

1. Add any local MCP server to opencode.json
2. Start OpenCode
3. The MCP server simply never connects.

### Screenshot and/or share link

_No response_

### Operating System

Windows 10 Pro

### Terminal

Alacritty

---

## #22299 — Desktop app local MCP can fail when PATH resolves an older Node, while CLI works

📅 `2026-04-13` | ✏️ **tlerbao** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22299](https://github.com/anomalyco/opencode/issues/22299)


### Summary
When using the desktop app, a local MCP configured as `npx -y @mcp_router/cli@latest connect` fails with `MCP error -32000: Connection closed`.

The same config works from the terminal with `opencode mcp list`.

This looks like a desktop/runtime environment bug rather than an `mcp-router` bug. The desktop app appears to launch the MCP child process with a different Node/PATH resolution than the terminal.

### Environment
- OpenCode version: `1.4.3`
- macOS: `13.3 (22E252)`
- Terminal Node: `v22.19.0`
- Also installed on machine: `/usr/local/bin/node -> v16.16.0`

### MCP config
```json
{
  "mcp": {
    "mcp-router": {
      "command": ["npx", "-y", "@mcp_router/cli@latest", "connect"],
      "environment": {
        "MCPR_TOKEN": "<redacted>"
      },
      "type": "local"
    }
  }
}
```

### What happens
In the desktop UI, `mcp-router` shows as failed / disconnected.

OpenCode log shows:
```
file:///Users/.../.npm/_npx/.../node_modules/@hono/node-server/dist/index.mjs:23
var Request = class extends GlobalRequest {
              ^

TypeError: Class extends value undefined is not a constructor or null
```

And then:
```
MCP error -32000: Connection closed
```

### Why this seems like a PATH / Node version issue
The failure is consistent with `@mcp_router/cli` being started under an older Node runtime where `global.Request` is not available.

On this machine:
- terminal `node -v` -> `v22.19.0`
- `/usr/local/bin/node -v` -> `v16.16.0`

The same `mcp-router` config w

> *[Truncado — 2584 chars totais]*

---

## #22281 — Plugin fails to load: Missing 'default' export in cross-spawn

📅 `2026-04-13` | ✏️ **ad-005** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22281](https://github.com/anomalyco/opencode/issues/22281)


### Description

Any plugin that bundles its own copy of the opencode sdk fails to load with Missing 'default' export in module '.../cross-spawn/index.js'.

### Plugins

opencode-todo-reminder

### OpenCode version

1.4.3

### Steps to reproduce

1. Add opencode-todo-reminder to plugin list in opencode.json
2. Start OpenCode
3. Plugin fails immediately

### Screenshot and/or share link

_No response_

### Operating System

Windows 10 Pro

### Terminal

Windows Terminal

---

## #22280 — Plugin with git URL silently fails to install on Windows

📅 `2026-04-13` | ✏️ **ad-005** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22280](https://github.com/anomalyco/opencode/issues/22280)


### Description

Looking at the logs, opencode is trying to create a cache directory named after the full plugin spec string, specifically superpowers@git+https:\github.com\obra\superpowers.git - which contains colons. Colons aren't valid in Windows directory names (outside of drive letters), so the mkdir call fails with ENOENT and the plugin just never loads. No visible error in the UI, only in logs.

### Plugins

obra/superpowers

### OpenCode version

1.4.3

### Steps to reproduce

1. On Windows, add a git URL plugin to opencode.json
2. Start OpenCode
3. Plugin doesn't load as intended

### Screenshot and/or share link

_No response_

### Operating System

Windows 10 Pro

### Terminal

Windows Terminal

---

## #22255 — Plugin slash commands fail in Desktop app with "Failed to send command" — work fine in TUI

📅 `2026-04-13` | ✏️ **rkkautsar** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22255](https://github.com/anomalyco/opencode/issues/22255)


## Description

Slash commands registered by plugins via the `command.execute.before` hook fail in opencode Desktop with the error:

> Failed to send command — request failed

The same commands work correctly in the TUI.

## Reproduction

1. Install the [opencode-pty](https://github.com/shekohex/opencode-pty) plugin
2. Open opencode Desktop
3. Run `/pty-open-background-spy` or `/pty-show-server-url`
4. **Result:** Toast error "Failed to send command — request failed"
5. Run the same commands in TUI → works correctly

## Analysis

The plugin registers commands via `command.execute.before` hook in the plugin SDK. In TUI mode, commands are dispatched via direct HTTP to the server, and the hook fires successfully. In Desktop mode, commands go through the Tauri IPC bridge → sidecar process → HTTP, and appear to fail before the server-side hook is ever reached.

Evidence that the hook never fires:
- `/pty-show-server-url` calls `client.session.prompt()` before throwing — if the hook executed, the URL would appear in chat. It doesn't.
- Both commands fail with the same generic error, suggesting the failure is in the command dispatch layer, not the plugin handler.

The error originates from the catch block in `packages/app/src/components/prompt-input/submit.ts` (`prompt.toast.commandSendFailed.title`).

## Expected Behavior

Plugin-registered slash commands should work identically in Desktop and TUI modes.

## Environment

- opencode Desktop (latest)
- Plugin: opencode-pty
- OS: macO

> *[Truncado — 1501 chars totais]*

---

## #22253 — [Bug] Custom provider models fail with "maxOutputTokens must be >= 1" when limit is not defined

📅 `2026-04-13` | ✏️ **comzip** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22253](https://github.com/anomalyco/opencode/issues/22253)


## Description

After updating to v1.4.3, custom provider models fail with:

```
Invalid argument for parameter maxOutputTokens: maxOutputTokens must be >= 1
```

## Root Cause

There is an asymmetric fallback between built-in models and custom models (found via binary string analysis):

- **Built-in models**: `output: limits?.output ?? 64000` → safe fallback to 64000
- **Custom models**: `output: model.limit?.output ?? existingModel?.limit?.output ?? 0` → falls back to **0**, causing the error

When a custom provider model has no `limit` field defined, `maxOutputTokens` becomes 0, which is rejected by the AI SDK validation.

## Reproduction

Define a custom provider model without a `limit` field in `opencode.json`:

```json
"models": {
  "claude-sonnet-4-6": {
    "name": "Claude Sonnet 4.6",
    "type": "chat",
    "available": true
  }
}
```

Then run opencode with this model — error occurs immediately on any prompt.

## Workaround

Add `limit` to each model in the custom provider config:

```json
"claude-sonnet-4-6": {
  "name": "Claude Sonnet 4.6",
  "type": "chat",
  "available": true,
  "limit": { "context": 200000, "output": 64000 }
}
```

## Expected Behavior

Custom models without a `limit` field should fall back to a reasonable default (e.g. 64000) instead of 0, consistent with built-in model behavior.

## Version

opencode v1.4.3

---

## #22244 — Gemini system prompt missing Task tool / sub-agent delegation instructions

📅 `2026-04-13` | ✏️ **rrmistry** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22244](https://github.com/anomalyco/opencode/issues/22244)


## Description

Gemini models never invoke the Task tool for sub-agent delegation because `gemini.txt` contains zero instructions about the Task tool, while `anthropic.txt` has explicit, detailed guidance. This causes Gemini to run all searches and explorations inline in the parent context, resulting in shallow codebase analysis and excessive context consumption.

### Root cause

The `anthropic.txt` system prompt includes these critical sections that `gemini.txt` completely lacks:

```
# Tool usage policy
- When doing file search, prefer to use the Task tool in order to reduce context usage.
- You should proactively use the Task tool with specialized agents when the task at hand matches the agent's description.
...
- VERY IMPORTANT: When exploring the codebase to gather context or to answer a question
  that is not a needle query for a specific file/class/function, it is CRITICAL that you
  use the Task tool instead of running search commands directly.
```

Plus two concrete examples showing how to delegate to the Task tool for codebase exploration and answering questions about codebase structure.

The `gemini.txt` prompt has no mention of the Task tool, no delegation instructions, and no examples of sub-agent usage. The relevant source is `packages/opencode/src/session/prompt/gemini.txt` vs `packages/opencode/src/session/prompt/anthropic.txt`.

### Observed behavior

- Gemini models (tested with `gemini-3.1-pro-preview` via Vertex AI) spawn 0 sub-agents across 10+ test sessi

> *[Truncado — 4247 chars totais]*

---

## #22215 — fix: WSL UNC paths break bash and git on Windows

📅 `2026-04-12` | ✏️ **tobias-weiss-ai-xr** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22215](https://github.com/anomalyco/opencode/issues/22215)


## Bug

On Windows, when the project directory is accessed via a UNC path (`\\wsl$\...`), tools like bash, file search, and git all break because Windows-native path handling doesn't understand UNC paths.

## Details

Many Windows developers work inside WSL for toolchain access while opencode runs natively on Windows. When the project lives in WSL, the path comes through as `\\wsl$\distro\mnt\c\...` which no native Windows tool can handle.

## Suggested Fix

Detect UNC paths and translate to WSL equivalents, run git/shell commands through `wsl.exe`, translate results back.

- [x] I've verified this exists in the latest version

---

## #22214 — fix: validate custom model config at startup

📅 `2026-04-12` | ✏️ **tobias-weiss-ai-xr** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22214](https://github.com/anomalyco/opencode/issues/22214)


## Bug

Custom model config under the `models` key has no validation. Typos in model IDs, missing required fields, or invalid provider references silently fail or produce confusing runtime errors during chat sessions.

## Details

Users can define custom models but invalid entries aren't caught at startup. This leads to cryptic errors later when the model is actually used.

## Suggested Fix

Schema validation when parsing custom model config. Invalid models should get a clear error at startup listing what's wrong.

- [x] I've verified this exists in the latest version

---

## #22191 — auth login <url> should confirm before running auth.command

📅 `2026-04-12` | ✏️ **exyi** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/22191](https://github.com/anomalyco/opencode/issues/22191)


### Description

Same as #10939, but a bot asked us to submit this again

`opencode auth login <url>` fetches `<url>/.well-known/opencode` and runs the returned `auth.command` immediately.

Opencode should ask before running a remotely provided command or before using the remotely provided config at all (I suppose similar issue exists i.e. with configured MCPs)

### Plugins

_No response_

### OpenCode version

1.4.1

### Steps to reproduce

```
mkdir .well-known
echo '{"auth": {"command": ["touch", "/tmp/oc-bug"]}}' > .well-known/opencode
python -m http.server 12345 &
opencode auth login http://localhost:12345/
```

`/tmp/oc-bug` should not exist without me approving it

### Screenshot and/or share link

_No response_

### Operating System

Arch Linux (original submitted used Windows with the same result)

---

## #22162 — [BUG] Assistant continues coding after session compression despite explicit prohibition

📅 `2026-04-12` | ✏️ **mikegasche** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22162](https://github.com/anomalyco/opencode/issues/22162)


## Description

Assistant ignores explicit user instructions prohibiting code changes and starts coding after session compression.

## Plugins

None

## OpenCode version

Latest Deskto Version 1.4.3 (1.4.3)

## Steps to reproduce

1. User establishes context with explicit rules: "Do not write any code without explicit permission", "Discuss first, then code once the go-ahead is given", "After each session compression, we recommend starting to code without an explicit request"
2. Session gets compressed (context limit reached)
3. After compression, Assistant begins writing code without permission

## Screenshot and/or share link

N/A

## Operating System

macOS

## Terminal

iTerm2

---

## #22157 — Web/serve config endpoint exposes resolved provider and MCP secrets to authenticated clients

📅 `2026-04-12` | ✏️ **rosspeoples** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22157](https://github.com/anomalyco/opencode/issues/22157)


### Description

In serve/web mode, `GET /config` returns fully resolved configuration values to the browser, including secret material that should remain server-side.

In our environment, the returned config payload included:

- resolved provider `apiKey`
- resolved MCP environment variables such as `GITEA_TOKEN`

This was returned to an authenticated web client. Even with authentication in front of the UI, returning shared runtime secrets to the browser is unsafe because those secrets are intended for server-side execution, not for all authenticated clients to read.

Expected behavior:

- config returned to browser clients should redact or omit sensitive values
- secret placeholders may remain visible structurally, but resolved secret values should not be sent to the client

Actual behavior:

- the browser-facing config endpoint returned the resolved secret values directly

### Plugins

Build-local plugins:

- `secret-guard.js`
- `workspace-shell.js`

### OpenCode version

1.3.15

### Steps to reproduce

1. Run OpenCode in serve/web mode with a provider configured via environment-backed secrets.
2. Configure any MCP server that also uses environment-backed secrets.
3. Authenticate to the web UI.
4. Request `GET /config` from the same authenticated client session.
5. Observe that the JSON response contains resolved secret values instead of redacted placeholders.

### Screenshot and/or share link

No screenshot attached because the response contained live secrets.

We verifie

> *[Truncado — 1749 chars totais]*

---

## #22156 — MCP tool completes successfully but session never resumes or finalizes in serve/web mode

📅 `2026-04-12` | ✏️ **rosspeoples** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22156](https://github.com/anomalyco/opencode/issues/22156)


### Description

In serve/web mode, an MCP tool can complete successfully but the session never resumes to the next assistant turn and never finalizes a user-visible answer.

This is not the same as a pending permission or pending question state.

In our repro, the tool call finishes successfully, `/permission` returns `[]`, `/question` returns `[]`, and the session remains stuck after the completed tool part.

This was reproduced in a Build-embedded OpenCode deployment behind a launcher/reverse proxy, but the stuck behavior appears to be in the OpenCode orchestration/runtime path after a successful MCP tool result.

Representative failing flow:

- User prompt: `what git orgs do I have access to?`
- Agent follows prompt guidance and calls `gitea_gitea_user_current`
- Tool returns successfully with the current user login
- No pending permission request remains
- No pending question request remains
- No final assistant continuation appears

Representative successful tool output:

```json
{
  "id": 1,
  "login": "gitea_admin",
  "full_name": "",
  "email": "admin@thepeoples.dev",
  "avatar_url": "https://git.thepeoples.dev/avatars/257dfd123bbdae720b16c78fe50454c0"
}
```

We also reproduced a similar shape on a generic bash-tool prompt after switching bash permissions to allow: the tool executes successfully, but the assistant still may not continue to a final answer.

### Plugins

Build-local plugins plus a local MCP server:

- `secret-guard.js`
- `workspace-shell.js`
- local Gi

> *[Truncado — 2903 chars totais]*

---

## #22152 — The desktop client freezes directly and cannot be used

📅 `2026-04-12` | ✏️ **vagitablebirdcode** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22152](https://github.com/anomalyco/opencode/issues/22152)


### Description

After opening multiple projects and using multiple sessions simultaneously, the program experiences significant lag:
There is a high delay when switching between different projects by clicking.
After creating a new session within a project, pressing Enter has no response, and this issue occurs with high probability.
Information such as the Git history on the right side shows "Loading" and becomes unresponsive.
Deleting a session at this point will cause the historical session records to also become unresponsive.
This issue emerged after upgrading to the latest version. The problem persists even after attempting to clear all data, uninstalling and reinstalling the program, and downgrading the version, and it seems to be irreparable.

### Plugins

DCP、MiCode、OHMyOpenAgent、SuperPower

### OpenCode version

1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Windows11

### Terminal

Windows terminal

---

## #22142 — Repetitive tool-call loops with alibaba-coding-plan-cn/qwen3.6-plus

📅 `2026-04-12` | ✏️ **Astro-Han** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22142](https://github.com/anomalyco/opencode/issues/22142)


### Description

When using OpenCode with `alibaba-coding-plan-cn/qwen3.6-plus`, some sessions fall into repetitive tool-call loops.

What I observe:
- One user turn turns into many assistant turns.
- Adjacent assistant turns often contain nearly identical reasoning.
- Each assistant turn often performs only one tool call, then re-enters the loop.
- The session usually eventually finishes, so this does not look like a storage or transport hang.
- This seems more like a harness-level loop amplification issue that is exposed more often by `qwen3.6-plus`.

Local evidence from my machine:
- Session `ses_2845d8980ffemjHrBrf2XpIrY7` had `18` user messages and `114` assistant messages.
- Many adjacent assistant turns repeated almost the same reasoning, especially around checking or updating the same section again after each tool result.
- In a local sample, `qwen3.6-plus` sessions showed a higher assistant-to-user ratio than recent `opencode-go/glm-5.1` sessions.
- Across stored assistant messages, Qwen also produced many more single-tool turns before reaching a final `stop`.

This does not look like a simple “session got stuck forever” bug. It looks more like the loop keeps accepting repeated `tool-calls` from this model without enough guardrails against repetition.

Relevant code paths that may be involved:
- `packages/opencode/src/session/prompt.ts`
- `packages/opencode/src/agent/agent.ts`

My current suspicion:
- OpenCode keeps looping while the assistant finishes with `tool-cal

> *[Truncado — 3243 chars totais]*

---

## #22139 — Grep and Edit tools intermittently hang and never return on macOS

📅 `2026-04-12` | ✏️ **MattPark** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/22139](https://github.com/anomalyco/opencode/issues/22139)


### Description

The Grep and Edit tools intermittently hang after execution — the operation completes successfully (file is written, or ripgrep produces matches), but control never returns to the model. The agent gets stuck and the user must manually interrupt to continue.

**Observed with both:**
- **Grep tool** — searches complete (verified by running `rg` via Bash with identical args and getting results), but the tool call never returns. Sometimes when interrupted, returns "No files found" even though matches exist.
- **Edit tool** — edits are applied to disk successfully, but the tool call hangs on return. (Workaround: using `sed` via Bash instead.)

This is intermittent — not every call hangs. Unclear trigger, but it seems more likely to occur with larger files (~3,000+ lines).

### Environment

- **OpenCode version:** 1.4.3
- **OS:** macOS (darwin)
- **Model:** claude-opus-4.6 via github-copilot provider
- **Terminal:** standard zsh

### Steps to reproduce

1. Open a session with a large Python file (~3,700 lines) in the workspace
2. Use the Grep tool to search for a pattern that exists in the file, e.g.:
   ```
   Grep(pattern="def.*batch", include="audit.py")
   ```
3. The tool hangs — no result is returned to the model. The user must interrupt.
4. After interruption, the result is sometimes "No files found" (incorrect) or sometimes the correct matches.

The same pattern occurs with the Edit tool:
1. Use Edit to replace a string in a large file
2. The edit is applied

> *[Truncado — 2076 chars totais]*

---

## #22132 — OpenCode 1.4.3 hangs with local Ollama provider on simple prompts, while /v1/chat/completions works

📅 `2026-04-12` | ✏️ **Luporosso76** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/22132](https://github.com/anomalyco/opencode/issues/22132)


### Description

Title:
OpenCode 1.4.3 hangs with local Ollama provider on simple prompts, while /v1/chat/completions works

Body:

## Summary

OpenCode hangs when using a local Ollama provider configured through `@ai-sdk/openai-compatible`.

The issue happens even with a very simple prompt like `ciao`.

Important detail: the same model works correctly when called directly through Ollama's OpenAI-compatible endpoint (`/v1/chat/completions`), so the problem does not appear to be Ollama itself.

## Environment

- OpenCode: `1.4.3`
- Ollama: `0.20.5`
- OS: Ubuntu `25.10`
- Kernel: `6.17.0-20-generic`
- CPU: AMD Ryzen 7 6800H
- RAM: 30 GiB
- GPU: AMD Radeon 680M (integrated)
- Ollama running as a systemd service
- Provider backend: local Ollama via `http://127.0.0.1:11434/v1`

## What I tested

I created dedicated Ollama models for OpenCode with larger context windows, because the docs/issues suggest OpenCode needs more context than Ollama's defaults.

Created models:

- `qwen2.5-coder:7b-opencode-32k`
- `qwen2.5-coder:7b-opencode-64k`
- `qwen3.5:9b-opencode-32k`
- `qwen3.5:9b-opencode-64k`

Example Modelfile:

```txt
FROM qwen2.5-coder:7b
PARAMETER num_ctx 32768
```

Ollama works correctly with these models.

Example:

```bash
ollama run qwen2.5-coder:7b-opencode-32k "Rispondi solo con OK"
```

returns:

```txt
OK
```

Also this works:

```bash
curl http://127.0.0.1:11434/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen2.5-coder:7b-opencod

> *[Truncado — 4529 chars totais]*

---

## #22130 — [Bug]: Subagents listed in `opencode.json` are incorrectly treated as primary agents (ignoring `mode: subagent` from agent files)

📅 `2026-04-12` | ✏️ **michaelvolz** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22130](https://github.com/anomalyco/opencode/issues/22130)


### Description

When any subagent is added to `opencode.json` (even just to override the model for cost/performance reasons), OpenCode treats it as a **primary agent**.  

The `mode: subagent` setting defined in the original agent `.md` files is completely ignored.

This causes all configured subagents to appear in the footer/Tab agent selector (making it unusable when using plugins like Compound Engineering that register many agents).

### Plugins

_No response_

### OpenCode version

1.3.17 (and all versions since v1.3.4)

### Steps to reproduce

1. Use any subagent (e.g. from Compound Engineering) that has `mode: subagent` in its `.md` definition.
2. Add an entry for that agent in `opencode.json` to override its model:
   ```json
   {
     "agents": {
       "subagent-name": {
         "model": "faster-cheaper-model"
       }
     }
   }

Restart OpenCode or reload the session.
Press Tab in the footer or look at the agent selector.

Expected behavior
The subagent should remain a subagent (hidden from the footer/Tab selector) because its canonical definition in the .md file specifies mode: subagent. Config overrides should only affect model/settings, not the agent mode.
Actual behavior
All agents present in opencode.json are forcibly treated as primary agents. The footer/Tab selector now shows many entries instead of only the true primary agents.
Workaround (confirmed working)

Remove the agent entry from opencode.json, or
Explicitly add "mode": "subagent" inside the confi

> *[Truncado — 1624 chars totais]*

---

## #22124 — [Web UI] Permission dialog buttons are off-screen when command text is long

📅 `2026-04-12` | ✏️ **vitaliy-sn** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22124](https://github.com/anomalyco/opencode/issues/22124)


### Description

Permission dialog buttons are off-screen when command text is long. See the attached screenshot.

### Plugins

_No response_

### OpenCode version

1.4.2

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="2106" height="1446" alt="Image" src="https://github.com/user-attachments/assets/6c6f49b9-bb2e-4971-959f-387c1b3f5970" />

### Operating System

Ubuntu 24.04

### Terminal

_No response_

---

## #22122 — fix(opencode): missing unsecured-server warning in acp startup path

📅 `2026-04-12` | ✏️ **shafdev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22122](https://github.com/anomalyco/opencode/issues/22122)


### Description

When OPENCODE_SERVER_PASSWORD is not set, running bun dev serve shows an unsecured server warning, but running bun dev acp does not show the same warning.
Both commands start the server, so warning behavior should be consistent across startup paths

### Plugins

None

### OpenCode version

1.4.3 (repo version)

### Steps to reproduce

1. Unset server password env var: unset OPENCODE_SERVER_PASSWORD
2. Run: bun dev serve
3. Observe warning appears: Warning: OPENCODE_SERVER_PASSWORD is not set; server is unsecured.
4. Run: bun dev acp
5. Observe warning is missing (before fix)

### Screenshot and/or share link

Reproduced locally with terminal output.

### Operating System

macOS

### Terminal

zsh (VS Code integrated terminal)

---

## #22119 — [Bug] Custom plugins display full Windows path instead of plugin name

📅 `2026-04-12` | ✏️ **FurryWolfX** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22119](https://github.com/anomalyco/opencode/issues/22119)


### Description

On Windows, custom plugins show the Windows path (e.g., `C:\Users\worph\`) instead of the plugin name.

## Expected Behavior

Plugin list should display the plugin's actual name (the file name), similar to how it works on WSL/Linux.

## Actual Behavior

On Windows:

- Custom plugins display Windows path like `C:\Users\worph\` as the description
- On WSL/Linux, the same plugin correctly shows just the directory name

## Root Cause

**File**: `packages/opencode/src/cli/cmd/tui/feature-plugins/system/plugins.tsx`

**Function**: `meta()` (lines 30-38)

```tsx
function meta(item: TuiPluginStatus, width: number) {
  if (item.source === "internal") {
    if (width >= 120) return "Built-in plugin"
    return "Built-in"
  }
  const next = source(item.spec) // Only handles file:// URLs
  if (next) return next
  return item.spec // Returns raw Windows path as-is
}
```

The `source()` function only handles `file://` URLs but not raw Windows absolute paths (e.g., `C:\Users\worph\...`). When the plugin spec is a Windows path, it falls through to `return item.spec`, displaying the path.

### Plugins

custom plugins

### OpenCode version

1.4.3

### Steps to reproduce

1. On Windows, add a custom local plugin (e.g., a plugin in a local directory)
2. Use /status in TUI
3. Observe that the plugin shows the Windows path instead of just the plugin name

### Screenshot and/or share link

<img width="248" height="299" alt="Image" src="https://github.com/user-attachments/assets/50b

> *[Truncado — 1603 chars totais]*

---

## #22116 — [BUG] Web UI hides bash output during execution despite streaming data being available

📅 `2026-04-12` | ✏️ **leoleoasd** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22116](https://github.com/anomalyco/opencode/issues/22116)


### Description

Tthe web UI hides tool output until the command completes. The streaming pipeline already delivers output chunks to the client -- props.metadata.output updates reactively during execution. However, three UI gates prevent it from being visible:

1. BasicTool's handleOpenChange blocks toggling the collapsible during both pending and running states
2. BasicTool's Collapsible.Arrow is hidden during both pending and running states
3. The bash tool's description subtitle is hidden during both pending and running states
4. 
Additionally, the collapsible starts closed by default and there's no mechanism to auto-open it when a command starts executing.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

!for i in 1 2 3 4 5; do echo $i; sleep 1; done

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22112 — [BUG] Shell escape (!) commands show no description in tool header

📅 `2026-04-12` | ✏️ **leoleoasd** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22112](https://github.com/anomalyco/opencode/issues/22112)


### Description

When using the `!` shell escape (e.g. `!sleep 5`), the Shell tool card in the web UI shows only "Shell" with no subtitle. When the agent invokes the bash tool, it provides a `description` field (e.g. "Sleep for 5 seconds") which appears as the subtitle next to "Shell". But the `!` escape path in `packages/opencode/src/session/prompt.ts` creates the tool part with only `{ command: input.command }` in the input -- no `description`.


### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

1. run `! sleep 5s`

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22108 — [BUG] Web UI shows "Thinking" instead of "Running" while bash tool is executing

📅 `2026-04-12` | ✏️ **leoleoasd** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22108](https://github.com/anomalyco/opencode/issues/22108)


### Description

In the web UI, the status indicator always shows "Thinking" while the session is busy — even when a bash/shell tool is actively running and the model is just waiting for the command to finish. This is misleading because no "thinking" is happening; the agent is waiting for shell output.

This affects two flows:

1. Agent-invoked bash tool — the agent decides to run a command (e.g. npm test). While the command executes, the "Thinking" shimmer is shown alongside the tool card.
2. ! shell escape — the user types !ls to run a command directly. There is zero LLM involvement, yet "Thinking" is displayed while the command runs.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

in web ui, use ! escape to run a command.
```
! sleep 5s
```

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22104 — Desktop app webfetch tool failed

📅 `2026-04-12` | ✏️ **barelyanything** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22104](https://github.com/anomalyco/opencode/issues/22104)


### Description

<!-- Uploading "Screenshot 2026-04-12 at 11.20.55 AM.png"... -→

Installed opencode CLI, connecting to a local ollama.
Setup a folder with `opencode` and `/init` with defaults `agents.md`

opening the same project folder in the desktop app the desktop app cannot use the webfetch tool.

But CLI is perfectly fine.

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

1. install opencode CLI
2. connect to a model
3. init a new folder
4. open the same folder in desktop app
5. try to get it to find something on the web

> Webfetch Failed
> Expected Response or Body

### Screenshot and/or share link

<img width="1733" height="628" alt="Image" src="https://github.com/user-attachments/assets/315f1560-0915-4bac-beae-2f5f187f5b3c" />

### Operating System

macOS Tahoe

### Terminal

_No response_

---

## #22063 — Hovering a project icon in the sidebar will spawn additional instances of MCPs

📅 `2026-04-11` | ✏️ **agamotto** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22063](https://github.com/anomalyco/opencode/issues/22063)


### Description

Hovering a project icon in the sidebar will spawn additional instances of MCPs.

When launching Opencode Desktop there is a single instance of the MCP.

As soon as I hover a project in the sidebar, additional instances are spawned (observed in realtime in the task manager).

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

Hovering a project icon in the sidebar will spawn additional instances of MCPs.

### Screenshot and/or share link

<img width="153" height="229" alt="Image" src="https://github.com/user-attachments/assets/64650420-5c46-4526-86a8-cae4cebf9afd" />

Above are the same MCP.

### Operating System

Windows 11

### Terminal

_No response_

---

## #22056 — Fix empty session view when clicking sessions in Electron sidebar

📅 `2026-04-11` | ✏️ **ahmedfe** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22056](https://github.com/anomalyco/opencode/issues/22056)


### Description

When using the Electron app, clicking a session from the sidebar can leave the session view empty, even though selecting the workspace correctly loads the last session.

Steps to reproduce:

Open the Electron app
Click on a session from the sidebar
Observe that the session view remains empty instead of loading the selected session
Expected behavior: The selected session should load and display its content, matching the behavior of workspace navigation.

Workaround: Selecting the workspace loads the last session correctly.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #22054 — Insufficient Bash detection on Win32

📅 `2026-04-11` | ✏️ **FrankHB** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22054](https://github.com/anomalyco/opencode/issues/22054)


### Description

Currently Bash detection on Win32 assume `bash.exe` from Git installation is used. However there can be different layout, e.g. UCRT64 `git.exe` on a raw MSYS2 installation set up by `pacman -S ucrt64/mingw-w64-ucrt-x86_64-git`, which will lead `git` executable file found in `/ucrt64/bin` relative to the MSYS2 root directory. (It may worth noting MSYS2 also have package `msys/git` of MSys/Cygwin but some packages like `git-lfs` are only available for native Win32 variants.) In such cases `shell.ts` won't find the correct path of `bash.exe`.

Moreover, if `bash.exe` is in the path, it should be used. The `bash.exe` for WSL is in a well-known location so it should be easy to exclude. It can be also detected by check the output of  `bash --version`, the WSL one will have `x86_64-pc-linux-gnu` but no MSYS/Cygwin Bash should have `linux-gnu` in the target.


### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

1. Run `opencode` on Win32 with Bash installed.
2. Request to run any shell commands.
3. Bash is not used.

### Screenshot and/or share link

_No response_

### Operating System

Windows 10

### Terminal

_No response_

---

## #22045 — Solid runtime plugin support missing from plugin/loader.ts

📅 `2026-04-11` | ✏️ **YumaKakuya** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22045](https://github.com/anomalyco/opencode/issues/22045)


### Description

The TUI plugin runtime imports `@opentui/solid/runtime-plugin-support` at the top of `packages/opencode/src/cli/cmd/tui/plugin/runtime.ts:1`, which lets Solid plugins register themselves inside a compiled binary. The plugin loader used by the server process at `packages/opencode/src/plugin/loader.ts` does not have the same import, so a server plugin that ships compiled `.tsx` components cannot find its Solid runtime when loaded from a compiled binary — the plugin silently fails to mount.

Matching the existing TUI pattern is a single-line import at the top of `plugin/loader.ts`:

```ts
import "@opentui/solid/runtime-plugin-support"
```

PR: #22046

### Plugins

_No response_

### OpenCode version

dev branch (reproduced against commit `27190635e`)

### Steps to reproduce

1. Write a server plugin that uses Solid's TSX runtime to render components.
2. Build OpenCode as a single-file binary via `./packages/opencode/script/build.ts --single`.
3. Load the plugin from that binary — the TSX component never mounts because the Solid runtime was never registered in the server process.

### Screenshot and/or share link

_No response_

### Operating System

Linux (WSL2, Ubuntu 24.04)

### Terminal

_No response_

---

## #22019 — In the latest version, the name of the Open Code Agent is no longer fully displayed. Is this a bug?

📅 `2026-04-11` | ✏️ **silent-night-no-trace** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22019](https://github.com/anomalyco/opencode/issues/22019)


### Description

In the latest version, the name of the Open Code Agent is no longer fully displayed

<img width="559" height="106" alt="Image" src="https://github.com/user-attachments/assets/fd218ac3-8cd7-4730-a022-2363fc6b129d" />

### Plugins

oh-my-opencode

### OpenCode version

1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

macos 26.3

### Terminal

iterm2

---

## #22015 — Usage limit retry countdown displays incorrect time and lacks model identification

📅 `2026-04-11` | ✏️ **antonio59** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22015](https://github.com/anomalyco/opencode/issues/22015)


### Description

The usage limit error message shows a retry countdown that doesn't align with the actual reset time, and the error message doesn't specify which model/provider has hit the limit.

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

Usage limit reached for 5 hour. Your limit will reset at 2026-04-11 20:30:24 [retrying in 2m 22s #8]

![Image](https://github.com/user-attachments/assets/12b0d8a1-62a7-4132-918f-c1725a693be1)

### Screenshot and/or share link

_No response_

### Operating System

MacOS Tahoe 26.1

### Terminal

mac terminal

---

## #22012 — Bash tool hangs with continuously-outputting background processes

📅 `2026-04-11` | ✏️ **WanderWang** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22012](https://github.com/anomalyco/opencode/issues/22012)


### Description



The Bash tool hangs indefinitely when a command spawns a background process that **continuously writes to stdout/stderr**. This happens even though the foreground shell command itself has already finished executing.

PR #20901 (merged in `v1.3.14`) partially addressed this by switching from `close` to `exit` for process completion detection. However, that fix only covers background processes that **do not produce output** (e.g. `sleep 10 &`). If the background process keeps writing to stdout (e.g. `uvicorn`, `npm run dev`, `docker compose up`), the Bash tool's stdout stream collector never terminates, so the entire tool execution promise never resolves.



### Plugins

oh-my-openagent

### OpenCode version

1.4.3

### Steps to reproduce

### 1. Create a minimal FastAPI file `demo_server.py`:

```python
from fastapi import FastAPI
app = FastAPI()
@app.get("/health")
def health(): return {"status": "ok"}
```

### 2. Run the "dangerous" command inside OpenCode's Bash tool:

```bash
bash -c "uv run uvicorn demo_server:app --host 0.0.0.0 --port 9876 & sleep 2; curl -s http://localhost:9876/health; echo 'Foreground done'"
```

**Expected behavior:** The Bash tool should return after `curl`, `echo`, and `sleep` complete.
**Actual behavior:** The Bash tool remains in `running` state indefinitely until timeout kills it.

### 3. Run the "safe" command for comparison:

```bash
bash -c "nohup uv run uvicorn demo_server:app --host 0.0.0.0 --port 9877 > /dev/null 2>&1 & 

> *[Truncado — 1802 chars totais]*

---

## #21999 — Serious GUI regressions and functional bugs in versions post-1.3.1

📅 `2026-04-11` | ✏️ **vaivotrung-wq** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21999](https://github.com/anomalyco/opencode/issues/21999)


### Description

GUI Issues: The interface is severely broken. I’ve experienced frequent UI freezes and rendering failures. Stability is only maintained on version 1.3.1.

Missing Features: The "Auto-accept permissions" button has been removed or is no longer visible.

Request Freezes: Using the @ symbol to reference files consistently causes the model requests to hang/stuck.

### Plugins

none

### OpenCode version

>1.3.1 

### Steps to reproduce

It often gets stuck for a long time immediately upon startup.

Clicking a session in the session list causes the entire GUI to stop responding; however, I can still enter the session by clicking through the conversation history.

Memory usage has spiked again—it used to be a few hundred MB at startup, but now it takes up several GBs right away.

In previous versions, you could have conversations with sub-agents, but this feature is missing in the new version.

The "Auto-authorize" button has disappeared in the new version.

### Screenshot and/or share link

_No response_

### Operating System

Window11

### Terminal

_No response_

---

## #21960 — fix(session): SessionRetry.policy() retries forever with no max attempt count

📅 `2026-04-11` | ✏️ **dangeReis** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21960](https://github.com/anomalyco/opencode/issues/21960)


## Bug

`SessionRetry.policy()` creates an `Effect.Schedule` that retries retryable errors (429, 529, overloaded) **indefinitely** with no maximum attempt count and no maximum total retry duration.

**File**: `packages/opencode/src/session/retry.ts`

## Root Cause

The `policy()` function has exactly two branches:

1. **Stop**: `Cause.done(meta.attempt)` — only when `retryable()` returns `undefined` (non-retryable error)
2. **Continue**: `[meta.attempt, Duration.millis(wait)]` — whenever the error IS retryable

There is **no check for `meta.attempt >= MAX_RETRIES`**. Once an error is classified as retryable, the schedule will retry forever.

```typescript
// retry.ts — policy()
const message = retryable(error)
if (!message) return Cause.done(meta.attempt)     // STOP (only for non-retryable)
return Effect.gen(function* () {
  const wait = delay(meta.attempt, ...)
  // ... set status ...
  return [meta.attempt, Duration.millis(wait)]    // CONTINUE (forever)
})
```

## Impact

When a provider returns persistent 429/overloaded errors:

1. OpenCode retries every 30s (backoff caps at `RETRY_MAX_DELAY_NO_HEADERS = 30_000ms`)
2. Session status stays `"retry"` — `session.error` and `session.idle` are **never emitted**
3. Plugin consumers (oh-my-openagent) that rely on these events for task lifecycle management are stuck waiting indefinitely
4. Tasks appear "running" for 30-45 minutes until a stale timeout fires (if one exists)

**Observed behavior**: 1,691 failed API calls to `opena

> *[Truncado — 2851 chars totais]*

---

## #21928 — OpenAI missing responses scope errors are surfaced as generic API errors

📅 `2026-04-10` | ✏️ **GuestAUser** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21928](https://github.com/anomalyco/opencode/issues/21928)


### Description

When an OpenAI credential lacks `api.responses.write`, OpenCode stores the failure as a generic `APIError` with the raw provider message instead of classifying it as an auth/configuration problem.

That makes the failure look like a model/runtime issue even though the actual problem is missing Responses API permission on the credential. The UI and session history then surface a noisy raw provider error instead of actionable auth guidance.

### Plugins

Built-in Codex / OpenAI OAuth integration

### OpenCode version

dev (`d2d5d84d1` before this fix)

### Steps to reproduce

1. Authenticate the built-in OpenAI provider with an OAuth token or restricted key that does not have `api.responses.write`.
2. Start a session on an OpenAI GPT-5.x / Responses API model such as `gpt-5.4`.
3. Send a prompt that triggers a normal assistant run.
4. Observe the stored/displayed error when the provider returns `401 Missing scopes: api.responses.write`.

### Screenshot and/or share link

Error excerpt:

```text
You have insufficient permissions for this operation. Missing scopes: api.responses.write.
```

### Operating System

Linux

### Terminal

N/A

---

## #21922 — Regression: v1.3.14+ breaks Claude OAuth Opus requests with opencode-claude-auth (v1.3.13 works)

📅 `2026-04-10` | ✏️ **tad-hq** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21922](https://github.com/anomalyco/opencode/issues/21922)


### Description
Using `opencode-claude-auth` with Claude OAuth, `anthropic/claude-opus-4-6` works on OpenCode `v1.3.13` but fails on `v1.3.14+` (including `v1.3.17` and `v1.4.x`) with:

```text
400: You're out of extra usage. Add more at claude.ai/settings/usage and keep going.
```

This appears to be an OpenCode regression rather than a general account/billing issue, because the exact same Claude OAuth account works on `v1.3.13` and starts failing on `v1.3.14+`.

I narrowed the version boundary down to:
- **last known good:** `v1.3.13`
- **first known bad:** `v1.3.14`

The strongest suspect in that range is the provider/auth/plugin integration work in:
- `2f405daa983c950794aa3982584f59411f89bc50` — `refactor: use Effect services instead of async facades in provider, auth, and file (#20480)`

That change makes `provider/auth.ts` and `provider/provider.ts` depend on `Plugin.Service` directly. My current hypothesis is that this made `opencode-claude-auth` intercept the Anthropic Opus path reliably, which then triggers the Claude OAuth extra-usage rejection.

Additional evidence from `CLAUDE_AUTH_DEBUG=1` on a failing version shows the Opus request is built with:
- `modelId: claude-opus-4-6`
- `anthropic-beta` includes `effort-2025-11-24`
- response is the 400 extra-usage error above

### Plugins
- `oh-my-openagent@latest`
- `opencode-claude-auth@latest` (observed with `1.4.9`)

### OpenCode version
- current pinned workaround: `1.3.13`
- regression reproduced on: `1.3.14+`, `1.

> *[Truncado — 2478 chars totais]*

---

## #21920 — Bug: opencode stats --days=X command incorrectly considers messages outside the time window defined by X

📅 `2026-04-10` | ✏️ **kmampent** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21920](https://github.com/anomalyco/opencode/issues/21920)


### Description

The opencode stats --days=X command, where X defines the time-window in days, correctly looks at all sessions that have been updated within the past X days. However, it considers all messages of these sessions when computing the statistics like total cost. I think the correct behavior should be to also only consider messages created within the last X days. 

I have a fix coded for this and will raise a PR. 

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

1. When a new day begins and `opencode stats --days=0` reports 0 cost, choose any session you worked on prior to today.
2. Look at the total cost reported of that session, assume the cost is 5$.
3. Send a simple prompt that by itself should only cost a few cents.
4. Run `opencode stats --days=0` again
5. You will see a total cost reported that is greater than 5$

### Screenshot and/or share link

### Operating System

MacOS 26.3.1

### Terminal

iTerm2

---

## #21911 — When AI edit a file it strips all generics in TS

📅 `2026-04-10` | ✏️ **ouwargui** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/21911](https://github.com/anomalyco/opencode/issues/21911)


### Description

Every time AI edits a file, if there's any generic tags it strips without me asking. And if I ask to add it back it can't, it keeps trying to edit but nothing happens. It happens with all models, I think it is related to the edit tool.

This started after I removed `oh-my-opencode`, I tried doing a clean re-install, but it didn't work.

Here's a few examples:

### diff
```
- <DashboardSectionWithSheet<ProductShowcaseRecord & { _id: string }>
+ <DashboardSectionWithSheet
```
```
- export const getStaticProps: GetStaticProps<ExplorePageProps> = async () => {
+ export const getStaticProps: GetStaticProps = async () => {
```
```
- return result as ObjectTypeParser<SqlFeaturedBusiness, Date, string>;
+ return result as ObjectTypeParser;
```

### asking it to re-insert my generics

<img width="1032" height="823" alt="Image" src="https://github.com/user-attachments/assets/0590da7f-90cd-4fb8-b69c-618304e20e7c" />

### Plugins

only built-ins

### OpenCode version

1.4.3

### Steps to reproduce

1. Ask it to make changes to a TS file with generics
2. Watch it strip all your generic without you asking for it

### Screenshot and/or share link

https://opncd.ai/share/2db8Z5yU

### Operating System

macOS 26.3.1

### Terminal

Ghostty

---

## #21900 — Bug Report: `invalid` internal tool is exposed and can spam repeated calls

📅 `2026-04-10` | ✏️ **Jonathan523** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21900](https://github.com/anomalyco/opencode/issues/21900)


### Description

## Summary

OpenCode Desktop exposes an internal fallback tool named `invalid` in user-facing error output. In some sessions, one malformed tool call can cascade into many repeated `invalid` call entries, which floods the UI and makes debugging difficult.

## Environment

- OpenCode Desktop: `1.4.3`
- Platform: Windows
- Install source: Scoop

## Actual behavior

- Error messages may show:

```text
Model tried to call unavailable tool ''. Available tools: invalid, question, bash, read, ...
```

- The UI may then show many repeated `invalid` tool-call entries.

<img width="1098" height="979" alt="Image" src="https://github.com/user-attachments/assets/eb81d45e-f80b-4a82-b53f-322fa3e816f4" />

## Expected behavior

- `invalid` should remain internal and never appear in user-facing available tool lists.
- A malformed tool call should fail once, or be circuit-broken quickly, instead of repeating dozens of times.

## Investigation

This does not appear to come from user config. Local config files did not define any `invalid` tool.

Evidence from the desktop runtime shows:

- An internal tool is explicitly defined:

```text
...\opencode-cli.exe: InvalidTool = Tool2.define("invalid", ...)
```

- Normal active tools already exclude it:

```text
activeTools: Object.keys(tools).filter((x) => x !== "invalid")
```

- But unavailable-tool error messages still print an available tools list that includes `invalid`:

```text
Model tried to call unavailable tool '${toolName}'.

> *[Truncado — 3235 chars totais]*

---

## #21898 — Bash tool calling fails with GLM5.1 on prem

📅 `2026-04-10` | ✏️ **rememberSoftwares** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21898](https://github.com/anomalyco/opencode/issues/21898)


### Description

Getting
```
$ ls -la
The bash tool was called with invalid arguments: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": [
      "description"
    ],
    "message": "Invalid input: expected string, received undefined"
  }
].
Please rewrite the input so it satisfies the expected schema.
```
**Using GLM5.1 on prem as backend.**  

Everything was find with GLM5 though...

---

The tool output is shown in the TUI but the LLM doesn't recieve it:
```
> Do whomai
Thinking: The user wants to run whoami.
# Show current user
$ whoami
elancelot
Thinking: The bash tool is still not returning any results. This seems like a persistent issue with the tool execution environment. Let me try a different approach.
The bash tool continues to return empty results. This appears to be an environment issue. You can run whoami directly in your terminal to see your current user.
```

Using Opencode 1.4.3
The error is happening on linux/mac and various opencode versions. The error seems to be related to GLM5.1 and how opencode interacts with this model specificaly.


### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

Connect to GLM5.1 onprem

### Screenshot and/or share link

_No response_

### Operating System

Linux/Mac

### Terminal

Terminator / Mac default shell

---

## #21871 — TUI shows wrong theme on startup when system dark/light mode changed since last session

📅 `2026-04-10` | ✏️ **manlao** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21871](https://github.com/anomalyco/opencode/issues/21871)


## Bug Description

When launching the OpenCode TUI in iTerm2 (with automatic dark/light mode switching based on system appearance), the initial theme mode is incorrect.

**Example**: If I was in light mode last time I used OpenCode, but now my system is in dark mode, OpenCode still shows light mode on startup. However, if I toggle the system appearance *after* OpenCode is running, it correctly switches themes via the `CliRenderEvents.THEME_MODE` event.

## Steps to Reproduce

1. Open OpenCode in dark mode → use it → exit
2. Switch system to light mode (or vice versa)
3. Reopen OpenCode → it still shows the previous session's theme instead of the current one

## Root Cause

In `packages/opencode/src/cli/cmd/tui/context/theme.tsx`, the `ThemeProvider` init prioritizes the cached `theme_mode` from KV storage over the freshly detected mode from OSC 11 (`props.mode`):

```typescript
setStore(
  produce((draft) => {
    const lock = pick(kv.get("theme_mode_lock"))
    const mode = pick(kv.get("theme_mode", props.mode))  // ← cached value takes priority
    draft.mode = lock ?? mode ?? props.mode
    // ...
  }),
)
```

Since `apply()` saves `theme_mode` to KV on every mode change, the stale cached value from the previous session overrides the current OSC 11 detection result on the next startup.

The runtime detection works fine because the renderer emits `CliRenderEvents.THEME_MODE` events which call `apply()` and update the mode correctly after startup.

## Expected Behavior

Whe

> *[Truncado — 2133 chars totais]*

---

## #21870 — Theme detection fails to use dark variant despite OSC 11 returning dark background color

📅 `2026-04-10` | ✏️ **owod24** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21870](https://github.com/anomalyco/opencode/issues/21870)


### Description

The catppuccin theme (and other themes with light/dark variants) always shows the light variant, even though OSC 11 queries return a dark background color from the terminal. This began happening today with no known configuration changes.
This appears to be related to issues #19254 and #20926.

Expected behavior:
Themes with dark/light variants should respect the terminal's dark background and display the dark variant based on OSC 11 response.
Actual behavior:
Always displays the light variant regardless of OSC 11 response.


### Plugins

 superpowers

### OpenCode version

v1.4.1

### Steps to reproduce

1. Open opencode in cmux terminal (configured for dark mode)
2. Select catppuccin theme via /theme command
3. Observe that light variant (Latte) is shown instead of dark variant (Mocha)
Diagnostic information:

- OSC 11 query response: rgb:1e1e/1e1e/2e2e (dark background - confirmed dark)
- cmux appearance mode: dark (confirmed in preferences)
- Theme detection: works correctly with system theme

### Screenshot and/or share link

_No response_

### Operating System

macOS 26.2 

### Terminal

cmux

---

## #21854 — File watcher fires parallel HTTP requests for every file an agent writes

📅 `2026-04-10` | ✏️ **Dredok** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21854](https://github.com/anomalyco/opencode/issues/21854)


### Description

When an agent writes N files in quick succession, the file watcher calls `loadFile` / `refreshDir` synchronously for each event. This fires N parallel HTTP requests within milliseconds, saturating the browser connection pool and causing UI stalls.

### Steps to reproduce

1. Start a session and ask the agent to create or modify 10+ files at once
2. Watch the Network tab — one request per file fires immediately
3. With enough files the browser connection pool backs up and the UI freezes briefly

### OpenCode version

v1.4.1

### Operating System

Linux (Ubuntu 24.04), also reproducible on macOS

---

## #21841 — Copilot Claude model is lost

📅 `2026-04-10` | ✏️ **YZJ0716** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21841](https://github.com/anomalyco/opencode/issues/21841)


### Description

Claude model is missing after upgrade

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="635" height="343" alt="Image" src="https://github.com/user-attachments/assets/8481ec9e-ea05-470a-9ce1-db053baf4b05" />

### Operating System

window 11

### Terminal

_No response_

---

## #21838 — OpenCode Desktop version: 1.4.3  cannot display or restore my historical sessions

📅 `2026-04-10` | ✏️ **arctanbell** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21838](https://github.com/anomalyco/opencode/issues/21838)


### Description

## Description

OpenCode Desktop cannot display or restore my historical sessions, but the same sessions are present locally and can be accessed from both CLI and Web.

This appears to be a Desktop-only issue.

## Environment

- OpenCode Desktop version: 1.4.3
- OS: macOS
- System language: zh-Hans-CN
- Locale: zh_CN

## What works

- Local session database exists and contains sessions
- `opencode session list` shows the sessions correctly
- `opencode web` can display all sessions correctly
- Desktop logs show that the app successfully opens the local database and requests session data

## What does not work

- OpenCode Desktop does not show/load historical sessions in the UI

## Reproduction

1. Open OpenCode Desktop
2. Connect to `Local Server`
3. Go to the home/session view
4. Historical sessions are missing or cannot be restored in Desktop
5. Run `opencode session list` in terminal: sessions are present
6. Run `opencode web`: all sessions are visible there

## Expected behavior

Desktop should show the same local historical sessions that are available via CLI/Web.

## Actual behavior

Desktop UI does not show or restore those sessions, even though the backend can access them.

## Attempted fixes

- Cleared Desktop local UI state
- Backed up and removed:
  - `opencode.settings.dat`
  - `opencode.global.dat`
  - `opencode.workspace.*.dat`
- Restarted Desktop
- Confirmed `Local Server` is selected
- Issue still persists

## Evidence

### Desktop log shows su

> *[Truncado — 2294 chars totais]*

---

## #21837 — Windows proxy SSL certificate verification error when calling OpenAI API

📅 `2026-04-10` | ✏️ **vivibein** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21837](https://github.com/anomalyco/opencode/issues/21837)


### Description

Windows + Clash proxy+ Proxifier
OAuth 授权成功
但调用Gpt-5.4时 SSL 证书验证失败“unknown certificate verification error”
尝试了 HTTPS/SOCKS5 代理都失败
可能是 Bun 运行时对代理支持不完整

<img width="507" height="266" alt="Image" src="https://github.com/user-attachments/assets/ee2eab33-c271-464c-ae5b-83c11a308d16" />

<img width="564" height="249" alt="Image" src="https://github.com/user-attachments/assets/82367f0e-33fd-4fe0-93b3-89729ce970d3" />

<img width="1308" height="537" alt="Image" src="https://github.com/user-attachments/assets/1a45528b-d568-4ce0-8290-e1c7ee93f9e3" />

### Plugins

_No response_

### OpenCode version

v1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Windows11

### Terminal

opencode desktop

---

## #21835 — App file sidebar flashing when model changes files

📅 `2026-04-10` | ✏️ **fezproof** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21835](https://github.com/anomalyco/opencode/issues/21835)


### Description

When models are running in the Opencode app, the files side panel constantly flashes the change data, probably not rendering correctly.

### Plugins

None

### OpenCode version

1.4.2

### Steps to reproduce

Open projec
Have files that are changes
Run prompt
See flashing

### Screenshot and/or share link

https://github.com/user-attachments/assets/af41e52b-3513-4c03-a29c-a653de74fdf1

### Operating System

MacOS Tahoe 26.4

### Terminal

Native app beta

---

## #21830 — AWS Knowledge MCP is broken

📅 `2026-04-10` | ✏️ **aiyengar-caylent** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21830](https://github.com/anomalyco/opencode/issues/21830)


### Description

Since upgrading from Opencode 1.3.x to 1.4, the AWS Knowledge MCP server is broken with this error - `SSE error: Invalid content type, expected "text/event-stream"`. No idea whether it's correlation or causation. Other MCP servers work fine though.

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21826 — Bug: Plugin installation fails with 'No git binary found in ' on Windows

📅 `2026-04-10` | ✏️ **XucroYuri** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/21826](https://github.com/anomalyco/opencode/issues/21826)


# Bug Report: Plugin installation fails with "No git binary found in $PATH" on Windows

## OpenCode version
1.4.3 (Windows x64)

## Description
When trying to install plugins that use `git+https://` protocol (e.g., superpowers), the plugin installation fails with "No git binary found in $PATH" despite git being installed and accessible in the system PATH.

## Steps to reproduce
1. Install opencode-ai via npm on Windows
2. Add a plugin with git+https:// protocol to opencode.json, e.g.:
   ```json
   "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
   ```
3. Start opencode - it will try to install the plugin

## What is expected behavior?
The plugin should be installed using the system's git binary which is available in PATH.

## What do you see instead?
```
ERROR service=plugin pkg=superpowers version=git+https://github.com/obra/superpowers.git error=No git binary found in $PATH failed to install plugin
```

## Root Cause Analysis
The issue appears to be in how Bun (the embedded runtime) handles PATH lookup:

1. opencode uses the `@npmcli/git` package to resolve the git binary
2. `@npmcli/git` uses the `which` library to find `git.exe` in PATH
3. When running inside the Bun-compiled binary, the PATH resolution fails because:
   - The compiled binary's process environment may not correctly inherit or parse the Windows PATH
   - The `which` library inside Bun's context can't find git.exe even though it's in system PATH

## Additional Information
- git is ins

> *[Truncado — 1798 chars totais]*

---

## #21817 — Unable to Upload a Big File

📅 `2026-04-10` | ✏️ **AaronYang0628** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21817](https://github.com/anomalyco/opencode/issues/21817)


### Description

## Summary
When using `opencode web`, small file uploads (e.g., 12KB) work, but uploading a larger file (~1MB) causes the agent to become unresponsive. After that, the same session no longer replies to follow-up messages.


## Environment
- Platform: Linux
- Mode: `opencode web`
- Project: `astro-code`
- Model/provider setup: OpenAI-compatible endpoint (configured in `.opencode/opencode.json`)

## Steps to Reproduce
1. Start web mode:
```bash
   opencode web
```
2. In the web UI, upload a small file (~12KB) and ask agent to save path only.
3. Observe success: agent returns saved file path.
4. Upload a larger file (~1MB) with the same instruction (save only, do not parse).
5. Send another message after upload.

  > Actual Behavior
    - Agent becomes stuck/unresponsive after the ~1MB upload.
    - No further reply in that session.
    - Session effectively dead until starting a new session.

Expected Behavior
- Upload should be handled in path-only mode (no content ingestion into prompt/context).
- Agent should return staged file path + metadata and remain responsive.
- Large files should not be expanded into chat text/base64 context.

### Investigation Notes
- In a problematic session, uploaded file content appears to be included in conversation context as very large text payload (close to full file size), instead of staying as opaque file reference/path.
- This likely causes context bloat and stalls downstream model responses.
- Existing policy/docs already 

> *[Truncado — 2279 chars totais]*

---

## #21802 — ACP clients cannot see subagent activity from Task tool

📅 `2026-04-10` | ✏️ **jasonmj** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21802](https://github.com/anomalyco/opencode/issues/21802)


## Bug Description

When an AI agent uses the Task tool to spawn a subagent, all activity from that subagent (tool calls, text streaming, permission requests) is invisible to ACP clients such as agent-shell.

This was also reported from the agent-shell side at https://github.com/xenodium/agent-shell/issues/505, where users noted that subagent permission prompts never appear and the shell appears hung while awaiting confirmation.

## Root Cause

In `packages/opencode/src/acp/agent.ts`, the `handleEvent()` method calls `this.sessionManager.tryGet(sessionID)` for every incoming event and silently returns if the session is not found.

`ACPSessionManager` only tracks sessions created via `session/new` or `session/load` (the root sessions initiated by the ACP client). Child sessions created by the Task tool via `Session.create({ parentID: ... })` are never registered in the session manager, so all their events are dropped — including `permission.asked`, which means `session/request_permission` is never sent to the ACP client.

## Expected Behavior

Subagent tool calls, text output, and permission dialogs should be visible in the ACP client, attributed to the root (parent) session.

## Steps to Reproduce

1. Connect an ACP client (e.g. agent-shell)
2. Send a prompt that causes the agent to use the Task tool
3. Observe that no activity from the subagent appears in the client
4. If the subagent requests a permission, the shell appears hung with no dialog shown

---

## #21800 — The description of the read tool can mislead text-only LLMs, causing them to hallucinate that they can understand image content.

📅 `2026-04-10` | ✏️ **Demonese** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21800](https://github.com/anomalyco/opencode/issues/21800)


### Description

The description of the `read` tool can mislead text-only LLMs, causing them to hallucinate that they can understand image content.

Please adjust the `read` tool's description according to the LLM's actual capabilities.


### Plugins

none

### OpenCode version

1.4.3

### Steps to reproduce

![IMG_20230622_135436.jpg](https://github.com/user-attachments/assets/9a05d616-f8cc-40c4-8e03-65acac195409)

---

# Image content inquiry

**Session ID:** ses_28ada97c5ffeyTwoGo0t9EKXig
**Created:** 2026/4/10 10:07:59
**Updated:** 2026/4/10 10:26:00

---

## User

Tell me what's in the picture IMG_20230622_135436.jpg?

---

## Assistant (Build · MiniMax-M2.7 · 10.4s)

_Thinking:_

The user is asking about an image file. I should use the read tool to look at the image file since the read tool can read image files and PDFs.

**Tool: read**

**Input:**
```json
{
  "filePath": "~/.config/opencode/IMG_20230622_135436.jpg"
}
```

**Output:**
```
Image read successfully
```

---

## Assistant (Build · MiniMax-M2.7 · 19.0s)

_Thinking:_

The image shows a license plate. I can see a blue square sign with white text that appears to be a license plate. Let me analyze the characters visible:

- It starts with "R" followed by what looks like "MO"
- Then what appears to be "3" 
- Then what looks like "E" 
- Then what might be "T"
- Then "B" and "A" and "R"

So it seems to be reading: RMO 3ET BAR or something similar. Actually looking more carefully:
- The blue sign with white text app

> *[Truncado — 7544 chars totais]*

---

## #21768 — fix(bash): compose plugin PATH instead of stomping system PATH

📅 `2026-04-09` | ✏️ **micuintus** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21768](https://github.com/anomalyco/opencode/issues/21768)


### Description

When plugins return PATH entries via the `shell.env` hook, the current implementation in `bash.ts` overwrites the system PATH entirely. This breaks basic system commands because standard paths like `/usr/bin` are lost.

### Steps to reproduce

1. Create a plugin that returns `{ env: { PATH: "/my/plugin/bin" } }` from the `shell.env` hook
2. The bash tool runs a command
3. System commands like `ls`, `git` etc. fail because `/usr/bin` is no longer in PATH

### Plugins

Any plugin that sets PATH via shell.env hook

### OpenCode version

v1.4.2

Part of the plugin primitives work tracked in #20018 (split from #21687).

---

## #21761 — Bug: SessionSummary runs on every processor finish-step and repeatedly loads full session history

📅 `2026-04-09` | ✏️ **sjawhar** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21761](https://github.com/anomalyco/opencode/issues/21761)


## Bug Description

Tool-using sessions can freeze the TUI and drive multi-GB RSS growth because `SessionSummary.summarize(...)` is invoked on every assistant `finish-step`, and `summarize()` loads the full session history (`Session.messages({ sessionID })`) every time.

This creates a hot loop during multi-step agent execution:

1. prompt loop re-enters for normal tool-assisted execution
2. processor `finish-step` fires for each assistant model turn
3. processor calls `SessionSummary.summarize(...)`
4. summarize loads the full session history and hydrates all parts
5. memory spikes and repeats on every turn

## Root Cause

### Primary trigger

`packages/opencode/src/session/processor.ts`

Inside the `finish-step` event handler, the processor unconditionally calls:

```ts
SessionSummary.summarize({
  sessionID: ctx.sessionID,
  messageID: ctx.assistantMessage.parentID,
})
```

That means summary runs once per assistant model turn, not once per overall user prompt.

### Expensive operation

`packages/opencode/src/session/summary.ts`

`summarize()` calls:

```ts
const all = yield* sessions.messages({ sessionID: input.sessionID })
```

With no `limit`, this hydrates the full message history every time.

## Evidence

Live diagnostic repro with labeled binary:

- `prompt loop entry`: 4
- `summary start`: 4
- `summary loaded messages`: 4
- `prompt loop summary trigger`: 1
- `prune start`: 0
- `session messages full`: 10
- `message hydrate`: 45

This proves:
- prompt loop re-entry i

> *[Truncado — 2179 chars totais]*

---

## #21745 — Subagent dispatch fails with session ID validation error: must start with "ses"

📅 `2026-04-09` | ✏️ **excodezz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21745](https://github.com/anomalyco/opencode/issues/21745)


## Bug Description

When dispatching subagent mode agents (via parallel task dispatch), OpenCode fails with a session ID validation error:

\`\`\`json
[
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "starts_with",
    "prefix": "ses",
    "path": [],
    "message": "Invalid string: must start with \\"ses\\""
  }
]
\`\`\`

This happens every time a \`subagent\` mode agent is invoked. Primary agents work fine.

## Steps to Reproduce

1. Create an agent config with \`mode: "subagent"\` in \`~/.config/opencode/agents/\`:
\`\`\`yaml
---
description: "Parallel diagnostics subagent"
mode: "subagent"
---
\`\`\`
2. Reference it in \`config.json\` under \`agent.cluster-debugger\`
3. Trigger the agent from the TUI
4. Observe the validation error — the subagent never spawns

## Expected Behavior

Subagents should spawn and execute tasks in parallel.

## Actual Behavior

Session ID validation fails before subagent creation. The error comes from Zod schema validation expecting a string prefixed with \`ses\`, but the session ID appears to be empty or malformed at dispatch time.

## Environment

- **OpenCode version**: 1.4.1
- **OS**: macOS (darwin, Apple Silicon)
- **Node version**: (bundled with OpenCode)
- **Shell**: zsh

## Additional Context

- This affects ALL subagent mode agents, not just one specific config
- Primary agents (\`mode: "primary"\`) work without issue
- The error format matches Zod validation (\`code: "invalid_format"\`, \`format: "starts_with"

> *[Truncado — 1768 chars totais]*

---

## #21743 — Shell/session interrupt regression in 1.4.2 can leave TUI stuck and shutdown timing out

📅 `2026-04-09` | ✏️ **samiralibabic** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21743](https://github.com/anomalyco/opencode/issues/21743)


### Description

### Description

On 1.4.2, interrupting a long-running shell/session action can leave OpenCode stuck instead of returning cleanly to idle.

Observed behavior:
- Esc twice does not reliably interrupt
- the session can remain busy/stuck
- TUI shutdown can end with:
  `worker shutdown failed`
- downgrading to 1.3.17 fixes it

This appears to be a regression in shell/session cancellation behavior introduced after 1.3.17.

### Plugins

Custom plugin present in my normal setup (`rexd-target`), but the same setup works on 1.3.17 and breaks on 1.4.2.

### OpenCode version

1.4.2

### Steps to reproduce

1. Start a long-running shell/session action in TUI
2. Press Esc twice to interrupt
3. Observe that interruption is unreliable and the session may remain stuck
4. Exit TUI
5. Observe possible shutdown timeout / worker shutdown failure

### Screenshot and/or share link

_No response_

### Operating System

macOS

### Terminal

Safari for web repro; TUI repro in normal terminal usage

---

## #21741 — MCP HTTP client: Bun's hardcoded fetch timeout causes repeated retries and -32000 errors for long-running tool handlers

📅 `2026-04-09` | ✏️ **josippapez** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21741](https://github.com/anomalyco/opencode/issues/21741)


## Problem

When an MCP tool handler takes a long time to resolve (e.g., an interactive prompt waiting for user input with a 1200s or infinite timeout), Bun's hardcoded ~5 minute fetch timeout fires before the tool completes. This causes:

1. The `fetch()` call backing the `StreamableHTTPClientTransport` POST to abort with a `TimeoutError`
2. OpenCode's MCP client retries the tool call on a new HTTP connection
3. The MCP server receives a new request for the same tool, but the original SSE stream's `cancel()` callback has already removed the request ID from the SDK's internal `_streamMapping`
4. `send()` throws `"No connection established for request ID"` → the agent sees `-32000 Connection closed`
5. The tool result is permanently lost

Even with `enableJsonResponse: true` on the server (which eliminates SSE streams), the client-side fetch timeout still fires and causes unnecessary retries, producing duplicate tool call attempts in the agent's chat log.

## Root cause

Bun hardcodes a ~5 minute fetch timeout that **ignores** `AbortSignal.timeout()` values longer than the hardcoded limit. This is a known Bun bug:

- **oven-sh/bun#16682** — ["Respect timeout passed to fetch"](https://github.com/oven-sh/bun/issues/16682) (open, labeled `bug`, `needs investigate`, `web:fetch`)
- **oven-sh/bun#18536** — ["`AbortSignal.timeout` does nothing in `fetch` when the host drops all packets"](https://github.com/oven-sh/bun/issues/18536) (closed, but related)

The MCP SDK's `StreamableHTTP

> *[Truncado — 3702 chars totais]*

---

## #21735 — Bug(web): Agent dropdown doesn't update when a plugin switches agents mid-session

📅 `2026-04-09` | ✏️ **backnotprop** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21735](https://github.com/anomalyco/opencode/issues/21735)


### Description

The OpenCode web app is already reactive to agent changes driven by the server. When an agent switch happens mid-session, message colors, loading indicators, and sidebar session items all update immediately to reflect the new agent. 

**The one thing that does not update is the agent dropdown in the prompt bar**, which stays stuck on the original agent for the rest of the session.

When an OpenCode plugin automatically switches agents during a session (for example, a planning plugin that hands off to a build agent after plan approval), the rest of the UI correctly reflects the new agent. The message colors update, the loading indicators update. But the agent dropdown in the prompt bar stays stuck on the original agent.

This means a user who approved a plan and expected to continue chatting with the build agent is looking at a dropdown still labeled "plan." If they send a follow-up message without noticing, it goes to the wrong agent.

### Plugins

@plannotator/opencode

### OpenCode version

1.4.2

### Steps to reproduce

1. Open `opencode web` with a plugin that calls `session.promptAsync` with a different agent than the one currently active in the session
2. Observe the message colors and loading indicators update to reflect the new agent
3. Observe the agent dropdown in the prompt bar remains on the original agent

### Screenshot and/or share link

N/A

### Operating System

macOS 25.3.0

### Terminal

N/A (web mode)

---

### Root cause

The web app has 

> *[Truncado — 2740 chars totais]*

---

## #21730 — github run: `agent` input from action.yml is ignored by the binary

📅 `2026-04-09` | ✏️ **wewelll** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21730](https://github.com/anomalyco/opencode/issues/21730)


## Bug Description

The `agent` input defined in `github/action.yml` is set as the `AGENT` environment variable, but the `opencode github run` binary command (`packages/opencode/src/cli/cmd/github.ts`) **never reads `process.env.AGENT`**.

This means the `agent:` input in GitHub Action workflows has no effect — the session always falls back to `default_agent` from config, or `"build"` if unset.

## Steps to Reproduce

1. Configure a GitHub Action workflow with a custom agent:
   ```yaml
   - uses: anomalyco/opencode/github@latest
     with:
       model: opencode/gpt-5.4
       agent: on-call  # <-- This is ignored
   ```

2. The `action.yml` correctly maps this to an env var:
   ```yaml
   env:
     AGENT: ${{ inputs.agent }}
   ```

3. But `github.ts` line 943 explicitly omits the agent:
   ```typescript
   // agent is omitted - server will use default_agent from config or fall back to "build"
   ```

4. The session runs under `"build"` regardless of what `agent:` was set to.

## Expected Behavior

The `agent` input should be passed through to `SessionPrompt.prompt()` so the session uses the specified agent and its tool permissions.

## Actual Behavior

The `AGENT` env var is set but never consumed. The session always uses the default agent (`"build"`), which means agent-specific tool permissions (e.g., `datadog_*: true` on an `on-call` agent) are never applied.

## Impact

This is a **silent failure** — the workflow appears to work, but the agent doesn't have access to the

> *[Truncado — 2578 chars totais]*

---

## #21728 — Bug: prompt_async notifications override session's active agent and model

📅 `2026-04-09` | ✏️ **sjawhar** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21728](https://github.com/anomalyco/opencode/issues/21728)


## Bug Description

When a `prompt_async` request arrives without explicit `agent` or `model` fields (e.g., from Envoy notifications, Legion worker coordination, or any fire-and-forget prompt injection), the session's active agent and model are silently overridden by the default agent's configured defaults.

## Steps to Reproduce

1. Start a session and set it to a non-default agent and model (e.g., agent=`hephaestus`, model=`opencode/kimi-k2.5-free`)
2. Send a `POST /session/:id/prompt_async` with only `parts` (no `agent`, no `model`)
3. Observe the next assistant turn uses the *default* agent's configured model, not the session's active model

## Expected Behavior

When `prompt_async` omits `agent` and `model`, the session should preserve whatever agent and model were active from the last user message.

## Actual Behavior

The session's agent falls back to the default agent config, and the model falls back to that agent's configured model — discarding whatever the user had actively selected.

## Root Cause

In `packages/opencode/src/session/prompt.ts`, `createUserMessage()` defaulted omitted `agent`/`model` from the default agent configuration instead of reading the current session prompt state (most recent user/assistant message). The synthesized user message then became the new source of truth for ACP session replay, silently redirecting the session.

## Impact

This actively affects overnight agent coordination: Envoy notifications delivered to sessions via `prompt_async

> *[Truncado — 1745 chars totais]*

---

## #21705 — GUI hangs during shell/tool execution (requires manual interrupt to continue)

📅 `2026-04-09` | ✏️ **ItzSteveefr** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21705](https://github.com/anomalyco/opencode/issues/21705)


### Description

GUI sometimes becomes unresponsive when executing shell/tool commands (bash).

The chat appears stuck with no visible progress or output. The only way to recover is to interrupt and then prompt "continue", after which execution resumes normally.

### Plugins

None

### OpenCode version

OpenCode Desktop v1.4.1

### Steps to reproduce

Not consistently reproducible.

Usually happens during tasks involving shell commands (e.g. install, build, git operations).

### Screenshot and/or share link

N/A

### Operating System

Windows 11 Pro

### Terminal

N/A (GUI mode)

---

## #21698 — In Web UI I cannot select / as a workspace, but many sessions were created there.

📅 `2026-04-09` | ✏️ **powerpaul17** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21698](https://github.com/anomalyco/opencode/issues/21698)


### Description

When I started Opencode Web, sessions were created at /. The I added another workspace folder, somehow / got deleted and now I cannot add it again to access my sessions. The problem is that the folder picker is not accepting the root directory.

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

1. Open workspace folder picker
2. Write "/"
3. Try to select it

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21677 — opencode desktop doesn't show claude models in copilot provider

📅 `2026-04-09` | ✏️ **Jason3900** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21677](https://github.com/anomalyco/opencode/issues/21677)


### Description

<img width="662" height="545" alt="Image" src="https://github.com/user-attachments/assets/ebd7162f-692e-4a02-9b6b-1e7ed52693ec" />

opencode desktop doesn't show claude models in copilot provider, only other models, but in terminal, it works fine.

### Plugins

oh-my-openagent

### OpenCode version

1.4.1

### Steps to reproduce

open opencode desktop, select model

### Screenshot and/or share link

_No response_

### Operating System

macOS

### Terminal

iterm2

---

## #21672 — After the version update, the reply content cannot be displayed. You need to reopen it.

📅 `2026-04-09` | ✏️ **quliangtao038** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/21672](https://github.com/anomalyco/opencode/issues/21672)


### Description

When I use the plan mode, after the conversation is completed, the UI does not display the reply content. It can only be displayed after restarting.
The AI model I am using is GPT-5.3 Codex.

### Plugins

_No response_

### OpenCode version

V1.4.1

### Steps to reproduce

1.An old conversation
2.Update to version 1.4.1
3.Conducting conversations with AI in the old conversation

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

_No response_

---

## #21671 — Opencode cannot discover skill workflow.md files - poor discoverability

📅 `2026-04-09` | ✏️ **het-openxcell** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21671](https://github.com/anomalyco/opencode/issues/21671)


### Description

When invoking a skill (e.g., `bmad-create-story`), the agent should be able to immediately access the skill's workflow.md instructions. Currently, agents must search for the file themselves, which fails in most cases.
## Expected Behavior
- **Option 1:** Provide workflow.md path directly in user request when invoking a skill
- **Option 2:** Auto-load the skill's workflow.md when the skill is invoked
- **Option 3:** Make workflow.md discoverable at a well-known location for each skill
## Steps to Reproduce
1. User provides a skill name (e.g., `bmad-create-story`)
2. Agent attempts to read `./workflow.md` - fails (file not found)
3. Agent searches for workflow.md - fails (not in expected locations)
4. Agent asks user for the file - unnecessary friction
## Current State
- Skill files exist in `.claude/skills/` or `.agents/skills/`
- User specifies skill name, not workflow.md path
- Agent cannot find workflow.md without explicit path
## Suggested Fixes
1. **Document requirement** - State that skills require explicit workflow.md path in user request
2. **Auto-inject workflow** - Automatically inject skill workflow when skill is loaded
3. **Add skill directory** - Include skill directory in search paths automatically
## Environment
- opencode with skill system
- Various skills installed (bmad-*, gds-*, wds-*, etc.)

### Plugins

None

### OpenCode version

1.4.1

### Steps to reproduce

1. Create a skill which need to see other files in same skill folder

### Scree

> *[Truncado — 1948 chars totais]*

---

## #21668 — Session becomes permanently dead when image exceeds provider size limit — no recovery possible

📅 `2026-04-09` | ✏️ **Harry-Coleman** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/21668](https://github.com/anomalyco/opencode/issues/21668)


## Description

When a session contains an image that exceeds the provider's size limit (5 MB for Anthropic), the session becomes permanently unrecoverable. No further prompts can be sent, and there is no way to:

- Delete or remove the offending image from the session
- Resume or recover the session
- Clear the message that contains the oversized image

The session remains dead even after restarting OpenCode or rebooting the machine.

## Error Message

```
undefined: The model returned the following errors: messages.258.content.1.image.source.base64: image exceeds 5 MB maximum: 5895160 bytes > 5242880 bytes
```

## Steps to Reproduce

1. Drag and drop an image larger than 5 MB into a session prompt
2. Send the message
3. Observe the error above
4. Try to continue the session — no further prompts are accepted
5. Restart OpenCode or reboot the machine
6. Reopen the session — it remains dead with no way to recover

## Expected Behavior

At least one of the following should be possible:
- Warn the user before sending if an image exceeds the provider's size limit
- Allow the user to delete individual messages or images from a session
- Allow the session to recover by skipping or truncating the offending message

## Actual Behavior

The session is permanently dead. There is no way to delete the image or recover the session.

## Environment

- OpenCode version: `1.4.1`
- Platform: macOS (darwin)

---

## #21666 — /share command fails with "Failed to copy url" error

📅 `2026-04-09` | ✏️ **Harry-Coleman** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21666](https://github.com/anomalyco/opencode/issues/21666)


## Description

When running the `/share` command, the operation fails with the error message:

> Failed to copy url

The shareable link is not generated or copied to the clipboard.

## Steps to Reproduce

1. Open an existing session in OpenCode
2. Run `/share`
3. Observe the error: `Failed to copy url`

## Expected Behavior

A shareable link to the current conversation is generated and copied to the clipboard.

## Actual Behavior

The command fails with `Failed to copy url` and no link is produced.

## Additional Context

This was encountered while trying to preserve session context as a workaround for a separate issue: a conversation containing a large image (~5.6 MB) that exceeds Anthropic's 5 MB per-image limit, causing the error:

> messages.258.content.1.image.source.base64: image exceeds 5 MB maximum: 5895160 bytes > 5242880 bytes

## Environment

- OpenCode version: `1.4.1`
- Platform: macOS (darwin)

---

## #21642 — Plugin-registered agent names with zero-width space (U+200B) prefixes leak into system prompt

📅 `2026-04-09` | ✏️ **HammerCloth** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21642](https://github.com/anomalyco/opencode/issues/21642)


### Description

When a plugin registers agents with names containing zero-width space characters (U+200B), OpenCode passes these names verbatim into the system prompt's <agent-identity> block. This causes the LLM to receive an agent name with invisible characters, e.g.:
Your designated identity for this session is "\u200BSisyphus".
The root cause is in the oh-my-openagent plugin, which uses \u200B (ZWSP) as sort prefixes to control agent ordering in the TUI dropdown (AGENT_LIST_SORT_PREFIXES in dist/index.js:61035). Each agent gets a different count of ZWSP prefixes (1× for Sisyphus, 2× for Hephaestus, 3× for Prometheus, 4× for Atlas). These prefixed names flow through remapAgentKeysToDisplayNames() into the agent config keys, which OpenCode then writes directly into the system prompt.
While this is primarily a plugin-side issue, OpenCode should defensively sanitize agent names before injecting them into system prompts — stripping zero-width and other invisible Unicode characters (U+200B, U+200C, U+200D, U+FEFF, etc.). This would protect against any plugin introducing similar issues in the future.

### Plugins

 oh-my-openagent@latest (v3.16.0)

### OpenCode version

1.4.0

### Steps to reproduce

1. Install oh-my-openagent plugin: add "oh-my-openagent@latest" to the plugin array in opencode.json
2. Start OpenCode and select any agent registered by the plugin (e.g. Sisyphus, Prometheus, Atlas)
3. Ask the agent: "What is your exact identity name? Show me the raw bytes."
4. Ob

> *[Truncado — 1985 chars totais]*

---

## #21638 — Loading local plugin silently fails in case of an error

📅 `2026-04-09` | ✏️ **michalkvasnicak** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21638](https://github.com/anomalyco/opencode/issues/21638)


### Description

I'm working on a plugin and during development I'm using just local version of the plugin by placing it to `.opencode/plugins/my-plugin.ts`. The issue is that if there is some error in the plugin (e.g. incompatibility between node and bun) the error is just swallowed. 

I believe it is because of this line https://github.com/anomalyco/opencode/blob/489f57974d55d6556dfa5ef7e9b94c06c7238908/packages/opencode/src/plugin/shared.ts#L139 where error is swallowed in case of local plugin.



### Plugins

_No response_

### OpenCode version

1.4.0

### Steps to reproduce

1. import `drizzle-orm/node-sqlite` in your plugin and use it to create a database
2. opencode loads the plugin but then it behaves like the plugin doesn't exist and there are no error logs

### Screenshot and/or share link

_No response_

### Operating System

macOS 26.3.1

### Terminal

Ghostty

---

## #21632 — subagent model variants are parsed but not applied at runtime in v1.4.0

📅 `2026-04-09` | ✏️ **haitaoxw** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21632](https://github.com/anomalyco/opencode/issues/21632)


### Description

After upgrading from `v1.3.17` to `v1.4.0`, subagents no longer appear to honor agent-level `variant` settings at runtime.

The config is parsed correctly, but the effective request behavior does not reflect the configured model variant. Downgrading back to `v1.3.17` restores the expected behavior.

Expected behavior:

If a subagent is configured like this:

```json
"gsd-code-reviewer": {
  "model": "codex/gpt-5.3-codex",
  "variant": "high"
}
```

and the model defines:

```json
"gpt-5.3-codex": {
  "variants": {
    "high": {
      "reasoningEffort": "high"
    }
  }
}
```

then the spawned subagent should use the `high` variant's effective options at runtime.

Actual behavior in `v1.4.0`:

- `opencode debug config` shows the subagent has the expected `variant`
- `opencode debug agent gsd-code-reviewer` also shows the resolved variant-derived options
- but when the subagent is invoked through the task/subagent path, the actual runtime behavior does not reflect the configured reasoning level

This was previously working in `v1.3.17`.

What I verified:

1. Config parsing is correct
   - `opencode debug config` shows the subagent config correctly
   - `opencode debug agent gsd-code-reviewer` shows the resolved values including the variant-derived options
2. This is not a config merge issue
   - I verified both global config and project config resolution
   - The final resolved config is correct
3. This seems specific to subagent runtime
   - Running a subagent

> *[Truncado — 3676 chars totais]*

---

## #21628 — sdk: server.close() does not terminate underlying opencode process when run via wrappers (e.g., Deno)

📅 `2026-04-09` | ✏️ **sigmaSd** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21628](https://github.com/anomalyco/opencode/issues/21628)


### Description

Currently, calling server.close() in the SDK only terminates the immediate process wrapper (like deno) but leaves the actual opencode binary running as an orphaned process. This results in the network port remaining occupied and requiring manual cleanup (e.g., fuser -k).

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21625 — OpenCode 1.4.0 rewrites `package-lock.json` for local plugin dependencies (despite `bun.lock`)

📅 `2026-04-09` | ✏️ **dkarter** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21625](https://github.com/anomalyco/opencode/issues/21625)


### Description


Hi! I ran into something a little confusing with local plugin dependency installs and wanted to check if this is intentional:

The plugin docs still say local plugin dependencies use `bun install` at startup, but on OpenCode `1.4.0` I can reproduce behavior that looks npm-based instead.



### What I expected

I expected one of these:

- local plugin dependencies still use Bun, matching the docs
- ideally respect the existing `bun.lock` file
- (or) the docs reflect the current npm-based behavior


> [!NOTE]
> Personally, I would also love for this to be configurable if possible. I still prefer using Bun, and right now the generated `package-lock.json` is conflicting with my `bun.lock` which feels weird.

### Docs reference

The current plugins docs still say:

> OpenCode runs `bun install` at startup to install these.

https://opencode.ai/docs/plugins/#how-plugins-are-installed

---

If this change was intentional, would you be open to either documenting it more clearly or better yet, making the package manager configurable for local plugin dependencies?

I'm happy to open a PR for either if you're interested


### Plugins

Workmux/self written plugins

### OpenCode version

1.4.0

### Steps to reproduce

### Repro

1. Put a local plugin config under `~/.config/opencode` (I use `bun` so on install it creates `bun.lock`)
2. Add a `package.json` there for local plugin dependencies.
3. Remove `node_modules` from that directory.
4. Run `opencode run "test" --pri

> *[Truncado — 1981 chars totais]*

---

## #21622 — attach --dir fails to rediscover sessions for directories containing '-'

📅 `2026-04-09` | ✏️ **christian-taillon** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21622](https://github.com/anomalyco/opencode/issues/21622)


### Description

### Description

`opencode attach --dir` appears to handle some directory paths incorrectly when the target path contains `-`.

I found two correlated behaviors:

1. path/tab completion behaves incorrectly for directories containing `-`
2. after attaching to those directories, `/sessions` does not show existing sessions on reconnect

For other directories, `attach --dir` and `/sessions` behave normally.

What works:
- `opencode attach --dir /some/normalpath`
- do work
- disconnect
- reconnect
- `/sessions` works as expected

What fails:
- `opencode attach --dir /some/path-with-dash`
- do work
- disconnect
- reconnect with the same `--dir`
- `/sessions` shows no sessions

Important detail:
- if I already know the session ID, reconnecting with:
  `opencode attach --dir /some/path-with-dash -s ses_xxx`
  works

So the session still exists, but directory-based rediscovery/listing appears to fail for paths containing `-`.

This looks like a path parsing or directory matching bug rather than session loss.

### Operating System

### Additional context

Also observed:
- tab auto-complete/path completion behaves incorrectly for directories containing `-`
- this seems correlated with the directories where `/sessions` fails after `attach --dir`
- directories without `-` do not appear to have this problem

### Plugins

None (tested with all plugins and MCP Servers removed from config)

### OpenCode version

1.4.0

### Steps to reproduce


### Steps to reproduce

1. Start

> *[Truncado — 2059 chars totais]*

---

## #21612 — Agent often fails to send messages effectively. Multiple attempts may eventually succeed in sending them.

📅 `2026-04-09` | ✏️ **Dev-Flo200** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21612](https://github.com/anomalyco/opencode/issues/21612)


### Description

Currently, I'm using version 1.4.0. For instance, when analyzing documents, the Agent only shows the message sent but there's no response. It takes sending the message 5 or 6 times consecutively before the LLM's response is displayed. I'm not sure if it's just my issue, but this situation didn't occur in version 1.3.5 before.

### Plugins

No plugins have been installed after the agent was installed.

### OpenCode version

1.4.0

### Steps to reproduce

I just encountered it during normal use, and I can't confirm the reproduction conditions yet.


### Screenshot and/or share link

<img width="1221" height="554" alt="Image" src="https://github.com/user-attachments/assets/03f2d274-7bd7-4dfc-b7c9-0c8a29f18f6a" />

### Operating System

windows 11 pro

### Terminal

PowerShell 7.5.5 (Core Edition)

---

## #21609 — Plugin can't upgrade with @lastest

📅 `2026-04-09` | ✏️ **LiuKexin255** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21609](https://github.com/anomalyco/opencode/issues/21609)


### Description

I can't use `opencode plugins oh-my-opencode@latest` to upgrade omo from 3.15.3 to 3.16.0. I can only manually install the specified version and specify the version in the `opencode.json`

### Plugins

oh-my-opencode

### OpenCode version

1.4.0

### Steps to reproduce

1. Use `opencode plugins oh-my-opencode@latest`. Nothing happened, still 3.15.3.
2. I remove `~/.cache/opencode/packages/oh-my-opencode@latest` and repeate install with `@latest`. It' still 3.15.3
3. Use `opencode plugins oh-my-opencode@3.16.0` and specify opencode@3.16.0 in `opencode.json`. That's work, opencode and omo are runing ok.

### Screenshot and/or share link

_No response_

### Operating System

ubuntu 24.02

### Terminal

_No response_

---

## #21591 — MCP servers with outputSchema in tools/list break tool discovery

📅 `2026-04-09` | ✏️ **claygeo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21591](https://github.com/anomalyco/opencode/issues/21591)


## Bug Description

When an MCP server returns `outputSchema` in its `tools/list` response, opencode shows "Failed to get tools" and the server becomes unusable. The `outputSchema` field is valid per MCP spec (protocol version 2025-06-18).

## Steps to Reproduce

1. Configure an MCP server that returns tools with `outputSchema` in the tool definition
2. Start opencode
3. Observe "Failed to get tools" for that server

## Expected Behavior

Tools should load successfully. opencode doesn't use `outputSchema` — it only reads `inputSchema` in `convertMcpTool()`.

## Actual Behavior

The entire `listTools()` call fails because `cacheToolMetadata()` calls `AjvJsonSchemaValidator.getValidator(tool.outputSchema)`, and if AJV can't compile the schema (unsupported keywords, complex schemas), it throws an unhandled error.

## Root Cause

`AjvJsonSchemaValidator.getValidator()` in the MCP SDK calls `ajv.compile(schema)` with no try/catch. The error propagates through `listTools()` → caught by opencode's `defs()` → returns `undefined` → "Failed to get tools".

## Environment

- opencode version: latest (dev branch)
- MCP SDK: v1.27.1
- OS: any

---

## #21581 — Windows can't load model list and dialog list

📅 `2026-04-08` | ✏️ **wx-11** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21581](https://github.com/anomalyco/opencode/issues/21581)


### Description

<details>
<summary>Original Chinese text</summary>

使用window 和 MacOS 相同配置 Mac正常使用 window经常会加载不出模型列表和对话列表 需要我怎么做

</details>

Using the same configurations for window and macOS the Mac works fine and window often fails to load the model list and dialog list, what do I need to do?

### Plugins

_No response_

### OpenCode version

all versions

### Steps to reproduce
<details>
<summary>Original Chinese text</summary>

打开程序 - 等待加载 - 加载不出模型和对话 0可能等待十几分钟会出现 有时候没有右下角的报错

</details>

Open the program - wait for it to load - no models and dialogs loaded 0 may wait ten minutes or so for it to appear Sometimes there is no error in the lower right corner
### Screenshot and/or share link

<img width="2560" height="1368" alt="Image" src="https://github.com/user-attachments/assets/33d9d2a0-9eb8-4c35-981b-00ed9fd5916c" />

### Operating System

Windows 11

---

## #21580 — Web UI: Tool call details disappear upon dismissal

📅 `2026-04-08` | ✏️ **kentonv** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21580](https://github.com/anomalyco/opencode/issues/21580)


### Description

If the agent asks me a question, and I dismiss the question, the question disappears entirely. I can no longer see what the agent asked.

If the agent wants to run a shell command, and I deny the permission, I only see "Shell Failed: The user rejected permission to use this specific tool call." I can no longer see what shell command the agent tried to perform.

In both cases I really want to see the thing I dismissed, since I typically want to instruct the agent to do something slightly different.

### Plugins

none

### OpenCode version

1.4.0

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 24.04

### Terminal

Web UI

---

## #21568 — POST /session ignores explicit id so duplicate-id handling is unreachable

📅 `2026-04-08` | ✏️ **sjawhar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21568](https://github.com/anomalyco/opencode/issues/21568)


### Description
`POST /session` accepts an explicit `id` in the typed API surface, but the server-side session create path ignores it. That makes duplicate-ID hardening unreachable: creating the same explicit session id twice returns 200 twice instead of 200 then 409.

The server already exposes `DuplicateIDError` / 409 handling, but `Session.create` does not pass `id` through to the underlying session creation flow.

### Plugins
_No response_

### OpenCode version
0.0.0--202604082020 (reproduced on built local binary)

### Steps to reproduce
1. Start the built server with basic auth enabled.
2. `POST /session` with body `{ "id": "ses_duplicate_smoke", "title": "one" }`.
3. Repeat the same request with the same `id`.
4. Observe that the second request succeeds instead of returning `409 DuplicateIDError`.

### Screenshot and/or share link
_No response_

### Operating System
Ubuntu 24.04

### Terminal
Ghostty

---

## #21562 — Bug: VS Code plugin not working with Python plugin (venv)

📅 `2026-04-08` | ✏️ **pksiazek** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21562](https://github.com/anomalyco/opencode/issues/21562)


### Description

There is race condition to write to terminal after using OpenCode plugin.
OpenCode plugin sends text first (starts opencode)
Then Python plugin sends text (activates venv).
And this is killing opencode process.

### Plugins

-

### OpenCode version

1.3.17

### Steps to reproduce

1. Open VS Code
2. Install OpenCode plugin
3. Install Python plugin
4. Create project with venv
5. Click Opencode icon

### Screenshot and/or share link

<img width="558" height="177" alt="Image" src="https://github.com/user-attachments/assets/fb9d64ac-9a18-44db-a11c-e0302b5afb63" />

### Operating System

Windows 11 + WSL

### Terminal

_No response_

---

## #21557 — Bug: Shared OpenCode host keeps per-directory MCP child processes alive on Windows after switching routed directories/worktrees

📅 `2026-04-08` | ✏️ **VooDisss** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21557](https://github.com/anomalyco/opencode/issues/21557)


## Description

On Windows, a shared OpenCode host does not clean up old MCP child processes when switching between routed directories/worktrees.

After using MCP in directory A and then directory B, I still see both `mcp-server.exe` processes alive under one `opencode.exe`, even after `mcp.disconnect(...)` or `instance.dispose()` for the previous directory. This keeps the executable locked and blocks rebuilds.

## Steps to reproduce

1. Start one shared OpenCode host.
2. Use MCP in directory A.
3. Switch to directory B and use MCP there.
4. Dispose or disconnect the previous directory instance.
5. Check running processes.

## Expected behavior

The old MCP child exits.

## Actual behavior

The old MCP child stays alive.

## Notes

The host itself is not exiting here. I attached a markdown file with more detailed investigation.

[opencode-shared-host-mcp-lifecycle-issue.md](https://github.com/user-attachments/files/26578406/opencode-shared-host-mcp-lifecycle-issue.md) - more context for your agents inside.

---

## #21554 — Title: (OpenCode-Desktop) Open Project no longer detects manually created git worktrees as workspaces, and stale workspace entries cannot be removed on macOS

📅 `2026-04-08` | ✏️ **matiasBarrera98** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21554](https://github.com/anomalyco/opencode/issues/21554)


### Description

I'm seeing two related problems with manually managed git worktrees in OpenCode Desktop on macOS.

The project has workspaces enabled.

1. If I create a git worktree manually outside of OpenCode and then open that folder in OpenCode Desktop using `Open Project`, OpenCode no longer detects it as a worktree and does not add it as a workspace.
2. If I later delete that worktree manually, the corresponding workspace entry can remain in OpenCode Desktop and I can no longer remove that workspace from the app.

This used to work before, so this appears to be a regression in workspace/worktree detection and cleanup.

### Expected behavior

- When opening a manually created git worktree via `Open Project`, OpenCode Desktop should detect it as a worktree and add it as a workspace
- If a worktree no longer exists on disk, OpenCode Desktop should either automatically remove the stale workspace entry or allow the user to remove it manually

### Actual behavior

- `Open Project` no longer detects manually created git worktrees as workspaces
- After deleting a worktree manually, a stale workspace entry can remain
- That stale workspace can become undeletable from the app

Possibly related:
- #18414
- #19085

### Plugins

_No response_

### OpenCode version

1.4.0

### Steps to reproduce

1. Enable workspaces for the project
2. Open a git repo in OpenCode Desktop on macOS
3. Create a git worktree manually outside of OpenCode, for example:
   `git worktree add ../my-feature -

> *[Truncado — 2055 chars totais]*

---

## #21552 — WebUI does not show OpenCode Zen as connected even though /provider reports it as connected

📅 `2026-04-08` | ✏️ **TiaraBasori** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21552](https://github.com/anomalyco/opencode/issues/21552)


## Description
In the WebUI, the provider binding status for OpenCode Zen appears to be inconsistent with the backend state.

`/provider` returns `connected` including `opencode`, which indicates the provider is actually connected. However, the WebUI does not render OpenCode Zen as bound/connected.

From inspection, the UI seems to depend not only on `/provider`, but also on `/provider/auth` for auth metadata. The problem is that `/provider/auth` does not include `opencode`, so the UI ends up showing it as not connected.

Additionally, visiting `/provider/opencode/auth` returns a full HTML page instead of provider auth metadata, which also suggests the auth display path for `opencode` is not wired correctly.

So this looks like a frontend state/rendering bug or an API contract mismatch, not an actual provider connection failure.

## Plugins
None

## OpenCode version
1.3.15

## Steps to reproduce
1. Connect/configure OpenCode Zen successfully so that the backend reports it as connected.
2. Open the WebUI provider/settings page.
3. Observe that OpenCode Zen is still not shown as bound/connected.
4. Check `/provider` and confirm `connected` includes `opencode`.
5. Check `/provider/auth` and confirm it does not include `opencode`.
6. Visit `/provider/opencode/auth` and observe it returns an HTML page instead of auth metadata.

## Screenshot and/or share link
No screenshot attached.

## Operating System
Debian GNU/Linux 13 (trixie)

## Terminal
dumb

---

## #21534 — Agent stopping after seconds/minutes of starting a task

📅 `2026-04-08` | ✏️ **josevelaz** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21534](https://github.com/anomalyco/opencode/issues/21534)


### Description

**Summary**
When running a long-running task in OpenCode, the agent appears to stop unexpectedly after a few seconds to a few minutes. Before stopping, it often prints the current todo list, then halts without completing the task or clearly indicating why it stopped.

**Expected behavior**
The agent should continue working through the task until it either:

* completes successfully
* encounters an explicit error
* requests user input
* hits a defined timeout, limit, or cancellation state with a clear message

**Actual behavior**
The agent starts normally, works for a short period, prints or shows the current todo list, and then stops abruptly. It does not seem to resume, continue execution, or provide a clear failure reason.

**Frequency**
Happens consistently or frequently during longer-running tasks.

**Impact**
This makes long-running or multi-step tasks unreliable because the agent exits before finishing, even when it appears to still have pending todo items.

**Additional notes**

* The stop happens after anywhere from a couple of seconds to a few minutes
* It seems more likely during long-running tasks
* The last visible output is often the current todo list
* There is no obvious error message explaining why execution stopped

### Plugins

opencode-weave, opencode-dcp

### OpenCode version

1.3.17

### Steps to reproduce


1. Start OpenCode
2. Give the agent a longer-running task
3. Let it run for a bit
4. Observe that after a short time, it prints the 

> *[Truncado — 1907 chars totais]*

---

## #21474 — [BUG]: Project name in top-left corner resets after restart

📅 `2026-04-08` | ✏️ **dadadedahuamao** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21474](https://github.com/anomalyco/opencode/issues/21474)


﻿- [x] I have searched the existing issues and confirmed this bug hasn't been reported before.

---

### Describe the bug

The project name displayed in the top-left corner of the sidebar cannot be modified persistently. After renaming the project and restarting the application, the name automatically reverts to the original value.

**To Reproduce:**
1. Open OpenCode v1.4.0
2. Click on the project name in the top-left corner of the sidebar
3. Edit the project name to a new value
4. Save the change
5. Restart the application
6. Observe that the project name has reverted to the original value

**Expected behavior:**
The project name should persist after modification and remain unchanged after application restart.

**Screenshots:**
See attached image showing the project name area in the sidebar.

**Environment:**
- OS: Windows 11
- Version: 1.4.0

---

## #21468 — Plugin install fails with valid proxy env: fetch() proxy.url must be a non-empty string

📅 `2026-04-08` | ✏️ **vanish1984** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21468](https://github.com/anomalyco/opencode/issues/21468)


### Description

### Summary

When `plugin` is configured with a package name such as `oh-my-openagent`, OpenCode 1.4.0 fails during plugin installation on macOS with:

```text
request to https://registry.npmjs.org/oh-my-openagent failed, reason: fetch() proxy.url must be a non-empty string
```

The proxy environment in the shell is valid. As a result the plugin is not loaded, custom agents are not registered, and OpenCode falls back to the default agent.

### Environment

- OpenCode: `1.4.0`
- OS: macOS
- Node.js: `v22.21.1`
- Bun: `1.3.6`
- Proxy env in shell:
  - `http_proxy=http://127.0.0.1:7890`
  - `https_proxy=http://127.0.0.1:7890`

### Reproduction

1. Configure OpenCode with a package-name plugin entry:

```json
{
  "plugin": ["oh-my-openagent"]
}
```

2. Ensure the shell has valid proxy vars set, for example:

```sh
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
```

3. Run:

```sh
opencode --print-logs run --agent sisyphus "return exactly: plugin-check-ok"
```

### Expected

OpenCode should install or load the plugin successfully and the `sisyphus` agent should be available.

### Actual

OpenCode logs:

```text
INFO  service=plugin path=oh-my-openagent loading plugin
INFO  service=npm pkg=oh-my-openagent@latest installing package
ERROR service=plugin pkg=oh-my-openagent version=latest error=request to https://registry.npmjs.org/oh-my-openagent failed, reason: fetch() proxy.url must be a non-empty string failed to install plugin
! 

> *[Truncado — 2630 chars totais]*

---

## #21441 — SortableWorkspace session list empty due to store.path.directory not bootstrapped

📅 `2026-04-08` | ✏️ **chenyy9527** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/21441](https://github.com/anomalyco/opencode/issues/21441)


### Description

Session list is completely empty on Windows web UI. Skeleton briefly appears on refresh then disappears. Verified via DevTools that `GET /session?directory=...&roots=true` returns sessions correctly, so this is a client-side store management issue caused by directory format mismatch creating duplicate child stores. `child-store.ts` creates separate stores for the same physical directory when path formats differ (`D:/...` vs `D:\...`), exceeding `MAX_DIR_STORES=30` and triggering eviction. `loadSessions` writes to a disposed store — session data is lost entirely.



### Plugins

none

### OpenCode version

0.0.0-dev-202604080233 source build (`dev` branch)

### Steps to reproduce

1. Open web UI on Windows
2. Have multiple projects or switch between sessions
3. Observe session list is empty
4. DevTools Network shows API returns sessions but sidebar renders none

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Git Bash

---

## #21421 — Bug: Built-in terminal fails to initialize in Desktop v1.4.0 (Windows 10)

📅 `2026-04-08` | ✏️ **hongenge** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21421](https://github.com/anomalyco/opencode/issues/21421)


### Description

In the Desktop version v1.4.0, the built-in terminal is completely unusable on Windows 10 because it fails to initialize.


### OpenCode version

v1.4.0

### Steps to reproduce

1. Launch OpenCode Desktop v1.4.0 on a Windows 10 system.
2. Attempt to access or open the integrated terminal.
3. The terminal interface appears, but it hangs indefinitely during the initialization phase.


### Operating System

Windows 10

---

## #21419 — When using OpenCode with the MLX VLM server running `gemma-4-26b-a4b-it-4bit`, the model fails to cache the OpenCode system prompt. This causes the system prompt to be reloaded on every operation, resulting in inefficient performance.

📅 `2026-04-08` | ✏️ **qcy961011** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21419](https://github.com/anomalyco/opencode/issues/21419)


### Description
When using OpenCode with the MLX VLM server running `gemma-4-26b-a4b-it-4bit`, the model fails to cache the OpenCode system prompt. This causes the system prompt to be reloaded on every operation, resulting in inefficient performance.
### Expected Behavior
The system prompt should be cached after the first request to improve performance and reduce redundant processing.
### Actual Behavior
- The system prompt is **not cached** between requests
- Every operation triggers a **full reload** of the system prompt
- This significantly impacts response time and resource usage
### Environment Details
**MLX VLM Server:**
- Model: `gemma-4-26b-a4b-it-4bit`
- MLX version: 0.31.1
- MLX-LM version: 0.31.2
- MLX-VLM version: 0.31.2
- Server command: `python3 -m mlx_vlm.server \
    --model "$MODEL_PATH" \
    --host "$HOST" \
    --port "$PORT" \
    --prefill-step-size "512" \
    --max-kv-size "131072" \
    --trust-remote-code`

**OpenCode:**
- Version: v1.3.13
- Platform: macOS 26.4
- Terminal: iTerm2
### Model Configuration
```json
{
  "gemma-4-26b-a4b-it": { 
    "name": "gemma-4-26b-a4b-it",
    "limit": {
      "context": 131072,
      "output": 131072
    }
  }
}
```
Server Parameters:
- Context window: 128K
- Temperature: 1.0
- Top-k: 64
- Repeat penalty: 1.1
- Top-p: 0.95
- Min-p: 0.0
- Flash attention: enabled
- KV cache quantization: disabled
Steps to Reproduce
1. Start the MLX VLM server with Gemma-4-26b-a4b-it-4bit model
2. Configure the model in opencode.json

> *[Truncado — 2628 chars totais]*

---

## #21403 — Fix incorrect model ID for Gemma 4 26B (missing a4b suffix)

📅 `2026-04-08` | ✏️ **marand85** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21403](https://github.com/anomalyco/opencode/issues/21403)


### Description

The current configuration for the Gemma 4 26B model uses an incorrect identifier, which prevents the model from loading correctly unless manually patched.
Problem:
The model ID is currently set to gemma-4-26b-it, but the correct ID required by the backend/API is gemma-4-26b-a4b-it.
Evidence/Fix:
I have verified that manually editing the local configuration file at ~/.cache/opencode/models.json resolves the issue. Current (Incorrect)
Config:
"gemma-4-26b-it": {
  "id": "gemma-4-26b-it",
  "name": "Gemma 4 26B",
  ...
}
Required (Corrected) Config:
json
"gemma-4-26b-a4b-it": {
  "id": "gemma-4-26b-a4b-it",
  "name": "Gemma 4 26B A4B",
  ...
}

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

Try to initialize or use the gemma-4-26b-it model.
Observe the failure/error due to the incorrect ID.
Manually update models.json with the a4b suffix.
The model becomes fully functional.
Environment:
Config path: ~/.cache/opencode/models.json
Model family: Gemma 4

### Screenshot and/or share link

_No response_

### Operating System

debian on WSL

### Terminal

bash

---

## #21373 — "Failed to get tools" when MCP server returns outputSchema in tools/list response

📅 `2026-04-07` | ✏️ **amat27** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21373](https://github.com/anomalyco/opencode/issues/21373)


### Description

Description
opencode v1.3.17 fails to load tools from MCP servers whose tools/list response includes the outputSchema field on tool definitions. The server is marked as failed with "Failed to get tools".
outputSchema is a valid optional field in the MCP specification and is defined in the bundled SDK's ToolSchema.

Steps to Reproduce
1. Set up any MCP server (stdio transport) that returns outputSchema on its tools in the tools/list response
2. Configure it in opencode as a local MCP server
3. Start opencode — the server fails with "Failed to get tools"

Observed Behavior
- The MCP server starts, initialize handshake completes successfully
- tools/list returns a valid response with all tools
- opencode immediately closes the connection after receiving the response
- Server is marked as failed

Expected Behavior
Tools should load successfully. Removing outputSchema from the response (via a wrapper script) resolves the issue — all tools load and work correctly.

Environment
- opencode: v1.3.17
- OS: Windows 11
- MCP transport: stdio (local)
- Server protocol version: 2025-06-18
- Bundled @modelcontextprotocol/sdk: v1.27.1

### Plugins

_No response_

### OpenCode version

1.3.17

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

windows 11

### Terminal

windows terminal

---

## #21372 — Session File Change Summary Not Isolated Per Session

📅 `2026-04-07` | ✏️ **PVLPM** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21372](https://github.com/anomalyco/opencode/issues/21372)


### Description

When multiple OpenCode sessions are active simultaneously and AI agents within those sessions edit files, the **file change summary is not isolated per session**. Each session's summary displays ALL file modifications across ALL active sessions, rather than only showing files edited within that specific session.

### Expected Behavior

Each session should only display file changes made by agents running within that specific session. The file change summary should be session-isolated.

### Actual Behavior

The file change summary aggregates changes from all active sessions, causing confusion about which files were actually modified by which session's agents.

### Environment

- Multiple active OpenCode sessions
- AI agents editing files in parallel across sessions

### Additional Context

The system appears to track which files AI agents have edited within a session (since we know what files were changed), but the summary view does not respect session boundaries.

### Plugins

oh-my-openagent

### OpenCode version

1.3.17

### Steps to reproduce

1. Have Session A active (working on Feature X)
2. Have Session B active (working on Feature Y)
3. AI agents in Session B edit files (e.g., `src/ads/AdMob.ts`)
4. Observe Session A's file change summary - it shows `AdMob.ts` even though Session A's agents never touched that file

### Screenshot and/or share link

<img width="1120" height="1161" alt="Image" src="https://github.com/user-attachments/assets/5093bd82-a09d-

> *[Truncado — 1722 chars totais]*

---

## #21367 — batch can drift from active turn tool filtering

📅 `2026-04-07` | ✏️ **GuestAUser** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21367](https://github.com/anomalyco/opencode/issues/21367)


### Description

`batch` resolves executable tools independently from the active turn filter, so batched execution can disagree with the tool set the model actually saw.

Observed failure modes:
- `batch` can miss model-gated tools such as `apply_patch` when the active model would expose them
- `batch` can attempt subcalls that were not exposed in the current turn

This is related to, but distinct from, #16028. That issue is about permission aliasing for `apply_patch`; this one is about `batch` drifting from the active turn's model-specific and per-turn-filtered tool set.

### Plugins

None

### OpenCode version

Current `dev` branch behavior prior to PR #21366

### Steps to reproduce

1. Start a turn where `SessionPrompt` exposes a filtered tool set to the model
2. Use a GPT-5-style patch flow where `apply_patch` is available for the active turn
3. Call `batch` with an `apply_patch` subcall
4. Observe that `batch` resolves tools independently from the turn context instead of using the active `{ providerID, modelID }` and turn allowlist

### Screenshot and/or share link

N/A

### Operating System

Linux

### Terminal

bash

---

## #21327 — Plugin installation fails: "fetch() proxy.url must be a non-empty string" even with proxy disabled

📅 `2026-04-07` | ✏️ **wenzihong99-alt** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21327](https://github.com/anomalyco/opencode/issues/21327)


### Description

## Description
OpenCode Desktop fails to install plugins with the error:
`fetch() proxy.url must be a non-empty string`

This happens even when:
- Windows system proxy is disabled (ProxyEnable = 0)
- VPN software is turned off
- WinHTTP proxy shows "Direct access (no proxy server)"

## Environment
- OS: Windows 10/11
- OpenCode Desktop version: 1.3.17
- Proxy: Disabled

## Log excerpt
ERROR service=plugin pkg=oh-my-opencode version=latest error=request to https://registry.npmjs.org/oh-my-opencode failed, reason: fetch() proxy.url must be a non-empty string failed to install plugin

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

## Steps to reproduce
1. Install OpenCode Desktop on Windows
2. Configure plugins in opencode.json
3. Disable all proxy settings in Windows
4. Restart OpenCode Desktop
5. Check logs - plugins fail to load

## Expected behavior
Plugins should install successfully when proxy is disabled.

## Actual behavior
All plugins fail with proxy.url error regardless of proxy configuration.

## Workaround
Using OpenCode CLI works fine.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21310 — Model selections in the Model Choice tab reset after restarting the web app

📅 `2026-04-07` | ✏️ **fXssbowers** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21310](https://github.com/anomalyco/opencode/issues/21310)


## Bug Description

Every time I restart and reopen a new session in the web app, all pre-selected models in the Model Choice tab disappear and I have to re-choose them from scratch.

## Steps to Reproduce

1. Open opencode web app
2. Select multiple models in the Model Choice tab
3. Close/restart the session
4. Reopen a new session
5. Selected models are gone

## Expected Behavior

Model selections should persist across sessions.

## Environment

- **Interface:** Web app
- **OS:** macOS

## Workaround

Setting a default model via `model` in `opencode.json` pins the primary model, but this doesn't help with multiple model selections in the picker.

---

## #21297 — Edit tool fails to add trailing newline when creating new files (oldString === "")

📅 `2026-04-07` | ✏️ **dosmanak** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21297](https://github.com/anomalyco/opencode/issues/21297)


When using the Edit tool to create new files (with oldString === ""), the tool writes the newString content exactly as provided without ensuring the file ends with a newline character.

## Problem Details
In packages/opencode/src/tool/edit.ts (https://github.com/anomalyco/opencode/blob/3c96bf84688fa5e56977a1ff95a0b920f1749983/packages/opencode/src/tool/edit.ts#L37), the new file creation path (lines ~55-65) handles the case where params.oldString === "":
```
if (params.oldString === "") {
  const existed = await Filesystem.exists(filePath)
  contentNew = params.newString
  // ...
  await Filesystem.write(filePath, params.newString)  // ← No EOF newline handling
```
Unlike the existing file modification path which preserves line ending behavior through detectLineEnding() and convertToLineEnding(), the new file creation path performs no EOF newline validation or enforcement.

## Expected Behavior
When creating new files via the Edit tool, the content should automatically have a trailing newline added if one is not present, ensuring consistency with the project's coding standards.
## Current Behavior  
New files are created with exactly the content provided in newString, regardless of whether it ends with a newline.

## Proposed Solution
Add EOF newline enforcement in the new file creation path, similar to how existing file edits handle line endings:
```
if (params.oldString === "") {
  // ... existing code ...
  let contentToWrite = params.newString
  if (!contentToWrite.endsWi

> *[Truncado — 1805 chars totais]*

---

## #21296 — TUI startup is blocked by GitHub Copilot model fetch timeout

📅 `2026-04-07` | ✏️ **xqm32** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21296](https://github.com/anomalyco/opencode/issues/21296)


_This issue description was prepared with AI assistance using OpenCode and the `github-copilot/gpt-5.4` model, and reviewed before filing._

## Summary

TUI startup currently waits on `provider.list()` during bootstrap. For GitHub Copilot, that path includes a request to the remote `/models` endpoint. If that endpoint is slow or unreachable, startup is delayed until the hardcoded timeout is hit.

The request does fall back to the existing model list after failure, but the timeout still happens on the startup path, which makes TUI responsiveness depend on Copilot network conditions even before the user opens any provider or model UI.

## What happens

During TUI bootstrap, `sdk.client.provider.list()` is included in the blocking requests:

- `packages/opencode/src/cli/cmd/tui/context/sync.tsx:370`
- `packages/opencode/src/cli/cmd/tui/context/sync.tsx:377-385`

That request reaches the server `/provider` route, which calls `Provider.list()`:

- `packages/opencode/src/server/routes/provider.ts:54`

Inside provider initialization, plugin `provider.models(...)` hooks are executed:

- `packages/opencode/src/provider/provider.ts:1250-1264`

For the GitHub Copilot plugin, that hook calls `CopilotModels.get(...)`, which fetches the remote models endpoint:

- `packages/opencode/src/plugin/github-copilot/copilot.ts:50-57`
- `packages/opencode/src/plugin/github-copilot/models.ts:108-121`

Current fetch logic:

```ts
const data = await fetch(`${baseURL}/models`, {
  headers,
  signal: Abo

> *[Truncado — 3941 chars totais]*

---

## #21293 — Plugin child_process.spawn() stdin.write() data never reaches child process

📅 `2026-04-07` | ✏️ **RobinVivant** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21293](https://github.com/anomalyco/opencode/issues/21293)


## Bug Report

Apologies in advance - I'm filing this with AI assistance as I don't have the bandwidth to debug this further myself.

### Environment

- OpenCode: v1.3.10 (30e609e0)
- OS: Debian (Linux 6.1), 2 vCPU Intel Xeon, 3.7GB RAM
- Plugin: `@cortexkit/aft-opencode@0.9.1`

### Problem

The AFT plugin spawns a Rust binary (`aft`) via `child_process.spawn()` with `stdio: ["pipe", "pipe", "pipe"]`, then sends NDJSON commands over stdin. The binary never receives the data - it sits in `unix_stream_data_wait` (blocked on stdin read) indefinitely, causing a 30s timeout.

The bridge's `stdin.write()` callback reports success (no error), but the data never arrives at the child process.

### Reproduction

The issue is **specific to OpenCode's embedded JS runtime**. The exact same bridge code works perfectly under both Bun and Node.js:

```javascript
// This works under Bun and Node.js, but NOT inside OpenCode's plugin runtime
import { spawn } from "node:child_process";

const child = spawn("/path/to/aft", [], {
  cwd: "/home/user",
  stdio: ["pipe", "pipe", "pipe"],
});

const req = JSON.stringify({id: "1", command: "configure", project_root: "/home/user"}) + "\n";
child.stdin.write(req); // succeeds, but data never reaches child
```

**Direct test** (binary responds instantly):
```
$ echo '{"id":"1","command":"configure","project_root":"/home/user"}' | /path/to/aft
{"id":"1","success":true,"project_root":"/home/user"}
```

**Bun test** (works, < 1 second response):
```
$ bun te

> *[Truncado — 2885 chars totais]*

---

## #21283 — OpenCode read tool doesn't have a filesize check.

📅 `2026-04-07` | ✏️ **drkaangunduz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21283](https://github.com/anomalyco/opencode/issues/21283)


### Description

OpenCode can try to read a file without checking its size, especially media files. Once they are read, they are in the context, thus sending it to a provider that has limits will cause the session to grind or error.



### Plugins

_No response_

### OpenCode version

1.3

### Steps to reproduce

Ask the agent to read a big image file

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21282 — Downloaded superpowers plugin but /skills command doesn't show available skills

📅 `2026-04-07` | ✏️ **hub-rb** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/21282](https://github.com/anomalyco/opencode/issues/21282)


### Description

I downloaded the superpowers plugin, but when running the /skills command, I cannot see the corresponding skills and cannot use the skills provided by this plugin. The plugin is configured in opencode.json, but the skills directory only contains two other skills (apifox-importer, skill-creator), and there are no superpowers-related skill files.

### Plugins

superpowers@git+https://github.com/obra/superpowers.git

### OpenCode version

@opencode-ai/plugin 1.3.17

### Steps to reproduce

1. Configure the superpowers plugin in opencode.json
2. Restart OpenCode
3. Run /skills command
4. Observe the skills list - no superpowers-related skills are visible

<img width="707" height="176" alt="Image" src="https://github.com/user-attachments/assets/c35aee98-cf54-45e1-b525-19047e979cf6" />

### Screenshot and/or share link

<img width="417" height="230" alt="Image" src="https://github.com/user-attachments/assets/e38d1398-0f60-4d6c-971b-83608e9a441a" />

<img width="621" height="160" alt="Image" src="https://github.com/user-attachments/assets/641c7a78-f7ed-49ca-aba3-085a10307d1e" />

### Operating System

Windows 11 (Build 22621)

### Terminal

Windows PowerShell 5.1 (Build 22621.2506)

---
