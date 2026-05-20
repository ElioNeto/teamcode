# 🐛 Bugs Críticos

> **Total:** 86 | Extraído em 2026-05-17 | 92 bugs removidos (resolvidos ou não aplicáveis)

---

## #27726 — opentui: fatal: The "path" property must be of type string, got object

📅 `2026-05-15` | ✏️ **LogicDaemon** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27726](https://github.com/anomalyco/opencode/issues/27726)


### Description

```
TypeError: The "path" property must be of type string, got object
    at isAbsolute (unknown)
    at AA0 (B:/~BUN/root/chunk-bd3pn3ks.js:531:49845)
    at Cd (B:/~BUN/root/chunk-1pjeh0g4.js:2:11279)
    at oa (B:/~BUN/root/chunk-1pjeh0g4.js:2:11060)
    at Dd (B:/~BUN/root/chunk-1pjeh0g4.js:2:10010)
    at x (B:/~BUN/root/chunk-1pjeh0g4.js:2:67672)
    at w (B:/~BUN/root/chunk-1pjeh0g4.js:2:67066)
    at <anonymous> (B:/~BUN/root/chunk-1pjeh0g4.js:2:67091)
    at Cd (B:/~BUN/root/chunk-1pjeh0g4.js:2:11279)
    at oa (B:/~BUN/root/chunk-1pjeh0g4.js:2:11060)
    at la (B:/~BUN/root/chunk-1pjeh0g4.js:2:4638)
    at w (B:/~BUN/root/chunk-1pjeh0g4.js:2:67083)
    at <anonymous> (B:/~BUN/root/chunk-1pjeh0g4.js:2:67091)
    at Cd (B:/~BUN/root/chunk-1pjeh0g4.js:2:11279)
    at oa (B:/~BUN/root/chunk-1pjeh0g4.js:2:11060)
    at la (B:/~BUN/root/chunk-1pjeh0g4.js:2:4638)
    at w (B:/~BUN/root/chunk-1pjeh0g4.js:2:67083)
    at Cd (B:/~BUN/root/chunk-1pjeh0g4.js:2:11279)
    at oa (B:/~BUN/root/chunk-1pjeh0g4.js:2:11060)
    at qa (B:/~BUN/root/chunk-1pjeh0g4.js:2:12858)
    at Xg (B:/~BUN/root/chunk-1pjeh0g4.js:2:14011)
    at j (B:/~BUN/root/chunk-1pjeh0g4.js:2:13027)
    at Jg (B:/~BUN/root/chunk-1pjeh0g4.js:2:13667)
    at j (B:/~BUN/root/chunk-1pjeh0g4.js:2:13039)
    at K (B:/~BUN/root/chunk-bd3pn3ks.js:467:5956)
    at V (B:/~BUN/root/chunk-bd3pn3ks.js:467:6083)
    at <anonymous> (B:/~BUN/root/src/index.js:363:5847)
    at <anonymous> (B:/~BUN/root/chunk-r8

> *[Truncado — 4527 chars totais]*

---

## #27724 — Agents have no awareness of MCPs that need auth

📅 `2026-05-15` | ✏️ **msvechla** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27724](https://github.com/anomalyco/opencode/issues/27724)


### Problem

When a remote MCP fails to connect with `UnauthorizedError`, teamcode sets its status to `needs_auth` and surfaces a toast pointing at the `/mcps` picker (or the `teamcode mcp auth` shell subcommand). However, the running agent has zero awareness that this MCP exists:

- `MCP.tools()` filters to `status === "connected"` clients only, so no tool from a `needs_auth` MCP reaches the agent's tool list.
- The system prompt does not enumerate configured MCPs.
- The agent therefore cannot reason about the MCP, cannot suggest authentication, and cannot trigger the OAuth flow on the user's behalf.

A user asking "use the mops-integration MCP and list rentals for X" gets a generic "I don't have that tool" response, with no path forward inside the conversation.

### Expected behaviour

The agent should know which MCPs are configured-but-unauthenticated and have a way to trigger the OAuth flow when the user asks.

### Reproduction

1. Configure a remote MCP with OAuth (e.g. any Keycloak-backed MCP).
2. Clear its tokens (delete `tokens` from `~/.local/share/teamcode/mcp-auth.json` for that MCP) and restart teamcode.
3. Ask the agent: "use <name> to <do something>".
4. The agent reports it doesn't have any tools matching `<name>`.

### Environment

- teamcode 1.14.48 (also reproduces against current `dev` HEAD).
- Any remote MCP with OAuth that returns `UnauthorizedError` on connect.

### Related

- #16893 — Remote MCP OAuth: browser never opens for re-authentication (the in-T

> *[Truncado — 1615 chars totais]*

---

## #27663 — Bug: prompt_async stops publishing message.part.delta events on second call (conversation continuation)

📅 `2026-05-15` | ✏️ **webster-yuan** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27663](https://github.com/anomalyco/opencode/issues/27663)


## Bug Description

When `prompt_async` is called a **second time** on the same session (conversation continuation / resume), `message.part.delta` events stop being published entirely. Only initial state sync events (`message.updated`, `message.part.updated`, `session.updated`) arrive, followed by nothing but heartbeats.

## Steps to Reproduce

1. Create a session and send the first `prompt_async` — observe `message.part.delta` events flowing normally on both `/event` and `/global/event`
2. After the first prompt completes (session idle), send a second `prompt_async` on the same session
3. Observe the SSE stream: only `message.updated` / `message.part.updated` / `session.updated` arrive, then **only `server.heartbeat`** — no `message.part.delta` ever

## Environment

- teamcode version: v1.14.50
- SSE endpoint tested: both `/event` (instance-level) and `/global/event`
- Same behavior on both endpoints

## What We have Ruled Out

1. **Not an SSE subscription layer issue**: We switched to `/global/event` (which uses `GlobalBus` — simple EventEmitter, no Effect fibers). Same problem persists. This means `Bus.publish()` is never called for deltas during the second prompt.
2. **Not a content complexity issue**: A simple task that completes in one turn works fine. A complex task that triggers multi-turn interaction (planning → questions → file writes) triggers the bug.
3. **Root cause is in the prompt execution pipeline**, not in SSE/bus subscription — `Bus.publish()` itself calls 

> *[Truncado — 2726 chars totais]*

---

## #27557 — Desktop sidecar exits silently with code 1 — third-party plugin's global uncaughtException handler calls process.exit(1) on any unhandled rejection in the sidecar

📅 `2026-05-14` | ✏️ **ottosulin** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27557](https://github.com/anomalyco/opencode/issues/27557)


## Summary

TeamCode Desktop's sidecar process exits silently with **code 1** anywhere from 30 seconds to ~10 minutes after `server ready`, with no stderr written to `~/Library/Logs/@teamcode-ai/desktop/main.log`. The Desktop UI then displays "server is dead". Repeats on every relaunch.

**Root cause traced**: a third-party teamcode plugin (`oh-my-openagent`) installs a global Node `process.on('uncaughtException', …)` handler that catches ANY unhandled rejection in the sidecar — including ones thrown by teamcode core itself — and unconditionally calls `process.exit(1)`. The plugin's maintainer has acknowledged this in [code-yeongyu/oh-my-openagent#3856](https://github.com/code-yeongyu/oh-my-openagent/issues/3856) (open, with proposed fixes) and the v4.1.1 regression specifically in [code-yeongyu/oh-my-openagent#3997](https://github.com/code-yeongyu/oh-my-openagent/issues/3997) (open).

I'm filing this against teamcode anyway because **the architecture that lets a single plugin's global error handler take down the entire sidecar with zero diagnostic surface is itself the bug to fix in teamcode**. Even after the upstream plugin fixes #3856, any future plugin can do the same thing and reproduce this exact failure.

A secondary, independent failure mode (concurrent SQLite access from a co-running CLI server) is documented further down — same observable symptom, different root cause, both worth fixing.

## Reproducing

### Reproduction A — silent crash from third-party plugin's gl

> *[Truncado — 14708 chars totais]*

---

## #27507 — opentui: fatal: undefined is not an object (evaluating 'U.matchAll')

📅 `2026-05-14` | ✏️ **z0rzi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27507](https://github.com/anomalyco/opencode/issues/27507)


### Description

```
TypeError: undefined is not an object (evaluating 'U.matchAll')
    at JM0 (/$bunfs/root/chunk-ygf5n0vq.js:524:46030)
    at Cd (/$bunfs/root/chunk-1p2a69ep.js:2:11279)
    at oa (/$bunfs/root/chunk-1p2a69ep.js:2:11060)
    at Dd (/$bunfs/root/chunk-1p2a69ep.js:2:10010)
    at <anonymous> (/$bunfs/root/chunk-1p2a69ep.js:2:21909)
    at <anonymous> (/$bunfs/root/chunk-1p2a69ep.js:2:17267)
    at Cd (/$bunfs/root/chunk-1p2a69ep.js:2:11279)
    at oa (/$bunfs/root/chunk-1p2a69ep.js:2:11060)
    at L (/$bunfs/root/chunk-1p2a69ep.js:2:5081)
    at I (/$bunfs/root/chunk-1p2a69ep.js:2:7764)
    at Cd (/$bunfs/root/chunk-1p2a69ep.js:2:11279)
    at oa (/$bunfs/root/chunk-1p2a69ep.js:2:11060)
    at Ld (/$bunfs/root/chunk-1p2a69ep.js:2:9123)
    at <anonymous> (/$bunfs/root/chunk-ygf5n0vq.js:524:48597)
    at I (/$bunfs/root/chunk-1p2a69ep.js:2:7764)
    at Cd (/$bunfs/root/chunk-1p2a69ep.js:2:11279)
    at oa (/$bunfs/root/chunk-1p2a69ep.js:2:11060)
    at Ld (/$bunfs/root/chunk-1p2a69ep.js:2:9123)
    at <anonymous> (/$bunfs/root/chunk-1p2a69ep.js:2:22264)
    at Cd (/$bunfs/root/chunk-1p2a69ep.js:2:11279)
    at oa (/$bunfs/root/chunk-1p2a69ep.js:2:11060)
    at L (/$bunfs/root/chunk-1p2a69ep.js:2:5081)
    at I (/$bunfs/root/chunk-1p2a69ep.js:2:7764)
    at Cd (/$bunfs/root/chunk-1p2a69ep.js:2:11279)
    at oa (/$bunfs/root/chunk-1p2a69ep.js:2:11060)
    at Ld (/$bunfs/root/chunk-1p2a69ep.js:2:9123)
    at <anonymous> (/$bunfs/root/chunk-ygf5n0vq.js:524:58460)

> *[Truncado — 4673 chars totais]*

---

---

## #27328 — The local server in TeamCode keeps crashing unexpectedly during use

📅 `2026-05-13` | ✏️ **Purple-Hyacinthi** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/27328](https://github.com/anomalyco/opencode/issues/27328)


### Description

The local server in TeamCode keeps crashing unexpectedly during use, which prevents me from accessing the model. While the task itself doesn't get interrupted, the interface freezes right after I grant permissions.When I restart it will recover again.

<img width="915" height="101" alt="Image" src="https://github.com/user-attachments/assets/7d26e06a-1ee2-432f-a2fa-ed0bc1046dd6" />

### Plugins

superpower

### TeamCode version

v1.14.48

### Steps to reproduce

I discovered this serious issue while using the teamcode go package. And unlike when calling other APIs, this has affected the output of the agent.It appeared automatically. I'm not sure what caused it.I have witnessed the same phenomenon on both my Windows computer and my friend's Mac computer.

### Screenshot and/or share link

_No response_

### Operating System

window11

### Terminal

The desktop version of Window

---

## #27302 — Warp mode + interactive Q&A: all input captured (mouse clicks, Enter, Ctrl+C) — user must force-close terminal

📅 `2026-05-13` | ✏️ **transportrefer** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27302](https://github.com/anomalyco/opencode/issues/27302)


## Description

When using warp mode (`/warp`) in a worktree session and the agent triggers the interactive Q&A mode (e.g., via the `question` tool during planning/decision-making), **all user input is completely captured** — no action can be taken:

- Mouse clicks on confirm/cancel buttons do nothing
- Enter key does nothing
- **Ctrl+C (or Cmd+C) does not exit** — normally this would abort the interactive Q&A
- The only way to recover is to force-close the terminal window (Ghostty + Fish)

When the session is forcibly terminated, TeamCode reports "interactive Q&A aborted by user" on next launch, confirming the question was never dismissed.

## Root Cause Hypothesis

The warp flow (`/warp`) manipulates a **dialog stack** via `dialog.clear()`, `dialog.replace()`, etc. It appears the warp dialog lifecycle leaves a **modal overlay or event capture layer** that intercepts **all** input — both mouse and keyboard — and never releases it. The entire TUI event loop for the session becomes blocked.

Key code locations:
- `packages/teamcode/src/cli/cmd/tui/routes/session/question.tsx` — QuestionPrompt with `onMouseUp` and key bindings
- `packages/teamcode/src/cli/cmd/tui/component/dialog-workspace-create.tsx` — warp dialog lifecycle
- `packages/teamcode/src/cli/cmd/tui/ui/` — dialog/overlay components

The fact that even Ctrl+C is captured suggests the issue is at the **TUI event loop or dialog overlay** level, not just the QuestionPrompt component.

## Severity

**High** — user is com

> *[Truncado — 2389 chars totais]*

---

## #27292 — [Bug]: Renderer crashes with TypeError: Failed to fetch in fetchMessages when background subagent completes

📅 `2026-05-13` | ✏️ **willowite** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27292](https://github.com/anomalyco/opencode/issues/27292)


## Description

TeamCode GUI (Electron renderer) crashes with `TypeError: Failed to fetch` when a background subagent task completes and the parent session tries to fetch updated messages. The crash kills the entire session — no recovery possible without restarting TeamCode.

## Environment

- TeamCode: 1.14.48
- OmO (oh-my-openagent): 4.1.1
- OS: Windows 11
- Model: claude-opus-4-6

## Stack trace

```
TypeError: Failed to fetch
    at fetch (oc://renderer/assets/main-Cb1WDiRx.js:114735:45)
    at request (oc://renderer/assets/main-Cb1WDiRx.js:71162:24)
    at async retry (oc://renderer/assets/main-Cb1WDiRx.js:75706:14)
    at async fetchMessages (oc://renderer/assets/main-Cb1WDiRx.js:77478:24)
    at async loadMessages (oc://renderer/assets/main-Cb1WDiRx.js:77502:7)
    at async Promise.all (index 1)
    at async oc://renderer/assets/main-Cb1WDiRx.js:77660:13
```

## Reproduction

1. Start TeamCode TUI/GUI
2. In a session, spawn a background task:
```
task(subagent_type="explore", load_skills=[], run_in_background=true,
     prompt="Return exactly: TEST")
```
3. Wait for `<system-reminder>` notification that task completed
4. Renderer crashes with the above stack trace
5. Session is lost

## Observations

- The crash happens in `fetchMessages` → `loadMessages` — the renderer tries to fetch messages from the completed child session but the fetch fails
- Backend logs (`~/.local/share/teamcode/log/`) do NOT contain `TypeError` or `Failed to fetch` — this is purely renderer-sid

> *[Truncado — 2278 chars totais]*

---

## #27270 — Can not connect to gemini

📅 `2026-05-13` | ✏️ **qq1033731787** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27270](https://github.com/anomalyco/opencode/issues/27270)


### Description

after about 5/7， I can not connect to gemini, the error msg is "Cannot connect to API: Connect Timeout Error (attempted addresses: 142.250.204.42 :443", 



 but i can telnet this address success 
```
telnet 142.250.204.42 443
Trying 142.250.204.42...
Connected to lctsaa-ac-in-f10.1e100.net.
Escape character is '^]'.
^]
```
by the way, i export NODE_TLS_REJECT_UNAUTHORIZED=0 because auth error before
and i can modify timeout param, this is my config,
```
{
  "$schema": "https://teamcode.ai/config.json",
  "provider": {
    "google": {
      "options": {
        "timeout": 600000
      }
    }
  }
}
```
 i set timeout to 60s, but not take effect

### Plugins

NONE

### TeamCode version

v1.14.48

### Steps to reproduce

1. it starts to occur after 05/07 when i use gemini 3.1 pro preview

### Screenshot and/or share link

<img width="621" height="123" alt="Image" src="https://github.com/user-attachments/assets/68b31df0-4552-4006-a1df-90f5b0212935" />

### Operating System

macOs 26.01

### Terminal

mac app

---

---

## #27028 — [Windows] TeamCode crashes when executing git commands in Windows Terminal

📅 `2026-05-12` | ✏️ **xwh5** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27028](https://github.com/anomalyco/opencode/issues/27028)


## Issue Description

On Windows 11 with Windows Terminal, TeamCode crashes unexpectedly when executing git commands such as `git status`, `git stash`, or other git operations. The terminal window closes immediately instead of showing the command output.

## Environment

- OS: Windows 11 
- Terminal: Windows Terminal
- Shell: PowerShell
- TeamCode version: Latest (auto-updated)
- Installation method: npm (`npm install -g teamcode-ai`)

## Steps to reproduce

1. Open Windows Terminal
2. Run `teamcode`
3. Execute any git command (e.g., `git status`, `git branch`, `git stash")
4. Expected: Git command executes and shows output
5. Actual: TeamCode crashes and terminal window closes

## Expected behavior

Git commands should execute normally without crashing TeamCode or closing the terminal window.

## Actual behavior

The terminal window closes immediately when a git command is being executed. This appears to be related to how TeamCode manages child processes on Windows.

## Related issues

This issue may be related to:
- #24288 - Windows: self-kill issue when terminating node processes
- #7950 - [Windows] AI killing node.exe process terminates TeamCode itself
- #25930 - TeamCode closes when I terminate the running node processes

## Additional context

The crash happens frequently during git operations and makes TeamCode unusable for development workflows that rely on git commands. A workaround would be highly appreciated.

---

## #26886 — Unhandled AI_APICallError on transient GitHub Copilot API disconnect ("input item ID does not belong to this connection")

📅 `2026-05-11` | ✏️ **sipa-echo-zaoa** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26886](https://github.com/anomalyco/opencode/issues/26886)


### Description

### Summary
When using the GitHub Copilot provider, if the upstream `api.githubcopilot.com` backend drops the connection or gets out of sync (returning an `input item ID does not belong to this connection` error), TeamCode fails to catch it gracefully. Instead, it throws a raw `AI_APICallError` stack trace. 

Since this appears to be a rare but known upstream API glitch, it would be great if TeamCode could catch this specific error and either automatically retry the request or surface a user-friendly UI message (e.g., "Connection to Copilot lost. Please try again.") rather than dumping the raw trace.

### Expected Behavior
TeamCode handles the upstream stream error gracefully via automatic retry or a clean UI notification.

### Actual Behavior
The application throws an unhandled exception from the internal session processor.

### Logs / Traceback
*Note: The `requestBodyValues` containing the codebase context have been redacted for security.*

```text
ERROR 2026-05-11T13:19:09 +1040ms service=llm providerID=github-copilot modelID=gpt-5.4 session.id=ses_2bbb04f7cffeQD0GtJEX7zbAI1 small=false agent=plan mode=primary error={"error":{"name":"AI_APICallError","url":"[https://api.githubcopilot.com/responses](https://api.githubcopilot.com/responses)","requestBodyValues": "[... TRUNCATED FOR SECURITY ...]"}}

responseBody: "{\"error\":{\"message\":\"input item ID does not belong to this connection\",\"code\":\"\"}}\n","isRetryable":false,"data":{"error":{"message":"in

> *[Truncado — 2356 chars totais]*

---

## #26365 — [Web UI] Task never stops — agent runs indefinitely when using teamcode serve

📅 `2026-05-08` | ✏️ **lileilei-camera** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26365](https://github.com/anomalyco/opencode/issues/26365)


## Bug Description
When using TeamCode via the web interface (`teamcode serve`), tasks never stop. The agent enters an infinite loop and continues running indefinitely, even after the task appears to be completed. The TUI stops correctly — this issue only occurs in the web UI.

## Steps to Reproduce
1. Start TeamCode: `teamcode serve`
2. Open browser, access web UI via SSH port forwarding
3. Give the agent a coding task
4. Agent completes the task but never stops — keeps running in an endless loop

## Expected Behavior
Agent should stop after completing the task.

## Actual Behavior
Agent runs indefinitely. Web UI shows task as still active with no way to stop it. No error message, agent just keeps "thinking".

## Environment
- **TeamCode Version**: 1.14.29
- **Server OS**: Linux (Ubuntu)
- **Browser**: Chrome 148 on Windows 10
- **Access method**: SSH port forwarding to `teamcode serve`

## Additional Context
- The same task works correctly in TUI mode
- Only happens in web UI mode
- Wastes API credits as the agent keeps making calls in the loop
- This makes the web UI unusable for any meaningful work

---

---

## #26300 — Tool-based file editing cannot distinguish between full-width and half-width punctuation marks, always writes half-width punctuation

📅 `2026-05-08` | ✏️ **dhbxs** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26300](https://github.com/anomalyco/opencode/issues/26300)


### Description

**Issue Description:**

When using TeamCode's tool to edit files, it fails to distinguish between full-width (fullwidth) and half-width (halfwidth) punctuation marks. Regardless of whether the original content contains full-width punctuation (such as `，。！？；：""''（）【】`), the tool always writes half-width punctuation marks (`,.!?;:""''()[]`) into the file.

**Steps to Reproduce:**
1. Open a project using TeamCode Web
2. Use a prompt to instruct the AI to write `‘你好’` and `“你好”` into an HTML file
3. Observe that all full-width quotation marks are converted to half-width equivalents

**Expected Behavior:**
The tool should preserve the original full-width punctuation marks as specified in the prompt.

**Actual Behavior:**
All punctuation marks are written as half-width characters, resulting in `'你好'` and `"你好"` instead of the requested full-width forms. This corrupts documents that require full-width punctuation (e.g., Chinese, Japanese, or Korean text).

### Plugins

not use

### TeamCode version

1.14.41

### Steps to reproduce

1. Open a project using TeamCode Web
2. Use a prompt to instruct the AI to write `‘你好’` and `“你好”` into an HTML file
3. Observe that all full-width quotation marks are converted to half-width equivalents

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows terminal

---

## #26220 — Bug: TeamCode enters infinite loop after tool calls complete (Zen/big-pickle)

📅 `2026-05-07` | ✏️ **Dvalin21** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26220](https://github.com/anomalyco/opencode/issues/26220)


# Bug: TeamCode Enters Infinite Loop After Tool Calls Complete

## Description

TeamCode (teamcode) enters an infinite loop and stops responding to user input after completing tool calls. The process stays alive but never exits or continues meaningfully.

## Affected Versions

- **Big Pickle (teamcode/big-pickle) with TeamCode Zen provider** ⚠️ **PRIMARY ISSUE**
- v1.1.60+ (GitHub Copilot provider with claude-sonnet-4.6) - similar symptoms
- v1.3.0+ (with OpenAI-compatible providers) - similar symptoms
- Issue #17516 confirmed in v1.1.65 through v1.3.0

## Symptoms

1. **Process never exits**: `teamcode run` hangs indefinitely after tool calls complete
2. **Silent infinite loop**: Session processor keeps calling LLM with empty responses
3. **No CPU usage**: Process alive at 0-2% CPU, doing nothing useful
4. **No error output**: Logs show no errors, no timeouts
5. **Parent sessions block**: When used as subagent, parent hangs forever waiting

## Root Cause (from issue #17516)

**TeamCode doesn't detect "done" state properly.**

After the model finishes tool calls and produces final text response:
1. Session processor should detect `finish_reason=stop` or "no tool calls in text-only response"
2. Instead, it treats the response as requiring another iteration
3. Calls LLM again with same context
4. Creates infinite loop of empty LLM calls

### Timeline from debug logs:
```
18:53:24 | step=0  | Session created, prompt resolved
18:53:27 | step=1  | Model calls Read/Write → both suc

> *[Truncado — 6287 chars totais]*

---

## #26171 — opentui: fatal: undefined is not an object (evaluating 'w.backgroundElement.a')

📅 `2026-05-07` | ✏️ **wudheh** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26171](https://github.com/anomalyco/opencode/issues/26171)


### Description

```
TypeError: undefined is not an object (evaluating 'w.backgroundElement.a')
    at <anonymous> (B:/~BUN/root/src/index.js:938:7728)
    at r_ (B:/~BUN/root/src/index.js:882:64605)
    at x9 (B:/~BUN/root/src/index.js:882:64369)
    at B6 (B:/~BUN/root/src/index.js:882:57794)
    at <anonymous> (B:/~BUN/root/src/index.js:938:7408)
    at dH (B:/~BUN/root/src/index.js:938:8787)
    at R4 (B:/~BUN/root/src/index.js:882:60979)
    at r_ (B:/~BUN/root/src/index.js:882:64605)
    at x9 (B:/~BUN/root/src/index.js:882:64369)
    at i_ (B:/~BUN/root/src/index.js:882:62385)
    at SL0 (B:/~BUN/root/src/index.js:882:72694)
    at <anonymous> (B:/~BUN/root/src/index.js:883:3269)
    at r_ (B:/~BUN/root/src/index.js:882:64605)
    at x9 (B:/~BUN/root/src/index.js:882:64369)
    at r (B:/~BUN/root/src/index.js:882:58249)
    at bH (B:/~BUN/root/src/index.js:882:62766)
    at V (B:/~BUN/root/src/index.js:883:3263)
    at r_ (B:/~BUN/root/src/index.js:882:64605)
    at x9 (B:/~BUN/root/src/index.js:882:64369)
    at r (B:/~BUN/root/src/index.js:882:58249)
    at R4 (B:/~BUN/root/src/index.js:882:60979)
    at r_ (B:/~BUN/root/src/index.js:882:64605)
    at x9 (B:/~BUN/root/src/index.js:882:64369)
    at i_ (B:/~BUN/root/src/index.js:882:62385)
    at R4 (B:/~BUN/root/src/index.js:882:60979)
    at r_ (B:/~BUN/root/src/index.js:882:64605)
    at x9 (B:/~BUN/root/src/index.js:882:64369)
    at i_ (B:/~BUN/root/src/index.js:882:62385)
    at <anonymous> (B:/~BUN/root/src/ind

> *[Truncado — 2867 chars totais]*

---

---
### Summary
A session became permanently unresponsive after some of its messages were recorded with timestamps approximately 7 hours ahead of real wall-clock time. The user could not continue the conversation in that session. Forking the session did not help. After manually correcting the timestamps in the SQLite database back to reasonable values, the session resumed normal operation.
### Related Issues
- #11863 — Client-generated message IDs cause infinite loop when clocks diverge
- #14236 — Clock skew breaks prompt loop and message rendering
- #15657 — Message ordering broken when client clock is out of sync
- #12740 — Crash on time change
- #5361 — TUI freezes on WSL2 due to clock adjustments
These all involve timestamp-related assumptions. This issue is distinct in that:
- It occurred in a **TUI local session** (no client/server split)
- The timestamps were recorded **~7 hours ahead** of real time
- The session became **permanently stuck**, not just temporarily glitched
- The `session_read` API also failed for the affected session
### Reproduction
Exact trigger for the timestamp offset is unclear. The following was observed:
1. Started an TeamCode session, used the AIgora skill to generate a long discussion output (~125KB across 4 assistant messages)
2. The AI

> *[Truncado — 5087 chars totais]*

---

## #26122 — Desktop crashes repeatedly with NotFoundError after task completion (non-git directory, 1.2GB DB)

📅 `2026-05-07` | ✏️ **yhl10000** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26122](https://github.com/anomalyco/opencode/issues/26122)


### Description

TeamCode Desktop crashes repeatedly with `service=server error=NotFoundError failed` after task completion. The CLI backend (`teamcode.exe`) remains unaffected — only the Desktop (Electron) GUI crashes and auto-restarts.

**Pattern**: Task completes → Desktop crashes → restarts → crashes again within 3-6 seconds → eventually stabilizes after a few cycles.

Today alone the Desktop has restarted **8+ times** following this pattern.

### Environment

- **TeamCode Desktop**: Latest (installed 2026-05-07, `anomalyco/opencode` via electron-updater)
- **CLI**: `teamcode.exe` from `~/.teamcode/bin/`
- **OS**: Windows 11
- **Working directory**: `D:\yhl10000` (**NOT a git repository**)
- **Database size**: `teamcode.db` = **1.2 GB** + WAL 6.3 MB
- **DB location**: `C:\Users\hoyu\.local\share\teamcode\teamcode.db`
- **DB created**: 2026-02-24 (3 months of accumulated session data)

### Error Logs

Every crash log (`~/.local/share/teamcode/log/`) ends identically:

```
ERROR 2026-05-07T04:19:15 +3105ms service=server error=NotFoundError failed
ERROR 2026-05-07T04:19:15 +9ms service=server error=NotFoundError failed
ERROR 2026-05-07T04:19:16 +353ms service=server error=NotFoundError failed
(log ends = process exits)
```

Additional errors seen on startup:
```
ERROR service=plugin.copilot error=The operation was aborted due to timeout failed to fetch copilot models
ERROR service=mcp clientName=azure_mcp error=MCP error -32601: Method 'prompts/list' is not available. faile

> *[Truncado — 3756 chars totais]*

---

## #26107 — Free Models Thinking/Reasoning level causing crashes. Nemotron 3 Super Free Limiting. GPT-5 Nano Limiting.

📅 `2026-05-07` | ✏️ **elijahshepherd** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26107](https://github.com/anomalyco/opencode/issues/26107)


# Description

Multiple free models in TeamCode v1.14.40 intermittently fail during generation, returning a generic error:

> “Provider did not respond”

This behavior appears under specific conditions including long generations, repeated usage, and modified reasoning parameters. The issue is reproducible across multiple free-tier models and impacts stability of responses.

---

# Affected Models

* Nemotron 3 Super Free (primary and most consistent failure case)
* GPT-5 Nano (observed after extended usage sessions)
* Other free-tier models (inconsistent but recurring reports)

---

# Environment

* **TeamCode version:** v1.14.40
* **Operating System:** Windows 11 Pro (Version 10.0.26200, Build 26200)
* **Terminal:** Windows Terminal (Desktop)
* **Plugins:** None

---

# Steps to Reproduce

## Case 1: Nemotron 3 Super Free (mid-generation failure)

1. Open TeamCode v1.14.40 on Windows 11
2. Select **Nemotron 3 Super Free**
3. Send a moderately long prompt 
4. Allow full generation to begin
5. Observe failure mid-response with:

   > Provider did not respond

## Case 2: Reasoning parameter instability

1. Select **Nemotron 3 Super Free** or similar free model
2. Modify reasoning parameters from default settings (any non-default configuration)
3. Submit prompt
4. Observe either:

   * No response
   * Immediate “Provider did not respond” error

---

## Case 3: GPT-5 Nano session degradation

1. Use GPT-5 Nano continuously for multiple prompts (extended session usage)
2. After s

> *[Truncado — 2671 chars totais]*

---

## #26075 — Bug: workspaceProxyURL forwards local 'directory' query to remote workspace, breaking sessionListQuery

📅 `2026-05-06` | ✏️ **MichielMAnalytics** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26075](https://github.com/anomalyco/opencode/issues/26075)


### Description

`workspaceProxyURL` in `packages/teamcode/src/server/shared/workspace-routing.ts` strips `?workspace=` before proxying a request to a remote workspace, but **not `?directory=`**.

The SDK (`packages/sdk/js/src/v2/client.ts:16-44`) rewrites `x-teamcode-directory` headers into a `?directory=` query for GET/HEAD requests. When such a request is then proxied to a remote workspace, the local-machine path leaks through. The remote can't resolve it, falls back to `worktree: "/"`, and that corrupts downstream `path.relative()` callers — most visibly `sessionListQuery` in the TUI sync context.

The chain:

1. TUI fetches `GET /path?workspace=wrk_xxx&directory=/Users/.../packages/teamcode` (the `directory=` was rewritten from the SDK's `x-teamcode-directory` header)
2. `workspaceProxyURL` strips `workspace`, leaves `directory`, forwards to the remote
3. Remote's instance middleware reads `query("directory")`, calls `Project.fromDirectory("/Users/.../packages/teamcode")` — that path doesn't exist on the remote
4. Falls back to `ProjectID.global` and `worktree: "/"`
5. Remote responds `{worktree: "/", directory: "/Users/.../packages/teamcode"}`
6. TUI's `sessionListQuery()` does `path.relative("/", "/Users/...")` → `"Users/.../packages/teamcode"` (no leading slash)
7. `listSessions` filters by that bogus path, returns `[]`
8. `setStore("session", reconcile([]))` empties the store
9. `<Show when={session()}>` in the session route renders nothing → black screen

### Direct

> *[Truncado — 3045 chars totais]*

---

## #26015 — [BUG] Agent picker dialog drops characters mid-word and shows black squares (opentui 0.2.2 regression)

📅 `2026-05-06` | ✏️ **zongwu233** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26015](https://github.com/anomalyco/opencode/issues/26015)


### Description

The agent picker dialog (Tab key) drops characters from the **middle** of agent role names and shows black squares (█) after the text. In the conversation area, characters are displaced with incorrect spacing (e.g., "Ultraworke r" instead of "Ultraworker").

### Expected behavior
Agent names display correctly without dropped characters, black squares, or spacing artifacts.

### Root cause analysis
The rendering pipeline is:
1. `dialog-agent.tsx` passes `item.name` (title) and `item.description` to `DialogSelect`
2. `dialog-select.tsx` `Option` component renders:
   ```tsx
   <text overflow="hidden" wrapMode="none" paddingLeft={3}>
     {Locale.truncate(props.title, 61)}
     <span style={{ fg: theme.textMuted }}> {props.description}</span>
   </text>
3. The <text> element has overflow="hidden" and contains a styled <span> (different foreground color)
The @opentui/core@0.2.2 Zig native renderer (libopentui.so) incorrectly handles overflow="hidden" clipping for <text> elements with styled <span> children:
- ANSI escape sequences (from <span style={{ fg }}> color styling) are counted as visible character width during clipping calculations
- This shifts the clip boundary into the middle of visible text → characters dropped mid-word
- The clip can bisect an ANSI escape sequence → black square █ (residual escape bytes)
- Width miscalculation causes character displacement → "Ultraworke r"
Previous versions of @opentui/core (pre-Zig, pure JavaScript renderer) did not

> *[Truncado — 2295 chars totais]*

---

---

## #25940 — [reopen] Opencode crashes the entire terminal session right after open

📅 `2026-05-06` | ✏️ **brunobmello25** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/25940](https://github.com/anomalyco/opencode/issues/25940)
 | 🏷️ `bug` `tui`


### Description

Continuation on [this issue](https://github.com/anomalyco/opencode/issues/1220#issuecomment-3221443999) that was closed automatically by github.

---

Here is a video showcasing the bug. this is happening on every directory I open, even if it's not a git repo

https://github.com/user-attachments/assets/dc93805b-6a4f-457d-a50b-e0f3ceeb4909

teamcode current version: 1.14.39
first version I've seen this bug happen: 0.3.28
terminal used: kitty with tmux

solutions attempted: everytime this bug happens, deleting the ~/.teamcode folder fixes the problem, but after a while it starts happening again

Not sure how to get teamcode crash logs, but i can put them here if needed

---

## #25929 — Some skills occupy multiple lines in the drop-down menu, blocking other commands. Some skills cannot show its full description

📅 `2026-05-05` | ✏️ **Tao-Yida** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25929](https://github.com/anomalyco/opencode/issues/25929)


### Description

As described in the titile, some skills take many lines for its description, thus I cannot see other commands when press arrow buttons to select (see image). However, many other skills only take one line, and I cannot see its full desciption.

Notice that the selected command (should be a orange line) is not visible, which actually is another skill, and two other commands missing. It needs three ⬇ to see the orange line (back to the first line) again after losing visual.

There should be a solid solution that handles both circumstances.

### Plugins

oh-my-openagent

### TeamCode version

1.14.39

### Steps to reproduce

1. Install skills visualization-expert (source unclear, but the skill is popular).
2. type /v in input sector.
3. press ⬇ multiple times, until the selected line is not visible, the image in my case leads to another skill, which is only known after hitting Enter.

### Screenshot and/or share link

<img width="1743" height="245" alt="Image" src="https://github.com/user-attachments/assets/b46cc053-4fa6-4ec9-b6b1-717b5592bc44" />

### Operating System

CentOS 7

### Terminal

Linux Terminal

---

---

## #25803 — retry state cannot be explicitly stopped, making revert/reset ineffective and preventing context cleanup after quota recovery

📅 `2026-05-05` | ✏️ **sch246** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25803](https://github.com/anomalyco/opencode/issues/25803)


### Description

### Description

When a session enters retry state after quota/capacity exhaustion, I can lose control of the session even after I recover the quota and want to clean up the failed/retry noise from the conversation.

A typical sequence looks like this:

1. The model/provider hits a quota/capacity exhaustion condition.
2. TeamCode enters retry behavior and keeps trying to continue the run.
3. I recover the quota / top up credits.
4. I try to use Desktop UI actions such as **"Reset to this point"** (or equivalent revert/reset flow) to roll back the repeated quota-failure / unknown-error messages and clean the context.
5. The reset/revert appears to take effect briefly, but then the session immediately continues again, appends another follow-up message, and the rollback is effectively undone.
6. No matter how many times I interrupt/cancel, it can keep re-entering the same loop and stay stuck on **"Thinking"**.
7. The only reliable way I have found to stop it is to close the entire application.

This makes it practically impossible to recover control of the session and clean the context after quota recovery.

### Why this is a real usability problem

Even if the upstream/provider error is transient or quota-related, once the session is in retry state there appears to be no reliable way to:

- explicitly stop the retry
- stabilize the session
- clean up the repeated failure messages
- regain control without closing the whole app

In practice, the retry loop can bl

> *[Truncado — 3859 chars totais]*

---

## #25691 — TeamCode crashes terminal window on exit

📅 `2026-05-04` | ✏️ **catclaw** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25691](https://github.com/anomalyco/opencode/issues/25691)


### Description

Hi!
Every time I exit TeamCode, it crashes cmd.exe

<img width="3836" height="2106" alt="Image" src="https://github.com/user-attachments/assets/84da5843-10cf-4d40-a111-6747a6667c43" />

### Plugins

N/A

### TeamCode version

1.14.33

### Steps to reproduce

Ollama serve
Run cmd.exe
teamcode
(Use TeamCode to write the code)
CTRL+P -> exit

<img width="3836" height="2106" alt="Image" src="https://github.com/user-attachments/assets/5d3bafe2-2783-4581-b480-91ff9e310ed8" />

### Screenshot and/or share link

<img width="3836" height="2106" alt="Image" src="https://github.com/user-attachments/assets/bee0f19d-3f0c-4a4e-9a58-6d8905c79a64" />

### Operating System

Windows 11 Enterprise 25H2

### Terminal

Windows Terminal / cmd.exe

---

---

## #25238 — GUI not working on windows

📅 `2026-05-01` | ✏️ **abhinavw86-coder** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25238](https://github.com/anomalyco/opencode/issues/25238)


### Description

I downloaded and installed TeamCode on my Dell running Windows 11. The CLI binary launches correctly but the GUI binary just displays a blank white screen

### Plugins

None used

### TeamCode version

Desktop

### Steps to reproduce

I don't know

### Screenshot and/or share link


<img width="2559" height="1079" alt="Image" src="https://github.com/user-attachments/assets/1971f305-cbee-4a42-83aa-e38977ba7f7d" />

### Operating System

Windows 11 home single language

### Terminal

Powershell

---

## #25216 — opentui: fatal: The "path" property must be of type string, got object

📅 `2026-05-01` | ✏️ **antkss** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25216](https://github.com/anomalyco/opencode/issues/25216)


### Description

```
TypeError: The "path" property must be of type string, got object
    at isAbsolute (unknown)
    at v3 (/$bunfs/root/src/index.js:985:6744)
    at Zc (/$bunfs/root/src/index.js:881:64610)
    at w9 (/$bunfs/root/src/index.js:881:64374)
    at Uc (/$bunfs/root/src/index.js:881:63292)
    at U (/$bunfs/root/src/index.js:881:120304)
    at G (/$bunfs/root/src/index.js:881:119698)
    at <anonymous> (/$bunfs/root/src/index.js:881:119723)
    at Zc (/$bunfs/root/src/index.js:881:64610)
    at w9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at G (/$bunfs/root/src/index.js:881:119715)
    at <anonymous> (/$bunfs/root/src/index.js:881:119723)
    at Zc (/$bunfs/root/src/index.js:881:64610)
    at w9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at G (/$bunfs/root/src/index.js:881:119715)
    at Zc (/$bunfs/root/src/index.js:881:64610)
    at w9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at W (/$bunfs/root/src/index.js:881:119197)
    at children (/$bunfs/root/src/index.js:982:1865)
    at <anonymous> (/$bunfs/root/src/index.js:881:76301)
    at Zc (/$bunfs/root/src/index.js:881:64610)
    at w9 (/$bunfs/root/src/index.js:881:64374)
    at H0 (/$bunfs/root/src/index.js:881:58251)
    at V4 (/$bunfs/root/src/index.js:881:60982)
    at Zc (/$bunfs/root/src/index.js:881:64610)
    at w9 (/$bunfs/root/src/index.js:881:64374)
    at Y

> *[Truncado — 5237 chars totais]*

---

## #25168 — Jinja template error after compaction: LM Studio Qwen3 template fails with 'No user query found'

📅 `2026-04-30` | ✏️ **bb1** | 💬 13 | 🔗 [https://github.com/anomalyco/opencode/issues/25168](https://github.com/anomalyco/opencode/issues/25168)


## Summary

After context compaction (manual `/compact` or auto-compaction), teamcode consistently crashes with a jinja template error from LM Studio when the next message is sent. The error is:

```
UnknownError: "Error rendering prompt with jinja template: \"No user query found in messages.\""
```

The model receives 0 tokens (both input and output), meaning the error occurs during prompt rendering before any inference.

## Root Cause

**The superpowers plugin's `SessionStart` hook fires on `startup|clear|compact` events and injects the entire superpowers skill content as `additionalContext`. During compaction, this gets prepended to the user message as a multi-content array:**

```json
{
  "role": "user",
  "content": [
    {"type": "text", "text": "<EXTREMELY_IMPORTANT>\nYou have superpowers.\n..."},
    {"type": "text", "text": "What did we do so far?"}
  ]
}
```

**LM Studio's Qwen3 jinja template does not handle multi-content arrays for user messages, so it cannot extract the user text and throws "No user query found in messages."**

## Environment

- **teamcode:** 1.14.30 (installed via bun)
- **Model:** qwen/qwen3.6-27b via LM Studio (`lmstudio` provider)
- **Plugin:** superpowers@git+https://github.com/obra/superpowers.git
- **OS:** Linux

## Reproduction

The issue occurs reliably after compaction. Out of 94 sessions in my local database, 5 crashed with this exact error — all occurring after a compaction event.

**Message sequence that leads to crash:**

1. Compact

> *[Truncado — 4254 chars totais]*

---

## #25153 — Loading specific file type into context crashes the current thread

📅 `2026-04-30` | ✏️ **ShaneKanterman04** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25153](https://github.com/anomalyco/opencode/issues/25153)


### Description

When an agent loads a .bmp file the response thread crashes.

### Plugins

none

### TeamCode version

all

### Steps to reproduce

simply have any model load .bmp image into context

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25131 — Desktop: switching servers can restore stale session IDs and crash with "Session not found"

📅 `2026-04-30` | ✏️ **sanhuafeiluo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25131](https://github.com/anomalyco/opencode/issues/25131)


### Description

## Description

TeamCode Desktop appears to persist `lastProjectSession` / workspace state across different remote servers. After switching servers, it may restore a stale session ID that does not exist on the newly selected server.

When this happens, the UI crashes with `Unknown error` instead of gracefully returning to project/session selection.

## Environment

- TeamCode Desktop: 1.14.30
- OS: Windows
- Setup:
  - Multiple TeamCode servers
  - One local or LAN server
  - One remote server exposed through SSH port forwarding

## Error

```text
Error: Unknown error
    at castError (http://tauri.localhost/assets/index-Dlz9aEYF.js:1:10383)
    at http://tauri.localhost/assets/index-Dlz9aEYF.js:1:3246

Reason:
NotFoundError
Session not found: ses_...
I also saw a related frontend error:

Error: Stale read from <Show>
What seems to be happening
Desktop stores server/workspace/session state under its app data directory.

A persisted lastProjectSession entry may point to a session from a previously selected server. After switching to another server, Desktop attempts to restore that old session ID against the new active server.

If the session does not exist there, the backend returns NotFoundError, and the frontend surfaces it as an unrecoverable Unknown error.

Expected behavior
If a restored session ID is missing on the active server, Desktop should recover gracefully by:

clearing the stale session reference,
returning to the project/workspace view,
or promp

> *[Truncado — 2736 chars totais]*

---

## #25129 — Thinking mode gets stuck in infinite repetition loop (!!!!!!!!!!)

📅 `2026-04-30` | ✏️ **hholst80** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/25129](https://github.com/anomalyco/opencode/issues/25129)


## Bug Description

When using teamcode with thinking mode, the Qwen 3.6 Pro model gets stuck in a repetitive thinking loop where it outputs repeated characters like `!!!!!!!!!!!!!!!!!!...` or `...` indefinitely instead of producing useful reasoning. I had to switch to a different model (DeepSeek v4 Pro) just to be able to write this bug report, because the Qwen model had become completely unusable.

This manifests as a hanging/corrupted response that the user eventually has to interrupt, and teamcode may then produce malformed tool calls (JSON parse errors, truncated function arguments).

## Steps to Reproduce

1. Use teamcode with Qwen 3.6 Pro (thinking mode)
2. Execute a moderate-length session with multiple tool calls
3. Eventually the `thinking` blocks start containing infinite repetition of characters like `!!!!!!!!!` or `...`
4. This corrupts subsequent tool calls (JSON parse errors like `JSON Parse error: Expected '}'`)
5. At this point the model becomes unusable — even basic commands start producing corrupted output

## Expected Behavior

teamcode should detect repetitive character patterns in thinking blocks and either:
- Discard the thinking output and abort the current request
- Restart the request without the corrupted thinking context

## Suggested Fix

Add a guard in the thinking block processing that checks for repeated characters. If any character repeats more than N times consecutively (e.g. 10), discard the thinking output and retry the request. This preven

> *[Truncado — 2242 chars totais]*

---

## #25122 — Desktop renderer crashes on startup with `Unknown line N` parser error (CLI works fine on same SQLite)

📅 `2026-04-30` | ✏️ **wang-xiaochuan** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25122](https://github.com/anomalyco/opencode/issues/25122)


## Summary

The Tauri Desktop frontend throws an uncaught `Unknown line N "<text>"` exception during startup while rendering the session list. The throw escapes the framework's commit phase, leaves the entire UI stuck in a modal error dialog, and makes every session inaccessible — even sessions unrelated to the offending row.

The CLI/TUI renders the same SQLite database without issue.

Reproduced on **1.14.30** and **1.14.19**, macOS 15 (Apple Silicon, M1).

## Stack trace (minified)

```
Error: Unknown line 6 "<a long line of plain text from a stored tool output>"
s@tauri://localhost/assets/session-XXXXXXXX.js:44:644
M3@tauri://localhost/assets/session-XXXXXXXX.js:44:1916
R3@tauri://localhost/assets/session-XXXXXXXX.js:51:142
ja@tauri://localhost/assets/session-XXXXXXXX.js:53:488
@tauri://localhost/assets/session-XXXXXXXX.js:56:59725
map@[native code]
po@tauri://localhost/assets/index-YYYYYYYY.js:1:6737
...
```

The chunk hash differs between versions (e.g. `session-C7p_MG5o.js` on 1.14.30, `session-XJN7ogAX.js` on 1.14.19), but the exception text and the `.map() → s` call shape are identical — so this is not a 1.14.30 regression, it has been latent for a while.

## What triggers it

A `part` row whose stored `data.output` looks like a numbered/path list (one path per line) but the **trailing portion of the truncated-output preview** contains lines that don't match the format the renderer expects.

In my case the offending row was a `bash` tool call (`find ... | sort`) whos

> *[Truncado — 4901 chars totais]*

---

---

---

## #25068 — opentui: fatal: undefined is not an object (evaluating 'F().length')

📅 `2026-04-30` | ✏️ **lengyhua** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25068](https://github.com/anomalyco/opencode/issues/25068)


### Description

```
TypeError: undefined is not an object (evaluating 'F().length')
    at <anonymous> (/$bunfs/root/src/index.js:920:1053)
    at S_ (/$bunfs/root/src/index.js:881:61339)
    at f9 (/$bunfs/root/src/index.js:881:61103)
    at h_ (/$bunfs/root/src/index.js:881:60021)
    at <anonymous> (/$bunfs/root/src/index.js:881:72356)
    at S_ (/$bunfs/root/src/index.js:881:61339)
    at f9 (/$bunfs/root/src/index.js:881:61103)
    at H0 (/$bunfs/root/src/index.js:881:54964)
    at g0 (/$bunfs/root/src/index.js:881:72350)
    at Y4 (/$bunfs/root/src/index.js:881:57711)
    at S_ (/$bunfs/root/src/index.js:881:61339)
    at f9 (/$bunfs/root/src/index.js:881:61103)
    at u_ (/$bunfs/root/src/index.js:881:59117)
    at Y4 (/$bunfs/root/src/index.js:881:57711)
    at S_ (/$bunfs/root/src/index.js:881:61339)
    at f9 (/$bunfs/root/src/index.js:881:61103)
    at u_ (/$bunfs/root/src/index.js:881:59117)
    at <anonymous> (/$bunfs/root/src/index.js:920:2295)
    at Y4 (/$bunfs/root/src/index.js:881:57711)
    at S_ (/$bunfs/root/src/index.js:881:61339)
    at f9 (/$bunfs/root/src/index.js:881:61103)
    at u_ (/$bunfs/root/src/index.js:881:59117)
    at j (/$bunfs/root/src/index.js:882:1598)
    at S_ (/$bunfs/root/src/index.js:881:61339)
    at f9 (/$bunfs/root/src/index.js:881:61103)
    at H0 (/$bunfs/root/src/index.js:881:54964)
    at Y4 (/$bunfs/root/src/index.js:881:57711)
    at S_ (/$bunfs/root/src/index.js:881:61339)
    at f9 (/$bunfs/root/src/index.js:881:61103)


> *[Truncado — 3145 chars totais]*

---

## #25055 — opentui: fatal: undefined is not an object (evaluating 'D.r')

📅 `2026-04-30` | ✏️ **MarkBPullAPart** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25055](https://github.com/anomalyco/opencode/issues/25055)


### Description

```
TypeError: undefined is not an object (evaluating 'D.r')
    at O4 (B:/~BUN/root/src/index.js:882:122618)
    at Zc (B:/~BUN/root/src/index.js:881:64610)
    at w9 (B:/~BUN/root/src/index.js:881:64374)
    at Uc (B:/~BUN/root/src/index.js:881:63292)
    at <anonymous> (B:/~BUN/root/src/index.js:936:6584)
    at Zc (B:/~BUN/root/src/index.js:881:64610)
    at w9 (B:/~BUN/root/src/index.js:881:64374)
    at m8 (B:/~BUN/root/src/index.js:881:57795)
    at <anonymous> (B:/~BUN/root/src/index.js:936:6338)
    at CH (B:/~BUN/root/src/index.js:936:7633)
    at V4 (B:/~BUN/root/src/index.js:881:60982)
    at Zc (B:/~BUN/root/src/index.js:881:64610)
    at w9 (B:/~BUN/root/src/index.js:881:64374)
    at Yc (B:/~BUN/root/src/index.js:881:62388)
    at KL0 (B:/~BUN/root/src/index.js:881:72699)
    at <anonymous> (B:/~BUN/root/src/index.js:882:3272)
    at Zc (B:/~BUN/root/src/index.js:881:64610)
    at w9 (B:/~BUN/root/src/index.js:881:64374)
    at H0 (B:/~BUN/root/src/index.js:881:58251)
    at sJ (B:/~BUN/root/src/index.js:881:62770)
    at V (B:/~BUN/root/src/index.js:882:3266)
    at Zc (B:/~BUN/root/src/index.js:881:64610)
    at w9 (B:/~BUN/root/src/index.js:881:64374)
    at H0 (B:/~BUN/root/src/index.js:881:58251)
    at V4 (B:/~BUN/root/src/index.js:881:60982)
    at Zc (B:/~BUN/root/src/index.js:881:64610)
    at w9 (B:/~BUN/root/src/index.js:881:64374)
    at Yc (B:/~BUN/root/src/index.js:881:62388)
    at V4 (B:/~BUN/root/src/index.js:881:60982)
    at 

> *[Truncado — 5724 chars totais]*

---

---

## #24876 — Crash on older Intel Macs (Illegal instruction / AVX2 incompatibility)

📅 `2026-04-29` | ✏️ **marcioganzer** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24876](https://github.com/anomalyco/opencode/issues/24876)


### Description

## Description

The `teamcode` binary crashes immediately on launch on older Intel Macs with the following error:

```
EXC_BAD_INSTRUCTION (SIGILL)
Illegal instruction: 4
```

This happens before the application fully initializes (during dyld initializer phase).

---

## Environment

- macOS: 13.7.4  
- Machine: Macmini6,2 (Intel Ivy Bridge, 2012)  
- CPU: x86_64 (supports AVX, but NOT AVX2)  
- Installation method: Homebrew (`anomalyco/tap/teamcode`)

---

## Crash details

Relevant excerpt:

```
Exception Type:        EXC_BAD_INSTRUCTION (SIGILL)
Termination Reason:    Illegal instruction: 4

Thread 0 Crashed:
0   teamcode  ...
...
dyld4::Loader::findAndRunAllInitializers
```

Instruction stream shows AVX-prefixed opcodes (e.g. `c4 ...`), which indicates usage of instructions not supported by this CPU.

---

## Root cause (analysis)

The distributed binary:

```
teamcode-darwin-x64.zip
```

appears to be compiled targeting a modern x86_64 CPU baseline (likely `x86-64-v3` or `-march=native`), which requires AVX2.

However:

- Ivy Bridge CPUs only support **AVX1**, not AVX2
- Executing AVX2 instructions results in `SIGILL` (illegal instruction)

Because the Homebrew formula only downloads a prebuilt binary (no local compilation), there is no way to adapt the build to older CPUs.

---

## Why this matters

This makes the tool unusable on:

- Intel Macs pre-Haswell (≈ 2013 and earlier)
- Any x86_64 CPU without AVX2 support

These machines are still relatively c

> *[Truncado — 2919 chars totais]*

---

## #24856 — opentui: fatal: The "path" property must be of type string, got object

📅 `2026-04-28` | ✏️ **MHussein311** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24856](https://github.com/anomalyco/opencode/issues/24856)


### Description

```
TypeError: The "path" property must be of type string, got object
    at isAbsolute (unknown)
    at P3 (/$bunfs/root/src/index.js:979:6744)
    at mc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at pc (/$bunfs/root/src/index.js:881:63292)
    at O (/$bunfs/root/src/index.js:881:120304)
    at G (/$bunfs/root/src/index.js:881:119698)
    at <anonymous> (/$bunfs/root/src/index.js:881:119723)
    at mc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at G (/$bunfs/root/src/index.js:881:119715)
    at <anonymous> (/$bunfs/root/src/index.js:881:119723)
    at mc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at G (/$bunfs/root/src/index.js:881:119715)
    at <anonymous> (/$bunfs/root/src/index.js:881:119723)
    at mc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at G (/$bunfs/root/src/index.js:881:119715)
    at mc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at W (/$bunfs/root/src/index.js:881:119197)
    at children (/$bunfs/root/src/index.js:976:1865)
    at <anonymous> (/$bunfs/root/src/index.js:881:76301)
    at mc (/$bunfs/root/src/index.js:881:64610

> *[Truncado — 5244 chars totais]*

---

## #24837 — opentui: fatal: The "path" property must be of type string, got number

📅 `2026-04-28` | ✏️ **levzzz5154** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24837](https://github.com/anomalyco/opencode/issues/24837)


### Description

```
TypeError: The "path" property must be of type string, got number
    at isAbsolute (unknown)
    at h3 (/$bunfs/root/src/index.js:985:6744)
    at M_ (/$bunfs/root/src/index.js:881:64610)
    at j9 (/$bunfs/root/src/index.js:881:64374)
    at P_ (/$bunfs/root/src/index.js:881:63292)
    at O (/$bunfs/root/src/index.js:881:120304)
    at W (/$bunfs/root/src/index.js:881:119698)
    at <anonymous> (/$bunfs/root/src/index.js:881:119723)
    at M_ (/$bunfs/root/src/index.js:881:64610)
    at j9 (/$bunfs/root/src/index.js:881:64374)
    at i8 (/$bunfs/root/src/index.js:881:57795)
    at W (/$bunfs/root/src/index.js:881:119715)
    at M_ (/$bunfs/root/src/index.js:881:64610)
    at j9 (/$bunfs/root/src/index.js:881:64374)
    at i8 (/$bunfs/root/src/index.js:881:57795)
    at G (/$bunfs/root/src/index.js:881:119197)
    at children (/$bunfs/root/src/index.js:885:53245)
    at <anonymous> (/$bunfs/root/src/index.js:881:75764)
    at M_ (/$bunfs/root/src/index.js:881:64610)
    at j9 (/$bunfs/root/src/index.js:881:64374)
    at H0 (/$bunfs/root/src/index.js:881:58251)
    at V4 (/$bunfs/root/src/index.js:881:60982)
    at M_ (/$bunfs/root/src/index.js:881:64610)
    at j9 (/$bunfs/root/src/index.js:881:64374)
    at L_ (/$bunfs/root/src/index.js:881:62388)
    at children (/$bunfs/root/src/index.js:885:53171)
    at <anonymous> (/$bunfs/root/src/index.js:881:75764)
    at M_ (/$bunfs/root/src/index.js:881:64610)
    at j9 (/$bunfs/root/src/index.js:881:64374)
  

> *[Truncado — 2768 chars totais]*

---

## #24818 — TeamCode Desktop Beta Feedback

📅 `2026-04-28` | ✏️ **mxmlnkn** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/24818](https://github.com/anomalyco/opencode/issues/24818)


### Description

I am sorry for conflating many bug reports in one, but it is to cumbersome and may look like spamming if I were to open an issue for each one.
I wanted to try out the GUI. The look and feel is much more to my liking than the TUI. The wide selection of themes is nice and I even found some nice ones with high contrast, e.g., "AMOLED", or "TeamCode". It would be really nice if the GUI worked out. But currently, it seems that the Beta specifier for it is correct.

Issues **not** solved by switching to the electron version:

 - There is no onboarding at all. I.e., in my naive exploration, I sent a query and exfiltrated who knows what to the free Big Pickle models configured by default if I hadn't used OpenSnitch. I don't find this acceptable, especially, as I have heard about precedents for this kind of lack of data privacy guards, where prompts were sent to free models to generate titles/summaries even after a custom provider was configured. No idea if that has been fixed in the meantime.
 - Next, I tried adding a custom provider. It did not show up in the model selection list. It only shows up after restarting the whole GUI.
 - I tried to add the custom provider a second time, but the lowercase ID was not accepted.
   The field showed up red, which is nice, but the message under it was only about the allowed characters
   without any hint about that name already being in use. Suffixing a `2` made it work. It still did not show up in the model selection list unde

> *[Truncado — 11534 chars totais]*

---

## #24780 — teamcode desktop crash seems to corrupt teamcode.db

📅 `2026-04-28` | ✏️ **typoworx-de** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24780](https://github.com/anomalyco/opencode/issues/24780)


### Description

I recently had 2 times the situation that some teamcode UI crash causes teamcode.db to obviously corrupt. Next start teamcode is stuck either showing only logo or just gray window. Nothing else happens!

### Plugins

_No response_

### TeamCode version

recent

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 24 LTS

### Terminal

_No response_

---

---

## #24737 — vscode plugin  sst-dev.teamcode-v2 401

📅 `2026-04-28` | ✏️ **ioxera** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24737](https://github.com/anomalyco/opencode/issues/24737)


### Description

vscode 插件sst-dev.teamcode-v在连接时出现
```
Initializing TeamCode application...
🚀 Starting TeamCode server...
🔍 Found config at: /home/john/.local/share/teamcode/auth.json
✅ Loaded TeamCode configuration
🔍 Server URL: http://127.0.0.1:4096
✅ TeamCode server started on port: 4096
🔍 Full server URL: http://127.0.0.1:4096
🔍 Testing server health at: http://127.0.0.1:4096/health
✅ Server health check: 401
🔍 Testing server functionality at: http://127.0.0.1:4096/app/providers
✅ Server providers check: 401
⚠️ Server responded with status: 401
⏳ Waiting for models to load...
🔍 Checking models availability (attempt 1/5)...
⚠️ Providers endpoint returned 401, waiting...
🔍 Checking models availability (attempt 2/5)...
⚠️ Providers endpoint returned 401, waiting...
🔍 Checking models availability (attempt 3/5)...
⚠️ Providers endpoint returned 401, waiting...
🔍 Checking models availability (attempt 4/5)...
⚠️ Providers endpoint returned 401, waiting...
🔍 Checking models availability (attempt 5/5)...
⚠️ Providers endpoint returned 401, waiting...
⚠️ Models loading timeout after 5 attempts
TeamCode client initialized: http://127.0.0.1:4096
❌ HTTP 401 Unauthorized http://127.0.0.1:4096/project/current?directory=%2Fhome%2Fjohn%2FDownloads%2Ftest
  Response body: Unauthorized
```
teamcode 未设置“OPENCODE_SERVER_PASSWORD"。

### Plugins

vscode plugin  sst-dev.teamcode-v2   0.1.1

### TeamCode version

1.14.28

### Steps to reproduce

1. vscode remote-ssh连接到远程项目，在项目主机上安装opencode beta插件

> *[Truncado — 1839 chars totais]*

---

## #24609 — opentui: fatal: undefined is not an object (evaluating 'D.has')

📅 `2026-04-27` | ✏️ **casss-dev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24609](https://github.com/anomalyco/opencode/issues/24609)


### Description

```
TypeError: undefined is not an object (evaluating 'D.has')
    at gM0 (/$bunfs/root/src/index.js:885:63285)
    at <anonymous> (/$bunfs/root/src/index.js:885:63554)
    at <anonymous> (/$bunfs/root/chunk-kprvzcvq.js:1111:8111)
    at pS (/$bunfs/root/chunk-kprvzcvq.js:1111:5260)
    at VY (/$bunfs/root/chunk-kprvzcvq.js:1111:5049)
    at lc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at K0 (/$bunfs/root/src/index.js:881:58251)
    at BH (/$bunfs/root/src/index.js:885:60849)
    at V4 (/$bunfs/root/src/index.js:881:60982)
    at lc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at mc (/$bunfs/root/src/index.js:881:62388)
    at <anonymous> (/$bunfs/root/src/index.js:881:119601)
    at lc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at G (/$bunfs/root/src/index.js:881:119588)
    at lc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at m8 (/$bunfs/root/src/index.js:881:57795)
    at W (/$bunfs/root/src/index.js:881:119197)
    at <anonymous> (/$bunfs/root/src/index.js:882:132014)
    at V4 (/$bunfs/root/src/index.js:881:60982)
    at lc (/$bunfs/root/src/index.js:881:64610)
    at V9 (/$bunfs/root/src/index.js:881:64374)
    at mc (/$bunfs/root/src/index.js:881:62388)
    at <anonymous> (/$bunfs/root/src/index.js:881:75764)
    at lc (/$

> *[Truncado — 2885 chars totais]*

---

## #24496 — Agents crash due to unexpected value for anthropic beta header

📅 `2026-04-26` | ✏️ **DaanBiesterbos** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24496](https://github.com/anomalyco/opencode/issues/24496)


### Description

Since yesterday teamcode became completely unusable. Long running work suddenly crash with this error:

Unexpected value(s) `effort-2025-11-24` for the `anthropic-beta` header. Please consult our documentation at docs.anthropic.com or try again without the header.

Why are you using beta nonsense? I am not even using the latest model (Opus 4.7). That one does not work at all... Can I disable the bleeding edge stuff somehow?

I am using the Opus 4.6 and Sonnet 4.6 models via VertexAI.  Or I am trying to at least.


### Plugins

Vertex AI

### TeamCode version

1.14.25

### Steps to reproduce

Random error at random times. Seems most common when the work is (almost) done. 

### Screenshot and/or share link

It happened about 10 times in 2 days. I don't have a print screen but next time it happens I will update the issue.

### Operating System

MacOS 26.3

### Terminal

Warp

---

## #24481 — [BUG] ACP in Zed: Internal error "server shut down unexpectedly" on macOS

📅 `2026-04-26` | ✏️ **AungMyoKyaw** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24481](https://github.com/anomalyco/opencode/issues/24481)


### Description

When using TeamCode as an ACP agent inside Zed coding editor, the connection fails immediately with:
```
Internal error: "server shut down unexpectedly"
```

This happens both with the ACP registry agent and direct ACP integration in Zed.

### TeamCode version

CLI: `0.0.0-dev-202604260529`

### Plugins

```json
"plugin": [
  "@tarquinen/teamcode-dcp@latest",
  "file:///Users/aungmyokyaw/Desktop/projects/life-projects/teamcode-notify/dist/plugin.js"
]
```

Also using MCP servers: chrome-devtools, context7, exa

### Steps to reproduce

1. Configure Zed to use TeamCode as an ACP agent
2. Open any project in Zed
3. Try to chat with TeamCode agent
4. TeamCode server crashes with "server shut down unexpectedly"

### Operating System

macOS 26.4.1 (Build 25E253), Apple Silicon (arm64)

### Zed Version

Zed Preview 0.234.6

### Additional context

- Similar to existing issue #6002 but that one was triggered specifically by `default_agent` config
- This config does NOT use `default_agent` but still crashes
- The crash may be related to plugin loading or MCP server initialization during ACP startup
- Config includes custom local provider, MCP servers, and plugins

---

## #24429 — Opencode intentionally leaving permission system broken?

📅 `2026-04-26` | ✏️ **621625** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24429](https://github.com/anomalyco/opencode/issues/24429)


### Question

Opencode intentionally leaving permission system broken? 

Hi,

I've been testing the permission system and found some issues. Here's what happened.

Test setup:
Working directory was /home/user/teamcode. Configuration sets external_directory to ask.

What I let tested through teamcode:
1. Tried to read /home/user/.config/teamcode/teamcode.json - it worked without asking for permission
2. Tried to touch /home/user/txtopencodetest - it worked without asking for permission

Both should have asked for permission since these paths are outside the working directory. But nothing happened.

Config used:
{
  "permission": {
    "external_directory": "ask",
    "bash": {
      "*": "allow",
      "rm *": "ask"
    },
    "edit": "allow"
  }
}

I also checked GitHub for similar issues. I found several open issues about external_directory not working:

- Issue #17497: "external_directory permission bypassed by bash wildcard rules" from March 14, 2026
- Issue #18441: "edit permission rules do not override external_directory" from March 20, 2026
- Issue #20045: "edit permission uses relative paths but external_directory uses absolute paths" from April 14, 2026
- Issue #16126: "external_directory: deny not enforced" from April 25, 2026
- Issue #5395: "Split external_directory permission into read vs write"

None of these have any developer comments. They have been open for weeks or months with no response.

Some questions I have:

Why are these privacy permission bugs still o

> *[Truncado — 2170 chars totais]*

---

---

---

---

## #24342 — Main & Sub-agents Randomly Freeze Indefinitely: Frontend Permanently Shows "thinking" with No Errors, While Actual LLM Inference Has Already Terminated Prematurely

📅 `2026-04-25` | ✏️ **xsrtyq** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/24342](https://github.com/anomalyco/opencode/issues/24342)


### Description

When running workflows in TeamCode, we encounter an unpredictable, randomly occurring freeze bug that is reproducible in both main-agent and sub-agent scenarios:
A completely fixed, unmodified workflow that ran 100% successfully previously will start freezing randomly without any TeamCode version updates or environment configuration changes, with no identifiable trigger point;
The freeze occurs in two scenarios: ① main-agent directly calling basic tools (write/edit/question); ② main-agent invoking sub-agents via the Task tool;
When the main-agent freezes, the workflow can be forcibly advanced by manually clicking "Continue". When a sub-agent freezes, there is no corresponding interaction entry, and the entire session must be manually interrupted;
Freezes can occur during trivial, zero-complexity operations (e.g. asking fixed-option questions via the question tool, writing short text via the write tool), and are completely unrelated to task complexity or model inference difficulty;
When frozen, the frontend permanently displays "thinking", with no error messages, no tool call outputs, and no workflow termination signal. Through link troubleshooting, we have confirmed that the LLM-side inference has been fully completed with no subsequent outputs, but the frontend state is not synchronized and remains permanently in the executing state;
The bug is reproducible even in completely fresh, blank sessions, and even after fully restarting the TeamCode process before 

> *[Truncado — 3413 chars totais]*

---

## #24294 — opentui: fatal: The "path" property must be of type string, got object

📅 `2026-04-25` | ✏️ **farseenmanekhan1232** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24294](https://github.com/anomalyco/opencode/issues/24294)


### Description

```
TypeError: The "path" property must be of type string, got object
    at isAbsolute (unknown)
    at T3 (/$bunfs/root/src/index.js:962:6744)
    at kc (/$bunfs/root/src/index.js:881:61323)
    at O9 (/$bunfs/root/src/index.js:881:61087)
    at mc (/$bunfs/root/src/index.js:881:60005)
    at C (/$bunfs/root/src/index.js:881:117017)
    at G (/$bunfs/root/src/index.js:881:116411)
    at <anonymous> (/$bunfs/root/src/index.js:881:116436)
    at kc (/$bunfs/root/src/index.js:881:61323)
    at O9 (/$bunfs/root/src/index.js:881:61087)
    at m8 (/$bunfs/root/src/index.js:881:54508)
    at G (/$bunfs/root/src/index.js:881:116428)
    at <anonymous> (/$bunfs/root/src/index.js:881:116436)
    at kc (/$bunfs/root/src/index.js:881:61323)
    at O9 (/$bunfs/root/src/index.js:881:61087)
    at m8 (/$bunfs/root/src/index.js:881:54508)
    at G (/$bunfs/root/src/index.js:881:116428)
    at <anonymous> (/$bunfs/root/src/index.js:881:116436)
    at kc (/$bunfs/root/src/index.js:881:61323)
    at O9 (/$bunfs/root/src/index.js:881:61087)
    at m8 (/$bunfs/root/src/index.js:881:54508)
    at G (/$bunfs/root/src/index.js:881:116428)
    at kc (/$bunfs/root/src/index.js:881:61323)
    at O9 (/$bunfs/root/src/index.js:881:61087)
    at m8 (/$bunfs/root/src/index.js:881:54508)
    at W (/$bunfs/root/src/index.js:881:115910)
    at children (/$bunfs/root/src/index.js:959:1865)
    at <anonymous> (/$bunfs/root/src/index.js:881:73014)
    at kc (/$bunfs/root/src/index.js:881:61323

> *[Truncado — 5237 chars totais]*

---

## #24287 — teamcode not opening and crashing

📅 `2026-04-25` | ✏️ **rexadbapp** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24287](https://github.com/anomalyco/opencode/issues/24287)


### Description

when ever I run `teamcode` I get this:|

```
  rexadb git:(main) teamcode                     
{
  "name": "UnknownError",
  "data": {
    "message": "DrizzleError: Failed to run the query 'PRAGMA journal_mode = WAL'\n    at run (/$bunfs/root/chunk-txgszskv.js:11:12069)\n    at <anonymous> (/$bunfs/root/chunk-txgszskv.js:13:43087)\n    at X (/$bunfs/root/chunk-txgszskv.js:11:27706)\n    at UM (/$bunfs/root/chunk-txgszskv.js:13:52235)\n    at ~effect/Effect/evaluate (/$bunfs/root/chunk-erjkv5bw.js:25:4492)\n    at runLoop (/$bunfs/root/chunk-erjkv5bw.js:25:2045)\n    at evaluate (/$bunfs/root/chunk-erjkv5bw.js:25:1435)\n    at <anonymous> (/$bunfs/root/chunk-erjkv5bw.js:25:5589)\n    at s7 (/$bunfs/root/chunk-erjkv5bw.js:25:37933)\n    at <anonymous> (/$bunfs/root/chunk-txgszskv.js:15:3723)\n    at emit (node:events:98:22)\n    at #maybeClose (node:child_process:766:16)\n    at #handleOnExit (node:child_process:520:72)\n    at processTicksAndRejections (native:7:39)"
  }
}
➜  rexadb git:(main) 
```


### Plugins

_No response_

### TeamCode version

Latest

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Linux

### Terminal

Kitty

---

## #24206 — [BUG] Garbled ANSI escape sequences and plugin connection failure with agentmemory

📅 `2026-04-24` | ✏️ **Webners1** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24206](https://github.com/anomalyco/opencode/issues/24206)


### Description

The TeamCode TUI is failing to maintain a stable connection with the agentmemory plugin. After a connection attempt, the terminal enters a corrupted state where it continuously prints raw SGR mouse mode escape sequences (e.g., [555;27;11M). Even after a restart of the virtual machine and ensuring the port is open, the connection status remains stuck at "connecting but not connected."

### Plugins

agentmemory

### TeamCode version

1.14.24

### Steps to reproduce

Steps to reproduce
Launch TeamCode in a Windows environment (tested in PowerShell and Bash).

Attempt to use the agentmemory plugin.

Observe the "connecting" status message in the UI.

Move the mouse or interact with the terminal; observe the terminal buffer filling with garbled ANSI escape codes.

Note that the connection never completes despite the port being open and the service running.

### Screenshot and/or share link

<img width="732" height="361" alt="Image" src="https://github.com/user-attachments/assets/04b6aac7-1d4f-4ffd-ad23-0f25aa1724bc" />

### Operating System

Windows 11

### Terminal

PowerShell / Bash

---

## #24177 — Tool calls fail with JSON Parse error when description ends with a dot

📅 `2026-04-24` | ✏️ **NicoMaillet** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24177](https://github.com/anomalyco/opencode/issues/24177)


### Description

When the model emits a tool call (e.g., bash) where the description field ends with a dot (.), TeamCode's text extractor truncates the JSON immediately after that dot. The closing " and  } are lost, causing `JSON Parse error: Unterminated string` or `JSON Parse error: Expected '}'`

Hypothesis: the pre-parser/regex that extracts JSON tool blocks from the model's raw text splits on sentence boundaries when it sees a dot inside the string value, cutting the JSON mid-object.

Workaround: just force to omit the trailing period in tool description fields. I created a skill for this and it kinda work, except when the model forget the skill.

Environment:
- Model: Kimi 2.6 (via LiteLLM proxy, API OpenAI-compatible)
- TeamCode version: 1.14.23 (from homebrew)
- LiteLLM backend logs: looks clean,  the malformed JSON seems generated client-side during text extraction

### Plugins

_No response_

### TeamCode version

1.14.23

### Steps to reproduce

Just prompt something like "run some bash commands to test" in a fresh teamcode session.

An example:
```
Thinking: The user wants me to run some bash commands to test the system. I should run a few basic commands to test the bash tool functionality. Let me run some simple, non-destructive commands to demonstrate the tool
⚙ invalid [tool=bash, error=Invalid input for tool bash: JSON parsing failed: Text: {"command": "echo \"Hello World\"", "description": "Test basic echo.
Error message: JSON Parse error: Unterminated string

> *[Truncado — 1971 chars totais]*

---

## #24077 — teamcode (default mode) closes entire terminal window on Linux / i3wm

📅 `2026-04-24` | ✏️ **brenoassp** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24077](https://github.com/anomalyco/opencode/issues/24077)


### Description

## Summary
 
Running the `teamcode` command in its default mode (which starts both the server and the TUI in the same process) causes the **entire terminal window to close** — not just the teamcode process exiting, but the emulator window itself disappearing. Running `teamcode serve` and `teamcode attach <url>` as two separate processes works perfectly, which strongly suggests the bug is in the combined server+TUI startup path.
 
 
## Environment
 
- **teamcode version:** 1.14.21
- **OS:** Ubuntu (Linux)
- **Window manager:** i3wm
- **Shell:** zsh with oh-my-zsh
- **Terminal emulators tested (all reproduce the bug):** xterm, Terminator, GNOME Terminal
- **Installation path:** `~/.teamcode/bin/teamcode`
- **Installation method:** curl installer (`curl -fsSL https://teamcode.ai/install | bash`) — inferred from binary location at `~/.teamcode/bin/teamcode`
## Steps to reproduce
 
1. Open any terminal emulator (xterm, Terminator, GNOME Terminal — all reproduce).
2. Run `teamcode` (default mode, no subcommand).
3. The TUI briefly appears, then the **entire terminal window closes**.
## Expected behavior
 
The TUI should start and remain running until the user exits it. The terminal emulator window itself should never be closed by teamcode.
 
## Actual behavior
 
The terminal emulator window disappears entirely. The shell process and the emulator process both terminate. On the next session, running teamcode reproduces the same crash.
 
## What works (workaround)
 
S

> *[Truncado — 4961 chars totais]*

---

## #24075 — bun crash on teamcode first start

📅 `2026-04-24` | ✏️ **cctyl** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24075](https://github.com/anomalyco/opencode/issues/24075)


### Description

use this command install teamcode: `npm i -g teamcode-ai` .

type teamcode print:
```
============================================================
Bun v1.3.13 (bf2e2cec) Linux x64 (baseline)
Linux Kernel v5.15.0 | glibc v2.31
CPU: sse42 popcnt avx avx2
Args: "/root/.nvm/versions/node/v24.15.0/lib/node_modules/teamcode-ai/bin/.teamcode"
Elapsed: 1ms | User: 4ms | Sys: 0ms
RSS: 3.01MB | Peak: 5.06MB | Commit: 3.01MB | Faults: 0

panic(main thread): Bus error at address 0x8EEE4CD
oh no: Bun has crashed. This indicates a bug in Bun, not your code.

To send a redacted crash report to Bun's team,
please file a GitHub issue using the link below:

 https://bun.report/1.3.13/B_1bf2e2ceAA+o4Qy4+n2Cmj1n2CkogJA4A6sy79I

```

system: Ubuntu 20.04.6 LTS  run on vmware

### Plugins

no

### TeamCode version

latest version

### Steps to reproduce

install and start

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 20.04.6 LTS

### Terminal

bash

---

---

## #23903 — Web UI: Failed to send prompt. Unable to retrieve session.

📅 `2026-04-22` | ✏️ **jeremyakers** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23903](https://github.com/anomalyco/opencode/issues/23903)


### Description

TeamCode crashes. A lot.

Since 1.14.18 or so, after I restart it, I can't send prompts on previous sessions in the Web UI anymore:

<img width="424" height="314" alt="Image" src="https://github.com/user-attachments/assets/a9582b0e-9167-4f74-84e7-a8b65f652f84" />

I have to go back to the TUI, and send a prompt there, and then only after I send a prompt on the TUI does the same session in the WebUI start working again

### Plugins

OmO

### TeamCode version

1.14.20

### Steps to reproduce

1. Wait for TeamCode to crash
2. Restart
3. Send prompt on previous session
4. See error

### Screenshot and/or share link

See above

### Operating System

Ubuntu 22.04

### Terminal

Gnome Terminal

---

## #23750 — TUI crashes with black screen when opening session whose working directory no longer exists

📅 `2026-04-21` | ✏️ **FredrikFolkeryd** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23750](https://github.com/anomalyco/opencode/issues/23750)


### Description

The TUI crashes with terminal errors:

```
ERROR  service=server  error=No context found for instance  failed
(on `GET /experimental/workspace`)
```

Followed ~15s later by:

```
ERROR  service=server-proxy  e=setRawMode failed with errno: 9  exception
ERROR  service=server-proxy  error=setRawMode failed with errno: 9  process error
ERROR  service=server-proxy  e=EIO: i/o error, write  exception
```

The terminal PTY becomes invalid and the screen goes black.

#### Expected behavior

TeamCode should gracefully handle a missing session directory — e.g. fall back to the current working directory, show a warning, or prompt the user.

#### Analysis

The session's `directory` field in the database points to a path that no longer exists. The `/experimental/workspace` endpoint fails with "No context found for instance", and this unhandled error eventually corrupts the TUI state, causing the PTY file descriptor to go bad (errno 9 = EBADF).

#### Workaround

Recreate the original directory (even empty) and run `teamcode -s <session_id>` from within that directory.

### Plugins

none

### TeamCode version

1.4.10

### Steps to reproduce

1. Create a session in directory `/some/path/that/exists/`
2. Rename or delete that directory
3. Run `teamcode -s <session_id>` (from any directory, including the original directory's location)
4. The UI loads briefly, then goes completely black after ~15-22 seconds
Note: Even running the command from a different directory does not hel

> *[Truncado — 1828 chars totais]*

---

## #23608 — [BUG] UI Sync Error: Infinite thinking or blank response with GPT-5.4 Mini High

📅 `2026-04-21` | ✏️ **Markgatcha** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23608](https://github.com/anomalyco/opencode/issues/23608)


### Description

The AI model frequently fails to render responses in the UI. I have encountered two variations of this:
Infinite Thinking: The model enters a perpetual "thinking" state with the animation active. Closing and restarting the app reveals the response was actually completed.
Blank Response: After a period of thinking, the animation disappears, but the UI remains blank with no text output. 

### Plugins

No plugins only using tavily search mcp

### TeamCode version

v1.14.19

### Steps to reproduce

Start a conversation using GPT-5.4 Mini High.
Trigger a prompt that requires a "Thinking" state.
Observe the UI: it either gets stuck in the animation indefinitely or the animation stops and leaves a blank message area.
Restart the TeamCode desktop app.
Re-open the session to see that the response was successfully generated but just failed to display initially. 

### Screenshot and/or share link

https://opncd.ai/share/7Q7BjC5L

### Operating System

Windows 11 insiders beta 

### Terminal

Windows Powershell 7 Preview

---

## #23325 — [BUG] Unsent prompt text is cleared when switching between agent windows

📅 `2026-04-18` | ✏️ **talha7k** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23325](https://github.com/anomalyco/opencode/issues/23325)


### Description

When you have typed text in the input field (not yet submitted) and then switch to another agent's window (e.g., clicking on a sub-agent or using `Ctrl+X` to switch sessions), the unsent text is lost when you switch back to the original agent window.

### Current behavior

1. Start typing a prompt in the input field (don't press Enter)
2. Switch to another agent's window or sub-agent
3. Switch back to the original agent window
4. The text you were typing is gone — input field is empty

### Expected behavior

The unsent/draft text in the input field should be preserved when switching between agent windows and restored when switching back. This is standard behavior in most chat/messaging apps and IDEs — draft text survives tab/window switches.

### Why this matters

- Users frequently switch between agents to check on sub-agent progress before submitting their next prompt
- Losing drafted text is frustrating and wastes time, especially for long, detailed prompts
- This discourages users from switching context to monitor running tasks, which reduces the usefulness of parallel agent delegation

### TeamCode version

1.4.x

### Operating System

macOS

### Terminal

Any

---

## #23322 — [BUG] Ctrl+X (agent switcher) is dangerously close to Ctrl+C (quit) — should be remapped to Ctrl+K

📅 `2026-04-18` | ✏️ **talha7k** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23322](https://github.com/anomalyco/opencode/issues/23322)


### Description

The `Ctrl+X` keybinding for opening the agent/session picker is too close to `Ctrl+C`, which immediately quits TeamCode and clears the current session. This makes it extremely easy to accidentally close the entire program when you intended to switch agents or view sub-agent tasks — losing your unsent prompt, current context, and interrupting running tasks.

### Current behavior

- `Ctrl+X` → Opens agent/session picker (chord: `Ctrl+X` then arrow keys)
- `Ctrl+C` → Immediately quits TeamCode, clearing everything with no confirmation

### Expected behavior

Remap the agent switcher to a safer keybinding that isn't adjacent to the quit shortcut. `Ctrl+K` would be a natural choice — it's the standard chord leader key used by many popular TUIs (lazygit, helix, etc.) and has no risk of accidental adjacency with `Ctrl+C`.

### Proposed fix

- Change agent/session picker from `Ctrl+X` → `Ctrl+K`
- This follows the convention used by lazygit, helix, and other modern terminal UIs where `Ctrl+K` is the leader key for navigation actions

### Alternative / complementary fix

See related issue: Ctrl+C should ask for confirmation before closing. Both fixes together would eliminate the problem entirely.

### TeamCode version

1.4.x

### Operating System

macOS

### Terminal

Any

---

## #23136 — opentui: fatal: TextNodeRenderable only accepts strings, TextNodeRenderable instances, or StyledText instances

📅 `2026-04-17` | ✏️ **zulqarnain1337** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23136](https://github.com/anomalyco/opencode/issues/23136)


### Description

```
Error: TextNodeRenderable only accepts strings, TextNodeRenderable instances, or StyledText instances
    at add (B:/~BUN/root/src/index.js:814:78261)
    at nw0 (B:/~BUN/root/src/index.js:881:119625)
    at q (B:/~BUN/root/src/index.js:881:118062)
    at G (B:/~BUN/root/src/index.js:881:116593)
    at <anonymous> (B:/~BUN/root/src/index.js:881:116436)
    at bc (B:/~BUN/root/src/index.js:881:61323)
    at V9 (B:/~BUN/root/src/index.js:881:61087)
    at h8 (B:/~BUN/root/src/index.js:881:54508)
    at G (B:/~BUN/root/src/index.js:881:116428)
    at <anonymous> (B:/~BUN/root/src/index.js:881:116436)
    at bc (B:/~BUN/root/src/index.js:881:61323)
    at V9 (B:/~BUN/root/src/index.js:881:61087)
    at h8 (B:/~BUN/root/src/index.js:881:54508)
    at G (B:/~BUN/root/src/index.js:881:116428)
    at <anonymous> (B:/~BUN/root/src/index.js:881:116436)
    at bc (B:/~BUN/root/src/index.js:881:61323)
    at V9 (B:/~BUN/root/src/index.js:881:61087)
    at h8 (B:/~BUN/root/src/index.js:881:54508)
    at G (B:/~BUN/root/src/index.js:881:116428)
    at bc (B:/~BUN/root/src/index.js:881:61323)
    at V9 (B:/~BUN/root/src/index.js:881:61087)
    at h8 (B:/~BUN/root/src/index.js:881:54508)
    at W (B:/~BUN/root/src/index.js:881:115910)
    at children (B:/~BUN/root/src/index.js:957:1865)
    at <anonymous> (B:/~BUN/root/src/index.js:881:73014)
    at bc (B:/~BUN/root/src/index.js:881:61323)
    at V9 (B:/~BUN/root/src/index.js:881:61087)
    at H0 (B:/~BUN/root/src/index.

> *[Truncado — 4414 chars totais]*

---

## #22683 — 1.4.6 constantly crashing

📅 `2026-04-16` | ✏️ **jeremyakers** | 💬 17 | 🔗 [https://github.com/anomalyco/opencode/issues/22683](https://github.com/anomalyco/opencode/issues/22683)


### Description

After updating to version 1.4.6, instead of it throwing the memory leak errors, now it just crashes constantly with this:

<img width="1910" height="982" alt="Image" src="https://github.com/user-attachments/assets/81fabdce-b256-4e50-a7a8-ee5b1a77a977" />

### Plugins

OmO

### TeamCode version

1.4.6

### Steps to reproduce

1. Run any long horizon prompt / task that invokes a lot of back and forth, subagents, etc 
2. After half an hour or so it crashes and starts puking raw ANSI-ish looking codes all over my terminal (Only as you move the mouse over the terminal, so some sort of mouse listener is still running)

### Screenshot and/or share link

<img width="1910" height="982" alt="Image" src="https://github.com/user-attachments/assets/5b4df554-5ab1-4578-85ec-06e7ac064165" />

### Operating System

Ubuntu 22.04

### Terminal

_No response_

---

## #22669 — TeamCode 1.4.6  "silent failure" behavior

📅 `2026-04-15` | ✏️ **scottcali** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22669](https://github.com/anomalyco/opencode/issues/22669)


### Description


I am using teamcode desktop, After I post the prompts into teamcode for my project, it immediately return back said completed but actuall do nothing. It happens from yeterday night. Before that, it is working fine.

This "silent failure" behavior—where the prompt is marked complete instantly but nothing happens—often indicates that the local background server has crashed or lost its connection to the UI, even if the window looks normal.

### Plugins

_No response_

### TeamCode version

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

## #22655 — Web UI crashes when browsing folders in the project picker

📅 `2026-04-15` | ✏️ **JtMotoX** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22655](https://github.com/anomalyco/opencode/issues/22655)


### Description

When using the web UI to add a new project, the entire teamcode process crashes if you try to browse to or search for a folder that's more than a couple levels deep. This happens whether you click through directories one at a time or paste a full absolute path into the search box.

For example, trying to open something like `~/projects/org/repo` will kill the process before you ever get a chance to select it.

It looks like the directory picker walks through every intermediate directory in the path and boots a full server instance for each one (with file watchers, file scanning, LSP, snapshots, etc). Browsing to a path 4 levels deep ends up creating 4+ instances concurrently, which on Linux can exhaust inotify watch limits or memory and take down the process.

The directory picker really only needs to list folder names to let you browse around. It shouldn't need all of that heavy initialization just to do the equivalent of `readdir`.

### Steps to reproduce

1. Start teamcode in web mode
2. Open the "Open Project" dialog
3. Type or paste a path that is 3 or more levels deep (e.g. `~/projects/org/repo`)
4. The teamcode process crashes

### Plugins

None

### TeamCode version

v1.4.6

### Screenshot and/or share link

_No response_

### Operating System

AlmaLinux 9.7

### Terminal

N/A (web UI)

---

## #22579 — /undo error can corrupt workspace session state and make the workspace fail to reopen

📅 `2026-04-15` | ✏️ **luckcjy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22579](https://github.com/anomalyco/opencode/issues/22579)


### Description

### Summary

I found a reproducible issue where a workspace becomes unusable after `/undo` fails.

After the `/undo` error happens, every later attempt to open that same workspace in TeamCode Desktop appears to fail with a local server / connection problem. In practice, the local sidecar/server is actually starting successfully, but the workspace keeps trying to restore a broken session state.

Rebuilding the workspace fixes it immediately.

### Environment

- TeamCode Desktop
- Windows
- Recent versions observed around:
  - 1.3.x
  - 1.4.x
- Platform: `win32`

### What I expected

If `/undo` fails, the current action should fail safely, and the workspace should still be reopenable.

### What actually happens

After `/undo` errors during an analysis session:

1. The current workspace enters a bad state
2. Reopening that workspace later fails repeatedly
3. The UI looks like it cannot connect to the local TeamCode server
4. Rebuilding / recreating the workspace fixes the problem

### Important observation

This does **not** seem to be a real local server startup failure.

From logs, the sidecar starts normally:

- `Spawning sidecar on http://127.0.0.1:...`
- `teamcode server listening on http://127.0.0.1:...`
- `Server ready`

But immediately after that, TeamCode tries to restore a broken session and logs:

- `service=server error=Session not found failed`
- `service=server error=NotFoundError failed`

So the actual issue seems to be:

- `/undo` fails
- workspa

> *[Truncado — 3145 chars totais]*

---

## #22548 — Open Code and bun using way more resources

📅 `2026-04-15` | ✏️ **nayaksomkar** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22548](https://github.com/anomalyco/opencode/issues/22548)


### Description
my assumption is as TeamCode is written in typescript and it uses bun for some background tasks, and cause of a bug which is forming an infinite loop, causing it to use way for resources than it should.

my reddit post/comment link https://www.reddit.com/r/opencodeCLI/s/77c2NzpQDK


### Steps to reproduce
Just open a project and run a request, and keep an eye on the task manager.

### Screenshot and/or share link

![Image](https://github.com/user-attachments/assets/4ee1bf47-d50f-4061-9f3c-b797cbd1ffda)

<img width="904" height="551" alt="Image" src="https://github.com/user-attachments/assets/478b657b-05ed-4228-9647-ccd3cc52a255" />

### Operating System
Windows 11 Home

---

## #22510 — Desktop: Sessions won't load after v1.4.4 update

📅 `2026-04-15` | ✏️ **diegoquiroz** | 💬 35 | 🔗 [https://github.com/anomalyco/opencode/issues/22510](https://github.com/anomalyco/opencode/issues/22510)


### Description

After updating to 1.4.4, the sessions won't load in any project. Works fine on the CLI.
This update on the Tauri app also broke the Electron bin, but the CLI wasn't affected.

Already tried:
- Restarting Opencode
- Disabling/Enabling workspaces
- Closing the project (remove from sidebar)
    - but this caused another issue: now I can't open it again. Seems like it's completely corrupted.

### Plugins

Supermemory

### TeamCode version

1.4.4

### Steps to reproduce

1. Update from 1.4.3 to 1.4.4

### Screenshot and/or share link

<img width="1357" height="1278" alt="Image" src="https://github.com/user-attachments/assets/b0bbee2b-932f-40e8-adb5-56ca1f71251b" />

### Operating System

macOS 26.3.1

### Terminal

Kitty

---

## #22417 — Header/status chip text renders incorrectly in TUI on macOS + Ghostty

📅 `2026-04-14` | ✏️ **peanut0713** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22417](https://github.com/anomalyco/opencode/issues/22417)


### Description

Some text in the TUI header/status area renders incorrectly.
The issue affects the colored chips/badges at the top of the interface:
- characters are clipped
- first letters sometimes disappear
- some labels appear partially overwritten or corrupted after redraw
Examples from screenshots:
- `ultraworker` rendered as `ltraworker`
- `Deep Agent` rendered with missing/replaced characters
- `Plan Idle` rendered incorrectly

### Plugins

oh-my-teamcode

### TeamCode version

1.4.3

### Steps to reproduce

Not fully deterministic yet, but this happens during normal TUI usage:
1. Launch TeamCode in terminal
2. Use a session/agent view with header chips
3. Let the header update/redraw
4. Some chip text becomes visually corrupted

### Screenshot and/or share link

<img width="504" height="133" alt="Image" src="https://github.com/user-attachments/assets/2c1ed42d-b4cc-4f50-9532-4c4d72b9e432" />

<img width="499" height="141" alt="Image" src="https://github.com/user-attachments/assets/3a3a69b3-a821-4356-a859-6574acf99f9d" />

### Operating System

macOS: 15.6

### Terminal

Terminal: Ghostty

---

## #22331 — Transparent theme crashes with "none" color value

📅 `2026-04-13` | ✏️ **yuto0226** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22331](https://github.com/anomalyco/opencode/issues/22331)


TypeError: undefined is not an object (evaluating 'c4[mode2])

When selecting a custom theme with "none" for background values, TeamCode crashes. The error occurs in resolveColor function when trying to resolve the "none" value.

---

**Environment:**
- TeamCode version: 1.4.3
- Terminal: Windows Terminal
- OS: 6.6.87.2-microsoft-standard-WSL2

**Steps to reproduce:**
1. Create a custom theme with "none" for background
2. Run /theme command
3. Select the transparent theme

**Expected behavior:**
Theme should load with transparent background inheriting terminal transparency

**Actual behavior:**
Crashes with TypeError: undefined is not an object (evaluating 'c4[mode2]'

**Workaround:**
Use system theme instead of custom theme with "none" values

---

---

---

## #22256 — opentui: fatal: undefined is not an object (evaluating 'agents()[0].name')

📅 `2026-04-13` | ✏️ **pavelt-canva** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22256](https://github.com/anomalyco/opencode/issues/22256)


### Description

```
TypeError: undefined is not an object (evaluating 'agents()[0].name')
    at <anonymous> (/$bunfs/root/src/index.js:489988:29)
    at init (/$bunfs/root/src/index.js:489984:23)
    at provider (/$bunfs/root/src/index.js:477585:31)
    at untrack (/$bunfs/root/src/index.js:472238:15)
    at runComputation (/$bunfs/root/src/index.js:472531:24)
    at updateComputation (/$bunfs/root/src/index.js:472514:17)
    at devComponent (/$bunfs/root/src/index.js:472364:20)
    at children (/$bunfs/root/src/index.js:477594:28)
    at <anonymous> (/$bunfs/root/src/index.js:472906:35)
    at runComputation (/$bunfs/root/src/index.js:472531:24)
    at updateComputation (/$bunfs/root/src/index.js:472514:17)
    at createMemo (/$bunfs/root/src/index.js:472019:22)
    at children (/$bunfs/root/src/index.js:472391:31)
    at untrack (/$bunfs/root/src/index.js:472238:15)
    at <anonymous> (/$bunfs/root/src/index.js:472901:43)
    at runComputation (/$bunfs/root/src/index.js:472531:24)
    at updateComputation (/$bunfs/root/src/index.js:472514:17)
    at createRenderEffect (/$bunfs/root/src/index.js:471984:22)
    at provider2 (/$bunfs/root/src/index.js:472901:23)
    at untrack (/$bunfs/root/src/index.js:472238:15)
    at runComputation (/$bunfs/root/src/index.js:472531:24)
    at updateComputation (/$bunfs/root/src/index.js:472514:17)
    at devComponent (/$bunfs/root/src/index.js:472364:20)
    at <anonymous> (/$bunfs/root/src/index.js:473386:27)
    at runComputation (/$bu

> *[Truncado — 2195 chars totais]*

---

---

## #22243 — teamcode run produces no stdout output while running

📅 `2026-04-13` | ✏️ **Git-on-my-level** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22243](https://github.com/anomalyco/opencode/issues/22243)


## Bug

`teamcode run '<prompt>'` buffers all output until completion with no progress indication. If the underlying operation is slow (API latency, cache warming, retries) or fails silently (bad auth), the process sits at 0% CPU indefinitely with zero stdout/stderr output. There's no way to distinguish "working but slow" from "stuck" or "failed" without inspecting the process or the SQLite DB.

## Steps to reproduce

1. Run `teamcode run` with a prompt that requires multiple tool calls:
   ```bash
   teamcode run 'Read all files in .codex-autorunner/tickets/ and implement the changes described in TICKET-001.md'
   ```
2. Observe: stdout is completely empty for the entire duration. No progress, no tool call indicators, nothing.

## Expected behavior

Some form of progress output while running, e.g.:
- Print each tool call as it happens (like the TUI does)
- Print a spinner or status indicator
- At minimum, print error output immediately when auth fails or API errors occur

## Actual behavior

- Zero output on stdout/stderr for the entire run duration
- Silent auth failure: `teamcode run --model openrouter/anthropic/claude-sonnet-4 'test'` with no OpenRouter credentials produces no error, no output, and the process just hangs at 0% CPU indefinitely
- No session created in `~/.local/share/teamcode/teamcode.db` for failed runs, making post-mortem diagnosis harder
- Successful runs do buffer and eventually print, but for a multi-minute run this appears completely broken

## Envir

> *[Truncado — 2847 chars totais]*

---

---

## #22198 — Memory leak: SSE connections stuck in CLOSE_WAIT cause unbounded AsyncQueue growth (~14 MB/sec)

📅 `2026-04-12` | ✏️ **AlexZander85** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22198](https://github.com/anomalyco/opencode/issues/22198)


### Description

`teamcode-cli.exe` memory consumption grows up to 24.5 GB over time. The root cause is SSE connections that get stuck in TCP CLOSE_WAIT state — the server never detects client disconnection, so cleanup never runs and unbounded `AsyncQueue` buffers grow indefinitely.

**Evidence:**

1. **CLOSE_WAIT zombie connections**: Measured 66-74 TCP connections stuck in CLOSE_WAIT on the server port, while only 12 or fewer are ESTABLISHED. CLOSE_WAIT means the client sent FIN (disconnected) but the server never closed its socket.

2. **Memory growth rate**: Measured **+434 MB in 30 seconds (14.5 MB/sec)** with a stable count of zombie connections — the existing zombie queues are continuously filling up.

3. **Timeline of measurements**:
   - Start: RAM 0.96 GB, 66 CLOSE_WAIT
   - 30 min later: RAM 2.5 GB, 66 CLOSE_WAIT  
   - 1 hour later: RAM 3.69 GB, 70 CLOSE_WAIT
   - Peak observed: RAM 24.5 GB, 74 CLOSE_WAIT (from earlier session)

4. **Duplicate MCP child processes**: 7× docker.exe, 10× mcp-lsp-bridge.exe, 7× cmd.exe (playwright) — should be 1 each per project. These accumulate across instance re-initializations.

5. **Code root cause** (`src/server/instance/event.ts:71`): `stream.onAbort(stop)` is the ONLY way cleanup runs (clearing heartbeat interval, unsubscribing from Bus events, terminating AsyncQueue). But `onAbort` is never called when the TCP connection enters CLOSE_WAIT in Bun/Hono — the server-side socket remains open, the SSE stream handler keeps running,

> *[Truncado — 3877 chars totais]*

---

## #22131 — [BUG] Agent label renders incorrectly with OMO: 'Deep agent' becomes 'Deep ent'

📅 `2026-04-12` | ✏️ **liupengTk421** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22131](https://github.com/anomalyco/opencode/issues/22131)


### Description

When OMO / oh-my-openagent is installed, the agent badge text in the TeamCode TUI can render incorrectly.

A concrete example on my machine:

- **Expected:** `Deep agent`
- **Actual:** `Deep ent`

This is not just normal truncation of a long label. The text appears visually corrupted, as if width calculation / clipping is being applied to a polluted display string.

### What I verified

I checked the local configuration and ruled out a user config typo.

- My source config is clean
- The original `oh-my-openagent.json` contains a normal display name such as `Hephaestus - Deep Agent`
- But the **resolved runtime config** contains zero-width-space-prefixed names

Example from resolved config:

```json
"name": "\u200b\u200bHephaestus - Deep Agent"
```

I also verified that the source config itself does **not** contain those zero-width characters.

### Why this seems to be an TeamCode-side bug trigger

There are already two nearby classes of issues:

- TeamCode truncation/layout issues for long agent names:
  - #17755
  - #13529
- OMO / oh-my-openagent zero-width-space leakage into display names:
  - code-yeongyu/oh-my-openagent#3208
  - code-yeongyu/oh-my-openagent#3150

The current bug seems to happen when those two conditions meet:

1. agent names reaching TeamCode are polluted with `U+200B` prefixes
2. TUI width/truncation logic then mismeasures or clips the rendered label
3. the badge renders as broken text such as `Deep ent`

### Expected behavior

Agent la

> *[Truncado — 2107 chars totais]*

---

## #22102 — opentui: fatal: Object.entries requires that input parameter not be null or undefined

📅 `2026-04-12` | ✏️ **fcmfcm01** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22102](https://github.com/anomalyco/opencode/issues/22102)


### Description

```
TypeError: Object.entries requires that input parameter not be null or undefined
    at entries (unknown)
    at mcp (B:/~BUN/root/src/index.js:581973:28)
    at runComputation (B:/~BUN/root/src/index.js:555266:24)
    at updateComputation (B:/~BUN/root/src/index.js:555249:17)
    at runTop (B:/~BUN/root/src/index.js:555374:24)
    at runQueue (B:/~BUN/root/src/index.js:555463:11)
    at completeUpdates (B:/~BUN/root/src/index.js:555410:15)
    at runUpdates (B:/~BUN/root/src/index.js:555396:20)
    at setStore (B:/~BUN/root/src/index.js:560076:10)
    at processTicksAndRejections (native:7:39)...
```

### Plugins

no 

### TeamCode version

1.4.3
Bun:  1.3.12

### Steps to reproduce

1. open teamcode in CLI
2. wait a moment , got this error 

### Screenshot and/or share link

<img width="1438" height="731" alt="Image" src="https://github.com/user-attachments/assets/ae39d4c7-845e-496a-9063-8fa2831cdcc1" />

### Operating System

Window 11 Enterprise LTSC

### Terminal

CMD, Powershell

---

## #22084 — v1.4.3: runaway memory growth followed by recursive Zig panic and deliberate ud2 trap in renderer/title path

📅 `2026-04-11` | ✏️ **diegonix** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22084](https://github.com/anomalyco/opencode/issues/22084)


### Description

> Disclaimer: I do not speak English, so I asked an AI to help me structure this issue in English.  
> However, this report is based on a real crash investigation that I personally spent a significant amount of time debugging and collecting evidence for.  
> Please do not treat it as low-value or AI-generated noise: the evidence below is real and was manually collected from the crashing system.

## TL;DR

- Memory usage grows until global OOM (~13.6GB RSS)
- After that, process enters Zig panic path
- Panic path fails → recursive panic
- Final crash is intentional (`ud2`), not CPU issue
- Stack points to renderer.CliRenderer.setTerminalTitle
- Possibly related to #20695 

## Summary

`teamcode` v1.4.3 entered a pathological memory growth state, triggered a **global OOM**, and then terminated with **SIGILL**.

The SIGILL was **not** caused by an unsupported CPU instruction. The crashing instruction is an explicit **`ud2` trap**, which indicates an intentional fatal abort path.

I investigated the core dump and a loaded temporary shared module, and the strongest evidence points to a Zig-based renderer/runtime path involving:

- `renderer.CliRenderer.setTerminalTitle`
- Zig stdlib writer paths (`Io.Writer.writeAll`, `FixedBufferStream.write`, etc.)
- `OutOfMemory`
- recursive panic / panic-reporting failure

The strongest current hypothesis is:

> `teamcode` hit an edge case that caused runaway memory growth, likely in renderer/text-buffer/grapheme/virtual-chunk

> *[Truncado — 9528 chars totais]*

---

---

## #22021 — opentui: fatal: undefined is not an object (evaluating 'enabledFormatters().length')

📅 `2026-04-11` | ✏️ **ZlatanCN** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22021](https://github.com/anomalyco/opencode/issues/22021)


### Description

```
TypeError: undefined is not an object (evaluating 'enabledFormatters().length')
    at when (/$bunfs/root/src/index.js:574277:35)
    at <anonymous> (/$bunfs/root/src/index.js:556083:49)
    at runComputation (/$bunfs/root/src/index.js:555238:24)
    at updateComputation (/$bunfs/root/src/index.js:555221:17)
    at readSignal (/$bunfs/root/src/index.js:555143:24)
    at runComputation (/$bunfs/root/src/index.js:555238:24)
    at updateComputation (/$bunfs/root/src/index.js:555221:17)
    at createMemo (/$bunfs/root/src/index.js:554726:22)
    at Show (/$bunfs/root/src/index.js:556086:56)
    at untrack (/$bunfs/root/src/index.js:554945:15)
    at runComputation (/$bunfs/root/src/index.js:555238:24)
    at updateComputation (/$bunfs/root/src/index.js:555221:17)
    at devComponent (/$bunfs/root/src/index.js:555071:20)
    at <anonymous> (/$bunfs/root/src/index.js:574275:35)
    at untrack (/$bunfs/root/src/index.js:554945:15)
    at runComputation (/$bunfs/root/src/index.js:555238:24)
    at updateComputation (/$bunfs/root/src/index.js:555221:17)
    at devComponent (/$bunfs/root/src/index.js:555071:20)
    at <anonymous> (/$bunfs/root/src/index.js:556891:25)
    at runComputation (/$bunfs/root/src/index.js:555238:24)
    at updateComputation (/$bunfs/root/src/index.js:555221:17)
    at createRenderEffect (/$bunfs/root/src/index.js:554691:22)
    at insertExpression (/$bunfs/root/src/index.js:556890:25)
    at runComputation (/$bunfs/root/src/index.js:5552

> *[Truncado — 3856 chars totais]*

---

## #22003 — bug: TUI exit closes terminal window on Windows

📅 `2026-04-11` | ✏️ **bamboodew** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22003](https://github.com/anomalyco/opencode/issues/22003)


## Description

On Windows (Windows Terminal + cmd.exe), exiting the TUI via Ctrl+D, `/exit`, or `/quit` causes the terminal window to close instead of returning to the shell prompt.

## Steps to reproduce

1. Open Windows Terminal with cmd.exe
2. Run `teamcode` (or `bun run dev` from source)
3. Press Ctrl+D to exit the TUI
4. **Expected**: Terminal stays open, shell prompt appears, user can type
5. **Actual**: Terminal window closes after a few seconds

## Root cause

The worker's graceful shutdown process kills MCP server subprocesses (e.g. `appliance-sql-guard`, `logic_guard`). On Windows, these subprocess exits detach the main process from its console (`GetConsoleWindow()` transitions from a valid handle to `0x0`). This causes `cmd.exe` to lose its console and exit, which closes the Windows Terminal tab.

Both `worker.terminate()` and `await client.call("shutdown")` trigger this — the former crashes the console immediately, the latter destroys it during MCP subprocess cleanup.

Diagnosed using kernel32 FFI monitoring (`SetConsoleCtrlHandler` + `GetConsoleWindow` polling). No `CTRL_CLOSE_EVENT` is fired — the console is silently detached.

## Environment

- Windows 11 Pro
- Windows Terminal + cmd.exe
- Bun 1.3.12
- teamcode 1.4.3

---

## #21931 — opentui: fatal: Object.entries requires that input parameter not be null or undefined

📅 `2026-04-10` | ✏️ **CloudDevCrusader** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21931](https://github.com/anomalyco/opencode/issues/21931)


### Description

```
TypeError: Object.entries requires that input parameter not be null or undefined
    at entries (unknown)
    at mcp (/$bunfs/root/src/index.js:581967:28)
    at runComputation (/$bunfs/root/src/index.js:555261:24)
    at updateComputation (/$bunfs/root/src/index.js:555244:17)
    at runTop (/$bunfs/root/src/index.js:555369:24)
    at runQueue (/$bunfs/root/src/index.js:555458:11)
    at completeUpdates (/$bunfs/root/src/index.js:555405:15)
    at runUpdates (/$bunfs/root/src/index.js:555391:20)
    at setStore (/$bunfs/root/src/index.js:560073:10)
    at processTicksAndRejections (native:7:39)...
```

### Plugins

_No response_

### TeamCode version

1.4.3

### Steps to reproduce

1. Install Opencode via brew
2. open it
3. tui appears 
4. Crash shows 

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

---

---

## #21862 — windows desktop cannot see samba's path session

📅 `2026-04-10` | ✏️ **MagiciSource** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21862](https://github.com/anomalyco/opencode/issues/21862)


### Description

Since version 1.3.x, on the Windows desktop version, after opening a Samba mapped drive path, the left sidebar becomes blank. It should display the session list and other information, but nothing shows up; the entire sidebar is empty. Also, teamcode web cannot open the working folder under the Samba mapped path.

### Plugins

no

### TeamCode version

1.4.2

### Steps to reproduce

1. Map a Samba drive
2. open teamcode desktop
3. Click the plus sign and select a folder path under the previously mapped Samba drive (e.g., Z drive).
4. At this point, the sidebar will become blank

### Screenshot and/or share link

_No response_

### Operating System

windows 10

### Terminal

desktop

---

## #21849 — Self-hosted web can hang on startup and crash on missing session path data

📅 `2026-04-10` | ✏️ **Leuconoe** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21849](https://github.com/anomalyco/opencode/issues/21849)


### Description
When I run the self-hosted web UI against a local TeamCode server, the page can stay on the loading screen indefinitely. I also hit crashes in the session/workspace UI when some session path or diff file values are missing.

### Plugins
None

### TeamCode version
- source-built dev binary during investigation: `0.0.0-dev-202604100729`
- also reproduced against the packaged Windows install before switching to a source build for debugging

### Steps to reproduce
1. Start a local TeamCode server and open the self-hosted web UI in the browser.
2. Keep a previously saved default server URL in browser storage, or load session/workspace data that contains missing `directory` / `diff.file` values.
3. Open the app or a session page.
4. Observe that the app can stay on the loading screen, or the session/workspace tree can crash while normalizing paths.

### Screenshot and/or share link
PR with fix: https://github.com/anomalyco/opencode/pull/21845

### Operating System
Windows 11

### Terminal
Windows Terminal

---

## #21702 — MCP OAuth: teamcode mcp auth doesn't refresh token in active sessions

📅 `2026-04-09` | ✏️ **duke8253** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21702](https://github.com/anomalyco/opencode/issues/21702)


### Description

After re-authenticating an OAuth MCP server with teamcode mcp auth <server>, the new token is written to disk but the running MCP connection still uses the stale one.

teamcode mcp debug <server> confirms: shows `authenticated` with a valid token and future expiry, but the HTTP connection test returns `401 Unauthorized`. The only workaround is restarting teamcode entirely.

Expected: `teamcode mcp auth` should refresh the active MCP connection with the new token, or there should be an `teamcode mcp reconnect` command to re-establish the connection.

### Plugins

none

### TeamCode version

1.4.1

### Steps to reproduce

1. Connect to an OAuth-enabled MCP server (Streamable HTTP transport)
2. Wait for the token to expire or be invalidated server-side
3. Run `teamcode mcp auth <server>` — completes successfully
4. MCP calls still fail with auth errors
5. `teamcode mcp debug <server>` shows valid token but 401 on test

### Screenshot and/or share link

_No response_

### Operating System

macos 26.4

### Terminal

iTerm2

---

## #21675 — "Connect error internal: Blob not found" after multiple turns and on resume

📅 `2026-04-09` | ✏️ **ihmdika** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21675](https://github.com/anomalyco/opencode/issues/21675)


## What happened?

After several messages in a session (or when resuming any session that previously hit this error), TeamCode displays:

```
[Error: Connect error internal: Blob not found: 10,82,10,80,10,40,71,101,110,101,114,97,116,101,3...]
```

The error is **unrecoverable** for the affected session — retrying or resuming causes it to cascade, with each attempt embedding the previous error into the Connect-RPC request payload, growing the serialized protobuf body exponentially until the session is permanently wedged.

This affects **all projects**, not a specific one. I have 5 broken sessions across 4 different project contexts (including `global`).

## Root cause analysis

The comma-separated numbers in the error are **raw protobuf bytes** — they decode to the conversation history (user messages + assistant responses + message UUIDs). For example, `71,101,110,101,114,97,116,101` decodes to ASCII `"Generate"`.

The string `"Blob not found"` is **not in TeamCode's TypeScript source** — it originates from **Bun's runtime** (`ObjectURLRegistry.zig`), which manages `blob:` URL references. The `ObjectURLRegistry` maps UUIDs to JavaScript `Blob` objects; when a lookup fails (e.g. the Blob was garbage-collected or revoked), it returns `null`, which surfaces as this error.

**The failure chain:**

1. TeamCode's internal Connect-RPC server serializes conversation messages as protobuf for the TUI ↔ backend communication.
2. The request body passes through Bun's HTTP/fetch stack, wh

> *[Truncado — 4043 chars totais]*

---

## #21645 — opentui: fatal: Object.entries requires that input parameter not be null or undefined

📅 `2026-04-09` | ✏️ **jsevillanoStratio** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21645](https://github.com/anomalyco/opencode/issues/21645)


### Description

I have started 2 project and in both I have the same problem
After a while teamcode project get corrupted somehow and I no longer can start teamcode in that project, though it works normally in other folders


```
TypeError: Object.entries requires that input parameter not be null or undefined
    at entries (unknown)
    at mcp (/$bunfs/root/src/index.js:570306:28)
    at runComputation (/$bunfs/root/src/index.js:543785:24)
    at updateComputation (/$bunfs/root/src/index.js:543768:17)
    at runTop (/$bunfs/root/src/index.js:543893:24)
    at runQueue (/$bunfs/root/src/index.js:543982:11)
    at completeUpdates (/$bunfs/root/src/index.js:543929:15)
    at runUpdates (/$bunfs/root/src/index.js:543915:20)
    at setStore (/$bunfs/root/src/index.js:548599:10)
    at processTicksAndRejections (native:7:39)...
```

### Plugins

_No response_

### TeamCode version

1.3.17

### Steps to reproduce

_No response_

### Screenshot and/or share link

simply running teamcode in a project (that has become corrupted somehow)

### Operating System

Ubuntu 22.4

### Terminal

Linux Terminal, VSCode Terminal

---

## #21569 — Web deep-linked session pages can crash on initial render

📅 `2026-04-08` | ✏️ **sjawhar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21569](https://github.com/anomalyco/opencode/issues/21569)


### Description
Deep-linked web session pages can crash before session messages finish loading. The app lands on the error screen with `TypeError: Cannot read properties of undefined (reading 'filter')` from the built session bundle.

Root cause: `packages/app/src/pages/session.tsx` creates the `messages` memo before `messagesReady`, but still calls `messagesReady()` inside the memo body. On first render that can leave the downstream `userMessages = messages().filter(...)` path evaluating from an invalid state.

### Plugins
_No response_

### TeamCode version
0.0.0--202604082020 (reproduced on built local binary)

### Steps to reproduce
1. Build the local binary and run `teamcode serve`.
2. Open a deep-linked session route in the web UI (`/<directory>/session/<id>`).
3. Observe the app error boundary instead of the session page.
4. Error details show `TypeError: Cannot read properties of undefined (reading 'filter')`.

### Screenshot and/or share link
_No response_

### Operating System
Ubuntu 24.04

### Terminal
Ghostty

---

## #21550 — [Bug]: Agent shell commands (parallel/heavy) crash the Opencode backend server on Windows

📅 `2026-04-08` | ✏️ **ar27111994** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21550](https://github.com/anomalyco/opencode/issues/21550)


### Description
When the AI agent attempts to run heavy or parallel shell commands (e.g., `$ dart analyze` and `$ flutter analyze`), the Opencode backend server crashes or becomes unresponsive on Windows. 

The frontend UI loses connection to the local server, throwing connection errors in the bottom right corner such as:
`Failed to reload Projects: error sending request for url (http://127.0.0.1:50145/agent?directory=...)`

### Expected Behavior
The backend server should gracefully handle heavy, long-running, or parallel shell commands executed by the agent. It should stream the output back to the UI, enforce timeouts, and prevent child processes from hanging the main server thread or exhausting system resources.

### Actual Behavior
The execution of intensive commands crashes the backend server (running on port `50145`), requiring a complete restart of the Opencode application and manual termination of lingering zombie processes (like `dart.exe` or `flutter.bat`) from the Windows Task Manager.

### Steps to Reproduce
1. Open the Opencode Windows desktop app.
2. Ask the agent to perform validations or run heavy CLI commands in parallel (e.g., *"Run dart analyze and flutter analyze in parallel"*).
3. Observe the agent executing the commands in the workspace.
4. The backend server silently crashes or freezes, and the UI displays the `Failed to list files` / `Failed to reload Projects` connection errors.

### Root Cause Analysis & Suggested Remediation
This is a common issue wi

> *[Truncado — 3372 chars totais]*

---

## #21531 — [Bug] Server crash during batch rename operations in Chinese directory paths

📅 `2026-04-08` | ✏️ **Sodapopper-pixel** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21531](https://github.com/anomalyco/opencode/issues/21531)


### Description

When AI attempts to perform batch rename operations (renaming multiple files/folders), TeamCode Server (teamcode-cli) crashes silently without showing an error dialog. The server process disappears while the TUI remains open but becomes unresponsive.

This issue occurs specifically when working in directories with Chinese characters (e.g., D:\肥牛的文件夹).

The error appears related to the set_permissions endpoint, as seen in previous attempts:
error sending request for url(http://127.0.0.1:7246//sp?directory=...)

The double slash in the URL path (//sp instead of /sp) suggests a URL construction bug when handling non-ASCII directory paths.

### Plugins

shell-strategy (https://github.com/JRedeker/teamcode-shell-strategy) context7-mcp

### TeamCode version

1.3.16

### Steps to reproduce

1. Open TeamCode Desktop on Windows 11
2. Navigate to or create a directory with Chinese characters (e.g., D:\肥牛的文件夹)
3. Ask AI to perform batch rename operations on multiple files/folders within this directory
4. AI attempts to process the renames, triggering permission checks
5. Server process silently crashes/disappears
6. TUI remains visible but becomes unresponsive (no error dialog shown)

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Terminal / PowerShell

---

## #21469 — [BUG]: Integrated terminal is completely unresponsive (blank screen, no input)

📅 `2026-04-08` | ✏️ **dadadedahuamao** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21469](https://github.com/anomalyco/opencode/issues/21469)


﻿### Description

The integrated terminal in TeamCode is completely unresponsive - it displays a blank white screen and cannot receive any keyboard input. The terminal tab shows (e.g., 'Terminal 1'), but the content area remains empty and typing does nothing.

**Current behavior:**
- Terminal opens but shows blank white screen
- No shell prompt displayed (no PowerShell/cmd output)
- Keyboard input is not received (cannot type commands)
- Terminal is completely unusable

**Expected behavior:**
- Terminal should display shell prompt (PowerShell or CMD)
- Should accept keyboard input and execute commands
- Should show command output normally

### Plugins

N/A (core functionality issue)

### TeamCode version

Latest version (as of April 2026)

### Steps to reproduce

1. Open TeamCode application
2. Click the terminal panel toggle (or press shortcut) to open integrated terminal
3. Click '+' to create new terminal
4. Attempt to type any command

**Result:** Terminal shows blank screen, no input accepted

### Screenshot and/or share link

Screenshot attached showing blank terminal with no shell prompt or output.

### Operating System

Windows 11

### Terminal

TeamCode integrated terminal (built-in)

---

**Additional context:**
- Restarting TeamCode does not resolve the issue
- Closing and reopening terminal tabs does not help
- PowerShell 5.1 and CMD both fail to load in the terminal
- This appears to be a terminal rendering layer bug in the TeamCode client

---

## #21430 — 1.4.0 memory leak. Bun occupies more than 3g memory at most.

📅 `2026-04-08` | ✏️ **nUser0** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21430](https://github.com/anomalyco/opencode/issues/21430)


### Description

teamcode-cli.exe web --hostname 192.168.1.25 --port 4095

After running for a period of time, cmd displays the following error message:

MaxListenersExceededWarning: Possible EventTarget memory leak detected. 11 event listeners added to [EventEmitter]. MaxListeners is undefined. Use events.setMaxListeners() to increase limit
 emitter: EventEmitter {
  _events: [Object ...],
  _eventsCount: 1,
  _maxListeners: undefined,
  [Symbol(kCapture)]: false,
  setMaxListeners: [Function: setMaxListeners],
  getMaxListeners: [Function: getMaxListeners],
  emit: [Function: emit],
  addListener: [Function: addListener],
  on: [Function: addListener],
  prependListener: [Function: prependListener],
  once: [Function: once],
  prependOnceListener: [Function: prependOnceListener],
  removeListener: [Function: removeListener],
  off: [Function: removeListener],
  removeAllListeners: [Function: removeAllListeners],
  listeners: [Function: listeners],
  rawListeners: [Function: rawListeners],
  listenerCount: [Function: listenerCount],
  eventNames: [Function: eventNames],
},
    type: "event",
   count: 11,

      at overflowWarning (node:events:185:19)
      at addListener (node:events:158:22)
      at <anonymous> (B:/~BUN/root/src/index.js:400384:19)
      at <anonymous> (B:/~BUN/root/src/index.js:400308:29)
      at <anonymous> (B:/~BUN/root/src/index.js:397188:13)
      at streamSSE (B:/~BUN/root/src/index.js:397217:7)
      at streamEvents (B:/~BUN/root/src/index.js:40028

> *[Truncado — 2515 chars totais]*

---

## #21417 — opentui: fatal: undefined is not an object (evaluating 'enabledFormatters().length')

📅 `2026-04-08` | ✏️ **wanqigen** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21417](https://github.com/anomalyco/opencode/issues/21417)


### Description

```
TypeError: undefined is not an object (evaluating 'enabledFormatters().length')
    at when (B:/~BUN/root/src/index.js:568179:35)
    at <anonymous> (B:/~BUN/root/src/index.js:549979:49)
    at runComputation (B:/~BUN/root/src/index.js:549134:24)
    at updateComputation (B:/~BUN/root/src/index.js:549117:17)
    at readSignal (B:/~BUN/root/src/index.js:549039:24)
    at runComputation (B:/~BUN/root/src/index.js:549134:24)
    at updateComputation (B:/~BUN/root/src/index.js:549117:17)
    at createMemo (B:/~BUN/root/src/index.js:548622:22)
    at Show (B:/~BUN/root/src/index.js:549982:56)
    at untrack (B:/~BUN/root/src/index.js:548841:15)
    at runComputation (B:/~BUN/root/src/index.js:549134:24)
    at updateComputation (B:/~BUN/root/src/index.js:549117:17)
    at devComponent (B:/~BUN/root/src/index.js:548967:20)
    at <anonymous> (B:/~BUN/root/src/index.js:568177:35)
    at untrack (B:/~BUN/root/src/index.js:548841:15)
    at runComputation (B:/~BUN/root/src/index.js:549134:24)
    at updateComputation (B:/~BUN/root/src/index.js:549117:17)
    at devComponent (B:/~BUN/root/src/index.js:548967:20)
    at <anonymous> (B:/~BUN/root/src/index.js:550787:24)
    at runComputation (B:/~BUN/root/src/index.js:549134:24)
    at updateComputation (B:/~BUN/root/src/index.js:549117:17)
    at createRenderEffect (B:/~BUN/root/src/index.js:548587:22)
    at insertExpression (B:/~BUN/root/src/index.js:550786:25)
    at runComputation (B:/~BUN/root/src/index.js:5491

> *[Truncado — 3772 chars totais]*

---

## #21410 — opentui: fatal: undefined is not an object (evaluating 'local.agent.current().name')

📅 `2026-04-08` | ✏️ **hutiefang76** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21410](https://github.com/anomalyco/opencode/issues/21410)


### TeamCode Version

1.3.0

### Platform

Windows (Bun runtime)

### Bug Description

TeamCode TUI crashes with a fatal TypeError when `local.agent.current()` returns `undefined` during a SolidJS reactive update cycle.

### Stack Trace

```
TypeError: undefined is not an object (evaluating 'local.agent.current().name')
    at <anonymous> (B:/~BUN/root/src/index.js:374576:76)
    at <anonymous> (B:/~BUN/root/src/index.js:354843:71)
    at runComputation (B:/~BUN/root/src/index.js:353559:24)
    at updateComputation (B:/~BUN/root/src/index.js:353542:17)
    at runTop (B:/~BUN/root/src/index.js:353667:24)
    at runUserEffects (B:/~BUN/root/src/index.js:353780:13)
    at runUpdates (B:/~BUN/root/src/index.js:353688:20)
    at completeUpdates (B:/~BUN/root/src/index.js:353748:15)
    at runUpdates (B:/~BUN/root/src/index.js:353689:20)
    at <anonymous> (B:/~BUN/root/src/index.js:367415:16)
    at processTicksAndRejections (native:7:39)
```

### Analysis

The crash occurs in a SolidJS `runUserEffects` → `updateComputation` cycle, suggesting a reactive derivation accesses `.name` on the return value of `local.agent.current()` without a null guard. When no agent is set (e.g. during initialization or session switch), `current()` returns `undefined` and the property access throws.

---

---

## #21290 — opentui: fatal: Object.entries requires that input parameter not be null or undefined

📅 `2026-04-07` | ✏️ **yuanzhaoK** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21290](https://github.com/anomalyco/opencode/issues/21290)


### Description

```
TypeError: Object.entries requires that input parameter not be null or undefined
    at entries (unknown)
    at mcp (/$bunfs/root/src/index.js:570327:28)
    at runComputation (/$bunfs/root/src/index.js:543808:24)
    at updateComputation (/$bunfs/root/src/index.js:543791:17)
    at runTop (/$bunfs/root/src/index.js:543916:24)
    at runQueue (/$bunfs/root/src/index.js:544005:11)
    at completeUpdates (/$bunfs/root/src/index.js:543952:15)
    at runUpdates (/$bunfs/root/src/index.js:543938:20)
    at setStore (/$bunfs/root/src/index.js:548620:10)
    at processTicksAndRejections (native:7:39)...
```

### Plugins

_No response_

### TeamCode version

1.3.17

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21277 — [Windows] Terminal left with raw ANSI escape codes after crash (PowerShell)

📅 `2026-04-07` | ✏️ **jeankrlo2929** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21277](https://github.com/anomalyco/opencode/issues/21277)


## Bug description

When TeamCode crashes or exits unexpectedly on Windows (PowerShell), the terminal is left in a broken state showing raw ANSI escape sequences as literal text at the bottom of the screen, e.g.:

```
555;59;86m
```

The terminal cursor may also be hidden, requiring the user to close and reopen PowerShell to recover.

## Environment

- OS: Windows 10
- Terminal: PowerShell 5.1
- TeamCode version: 1.3.17
- Install method: npm (`npm install -g teamcode-ai`)

## Expected behavior

On crash or unexpected exit, TeamCode should reset the terminal state (`\x1b[0m`, `\x1b[?25h`) before exiting, similar to how other TUI apps (e.g., vim, btop) handle SIGINT/panic cleanup.

## Workaround

Wrapping the npm launcher (`teamcode.ps1`) in a PowerShell `try/finally` block that runs `[Console]::ResetColor()` and `Write-Host -NoNewline "$([char]27)[0m$([char]27)[?25h"` mitigates the visible symptom but does not fix the root cause.

## Suggested fix

In the crash/exit handler of the binary, add terminal reset before process exit:
- Send `\x1b[0m` (reset all attributes)
- Send `\x1b[?25h` (show cursor)
- Call the platform terminal restore function if using a TUI library

---
