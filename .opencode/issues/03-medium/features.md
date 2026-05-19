# ✨ Features Request

> **Total:** 555 | Extraído em 2026-05-17

---

## #28076 — [FEATURE]: Ability for the agent to serve files through the WebUI

📅 `2026-05-17` | ✏️ **AeEn123** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/28076](https://github.com/anomalyco/opencode/issues/28076)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Not sure if it's a stretch asking for this, as I don't know if anyone else wants this, or it's just my specific use-case this fits in. I run TeamCode in a firewalled VM with only certain ports open, this is the case for all tools I use involving an agent with code execution. The WebUI is very helpful for this, but I need to manually transfer the files after the agent is finished. It would be great if the agent could create a patch file, or package it up into an archive, and use a tool for it to be downloadable by the user within the WebUI.
## Other use-cases
- A user without the hardware to run TeamCode may run the WebUI on a VPS and is able to view generated artifacts without accessing the VPS itself.
- An organisation providing TeamCode as a service will able to give users access to a sandboxed TeamCode instance while keeping file access and code execution behind the scenes.

---

## #28074 — [FEATURE]: customize the "max steps reached" prompt

📅 `2026-05-17` | ✏️ **CalmCapybara** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/28074](https://github.com/anomalyco/opencode/issues/28074)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I'd like to request a new plugin hook (e.g., experimental.session.maxSteps) that allows overriding the system prompt sent to the agent when the maximum number of steps (steps limit) is reached.

The problem: In multi-agent workflows, when a subagent hits the steps limit, it receives the hardcoded "CRITICAL — MAXIMUM STEPS REACHED" prompt which forces it to respond with text only and disables all tools. This effectively destroys the subagent's response — instead of completing its task (which it may be very close to finishing), it just dumps a summary of what was done and what remains. The parent agent expects a real, completed response — it may be parsing the output, checking for specific data, or relying on the subagent to have modified files before returning.

A configurable prompt per agent would solve this by allowing:
- Telling the subagent to return its results in a structured format instead of a narrative summary
- Different max-steps behavior for different agent roles (researcher vs. editor)

---

## #28054 — [FEATURE]: [TUI] Compact long text in input prompt

📅 `2026-05-17` | ✏️ **Presmanes3** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/28054](https://github.com/anomalyco/opencode/issues/28054)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi

When pasting long texts into the prompt, it appears [pasted ~xyz lines] but then during the rendering of the prompt, it gets expanded again. It would be nice to have a summary view or just limiting the size with "collapse/expand" option. 

Better for UX.

---

## #28035 — [FEATURE]: make last prompt text to show on top of screen as sticky line

📅 `2026-05-17` | ✏️ **mrkprdo** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/28035](https://github.com/anomalyco/opencode/issues/28035)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be nice to be able to see the last text prompted. only for like couple lines of text, so at least the users have and idea what teamcode was working on.

This would be a nice feature specially working on a lot of  terminals at the same time.

---

## #28034 — [FEATURE]: Non-blocking background task dispatch (like Claude Code's ^+B)

📅 `2026-05-17` | ✏️ **Dawnfz-Lenfeng** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28034](https://github.com/anomalyco/opencode/issues/28034)


## Summary

When running a long bash command (e.g. `npm test`, `docker build`, `pytest`), the agent is blocked until the command finishes. There is no way to dispatch a terminal task to the background, let the agent continue working, and get notified when the task completes.

## Problem

Currently, any bash command issued by the agent blocks the entire session:

- The agent cannot work on other files while waiting for a test run to finish
- The user cannot switch to another sub-agent or task during a long build
- There is no mechanism to "fire and forget" a terminal command and be notified of its result

Claude Code solves this with `^+B` — the user presses Ctrl+B while a command is running, which detaches it to the background. The agent continues its conversation, and when the task finishes, the agent is notified inline.

## Proposed Solution

Add a **background task dispatch** mechanism:

1. **At the bash tool level**: Add a `background: bool` parameter (default `false`). When `true`, the command is dispatched to a background shell process and returns immediately with a task ID.
2. **Task polling/completion**: The agent (or a system hook) receives a notification when the background task completes, with its stdout/stderr/exit code.
3. **TUI keybind** (bonus): Allow the user to press a key (e.g. `^+B`) to detach a currently running bash command to the background, freeing the agent to continue.

### Example UX

```
Agent runs: !npm test -- --watch
User presses: ^+B
→ Task #42 

> *[Truncado — 2720 chars totais]*

---

## #28030 — [FEATURE]: Add ability to delete projects in TeamCode Desktop

📅 `2026-05-17` | ✏️ **kadeshar** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/28030](https://github.com/anomalyco/opencode/issues/28030)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

TeamCode currently has no way to delete a project from the Desktop application. Users can list, create, and update projects, but there is no delete option in the UI. This leaves stale project entries that cannot be cleaned up without manual SQLite manipulation.

I've verified that #25004 (which proposed the backend `DELETE /project/:id` endpoint) was closed for not following contributing guidelines, and #8083 and #15694 (similar requests) are also closed. The backend API for project deletion may not yet be implemented, but this issue is specifically about adding a **UI feature in the Desktop app** that allows users to delete projects they no longer need.

**What I'm asking for:**

1. A delete button or option in the Desktop
2. A confirmation dialog before deletion to prevent accidental data loss
3. The deletion should cascade to remove associated sessions, messages, and related data

**Why this is needed:**

- Users who switch projects frequently accumulate stale entries
- There's no built-in way to clean up old projects from the Desktop UI
- Related issues (#21554, #8083) show this is a recurring pain point for users

---

## #28017 — FYI, Roslyn LSP now supports Razor out-of-the-box

📅 `2026-05-17` | ✏️ **davidwengier** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28017](https://github.com/anomalyco/opencode/issues/28017)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hello, I work on Roslyn/Razor tooling and thought I'd log this as an FYI, we just merged the two repos and LSP serverd together, and pushed new packages to Nuget, so the latest version of the `roslyn-language-server` (https://www.nuget.org/packages/roslyn-language-server/5.8.0-1.26262.10) supports `.razor` and `.cshtml` files out of the box, no extra flags, file paths or DLLs need to be found. In fact, the command line arguments you are currently using no longer exist.

---

## #28002 — [FEATURE]: Organize commands list into sensible tabs/sections & use consistent language

📅 `2026-05-17` | ✏️ **ADTC** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28002](https://github.com/anomalyco/opencode/issues/28002)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

1. Commands list (Ctrl-P) looks like a mess. There are some sections, but they don't seem to make sense. Appearance options are mixed with application behavior options and system control options. Things are hard to find or make sense of.
2. Inconsistent language, such as some options saying "Toggle" while others saying "Show/Hide" or "Enable/Disable".

<img width="485" height="482" alt="Image" src="https://github.com/user-attachments/assets/e98a58ce-0642-4327-9008-31816ef7cb94" />

My suggestion:
1. Consider having a tabbed view instead of a list view, where a tab relates to one main aspect (with sub-sections), and I could move between tabs with right and left arrows.
2. Change "Suggested" to "Recently used" or "Frequently used". The suggested list looks static, I don't know what the logic/algorithm is, but it's always showing the same items there. Pretty useless. Showing the 3 to 5 most recently used items might be more helpful. Or it could be "Frequently used" based on usage statistics.
3. First section (could be in the same tab as "Recently used" or "Frequently used") could be "TeamCode" system commands limited to ONLY Help, docs and Exit. (These items are excluded from the "Recently used" or "Frequently used" lists.)
4. Second section could be "Session Management" which is limited to ONLY option

> *[Truncado — 2040 chars totais]*

---

## #28001 — [FEATURE]: teamcode-go stop and print out warning when 80% full/daily/weekly is reached

📅 `2026-05-17` | ✏️ **suse-coder** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28001](https://github.com/anomalyco/opencode/issues/28001)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be great if one reaches in teamcode-go 80% in fully/weekly/daily that teamcode stops short and prints out a warning so the user can decide to continue (by typing in continue) or would go with a cheaper model. Otherwise one only finds out the limit is reached when having 100%.

---

## #27997 — [FEATURE]: stable/latest autoupdate channel with version_policy

📅 `2026-05-17` | ✏️ **ririnto** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27997](https://github.com/anomalyco/opencode/issues/27997)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## The Feature

Add an object form for `autoupdate` in `teamcode.json` so users can choose an update channel and the version range that may be applied automatically.

Existing values should keep working.

Enable the current default behavior:

```jsonc
{
  "autoupdate": true
}
```

Disable autoupdate:

```jsonc
{
  "autoupdate": false
}
```

Notify without automatically applying updates:

```jsonc
{
  "autoupdate": "notify"
}
```

Proposed object form:

```jsonc
{
  "autoupdate": {
    "mode": "auto",
    "channel": "stable",
    "version_policy": "same-major"
  }
}
```

Suggested fields:

- `mode: "auto"`: automatically apply updates allowed by policy
- `mode: "notify"`: notify only, do not install automatically
- `mode: "off"`: disable update checks / updates
- `channel: "stable"`: use the stable update channel
- `channel: "latest"`: use the latest update channel
- `version_policy: "any"`: allow the selected channel's candidate version
- `version_policy: "same-major"`: only auto-apply updates within the current major version
- `version_policy: "same-minor"`: only auto-apply updates within the current major/minor version

If `version_policy` is omitted, I think it should default to `any` to preserve the current behavior as closely as possible.

## Motivation, pitch

TeamCode is part of active develo

> *[Truncado — 5504 chars totais]*

---

## #27995 — [FEATURE]: Agent Activity Panel -- sidebar view for monitoring running background agents

📅 `2026-05-17` | ✏️ **zh-zimoer** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27995](https://github.com/anomalyco/opencode/issues/27995)


## Summary

When orchestrating multiple background agents in parallel (e.g., `explore`, `librarian`, `oracle`), there's currently no way to monitor their status without calling `background_output()` manually. A dedicated sidebar/panel showing live agent activity would greatly improve visibility into multi-agent workflows.

## Problem

Right now, when agents are spawned with `run_in_background=true`, the user has zero visibility into:
- **How many agents** are currently running
- **What each agent is doing** (task description / current step)
- **Their status** (running / completed / failed)
- **Their partial output** (live progress)

The only way to check is to wait for a system notification and then call `background_output(task_id="...")` -- which is a pull-based, reactive model with no live visibility.

## Proposed Solution

Add an **Agent Activity Panel** in the sidebar (similar to a CI/CD pipeline view) that shows all background agents with their real-time status.

### Mockup

```
+- Agents ──────────────────────────────+
|                                       |
|  🟡 explore     "Find auth patterns…" |  <- click to expand
|  🟡 librarian   "JWT security docs…"  |  <- click to expand
|  ✅ oracle      "Architecture review" |  <- click to see output
|  ❌ explore     "Find error handlers" |  <- click to see error
|                                       |
+───────────────────────────────────────+
```

### Clicking an agent entry expands to show:
- Full task description / prompt

> *[Truncado — 2720 chars totais]*

---

## #27979 — [FEATURE]: Group skills by directory using colon-separated prefixes

📅 `2026-05-17` | ✏️ **marstid** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27979](https://github.com/anomalyco/opencode/issues/27979)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Skills are currently registered as flat names from SKILL.md frontmatter, with no namespace support. This makes it hard to organize large skill sets — duplicate frontmatter names silently collide, and there's no way to group related skills.

Proposed: derive a prefix from the directory structure under skills/ using the same : separator MCP prompts already use (clientName:promptName).

Examples:
- .teamcode/skills/deploy/SKILL.md → /deploy (flat, unchanged)
- .teamcode/skills/team-a/deploy/SKILL.md → /team-a:deploy
- .teamcode/skills/org/team/deploy/SKILL.md → /org:team:deploy

This is backward compatible — flat skill layouts produce no prefix. Only skills nested one or more directories deep get prefixed.

Related: #23361 (categorized skill listing) — that issue is about display grouping; this is about the naming/routing mechanism that enables it.

---

## #27974 — [FEATURE]:CLI and GUI use separate session stores — sessions are not sharedTitle: CLI and GUI use separate session stores — sessions are not shared

📅 `2026-05-17` | ✏️ **edsebilo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27974](https://github.com/anomalyco/opencode/issues/27974)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Description:
When using teamcode from the CLI, sessions are stored per-project in ~/.local/share/teamcode/storage/session/<project_hash>/. When using the GUI (desktop app or web interface), sessions are stored globally in ~/.local/share/teamcode/storage/session/global/. This means sessions started from the CLI never appear in the GUI session list and vice versa.
Expected behavior: CLI and GUI should share the same session history so I can resume a session started from the CLI in the GUI, or see all my recent sessions regardless of how I launched teamcode.
Options to consider:
- 
The GUI could also list per-project sessions from projects the user has worked on.
- 
The CLI could optionally write to the global session store, or both modes could use a unified store.
- 
Add a config option (e.g., "session_storage": "global" | "per-project") to let users choose.
Version: teamcode 1.15.3
Platform: Windows

---

## #27972 — [FEATURE]: Support commands in .agents/commands

📅 `2026-05-17` | ✏️ **Arcadi4** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27972](https://github.com/anomalyco/opencode/issues/27972)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add command discovery for `.agents/commands/**/*.md`, matching the existing `.agents/skills` convention.

teamcode already discovers reusable skills from `.agents/skills`, but slash command markdown is only discovered from `.teamcode/command(s)`. This makes it harder to keep agent-related commands and skills together in shared dotfile/project setups.

This is related to #14240, but intentionally narrower: support the `.agents/commands` convention without adding a general configurable path system.

---

## #27971 — `teamcode serve` accepts requests while plugin npm install is still blocking the event loop

📅 `2026-05-17` | ✏️ **marcusrbrown** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27971](https://github.com/anomalyco/opencode/issues/27971)


# `teamcode serve` accepts requests while plugin npm install is still blocking

TeamCode's HTTP server starts listening and emits `server.connected` on the SSE stream before plugin npm reify finishes. During the reify window the event loop is blocked, so any API call hangs and eventually `fetch failed`s with no useful error. We've measured this window at 5+ minutes on CI runners.

There is no way for a caller to know the server is ready to process requests.

Related: #19197 (`TeamCode 1.3.2 has ~75 seconds startup delay`). Same root cause, more severe in CI environments.

## Repro

```bash
# Start a server with a fresh cache (no warm npm cache) and a plugin in config
rm -rf ~/.cache/teamcode/packages/oh-my-openagent
teamcode serve --port 4096 &

# Immediately try to make any API call
sleep 1
curl --max-time 10 -sS http://localhost:4096/session/list
# → curl: (28) Operation timed out after 10001 milliseconds with 0 bytes received
```

The server is bound and the SSE `server.connected` event has already been emitted, but `/session/list` never gets a response until npm reify completes.

## Observed timeline (production CI)

| Time | Event |
|---|---|
| 00:00 | `teamcode serve` spawned |
| 00:01 | Server bound, SSE emits `server.connected` |
| 00:01 | Client (`@teamcode-ai/sdk`) sends `POST /session` |
| 00:01 | npm reify starts for `@fro.bot/systematic`, `oh-my-openagent` |
| 04:58 | npm reify completes (298s) |
| 04:59 | Server starts processing the queued `/session` request — 

> *[Truncado — 3015 chars totais]*

---

## #27962 — [FEATURE]: Show last active timestamps in desktop chat list

📅 `2026-05-17` | ✏️ **Salloxy** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27962](https://github.com/anomalyco/opencode/issues/27962)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add compact timestamps to the TeamCode Desktop chat/thread list, showing when each chat was last active or last opened.

In the desktop app, the sidebar currently shows chat titles but not when they were used. This makes it hard to find the right chat when several sessions have similar names or when coming back after a few days.

A small relative timestamp, like `1d`, `2d`, or `1w`, beside each chat would match the pattern used by many chat apps, including Codex Desktop. This request is specifically for desktop chat threads in the sidebar, not timestamps on individual messages and not CLI session output.

---

## #27957 — [FEATURE]:Support llama.cpp reasoning-budget, reasoning-budget-message, reasoning per model

📅 `2026-05-17` | ✏️ **disarticulate** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27957](https://github.com/anomalyco/opencode/issues/27957)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Support llamacpp et al in tailoring options that are also HTTP request params:
```
`--reasoning-format FORMAT` | controls whether thought tags are allowed and/or extracted from the response, and in which format they're returned; one of:<br/>- none: leaves thoughts unparsed in `message.content`<br/>- deepseek: puts thoughts in `message.reasoning_content`<br/>- deepseek-legacy: keeps `<think>` tags in `message.content` while also populating `message.reasoning_content`<br/>(default: auto)<br/>(env: LLAMA_ARG_THINK) |
| `-rea, --reasoning [on\|off\|auto]` | Use reasoning/thinking in the chat ('on', 'off', or 'auto', default: 'auto' (detect from template))<br/>(env: LLAMA_ARG_REASONING) |
| `--reasoning-budget N` | token budget for thinking: -1 for unrestricted, 0 for immediate end, N>0 for token budget (default: -1)<br/>(env: LLAMA_ARG_THINK_BUDGET) |
| `--reasoning-budget-message MESSAGE` | message injected before the end-of-thinking tag when reasoning budget is exhausted (default: none)<br/>(env: LLAMA_ARG_THINK_BUDGET_MESSAGE) |
```
https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md?plain=1

This discussion provides for how to set it per message: https://github.com/ggml-org/llama.cpp/discussions/21445

Ideally, theres:
1. per model settings
2. per agent settings

---

## #27929 — [FEATURE]: Restore the previous 1M context window for `teamcode/deepseek-v4-flash-free`

📅 `2026-05-16` | ✏️ **djeddi-yacine** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27929](https://github.com/anomalyco/opencode/issues/27929)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

First of all, thank you for maintaining TeamCode and providing access to these models.
`teamcode/deepseek-v4-flash-free` quickly became one of my favorite coding models to use in the terminal.

I noticed that the context window was reduced from around 1M tokens to 200k. I understand there may be infrastructure or cost-related reasons behind the change, but I wanted to express how impactful the larger context window was in real-world usage.

With the larger context size, the model felt significantly more capable for long coding sessions, multi-file reasoning, large refactors, and maintaining consistency across extended conversations. It genuinely stood out compared to many alternatives because it could retain so much project context without losing coherence.

Since the reduction, the experience feels noticeably more constrained, especially on larger repositories and longer sessions. The previous context size made the model extremely practical and competitive for serious development workflows.

If possible, I’d really appreciate reconsidering the decision or offering:

* a higher-context variant,
* an opt-in “large context” mode,
* or even a rate-limited version with the original 1M context.

The larger context window was honestly one of the strongest reasons to use this model through TeamCode.

Thank

> *[Truncado — 1538 chars totais]*

---

## #27901 — [FEATURE]: optional runtime enforcement of edit tool's read-before-edit precondition

📅 `2026-05-16` | ✏️ **haabe** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27901](https://github.com/anomalyco/opencode/issues/27901)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The `edit` tool's description text says:

> "You must use your `Read` tool at least once in the conversation
> before editing. This tool will error if you attempt an edit
> without reading the file."

Runtime test on teamcode 1.15.1 shows the string lives in the
LLM-facing tool schema only. The executable code path does not
enforce the precondition. A clean edit succeeded on a fresh session
with no prior `read` of the target file (`Version: 0.23.23 →
0.23.24` applied; no error, no warning).

Fine as a design choice. The description text behaves as a
behavioural nudge to capable models. But the wording "This tool
will error if you attempt an edit without reading the file" is
descriptive-as-asserted-fact, not "the model should read first." A
4B or 8B local model that ignores the instruction will edit
happily, and frameworks relying on the precondition for safety
properties (preventing stale-state edits, say) will silently
no-op.

**The feature request**: ship the precondition as a configurable
runtime check — e.g. a config flag `tools.edit.require_prior_read`
— that refuses edits without a recent `read` on the same path in
the current session. This brings parity with Claude Code, where
the precondition is structurally enforced. Default-off is
acceptable; frameworks that depend on it can opt in.

A che

> *[Truncado — 1983 chars totais]*

---

## #27900 — [FEATURE]: tool.execute.error for failed tool calls (tool.execute.after is currently success-only)

📅 `2026-05-16` | ✏️ **haabe** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27900](https://github.com/anomalyco/opencode/issues/27900)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

teamcode 1.15.1 documents `tool.execute.before` and
`tool.execute.after` as a paired event surface. Runtime test shows
they fire on different populations:

- `tool.execute.before` fires for every tool call.
- `tool.execute.after` fires only for **successful** tool calls.

A failed call (say, `read` on a nonexistent file) fires
`tool.execute.before` and routes the error to the message stream,
where the model receives and summarises it. No plugin-visible
`after`-side event fires. Neither `session.error` nor a flagged
`message.part.updated` fired in our test.

Use case: reflexion-style frameworks (retry-with-self-critique on
failure) need a plugin-observable failure signal. Wiring reflexion
on `tool.execute.after` alone is structurally broken; failures
bypass the hook entirely. The current workaround is to log callIDs
at `before` and reconcile orphans against the message stream, which
is fragile.

Possible shapes:

- Add `tool.execute.error` for failed calls.
- Make `tool.execute.after` fire for both success and failure with
  a status field. This breaks plugins that assume current
  semantics.
- Document the success-only semantics explicitly at
  https://teamcode.ai/docs/plugins/ so framework authors don't
  assume symmetry from the name pair.

Related: #25918 (`tool.execute.after` is declared but nev

> *[Truncado — 2337 chars totais]*

---

## #27899 — [FEATURE]: headless prompt-mutation hook for teamcode run (parallel to tui.prompt.append)

📅 `2026-05-16` | ✏️ **haabe** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27899](https://github.com/anomalyco/opencode/issues/27899)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

teamcode 1.15.1 documents `tui.prompt.append` as a plugin hook for
mutating the outbound prompt before it reaches the model. In the
interactive TUI this is exactly what frameworks need to inject
session-level context (pre-task checklists, project conventions,
guardrails) without the user having to repeat it every turn.

In `teamcode run` (headless mode), the hook is silently inert.
`plugin.init` fires, but `tui.prompt.append` never does. Consistent
with the `tui.*` namespace, fine. But it leaves no documented
headless equivalent for prompt mutation.

Use case: frameworks like Mycelium (theory-grounded agent harness,
https://github.com/haabe/mycelium) want one plugin that injects
pre-task context whether the user is in TUI or running headless via
`teamcode run` from a parent process.

Possible shapes:

- A new event like `session.prompt.append` or `agent.prompt.before`
  that fires in both modes.
- A documented promotion of an existing event (`session.created`,
  `agent.start`) to cover prompt mutation in headless.
- Explicit docs that no such hook exists and the supported pattern
  is config-level system-prompt injection.

The asymmetry between TUI and headless plugin surfaces is worth
calling out in the docs either way, even if the design intent is
"headless agents don't get prompt mutation."

Rela

> *[Truncado — 2160 chars totais]*

---

## #27898 — [FEATURE]: parent agent should observe background subagent's real-time progress and streaming output

📅 `2026-05-16` | ✏️ **smithyyang** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27898](https://github.com/anomalyco/opencode/issues/27898)


## Feature Description

Allow the parent agent to observe a background subagent's real-time progress and streaming output while it is still running.

## Current Behavior

With `OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS=true`, a parent agent can launch a background subagent via `task(background=true, ...)`. But once launched, the subagent is a black box — the parent can only poll `task_status(task_id="...")` which returns the state (`running`, `completed`, `cancelled`) but no intermediate output or progress information.

The only way to interact with a running subagent is `task(task_id="...", prompt=...)`, which resumes/resumes the session but **interrupts** the agent's current work (it stops what it was doing and responds to the new prompt).

## Proposed Feature

Add a mechanism for the parent agent to **stream or poll** the subagent's real-time output without interrupting it. Options to consider:

1. **Stream endpoint**: A way to subscribe to the subagent's tool call outputs and text generations as they happen (similar to tailing logs).
2. **Progress poll**: `task_status` could include a snapshot of the last N tool outputs or the current step description, e.g. `task_status(task_id="...", include_progress=true)` returning `{state: "running", last_output: "Searching the web for X...", tools_called: 3}`.
3. **Shared scratchpad**: An append-only buffer that the subagent writes to and the parent reads from, without mutual interruption.

## Use Case

A parent agent launches multi

> *[Truncado — 2040 chars totais]*

---

## #27892 — [Desktop][Windows] webfetch tool does not respect system proxy settings — feature request: add proxy config in settings UI

📅 `2026-05-16` | ✏️ **Thundercup** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27892](https://github.com/anomalyco/opencode/issues/27892)


## Description

TeamCode Desktop on Windows does not respect the system proxy settings for the agent's built-in `webfetch` tool (and likely other HTTP calls made by the agent runtime). This is similar to #26629 but focused on the agent's web fetching capability rather than GitHub Copilot OAuth.

### What happened

When using TeamCode Desktop with a Windows system proxy (set via Windows Settings → Network & Internet → Proxy, or through tools like v2rayN in system proxy mode), the agent's `webfetch` tool cannot access websites behind the GFW (e.g., google.com, reddit.com). It works for sites accessible from China (e.g., bing.com, baidu.com), confirming the requests go direct without passing through the system proxy.

### Expected behavior

The agent's webfetch tool (and all outbound HTTP calls from the agent runtime) should respect the Windows system proxy configuration, just like a regular browser or any proxy-aware application would.

### Actual behavior

- `webfetch` to google.com → `Transport error`
- `webfetch` to bing.com → works
- TUN mode proxy (network-level) → works, proving the issue is at the application proxy awareness level
- Explicit `HTTPS_PROXY` env var (set before launching) → works, per docs

### Environment

- OS: Windows
- App: TeamCode Desktop (GUI app)
- Proxy: v2rayN in system proxy mode, Clash in system proxy mode
- Network: behind GFW (China mainland)

### Root cause analysis

The desktop app relies on Node.js's `fetch` implementation which only respec

> *[Truncado — 2752 chars totais]*

---

## #27885 — [FEATURE]: Add teamcode-gpt-imagegen to ecosystem plugins list

📅 `2026-05-16` | ✏️ **yuji-hatakeyama** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27885](https://github.com/anomalyco/opencode/issues/27885)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I'd like to add a community plugin to the Ecosystem → Plugins list.

- **Plugin** : teamcode-gpt-imagegen
- **GitHub** : https://github.com/yuji-hatakeyama/teamcode-gpt-imagegen
- **npm** : https://www.npmjs.com/package/teamcode-gpt-imagegen

What it does:
- gpt-image-2 (ChatGPT Images 2) image generation from within TeamCode
- Works via the user's ChatGPT subscription (OpenAI OAuth in `auth.json`)

---

## #27832 — [FEATURE]:Support multiple file encodings in built-in tools such as Read, Grep, Edit, and Write

📅 `2026-05-16` | ✏️ **SuperStrain** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27832](https://github.com/anomalyco/opencode/issues/27832)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description

TeamCode currently seems to assume UTF-8 when using built-in tools such as `Read`, `Grep`, `Edit`, and `Write`.

This works well for modern projects, but it can cause problems in legacy codebases that contain files encoded with GB2312, GBK, Big5, EUC-KR, Shift-JIS, or other non-UTF-8 encodings.

For example, some older projects still contain source files encoded with non-UTF-8 encodings. When these files are read or edited as UTF-8, comments or string literals may become garbled. In some cases, using `Edit` or `Write` may also save the file back in a different or corrupted encoding, which can damage the original source file.

## Expected behavior

It would be very helpful if TeamCode could support multiple file encodings in its built-in file tools, similar to editors like VS Code or Cursor.

Possible improvements:

- Detect the original file encoding when using `Read`, `Grep`, `Edit`, or `Write`.
- Decode non-UTF-8 files correctly when displaying or processing content.
- Preserve the original file encoding when writing changes back.
- Provide a project-level configuration option to specify the default encoding.
- Optionally support explicit encoding conversion, such as GBK to UTF-8, when requested by the user.

For example:

```json
{
  "fileEncoding": "gbk"
}
```

Why this matters



> *[Truncado — 2353 chars totais]*

---

## #27822 — [FEATURE]: Auto-relink stale sessions when project_id matches but directory is outdated

📅 `2026-05-16` | ✏️ **bbl21** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27822](https://github.com/anomalyco/opencode/issues/27822)


---
name: "Feature Request: Auto-relink stale sessions when project_id matches current project"
about: "Suggest an idea for TeamCode"
title: "feat: auto-relink stale sessions when project_id matches but directory is outdated"
labels: ["enhancement", "core"]
---

# 问题 / Problem

当项目文件夹被重命名或移动（如 `my-project` → `my-project-v2`），所有现有会话在 UI 中消失——尽管它们仍存在于数据库中，且仍然通过 `project_id` 正确关联到项目。

When a project folder is renamed or moved (e.g. `my-project` → `my-project-v2`), all existing sessions become invisible in the UI — even though they still exist in the database and are still correctly linked to the project via `project_id`.

---

# 根本原因 / Root Cause

- `session.directory` 在会话创建时设置，**之后从不更新**。
- `project.worktree` **保持最新**（会创建新的 project 行，使用相同的 `project_id` 和新路径）。
- UI 通过 `directory` 查询会话，所以当路径不存在时旧会话被过滤掉。
- `session.project_id` 引用 `project.id`（派生自 **git 根提交哈希**），在文件夹重命名时**保持稳定**。

- `session.directory` is set at session creation time and **never updated**.
- `project.worktree` **is kept current** (a new project row is created with the same `project_id` and the new path).
- The UI queries sessions by `directory`, so old sessions are filtered out when the path no longer exists.
- `session.project_id` references `project.id` (derived from the **git root commit hash**), which **stays stable across renames**.

### 示例 / Example

```sql
-- 重命名前 / Before rename
session.directory = "/path/to/my-project"
project.worktree  = "/path/to/my-project"
project.id        = "abc123..."  (git root com

> *[Truncado — 5185 chars totais]*

---

## #27819 — [FEATURE]: Add `/init --global` or `teamcode rules init` to create global AGENTS.md interactively

📅 `2026-05-16` | ✏️ **zico00** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27819](https://github.com/anomalyco/opencode/issues/27819)


### Feature hasn't been suggested before.
- [x] I have verified this feature I'm about to request hasn't been suggested before.
- Note: Related to #23453 (closed as not planned because global AGENTS.md mechanism already exists), but this is a different ask.

### Describe the enhancement you want to request

teamcode already supports global rules via `~/.config/teamcode/AGENTS.md` — this file is automatically loaded into every session's context. The feature is documented on the Rules page.

However, there is **no interactive way to create this file**. The only entry points users have are:

| Action | Result |
|--------|--------|
| `/init` | Creates a **project-level** `AGENTS.md` only |
| Asking the LLM "help me create global rules" | Depends on whether the model knows about `~/.config/teamcode/AGENTS.md` |
| Manually creating `~/.config/teamcode/AGENTS.md` | Requires the user to already know the exact path |

This creates a discoverability gap:

- First-time user says "help me create rules" → `/init` creates project-level rules → user never learns about global rules
- `/init --help` → No `--global` flag exists
- The docs mention global AGENTS.md, but there exists no command path from "I want global rules" to a file being created

### Proposed solution

Add a `--global` flag to the existing `/init` command:

```
/init --global    → Creates/updates ~/.config/teamcode/AGENTS.md
/init             → Creates/updates <project-root>/AGENTS.md (existing behavior, unchanged)
```

On fi

> *[Truncado — 2267 chars totais]*

---

## #27813 — [FEATURE]: TUI plugin API: projected-session prompt hooks and session notice slot

📅 `2026-05-16` | ✏️ **juanma91m** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27813](https://github.com/anomalyco/opencode/issues/27813)


### Feature hasn't been suggested before.
- [x] I have verified this feature I'm about to request hasn't been suggested before.
### Describe the enhancement you want to request
Related to #26097, but focused specifically on the prompt/session-area surface rather than session projection or session-list policy.
## Summary
I'd like to propose a small extension to the TUI plugin API so plugins can influence prompt behavior for projected/logical sessions and render a lightweight native session notice above the prompt.
This is **not** a request to upstream a specific background-task product feature.  
The goal is to expose **generic host hooks** so advanced plugins can keep using the native prompt/session UI while reducing local host patching.
---
## Problem
Today, even with session/session-list projection hooks, some advanced addons still need a few additional host hooks around the native prompt area.
In practice, projected/logical session models may need to express things like:
- whether prompt submission should still be allowed while the underlying concrete session is busy
- whether prompt submission should be intercepted and rerouted to a custom submit path
- whether the current session should display a small host-rendered notice above the prompt
Without these hooks, the remaining alternatives are:
- replacing the native prompt with custom UI
- fragile command-level workarounds
- or local host patches
---
## Proposal
Add a small set of **optional prompt/notice hooks** with full

> *[Truncado — 4244 chars totais]*

---

## #27806 — [FEATURE]:A feature similar to Respect .gitignore in file picker is needed

📅 `2026-05-16` | ✏️ **mojie126** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27806](https://github.com/anomalyco/opencode/issues/27806)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Control whether the `@` file picker follows the `.gitignore` rules in the project

---

## #27793 — [FEATURE]: show total diff counts in TUI sidebar

📅 `2026-05-15` | ✏️ **glinford** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27793](https://github.com/anomalyco/opencode/issues/27793)


Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

Describe the enhancement you want to request

The TUI sidebar already shows additions and deletions for each modified file. It would be helpful if the Modified Files header also showed the total additions and deletions, similar to the summary on a PR file list.

This makes it easier to scan the overall size of the current session diff without adding up each file row manually.

---

## #27772 — [FEATURE]: Show pending review indicator for sessions needing attention

📅 `2026-05-15` | ✏️ **allracs** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27772](https://github.com/anomalyco/opencode/issues/27772)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Problem to solve**: sessions that are idle or have pending requests / questions look the same as completed sessions with no action items. This makes it easy to miss sessions that need the user's input.

**Solution**: Add a visual dot indicator next to sessions that need attention. The dot disappears once the user navigates to that session.

<img width="217" height="133" alt="Image" src="https://github.com/user-attachments/assets/b33e8536-5d79-42a3-b5b8-756966d2dd96" />

---

## #27759 — [FEATURE]: Session heartbeat for multi-session liveness detection

📅 `2026-05-15` | ✏️ **MaximKh** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27759](https://github.com/anomalyco/opencode/issues/27759)


### Feature has not been suggested before.

- [x] I have verified this feature I am about to request has not been suggested before.

### Describe the enhancement you want to request

TeamCode advertises multi-session ("Start multiple agents in parallel on the same project") but provides no way for sessions to detect each other. If a parallel session crashes or hangs, its resources (temp dirs, ports, files) are never released, and other sessions have no way to know.

Add two fields to the existing session table:
- `heartbeat_at` — timestamp, written every 30s while session is alive
- `peer_id` — unique per process, survives session restarts

Extend the existing compaction/prune to skip sessions with heartbeat_at older than 5 min as stale.

**Why core:** multi-session is a public feature, but without heartbeat it is unsafe. External modules (MCP, SLM) can read the DB for coordination; core just tracks liveness.

**Scope:** ~10 lines across 3 existing files (`session/schema.ts`, `session/lifecycle.ts`, `session/compaction.ts`). No new tables, no new config, no new dependencies.

---

## #27752 — [FEATURE]: Plugin showcase: teamcode-mempalace-persistence — auto-save conversations to MemPalace

📅 `2026-05-15` | ✏️ **geco** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27752](https://github.com/anomalyco/opencode/issues/27752)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I built a plugin that automatically saves every TeamCode conversation to MemPalace (a local vector database) in real-time.

Features:
- Auto-sync every conversation turn after each response
- Categorizes by type: developer, creative, emotions, family, consciousness
- Extracts Knowledge Graph facts: decisions, milestones, problems, preferences
- Async mining — never blocks the UI
- Pure TypeScript, ~250 lines, no external scripts

Uses these hooks:
- chat.message (triggers sync when user sends a new message)
- event: session.idle (catches the last turn before shutdown)

Setup:
1. Add "teamcode-mempalace-persistence" to plugin in teamcode.json
2. Create AGENTS.md telling the model to search MemPalace via MCP
3. Add identity to ~/.mempalace/identity.txt

Repo: https://github.com/geco/teamcode-mempalace-persistence
npm: teamcode-mempalace-persistence

Happy to hear feedback!

---

## #27748 — [FEATURE]:add skill white list for subagent

📅 `2026-05-15` | ✏️ **2015chunhui** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27748](https://github.com/anomalyco/opencode/issues/27748)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I hope to add a configuration option for the sub-agent to set a whitelist of allowed skills. Currently, it only supports whether skill execution is allowed or not, but does not support setting an allowed skill list.

---

## #27746 — [FEATURE]: Add 'teamcode agents' command for background session management

📅 `2026-05-15` | ✏️ **alanZee** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27746](https://github.com/anomalyco/opencode/issues/27746)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature Description
Add an `teamcode agents` command that provides an interactive TUI interface for managing background agent sessions, similar to Claude Code's `claude agents` command.
## Motivation
Claude Code has a `claude agents` command that opens an interactive TUI view for managing background coding sessions. This allows users to:
- View all running background sessions at a glance
- Switch between sessions easily
- Monitor session status and progress
- Dispatch new sessions with specific settings (model, effort level, permissions)
Currently, TeamCode manages background sessions through CLI commands (`teamcode session list`, `teamcode -s <id>`, `teamcode -c`), which lacks the convenience of a unified interactive interface.
## Proposed Solution
Add a new `teamcode agents` command that:
1. Opens an interactive TUI (similar to the main TeamCode TUI)
2. Lists all background sessions with their status, model, and working directory
3. Allows selecting a session to attach/resume
4. Provides options to start new sessions with configurable settings
5. Shows session statistics (token usage, cost, duration)
Example usage:
```bash
# Open the agents management TUI
teamcode agents
# Filter by working directory
teamcode agents --cwd /path/to/project
# Set default model for new sessions from the TUI
openco

> *[Truncado — 2175 chars totais]*

---

## #27743 — [FEATURE]: Provide git binaries in docker image for easier usage of web ui

📅 `2026-05-15` | ✏️ **thomashaertel** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27743](https://github.com/anomalyco/opencode/issues/27743)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The docker container images don't ship git binaries. Please add them to container image as default, so that web ui can be used out of the box.

Using the official docker image with docker compose to launch web ui by default you just need to pass parameters (e.g. "serve --hostname 0.0.0.0 --port 4096"). To prior install git binaries I needed to implement a workaround with resetting the entrypoint and adding a short shell script.

I use the following `docker-compose.yaml`:

```yaml
services:
  teamcode:
    container_name: teamcode-ai
    image: ghcr.io/anomalyco/opencode:1.15.3
    ports:
      - "4096:4096"

    # Container entrypoint is already the teamcode executable, so we only need to pass launch parameters for the web UI.
    # command: "serve --hostname 0.0.0.0 --port 4096"

    # To install the git executable for the web UI,
    # the entrypoint needs to be reset on startup.
    entrypoint: []
    command: ["sh", "-c", "command -v git >/dev/null 2>&1 || apk add --no-cache git; exec teamcode serve --hostname 0.0.0.0 --port 4096"]

    working_dir: /workspace

    volumes:
      - ./volumes/data:/home/ubuntu/.local
      - ./volumes/config:/root/.config/teamcode
      - ./volumes/projects:/workspace

    environment:
      - OPENCODE_SERVER_USERNAME=${OPENCODE_SERVER_USERNAME:-teamcode}
      -

> *[Truncado — 1559 chars totais]*

---

## #27720 — [FEATURE]: Add Agent Router

📅 `2026-05-15` | ✏️ **Spirt51** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27720](https://github.com/anomalyco/opencode/issues/27720)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

PLZ, add support for Agent Router (agentrouter.org)

---

## #27698 — [FEATURE]: Show the Opencode go plan usage stats in cli itself

📅 `2026-05-15` | ✏️ **aashishsingla567** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27698](https://github.com/anomalyco/opencode/issues/27698)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

See the TeamCode go plan usage stats within the CLI itself.

---

## #27689 — [FEATURE]:Support drag-and-drop for Microsoft Office files (.docx, .xlsx)

📅 `2026-05-15` | ✏️ **BWbear** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27689](https://github.com/anomalyco/opencode/issues/27689)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Description: Currently, the teamcode chat interface does not support dragging and dropping Microsoft Office files (such as .docx and .xlsx). Users are forced to manually provide file paths or convert files to text/PDF before uploading.

Proposed Solution:

Expand the allowed file types in the frontend's drag-and-drop handler to include .docx and .xlsx.
Integrate a backend parsing mechanism (e.g., using python-docx and openpyxl) to convert these documents into a text-based format (like Markdown) that the LLM can process.
Use Case: Many software engineering and administrative tasks involve reading requirements or data stored in Office documents. Direct support would significantly improve the user experience and workflow efficiency.

---

## #27681 — [FEATURE]:Add installed skills management panel to top-right toolbar

📅 `2026-05-15` | ✏️ **Neptune-Illusion** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27681](https://github.com/anomalyco/opencode/issues/27681)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Summary:

Problem: Managing skills in TeamCode desktop is inconvenient
Request: Add a visible installed-skills panel
Location: Desktop UI top-right corner, alongside existing Server / MCP / LSP / Plugins panels
Intent: Make skills discoverable and manageable at a glance, same as other core resources

---

## #27671 — [FEATURE]: Support for TextGen (aka Oobabooga Textgen-Webui) provider

📅 `2026-05-15` | ✏️ **Jawzper** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27671](https://github.com/anomalyco/opencode/issues/27671)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I am moving to this open source alternative to LM Studio, it serves an OpenAI/Anthropic-compatible API at http://127.0.0.1:5000/v1 by default. 

Maybe it's possible to work around but built-in support for the provider (with dynamic model discovery? 🥺) would be great.

---

## #27666 — [FEATURE]:Support passing MCP config in POST /session API for per-session role-based tool access

📅 `2026-05-15` | ✏️ **priyankpaladiya** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27666](https://github.com/anomalyco/opencode/issues/27666)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

When running `teamcode serve` in a shared multi-tenant environment, all sessions
share the same static MCP configuration loaded from `teamcode.json` at startup.
There is no way to pass a dynamic, per-session MCP config at session creation time.

This makes it impossible to implement role-based or user-specific MCP access
without complex workarounds.

## Use Case

A common pattern for teams using `teamcode serve` is:

1. A backend service manages user authentication and roles
2. When a user starts a new chat, the backend knows which MCPs that user
   should have access to
3. The backend calls `POST /session` to create an teamcode session

The problem is at step 3 — there is no way to pass the user's allowed MCP
list to the session. Every session gets the same MCPs regardless of who
the user is or what they should have access to.

## Requested Change

Support an optional `mcp` field in `POST /session`:

```json
POST /session?directory=/workspace/repos/my-repo
{
  "mcp": {
    "my-tool": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-server"],
      "enabled": true
    },
    "my-remote-tool": {
      "type": "remote",
      "url": "https://my-mcp-server.internal/mcp",
      "enabled": true
    }
  }
}
```

This `mcp` config should:
- Apply **only to this session** — not af

> *[Truncado — 1660 chars totais]*

---

## #27659 — [FEATURE]: Render custom/MCP tool output in desktop app (parity with #6604)

📅 `2026-05-15` | ✏️ **tdietert** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27659](https://github.com/anomalyco/opencode/issues/27659)


### Feature hasn't been suggested before.

- [X] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

#6604 / #10649 added collapsible custom and MCP tool output to the TUI. The same gap exists in the desktop app — plugin and MCP tools render as a header-only row with no body, so their output is never visible in the live chat view.

In `packages/ui/src/components/message-part.tsx:1343`, the fallback renderer for unregistered tools is `GenericTool` (`packages/ui/src/components/basic-tool.tsx:263-283`). It accepts only `{tool, status, hideDetails, input?}` — no `output`, no `metadata`, no `children` — even though the `Dynamic` dispatcher at `message-part.tsx:1374-1385` already passes `output` and `metadata` to whichever render function is selected. The data reaches the component layer; the fallback drops it.

For comparison:

- TUI `GenericTool` at `packages/teamcode/src/cli/cmd/tui/feature-plugins/system/session-v2.tsx:480-514` reads `props.output` and renders a 3-line preview with click-to-expand (the fix from #10649).
- Share UI `FallbackTool` at `packages/web/src/components/share/part.tsx:721-755` renders `state.output` via `ContentText`.

So a custom or MCP tool's output is visible in the TUI and in shared session URLs, but not in the live desktop app.

Suggested fix: patch `GenericTool` in `packages/ui/src/components/basic-tool.tsx` to accept `output`/`metadata`/`status`/`defaultOpen` (already p

> *[Truncado — 1721 chars totais]*

---

## #27604 — [FEATURE]: ** At now LSP doesn't work for files that have no extension, like `Dockerfile`, `Makefile`, `Containerfile`, or `CHANGELOG`.

📅 `2026-05-14` | ✏️ **gorsing** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27604](https://github.com/anomalyco/opencode/issues/27604)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description

Currently, teamcode matches LSP servers to files **only by extension** via the `extensions` field. This doesn't work for files that have no extension, like `Dockerfile`, `Makefile`, `Containerfile`, or `CHANGELOG`.

The JSON schema for LSP server entries (`additionalProperties: false`) doesn't include a `filePatterns` field, even though users commonly try to add it expecting it to work.

## Example configuration that doesn't work

```json
{
  "lsp": {
    "docker": {
      "command": ["docker-langserver", "--stdio"],
      "extensions": [".dockerfile"],
      "filePatterns": ["**/Dockerfile", "**/Dockerfile.*", "**/Containerfile", "**/Podmanfile"]
    }
  }
}
```

- `filePatterns` is silently ignored (or causes a validation error) because it's not in the schema
- `extensions: [".dockerfile"]` doesn't match the actual file `Dockerfile` (no extension)

## Expected behavior

Add `filePatterns` support to the LSP config schema and matching logic, so users can associate LSP servers with files by glob patterns in addition to (or instead of) file extensions.

For example:

```json
{
  "lsp": {
    "docker": {
      "command": ["docker-langserver", "--stdio"],
      "extensions": [".dockerfile"],
      "filePatterns": ["**/Dockerfile", "**/Dockerfile.*", "**/Containerfile"]
    },
    "make"

> *[Truncado — 1668 chars totais]*

---

## #27586 — [FEATURE]: RAG & Embedding Search Capability and request to add qwen3-embedding-8b in the go plan

📅 `2026-05-14` | ✏️ **EHMilon** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27586](https://github.com/anomalyco/opencode/issues/27586)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, interacting with large-scale repositories can lead to context-window saturation or "hallucinations" when the model lacks specific project knowledge. I am proposing the integration of a RAG pipeline and Vector Embedding Search into TeamCode.
This will allow the AI to index local files, documentation, and issues, providing highly relevant context to queries without requiring the user to manually attach every file.
Local Vector Store: Implement a lightweight vector database (like ChromaDB or LanceDB) to store file embeddings. 
Indexing Workflow: A background process to chunk and embed repository files.
Context Injection: Automatically retrieving the top-$k$ relevant code snippets and injecting them into the prompt context during chat or autocomplete sessions.

**Model Request:** Qwen3-Embedding-8B To power this, I suggest adding support for qwen/qwen3-embedding-8b in the TeamCode Go plan. because It offers state-of-the-art retrieval performance and handles long-context code chunks more efficiently than smaller 1B-3B models.

Real-World Impact "Knowledge is of two kinds. We know a subject ourselves, or we know where we can find information upon it." — Samuel Johnson By adding RAG, TeamCode moves from the first kind of knowledge to the second. For developers, this means: Instant Onboarding: As

> *[Truncado — 1695 chars totais]*

---

## #27577 — [FEATURE]: outputSchema for mcp tools should be exposed to LLM

📅 `2026-05-14` | ✏️ **bo-tato** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27577](https://github.com/anomalyco/opencode/issues/27577)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

For MCP tools, the optional outputSchema provides information about the output to expect from the tool. But teamcode is not including this in context, only the tool description. According to [the MCP spec](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#output-schema):

> Providing an output schema helps clients **and LLMs** understand and properly handle structured tool outputs by:
> ...
> Guiding clients **and LLMs** to properly parse and utilize the returned data

so I think the information from tool's outputSchema should be included in the LLM context in some way.

---

## #27556 — [FEATURE]: Mistral provider models need prompt_cache_key

📅 `2026-05-14` | ✏️ **alexandru** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27556](https://github.com/anomalyco/opencode/issues/27556)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Mistral's API caching seems to be broken without setting `prompt_cache_key`, at least for mistral-medium-3.5.

See Mistral's official documentation on [prompt caching](https://docs.mistral.ai/studio-api/conversations/advanced/prompt-caching). According to it, cached tokens are priced at %10 of the standard input token price.

Possible issues:
- Mistral's Vibe CLI seems to be [using x-affinity](https://github.com/mistralai/mistral-vibe/blob/v2.9.6/vibe/core/agent_loop.py#L790), although I may be misinterpreting it.
- [models.dev](https://models.dev/?search=mistral+medium+3.5) does not have pricing info on cached reads/writes.

I don't know if this should be classified as a feature or a bug 🤷‍♂️

---

## #27553 — [FEATURE]: Auto-discover models from OpenAI-compatible providers

📅 `2026-05-14` | ✏️ **androidand** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27553](https://github.com/anomalyco/opencode/issues/27553)


## Describe the enhancement you want to request

OpenAI-compatible providers configured with a `baseURL` (e.g. llama-swap, Ollama, LM Studio) serve a `/v1/models` endpoint that lists their available models. Right now you have to list every model manually in `teamcode.json`, which means the config goes stale every time you swap a model on the backend.

This PR adds auto-discovery: on startup, TeamCode calls `GET /v1/models` for each `@ai-sdk/openai-compatible` provider that has a `baseURL` and no statically configured `models`. It reads `id`, `name`, `context_length`/`max_context_length`, and `max_output_tokens` from the response. Manually configured models always win (non-destructive merge), and opt-out is `discoverModels: false` in the provider config.

Discovery runs in parallel across providers with a 2-second timeout per request, so offline servers don't slow startup. Errors are swallowed silently.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

---

## #27541 — [FEATURE]: Built-in browser tool for web interaction

📅 `2026-05-14` | ✏️ **skylangxh** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27541](https://github.com/anomalyco/opencode/issues/27541)


## Description

TeamCode currently lacks a built-in browser capability. Unlike some other AI coding agents (e.g. Claude Code has browser tool, OpenClaw has browser control), TeamCode cannot browse web pages, fill forms, or extract data from websites directly.

## Use cases
- Browse documentation and extract code examples
- Fill web forms and interact with web applications
- Capture screenshots of web pages for debugging
- Web scraping and data extraction
- OAuth/login flows that require browser interaction

## Suggested implementation
A built-in browser tool (like Playwright/Puppeteer-based) that allows the agent to navigate, click, type, and extract content from web pages, similar to what other coding agents provide.

Would greatly enhance TeamCode's autonomy for tasks involving web interaction.

- [x] I have searched for existing issues and this feature has not been requested before

---

## #27526 — [FEATURE]: OPENCODE_DISABLE_EXTERNAL_SKILLS should also skip registering the built-in customize-teamcode skill

📅 `2026-05-14` | ✏️ **criterium** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/27526](https://github.com/anomalyco/opencode/issues/27526)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The built-in skill "customize-teamcode" is registered unconditionally in skill/index.ts lines 250-257:

```
s.skillsCUSTOMIZE_OPENCODE_SKILL_NAME = {
  name: CUSTOMIZE_OPENCODE_SKILL_NAME,
  description: CUSTOMIZE_OPENCODE_SKILL_DESCRIPTION,
  location: "<built-in>",
  content: CUSTOMIZE_OPENCODE_SKILL_BODY,
}

```
There is no config option or env var to skip this registration. The documented workaround (override via a disk SKILL.md with the same name) conflicts with OPENCODE_DISABLE_EXTERNAL_SKILLS=1, because that flag prevents external directories from being scanned — so the override file is never discovered.

PROPOSED FIX
Guard the built-in registration with the same flag that already controls external skill discovery. In skill/index.ts, around line 250:

```
if (!Flag.OPENCODE_DISABLE_EXTERNAL_SKILLS) {
  s.skillsCUSTOMIZE_OPENCODE_SKILL_NAME = { ... }
}
```

WORKAROUND (until the fix is merged)
Add this to your teamcode.jsonc to hide the built-in skill from the
model via the permission system:
```
  "permission": {
    "skill": { "*": "allow", "customize-teamcode": "deny" }
  }
```
Note: the order matters ("*" first, specific name last) because
evaluate() uses findLast. This prevents the skill from appearing in
available_skills and blocks loading it, though the skill is still
registered in memo

> *[Truncado — 2194 chars totais]*

---

## #27514 — [FEATURE]: Add @artem-kuprin/teamcode-toolcost to ecosystem plugins

📅 `2026-05-14` | ✏️ **ArtemKx1** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27514](https://github.com/anomalyco/opencode/issues/27514)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add [@artem-kuprin/teamcode-toolcost](https://github.com/ArtemKx1/teamcode-toolcost) to the Plugins table on the TeamCode Ecosystem page.

It's a published npm package (`@artem-kuprin/teamcode-toolcost`) that provides real-time per-tool token & cost breakdown in the TUI sidebar. List it alongside other community plugins so users can discover it from the official docs.

---

## #27511 — [FEATURE]:Add Suspend/Resume functionality to pause Agent and Subagent execution

📅 `2026-05-14` | ✏️ **zzxzz12345** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27511](https://github.com/anomalyco/opencode/issues/27511)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

🚀 Feature Description
I would like to request a "Suspend/Resume" feature for TeamCode. The goal is to allow users to temporarily pause the output and execution of both the main Agent and Subagents.
💡 Use Case & Motivation
This feature would be incredibly useful for scenarios where I need to switch locations or devices, such as commuting between home and the office. Currently, if I need to stop working, the agent might continue running or lose its immediate state context.
Having a suspend button would allow the agent to:
Pause its current operation gracefully.
Wait until the current tool calling is finished.
Enter a suspended state until I press "Resume" to continue the job from where it left off.
🛠️ Proposed Behavior
Suspend Action: When triggered, the Agent/Subagent should complete its currently running tool call and then halt any further actions or output.
Resume Action: When triggered, the Agent should pick up the task and continue its workflow seamlessly.
This would greatly improve the flexibility of TeamCode for developers who work across different environments throughout the day.

---

## #27472 — [FEATURE]:Support agentId in POST /session API and URL param for web UI

📅 `2026-05-14` | ✏️ **priyankpaladiya** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27472](https://github.com/anomalyco/opencode/issues/27472)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

When using `teamcode serve` with a shared pod setup (multiple users connecting
via `teamcode attach` or browser), there is currently no way to pre-select an
agent when opening a session programmatically or via URL.

The `POST /session` API only accepts `directory` and `workspace` query params.
There is no `agentId` parameter. The web UI URL also has no way to pass an
agent name.

This makes role-based agent selection impossible without hacky workarounds like
writing per-user config files with `default_agent` set.

## Use Case

We run `teamcode serve` on a Kubernetes pod. A dashboard backend authenticates
users via SSO, determines their role (engineer / devops / admin / pm), and
opens an teamcode session for them. Each role has a different agent configured
with different MCP permissions.

Currently the only way to auto-select the agent is to write a per-user
`teamcode.json` with `default_agent` set — which requires creating per-user
session directories, symlinks, and a backend service just to select an agent.

## Requested Change

**1. Support `agentId` in `POST /session`:**
```json
POST /session?directory=/workspace/repos/my-repo&agentId=devops
```

**2. Support `agent` param in web UI URL:**

## Expected Benefit

- Dashboard backends can open sessions with the correct agent pre-selected

> *[Truncado — 1767 chars totais]*

---

## #27464 — [FEATURE]: Add quick permission preset switching in chat UI

📅 `2026-05-14` | ✏️ **Innerpeace1990** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27464](https://github.com/anomalyco/opencode/issues/27464)


## Feature hasn't been suggested before

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

**Current behavior:**
Permission configuration is only available by manually editing `teamcode.jsonc`, and applies as a single global setting. There is no way to quickly switch between different permission levels during a session.

For users who are not comfortable editing JSON configuration, setting up custom permissions has a high barrier to entry.

**Suggested enhancement:**
Add a permission preset selector in the chat UI (e.g., in the toolbar or status bar) that allows users to quickly switch between predefined permission schemes:

- **Default**: teamcode's standard permission model (ask before each sensitive operation)
- **Custom**: reads the user's `permission` config from `teamcode.jsonc`
- **Full access**: allows all operations without prompting, suitable for trusted environments where maximum productivity is needed

This would allow users to:
- Start a session in Full access mode for trusted, repetitive tasks
- Switch to Default mode when more caution is needed
- Use Custom for finely-tuned permission configurations
- Change permission levels without restarting or editing config files

Related: #23258 (permission model too noisy for autonomous sessions)

**Environment:**
- OS: Windows 11 (Build 26200, 25H2)
- teamcode Desktop: v1.14.50

---

## #27463 — [FEATURE]: Add close confirmation or minimize-to-tray support for Desktop app

📅 `2026-05-14` | ✏️ **Innerpeace1990** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27463](https://github.com/anomalyco/opencode/issues/27463)


## Feature hasn't been suggested before

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

**Current behavior:** Clicking the close button (X) in the Desktop app immediately terminates the application with no confirmation prompt. This means:

- Accidental clicks cause immediate session loss
- Long-running Agent tasks are interrupted without warning
- No way to keep teamcode running in the background while switching to other applications

**Suggested improvements:**

**Option A — Close confirmation dialog:**
Add a confirmation prompt before closing (e.g., a dialog asking the user to confirm closure). This prevents accidental closure.

**Option B — Minimize to system tray:**
When the user clicks close, minimize the application to the system tray instead of terminating it. This would allow:

- Long-running Agent tasks to continue in the background
- Users to quickly restore the window via the tray icon
- A common pattern used by many desktop applications (Slack, Discord, VS Code, etc.)

Both options could coexist as a configurable preference in settings.

**Environment:**
- OS: Windows 11 (Build 26200, 25H2)
- teamcode Desktop: v1.14.50

---

## #27462 — [FEATURE]: Support custom API parameter passthrough in variants for custom providers

📅 `2026-05-14` | ✏️ **Innerpeace1990** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27462](https://github.com/anomalyco/opencode/issues/27462)


## Feature hasn't been suggested before

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

**Background:**
When configuring a custom provider using `@ai-sdk/openai-compatible` (e.g., Zhipu AI, DeepSeek, Moonshot/Kimi), the `variants` field in the model configuration does not pass custom parameters through to the API request body.

**Reproduction:**
Configuration:
```jsonc
glm-5v-turbo: {
  name: GLM-5V-Turbo,
  variants: {
    think: { thinking: { type: enabled } },
    fast:  { thinking: { type: disabled } }
  }
}
```
The variant dropdown correctly shows Think and Fast options in the UI, but checking the API request logs reveals that the `thinking` parameter is **not included** in the request body sent to the provider's API.

**Evidence:**
Log entry (from error-level request logging):
```json
{requestBodyValues:{model:glm-5v-turbo,max_tokens:32000,messages:[...]}}
```
Note: no `thinking` field present, despite the variant being selected.

**Root cause:**
Looking at the teamcode config schema (`config.json`), the `variants` object per variant only defines a `disabled` property:
```json
variants: {
  type: object,
  additionalProperties: {
    type: object,
    properties: {
      disabled: { type: boolean }
    }
  }
}
```
Custom properties like `thinking` are silently ignored since they are not recognized by the schema.

Built-in providers (OpenAI, Anthropic, Google) work correctly because 

> *[Truncado — 2515 chars totais]*

---

## #27453 — [FEATURE]: TodoWrite tasks should auto-mark complete or prompt on completion

📅 `2026-05-14` | ✏️ **LifetimeVip** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27453](https://github.com/anomalyco/opencode/issues/27453)


- [x] I have searched for existing issues and the feature has not been suggested before

### Problem / Need

When using the TodoWrite tool to manage tasks, there is no automatic detection of task completion. The assistant must manually call TodoWrite again to mark each task as "completed" after finishing the work.

This creates a poor UX:
1. Tasks remain stuck "in_progress" even after the work is clearly done
2. The user has to explicitly notice and ask about incomplete-looking tasks
3. It adds unnecessary overhead to remember to update the todo list mid-workflow

### Suggested Solution

Either:
- Auto-detect when a task has been accomplished (based on relevant file edits, tool calls, etc.) and mark it complete automatically, OR
- When the assistant signals completion of a logical work unit, automatically prompt to update the todo list statuses

### Additional Context

Environment: Windows 11, teamcode CLI. Encountered during a multi-step codebase scanning session. Related to #18071 (persistent todos) but this is about completion marking rather than persistence.

---

## #27439 — [FEATURE]:skill tool should show summary/preview instead of full SKILL.md content

📅 `2026-05-14` | ✏️ **Ant576** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27439](https://github.com/anomalyco/opencode/issues/27439)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

每次执行 /skill 加载技能时，工具会把整个 SKILL.md 的内容（有时数千字）全部输出到对话中。对于已经熟悉该技能的用户来说，这些重复的长篇文档占据了大量上下文空间，降低了交互效率。可以在设置里面提供显示与不显示开关

---

## #27397 — [FEATURE]: Add built-in Pyrefly Python LSP support

📅 `2026-05-13` | ✏️ **MRNAQA** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27397](https://github.com/anomalyco/opencode/issues/27397)


I have verified this feature I'm about to request hasn't been suggested before.

I would like teamcode to support Pyrefly as a built-in Python language server.

Today teamcode has built-in Python LSP support for `pyright` and experimental `ty`, but users who prefer Pyrefly need to configure it manually. Pyrefly v1 is stable, exposes a standalone language server as `pyrefly lsp`, and can be installed as a stable executable with `uv tool install pyrefly`.

Proposed minimal behavior:

- Add a built-in `pyrefly` LSP entry for `.py` and `.pyi` files.
- Launch it with `pyrefly lsp` when the user has installed the `pyrefly` binary.
- Document `uv tool install pyrefly` as the recommended system setup, with pip/conda/project-env installs as alternatives.
- Keep this opt-in initially behind `OPENCODE_EXPERIMENTAL_LSP_PYREFLY=true`.
- Do not auto-install Pyrefly.
- Ensure Pyrefly does not run at the same time as `pyright` or experimental `ty` for the same Python files, to avoid duplicate diagnostics and completions.

---

## #27383 — [FEATURE]: Add OIDC server authentication

📅 `2026-05-13` | ✏️ **ZanzyTHEbar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27383](https://github.com/anomalyco/opencode/issues/27383)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

TeamCode server auth currently supports disabled or Basic auth. Exposed server deployments need first-class OIDC support for browser, API, SDK, and UI access without relying on shared Basic credentials.

Requested behavior:

- Support configurable server auth modes: disabled, basic, oidc.
- Preserve existing Basic auth environment compatibility.
- Add browser OIDC login/callback with a signed HTTP-only session cookie.
- Accept Bearer JWTs for API and SDK clients.
- Document setup and verification.

This overlaps with #24874 around Bearer token support, but extends the same server auth layer to full OIDC login/session handling for browser/UI deployments.

---

## #27370 — [FEATURE]:Option to always start sessions in the configured default agent mode

📅 `2026-05-13` | ✏️ **ezzems** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27370](https://github.com/anomalyco/opencode/issues/27370)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Problem**

> When default_agent is set to "plan" in the config, new sessions correctly start in Plan mode. However, when reopening an old session that ended in Build mode, it restores the last-used mode (Build) instead of respecting the default_agent config.
> This means I have to manually switch back to Plan mode every time I resume an old session, which defeats the purpose of having a default configured.

**Proposed Solution**

> Add a config option (e.g., "always_use_default_agent": true) that forces all sessions — including resumed ones — to start in the configured default_agent mode, ignoring the persisted session state.
> Alternatively, the existing default_agent setting could always take precedence over the session's saved mode when opening any session.

**Use Case**

> I prefer to always start in Plan mode so I can review context before switching to Build. Having old sessions open in Build mode unexpectedly can lead to unintended changes if I start typing without noticing the mode.

---

## #27366 — [FEATURE]: Extend "experimental.session.compacting" Output to Allow Skipping Internal Logic

📅 `2026-05-13` | ✏️ **FullStackPlayer** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27366](https://github.com/anomalyco/opencode/issues/27366)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Version
Current version: `1.14.48`

## Environment
Pure code logic, environment-agnostic.

## Problem Description
Exposing the context compaction hook in TeamCode is a brilliant design choice. It allows us to control the compaction behavior via plugins to ensure minimal information loss. The current state of this hook is as follows:

### experimental.session.compacting
**Parameters**:
- input: `{ sessionID: string }`
- output: `{ context: string[]; prompt?: string }`

**Caller**:
- There is only one caller at `session/compaction.ts:404-408`

### The Issue
The current problem is that even after we intervene in the context compaction via a plugin, TeamCode still proceeds to execute its internal compaction logic. Ideally, if a plugin has already handled the compaction, the context should be considered optimized. But TeamCode internal logic will unconditionally compress our processed high-quality context again, it may cause the loss of useful information.

## Improvement Suggestions
Enrich the Output data structure to allow skipping TeamCode's internal compaction logic.

### experimental.session.compacting
**Parameters**:
- input: `{ sessionID: string }`
- output: `{ context: string[]; prompt?: string; skip?: boolean; }`

Use the `skip` flag to indicate whether the internal compaction process should 

> *[Truncado — 1726 chars totais]*

---

## #27364 — [FEATURE]: Enhance Input/Output Structure of "experimental.chat.system.transform" and "experimental.chat.messages.transform" Hooks for Better Usability

📅 `2026-05-13` | ✏️ **FullStackPlayer** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27364](https://github.com/anomalyco/opencode/issues/27364)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Version
Current version: `1.14.48`

## Environment
Pure code logic, environment-agnostic.

## Problem Description

While developing an TeamCode plugin, I discovered the `experimental.chat.system.transform` and `experimental.chat.messages.transform` hooks.

I was excited because they seemed perfect for fine-tuning system prompts and message history for each prompt. However, I quickly realized they didn't meet my expectations due to a shared limitation: the Input and Output data structures are insufficient. See the details below:

### experimental.chat.system.transform

**Parameters**:
- input: `{ sessionID?: string; model: Model }`
- output: `{ system: string[] }`

**Callers**:
- Caller 1: `session/llm.ts:118-121` (Normal LLM call)
- Caller 2: `agent/agent.ts:451` (Agent generation, without session context)

### experimental.chat.messages.transform

**Parameters**:
- input: `{}`
- output: `{ messages: { info: Message; parts: Part[] }[] }`

**Callers**:
- Caller 1: `session/prompt.ts:1587` (Normal LLM call)
- Caller 2: `session/compaction.ts:411` (During compaction)

### Common Issue
`sessionID` and `messageID` are important pieces of data for determining whether and how we should process the system prompt and message history for the current prompt. I suggest adding them to the input structure. (Of

> *[Truncado — 2213 chars totais]*

---

## #27363 — [FEATURE]: Prompt as URL param for external tools integration with OC web

📅 `2026-05-13` | ✏️ **simoncrypta** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27363](https://github.com/anomalyco/opencode/issues/27363)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It will be great to be able to start a web TeamCode session with a prompt injected in the URL.

A good use case is Linear, which offers this feature: 
<img width="706" height="458" alt="Image" src="https://github.com/user-attachments/assets/5a4a23cd-253a-4456-8aec-1a5edf206c0f" />

This can also be useful for any in-house tools, mostly related to task management.
 
Making this:
`http://localhost:4097/{working_directory}/session?prompt={prompt}`
possible

---

## #27359 — [FEATURE]: Async background compaction — don't block chat input

📅 `2026-05-13` | ✏️ **4nur44g** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27359](https://github.com/anomalyco/opencode/issues/27359)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

# Problem
When auto-compaction fires (compaction.auto: true), it runs synchronously in the session loop, freezing the prompt input until it completes. On slow models or large contexts, this can lock the user out for minutes. The TUI becomes unresponsive and you can't even type.

# Proposed behavior

- Compaction runs as a background job — user keeps chatting uninterrupted
- New messages sent during compaction get appended to the uncompacted history
- Once compaction finishes, the old history gets replaced by the compacted summary
- A toast or indicator shows "Compacting…" while it runs
- On completion, emit session.compacted and swap in the compacted context

# Existing foundation
SDK already defines CompactionPart and EventSessionCompacted — the event plumbing is there, only the execution path needs to become non-blocking.

# Config
Could expose a toggle (default false for safety):
```
"compaction": {
  "auto": true,
  "background": true
}
```

---

## #27325 — Feature Request: Built-in Ask Agent for Read-Only Project Conversations

📅 `2026-05-13` | ✏️ **carloswps** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27325](https://github.com/anomalyco/opencode/issues/27325)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary

Please consider adding a built-in `Ask` agent mode dedicated to conversational interaction with the codebase, without any permission to modify files.

## Problem

Currently, the default workflows are mainly focused on planning or implementation. However, many developers frequently need a lightweight conversational mode for:

- understanding the project structure
- discussing architecture decisions
- asking questions about the codebase
- debugging concepts collaboratively
- exploring ideas safely

Using Plan/Build-oriented agents for this creates unnecessary friction and can accidentally trigger edits, tool calls, or workspace modifications.

## Proposed Solution

Add a native `Ask` mode with:

- read-only project access
- no file modifications
- no file creation/deletion
- no destructive terminal commands
- optimized conversational behavior
- ability to inspect and reference project files safely

## Example Workflow

- Ask → discussion and exploration
- Plan → task decomposition and strategy
- Build → implementation and execution

This separation would make the UX much clearer and safer.

## Additional Context

Many users already try to emulate this behavior with custom agents because conversational interaction is an important part of day-to-day development workflows.

Thanks for the gre

> *[Truncado — 1511 chars totais]*

---

## #27303 — [FEATURE]: Official TeamCode Go/Zen BYOK language model provider extension for VSCode Copilot

📅 `2026-05-13` | ✏️ **Gr33nLight** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27303](https://github.com/anomalyco/opencode/issues/27303)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

VSCode today improved support for BYOK and the use of external language model provider extensions with Copilot. 
https://code.visualstudio.com/docs/copilot/customization/language-models#_bring-your-own-language-model-key

There are a couple of unofficial extensions adding this support in Copilot, I was wondering if there is a plan to add an official extension to support TeamCode Go/Zen.

https://marketplace.visualstudio.com/items?itemName=enough.teamcode-zen-chat-provider-reasoning
https://marketplace.visualstudio.com/items?itemName=OnesoftQwQ.teamcode-go-copilot-provider

Thanks!!

---

## #27263 — [FEATURE]: support structuredContent in responses of MCP

📅 `2026-05-13` | ✏️ **miemoe** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27263](https://github.com/anomalyco/opencode/issues/27263)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I'd like to use TeamCode in compination with QtCreator.
QtCreator recently added an option to run as an MCP server.
https://doc.qt.io/qtcreator/creator-how-to-mcp-server.html#:~:text=Qt%20Creator%20supports%20the%20model%20context%20protocol%20%28MCP%29,MCP%20server%20extension%20to%20start%20the%20MCP%20server.

However the response coming from this MCP is in the format:

`07:00:00.628 mcp.server.io: Writing response: {"id":9,"jsonrpc":"2.0","result":{"content":[],"isError":false,"structuredContent":{"failures":["tst_serializer::xmlRoundtrip","tst_serializer::readFileDetectsXml"],"summary":{"blacklisted":0,"build_failed":false,"duration_ms":1,"failed":2,"fatal":0,"passed":16,"skipped":0,"total":18},"summary_text":"16 passed, 2 failed, 0 skipped in 1 ms","tests_with_warnings":[]}}}`

The LLMs I tried all respone: empty answer. Some tell, that there seems to be a structuredContent that TeamCode does not seem to transport to the LLM.

As you can see, the "content" in the answer is empty.

Should TeamCode have a mechanism to transport the structuredContent to the LLM is the content is empty?

Currently TeamCode cannot communicate with QtCreator.

---

## #27260 — [FEATURE]: Add Coffee theme

📅 `2026-05-13` | ✏️ **VilchisJuan** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27260](https://github.com/anomalyco/opencode/issues/27260)


### Feature hasn't been suggested before.
- [x] I have verified this feature I'm about to request hasn't been suggested before.
### Describe the enhancement you want to request
I would like the option to be able to use a warm Coffee theme for reduced eye strain during long coding sessions.
After long hours of continuous teamcode use , the existing high-contrast and blue-heavy themes cause significant eye fatigue and irritation for me and I think other users could benefit from this change. 
## Proposed Solution
A new built-in **Coffee** theme with a warm, low-contrast palette inspired by natural coffee tones:
- **Reduced blue light** — warm browns and beiges instead of cool grays/blues
- **Gentle contrast ratios** — softer transitions between background and text layers
- **Muted accents** — desaturated functional colors that remain distinguishable without being jarring
### Color approach
- Dark mode: deep espresso backgrounds (#1E120C → #3D2B1F) with latte-colored text (#FED8B1, #ECB176)
- Light mode: warm parchment (#FAF3EB) with dark roast text (#2C1810)
- Primary: #6F4E37 (coffee brown) and #ECB176 (caramel)
## Why This Belongs in TeamCode
- Fills an accessibility gap for sustained-use eye comfort
- Static theme files only, no runtime logic changes
- Low maintenance — follows existing theme patterns exactly

---

## #27241 — [FEATURE]:I hope /connect can be connected to Thinkflow by Youdao, the newly launched one.

📅 `2026-05-13` | ✏️ **yuwenlong** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27241](https://github.com/anomalyco/opencode/issues/27241)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I hope /connect can be connected to Thinkflow by Youdao, the newly launched one.

Official website: https://ai.youdao.com/new/thinkflow

---

## #27167 — [FEATURE]: Add native session goals with /goal

📅 `2026-05-12` | ✏️ **jorgitin02** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/27167](https://github.com/anomalyco/opencode/issues/27167)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

TeamCode has custom slash commands, but there is no native persistent session goal/lifecycle feature.

Proposal: add one persisted goal per session, exposed through shared server APIs so TUI and desktop app clients can view, set, edit, pause, resume, clear, and observe it. Active goals can continue when idle, track token/time usage, support optional token budgets, and let the model mark a goal complete only after verification.

This is not implementable as a command template because it needs persistence, runtime continuation, usage accounting, and client sync/status surfaces.

Related but broader than #23578 and #18636: this request covers a first-class per-session goal domain, shared API/SDK surface, TUI and macOS app support, runtime continuation, and model-visible goal tools with restricted mutation semantics.

---

## #27161 — [FEATURE]: add dynamic MCP headersHelper support for remote authentication

📅 `2026-05-12` | ✏️ **dialupdisaster** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27161](https://github.com/anomalyco/opencode/issues/27161)


## Summary
Add native support for dynamic authentication headers for remote MCP servers.

The main use case is short-lived bearer tokens or other custom auth flows that cannot be represented cleanly with static `headers` and do not fit the existing OAuth path.

## Proposed shape
Add a structured `headersHelper` object on remote MCP servers, for example:

```json
{
  "headersHelper": {
    "command": ["node", "./scripts/mcp-headers.js"],
    "environment": {
      "PROFILE": "prod"
    },
    "timeout": 10000
  }
}
```

## Proposed behavior
- run the helper on connect and reconnect
- no caching in v1
- helper stdout must be a JSON object of string headers
- helper-produced headers override static `headers`
- require trust approval before executing project-local or remote-config helpers

## Why this would help
Today TeamCode supports static headers and OAuth, but some MCP servers need custom auth headers generated at runtime.

## Notes
I have a local implementation draft for this, but I do **not** want to open a PR until the core team confirms the design is acceptable.

If this direction looks good, I can open a focused PR with the code, tests, docs, and generated SDK/OpenAPI updates.

---

## #27110 — [FEATURE]: Setting to limit max number of parallel subagents

📅 `2026-05-12` | ✏️ **Kangaroux** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27110](https://github.com/anomalyco/opencode/issues/27110)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

With local models you're limited by context/memory. If your system can't support parallel context, tasks end up taking far longer since it has to reprocess context each time it switches between tasks.

If an agent starts 5 parallel subagents:
- max=1: tasks are run sequentially with no parallelization
- max=3: (3) tasks are run in parallel, the remaining two sit in a blocked state
- max=999 (or whatever): infinite parallelization 

EDIT: For comparison, a task I would expect to take 5 minutes when worked on by a single agent ends up taking 45 minutes when I have 5 in parallel.

`llama-server` logs are filled with stuff like this:

```
slot update_slots: id  0 | task 6389 | Checking checkpoint with [46119, 46119] against 11855...
slot update_slots: id  0 | task 6389 | Checking checkpoint with [45607, 45607] against 11855...
slot update_slots: id  0 | task 6389 | Checking checkpoint with [44756, 44756] against 11855...
slot update_slots: id  0 | task 6389 | Checking checkpoint with [44244, 44244] against 11855...
slot update_slots: id  0 | task 6389 | Checking checkpoint with [42590, 42590] against 11855...
slot update_slots: id  0 | task 6389 | Checking checkpoint with [42233, 42233] against 11855...
slot update_slots: id  0 | task 6389 | Checking checkpoint with [42126, 42126] against 11855...
slot 

> *[Truncado — 3525 chars totais]*

---

## #27032 — [FEATURE]: Display running time

📅 `2026-05-12` | ✏️ **melohagan** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27032](https://github.com/anomalyco/opencode/issues/27032)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently when running a prompt, I see this animation:

<img width="281" height="122" alt="Image" src="https://github.com/user-attachments/assets/40bcb2c0-94a8-4e26-8212-7d5b708cac93" />

I would like a time showing how long the prompt has been running for (even and especially if it is hanging).

Something like 

> **esc** interrupt (2m 4s)
 //and ticking up over time until it comes to an end. Or the timer could be beside the model provider, I don't mind where it goes.

When it does finish I can see the total time taken:

<img width="281" height="42" alt="Image" src="https://github.com/user-attachments/assets/37f15f35-6c7d-4ef4-9c0d-2dda648bc6b7" />

However I want to see the time ticking up while it is running as well. 

Note, Codex CLI does this as an example. 

The reason this is particularly useful for teamcode imo is that there are so many models and providers that having this performance feedback without having to wait for completion is useful. 
I also forget sometimes when I actually started a prompt running, and if I need to cancel it or not, if it's been running too long.

---

## #27031 — [FEATURE]: propagate outgoing trace context to spawned tool subprocesses

📅 `2026-05-12` | ✏️ **jlguerreiro** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27031](https://github.com/anomalyco/opencode/issues/27031)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

When TeamCode spawns tool subprocesses (shell tool, stdio MCP transports, LSP servers, formatter, git, etc.), it does not propagate the active OTel context. Tools that emit their own telemetry land in disconnected root traces, breaking continuity between the TeamCode invocation and the work the tool performed. 
  
## Expected behavior
  
When TeamCode spawns a tool subprocess, the OTel context active at spawn time should be propagated via the standard `TRACEPARENT` (and `TRACESTATE` when non-empty) env vars, per the [OTel environment variable carrier spec](https://opentelemetry.io/docs/specs/otel/context/api-propagators/#textmap-propagator). Tool subprocesses that emit OTel-instrumented telemetry should appear as children of teamcode's invocation trace.

## Scope
  
Every subprocess spawn site:

  - Shell tool (`packages/teamcode/src/tool/shell.ts`)
  - Stdio MCP transports (`packages/teamcode/src/mcp/index.ts` → `StdioClientTransport`)
  - All Effect-based `spawner.spawn` callers (LSP servers, git/worktree, format, snapshot, project, etc.) — these route through `packages/core/src/cross-spawn-spawner.ts`, so a single injection point there covers them all. 
   
## Related

Sibling to #18801, which covers the inbound direction (extracting `traceparent` from incoming HTTP requests). Togethe

> *[Truncado — 1587 chars totais]*

---

## #27024 — [FEATURE]: enrich Effect spans with operand attributes

📅 `2026-05-12` | ✏️ **jlguerreiro** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27024](https://github.com/anomalyco/opencode/issues/27024)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

 Most `Effect.withSpan` / `Effect.fn` call sites in teamcode emit spans whose name reveals what happened but not what it operated on. 

  Examples of currently attributeless spans:
  
  - `Plugin.trigger` — no hook name
  - `FileSystem.{readJson, writeWithDirs, findUp}` — no file path
  - `Session.{updateMessage, updatePart, findMessage, messages, setSummary}` — no session/message/part ID
  - `SessionSummary.{computeDiff, summarize}`, `SessionCompaction.prune`, `SessionProcessor.{process, cleanup}`, `Snapshot.track`, `Truncate.cleanup`, `Instruction.clear`, `Auth.{get, all}`, `Provider.{getLanguage, getProvider}` — no operand identifier
    
  The existing `Tool.execute` site (which already carries `tool.name`, `session.id`, `message.id`, `tool.call_id`) is the reference pattern.
  
  ### Proposal
  
  Attach semantic attributes to each `Effect.withSpan` / `Effect.fn` call site for the operand it acts on, reusing the attribute keys already established by `Tool.execute` (`session.id`, `message.id`, `tool.name`, etc.) and adding new ones where natural (`plugin.hook`, `file.path`, `provider.id`, `model.id`, `part.id`, `snapshot.hash`, …).

---

## #27021 — [FEATURE]:add /overtime command to customize retry timeout for network resilience

📅 `2026-05-12` | ✏️ **SuperMouboom** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27021](https://github.com/anomalyco/opencode/issues/27021)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I frequently encounter `429 Too Many Requests` or `cannot connect API` errors during long sessions. Currently, when switching networks (e.g., VPN, Wi-Fi), I have to manually stop the session, resend messages, and re-verify connectivity. This creates a very disruptive debugging experience.
﻿
I propose adding an `/overtime` command that allows users to define a global retry/wait duration. This enables TeamCode to automatically handle transient network failures without manual intervention.

<img width="1338" height="262" alt="Image" src="https://github.com/user-attachments/assets/73849f10-ed0c-4304-b845-c6f225a70bbf" />

---

## #27020 — [FEATURE]: Scrollbar in VS code teamcode extention

📅 `2026-05-12` | ✏️ **AsifZaman777** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27020](https://github.com/anomalyco/opencode/issues/27020)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The VS code teamcode extension doesnt consist any scrollbar option. So please add the feature

---

## #27008 — [FEATURE]:I would like to add the copy image capability into teamcode in order to read the image and transfer to text similar like claude, is possible?

📅 `2026-05-12` | ✏️ **maugomez77** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27008](https://github.com/anomalyco/opencode/issues/27008)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

[FEATURE]:I would like to add the copy image capability into teamcode in order to read the image and transfer to text similar like claude, is possible?

---

## #27004 — [FEATURE]: Add Agent configuration panel in Desktop UI (list, add, enable/disable)

📅 `2026-05-12` | ✏️ **mrdonghe** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27004](https://github.com/anomalyco/opencode/issues/27004)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Is your feature request related to a problem? Please describe.**  
Currently, Agent configuration and management can only be done via the command line or by manually editing configuration files. This is not very intuitive for users who prefer using the desktop client. For example, if I want to view all configured agents, temporarily disable a specific agent, or quickly add a new custom agent, I have to leave the desktop environment and use the terminal or edit files. This creates a fragmented experience and reduces efficiency.

**Describe the solution you'd like**  
I would like to see a dedicated **Agent configuration panel** added to the TeamCode Desktop application, with the following capabilities:

1. **List existing agents**  
   - Display all available agents (both built-in and user-defined) in a list or card layout.  
   - Show basic information for each agent: name, description, status (enabled/disabled), type, etc.

2. **Add new agents**  
   - Provide an "Add Agent" button or form.  
   - Allow users to enter agent name, description, execution command, environment variables, and other necessary settings.  
   - Support quick creation from a predefined template (e.g., the format defined in `AGENTS.md`).

3. **Enable / disable agents**  
   - Add a toggle switch next to each agent to dynam

> *[Truncado — 2533 chars totais]*

---

## #26995 — [FEATURE]: Add release age filtering to teamcode upgrade

📅 `2026-05-12` | ✏️ **yoshi-taka** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26995](https://github.com/anomalyco/opencode/issues/26995)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

teamcode upgrade currently upgrades dependencies to the latest available versions immediately, including packages published only moments ago.

It would be useful to support a minimumReleaseAge-style mechanism for upgrade operations, so recently published package versions can be temporarily avoided during upgrades.

This could help reduce exposure to compromised publishes, accidental bad releases, semver regressions, and ecosystem instability immediately after release, while providing more predictable and stable upgrade behavior.

---

## #26970 — [FEATURE]: File editor

📅 `2026-05-12` | ✏️ **gmztech** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26970](https://github.com/anomalyco/opencode/issues/26970)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

We need to be able to edit files manually. As any other code editor

---

## #26925 — [FEATURE]: Task tool should support `model` parameter for cost-optimized multi-agent orchestration

📅 `2026-05-11` | ✏️ **danielpsf-grover** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26925](https://github.com/anomalyco/opencode/issues/26925)


## Problem

When using TeamCode as an orchestrator that launches multiple sub-agents via the Task tool, **there is no way to specify which model each sub-agent should use**. The `subagent_type` parameter only accepts `general` or `explore` — there is no `model` parameter.

This means every sub-agent runs on the same (expensive) model as the orchestrator, even when the sub-agent's task is simple data gathering that a cheaper model could handle perfectly.

### Real-world example (anonymized)

I asked TeamCode (using GitHub Copilot as a provider) to audit Kubernetes resource usage across multiple clusters. The orchestrator launched 5 sub-agents in parallel:

| Sub-agent Task | Complexity | Ideal Model | Actual Model |
|---|---|---|---|
| Call Datadog MCP tools, collect metrics | LOW — tool calls only | cheap (e.g. gpt-4o-mini, sonnet) | claude-opus-4.6 |
| Call Grafana MCP tools, collect metrics | LOW — tool calls only | cheap | claude-opus-4.6 |
| Run kubectl commands, parse JSON | LOW — shell + parse | cheap | claude-opus-4.6 |
| Search GitHub files, read YAML | LOW — file reads | cheap | claude-opus-4.6 |
| Cross-validate 3 datasets, write analysis report with 18 action specs | HIGH — reasoning + synthesis | expensive (opus) | claude-opus-4.6 |

4 out of 5 agents were doing simple tool-calling work that any cheap model handles well. Only the final analysis agent needed heavy reasoning. But all 5 burned premium tokens at the orchestrator's model tier.

## Proposed Solution

Ad

> *[Truncado — 3888 chars totais]*

---

## #26918 — [FEATURE]: Add right-click context menu to File Explorer panel (Copy Path, Rename, Delete, etc.)

📅 `2026-05-11` | ✏️ **datacodexlab** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26918](https://github.com/anomalyco/opencode/issues/26918)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Summary

The file explorer panel in TeamCode currently lacks a right-click context menu. Adding standard context menu options would bring TeamCode's file explorer in line with every major code editor.

### Problem

Users currently cannot:
- Copy a file's absolute or relative path with a right-click.
- Perform common file operations (rename, delete, create new file) directly from the file explorer.
- Open a file in a specific way (e.g., open in terminal, reveal in system explorer).

This forces users to switch to the terminal or their OS file manager to perform basic operations, breaking workflow continuity.

### Proposed Solution

Add a context menu on right-click in the file explorer panel with the following actions:

| Action | Description |
|--------|-------------|
| **Copy Path** | Copies the absolute path of the selected file/folder |
| **Copy Relative Path** | Copies the path relative to the project root |
| **Rename** | Inline rename of the file/folder |
| **Delete** | Delete with confirmation prompt |
| **New File** | Create a new file in the selected directory |
| **New Folder** | Create a new folder in the selected directory |
| **Open in Terminal** | Open a terminal at the selected folder location |
| **Reveal in File Explorer** | Open the system file manager at that location |

### W

> *[Truncado — 2043 chars totais]*

---

## #26915 — [FEATURE]: Add RTL (Right-to-Left) language support in the chat panel

📅 `2026-05-11` | ✏️ **datacodexlab** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26915](https://github.com/anomalyco/opencode/issues/26915)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Summary

TeamCode currently does not support RTL text rendering in the chat panel. Arabic, Hebrew, and Persian-speaking users experience broken text alignment and poor readability when writing in their native languages.

### Problem

When a user types in Arabic (or any RTL language) in the chat input:
- Text alignment is LTR by default, making RTL text appear reversed or unreadable.
- There is no option to manually switch the chat panel direction.
- Mixed LTR/RTL content (e.g., Arabic prompt + English code) is not handled gracefully.

### Proposed Solution

1. **Auto-detect text direction** using the Unicode Bidirectional Algorithm (bidi) — automatically switch alignment based on the first characters typed.
2. **Manual toggle** — allow users to set a preferred text direction in settings:
   ```json
   {
     "chat": {
       "textDirection": "auto"
     }
   }
   ```
   Options: `"auto"` | `"ltr"` | `"rtl"`
3. **Per-message direction** — each chat bubble should render in the correct direction based on its content language.

### Why This Matters

Arabic-speaking developers are a significant and growing user base in the Middle East and globally. RTL support is a basic accessibility requirement for these users and is standard in all major chat-based tools (Slack, Discord, VS Code chat extensions).


> *[Truncado — 1748 chars totais]*

---

## #26891 — [FEATURE]:Auto-load user-defined skills from ~/.config/teamcode/skills/

📅 `2026-05-11` | ✏️ **zhulei1983-dotcom** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26891](https://github.com/anomalyco/opencode/issues/26891)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request


---

## Expected Behavior

I want: **custom skills to be automatically available whenever I create a new project or a new session**, just like built-in skills.

So that I can:
- Directly use `task(load_skills=["rtl-review", "csr-csv-spec"])` in any project
- Avoid duplicating skill files in every project
- Call `skill("rtl-review")` in new sessions without extra setup

---

## Current Workaround

Currently I have to manually copy-paste skill file contents into task prompts — it's very inconvenient.

---

## Proposed Solution

Modify the `skill` tool and task loading mechanism to support loading user-defined skills from these paths:

| Priority | Path | Description |
|----------|------|-------------|
| High | `./.teamcode/skills/` | Project-level |
| Low | `~/.config/teamcode/skills/` | Global-level |

Reference other tools' approaches:
- npm: looks up `node_modules` in both global and local directories
- git: global `~/.gitconfig` + local `.git/config` with override

---

## Impact

This feature would benefit users who:
1. Share the same methodology across multiple projects (e.g., ASIC circuit review)
2. Need to reuse knowledge base across sessions
3. Want "configure once, work everywhere" behavior

---

## #26885 — [FEATURE]: Re-allow plan mode permission bypass

📅 `2026-05-11` | ✏️ **guiopen** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26885](https://github.com/anomalyco/opencode/issues/26885)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

In [v1.14.46](https://github.com/anomalyco/opencode/releases/tag/v1.14.46) there was this fix: "Fixed a Plan Mode security bypass where subagents could ignore parent-agent deny rules."

The problem is that this broke some ways of using and optimizing TeamCode. For example, my use case was having very limited permissions on the plan agent, and having a small research subagent that was capable of search, fetch and sleep (custom tool to avoid search rate limits). Now I am forced to allow these tools in the plan agent, bloating the context and making the agent calling these tools against my will a possibility that was not there before.

Maybe a good solution would be a new 'allow_subagent_bypass' setting or something similar that enables the old behaviour.

"it's not a bug, it's a feature."

---

## #26863 — [FEATURE]: Auto-Detect and Sync Local/Remote Ollama Models

📅 `2026-05-11` | ✏️ **nilomind-code** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26863](https://github.com/anomalyco/opencode/issues/26863)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

# Auto-detect and dynamically load Ollama models via CLI or `/api/tags` endpoint

Currently, TeamCode requires manual configuration of available models in `teamcode.json`. For users who already have Ollama installed or running (locally or remotely), this creates redundant setup friction. This feature proposes automatic model discovery by querying the Ollama binary or HTTP API, dynamically populating the model picker, and supporting custom host/port configuration for non-default instances.

Motivation
- Reduces initial setup time and manual JSON maintenance
- Aligns with the behavior of other modern AI tooling that auto-discovers local backends
- Lowers the barrier to entry for developers who manage multiple local/private models
- Creates a reusable pattern for discovering other local inference servers in the future

Proposed Behavior

1. On startup or when opening the model selection UI, check if `ollama` is available in the system PATH.
2. If found, fetch available models using:

- Primary: `http://<host>:<port>/api/tags`
- Fallback: `ollama list --json`

3. Parse the response and dynamically populate the model picker with model names and metadata (name, size, last modified).
4. If the default `localhost:11434` is unreachable, prompt the user to configure a custom host and port for Docker, WSL, or 

> *[Truncado — 1641 chars totais]*

---

## #26862 — [FEATURE]: Mutual TLS / client-side certificate support for remote MCP

📅 `2026-05-11` | ✏️ **weishiuchang** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26862](https://github.com/anomalyco/opencode/issues/26862)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add support for client-side certificates (mutual TLS, mTLS) for remote MCP connections.

## Details
- Allow configuration of client certificates, private key, and CA for remote MCP implementations.
- Expose new options in the MCP remote config schema (e.g., cert/key/ca file paths or PEM content).
- Certificate fields should be optional and only applied to connections where the remote MCP endpoint requires mTLS.
- Update the HTTP transport layer to instantiate an `https.Agent` (Node.js/Bun) with these credentials and use it for remote MCP requests.
- Document how to configure and use mTLS with MCP servers.

## Benefits
- Allows secure authentication/authorization against remote MCP servers that require client certificates
- Increases deployment flexibility for enterprises or regulated environments
- Closes a security gap for users who need fine-grained client authentication

## Background/Reasoning
Currently, remote MCP connections support OAuth and custom headers but do not offer any TLS client certificate option. This limits integration with servers that require mutual TLS for client authentication (common in private clouds and regulated industry APIs). Since Node.js and Bun both support passing certificates via `https.Agent`, it should be feasible with configuration and some changes to the HTTP cl

> *[Truncado — 1663 chars totais]*

---

## #26848 — [FEATURE]: teamcode should filter out node_modules before starting a LSP (in our case: oxlint)

📅 `2026-05-11` | ✏️ **ptandler** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26848](https://github.com/anomalyco/opencode/issues/26848)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

teamcode seem to sometimes start several LSP instances for oxlint:

**LSP**
- typescript 
- oxlint 
- eslint 
- oxlint node_modules/.../types
- oxlint node_modules/.pnpm/...+types@4.9.5/node_modules/.../types

However, there's no need to lint external files from node_modules.

In our `teamcode.json` we have:

```
  "lsp": {
    "oxlint": {
      "command": [
        "pnpm",
        "exec",
        "oxlint",
        "--ignore-pattern=node_modules",
        "--lsp"
      ],
      "extensions": [
        ".js",
        ".jsx",
        ".mjs",
        ".cjs",
        ".ts",
        ".tsx",
        ".mts",
        ".cts"
      ]
    }
  },
```

But it seems that the ignore-pattern does not help here.

---

## #26838 — [FEATURE]: Add Featherless.ai as a built-in provider

📅 `2026-05-11` | ✏️ **szkhr1025** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26838](https://github.com/anomalyco/opencode/issues/26838)


## Summary
[Featherless.ai](https://featherless.ai/) is a serverless LLM hosting platform providing OpenAI-compatible API access to 37,000+ open-source models. It would be great to have it as a built-in provider in TeamCode.

## Why
- Currently Featherless works as a custom provider via `@ai-sdk/openai-compatible`, but users must manually define every `model` entry in `teamcode.json`.
- Featherless hosts many popular models (DeepSeek V4 Pro, Kimi K2.6, GLM-5.1, Qwen3.6, MiniMax-M2.7, etc.) that overlap with TeamCode Go's lineup.
- Adding it as a first-class provider would allow users to simply run `/connect` -> select "Featherless" -> paste API key, just like other built-in providers.

## API Details
- Base URL: `https://api.featherless.ai/v1`
- Models endpoint: `GET /v1/models` (returns full list)
- Auth: Bearer token
- Compatible with `@ai-sdk/openai-compatible`

## Desired Behavior
1. `featherless` appears in the `/connect` provider list.
2. After entering the API key, models are auto-populated from `/v1/models` without requiring manual `models` configuration.
3. Works with both streaming and non-streaming completions.

## Workaround
Currently using custom provider config:
```json
{
  "provider": {
    "featherless": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Featherless",
      "options": {
        "baseURL": "https://api.featherless.ai/v1"
      },
      "models": { ... }
    }
  }
}
```

---

## #26806 — [FEATURE]: add TeamCode Chat Bot to ecosystem

📅 `2026-05-11` | ✏️ **luoyingwen** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26806](https://github.com/anomalyco/opencode/issues/26806)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add TeamCode Chat Bot to the ecosystem Projects list.

TeamCode Chat Bot is a community project that provides a mobile chat bot client for controlling TeamCode and monitoring tasks. Listing it in the ecosystem documentation helps users discover another mobile-friendly way to interact with TeamCode.

---

## #26790 — [FEATURE]: 除了plan、build模式，建议再增加个chat模式

📅 `2026-05-11` | ✏️ **dowdyboy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26790](https://github.com/anomalyco/opencode/issues/26790)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

有时候开发过程中，只想问一些简单的问题，如一些原理性的问题，希望能得到简洁的答案

---

## #26788 — [FEATURE]:工作区 增加 复制文件列表配置

📅 `2026-05-11` | ✏️ **GuoChen-thlg** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26788](https://github.com/anomalyco/opencode/issues/26788)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

文件列表 
从原始仓库目录复制到工作树的文件的逗号分隔列表。对 .env 等环境文件很有用。

---

## #26772 — [FEATURE]:  Integrated browser for desktop

📅 `2026-05-10` | ✏️ **AlexDelgado20** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26772](https://github.com/anomalyco/opencode/issues/26772)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I would like TeamCode Desktop to include an integrated browser workspace.

The goal is to let users inspect and interact with web pages without switching to an external browser. This would be useful for tasks where the agent needs browser context, screenshots, console messages, page annotations, or form interaction.

Proposed behavior:

- Add an embedded browser panel in the desktop app.
- Allow opening pages from prompts like `/browser <task>` or `@browser`.
- Let users annotate elements on the page and send those annotations as chat context.
- Let users take screenshots and attach them directly to chat.
- Expose integrated browser tools to the agent for navigation, inspection, clicking, typing, screenshots, and console messages.
- Add a setting to enable or disable automatic integrated browser tools.

---

## #26770 — [FEATURE]: Opencode Go available Model Support for OpenAI and Anthropic SDKs

📅 `2026-05-10` | ✏️ **mannbadal** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26770](https://github.com/anomalyco/opencode/issues/26770)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, only some Opencode Go models are supported with the OpenAI and Anthropic SDKs. This feature requests that all officially-listed Opencode Go models (see https://teamcode.ai/docs/go/) be fully supported via both the OpenAI and Anthropic SDK integrations.

Enhancing coverage will ensure teams can access the full suite of Opencode Go models regardless of SDK preference. This will benefit users requiring a consistent model set in hybrid or multi-provider environments and reduce friction when new models are added to Opencode Go. Implementation should:
- Ensure all documented Go models can be used via both SDKs
- Expand tests to verify all Go models work as expected in either backend
- Update documentation and config examples to show complete compatibility
- Consider ways to automate or test coverage for new model releases if possible

---

## #26757 — [FEATURE]: /handoff command — compact + continue in a fresh session

📅 `2026-05-10` | ✏️ **mrosnerr** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26757](https://github.com/anomalyco/opencode/issues/26757)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Long-running sessions accumulate context until quality degrades or the context window fills up. Today the options are:

- **`/compact`** — summarizes history but stays in the same session (context still grows)
- **Fork** — creates a new session but copies *all* messages, inheriting the bloat (see #26707)
- **Manual** — copy a summary, open a new session, paste it in

None of these give you what you actually want: **a fresh session that picks up where you left off with just enough context to continue.**

### Proposed workflow

A `/handoff` (or `/continue`) command that:

1. Runs compaction on the current session to produce the structured summary
2. Creates a new session
3. Injects the compacted summary as the initial context in the new session
4. Switches to the new session

The old session stays intact for reference but the agent continues in a clean context window.

### Why this fits naturally

The primitives already exist:

- **Compaction** generates a high-quality LLM summary (`Goal → Progress → Key Decisions → Next Steps → Relevant Files`)
- **Fork** creates new sessions and remaps message IDs
- The gap is a `summaryOnly` fork mode — start from the compaction output instead of copying all messages

### Related

- #26707 — forked session inherits full uncompressed context after compaction
- #2176

> *[Truncado — 1802 chars totais]*

---

## #26748 — [FEATURE]: Double-ESC should cancel the running turn and submit any draft messages

📅 `2026-05-10` | ✏️ **martinffx** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26748](https://github.com/anomalyco/opencode/issues/26748)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Today, redirecting teamcode mid-turn takes too many keystrokes:

1. See it going the wrong way
2. Type a correction and hit Enter — lands as a draft, waiting for the current turn
3. Double-ESC to cancel the running turn
4. Draft is still sitting there, doesn't get sent
5. Up to recall it
6. Enter to submit

Proposal: if there are draft messages waiting when double-ESC fires during an active turn, cancel the turn *and* submit the drafts as the next prompt. If no drafts, double-ESC behaves as it does today.

Claude Code does the equivalent on a single ESC and it's a noticeably tighter loop for steering long-running tasks.

Related but distinct from the broader queue/interrupt threads (#5333, #16102, #21388) — this is just about what happens to drafts at the moment of cancel.

---

## #26745 — [FEATURE]: Built-in terminal mascot/buddy system (like Claude Buddy)

📅 `2026-05-10` | ✏️ **Joaquinfnz** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26745](https://github.com/anomalyco/opencode/issues/26745)


# Feature Request: Built-in Terminal Mascot/Buddy System

- [x] I have verified this feature I'm about to request hasn't been suggested before

## Summary

I'd love to see a built-in mascot/buddy system in TeamCode's TUI, similar to what Claude Code introduced with "Claude Buddy" — a virtual pet/tamagotchi that lives in the terminal and accompanies you while coding.

## Motivation

Developers spend hours in their terminals every day. Despite being our most-used application, terminals remain the most lifeless environment on our computers. A small companion that reacts to your activity, has personality, and makes long sessions more enjoyable would make TeamCode feel more human and less like a pure productivity tool.

Claude Code's "Claude Buddy" was extremely well-received by the community (even though it started as an April Fools feature). It includes:
- 18 species with ASCII art sprites and animations
- Rarity tiers (Common through Legendary)
- Stats (DEBUGGING, PATIENCE, CHAOS, WISDOM, SNARK)
- Shiny variants (1% chance)
- Hat unlocks
- Needs system (hunger, energy, happiness)
- LLM-powered personality and contextual comments
- Commands: /buddy, /buddy pet, /buddy card, etc.

## Proposed Feature

A native mascot system integrated into TeamCode's TUI:

1. **Statusline mascot** — A small ASCII pet that lives in the TUI statusline area, with subtle breathing/idle animations
2. **Species selection** — A few TeamCode-themed species to choose from
3. **Activity reactions** — The m

> *[Truncado — 2739 chars totais]*

---

## #26720 — [FEATURE]: Model-specific AGENTS files (e.g. AGENTS_gpt-5_5.md)

📅 `2026-05-10` | ✏️ **emincangencer** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26720](https://github.com/anomalyco/opencode/issues/26720)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Problem

When switching between different models I often want model-specific instructions, examples, reminders or constraints (reasoning style, formatting quirks, tool use behavior, context handling, etc.).  
Currently there is no easy way to do this without creating fully separate agents (which adds metadata overhead and reduces the nice `build` mode experience).

### Proposed solution

Support **model-specific** AGENTS files that are loaded **in addition to** the regular `AGENTS.md`.

- Project level: `AGENTS_{model}.md`
- Global level: `~/.config/teamcode/AGENTS_{model}.md`

**Examples:**
- `AGENTS_claude-opus-4-7.md`
- `AGENTS_gpt-5_5.md`

**Loading rules:**
- Always load base `AGENTS.md` (project + global) first
- Then load the matching model-specific file if it exists
- Model name normalization (replace `.`, `-`, `/` with `_` etc.) so variants work nicely

This keeps the current lightweight markdown workflow while giving precise control per model.

### Why this is better than per-model agents
- No extra metadata / JSON
- No loss of `build` mode convenience
- Simple and consistent with how project + global AGENTS.md already work

### Additional note
Since `AGENTS.md` is currently loaded at startup, model-specific files may need to be resolved when the model is actually selected (especially 

> *[Truncado — 1601 chars totais]*

---

## #26718 — [FEATURE]:Persist “Cycle Thinking Effort” Preference Across Sessions in Desktop App

📅 `2026-05-10` | ✏️ **realebon** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26718](https://github.com/anomalyco/opencode/issues/26718)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

In the Windows desktop app for TeamCode, the selected **Cycle Thinking Effort** setting (Low / Medium / High / Max, etc.) currently resets back to the default value.

It would improve usability if the app remembered the user’s last selected thinking effort preference and automatically applied it across sessions until manually changed.

---

## #26706 — [FEATURE]:Add a right-side navigation panel

📅 `2026-05-10` | ✏️ **Hourthink** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26706](https://github.com/anomalyco/opencode/issues/26706)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Desktop app: Add a right-side conversation navigation panel (like DeepSeek web) for quick access to each turn

---

## #26698 — [FEATURE]: Add the new Kimi K2.6 Turbo model from Fireworks.ai Pass subscription

📅 `2026-05-10` | ✏️ **lstep** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26698](https://github.com/anomalyco/opencode/issues/26698)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The Fireworks.AI Pass subscription (https://app.fireworks.ai/fire-pass) has changed and now uses Kimi K2.6 Turbo instead of Kimi K2.5 Turbo (Kimi K2.5 Turbo not being available anymore), but in the teamcode /models interface there is only the Kimi K2.5 Turbo model available. Is it possible to update the models list?

<img width="454" height="534" alt="Image" src="https://github.com/user-attachments/assets/a2717f3d-4192-438f-9dbe-fb12987a4d2b" />

---

## #26686 — [FEATURE]:kimi 2.6 via wandb (Weights and Biases)

📅 `2026-05-10` | ✏️ **gotjoshua** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26686](https://github.com/anomalyco/opencode/issues/26686)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

kimi 2.6 is available on wandb, will it be added/updated soon in teamcode /models?


```sh
curl https://api.inference.wandb.ai/v1/models \                         
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $(WANDB_KEY)" | jq .
```
...
```json
   {
      "id": "moonshotai/Kimi-K2.6",
      "object": "model",
      "created": 0,
      "owned_by": "system",
      "root": "moonshotai/Kimi-K2.6"
    },
```

---

## #26685 — [FEATURE]:Context-Aware Proxy Middleware: intercept requests before LLM to reduce token costs 96–99% via MemPalace + SocratiCode

📅 `2026-05-10` | ✏️ **MaikiOS** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26685](https://github.com/anomalyco/opencode/issues/26685)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Related issues: #5148 #14451 #21240

**The problem:**
Yesterday I spent ~$100 in two TeamCode sessions with Claude Opus via OpenRouter. 
Looking at the usage logs, every single request was sending 660,000–689,000 input 
tokens — the entire chat history and codebase context re-sent from scratch each time. 
My actual new message was maybe 100 tokens. The rest was stale history.

**What I want:**
A way to intercept the messages array before it gets sent to the LLM provider, 
so I can strip old history and inject only relevant context retrieved from 
tools like MemPalace or SocratiCode instead.

The cleanest solution would be a plugin hook that fires before the provider 
call — something like provider.request.before — where the plugin receives 
the full messages array and returns a modified (pruned) version.

As a workaround I could run a local OpenAI-compatible proxy that sits between 
TeamCode and the real API (by swapping baseURL in teamcode.json), but a native 
plugin hook would be much cleaner.

**Why this matters:**
With MemPalace and SocratiCode already installed, the relevant context for any 
given question is usually under 10,000 tokens. There's no reason to send 600,000+ 
tokens every time. Right now there's no way to intercept and replace that context 
before it hits the API.

Is a pre-reques

> *[Truncado — 1551 chars totais]*

---

## #26680 — [FEATURE]: Add Kiro (kiro.dev) as a selectable provider

📅 `2026-05-10` | ✏️ **Sebuahhobi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26680](https://github.com/anomalyco/opencode/issues/26680)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Kiro now supports API-key based authentication for Kiro CLI headless / non-interactive usage via the `KIRO_API_KEY` environment variable.

TeamCode already supports adding provider credentials through `/connect`, and it would be useful to have Kiro available as a first-class selectable provider there, instead of requiring custom configuration or third-party plugins.

Requested behavior:
- Add `Kiro` to the selectable provider list in `/connect`.
- Support reading credentials from `KIRO_API_KEY`.
- Optionally allow users to paste a Kiro API key through `/connect`, similar to other providers.
- Expose supported Kiro models in `/models`, such as Auto and the models available from Kiro CLI/model metadata.
- Document that Kiro API key authentication is currently for Kiro CLI headless usage and may require a Pro/Pro+/Power subscription and/or admin-enabled API keys.

References:
- Kiro CLI headless mode uses `KIRO_API_KEY`.
- Kiro API keys can be generated from the Kiro web console for supported plans.
- TeamCode supports adding provider credentials via `/connect`.

---

## #26672 — [FEATURE]:Interactive Session Change Review Workflow for the TUI

📅 `2026-05-10` | ✏️ **edgarchiroleo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26672](https://github.com/anomalyco/opencode/issues/26672)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Updated the issue description to make it shorter and more focused on the actual workflow/problem I’m experiencing while using TeamCode in long TUI sessions.

Also linking it more closely to #5102 since the ideas are related.

---

I’ve been using TeamCode for longer coding sessions where the model progressively modifies multiple files, and one thing that becomes difficult in the TUI is reviewing and controlling those changes comfortably without leaving the terminal workflow.

Right now we already have diffs/revert capabilities, but I would love to see a more interactive review flow directly in the TUI.

Something like:

- View modified files generated during the session
- Expand/collapse diffs per file
- Approve/reject changes per file
- Rollback a specific file change
- Eventually support partial approvals per diff hunk/block
- Keep review actions visible in the chat/session timeline for context

I think this could extend or complement #5102 rather than being a separate feature, since that issue already touches diff viewing/review workflows.

The main idea is making AI-generated changes easier to review incrementally during long sessions while staying fully inside the terminal experience.

---

## #26661 — [FEATURE] Reduce initial system prompt token overhead (~68k tokens before first user message)

📅 `2026-05-10` | ✏️ **wdsAI-space** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26661](https://github.com/anomalyco/opencode/issues/26661)


## Problem

In a fresh TeamCode session with a standard setup (Sisyphus agent, ~100 skills, 50+ tools), the token count **before the user sends a single message** is approximately **68,000 tokens**. This is ~99% system overhead.

Breakdown:
- **Skill descriptions**: 100+ skills with full descriptions inlined in system prompt
- **Tool JSON Schemas**: 50+ tool definitions (Playwright, AST, Spec-workflow, etc.)
- **Agent behavior instructions**: Full Phase 0-3 orchestration rules
- **Using-superpowers skill**: Injected inline at session start

For comparison, Claude Code's system prompt is ~10-15k tokens for the first message.

## Impact

With a typical 128k context window:
- **Effective conversation space: ~60k tokens** (less than half the window)
- Faster context exhaustion → more frequent compressions → potential loss of context
- Higher API costs per conversation turn (system prompt sent every time)
- Shorter productive sessions before hitting context limits

## Proposed Solutions

### 1. Lazy-load skill descriptions
Currently all 100+ skill names + descriptions are inlined. Only inject skill **names** initially, and load full descriptions on-demand when `skill` tool is invoked. This could save ~10-15k tokens.

### 2. Tool schema compression
- Only inline tool schemas for tools the current agent type is likely to use
- Or use abbreviated schemas with a "full schema on demand" mechanism
- Some tools (e.g., full Playwright suite with 20+ methods) are rarely all used in one ses

> *[Truncado — 2289 chars totais]*

---

## #26646 — [FEATURE]: Server crashes repeatedly with session.error storms and no auto-recovery - improve crash resilience and error logging

📅 `2026-05-10` | ✏️ **jonah791** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26646](https://github.com/anomalyco/opencode/issues/26646)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Background

The TeamCode local server crashes repeatedly during normal use. From `.teamcode-notify.log` analysis (21.5 MB, 369K lines over 3 days), I identified several systemic issues that cause server instability and make debugging impossible.

## Problems identified

### 1. session.error storms with no auto-recovery (28 crashes in 3 days)

| Time Window (UTC) | session.error count | Module loaded (auto-restart) |
|---|---|---|
| May 7, 10:11-11:11 | 8 | 4 (early days had auto-recovery) |
| **May 8, 14:02-15:46** | **15** | **0 (watchdog stopped working)** |
| May 9, 09:43-10:23 | 4 | 0 |
| May 9, 22:39 | 1 | 0 |

On May 7, `Module loaded` events followed `session.error` within 1-3 minutes (auto-restart worked). Starting May 8, the watch mechanism broke — 15 consecutive errors with zero auto-restarts. The server stayed dead for 9 hours until manual restart.

### 2. file.watcher storms (likely crash trigger)

`file.watcher.updated` accounts for **40.6%** (150K events) of all log entries. Peak rate reached **6,030 file changes per minute** on May 9, 14:27 UTC.

The hourly event count on May 9 spiked to **255K lines** (5x normal):

```
01:00 12,337
02:00 39,477  (overnight peak)
12:00 57,955  (midday peak)
14:00 46,735  (file watcher storm)
```

### 3. Complete lack of error details in logs

All 3

> *[Truncado — 3018 chars totais]*

---

## #26601 — [FEATURE]: add graphical way to add mcp similar to goose

📅 `2026-05-10` | ✏️ **srinilambarsaha1967-sys** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26601](https://github.com/anomalyco/opencode/issues/26601)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Its so so confusing to add an mcp server on teamcode desktop, open code was crashing since the mcp wasnt loading properly , please add a similar window like goose to add mcp servers easily

<img width="600" height="675" alt="Image" src="https://github.com/user-attachments/assets/b57e802f-bc08-43ed-a614-4d815827c94a" />

---

## #26558 — [FEATURE]: Git GUI for Commit, Staging, and Push Workflow

📅 `2026-05-09` | ✏️ **trafalgarLaw20** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26558](https://github.com/anomalyco/opencode/issues/26558)


# Feature Request: Git UI for Commit & Push

Add a lightweight Git UI inside TeamCode to handle common actions without using the terminal.

Features:

* view modified/untracked files
* stage/unstage files
* write commit messages
* commit changes
* push to remote

A simple sidebar/panel similar to the VS Code source control workflow would greatly improve the development experience and reduce context switching.

---

## #26541 — [FEATURE]:用QQ操作opencode做工作

📅 `2026-05-09` | ✏️ **Kovisun** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26541](https://github.com/anomalyco/opencode/issues/26541)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

申请一个opneclaw的QQ机器人，通过QQbot，与我的桥去发信息叫opencode做工作。
https://github.com/Kovisun/teamcode-bridge-v2

---

## #26532 — [FEATURE]: Restore Linux ARM64 build for TeamCode Desktop

📅 `2026-05-09` | ✏️ **NN708** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26532](https://github.com/anomalyco/opencode/issues/26532)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

With the removal of the Tauri build in #19067, the Linux ARM64 build for TeamCode Desktop is no longer being produced. Could support for Linux ARM64 be restored?

---

## #26523 — [FEATURE]: teamcode.ai microsoft sign in

📅 `2026-05-09` | ✏️ **AceVentura** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26523](https://github.com/anomalyco/opencode/issues/26523)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, you can sign in with Github and Google. It would help enterprises if you also set up Microsoft authentication.

---

## #26513 — [FEATURE]: desktop - Introduce explicit Shell mode

📅 `2026-05-09` | ✏️ **adrian15** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26513](https://github.com/anomalyco/opencode/issues/26513)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary
In the Desktop app, we currently have visible Build and Plan modes, while Shell mode exists but is not presented as an explicit, first-class mode in the same way. I'd like to start a design conversation about adding a dedicated **Shell** mode option in Desktop.

## Image
This is an image on how this could look in the mode selector:

<img width="1037" height="1079" alt="Image" src="https://github.com/user-attachments/assets/74af0b14-d3ac-416d-856f-67d9b1c27446" />

## Why
- Shell is already a valid interaction mode, but it is less discoverable in Desktop than Build/Plan.
- Making Shell explicit could improve clarity and reduce mode confusion for users who run mixed AI + terminal workflows.

## Current UX concern
When Shell is invoked manually, the shell output/tool state is shown **collapsed** by default.
As a developer, I'd like clearer feedback on what happened to the manually invoked command (status/result/surface), so command execution does not feel hidden.

So I agree on: https://github.com/anomalyco/opencode/issues/22667 on:

> User-initiated shell commands (`!`) should always be visible regardless of the tool details toggle. The user explicitly ran the command and expects to see its output.

## Important compatibility note
The old behavior to invoke Shell mode via **`!`** is still e

> *[Truncado — 2374 chars totais]*

---

## #26502 — [FEATURE]: Mini notifications center overlay (pet companion)

📅 `2026-05-09` | ✏️ **lrq3000** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26502](https://github.com/anomalyco/opencode/issues/26502)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I suggest to add a companion pet feature that would act as a mini notifications center overlay to notify the user with short concise updates about currently running sessions, this incredibly useful to continue working on something else while keeping an eye on currently launched threads.

This is a feature that was added in OpenAI's Codex Desktop app. In practice, I find it to be extremely useful.

Example:
<img width="3072" height="1920" alt="Image" src="https://github.com/user-attachments/assets/31dbdbef-b8b3-4bba-baf4-521d851f59dc" />

---

## #26500 — [FEATURE]: /undo and /redo support for ACP

📅 `2026-05-09` | ✏️ **Kallemakela** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26500](https://github.com/anomalyco/opencode/issues/26500)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

/undo and /redo support for ACP

Related:
- Closed issue #8931
- Old PR #11500 for the closed issue #8931

---

## #26495 — [FEATURE]:关于reasoningEffort无法生效的临时解决方案

📅 `2026-05-09` | ✏️ **sxfreesky123** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26495](https://github.com/anomalyco/opencode/issues/26495)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

在  teamcode/packages/teamcode/src/provider/transform.ts:L1277, 即在 providerOptions 函数 return之前加入以下代码: 
const effort = options.reasoning_effort
  if (effort !== undefined) {
    return { [key]: { ...options, reasoningEffort: effort, reasoning_effort: effort } }
  }

然后在 teamcode.json中按如下配置即可:
          "variants": {
            "max": {
              "reasoning_effort": "max"
            }
急着用的可以这样临时处理一下.等后续官方的fix

---

## #26493 — [FEATURE]: smooth/animated auto-follow during response streaming (Codex parity)

📅 `2026-05-09` | ✏️ **Geo-Nico** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26493](https://github.com/anomalyco/opencode/issues/26493)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary
When the assistant is generating a response, the TUI viewport auto-follows the bottom of the stream by jumping one full line at a time as each line arrives. On fast-streaming responses this looks visibly jerky / "ratcheting." Codex's TUI does the same job but interpolates the scroll offset across frames, which feels smooth and noticeably easier on the eyes during long responses.
This is a **streaming auto-follow** smoothness ask, distinct from user-driven scroll smoothness, which is already handled by `scroll_acceleration.enabled` / `scroll_speed` in `tui.json`.
## Current behavior
- v1.x opentui renderer.
- During streaming, the viewport snaps to bottom whenever the rendered content grows past the bottom edge.
- The snap is per-line (or per-chunk reflow), with no interpolation between the previous and new scroll offset.
- Result: visible "step / step / step" motion, especially with fast models on a tall pane, making it difficult to read in real-time.
## Expected behavior
- During streaming, when auto-follow is engaged, animate the scroll offset from old → new over a few frames (e.g. 60 fps for ~80–120 ms with an ease-out curve).
- If a new line arrives before the previous animation finishes, retarget to the new bottom rather than queueing.
- Disengage cleanly the moment the user scrolls 

> *[Truncado — 2634 chars totais]*

---

## #26482 — [FEATURE]: Callee-side agent visibility — visible-to frontmatter field

📅 `2026-05-09` | ✏️ **utapyngo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26482](https://github.com/anomalyco/opencode/issues/26482)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Problem

TeamCode already supports **caller-side** task permission control via `permission.task`: a primary agent can declare which subagents it's allowed to invoke. However, there is no **callee-side** equivalent — no way for a subagent to declare *which parent agents are allowed to invoke it*.

This means:
- A subagent intended exclusively for one orchestrator agent is still visible to every other primary agent.
- The system prompt of every agent is bloated with subagents irrelevant to it.
- An agent can accidentally (or intentionally) invoke a subagent it was never meant to use.

### Proposed solution

Add a `visible-to` field to agent frontmatter:

```markdown
---
description: Analyzes code changes and produces review comments.
mode: subagent
visible-to:
  - ReviewMR
---
```

Semantics:
- If `visible-to` is present, the agent only appears in the Task tool's agent list when the invoking agent's name matches one of the listed values.
- If `visible-to` is absent, the agent is visible to all (current default behavior, no breaking change).

### Relationship to existing mechanisms

- `permission.task` (caller-side) and `visible-to` (callee-side) are complementary and should both be supported; their constraints would be intersected at runtime.
- `hidden: true` hides an agent from user listing but d

> *[Truncado — 1762 chars totais]*

---

## #26429 — [FEATURE]:Add a panel to quickly configure MCP server in desktop.

📅 `2026-05-09` | ✏️ **wsmxd** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26429](https://github.com/anomalyco/opencode/issues/26429)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add an option to configure the MCP server in the settings to quickly add MCP servers.

---

## #26424 — [FEATURE]: Add skills.exclude config to disable specific skill directories

📅 `2026-05-09` | ✏️ **ahmadaidin** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26424](https://github.com/anomalyco/opencode/issues/26424)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request


### Problem

TeamCode scans 6 standard skill directories (global + project-level):
- ~/.config/teamcode/skills/<name>/SKILL.md
- ~/.claude/skills/<name>/SKILL.md
- ~/.agents/skills/<name>/SKILL.md
- .teamcode/skills/<name>/SKILL.md
- .claude/skills/<name>/SKILL.md
- .agents/skills/<name>/SKILL.md

Users may want to exclude specific directories (e.g., ~/.agents/skills/) while keeping others (e.g., ~/.claude/skills/). Currently there is no selective exclusion mechanism — either all global directories are scanned, or none via OPENCODE_DISABLE_GLOBAL_CONFIG.

### Proposed Solution

Add a skills.exclude config option in teamcode.json:
```json
{
  skills: {
    exclude: [~/.agents/skills]
  }
}
```

Behavior:
- Accepts an array of directory paths (supports ~ expansion)
- Paths are checked against skill directory roots
- Matching directories are skipped during discovery
- Other directories remain unaffected

### Why This Matters

- Users with large skill collections in ~/.agents/skills/ may want to limit noise in the available skills list
- GSD framework users have internal skills that should not appear in agent selection
- permission.skill: deny blocks programmatic spawning (via task tool), which is too restrictive

### Related

- OPENCODE_DISABLE_GLOBAL_CONFIG (PR #21650) — all-or-nothing global disable
-

> *[Truncado — 1584 chars totais]*

---

## #26393 — [FEATURE]: Add option to disable the /api/config endpoint

📅 `2026-05-08` | ✏️ **Lamanaable** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26393](https://github.com/anomalyco/opencode/issues/26393)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi all,

I would like to request an option to somehow sanitise the teamcode serve api responses so that the /api/config endpoint does not return plaintext apiKeys loaded from the config. 

I would suggest the option be made available through an environment flag, its a bit niche for a cli option.

This would make it much easier to achieve containerised isolation of Opencode without needing to setup a cumbersome proxy.

If anyone has good suggestions for setting up an isolated teamcode sandbox which has no key access I would be grateful.

Thanks.

---

## #26392 — [FEATURE]: TUI should reconnect to session event stream after LLM error recovery

📅 `2026-05-08` | ✏️ **chihyinglinasus** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26392](https://github.com/anomalyco/opencode/issues/26392)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

**Current behavior:**

When an LLM provider error occurs mid-session, the TUI displays the error and stops. If the backend recovers and continues processing the session (e.g. via `teamcode run --attach`), the original TUI does not follow — it remains stuck on the error screen with no further updates.

The only way to see what happened after recovery is to exit the TUI and reopen the session with `teamcode -s <session-id>`, which only shows a static snapshot of completed messages up to that point.

**Expected behavior:**

After an LLM error, if the session resumes on the backend, the TUI should detect this and reconnect to the live event stream — showing subsequent responses as they stream in, without requiring the user to exit and reconnect manually.

**Why this matters:**

For long-running autonomous sessions, a transient LLM error followed by automatic recovery is not uncommon. Currently the user loses all visibility into the session the moment an error occurs, even if the session successfully continues on the backend.

---

## #26390 — [FEATURE]: Add doc references to existing Forgejo (Codeberg) Actions support

📅 `2026-05-08` | ✏️ **dragonfyre13** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26390](https://github.com/anomalyco/opencode/issues/26390)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

There's references to integration with GitHub via GitHub Actions and how to setup Gitlab integration via Gitlab Duo, but I've built (and regularly use) robust handling for Forgejo Actions as well, which are patterned quite closely off GitHub Actions. The existing documented methods aren't directly portable in part because the APIs are different between the two, and in part because the GitHub handler is built deeply into teamcode.

Forgejo is the system behind https://codeberg,org,  so in addition to supporting the self-hosted version of the system (called Forgejo: https://forgejo.org) it also automagically adds support for agentic handling of projects hosted on Codeberg.org for anyone who cares to use it as well.

I've been using it pretty extensively recently via my self hosted instance and a few others have started to use it as well. At this point I consider it feature complete enough to stop messing with it consistently (beyond maybe tweaks to the prompt passed into teamcode if someone feels like suggesting improvements), so thought it was time to submit a request here to see if there was interest in getting it documented similar to how the current Gitlab handling is (this is also a "community project" I believe).

The Forgejo Action details, repository and documentation are here:
https://codeber

> *[Truncado — 1535 chars totais]*

---

## #26378 — [FEATURE]: typed AgentErrorUpdate session/update kind for non-tool LLM failures

📅 `2026-05-08` | ✏️ **truenorth-lj** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26378](https://github.com/anomalyco/opencode/issues/26378)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When a non-tool LLM call in an ACP session exhausts retries (`AI_RetryError: maxRetriesExceeded` or any unhandled error from the model stream), `session/processor.ts` `halt()` writes the failure to the local logfile and updates the assistant message's internal `error` field, but it never emits an ACP frame back to the client.

On the wire this looks like silence — the assistant message persists with `parts: []` and no `stopReason`, and a connected ACP client has no way to distinguish "still streaming" from "the call failed."

Tool-call failures don't have this problem because they ride `tool_call` / `tool_call_update` shapes. But **turn-level errors** (rate limits, provider 5xx, context-overflow rejections, budget gates, auth failures, etc.) currently have no typed channel back to the client.

#### Reproduction

1. Connect an ACP client and start a session.
2. Trigger a turn that exhausts retries against the model provider (e.g. force a 429 or a bad API key).
3. Observe: the client never receives any frame indicating the turn ended with an error. The watchdog (or a long human wait) is the only way to notice the turn is dead.

#### Proposal

Add a new `session/update` kind, `agent_error`, carrying a small closed vocabulary of error categories so clients can render a typed banner / retry affordance in

> *[Truncado — 2741 chars totais]*

---

## #26376 — [FEATURE]: Save dynamically generated system prompt to teamcode.db so it's included in transcript exports

📅 `2026-05-08` | ✏️ **justinlyon12** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26376](https://github.com/anomalyco/opencode/issues/26376)


### Feature hasn't been suggested before.

- [X] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, the dynamically generated system prompt (instructions) is built in-memory before the LLM call and is not persisted in the `teamcode.db` SQLite database. Because of this, it is omitted when exporting a session transcript, making it difficult to debug custom instructions or agent behavior without a network proxy or debug logs.

**Request:** 
Persist the dynamically generated system prompt into the `message` table (e.g., as `role: "system"`) at session initialization. This would allow the existing transcript export features to natively include the full system prompt alongside the rest of the conversation history.

**Benefits:**
- Simplifies debugging of `AGENTS.md` and custom environment instructions.
- Provides a complete, 1:1 record of the exact instructions the agent received during a session.
- Piggybacks on the existing transcript export mechanism for a clean implementation.

---

## #26371 — [FEATURE]: Require double Ctrl+C to exit the CLI (first press interrupts, second exits)

📅 `2026-05-08` | ✏️ **dhruv-anand-aintech** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26371](https://github.com/anomalyco/opencode/issues/26371)


### Describe the enhancement you want to request

Currently, pressing `Ctrl+C` immediately exits the entire TeamCode CLI. This is surprising and disruptive — it's easy to accidentally exit during a long session.

Claude Code and Codex both use a two-press pattern:
1. **First `Ctrl+C`** — interrupts the current agent action / cancels the in-progress operation
2. **Second `Ctrl+C`** — exits the CLI entirely

TeamCode should adopt the same behavior. This gives users a safe escape hatch for cancelling operations without losing their session context.

The first `Ctrl+C` could show a message like "Press Ctrl+C again to exit" so the user knows what's happening.

### Suggested implementation path

- In the TUI key handler, intercept the first `Ctrl+C` as a session interrupt (same as `Esc` or `/exit` light)
- On a second `Ctrl+C` within a short window (e.g., the same keybind cycle or within a few seconds), trigger the full exit
- Optionally display a brief toast/hint after the first press

### Additional context

Related issue (clarifying docs): https://github.com/anomalyco/opencode/issues/23478

---

## #26364 — [FEATURE]: Dynamic segmented caching

📅 `2026-05-08` | ✏️ **Prathyushmnchla** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26364](https://github.com/anomalyco/opencode/issues/26364)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

My previous request(https://github.com/anomalyco/opencode/issues/26288) was autoclosed for using Kimi to draft. I am writing this to conform to the guidelines.

I've been using agentic workflows on teamcode. One pattern that will help unlock efficiency is to have segmented caching. Where in I can select different segments to pass as context to the model, before asking a modification request.

For example consider different segments. Possibly different files or subparts of files

A = problem_statement.md
B = architecture.md
C = roles.md
D = docs.md
E = models.py
F = training.py
G = diagnostics.py
F = frontend.py
H = review.md

For example a model working on frontend needs only some files for example A,B,C,D,F.

A model working on models will require other files A,B,C,D,E,F,G.

A different agent might require, B,D,H etc...

Since they have shared context, It will help to build the KV cache using some hashing scheme made from composed segments, allowing the use of dynamically mixing and matching different cache profiles for the task at hand. 

In fact giving an orchestrator/primary agent these primitives is very helpful for efficient context management.

The cache can be organized as segments, where every valid cache hit can be seen as a tree traversal.

Please evaluate and consider API/first class acc

> *[Truncado — 1525 chars totais]*

---

## #26363 — [FEATURE]: Add self-service Console email change flow

📅 `2026-05-08` | ✏️ **PanAchy** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26363](https://github.com/anomalyco/opencode/issues/26363)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

# Self-Service Email Change

Users should be able to change the email associated with their TeamCode Console / Go / Zen account without needing to contact support.

A user raised this on Discord after signing up with a company email and later leaving the company. Today, there does not appear to be a self-service way to move the account email to a personal address while keeping the same account, workspaces, billing, keys, and usage history.

## Proposed Flow

1. Logged-in user opens account settings.
2. User enters a new email address.
3. TeamCode sends confirmation links to both:
   - the current email, to authorize the change
   - the new email, to verify the destination
4. Once both links are confirmed, TeamCode updates the account's canonical email.
5. Existing Google/GitHub login identities remain linked to the same account.

This should reduce support load as Go/Zen usage grows and make account management more self-service.

---

## #26342 — [FEATURE]: Built-in compiled skills system for common workflows

📅 `2026-05-08` | ✏️ **ch-arslanahmad** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26342](https://github.com/anomalyco/opencode/issues/26342)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

> [!note]
> Related to #18232 / #18234 (scaffolding skill) but different scope.

# Idea

Most TeamCode users (beginners, vibe coders, devs, casual), often need quick reference for common or basic core things, how to configure teamcode, processing configs, commands in general in which they may process JSON, git workflows, shell scripting.

## Proposed Implementation:

A built-in compiled skills system, SKILL.md files embedded into the binary at build time. They always appear in <available_skills>, zero filesystem dependency, impossible to delete, for better UX (User Experience).

## Initial built-in skills (that i can think of):
1. `teamcode-config` —comprehensive teamcode reference (config, feature, CLI, TUI, agents, tools, providers, LSP, themes, keybinds, references)
2. `jq` — JSON processing reference (universally useful)
3. More to be decided, regex, etc.

Not limited to these skills, the system is extensible. But start with the most universally useful ones., allowing no setup from the user-end

## The inspiration:

Tools like [Charm's Crush])https://github.com/charmbracelet/crush) ship built-in documentation and common knowledge baked into the toold. It's always there, zero setup. TeamCode as an AI-native tool should do the same.

> I'd like to implement this if the idea has traction & accepted.

Regards

---

## #26338 — [FEATURE]: Add CommandCode as a Provider

📅 `2026-05-08` | ✏️ **KurutoDenzeru** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26338](https://github.com/anomalyco/opencode/issues/26338)


### Feature hasn't been suggested before

- [x] I have verified this feature I'm about to request hasn't been suggested before

### Describe the enhancement you want to request

Please add support for https://commandcode.ai/ as a provider/authentication option in TeamCode

## Why this would be useful

CommandCode offers very affordable and generous pricing tiers compared to many current providers:
- Go — $1
- Pro — $15
Pricing: https://commandcode.ai/pricing

<img width="1205" height="726" alt="Image" src="https://github.com/user-attachments/assets/67f4d046-35da-46af-b514-60f421eceeb8" />

This would make TeamCode more accessible for developers looking for a low-cost coding agent provider with capable models

## Suggested Integration
- Add CommandCode to supported providers
- Support API key authentication
- Expose available CommandCode models through the existing provider system

---

## #26328 — [FEATURE]: Progress indicator for MCP calls

📅 `2026-05-08` | ✏️ **claui** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26328](https://github.com/anomalyco/opencode/issues/26328)


### Feature hasn't been suggested before.

- [X] I have verified this feature I'm about to request hasn't been suggested before. ← Note: suggested but abandoned, see section *Prior art*

### Describe the enhancement you want to request

## Motivation

While an MCP call is running, TeamCode’s TUI currently doesn’t show progress info, even if the MCP server sends progress updates.

Especially with longer-running services (which are common in MCP, e.g. on-demand embedding runs), this is awkward from the user’s point of view because the conversation can seem stuck for minutes. That effect is about to get even more noticeable when [#24964](<https://github.com/anomalyco/opencode/issues/24964>) is merged, which (correctly) fixes an issue with `resetTimeoutOnProgress`, causing the “user is waiting for anything to happen” time to become potentially unbounded.

<img src="https://github.com/user-attachments/assets/da0fcba1-1cf2-4f05-9f23-69173ca162b8 " alt="Image" width="986" data-linear-height="142" />

## Suggestion

If an MCP server sends progress messages, then the text in the TUI should reflect that progress message.

Depending of whether the MCP progress message includes the optional `total` and `message` fields, I suggest that instead of the current message:

```plain
⚙ mcp_service_name [query=very long running call]
```

I suggest that the TUI render one of the following:

```plain
⚙ mcp_service_name [query=very long running call] · In progress [42]
```

or, if the server includ

> *[Truncado — 5107 chars totais]*

---

## #26327 — [FEATURE]: Add page-based navigation for browsing conversation history in TUI

📅 `2026-05-08` | ✏️ **Electricitysheep** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/26327](https://github.com/anomalyco/opencode/issues/26327)


### Feature hasn't been suggested before.

- [X] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**What**: Add page-based navigation (Page Up/Down, page indicator, bounded rendering) for browsing conversation history in the TUI.

**Why**: When reviewing long conversation histories in the TUI, users must scroll line-by-line which is extremely tedious. There is no way to quickly navigate through pages of conversation content, and no visual indicator of how much content remains. For very long conversations (100+ messages), the TUI may also suffer from rendering lag since all messages are rendered at once.

### How it should work:

#### 1\. Page Up/Down Navigation

* `Page Up` / `Page Down` — scroll one page up/down in conversation view
* `Ctrl+B` / `Ctrl+F` — traditional terminal page navigation shortcuts
* `gg` / `G` — jump to beginning/end of conversation (Vim-style)

#### 2\. Page Indicator

Display a page indicator in the status bar showing current position:

```
Page 12/48 (25%)
```

Or in compact form:

```
[12/48]
```

#### 3\. Bounded Rendering

For very long conversations, implement virtual scrolling:

* Only render messages currently visible in the viewport
* Keep message metadata indexed for instant jumping
* Lazy-load message content when scrolling into view
* This prevents UI freezes when loading conversations with 100+ messages

### Acceptance Criteria

- [ ] Page Up / Page Down keys

> *[Truncado — 2517 chars totais]*

---

## #26325 — [FEATURE]:Recognize the IDE background, selected areas, or screen content

📅 `2026-05-08` | ✏️ **renshengbushexie** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26325](https://github.com/anomalyco/opencode/issues/26325)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Can we develop TeamCode and the VS Code TeamCode plugin so that they can recognize the IDE background, selected areas, or screen content?

---

## #26320 — [FEATURE]: Strip trailing `role=assistant && content==""` messages before request

📅 `2026-05-08` | ✏️ **gxpisme** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26320](https://github.com/anomalyco/opencode/issues/26320)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Before making a request, automatically strip any trailing messages in the message[] array where `role=assistant` and `content == ""`.

Reason: These empty assistant messages are useless and possibly left over from message list generation/processing. Stripping them will reduce invalid tokens sent and make the process neater and more robust.

Proposed implementation:
- Before making a request (such as to an LLM/conversation service), iterate message[] backwards and remove all consecutive trailing messages matching the condition.

Reference code location: See `packages/sdk/js/src/gen/client/client.gen.ts` (`beforeRequest`), likely in the request pre-processing logic.

---

## #26314 — [FEATURE]: Make rate limit handling configurable with custom request limits

📅 `2026-05-08` | ✏️ **HackerX7889** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26314](https://github.com/anomalyco/opencode/issues/26314)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Problem

When using TeamCode with certain LLM providers (for example, services with stricter rate limits like NVIDIA NIM), I quickly hit 429 rate limit errors. It seems the current implementation uses a fixed or inflexible limit (around 40 requests), which doesn't work well across different backends that enforce lower concurrency or RPM limits.

This leads to frequent failures and poor user experience on providers with more conservative quotas.

### Proposed Solution

Add support for a user-configurable request limit / concurrency setting. This would allow setting any custom number (e.g., 10, 15, 20, etc.) instead of being restricted to the current fixed value.

Ideally this could be set via:

- Command line flag/argument

- Environment variable

- Project-level config file (if applicable)

This small addition would greatly improve compatibility with a wide range of LLM providers and deployment setups.

### Additional Context

- The feature should be optional with a sensible default for users who don't need to tweak it.

- It would help both local/self-hosted models and various cloud providers with differing rate limit policies.



Thanks for considering this! TeamCode is otherwise working great.

---

## #26310 — [FEATURE]: No API timeout setting | No Provider editing

📅 `2026-05-08` | ✏️ **Bhagathxoxo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26310](https://github.com/anomalyco/opencode/issues/26310)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I'm using GUI version Windows.
**API Timeout:**
My local model is huge and it is taking time to process, since Opencode doesn't have API timeout setting, it is just terminating the task after few minutes.
**No provider edit:**
I used built-in LM studio provider, it only asking API and I entered it(default API of LM Studio is lmstudio), but not working. Then I use custom provider and added manually, and its working. The problem here is, if i want to add another model/switch to different model, there is no option to go back and edit the model, i only have option to add multiple models only for the first-time.

---

## #26307 — Feature: Auto-detect outdated bundled Bun version and prompt upgrade on Windows segfault

📅 `2026-05-08` | ✏️ **Electricitysheep** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26307](https://github.com/anomalyco/opencode/issues/26307)


## Summary

After experiencing repeated `Segmentation fault` crashes on Windows 11 with Bun v1.3.13, running `npm i -g teamcode-ai@latest` resolved the issue without any code changes. This suggests the bundled Bun version in the npm package was outdated, and the reinstall pulled in a newer Bun build that fixed the crash.

## Environment

- **TeamCode**: via `npm i -g teamcode-ai@latest`
- **Bun**: 1.3.13 (bf2e2cec) — bundled in `teamcode-windows-x64`
- **Platform**: Windows 11 Home China 10.0.26200 (x64 baseline, sse42/avx/avx2/avx512)

## Crash Report

```
panic(main thread): Segmentation fault at address 0x7FF6297252EF
KERNEL32.DLL + ntdll.dll involvement
```

Full crash report: https://bun.report/1.3.13/e_1bf2e2ceAA4ky+FmrbqiM4jzn0DCYKERNEL32.DLLut0LCSntdll.dll4/hjBA2s//B+uppupB

## What Fixed It

Simply running:

```powershell
npm i -g teamcode-ai@latest
```

This reinstalled the package and pulled in an updated `teamcode-windows-x64` binary with a newer Bun runtime. After reinstall, the segfaults stopped.

## Root Cause Analysis

The `teamcode-ai` npm package bundles `teamcode-windows-x64`, which is a Bun-compiled standalone executable. The Bun version is pinned to the package release — if Bun releases a Windows compatibility fix, users who installed an older version of `teamcode-ai` won't get it until they manually reinstall the entire package.

This is different from Mac/Linux users who can install via GitHub Releases (Go native binary, no Bun dependency).

## Feature 

> *[Truncado — 3452 chars totais]*

---

## #26298 — [FEATURE]: Embed Agent Friendly Code Score Badge

📅 `2026-05-08` | ✏️ **hsnice16** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26298](https://github.com/anomalyco/opencode/issues/26298)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi team — I'm Himanshu, I built Agent Friendly Code, which scores public repos on how legible they are to AI coding agents (clear conventions, docs, tests, build signals — not anything about accepting agent-authored PRs).

`teamcode` scored 79.6/100 — full breakdown: https://www.agentfriendlycode.com/repo/116

If you're open to it, here's a badge you can drop in the README:
```
[![Agent Friendly](https://agentfriendlycode.com/api/badge/github/sst/teamcode.svg)](https://agentfriendlycode.com/repo/116)
```

Renders as: [![Agent Friendly](https://agentfriendlycode.com/api/badge/github/sst/teamcode.svg)](https://agentfriendlycode.com/repo/116)

_A note on what this isn't: the badge signals codebase readability for agents, not an invitation for drive-by AI PRs. I just wanted to let you know that your contribution policy is unchanged. Totally fine to pass — happy either way, and feedback on the score itself is welcome._

---

<img width="1875" height="1160" alt="Image" src="https://github.com/user-attachments/assets/f294e0ec-0af6-4f18-abde-6e73ad28c1ff" />

---

## #26297 — [FEATURE]: Add /skills command and skill panel to Web/Desktop app

📅 `2026-05-08` | ✏️ **fyc09** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26297](https://github.com/anomalyco/opencode/issues/26297)


## Problem

The TUI has a dedicated `/skills` dialog (`DialogSkill`) that lists all available skills and allows searching/selecting them. The Web and Desktop apps lack this entirely — there is no way to:

1. List all available skills from the UI
2. Browse/search skills before invoking them
3. See which skills are currently loaded

The `/` slash autocomplete in the Web/Desktop prompt only shows `builtin` + `custom commands`, but **not skills** discovered from `.teamcode/skills/`, `.claude/skills/`, or `.agents/skills/`.

## Background

- **TUI**: Has `DialogSkill` component at `packages/teamcode/src/cli/cmd/tui/component/dialog-skill.tsx` that calls `sdk.client.app.skills()` — works well.
- **App (Web/Desktop)**: The `slash-popover.tsx` has a `SlashCommand` type that already supports `source?: "command" | "mcp" | "skill"`, but skills are never populated into the slash command list. The `prompt-input.tsx` only pulls from `sync.data.command` (custom commands) and `command.options` (built-in).

## Request

1. **Add `/skills` command** to Web/Desktop that opens a searchable skill list (similar to TUI `DialogSkill`)
2. **Show skills in `/` autocomplete** — skills should appear alongside built-in and custom commands when typing `/`
3. **Skill management panel** — optionally, a dedicated panel/settings page to browse installed skills, view their descriptions, and enable/disable them

## Related Issues

- #7846 — Add /skills command to list and quick-invoke skills (TUI focus)
- #7533 

> *[Truncado — 1839 chars totais]*

---

## #26289 — [FEATURE]: Support Ctrl+Backspace and Ctrl+Delete for Word Deletion in Windows TUI

📅 `2026-05-08` | ✏️ **srineshr1** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26289](https://github.com/anomalyco/opencode/issues/26289)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Reopening #1167 which was auto-closed due to 90 days of inactivity, but the issue still exists.

Current behavior : ctrl+backspace does not delete the previous word in the TUI input. Only alt+backspace and ctrl+w work as alternatives.

Expected behavior : ctrl+backspace should delete the previous word, consistent with behavior in most terminals, editors, and OS-level text inputs (especially on Windows/Linux where it's the primary muscle-memory shortcut).

Why this matters : alt+backspace is not available in all terminal emulators, and ctrl+w conflicts with browser/app close shortcuts when running teamcode in certain environments. ctrl+backspace is the most universally expected shortcut for word deletion.

---

## #26272 — [FEATURE]: Streaming output renders word-by-word causing distracting line reflow

📅 `2026-05-08` | ✏️ **ajeetdsouza** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26272](https://github.com/anomalyco/opencode/issues/26272)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When the model is streaming a response, text appears word by word, which causes the last line to constantly shift and reflow. It's quite hard on the eyes.

Claude Code doesn't have this problem — it seems to buffer the stream and append text in larger chunks (roughly paragraph sized), so the output grows in stable steps rather than a continuous shuffle.

Would be great if teamcode did something similar — either flush on paragraph boundaries boundaries, or on a short timer like every 100ms. Even a config option to enable this would work.

---

## #26269 — [FEATURE]: Font size adjustment

📅 `2026-05-08` | ✏️ **ArtClark** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26269](https://github.com/anomalyco/opencode/issues/26269)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Sure, setting font size might be nice, but also allowing CTRL+mousewheel, CTRL++, CTRL+- shortcuts.

---

## #26266 — [FEATURE]:Show reasoning/variant level for subagents in the UI

📅 `2026-05-08` | ✏️ **zzy2210** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26266](https://github.com/anomalyco/opencode/issues/26266)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi, I’d like to ask whether subagents could display their reasoning level.

Currently, when a subagent is invoked, only the model name is shown, but the reasoning level is not displayed. This can make it feel a bit uncertain or less reassuring, since it’s hard to tell what reasoning setting the subagent is using.

Would it be possible to add support for showing the reasoning level when a subagent is called?

Thanks!

---

## #26252 — [FEATURE]: support resolving @filename tags from external editor output

📅 `2026-05-07` | ✏️ **webwheeledshoaib** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26252](https://github.com/anomalyco/opencode/issues/26252)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently when writing prompt from external editor the file tagging doesnt work.

in tui using `prefix + e` then writing your prompt `what does this file @filename do` saving then getting back to teamcode the prompt is returned in plain text. 

their should be a mechanism then if tagging @something it should resolve first if any agent is mentioned it should automatically tag the agent like @explore if no agent is found the file should be resolved for the agent context.

---

## #26249 — [FEATURE]: Allow host-rendered sidebar sections to opt into compact spacing

📅 `2026-05-07` | ✏️ **juanma91m** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26249](https://github.com/anomalyco/opencode/issues/26249)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Related to #26097, but separate scope.
## Summary
I'd like to propose a small extension to the TUI sidebar section API so host-rendered sidebar sections can opt into a more compact layout.
## Problem
When a plugin uses native sidebar sections to render short task lists, the host sidebar renderer currently applies a fixed amount of spacing between:
- the section header and the first item
- items inside the section
- optional hint / empty-state content
That default spacing works well for many sections, but it can look too loose for dense task-oriented lists.
Today, the only alternative is to replace the section with custom sidebar content, which is more fragile and reduces the value of using the native host-rendered section system.
current host-rendered spacing:
<img width="431" height="484" alt="Image" src="https://github.com/user-attachments/assets/a1525aa5-79e5-4c03-bcaa-4c4edf81aa29" />

desired compact host-rendered spacing:
<img width="431" height="484" alt="Image" src="https://github.com/user-attachments/assets/37803a97-aa0c-4b08-8a27-4e03842863cf" />

## Proposal
Extend `TuiSidebarSection` with a small optional presentation hint, for example:
```ts
compact?: boolean
When compact is enabled, the host sidebar renderer can reduce spacing/padding for that section only.
Important constraints:
- def

> *[Truncado — 2137 chars totais]*

---

## #26243 — [FEATURE]: Highlight colour is poorly chosed. It looks like links that don't open.

📅 `2026-05-07` | ✏️ **nostitos** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26243](https://github.com/anomalyco/opencode/issues/26243)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

<img width="523" height="299" alt="Image" src="https://github.com/user-attachments/assets/2127f068-619f-4474-af34-6f70d5e5ba86" />

Blue usually mean links that can be clicked.  Why are these not just bold / black?
It's an awkward colour choice that can't be easily changed.

---

## #26241 — [FEATURE]:Support manually installed teamcode CLI with VSCode extension sst-dev.teamcode-v2

📅 `2026-05-07` | ✏️ **reserveword** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26241](https://github.com/anomalyco/opencode/issues/26241)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When I installed teamcode CLI by like adding it directy into PATH or a .lnk link, the VSCode extension 
sst-dev.teamcode-v2 does not recognize it and won't work.
It will be best if sst-dev.teamcode-v2 can read the result of `where teamcode` and execute it.

---

## #26238 — [FEATURE]: Add /menu slash command as an alternative to Ctrl+P

📅 `2026-05-07` | ✏️ **altendky** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26238](https://github.com/anomalyco/opencode/issues/26238)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a built-in `/menu` slash command that opens the same TUI command menu currently opened by `Ctrl+P`.

This gives users a keyboard-shortcut-independent way to access the menu when teamcode runs inside IDE terminals where `Ctrl+P` can conflict with editor shortcuts.

Related context:
- https://github.com/anomalyco/opencode/issues/6245
- https://github.com/anomalyco/opencode/issues/6245#issuecomment-4326480220

---

## #26232 — [FEATURE]: Neovim editor context support in the TUI

📅 `2026-05-07` | ✏️ **shreyassanthu77** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26232](https://github.com/anomalyco/opencode/issues/26232)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently Opencode pulls editor context from claude code ide protocol or zed local database to give the model additional context about the current file the user has open and their selection in the editor.

i am working on a feature to add support for neovim using the nvim rpc system in the pr #26234

---

## #26194 — [FEATURE]: right clicking on URLs brings up OS context window so I can directly open links

📅 `2026-05-07` | ✏️ **redreceipt** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26194](https://github.com/anomalyco/opencode/issues/26194)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I'd love to be able to open URLs directly from the terminal like I can in codex

<img width="712" height="390" alt="Image" src="https://github.com/user-attachments/assets/44754724-543a-4c5d-9043-141e4d59843d" />

---

## #26175 — [FEATURE]: [Desktop] Per-app appearance override (Light / Dark / System) independent of macOS system theme

📅 `2026-05-07` | ✏️ **remotxavier** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26175](https://github.com/anomalyco/opencode/issues/26175)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Feature request
Add an in-app Appearance setting to the macOS desktop app (TeamCode.app) that lets users force Light, Dark, or System mode independently of the macOS global appearance.

Current behavior
TeamCode.app follows the macOS system appearance. The theme selector (Cmd+P → theme) only affects markdown/syntax rendering inside chat — not the app chrome (background, sidebar, panels).

Selecting a "dark" theme like Tokyo Night while macOS is in Light mode still leaves the app with a white background.

Desired behavior
A new Appearance section accessible via Cmd+, (Settings) or the command palette, with three options: Light · Dark · System (default).

Comparable apps that already do this:

Outlook for Mac (Preferences → General → Appearance)
Slack, VS Code, Chrome, Discord, etc.
Why
Many users prefer a dark UI for code/chat tools while keeping the rest of macOS in Light mode (system apps readability, design work, accessibility, personal preference). Forcing system-wide Dark mode is not a viable workaround.

Related (not duplicates)
#480 — sync with OS (complementary, would still be the "System" default)
#18397 — themes lacking a light variant (TUI-focused)
Thanks!

---

## #26172 — [FEATURE]: Add quick “last session” switch keybinding

📅 `2026-05-07` | ✏️ **DamianB-BitFlipper** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26172](https://github.com/anomalyco/opencode/issues/26172)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description
Currently, switching between sessions requires opening the session list dialog (ctrl-x l), navigating to the desired session, and pressing Enter. This is cumbersome when frequently switching between two sessions. My usual flow is to have two LLMs running at the same time in the same teamcode instance.

## Proposed Solution
Add a session_last keybinding (<leader>o / ctrl-x o) to quickly switch to the previously viewed session, similar to Emacs's C-x o for switching windows.

## The feature should:

Track the previous session ID in memory (ephemeral, resets on restart)
Allow instant switching with a single keybind
Only be available when a previous session exists

---

## #26160 — [FEATURE]: Auto Image Read - Automatic image preprocessing with dedicated image model

📅 `2026-05-07` | ✏️ **SOUMITRO-SAHA** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26160](https://github.com/anomalyco/opencode/issues/26160)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request


### Problem

TeamCode is a harness on top of AI models that performs local operations to modify code. Most open-weight models don't support image input — they simply cannot process images at all.

When a user sends an image with a message using a model that doesn't support image input, the system either:
1. Falls back to an error message: *"This model doesn't support image input - I cannot view or analyze images."*
2. Completely replaces the image with an error token

This creates a significant limitation: as a full-stack or frontend developer, you can't pass any image to analyze and perform tasks based on that analysis. For example:
- Paste a screenshot of a UI and ask *"which file controls this component?"*
- Share a design mock and ask *"update the logo to match this"*
- Send a screenshot of an error and ask *"what's causing this?"*

There's no way to automatically route image analysis to a dedicated image-capable model while keeping the main task on the user's chosen model.

### Proposed Solution

Implement an "Auto Image Read" feature that:

1. **Automatic Image Detection & Preprocessing** — When the current model doesn't support image input but the user sends an image, automatically use a dedicated image model to analyze it first. The analysis context (as text) is injected into the current se

> *[Truncado — 5401 chars totais]*

---

## #26118 — [FEATURE]: expose a plugin-safe file refresh hook for edits

📅 `2026-05-07` | ✏️ **Zireael** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26118](https://github.com/anomalyco/opencode/issues/26118)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description
Right now, when a plugin writes or edits files, there's no supported way to trigger the same post-edit refresh that Opencode's built-in tools handle.

The native `read`, `edit`, `write`, and `apply_patch` flows do more than just swap out text on disk. They also affect the LSP state and fire off file change events so diagnostics and symbol data stay fresh. Plugin tools don't get a public hook for this. If we build a custom tool that writes to a file, the editor state just sits there and gets stale after a successful write.

I wrote a custom  plugin that shadows native tools, and noticed that automatic LSP diagnostics stopped working.

## Environment

- Opencode version: latest, currently 1.14.33
- OS: All
- Context: Plugin tools running operations like write or apply_patch
- Observed in: Plugin tool execution paths


## Steps to Reproduce

1. Run a plugin that writes to a source file.
2. Let it successfully modify the file.
3. Check your editor state - diagnostics and file watchers are now completely out of sync with the disk.
4. There is no way that I can see to force a state refresh without modifying Opencode's internal services.


## Expected Behavior
When my plugin changes a file, it should be able to ping Opencode so it can update the LSP and file watchers, exactly like the native

> *[Truncado — 2250 chars totais]*

---

## #26113 — [FEATURE]:teamcode change the code without history in vscode,the time line is clean.

📅 `2026-05-07` | ✏️ **LLLCDYY** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26113](https://github.com/anomalyco/opencode/issues/26113)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I think can add time line with ask question or command!Otherwise, you can't see the code modification records.

---

## #26111 — [FEATURE] Ctrl+V paste images from clipboard into chat (Windows desktop app)

📅 `2026-05-07` | ✏️ **LifetimeVip** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26111](https://github.com/anomalyco/opencode/issues/26111)


### ✅ I have verified this feature I'm about to request hasn't been suggested before.

*(Relevant existing issue #906 is about a generic "paste to attach image" concept. This request focuses specifically on the **Windows desktop app** with **Ctrl+V clipboard paste** as the primary interaction model, which has distinct UX/implementation requirements not covered by #906 — see details below.)*

---

## Describe the enhancement you want to request

### The Problem

Currently on the **Windows desktop app**, attaching an image requires:

1. Click the `+` button in the chat input
2. Navigate through the file picker
3. Select the image file
4. Click Open

This is **3-4 extra steps** compared to every other modern chat application (Telegram, Discord, WhatsApp Web, Slack, etc.), where you simply **Ctrl+V** to paste an image from clipboard.

This friction adds up significantly during active development sessions where users frequently paste screenshots, mockups, error screenshots, and diagrams.

### Who this affects

This is **especially impactful for Windows desktop users**, who are a significant portion of the user base. Users on macOS and Linux with terminal/TUI setups can sometimes rely on terminal-level paste, but Windows desktop users have no workaround — they must use the file picker every single time.

### Why now?

With TeamCode gaining traction as a daily driver for AI-assisted coding, image-based interaction (screenshots of UI bugs, error messages, architecture diagrams) is be

> *[Truncado — 2978 chars totais]*

---

## #26097 — [FEATURE]: TUI plugin API: session projection and session list adapters

📅 `2026-05-07` | ✏️ **juanma91m** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26097](https://github.com/anomalyco/opencode/issues/26097)


### Feature hasn't been suggested before.
- [x] I have verified this feature I'm about to request hasn't been suggested before.
### Describe the enhancement you want to request
## Summary
I'd like to propose a small extension to the TUI plugin API so plugins can influence:
1. the projection of the native `session` view
2. the projection of the native session switcher/list
This is **not** a request to upstream a specific product feature.  
The goal is to expose **generic host hooks** so advanced plugins can rely on native session/session-list UI with materially less local host patching.
Based on forward ports through TeamCode `1.15.0`, these adapters would remove a large and important part of the current host patch surface, but they would not fully eliminate local host patching on their own yet.
---
## Problem
Today, plugins can inject some UI and commands, but they still lack a clean way to control session-aware behavior in the native TUI.
In practice, some advanced addons need to express things like:
- which session should be considered the active logical session
- which messages should be visible in the native `session` view
- whether the prompt should be visible for a given projected session state
- how the native session list should resolve the current highlighted session
- how session selection should map from a logical session to a concrete target session
Without host hooks for this, the only alternatives are:
- fragile command shadowing
- duplicating native views
- or 

> *[Truncado — 3838 chars totais]*

---

## #26096 — [FEATURE]: Re-add codesearch, using alternative solution (e.g., Grep by Vercel)

📅 `2026-05-07` | ✏️ **capyBearista** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26096](https://github.com/anomalyco/opencode/issues/26096)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The `codesearch` tool was broken due to Exa deprecating the tool itself in their MCP (#21292).

It was subsequently removed in #23932.

I'd propose re-introducing `codesearch`, but instead using something like Grep ([mcp.grep.app](https://mcp.grep.app)), which, so far, is free.

It could be enabled upon an experimental flag such as `OPENCODE_ENABLE_GREP` when set to a truthy value (similar to how `OPENCODE_ENABLE_EXA` used to enable `codesearch`). Additionally, in order to work with existing setups where users haven't realized `codesearch` has been removed, perhaps the `OPENCODE_ENABLE_EXA` flag could also enable Grep.

Edit: Just adding here, Vercel's grep seems to specifically search through _GitHub_ repos. I'm unsure if Exa's version was restricted in this manner—grep may not be a complete replacement.

---

## #26084 — [FEATURE]: Security Context-aware handling of sensitive files (credentials, tokens, secrets) Body:

📅 `2026-05-06` | ✏️ **nstoeckigt** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26084](https://github.com/anomalyco/opencode/issues/26084)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem
The AI currently reads and displays contents of sensitive files (e.g., `.credentials`, `.env`, `.api.token`, `.account.secret`, SSH keys) via `read`, `cat`, etc. This exposes secrets to the host/API, as seen in real sessions.
## Core Principle
**Distinguish between "using a path" and "exposing content":**
- ✅ **Allowed**: Using file paths as references/arguments (e.g., `mount -o credentials=/path/to/file`, `ls -la ~/.credentials`)
- ❌ **Forbidden**: Reading/displaying file contents (`cat`, `read` tool output, showing content in messages)
## Proposed Behavior
### 1. Sensitive File Detection
Detect files matching patterns: `cred`, `secret`, `token`, `api`, `pass`, `.env`, `.pem`, `id_rsa`, `id_ed25519`, `key`
### 2. Tool-Specific Rules
- **Read Tool**: Block displaying content of sensitive files. Allow path checks.
- **Bash Tool**: Allow commands using paths as arguments. Block `cat`, `less`, `echo $(cat...)` on sensitive files.
- **Grep/Glob**: Show that matches exist, but **never** display matching lines from sensitive files.
### 3. Explicit User Consent (Override)
If the user **explicitly requests** content access (e.g., "Show me my .env file"), the AI may proceed **after**:
- Displaying a clear warning: *"Warning: This file contains secrets. The content will be visible. Proceed?"*
- Get

> *[Truncado — 1922 chars totais]*

---

## #26070 — [FEATURE]: Draft pull requests

📅 `2026-05-06` | ✏️ **cogni-ai-ee** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26070](https://github.com/anomalyco/opencode/issues/26070)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Ability for anomalyco/opencode/github to specify in inputs whether agent should create draft PR, or a regular PR (default), optionally no PR, just output.

The main problem is when regular PR (ready for review) is created with potential incomplete work, it triggers a lot of unnecessary workflow tests and other agents (which are added to project) jump into reviewing that PR which sometimes it's invalid (not ready to review), creating unnecessary noise. For example I'm asking teamcode to create the issue, but it still creates PR with the .md file which create unexpected PR in this case and many other cases.

---

## #26069 — [FEATURE]: A way for signal subscriber to differentiate agent and subagent event

📅 `2026-05-06` | ✏️ **yookoala** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26069](https://github.com/anomalyco/opencode/issues/26069)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I have a simple notification plugin like this:

```js
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export const NotifyPlugin = async ({ project, client, $, directory, worktree }) => {
  const icon = '/usr/share/icons/Adwaita/symbolic/status/mail-unread-symbolic.svg';
  const appName = 'TeamCode';
  const summary = 'Task Completed';
  const body = 'TeamCode has finished the assigned task and is idle now.';
  const hint = 'string:desktop-entry:ai.teamcode.cli';

  const logDir = path.join(os.homedir(), '.config', 'teamcode', 'logs');
  await fs.mkdir(logDir, { recursive: true }).catch(() => {});
  const logFile = path.join(logDir, 'events.log');

  return {
    event: async ({ event }) => {

      // Monitor session events
      if (event.type.startsWith("session.")) {
        const logEntry = JSON.stringify({ time: new Date().toISOString(), event }) + '\n';
        await fs.appendFile(logFile, logEntry).catch(console.error);
      }

      // Send notification on session completion
      if (event.type === "session.idle") {
        $`canberra-gtk-play -i complete`; // play notification sound
        await $`notify-send --app-name="${appName}" --icon=${icon} --urgency=critical --hint=${hint} "${summary}" "${body}"`;
      }
    },
  }
}
```

This was supp

> *[Truncado — 2164 chars totais]*

---

## #26055 — [FEATURE]: Lightweight mode for async subagents — let parent agent continue working while child runs

📅 `2026-05-06` | ✏️ **smithyyang** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26055](https://github.com/anomalyco/opencode/issues/26055)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, the `task` tool spawns a sub-agent but **blocks the parent session** until the child completes. The parent cannot do its own work while the child is running, which wastes both time and tokens in many workflows.

## Request

Add a lightweight async sub-agent mode with two simple properties:

1. **Non-blocking spawn** — When a sub-agent is created, the parent session immediately gets back a session ID and continues its own work.
2. **Callback on completion** — When the child finishes, its result is delivered to the parent as a synthetic message (or other event), so the parent can pick up the result later.

That's all needed at the core level. Full orchestration, messaging, worktree isolation, etc. can be handled by the plugin ecosystem.

## Why

A common workflow: main agent finishes editing `src/auth.ts`, wants to fire a "doc-agent" to update the README, and **immediately continue** editing `src/payment.ts` without waiting for the doc-agent. When the doc-agent finishes, the main agent is notified and can review the result.

This is currently impossible without heavy workarounds.

## Related

- #5887 — the primary feature request for true async/background sub-agent delegation (with extensive community discussion and existing PRs). This issue is a focused, minimal request that should fulfill

> *[Truncado — 1558 chars totais]*

---

## #26051 — [FEATURE]: Support multiple custom config directories

📅 `2026-05-06` | ✏️ **micasa-acerman** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26051](https://github.com/anomalyco/opencode/issues/26051)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Support multiple custom config directories

I’d like to propose adding support for multiple custom config directories.

Currently, teamcode supports `OPENCODE_CONFIG_DIR`, which allows loading one custom `.teamcode`-like directory. This works well for a single external config source, but it makes composition difficult when configuration is split across multiple reusable local sources.

Example workspace:

```text
workspace/
  agents/
    backend/.teamcode/
    frontend/.teamcode/
    reviewer/.teamcode/
```

Each of these directories may contain its own agents, commands, modes, plugins, tools, and config files.

Today, the workaround is to generate a synthetic `.teamcode` directory with copied files or symlinks. It would be cleaner if teamcode could load several local config directories directly.

## Suggested behavior

Add a new environment variable:

```bash
OPENCODE_CONFIG_DIRS="/path/to/backend/.teamcode:/path/to/frontend/.teamcode" teamcode
```

On Windows, it should use the platform delimiter:

```powershell
$env:OPENCODE_CONFIG_DIRS="C:\backend\.teamcode;C:\frontend\.teamcode"
teamcode
```

`OPENCODE_CONFIG_DIR` should remain supported and unchanged for backwards compatibility.

If both are set, the load order could be:

```text
existing global/project/home config dirs
→ OPENCODE_CONFIG_DI

> *[Truncado — 2867 chars totais]*

---

## #26039 — [FEATURE]: Add brief provider API key guides to connect dialogs

📅 `2026-05-06` | ✏️ **agustinusnathaniel** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26039](https://github.com/anomalyco/opencode/issues/26039)


### Describe the enhancement you want to request

**Problem:**
Non-technical users often struggle to find where to get API keys for LLM providers. They need to dig through provider documentation or search online, creating friction during onboarding.

**Solution:**
Add brief, step-by-step guides directly in the provider connect dialogs (both web app and TUI/desktop) that explain how to obtain an API key for each provider.

**What it looks like:**
When a user selects a provider to connect (e.g., OpenAI, Anthropic, Groq), instead of just showing an empty API key input, the dialog displays:
1. A heading: "How to get your {Provider} API key"
2. 2-3 numbered steps (e.g., "Go to platform.openai.com and sign in")
3. A direct link to the provider's API key page
4. The API key input field below the guide

**Benefits:**
- Reduces onboarding friction for non-technical users
- No back-and-forth with external documentation
- Works for both desktop app and web app
- Easy for contributors to add new provider guides

**Implementation approach:**
- Create a shared `provider-guide.ts` module in `@teamcode-ai/core` with guide data (steps + URLs)
- Conditionally render guide in `dialog-connect-provider.tsx` (web) and `dialog-provider.tsx` (TUI)
- Add i18n keys for guide text
- Start with ~30 popular providers, infrastructure makes it easy to add more

**Providers covered in initial PR:**
OpenAI, Anthropic, Google, Groq, DeepSeek, xAI, OpenRouter, Together AI, Fireworks, Cerebras, Mistral, Perplex

> *[Truncado — 1645 chars totais]*

---

## #26035 — [FEATURE]: Allow disabling automatic session diff summarization

📅 `2026-05-06` | ✏️ **ualtinok** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26035](https://github.com/anomalyco/opencode/issues/26035)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add a config option to disable automatic session diff summarization during prompt processing.

For very long sessions, automatic `SessionSummary.summarize(...)` work can be expensive because it computes session/message diff metadata in the background during LLM turns. In the Electron desktop app, where the teamcode server runs inside the app process, that background work can contribute to visible UI stalls during active prompts.

A config option such as:

```jsonc
{
  "session": {
    "summarize": false
  }
}
```

would let users opt out of this non-essential metadata when they prefer responsiveness over automatic diff summaries.

Local measurements on a large real database:

Database size: ~6.8 GB
Total rows:
* message: ~247k
* part: ~1.04M

**Long session A**:
~21.8k messages
~76.1k parts
part JSON size: ~230 MB
full message/part walk + JSON parse: ~**3.1**s

**Long session B**:
~35.3k messages
~123.6k parts
full message/part walk + JSON parse: ~**5.9**s


By comparison, compacted-tail prompt context reads were much smaller:

session A compacted scan: ~950 messages / ~3.3k parts, ~0.15s
session B compacted scan: ~250 messages / ~834 parts, ~0.014s


These are local lower-bound measurements of the DB/message hydration work, not full end-to-end prompt latency. The concern is that automatic se

> *[Truncado — 2027 chars totais]*

---

## #26033 — [FEATURE]: web interface : add dark mode

📅 `2026-05-06` | ✏️ **apsvb** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26033](https://github.com/anomalyco/opencode/issues/26033)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please could you add a switch to toggle web interface between light and dark mode (currently dark mode missing)

---

## #26028 — [FEATURE]:Workspace-less Agent Mode with External Connectors

📅 `2026-05-06` | ✏️ **alexandre-leng** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26028](https://github.com/anomalyco/opencode/issues/26028)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I’m reopening this in a simpler form because I think the original issue was unnecessarily focused on the writing style instead of the actual request.

Right now TeamCode feels heavily tied to local folders and repositories. That works well for project-based coding, but it makes broader agent workflows difficult.

What I’d personally like is a mode where TeamCode can work without requiring a workspace, and instead connect directly to external services like GitHub, Notion, Google Drive, databases, APIs, or MCP servers.

For my own usage, this would make it possible to gather context automatically across multiple tools instead of manually feeding everything into the agent every time. I also think it would open the door to more autonomous workflows, especially for multi-repo maintenance, documentation, research, and remote operations.

The idea is not to replace the current repo workflow, but to add a more flexible agent mode alongside it.

---

## #26024 — [FEATURE]: shortcut to delete session Opencode Desktop.

📅 `2026-05-06` | ✏️ **ceoAppsknight** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26024](https://github.com/anomalyco/opencode/issues/26024)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a shortcut to delete session in Opencode Desktop.

---

## #26022 — [FEATURE]: allow chat.message hook to skip the assistant turn (noReply)

📅 `2026-05-06` | ✏️ **IYENTeam** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26022](https://github.com/anomalyco/opencode/issues/26022)


### Problem

Plugins authoring `chat.message` hook can mutate the user message and parts, but they cannot signal "I handled this turn out-of-band, please skip the assistant generation". The hook always falls through to the LLM call.

This blocks plugin-only implementations of side-question features (`/btw`-style commands) where the plugin synthesizes the answer itself and does not want a real assistant turn after that. Today the parent assistant still runs once on the mutated user message, which produces an extra unwanted reply.

### Existing pieces that already do most of this

- `PromptInput.noReply` already exists and short-circuits `loop()`:
  https://github.com/anomalyco/opencode/blob/aa3c99a3c0a609ea4dd485355627e3161251584a/packages/teamcode/src/session/prompt.ts#L1387
- `experimental.compaction.autocontinue` is the same shape: a hook output flag (`enabled`) read back by the caller to skip work:
  https://github.com/anomalyco/opencode/blob/aa3c99a3c0a609ea4dd485355627e3161251584a/packages/teamcode/src/session/compaction.ts#L511-L527
- `plugin.trigger()` already returns the mutated output object, so reading it back from `chat.message` is a no-op infra-wise:
  https://github.com/anomalyco/opencode/blob/aa3c99a3c0a609ea4dd485355627e3161251584a/packages/teamcode/src/plugin/index.ts#L258-L271

### Proposed change (minimal)

Add an optional `noReply?: boolean` to the `chat.message` hook output, and have `createUserMessage`/`prompt` honor it.

```ts
// packages/plugin/src/inde

> *[Truncado — 3136 chars totais]*

---

## #26021 — [FEATURE]: Support `mhchem` chemistry formulas in KaTeX

📅 `2026-05-06` | ✏️ **zharinov** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26021](https://github.com/anomalyco/opencode/issues/26021)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It's possible to render them via vanilla KaTeX, but if the model starts to render it in `mhchem` macros, you have to ask it to stop doing so.

The fix is just adding import `katex/contrib/mhchem` and I'm going to create PR for this issue now.

---

## #25974 — [FEATURE]: Add client-side prompt caching for repeated/similar queries

📅 `2026-05-06` | ✏️ **Kushalk0677** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25974](https://github.com/anomalyco/opencode/issues/25974)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, TeamCode sends every prompt directly to the LLM provider. This causes redundant API calls, higher latency, and increased costs when users iterate on similar code fixes or re-run comparable queries.

I'm proposing a lightweight, zero-dependency client-side prompt cache that:
- Normalizes prompts & caches responses with configurable TTL & max size
- Integrates transparently into the existing provider flow
- Falls back gracefully to live API calls on cache misses
- Lays groundwork for trie-based prefix matching & token sketching (inspired by proactive KV caching research)

**Scope:**
- [ ] Create `prompt-cache.ts` module (LRU + TTL + normalization)
- [ ] Wrap existing provider calls in the request pipeline
- [ ] Add `promptCache` config to `teamcode.json` / CLI flags
- [ ] Unit tests + local benchmark script
- [ ] Update docs with usage example

This will be a minimal v1 implementation focused on correctness and testability. I'll iterate on semantic similarity matching in follow-ups based on feedback. Happy to adjust scope!

---

## #25964 — [FEATURE]: Support multiple API keys with failover for MCP providers

📅 `2026-05-06` | ✏️ **sharyuke** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25964](https://github.com/anomalyco/opencode/issues/25964)


- [ ] I have verified this feature I'm about to request hasn't been suggested before.

**Describe the enhancement you want to request:**

## Problem Statement

Currently, when configuring multiple API keys for the same MCP provider (e.g., multiple OpenAI keys, various OpenRouter keys from different vendors), users must manually edit the configuration file to switch keys when one key hits rate limits or fails. This is disruptive during active coding sessions.

Many developers:
- Use multiple API keys from the same provider for higher rate limits
- Use keys from different proxy/reseller services for cost optimization
- Experience rate limiting (429 errors) during intensive coding sessions
- Want automatic failover without manual intervention

## Proposed Solution

Allow configuring multiple API keys as an array in the MCP provider configuration, with automatic failover on errors:

**Configuration Example:**

```json
{
  "mcp": {
    "openai": {
      "type": "openai",
      "apiKey": ["key-1", "key-2", "key-3"],
      "baseUrl": "https://api.openai.com/v1"
    },
    "openrouter": {
      "type": "openrouter",
      "apiKey": ["$OR_KEY_1", "$OR_KEY_2"],
      "baseUrl": "https://openrouter.ai/api/v1"
    }
  }
}
```

## Expected Behavior

1. **Sequential Failover**: Keys should be tried in order; if key-1 fails with 429/5xx, automatically try key-2
2. **Transparent Logging**: Log which key is currently active for debugging purposes
3. **Exhaustion Handling**: If all keys fail, 

> *[Truncado — 2976 chars totais]*

---

## #25961 — [FEATURE]: Support for MCP Support Client ID Metadata Document (CIMD)

📅 `2026-05-06` | ✏️ **jonesbusy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25961](https://github.com/anomalyco/opencode/issues/25961)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

For authorization server that support Support Client ID Metadata Document (CIMD) (Like keycloak https://www.keycloak.org/securing-apps/mcp-authz-server)

> MCP clients and authorization servers SHOULD support OAuth Client ID Metadata Documents as specified in [OAuth Client ID Metadata Document](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document-00). This approach enables clients to use HTTPS URLs as client identifiers, where the URL points to a JSON document containing client metadata. This addresses the common MCP scenario where servers and clients have no pre-existing relationship.

Other MCP client (Claude, VSCode are already supporting it). Their respective metadata is hosted at

- https://vscode.dev/oauth/client-metadata.json
- https://claude.ai/oauth/claude-code-client-metadata

For reference 

- https://client.dev/
- https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/
- https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents

---

## #25958 — [FEATURE]: Delete authentication models in "/models"

📅 `2026-05-06` | ✏️ **uphg** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25958](https://github.com/anomalyco/opencode/issues/25958)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I cannot delete the registered model. My version is 1.14.39. I tried to delete the following configurations: 

```
~/.config/teamcode/teamcode.json
~/.local/state/teamcode/model.json
~/.local/share/teamcode/auth.json
```

I also tried using the `teamcode auth logout` command, but it still doesn't work.

Can delete commands or hotkeys be added?

---

## #25947 — [FEATURE]: Add Omniroute provider with dynamic model discovery

📅 `2026-05-06` | ✏️ **disonjer** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25947](https://github.com/anomalyco/opencode/issues/25947)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add Omniroute as a built-in provider in TeamCode.

Omniroute is an OpenAI-compatible provider/gateway. It can expose user-defined/custom models, so a static bundled model list is not enough. Users currently need to configure Omniroute manually as a custom OpenAI-compatible provider and keep model definitions in sync themselves.

I found related issues about dynamic model discovery for generic OpenAI-compatible custom providers, but this request is specifically for first-class Omniroute support:

- #6231
- #25624
- #18219

Proposed behavior:

- Add a built-in `omniroute` provider.
- Implement it as an OpenAI-compatible provider, e.g. via `@ai-sdk/openai-compatible`.
- Support dynamic model discovery for Omniroute, so models added by the user in Omniroute become available in TeamCode without manually editing the TeamCode config.
- If possible, use Omniroute's OpenAI-compatible model listing endpoint, for example `/v1/models`, or a provider-specific discovery endpoint if Omniroute exposes one.

Why this helps:

- Omniroute users can add their own custom models and route them through one OpenAI-compatible endpoint.
- TeamCode would show the actual available Omniroute models instead of requiring users to duplicate model metadata in config.
- This makes Omniroute consistent with the provider UX for model 

> *[Truncado — 1547 chars totais]*

---

## #25926 — [FEATURE]: Omitting Long Skill Prompts

📅 `2026-05-05` | ✏️ **Tao-Yida** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25926](https://github.com/anomalyco/opencode/issues/25926)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When we use skills in Opencode, sometimes we need to scroll a long time to see the last prompt we typed or answer generated by a model within a session, which is very annoying if the long skill prompt occupies most of the space of the window.
Will it be better if the appearence of the skill prompt can be compressed/omitted, thus any "prompt sector" mostly shows the question typed by the user, not skill prompts?

<img width="1759" height="1108" alt="Image" src="https://github.com/user-attachments/assets/e87475d6-8175-4d31-96b0-4c268bbaa1ee" />
As shown in the image, the last line is my question, and the rest is the skill prompt, which I seldom look into it. It occupies almost all the room of my window.

---

## #25923 — [FEATURE]: Add message translation for Windows desktop app - left-click to translate foreign language messages

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25923](https://github.com/anomalyco/opencode/issues/25923)


﻿### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

When using TeamCode, the AI sometimes outputs content in other languages (Japanese, Korean, Russian, etc.). If a conversation contains foreign text the user cannot understand, they currently have to manually copy and paste it into a translation tool, which disrupts the workflow.

This is especially painful for Windows desktop users who lack browser extension-style translation support.

## Proposed Interaction

1. **Left-click and drag** to select a portion of text in a message
2. A **floating mini toolbar** appears near the selection, with buttons for "Translate", "Copy", etc.
3. Click the **"Translate"** button to translate the selected text
4. Translation result is displayed in a **tooltip/popover bubble** near the selected text, with a close (x) button
5. Click outside the bubble or press x to dismiss
6. **Alternative**: Right-click context menu also includes a "Translate" option

## Settings

Add a new setting:

- **Name**: Translate Target Language
- **Default**: Auto (follow system language) - automatically detects the Windows system language as the translation target
- **Available options**: Chinese, English, Japanese, Korean, French, German, Russian, and other common languages

## Notes

- Code block content should be skipped or labeled as code to avoid meaningless translation
-

> *[Truncado — 1913 chars totais]*

---

## #25921 — [FEATURE]: Add generation completion sentinels

📅 `2026-05-05` | ✏️ **CasualDeveloper** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25921](https://github.com/anomalyco/opencode/issues/25921)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

`./script/generate.ts` can produce enough output that an agent or wrapper timeout may make it unclear whether generation completed successfully, especially when output is truncated.

## Reproduction

1. Run `env -u OPENCODE_SERVER_PASSWORD -u OPENCODE_SERVER_USERNAME bun ./script/generate.ts`.
2. If the outer runner truncates output or times out near the end, there is no explicit final success marker to distinguish a completed run from partial output.

## Analysis

The top-level script awaits each shell command, so a final log after the last await would only print after successful generation. `packages/teamcode/src/cli/cmd/generate.ts` writes JSON to stdout, so progress logging should stay in the wrapper scripts rather than the JSON-producing CLI command.

AI assistance: TeamCode/openai/gpt-5.5 helped inspect the relevant scripts and draft this issue.

## Proposed Fix

Add minimal `console.info` phase/success sentinels in `script/generate.ts` and a direct-run completion sentinel in `packages/sdk/js/script/build.ts`. Avoid logging in the CLI generate command so redirected OpenAPI JSON is not corrupted.

## Questions

Should `script/format.ts` also print a direct-run completion sentinel, or is the top-level phase log enough?

---

## #25912 — [FEATURE]:Google vertex ai support

📅 `2026-05-05` | ✏️ **pathanaawej0-dot** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25912](https://github.com/anomalyco/opencode/issues/25912)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

hello community please add googl vertex ai express mode or normal vertex ai support

---

## #25910 — [FEATURE]:Chat Navigation Index / Sidebar

📅 `2026-05-05` | ✏️ **rorozoro0** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25910](https://github.com/anomalyco/opencode/issues/25910)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

One usability challenge with longer conversations is navigating back to earlier messages. Currently, this requires a lot of manual scrolling, which becomes inefficient as chats grow.

It would be helpful to introduce a collapsible right-side navigation panel that acts as a chat index. This panel could list key messages (such as user prompts) or auto-generated sections based on conversation flow. Clicking an item would jump directly to that part of the chat.

Additional enhancements could include:

Highlighting the current section while scrolling
Ability to bookmark or pin important messages

This would significantly improve usability for long debugging or iterative sessions and make the interface feel more like a structured workspace rather than a linear chat.

---

## #25882 — [FEATURE]: Expose LSP capabilities as agent tools (go-to-definition, find-references, hover, code actions)

📅 `2026-05-05` | ✏️ **AlexanderKotliar** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25882](https://github.com/anomalyco/opencode/issues/25882)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

> Summary
>
> Currently, TeamCode's LSP integration only provides diagnostics (errors/warnings). For navigation and code understanding, the agent relies solely on grep/glob-based search. This is insufficient for complex languages like C++, where grep cannot resolve:
>
> - Template instantiations vs declarations
> - Macro expansions and conditional compilation
> - Function/method overloads
> - Namespaced symbols and using directives
> - Implicit conversions and ADL
>
> Proposal
>
> Expose LSP protocol capabilities as agent tools:
>
> | Tool | LSP Method | Use Case |
> |------|-----------|----------|
> | lsp_definition | textDocument/definition | Navigate to symbol definition |
> | lsp_references | textDocument/references | Find all usages of a symbol |
> | lsp_hover | textDocument/hover | Get type/signature info |
> | lsp_rename | textDocument/rename | Semantic rename across codebase |
> | lsp_symbols | workspace/symbol | Fuzzy search for symbols |
>
> These would complement existing grep/glob tools — the agent chooses the right tool based on the task.
>
> Example
>
> For a C++ codebase, asking "where is model_instance_c::update() called?" currently returns every grep match including comments, strings, and unrelated overloads. An LSP-based lsp_references would return only actual call sites with accur

> *[Truncado — 1726 chars totais]*

---

## #25875 — [FEATURE]: customizable status line with Go usage tracking

📅 `2026-05-05` | ✏️ **cioffiAI** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25875](https://github.com/anomalyco/opencode/issues/25875)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature Request: Customizable Status Line
Claude Code supports a `statusline` setting in `~/.claude/settings.json` that lets users display arbitrary info (git branch, time, costs, etc.) in the bottom bar.
It would be great if TeamCode had something similar — ideally a small DSL or template string in `tui.json` that renders into the status bar.
### Specific use case: Go usage at a glance
As a Go subscriber, I'd love to see my usage for the current period directly in the TUI status line, e.g.:
Go: 42% (5h) | 38% (week) | 25% (month)
Right now I have to open `teamcode.ai/auth` in a browser to check. Having this info persist in the terminal would save a lot of context switching.
### What I'm imagining
```jsonc
// tui.json
{
  "statusline": {
    "left": "{git:branch} {go:usage_5h}",
    "right": "{model} {go:usage_week} | {go:usage_month}"
  }
}
Or even simpler — just expose the Go usage via an API/env that I could pipe into a plugin hook or a custom command.
Alternatives considered
- Using the plugin system — but there's no hook to modify the TUI chrome/status bar
- Using status_view (<leader>s) — useful but not persistent/glanceable
- Web console — works but breaks flow
Would love to hear if there's already a way to do this, or if this is something the team would consider adding.
**Labels:** `featu

> *[Truncado — 1518 chars totais]*

---

## #25872 — [FEATURE]: Add edit, recall (unsend), and delete buttons to sent chat messages

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25872](https://github.com/anomalyco/opencode/issues/25872)


﻿### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Problem:**
Currently, once a message is sent in the chat, there is no way to edit, recall, or delete it. This causes several issues:

1. **Network interruptions** — If a user loses connection while sending a message, the message appears as sent locally but never actually reached the model. After reconnection, the user has no way to remove this stranded message.
2. **Typo correction** — Users cannot fix typos in their own sent messages.
3. **Accidental sends** — Messages sent by mistake cannot be undone.

**Proposed features:**

1. **Hover-to-reveal actions** — When the user hovers their mouse over a sent message (their own), action buttons should appear:
   - **Top-right corner:** An X (close/delete) button to delete the message entirely
   - **Top-left corner:** An edit button (pencil icon) to edit the message content
   - A recall/unsend option in the same area

2. **Edit functionality** — Clicking edit allows the user to modify the message text in-place. After editing, the message is re-sent to the model with an updated timestamp and an "(edited)" indicator.

3. **Delete/Recall functionality** — Clicking delete removes the message from the conversation entirely. The model receives a updated conversation history without that message. A brief "Message deleted" placeholder can optionally replace 

> *[Truncado — 1946 chars totais]*

---

## #25871 — [FEATURE]: Add a command selector button near the send input for quick command access (e.g. undo last message)

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25871](https://github.com/anomalyco/opencode/issues/25871)


﻿### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Location:**
Below the send button / inside the chat input area, next to or replacing the current "/" command input mechanism.

**What:**
Add a visual button (e.g. a "+" or "/" icon) next to the text input field that opens a dropdown menu of available commands. Instead of requiring users to type "/command-name" manually, they can click the button and select a command from a list.

**Example commands the selector could include:**
- Undo last message /撤回上一条消息
- Clear tasks /清除任务
- Review /审查
- Init /初始化
- Any other registered slash commands

**Why:**
- New users often don't know available slash commands exist
- Typing commands manually is error-prone (spelling, formatting)
- A visual selector makes command discovery much easier
- Particularly useful for power actions like undoing the last message, which has no UI equivalent today

**Expected benefits:**
- Lower learning curve for new users
- Faster command execution for all users
- Better discoverability of features

---

## #25849 — [FEATURE]:add importing provider through auth.json

📅 `2026-05-05` | ✏️ **GameCat7428** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25849](https://github.com/anomalyco/opencode/issues/25849)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

add importing auth.json though teamcode import —file (file way)

---

## #25848 — [FEATURE]: add session renaming

📅 `2026-05-05` | ✏️ **GameCat7428** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/25848](https://github.com/anomalyco/opencode/issues/25848)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add the option to rename sessions manually, like with /rename in the right session or through teamcode session rename (new name) (session id)

---

## #25831 — [FEATURE]: Document Shift+Enter key binding for Alacritty and Tmux

📅 `2026-05-05` | ✏️ **angelcervera** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25831](https://github.com/anomalyco/opencode/issues/25831)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The current documentation only have information about how to enable Shift+Enter on Windows terminal. I would like to have information about how to do it in other setups, lile Alacritty and Tmux.

---

## #25817 — [FEATURE]: Preset instructions system for reusable chat prompts

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25817](https://github.com/anomalyco/opencode/issues/25817)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Users currently have to repeat the same instructions at the start of every new conversation (e.g., "always write tests", "use TypeScript", "follow the project conventions"). A preset instructions system would let users save reusable prompts and apply them to any session.

**Suggested approach:**

1. **Preset management UI:** Add a section in the settings or chat panel where users can create, edit, and delete preset instruction sets.

2. **Quick apply:** In the chat input area, add a dropdown or button to select and apply a preset. The preset text is prepended to the next user message or injected as a system-style instruction.

3. **Default preset:** Allow users to set a default preset that is automatically applied to all new sessions.

4. **Sharing:** Allow exporting/importing presets as JSON files so users can share useful instruction sets.

This is different from #22141 (custom instructions passed to the agent every session) because this focuses on user-facing preset management with a UI, rather than programmatic agent instructions.

---

## #25816 — [FEATURE]: Factory reset, session management, and cache cleanup tools

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25816](https://github.com/anomalyco/opencode/issues/25816)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

A set of session and data management tools to give users more control over their local data.

**1. Factory Reset / Reset to Initial State**
Add an option to reset TeamCode to its initial installation state, clearing all configuration, cached data, sessions, and user data. Useful for troubleshooting, preparing for reinstall, or ensuring a complete cleanup before handing off a machine.

**2. Bulk Session Management**
- Delete all sessions in one action (currently users must delete sessions one by one)
- Delete individual sessions (no clear way to remove unwanted/expired sessions, related to #16101)
- Session list gets cluttered over time with no cleanup mechanism

**3. Local Cache Cleanup**
A command or option to clear locally cached data (model lists, provider responses, etc.) without affecting session history or configuration. Useful when cache becomes stale or takes up too much space.

---

## #25815 — [FEATURE]: Guided AGENTS.md setup flow for /init command

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25815](https://github.com/anomalyco/opencode/issues/25815)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The /init command generates an AGENTS.md file, but the quality depends heavily on the user knowing what to include. A guided/interactive flow would help users create high-signal AGENTS.md files.

**Suggested approach:**

1. **Interactive prompts during /init:** After the user types /init, present a series of questions:
   - What is the main goal of this project?
   - What are the key conventions or patterns used?
   - Are there any critical files or directories the agent should know about?
   - Any preferred workflows or build commands?

2. **Template-based generation:** Use answers to fill a structured AGENTS.md template with sections for project overview, conventions, critical paths, and workflows.

3. **Preview before save:** Show the generated content and let the user edit before saving.

This complements the bug fix in #19341 (/init truncation). This request is about improving the quality of the generated AGENTS.md content, not fixing truncation.

---

## #25814 — [FEATURE]: Support localized slash command names when UI language is set to Chinese

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25814](https://github.com/anomalyco/opencode/issues/25814)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When the UI language is set to Chinese, slash commands (like /new, /undo, /model, /review, etc.) still appear and must be typed in English. The command categories are already translated in the i18n system (e.g., packages/app/src/i18n/zh.ts has command.category translations), but the actual slash command names/aliases are not localized.

**Suggested approach:**

Add an optional \liases\ field to command definitions that accepts localized names. The command parser would match both the primary English name and any configured aliases. This would allow Chinese users to type e.g. /新建 (for /new) or /撤销 (for /undo).

**Example mapping:**

| English | Chinese alias | Description |
|---------|--------------|-------------|
| /new | /新建 | Create a new chat session |
| /undo | /撤销 | Undo last message |
| /model | /模型 | Switch model |
| /review | /审查 | Review changes |

**Implementation notes:**
- The command system is in packages/teamcode/src/command/
- Commands are defined with Schema.Struct and have a \
ame\ field
- The prompt popover in the UI shows available commands
- Adding an \liases\ string array to the command schema and matching it during lookup would enable this without breaking existing behavior

---

## #25791 — [FEATURE]: 提交 PR/Issue 后应自动跟进状态并提醒用户，而不是等用户问才去查

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25791](https://github.com/anomalyco/opencode/issues/25791)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**问题：提交 PR/Issue 后不会自动跟进和提醒用户跟进**

当前模型的行为是：提交完 PR 或 Issue 后，就停下来等用户下一步指令。不会主动去做以下事情：

1. **不会主动检查提交结果** — 提交后不知道 CI 有没有通过、机器人有没有报错、有没有人回复。必须等用户问"去看看什么情况"才去检查。

2. **不会主动提醒用户跟进** — 已经提交的 PR/Issue 需要用户跟进（比如机器人要求修改、审核人提出了意见），但模型不会在后续对话中主动提起这些待办事项。用户不问就永远不提。

3. **用户说完"我说完了"之后，不会主动检查所有已提交的内容是否需要跟进** — 当用户说"我说完了"或给出最终指令后，模型应该自动回顾所有已提交的 PR/Issue，检查它们的状态，主动向用户报告哪些需要处理。

**建议：**

- 提交 PR/Issue 后自动等待几秒钟查看初始状态（有没有立即报错的 CI/bot）
- 用户表示阶段性完成时，自动扫描所有已提交内容的当前状态
- 主动向用户报告：哪些已通过、哪些需要修改、哪些在等审核

---

## #25785 — [FEATURE]: 使用AI操控GitHub账号时应遵守仓库模板规范，且不同语言对话不应夹杂非用户母语的术语

📅 `2026-05-05` | ✏️ **LifetimeVip** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/25785](https://github.com/anomalyco/opencode/issues/25785)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**问题一：使用 AI 操控 GitHub 账号时，应遵守仓库模板规范**

当 teamcode 通过 deepseek 等模型控制用户 GitHub 账号提交 Issue 或 PR 时，目前不会主动检查目标仓库是否有 Issue/PR 模板。如果仓库有 `.github/ISSUE_TEMPLATE/` 或 PR 模板，模型应该优先读取并按模板格式提交。没有模板时，也应参考该仓库已有 Issue 的惯用格式，而不是自由发挥。

否则提交的内容格式与仓库规范不符，容易被维护者关闭或忽视，也显得不专业。

**问题二：面对不同语言用户时，不应双语夹杂**

当前模型在与用户对话时，容易在主语言中混入另一种语言的技术术语，例如：
- 全程说中文时突然蹦出 "PR"、"CI"、"APPROVED"、"LGTM" 等未翻译的英文
- 没有意识到用户可能完全不理解这些术语

建议：
1. 模型应根据用户使用的语言，将所有术语翻译为该语言，而不是直接输出原文
2. 如果遇到无法翻译的专有名词（如软件名、包名），应在第一次出现时附带简要解释
3. 当用户发送"？"或"?"时，应优先认为用户是没看懂非母语部分的表达，立即切换语言或对非母语部分进行翻译，而不是猜测其他原因

---

## #25781 — [FEATURE]: Add oc-plugin-gitgud to ecosystem plugins list

📅 `2026-05-05` | ✏️ **khoaHyh** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25781](https://github.com/anomalyco/opencode/issues/25781)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hey, I'd like to add [`oc-plugin-gitgud`](https://github.com/khoaHyh/oc-plugin-gitgud) to the ecosystem plugins list.

It is a TUI plugin for Git and Graphite workflows inside TeamCode: review changes, stage/unstage files, generate commit messages, commit, push, and work with Graphite stacks without leaving the TUI.

Tweet 🐥: https://x.com/khoaHyh/status/2049921791846404447

---

## #25766 — [FEATURE]: Multi-LLM structured team debate — design reference from working implementation

📅 `2026-05-04` | ✏️ **adndvlp** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25766](https://github.com/anomalyco/opencode/issues/25766)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Background

I built [Conclave](https://github.com/adndvlp/conclave), a fork of TeamCode that 
adds structured multi-LLM debate. It's been running for a few days and I wanted 
to share the design decisions in case they're useful for a native implementation.

Not proposing a merge — the fork is heavily modified. Just sharing what worked 
(and what didn't).

Demo: https://adndvlp.github.io/conclave/

---

## What it adds

5 new files under `packages/teamcode/src/team/`:

| File | Lines | Role |
|---|---|---|
| `debate.ts` | 701 | Debate engine: `runDebate()` (flat) and `runBreakingTeams()` (sub-teams) |
| `team.ts` | 207 | Effect service that orchestrates, resolves participants, live streaming |
| `prompts.ts` | 203 | System prompts per phase: round 1, round 2+, sub-teams, global coordination |
| `cli-adapter.ts` | 359 | Adapters for Gemini CLI, Claude Code, Codex as team members |
| `schema.ts` | 43 | Types: `TeamConfig`, `TeamMember`, `SubTeam`, `CrossTeamMessage` |

Modified TeamCode files:

| File | Change |
|---|---|
| `session/prompt.ts` | If `team.enabled` and 2+ members, calls `Team.Service.run()` before normal processing |
| `session/processor.ts` | If winner is a CLI participant, routes to agent-mode CLI instead of `streamText` |
| `session/status.ts` | Adds `team.breaking` state with `glo

> *[Truncado — 5233 chars totais]*

---

## #25752 — [FEATURE]: Add hiai-teamcode to ecosystem plugins table

📅 `2026-05-04` | ✏️ **vlgalib** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25752](https://github.com/anomalyco/opencode/issues/25752)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add the hiai-teamcode plugin to the Plugins table on the ecosystem page.

Repository: https://github.com/HiAi-gg/hiai-teamcode
Description: multi-agent cockpit with 12 agents, MCP, LSP and skills.

---

## #25745 — [FEATURE]: exe upload on web dashboard to analyzed with hexstrike-ai MCP server

📅 `2026-05-04` | ✏️ **n4gY1** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25745](https://github.com/anomalyco/opencode/issues/25745)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

teamcode web only upload media and documents file. Exe why not?
I would like to try to analyze hexstrike-ai MCP server tool.

---

## #25742 — [FEATURE]:能不能将这个的桌面程序做成和codex，claude这种类似的，因为这个后期我觉得可以做更多的事.这是一个趋势。

📅 `2026-05-04` | ✏️ **LING19996** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25742](https://github.com/anomalyco/opencode/issues/25742)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

能不能将这个的桌面程序做成和codex，claude这种类似的，因为这个后期我觉得可以做更多的事.这是一个趋势。

---

## #25740 — [FEATURE]: Add doubleword.ai provider

📅 `2026-05-04` | ✏️ **Choeng-Rayu** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25740](https://github.com/anomalyco/opencode/issues/25740)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add the Doubleword.ai provider because currently it doen't have it yet.  you can review this doc link hwo to connect to doubleword.ai provider https://docs.doubleword.ai/inference-api/tool-calling

---

## #25736 — [FEATURE]: Snap packaging

📅 `2026-05-04` | ✏️ **antlassagne** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25736](https://github.com/anomalyco/opencode/issues/25736)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Packaging TeamCode as a Snap would make the Experience on Ubuntu more pleasant.
This would allow users to run 
```
$ snap install teamcode
```
like they can do with other tools already (vscode, sublime-text, etc).

---

## #25735 — [FEATURE]: Add `circleci-yaml-language-server` as one of the built-in LSP servers

📅 `2026-05-04` | ✏️ **parkuman** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25735](https://github.com/anomalyco/opencode/issues/25735)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

CircleCI offers [a language server](https://github.com/CircleCI-Public/circleci-yaml-language-server) for editing `config.yml` files inside a project's `.circleci` directory. For any user working on a project with a `.circleci/config.yml`, this will help TeamCode agents get better diagnostics while working with CCI configs (rather than just hoping it's correct and pushing up to CI to get validation).

---

## #25727 — [FEATURE]: Add current hour in end of request

📅 `2026-05-04` | ✏️ **matheusdsm** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25727](https://github.com/anomalyco/opencode/issues/25727)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

In the end of request it's in current type:

"agent / model / request time"

Add the current hour to this label

be like

"agent / model / request time / *current hour"

[teamcode tui]

---

## #25720 — [FEATURE]: "Allow for prompt" when permission request

📅 `2026-05-04` | ✏️ **matheusdsm** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25720](https://github.com/anomalyco/opencode/issues/25720)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Feature: add "Allow for prompt" on permission request.

This feature allow all permission commands only for one prompt.

---

## #25707 — [FEATURE]: Ability to change key binding of file diff full screen

📅 `2026-05-04` | ✏️ **Zizaco** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25707](https://github.com/anomalyco/opencode/issues/25707)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, the keybinding for "fullscreen diff" is [hardcoded](https://github.com/anomalyco/opencode/blob/dev/packages/teamcode/src/cli/cmd/tui/routes/session/permission.tsx#L555) and cannot be changed in `tui.json`.

This has been highlighted on https://github.com/anomalyco/opencode/issues/14093 , however, I'm not asking for you to change the default, but rather the ability to remap it.

<img width="1092" height="565" alt="fullscreen diff with ctrl+f as keybinding" src="https://github.com/user-attachments/assets/001be0c6-f4bb-43fa-889a-4daa836c6e39" />

The issue is that "ctrl+f" is the default keybinding for Search in most terminal emulators, IDEs, and editors. This makes it one of the top keybindings people want to change and one of the few that currently [cannot be changed via `tui.json`](https://teamcode.ai/docs/keybinds) [(as seen here)](https://github.com/anomalyco/opencode/blob/dev/packages/teamcode/src/config/keybinds.ts).

---

## #25688 — [FEATURE]: Export as json format ALL the sessions

📅 `2026-05-04` | ✏️ **cmoulliard** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25688](https://github.com/anomalyco/opencode/issues/25688)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

My feature request has been implemented partially using the following command

```
teamcode export session ses_20db0ffa4ffevnErBmBTwl4NCC
```

but it would be great to have an additional parameter able to export all the sessions:

```
teamcode export session --all
```

---

## #25645 — [FEATURE]: Auto-review for tool calls

📅 `2026-05-03` | ✏️ **Spikhalskiy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25645](https://github.com/anomalyco/opencode/issues/25645)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

Manual review of tools calls with potential side effects is surely a good practice that no one follows in real life, as it becomes very tedious very quickly.

## Proposal

Other coding agent harnesses implemented a special mode in which subagents review potentially dangerous tool calls and escalate them for user approval only when needed.
This is a much better and safer way than just using a YOLO mode.

### Separate choice of model

Ideally, TeamCode should offer users flexibility in the cost of this feature, for example, by allowing them to choose which model to use for auto-reviews. So users could choose a cheaper, lighter model than the main one used in the session.

---

## #25642 — [FEATURE][Desktop]: Move per-session auto-accept permissions toggle from General Settings

📅 `2026-05-03` | ✏️ **Spikhalskiy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25642](https://github.com/anomalyco/opencode/issues/25642)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

Currently "Auto-accept permissions" toggle is located in "Settings -> General" and appears to be a permanent toggle that affects all sessions, but it actually gets turned off for each new session.
Settings -> General is a confusing place for a per-Session toggle.

## Proposal

It would be great if it could be moved to a more conventional location aligned with other coding agent harnesses - somewhere under the text input field of the session.


<img width="933" height="287" alt="Image" src="https://github.com/user-attachments/assets/02d01cc2-b2e4-4a72-a7ce-98b4cab0567d" />
<img width="581" height="152" alt="Image" src="https://github.com/user-attachments/assets/aa1620ca-493d-418d-8b1a-749255c6ab02" />

---

## #25641 — [FEATURE]:GPT 5.3 Codex Spark access

📅 `2026-05-03` | ✏️ **nmzpy** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25641](https://github.com/anomalyco/opencode/issues/25641)


### Feature has been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It used to be there but now it's missing!

I have ChatGPT Pro sub and I'm using the subscription in TeamCode via the official OAuth method.

<img width="805" height="426" alt="Image" src="https://github.com/user-attachments/assets/a0aed22b-fed6-4ea5-82cf-4a2fba01f47a" />

---

## #25626 — [FEATURE]: Add support for verbosity and fix reasoning params for OpenRouter claude-opus-4.7

📅 `2026-05-03` | ✏️ **haowang02** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25626](https://github.com/anomalyco/opencode/issues/25626)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description

OpenRouter's `claude-opus-4.7` model introduces breaking changes regarding reasoning and sampling parameters. Currently, TeamCode uses parameters that are ignored by this model and lacks support for the new `verbosity` parameter which is the correct way to control response effort on Opus 4.7.

## Background

According to the [OpenRouter Claude 4.7 Migration Guide](https://openrouter.ai/docs/guides/evaluate-and-optimize/model-migrations/claude-4-7):

1. **Adaptive-only thinking**: `reasoning.effort` and `reasoning.max_tokens` are accepted but **ignored**. Adaptive thinking is always used when reasoning is enabled.
2. **New `verbosity` parameter**: To influence response effort, users should use `verbosity` (maps to `output_config.effort`). This supports levels: `low`, `medium`, `high`, `xhigh`, `max`.
3. **Sampling parameters removed**: `temperature`, `top_p`, and `top_k` are ignored.

## Current Behavior

In `packages/teamcode/src/provider/transform.ts`:

1. **`adaptiveReasoningOptions()`** (lines ~475-477):
   Returns `{ reasoning: { effort } }` for OpenRouter Claude models. On `claude-opus-4.7`, this parameter is ignored.
   
   ```typescript
   case "@openrouter/ai-sdk-provider":
     if (!model.id.includes("gpt") && !model.id.includes("gemini-3") && !model.id.includes("claude")) r

> *[Truncado — 2754 chars totais]*

---

## #25625 — [FEATURE]: Allow renaming or moving a project folder while persisting history for sessions

📅 `2026-05-03` | ✏️ **claell** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25625](https://github.com/anomalyco/opencode/issues/25625)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

This is a pretty important feature for UX. And also mirrored on other products, like Codex: https://github.com/openai/codex/issues/15347, or GitHub Copilot: https://github.com/microsoft/vscode/issues/313970

Basically, as a user, I oftentimes don't already know where the folder I am working in will be finally staying. Sometimes, I might just create a folder on the Desktop, and then work from there. Later decide that it should live somewhere else. Sometimes, I might also want to do bigger restructuring of existing folders.

Currently, this seems to not keep the chat session history.

As a user, this is unwanted, and can prevent me from moving stuff around. Of course, one can probably somehow later have a script running that will point the existing session files to the new location as a workaround. But this is not nice.

So I hope that there can be a solution for this. For easy renaming/moving: Maybe have a context menu entry or general option for this, that does exactly such things automatically for me? Rename the folder and take care of everything?

For the future, one could also foresee something in addition, like (locally) fingerprinting a folder to easily find it again (maybe also storing some ID inside it), support for "orphaned" sessions, ...

---

## #25624 — [FEATURE]: Detect model(s) using the /v1/models route on custom provider

📅 `2026-05-03` | ✏️ **celsowm** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25624](https://github.com/anomalyco/opencode/issues/25624)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request


When we try to add a custom provider, an open-ai compatible one (vllm in my case), we need to put manually the id of the model or models name:

<img width="601" height="324" alt="Image" src="https://github.com/user-attachments/assets/6c7cd965-592c-4bd7-851b-26b088316fb6" />

but when we do the same on kilo code, this one automatically detects the model(s):

<img width="476" height="221" alt="Image" src="https://github.com/user-attachments/assets/6f64cf51-9794-46da-85a0-00578bca0f8d" />

magic? no ! kilo just use the old and good /v1/models route:

<img width="1508" height="818" alt="Image" src="https://github.com/user-attachments/assets/c8d4cde2-597c-4a0c-a319-75b0cb01e331" />


please implements the same feature of kilo code

---

## #25614 — [FEATURE]: Add Manifest provider to providers documentation

📅 `2026-05-03` | ✏️ **SebConejo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25614](https://github.com/anomalyco/opencode/issues/25614)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a Manifest section to the providers documentation page (`packages/web/src/content/docs/providers.mdx`).

Manifest is an open-source LLM router being added to models.dev (anomalyco/models.dev#1686). A docs section following the same format as OpenRouter would let users know how to connect it.

A PR is ready: #25476.

---

## #25611 — [FEATURE]: 对话界面明示当前模型是否具备图片识别能力

📅 `2026-05-03` | ✏️ **LifetimeVip** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25611](https://github.com/anomalyco/opencode/issues/25611)


﻿- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

**环境信息**
- TeamCode 版本：v1.14.33（桌面版）
- 操作系统：Windows（win32）

**问题描述**
当前对话界面没有任何标识，用户无法直观判断当前模型是否支持图片识别（识图）功能。用户发送图片后，无法预知模型能否处理，可能导致等待或误操作。

**具体增强需求**

### 1. 对话界面增加识图能力标识
在输入框附近或模型选择区域，增加明确的视觉标识：
- 支持识图：显示「🖼️ 支持识图」或「📷 可识别图片」标识
- 不支持识图：显示「❌ 不支持图片」或灰色图标提示
- 标识位置建议：模型名称旁、输入框上方、或发送按钮附近

### 2. 发送图片时给出明确反馈
当用户尝试发送图片时：
- 若当前模型支持识图：输入框显示图片缩略图，可正常发送
- 若当前模型不支持识图：弹出提示「当前模型不支持图片识别，请切换至支持识图的模型」，并建议切换选项

### 3. 设置页增加模型能力说明
在「设置→模型」页面，每个模型旁增加能力标签：
- 「支持：文本、图片、文件」等标签
- 用户可快速筛选支持识图的模型

**预期收益**
- 用户无需试错即可知道当前模型能力
- 减少无效等待和困惑
- 提升使用体验和透明度

---

## #25610 — [FEATURE]: 桌面版增加盘符/文件夹操作保护配置，左侧导航栏明确标识安全区域

📅 `2026-05-03` | ✏️ **LifetimeVip** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25610](https://github.com/anomalyco/opencode/issues/25610)


﻿- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

**环境信息**
- TeamCode 版本：v1.14.33（桌面版）
- 操作系统：Windows（win32）

**建议背景**
当前桌面版左侧导航栏仅展示文件结构，用户无法直观感知哪些盘符/文件夹被限制操作。对于需要保护重要数据的场景（如系统盘、备份盘、个人重要文件夹），缺少明确的安全状态提示，使用中存在误操作的顾虑。

**具体增强需求**

### 1. 左侧导航栏新增保护设置入口
在桌面版左侧栏目（导航栏）增加「操作保护」快捷按钮，点击可快速配置受保护资源：
- 支持**任意选择**系统内所有可用盘符进行勾选保护（自动识别当前系统全部盘符，如C:、D:等）
- 支持**勾选方式选择**需要保护的文件夹（可配合系统文件选择器快速选取目标文件夹，无需手动输入路径）
- 勾选后对应资源自动禁止所有写操作：包括删除、修改、格式化、文件写入、移动等
- 配置实时生效，无需重启应用。

### 2. 设置页新增操作保护配置项
在「设置→安全/通用」分类下新增「禁止操作路径」模块：
- 支持添加受保护的盘符（自动列出所有可用盘符供勾选）和文件夹（支持勾选/手动输入两种添加方式）
- 支持单独开关每个保护项，可批量导入/导出保护规则。

### 3. 左侧导航栏明确标识保护状态
被设置为禁止操作的盘符/文件夹，在左侧导航栏中：
- 增加「🔒 受保护」醒目标识
- 鼠标悬停提示：「该路径已禁止所有修改操作，当前安全」
- 尝试对该路径执行任何操作时，弹出明确阻断提示并告知已被保护。

**预期收益**
用户可直观区分安全/可操作区域，通过勾选方式快速配置保护规则，消除误操作顾虑，尤其适合需要严格限制文件修改的场景，大幅提升使用安全感。

---

## #25607 — [FEATURE]: Support '>' prefix in TeamCode Desktop's command palette to display all available commands

📅 `2026-05-03` | ✏️ **MarkSFrancis** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25607](https://github.com/anomalyco/opencode/issues/25607)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Discoverability of commands in TeamCode Desktop is currently limited. The `Mod+K` / `Mod+P` omni-search only displays a very limited, pre-selected subset of commands alongside files and sessions. Users must guess the name of an unlisted command to filter for it, which hinders the discoverability of commands.

**Proposed Solution:**
Introduce support for the `> ` prefix in the command palette to trigger a "command-only" search mode, overriding the default omni-search behavior.

**Expected Behaviour:**
1. When the user types `>` into the palette, the palette should instantly populate with a flat list of *all* available application commands from the registry.
1. Any subsequent characters typed after the `>` prefix (ignoring whitespace after the `>`) should utilise the existing fuzzy-matching logic, but applied exclusively against the full command list.

*Note on UX: The Desktop client currently lacks command categorisation (unlike the TUI), so this issue implies rendering a flat list without categories.*

---

## #25605 — [FEATURE]: Switch from plan to build when ack a plan

📅 `2026-05-03` | ✏️ **franjorub** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25605](https://github.com/anomalyco/opencode/issues/25605)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi, in Cline there is a feature that we you are ok with a Plan, you hit tab and it automatically changes to build mode to execute the plan. here you have to shift + tab + write an approval prompt. 

would be great to have a signal trigger to execute plans

---

## #25582 — [FEATURE]: Add "Fork to new session" action from message timeline in TeamCode Desktop

📅 `2026-05-03` | ✏️ **adrian15** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/25582](https://github.com/anomalyco/opencode/issues/25582)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary
TeamCode App should support forking directly from a specific user message into a new session, matching existing CLI/TUI behavior.

## Problem
In the app flow, users currently need to use the session fork dialog/command flow to branch from history. This is slower and less discoverable than a message-level action.

## Proposed behavior
- Add a message action button: "Fork to new session" on user messages.
- On click, call `session.fork` with `sessionID` and `messageID`.
- Navigate to the returned forked session.
- Restore prompt content from the selected source message in the new session.
- Use localized error handling (no hard-coded strings).

## Scope
- `packages/ui`: expose/render message-level fork action next to existing message actions.
- `packages/app`: wire action to API, prompt scoping, navigation, and error toast.
- Keep implementation small and focused; do not change server fork semantics in this issue.

## Acceptance criteria
- Fork action appears on user messages in app timeline.
- Fork creates a new session from the selected message boundary.
- New session opens immediately and is highlighted/selected in sidebar.
- Prompt state is scoped to the new session, not the previous one.
- Typecheck passes for affected packages.

## Verification plan
- Run `bun run typecheck` from `pac

> *[Truncado — 2059 chars totais]*

---

## #25576 — [FEATURE]: Add cross-worktree directory inclusion (e.g., add-dir) to unlock Gork Tool's full potential and eliminate redundant manual setup

📅 `2026-05-03` | ✏️ **pengln** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25576](https://github.com/anomalyco/opencode/issues/25576)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature Request Summary

I would like to request a feature similar to Claude Code's `add-dir` command, which allows users to include additional directories outside the current workspace into the working context. This would enable TeamCode's internal **Gork Tool** to retrieve and reference content from shared external directories, without requiring manual copying or recreation of those directories in every new worktree.

## Motivation & Problem

In my current workflow, I maintain several worktrees for different features or branches. Many of these projects depend on a common set of shared resources (e.g., utility libraries, documentation, configuration templates, or reference data) that reside in a centralized directory outside any individual worktree.

Currently, to make these resources accessible to the Gork Tool within TeamCode, I have to manually copy or recreate these shared directories inside each new worktree. This approach is:

- **Time-consuming**: Every new worktree requires redundant setup.
- **Error-prone**: Manual copying can lead to version mismatches or missing files.
- **Storage-inefficient**: Duplicating large shared directories across multiple worktrees wastes disk space.
- **Maintenance-heavy**: Updates to the shared resources must be propagated to every worktree individually.

#

> *[Truncado — 2342 chars totais]*

---

## #25570 — [FEATURE]: Support Multiple Skills in a Single Prompt — Critical for Multi-Framework Workflows

📅 `2026-05-03` | ✏️ **pengln** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25570](https://github.com/anomalyco/opencode/issues/25570)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description

Currently, TeamCode does not support specifying multiple skills simultaneously in a single prompt. When I input multiple skill commands such as `/vue3 /vue-router-v4`, only the first skill (`/vue3`) is loaded and activated. The second skill (`/vue-router-v4`) is incorrectly treated as plain user input rather than being parsed and loaded as an additional skill.

## Current Behavior

- **Input:** `/vue3 /vue-router-v4`
- **Actual Result:** Only the `/vue3` skill is loaded. `/vue-router-v4` is passed as raw text to the model without skill activation.

## Expected Behavior

Both `/vue3` and `/vue-router-v4` skills should be parsed, loaded, and activated concurrently, allowing the model to leverage the context and capabilities from multiple skills simultaneously within the same session.

## Use Case & Importance

In real-world development, projects rarely rely on a single technology in isolation. For example:

- A Vue 3 project almost always uses **Vue Router** alongside it.
- A React project frequently requires both **React** and **React Router** context.
- Full-stack tasks often involve both **frontend** and **backend** skills at the same time.

Without support for multiple skills, users are forced to:

1. Choose only one skill and lose critical context from others.
2. Manually paste do

> *[Truncado — 2174 chars totais]*

---

## #25556 — [FEATURE]: Desktop/Web - Review panel - unstaged mode

📅 `2026-05-03` | ✏️ **gemyago** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25556](https://github.com/anomalyco/opencode/issues/25556)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

On review panel, there is currently "Git changes", "Branch changes" and "Last turn changes". It would be very useful to have "Unstaged" option there. In this mode, when viewing diff for any file, there should be some action somewhere that will allow me to stage the file. I've been working with codex before and this mode makes reviewing experience more streamlined.

---

## #25555 — [FEATURE] Support reverting question answers like normal conversation messages

📅 `2026-05-03` | ✏️ **Tenaryo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25555](https://github.com/anomalyco/opencode/issues/25555)


## Feature Request

Currently, when the `question` tool asks the user something and the user provides an answer, that answer is not a valid undo/fork point. This means:

1. You cannot `/undo` back to a question to choose a different answer
2. You cannot fork the conversation from a question point

### Desired Behavior

Question answers should be treated as valid fork/undo points, just like any other user message in the conversation.

### Use Case

When the assistant asks a design/implementation question and then builds on the answer, if the result isn't what the user wanted, they should be able to revert back to that question and try a different answer — without losing all the work done *before* the question.

### Related Issues

- #8589 (closed/auto-expired, same request, maintainer asked to re-open if still relevant)
- #12625 (open, reports that `/undo` after answering a question undoes the last prompt instead)

### Environment

- teamcode version: latest

---

## #25536 — [FEATURE]: Sort top-level docs sidebar entries by visual width

📅 `2026-05-03` | ✏️ **PanAchy** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25536](https://github.com/anomalyco/opencode/issues/25536)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The entries in the docs page have become out of order and must be corrected before the real CEO comes back from India.

Affected entries:

   - Intro
   - Config
   - Providers
   - Network
   - Enterprise
   - Troubleshooting
   - Windows

This is a small docs navigation polish change.

**iykyk**

---

## #25535 — [FEATURE]: Recommend GUI partition tools first; avoid complex CLI workarounds on desktop systems

📅 `2026-05-03` | ✏️ **Udhaya-kumar-N** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25535](https://github.com/anomalyco/opencode/issues/25535)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Feature hasn't been suggested before**.

 I have verified this feature I'm about to request hasn't been suggested before.
Describe the enhancement you want to request
Description :
When assisting with partition resizing on a desktop Linux system, I was presented with multiple problematic options:

**Option A (Reboot to Live Media):**

Safest approach
Requires reboot and creating/obtaining live USB media
Guaranteed to work

**Option B (Online CLI Resizing):**

Presented as viable but actually high-risk
Required multiple failed attempts with parted, sfdisk, blockdev
Involved complex workarounds (Python stdin, PTY emulation, etc.)
Could have corrupted the partition table if something went wrong
Kept hitting kernel-level restrictions on mounted partitions

**Option C (GUI Partition Manager) - The Best Solution:**

Simple, visual, user-friendly
Safe with proper confirmation prompts
No complex workarounds needed
Completed successfully in seconds

_The Issue:_
I should have recommended Option C first, but was not recommended untill i thought about it and shared a screenshot of the fedora partition page after hearing the all the plans of high risk. On desktop systems with graphical tools available, the GUI should be the primary recommendation.

_Improvement Needed:_
When helping with partition tasks on de

> *[Truncado — 1825 chars totais]*

---

## #25531 — [FEATURE]: Support runtime-refreshable plugin tools with session-aware execution context

📅 `2026-05-03` | ✏️ **lingeasy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25531](https://github.com/anomalyco/opencode/issues/25531)


Support runtime-refreshable plugin tools with session-aware execution context

I’m integrating an external tool/runtime system into TeamCode and ran into a gap between the current plugin API and the MCP integration model.

## The gap

Today there are two useful capabilities, but they live on different sides:

1. **Plugin tools** have access to TeamCode-native context such as `sessionID`, and plugin hooks can participate in tool execution and prompt shaping.
2. **MCP tools** support dynamic tool inventory changes (`tools changed`, reconnect/disconnect, re-listing, etc).

For some integrations, we need **both at the same time**.

## Real-world use case

We have an external tool/runtime backend whose available tools are dynamic:
- installing a package adds new tool IDs
- uninstalling removes tool IDs
- updating may add/remove/rename tools
- backend restart/reconnect may temporarily remove and later restore tools

At the same time, some of those tools cannot be exposed to the model as raw passthrough tools. They need **TeamCode-specific wrapping** using host/session context.

A concrete example is a memory-oriented skill/tool that expects a backend-specific `workmem_id`, but in TeamCode the correct product behavior is to derive that automatically from the current `sessionID` (and potentially workspace/project/thread semantics), so the model never has to manage that identifier itself.

This means:
- **MCP alone is not enough**, because we still need a host/plugin layer to adapt ar

> *[Truncado — 3617 chars totais]*

---

## #25508 — [FEATURE]: Native --stdin support for teamcode run to handle large prompts without ARG_MAX errors

📅 `2026-05-03` | ✏️ **aleka** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25508](https://github.com/anomalyco/opencode/issues/25508)


### Problem Description

When using `teamcode run` with large prompts (e.g., code reviews of 1700+ line files), the prompt is passed as a positional argument. This causes critical issues:

1. **ARG_MAX limit**: On Linux, the maximum argument length is ~2MB. Large prompts exceed this, causing `E2BIG: argument list too long` errors before the command even executes.
2. **Performance**: Passing large strings as command-line arguments is inefficient and slow.
3. **Workaround complexity**: Currently requires writing to a temp file and using `-f` flag, which has security restrictions (files must be within project directory, see related issues).

### Current Behavior

```bash
# This fails with large prompts (>2MB)
teamcode run --model kimi-for-coding/kimi-k2-thinking "very large prompt..."

# Current workaround: write to file in project directory
echo "$prompt" > ./temp_prompt.txt
teamcode run --model kimi-for-coding/kimi-k2-thinking "Review this" -f ./temp_prompt.txt
```

### Proposed Solution

Add native `--stdin` support for `teamcode run`:

```bash
# Option 1: Explicit --stdin flag
printf '%s' "$prompt" | teamcode run --model kimi-for-coding/kimi-k2-thinking --stdin

# Option 2: Auto-detect stdin when no positional args
printf '%s' "$prompt" | teamcode run --model kimi-for-coding/kimi-k2-thinking
```

### Benefits

- **No ARG_MAX issues**: Stdin has no practical size limit
- **Better performance**: No command-line parsing of large strings
- **Simpler integration**: Tools can pipe

> *[Truncado — 2533 chars totais]*

---

## #25494 — [FEATURE] pre_chat.messages.transform hook for image-to-text stripping

📅 `2026-05-02` | ✏️ **n1flh31mur** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25494](https://github.com/anomalyco/opencode/issues/25494)


### Verification

- [x] I have verified this feature request has not been suggested before (see #24125, #19960 — this issue proposes a unified approach combining their ideas)

### Problem

Plugins cannot strip or transform messages before they reach the LLM. When a user attaches an image, the LLM errors out with `"this model does not support image input"`.

The existing hooks have limitations:
- `experimental.chat.messages.transform` has `input: {}` — it never receives messages (#19960)
- #24125 proposes `message.parts.before` for image handling but it is not implemented
- No hook fires BEFORE the LLM is called

### Proposed Solution

Add `pre_chat.messages.transform` — a hook that fires **before** the LLM, receiving the full messages array and allowing plugins to transform them:

```typescript
"pre_chat.messages.transform"?: (
  input: {
    sessionID: string
    agent: string
    model: Model
    messages: { info: Message; parts: Part[] }[]
  },
  output: { messages: { info: Message; parts: Part[] }[] },
) => Promise<void>
```

### Use Cases

1. **Image-to-text stripping**: Scan for `FilePart` with `image: true`, call a Vision server (Qwen2.5-VL-3B), replace with `TextPart` containing the description
2. **Vision plugin integration**: Transform messages on-the-fly so the LLM always receives text-only input
3. **Pre-inference modification**: Any plugin that needs to modify messages before the LLM

### Backward Compatibility

- `experimental.chat.messages.transform` is non-fun

> *[Truncado — 1966 chars totais]*

---

## #25478 — [FEATURE] `teamcode tool <name>` subcommand for non-LLM single-tool exec

📅 `2026-05-02` | ✏️ **JRedeker** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25478](https://github.com/anomalyco/opencode/issues/25478)


## Summary

Need a CLI path to invoke a single MCP tool against a project context and exit, without any LLM round-trip. Current options (`teamcode run --agent build "Run X tool"`) cost 60–300s of LLM-loop overhead per call, even for read-only verification ops.

## Proposed

```bash
teamcode tool <tool-name> \
  --dir <project-dir> \
  --args '{"key":"value"}' \
  [--format json|text]
```

Behavior:
1. Resolve project context for `--dir` (load plugins, MCP servers, config — same path as `teamcode serve`).
2. Look up `<tool-name>` in the registered tool registry (built-ins + plugin tools + MCP tools).
3. Validate `--args` against the tool's input schema.
4. Execute the tool's handler synchronously.
5. Print result as JSON (default) or text. Exit 0 on success, non-zero on tool error / arg validation failure.
6. **No agent loop, no LLM call, no session creation.**

## Use case

Tooling-heavy plugins (ADV/spec-driven dev, codebase scanners, custom diagnostic tools) need automated cross-project ops. Examples:

- `teamcode tool adv_workflow_repair --dir ~/dev/other-repo --args '{"changeId":"..."}'` — repair another project's ADV workflow state from a script.
- `teamcode tool adv_change_list --dir ~/dev/proj-a --args '{"limit":50}' | jq` — read another project's ADV state for dashboards/CI.
- `teamcode tool sentry_get_issue --args '{"issueId":"X"}' --format json` — fetch a single MCP tool result in CI without spinning up an agent.
- Migration scripts that need to invoke 20+ tools in 

> *[Truncado — 3202 chars totais]*

---

## #25456 — [FEATURE]: Configurable thinking mode for session title generation (default to non-thinking)

📅 `2026-05-02` | ✏️ **0byte-coding** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25456](https://github.com/anomalyco/opencode/issues/25456)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

Session title generation is a lightweight, insignificant operation — it doesn't warrant using the model's thinking/reasoning capabilities. Using thinking mode for title generation wastes compute, tokens, and adds unnecessary latency with no meaningful benefit to output quality.

**Proposed change:** Default session title generation to non-thinking when possible, but allow users to opt into thinking if desired via configuration:

```jsonc
{
  "$schema": "https://teamcode.ai/config.json",
  "agent": {
    "title": {
      // can be set to "none", "minimal", "low", "medium", "high"
      "thinking": "none"  // default: no thinking for title generation
    }
  }
}
```

**Benefits:**
- Reduces token usage and cost on every session start
- Lowers latency for session initialization
- Keeps thinking/reasoning reserved for tasks that actually benefit from it (agent work, code generation, etc.)
- Gives users full control if they prefer reasoning during title gen

---

## #25454 — [FEATURE]: Secure API Key Transfer for Remote Opencode Environments

📅 `2026-05-02` | ✏️ **hansfl14** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25454](https://github.com/anomalyco/opencode/issues/25454)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I use TeamCode client on my office computer that connects to remote servers via Opencode Server . The current remote workflow has a lot of friction because each remote TeamCode server needs its own provider/API credentials configured locally.

For example, if I use OpenRouter, I want to add my OpenRouter API key once on my desktop TeamCode client and then connect to remote servers without manually adding/copying that key to every server.

Right now, the practical options are all awkward:

- Run /connect separately on every remote server
- Copy ~/.local/share/teamcode/auth.json to each server
- Inject provider API keys through SSH/env vars
- Use an external gateway/proxy just to centralize credentials

All of these either add operational overhead or increase the chance of leaking long-lived API keys.

Remote development is common. Many users build and run apps on VPS machines, cloud dev boxes, staging servers, and production-like environments. Requiring provider credentials to be configured separately on every server makes remote TeamCode harder to use and less secure.

Implementation Options
Option 1: Temporary In-Memory Key Handoff

The desktop client sends the provider API key to the remote TeamCode server over the authenticated TeamCode client/server connection when a remote session starts.

The 

> *[Truncado — 1801 chars totais]*

---

## #25432 — 【桌面端】建议去掉顶部反复闪烁的加载提示

📅 `2026-05-02` | ✏️ **Hikpy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25432](https://github.com/anomalyco/opencode/issues/25432)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### 中文说明

Desktop 版本顶部区域会一闪一闪的，看起来像网页一直在加载或刷新。

这个效果在正常使用时有点分散注意力，也会让桌面端体验显得不够精致、不够原生。

建议去掉顶部这种闪烁式加载提示，或者换成更克制的加载状态，只在确实有耗时操作时显示。这样顶部栏会更稳定，整体观感也会更专业。

### English

In the desktop app, the top/title area can flash repeatedly, which makes it look like a web page is constantly loading or refreshing.

This is visually distracting during normal use and makes the desktop experience feel less polished/native than the rest of the product.

Please consider removing the flashing indicator from the desktop top area, or replacing it with a quieter loading state that only appears when there is a clear long-running operation.

A more stable top bar would make the app feel calmer, more native, and more professional.

---

## #25411 — [FEATURE]: CAJAL Scientific Paper Generator Integration (Local LLM)

📅 `2026-05-02` | ✏️ **Agnuxo1** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25411](https://github.com/anomalyco/opencode/issues/25411)


## Verification
- [x] I have verified this feature hasn't been suggested before

## Description

**What:** Integration for generating publication-ready scientific papers directly from TeamCode using local LLM via Ollama.

**Why this fits TeamCode:**
- TeamCode is the AI-native IDE — researchers need academic writing tools integrated into their workflow
- CAJAL generates structured papers (7 sections: Abstract, Introduction, Methods, Results, Discussion, Conclusion, References) with real arXiv citations
- 100% local via Ollama, matching TeamCode's privacy-first philosophy
- Zero API cost, MIT licensed, open source

**Integration approach:**
- TeamCode tool integration (like existing /explain, /doc commands)
- New command: `/paper <topic>` or `/cajal <topic>`
- Ollama bridge for local inference (TeamCode already supports local models)
- Structured output with tribunal scoring

**Implementation:** https://github.com/Agnuxo1/CAJAL

**Note on #22985:** I reviewed #22985 and it appears to be a different proposal (peer-reviewed paper generation via slash command using a community tool). CAJAL is a standalone local model with structured 7-section generation and tribunal scoring — the integration approach differs.

Happy to adapt to TeamCode's tool conventions and contribute a PR with working code.

---

## #25409 — [FEATURE]: Amazon Bedrock service tier support

📅 `2026-05-02` | ✏️ **BarkinBalci** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25409](https://github.com/anomalyco/opencode/issues/25409)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Would love to see support for choosing the service tier when using Bedrock models.

Most of my workloads are not latency sensitive, so I’d likely use the `flex` tier pretty often if it were available to help reduce costs. It would also be useful to choose `standard` or `priority` for workloads where lower latency is needed.

AWS docs: https://docs.aws.amazon.com/bedrock/latest/userguide/service-tiers-inference.html

---

## #25407 — [FEATURE]: Hydrate custom provider model metadata from /v1/models and Models.dev

📅 `2026-05-02` | ✏️ **morpheus9393** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25407](https://github.com/anomalyco/opencode/issues/25407)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please improve custom OpenAI-compatible providers so model capabilities do not have to be entered manually for every model.

My custom provider exposes models through `/v1/models`, but TeamCode still needs each model manually configured in `teamcode.jsonc` to get useful capabilities such as:

- `limit.context`
- `limit.output`
- `modalities.input`, especially image support
- reasoning variants/options for known OpenAI GPT/Codex models

The practical problem: I had an image-capable GPT model exposed by a custom provider, but TeamCode treated it as text-only until I manually added:

```jsonc
"modalities": {
  "input": ["text", "image"],
  "output": ["text"]
}
```

The context display also showed unknown capacity until I manually added limits.

For a provider with many models, manually adding all model metadata is very tedious and easy to get wrong.

Suggested behavior:

- For custom OpenAI-compatible providers, call `{baseURL}/models` to discover available model IDs.
- If a model ID is known in Models.dev, hydrate TeamCode metadata from there where possible.
- Merge this with user config, with explicit user config taking precedence.
- At minimum, auto-fill known limits and modalities for recognized models.

Related issues that seem to describe the same general pain point:

- #6231
- #18219
- #23327

T

> *[Truncado — 1697 chars totais]*

---

## #25402 — [FEATURE]: add timeline jump navigation to desktop app

📅 `2026-05-02` | ✏️ **abhineet-biju** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25402](https://github.com/anomalyco/opencode/issues/25402)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description

In long desktop conversations, it can be hard to return to an earlier message without manually scrolling.

The TUI has `/timeline`, but that feature rewinds the conversation to the selected point. 

For the desktop app, I’m requesting a timeline navigation feature that lets you jump to an older prompt in the timeline without scrolling.

Since the desktop app already has a rewind button under individual prompts, rewind doesn't need to be part of this feature.

## Proposed behavior

Add a desktop command `/jump` that lets users select a previous prompt and scroll directly to it.

## Why

This would make long desktop conversations easier to navigate while keeping rewind as an explicit per-message action.

---

## #25401 — [FEATURE]: Show available models and their credit usage in model list

📅 `2026-05-02` | ✏️ **mn-su** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25401](https://github.com/anomalyco/opencode/issues/25401)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be very useful to see which models are actually available/enabled and their credit usage directly in the model list output. Currently, we have to guess or check elsewhere. 
It would be great if the model list could show:
- ✅ / ❌ indicators for which models are currently available/configured
- Credit cost per request (or per token) for each model
- Remaining credits for the user's account
This would help users make informed decisions about which model to use for a given task, especially when managing usage limits.
Thanks!

---

## #25395 — [FEATURE]: scheduled tasks support

📅 `2026-05-02` | ✏️ **Po1nt9** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25395](https://github.com/anomalyco/opencode/issues/25395)


I use teamcode desktop app and really wish it could run tasks automatically at set times.\n\nRight now I have to manually trigger teamcode every time. Would be nice if I could set up a schedule for tasks, similar to cron.\n\nThings I would like to do:\n- run code review automatically every morning\n- check for outdated dependencies periodically  \n- run tests at night\n\n---\n- [x] I have searched for existing issues and confirmed this is not a duplicate\n- [x] I have read the contribution guidelines

---

## #25393 — [FEATURE]: Can you please add edit feature. We want to use TeamCode as IDE

📅 `2026-05-02` | ✏️ **arenaura** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25393](https://github.com/anomalyco/opencode/issues/25393)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I would like to use this tool like IDEA and edit files inside TeamCode. At this moment, I am going to Visual Studio Code to edit little things. This feature will help us to econom time and nerves.

---

## #25390 — [FEATURE]: Allow using $HOME variable in tui.json plugin path

📅 `2026-05-02` | ✏️ **flexdinesh** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25390](https://github.com/anomalyco/opencode/issues/25390)
 | 🏷️ `opentui`


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently the plugin paths in `tui.json` only works if the path is absolute. Would make it easier to manage dotfiles across different machines with different users if the path would work with `$HOME` variable expansion.

Current:

```json
{
  "plugin": [
    "/home/myuser/workspace/oc-timer/tui.tsx",
    "/home/myuser/workspace/tokeninspector/plugins/teamcode-tui/oc-tokeninspector.tsx"
  ]
}
```

Proposed:

```json
{
  "plugin": [
    "$HOME/workspace/oc-timer/tui.tsx",
    "$HOME/workspace/tokeninspector/plugins/teamcode-tui/oc-tokeninspector.tsx"
  ]
}
```

---

## #25337 — [FEATURE]: Make read tool MAX_LINE_LENGTH configurable (currently hardcoded at 2000 chars)

📅 `2026-05-01` | ✏️ **moisestohias** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25337](https://github.com/anomalyco/opencode/issues/25337)


### Describe the enhancement you want to request

The `read` tool truncates any line exceeding **2000 characters** at a hardcoded limit, silently cutting content mid-word. This affects any file with long lines — dense markdown transcripts, minified code, data files, unwrapped text — and the user has no indication they're seeing partial content unless they spot the suffix.

### Location in code

`packages/teamcode/src/tool/read.ts`:
```typescript
const MAX_LINE_LENGTH = 2000
const MAX_LINE_SUFFIX = `... (line truncated to ${MAX_LINE_LENGTH} chars)`
```

### Why it matters

- Modern LLMs support 128K–200K context windows; a 2000-char-per-line cap is unnecessarily restrictive
- Single-line transcripts, long log entries, and base64-encoded content regularly exceed this limit
- Users are silently served incomplete content with no way to know or configure around it
- The `read` tool already has an `offset`/ `limit` pagination mechanism, but that doesn't help when the problem is within a single line

### Proposed solutions (any of the below)

**Option A — Make it configurable:**
Add a config field `read_max_line_length` to `teamcode.json`:
```jsonc
{
  "experimental": {
    "read_max_line_length": 8000
  }
}
```

**Option B — Increase the default:**
Bump `MAX_LINE_LENGTH` from 2000 to a higher value (e.g. 10000 or 50000) to align with modern model context windows.

**Option C — Surface a visible warning:**
Even without configurability, warn the user clearly when truncation occurs (n

> *[Truncado — 1888 chars totais]*

---

## #25308 — [FEATURE]: Markdown export: wrap thinking/reasoning content in <thinking> XML tags

📅 `2026-05-01` | ✏️ **moisestohias** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25308](https://github.com/anomalyco/opencode/issues/25308)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Related to #9387 (markdown session export), the markdown export format needs a clear, machine-parseable way to represent thinking/reasoning content — rather than using a `_Thinking_:` delimiter that has no closing counterpart.

**Problem**

When exporting a session that contains reasoning/thinking content (e.g., from models like Qwen3, DeepSeek, GLM, or any model whose responses include reasoning blocks), the current export renders the thinking start with what looks like `_Thinking_:` but provides no closing delimiter. This makes it impossible to distinguish where thinking ends and the actual assistant response begins when consuming the markdown export programmatically or visually.

**Requested behavior**

The markdown export should wrap thinking content in well-formed XML tags:

```markdown
## Assistant

### Thinking

<thinking>
The reasoning content goes here...
It can span multiple lines.
</thinking>

The actual assistant response continues here.
```

This mirrors the format already used by many models natively (DeepSeek, Qwen3, etc.) and keeps the thinking block clearly delimited.

**Additional context**

- This is specifically about the **markdown** export format (not JSON, not the live TUI rendering)
- The thinking block should be visually distinct in the markdown but also parseable by externa

> *[Truncado — 1843 chars totais]*

---

## #25286 — [FEATURE]: Better models selection

📅 `2026-05-01` | ✏️ **BogdanSuchko** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25286](https://github.com/anomalyco/opencode/issues/25286)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I want to be able to type the model name MYSELF and press enter and it will use this model, because when new model comes up and its not here you just cant use it.

For context I was tryna use OpenRouter and the stealth model openrouter/owl-alpha

---

## #25269 — [FEATURE TUI]: Shortcut for next / previous session

📅 `2026-05-01` | ✏️ **tnglemongrass** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25269](https://github.com/anomalyco/opencode/issues/25269)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I propose to add keybinds to allow configuring shortcuts to switch to next or previous session:

<leader> n -> next session
<leader> p -> previous session

Additionally, it would fit to have a leader-style shortcut for create new session (currently on `<leader>n`):

<leader> c -> create session

This would be similar to gnu screen and tmux, where there are shortcuts to switch to next/previous session with the leader key:

GNU screen:
Ctrl+a n -> next screen
Ctrl+a p -> previous screen
Ctrl+a c -> create new screen

tmux:
Ctrl+b n -> next pane
Ctrl+b p -> previous pane
Ctrl+b c -> create new pane

Acceptance:
- There are at least hooks `session_next`  and `session_previous`, with or without default keybindings assigned
- Optional: decide whether current default keybindings for <leader>n (session_new) and <leader>c (session_compact) could be better aligned to be consistent with screen/tmux behavior

---

## #25262 — [FEATURE]: Toggleable top-bar status header — session title, context, cost, MCP/LSP status, git branch

📅 `2026-05-01` | ✏️ **mr-omann** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25262](https://github.com/anomalyco/opencode/issues/25262)


### Feature hasn't been suggested before.

- [x] Verified. (Related but narrower requests: #24579 sticky title row, #5419 screen real estate, #15344 footer title. None cover the full status panel in a non-occluding top-bar layout.)

---

### The problem

The sidebar panel contains all session-at-a-glance info:

```
TeamCode JSON TUI session header visibility
Context
77,003 tokens · 39% used · $0.00 spent
MCP  blender ● · figma ✗ · gmail ● · google-calendar ● · notion ● · playwright ●
LSP  LSPs will activate as files are read
~/Documents/GitHub/ottomator/projects_ottomator/octo:master
```

This panel only appears when the terminal is **wide enough** to trigger the sidebar column. On a narrow window (split pane, laptop screen, vertical terminal layout) it disappears entirely — leaving no session context visible at all. There is no config or keybind to reposition it.

---

### Proposed feature

A **top-bar status header** that renders the same session-context information as a **fixed, non-occluding strip at the top of the chat area**, above the scrolling message list.

#### Content (priority order)

1. Session title
2. Context token count + percentage used
3. Cost so far (`$0.00 spent`)
4. MCP server statuses (name + connected/disabled dot)
5. LSP status line
6. Git branch (`~/path:branch`)
7. *(Modified files list — lowest priority / out of scope for v1)*

#### Rendering requirements

- **Non-occluding.** The header must occupy real layout rows — it pushes the message list down

> *[Truncado — 4202 chars totais]*

---

## #25239 — [FEATURE]:Expose GitHub Copilot "Auto" option in model selector

📅 `2026-05-01` | ✏️ **Khnx-ai** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25239](https://github.com/anomalyco/opencode/issues/25239)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Can you please give "Auto" option in model selector for github copilot. it has 10% discount.

<img width="203" height="334" alt="Image" src="https://github.com/user-attachments/assets/199f6cc7-1b8e-4e35-8028-382039df9bf3" />

<img width="895" height="501" alt="Image" src="https://github.com/user-attachments/assets/b3e30988-1202-41e4-a4ef-385796dd21d6" />

thanks

---

## #25237 — [FEATURE]: Add visual feedback for valid skill slash commands

📅 `2026-05-01` | ✏️ **gpaiva00** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25237](https://github.com/anomalyco/opencode/issues/25237)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When a user types a valid skill slash command, the prompt input should show subtle visual confirmation that the skill exists.

The leading valid skill token should render with blue/bold feedback while preserving the raw prompt text and normal submit behavior.

This applies to skill-backed commands from synced command data where `source === "skill"`, without changing autocomplete, command registration, APIs, or SDK output.

---

## #25223 — [FEATURE]: GIT & Remote server

📅 `2026-05-01` | ✏️ **ssgnilsen** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25223](https://github.com/anomalyco/opencode/issues/25223)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Seems everything is included other than GIT version control (same as vs code easy git ocmmit with comment one click deploy to git) and remote server. Then the coder is basically finished unless I am missing some features other developers are missing which I am not using?? :)

---

## #25150 — [FEATURE]:Add model fallback/failover support

📅 `2026-04-30` | ✏️ **Rong-Zhou-FR** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25150](https://github.com/anomalyco/opencode/issues/25150)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

Currently, TeamCode does not support automatic fallback to an alternate model when the primary model fails. This causes issues when:
- API errors occur
- Rate limits are hit
- Timeouts occur
- Model is temporarily unavailable

Users currently must manually switch providers/models when issues occur, which disrupts workflow.

## Proposed Solution

Add support for fallback models at configuration level:

1. **Model Priority List** - Allow specifying multiple models in priority order:
```json
{
  "model": ["deepseek-ai/DeepSeek-V4-Pro", "teamcode/gpt-5.1-codex"]
}
```

2. **Provider-level fallback** - If one provider fails, automatically try the next available provider

3. **Failure detection** - Automatically detect:
   - API errors
   - Rate limits (429)
   - Timeouts
   - Model not found (404)

## Use Cases

- Handle API rate limits gracefully by switching to backup model
- Automatic recovery from temporary provider outages
- Cost optimization by trying cheaper models first, escalating if needed

## Workaround (Current)

The `small_model` config exists but only applies to lightweight tasks like title generation - not general fallback behavior.

## Priority

Medium - This would improve reliability for production use cases.

---

## #25142 — [FEATURE]: Add tui.json option to control content area max-width / horizontal padding

📅 `2026-04-30` | ✏️ **alohaninja** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25142](https://github.com/anomalyco/opencode/issues/25142)


### Description

After a recent upgrade, the horizontal margins/padding on the main content area in the TUI appear to have increased, making the readable content area noticeably narrower — especially on wide terminals. Tables and long-form output get compressed while there's unused space on either side.

This was previously raised in #838, which was closed without a user-facing config option being added.

### Request

Add a `tui.json` option (e.g. `content_max_width` or `content_padding`) that lets users control how wide the main response content area renders. Something like:

```jsonc
// tui.json
{
  "content_max_width": 0, // 0 = full terminal width
  "content_padding": 1    // horizontal padding in columns
}
```

Currently `tui.json` supports `scroll_speed`, `diff_style`, `mouse`, etc. — but nothing for layout/spacing of the content area.

### Current behavior

- Content area has fixed left/right margins that cannot be overridden
- The theme system only controls colors, fonts, and syntax highlighting — not layout
- No documented workaround exists for adjusting content width

### Expected behavior

- Users can configure the content area width through `tui.json`
- Sensible default preserved, but overridable for users with wide terminals

### Environment

- OS: macOS
- Terminal: wide-screen setup

---

## #25116 — [FEATURE]: Make markdown `<hr>` rendered from `---`/`***` visible and configurable

📅 `2026-04-30` | ✏️ **chofuhoyu** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25116](https://github.com/anomalyco/opencode/issues/25116)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

LLM responses often contain `---` or `***` as visual separators between sections. These get correctly parsed by `marked` into `<hr>` elements, but the current CSS (`packages/ui/src/components/markdown.css:116-121`) makes them invisible:

```css
/* Horizontal Rule - Invisible spacing only */
hr {
  border: none;
  height: 0;
  margin: 40px 0;
}
```

The result is a jarring 40px gap of whitespace with no visible divider—the separator semantics are lost entirely.

<img width="1147" height="1107" alt="Screenshot showing two paragraphs with a large invisible gap where a horizontal rule should be" src="https://github.com/user-attachments/assets/8b0b1bf1-a04b-4b83-83b9-d2fc93fde67c" />

Meanwhile, the theme system already defines `--markdown-horizontal-rule` color tokens across all themes, and the TUI theme has markdownHorizontalRule. These tokens go unused because the hr element has no border or height to color.

The comment says "Invisible spacing only", however is there a known reason for keeping `<hr>` invisible? If this behavior is intentional, I’d appreciate a quick explanation, and we can close this issue. Otherwise, I think making it visible would improve the reading experience.

# Proposal

Make `<hr>` visible by rendering it as a thin horizontal line, using the existing `--markdown-horizontal-rul

> *[Truncado — 1872 chars totais]*

---

## #25102 — [FEATURE]: Make dialog and sidebar overlay backgrounds themeable

📅 `2026-04-30` | ✏️ **jnslmk** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25102](https://github.com/anomalyco/opencode/issues/25102)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

# Make dialog and sidebar overlay backgrounds themeable

## Summary

The dialog and sidebar overlays in the TUI use hardcoded RGBA values for their backgrounds, preventing users from customizing these through themes.

## Problem

In `packages/teamcode/src/cli/cmd/tui/ui/dialog.tsx` and `packages/teamcode/src/cli/cmd/tui/routes/session/index.tsx`, the overlay backgrounds are hardcoded:

```ts
// dialog.tsx
backgroundColor={RGBA.fromInts(0, 0, 0, 150)}

// session/index.tsx
backgroundColor={RGBA.fromInts(0, 0, 0, 70)}
```

That makes it impossible to adjust overlay transparency or color via their theme configuration.

For my use case I'd like to set the background of teamcode to transparent, which is possible for the main background but not for dialog backgrounds.

See https://github.com/jnslmk/teamcode-catppuccin-translucent-theme.

**Current behavior**
<img width="1252" height="1337" alt="Image" src="https://github.com/user-attachments/assets/6a14c288-1397-48ab-a4f0-daae8288cf84" />

**Desired behavior**
<img width="1262" height="1374" alt="Image" src="https://github.com/user-attachments/assets/6f7a3b01-f7e7-46ae-9037-82b1c7844f11" />

## Proposed Solution

Add two new optional theme properties:

- `backgroundDialogOverlay` - defaults to `RGBA(0, 0, 0, 150)` (semi-transparent black)
- `backgroundSid

> *[Truncado — 1571 chars totais]*

---

## #25095 — [FEATURE]: Use /review command prompt for GitHub PR review action

📅 `2026-04-30` | ✏️ **erazemk** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25095](https://github.com/anomalyco/opencode/issues/25095)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The /review command prompt starts a much more detailed review than the default prompt, used in the GitHub action. And since the GitHub action does more than just review (like posting the response), we can't just use `teamcode run --command review` to get the same result.

Ideally the same prompt that is used locally to review is also used in the GitHub action, so that the improvements to one are reflected in the other.

---

## #25089 — [FEATURE]: Editable allow all

📅 `2026-04-30` | ✏️ **al-prk** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25089](https://github.com/anomalyco/opencode/issues/25089)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

# [FEATURE]: Allow editing custom patterns in the "Allow always" permission flow

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

Right now, when TeamCode asks for permission to run a command and I choose **Allow always**, the TUI only lets me confirm the server-suggested pattern(s). That works for simple cases, but it is too limiting for commands where the suggested rule is much broader than what I actually want to allow.

For example, if the requested command is something like:

```bash
devcontainer exec ls
```

or:

```bash
docker exec -it app_foo cat /etc/hosts
```

the suggested "always allow" pattern may end up being broad, like:

```bash
docker *
```

What I want instead is a way to edit that rule before confirming, for example:

```bash
docker exec -it app_* cat *
```

That would make the feature much safer and more useful, because users could save a narrow session rule instead of being forced to choose between:

- a rule that is too broad
- approving the command every time with "Allow once"
- manually editing config outside the prompt

Suggested behavior:

- after selecting **Allow always**, open an editable textarea instead of a static confirm screen
- pre-fill it with the suggested pattern(s)
- allow o

> *[Truncado — 1934 chars totais]*

---

## #25080 — [FEATURE]: Hide the money `spent` in TUI

📅 `2026-04-30` | ✏️ **Yaojian** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25080](https://github.com/anomalyco/opencode/issues/25080)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Thank you the teamcode team for this GREAT software.

I have checked the documentation and the current issue, but I couldn't find any information on how to hide the spent information on the context panel in the TUI. This information often diverts my attention away from the task and towards thoughts like "Oh dear, another dollar has been spent. I need to act quickly. 🏃 " Is there any way to hide it?

---

## #25076 — [FEATURE]: render SVG/HTML artifacts inline in chat

📅 `2026-04-30` | ✏️ **CarryRoy007** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25076](https://github.com/anomalyco/opencode/issues/25076)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Problem
When a model generates SVG or HTML content, the desktop app only shows raw code. There's no way to preview the rendered output without copying it to a browser.
Proposed solution
Add an inline preview panel in the desktop app (Tauri-based) that renders SVG/HTML when the model outputs a code block tagged as svg or html. Similar to how Claude.ai or LobeChat handle Artifacts.
Why it belongs in TeamCode
The desktop app already wraps a web UI via Tauri, so a webview-based renderer is a natural fit. This would make the desktop experience meaningfully different from the TUI.

---

## #25071 — [FEATURE]:Add Cursor Cookbook

📅 `2026-04-30` | ✏️ **Knifelf** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25071](https://github.com/anomalyco/opencode/issues/25071)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Would be awesome if teamcode shipped with something like                      
  https://github.com/cursor/cookbook out of the box — basically a curated set of
   TypeScript examples showing how to hook into the SDK.                        

  Here's why this'd be cool:                                                    

  - Faster onboarding — new users could browse real, runnable examples instead
  of staring at a blank prompt
  - Plugin / extension ecosystem — cookbook-style examples are the perfect
  template for people building plugins or custom workflows                      
  - It's already proven — the cookbook pattern works great for Cursor; porting
  the concept just makes sense

---

## #25030 — [FEATURE]: Check TeamCode Go quota directly in the UI

📅 `2026-04-30` | ✏️ **franjorub** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25030](https://github.com/anomalyco/opencode/issues/25030)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi, I just subscribed to TeamCode Go and loving it. I would like to know if it is possible to have a command to print the daily, weekly and monthly remaining quota directly in the agent, similar to the stats command in gemini cli.

could this be released maybe as a plugin ?

---

## #24997 — [FEATURE]: Push each submitted prompt to the top of the screen and disable scrolling on answer stream

📅 `2026-04-29` | ✏️ **JaviOverflow** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24997](https://github.com/anomalyco/opencode/issues/24997)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Each time we submit a prompt, clear the screen so the prompt is on the top, and the answer is streamed right below it with the scrolling disable. After heavy usage of Opencode for months, I'm starting to lose my sight from reading moving text 🥲

---

## #24994 — [FEATURE]: Add question tool instructions to gemini.txt system prompt

📅 `2026-04-29` | ✏️ **capyBearista** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24994](https://github.com/anomalyco/opencode/issues/24994)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The `gemini.txt` system prompt tells the agent to ask clarifying questions but never mentions the `question` tool. The tool is registered and available, but Gemini models usually fall back to plain-text questions instead of the structured multi-choice UI without further, explicit instruction from the user.

This is the same class of problem as #22244 (Gemini missing Task tool instructions)—it seeks to encourage Gemini models to make use of the tools TeamCode provides.

A prior attempt at this change (PR #8982) was cloned since there was no existing linked issue.

### Proposed change
One line in `packages/teamcode/src/session/prompt/gemini.txt` line 30:

Append "using the `question` tool" to the existing "ask concise, targeted clarification questions" instruction.

---

## #24993 — [FEATURE]: experimental.session.pre-compact hook

📅 `2026-04-29` | ✏️ **AnterCreeper** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24993](https://github.com/anomalyco/opencode/issues/24993)


[FEATURE]: experimental.session.pre-compact hook

### Feature hasn't been suggested before.

- [x] I have verified this feature hasn't been suggested before.

### Describe the enhancement you want to request

During compaction, TeamCode enforces `tools: {}` and `summary: true`, blocking all tool calls. This prevents plugins from performing critical write operations before context is compressed — specifically, archiving important understandings from the conversation into scratchpad files and/or persistent memory (e.g., Memory.md).

The existing `experimental.session.compacting` hook only allows injecting text into the summary prompt. It cannot execute tools, so structured data migration is impossible.

### Use case: AI memory systems

In long sessions, AI accumulates critical understandings that should persist beyond the current conversation window. Before compaction destroys the detailed context, plugins need to:

- Extract key insights from the conversation
- Write them to scratchpad or structured memory files (Memory.md)
- Go through normal permission/approval flows for file modifications

Without this hook, these operations must happen during normal conversation (unreliable) or are lost entirely.

### Proposed solution

Add an `experimental.session.pre-compact` hook that fires **before** compaction, giving plugins an autonomous cycle with tool access:

```typescript
"experimental.session.pre-compact"?: (
  input: { sessionID: string; auto: boolean; parentID: string },
  ou

> *[Truncado — 2923 chars totais]*

---

## #24990 — [FEATURE]: Add TUI ability to inspect session system messages

📅 `2026-04-29` | ✏️ **emiasims** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24990](https://github.com/anomalyco/opencode/issues/24990)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, there is no way to directly inspect or view system messages (such as system prompts, environment info, or initial context details) from the TeamCode TUI during a session. This feature request proposes adding a TUI feature to view the current or previous system message(s) associated with the active session or a selected session. 

**Benefits:**
- Allows users to verify, debug, and audit what system prompt/context is being provided to the model.
- Helps troubleshoot session behavior by letting users see key context details (like working directory, platform, custom environment settings, etc.) used in system messages.
- Improves transparency for users who suspect system context is affecting completions or need to confirm OPENCODE's understanding of environment state.

**Suggested implementation:**
- Add a TUI shortcut or command (e.g., `/system` or a context menu option in the session list) that opens the latest system message for the current session.
- Optionally support viewing system messages for previous sessions or the full session timeline.
- Display the exact content of the message (with redaction as needed for sensitive values), formatted for readability.

This would give TUI users parity with API/web users who can already view or export system messages, and is especially helpful for 

> *[Truncado — 1762 chars totais]*

---

## #24981 — [FEATURE]: Support explicit proxy configuration in teamcode config

📅 `2026-04-29` | ✏️ **zhangmuwuge** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24981](https://github.com/anomalyco/opencode/issues/24981)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

TeamCode currently supports proxy configuration through standard environment variables such as `HTTPS_PROXY`,
  `HTTP_PROXY`, and `NO_PROXY`. This works for simple terminal usage, but it is hard to scope safely when different
  developer tools on the same machine need different proxy routes.

  In my setup, TeamCode needs a dedicated proxy entrypoint, while other tools use another proxy. Using global
  environment variables affects unrelated tools, and using shell wrapper scripts is awkward for Windows, desktop app,
  IDE, and corporate VPN setups.

  I would like TeamCode to support explicit proxy configuration in `teamcode.json` / `teamcode.jsonc`, for example:

  ```jsonc
  {
    "$schema": "https://teamcode.ai/config.json",
    "network": {
      "proxy": {
        "http": "http://127.0.0.1:7890",
        "https": "http://127.0.0.1:7890",
        "all": "socks5://127.0.0.1:7890",
        "noProxy": ["localhost", "127.0.0.1", "::1"]
      }
    }
  }

  Expected behavior:

  - Keep existing environment variable support.
  - Define clear precedence between config-based proxy settings and proxy environment variables.
  - Apply the resolved proxy settings consistently to provider requests, plugin installs, MCP/network requests, and
    other TeamCode-managed HTTP clients.
  - Show resolved proxy set

> *[Truncado — 2049 chars totais]*

---

## #24978 — [FEATURE]: Desktop - Request for an animated Activity icon over the Session "avatar/badge" when a Agent is 'working'

📅 `2026-04-29` | ✏️ **PureKrome** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24978](https://github.com/anomalyco/opencode/issues/24978)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

👋🏻 G'Day. I have a few sessions for a few projects/repo's active at the same time.
Would be lovely to have some animated icon above a corner of the project 'Avatar/Badge' if there's an active agent working.

Once the agent has completed, then a number (1->9+, like Slack badges) would hover over the "Avatar/Badge".

for example:

<img width="123" height="416" alt="Image" src="https://github.com/user-attachments/assets/70711fbe-cd94-4cf9-a592-9d6d0b8f8e42" />

- 1 == 1x finished session which hasn't been viewed yet
- pixelated squares == at least one session is active as the agent is working on something, in this project.

cheers!

---

## #24970 — [FEATURE]: Add BRHP to ecosystem

📅 `2026-04-29` | ✏️ **ZanzyTHEbar** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24970](https://github.com/anomalyco/opencode/issues/24970)


## What do you want?

Add BRHP to the TeamCode ecosystem plugins list.

Repository: https://github.com/ZanzyTHEbar/brhp

BRHP is an early TeamCode plugin for structured, persistent planning. It adds `/brhp` commands, local planning-session persistence, bounded planner history, and a TUI sidebar for active planning state.

## Why?

BRHP gives planning its own inspectable local state instead of keeping plans only as transient chat notes. It is intended for larger or more constrained TeamCode tasks where users need to resume planning, inspect current state, and keep project instructions in the loop.

## Notes

BRHP is not published on npm yet. The README documents local `file://` package loading for both `teamcode.json` and `tui.json` until npm publication.

---

## #24966 — [FEATURE]: Creating files/folder from the UI

📅 `2026-04-29` | ✏️ **dimezio** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24966](https://github.com/anomalyco/opencode/issues/24966)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi, I was wondering if is planned or already present a feature to add files and folders directly from the UI. I’ve attached a screenshot. 

<img width="463" height="461" alt="Image" src="https://github.com/user-attachments/assets/c5d3256e-8829-4f54-b62e-56dafae59f49" />

Thank you!

---

## #24960 — [FEATURE]: Show provider quota beside prompt metrics

📅 `2026-04-29` | ✏️ **50sotero** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24960](https://github.com/anomalyco/opencode/issues/24960)


## Describe the enhancement you want to request

Show provider quota in the TUI prompt metrics row, next to the existing context/cost metrics.

Narrow scope for this issue:
- start with exact Codex quota from the OAuth account
- expose a provider-quota shape that can later hold Copilot/other provider quotas
- keep the UI compact and non-blocking

Related: #19190 asked for broader quota surfaces. This is the smaller prompt-metrics version validated in the standalone plugin.

## Benefits

- Users can see quota before submitting prompts.
- The signal lives where context usage already appears.
- A provider-quota shape leaves room for future providers without hardcoding the prompt row to Codex only.

Prototype screenshots: https://github.com/50sotero/teamcode-usage-quota#screenshots

---

## #24953 — FEATURE: Plugin API - per-agent tool visibility filtering

📅 `2026-04-29` | ✏️ **Qiiks** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24953](https://github.com/anomalyco/opencode/issues/24953)


## Problem

When a plugin registers tools via `Hooks.tool` in the plugin API, all tools are globally visible to every agent in the LLM context. There is no mechanism to scope tool visibility to specific agents.

This creates issues for plugins that want to register domain-specific tools (e.g., security assessment tools, admin tools, privileged operations) that should only be accessible by a designated agent - not by every agent the user switches to.

## Example Use Case

A security plugin registers security scanning tools. These should only be visible to a cybersec agent. When the user switches to sisysphus (general coding), those tools should not appear in the LLM's tool context at all - they should not even be suggested.

## Current Limitations

- AgentConfig.tools only controls execution permission, not LLM context visibility
- tool.execute.before can block execution but the tools are still visible and suggested by the LLM
- System prompt injection discourages use but does not hide the tools
- oh-my-openagent's disabled_tools only filters its own internal tool list, not TeamCode core's plugin tool registry

## Proposed Solution

Option A - New hook: Add a tool.definition hook that receives agent/session context:

```typescript
"tool.definition"?: (input: {
    toolID: string;
    sessionID: string;
    agent: string;
}, output: {
    description: string;
    parameters: any;
    hidden?: boolean;
}) => Promise<void>;
```

This would allow plugins to dynamically hide tools 

> *[Truncado — 2305 chars totais]*

---

## #24950 — [FEATURE]:TeamCode  creates configuration files in every directory where it's launched,can you create a switch to on/off it???

📅 `2026-04-29` | ✏️ **smithyyang** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/24950](https://github.com/anomalyco/opencode/issues/24950)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

ls -a
./   .bash_profile  .claude/    .gitmodules  .mcp.json             teamcode.json  .ripgreprc  .zprofile
../  .bashrc        .gitconfig  .idea        oh-my-openagent.json  .profile       .vscode     .zshrc
just as what you can see, every i launch it ,teamcode will create these files ,this is annoying
And it seems that , there is no a built-in switch to control it

---

## #24948 — [FEATURE]: Auto-describe images via vision fallback when active model lacks vision support

📅 `2026-04-29` | ✏️ **MrRobotoGit** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24948](https://github.com/anomalyco/opencode/issues/24948)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before. (See note below about #22828.)

### Describe the enhancement you want to request

When using a coding-focused LLM that doesn't support image input (e.g. DeepSeek, GLM, Haiku), pasting a screenshot into the chat causes the image to be silently dropped. The model receives an error string instead, with no indication that images aren't supported.

**Proposed solution:** Before calling `streamText`, if the active model can't read images but the message contains image parts, automatically find a vision-capable model from any configured provider, call it with a description prompt, and replace the image parts with the returned text description. The main model then receives the description as plain text — entirely transparent, no model switching required.

A new optional `vision_model` config field lets users pin a specific model (e.g. `openai/gpt-4o`). If not set, the first image-capable model found across all configured providers is used, skipping the current model to handle cases where the active provider has billing or rate-limit issues.

**Implementation:** PR #24382

**Note on #22828:** That issue proposes a similar concept but with a different scope — it focuses on transcription for non-multimodal *providers*, while this proposal handles the case where the *specific active model* lacks vision support, regardless of provider, and includes fallback to a

> *[Truncado — 1677 chars totais]*

---

## #24938 — [FEATURE]: Add CrewBee to ecosystem projects

📅 `2026-04-29` | ✏️ **PerrinYong** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24938](https://github.com/anomalyco/opencode/issues/24938)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add CrewBee to the TeamCode Ecosystem Projects list.

CrewBee is an independent Agent Team framework for TeamCode. It helps users define task/project-specific Agent Teams and project them into TeamCode agents.

This is a docs-only ecosystem entry.

Proposed row:

| [CrewBee](https://github.com/CrewBeeLab/CrewBee) | Agent Team framework for designing task-specific teams and projecting them into TeamCode |

PR: #24939

---

## #24937 — [FEATURE]: Add terminal pet companion with CAVA audio visualizer to TUI sidebar

📅 `2026-04-29` | ✏️ **ZoeImport** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24937](https://github.com/anomalyco/opencode/issues/24937)


### Description

Add an interactive ASCII pet companion to the TeamCode TUI sidebar that brings personality and visual feedback to the terminal experience.

### Proposed Implementation

**Core Features:**
- Autonomous pet movement (walk/run left-right)
- Weather system (sunny/rain/cloudy) affecting pet behavior
- CAVA audio visualizer integration with fallback simulation
- Pet responds to weather: hides/sleeps in rain, plays in sunshine
- Audio level drives pet running speed

**Technical Approach:**
- Pet state machine with 6 states (walk, run, sleep, play, eat, hide)
- Fixed-height layout system (10 lines) to prevent UI jittering
- SolidJS reactive signals for smooth 10 FPS animations
- CAVA spawned as child process, parses ASCII output
- Graceful fallback to simulated spectrum when CAVA unavailable

**Why This Belongs in TeamCode:**
- Adds personality to terminal experience (similar to Claude Code's startup animation)
- Provides ambient visual feedback during long-running tasks
- Audio visualization useful for monitoring system activity
- Enhances TUI without disrupting workflow
- Follows existing plugin architecture pattern

### Verification

- [x] I have checked this feature doesn't already exist
- [x] I have built and tested locally
- [x] This follows TeamCode's plugin architecture

### Additional Context

This is a TUI-only feature using the existing slot extension system. No changes to core business logic or API.

---

## #24936 — [FEATURE]: Add right-click context menu to the web app

📅 `2026-04-29` | ✏️ **HuakunShen** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24936](https://github.com/anomalyco/opencode/issues/24936)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The web interface is pretty much like a lightweight code editor. I wonder if it's possible to add a right-click context menu to provide more options. For example, I may want to right-click and copy a file's relative/absolute path. Currently, the only way to do it is by @ a file in the chat box. But the git ignored folders are not available, so there is no auto complete. I have to type everything out by hand, so it would be helpful if we can get a right-click menu to provide more options just like VS Code.

I can try to file a PR.

---

## #24915 — [FEATURE]: Edit phone number or other settings in teamcode

📅 `2026-04-29` | ✏️ **Souhib** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24915](https://github.com/anomalyco/opencode/issues/24915)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hello guys, I hope you're doing well.
I checked and I don't think someone mentioned this previously in a ticket, at least I hope I did not create a duplicate
I want to know if it's possible to add the fact that we can edit our phone number or any other information of our teamcode account.
Even in the website there is no way of doing that.
I would personally like to be able to edit my phone number but it's not possible.
Thanks a lot.

---

## #24903 — [FEATURE]:app桌面端口增加可手动设置 teamcode serve 启动端口和是否需要密码

📅 `2026-04-29` | ✏️ **xiao-peng-16** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24903](https://github.com/anomalyco/opencode/issues/24903)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

app桌面端口增加可手动设置 teamcode serve 启动的端口和是否需要密码

---

## #24897 — [FEATURE]:建议添加功能（如codex桌面端的功能），代码编写有预览（效果）这种功能，做到实时预览具体效果

📅 `2026-04-29` | ✏️ **LING19996** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24897](https://github.com/anomalyco/opencode/issues/24897)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

建议添加功能（如codex桌面端的功能），代码编写有预览（效果）这种功能，做到实时预览具体效果

---

## #24893 — [FEATURE]:Pluggable Context Management Method

📅 `2026-04-29` | ✏️ **PandaBiang** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24893](https://github.com/anomalyco/opencode/issues/24893)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When using teamcode, the previous model with small context often compresses the context, and sometimes after compression, the AI forgets too much and becomes foolish; Nowadays, using the deepseek-v4-pro model has quite a large context, with 600K contexts used in daily life. It feels like there is a lot of nonsense and wasted tokens in the context. Using default instructions to compress the context is afraid of compressing too much.
At present, context compression has limited options for users. I would like a plugin that allows users to choose which part of the context to compress:
Pluggable context management allows users to use commands to track the usage of the current context and the returned context. LLM needs to classify the context based on its content. Users can choose to uninstall or load relevant contexts. The saved context can be used as persistent memory across conversations.
How feasible is this idea?

---

## #24890 — [FEATURE]: add an open tool for surfacing files and URLs

📅 `2026-04-29` | ✏️ **Marxist-Leninist** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24890](https://github.com/anomalyco/opencode/issues/24890)


﻿### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a built-in `open` tool that lets an agent surface a local file, folder, or http(s) URL to the user through the operating system's default handler.

This is useful when an agent produces a human-facing artifact and needs to show it without inventing platform-specific shell commands. Examples include opening a generated HTML report, revealing a downloaded file in the file manager, or opening a local dev URL after startup.

Suggested behavior:

- support local paths, `file://` URLs, and `http(s)` URLs
- resolve relative local paths from the project directory
- refuse unsupported schemes
- ask for an `open` permission before launching the OS handler
- use platform-native launchers (`rundll32`/Explorer, `open`, `xdg-open`)
- return structured metadata for delivered/not-delivered status

---

## #24888 — [FEATURE]: add a bounded wait tool for asynchronous work

📅 `2026-04-29` | ✏️ **Marxist-Leninist** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24888](https://github.com/anomalyco/opencode/issues/24888)


﻿### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a built-in `wait` tool that lets an agent pause the current turn for a bounded amount of time, optionally returning early when an external condition becomes true.

This helps with workflows where the model needs to continue in the same chat after an asynchronous event, such as a download finishing, a dev server becoming ready, a background process exiting, or a log file showing a completion pattern. Today the agent has to burn shell slots, ask the user to come back, or repeatedly poll through ad hoc commands.

Suggested behavior:

- fixed bounded waits with a visible reason
- cancellable waits that respect the existing abort signal
- optional early-return conditions for file readiness, URL readiness, process exit, and log pattern matching
- progress metadata so the UI can show what the agent is waiting on
- hard caps on wait duration and polling intervals to avoid runaway waits

---

## #24886 — [FEATURE]: add a hash tool for file checksum verification

📅 `2026-04-29` | ✏️ **Marxist-Leninist** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24886](https://github.com/anomalyco/opencode/issues/24886)


﻿### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a built-in `hash` tool that lets an agent compute a digest for a local file and optionally compare it with an expected checksum.

This is useful when an agent downloads or builds large artifacts and needs to verify file integrity before using them. Shell commands can do this, but a structured tool gives the model consistent metadata (`digest`, `size_bytes`, `matches`) and avoids loading large files into memory.

Suggested behavior:

- stream the target file from disk
- default to `sha256`
- support common published checksum algorithms such as `sha512`, `sha1`, and `md5`
- optionally accept an expected digest and report match/mismatch in structured metadata
- respect the existing read/external-directory permission path

---

## #24880 — [FEATURE]: Add version number to the filename of release artifacts

📅 `2026-04-29` | ✏️ **coloraven** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24880](https://github.com/anomalyco/opencode/issues/24880)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I need to update TeamCode via manual downloads. 

Since TeamCode receives frequent version updates, it is easy to confuse different installation packages after downloading.

Therefore, I suggest adding the version number to the filename of build artifacts.

Example:
```
teamcode-v1_14_29-linux-x64-baseline-musl.tar.gz
```

---

## #24879 — [FEATURE]:Go Pro tier ($20) and Share modifier with first-month discounts

📅 `2026-04-29` | ✏️ **maebahesioru** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/24879](https://github.com/anomalyco/opencode/issues/24879)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Problem
I sometimes hit Go's monthly cap and the only fallback is Zen 
pay-as-you-go, which is hard to budget. Separately, for personal 
projects I'd be willing to share training data in exchange for 
a lower price.

### Proposal
Add a Pro tier (higher quota) and an "Open" variant for each 
paid plan (data-sharing discount). Variant is chosen at purchase 
time, switched via plan change.

|         | Standard      | Open (data opt-in) |
|---------|---------------|--------------------|
| Go      | $5 → $10/mo   | $3 → $6/mo         |
| Pro     | $10 → $20/mo  | $7 → $14/mo        |

- All plans: 50% off first month
- Pro quota: ~2x Go (~$120/mo equivalent, $24 per 5h window)
- $20 ceiling on Pro keeps it within the Cursor Pro / Claude Pro range

### Why "Open" as a variant, not a separate plan
Naming it `Go Open` / `Pro Open` keeps the lineup compact 
(Free / Go / Pro / Zen, each with optional Open variant) and 
matches TeamCode's "Open" branding. Users pick at signup; 
switching uses the standard plan-change flow so pricing stays 
deterministic.

### Safeguards for Open variants
- Auto-redaction of secrets and API keys before transmission
- Limited to providers with explicit training-data agreements
- Persistent UI labeling on every Open-variant session
- No per-project opt-out — use Standard for

> *[Truncado — 1515 chars totais]*

---

## #24878 — [FEATURE]: Add teamcode-quota to ecosystem plugins

📅 `2026-04-29` | ✏️ **slkiser** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24878](https://github.com/anomalyco/opencode/issues/24878)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Describe the enhancement

Add `teamcode-quota` to the `Plugins` table on the ecosystem docs page.

`teamcode-quota` provides provider quota toasts and local token usage reports without making LLM/model API calls. Listing it in the ecosystem docs would make it easier for users to discover a plugin focused on quota visibility and local usage reporting. Works via **toasts**, **TUI sidebar**, and slash commands.

### Proposed docs change

Add this plugin entry to `packages/web/src/content/docs/ecosystem.mdx`:

- Plugin: `teamcode-quota`
- URL: https://github.com/slkiser/teamcode-quota
- Description: Provider quota toasts and local token usage reports with zero LLM/model API calls

### Related PR

Implemented in #21905.

<img width="680" height="628" alt="Image" src="https://github.com/user-attachments/assets/8b751973-9208-44c1-a8a4-b425d4c631eb" />

---

## #24874 — [FEATURE]: Support Bearer token authentication for teamcode serve

📅 `2026-04-29` | ✏️ **Edison-A-N** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24874](https://github.com/anomalyco/opencode/issues/24874)


## Problem

Currently `teamcode serve` only supports HTTP Basic Auth via `OPENCODE_SERVER_PASSWORD`. This creates friction in common deployment scenarios:

1. **Reverse proxy / API gateway integration** — Most ingress controllers (nginx, Caddy, Traefik, Cloudflare Tunnel) and API gateways use Bearer tokens for upstream authentication. Operators must add a translation layer to convert Bearer → Basic.

2. **Programmatic access** — External tools (CI pipelines, scripts, desktop apps) typically pass `Authorization: Bearer <token>` rather than encoding `username:password` in base64. The current Basic Auth requirement forces each client to know the username convention ("teamcode").

3. **Credential leakage surface** — Basic Auth embeds the password in every request header as reversible base64, whereas a Bearer token is opaque and easier to rotate/revoke without changing the underlying secret.

Related issues that reflect current auth pain points:
- #18611 — `teamcode attach` hardcodes username "teamcode", ignoring `OPENCODE_SERVER_USERNAME`
- #12805 — Health check endpoint is password-protected (no way to exempt it without disabling all auth)
- #18325 — Web client Basic Auth bugs

## Current Implementation

From [`packages/teamcode/src/server/middleware.ts`](https://github.com/anomalyco/opencode/blob/9fbeafb/packages/teamcode/src/server/middleware.ts#L38-L51):

```typescript
export const AuthMiddleware: MiddlewareHandler = (c, next) => {
  if (c.req.method === "OPTIONS") return nex

> *[Truncado — 4323 chars totais]*

---

## #24854 — [FEATURE]:Better Research

📅 `2026-04-28` | ✏️ **pepikir** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24854](https://github.com/anomalyco/opencode/issues/24854)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be very nice to have this model have way better researching capabilities for the open source models that are running locally.Currently, it is not using any researching at all.

---

## #24824 — feat: add skills.format config option to control skill serialization format

📅 `2026-04-28` | ✏️ **andrewgwoodruff** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24824](https://github.com/anomalyco/opencode/issues/24824)


## Problem

When TeamCode loads skills from a project with many Claude Code skills, the system prompt can reach 40KB+, with the skills listing serialized as XML tags (`<available_skills>`, `<skill>`, `<description>`, etc.). For some local Ollama models this XML structure causes them to switch into XML output mode — specifically, models like qwen3-coder and devstral revert to HERMES XML tool-call format instead of JSON, which TeamCode can't parse. Tool invocations then fail silently or log `invalid Invalid Tool`.

There's currently no way to change this serialization format without patching TeamCode directly.

## Proposed solution

Add a `skills.format` config option (`"xml"` | `"json"` | `"markdown"`) that lets users control how skills are serialized into the system prompt. The default stays `"xml"` — no behavior changes for existing users. Users who hit format-related tool-calling issues with local models can opt into `"json"` or `"markdown"` as a workaround.

```json
{
  "skills": {
    "format": "json"
  }
}
```

## Evidence

Tested with devstral:24b via Ollama, 50 runs each, same system prompt and tool definitions — only the skills serialization format varied:

| Format | Pass rate |
|--------|-----------|
| XML (current default) | 68% (34/50) |
| Markdown | 74% (37/50) |
| JSON | 86% (43/50) |

## Related
- #24316: similar HERMES XML symptom with Qwen 3.6 35b-a3b
- #24239: agent `prompt` field / system message handling with local models

---

## #24822 — [FEATURE]: Set Tmux Window Name When Running Inside TMUX

📅 `2026-04-28` | ✏️ **bupd** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24822](https://github.com/anomalyco/opencode/issues/24822)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, when oc runs inside tmux its being shown as bash, but the tmux window name should be either `OC` or `teamcode` 

So, what we need is that the teamcode must emit the window-name escape so the tmux status bar shows `teamcode` instead of `bash`

env: tmux 3.6a, teamcode: dev

## Screenshot

<img width="369" height="101" alt="Image" src="https://github.com/user-attachments/assets/6d6945e2-5300-4eb4-92ce-824546e632c0" />

---

## #24807 — [FEATURE TUI]: Terminal-native progress indicator

📅 `2026-04-28` | ✏️ **tnglemongrass** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24807](https://github.com/anomalyco/opencode/issues/24807)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

ConEmu as well as Windows Terminal support indicating "progress" by temporarily switching to a spinner icon in the terminal tab and the TaskBar. Github Copilot CLI makes use of it.

Here is described how to set/unset it, and also an animation showing how it looks like:

https://learn.microsoft.com/en-us/windows/terminal/tutorials/progress-bar-sequences

Idea:
- activate spinner, when requests to the backend start
- deactivate spinner, when the (streaming-) request finished

Basically, spinning == the LLM is working, not spinning == waiting for user-input.
The question tool should NOT show up as spinning!

Especially in multi-tab workflows, it would be much easier to spot when a terminal tab "finished" and waits for user input.

---

## #24797 — [FEATURE]: support named agent colors for CC compatibility (red, blue...)

📅 `2026-04-28` | ✏️ **sentisso** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24797](https://github.com/anomalyco/opencode/issues/24797)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The color option for Claude Code subagents supports only named colors like: red, blue, green, yellow, purple, orange, pink, or cyan (see [Claude Code docs](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields)).

This causes incompatiblity between Claude Code subagents and TeamCode subagents, for example this agent:
```
---
name: judge
description: Use this agent when evaluating implementation artifacts against an evaluation specification produced by the meta judge. Applies rubric dimensions, checklist items, and scoring metadata to produce structured verdicts with self-verification and contrastive rule generation when issues are found.
model: opus
color: red
---
```

causes teamcode not to start:
```
$ teamcode
Configuration is invalid at ~/.teamcode/agents/judge.md
↳ Invalid string: must match pattern /^#[0-9a-fA-F]{6}$/ color
```

TeamCode should also support this color config.

---

## #24796 — [FEATURE]: WSL: TeamCode CLI cannot access Zed DB path from WSL environment

📅 `2026-04-28` | ✏️ **Rostov4an1n** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24796](https://github.com/anomalyco/opencode/issues/24796)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi! I ran into an issue with TeamCode CLI when using Zed on Windows with a WSL Remote project.

**Environment:**
* OS: Windows 11
* Editor: Zed, project opened through WSL Remote
* Project path inside WSL: `/home/mmaks/Dev/kanban-flow`
* TeamCode: `1.14.28`
* Terminal: WSL Ubuntu
* Goal: use TeamCode CLI, not ACP / Zed Agent Panel

---

## Problem: Zed DB path resolution fails in WSL

When TeamCode runs inside WSL, `resolveZedDbPath()` only checks Linux/macOS-style paths and does not automatically find the Windows Zed DB under `%LOCALAPPDATA%\Zed\db\0-stable\db.sqlite`. Setting `OPENCODE_ZED_DB` manually works in principle, but reading the live SQLite/WAL DB directly through `/mnt/c/...` can produce SQLite `disk I/O error (10)`. Copying `db.sqlite`, `db.sqlite-wal`, and `db.sqlite-shm` into the WSL filesystem and pointing `OPENCODE_ZED_DB` to that local snapshot works.

Currently, a workaround is to mirror the Zed database in WSL before running TeamCode.

It would be great if TeamCode could use a more robust editor bridge for Zed Remote/WSL instead of relying solely on the active editor line in the SQLite database.

There is also a solution using a wrapper that mirrors the database so that TeamCode can read it in WSL (workaround).

Add to source

```sql
export PATH="$HOME/.local/bin:$PATH"
```

Wrap

> *[Truncado — 3340 chars totais]*

---

## #24795 — [FEATURE]: Allow editing the "always" permission pattern before confirming

📅 `2026-04-28` | ✏️ **jamescw19** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24795](https://github.com/anomalyco/opencode/issues/24795)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When a permission prompt appears and I choose "always", the pattern used is auto-generated by the tool. Sometimes that pattern is too broad or too narrow for what I actually want.

For example, in the screenshot below I wanted to run `psql` commands, but these were being swallowed by `rtk *` commands. I use [`rtk` as a plugin](https://github.com/rtk-ai/rtk), but I don't want to enable all commands.

<img width="571" height="182" alt="Image" src="https://github.com/user-attachments/assets/599dea2c-0dd6-41be-a46b-9f3f463a8d66" />

It would be useful to be able to edit the pattern in the prompt before confirming, so I can tune it without having to manually open `teamcode.json` after the fact. In this case I wanted to be able to allow `rtk psql *` commands only for the duration of the session.

---

## #24794 — [FEATURE]:Sign in with email

📅 `2026-04-28` | ✏️ **MarcCoquand** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24794](https://github.com/anomalyco/opencode/issues/24794)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi, I don't have a Google account, and don't want to give Opencode access to act on my behalf.

Ideally I'd like to be able to just sign up with email. Any chance we could add support for this?

---

## #24785 — [FEATURE]: use a per-project sqlite and sqlite snapshots

📅 `2026-04-28` | ✏️ **typoworx-de** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24785](https://github.com/anomalyco/opencode/issues/24785)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

# Problem
Single global `teamcode.db` causes:
- large DB size
- WAL issues
- UI slowdowns/freezes
- no isolation between projects

# Proposal
- Use per-project SQLite DB:
  `~/.local/share/teamcode/projects/<project>/teamcode.db`

  maybe optionally make option to sync/mirror with project-dir .teamcode dir

- Add snapshot support:
  - create/restore DB snapshots (timestamp-based)

- Add vacuum/cleanup:
  - built-in `VACUUM`
  - optional auto-cleanup (WAL, size limits)

# Benefit
- smaller DBs
- better performance
- easier recovery
- proper project isolation

---

## #24763 — [FEATURE]: Support for custom SSE queue status rendering (e.g., from vLLM/Ollama gateways)

📅 `2026-04-28` | ✏️ **d4n-sec** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24763](https://github.com/anomalyco/opencode/issues/24763)


### Feature hasn't been suggested before.

- [X] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

- [X] I have searched existing issues and could not find the same request.
- [X] This is a feature request, not a bug report.
- [X] I am opening this issue first for design discussion before any PR.

#### Problem Context

Currently, many enterprise teams and open-source users run TeamCode against self-hosted models (e.g., via vLLM, Ollama, or custom API gateways) rather than public cloud providers. 

During peak usage, these self-hosted endpoints often experience high concurrency. When rate limits are hit or the queue is full, the backend typically responds with an HTTP `429 Too Many Requests`. TeamCode currently handles this via silent retries (Retry-Backoff) or simply hangs with a generic busy spinner. From the user's perspective, the TUI appears "stuck" or "unresponsive," leading to a poor developer experience.

#### Proposed Solution

I propose adding a standard extension to the Server-Sent Events (SSE) parsing layer and the TUI to support **Queue Status Rendering**.

Similar to how tools like Trae handle server congestion by displaying *"Server busy, you are number X in the queue"*, TeamCode could parse specific SSE events emitted by intermediate gateways and display them dynamically in the TUI.

**The Workflow:**
1. When a user prompt is sent, instead of immediately returning a `429`, the cust

> *[Truncado — 3378 chars totais]*

---

## #24756 — [FEATURE]: Sub-agent abort recovery — show task_id and allow retry

📅 `2026-04-28` | ✏️ **Ithril-Laydec** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24756](https://github.com/anomalyco/opencode/issues/24756)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Problem
When a sub-agent is aborted (connection drop, crash, Ctrl+C, or system shutdown), the TUI shows "Tool execution aborted" with no actionable information. The user has no way to:
1. Identify which child session was running (no task_id / session ID visible)
2. Resume the aborted sub-agent (no retry action available)
The child session still exists in the database with its full message history, and the Task tool already supports resumption via task_id — but the UX provides no path to use it.
This is especially painful for long-running sub-agents (complex implementations, multi-file refactors) where losing 5-10 minutes of work to a transient connection issue is a real problem.
Current behavior
┃ General Task — Implement authentication module
┃ Tool execution aborted
No session ID. No retry option. The user must start over or manually dig through session data.
Proposed solution
1. Display task_id on aborted Task tool parts (quick win, ~5 lines)
The data is already available — metadata.sessionId is preserved by the abort handler in processor.ts (it spreads existing metadata and adds interrupted: true). The Task component in session/index.tsx just doesn't render it in the error state.
┃ General Task — Implement authentication module
┃ └ task_id: ses_0191a3b4c5d6AbCdEfGhIj
┃ Tool execution aborted
Thi

> *[Truncado — 2902 chars totais]*

---

## #24715 — [FEATURE]:Add cors option to SDK ServerOptions

📅 `2026-04-28` | ✏️ **rodrigodmpa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24715](https://github.com/anomalyco/opencode/issues/24715)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

⏺ ## Feature Request: Add `cors` option to SDK `ServerOptions`

  ### Problem

  The `teamcode serve` CLI supports configuring allowed CORS origins via the `--cors` flag:

```bash
  teamcode serve --cors http://localhost:5173 --cors https://app.example.com
```
  However, the SDK's createOpencodeServer function does not expose this option, making it impossible to configure CORS when spawning the server programmatically.
  This blocks browser-based clients from using the SDK to start a local server and connect to it from a different origin.

  ### Proposed Solution

  Add a cors field to ServerOptions that accepts a single origin or an array of origins, and forward them as --cors flags when spawning the process:
```javascript
  createOpencodeServer({
    cors: ["http://localhost:5173", "https://app.example.com"],
  })
```
  ### Why This Matters

Projects that embed teamcode as a server inside a web or desktop app need to control CORS policy at startup. Without this option, users are forced to either launch
   the server manually via CLI or patch the process args themselves — both workarounds that defeat the purpose of the SDK.

  Proposed API
```typescript
  type ServerOptions = {
    hostname?: string
    port?: number
    cors?: string | string[]   // ← new
    signal?: AbortSignal
    timeout?: num

> *[Truncado — 1531 chars totais]*

---

## #24684 — [FEATURE]: Fix or add new button for response copying to include search content/all text.

📅 `2026-04-27` | ✏️ **Nuclear-Trichome** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24684](https://github.com/anomalyco/opencode/issues/24684)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, the copy button for finished prompts does not include any of the Explored content or all of the copyable text, only the segment separated by Explored content after the last selectable text segment. Please make the Explored content selectable inline with the response or included in the copy button content, as it is frustrating to be limited in context sharing by having to manually copy each response section and screenshot the Explored content.

---

## #24675 — [FEATURE]: maybe should tell agent, do not use task or subagent to call `plan_exit`

📅 `2026-04-27` | ✏️ **bluelovers** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24675](https://github.com/anomalyco/opencode/issues/24675)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

maybe should tell agent, do not use task or subagent to call `plan_exit` 

i see many time, agent try call `plan_exit` on sub agent lol

---

## #24654 — [FEATURE]: Plugin extension point for custom edit-permission actions

📅 `2026-04-27` | ✏️ **NPPprojects** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24654](https://github.com/anomalyco/opencode/issues/24654)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Looking through the TUI-related issues, many seem to focus on plugins adding reporting or display features. This request is a little different: I’d like a plugin/core extension point that lets plugins add custom actions to edit permission prompts, including an action that resolves the edit as “handled externally”.
Currently the edit approval UI is effectively limited to:
once | always | reject
For normal edit approval that makes sense, but it prevents a plugin from implementing a manual-apply workflow. A plugin action system could allow something like:
once | always | reject | user-defined action
The important semantic is that a user-defined action should be able to resolve an edit permission as externally handled. This must be distinct from once, because once means “approve and execute the built-in edit”, while externally handled means “the user/plugin handled this edit elsewhere; do not run the built-in edit/write/apply_patch operation, but return success so the model can continue the same turn.”
My use case is a Neovim manual-apply plugin. When the AI proposes an edit, the plugin would pass the generated diff to Neovim. Neovim opens the real target file and displays the proposed additions as ghost text, similar in spirit to Monkeytype. The user manually types/applies the change, then exits Neovim

> *[Truncado — 3174 chars totais]*

---

## #24636 — [FEATURE]:Crof AI provider support

📅 `2026-04-27` | ✏️ **Yxmura** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24636](https://github.com/anomalyco/opencode/issues/24636)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add support for https://crof.ai provider compatible with OpenAI sdk

---

## #24617 — [FEATURE]: Change the Markdown formatting for panels.

📅 `2026-04-27` | ✏️ **nmzpy** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24617](https://github.com/anomalyco/opencode/issues/24617)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

<img width="1413" height="526" alt="Image" src="https://github.com/user-attachments/assets/16684132-a359-4f52-9ff6-4eca5311270c" />

I know it's subjective, but,

it didn't use to be like this. Now it just wraps so awkwardly (see "Ver \n dic \n t ; Def \n er)

Do you guys like this? Is this enough to start a riot ? 

Monitor: 27" 4K, Windows 11

It's the same no matter how much I drag to resize edges.

---

## #24616 — [FEATURE]: Official Dev Container Feature

📅 `2026-04-27` | ✏️ **allohamora** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24616](https://github.com/anomalyco/opencode/issues/24616)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please provide an official Dev Container Feature so it can be installed directly from `devcontainer.json`.

I know there is already an unofficial feature at [zendril/devcontainer-feature-teamcode](https://github.com/zendril/devcontainer-feature-teamcode), but relying on an unofficial package is risky. It may stop being maintained, fall behind releases, or become compromised, which would leave users stuck. An official feature maintained by anomalyco would be more stable and trustworthy.

This is already a common pattern. Anthropic ships an official Claude Code feature at [anthropics/devcontainer-features](https://github.com/anthropics/devcontainer-features), and GitHub ships an official Copilot CLI feature at [devcontainers/features](https://github.com/devcontainers/features)

Example:
```json5
// .devcontainer/devcontainer.json
{
  "features": {
    "ghcr.io/anomalyco/features/teamcode:1": {}
  }
}
```

---

## #24610 — [FEATURE]:Deepseek-V4 need a "disable thinking" button

📅 `2026-04-27` | ✏️ **Dawn-Xu-helloworld** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24610](https://github.com/anomalyco/opencode/issues/24610)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

https://api-docs.deepseek.com/guides/thinking_mode
in the docs it said
"(1) The thinking toggle defaults to enabled"
maybe we should set varint `default` 's thinking type into
{"thinking": {"type": "disabled"}}

---

## #24607 — [FEATURE]:The documentation lacks the description of the command `/review`

📅 `2026-04-27` | ✏️ **Small-tailqwq** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24607](https://github.com/anomalyco/opencode/issues/24607)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I frequently use the `/review` command to review code written by teamcode, but I've been thinking recently about why its reviews often miss issues that copilot can find. So I planned to read the official documentation, but I found that there is no introduction to the review command in the official docs. I searched GitHub and found that it is indeed a preset. Later, I successfully replaced it using the custom command introduced in the official documentation.
To achieve a similar effect to the official one, you need to add this header:
```
--- 
description: Rigorous code review — catches logic bugs, design flaws, and regressions
agent: build
subtask: true
---
```
> The agent's default official review is build. If you're not comfortable, you can change it to plan

I initiated this issue to help people who have similar problems as me. Additionally, I think review should be added to the official documentation, just like init.

https://teamcode.ai/docs/tui#commands

<img width="1597" height="1254" alt="Image" src="https://github.com/user-attachments/assets/9d00f49e-c34f-40f4-b62c-b6643cd7c411" />

---

## #24587 — [FEATURE]: support `$skill-name` syntax for invoking specific skills inline

📅 `2026-04-27` | ✏️ **StevanusPangau** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24587](https://github.com/anomalyco/opencode/issues/24587)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be useful to have a shorthand syntax like `$skill-name` to explicitly tell the agent to use a specific skill during a conversation — similar to how Codex handles skill invocation.

**Current behavior:**
Skills are only auto-detected based on task context, or invoked via slash commands like `/skill-name`. There's no way to inline-reference a specific skill mid-prompt.

**Proposed behavior:**
Allow `$skill-name` (e.g. `$git-commit`, `$mermaid-diagrams`) anywhere in a prompt to explicitly load and apply that skill for the current task.

**Use case:**
When the auto-detection doesn't pick up the right skill, or when the user knows exactly which skill they want applied — a quick inline reference saves time vs. restructuring the prompt.

---

## #24579 — [FEATURE]: Sticky editable session title row at top of TUI (click to rename or /rename)

📅 `2026-04-27` | ✏️ **sheecegardezi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24579](https://github.com/anomalyco/opencode/issues/24579)


### Feature hasn't been suggested before.

- [x] Verified.

### Request

Sticky, colored row at the top of the TUI showing the session title; click (or hotkey) to edit inline.

```
┌──────────────────────────────────────────────┐
│  ●  Fix stuck webhooks              ✎ edit  │  ← sticky, click-to-edit
├──────────────────────────────────────────────┤
│ chat scrolls below…                          │
```

Editing:

```
│  ●  [Fix stuck webhooks______]  Enter✓ Esc✗ │
```

### Why

- `/rename` (#19412) exists but breaks flow mid-prompt.
- Closed #4130 calls the current top bar wasteful with an unrelated H1 — this gives that space a purpose.
- #15344 (footer) and #19968 (terminal title) circle the same need; top header is most discoverable.

### Behavior

- **Position:** topmost row(s), sticky.
- **Color:** theme accent.
- **Interact:** click or `Ctrl+T` → inline edit; `Enter` save, `Esc` cancel.
- **Multi-line:** 1–2 rows (config) — see #22480.
- **Persistence:** same field as `/rename`.
- **Toggle:** `tui.sessionHeader.enabled` (default on).

### Alternatives

- `/rename` (#19412) — modal, requires command recall.
- Sidebar rename (#13242, closed) — hidden when sidebar collapsed.
- Footer (#15344) — competes with prompt.
- Terminal title (#19968) — outside TUI, clipped.

### Out of scope

- Tabs (#12548), auto-refresh titles (#17631) — orthogonal, compose later.

---

## #24560 — [FEATURE]: SQLite Symbol Index for AST-based structural queries

📅 `2026-04-27` | ✏️ **r3vs** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/24560](https://github.com/anomalyco/opencode/issues/24560)


## Summary

Replace the infeasible AST-tree cache (#24517) with a **persistent SQLite Symbol Index** that extracts structural metadata from parsed files. This provides fast, reusable symbol lookups without requiring WASM tree serialization.

## Motivation

- `ast_query`/`ast_edit` re-parse files on every call (~20-40ms per 1000-line TS file). While acceptable for one-off calls, repeated structural questions ("where is `validateToken` defined?", "list all classes in this file") waste work.
- A content-addressed symbol index survives process restarts and is usable by multiple tools (context builder, AST tools, navigation).
- Dirac achieves efficiency via skeleton extraction, not raw AST caching. We should do the same.

## Proposed Schema

```sql
CREATE TABLE symbol_index (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  content_hash TEXT NOT NULL,  -- sha256 of file content at parse time
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('function','class','interface','method','property','variable','import','export')),
  start_line INTEGER NOT NULL,
  end_line INTEGER NOT NULL,
  start_col INTEGER NOT NULL,
  end_col INTEGER NOT NULL,
  signature TEXT,              -- e.g. "function foo(a: string): number"
  language TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_symbol_path ON symbol_index(file_path);
CREATE INDEX idx_symbol_hash ON symbol_index(content_hash);
CREATE INDEX idx_symbol_name ON symbol_index(nam

> *[Truncado — 3106 chars totais]*

---

## #24521 — [FEATURE]: Add Ubuntu-based Docker image variant

📅 `2026-04-26` | ✏️ **randommm** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24521](https://github.com/anomalyco/opencode/issues/24521)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add an Ubuntu-based image variant published with the :ubuntu tag. The current Alpine-based image uses musl, which can cause compatibility issues with software that expects glibc; for example, I ran into problems running PyTorch ROCm inside the container. Providing an Ubuntu-based option would preserve the existing lightweight Alpine image while giving users a more compatible alternative for GPU/ML tooling and other applications that rely on glibc-based binaries.

---

## #24511 — [FEATURE]: hash-anchored edits — surgical file patching without full-file context

📅 `2026-04-26` | ✏️ **r3vs** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24511](https://github.com/anomalyco/opencode/issues/24511)


## Problem

The current `edit_file` tool sends the **entire file** to the model every time an edit is needed. On large files (1000+ lines), this has two costs:

1. **Token cost** — the model receives and processes content it doesn't need
2. **Precision cost** — with a large context window, the model can introduce unintended changes far from the intended edit location

This is especially painful in agentic workflows with many sequential edits across multiple files, where context windows fill up fast.

## Prior Art: Dirac's Hash-Anchored Parallel Edits

[Dirac](https://github.com/dirac-run/dirac) (a coding agent fork of Cline) independently developed this technique and reports **−64.8% API cost** vs. the average of top-6 OSS coding agents. The core idea: identify edit targets by a hash of their surrounding lines rather than file position or line number, then send only the relevant code chunk to the model.

## Proposed Solution

A new `patch_file` tool (or an enhancement of `edit_file`) that uses **hash-anchored targeting**:

### How it works

1. **Anchor computation** — when the agent wants to edit a code section, it first computes `anchor = sha256(lines[target_start-N .. target_end+N])` (N = configurable context radius, default 5)
2. **Minimal context** — only the anchored chunk (not the full file) is sent to the model for rewrite
3. **Anchor validation** — before writing, re-hash the same lines in the current file state. If `hash != anchor`, abort and re-anchor (handles concu

> *[Truncado — 3536 chars totais]*

---

## #24466 — [FEATURE]: Help openclaw to get all your model by solving issue to use your model on openclaw

📅 `2026-04-26` | ✏️ **alexandre-leng** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24466](https://github.com/anomalyco/opencode/issues/24466)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi,

It would be valuable for Anomaly, in the development of Opencode, to support OpenClaw in resolving the issues that currently prevent full access to your models. Enabling smoother integration and broader compatibility would not only improve usability for developers but also strengthen the overall ecosystem around these tools.

Maybe you can do some Pull Request to openclaw project helping your user using your model on openclaw

Alexander

---

## #24464 — [FEATURE]: Add teamcode-byterover to ecosystem docs

📅 `2026-04-26` | ✏️ **ian-pascoe** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24464](https://github.com/anomalyco/opencode/issues/24464)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add `teamcode-byterover` to the ecosystem docs at https://teamcode.ai/docs/ecosystem/.

`teamcode-byterover` is an TeamCode plugin that connects sessions to ByteRover memory through `@byterover/brv-bridge`, persisting useful session context when sessions become idle or compact and recalling relevant context during system prompt transformation.

Repository: https://github.com/ian-pascoe/teamcode-byterover

---

## #24457 — [FEATURE]: Add teamcode-adaptive-thinking to ecosystem docs

📅 `2026-04-26` | ✏️ **ian-pascoe** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24457](https://github.com/anomalyco/opencode/issues/24457)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add [teamcode-adaptive-thinking](https://github.com/ian-pascoe/teamcode-adaptive-thinking) to the Ecosystem docs under Plugins.

It is an TeamCode plugin that lets agents actively adjust model reasoning effort during a session, with configurable system guidance and a tool for switching between valid reasoning-effort variants.

---

## #24451 — [FEATURE]: Pinned session tabs in the TUI sidebar

📅 `2026-04-26` | ✏️ **MrRobotoGit** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/24451](https://github.com/anomalyco/opencode/issues/24451)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Note on possible duplicates

The compliance bot flagged #24400 as a possible duplicate. They both touch the right sidebar but propose different things:

- **#24400** asks for *Recent Projects* and *Installed Plugins* collapsible sections (project switching + plugin management).
- **This issue** asks for a *live, persistent SESSIONS panel* — pinned + ephemeral entries with per-row spinner/idle indicators driven by `session.status` SSE events. The goal is parallel-session orchestration, not project/plugin management.

The two are complementary; neither subsumes the other.

### Problem

Working on multiple sessions in parallel today means juggling several terminal windows running separate `teamcode` instances. The TUI is single-session: switching between sessions only happens via the `DialogSessionList` modal (`<leader>l`), which closes after each pick and gives no visibility on what other sessions are doing in the background.

I keep one session per task/issue and constantly want to (a) glance at whether another session is still working and (b) jump back to it without re-searching the list.

### Proposed enhancement

Add a small "SESSIONS" panel at the top of the existing right sidebar. It would show:

- **Pinned sessions** — a stable, persistent list curated by the user (`<leader>p` to pin/unpin).
- **Ephemeral entries** — sessions visited in th

> *[Truncado — 3765 chars totais]*

---

## #24433 — [FEATURE]: Show per-message input/output token counts in TUI

📅 `2026-04-26` | ✏️ **kunalkohli** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24433](https://github.com/anomalyco/opencode/issues/24433)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Problem

After each assistant response, the `▣` metadata line shows mode, model, and duration — but not token usage. Users have no per-message visibility into how many input/output tokens each response consumed. The session-level aggregate in the prompt bar and sidebar is useful, but doesn't show the breakdown per turn.

### Proposed Solution

Add per-message input and output token counts to two places:

**1. The `▣` metadata footer line under each assistant response**

Current:
```
▣ Code · claude-opus-4 · 12.3s
```

Proposed:
```
▣ Code · claude-opus-4 · 12.3s · 12.3K↓ 1.2K↑
```

Where `↓` = input tokens sent to the model, `↑` = output tokens generated.

**2. The sidebar context panel**

Add an "Input / Output" line showing the last message's token breakdown alongside the existing total tokens and cost display.

### Implementation

The data already exists on every `AssistantMessage` via `message.tokens.input`, `message.tokens.output`, etc. This is a UI-only change to expose it:

- `routes/session/index.tsx` — add token spans to the `▣` footer
- `feature-plugins/sidebar/context.tsx` — add input/output breakdown line

### Related Issues

- #13003 — Display token usage in TUI (session-level; this issue is per-message)
- #17449 — Real-time token display in footer
- #21913 — Token accumulation bug 

> *[Truncado — 1642 chars totais]*

---

## #24426 — [FEATURE]: Laxtex rendering in `teamcode web` ui

📅 `2026-04-26` | ✏️ **mbrotos** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24426](https://github.com/anomalyco/opencode/issues/24426)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Use a browser latex rendering package to inject standard latex math blocks.

---

## #24415 — [FEATURE]: Support for event type: discussion

📅 `2026-04-26` | ✏️ **cogni-ai-ee** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24415](https://github.com/anomalyco/opencode/issues/24415)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

> Error: Unsupported event type: discussion

I'd like to use agent to be triggered in discussion posts and comments.

---

## #24404 — [FEATURE]: Add unified task state color convention with icons for visual notifications

📅 `2026-04-25` | ✏️ **herjarsa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24404](https://github.com/anomalyco/opencode/issues/24404)


## Problem

TeamCode currently lacks a unified color convention for task states. Users working with multiple projects simultaneously cannot identify at a glance:

1. **Which project is currently executing** (no visual indicator)
2. **What state a task is in** (no clear color convention)
3. **When a task completes** (notification doesn't identify the project)
4. **When attention is required** (error states blend with normal text)

## Proposed Solution

Implement a **unified status color convention** based on ISO 3864 safety colors and WCAG accessibility standards:

### Color + Icon Convention

| State | Color | Hex | Icon | Description |
|-------|-------|-----|------|-------------|
| `running` | Blue | `#3B82F6` | spinner | Task is executing |
| `waiting` | Yellow | `#F59E0B` | clock | Waiting for subagent response |
| `attention` | Orange | `#D4652F` | alert | Requires user attention |
| `error` | Red | `#EF4444` | x-circle | Error occurred |
| `done` | Green | `#22C55E` | checkmark | Task completed successfully |
| `idle` | Gray | `#6B7280` | circle | No activity |

### Accessibility (WCAG 1.4.1)

Each state **always includes**:
- Color (for those who can perceive it)
- Icon (for color-blind users)
- Text label (for screen readers)

### Multi-Project Notifications

When multiple projects are open, notifications must include the project name to distinguish which project triggered the notification.

## Related Issues

This feature addresses:
- #20921 - Visual TUI background co

> *[Truncado — 1836 chars totais]*

---

## #24400 — [FEATURE]:  expansion of the side panel

📅 `2026-04-25` | ✏️ **szogun1910** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24400](https://github.com/anomalyco/opencode/issues/24400)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

Currently the sidebar displays:
- Context / token usage
- Magic Context breakdown
- Historian / Memory
- MCP servers

Two important sections are missing that would greatly improve navigation and project management.

## Proposed Solution

### 1. 📁 Recent Projects in Sidebar

The recent projects list is currently only accessible via a popup/modal at startup. It should be permanently visible in the sidebar as a collapsible section — similar to how MCP servers are displayed — allowing users to quickly switch between projects without leaving the current session.

Related to #18154 (new projects added to bottom instead of top).

### 2. 🧩 Installed Plugins in Sidebar

There is no dedicated section showing installed TeamCode plugins. A sidebar section should display:
- Plugin name and version
- Status (enabled / disabled / error)
- Quick access to enable/disable

This would be consistent with how tools like VS Code handle extensions in their activity panel.

## Expected Sidebar Structure

```
▼ Recent Projects
  • /opt/xxx/xxx/xxx
  • /home/xxx/...
  • ...

▼ Plugins
  • auto-skill-loader  v1.x  [enabled]
  • some-plugin        v1.x  [disabled]
  • broken-plugin      v1.x  [error]

▼ MCP
  • filesystem  Connected
  • mysql       Connected
  • ...
```

## Environment
- TeamCode v0.15.3
- OS: Zori

> *[Truncado — 2124 chars totais]*

---

## #24370 — [FEATURE]: Opt-out for "NEVER commit changes unless the user explicitly asks you to."

📅 `2026-04-25` | ✏️ **thameraltoimi** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/24370](https://github.com/anomalyco/opencode/issues/24370)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

i like letting smart models like gpt manage my commits. i have a section on continuous commits in my global `AGENTS.md`.

however teamcode currently hard-codes a rule in `packages/teamcode/src/tool/bash.txt`:
```
Only create commits when requested by the user. If unclear, ask first.
...
- NEVER commit changes unless the user explicitly asks you to. It is VERY IMPORTANT to only commit when explicitly asked, otherwise the user will feel that you are being too proactive.
```
please make this configurable. i get the safety aspect and think the current default is sensible, but i would just like an opt-out.

---

## #24346 — [FEATURE]: Support mouse wheel scrolling for faster navigation on macOS

📅 `2026-04-25` | ✏️ **chan-yuu** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24346](https://github.com/anomalyco/opencode/issues/24346)


---
**Type**: Feature Request
---

### Feature hasn't been suggested before.
- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request
I'm using TeamCode on macOS and noticed that the main window (especially in chat/output history) lacks mouse wheel scrolling support. Currently, I have to manually click and drag or use small increments to navigate, which is extremely slow and frustrating when dealing with long outputs or code blocks.

**Expected Behavior**
The application should support standard mouse wheel/trackpad scrolling to allow fast and smooth vertical movement through the content, consistent with other macOS applications.

**Related Context**
I've checked existing issues and found some related discussions:
- #4495: Mentions difficulty scrolling long sessions.
- #10345, #9766: Requests for visible scrollbars.
- #17743, #8449: Mouse wheel issues reported primarily on Windows/VS Code terminals.

### Environment
- **OS**: macOS
- **Device**: Mouse wheel / Trackpad

---

## #24312 — [FEATURE]: Notify MCP servers when users cancel tool calls

📅 `2026-04-25` | ✏️ **wybb** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24312](https://github.com/anomalyco/opencode/issues/24312)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary

When a user cancels an teamcode turn while an MCP tool is running, teamcode should notify the MCP server so the server can stop the in-flight tool work.

## Problem

Today the local teamcode session/tool state can be cancelled, but the MCP tool request itself may keep running on the MCP server. This can leave external work, subprocesses, browser sessions, or other long-running handlers active after the user has cancelled.

## Expected behavior

User-initiated cancellation should be forwarded to the pending MCP request. The MCP server should receive the standard MCP cancellation notification for that request.

## Suggested implementation

Forward the tool execution abort signal to the MCP SDK request options when calling client.callTool:

- pass opts.abortSignal as RequestOptions.signal
- keep existing local cancellation behavior unchanged

## Acceptance criteria

- Cancelling an teamcode turn while an MCP tool is running cancels the pending MCP request.
- The MCP server receives a cancellation notification for that request.
- Existing local cancellation behavior still works.

---

## #24301 — [FEATURE]: Add modular protocol system for ssh/bash/docker/websocket, etc

📅 `2026-04-25` | ✏️ **disarticulate** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/24301](https://github.com/anomalyco/opencode/issues/24301)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

teamcode should allow spawning a remote protocol (eg, ssh shell and using that for the context).

To get a shell in a specific directory you run `ssh -t xxx.xxx.xxx.xxx "cd /directory_wanted ; bash --login"`;

This would pin all interaction via the ssh shell (except coordinating with the AI model); if you want a isolated environment, you build a Dockerfile (such as https://docs.linuxserver.io/images/docker-openssh-server/) with ssh server running and connect into it.  Barebones, you could even default to docker/podman.

# Why integral and not a plugin:

I've found myself having to setup a bunch of teamcode profiles on different machines all doing similar work. It'd be 100x easier to have a single teamcode instance & provider as a platform, to then ssh to. It securely protects the provider connection and leaves no trace that the remote ssh is anything but a normal user.

# Why not teach:

I'm aware we can teach the agents how to use ssh (they already do), but fundamentally, with security, you want it to be a hardcode ssh agent that doesn't accidently forget it's suppose to run commands remotely. There's no way some AGENTS.md is going to ensure rm -rf / doesn't accidenly the local system. A pure tunnel into a remote system operated on by teamcode.

# Future effort:

As we love modular things, you coul

> *[Truncado — 1795 chars totais]*

---

## #24299 — [FEATURE]: Inconsistent persistence semantics for `model` vs `variant/effort` in session APIs

📅 `2026-04-25` | ✏️ **laozhoulaile** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24299](https://github.com/anomalyco/opencode/issues/24299)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary

`model` and `variant/effort` currently have inconsistent persistence behavior in TeamCode session APIs:
1. `POST /session` with `model` is not reliably applied as the session default.
2. `variant`/`effort` is message-scoped only (one-shot), while `model` can be made persistent.
3. There is no clean, explicit session config API to atomically read/update both `model` and `variant/effort`.
This forces clients to implement workarounds (empty no-reply messages, local state shims), which introduces side effects and complexity.

## Environment

- teamcode server versions observed: 1.14.x
- Reproduced on both normal port mode and serve mode
- Client behavior validated via HTTP API (`/session`, `/session/{id}/message`, `/provider`)

## Reproduction

### 1) `POST /session` with `model` does not reliably persist as default
```
POST /session
{
  "title": "test",
  "model": {"providerID":"deepseek","modelID":"deepseek-v4-pro"}
}
```

Then first message without explicit model:
```
POST /session/{id}/message
{
  "parts":[{"type":"text","text":"reply ok"}]
}
```
Observed model can still be default fallback (e.g. openai/gpt-5.3-codex), not the requested one.

### 2) variant/effort is one-shot only
```
POST /session/{id}/message
{
  "parts":[{"type":"text","text":"reply ok"}],
  "variant":"high"
}
```
Nex

> *[Truncado — 2698 chars totais]*

---

## #24298 — [FEATURE]: Allow forcing immediate reading of queued messages (steering)

📅 `2026-04-25` | ✏️ **omatheusmesmo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24298](https://github.com/anomalyco/opencode/issues/24298)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

In the GitHub Copilot VS Code extension, when messages are queued while the agent is busy, users can interact with pending messages to change their delivery mode — specifically, they can "steer" the agent by forcing a message to be read immediately rather than waiting in the FIFO queue ([docs](https://docs.github.com/en/copilot/how-tos/copilot-sdk/use-copilot-sdk/steering-and-queueing)).

The Copilot SDK supports two delivery modes:

- `"enqueue"` (default) — message waits in FIFO queue for the next turn
- `"immediate"` (steering) — message is injected into the **current** LLM turn before the next model call

**Requested feature:**

In TeamCode, when messages are in the queue while the model is processing, allow the user to click on a queued message to force its immediate reading by the model (steering mode). This would convert the message from `enqueue` to `immediate` delivery, injecting it into the current turn instead of waiting for FIFO processing.

**Use case:**

While the agent is working, I realize it's heading in the wrong direction. I've already queued a corrective message. Instead of waiting for the queue to process in order, I want to click that message and have the model read it immediately — redirecting the current turn without losing progress.

**Benefits:**

- Gives users interactive 

> *[Truncado — 1739 chars totais]*

---

## #24270 — [FEATURE]:Add toggle to disable editor context auto-attachment for multi-window isolation

📅 `2026-04-25` | ✏️ **xiangkehan** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24270](https://github.com/anomalyco/opencode/issues/24270)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

 **Problem:**
  The Editor Context Protocol automatically attaches the current editor file/selection to every prompt via WebSocket. This works well for a single teamcode window, but **breaks se
  ssion isolation when running multiple teamcode windows in parallel**.

  **Concrete scenario:**
  I often run 2–3 teamcode TUI windows side-by-side for different tasks:
  - Window A: working on `backend/api.ts`
  - Window B: working on `frontend/page.tsx`
  - Window C: working on `docs/README.md`

  Since all windows connect to the same VS Code instance via WebSocket, **every window receives the same editor context** (the file currently focused in VS Code). This means:
  - Window A's prompts get polluted with `frontend/page.tsx` context when I'm actually asking about the backend
  - Window B's prompts get polluted with `backend/api.ts` context when I'm working on the frontend
  - The session context is no longer isolated per window

  **Root cause:**
  There is no way to disable editor context auto-attachment per window. The only workaround is uninstalling the VS Code extension entirely, which also breaks `@mention` file autoc
  omplete.

  **Proposed solution:**
  Add a per-window toggle command in the TUI command palette (`Ctrl+K`) to enable/disable editor context auto-attachment. The state should be pers

> *[Truncado — 2448 chars totais]*

---

## #24265 — [FEATURE]: Support Azure deployment names differing from model names

📅 `2026-04-25` | ✏️ **1openwindow** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24265](https://github.com/anomalyco/opencode/issues/24265)


## Feature hasn't been suggested before

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

### Problem

Azure OpenAI deployments often cannot use the exact base model name as the deployment name. For example, I have an Azure OpenAI resource where the actual deployment is named `gpt-5.4-1`, while the underlying model is `gpt-5.4`.

teamcode's Azure provider documentation recommends that the deployment name match the model name. That works when Azure allows it, but it is not always possible in practice.

<img width="1136" height="574" alt="Image" src="https://github.com/user-attachments/assets/76c8cf75-681f-42a2-81c1-e198235fe280" />

I tried this config:

```json
{
  "provider": {
    "azure": {
      "options": {
        "resourceName": "my-resource",
        "apiKey": "{env:AZURE_API_KEY}"
      },
      "models": {
        "gpt-5.4": {
          "id": "gpt-5.4-1"
        }
      }
    }
  },
  "model": "azure/gpt-5.4"
}
```

This successfully sends requests to the Azure deployment `gpt-5.4-1`, so text requests work.

However, model metadata is no longer inherited from the built-in `azure/gpt-5.4` entry. As a result, capabilities such as image/PDF input, limits, costs, and display metadata are lost. For example, image input is rejected by teamcode before reaching Azure because the custom model no longer has the `modalities` metadata from the built-in `gpt-5.4` model.

### Current behavior



> *[Truncado — 4223 chars totais]*

---

## #24255 — [FEATURE]: auto-cleanup of large cached legacy teamcode binaries

📅 `2026-04-25` | ✏️ **naranyala** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24255](https://github.com/anomalyco/opencode/issues/24255)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

in case of execute this command `du -ch ~/.bun/install/cache/teamcode-*`; my teamcode legacy version take my disk usage over ~15GB.

is that possible to have auto clean-up legacy binaries, or this just bun javascript issues, idk; because i use bun javascript runtime as my default runtime.

thank you.

---

## #24226 — [FEATURE]: Inject environment variable for skills

📅 `2026-04-24` | ✏️ **markg85** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24226](https://github.com/anomalyco/opencode/issues/24226)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

There is [this](https://github.com/anomalyco/opencode/issues/12018) plugin for shell.env environment variable injection. Great! But that doesn't work for skills (or it does and i don't know how to use it?)

I made a skill (uploads a file to a server) that required an API key. I don't want to put that key in that skill folder. There is too much risk of that accidentally leaking out when i push a project (with skills) to a repository or share in other means. I need to somehow tell teamcode "if this skill gets executed, inject these environment variables". That would allow me to only inject these variables when my skill gets executed.

Ideally this would just be stored in the teamcode config file where you can already specify [skill permissions](https://teamcode.ai/docs/permissions/). If it's up to me i'd prefer being able to add skill specific environment details through that config too where i'd add environment variables.

---

## #24199 — [FEATURE]: Paste images into built-in `questions` tool answer

📅 `2026-04-24` | ✏️ **josippapez** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24199](https://github.com/anomalyco/opencode/issues/24199)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Summary

When an agent calls the built-in `question` / `ask-user` tool and the user replies, let the user paste an image from the clipboard into the answer box. The tool should persist the pasted image to a temp file and return its **absolute path** as part of the user's answer, so the agent can immediately consume it (e.g. re-read with its Read tool, pass to vision, attach to a follow-up message).

### Motivation

Agents frequently need to collect visual context mid-run — screenshots of bugs, design mocks, stack-trace pictures, diagrams. Today the only way to get an image to the agent during a `question` reply is:

1. Save the clipboard image to disk manually
2. Paste/type the absolute path as text

This breaks flow and is error-prone (wrong path, forgotten save step). Interactive MCP desktop apps (e.g. `interactive-mcp-server`'s `QuestionDock`) already solve this by intercepting paste, saving clipboard bytes to a temp location, and inlining the absolute path into the answer. The built-in tool should match that UX.

### Proposed behavior

- While typing an answer to a `question` prompt, pressing paste (⌘V / Ctrl+V) with an image on the clipboard:
  1. Writes the image bytes to a temp file (e.g. `$TMPDIR/teamcode-clipboard-<timestamp>.<ext>`).
  2. Inserts the **absolute path** as text at the ca

> *[Truncado — 2485 chars totais]*

---

## #24164 — [FEATURE]: expose a keybind field for the "Toggle MCPs" command (mcp.list)

📅 `2026-04-24` | ✏️ **m-spellchecker** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/24164](https://github.com/anomalyco/opencode/issues/24164)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.
edit: kinda, but issue was closed without result, see comment below
### Describe the enhancement you want to request

### Problem

The `Toggle MCPs` command is reachable from the command palette and via the `/mcps` slash command, but it is the only entry in that section of `packages/teamcode/src/cli/cmd/tui/app.tsx` without a `keybind` property. Because `tui.json` only recognizes identifiers that teamcode's source declares, there is currently no way for end users to bind `Toggle MCPs` to a shortcut.

Tested with teamcode `1.14.22`.

### Evidence

From `packages/teamcode/src/cli/cmd/tui/app.tsx` (dev branch):

```ts
{
  title: "Toggle MCPs",
  value: "mcp.list",
  category: "Agent",
  slash: { name: "mcps" },
  onSelect: () => { dialog.replace(() => <DialogMcp />) },
},
```

Its siblings all expose a keybind:

```ts
{ title: "Switch agent",         value: "agent.list",   keybind: "agent_list",   ... },
{ title: "Switch model",         value: "model.list",   keybind: "model_list",   ... },
{ title: "Switch session",       value: "session.list", keybind: "session_list", ... },
{ title: "Switch model variant", value: "variant.list", keybind: "variant_list", ... },
```

### Proposed change

Add a `keybind` property to the `mcp.list` command so users can bind it via `tui.json`. A name like `mcp_list` would mirror the existing `*_list` pattern used by sibl

> *[Truncado — 2189 chars totais]*

---

## #24160 — [FEATURE]: Add /uptime slash command

📅 `2026-04-24` | ✏️ **mateuszkwiatkowski** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24160](https://github.com/anomalyco/opencode/issues/24160)


### Feature hasn't been suggested before.

- [X] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a `/uptime` slash command that shows how long the TeamCode process has been running, similar to the UNIX `uptime` command.

When invoked, it displays a toast with the current time and elapsed duration, e.g. `11:23 AM  up 3h 1m 45s`.

Implementation: store `Date.now()` at process startup in `teamcode-process.ts`, expose it via the `/global/health` API endpoint (`startTime` field), and register the `/uptime` slash command in the TUI.

---

## #24159 — [FEATURE]: Add DeepSeek V4 endpoint to Zen

📅 `2026-04-24` | ✏️ **hrdkbhatnagar** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24159](https://github.com/anomalyco/opencode/issues/24159)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Would be very helpful for API stability if Deepseek v4 is added to Zen instead of directly using an API key through DeepSeek

---

## #24153 — [FEATURE]: Add unarchive/restore for archived sessions

📅 `2026-04-24` | ✏️ **alohaninja** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/24153](https://github.com/anomalyco/opencode/issues/24153)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Problem:** Archiving a session is currently a one-way operation. Once archived, sessions disappear from the sidebar and the only place they're visible is dimmed in the command palette file picker. There's no way to restore them without directly hitting the API.

Related issues:
- #726 — confusing archive/delete behavior across projects
- #865 — cannot delete folders in archived folder
- #872 — hide empty archived section and folders

**Proposed solution:**

Add an `unarchive` action that restores an archived session to active status and navigates to it. The backend already supports this — `UpdatedTime` accepts `archived: null` — it just needs UI wiring.

**Entry points (Web app):**
- Command palette: "Unarchive session" command
- Command palette file picker: action on dimmed archived sessions (the one place they're already visible)
- Session dropdown menu: show "Unarchive" instead of "Archive" when viewing an archived session by URL
- Keyboard shortcut via command palette

**Entry points (TUI):**
- Session list dialog: new keybind to archive/unarchive toggle

**Behavior:** Unarchiving restores the session to its original workspace grouping and navigates to it.

**Scope of changes:**
- PATCH endpoint validation: accept `null` for `time.archived` (~1 line)
- `unarchiveSession()` function + command palette entry in layout.tsx
- Event reducer:

> *[Truncado — 1861 chars totais]*

---

## #24134 — [FEATURE]: support codex as a first-class provider (codex subscription rather than OpenAI api provider)

📅 `2026-04-24` | ✏️ **PadishahIII** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24134](https://github.com/anomalyco/opencode/issues/24134)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I would like TeamCode to support `codex` as a first-class provider for Codex-compatible Responses API endpoints.  TeamCode already supports many providers through `models.dev` and generic SDK adapters. In this case, a `models.dev` entry alone is not enough because Codex-compatible gateways expect Codex CLI-style request construction, not only a model list:
  - `POST <baseURL>/responses`
  - top-level `instructions` and Responses API `input`
  - `store: false` by default
  - Codex compatibility headers such as `x-client-request-id`, `x-codex-window-id`, and installation metadata
  - Codex tool formats, especially `apply_patch` as a Responses API custom grammar tool

  The goal is to let users configure a Codex-compatible API base and use models like:

  ```bash
  teamcode -m codex/gpt-5.4
```

  without relying on provider-specific proxy hacks or MITM rewriting.

  Proposed scope:

  - Add codex as a provider id available in auth/config flows.
  - Route codex/* models through a native Responses API transport.
  - Preserve configurable baseURL and API-key auth for user-specified Codex-compatible providers.
  - Translate TeamCode messages and tool calls to the Codex-compatible Responses protocol.
  - Add focused tests for provider loading, request construction, stream parsing, and tool-call handling.



> *[Truncado — 1823 chars totais]*

---

## #24084 — [FEATURE]: Support OAuth 2.0 client_credentials for configured providers

📅 `2026-04-24` | ✏️ **benjaminwestern** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24084](https://github.com/anomalyco/opencode/issues/24084)


[x] I have verified this feature I'm about to request hasn't been suggested before.

Would you consider adding opt-in OAuth 2.0 `client_credentials` support for configured providers at the provider fetch layer?

I am opening this as an issue first because this seems like a core/runtime feature and I wanted to check whether this direction is useful before opening a PR.

## Why this is important to us

We are looking at a large enterprise rollout of TeamCode through a new Enterprise LLM Gateway that uses standard OAuth 2.0 `client_credentials` authentication.

Without something built into the provider path, the likely alternative for us is maintaining custom internal plugin/auth workarounds for what is otherwise a standard enterprise gateway pattern. We are hoping a small built-in capability here could avoid that and also help others using similar enterprise gateways.

Environment-wise, this is for an OpenAI-compatible enterprise gateway setup in front of internal/provider LLM access, similar to patterns commonly seen with Apigee X, Azure APIM, Okta, Keycloak, Kong, and similar brokers.

## The gap we are hitting

From looking through the current code, I do not think provider-side `client_credentials` support exists today.

The current provider OAuth path seems mainly oriented around interactive flows such as:

- plugin-defined auth methods
- browser or device login
- persisted `refresh` / `access` / `expires` state

That is a poor fit for gateways that only support:

- `grant_

> *[Truncado — 5776 chars totais]*

---

## #24072 — [FEATURE]: Add the provider https://devin.ai/

📅 `2026-04-23` | ✏️ **void0x14** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24072](https://github.com/anomalyco/opencode/issues/24072)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add this provider and let's use it by entering our API key. Don't ignore this issue, just like you wouldn't ignore thousands of other issues.

<img width="1920" height="1048" alt="Image" src="https://github.com/user-attachments/assets/fbd1f4a1-b3bf-4bc1-83e6-2b72e4c5bcc6" />

---

## #24050 — [FEATURE]: Add the ability to expand the to-do list whilst the agent is running

📅 `2026-04-23` | ✏️ **mtbitcr** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24050](https://github.com/anomalyco/opencode/issues/24050)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Sometimes not all the items fit on the list. It’s a minor thing, but it would be nice if I could see the whole list.

<img width="1146" height="346" alt="Image" src="https://github.com/user-attachments/assets/49ec95ff-3a83-463a-bb75-2efdd1b7bb2f" />

---

## #24038 — [FEATURE]: Claude support using ACP protocol

📅 `2026-04-23` | ✏️ **jcubic** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/24038](https://github.com/anomalyco/opencode/issues/24038)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I just installed Agent-Shell for Emacs that allows using Claude Code subscription via Agent Client Protocol and @agentclientprotocol/claude-agent-acp

Anthropic is blocking 3rd-party tools, but only if you hook directly to their API endpoints used by Claude Code. This looks like a way to do this "legally".

ACP is already part of TeamCode, you only need to make it run as a client and spawn `claude-agent-acp` as a subprocess.

---

## #24032 — [FEATURE]: Provider Request - Lemonade

📅 `2026-04-23` | ✏️ **korgano** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24032](https://github.com/anomalyco/opencode/issues/24032)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

[Lemonade is a Local LLM server/router optimized for AMD hardware.](https://lemonade-server.ai/docs/server/server_spec/)

Adding support for Lemonade allows users on AMD systems to access the full suite of models on their systems without forcing them to define via a custom provider entry, which then has to be deleted and remade every time the user adds/changes models.

---

## #24017 — [FEATURE]: Saving prompts and threads, manage them by saving topic  and/or bookmarks

📅 `2026-04-23` | ✏️ **pskraemer11** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24017](https://github.com/anomalyco/opencode/issues/24017)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Description:

Problem
Currently, prompts and threads cannot be saved within the login session, sorted by topic, or bookmarked (see Perplexity-App).

What is missing
1. Prompts and threads cannot be saved within the login session.
2. Different topic areas and multiple sessions should be better organized and remembered using “Spaces” / topic areas or folders and bookmarks, so that users can return to specific tasks later and continue developing them.

Suggested Enhancement
1. Add a mechanism for saving prompts and threads (chat history). 
2. Add a folder system to manage the saved chat histories

Use Cases
1. This makes it possible to return to specific tasks at a later time and further develop them.
2. It is possible to switch to different models for subsequent login sessions, as the prompt and previous chat history are saved and can be made available in the new model to pick up where you left off.

---

## #24006 — [FEATURE]:Support runtime model switching via plugin API

📅 `2026-04-23` | ✏️ **zhangym1995** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24006](https://github.com/anomalyco/opencode/issues/24006)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Description:

Problem
Currently, switching the active LLM model in TeamCode requires either:

Manually clicking through the TUI model selector
Editing the config file and starting a new session
There is no way to programmatically switch models at runtime via the plugin system or any scriptable interface.

What's Missing
Looking at the plugin API (@teamcode-ai/plugin):

The chat.params hook provides model in the input (read-only), while the output only allows modifying temperature, topP, topK, maxOutputTokens. There's no way to change the model.
The config hook only receives input, with no output to modify the active configuration.
The client SDK object has no documented method like client.session.setModel() or similar.
The shell.env hook only affects child process environments, not TeamCode's own model selection.
This makes it impossible to implement model hot-switching as a plugin, which blocks several valuable use cases.

Proposed Enhancement
Add a mechanism for runtime model switching. Some possible approaches (any one would suffice):

chat.model hook — Allow plugins to modify the model selection before each chat turn:
"chat.model"?: (
  input: { sessionID: string; agent: string },
  output: { providerID: string; modelID: string },
) => Promise<void>
client.session.setModel() API — Expose a metho

> *[Truncado — 2403 chars totais]*

---

## #24002 — [FEATURE]: UX: Improve Web UI project navigation, Git worktree support

📅 `2026-04-23` | ✏️ **peterwwillis** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24002](https://github.com/anomalyco/opencode/issues/24002)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The following are two issues that makes it annoying to use TeamCode. Fixing these would make the tool less painful and more productive. thx

## Issue 1: Project selection

**Problem**

When you open the web ui (latest version) and go to add a project, you are presented a list of dirs. Click one dir, and it opens the project there; it does not let me navigate into sub-dirs and select the final dir. If I type out the dir path and use tab, I can navigate inside dirs. But this is annoying, since I'm not aware of this behavior at first, it doesn't work like I expect. And I'm lazy, I want to just click, click, click.

**Solution**

Request is to make it work like user expects; should be able to click through dir tree and finally select a button next to the dir that says 'select this dir'. Clicking dirs should navigate into them, not select them.

## Issue 2: Git worktree selection

**Problem**

I create different directories for different worktrees, so I can work in parallel. But TeamCode makes it annoying to find and select those worktrees.

I can open a project to a specific Git worktree, but doing this in Web UI is annoying as I have to go look up the name of the worktree dir, open a project, type out the dir name, select the dir. I have to do this for every worktree, for every time I want to make any 

> *[Truncado — 2480 chars totais]*

---

## #23993 — [FEATURE]: Option to decorrelate /undo /redo from code changes

📅 `2026-04-23` | ✏️ **YPares** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23993](https://github.com/anomalyco/opencode/issues/23993)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I often don't want the changes in my repo to be tied to the conversation. I understand the appeal but in the long run I think it's more a footgun rather than a feature. Often I just go back in a conversation to just save on context but actually want to keep part of the code changes, and if I want to revert stuff I already have proper tooling from git & jj.

So like in Claude Code, I'd like to have an option to decorrelate /undo and /redo from file changes.

---

## #23991 — [FEATURE]: Add Uzbek (O'zbekcha) README translation

📅 `2026-04-23` | ✏️ **uchkunr** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23991](https://github.com/anomalyco/opencode/issues/23991)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add an Uzbek translation of the README as `README.uz.md`, and register the language link in the translation selector across all existing localized README files.

### Why

The README is already translated into 22 languages (Turkish, Ukrainian, Vietnamese, Bengali, etc.), but Uzbek is missing. Adding it makes TeamCode more accessible to Uzbek-speaking developers - ~35M native speakers — and stays consistent with the existing i18n pattern in the repo.

### Scope

- New file: `README.uz.md` (full translation, mirroring the structure of `README.md`)
- Update the `<p align="center">...</p>` language selector in all 22 existing README files to include the Uzbek link

No code or content changes - translation only.

I'm ready to open the PR if this is accepted.

---

## #23984 — [FEATURE]: Plan mode should allow planning-related CLI tools (gh, glab, ticket management, diagrams)

📅 `2026-04-23` | ✏️ **MattPark** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23984](https://github.com/anomalyco/opencode/issues/23984)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Problem**

Plan mode's system prompt uses absolute language that prevents ALL bash commands except read/inspect operations. This blocks legitimate planning activities like:

- Creating/updating GitHub issues via `gh issue create`, `gh pr create`
- Creating/updating GitLab issues via `glab issue create`, `glab mr create`
- Generating and committing planning diagrams or documentation artifacts

This forces users into build mode for these activities, which often leads to the agent executing code changes prematurely before planning is complete.

**Problematic responses in plan mode**

When asked to create a GitHub issue or GitLab ticket in plan mode, the agent responds with variations of:

> "I'm in plan mode and cannot execute commands. I can only read and analyze. Please switch to build mode to create the issue."

> "Plan mode restricts me to read-only operations. Creating a GitHub issue requires running `gh issue create`, which I cannot do in this mode."

This happens because the system prompt (`packages/teamcode/src/session/prompt/plan.txt`) states:

```
STRICTLY FORBIDDEN: ANY file edits, modifications, or system changes.
Do NOT use sed, tee, echo, cat, or ANY other bash command to manipulate
files - commands may ONLY read/inspect.
...ZERO exceptions.
```

And the `## Important` section reinforces:

```
you MUST NOT make any edits, run an

> *[Truncado — 3197 chars totais]*

---

## #23954 — [FEATURE]: Support / release build without AVX2 for macOS OR ability to use external Bun runtime without AVX2

📅 `2026-04-23` | ✏️ **mjcm-dev** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23954](https://github.com/anomalyco/opencode/issues/23954)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi,

I’m trying to run teamcode on an iMac 13,2 with an Intel i7-3770 (Ivy Bridge), which supports AVX but not AVX2.
Currently, the macOS build requires AVX2 and fails to run on this machine.

Would it be possible to:
- Provide a macOS build targeting a more compatible baseline (e.g. x86-64 without AVX2), or
- Offer a separate “legacy CPU” release?

This would allow teamcode to run on older but still perfectly usable Macs (Ivy Bridge / Haswell pre-AVX2), which are still quite common especially in patched macOS environments.

I understand this might have performance implications, but having a compatible build would be very helpful.

I’d be happy to test any experimental builds on this hardware if needed.

Thanks!

---

## #23943 — [FEATURE]:change prompt of plan/build

📅 `2026-04-23` | ✏️ **nameearly** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23943](https://github.com/anomalyco/opencode/issues/23943)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Models such as Nemotron 3 Super appear to have been trained to actively fix issues immediately upon detection. Existing prompt engineering cannot alter this inherent behavior, and conversations frequently end in repetitive refusals.
We expect that in Plan mode, the model will not be informed of unavailable tools upfront. Information about these tools shall only be disclosed after authorization is obtained or mode switching is completed.

---

## #23934 — [FEATURE]: Persist TeamCode Web sidebar open-project state outside browser localStorage

📅 `2026-04-23` | ✏️ **sacoscada-rgb** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23934](https://github.com/anomalyco/opencode/issues/23934)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request
Please persist the TeamCode Web left-sidebar open-project list in TeamCode-managed persistent storage instead of only browser localStorage.

Today the sessions/chats still exist in `teamcode.db`, but the sidebar project setup is tied to browser storage for the current origin. In practice that means the setup can appear lost when:
- `teamcode web` starts on a different port
- browser localStorage/site data is cleared
- switching between compatible clients/browser contexts

This makes the environment feel reset even though the session data is still present.

A better behavior would be to store the opened sidebar projects in durable TeamCode storage (for example `teamcode.db` or another server-side persistent store) and hydrate the web client from there.

That would make the sidebar survive restarts, port changes, and browser storage loss, and would make saved sessions much easier to rediscover.

---

## #23923 — [FEATURE]:allow /disconnect from cli

📅 `2026-04-23` | ✏️ **mosheliv** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23923](https://github.com/anomalyco/opencode/issues/23923)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

after you connect to a provider, sometimes mistakenly (for example connected to zen instead of go) there is no way to disconnect without getting out of teamcode, editing files and hoping it wasn't cached. in my case it tries spawning gpt nano agents as i "have" zen, which fail

---

## #23896 — [FEATURE]: Prevent sidebar disappearing when resizing the window

📅 `2026-04-22` | ✏️ **Wdits** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23896](https://github.com/anomalyco/opencode/issues/23896)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, when you resize the Desktop App window, the left sidebar disappears and shows this ugly sandwich mode for no apparent reason when there's still plenty space left.
<img width="67" height="62" alt="Image" src="https://github.com/user-attachments/assets/9753eaeb-1548-49e8-b877-1a1e6afe4d11" />

<img width="287" height="686" alt="Image" src="https://github.com/user-attachments/assets/26752949-a265-454a-a286-3c2971ada3b7" />

---

## #23893 — [FEATURE]: Sort model providers alphabetically

📅 `2026-04-22` | ✏️ **kunningKing11** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23893](https://github.com/anomalyco/opencode/issues/23893)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be great to have the model providers sorted alphabetically so they are easier to find without searching. Maybe not the "Popular" model providers but at least the other ones. I know there is a search feature but it just looks a lot nicer to have this.

---

## #23879 — [FEATURE]: dismissible toasts — user keyboard/click dismiss + plugin programmatic dismiss

📅 `2026-04-22` | ✏️ **marcusquinn** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/23879](https://github.com/anomalyco/opencode/issues/23879)


### Summary

TUI toasts emitted via `client.tui.showToast()` (and the underlying `/tui/show-toast` endpoint) have `duration` as the only control surface. Once shown, neither the user nor the emitting plugin can dismiss them early. For warning/error variants that legitimately need a long display window (10-30s), this leaves the toast blocking attention long after the user has read it.

### Use case

The [`teamcode-aidevops`](https://github.com/anomalyco/aidevops) plugin renders session-start framework status (version, env, security posture, advisories) as a consolidated TUI toast. Severity is classified per line; variant and duration follow the highest severity present:

- error (30s): security advisories
- warning (15s): pulse-stalled / external contribution alerts
- info (8s): version + env lines
- success (5s): "all protections active"

Users typically absorb the message in 2-3s, but the toast stays up for the full duration with no way to clear it. The plugin also can't clear it programmatically once the context it reported has changed (e.g., user runs `aidevops update` in a side terminal — the stale advisory banner continues to occupy screen real estate).

### Proposal

Two small additions, both opt-in:

1. **User-side dismissibility** — a keyboard shortcut (e.g., `Esc` while a toast is visible) and/or a click target on desktop dismisses the currently-visible toast immediately. Default off if back-compat is a concern; optional `dismissible: boolean` flag on the emit.

2. *

> *[Truncado — 2860 chars totais]*

---

## #23874 — [FEATURE]: Improve Projects Side bar visibility

📅 `2026-04-22` | ✏️ **abdelrahman-aboelnour** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23874](https://github.com/anomalyco/opencode/issues/23874)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

the project sidebar seems to be hard to use and even harder to navigate / find the project you want, for example in my projects they all start with the same prefix so kinda annoying to be able to find the project I want to work in. think the side bar / chats need better visibility / UX.

<img width="65" height="1017" alt="Image" src="https://github.com/user-attachments/assets/133b3f4c-78b7-4ebb-be39-2e58546897f0" />

---

## #23871 — [FEATURE]: Add "release" branch to get last release version on nixos

📅 `2026-04-22` | ✏️ **ReStranger** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23871](https://github.com/anomalyco/opencode/issues/23871)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I ask you to add a release branch which will contain the latest release code for convenient receipt of the current release version in the nix flake system

---

## #23863 — [FEATURE]: Add Czech documentation localization

📅 `2026-04-22` | ✏️ **No898** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23863](https://github.com/anomalyco/opencode/issues/23863)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add Czech localization for the documentation and README so Czech-speaking users can read TeamCode docs in Czech.

The localization should add Czech docs under `/docs/cs`, Czech docs UI strings, and a Czech README while keeping code blocks, commands, config keys, flags, model names, and provider names unchanged.

---

## #23857 — [FEATURE]: Tab Interface for Projects and Git Worktree Branches

📅 `2026-04-22` | ✏️ **parascent** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23857](https://github.com/anomalyco/opencode/issues/23857)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request



#### Is your feature request related to a problem? Please describe.

When working with multiple git worktrees or different projects simultaneously, it's difficult to:
- Track which worktree/branch I'm currently working on
- Switch between worktrees efficiently
- See at a glance which worktrees have uncommitted changes
- Manage context switching without losing mental model

Currently, I have to rely on the sidebar project list or external terminal commands like `git worktree list`, which breaks workflow continuity.

#### Describe the solution you'd like

Add a tab bar interface that displays:

1. **Active git worktree branches** - Each worktree appears as a tab with its branch name
2. **Open projects** - Different projects shown as separate tabs
3. **Visual indicators** - Show which tab is active, dirty state (uncommitted changes), and branch status

**Example layout:**


┌─────────────────────────────────────────────────────────────────────────────┐
│ [main*] [feature/auth] [feature/payments] [project-b]           [+] [▼]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Content area showing the selected worktree/project                         │
│                                  

> *[Truncado — 2693 chars totais]*

---

## #23847 — [FEATURE]:增加任务非异常停止浮框提醒配置功能

📅 `2026-04-22` | ✏️ **MarsChuang** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23847](https://github.com/anomalyco/opencode/issues/23847)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

仍然有待开展的任务清单，智能体非异常工作停止时无法第一时间发现，导致工作暂停。目前支持的完成/异常/权限确认，需要另一个工作停止提醒

---

## #23845 — [FEATURE]: Add progressive scroll navigation buttons to TUI session view

📅 `2026-04-22` | ✏️ **SOUMITRO-SAHA** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23845](https://github.com/anomalyco/opencode/issues/23845)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**What**: Add two scroll navigation buttons (▲ / ▼) on the right side of the TUI session view to quickly jump between user messages and return to the bottom.

**Why**: In long sessions with many back-and-forth messages, scrolling manually to find previous user prompts is tedious. A quick navigation mechanism improves productivity when reviewing or editing prior prompts.

### How it should work:

1. ▲ Up arrow — Jump to the previous user message progressively:
   - 1st click → jumps to the user message immediately above the current scroll position
   - 2nd click → jumps to the user message before that
   - Continues until reaching the first user message in the session

2. ▼ Down arrow — Scroll to the bottom of the session:
   - Appears only when the view is scrolled up (hidden when already at the bottom)
   - Clicking it resets the progressive navigation state

### Benefits:

- Faster navigation in long sessions
- Reduces manual scrolling
- Progressive navigation lets users walk through their own prompts in chronological order
- Make reviewing the task easier.

---

## #23842 — [FEATURE]: Desktop popup notifications

📅 `2026-04-22` | ✏️ **yajo** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23842](https://github.com/anomalyco/opencode/issues/23842)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Same as https://github.com/anomalyco/opencode/issues/11786, but the bot tells to open a new issue, so here it is.

I use TeamCode desktop, on Linux, and only get sound notification. Most times I work without desktop sound, to avoid disturbing others. A pop-up would be really useful, to know when the agent requires attention or has finished its work.

---

## #23825 — [FEATURE]: Audio Info Preview and Playing in Web UI

📅 `2026-04-22` | ✏️ **acadarmeria** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23825](https://github.com/anomalyco/opencode/issues/23825)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

In teamcode web UI's git changes view and folder tree view, audio previewing (including functions like play, pause, showing metadata information and spectrogram) is not supported for now.

This feature could be very useful for AI developers and creators on audio/speech/music.

---

## #23823 — [FEATURE]: Enable Multi-Turn Dialogue Between Primary and Sub-Agents Within a Single Session

📅 `2026-04-22` | ✏️ **812659179** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23823](https://github.com/anomalyco/opencode/issues/23823)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Current Situation:**
When interacting with a sub-agent, the dialogue ends after a single exchange, requiring a new session to be created for the next interaction.

**Desired Improvement:**
Enable the primary agent and sub-agents to conduct multiple turns of dialogue within the same session (similar to continuous user-agent interaction), thereby avoiding frequent session creation to improve context coherence and efficiency. The primary agent should automatically determine whether to reuse an existing session with a sub-agent based on the context. This capability can be implemented as a configurable feature toggle for users.

---

## #23816 — github-copilot plugin: provider.options.headers from config are not sent on the models() request

📅 `2026-04-22` | ✏️ **Nepomuceno** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23816](https://github.com/anomalyco/opencode/issues/23816)


### Summary

The `github-copilot` provider plugin ignores user-configured headers (`provider.github-copilot.options.headers` in `teamcode.json`) when it fetches the list of available models. The same headers are honoured for chat requests via the plugin's `fetch` wrapper, so the behaviour is inconsistent.

### Where

`packages/teamcode/src/plugin/github-copilot/copilot.ts`, the `provider.models()` hook constructs its header map from scratch and does not read `provider.options.headers`:

```ts
async models(provider, ctx) {
  // ...
  return CopilotModels.get(
    base(auth.enterpriseUrl),
    {
      Authorization: `Bearer ${auth.refresh}`,
      "User-Agent": `teamcode/${InstallationVersion}`,
    },
    provider.models,
  )
}
```

By contrast, the `auth.loader().fetch` path does spread `init.headers` into the outgoing request, so config headers reach chat calls.

### Why this matters

Users who configure extra headers in `teamcode.json` reasonably expect those headers to apply to all requests the provider makes, including the model discovery call. Today they only apply to chat. This makes the model list returned by `teamcode models github-copilot` (and the model picker) inconsistent with the model set actually reachable on chat requests, depending on what the user sets.

### Reproduction

1. In `~/.config/teamcode/teamcode.json`:

```json
{
  "provider": {
    "github-copilot": {
      "options": {
        "headers": {
          "X-Test-Header": "from-config"
        }
     

> *[Truncado — 2248 chars totais]*

---

## #23807 — [FEATURE]: Config : Add key search to {file:...} substitution

📅 `2026-04-22` | ✏️ **sebastienroul** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23807](https://github.com/anomalyco/opencode/issues/23807)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Config feature needed

In `teamcode.json` substitution with `{file:PATH_TO_FILE}` substitutes ALL file content : It works.
Add a new feature : `{file:PATH_TO_FILE:KEY}` to substitute ONLY the line of the file starting with the KEY

---
Example

```env
# File foo.env store in ~/.secret/foo.env

MY_LOGIN=foo.bar
MY_PASSWORD=bar.foo
```

In teamcode.json (for example in `mcp` section

```JSON
...
"environnement" : {
  "PROJECT_LOGIN": "{file:~/.secret/foo.env:MY_LOGIN}",
  "PROJECT_PASSWORD" : "{file:~/.secret/foo.env:MY_PASSWORD}"
}
...
````

---

## #23800 — [FEATURE]: We need an official plugin marketplace！！！We need a more user-friendly plugin management command！！！

📅 `2026-04-22` | ✏️ **jiweigithub** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23800](https://github.com/anomalyco/opencode/issues/23800)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

TeamCode is awesome, but we don't have an official plugin marketplace, and the plugin management commands are not well-developed. We need an official plugin marketplace, something like the ClaudeCode Plugin Marketplace. We also need a more user-friendly plugin management command, something like ClaudeCode /plugin /plugins.

---

## #23790 — Allow editing MCP tool call content before execution when permission is 'ask'

📅 `2026-04-22` | ✏️ **osintowl** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23790](https://github.com/anomalyco/opencode/issues/23790)


## Summary

When a tool call requires approval via the `permission: "ask"` config (especially MCP tools like Confluence/Jira), the user can only approve or reject the call. There's no way to **edit the content** before it's sent.

## Use Case

For MCP tools like Atlassian (Jira/Confluence), the agent might draft a page body, issue description, or comment that's close but needs tweaks. Currently the only options are:
1. Approve as-is
2. Reject and re-prompt the agent

It would be much more efficient to edit the tool call parameters (e.g., the `body` of a Confluence page, the `description` of a Jira issue) before approving.

## Proposed Behavior

When a tool call is prompted for approval and the user selects "ask":
- Add an "edit" option alongside "once", "always", and "reject"
- Selecting "edit" opens the tool call parameters in the user's `$EDITOR` (or a TUI text field)
- After saving, the modified parameters are used for the tool call

This would be especially valuable for MCP tools where the content being created (wiki pages, issue descriptions, comments) is user-facing and often needs human refinement.

---

## #23784 — [FEATURE]: Display subagent status in TUI prompt footer

📅 `2026-04-22` | ✏️ **areyouok** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23784](https://github.com/anomalyco/opencode/issues/23784)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, when using subagents in TeamCode, there is no visual indication in the TUI prompt footer about how many subagents are active or exist in total. Users have to manually navigate to the subagent view to check this information.

**Proposed enhancement:**
Add a subagent status indicator to the prompt footer (bottom-right area next to the "commands" hint) that:

1. Shows nothing when there are no subagents
2. Displays `active/total sub agents` when subagents exist
3. Shows a ⚡ lightning icon next to the active count when there are active subagents, using `theme.warning` color to draw attention
4. Uses muted color when no subagents are active

This provides at-a-glance awareness of background subagent activity without leaving the main prompt view.

**Implementation approach:**
- Compute recursive descendant count (including nested subagents) from `sync.data.session` using BFS traversal
- Check `session_status` for "busy" or "retry" states to determine active count
- Conditionally render in the prompt footer using SolidJS `<Show>`

**Screenshots:**

*With active subagent (⚡ icon + warning color):*

<img width="364" height="91" alt="Image" src="https://github.com/user-attachments/assets/4f7e16a8-d8c5-4912-9fa8-1bd05f3d9f34" />

*Without active subagent (muted color):*

<img width="361" height="86"

> *[Truncado — 1601 chars totais]*

---

## #23775 — [FEATURE]: persistent daemon agent for workspace context with push/pull coordination

📅 `2026-04-22` | ✏️ **qiankunli** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23775](https://github.com/anomalyco/opencode/issues/23775)


## Verification

- [x] I searched existing issues first
- [x] This is a feature/design request, not an implementation PR

## Description

I’d like TeamCode to support a persistent background daemon agent that runs alongside the main agent for a workspace.

The main idea is to introduce a first-class background agent that stays alive during the session and can exchange information with the main agent through both pull and push communication.

## Core concept

A daemon agent should be able to:

- run continuously in the background for the current workspace
- observe long-lived workspace state
- maintain structured memory/context that should not be recomputed repeatedly
- communicate with the main agent through:
  - pull: the main agent asks the daemon for current state, summaries, or recommendations
  - push: the daemon proactively informs the main agent when meaningful events occur

## Why this is useful

The main agent is usually optimized for the immediate task in front of it. During longer sessions, it can lose track of operational context that changes in parallel.

A daemon agent would act like durable workspace intelligence: always on, low-noise, and able to feed the main agent the right information at the right time.

## One concrete business scenario: multi-repo workspace tracking

For example, I often work in a top-level project that contains multiple child Git repositories.

In that scenario, the daemon agent could continuously maintain per-repo information such as:



> *[Truncado — 3192 chars totais]*

---

## #23742 — [FEATURE]: Support duplicate provider config sections

📅 `2026-04-21` | ✏️ **IustinT** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23742](https://github.com/anomalyco/opencode/issues/23742)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Support duplicate provider config sections so users can define multiple instances of the same provider, especially Azure, with different endpoints, regions, resource hubs, deployments, and API keys. This is needed because Azure OpenAI / Azure AI Foundry model availability is often split across regions and hubs, so a single Azure config is not always sufficient.

It would also be useful if each duplicated provider config could declare a based_on-style identifier pointing to the underlying provider type, for example azure. That way, TeamCoder could still apply default provider logic and default model configuration correctly, while allowing multiple distinct Azure provider instances in one config.

This would improve support for real-world Azure setups, reduce config workarounds, and make multi-region / multi-resource deployments much easier to manage.


<details>

<summary>Detailed explanation</summary>

Add support for duplicate provider configuration sections so a single TeamCoder setup can define multiple instances of the same provider, especially for Azure. This would allow users to configure multiple Azure resources, multiple regions, and different API keys under separate entries, rather than being limited to a single Azure provider block.

This is particularly important for Azure OpenAI and Azur

> *[Truncado — 5215 chars totais]*

---

## #23729 — [FEATURE]: Add "Explain" option to permission prompt

📅 `2026-04-21` | ✏️ **eggfriedrice24** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23729](https://github.com/anomalyco/opencode/issues/23729)


- [x] I have verified this feature hasn't been suggested before.

### Problem

When I want the agent to explain a proposed edit/command before deciding, today I have to **Reject → type "explain" into the feedback textarea → enter**, or double-esc out and type into the input. That's 3–4 steps for something I do constantly, and treats every "I need more context" as a rejection.

### Proposal

Add a fourth option next to *Allow once / Allow always / Reject*: **Explain**. Pressing it asks the agent to explain the proposed change (files/command, behavior change, risks), then the permission prompt re-appears for the real decision.

### Implementation sketch

UI-only: Explain reuses the reject-with-feedback path with a canned message asking for explanation before retry. Zero backend changes, contained to `packages/teamcode/src/cli/cmd/tui/routes/session/permission.tsx`. If the UX warrants it, a non-blocking variant that keeps the permission pending while the agent explains is a natural follow-up.

Before:
<img width="2555" height="1438" alt="Image" src="https://github.com/user-attachments/assets/7c1df2a2-4556-4eb4-af42-e2248f29b8e1" />

After:
<img width="2177" height="546" alt="Image" src="https://github.com/user-attachments/assets/5f52a02c-ff91-4e56-a21c-f7a2d28f415a" />

---

## #23723 — [FEATURE]: Show a resume aid in the TUI sessions picker

📅 `2026-04-21` | ✏️ **zfaustk** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23723](https://github.com/anomalyco/opencode/issues/23723)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Describe the enhancement

When reopening a previous conversation from `/sessions`, it is hard to tell what was completed, what is blocked, and what to do next without entering the session and scrolling.

A small resume aid in the selected session row would help:
- Done: latest useful progress summary
- Blocked: current running/error state when present
- Next: first pending or in-progress todo when available

### MVP

- only show this in the TUI sessions picker
- derive it from existing session messages, session status, and todos
- do not add a new backend API or persisted recap field

### Why this shape

This keeps the feature local to the resume flow and avoids introducing new storage or summary infrastructure before the UI need is proven.

---

## #23697 — [FEATURE]: add verify run on duplicate model

📅 `2026-04-21` | ✏️ **w1nthinker** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23697](https://github.com/anomalyco/opencode/issues/23697)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

rn the difference between codex and copilot openai models is a very opaque small icon, it would be benefitial, if there are duplicate models via naming, to ask the user if the selected provider is the correct one

---

## #23691 — [FEATURE]: Show all skills used in the session.

📅 `2026-04-21` | ✏️ **cavaldos** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23691](https://github.com/anomalyco/opencode/issues/23691)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I want to show the list of skills used in the session. The skill currently in use will be indicated by glowing green dots, while any skills that are not in use will be disabled. Similar to MCP list

---

## #23684 — [FEATURE]: Sliding skills context — keep skills adjacent to the active turn for consistent agent attention

📅 `2026-04-21` | ✏️ **GoodEnergy36** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23684](https://github.com/anomalyco/opencode/issues/23684)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

Skills are frequently ignored by agents — not because the names and descriptions are poor, but because of how attention works in transformer models. By the time a real software development session reaches tens of thousands of tokens, the skills context sitting in the system prompt is far from the model's active focus. The "lost in the middle" effect is well documented: models attend most strongly to content near the current turn. Skills placed in the system prompt drift further from that position with every message.

I believe this is the root cause of the common frustration where agents fail to invoke skills that should be obvious choices. Many others share this experience and the current workaround — explicitly prodding the agent — is a poor substitute for a structural fix for what agents, supposedly independently acting tools, are meant to be.

## Proposal

Move skills context out of the system prompt and instead prepend it to each new user message, stripping it from all prior user messages. A conversation would grow like this:

```
[system_no_skills, m1_user+skills]
[system_no_skills, m1_user_STRIPPED, a1, m2_user+skills]
[system_no_skills, m1_user_STRIPPED, a1, m2_user_STRIPPED, a2, m3_user+skills]
```

This guarantees that skills context is always adjacent to the active turn — the 

> *[Truncado — 3247 chars totais]*

---

## #23680 — [FEATURE]: Real-time watching for out-of-tree files in context

📅 `2026-04-21` | ✏️ **void0x14** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23680](https://github.com/anomalyco/opencode/issues/23680)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Is your feature request related to a problem? Please describe.**

Currently, TeamCode only watches and reflects changes for files within the current working directory (CWD). If a file from an external directory is added to the context (via `@`-mention with an absolute path or via MCP), modifications made to that file externally are not reflected in the sidebar UI. The watcher in `file/watcher.ts` is scoped to the project root, so any out-of-tree path in the active context is silently ignored.

**Describe the solution you'd like**

Extend the file system watcher (`inotify` on Linux / `fs.watch` on other platforms, implemented in `file/watcher.ts`) to dynamically include all files currently held in the active AI context, regardless of whether they reside inside or outside the CWD.

Concrete behavior:
- When a file is added to context (absolute path or MCP-sourced), register a watch on it immediately.
- When a file is removed from context, deregister the watch.
- Any `change` / `rename` event on a context-linked out-of-tree file triggers the same sidebar UI update that in-tree files already receive.

**Describe alternatives you've considered**

Symlinking external files into the project tree — works but is a manual, per-file operation that doesn't scale across multi-repo or cross-directory workflows 

> *[Truncado — 2184 chars totais]*

---

## #23677 — [FEATURE]:support comments on model replies in sessions

📅 `2026-04-21` | ✏️ **Kayphoon** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23677](https://github.com/anomalyco/opencode/issues/23677)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When reviewing a model reply in a session, there is currently no good way to attach feedback directly to that reply.

If part of the response is wrong, unclear, or worth following up on, the only workaround is to rewrite that context manually in the next prompt. That works for small cases, but it breaks down quickly when there are multiple points to call out or when the feedback needs to stay anchored to a specific reply.

I’d like TeamCode to support comments on model replies in a session.

The idea is simple:

- allow a user to add a comment to a model reply
- allow multiple comments to be collected in the same session
- carry those comments into the next prompt as structured context when continuing the conversation

This would make session review much more natural. Instead of retyping feedback in free-form text, the user could leave precise comments on the relevant reply and keep that context attached to the conversation.

Current workarounds are not great:

- manually quote or rewrite the model output in the next prompt
- keep separate notes outside the session
- merge multiple pieces of feedback by hand before sending the next message

All of these lose structure and make follow-up less precise.

<img width="323" height="147" alt="Image" src="https://github.com/user-attachments/assets/81456ddf-

> *[Truncado — 1796 chars totais]*

---

## #23655 — [FEATURE]: add Responses API support for Go service

📅 `2026-04-21` | ✏️ **xiaoyingv** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23655](https://github.com/anomalyco/opencode/issues/23655)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Feature Request

**Is your feature request related to a problem? Please describe.**

The TeamCode Go service currently only supports the `/v1/chat/completions` endpoint (OpenAI Chat Completions API format).

However, the OpenAI Responses API is becoming the new standard for agentic workflows. Some tools (such as Claude Code adapters and other agent frameworks) expect the Responses API format rather than the Chat Completions format.

Currently, if I want to use the Go service with a tool that expects Responses API, I cannot.

**Describe the solution you'd like**

Add `/v1/responses` endpoint support for the Go service (`https://teamcode.ai/zen/go/v1/responses`).

**Why this is feasible**

The Zen service already supports the Responses API endpoint: `/zen/v1/responses`

This means the routing logic and handler implementation already exist in the codebase. The Go service likely just needs the same route added.

**Describe alternatives you've considered**

- Using Chat Completions endpoint with a translation layer – not ideal, adds latency and complexity
- Switching to Zen service – but that uses different models (GPT series) and is more expensive

**Additional context**

- Zen service Responses endpoint: `https://teamcode.ai/zen/v1/responses`
- Models affected: GLM-5.1, GLM-5, Kimi K2.5, MiniMax M2

> *[Truncado — 1825 chars totais]*

---

## #23628 — [FEATURE]: Square Root Boundary for Context Compression Loss Detection and Task Redundancy Evaluation

📅 `2026-04-21` | ✏️ **D7x7z49** | 💬 15 | 🔗 [https://github.com/anomalyco/opencode/issues/23628](https://github.com/anomalyco/opencode/issues/23628)


## Feature Description

This feature adds two simple numeric indicators to help monitor context window health during agent execution.

### 1. Compression Loss Indicator

Given a context window with N tokens and a compressed representation with k tokens:

- Compute `loss_boundary = sqrt(N)`
- If `k <= loss_boundary`, the compression has **necessary information loss**.

The agent can use this flag to:
- Avoid using over-compressed summaries when precision matters.
- Trigger a request for more context or a less aggressive compression ratio.

### 2. Task Redundancy Indicator

Given a task solved using a core answer of k_task tokens and a total context consumption of N_context tokens:

- Compute `redundancy_boundary = k_task^2`
- If `N_context > redundancy_boundary`, the conversation contains **necessary redundancy**.

The agent can use this flag to:
- Detect when a conversation is looping or drifting.
- Trigger early summarization or convergence prompts.

## Why This Is Useful

These indicators do not guarantee perfect compression or optimal efficiency. Instead, they provide **hard lower bounds** for when things are definitely bad. This gives agents a lightweight, content-agnostic signal to adjust their context management strategy in real time.

## Implementation Note

This feature only requires basic arithmetic on token counts. No model inference or semantic analysis is needed.

---

## #23625 — [FEATURE]: Add teamcode-moshi-live to ecosystem

📅 `2026-04-21` | ✏️ **young5lee** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23625](https://github.com/anomalyco/opencode/issues/23625)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Request to add [teamcode-moshi-live](https://github.com/young5lee/teamcode-moshi-live) to the ecosystem page.

teamcode-moshi-live is a community plugin for Moshi Live Activity and notification updates. It forwards TeamCode session events such as tool activity, permission prompts, reply-needed states, and task completion to Moshi so users can monitor and unblock sessions from the iPhone app.

Adding it to the ecosystem page would make the integration easier for TeamCode users to discover.

---

## #23620 — [FEATURE]: multi-account OpenAI support — account pool, /account commands, interactive picker

📅 `2026-04-21` | ✏️ **lNimien** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23620](https://github.com/anomalyco/opencode/issues/23620)


### Feature hasn't been suggested before.

- [ ] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Context

I'm aware of previous requests for this feature (#8591, #9068, #11830) 
but none received maintainer feedback. I'm opening this one because 
I have a **working implementation** ready.

## Problem

Currently, `/connect` overwrites the previous OpenAI account every time it's used. 
There is no way to have multiple ChatGPT accounts connected simultaneously. 
This is a significant limitation for users who manage several accounts and want to 
distribute usage across them without manually reconnecting every time.

## Scope

This implementation is **OpenAI-only** — specifically for users running 
ChatGPT Plus with Codex quota. No generic multi-provider abstraction, 
no over-engineering. Just the problem I actually had.

## Proposed Solution

We implemented a multi-account pool for OpenAI in a fork. The approach is minimal, 
backwards compatible, and OpenAI-specific (no over-engineered generic abstraction).

## What We Built

- **`/connect` now accumulates accounts** instead of overwriting — each new login adds 
  a new entry to the pool
- **`/account list`** — shows all connected accounts with email and status (enabled/disabled/active)
- **`/account use`** — interactive picker with arrow keys + Enter to switch active account
- **`/account disable`** — interactive picker to disable an account fr

> *[Truncado — 2713 chars totais]*

---

## #23587 — [FEATURE]: search bars for open projects + more descriptive text in the box (in teamcode desktop)

📅 `2026-04-20` | ✏️ **matheuspfernandesdev** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23587](https://github.com/anomalyco/opencode/issues/23587)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

i think it would be good to have a search bar and for all the opened projects and a more descriptive text (other than just a letter)

Im now up to 20+ folders/projects in teamcode, and it starting to look a little confusing 

<img width="82" height="1008" alt="Image" src="https://github.com/user-attachments/assets/ae34ecbd-271b-440c-b3f5-3b4ce023a864" />

---

## #23578 — [FEATURE]: Add /loop command for automated iterative task execution

📅 `2026-04-20` | ✏️ **vipuljaverioutreach** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23578](https://github.com/anomalyco/opencode/issues/23578)


Add a built-in `/loop` command to TeamCode for automated iterative task execution.

The goal is to support a workflow similar to Claude Code's `/loop`, where the agent can continue working on a task across repeated iterations without the user having to manually re-prompt each time.

Requested behavior:

- `/loop <prompt>`
  - Starts a self-paced loop for the current session
  - Runs one iteration immediately
  - If the model indicates more work is needed, it continues automatically
  - Stops when the task is complete, blocked, or the user stops it

- `/loop <interval> <prompt>`
  - Example: `/loop 5m check whether the deploy finished`
  - Runs one iteration immediately, then repeats on the requested interval

- `/loop stop`
  - Stops the active loop for the current session

- `/proactive`
  - Optional alias for `/loop`

- If `/loop` is run without a prompt:
  - Use a project-level default prompt from `.claude/loop.md` if present
  - Otherwise fall back to a built-in default maintenance prompt

Expected benefits:

- Makes long-running and check-back-later workflows much easier
- Improves support for proactive/autonomous agent usage
- Reduces repeated manual prompting for monitoring, validation, and follow-up tasks
- Brings TeamCode closer to expected behavior from other coding agents that already support loop-style execution

Suggested implementation constraints:

- Keep it server-backed so it works consistently across app/TUI
- Reuse the existing session/command runtime inste

> *[Truncado — 2124 chars totais]*

---

## #23551 — Massive token usage + counts don't add up?

📅 `2026-04-20` | ✏️ **agardnerIT** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23551](https://github.com/anomalyco/opencode/issues/23551)


### Question

Hi all. I'm seeing some behaviour that I'm struggling to explain. When I run the example command from [here](https://teamcode.ai/docs/cli/): `teamcode run "Explain how closures work in JavaScript"`

The UI seems to suggest that took over 20,000 input tokens!? But then I click the UI and it shows 10k - so they don't add up?

Where are all of those tokens coming from and how do I lower it?

<img width="947" height="130" alt="Image" src="https://github.com/user-attachments/assets/5633e17d-80c7-48f5-a803-b62e8a2454a1" />

# Logs

`~/.local/share/teamcode/logs/....log`

```
INFO  2026-04-20T12:52:15 +351ms service=server-proxy version=1.14.19 args=["run","Explain how closures work in JavaScript"] process_role=main run_id=002e5d19-3523-4a12-b9af-75a2b912ae86 teamcode
ERROR 2026-04-20T12:52:20 +5218ms service=llm providerID=teamcode-go modelID=qwen3.5-plus session.id=ses_2550d25e1ffeOMMcu8o5Ce2Ufv small=false agent=build mode=primary error={"error":{"name":"AI_APICallError","url":"https://teamcode.ai/zen/go/v1/chat/completions","requestBodyValues":{"model":"qwen3.5-plus","max_tokens":32000,"temperature":0.55,"top_p":1,"messages":[{"role":"system","content":[{"type":"text","text":"You are teamcode, an interactive CLI tool that helps users with software engineering tasks. Use the instructions below and the tools available to you to assist the user.\n\nIMPORTANT: You must NEVER generate or guess URLs for the user unless you are confident that the URLs are for helping the 

> *[Truncado — 3421 chars totais]*

---

## #23549 — [FEATURE]: Show a green indicator on project icons when a session is active

📅 `2026-04-20` | ✏️ **furkancak1r** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/23549](https://github.com/anomalyco/opencode/issues/23549)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I would like a visual status indicator for the project icons in the top-left area.

When a project currently has an active session running, its icon should display a small green light or glow. This would make it much easier to understand at a glance which project is currently active without having to open each one.

Suggested behavior:
- Show a green indicator on the project icon when there is an active session
- Remove the indicator when the session ends
- Keep the indicator subtle but clearly visible

Why this would help:
- Faster visual recognition of active projects
- Better session awareness when working with multiple projects
- Less confusion when switching between projects

This would be a small UI improvement, but very useful for usability and workflow.

---

## #23548 — Feature request: show the current mode by default instead of only on hover

📅 `2026-04-20` | ✏️ **furkancak1r** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23548](https://github.com/anomalyco/opencode/issues/23548)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

In a session, it is not clearly visible whether the chat is currently in Build Mode or Plan Mode.

Right now, I can only see that information when I move the mouse over the chat, and the mode text appears below as a hover state. This creates unnecessary friction because I have to hover over the chat every time just to understand the current mode.

Please make the current mode label visible by default, without requiring hover.

Suggested behavior:
- Always show whether the session is in Build Mode or Plan Mode
- Update the label immediately when the mode changes
- Keep it visible in the session UI at all times
- Hover can still remain for extra details if needed, but the mode itself should not depend on hover

Why this would help:
- Faster understanding of the current session state
- Less UI friction
- Easier switching between sessions
- Lower chance of using the wrong mode by mistake

This would be a small UI change, but it would significantly improve usability.

---

## #23544 — [FEATURE]: Add teamcode-usage-tracker to ecosystem

📅 `2026-04-20` | ✏️ **Dylan-Liew** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23544](https://github.com/anomalyco/opencode/issues/23544)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Describe the enhancement you want to request

**Request to add [teamcode-usage-tracker](https://github.com/Dylan-Liew/teamcode) to the ecosystem page.**

Currently, the ecosystem page doesn't list teamcode-usage-tracker, making it harder for users to discover this community plugin.

teamcode-usage-tracker is a lightweight analytics plugin for TeamCode:
- **Plugin** (`teamcode-usage-tracker`): tracks and summarizes usage metrics during coding sessions
- Provides insights such as command frequency, session duration, and interaction patterns

Users install it by:
1. Adding `"teamcode-usage-tracker@latest"` to the `plugin` array in `teamcode.json`

Adding it to the ecosystem page would help users discover this practical and insightful community extension.

---

## #23539 — [FEATURE]: Plugin API for custom status bar widgets

📅 `2026-04-20` | ✏️ **excess122** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23539](https://github.com/anomalyco/opencode/issues/23539)


﻿## Feature Request

### Verification
- [x] I have searched existing issues and confirmed this feature hasn't been suggested before

> **Note:** Similar requests exist (#8619 	ui.statusLine hook, #18969 	ui.footer hook). This issue consolidates and extends those ideas with a concrete proposed API for status bar widgets.

### Summary
Allow plugins to register custom widgets in the TUI status bar area, enabling use cases like terminal pets, pomodoro timers, build status indicators, etc.

### Motivation
TeamCode's plugin system is powerful for backend logic (event hooks, custom tools, env injection), but there is currently **no way for plugins to render custom UI elements** in the TUI.

A common use case is displaying persistent status information — for example:
- A terminal pet that reacts to coding activity
- Build/test status indicators
- Pomodoro/focus timers
- Custom metrics (lines written, commits today, etc.)

### Proposed API

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  return {
    "tui.statusbar.widget": {
      id: "my-widget",
      position: "right",
      render: () => "pet Lv.5 | streak: 7d",
      interval: 5000,
    },
  }
}
```

### Alternatives Considered
- Running a separate terminal program in a split pane (works but feels disconnected)
- Modifying TeamCode source directly (not maintainable)

### Additional Context
The Bubble Tea framework (used by TeamCode's TUI) supports composable models, so this could potentially be implemented as a 

> *[Truncado — 1669 chars totais]*

---

## #23531 — [FEATURE]: Make doom_loop repeat threshold configurable

📅 `2026-04-20` | ✏️ **jjangga0214** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23531](https://github.com/anomalyco/opencode/issues/23531)


## Feature hasn't been suggested before
- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request
`permission.doom_loop` is useful, but the current behavior appears to be hard-coded to trigger when the same tool call repeats 3 times with identical input. It would be helpful to make that repeat threshold configurable in `teamcode.json` instead of fixed.

A configurable threshold would let users tune the guard for different workflows:
- lower values for tighter cost/safety control in autonomous runs
- higher values for iterative/debugging workflows where a few repeated retries are expected

A good direction would be to let `permission.doom_loop` accept staged thresholds directly:
```json
{
  "$schema": "https://teamcode.ai/config.json",
  "permission": {
    "doom_loop": {
      "4": "ask",
      "6": "deny"
    }
  }
}
```

That would allow progressive escalation instead of one fixed cutoff:
- 4+ repeated identical tool calls => `ask`
- 6+ repeated identical tool calls => `deny`

This feels more flexible than adding a separate top-level threshold field, because it keeps the behavior inside the existing permission system and supports multi-stage escalation naturally.

The exact config shape is up to you, but exposing the threshold this way would make the existing doom-loop protection much more practical.

---

## #23508 — [FEATURE]: provide full image path in the error message when model does not support read image.

📅 `2026-04-20` | ✏️ **towry** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23508](https://github.com/anomalyco/opencode/issues/23508)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I have a mcp that can understand the image, but now, model can not use it, because the teamcode does not provide the full image path.

<img width="924" height="449" alt="Image" src="https://github.com/user-attachments/assets/1b93c147-5147-4fa6-bd1e-f75c03e49973" />

Note: the image is in the user's screenshot folder, not in the repo.

---

## #23506 — [FEATURE]: Add MCP client support for skipping certificate validation

📅 `2026-04-20` | ✏️ **wdec** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23506](https://github.com/anomalyco/opencode/issues/23506)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add an optional TLS verification override to the MCP client, allowing it to skip server certificate validation for development and trusted local environments with self-signed certificates. This would align the MCP client with standard behavior available in many TLS-capable tools and clients, including curl, where certificate verification can be explicitly disabled when needed and avoid the (messy) workaround of installing special user certs, or disabling TLS validation for all clients.

Proposed teamcode.json config option schema:
```
{                                                                                                                                                               
       "mcp": {                                                                                                              
         "my-server": {                                                                                                                                    
           "type": "remote",                                                                                                                                         
           "url": "https://my-server.local/mcp",                                                                                                      
           "insecur

> *[Truncado — 1928 chars totais]*

---

## #23503 — [FEATURE]: add session.turn.completed bus event for plugin hooks

📅 `2026-04-20` | ✏️ **xbjpku** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23503](https://github.com/anomalyco/opencode/issues/23503)


- [x] I have searched the existing issues and confirmed this feature hasn't been implemented yet.

## Related issues

- #21075 proposes expanding plugin hooks broadly — this PR implements one specific hook from that vision.
- #16626 proposes `session.stopping` for re-entering the agent loop — complementary but different: `turn.completed` fires *after* the turn ends (for post-turn plugins), while `session.stopping` fires *before* the turn ends (for loop re-entry).

## Summary

Add a `session.turn.completed` bus event that fires at the end of each assistant turn (after all tool calls finish, before compaction). This is a **+9 line change** across two files.

## Motivation

I'm building [ScarletWitch](https://github.com/xbjpku/ScarletWitch), a Linux seccomp-based filesystem sandbox for AI coding agents. It intercepts all filesystem writes at the kernel level and redirects them to a copy-on-write (COW) layer, allowing users to review and selectively commit changes after each turn — without re-executing the agent.

The key integration point is: **after a turn completes, query the COW state and show a review dialog**. This requires knowing exactly when a turn ends.

### Why this hook is necessary

teamcode's existing plugin hooks don't cover this timing:

| Hook | Why it's not sufficient |
|------|------------------------|
| `tool.execute.after` | Fires after **each** tool call, not after the entire turn. Showing a review dialog mid-turn would interrupt the LLM. |
| `event` (generi

> *[Truncado — 3001 chars totais]*

---

## #23492 — [FEATURE]: TUI: Show project path in status when sidebar is closed

📅 `2026-04-20` | ✏️ **malventano** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23492](https://github.com/anomalyco/opencode/issues/23492)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Closing the TUI sidebar means the user can no longer reference the project folder they are working in. Recommend showing it in the status bar (to the left of context) whenever the sidebar is closed.

*edit* for consistency it might make sense for it to be there full time. it can then be removed from the sidebar.

---

## #23487 — [FEATURE]: clarify GitHub action token configuration in docs

📅 `2026-04-20` | ✏️ **jjangga0214** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23487](https://github.com/anomalyco/opencode/issues/23487)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

The GitHub docs currently describe a `token` option and show `# github_token: xxxx` in the workflow example, but the current GitHub Action input is `use_github_token` and the token itself is read from the `GITHUB_TOKEN` environment variable.

Please update the docs to match the current action interface so the authentication setup is unambiguous.

---

## #23486 — [FEATURE]: consolidate duplicated GitHub integration logic behind a single runtime path

📅 `2026-04-20` | ✏️ **jjangga0214** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23486](https://github.com/anomalyco/opencode/issues/23486)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

The GitHub integration currently appears to keep similar orchestration logic in more than one place, especially `github/index.ts` and `packages/teamcode/src/cli/cmd/github.ts`.

Both paths handle similar responsibilities such as event parsing, prompt extraction, attachment handling, issue/PR context collection, session execution, and branch/PR orchestration. This increases the chance of behavior drift and makes GitHub-related fixes harder to apply confidently.

Please consolidate the GitHub integration behind a single runtime path, or at least move the shared logic into common helpers with one clear primary implementation. The main benefit would be lower maintenance cost and more consistent behavior across GitHub entry points.

---

## #23485 — [FEATURE]: improve GitHub action observability for session flow and outcomes

📅 `2026-04-20` | ✏️ **jjangga0214** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23485](https://github.com/anomalyco/opencode/issues/23485)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

The GitHub integration currently exposes the final comment, the run logs, and some tool output, but it does not clearly show the orchestration decisions that led to the result. This makes GitHub runs harder to debug than TUI sessions.

Please expose clearer GitHub-action-visible execution metadata for a run, especially:
- selected flow: issue, PR, fork PR, schedule, workflow_dispatch
- prompt source: trigger comment, default review prompt, custom PROMPT input
- branch outcome: checked out branch, branch switched during run, dirty/uncommitted/head-changed result
- response path: normal assistant text vs fallback summary
- PR outcome: created, skipped, or reused existing PR, with the reason
- tool execution timing: at least start/end or duration for tool calls

This would make GitHub runs much easier to understand and debug for both users and maintainers without having to infer behavior from partial logs.

---

## #23480 — Feature: Support MCP Prompt content injection as system message (hidden from user)

📅 `2026-04-20` | ✏️ **K77-dev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23480](https://github.com/anomalyco/opencode/issues/23480)


## Problem

When an MCP server delivers content via the **Prompts** primitive (e.g., user invokes `/my-server:my-prompt`), TeamCode displays the prompt content directly in the conversation UI as a visible user message. The LLM then echoes/repeats the full content before acting on it.

This breaks the use case of **proprietary/confidential prompt delivery**, where MCP servers need to send instructions to the LLM without exposing the raw content to the end user.

### Expected behavior

MCP Prompt content should be injected as **system-level context** (invisible to the user in the TUI), similar to how system messages work. The user should only see the LLM's response/actions — not the raw prompt instructions.

### Current behavior

1. User invokes `/my-server:my-prompt`
2. TeamCode fetches prompt content from MCP server
3. **Content is displayed verbatim in the conversation UI** as a user message
4. LLM echoes/repeats the instructions before executing them
5. Proprietary content is fully visible to the user

### Why this matters

MCP servers that deliver proprietary skills/instructions (e.g., enterprise toolkits, paid skill libraries) rely on the content being consumed by the LLM without being displayed to the user. The MCP spec distinguishes Prompts from Tools precisely because Prompts are meant to be **templates that guide LLM behavior**, not user-visible content.

## Proposed solution

One or more of the following:

1. **Inject MCP Prompt content as a system message** — conten

> *[Truncado — 2464 chars totais]*

---

## #23478 — [FEATURE]: clarify ctrl+c vs /exit behavior in the TUI docs

📅 `2026-04-20` | ✏️ **jjangga0214** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23478](https://github.com/anomalyco/opencode/issues/23478)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request
Please clarify the difference between `ctrl+c`, `/exit`, and `Esc` in the TUI docs.

Right now the docs show that `ctrl+c` is part of `app_exit` and `Esc` is `session_interrupt`, but they do not explain the practical difference between exiting TeamCode and interrupting the current in-progress work.

In practice this is confusing because reconnecting after `ctrl+c` can still show the current session running, while `/exit` ends that session instead. A short note in `tui.mdx` and `keybinds.mdx` would make this behavior much clearer.

---

## #23474 — [FEATURE]: expose execution metadata for tool/subagent runs to the agent

📅 `2026-04-20` | ✏️ **jjangga0214** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23474](https://github.com/anomalyco/opencode/issues/23474)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request
Please expose minimal execution metadata for tool calls and subagent/task runs to the active agent.

Right now TeamCode clearly has session/message/event data, but the agent still cannot reliably answer questions like:
- did the task stop in the middle?
- is it still running or just slow?
- when was the last successful activity?
- did it fail, timeout, or get cancelled?

A small structured timeline would be enough. For example:
- `id`
- `kind` (`tool_call` or `subagent_run`)
- `name`
- `status`
- `started_at`
- `ended_at`
- `duration_ms`
- `last_activity_at`
- `parent_id`
- `error_summary`

The main gap is agent visibility, not just UI.

A UI timeline would help humans, but agent-visible metadata would let the agent:
- distinguish slow vs stuck
- decide whether to retry or wait
- explain interruptions precisely
- summarize partial runs without guessing

Related issues seem narrower or UI-specific:
- #14592 is about ACP `tool_call_update` metadata during `in_progress`
- #22348 is about missing `metadata.sessionId` after interruption
- #20168 is about real-time trace visualization

This request is broader: expose a minimal execution timeline/metadata surface that the agent itself can inspect across tool calls and subagent runs.

---

## #23467 — [FEATURE]: Client-side file reference resolution for MCP tool arguments

📅 `2026-04-20` | ✏️ **hchangjae** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23467](https://github.com/anomalyco/opencode/issues/23467)


- [x] I have verified this feature I'm about to request hasn't been suggested before

## Problem

When an AI agent calls an MCP tool with a large payload (e.g., updating a Confluence page with 300KB+ ADF JSON), the agent **must emit the entire payload as output tokens**. This hits the model's `max_output_tokens` limit, causing:

1. **Truncated tool calls** — the JSON argument gets cut mid-stream (related: #21688)
2. **Multi-turn workarounds** — agent writes chunks across multiple turns, wasting context and time
3. **Silent failures** — truncated arguments parse as invalid, tool call fails

**Quantified impact:**
- A single Confluence page update: ~160K tokens as tool argument
- Anthropic Claude: 32K max output tokens (Sonnet), 64K (Opus)
- **Result**: Any MCP tool call with >32K token payload is physically impossible in a single turn

This is the **output-side counterpart** to the input bloat that `experimental.mcp_lazy` (#8771) solved. Lazy-load reduced system prompt tokens; this proposal reduces output tokens.

## Proposed Solution

Allow the agent to reference a local file instead of inlining the full payload. The **client resolves the reference** before sending to the MCP server.

### Agent outputs (~50 bytes instead of 160K tokens):

```json
{
  "tool": "confluence_update_page",
  "arguments": {
    "page_id": "123456",
    "content": { "$file": "/tmp/adf-payload.json" }
  }
}
```

### Client intercepts and resolves:

```typescript
function resolveFileRefs(args: Record<s

> *[Truncado — 3191 chars totais]*

---

## #23455 — [FEATURE] Headless/batch mode for automated benchmarks and CI

📅 `2026-04-19` | ✏️ **jerrythomas** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23455](https://github.com/anomalyco/opencode/issues/23455)


## Summary

No way to programmatically start a session with a predefined prompt, let it execute, and capture structured results. This blocks automated benchmarks, regression tests, and A/B comparisons.

## Proposed

```bash
teamcode --headless \
  --prompt "Fix the null pointer exception in src/parser.rs" \
  --max-turns 20 \
  --output-json result.json
```

Output: structured JSON with outcome, turns, tokens, files_modified, tools_used.

## Use case

- Benchmark: "Does adding MCP tools improve quality?" — run same tasks with/without, compare
- CI: "Run these tasks, fail if quality drops below threshold"
- Research: reproducible evaluation of AI coding assistants

---

## #23449 — [FEATURE]: Agent should use integrated terminal (PTY) instead of spawning new shell processes

📅 `2026-04-19` | ✏️ **herjarsa** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/23449](https://github.com/anomalyco/opencode/issues/23449)


### Pre-flight Checks
- [x] I have verified this feature hasn't been suggested before
- [x] I understand this issue needs status:approved before a PR can be opened

### Problem Description

TeamCode has a built-in terminal panel powered by ghostty-web with full PTY support. The terminal panel is accessible via `Ctrl+`` and supports:
- Multiple tabs
- 10,000 lines of scrollback
- Themes (light/dark)
- WebSocket bridge to `/pty/{id}/connect`

However, when the agent executes shell commands, it uses the `bash` tool which **spawns a completely new shell process** each time. This creates several problems:

1. **No interactive command support** - Commands like `htop`, `vim`, `ssh`, `mysql` that require a TTY can't run
2. **State not shared** - Environment variables, working directory changes, and shell state don't persist between commands
3. **Timeout issues** - Interactive commands often get killed after the timeout
4. **Waste of resources** - New process spawned for every command instead of reusing the PTY

### Proposed Solution

Expose the integrated terminal (PTY) to the agent as a tool, so instead of:

```
Agent -> bash tool -> spawns new process -> returns output
```

It would be:

```
Agent -> terminal tool -> connects to existing PTY via WebSocket -> streams I/O
```

This would enable:
- **Truly interactive commands** - `ssh`, `vim`, `htop`, interactive CLIs
- **Persistent shell state** - Same session, same environment
- **Better UX** - User can see what commands the agent 

> *[Truncado — 2213 chars totais]*

---

## #23440 — `chat.message` plugin hook: `SyncEvent.run: "sessionID" required but not found` when pushing to `output.parts`

📅 `2026-04-19` | ✏️ **pekg-ai** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23440](https://github.com/anomalyco/opencode/issues/23440)


TeamCode version: 1.14.18

Plugins that push a text part to `output.parts` from inside a `chat.message` hook intermittently crash with:

```
error: SyncEvent.run: "sessionID" required but not found: {"part":{"type":"text","text":"..."},"time":<epoch>}
    at wl (/$bunfs/root/chunk-ng0j12f1.js:491:37371)
    at ~effect/Effect/evaluate (/$bunfs/root/chunk-3p3b82m7.js:25:4492)
    at runLoop (/$bunfs/root/chunk-3p3b82m7.js:25:2045)
```

**Repro shape** (simplified):

```ts
"chat.message": async (_input, output) => {
  const ctx = await fetch("https://example/api");  // ~1–3s network call
  output.parts.push({ type: "text", text: await ctx.text() });
}
```

Synchronous pushes appear fine; pushes after an `await` (network fetch here) race a closed session scope and `SyncEvent.run` fails because the emitted part has no `sessionID`.

**Related:**
- code-yeongyu/oh-my-openagent#885 — same hook + `output.parts` path silently fails to render on 1.0.150+. Different symptom (silent) vs. this one (hard crash), same fragile contract.
- #17637 — feature request to expose user message in `experimental.chat.system.transform`, which would let plugins skip `chat.message` entirely for per-turn injection.
- #6142 — related sessionID-propagation ask.

**Questions:**
1. Is pushing to `output.parts` in `chat.message` a supported API? (It's absent from the official plugin docs.)
2. If yes, should OC capture `sessionID` at hook-dispatch and attach it to pushed parts so they survive async resumption?
3

> *[Truncado — 1720 chars totais]*

---

## #23435 — [FEATURE]: Smart auto-upgrade based on installation method

📅 `2026-04-19` | ✏️ **playeriv65** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23435](https://github.com/anomalyco/opencode/issues/23435)


## Describe the enhancement you want to request

### Problem

When TeamCode is installed via **local npm install** (e.g., `npm install teamcode-ai` without `-g` flag, common on shared servers where users lack sudo access), the auto-upgrade mechanism fails:

1. TUI shows upgrade prompt: "A new version is available"
2. User clicks "Update" button
3. Upgrade fails with permission error (tries to write to `/usr/local/lib`)
4. No fallback or guidance for local install scenarios

### Current Behavior

The `teamcode upgrade` command assumes global installation:
- Attempts `npm install -g` → requires sudo
- Or attempts curl download to `/usr/local/bin` → requires sudo
- Fails silently without detecting local install context

### Proposed Enhancement

**Smart upgrade detection**: Automatically detect the installation method and use the appropriate upgrade strategy:

| Install Method | Upgrade Strategy |
|----------------|------------------|
| `npm install teamcode-ai` (local in `node_modules`) | `npm install teamcode-ai@latest` in install directory |
| `npm install -g teamcode-ai` | `npm install -g teamcode-ai@latest` |
| curl script (`/usr/local/bin`) | curl script reinstall |
| Homebrew | `brew upgrade teamcode` |

### Implementation Suggestions

1. Detect install location by checking:
   - `process.execPath` or `__dirname` of the running binary
   - If path contains `node_modules/teamcode-ai`, it's a local npm install

2. For local npm installs, run:
   ```bash
   cd <install-dir>/

> *[Truncado — 2022 chars totais]*

---

## #23433 — [FEATURE]:Can you add a one-click navigation for each round of messages? Scrolling through the messages is too difficult.

📅 `2026-04-19` | ✏️ **zhushen12580** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23433](https://github.com/anomalyco/opencode/issues/23433)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

You can refer to the implementation on the DeepSeek web page.
<img width="500" height="809" alt="Image" src="https://github.com/user-attachments/assets/6c45aa95-2ae6-4bcf-b77b-9b4d66ea90c5" />

---

## #23428 — [FEATURE]: Ultra Mode — autonomous full-cycle agent with hardcoded state machine

📅 `2026-04-19` | ✏️ **GoDiao** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23428](https://github.com/anomalyco/opencode/issues/23428)


## Verification

- [x] I have searched existing issues and confirmed this feature has not been suggested before

**Related but distinct issues:**
- #19999 (Ephemeral Sub-Agent Teams) — focuses on parallel multi-agent orchestration with cleanup
- #20849 (Plugin-based orchestration) — focuses on plugin-level agent coordination
- #18001 (/loop command) — focuses on iterative task execution loop
- #12661 (Agent Teams) — broader multi-agent coordination discussion

Ultra Mode differs from these by providing a **single-agent state machine** with hardcoded phase transitions and tool-level enforcement, rather than multi-agent orchestration or plugin systems.

## Problem

Currently, going from a requirement to a verified implementation requires manual coordination: switch to plan agent, write a plan, switch to build agent, implement, run tests, fix failures, repeat. This is tedious when you just want to "fire and forget" a well-defined task.

## Proposal

Add a new primary agent called **ultra** that autonomously executes the full plan→build→verify→iterate loop with a **hardcoded state machine** that enforces correct phase transitions.

### State Machine

```
planning → building → verifying → complete
                         ↓ (test fail, retries < 10)
                     iterating → verifying
                         ↓ (retries ≥ 10)
                     stop, ask user
```

Each phase restricts which tools are available:

| Phase | Allowed | Blocked |
|-------|---------|---------|


> *[Truncado — 3888 chars totais]*

---

## #23401 — [FEATURE]: Add teamcode-clippy to ecosystem page

📅 `2026-04-19` | ✏️ **huangcheng** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23401](https://github.com/anomalyco/opencode/issues/23401)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Request to add [teamcode-clippy](https://github.com/huangcheng/teamcode-clippy) to the ecosystem page.**

Currently, the ecosystem page doesn't list teamcode-clippy, making it harder for users to discover this community plugin.

teamcode-clippy is a Clippy-style assistant plugin for TeamCode:
- **Plugin** (`teamcode-clippy` on npm): displays helpful coding tips during sessions via idle detection
- **Desktop companion**: Electron-based floating Clippy character (installed separately from GitHub Releases)

Users install it by:
1. Downloading the desktop app from [GitHub Releases](https://github.com/huangcheng/teamcode-clippy/releases/latest)
2. Adding `"teamcode-clippy@latest"` to the `plugin` array in `teamcode.json`

Adding it to the ecosystem page would help users discover this fun and useful community extension.

---

## #23400 — [FEATURE]: todowrite tool should support granular add/update/remove operations

📅 `2026-04-19` | ✏️ **21pounder** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23400](https://github.com/anomalyco/opencode/issues/23400)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## 🎯 Problem

Current `todowrite` tool **only supports full list replacement**, requiring agents to pass the **complete todos array** every time.

**Pain Points:**
- **Verbose**: Re-send entire list just to update one item's status
- **Race Conditions**: Concurrent operations silently overwrite each other  
- **Error-Prone**: Agents might accidentally drop existing todos by omission

```ts
// Current: Must always send FULL list
todowrite({ todos: [/* entire array, every time */] })
```

## 💡 Proposed Solution

**Replace full-replace with granular operations**:

### Option A: Single Tool with Action Parameter (Recommended)
```ts
// Add new todo
{ action: "add", todo: { content: "Buy milk", status: "pending" } }

// Update existing todo  
{ action: "update", id: "abc123", status: "completed" }

// Remove todo
{ action: "remove", id: "abc123" }
```

### Option B: Separate Tools
todowrite_add(todo)
todowrite_update(id, updates)
todowrite_remove(id)

text

**Option A preferred**: Single tool, simpler docs, easier discovery.

## 🔍 Current Implementation

**File**: `packages/teamcode/src/tool/todo.ts`

```ts
// Always calls full replacement
execute({ todos }) {
  return todo.update(todos); // No partial update path
}
```

## ✅ Expected Behavior

```ts
// Before: Send 100 todos to update 1
todowrite({ todos

> *[Truncado — 1986 chars totais]*

---

## #23367 — [FEATURE]:The GUI can support one open-source server per project.

📅 `2026-04-19` | ✏️ **zeekling** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23367](https://github.com/anomalyco/opencode/issues/23367)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Can the GUI support one TeamCode server per project? My testing revealed that using one TeamCode server for multiple projects performs significantly worse than having one TeamCode server per project.

---

## #23364 — [FEATURE]: Native Gemini Integration, Visual API Config & Enhanced Shortcuts

📅 `2026-04-19` | ✏️ **ruchid123123** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23364](https://github.com/anomalyco/opencode/issues/23364)


## Problem / 问题描述

As a Gemini Ultra subscriber using Ubuntu, I want to configure custom API endpoints (for third-party proxies) and use Gemini's native capabilities in TeamCode. Currently, I have to manually edit JSON/TOML files via terminal, which breaks the GUI workflow.

## Proposed Solution / 建议方案

### 1. Native Gemini Integration
- First-class support for Gemini API with optimized Agent mode
- Leverage Gemini Ultra's full potential (1M context, reasoning capabilities)
- System-level features comparable to gemini-cli but with TeamCode's GUI

### 2. Visual API Configuration
- GUI for adding custom OpenAI/Anthropic-compatible endpoints
- Fields: Base URL, API Key, Model name
- No manual file editing required

### 3. Inline Editing Shortcut
- Add Ctrl+L for line/code editing (like Antigravity)
- Improve refactoring efficiency

## Context / 背景
- OS: Ubuntu Linux
- User type: Power user focused on low-latency workflows
- Current pain point: GUI layout is great, but API config forces CLI usage
- Reference: Gemini Code Assist UX, gemini-cli capabilities

## Verification
- [x] I have checked existing issues and this feature has not been requested before
- [x] Related but different from #20598 (editing existing providers) and #1597 (update workflow)

---

## #23361 — [FEATURE]: Categorized skill listing in /skills command output

📅 `2026-04-19` | ✏️ **MrHectorus** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23361](https://github.com/anomalyco/opencode/issues/23361)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement

Currently, the /skills command in TeamCode lists all available skills alphabetically. When users have many skills (e.g., 30+), it becomes difficult to find a specific skill.

**Current behavior:**
- Skills listed in flat alphabetical order (e.g., accessibility, agent-eval, api-design...)
- Users with skills prefixed by category (e.g., marketing-copywriting, seo-audit) still see them in a single flat list

**Desired behavior:**
- Add optional grouping/categorization to /skills output
- Could use a flag like /skills --grouped or /skills --by-category
- Example output:
  `
  ## Marketing
  - copywriting
  - email-sequence
  - lead-magnets
  
  ## SEO
  - seo-audit
  - keyword-research
  
  ## Testing
  - tdd-workflow
  - e2e-testing
  `

### Why this matters

- Users with many skills need better organization
- Prefix-based naming (which some users already use) helps visually, but isn't exposed in the UI
- Would improve discoverability without changing skill loading behavior
- Low implementation cost - just changes output formatting

### Additional context

This could read category from:
1. Folder name prefix (already used by some users)
2. Frontmatter in SKILL.md (e.g., category: marketing)
3. Group skills by first word before hyphen

---

## #23358 — [FEATURE]: Add /cd slash command for runtime working directory switching

📅 `2026-04-19` | ✏️ **yangelaboy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23358](https://github.com/anomalyco/opencode/issues/23358)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Related:** #2177, #15220

Add a `/cd` slash command that allows changing the working directory at runtime without restarting TeamCode. This is a common workflow need when navigating between projects or worktrees mid-conversation.

#### Proposed behavior

- `/cd <path>` — switch to the given directory (supports relative paths, absolute paths, `~` expansion)
- `/cd` without arguments — return to the initial startup directory
- Appears in slash command autocomplete list
- When switching outside the current project root, show a confirmation dialog
- Record the directory change in the session as a shell command (`cd <path>` display + `pwd` output)

#### Why this is useful

Users frequently need to navigate between related projects, monorepo packages, or git worktrees during a single session. Currently the only option is to quit and restart TeamCode in the new directory. A lightweight `/cd` command avoids losing conversation context.

#### Implementation approach

- TUI-side only: resolve path, validate directory exists, update SDK's target directory, record in session
- Minimal changes (~150 lines added across 7 files), no server-side changes needed
- A previous attempt (#7266, 3400+ lines) was closed — this approach is significantly smaller and focused

#### Environment

- **OS:** macOS (darwin-arm64)


> *[Truncado — 1523 chars totais]*

---

## #23346 — [FEATURE]: Timeline dialog should load all session messages, not just those in memory

📅 `2026-04-18` | ✏️ **sim590** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23346](https://github.com/anomalyco/opencode/issues/23346)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

The `/timeline` dialog (accessible via `Ctrl+X G` or `<leader>g`) currently reads messages from `sync.data.message`, which only contains the messages loaded in memory. For long sessions, this means older messages are absent from the timeline and cannot be jumped to.

For example, a session with 1,283 messages but only 100 loaded in memory will only show the most recent ~100 user messages in the timeline picker. The user has no way to jump to earlier messages in the conversation.

**Proposed solution:**

The timeline dialog should fetch user messages directly from the API rather than reading from the in-memory store. This could use the cursor-based pagination introduced in #8535 (`before`/`after` parameters on `GET /session/:id/message`) to load all user messages incrementally.

A possible approach:
1. The timeline dialog makes its own paginated API calls to build the full list of user messages
2. When a message is selected, the TUI loads a window of messages around the target and scrolls to it

**Dependencies:**

This builds upon the cursor-based pagination API from #8535, which provides the necessary server-side infrastructure (`before`/`after`/`oldest` cursors on the messages endpoint).

**Related:**
- #8535 — Bi-directional cursor pagination for session messages (prerequisite)
- #14928 — Jump-to-me

> *[Truncado — 1679 chars totais]*

---

## #23345 — [FEATURE]: improving the orchestration process

📅 `2026-04-18` | ✏️ **Simon-Free** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23345](https://github.com/anomalyco/opencode/issues/23345)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I spent the last week working on improvements of the agentic orchestrator, and was able to find major improvements, severely limiting (compared to Claude code 2.1.92, at the very least by a 10x magnitude) the amount of tokens consumed. I am currently working on implementing my changes in cheetahclaws, but would also be very pleased to contribute to teamcode afterwards. Here is a link to my repository, the readme covers the reasoning behind the main ideas: https://github.com/Simon-Free/bouzecode. Here is another discussion i had where some further clarifications were made: https://github.com/SafeRL-Lab/cheetahclaws/issues/43. I would be very happy to answer any other questions !

---

## #23327 — [FEATURE]:LM Studio provider should auto-detect models via /v1/models API (similar to Continue extension)

📅 `2026-04-18` | ✏️ **lobanov-coder** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23327](https://github.com/anomalyco/opencode/issues/23327)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When connecting TeamCode to LM Studio, it currently fetches a hardcoded list of models from models.dev instead of querying the local LM Studio server's /v1/models endpoint.
Other tools like the "Continue" VS Code extension handle this by using an AUTODETECT model value (or similar logic) to dynamically query available models on the provider side.
This means users have to manually update their config every time they switch or download a new model in LM Studio.
Steps to Reproduce:
1. Install and start LM Studio with Local Server enabled (default port 1234).
2. Load any model in LM Studio.
3. Connect TeamCode to the lmstudio provider via /connect.
4. Run /models inside TeamCode.
Current Behavior:
TeamCode shows a hardcoded list from models.dev (e.g., gpt-oss, qwen3) instead of the models actually loaded in LM Studio.
Expected Behavior:
TeamCode should query http://127.0.0.1:1234/v1/models and display the available local models dynamically, similar to how it works for Ollama or when using "AUTODETECT" logic.

---

## #23314 — [FEATURE]: Support event type: push

📅 `2026-04-18` | ✏️ **cogni-ai-ee** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23314](https://github.com/anomalyco/opencode/issues/23314)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently when run `teamcode github run` via `anomalyco/opencode@v1.4.3` it gives this error:

> Unsupported event type: push

I want to create few CI small tests using teamcode, but it seems it's not supported yet.

---

## #23304 — [FEATURE]: `/reload` command

📅 `2026-04-18` | ✏️ **Hrpav** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23304](https://github.com/anomalyco/opencode/issues/23304)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

So you know how sometimes you want to reload the teamcode config (like `source ~/.bashrc`) but you have to completely restart the app so you lose your progress (unless you `/share`, but that takes a lot of time). I think it would be productive to add the feature so it reloads the `~/.config/teamcode/teamcode.json` without needing to restart. Or you can like `/reload all` to reload every config, or `/reload <config name>` to reload a specific config (or just `/reload` to reload universal config). I think it could be useful.

---

## #23298 — [FEATURE]: Support Anthropic `defer_loading` passthrough in tool definitions

📅 `2026-04-18` | ✏️ **M0Rf30** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23298](https://github.com/anomalyco/opencode/issues/23298)


## Problem

Anthropic's API natively supports `defer_loading: true` on tool definitions ([docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool)). When set:

- Deferred tools are **excluded from the system-prompt prefix** (zero tokens upfront)
- Discovered tools are injected inline as `tool_reference` blocks
- **Prompt caching is preserved** — the prefix is untouched

teamcode currently has no way to pass `defer_loading: true` through to the Anthropic API, neither from config nor from the `tool.definition` plugin hook.

## Proposed solution

### Option A: Plugin hook field

Add `deferLoading?: boolean` to the `tool.definition` hook output:

```typescript
"tool.definition"?: (input: {
    toolID: string;
}, output: {
    description: string;
    parameters: any;
    deferLoading?: boolean;  // NEW — passed through to Anthropic API as defer_loading
}) => Promise<void>;
```

### Option B: Config-level setting

Allow per-tool or per-MCP-server `deferLoading` in `teamcode.jsonc` (similar to what the [fork](https://github.com/famitzsy8/teamcode-tool-search-tool) implements):

```jsonc
{
  "mcp": {
    "some-server": {
      "command": "...",
      "deferLoading": true  // all tools from this server are deferred
    }
  },
  "toolSearch": {
    "alwaysLoad": ["read", "write", "edit", "bash"]
  }
}
```

### Option C: Both (recommended)

Config sets defaults, hook allows plugin overrides.

## Why this is better than client-side filtering

- **Prompt cach

> *[Truncado — 2367 chars totais]*

---

## #23297 — [FEATURE]: Add `hidden` field to `tool.definition` hook output for tool suppression

📅 `2026-04-18` | ✏️ **M0Rf30** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23297](https://github.com/anomalyco/opencode/issues/23297)


## Problem

The `tool.definition` hook allows plugins to modify tool descriptions and parameters, but cannot remove tools from the LLM's tool list entirely. This means deferred/lazy tool loading plugins (like [teamcode-tool-search](https://github.com/M0Rf30/teamcode-tool-search)) must still send stub entries for every deferred tool, wasting ~10-20 tokens per tool per turn.

With 180+ tools, that's ~2,000-3,600 tokens of overhead per turn that could be eliminated.

## Proposed solution

Add an optional `hidden` boolean to the `tool.definition` hook output:

```typescript
"tool.definition"?: (input: {
    toolID: string;
}, output: {
    description: string;
    parameters: any;
    hidden?: boolean;  // NEW — when true, tool is excluded from the LLM tool list
}) => Promise<void>;
```

On the Go side, the change is minimal — skip the tool when building the tool list if `output.Hidden` is true:

```go
// In resolveTools or equivalent:
if hookOutput.Hidden {
    continue
}
```

## Why this matters

- The [famitzsy8/teamcode-tool-search-tool](https://github.com/famitzsy8/teamcode-tool-search-tool) fork proves this pattern works by modifying `prompt.ts` → `resolveTools()` to filter deferred tools. This proposal brings the same capability to the plugin API.
- Anthropic's native `defer_loading: true` API already supports this pattern server-side. This hook enhancement would let plugins implement equivalent behavior client-side.
- Multiple community PRs (#8771, #12520) and issues (#86

> *[Truncado — 2258 chars totais]*

---

## #23292 — [FEATURE]: Hoping that teamcode go has a unified interface that can support the Anthropic API and the OpenAI compatible API.

📅 `2026-04-18` | ✏️ **river-walras** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23292](https://github.com/anomalyco/opencode/issues/23292)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The GLM models only support an OpenAI-compatible API. I hope for support for the Anthropic API.

---

## #23287 — [FEATURE]: Recovery agentic workflow after system wakeup

📅 `2026-04-18` | ✏️ **artyconst** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23287](https://github.com/anomalyco/opencode/issues/23287)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

TeamCode Desktop app - When running some long task on Laptop in my case Mac OS on MBP, and me as a user walk away from laptop till tasks are running, the laptop is entering in to the sleep mode which interrupt the tasks execution, but UI still showing as task is running. Only way to check as execution was stop is through monitoring the requests to llm provider, and reset task manually by Press stop button and ask agent to continue. 

It would be nice if App will be able to recovery its current workflow without manual actions.

---

## #23251 — [FEATURE]:TUI /sessions command should show all historical sessions, not just recent 30 days

📅 `2026-04-18` | ✏️ **taolide3464** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23251](https://github.com/anomalyco/opencode/issues/23251)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem
When using `/sessions` command in TUI, it only shows sessions from the last 30 days. Users cannot see or access sessions older than 30 days through the UI, even though the data still exists in storage.
This makes it impossible to:
1. Browse and find historical sessions
2. Understand what each session was about (no summary visible in UI)
3. Resume an old session without knowing the exact session ID
## Expected Behavior
1. `/sessions` should show ALL sessions by default (or have a `--all` flag)
2. Each session should show a summary/title so users can identify which one to resume
3. Users should be able to easily switch to any historical session through the UI
## Workaround (inadequate)
Currently users must:
1. Know the session ID in advance
2. Manually check file system: `~/.local/share/teamcode/storage/session/global/`
3. Start session via CLI: `teamcode --session ses_xxx`
This is a poor UX for such a fundamental feature. The data exists, users just can't access it through the UI.
## Environment
- TeamCode version: latest
- OS: Windows/macOS/Linux
---

---

## #23249 — [FEATURE]: Add session migration dialog to recover orphaned or misplaced sessions

📅 `2026-04-18` | ✏️ **sim590** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23249](https://github.com/anomalyco/opencode/issues/23249)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add a TUI dialog that allows users to migrate sessions between projects. This serves three main use cases:

1. **Recovering orphaned sessions** — When a project directory is renamed or moved (#23248, #8538), sessions become invisible because their `directory` field points to a path that no longer exists. The migration dialog shows all sessions across all projects, marks orphaned ones with a visual indicator, and allows moving them to the correct project.

2. **Intentionally migrating sessions between projects** — When work was started in the wrong project, users can move the session (with its full conversation history) to another project rather than starting over.

3. **Deleting orphaned sessions** — Since orphaned sessions don't appear in the normal `/sessions` list, there is currently no way to delete them. The migration dialog provides access to these sessions for deletion.

**Proposed solution:**

- A new "Migrate Session" dialog accessible via `ctrl+o` from the session list
- The dialog shows all sessions across all projects, grouped by project
- Orphaned sessions are marked with a `!` indicator in the gutter
- Selecting a session opens a destination picker (current project, home directory, or any known project)
- `ctrl+d` allows deleting sessions (with double-press confirmation)
- New server r

> *[Truncado — 1701 chars totais]*

---

## #23234 — [FEATURE]: Display folder reference in narrow terminal layouts

📅 `2026-04-18` | ✏️ **rafaself** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23234](https://github.com/anomalyco/opencode/issues/23234)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When the terminal width is reduced, such as when it takes up half of the screen, the right-side panel is hidden. As a result, users may lose the folder reference, especially when many terminal tabs are open.

When no thread is running, the folder reference could be displayed at the bottom-left side.

<img width="943" height="223" alt="Image" src="https://github.com/user-attachments/assets/546371f8-6f42-4024-98f9-aff841c4f607" />

---

## #23157 — [FEATURE]: Support $OPENCODE_CONFIG_DIR/themes

📅 `2026-04-17` | ✏️ **GTonehour** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23157](https://github.com/anomalyco/opencode/issues/23157)


### Feature hasn't been suggested before.
- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request
`teamcode` looks for a `themes` folder in `~/.config/teamcode/themes` (or `$XDG_CONFIG_HOME/teamcode/themes`).
I suggest `teamcode` uses `$OPENCODE_CONFIG_DIR` instead of `~/.config/teamcode`, so that custom themes reside together with the rest of the configuration files.

---

## #23153 — [FEATURE]:Pay Go with crypto

📅 `2026-04-17` | ✏️ **suse-coder** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/23153](https://github.com/anomalyco/opencode/issues/23153)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add crypto support for payment of teamcode go.

---

## #23113 — [FEATURE]: Cancel to edit

📅 `2026-04-17` | ✏️ **jcubic** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23113](https://github.com/anomalyco/opencode/issues/23113)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I've started using ClaudeCode (have a free OSS Claude Max plan). It has a nice feature.

When you type a prompt and press ESC the task is canceled, and you have the exact same prompt inside input, that you can edit.

I don't share the screenshot because if you edit the prompt, it looks like one.

This is a common pattern I do. I type a prompt and then want to correct it to add something more.

The way it works in TeamCode is that when you have multiple prompts and information that you interrupted.

<img width="1073" height="1019" alt="Image" src="https://github.com/user-attachments/assets/9c4b3601-102d-4ad1-94c7-6d37e70484e1" />

I'm not sure how hard it would be, but ClaudeCode has better UX here. It's worth stealing this behavior.

---

## #23109 — [FEATURE]: Show cached token count inline in TUI context panels

📅 `2026-04-17` | ✏️ **bainos** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23109](https://github.com/anomalyco/opencode/issues/23109)


- [x] I have verified this feature I'm about to request hasn't been suggested before.
When a provider returns cache token usage the TUI shows no indication of it. Displaying cached tokens inline (e.g. `16,570 tokens (16,534 cached)`) gives visibility into whether caching is active. Only shown when cached > 0, no visual change otherwise.
Related to #13003 (narrower scope — cached count only, no new UI elements).

---

## #23106 — [FEATURE]: Bedrock prompt caching via cache_point_ttl provider option

📅 `2026-04-17` | ✏️ **bainos** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23106](https://github.com/anomalyco/opencode/issues/23106)


- [x] I have verified this feature I'm about to request hasn't been suggested before.
Bedrock prompt caching works but there is no way to configure the cache TTL from teamcode. This adds a `cache_point_ttl` option to the Bedrock provider in `teamcode.json`, accepting `5m` or `1h`. Tested on Haiku 4.5, Sonnet 4.5/4.6, Opus 4.5/4.6.

---

## #23066 — [FEATURE]: MCP elicitation support

📅 `2026-04-17` | ✏️ **ojsef39** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23066](https://github.com/anomalyco/opencode/issues/23066)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Enable human-in-the-loop workflows for MCP tools by supporting the elicitation protocol. This allows MCP servers to request user input via forms during tool execution.

#8251
#21231
#11948
#8243 
#14968

---

## #23058 — [FEATURE]: Anthropic "advisor strategy"

📅 `2026-04-17` | ✏️ **bestouff** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23058](https://github.com/anomalyco/opencode/issues/23058)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Claude Code has this new feature:

> [Advisor strategy (public beta)](https://claude.com/blog/the-advisor-strategy): Pair Opus as an advisor with Sonnet or Haiku as an executor to bring near Opus-level intelligence to your agents while keeping costs near Sonnet.

Would it be possible to have that in TeamCode ?

---

## #23041 — [FEATURE]: Support Multiple Directory Access per Session (Persistent Permissions)

📅 `2026-04-17` | ✏️ **bhadraagada** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23041](https://github.com/anomalyco/opencode/issues/23041)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Feature Request:
Introduce an option at the start of a session that allows users to select and grant access to multiple local directories at once. These directories should remain accessible throughout the session without requiring repeated read/write permission prompts.

Key Requirements:

Allow selection of multiple directories during session initialization
Persist read/write permissions for all selected directories for the entire session
Enable seamless switching and operations across these directories without additional prompts
Provide a clear UI to review, add, or remove directories mid-session if needed

Benefits:

Reduces repetitive permission requests
Improves workflow efficiency for multi-folder projects
Creates a smoother, less disruptive development experience

Optional Enhancements:

Ability to save a set of directories as a reusable “workspace”
Granular permission control (read-only vs read/write per directory)

Use Case Example:
A developer working on a project with separate backend, frontend, and shared library folders can grant access to all relevant directories upfront and work across them seamlessly without interruptions.read or write in the folder, and without friction i can use muliple dirs at once in a session

---

## #23035 — [FEATURE]: Add config option to restrict skill discovery directories

📅 `2026-04-17` | ✏️ **rahul-sensehq** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23035](https://github.com/anomalyco/opencode/issues/23035)


## Problem

TeamCode hardcodes skill discovery across 6 directories (3 global + 3 project-level):

- `~/.config/teamcode/skills/`
- `~/.claude/skills/`
- `~/.agents/skills/`
- `.teamcode/skills/`
- `.claude/skills/`
- `.agents/skills/`

There is no way to restrict which directories are scanned. Users who share skill files across tools (e.g., Claude Code + TeamCode) via hard links end up with identical skills in 3 global directories. TeamCode correctly deduplicates them, but scanning and deduplicating ~43 files across 3 directories adds **~5 seconds** to startup time.

Reference from startup log:
```
WARN  service=skill name=frontend-design existing=~/.claude/skills/... duplicate=~/.agents/skills/... duplicate skill name
WARN  service=skill name=frontend-design existing=~/.agents/skills/... duplicate=~/.config/teamcode/skills/... duplicate skill name
INFO  service=skill count=15 init  # 5+ seconds after first scan started
```

## Proposed Solution

Add a `skills.directories` config option to `teamcode.json` that lets users specify which directories to scan, replacing the hardcoded defaults:

```json
{
  "skills": {
    "directories": ["~/.agents/skills/"]
  }
}
```

When set, only the listed directories are scanned. When omitted, current behavior (scan all 6) is preserved for backwards compatibility.

This would also complement the existing `skills.paths` (which adds additional paths) and `skills.urls` options.

## Verification

- [x] I have verified this feature hasn't been s

> *[Truncado — 1515 chars totais]*

---

## #23028 — [FEATURE]: Show subagent model in session tree / subagent view

📅 `2026-04-17` | ✏️ **christian-taillon** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23028](https://github.com/anomalyco/opencode/issues/23028)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When TeamCode spawns subagents, it would be helpful to show the model used by each subagent in the session UI. This allows users to quickly see which model each (sub)agent is running on when reviewing plans, subtasks or session trees.

**Example:**
- Plan — GPT-5.4
  - General — GPT-5.4-mini
  - Build — Sonnet-4.5

This could appear in the session tree, behind a toggle in the session view, or in the sidebar if work is being done there to display running subagents. Toggling could show active subagents and their models, making it clear at a glance which models are handling tasks.

**Benefits:**
- Makes multi-agent/step runs easier to understand
- Lets users confirm which model is being used for each agent
- Useful for troubleshooting and for mixed fast/strong reasoning agent workflows

**Related context:**
- There are existing PRs/changes for subagent tree navigation and for subagent variants
- There is interest in seeing model information but no feature specifically adds a model display to the UI

I am not requesting to show whether each agent receives the model by inheritance or explicit config; only to display each agent's effective model.

---

## #23016 — [FEATURE]: support disable small_model for serve mode

📅 `2026-04-17` | ✏️ **geosmart** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23016](https://github.com/anomalyco/opencode/issues/23016)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

when use seve mode,  we call teamcode by api, so doesn't need to generate title , 

the small model call is wasting token, 

hope to support disable generate title by small_model

---

## #23014 — [FEATURE]: Add `includeGitInstructions` config option to control git instruction injection in tool prompts

📅 `2026-04-17` | ✏️ **ChungHwemo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23014](https://github.com/anomalyco/opencode/issues/23014)


## Problem

TeamCode currently hardcodes git commit/PR workflow instructions (~1,300 tokens per turn) into the Bash tool's description template. These instructions are **always injected** with no way to disable them.

For users who:
- Have their own git workflow instructions via plugins (e.g., oh-my-teamcode's `git-master` skill)
- Use custom AGENTS.md/CLAUDE.md rules for git behavior
- Want to maximize context window for complex tasks

...these hardcoded instructions waste significant tokens every turn.

### Measured token impact

Extracted from compiled binary (v1.4.7) and measured with tiktoken:

| Section | Tokens (cl100k_base) | Chars |
|---|---|---|
| `# Committing changes with git` | 806 | 3,702 |
| `# Creating pull requests` | 404 | 1,909 |
| `# Other common operations` | 4 | 24 |
| **Total** | **1,259** | **5,795** |

Cumulative cost (resent every turn):

| Scenario | Token waste | Cost (Opus @ \$15/M input) |
|---|---|---|
| 50-turn session | ~63K | \$0.94 |
| 10 sessions/day | ~630K | \$9.44 |
| Monthly (22 work days) | ~13.8M | **\$207.74** |

### Claude Code comparison

Claude Code already implements this via:
- **Setting**: `includeGitInstructions: false` in `settings.json`
- **Env var**: `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1`
- **Source**: `src/utils/gitSettings.ts` → `shouldIncludeGitInstructions()`

When disabled, it removes the commit/PR instruction blocks from the Bash tool prompt and git status from system context.

## Proposed Solution

Add an `includeG

> *[Truncado — 2314 chars totais]*

---

## #22985 — [FEATURE]: Optional PaperClaw hook for peer-reviewed paper generation

📅 `2026-04-17` | ✏️ **Agnuxo1** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22985](https://github.com/anomalyco/opencode/issues/22985)


## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

This is a low-maintenance integration proposal — sharing a community integration file that users can opt into, no code change required on TeamCode's side.

### What

[PaperClaw](https://www.npmjs.com/package/paperclaw) is an MIT-licensed npm CLI + MCP server that runs a pipeline `register → arXiv research → tribunal exam → sandboxed code execution → write → publish` on the open p2pclaw.com/silicon mesh, returning a peer-reviewed paper + PDF (orange A4 template, score breakdown, judges panel).

### Why it fits TeamCode users

Scientific users and researchers can type `/paper <topic>` in their TeamCode session and have the agent drive the full pipeline to produce a peer-reviewed paper. TeamCode already has the tool-execution primitives this needs; no new code.

### Proposed deliverable

- Add a one-page doc (or a link from README.md) to the community-integrations section pointing to:  https://github.com/Agnuxo1/OpenCLAW-P2P/blob/main/paperclaw/integrations/teamcode/paperclaw-prompt.md
- That file contains the opt-in custom-instructions preset users can paste into TeamCode.

### Benefits

- Zero maintenance burden — PaperClaw is maintained upstream.
- Brings scientific-paper generation to TeamCode without changes to the core.
- Mirrors how Cursor, Aider, Continue, Cline, and Zed already list community in

> *[Truncado — 1810 chars totais]*

---

## #22959 — [FEATURE]: Clarify session timing in the UI, especially when subagents are used

📅 `2026-04-16` | ✏️ **coygeek** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22959](https://github.com/anomalyco/opencode/issues/22959)


## Summary

The timing shown at the end of a session becomes hard to understand once subagents are involved.

I tested this because I thought subagent time might be missing from the parent session's time. After checking the behavior more closely, it seems the bigger problem is not that time is missing, but that the UI does not clearly explain what each time value means.

## What the UI feels like today

When there are no subagents, the timing feels straightforward:
- you ask for something
- the assistant works
- the session ends
- the time at the bottom feels like "how long that took"

When subagents are involved, the UI becomes much less clear:
- the parent session has its own time
- the subagent has its own time
- tool calls may also have their own timing
- it is not obvious whether these times are separate, overlapping, or included inside each other

That makes it easy to think some time is being dropped, or that the total is wrong.

## Simple example without subagents

What the UI seems to show:
- one main session
- one visible duration

What is actually happening:
- one assistant is doing the work directly
- the displayed time mostly matches what a user expects as "how long this took"

This case is easy to understand.

## Simple example with subagents

What the UI seems to show:
- the main session has a duration
- the subagent task also has a duration

What a user may assume:
- the main session took X
- the subagent took Y
- maybe the real total should be X + Y

What see

> *[Truncado — 3286 chars totais]*

---

## #22925 — [FEATURE]: prompt_async: return pre-allocated assistant message ID in 202 response

📅 `2026-04-16` | ✏️ **orgito** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22925](https://github.com/anomalyco/opencode/issues/22925)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

`POST /session/:id/prompt_async` returns `204 No Content` with no body. Callers have no way to correlate the HTTP request with the assistant message that will eventually be created.

This makes the endpoint unsuitable for server-to-server integrations where the caller needs to know *which* message to poll for. The only options today are:

1. **Blind-poll `listMessages`** and hope the newest assistant message is the one you triggered — breaks under concurrent requests.
2. **Supply your own `messageID`** in the request body (supported but undocumented as a correlation mechanism) — this only identifies the *user* message, not the assistant reply.
3. **Subscribe to the SSE `/event` stream** — requires a persistent connection, fragile for backend callers.

None of these provide a clean correlation between "I sent this prompt" and "this is the assistant's response."

## Proposed Change

Pre-allocate the assistant message ID before detaching the async work, and return it so the caller can poll `GET /session/:id/message/:assistantMessageID` until it exists and has parts.

### Why this is feasible

Looking at the current code:

- `createUserMessage()` runs before the LLM loop ([prompt.ts#L1283](https://github.com/anomalyco/opencode/blob/9640d889baa58fa01ed612a6372ba77462f79d9f/packages/teamcode/s

> *[Truncado — 3912 chars totais]*

---

## #22921 — [FEATURE]: Desktop app should support custom CA certificates or system trust store for remote server connections

📅 `2026-04-16` | ✏️ **JtMotoX** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22921](https://github.com/anomalyco/opencode/issues/22921)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The TeamCode Desktop app (Tauri) cannot connect to an `teamcode serve` instance behind a reverse proxy with TLS when the certificate is signed by a private/internal CA (e.g., Caddy's `tls internal`, corporate CAs, self-signed certs).

#### Problem

The desktop app uses `reqwest` with `rustls-tls` for its health check and Tauri's HTTP plugin (`@tauri-apps/plugin-http`) for all fetch requests from the webview. Rustls bundles its own CA roots via `webpki-roots` and does **not** read:
- The OS/Windows certificate trust store
- `NODE_EXTRA_CA_CERTS` (Node.js-specific, irrelevant to Rust)
- `SSL_CERT_FILE` / `SSL_CERT_DIR`

This means there is no way to connect the desktop app to a serve instance behind TLS with a private CA, even though the TUI (`teamcode attach`) supports this via `NODE_EXTRA_CA_CERTS`.

#### Use case

Running `teamcode serve` on a remote host behind a Caddy reverse proxy with `tls internal` for encrypted traffic on an internal network:

```
┌─────────────────────────────────────────────────────────────┐
│ Remote Host                                                 │
│                                                             │
│   teamcode serve (:4097)  ◄──  Caddy reverse proxy (:4448)  │
│        HTTP                      TLS (internal CA)          │
└──────────────────────────────

> *[Truncado — 3437 chars totais]*

---

## #22871 — [FEATURE]: selective message copying from session transcript

📅 `2026-04-16` | ✏️ **leoncheng57** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22871](https://github.com/anomalyco/opencode/issues/22871)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

Currently, when copying a session transcript, users can only copy the **entire session** or the **last message**. There is no way to select a subset of messages to copy. This is inconvenient when:

- You only need a specific exchange (e.g., one question and its answer) from a long session
- You want to share a portion of a conversation without irrelevant context
- You need to extract specific assistant responses without the surrounding back-and-forth

## Proposed Solution

Add a new `copyWithOptions` command (slash command: `/copy-with-options`) that opens an interactive dialog where users can:

1. **View a list of all session messages** with previews (first 60 characters), model name, duration, and timestamps
2. **Toggle individual messages** for inclusion using `Space`
3. **Select all messages** with `Ctrl+A`
4. **Navigate** with arrow keys (with wrapping) and mouse hover/click
5. **Confirm** with `Enter` to copy the selected messages to the clipboard

The copied output should be a formatted Markdown transcript of only the selected messages, **without** the session metadata header (title, ID, timestamps), since a partial selection doesn't represent a full session export.

This command complements — not replaces — the existing `copy` command.

## Acceptance Criteria

- [ ] New `/copy-wi

> *[Truncado — 2784 chars totais]*

---

## #22848 — [FEATURE]: Add Last9 MCP server to docs examples

📅 `2026-04-16` | ✏️ **prathamesh-sonpatki** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22848](https://github.com/anomalyco/opencode/issues/22848)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The `mcp-servers.mdx` docs page already documents Sentry, Context7, and Grep as example MCP servers, and explicitly invites PRs for more: _"You can submit a PR if you want to document other servers."_

[Last9](https://last9.io) provides a hosted MCP server that gives TeamCode access to production observability data — logs, traces, metrics, exceptions, and alerts — via OAuth. This lets developers debug production issues without leaving the terminal.

**Proposed addition** — a `### Last9` section under Examples:

```json title="teamcode.json"
{
  "$schema": "https://teamcode.ai/config.json",
  "mcp": {
    "last9": {
      "type": "remote",
      "url": "https://app.last9.io/api/v4/organizations/<org_slug>/mcp",
      "oauth": {}
    }
  }
}
```

After adding, authenticate with `teamcode mcp auth last9`, then use it:

```
Why is payment-service throwing 500s right now? use last9
```

Happy to submit a PR against `packages/web/src/content/docs/mcp-servers.mdx`.

---

## #22831 — [FEATURE]: Expose prompt/output message bodies to plugin chat.message hook

📅 `2026-04-16` | ✏️ **michael-schienbein-fhr** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22831](https://github.com/anomalyco/opencode/issues/22831)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

> **Note on #17637:** That issue requests user message text in `experimental.chat.system.transform` for targeted context injection. This issue is related but distinct — it requests that the **already-firing** `chat.message` hook populate its `parts` array with actual prompt/output text, enabling telemetry and observability use cases (not system prompt manipulation). #17637 was closed as not planned, but the underlying need remains: plugins currently cannot access message bodies through *any* hook.

### Describe the enhancement you want to request

**Summary**

The `chat.message` plugin hook fires correctly, but the runtime delivers an empty `parts` array in the payload. This prevents plugins from capturing prompt or assistant response text for telemetry, observability, and audit use cases — even though the hook itself is invoked and tool args/results flow through fine.

**What we observed**

We built a telemetry plugin that instruments all available hooks (`chat.message`, `experimental.chat.messages.transform`, `experimental.text.complete`) and added diagnostic shadow logging for `chat.message` payloads.

Across 4 systematic test passes:

- `chat.message` **does fire** — 3 shadow log entries confirmed
- Payload shape: `{ sessionID, agent, model, messageID, variant }` — metadata only
- `parts` is **always an empty array** (`partsPreview: []`)
- `pro

> *[Truncado — 3071 chars totais]*

---

## #22829 — [FEATURE]:Customizable Data Storage Location for Windows Desktop Application

📅 `2026-04-16` | ✏️ **gggtttfff** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22829](https://github.com/anomalyco/opencode/issues/22829)


I'm a Windows user with a small SSD (C drive) and a large HDD (D drive). TeamCode desktop app stores all data in %LOCALAPPDATA%\teamcode\data\ on my C drive, which is filling up my system disk.

Current problems:

Windows installer has no option to choose where data is stored
Desktop app has no settings to change data location after installation
I had to dig through source code to find OPENCODE_DB environment variable as a workaround
No documentation explains how to manage data storage on Windows
What I need:

Option in Windows installer to select data storage directory
Settings UI in desktop app to change data location
Built-in tool to migrate existing data to new location
This is essential for Windows users with limited C drive space. Most desktop apps (VS Code, Steam, etc.) already support this.

---

## #22828 — [FEATURE]: Auto image-to-text transcription via multimodal model for non-multimodal providers

📅 `2026-04-16` | ✏️ **RoyougiShiki** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22828](https://github.com/anomalyco/opencode/issues/22828)


- [x] I have searched for existing issues and confirmed this is not a duplicate
- [x] I have read the contributing guidelines

## Problem

When using a non-multimodal LLM provider (e.g., text-only models) in TeamCode, sending an image attachment results in the model being unable to understand or process the image. There is no automatic fallback mechanism to:

1. Detect that the current model does not support image input
2. Automatically route the image to a configured multimodal model for transcription
3. Convert the image content to text description
4. Pass the text description to the primary non-multimodal model

## Current Behavior

- User sends an image in the conversation
- If the active model does not support image/vision input, the image is either ignored or causes an error
- No automatic image transcription fallback exists

## Expected Behavior

When a non-multimodal model receives an image, TeamCode should:

1. Detect the model's `modalities` do not include `image` input
2. Use a separately configured **image caption model** (multimodal model) to describe the image
3. Replace the image with the text description in the context
4. Continue the conversation with the primary model using the transcribed text

## Suggested Configuration

Add a new top-level config option in `teamcode.json`:

```json
{
  "image_transcription_model": "dmxapi/glm-4.1v-thinking-flash"
}
```

Or within the provider's model definition, allow marking a model as the image transcription provider:



> *[Truncado — 2927 chars totais]*

---

## #22797 — [FEATURE]: Support for disabling adaptive thinking on Opus/Sonnet 4.6 (equivalent to CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING)

📅 `2026-04-16` | ✏️ **r00tedbrain-backup** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22797](https://github.com/anomalyco/opencode/issues/22797)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Anyone else noticing Opus 4.6 reasoning feels shallower these past weeks? Hallucinations, made-up commits, edits without reading the file first… it’s not just you.
Boris Cherny (Claude Code lead at Anthropic) confirmed it publicly: since Feb 9 they enabled adaptive thinking by default, and on March 3 they dropped default effort from high to medium. He admitted that on some turns adaptive thinking is allocating zero reasoning tokens, which explains a lot of what we’re seeing.
The official fix in Claude Code is an env var: CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1.
Problem is TeamCode doesn’t expose that variable. Has anyone figured out how to replicate this here? I’m thinking maybe forcing thinking: { type: "enabled", budget_tokens: N } in the request, or pinning effort: "high" / "max" somewhere in the config, but I haven’t found a clean way to do it.
If anyone already cracked this, would really appreciate a pointer

---

## #22790 — [FEATURE]:  Before asking for access to a path, check that it exists at all. Often it will hallucinate a path, and then stop executing when it could have just been told that this path does not exist.

📅 `2026-04-16` | ✏️ **DanielJackson-Oslo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22790](https://github.com/anomalyco/opencode/issues/22790)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

 Before asking for access to a path, check that it exists at all. Often it will hallucinate a path, and then stop executing when it could have just been told that this path does not exist.

---

## #22787 — [FEATURE]: `--mcp` flag for `teamcode run` to ensure specific MCP servers are connected

📅 `2026-04-16` | ✏️ **Edison-A-N** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22787](https://github.com/anomalyco/opencode/issues/22787)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**Problem**: When using `teamcode run` from other AI agents or automation scripts, there's no way to ensure specific MCP servers are connected for that run. Some MCPs may be configured with `enabled: false` or disconnected, but the calling agent needs them for the task.

**Use case**: An outer agent orchestrates `teamcode run` to perform tasks that require specific MCP tools (e.g., `teamcode run --mcp docs,github "search the docs and create an issue"`). Without this flag, the outer agent has no way to guarantee the needed MCPs are active.

**Proposed solution**: Add a `--mcp <name,...>` flag to `teamcode run` that ensures the listed MCP servers are connected before the prompt is sent. For each name in the list, call `sdk.client.mcp.connect({ name })` — the same path the TUI uses when a user presses Space to toggle an MCP on.

```bash
teamcode run --mcp docs,github "search the docs and create an issue"
```

MCPs not in the list are left as-is (not disconnected). This just ensures the specified ones are up.

**Why it belongs in TeamCode**: The `run` command already supports per-run overrides for `--model` and `--agent`. Adding `--mcp` follows the same pattern. The internal machinery (`MCP.connect`) already exists and is used by the TUI toggle. This is a thin CLI surface over existing functionality.

*

> *[Truncado — 1625 chars totais]*

---

## #22781 — [FEATURE]: Default session title should use local time instead of UTC (Z)

📅 `2026-04-16` | ✏️ **LawlietLi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22781](https://github.com/anomalyco/opencode/issues/22781)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When a new session is created, the default title is formatted as:

`New session - 2026-04-15T03:20:00.000Z`

The `Z` suffix means this timestamp is in UTC (GMT+0). However, the "last modified" time shown in the session list uses local time. This inconsistency is confusing — the title makes it look like the session was created hours ago (or in the future) depending on your timezone.

**Suggestion:** Use local time instead of UTC in the default session title, e.g.:

`New session - 2026-04-15T11:20:00`

The fix would be in `packages/teamcode/src/session/session.ts`, replacing `new Date().toISOString()` with a local time formatter. Happy to submit a PR if this direction sounds good.

---

## #22658 — [FEATURE]: (Web UX) Update browser tab title While TeamCode Is Processing

📅 `2026-04-15` | ✏️ **J43fura** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22658](https://github.com/anomalyco/opencode/issues/22658)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, there is no visual feedback in the browser tab when TeamCode is actively processing a request. 
This would be very useful for `teamcode web` users

Proposed improvement:
Dynamically update document.title while TeamCode is “thinking” (e.g., prefix with 🔵 or similar indicator), and restore it once the response is complete.

Example:

Idle:
<img width="197" height="50" alt="Image" src="https://github.com/user-attachments/assets/3ed316ea-88ce-438c-ad7f-fb95175c1084" />
Processing:
<img width="197" height="50" alt="Image" src="https://github.com/user-attachments/assets/fbfba940-3209-4b9f-a5da-2db667ae4637" />

---

## #22651 — [FEATURE]: add OPENCODE_DISABLE_FORMATTER_DOWNLOAD env

📅 `2026-04-15` | ✏️ **lxl66566** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22651](https://github.com/anomalyco/opencode/issues/22651)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Since `OPENCODE_DISABLE_LSP_DOWNLOAD` can disable downloading the LSP package, and teamcode already automatically downloads formatters like Prettier, it would be helpful to provide an environment option such as `OPENCODE_DISABLE_FORMATTER_DOWNLOAD` to prevent formatter downloads as well.

---

## #22647 — [FEATURE]:Detect tqdm/CR-style progress output and keep only the latest status line visible

📅 `2026-04-15` | ✏️ **DebelToni** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22647](https://github.com/anomalyco/opencode/issues/22647)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

There are already broader truncation issues, but this seems like a separate output-rendering problem. Long-running tools that emit carriage-return based progress updates (for example tqdm) are currently expanded into many lines, eventually collapsing into .... Once that happens, the latest progress line is no longer visible, so you cannot monitor the running process. Could teamcode detect repeated CR/progress-style updates, compact older ones, and keep only the most recent status line visible?

---

## #22628 — [FEATURE]: After Plan mode, show Enter actions for Accept plan or Give more instructions

📅 `2026-04-15` | ✏️ **furkancak1r** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22628](https://github.com/anomalyco/opencode/issues/22628)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

After Plan mode completes, pressing Enter should offer two clear actions:

Accept plan
Tell the AI something else

Desired behavior:

If Accept plan is selected, TeamCode should continue by switching to Build mode and start implementation.

If Tell the AI something else is selected, the user should be able to immediately send additional guidance, corrections, or changes before implementation starts.

Current behavior:

After a plan is generated, the next step feels less smooth because the user has to manually decide and type what to do next.

Why this would help:

This would make the workflow faster and more intuitive. In many cases, the user either wants to approve the plan and continue immediately, or give one more instruction before execution. These are the two most common next actions, so exposing them directly would improve the UX a lot.

---

## #22596 — [FEATURE]:Providers or connected providers should be imporved

📅 `2026-04-15` | ✏️ **nftsharing** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22596](https://github.com/anomalyco/opencode/issues/22596)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

[FEATURE]:Providers or connected providers, especially custom providers, should be capable of being saved and updated. Otherwise, always need retry....

---

## #22593 — [FEATURE]: Filter and sort models

📅 `2026-04-15` | ✏️ **peteqian** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22593](https://github.com/anomalyco/opencode/issues/22593)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I'd like a way to filter the "Connect Model" list with filters for Providers (or Platforms, who provides the AI Providers), AI Provider (the provider of the AI itself) and the pricing.

The benefit is so that it's quicker to connect to the model I want, from the Provider/Platform as I tend to have multiple providers, whom all provide the same models. They also tend to release free models and I see there is a "free" tag but that's really pointless for me if I can't just filter by "free" to see all the new juicy ones.

---

## #22572 — [FEATURE]: Fedora Copr Repo

📅 `2026-04-15` | ✏️ **jmsunseri** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22572](https://github.com/anomalyco/opencode/issues/22572)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

could you guys start up an official copr repo so we could easily install and get updates to the application.  https://copr.fedorainfracloud.org/coprs/  I installed via the RPM and it keeps telling me there is an update but impossible to install updates properly when installing via RPM.

---

## #22558 — [FEATURE]: Dynamic permission scoping via plugin state (permission.ask + structured DeniedError reason)

📅 `2026-04-15` | ✏️ **gotgenes** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22558](https://github.com/anomalyco/opencode/issues/22558)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

#### Context

I'm building a TDD state machine as an TeamCode custom tool (`.teamcode/tools/tdd-checkpoint.ts`). The tool tracks Red/Green/Refactor phases and validates that an agent follows the correct operation sequence. During the RED phase, the agent should only be writing test files — not production code.

The problem: the agent eventually stops calling the checkpoint tool and writes production files directly. Advisory feedback from a custom tool isn't sufficient to enforce TDD discipline because the model treats the tool as optional and reaches for Edit/Write directly.

What I need is **dynamic, state-dependent permission scoping** — the ability for a plugin to deny `edit` permission on production files when a TDD state machine is in a testing phase, and lift that restriction when the state transitions to an implementation phase.

#### Relationship to existing issues

This depends on wiring the `permission.ask` plugin hook, which is tracked by:

- #7006 — `permission.ask` plugin hook is defined but not triggered (bug)
- #19469 — Feature request to wire the hook
- PR #19453 — Open PR that wires the hook and adds a `message` field to the hook output

**This issue is distinct from all three.** Those issues are about wiring the `permission.ask` hook generically so plugins can intercept permission 

> *[Truncado — 4857 chars totais]*

---

## #22546 — [FEATURE]:

📅 `2026-04-15` | ✏️ **renshengbushexie** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22546](https://github.com/anomalyco/opencode/issues/22546)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Is it true that the CLI doesn't have a feature to roll back code to a specific step? If possible, I'd like to request this feature. Thanks.

---

## #22527 — [FEATURE]:支持figma的插件

📅 `2026-04-15` | ✏️ **Andln** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22527](https://github.com/anomalyco/opencode/issues/22527)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

参考claude code那样，支持figma的插件

---

## #22500 — [FEATURE]: Cache for nix package

📅 `2026-04-14` | ✏️ **ReStranger** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22500](https://github.com/anomalyco/opencode/issues/22500)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

How about caching a package under nix on cachix?

---

## #22484 — [FEATURE]: full page terminal on tui

📅 `2026-04-14` | ✏️ **nilanjansiromani** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22484](https://github.com/anomalyco/opencode/issues/22484)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

it would be great if the terminal could be made expanded and the chat on the tui could be hidden.

that way i can use the tui as my workspace replacement

the chat is great but the terminal is way more powerful

---

## #22480 — [QUESTION] Allow two-line session titles in TUI Sessions dialog (#6166)

📅 `2026-04-14` | ✏️ **CasualDeveloper** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/22480](https://github.com/anomalyco/opencode/issues/22480)


### Question

Replacement for #6165, which was closed as stale.

Would maintainers accept letting long titles wrap to two lines in the TUI Sessions dialog?

The linked PR keeps the scope narrow:

- `DialogSelect` stays single-line by default
- only the Sessions dialog opts into `maxLines={2}`
- wrapping/truncation is display-width-aware for Unicode/CJK text
- workspace footers reserve their display width so titles do not overlap them

PR: https://github.com/anomalyco/opencode/pull/6166

Before:
![before](https://github.com/user-attachments/assets/590e084b-a8cb-4daf-ad63-9c5c68e529f3)

After:
![after](https://github.com/user-attachments/assets/f84fc84c-9971-4261-942f-993cbf0a4600)

---

## #22467 — [FEATURE]: slash commands can change permissions.

📅 `2026-04-14` | ✏️ **kelvinauta** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22467](https://github.com/anomalyco/opencode/issues/22467)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be very useful if commands could set permissions only for the turn in which they were executed.

useful examples:
* `/explain` explain only with the context of the current session (remove all permissions, no read, no explore, just history chat)
* `/testwrite` create tests, remove all write permissions except in a specified directory like src/Tests
* `/unbash` remove bash permissions and nothing else...
* `/automatic` remove flow-interruption tools like the `question` tool; resolve any `ask` permissions as `deny` or `allow` depending on how it is configured; remove the ask from `plan_exit`

This is useful because it lets me control what an agent can or cannot do;

Why not just add an `agent` with fewer permissions to the `command`?
because I don’t want to change agents, I want to keep the agent’s prompt but control what it can or cannot do.

---

## #22465 — [FEATURE]: Treat permission path patterns as proper glob patterns, with support for both relative and absolute patterns.

📅 `2026-04-14` | ✏️ **CarloWood** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22465](https://github.com/anomalyco/opencode/issues/22465)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

At the moment, permission path matching does not behave like standard glob matching.
This has several downsides, among which the inability to specify a pattern that only matches everything inside the worktree, but not outside the worktree.

## The problem

1. A `*` is currently replaced with a `.*` in regex, matching everything including multiple directories and `../`.
2. It is not possible to specify a pattern that matches an absolute path for the `"edit"` section, which is only matched against the path relative to the current worktree.
3. Some permission keyword's patterns are matched against absolute paths, others are matched against relative paths.

### Current situation

permission keyword:
* "read" : matched against the absolute target path.
* "edit" : matched against a path relative to Instance.worktree.
* "external_directory" — matched against an absolute directory glob.
* "list" — matched against the absolute directory being listed.

## Proposal

Unify all filepath matching as true globbing, including support for a globstar (`**`).
This can achieved with the already existing `path.matchesGlob` in typescript.

For example:
```
daniel:~/projects/github/ai-cli/globtest>cat test.ts
import path from "node:path";

const patterns = ["*", "*/*", "**/*", "../**/*"];
const filepaths = ["bar/foo", "fo

> *[Truncado — 2659 chars totais]*

---

## #22434 — [FEATURE]: Do not automatically activate new models

📅 `2026-04-14` | ✏️ **wbdb** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22434](https://github.com/anomalyco/opencode/issues/22434)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be great if new models were not automatically activated in TeamCode Desktop, and possibly also in CLI, provided that the behavior is identical there, so that you only ever see the models that you have manually activated for this view in the productive model selection. Otherwise, models that you don't actually want to work with keep popping up there.

Reopen: https://github.com/anomalyco/opencode/issues/13164

---

## #22424 — [FEATURE]: Support bun + remote git URLs for plugin installation

📅 `2026-04-14` | ✏️ **lumincui** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22424](https://github.com/anomalyco/opencode/issues/22424)


## Describe the enhancement you want to request

Currently, teamcode's plugin system does not properly support installing plugins from remote git URLs using bun.

### Problem

When specifying a plugin with a git remote URL in `teamcode.json`:

```json
{
  "plugin": ["teamcode-dynamic-context-pruning@git+https://github.com/Opencode-DCP/teamcode-dynamic-context-pruning.git#98601123483bd9325d5ec5d1c3942e7e19019606"]
}
```

The installation fails because:

1. The `npa` (npm-package-arg) library correctly parses the spec as type `git` with `saveSpec` set to `git+https://...`
2. However, in `resolvePluginTarget()` at `packages/teamcode/src/plugin/shared.ts:210`, the code uses the full spec (including the package name prefix) instead of just the `saveSpec`
3. Bun then receives `teamcode-dynamic-context-pruning@git+https://...` which is not a valid bun dependency format

### Expected behavior

Plugins should be installable via remote git URLs using the same format that `bun add` supports:

```bash
bun add git+https://github.com/Opencode-DCP/teamcode-dynamic-context-pruning.git#98601123483bd9325d5ec5d1c3942e7e19019606
```

### Proposed fix

In `resolvePluginTarget()`, check if `npa` result type is `git` and use `saveSpec` directly:

```typescript
if (hit?.type === "git") {
  const result = await Npm.add(hit.saveSpec!)
  return result.directory
}
```

This allows bun to handle the git URL directly, which it already supports.

### Verification

- [x] I have verified this feature hasn't 

> *[Truncado — 1522 chars totais]*

---

## #22413 — [FEATURE]: do not discard interrupted responses

📅 `2026-04-14` | ✏️ **lnussbaum** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22413](https://github.com/anomalyco/opencode/issues/22413)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi,
I understand from https://github.com/anomalyco/opencode/pull/19480 that, when interrupting a response (for example to clarify a requirement so that the model can consider it), the response is completely discarded, and the "thinking" restarts from scratch.
It would be great if interrupted responses could be used as a basis for the next response (possibly optionally).
I think that Claude Code does that.

---

## #22409 — [FEATURE]: API Usage view in teamcode TUI

📅 `2026-04-14` | ✏️ **Taanviir** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22409](https://github.com/anomalyco/opencode/issues/22409)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I use my Gitub Copilot key in teamcode TUI, it would be helpful to see the amount of usage left in the TUI itself instead of having to go into github copilot settings each time

---

## #22407 — [FEATURE]: Pointer-based retrieval for compacted tool results

📅 `2026-04-14` | ✏️ **joshuaisaact** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22407](https://github.com/anomalyco/opencode/issues/22407)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

After compaction, cleared tool results are replaced with `[Old tool result content cleared]`. The original content persists in the database (`part.state.output`), but the model has no way back to it. Any question requiring a specific detail from a cleared result gets answered from whatever the summary preserved, or hallucinated.
 
This gets worse with cascaded compaction. Each summarization round is a lossy pass - by the second compaction, specific details from early in the session are effectively gone.

Give the model two retrieval tools for compacted content:

1. `list_refs()` — returns all compacted parts for the current session with IDs, titles, and sizes
2. `read_ref(id)` — returns the full original `part.state.output` for a compacted part

And emit pointer IDs where cleared content used to be:

```
 // Before:
 const outputText = part.state.time.compacted
? "[Old tool result content cleared]"
: part.state.output
```

```
// After:
const outputText = part.state.time.compacted
? `[ref:${part.id} — ${part.state.title}]`
: part.state.output
```

Implementation cost is low: one line changed, ~80 lines of new code, no new database tables or infrastructure. The content is already stored.

I ran a series of experiments testing this against summarization-only compaction. Full methodology and experiment

> *[Truncado — 2618 chars totais]*

---

## #22377 — [FEATURE]: Claude/Codex via SDKs

📅 `2026-04-14` | ✏️ **xolotlatoani** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22377](https://github.com/anomalyco/opencode/issues/22377)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It would be quite beneficial to transition to utilizing the Codex harness or Claude harness directly through their respective SDKs. This would allow for the seamless integration of these powerful agents with non-Anthropic subscription services such as GitHub Subscriptions or other similar platforms.

Something like what Copilot is doing when loading Claude or Codex within the Copilot plugin in VS Code.

---

## #22311 — [FEATURE]: Wire the permission.ask plugin hook

📅 `2026-04-13` | ✏️ **jbro** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22311](https://github.com/anomalyco/opencode/issues/22311)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The `tool.execute.before` hook can inspect and mutate tool args, or block execution by throwing, but it can't defer to the user for approval.

Without this, plugins that implement policy engines have no way to do "stop and ask", only hard-block or silent-allow.

Plugin-defined tools already get `ask()` via `ToolContext`, so the precedent exists. 

The fix is small: pass ask on the hook's input object at the three trigger sites in `prompt.ts`, and extend the type in `packages/plugin/src/index.ts`.

Related to #19469 and #7006 but distinct, those wire the permission.ask hook to intercept existing permission checks; this exposes `ask()` on `tool.execute.before` so plugins can initiate permission requests.

---

## #22294 — [FEATURE]: create new session on startup

📅 `2026-04-13` | ✏️ **gaardhus** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22294](https://github.com/anomalyco/opencode/issues/22294)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I have developed a browser extension [OpenEyes](https://github.com/gaardhus/OpenEyes), that allows to user to select a browser element and send a screenshot along with some other metadata to an active TeamCode session.

However, when I currently start the TeamCode cli, a new session is not created before _after_ I have send the first message. This means that in order for my extension to work, I currently have a send a dummy message (i.e. "hello") to have a new session created, which I can then select and inject the message generated by my extension in.
It would be nice if a new session was created automatically, or maybe through a flag?

These issues are somewhat related, though they are about specifying the session_id at startup time, I just want to be able to retrieve it: 
https://github.com/anomalyco/opencode/issues/17344
https://github.com/anomalyco/opencode/issues/2159

---

## #22286 — [FEATURE]:a loading bar appears at the top

📅 `2026-04-13` | ✏️ **dazhi666666** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22286](https://github.com/anomalyco/opencode/issues/22286)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

In the new desktop app, a loading bar appears at the top while the AI model is responding. It’s visually distracting—could you please remove it, or at least add an option to disable it?

---

## #22278 — [FEATURE]:Support Sub-Directories & Symbolic Links Like Every Other Piece of Software Since 1987

📅 `2026-04-13` | ✏️ **tregenza** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22278](https://github.com/anomalyco/opencode/issues/22278)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently custom tool handling (.teamcode/tools) cannot handle:

a) Symbolic Links   (Currently reports Unable to find "@teamcode-ai/plugin" reported in numerous issues)
b) Sub-Directories  (Silently ignores them)

Various issue reports highlight other parts of the system struggling with symbolic links and unintuitive, or simply broken directory handling. 

It's 2026 - why are we still unable to handle basic file system features which have been common since the 1970s?

---

## #22264 — [FEATURE]: Terminal Tool Execution Interruption Within a Session

📅 `2026-04-13` | ✏️ **wangjiecloud** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22264](https://github.com/anomalyco/opencode/issues/22264)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Can you add a new feature that allows interrupting the execution of a specific terminal tool within a session, without interrupting the execution of the entire session?

---

## #22242 — [FEATURE]: Add sub agent manual action for mark complete sub agent.

📅 `2026-04-13` | ✏️ **itokun99** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22242](https://github.com/anomalyco/opencode/issues/22242)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Sometime, delegation was long waiting but when i see the detail of agent, the agent was give the parent agent latest output. instead waiting the timeout for trigger automatically, may this feature to add some shortcut key to mark "Hey, i'm complete now" to tell parent doing the next step.

---

## #22233 — [FEATURE]: Improve subagent runtime visibility in chat UI

📅 `2026-04-13` | ✏️ **a1418507570** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22233](https://github.com/anomalyco/opencode/issues/22233)


The current subagent status feedback in chat is too vague.

During conversations, Opencode often says things like “wait for xxx to return before continuing”, but from the UI I cannot tell:

- which agent is currently running
- what that agent is doing
- how long it has been running
- whether it is making progress or stuck
- whether multiple agents are running in parallel or sequentially

So as a user, I am basically being asked to wait for a black box.

I’d really like clearer runtime visibility for subagents directly in the chat UI.

For example, it would help to show:

- subagent name / role
- current state: queued / running / completed / failed
- start time and elapsed time
- current step or short action summary
- whether there are multiple subagents and how they relate
- optionally expandable logs or progress details

Even a minimal inline status card would already be much better, for example:

- Subagent: Developer
- Status: Running
- Current step: Inspecting repository
- Elapsed: 2m 14s

This matters a lot in longer or multi-agent tasks. When the assistant says “wait for xxx”, users need basic observability to understand whether things are proceeding normally, slow, stuck, or failed.

Right now the execution model feels too opaque, which makes the experience harder to trust.

---

## #22225 — [FEATURE]: Add skill usage tracking to CLI

📅 `2026-04-13` | ✏️ **zokan121522** | 💬 11 | 🔗 [https://github.com/anomalyco/opencode/issues/22225](https://github.com/anomalyco/opencode/issues/22225)


# [FEATURE]: Add skill usage tracking to CLI

## Summary

Track which skills are used in each session. Every time a skill is invoked, increment its counter in a local JSON file (`~/.config/teamcode/skills/usage.json`).

## Why This Helps

As a developer, I want to know:
- Which skills do I actually use?
- Which skills am I ignoring?
- Am I over-relying on one skill?

Right now the CLI has no visibility into this. The only way to know is manual tracking or guesswork.

## What It Does

The implementation writes a simple JSON file:

```json
{
  "go-testing": 12,
  "issue-maker": 5,
  "pr-creator": 3
}
```

Every time you invoke a skill, the counter goes up by 1. That's it.

## Why Not Database?

JSON file is:
- **Zero setup** - No migration needed
- **Portable** - Read it from any tool
- **Silent failures** - If it breaks, the CLI keeps working
- **Privacy** - Stays local, no telemetry sent anywhere

## My TeamCode Manager App

I built a personal JavaFX desktop app for managing TeamCode skills:

**https://github.com/zokan121522/TeamCodeManager-app**

Features:
- Browse and edit skills with markdown preview
- Browse Engram memories (persistent memory for AI agents)
- Usage dashboard - see which skills you use most
- Modern dark UI with gold accents

Right now the CLI change makes the usage file, and my app can read it. Eventually the app could show graphs, trends, etc.

## Engram

The issue mentions Engram (persistent memory system by Gentleman Programming). This is a different f

> *[Truncado — 1880 chars totais]*

---

## #22211 — feat: per-model timeout, permissions, and wildcard glob config

📅 `2026-04-12` | ✏️ **tobias-weiss-ai-xr** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22211](https://github.com/anomalyco/opencode/issues/22211)


## Feature Request

Currently the timeout for tool execution is a single global value. Some models are much slower and need longer timeouts, while fast models waste time waiting. There's no way to configure per-model timeouts or restrict which tools specific models can use.

## Suggested Fix

Per-model timeout configuration in `teamcode.json`, per-model permission controls for tool access, and wildcard glob support in model ID matching to configure groups of models at once.

- [x] I've verified this doesn't already exist

---

## #22195 — [FEATURE]: add prompt-time image preview for TUI attachments

📅 `2026-04-12` | ✏️ **hernandezsanti** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22195](https://github.com/anomalyco/opencode/issues/22195)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

Add prompt-time image previews in the TUI when an image is attached.

Proposed behavior:
- keep the existing `[Image N]` token
- show textual metadata for attached images
- render a small thumbnail when terminal capabilities allow it
- fall back silently to text-only preview on unsupported terminals

Benefits:
- gives immediate feedback before sending
- makes pasted image attachments easier to verify
- keeps unsupported terminals usable with a simple fallback

I already have a local prototype for this, but wanted to check if this direction is acceptable before opening a PR because it touches TUI/UI behavior.

---

## #22188 — [FEATURE]: Allow disabling built-in MCP servers (chrome-devtools, morphllm-fast-apply)

📅 `2026-04-12` | ✏️ **iMaxTomas** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22188](https://github.com/anomalyco/opencode/issues/22188)


## Problem

TeamCode bundles `chrome-devtools` and `morphllm-fast-apply` as **default/hardcoded MCP servers**. They are spawned on every session startup even when the user's `teamcode.json` contains no reference to them. There is currently **no supported configuration mechanism** to disable them.

This forces all users to pay the token and process overhead for tools they may never use.

## Evidence

### 1. Official repo treats `chrome-devtools` as a built-in default

Merged PR [#15516](https://github.com/anomalyco/opencode/pull/15516) discusses orphaned child processes from `chrome-devtools-mcp` and provides an **example config** that assumes `chrome-devtools` is a default server every user has:

```json
"chrome-devtools": {
  "type": "local",
  "command": [
    "npx", "-y", "chrome-devtools-mcp@latest",
    "--userDataDir={env:HOME}/.cache/chrome-devtools-mcp/{env:OPENCODE_PID}"
  ]
}
```

This PR was merged. It does not describe how a user *adds* chrome-devtools; it describes how to *reconfigure* an already-present built-in.

### 2. `morphllm-fast-apply` is documented as an integrated ecosystem plugin

Issue [#1591](https://github.com/anomalyco/opencode/issues/1591) (closed) requested MorphLLM integration as a first-class editing engine, and later issue [#16632](https://github.com/anomalyco/opencode/issues/16632) (closed) updated the ecosystem docs to point users to the Morph plugin. The tool is surfaced automatically without explicit user configuration.

### 3. `teamcode.j

> *[Truncado — 5534 chars totais]*

---

## #22169 — [FEATURE]: Qwen 3.5 models from OpenRouter

📅 `2026-04-12` | ✏️ **Jan-coder103** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22169](https://github.com/anomalyco/opencode/issues/22169)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Would it be possible to add support for the Qwen 3.5 models (like 27B, 35B-A3B, 122B-A10B) when using OpenRouter? Because they don't show up with "/models"

---

## #22153 — [FEATURE]:Show progress bar for Subagent

📅 `2026-04-12` | ✏️ **wangguodong-f** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22153](https://github.com/anomalyco/opencode/issues/22153)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When a foreground agent completes its task and waits for a sub-agent to execute its task, the TUI interface does not display any dynamic prompts indicating that the task is in progress. Although the user is prompted to "**Ctrl+X down view subagents**" this is not easily noticed and may mislead the user into believing that the current task has already finished.

![Image](https://github.com/user-attachments/assets/9cc289bd-7640-4091-abf0-f1bc217ebabe)

**Perhaps the foreground task's dynamic effects should be maintained while the background task is still running, allowing the user to intuitively perceive that the current task is still in progress.**

---

## #22148 — [FEATURE]: Show provider connection error when running subagents

📅 `2026-04-12` | ✏️ **Kangaroux** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22148](https://github.com/anomalyco/opencode/issues/22148)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When my primary agent loses connection to the provider it displays an error saying it's reconnecting. However, if a subagent is running and connection is lost there is no display. It eventually reconnects, but until then, it can appear that the subagent is stuck

---

## #22144 — [FEATURE]: Show timestamp and duration on tool execution blocks

📅 `2026-04-12` | ✏️ **kshptl** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22144](https://github.com/anomalyco/opencode/issues/22144)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When tools execute (file reads, grep, edits, bash commands, etc.), there's no indication of when they started or how long they took. This makes it hard to identify slow tools or understand the timeline of an agent session.

**Proposed change:** Display a clock timestamp and running duration on each tool execution block — both in the web UI and TUI. For example: `02:03 PM · 5s` while running, updating live. Interrupted/aborted tools should show a distinct "Interrupted" indicator instead of a misleading duration.

**Benefits:**
- Quickly identify which tools are slow
- Understand the timeline of a session at a glance
- Clear visual distinction between completed, running, and interrupted tools

---

## #22141 — [FEATURE]: Having custom instructions

📅 `2026-04-12` | ✏️ **Sahil-Gupta584** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22141](https://github.com/anomalyco/opencode/issues/22141)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

<img width="789" height="742" alt="Image" src="https://github.com/user-attachments/assets/0442e16a-4003-4c8c-b77e-8b87bb8c7c8f" />

Can i pass custom instructions to agent everytime i prompt?
Or maybe we can tweak internal system prompt in starting of each new session

---

## #22103 — [FEATURE]:Show subagent token usage in TUI token counter

📅 `2026-04-12` | ✏️ **Alexxiehui6018** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22103](https://github.com/anomalyco/opencode/issues/22103)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature Request
Currently, the TUI displays token usage in the top-right corner, but this only reflects
the main session's token consumption. When the Task tool spawns subagents, their token
usage is not visible anywhere in the interface.
## Proposed Behavior
Show subagent token usage either:
- As a separate counter (e.g., `main: 12k | sub: 8k`)
- Or as a breakdown when hovering / expanding the token display
- Or include subagent tokens in the total counter with an indicator
## Use Case
When using Task tool heavily (e.g., parallel agents for large tasks), it's hard to
understand the true cost of a session without subagent token visibility. This matters
for budget tracking and context management.

---

## #22095 — [FEATURE]: RFC 9728 support for webfetch (OAuth server discovery, access protected resources)

📅 `2026-04-11` | ✏️ **irvinebroque** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22095](https://github.com/anomalyco/opencode/issues/22095)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature hasn't been suggested before.
- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

When the `webfetch` tool fetches a URL that returns `401` or `403` with a `WWW-Authenticate: Bearer` header, there is no way to authenticate. The request fails.

Instead, support [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html) and [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414.html) — sending the user through an OAuth flow. This allows Opencode users to easily access resources protected behind auth (ex: internal tools, APIs, or anything you might give your agent a URL to, that is behind auth.

TeamCode already implements this discovery flow for MCP servers — as it is required by the MCP specification. But `webfetch` doesn't benefit from it.

### What this adds

On a `401`/`403` with a `WWW-Authenticate` header, webfetch would:

1. Parse the `WWW-Authenticate` challenges (RFC 9110 Section 11.6.1)
2. Discover the resource metadata via `/.well-known/oauth-protected-resource` (RFC 9728)
3. Discover the authorization server metadata via `/.well-known/oauth-authorization-server` (RFC 8414)
4. Run an OAuth authorization code + PKCE flow (RFC 7636), falling back to device code (RFC 8628)
5. Store credentials and retry the 

> *[Truncado — 3152 chars totais]*

---

## #22078 — [FEATURE]: Option to run `compaction` when the main agent reaches the maximum number of steps

📅 `2026-04-11` | ✏️ **rambip** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22078](https://github.com/anomalyco/opencode/issues/22078)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I really like the way we can configure the `max_step` for agents and subagents. It allows me both to detect if agent is lost, and to keep the context length under control, which saves a lot of money.

For subagents, `max_step` do exactly what I want.
But for the main agent, I originally thought that `compaction` ran automatically after the model reaches the maximum number of step. It's not obvious to me what's that's not the default behavior. 
Since both behavior make sense, it would be nice to have an option to configure this behavior.

---

## #22073 — [FEATURE]: add `--no-color` to `teamcode run`

📅 `2026-04-11` | ✏️ **ucirello** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22073](https://github.com/anomalyco/opencode/issues/22073)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I would like to be able to pipe the output of `teamcode run` into logs, but free of the ANSI terminal modifiers that change colors; a simple plain text output format.

---

## #22067 — [FEATURE]:  /tree command for visual session navigation

📅 `2026-04-11` | ✏️ **jshan9078** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22067](https://github.com/anomalyco/opencode/issues/22067)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### Problem
After using `/fork` to branch from a previous message, there's no way to navigate back to the parent conversation or view all branches in the session tree. Users must manually switch between sessions or lose access to previous branches.
### Proposed Solution
Implement a `/tree` command (similar to [pi-mono](https://github.com/badlogic/pi-mono)) that provides:
1. **Visual tree browser** - ASCII art visualization of the entire session tree showing all branches
2. **Active path highlighting** - Shows which branch is currently active
3. **Branch navigation** - Click/keyboard to switch between any message in the tree
4. **Optional branch summaries** - When leaving a branch, optionally generate an AI summary of the abandoned conversation path
### Key Features
- Navigate to any previous message without losing current branch
- Visual representation of all conversation paths
- Keyboard-driven interface (arrow keys, enter to select)
- Optional labels/bookmarks for quick reference
### Reference Implementation
The [pi-mono coding agent](https://github.com/badlogic/pi-mono) has a working implementation:
- Session stored as append-only tree with `parent_id` tracking
- `/tree` command opens visual selector (`tree-selector.ts`)
- `branch()` method moves leaf pointer without modifying history
- Supports 

> *[Truncado — 2065 chars totais]*

---

## #22059 — [FEATURE]:Prompt for pending todo updates when a session is about to finish

📅 `2026-04-11` | ✏️ **ahmedfe** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22059](https://github.com/anomalyco/opencode/issues/22059)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Problem: When an agent finishes a session while there are still pending or in-progress todos, the todo list can be left in a stale state with items marked as pending or in_progress even though the work was completed.

Proposed behavior: Before finishing a session, the agent should check if there are any unfinished todos (pending or in_progress status) and, if found, inject a synthetic reminder prompting the agent to update the todo list to reflect the current state of the work.

Details:

After the agent produces a final response and before the session ends, the system should inspect the session's todo list
If unfinished todos exist, a synthetic user message should be appended listing them, asking the agent to reconcile the list
The reminder should be suppressed if a similar reminder was already the last user message (avoiding loops)
The agent should then continue processing to update the todo statuses before the session truly ends

---

## #22037 — [FEATURE]: Please add the date to the request timestamp in desktop teamcode for mac. it would be very helpful to have an accurate timeline.

📅 `2026-04-11` | ✏️ **abaile3312-dotcom** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22037](https://github.com/anomalyco/opencode/issues/22037)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When I hover over a request in teamcode on mac, it shows some info including the time of the request but it is missing the date. It would be very helpful to have the date along with that timestamp. There's plenty of room for it. The info doesn't even extend half the message field space.

---

## #21978 — [FEATURE]: AGENTS.md startup instructions not executed proactively

📅 `2026-04-11` | ✏️ **gmarthews** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21978](https://github.com/anomalyco/opencode/issues/21978)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Opencode assumes my system, so I must ask it to read the system file I specifically put into the AGENTS.md file. I was hoping that it might know my system each startup by reading this, but apparently it cannot do this without a specific instruction each time to do so. 

Maybe unrelated: Reference the issue I found #141 which notes "Injection occurs only when the agent uses the Read tool on a file, not at session start" - the fix expected was that instructions in AGENTS.md should run at startup, not just be read passively into context.

---

## #21945 — [FEATURE]:Add option to disable .gitignore in file autocomplete

📅 `2026-04-10` | ✏️ **moriline** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21945](https://github.com/anomalyco/opencode/issues/21945)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently teamcode uses .gitignore to filter files in autocomplete/file selection (when typing @filename). This is useful for excluding build artifacts, node_modules, etc.
However, there's no way to disable this behavior when users want to access .gitignored files. For example, if a user has .md files in .gitignore, they cannot see them in autocomplete.
**Request:** Add a config option to disable .gitignore filtering in file autocomplete, so that all files in the project directory are visible regardless of .gitignore rules.
Something like:
```json
{
  "fileCompletion": {
    "respectGitignore": false
  }
}
Or a global option to disable gitignore for all file operations.

---

## #21939 — Add option to disable persistent session animations (spinner/progress line when idle)

📅 `2026-04-10` | ✏️ **vixborn** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21939](https://github.com/anomalyco/opencode/issues/21939)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem
On TeamCode Desktop (Linux Mint/Cinnamon), the top progress animation (blueish  line running left to right) and  GIF to the left of session name remain animated even when idle.

## Impact
This is visually disruptive and reduces focus during long sessions.

## Expected behavior
Animations should run only while actual processing is happening.

## Feature request
Please add settings such as:
- [ ] Reduce motion
- [ ] Show activity indicators only when processing
- [ ] Disable persistent session animation

## Environment
- OS: Linux Mint
- Desktop: Cinnamon
- Display: Wayland/X11
- TeamCode Desktop version:  v1.4.3

---

## #21906 — [FEATURE]: pompts queue + change , cancel and forward

📅 `2026-04-10` | ✏️ **Leohanhart** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21906](https://github.com/anomalyco/opencode/issues/21906)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

This feature is very important. Cursor also has it. 
- As a operator you can see what is queued, edit the messages and forward it.

---

## #21894 — [FEATURE]: configure custom theme for web too

📅 `2026-04-10` | ✏️ **arunoruto** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21894](https://github.com/anomalyco/opencode/issues/21894)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I am using stylix to configure a custom theme for my whole setup based on a palette. I also created one for teamcode and it works in the TUI, but I am not able to enable or see it in the web interface.

I haven't found any obvious documentation regarding this in the [web](https://teamcode.ai/docs/web/) or [themes](https://teamcode.ai/docs/themes/) section.

---

## #21884 — [FEATURE]: Add support for Anthropic's Advisor Tool (Beta)

📅 `2026-04-10` | ✏️ **baob** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/21884](https://github.com/anomalyco/opencode/issues/21884)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

**Note:** Issue #21789 covered this feature but was auto-closed by the compliance bot for formatting issues before any maintainer could review the actual feature request on its merits. This is a properly formatted resubmission to ensure the feature gets human consideration.

**Problem:**

When working on complex coding tasks in TeamCode, I often need Opus-level intelligence for planning and decision-making, but running Opus for the entire conversation is expensive. Anthropic recently released an "Advisor Tool" that solves this perfectly - it lets Sonnet consult Opus mid-conversation for strategic guidance, giving near-Opus quality at mostly-Sonnet cost.

**What I want:**

I'd like TeamCode to support Anthropic's Advisor Tool so I can:
- Use Sonnet as my main model (keeps costs down, maintains access to all tools/files)
- Have Sonnet automatically consult Opus when it needs strategic guidance
- Get better results on complex tasks without paying for full Opus usage

**How it works:**

The advisor tool is a server-side Anthropic feature (similar to their bash or web_search tools). When enabled, Sonnet can call an "advisor" during generation. Anthropic routes that to Opus, gets advice, and Sonnet continues - all in one API request.

**What needs to change:**

1. Add the beta header: `anthropic-beta: advisor-tool-2026-03-01`
2. Support the `advisor_20260301` tool type in the Anthropic provider
3

> *[Truncado — 2048 chars totais]*

---

## #21863 — [FEATURE]: Allow --model free to randomly select free models

📅 `2026-04-10` | ✏️ **caretak3r** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21863](https://github.com/anomalyco/opencode/issues/21863)


- [x] I have verified this feature I'm about to request hasn't been suggested before.

**Describe the enhancement you want to request**

When users pass `--model free` to `teamcode run` or the TUI, the CLI should randomly select from available free models on the teamcode provider. Combined with `--variant any`, it should also randomly choose a variant for the selected model.

Useful for exploration, testing, and cost-free experimentation across the model catalog.

Adds `Provider.resolveSelection()` which filters for teamcode provider models with zero cost and a recognized listing name, picks one at random, and optionally picks a random variant.

---

## #21847 — [FEATURE]: In the update available toast, make the version number clickable and open the tag page

📅 `2026-04-10` | ✏️ **BigtoC** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21847](https://github.com/anomalyco/opencode/issues/21847)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Every time when I see "Update available" toast, I want to know what's new in the release. But I have to go to the browser enter GitHub project url to check.

---

## #21842 — [FEATURE]: Add teamcode-bmad-workflow plugin to ecosystem — BMAD workflows for epic, feature, sprint and code review

📅 `2026-04-10` | ✏️ **Alex-stack-cell** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/21842](https://github.com/anomalyco/opencode/issues/21842)


## Problem or need being solved

There is no built-in way to run structured BMAD product workflows (epic definition, feature PRD, sprint planning, code review) directly inside teamcode. Users who follow BMAD methodology have to switch between tools and manage documentation manually.

## Proposed solution

A community plugin that automates BMAD workflows through specialized sub-agents:

| Workflow | Agent chain | Output |
|----------|------------|--------|
| `workflow_epics` | Analyst | Roadmap overview from `.workflow/epics/` |
| `workflow_epic` | PM → PM | Epic definition + feature list |
| `workflow_feature` | PM → Architect → PM | PRD + Architecture + Task breakdown |
| `workflow_sprint` | PM → PM | Sprint plan + User stories |
| `workflow_review` | Analyst → Reviewer | Code analysis + Review report |

Two modes available:
- **Plugin tools** (`workflow_*`) — fully automated
- **Slash commands** (`/workflow-*`) — interactive, with validation checkpoints at each step

Models are not hardcoded — agents inherit the global model from `teamcode.json`, with an optional `model:` override per agent.

**Repo:** https://github.com/Alex-stack-cell/teamcode-bmad-workflow

## Verification

- [x] I have checked that this feature doesn't already exist in teamcode

---

## #21821 — [FEATURE]:所有的hook应该具有统一的，完整的环境信息，便于插件开发

📅 `2026-04-10` | ✏️ **ghost** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21821](https://github.com/anomalyco/opencode/issues/21821)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

目前明确发现event HOOK，中几个类别没有当前选定的开发模式信息，我认为，所有的hook都应该具备统一的，完整的环境信息

---

## #21787 — [FEATURE]:Automatic update of skills

📅 `2026-04-10` | ✏️ **AMianSleepy** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21787](https://github.com/anomalyco/opencode/issues/21787)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

skills are also constantly updated and upgraded. It is hoped that the skills equipped in teamcode can be automatically updated to the latest version.
skills也是会不断更新升级的，希望能将opencode所装备的skills自动更新为最新版本

---

## #21771 — [FEATURE]: /tool, /status, /exec server endpoints

📅 `2026-04-09` | ✏️ **micuintus** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21771](https://github.com/anomalyco/opencode/issues/21771)


- [x] I've checked that this feature hasn't been suggested before.

## TL;DR

Add three new server API endpoints: `/tool` (inject external tool results), `/status` (report status/progress), and `/exec` (execute tools by name). These enable plugins to interact with sessions programmatically.

## More detail

- **POST /session/:id/tool** — Injects an external tool call + result into a session. Uses the `external` flag on `ToolPart` to mark results as externally produced. Depends on the `external` flag PR.
- **POST /session/:id/status** — Appends a status/progress message to a session. Useful for plugins to report progress of long-running operations.
- **POST /session/:id/exec** — Executes a registered tool by name with given arguments, returning the result. Enables plugins to invoke teamcode's built-in tools programmatically.

Part of the plugin primitives work tracked in #20018 (split from #21687).

---

## #21770 — [FEATURE]: bash.commands hook for CLI command timeout exemption

📅 `2026-04-09` | ✏️ **micuintus** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21770](https://github.com/anomalyco/opencode/issues/21770)


- [x] I've checked that this feature hasn't been suggested before.

## TL;DR

Add a new `bash.commands` plugin hook that lets plugins register CLI commands which should be exempt from the bash tool's execution timeout.

## More detail

Plugins may provide CLI tools (via PATH injection) that are long-running by design (e.g. a plugin CLI that communicates with the teamcode server to perform multi-step operations). These commands get killed by the bash tool's timeout.

The `bash.commands` hook lets plugins declare command names that should bypass the timeout. The bash tool checks if the command being executed starts with any registered command name and skips the timeout if so.

Part of the plugin primitives work tracked in #20018 (split from #21687).

---

## #21769 — [FEATURE]: add startServer() to PluginInput

📅 `2026-04-09` | ✏️ **micuintus** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21769](https://github.com/anomalyco/opencode/issues/21769)


- [x] I've checked that this feature hasn't been suggested before.

## TL;DR

Expose a `startServer()` function on `PluginInput` so plugins can programmatically start the teamcode HTTP server on demand.

## More detail

Plugins that need to interact with the teamcode server API (e.g. to inject tool results or report status) currently have no way to ensure the server is running. The server is normally only started when the TUI or `server` CLI command is used.

Adding `startServer()` to `PluginInput` lets plugins lazily start the server when they need it. The function is idempotent — calling it multiple times returns the same server instance.

The type is also exported from the `@teamcode/plugin` package.

Part of the plugin primitives work tracked in #20018 (split from #21687).

---

## #21767 — [FEATURE]: expand shell.env hook context with messageID and agent

📅 `2026-04-09` | ✏️ **micuintus** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21767](https://github.com/anomalyco/opencode/issues/21767)


- [x] I've checked that this feature hasn't been suggested before.

## TL;DR

Expand the `shell.env` plugin hook trigger in `bash.ts` to include `messageID` and `agent` in the context, so plugins know which message and agent triggered a bash command.

## More detail

The `Plugin.trigger("shell.env", ...)` call in `bash.ts` currently passes minimal context. Plugins that need to set environment variables conditionally (e.g. only for agent-initiated commands, or per-message) have no way to know which message or agent triggered the shell invocation.

This change adds `messageID` and `agent` to the trigger context for the `bash.ts` call site only (the other call sites in `prompt.ts` and `pty/index.ts` are for user-initiated commands and are a separate concern).

Part of the plugin primitives work tracked in #20018 (split from #21687).

---

## #21766 — [FEATURE]: add `external` flag to ToolPart

📅 `2026-04-09` | ✏️ **micuintus** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21766](https://github.com/anomalyco/opencode/issues/21766)


- [x] I've checked that this feature hasn't been suggested before.

## TL;DR

Add an optional `external: boolean` flag to `ToolPart` in the message schema, so plugins can mark tool call results as externally produced (not from the built-in tool execution pipeline).

## More detail

Currently, `ToolPart` has no way to indicate whether the tool result was produced by the core tool runner or injected externally (e.g. by a plugin providing its own tool results via the server API). This flag enables downstream consumers (TUI, plugins) to distinguish externally-produced results.

This is a prerequisite for the server `/tool` endpoint (which injects external tool results into sessions).

Part of the plugin primitives work tracked in #20018 (split from #21687).

---

## #21760 — [FEATURE]: Session Summarization with New Session Creation

📅 `2026-04-09` | ✏️ **PVLPM** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21760](https://github.com/anomalyco/opencode/issues/21760)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary

Add a feature to summarize the current session's context and seamlessly start a new session with that summary auto-loaded, enabling users to continue long-running tasks without losing critical information to context window limits or compaction-induced hallucinations/truncation.

---

## Detailed Description

### Problem Statement

When working on complex, multi-step tasks that span many turns, users eventually hit context window limits. The current options are:

1. **Compaction** — Compresses conversation but is **lossy** (information gets truncated/hallucinated)
2. **Manual copy-paste** — Tedious, error-prone, loses context granularity
3. **Start fresh** — Lose all context, decisions, and progress (if no memory plugin is installed)

This creates a gap for users doing long implementation chains where continuity matters.

### Proposed Solution

Implement a **session summarization + new session creation** flow:

1. **Trigger**: Button in UI (over input field) + automatic warning at threshold (e.g., 50% context (can be configurable)) + slash command (e.g., `/summarize-to-new`)
2. **Process**: Creates a new session with a system prompt referencing the old session ID
3. **Transfer**: The new session's AI automatically reads and summarizes the referenced session's context
4. **Result**: User l

> *[Truncado — 6163 chars totais]*

---

## #21758 — [FEATURE]: Allow opening skills search with a keybind

📅 `2026-04-09` | ✏️ **raine** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21758](https://github.com/anomalyco/opencode/issues/21758)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please allow opening skills search popup with a keybind.

At least https://teamcode.ai/docs/keybinds/ does not list skills as possible option for something to add a keybind for.

---

## #21753 — feat(bash): add env parameter for setting environment variables

📅 `2026-04-09` | ✏️ **taxilian** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21753](https://github.com/anomalyco/opencode/issues/21753)


## Verification
- [x] I have verified that this issue has not already been suggested

## Enhanced Capability Request

### Description
Allow plugins to inject arbitrary environment variables into bash commands.

### Use Case
My use case is in a plugin I use I can inject env vars (like `AGENT_MODE`, `AGENT_ID`) into bash commands via an optional `env` parameter on the bash tool. There are many plugins which want to do things like this, this would let any of them do it without requiring weird hacks or special extra features added to teamcode.

This would allow a plugin to address #9292 and #15739, among others.

Other 

### Current Status
This capability is still needed. Current workarounds are causing issues and do not scale well.

The current workaround is to modify the command whenever a bash command is made and add the variable into the command; this can interfere with other features, though, and I've seen the agent get confused by it and start adding additional unneeded variables in for other commands, somehow thinking that it was needed. On three occasions I've seen the agent get confused and start using bad bash syntax as well.

---

## #21752 — [FEATURE]: Expose session description or metadata storage in the SDK

📅 `2026-04-09` | ✏️ **VooDisss** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21752](https://github.com/anomalyco/opencode/issues/21752)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Describe the enhancement you want to request

Please expose a way to store more session-level data through the SDK.

Today `client.session.update(...)` lets us update the session title, but not add something like a `description` or a small metadata field. We need a small amount of extra session-level data stored in TeamCode itself instead of a separate plugin store.

At minimum, a `description` field on sessions would solve this. A generic metadata storage field would also work.

---

## #21742 — [FEATURE]: Built-in "Ask" Agent for Codebase Discovery and Brainstorming

📅 `2026-04-09` | ✏️ **iTiPo** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21742](https://github.com/anomalyco/opencode/issues/21742)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

### 1. The Problem / Motivation
I am recently migrating to TeamCode from Cursor, and while I am really enjoying the TeamCode experience, there is one critical workflow feature I deeply miss: a dedicated **"Ask" Agent**. 

I know TeamCode already has an excellent **"Plan"** agent, but I often find myself needing to deeply analyze the existing code and brainstorm approaches *before* I actually know what to ask the Plan agent to do. Currently, this initial discovery phase feels fragmented. I need a safe, read-only environment to explore the codebase so I can formulate a clear, accurate request for the Plan agent.

### 2. Feature Description
I propose implementing a new built-in primary agent called **"Ask"**. 

Unlike agents designed to mutate code or write step-by-step implementation plans, the "Ask" agent would be tailored strictly for read-only exploration, Q&A, and high-level project reasoning. 

It establishes a robust, 3-step workflow: **Ask** (Discover) -> **Plan** (Outline) -> **Build** (Execute).

It would leverage full codebase context to help developers:
*   **Deep Dive:** Ask complex questions about how different parts of the repository interact or where specific logic lives.
*   **Brainstorm:** Discuss potential architectural decisions, design patterns, or refactoring strategies without im

> *[Truncado — 2865 chars totais]*

---

## #21734 — [FEATURE]: Image count indicator and dimension warning in TUI to prevent session-bricking 2000px API errors

📅 `2026-04-09` | ✏️ **anas-asghar4831** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21734](https://github.com/anomalyco/opencode/issues/21734)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

When a session accumulates more than 20 images, Anthropic's API enforces a stricter 2000px dimension limit per image. If any image exceeds this, the API returns:

`
At least one of the image dimensions exceed max allowed size for many-image requests: 2000 pixels
`

**The session is then permanently bricked** — every subsequent message fails because the oversized image persists in history. There is no recovery, no warning, and no visibility into how close you are to the threshold.

This has been reported repeatedly (#12068, #13865, #14562, #19525) but all existing solutions focus on auto-resizing after the fact. **No solution provides proactive visibility to the user.**

## Proposal

Add image tracking to the TUI that gives users visibility before the limit is hit:

### 1. Image counter in the session footer

Show the current image count alongside existing stats:

`
~/project    142 tok/s · 4.5M in · 19K out · img 18/20 · • 2 LSP · ⊙ 1 MCP
`

When approaching the limit (e.g., 18+), change color to yellow/red:

`
~/project    142 tok/s · 4.5M in · img 19/20 ⚠ · • 2 LSP
`

### 2. Pre-send dimension warning

Before sending a message containing an image that exceeds 2000px when the session already has 15+ images, show a warning:

`
⚠ Session has 19 images. This image is 2400×1200px (exceeds 2

> *[Truncado — 3279 chars totais]*

---

## #21690 — [FEATURE] Add Quartaly as a recognized provider in teamcode models list

📅 `2026-04-09` | ✏️ **clawdiobotelho** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21690](https://github.com/anomalyco/opencode/issues/21690)


Currently Quartaly API models are not showing in the `teamcode models` list. Quartaly provides a OpenAI-compatible and Anthropic-compatible API at `https://api.quatarly.cloud` with various models including claude-opus-4-6-thinking, claude-sonnet-4-6-thinking, gpt-5.4, gemini-3.1-pro, etc.

## Root Cause
The ProviderID schema is hardcoded in the teamcode binary and only includes a fixed set of providers:
```
openrouter, anthropic, openai, google, google-vertex, github-copilot, amazon-bedrock, azure, mistral, gitlab
```

Any custom provider (like quartaly) that isn't in this list won't be shown in `teamcode models`, even when credentials are configured in auth.json.

## Current workaround
Custom providers can be configured in `~/.openclaw/agents/main/agent/models.json` for the openclaw agent, but this doesn't affect the teamcode model selector `/models`.

## Request
Add `quartaly` to the list of recognized ProviderIDs so that:
1. The quartaly API credentials stored in `auth.json` are picked up
2. Quartaly models appear in `teamcode models` output
3. Users can select Quartaly models via the model selector UI

## API Details
- **Quartaly OpenAI-compatible**: `https://api.quatarly.cloud/v1` (models: claude-sonnet-4-6, claude-opus-4-6-thinking, gpt-5.2-codex, gemini-3.1-pro-high, etc.)
- **Quartaly Anthropic-compatible**: `https://api.quatarly.cloud/` (models: claude-haiku-4-5-20251001, claude-opus-4-6-thinking, etc.)
- **API Key**: stored as `QUATARLY_API_KEY` env var

---

## #21686 — [FEATURE]: Add preview button to skills list

📅 `2026-04-09` | ✏️ **mislimiramo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21686](https://github.com/anomalyco/opencode/issues/21686)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, when running /skills in the TUI, users see a list of skills with names and descriptions but cannot preview the full `SKILL.md` content before invoking a skill.

**Request:** Add a "Preview" button to each skill in the /skills dialog that opens a modal displaying the full `SKILL.md` content with:
- Markdown rendering (code blocks, tables, syntax highlighting)
- Skill metadata (name, description, source path)
- Optional actions: Copy to Clipboard, Invoke Skill

**Benefits:**
- Better discoverability. Users understand what each skill actually does
- Reduces trial-and-error when selecting skills
- Users can read full instructions before invoking
- Consistent with `/models`, `/sessions` patterns

**Implementation approach:**
- Add preview button to existing `DialogSkill` component
- Create preview modal using `MarkdownRenderable` from `@opentui/core` (same component used for AI responses in TUI)
- Use existing `Skill.Info.content` field (already returned by SDK's `app.skills()` endpoint)
- No new dependencies required

**Additional note:**
I'm happy to implement this feature myself. Happy to discuss the approach before starting implementation.

---

## #21684 — [FEATURE]: Instead of using `/tmp`, use a session-specific subdirectory.

📅 `2026-04-09` | ✏️ **Yoric** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/21684](https://github.com/anomalyco/opencode/issues/21684)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Using TeamCode + Sonnet, I regularly find the agent requesting access to `/tmp` to perform an experiment. I'd feel safer if it only requested access to `/tmp/teamcode/some-current-session-id`, as this would limit any blast radius.

---

## #21680 — [FEATURE]: Add -w flag for isolated workspace sessions (Claude Code parity)

📅 `2026-04-09` | ✏️ **hassan-a2h** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21680](https://github.com/anomalyco/opencode/issues/21680)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Coming from Claude Code, really miss the "-w" flag that lets you work on isolated parallel sessions within a single terminal instance. It's a game-changer for multitasking.

**The workflow in Claude Code:**
- "claude -w feature-a" → starts isolated session for feature-a
- "claude -w feature-b" → switches to another isolated session  
- Both maintain separate context, history, and file state
- No need for multiple terminal windows

**Current friction in TeamCode:**
To work on two different branches/features in parallel, have to either:
1. Open multiple terminal tabs with separate "teamcode /path/to/project" processes
2. Set up "teamcode serve" on different ports and attach (overkill for quick tasks)

**Proposed solution:**
Add a "-w, --workspace" flag that creates/switches between named isolated contexts:

```bash
# Create or switch to workspace
teamcode -w feature-branch-name

# List workspaces
teamcode -w --list

# Switch context
teamcode -w another-feature
```

**Why this matters:**
- **Session isolation**: Each workspace has independent session history, file context, and MCP state
- **Git worktree friendly**: Natural pairing with git worktrees for parallel branch work
- **Cleaner workflow**: One terminal, multiple contexts instead of window juggling
- **Migration path**: Makes it easier for Claud

> *[Truncado — 1948 chars totais]*

---

## #21676 — [FEATURE]:Add Hebrew (he) localization with RTL layout support

📅 `2026-04-09` | ✏️ **uhbudrs** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21676](https://github.com/anomalyco/opencode/issues/21676)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add Hebrew (he) localization with RTL layout support

teamcode currently ships with 17 languages but no Hebrew or RTL support. The app already uses CSS logical properties in many places, so RTL adaptation is feasible.

Would the maintainers be open to a PR adding:

he locale for packages/app, packages/console, packages/ui, packages/desktop(-electron)
Hebrew docs entries under packages/docs/he/
RTL layout fixes (logical CSS props, directional icon flipping, etc.)
If yes, I have a branch ready and will link it after approval.

<img width="1920" height="1020" alt="Image" src="https://github.com/user-attachments/assets/f43e4536-d73c-4eb3-95d4-dd05cb6c9915" />

<img width="1920" height="1020" alt="Image" src="https://github.com/user-attachments/assets/b60b21cc-5a02-412c-8b79-be7cda4c771a" />

---

## #21660 — [FEATURE]: can you provide compatibility of auto memory and auto dream of claude code

📅 `2026-04-09` | ✏️ **it-indrayasamigasa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21660](https://github.com/anomalyco/opencode/issues/21660)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I hope the auto dream and auto memory features can be compatible with teamcode because it is very good for memory context.

---

## #21658 — [FEATURE]: Azure AI Foundry Microsoft Entra (OAuth) authentication

📅 `2026-04-09` | ✏️ **NoTuxNoBux** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21658](https://github.com/anomalyco/opencode/issues/21658)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

It appears Microsoft Entra authentication with the Azure AI Foundry is not supported yet (or I can't find anything about it 😉).

A customer of ours deployed Anthropic models in an Azure AI Foundry with a custom base URL and provided instructions only for Anthropic CLI. The existing provider relies on an API key, but the customer expressly does not want to provide one to strengthen security and enforces Entra authentication using the Azure CLI instead.

These are the steps they document (not using TeamCode):
1. `export ANTHROPIC_FOUNDRY_BASE_URL=https://their-custom-domain.azure-api.net/ai/anthropic`
2. `export CLAUDE_CODE_USE_FOUNDRY="1"`
3. `az login` to sign in to Azure using Entra Authentication (OAuth).
4. `claude run`

Steps 1, 2 and 4 appear already possible with TeamCode (https://github.com/anomalyco/opencode/issues/4474#issuecomment-3560959500), but for 3 an API key is expected by TeamCode instead.

They also mention the Azure CLI session can expire every so often (10 hours in their case), in which case `az logout` followed by `az login` is required - mentioning it as reauthenticating might be relevant for TeamCode also.

---

## #21654 — [FEATURE]: Session synchronization

📅 `2026-04-09` | ✏️ **disrei** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21654](https://github.com/anomalyco/opencode/issues/21654)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

We would like to add a session synchronization function between multiple machines.

---

## #21635 — [FEATURE]:LOC count

📅 `2026-04-09` | ✏️ **suhaasteja** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21635](https://github.com/anomalyco/opencode/issues/21635)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

LOC count of current directory / project

---

## #21631 — [FEATURE]:内置工具编码问题，我是用中文引擎代码只支持GBK

📅 `2026-04-09` | ✏️ **expfukck** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21631](https://github.com/anomalyco/opencode/issues/21631)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

使用过插件 但是会很多未知问题，有办法解决这个吗 支持任何编码格式吗？

---

## #21630 — [FEATURE]: x-teamcode-session equivalent for non-teamcode providers

📅 `2026-04-09` | ✏️ **peersky** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21630](https://github.com/anomalyco/opencode/issues/21630)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

maybe duplicate of https://github.com/anomalyco/opencode/issues/20847, im not sure. 

Basically - provide session identifiers for a stateful LLM providers to work efficiently with session identifiers. 
Currenly this exists in `x-teamcode-session` but requires to have `teamcode-*` provider prefix. In theory one could just rename his custom provider to `teamcode-<whatever>` to workaround this, however if my case a requests API is required and there is no other way to get it for custom model unless you specify non-`teamcode-` prefix to enable defaulting in responses. 


That said, only workaround to use responses API + have session persistence involves hashing session by message history, which has own complexities to consider.

---

## #21619 — [FEATURE] Add option to delete conversations from RECENTS list

📅 `2026-04-09` | ✏️ **Huoxiaoxie** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21619](https://github.com/anomalyco/opencode/issues/21619)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature Request: Add option to delete conversations from RECENTS list

### Problem
In TeamCode 0.3.6, there is no way to delete individual conversations or clear the RECENTS list. Users have no control over their conversation history in the UI.

### Use Case
- Users want to maintain privacy by removing old/unwanted conversations
- Keep the RECENTS list clean when working on different projects
- Remove conversations that are no longer relevant

### Proposed Solution
Add a delete/remove option for individual conversations in the RECENTS list:
1. Right-click context menu option: "Delete" or "Remove"
2. Or swipe-to-delete gesture on touch devices
3. Or a bulk "Clear All" option in settings

### Expected Behavior
- Delete single conversation: removes only that conversation
- Clear All: removes all conversations from RECENTS (with confirmation dialog)

### Additional Context
- Version: 0.3.6
- Platform: macOS

---

## #21610 — [FEATURE]:need to disable plugins in .claude

📅 `2026-04-09` | ✏️ **Kyrie666** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21610](https://github.com/anomalyco/opencode/issues/21610)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

some plugins in .claude may work error，need to disable

---

## #21595 — [FEATURE]: Add CHANGELOG.md to repository

📅 `2026-04-09` | ✏️ **moscovium-mc** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21595](https://github.com/anomalyco/opencode/issues/21595)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently the project changelog is only available on the official website. Adding it to the repository would make it easier for developers and contributors to review release history directly from GitHub.

This would be a documentation-only addition.

---

## #21590 — [FEATURE]: Session status management (Todo, Done, Backlog, etc.) for organizing AI sessions

📅 `2026-04-09` | ✏️ **leoncheng57** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21590](https://github.com/anomalyco/opencode/issues/21590)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Problem

Currently, TeamCode sessions are a flat list with no way to organize or track their status. When working on multiple tasks across sessions, there's no way to mark sessions as "todo", "in progress", "done", "needs review", etc.

Existing issues like #18071 and #18564 address *task-level* todo lists within sessions, but this is about **session-level status management** — treating each AI session itself as a trackable work item.

## Proposed Feature

Add session statuses and organization. For reference, [Craft Agent](https://agents.craft.do/) implements this nicely in their desktop app (screenshot attached below):

- **Statuses**: Backlog, Todo, Needs Review, Done, Cancelled, Flagged, Archived
- **Sidebar filtering**: Sessions sorted/grouped by status for easy navigation
- **Labels**: User-defined tags for categorizing sessions (e.g., by project, priority)
- **Agent self-management**: Allow the agent to set its own session status (e.g., mark as "done" when finished)

## Use Cases

1. **Multi-task workflows** — Keep track of which coding sessions need attention vs. are complete
2. **Review workflow** — Mark sessions as "Needs Review" for human follow-up
3. **Automation triggers** — Status changes could trigger webhooks or downstream actions
4. **Session hygiene** — Archive old sessions, flag

> *[Truncado — 2014 chars totais]*

---

## #21587 — [FEATURE]: Bedrock Guardrail Support

📅 `2026-04-08` | ✏️ **yusufpapurcu** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21587](https://github.com/anomalyco/opencode/issues/21587)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

`@ai-sdk/amazon-bedrock` supports AWS Bedrock Guardrails via a per-request `providerOptions.bedrock.guardrailConfig` parameter, but **teamcode does not expose any way to configure it**. The only `amazon-bedrock` provider options documented/accepted by teamcode are `region`, `profile`, and `endpoint`.

This makes teamcode incompatible with any AWS environment where the IAM policy granting Bedrock access includes a `bedrock:GuardrailIdentifier` condition — a common enterprise security pattern used to enforce that all model invocations pass through a configured guardrail.

## Example blocking IAM policy
```json
{
  "Effect": "Allow",
  "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
  "Resource": ["arn:aws:bedrock:eu-west-1:...:application-inference-profile/..."],
  "Condition": {
    "StringEquals": {
      "bedrock:GuardrailIdentifier": "arn:aws:bedrock:eu-west-1:...:guardrail/..."
    }
  }
}
```
With this policy, every `InvokeModel*` request must include a `guardrailIdentifier` in the request body. Since teamcode never sets `providerOptions.bedrock.guardrailConfig`, requests are rejected with `AccessDeniedException` — even though the principal has the matching resource permission.

## Upstream SDK shape (`@ai-sdk/amazon-bedrock`)
Per-request option:
```typescript
provide

> *[Truncado — 1837 chars totais]*

---

## #21585 — [FEATURE]: Inline image attachments don't include trigger text for skill auto-activation

📅 `2026-04-08` | ✏️ **divitkashyap** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21585](https://github.com/anomalyco/opencode/issues/21585)


## Problem

When TeamCode shows inline image previews in the chat, it displays just the filename (e.g., `filename.png`) without any surrounding trigger words like "analyze", "screenshot", "describe", or "look at".

Skills like `vision-analysis` are configured to auto-activate when the message contains these trigger words. However, since inline images only show the filename without any such context words, the skill never auto-activates.

**Without trigger words:** Agent doesn't know what to do → says "API requires valid key" and gives up.
**With trigger words adjacent to image:** Skill auto-activates → agent uses correct tool → works.

## Expected Behavior

Skills with text trigger patterns should be able to auto-activate even when the image is shown inline, because the skill's activation depends on text adjacent to the image in the message.

## Example

User sends: "[inline image: screenshot.png]"

TeamCode displays: Just `screenshot.png` with no trigger words

Agent receives: No trigger words in the text portion → vision-analysis skill doesn't activate

## Proposed Solution

The inline image rendering should either:
1. Include trigger words in the text that gets sent to the agent (e.g., "look at this image: screenshot.png")
2. Extract trigger words from the filename itself (e.g., "Screenshot" from "Screenshot 2026-04-08 at 2.54.51 pm.png" normalizes to "screenshot" which IS a trigger word)
3. Or ensure that the skill activation logic considers image attachments as implicit t

> *[Truncado — 2442 chars totais]*

---

## #21578 — [FEATURE]: Restore per-session auto-accept permissions toggle in Desktop UI

📅 `2026-04-08` | ✏️ **gabriel-ferraresi** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21578](https://github.com/anomalyco/opencode/issues/21578)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Description

In v1.4.0, the auto-accept permissions button was moved from the session-level UI to global Settings. This removed the ability to toggle auto-accept **per session**, which was a highly practical workflow feature.

## Previous Behavior (v1.3.x)

- A toggle/icon was available directly in the session UI
- - Users could enable auto-accept for a specific session without affecting other sessions
- - - This allowed a quick "trust this session" workflow - one click and the session flowed without interruptions
- - - - When starting a new session, permissions defaulted back to the configured behavior
## Current Behavior (v1.4.0)

- Auto-accept is now only available as a **global** setting in Settings
- - Enabling it affects **all sessions** across all projects
- - - There is no way to scope auto-accept to a single session anymore
## Why Per-Session Was Better

1. **Granular control**: Users could decide trust level based on the specific task at hand
2. 2. **Safety**: A quick exploratory session could have auto-accept ON, while a production deployment session could keep confirmations
3. 3. **Workflow speed**: One click per session vs. navigating to Settings, toggling, working, then navigating back to toggle off
4. 4. **Principle of least privilege**: Global auto-accept is an all-or-nothing appr

> *[Truncado — 1963 chars totais]*

---

## #21576 — [FEATURE]: Add @thiagos1lva/teamcode-token-usage-chart to ecosystem plugins list

📅 `2026-04-08` | ✏️ **ThiagoS1lva** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21576](https://github.com/anomalyco/opencode/issues/21576)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add @thiagos1lva/teamcode-token-usage-chart to the Ecosystem > Plugins table in docs, with repository link and short description.

---

## #21526 — [FEATURE]: Add teamcode-usage-dashboard to ecosystem plugins

📅 `2026-04-08` | ✏️ **cosmiclasagnadev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21526](https://github.com/anomalyco/opencode/issues/21526)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Add teamcode-usage-dashboard project to ecosystem: https://github.com/cosmiclasagnadev/teamcode-usage

For displaying local usage stats among providers/models

---

## #21525 — [FEATURE]: Recovery path for errored subagent sessions (composer lockout blocks manual continuation after provider failures)

📅 `2026-04-08` | ✏️ **cpkt9762** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21525](https://github.com/anomalyco/opencode/issues/21525)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Not a duplicate of #21458 / #6907

Those issues are about **steering** a running subagent — "I want to change direction mid-flight". The existing reply ("you weren't actually talking to the subagent, it was routed through the primary agent") is valid for that case.

This issue is about a different scenario: **recovery from a terminal error state**, where there is no live primary-agent turn to route to. The design justification for #20708 does not cover this case.

## Problem

When the LLM call inside a subagent session fails in a way that the backend's automatic retry policy can't recover from (non-retryable error, or transient errors that outlast the retry budget), the subagent session enters a halted error state. In v1.4.0 the user has no way to resume it:

1. The subagent composer shows `Subagent sessions cannot be prompted. Back to main session.` (introduced by #20708).
2. There is no "Resume" / "Retry" / "Continue" action on the error banner.
3. The main agent has no mechanism to observe the child failure — it continues executing its own work unaware that one of its delegated tasks died. Even if it noticed, re-delegating from the main session loses the subagent's tool history and partial findings.

The only remaining user action is to abort the main session entirely, losing all in-flight par

> *[Truncado — 5442 chars totais]*

---

## #21516 — MCP stdio transport sends batched requests without proper flush, breaking local servers

📅 `2026-04-08` | ✏️ **divitkashyap** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21516](https://github.com/anomalyco/opencode/issues/21516)


### Description

TeamCode's MCP stdio transport is broken for local MCP servers that expect proper sequential JSON-RPC messages with flush. Requests appear to be batched or not properly flushed, causing authentication to never reach the API.

### Environment

- **TeamCode version:** v1.4.0
- **Platform:** macOS (Apple Silicon)
- **Node/Bun runtime:** Bun

### Repro Steps

1. Set up a local MCP server using stdio transport (e.g., minimax-coding-plan-mcp)
2. Configure it in teamcode as a local MCP server  
3. Call any tool via the MCP server
4. Tool returns "login fail" error from the MCP server

### Observed Behavior

- MCP server starts, initialize handshake completes successfully
- tools/list returns tools correctly
- Calling any tool returns "login fail" from the MCP server
- No useful error logs in TeamCode

### Expected Behavior

- Tools should work via TeamCode's MCP client the same way they work via direct subprocess call

### Root Cause

**Verified working via direct subprocess:**
```bash
uvx minimax-coding-plan-mcp
# sequential writes with flush() → works
# understand_image returns correct analysis
```

**Verified broken via TeamCode:**
- Same MCP server + TeamCode's MCP tool dispatch → "login fail"
- Token Plan quota: 174/1500 (plenty of room)

The bug is in TeamCode's MCP client stdio transport layer. TeamCode likely:
- Batches messages without flushing
- Sends malformed JSON-RPC requests
- Or fails to parse responses properly

### Workaround

Using `uvx` or `uv too

> *[Truncado — 1839 chars totais]*

---

## #21513 — [FEATURE]: Native Qwen Code CLI integration (parity with Codex CLI workflow)

📅 `2026-04-08` | ✏️ **yart** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21513](https://github.com/anomalyco/opencode/issues/21513)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Please add native integration for **Qwen Code CLI** similar to the existing Codex-style workflow, so users can switch between providers/agents without losing the same tool-driven local coding experience.

Today, users who prefer Qwen-based coding workflows often rely on generic provider setup or custom wrappers. This creates friction compared to more first-class CLI flows.

Requested outcome:
- First-class provider profile/preset for Qwen Code CLI-style usage
- Consistent tool-calling and permission flow with current TeamCode UX
- Clear setup docs and diagnostics for auth/model/tool compatibility
- Smooth model/variant switching without custom hacks

### Why this is useful

- Better provider parity and less vendor lock-in perception
- Easier adoption for teams standardized on Qwen
- Cleaner UX than maintaining custom glue scripts/configs

### Suggested acceptance criteria

- A documented setup path for Qwen Code CLI integration
- Reliable tool invocation behavior equivalent to existing first-class CLI integrations
- Works in TUI/Desktop with standard TeamCode permission and session flows
- Clear error messages for unsupported model/tool combinations

### Additional context

I already use TeamCode Desktop/TUI as my main coding interface. The goal is workflow parity: same permissions/tools/session beh

> *[Truncado — 1725 chars totais]*

---

## #21508 — [FEATURE]: Tool to change agent after plan

📅 `2026-04-08` | ✏️ **dgenezini** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21508](https://github.com/anomalyco/opencode/issues/21508)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, after a plan, the model uses the `ask` tool to ask if I want to execute the change or to ask if I want to change to write mode. Also, sometimes it gets stuck in a loop. I have to cancel, change mode and give command to execute.

It would be great to have a tool `change_agent` that would ask in the UI, like the `ask` tool, what agent to change to.

---

## #21506 — [FEATURE]: unify todo and delegated subagent state into one task model

📅 `2026-04-08` | ✏️ **Strelitzia-reginae** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21506](https://github.com/anomalyco/opencode/issues/21506)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

Related / possible overlaps: #20849, #19215, #12661

### Describe the enhancement you want to request

I'd like TeamCode to unify checklist todo state and delegated subagent state into one task model.

Today:

- `todowrite` tracks a flat checklist
- `task` launches subagents
- both show up in the UX, but they are still separate concepts

Requested behavior:

- a task can represent either planned work or delegated subagent work
- tasks can have dependencies
- tasks can move through `blocked`, `ready`, `in_progress`, `waiting`, `completed`, and `failed`
- a subagent run should appear as a task linked to its child session
- `todowrite` / `todoread` should keep working as a compatibility layer for simple lists

Why I think this is worth calling out separately from the broader agent-team issues:

- #20849 and #19215 are mainly about orchestration / team execution
- this request is about the underlying task state model shared by planning and delegation
- even without full teams or agent-to-agent messaging, dependency-aware task state would improve the UI and make behavior more consistent across different model providers

If maintainers think this belongs under one of the existing issues, I am fine with closing this as a duplicate and moving the discussion there. I mainly wanted to highlight the narrower design point: `todo` and delegated `task` work shou

> *[Truncado — 1559 chars totais]*

---

## #21495 — [FEATURE]: Recursive skill discovery + multi-skill selection in TUI

📅 `2026-04-08` | ✏️ **Flussen** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21495](https://github.com/anomalyco/opencode/issues/21495)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature Request: Recursive skill discovery and multi-skill selection

### Problem
- The `skills` command only discovers skills at the root level (no recursive lookup).
- Only a single skill can be selected per request.
---
### Use Case
Projects with structured skill directories:
project-a/skills/backend/auth.md
project-a/skills/backend/database.md
project-b/skills/frontend/ui.md
- Nested skills are not detected
- It is not possible to combine skills (e.g. `auth` + `database`)
---
### Proposal
1. **Recursive discovery**
   - Load skills using recursive directory scanning (`/skills/**/*.md`)

2. **Multi-skill selection**
   - Allow selecting multiple skills in a single request:
/use auth,database
---

### Expected Behavior
- `skills` lists all skills recursively
- Multiple skills can be selected and applied in one request
---
### Considerations
- Context/token limits when combining skills
- Conflict resolution between skills
---
### Question
Would you accept:
1. Recursive skill loading as a first step
2. Multi-skill support as a follow-up (separate PRs)

---

## #21493 — [FEATURE]:support svn review

📅 `2026-04-08` | ✏️ **YZJ0716** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21493](https://github.com/anomalyco/opencode/issues/21493)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

need support svn, just like git

<img width="435" height="498" alt="Image" src="https://github.com/user-attachments/assets/44eb1e07-fc3d-4ef9-9b3b-61585621de6e" />

---

## #21488 — [FEATURE]: Multiplayer collab in Opencode

📅 `2026-04-08` | ✏️ **harshpreet931** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21488](https://github.com/anomalyco/opencode/issues/21488)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

We were making multiplayer collab in teamcode for a use case, I was building this as a proof of concept to show what's possible for multiple people working in the same session with Chat features via live web socket connections, this proved out to be useful to code reviews and multiple other planning and discussion related stuff, also useful for teaching people.

using web sockets to broadcast presence data between peers in the same session:

- Cursor position
- Input/typing state
- Display name
- Mouse position

I have checked other issues and haven't found anything related to what I was working on. Forked out teamcode to work on this POC.

---

## #21483 — [FEATURE]: Auto-select reasoning effort based on task complexity

📅 `2026-04-08` | ✏️ **naochan3** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21483](https://github.com/anomalyco/opencode/issues/21483)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary
Currently, reasoning effort (variants like low/medium/high) must be manually switched by the user. It would be great if TeamCode could automatically select the appropriate reasoning effort based on the complexity of the task.
## Problem
In v1.4.0, GitHub Copilot Anthropic models moved from a hardcoded `thinking_budget: 4000` to user-selectable `reasoningEffort` variants. This is a great improvement, but users now have to manually switch between variants depending on the task.
- Simple tasks (file search, small edits) waste tokens on `high`
- Complex tasks (architecture decisions, debugging) suffer on `low`
## Proposed Solution
Automatically classify the task complexity and select the reasoning effort:
| Task type | Suggested effort |
|---|---|
| Simple questions, file lookups | low |
| Standard code edits, refactoring | medium |
| Complex design, multi-file debugging | high |
### Possible approaches:
1. **Heuristic-based**: Analyze prompt length, number of files mentioned, keywords (e.g. "debug", "architect", "refactor") to estimate complexity
2. **Two-pass**: Use a fast/cheap model call to classify complexity first, then route to the appropriate effort level
3. **Per-agent defaults**: Allow configuring default effort per agent type (already partially possible, but could be more granular)

> *[Truncado — 1675 chars totais]*

---

## #21435 — [FEATURE]: Show whether the session is local or remote, and which host it is connected to

📅 `2026-04-08` | ✏️ **christian-taillon** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21435](https://github.com/anomalyco/opencode/issues/21435)


When using `teamcode server` on one machine and `teamcode attach` from another device, it is difficult to tell which system the current session is connected to.

Today the UI shows the path, but not whether the session is local vs remote, or which host it is attached to. In practice this makes remote sessions easy to confuse, especially when multiple machines use similar directory layouts.

Requested enhancement:
- show whether the session is local or remote
- show the connected host/system name for remote sessions

Even showing the host next to the existing path would solve this well.

I checked the current plugin API and it does not appear to expose a way to add a persistent sidebar/status UI element for this, so this seems like a core UI feature rather than a plugin.

Benefit:
This would make remote sessions much easier and safer to identify at a glance.

---

## #21412 — [FEATURE]: Pre-submission issue intelligence — duplicate search, repo rules, and smart alternatives

📅 `2026-04-08` | ✏️ **jdocker8** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21412](https://github.com/anomalyco/opencode/issues/21412)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When a user asks TeamCode to file an issue against any repo, the agent should first understand that repo's issue requirements and follow them — before submitting anything. This includes searching for duplicates, respecting content/length policies, following template structure, and offering smart alternatives when a duplicate exists.

This builds on #15079 (template structural compliance) but covers the broader pre-submission workflow that template compliance alone doesn't address.

**What should happen before an issue is created:**

1. Fetch repo issue requirements (`.github/ISSUE_TEMPLATE/`, `CONTRIBUTING.md`, `config.yml`) — understand required fields, labels, title format, and content policies
2. Search for duplicates — if the template has a "verified this hasn't been suggested before" checkbox, actually do the verification
3. If a near-duplicate exists — show the user a link and offer to comment on it, upvote it, or still open a new one
4. Respect content policies — sufficient detail without exceeding length/formatting rules
5. Present the draft for user review before submission

**Real example:** I asked TeamCode to file a feature request on this repo. The compliance bot flagged it as too long and gave a 2-hour fix-or-close deadline. The agent had no awareness of content policies or acceptable 

> *[Truncado — 2112 chars totais]*

---

## #21407 — [FEATURE]: Auto-generate context reports (with user review) when filing issues from any repo

📅 `2026-04-08` | ✏️ **jdocker8** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21407](https://github.com/anomalyco/opencode/issues/21407)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

When a user wants to file an issue from within an TeamCode session — for any repository, not just TeamCode's own — TeamCode should offer to generate a structured context report from the current session, present it for user review and approval, and then attach the approved content to the issue body before submission. This is equally useful whether the user is filing a bug against TeamCode itself, a feature request for aws-cli, a regression report for Next.js, or an issue in their own team's private repo.

**Current behavior:**

When a user wants to file an issue, they must manually reconstruct relevant context — what they were doing, what tools were involved, what their environment looks like, and (for bugs) what went wrong. For feature requests, useful context like what workflow prompted the idea, what the user was trying to accomplish, and what the current environment supports gets lost unless the user thinks to include it. This is tedious and results in lower-quality issues across all issue types.

**Desired behavior:**

1. When the user initiates issue filing (via a slash command, `gh issue create`, or a future built-in mechanism), TeamCode prompts: *"Would you like me to generate a context report for this issue?"*
2. Based on the issue type, TeamCode generates a tailored report from session cont

> *[Truncado — 7482 chars totais]*

---

## #21400 — [FEATURE]: Clone/Fork a session into a different project

📅 `2026-04-08` | ✏️ **tmdgjs2592** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21400](https://github.com/anomalyco/opencode/issues/21400)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Currently, there is no way to move or clone the current session into another project through UI. I would like to add this feature. 

While working with agents, sometimes you come across knowledge that is more relevant to other projects. This functionality helps with keeping sessions clean and relevant to each project.

---

## #21396 — [FEATURE]: adding local OLLAMA model to teamcode natively

📅 `2026-04-07` | ✏️ **alexandre-leng** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/21396](https://github.com/anomalyco/opencode/issues/21396)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

Hi,

It would be very valuable to provide a for teamcode a  more seamless and native integration with ollama. At the moment, using Ollama with teamcode requires manual configuration, such as setting up custom endpoints or relying on intermediary tools, which adds unnecessary friction to the developer experience.

---

## #21393 — [FEATURE]: Tell me when I wrote an invalid skill

📅 `2026-04-07` | ✏️ **vegerot** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21393](https://github.com/anomalyco/opencode/issues/21393)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

I just spent nearly half an hour figuring out why my skill doesn't work.  Turns out the YAML frontmatter can't be split on two lines like normal markdown/HTML can:

```markdown
---
name: bad-frontmatter
description: This frontmatter is invalid
This line breaks YAML
---

# Bad Skill

```

We should add a feature to TeamCode where it will warn you when it finds an invalid `SKILL.md`

---

## #21362 — [FEATURE]: Project-level Auto-Start Custom Servers

📅 `2026-04-07` | ✏️ **PVLPM** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21362](https://github.com/anomalyco/opencode/issues/21362)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Summary

Add support for defining **custom project servers** (e.g., Vite, Next.js, custom scripts) in the TeamCode project configuration, with the ability to **auto-start them when the project opens** and manage them through a unified server panel.

## Problem Statement

When working on a project that requires a dev server (Vite, Next.js, etc.), developers currently must:

1. Open TeamCode for the project
2. Manually open a separate terminal
3. Run `pnpm dev` (or similar)
4. Find the URL and open in browser

This breaks the flow of starting a coding session and means the dev server state is completely disconnected from the TeamCode workspace.

## Proposed Solution

Add a `servers` configuration array to `teamcode.json` that lets projects define auto-managed servers:

```jsonc
{
  "servers": [
    {
      "name": "Vite Dev",
      "command": "pnpm dev",
      "startOn": "project.open", // "project.open" | "manual"
      "port": 8080,
      "openInBrowser": true,
      "url": "http://localhost:8080",
    },
  ],
}
```

### Behavior

- **`startOn: "project.open"`**: When TeamCode opens a project, automatically run the server command in the background and make it accessible from a "Servers" panel in the UI
- **`startOn: "manual"`**: Show the server in the Servers panel but don't auto-start it
- **Ser

> *[Truncado — 8529 chars totais]*

---

## #21356 — [FEATURE]: Add /fork command to the website documentation

📅 `2026-04-07` | ✏️ **wagslane** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21356](https://github.com/anomalyco/opencode/issues/21356)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

The `/fork` command currently doesn't have an entry on https://teamcode.ai/docs/tui#commands

I'd love to be able to link to it in the course I'm working on.

---

## #21351 — [FEATURE]: Interactively selected model resets to agent default when switching between Plan and Build modes (TUI)

📅 `2026-04-07` | ✏️ **VeerGoiporia** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21351](https://github.com/anomalyco/opencode/issues/21351)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

**What do you want to change or add?**
When you interactively select a model (via /models) in the TUI, that selection should persist for the session when switching between Plan and Build modes using Tab. Currently, each mode switch resets the model back to whichever default is configured for that agent (or the global default if none is set).

**What are the benefits of implementing this?**
The current behaviour creates unnecessary friction for anyone who wants to use a non-default model for a session. A common workflow is: pick a cheaper/faster model (e.g. Haiku) at the start of a session, then freely switch between Plan and Build as needed without having to re-select the model each time. Right now you have to re-select after every mode switch, which is easy to miss — meaning you can silently end up using a more expensive model than you intended.
A session-level model selection should take precedence over per-agent config defaults for the duration of that session. Switching modes should carry the current model forward unless explicitly changed.
Relates to #6636, which describes a similar issue with subagent model state affecting plan/build modes.

---

## #21345 — [FEATURE]: Move git/PR instructions out of bash tool description to save ~1.7K tokens per request

📅 `2026-04-07` | ✏️ **DrDexter6000** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21345](https://github.com/anomalyco/opencode/issues/21345)


﻿## Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

## Describe the enhancement you want to request

I was profiling why a fresh TeamCode session starts at ~40K tokens. I downloaded all 16 tool .txt files from `packages/teamcode/src/tool/` and measured them.

**bash.txt is 9,288 characters (~2,654 tokens). But 63% of it has nothing to do with running bash commands.** The git commit workflow and PR creation instructions account for 5,874 characters (~1,678 tokens) — those are procedural guides, not bash execution semantics.

Here's the thing: tool descriptions are sent with every single API request and are **not cacheable**. System prompt text, on the other hand, **is** cacheable (Anthropic prompt caching, OpenAI cached prefix). So those git/PR instructions are being paid for on every turn, even when the user never asks for a commit or PR.

The fix is straightforward: move the `# Committing changes with git` and `# Creating pull requests` sections from `bash.txt` into the system prompt template. The model still sees the same instructions — just through a cacheable channel instead of a non-cacheable one.

For reference, here's the full breakdown I measured:

- bash.txt: 9,288 chars (~2,654 tokens) — 63% git/PR instructions
- task.txt: 3,799 chars (~1,085 tokens)
- multiedit.txt: 2,406 chars (~687 tokens)
- edit.txt: 1,369 chars (~391 tokens)
- apply_patch.txt: 1,092 chars (~312 tokens)
- read.txt: 1,1

> *[Truncado — 2168 chars totais]*

---

## #21337 — [FEATURE]:Add configuration option to hide input placeholder text

📅 `2026-04-07` | ✏️ **MikeSoton** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21337](https://github.com/anomalyco/opencode/issues/21337)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

## Feature description
Add a configuration option to hide the placeholder text inside the input field (e.g., "Ask anything...", "Type a message...").
## Current behavior
The input field always displays placeholder text. There is no configuration option to disable or hide it. The `tui.tips` option only controls the status bar hints at the bottom, not the input placeholder itself.
## Proposed solution
Add an `input_placeholder` property to the `tui.json` configuration:
```json
{
  "$schema": "https://teamcode.ai/tui.json",
  "input_placeholder": false
}
Or alternatively, allow setting it to a custom string or empty string:
{
  "$schema": "https://teamcode.ai/tui.json",
  "input_placeholder": ""
}
Use case
- Users who prefer a cleaner input area
- Users who already know how to use TeamCode and don't need the hints
- Consistency with other UI customization options like tips

---

## #21318 — [FEATURE]: Add support for openrouter/kwaipilot/kat-coder-pro-v2

📅 `2026-04-07` | ✏️ **bannert1337** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21318](https://github.com/anomalyco/opencode/issues/21318)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

KAT-Coder-Pro V2 is a model by Kwaipilot without reasoning showing very strong coding performance against even reasoning models and being much faster.

It would be a great addition to TeamCode as a model focused on coding only.

---

## #21284 — [FEATURE]: Import sessions API

📅 `2026-04-07` | ✏️ **drkaangunduz** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21284](https://github.com/anomalyco/opencode/issues/21284)


### Feature hasn't been suggested before.

- [x] I have verified this feature I'm about to request hasn't been suggested before.

### Describe the enhancement you want to request

teamcode has the capability to import a session via its CLI tool, but it can't be done via api.

---
