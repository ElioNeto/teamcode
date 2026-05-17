# 🔧 Dívida Técnica

> **Total:** 9 | Extraído em 2026-05-17

---

## #27327 — OpenCode + Mini Max 2.5 is much slower last days

📅 `2026-05-13` | ✏️ **deusexec** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/27327](https://github.com/anomalyco/opencode/issues/27327)
 | 🏷️ `zen`


### Description

Something is happened last days, my OpenCode + MiniMax 2.5 is much slower now. I use Go subscription and my limits are okay. Yesterday I got a few errors something like servers are busy and they are under huge loads.

### Plugins

Don't use any plugins.

### OpenCode version

1.14.48

### Operating System

Ubuntu 24.04

### Terminal

Default Terminal

---

## #27106 — The latest version is terribly slow

📅 `2026-05-12` | ✏️ **hellocodelinux** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/27106](https://github.com/anomalyco/opencode/issues/27106)


### Question

What's up everyone? Honestly, I use OpenCode for everything and I'm currently creating an agent based on it.

But the latest version (1.14.48) is super slow—it's practically unusable.

Please fix this!

---

## #26263 — I'm experiencing extremely slow performance with OpenCode on Ubuntu.

📅 `2026-05-08` | ✏️ **bragaus** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26263](https://github.com/anomalyco/opencode/issues/26263)


### Question

I compared the exact same prompt/workflow between OpenCode and Claude Code under the same machine and environment conditions.

Results:

- OpenCode: ~34 minutes to complete
- Claude Code: ~10 seconds to complete

This performance gap is massive and makes OpenCode difficult to use productively.

### Environment

- OS: Ubuntu
- CPU: Intel Core i5
- GPU: NVIDIA RTX 3060
- RAM: 16GB
- Storage: 256GB NVMe M.2 SSD
- OpenCode version: 1.14.41

### Installation method

Installed using:

```bash
curl -fsSL https://opencode.ai/install | bash

---

## #25906 — refactor: remove unused DynamicDescription hack in tool.ts

📅 `2026-05-05` | ✏️ **srivenkateswaran6002** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25906](https://github.com/anomalyco/opencode/issues/25906)


### Description

The DynamicDescription type in tool.ts is marked with a TODO to be removed and is currently unused across the codebase. 

Location of the file : packages/opencode/src/tool/tool.ts

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

Not applicable.

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #24060 — test(opencode): prompt.test.ts flaky since #23710 — 3s timeout vs. SIGTERM→exit race

📅 `2026-04-23` | ✏️ **tesdal** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24060](https://github.com/anomalyco/opencode/issues/24060)


After #23710 consolidated session prompt tests into Effect style, `packages/opencode/test/session/prompt.test.ts` is consistently flaky on `dev`. Re-verified on current `origin/dev @ 3f8c65905`: still flaky in 3/3 consecutive runs. Also reproduced on earlier `origin/dev @ 88c5f6bb1` across 5/5 runs (3–11 failures out of 44 tests each).

## Two failure modes

Both in cancel / queued-caller tests:

### Signature A — `Exit.isSuccess(exit)` assertion fails

Stack frame through `src/effect/cross-spawn-spawner.ts:395 → child_process #handleOnExit`:

```
error: expect(received).toBe(expected)
Expected: true
Received: false
  at packages/opencode/test/session/prompt.test.ts:1296:42
  at packages/opencode/src/effect/cross-spawn-spawner.ts:395:21
  at emit (node:events:98:22)
  at #maybeClose (node:child_process:766:16)
  at #handleOnExit (node:child_process:520:72)
```

Representative failing tests: `cancel interrupts shell and resolves cleanly`, `cancel persists aborted shell result when shell ignores TERM`, `cancel finalizes interrupted bash tool output through normal truncation`.

### Signature B — `it.live(..., 3_000)` timeout with dangling process

```
(fail) cancel records MessageAbortedError on interrupted process [3008.28ms]
  ^ this test timed out after 3000ms.
killed 1 dangling process
```

The harness is still waiting for a SIGTERM'd `sleep 30` shell to emit its exit event when the 3s budget expires.

## Root cause

Both modes point at the same race: per-test timeouts were 

> *[Truncado — 3156 chars totais]*

---

## #24052 — TUI event listeners leak memory because they're never cleaned up

📅 `2026-04-23` | ✏️ **fernandoenzo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24052](https://github.com/anomalyco/opencode/issues/24052)


### Description

`event.on()` and `event.subscribe()` calls in the TUI are never unsubscribed. Repeated session switches leave orphaned listeners and closures that the GC can't reclaim.

### Plugins

None

### OpenCode version

1.14.22

---

## #21834 — Using the llama3.2:latest is slow

📅 `2026-04-10` | ✏️ **66-firebat** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21834](https://github.com/anomalyco/opencode/issues/21834)


### Question

I am aware that running the llama3.2 model directly through ollama seems to produce a lot of "thinking" context, and when i use the model in opencode, this thought process, although hidden in the opencode output, seems to occupy a ton of time. Has anyone figured a way around this problem?

---

## #21750 — linter running even when specifically disabled

📅 `2026-04-09` | ✏️ **davidbernat** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21750](https://github.com/anomalyco/opencode/issues/21750)


### Description

not even going to bother to drop a stack trace or notes been over this at least a dozen times. v1.3.17
fixed the one-off by writing to a .txt and copying the code manually.
pickle continually commented as an authority without doing exasearches e.g. auth0.com != auth0
where even is the sdk and opencode serve solutions

---

## #21426 — The free model has been deprecated. Transition to qwen/qwen3.6-plus for continued paid access.

📅 `2026-04-08` | ✏️ **Tian-ruzhao** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21426](https://github.com/anomalyco/opencode/issues/21426)


### Question

为什么免费模型能选择qwen3.6-plus，但是运行时报错：The free model has been deprecated. Transition to qwen/qwen3.6-plus for continued paid access.

---
