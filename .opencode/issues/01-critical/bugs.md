# 🐛 Bugs Críticos

> **Total:** 227 | Extraído em 2026-05-17

---

## #28072 — OpenCode fails to open after updating itself

📅 `2026-05-17` | ✏️ **oxavibes** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28072](https://github.com/anomalyco/opencode/issues/28072)


### Description
The "Unsupported 16-Bit Application" error occurs specifically after OpenCode triggers its built-in self-update mechanism on Windows x64. The background process overwrites or leaves a corrupted/truncated `opencode.exe` file in the global pnpm directory.

### Environment
- **OS:** Windows (64-bit)
- **Package Manager:** pnpm (Global installation)
- **Package Version affected:** `opencode-ai@1.15.4`
- **Trigger:** Built-in auto-update feature (`autoupdate: true`)

### Error Details
The background self-update leaves a broken executable at:
`\??\C:\Users\BlueScreenBeast\AppData\Local\pnpm\global\5\.pnpm\opencode-ai@1.15.4\node_modules\opencode-ai\bin\opencode.exe`

### Steps to Reproduce
1. Have a previous working version of OpenCode installed globally via pnpm.
2. Allow OpenCode to trigger or perform its internal self-update mechanism.
3. The next time the tool is run, execution fails with the Windows 16-bit application error popup due to file corruption during the update process.

### Expected Behavior
The self-update should securely replace the binary without interrupting or corrupting the global package files on Windows.

### Actual Behavior
The file is corrupted or incompletely written, triggering Windows architecture defenses.

<img width="424" height="206" alt="Image" src="https://github.com/user-attachments/assets/29c60ef7-5c93-44f0-8e92-4fa8134603ec" />

---

## #28046 — Windows: NAPI FATAL ERROR crash on v1.15.3 (Bun runtime bug, fix PR exists upstream)

📅 `2026-05-17` | ✏️ **skywalker-35** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/28046](https://github.com/anomalyco/opencode/issues/28046)


## Description

Starting a session on Windows immediately crashes with a Bun NAPI fatal error:

```
panic(thread 17676): NAPI FATAL ERROR: Error::New napi_create_error

This indicates a bug in Bun, not your code. The panic occurred at:
  /home/runner/work/bun/bun/packages/bun/src/bun.js/node/types/napi.zig — line:373 col:32
```

**Screenshot attached** showing the full crash log.

## Environment

- **OS**: Windows 11
- **opencode version**: 1.15.3 ❌ → **1.15.0 works** ✅
- **Bun version** (system): 1.3.14
- **Plugins**: oh-my-openagent@4.1.1, opencode-mem@2.14.1

## Steps to Reproduce

1. Install `opencode-ai@1.15.3` via npm on Windows 11
2. Run `opencode` in any project directory
3. Start a session → crashes within seconds

## Workaround

```powershell
npm install -g opencode-ai@1.15.0
```

## Root Cause (confirmed by Bun team)

This is a Bug in Bun's embedded runtime inside the standalone `opencode.exe` binary. Confirmed in [oven-sh/bun#30286](https://github.com/oven-sh/bun/issues/30286):

- `NapiEnv::cleanup` does not clear pending exceptions between finalizers
- `napi_create_error` refuses to run with a pending VM exception (unlike Node.js)
- Combined → NAPI FATAL ERROR panic during worker shutdown

**Fix PR exists**: [oven-sh/bun#30291](https://github.com/oven-sh/bun/pull/30291)

## Related

- [oven-sh/bun#30286](https://github.com/oven-sh/bun/issues/30286) — Root cause (OPEN)
- [oven-sh/bun#30424](https://github.com/oven-sh/bun/issues/30424) — Same crash with opencode (C

> *[Truncado — 1732 chars totais]*

---

## #28041 — [1.15.3] GPU sandbox crash on startup — STATUS_BREAKPOINT 0x80000003

📅 `2026-05-17` | ✏️ **Anicomig** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/28041](https://github.com/anomalyco/opencode/issues/28041)


### Description

## Environment
- OS: Windows 11 (zh-CN)
- OpenCode: 1.15.3 (packaged)
- Electron: 41.2.1 (Node 24.14.1, Chromium 146)

## GPU Configuration
| GPU | Driver | Date |
|-----|--------|------|
| NVIDIA GeForce RTX 4060 Laptop GPU | 32.0.15.9649 | 2026-05-05 |
| Intel(R) Iris(R) Xe Graphics | 32.0.101.5768 | 2024-07-24 |
| GameViewer Virtual Display Adapter | 15.6.5.199 | 2026-02-28 |
| Todesk Virtual Display Adapter | 16.44.2.509 | 2023-04-24 |
| MuMu Virtual Display Adapter | 20.36.41.498 | 2026-03-12 |

## Reproduction
1. Launch OpenCode 1.15.3 installed at `%LOCALAPPDATA%\Programs\@opencode-aidesktop\OpenCode.exe`
2. Window flashes briefly, then disappears

## Crash Log (console output with --enable-logging)


## Windows Event Log (Application Error 1000)

## Attempted workarounds
| Flag | Result |
|------|--------|
| (none) | Crash |
| `--disable-gpu` | Crash |
| `--use-gl=swiftshader` | Crash |
| `--disable-gpu-sandbox` | Crash |

## Suspected cause
GPU sandbox in Chromium 146 is incompatible with the system's GPU/driver configuration — likely due to virtual display adapters (GameViewer, Todesk, MuMu) interfering with the GPU sandbox initialization. The crash is deterministic (same exception code 0x80000003, same offset 0x7b594c6) across dozens of attempts.

## Crash dumps (WER)
Available at: `C:\ProgramData\Microsoft\Windows\WER\ReportArchive\AppCrash_OpenCode.exe_*` (latest: 2026-05-17)

### Plugins

"oh-my-openagent@latest","superpowers@git+https://github.

> *[Truncado — 1776 chars totais]*

---

## #28026 — Keypress "p" not registering after content is added to chat

📅 `2026-05-17` | ✏️ **milansimek** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/28026](https://github.com/anomalyco/opencode/issues/28026)


### Description

I'm experiencing a pretty weird issue in all opencode versions above `1.14.41`. 

Whenever content is added to chat, for example if a response is being generated or if I run /sessions and load a past session, I need to press the `p` key twice in a row for it to register.

Some versions after `1.14.41` also broke the `shift+enter` newline functionality. 

Here's a video where I'm pressing `papapapa` repeatedly before content is added and after: 

https://github.com/user-attachments/assets/68c86f4c-3cb7-41d6-b1ed-8d53180d6951

You can see that after only the `p` character is registrered.

And here's a video of what happens after loading a session, with `evtest` output at the side: 

https://github.com/user-attachments/assets/95863760-ba69-42bd-a236-a9b789270b7e

The issue doesn't happen at `v1.14.41` and it's present at `v1.14.42`. 

At `v1.14.42` the `enter` key is completely broken also. So it's not possible to submit prompts etc.

Terminals tested: ghostty and konsole 

OS: 
- Ubuntu 25.10
- KDE (plasmashell 6.4.5) 
- Wayland

Please let me know if you need any logs or output of debugging steps and I'd be happy to provide them. 

Also, any ideas what the issue could be related to would be greatly appreciated so I can further debug and check what triggers it exactly. 

Thanks!

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No respo

> *[Truncado — 1533 chars totais]*

---

## #28013 — Blank window after opening OpenCode app

📅 `2026-05-17` | ✏️ **Godwyne** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/28013](https://github.com/anomalyco/opencode/issues/28013)


### Description

Blank window after opening OpenCode app
Device: MacBook M1 Version MacOS Tahoe 26 running OpenCode app Version 1.15.0   

Troubleshoot:  - Restarted, reloaded, uninstalled and reinstalled using DMG file - Unable to uninstall app through Terminal

### Plugins

_No response_

### OpenCode version

Version 1.15.0

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="1440" height="854" alt="Image" src="https://github.com/user-attachments/assets/85aa6650-b5b1-4ae6-aebc-3b5e91bf332a" />

### Operating System

MacOS Tahoe 26

### Terminal

_No response_

---

## #28007 — opentui: fatal: Invalid key sequence: sequence cannot be empty

📅 `2026-05-17` | ✏️ **isac322** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/28007](https://github.com/anomalyco/opencode/issues/28007)


### Description

```
Error: Invalid key sequence: sequence cannot be empty
    at EQ (/$bunfs/root/chunk-5eax3qap.js:2:39510)
    at W (/$bunfs/root/chunk-5eax3qap.js:2:35077)
    at <anonymous> (/$bunfs/root/chunk-47k01r1p.js:525:46667)
    at map (native:1:11)
    at <anonymous> (/$bunfs/root/chunk-47k01r1p.js:525:46603)
    at <anonymous> (/$bunfs/root/chunk-47k01r1p.js:525:50980)
    at <anonymous> (/$bunfs/root/chunk-47k01r1p.js:525:48122)
    at <anonymous> (/$bunfs/root/chunk-47k01r1p.js:525:48086)
    at Cd (/$bunfs/root/chunk-p1hwyz3w.js:2:11235)
    at oa (/$bunfs/root/chunk-p1hwyz3w.js:2:11016)
    at Dd (/$bunfs/root/chunk-p1hwyz3w.js:2:9966)
    at <anonymous> (/$bunfs/root/chunk-47k01r1p.js:525:48202)
    at Cd (/$bunfs/root/chunk-p1hwyz3w.js:2:11235)
    at oa (/$bunfs/root/chunk-p1hwyz3w.js:2:11016)
    at L (/$bunfs/root/chunk-p1hwyz3w.js:2:5037)
    at sn (/$bunfs/root/chunk-47k01r1p.js:525:48189)
    at I (/$bunfs/root/chunk-p1hwyz3w.js:2:7720)
    at Cd (/$bunfs/root/chunk-p1hwyz3w.js:2:11235)
    at oa (/$bunfs/root/chunk-p1hwyz3w.js:2:11016)
    at Ld (/$bunfs/root/chunk-p1hwyz3w.js:2:9079)
    at <anonymous> (/$bunfs/root/chunk-p1hwyz3w.js:2:22220)
    at Cd (/$bunfs/root/chunk-p1hwyz3w.js:2:11235)
    at oa (/$bunfs/root/chunk-p1hwyz3w.js:2:11016)
    at L (/$bunfs/root/chunk-p1hwyz3w.js:2:5037)
    at I (/$bunfs/root/chunk-p1hwyz3w.js:2:7720)
    at Cd (/$bunfs/root/chunk-p1hwyz3w.js:2:11235)
    at oa (/$bunfs/root/chunk-p1hwyz3w.js:2:11016)
    at L

> *[Truncado — 4789 chars totais]*

---

## #27963 — Opencode-ai v1.15.3 - Corrupted executable on Windows

📅 `2026-05-17` | ✏️ **DevMILF** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27963](https://github.com/anomalyco/opencode/issues/27963)


### Description

# Bug Report: opencode-ai v1.15.3 - Corrupted executable on Windows

## Description

Version `1.15.3` of `opencode-ai` ships a corrupted binary on Windows 10/11. The executable fails to launch with the error:

> "The specified executable is not a valid application for this OS platform"

Version `1.15.0` works correctly. The issue is reproducible on fresh install and reinstall.

---

## Environment

| Field | Value |
|-------|-------|
| **OS** | Windows 10 Pro 22H2 / Windows 11 |
| **Arch** | x64 |
| **Shell** | PowerShell 5.1 |
| **Package Manager** | pnpm 11.1.1 |
| **Node.js** | v22.x |


## Workaround

Downgrade to `v1.15.0`:

```powershell
pnpm install -g opencode-ai@1.15.0
```

---

## Additional Notes

1. The installation itself completes without errors — only the execution fails
2. The binary file exists at the expected path but Windows rejects it
3. The size of the binary may be truncated or corrupted during the npm publish process
4. This issue is **Windows-specific** — Linux/macOS builds may be unaffected

---

## Related

- The issue tracker for `opencode-ai` on GitHub
- pnpm global install path: `%LOCALAPPDATA%\pnpm\global\v11\*\node_modules\opencode-ai\`

---

## Debug Info

```powershell
# Check file details
Get-Item "$env:LOCALAPPDATA\pnpm\global\v11\*\node_modules\opencode-ai\bin\opencode.exe" | Select-Object Name, Length, LastWriteTime

# Expected: binary ~50-100MB, normal timestamp
# Actual (v1.15.3): binary may show incorrect size or corrup

> *[Truncado — 2544 chars totais]*

---

## #27930 — OOM when patching too many of file

📅 `2026-05-16` | ✏️ **Eason0729** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27930](https://github.com/anomalyco/opencode/issues/27930)


### Description

When the agent works on a Linux patchset project, it attempted to patch 140K+ files(not gitignore) accidentally. This caused an out-of-memory crash.

### Plugins

no

### OpenCode version

1.15.3

### Steps to reproduce

1. open linux kernel source code
2. ask agent to replace a very common word with patch tool.

### Screenshot and/or share link

https://opncd.ai/share/SLcY0m5M
export session json(14MB): https://www.mediafire.com/file/p5ejpcq6puddrn6/export.json/file

<img width="1499" height="823" alt="Image" src="https://github.com/user-attachments/assets/28221267-48cf-4ee3-ad15-e59108aa69c9" />

### Operating System

_No response_

### Terminal

_No response_

---

## #27927 — Formula forces `homebrew-core` git clone instead of using Homebrew JSON API

📅 `2026-05-16` | ✏️ **vijayhardaha** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27927](https://github.com/anomalyco/opencode/issues/27927)


### Description

Installing `opencode` via `brew install anomalyco/tap/opencode` forces a full git clone of `homebrew-core`, which fails on modern Homebrew (4.0+) setups that use the JSON API by default.

### Environment

- **OS:** macOS (Apple Silicon — M1)
- **Homebrew version:** 5.1.11-140-gfb60c87 (modern, API-based)
- **opencode formula version:** 1.15.3

### Steps to Reproduce

```bash
brew install anomalyco/tap/opencode
```

### Error

```
==> Tapping homebrew/core
fatal: could not create work tree dir '/opt/homebrew/Library/Taps/homebrew/homebrew-core': Operation not permitted
Error: Failure while executing; `git clone https://github.com/Homebrew/homebrew-core /opt/homebrew/Library/Taps/homebrew/homebrew-core --origin=origin --template= --config core.fsmonitor=false` exited with 128.
```

### Expected Behavior

Installation should work without cloning `homebrew-core`, using Homebrew's JSON API to resolve dependencies.

### Suggested Fix

- Ensure all dependencies are compatible with Homebrew's JSON API mode (`HOMEBREW_INSTALL_FROM_API=1`)
- Avoid any explicit `tap "homebrew/core"` references in the formula
- Test the formula with modern Homebrew 4.x on Apple Silicon

### Plugins

_No response_

### OpenCode version

1.15.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="959" height="237" alt="Image" src="https://github.com/user-attachments/assets/06b81395-9ad1-4042-96f3-7024c3636331" />

### Operating System

MacOS Apple M1, 15.7.

> *[Truncado — 1524 chars totais]*

---

## #27924 — bug(session): infinite compaction loop when compression fails to reduce context

📅 `2026-05-16` | ✏️ **ranxianglei** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27924](https://github.com/anomalyco/opencode/issues/27924)


## Bug Description

The session loop in `prompt.ts` can enter an infinite compaction loop:

```
overflow detected → compact → still overflow → compact → ... (infinite)
```

This happens when compaction fails to reduce the context below the token limit — for example, when compression state is lost, messages are inherently uncompressable, or the compression plugin returns an error.

The loop spins indefinitely consuming API credits without making progress.

## Steps to Reproduce

1. Have a session with large context that triggers overflow
2. If compaction fails or doesn't reduce tokens enough, the loop retries indefinitely
3. Observe continuous API calls with no progress

## Root Cause

The `runLoop` function has two paths that trigger compaction and `continue` without any guard:

1. **Overflow check**: after each step, if `compaction.isOverflow()` returns true, it calls `compaction.create()` and continues — but the next iteration sees the same overflow and repeats.

2. **Compact result**: when the provider returns `"compact"` as the result, it calls `compaction.create()` and continues — same infinite loop if compaction doesn't actually reduce context.

Neither path has a retry counter or break condition.

## Expected Behavior

After a reasonable number of compaction attempts (e.g., 2), the loop should break and return an error to the user, rather than spinning indefinitely.

---

## #27923 — bug(config): pluginAutoInstall config has no effect

📅 `2026-05-16` | ✏️ **ranxianglei** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27923](https://github.com/anomalyco/opencode/issues/27923)


## Bug Description

The `pluginAutoInstall` config field exists in the schema but has **no effect**. Users can set `pluginAutoInstall: false` in their config file, but plugins still auto-install because the config value is never checked by any code.

Only the undocumented `OPENCODE_DISABLE_PLUGIN_INSTALL=true` environment variable actually disables auto-install, but there's no way to set this from the config file.

## Steps to Reproduce

1. Add `"pluginAutoInstall": false` to `opencode.json`
2. Start opencode
3. Observe that plugins are still auto-installed (check `~/.cache/opencode/packages/`)

## Root Cause

- `npm.ts`: `add()` and `install()` never check any disable flag
- `config.ts`: `pluginAutoInstall` schema field is not wired to set the env var
- `flag.ts`: No `OPENCODE_DISABLE_PLUGIN_INSTALL` flag defined as a runtime getter

## Expected Behavior

Setting `pluginAutoInstall: false` in config should prevent automatic plugin installation, equivalent to setting `OPENCODE_DISABLE_PLUGIN_INSTALL=true`.

## Impact

This caused a critical issue in our deployment: opencode auto-installed an npm package that overwrote our patched fork plugin, destroying session compression state and losing data.

---

## #27859 — Sessions and auth state lost after auto-upgrade from 1.15.0 to 1.15.1

📅 `2026-05-16` | ✏️ **crewyyyy** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/27859](https://github.com/anomalyco/opencode/issues/27859)


### Description

After an automatic update to this version, all ChatGPT/MiniMax/Ollama cloude authorizations crashed for me. But that's not all, the entire chat history is cleared, I checked and opencode.db was COMPLETELY cleared. Why was this done and what should I do now?

### Plugins

_No response_

### OpenCode version

1.15.1

### Steps to reproduce

I just opened the OpenCode application, it updated itself and broke everything

### Screenshot and/or share link

_No response_

### Operating System

Ubuntu 24.04.3 LTS

### Terminal

Direct SSH connection to VPS

---

## #27844 — opentui: fatal: No renderer found

📅 `2026-05-16` | ✏️ **arkamax-dev** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27844](https://github.com/anomalyco/opencode/issues/27844)


### Description

```
Error: No renderer found
    at createElement (C:\Users\slowf\.cache\opencode\packages\opencode-sdd-engram-manage@latest\node_modules\opencode-sdd-engram-manage\dist\tui.js:965:17)
    at <anonymous> (C:\Users\slowf\.cache\opencode\packages\opencode-sdd-engram-manage@latest\node_modules\opencode-sdd-engram-manage\dist\tui.js:1722:16)
    at I (B:/~BUN/root/chunk-fw44xg9n.js:2:7720)
    at Cd (B:/~BUN/root/chunk-fw44xg9n.js:2:11235)
    at oa (B:/~BUN/root/chunk-fw44xg9n.js:2:11016)
    at Ld (B:/~BUN/root/chunk-fw44xg9n.js:2:9079)
    at <anonymous> (B:/~BUN/root/chunk-fw44xg9n.js:2:22220)
    at Cd (B:/~BUN/root/chunk-fw44xg9n.js:2:11235)
    at oa (B:/~BUN/root/chunk-fw44xg9n.js:2:11016)
    at L (B:/~BUN/root/chunk-fw44xg9n.js:2:5037)
    at I (B:/~BUN/root/chunk-fw44xg9n.js:2:7720)
    at Cd (B:/~BUN/root/chunk-fw44xg9n.js:2:11235)
    at oa (B:/~BUN/root/chunk-fw44xg9n.js:2:11016)
    at Ld (B:/~BUN/root/chunk-fw44xg9n.js:2:9079)
    at ba (B:/~BUN/root/chunk-fw44xg9n.js:2:4036)
    at H (B:/~BUN/root/chunk-fw44xg9n.js:3:3507)
    at Cd (B:/~BUN/root/chunk-fw44xg9n.js:2:11235)
    at oa (B:/~BUN/root/chunk-fw44xg9n.js:2:11016)
    at L (B:/~BUN/root/chunk-fw44xg9n.js:2:5037)
    at I (B:/~BUN/root/chunk-fw44xg9n.js:2:7720)
    at Cd (B:/~BUN/root/chunk-fw44xg9n.js:2:11235)
    at oa (B:/~BUN/root/chunk-fw44xg9n.js:2:11016)
    at Ld (B:/~BUN/root/chunk-fw44xg9n.js:2:9079)
    at ba (B:/~BUN/root/chunk-fw44xg9n.js:2:4036)
    at <anonymous> (B:/~BUN/r

> *[Truncado — 3983 chars totais]*

---

## #27779 — acp/agent: prompt() silently swallows SDK errors — end_turn returned with no content on failure

📅 `2026-05-15` | ✏️ **agentbridge-fixer[bot]** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27779](https://github.com/anomalyco/opencode/issues/27779)


## Bug Description

In `packages/opencode/src/acp/agent.ts`, the `prompt()` handler calls `sdk.session.prompt()` **without `throwOnError: true`**:

```typescript
// line ~1436
const response = await this.sdk.session.prompt({ sessionID, model, variant, parts, agent, directory })
const msg = response.data?.info

return {
  stopReason: "end_turn" as const,
  usage: msg ? buildUsage(msg) : undefined,
  _meta: {},
}
```

When the HTTP call fails (e.g. returns 400 or 500), `response.data` is `undefined`. The handler has no error check and returns a bare `end_turn` with `usage: undefined` — no exception, no error event, no diagnostic.

## Reproduction

Upload an image that causes `image.normalize()` to fail (e.g. `DecodeError` or `SizeError` on an unusual PNG). The ACP client receives `{ stopReason: "end_turn", usage: undefined }` with no preceding events, indistinguishable from a normal empty turn.

## Impact

ACP clients (e.g. the AgentBridge IntelliJ plugin) cannot distinguish this failure from a "session corrupted" case. Without a real error signal they can only apply heuristics — ultimately leading to misleading UX (session-was-reset message) and lost session context.

## Proposed Fix

Add `{ throwOnError: true }` to the `sdk.session.prompt()` call:

```typescript
const response = await this.sdk.session.prompt(
  { sessionID, model, variant, parts, agent, directory },
  { throwOnError: true },   // propagate HTTP errors as exceptions
)
```

When the SDK throws, the ACP JSON-RPC

> *[Truncado — 1892 chars totais]*

---

## #27745 — AI agent made unauthorized DB modifications without user consent

📅 `2026-05-15` | ✏️ **mikegasche** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27745](https://github.com/anomalyco/opencode/issues/27745)


### Description

During a FAERS data import session, the AI agent (opencode) executed TRUNCATE on 7 database tables (~30M records) without user authorization. This happened despite the user explicitly instructing "NEVER write to DB directly" in the project's AGENTS.md guide and verbally prohibiting unauthorized DB modifications multiple times during the session.

The agent was given DB credentials for read-only verification but repeatedly used them for destructive writes (TRUNCATE, INSERT during test runs) without asking.

### Plugins

None

### OpenCode version

opencode/deepseek-v4-flash-free

### Steps to reproduce

1. Provide DB credentials to opencode for read-only verification
2. Ask it to analyze a database import issue
3. The agent will TRUNCATE tables and make destructive changes without asking

### Screenshot and/or share link

N/A

### Operating System

macOS

### Terminal

iTerm2

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

When a remote MCP fails to connect with `UnauthorizedError`, opencode sets its status to `needs_auth` and surfaces a toast pointing at the `/mcps` picker (or the `opencode mcp auth` shell subcommand). However, the running agent has zero awareness that this MCP exists:

- `MCP.tools()` filters to `status === "connected"` clients only, so no tool from a `needs_auth` MCP reaches the agent's tool list.
- The system prompt does not enumerate configured MCPs.
- The agent therefore cannot reason about the MCP, cannot suggest authentication, and cannot trigger the OAuth flow on the user's behalf.

A user asking "use the mops-integration MCP and list rentals for X" gets a generic "I don't have that tool" response, with no path forward inside the conversation.

### Expected behaviour

The agent should know which MCPs are configured-but-unauthenticated and have a way to trigger the OAuth flow when the user asks.

### Reproduction

1. Configure a remote MCP with OAuth (e.g. any Keycloak-backed MCP).
2. Clear its tokens (delete `tokens` from `~/.local/share/opencode/mcp-auth.json` for that MCP) and restart opencode.
3. Ask the agent: "use <name> to <do something>".
4. The agent reports it doesn't have any tools matching `<name>`.

### Environment

- opencode 1.14.48 (also reproduces against current `dev` HEAD).
- Any remote MCP with OAuth that returns `UnauthorizedError` on connect.

### Related

- #16893 — Remote MCP OAuth: browser never opens for re-authentication (the in-T

> *[Truncado — 1615 chars totais]*

---

## #27723 — Desktop: sidecar crashes on 2nd LLM call when oh-my-opencode plugin loaded (Windows)

📅 `2026-05-15` | ✏️ **laozhaozhusu** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27723](https://github.com/anomalyco/opencode/issues/27723)


### Description

## Environment

- **OpenCode Desktop**: v1.15.0 (Windows x64)
- **OpenCode CLI**: v1.15.0 (same machine, works perfectly)
- **OS**: Windows 10/11 (Build 26200)
- **Plugin**: `oh-my-opencode` v4.1.2 (npm: `oh-my-opencode` / `oh-my-openagent`)

## Bug Description

When the `oh-my-opencode` plugin is loaded, the Desktop app's sidecar process (running as Electron `node.mojom.NodeService` utility process) **crashes deterministically on the 2nd LLM streaming call**. The 1st message always succeeds. The CLI version with the exact same config, binary version, and API works perfectly.

## Reproduction Steps

1. Install OpenCode Desktop v1.15.0 on Windows
2. Configure `opencode.jsonc` with `"plugin": ["oh-my-opencode"]`
3. Open Desktop app, start a new session
4. Send 1st message → succeeds, LLM responds normally
5. Send 2nd message → **sidecar process dies immediately**, DevTools shows `net::ERR_CONNECTION_REFUSED` for all subsequent requests

## What Happens

- The sidecar runs inside Electron's utility process (`--type=utility --utility-sub-type=node.mojom.NodeService`)
- On the 2nd LLM call, the utility process is killed (no crash dump, no error log, no Windows Event Log entry)
- The Electron shell remains alive, but the frontend loses connection to the sidecar
- DevTools console shows:
  ```
  [global-sdk] event stream error → {url: 'http://127.0.0.1:<port>', fetch: 'webview', error: TypeError: network error}
  GET http://127.0.0.1:<port>/global/health net::ERR_CO

> *[Truncado — 3712 chars totais]*

---

## #27688 — Snapshot fails when opencode is opened in a git subdirectory (snapshot service cwd mismatch)

📅 `2026-05-15` | ✏️ **thforme** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27688](https://github.com/anomalyco/opencode/issues/27688)


### Description

## Bug Description

When opening opencode in a git repository subdirectory (e.g., `src/`), the snapshot service fails to track files with the error:

WARN  service=snapshot exitCode=128 stderr=warning: cannot open directory 'src/src/': No such file or directory
fatal error: pathspec 'src/date.txt' did not match any files
failed to add snapshot files

## Root Cause

The issue was introduced in `packages/opencode/src/snapshot/index.ts`.

In the `stage`, `drop`, and `ignore` functions, `cwd` is set to `state.directory` (the directory where opencode was launched), but `files` paths are relative to `state.worktree` (git repository root).

When `--work-tree` points to the repository root but `cwd` points to a subdirectory, git cannot resolve the paths correctly.

## Affected Code

In `packages/opencode/src/snapshot/index.ts`:
- `ignore` function: `cwd: state.directory` should be `cwd: state.worktree`
- `drop` function: `cwd: state.directory` should be `cwd: state.worktree`
- `stage` function: `cwd: state.directory` should be `cwd: state.worktree`

## Expected Behavior

Snapshot should work correctly regardless of which directory within a git repository opencode is launched from.




### Plugins

_No response_

### OpenCode version

v1.15.0

### Steps to reproduce

1. Initialize a git repository with some files
2. Open opencode from a subdirectory (e.g., `cd src && opencode`)
3. The snapshot service will fail with the error above

### Screenshot and/or share link

_

> *[Truncado — 1564 chars totais]*

---

## #27664 — /undo does not restore code, and /redo corrupts Git state by committing all changes

📅 `2026-05-15` | ✏️ **itwxb** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27664](https://github.com/anomalyco/opencode/issues/27664)


### Description

## English Version

### Title  
[BUG] `/undo` does not restore code, and `/redo` corrupts Git state by committing all changes

### Description  
When the project is linked to Git, using the `/undo` command to revert the previous command in the conversation does **not** restore the code. Then using `/redo` completely messes up the Git state — all unstaged changes are committed (or forced into a single commit), breaking the normal Git workflow.

### Expected Behavior  
- `/undo` should revert all file system and code changes made by the last command, including discarding uncommitted edits.  
- `/redo` should re‑apply the previously undone command, and should **not** interfere with Git history or trigger any automatic commits.
- Same as Claude Code – have a double‑tap Esc feature that performs a normal undo/rollback without interfering with Git history.

### Actual Behavior  
- After `/undo`, code files remain unchanged — no restoration occurs.  
- After `/redo`, the Git repository is corrupted: all local changes are committed at once (seems like `git add . && git commit`), disrupting incremental commit workflows.

### Steps to Reproduce  
1. Start the AI coding assistant in a project that is already a Git repository.  
2. Execute a command that modifies code (e.g., edit or create a file).  
3. Type `/undo` to attempt reverting the previous change.  
4. Check the code files — they are not restored.  
5. Type `/redo`.  
6. Check Git status — all changes are commi

> *[Truncado — 3938 chars totais]*

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

- opencode version: v1.14.50
- SSE endpoint tested: both `/event` (instance-level) and `/global/event`
- Same behavior on both endpoints

## What We have Ruled Out

1. **Not an SSE subscription layer issue**: We switched to `/global/event` (which uses `GlobalBus` — simple EventEmitter, no Effect fibers). Same problem persists. This means `Bus.publish()` is never called for deltas during the second prompt.
2. **Not a content complexity issue**: A simple task that completes in one turn works fine. A complex task that triggers multi-turn interaction (planning → questions → file writes) triggers the bug.
3. **Root cause is in the prompt execution pipeline**, not in SSE/bus subscription — `Bus.publish()` itself calls 

> *[Truncado — 2726 chars totais]*

---

## #27657 — fix: sidecar crashes (SIGTRAP) when apply_patch deletes a large/binary file

📅 `2026-05-15` | ✏️ **wangzexi** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27657](https://github.com/anomalyco/opencode/issues/27657)


## Description

When `apply_patch` processes a `delete` operation on a large or binary file (e.g. a 142 MB `.dmg`), it calls `createTwoFilesPatch(filePath, filePath, entireFileContent, "")` to build a unified diff. For a 142 MB binary file this produces a diff string of ~380 MB. That string is stored verbatim in the SQLite `part.data` column.

On the next query that runs `StatementSync.all()` over that session's parts, Node's built-in `sqlite` module passes the 380 MB `char*` to `v8::String::NewFromUtf8`. V8 has an internal string-length assertion (~512 MB limit) and hits it as a `SIGTRAP` / `EXC_BREAKPOINT`, bringing the entire sidecar process down.

The same risk exists in `edit.ts`'s `trimDiff` function, which is called from all edit/patch paths and does no size check before splitting the diff on newlines.

Crash stack from macOS crash report:
```
v8::String::NewFromUtf8
node::sqlite::StatementExecutionHelper::ColumnToValue
node::sqlite::ExtractRowValues
node::sqlite::StatementExecutionHelper::All
node::sqlite::StatementSync::All
```

## Steps to reproduce

1. Start opencode on macOS.
2. Ask the AI to delete a binary file >= ~50 MB (e.g. a `.dmg`, `.iso`, or large `.zip`) via `apply_patch`.
3. The sidecar process crashes with SIGTRAP / EXC_BREAKPOINT immediately after the patch is applied. All in-flight sessions are lost.

## OS

macOS 15 (Darwin arm64)

## OpenCode version

Latest dev branch (reproduced on current `dev` HEAD)

## Root cause

`apply_patch.ts` (delete case)

> *[Truncado — 1794 chars totais]*

---

## #27638 — fix(skill): circular symlinks in external skill dirs cause ENAMETOOLONG crash on Bun runtime

📅 `2026-05-15` | ✏️ **litown** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27638](https://github.com/anomalyco/opencode/issues/27638)


## Bug Description

On Bun runtime, opencode crashes with `ENAMETOOLONG` error during skill scanning when external skill directories (e.g. `~/.claude/skills/`, `~/.agents/skills/`) contain circular or broken symlinks.

## Root Cause

The skill discovery system uses `glob` with `follow: true` to scan external skill directories. When circular symlinks exist (e.g., `skills/finishing-a-development-branch/finishing-a-development-branch` → points to itself), glob enters an infinite recursion. On Bun runtime, this causes path strings to exceed `PATH_MAX`, triggering `ENAMETOOLONG` from `readdir` which crashes the process. Node.js handles this gracefully, but Bun does not.

Additionally, broken symlinks (target deleted) cause unnecessary I/O errors during scanning.

## Reproduction

1. Install a Claude Code plugin that creates skill symlinks (e.g., omc)
2. Some skills may leave behind circular or broken symlinks in `~/.claude/skills/`
3. Run `opencode` with Bun runtime
4. Process crashes with ENAMETOOLONG during skill discovery

## Environment

- Runtime: Bun 1.3+
- OS: macOS (confirmed), likely affects Linux too
- Affected directories: `~/.claude/skills/`, `~/.agents/skills/`

## Proposed Fix

Pre-scan directories for circular and broken symlinks before glob traversal, and pass detected paths as `ignore` patterns to glob. Key changes:

1. **`packages/core/src/util/glob.ts`**: Expose `ignore` option in `Glob.Options`
2. **`packages/opencode/src/skill/index.ts`**: Add `findBrokenSymli

> *[Truncado — 1700 chars totais]*

---

## #27630 — Regression in v1.14.50: message submit fails silently due to ToolRegistry.resolveTools Object.entries crash

📅 `2026-05-15` | ✏️ **DanRioDev** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27630](https://github.com/anomalyco/opencode/issues/27630)


## Summary
OpenCode `v1.14.50` introduces a regression where submitting a message fails with no usable response in the client. The server returns HTTP 500 during tool resolution, and the session appears to silently stall from the user perspective.

The failure reproduces even with `--pure` (no external plugins), which indicates this is a core regression in `v1.14.50`, not a third-party plugin/config issue.

## Why this is bad
- **Core interaction broken**: users cannot submit messages reliably.
- **Silent UX failure**: from the UI perspective it looks like a stall instead of an actionable error.
- **High blast radius**: reproduces in `--pure` mode, so any installation can be affected.
- **Trust and productivity hit**: looks like random hangs; users lose work/time diagnosing local config that is not the cause.

## Affected version
- **Broken**: `1.14.50`
- **Working**: `1.14.48`

## Reproduction
```bash
opencode --version
# 1.14.50

opencode run --pure --print-logs "ping"
```

## Expected behavior
Message submission should proceed normally (resolve tools, then run prompt), including in `--pure` mode.

## Actual behavior
`SessionPrompt.resolveTools` crashes with:

```text
TypeError: Object.entries requires that input parameter not be null or undefined
```

Representative stack from logs:

```text
at entries (unknown)
at T (/$bunfs/root/chunk-3bt63p9a.js:1799:849)
at <anonymous> (/$bunfs/root/chunk-3bt63p9a.js:1799:2033)
at ToolRegistry.state (/$bunfs/root/chunk-fxbxw5ct.js:675:

> *[Truncado — 2527 chars totais]*

---

## #27629 — fix(provider): Z.AI GLM overflow error not classified as context overflow, causing chain compaction

📅 `2026-05-14` | ✏️ **darkhipo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27629](https://github.com/anomalyco/opencode/issues/27629)


## Description

When Z.AI GLM models (glm-5-turbo, glm-5, glm-5.1) exceed their 200K context window, they return an error that is not recognized by opencode's `OVERFLOW_PATTERNS` in `packages/opencode/src/provider/error.ts`. This causes the error to be classified as a generic `APICallError` instead of `ContextOverflowError`, preventing auto-compaction and resulting in an unrecoverable chain compaction loop.

## Observed Behavior

1. Session context fills past 200K threshold (common with many MCP tools)
2. opencode attempts compaction
3. Z.AI returns: `"tokens in request more than max tokens allowed"`
4. opencode classifies this as generic error (not overflow)
5. No compaction occurs → session retries → same error → infinite loop
6. Session becomes permanently unusable without DB intervention

## Expected Behavior

The error message `"tokens in request more than max tokens allowed"` should be classified as context overflow, triggering auto-compaction.

## Error Text

`tokens in request more than max tokens allowed`

## Root Cause

`OVERFLOW_PATTERNS` in `packages/opencode/src/provider/error.ts` does not include a pattern matching Z.AI GLM's overflow error message.

## Proposed Fix

Add the following pattern to `OVERFLOW_PATTERNS`:

```typescript
/tokens in request more than max tokens allowed/i,
```

## Related Issues

- #27519 — same class of bug (OpenAI-compatible providers using this error phrasing)
- #27594 — sessions permanently stuck after compaction (same downstream con

> *[Truncado — 1825 chars totais]*

---

## #27603 — Android Studio connection regression after 1.14.41 (reconnect loop / false disconnects)

📅 `2026-05-14` | ✏️ **Eliminater74** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27603](https://github.com/anomalyco/opencode/issues/27603)


### Description

Environment:

* Windows 11
* Android Studio
* OpenCode installed via npm (`opencode-ai`)
* Localhost server mode

Known Working:

* 1.14.41

Broken Versions:

* 1.14.44
* 1.14.48

Problem:
Starting with versions newer than 1.14.41, the Android Studio OpenCode panel repeatedly shows:

“Connection Error — Failed to connect to the OpenCode server. Retrying…”

while also spamming:

“Connected to OpenCode server”

The UI continuously disconnects/reconnects even though the backend server is alive and localhost networking is functioning correctly.

Backend logs show:
`opencode server listening on http://127.0.0.1:4096`

`netstat` confirms:

* 127.0.0.1:4096 LISTENING
* ESTABLISHED localhost connections between Android Studio and OpenCode

Troubleshooting already performed:

* Full Windows reboot
* Winsock reset
* DNS flush
* Verified localhost connectivity
* Killed stale node.exe processes
* Restarted Android Studio
* Confirmed no port conflicts

Result:
Rolling back to:
`opencode-ai@1.14.41`

immediately fixes the issue with no other system changes.

This appears to be a regression introduced after 1.14.41, likely related to:

* Android Studio plugin frontend
* websocket reconnect handling
* JCEF/webview integration
* localhost connection state handling

The backend itself does not appear to crash.

### Plugins

Android Studio plugin

### OpenCode version

1.14.41

### Steps to reproduce

1. Install OpenCode via:
   `npm install -g opencode-ai@1.14.44`
   or newer 

> *[Truncado — 2199 chars totais]*

---

## #27596 — `external_directory` permission bypassed for cross-drive paths on Windows

📅 `2026-05-14` | ✏️ **Jia-Yuhanoob** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27596](https://github.com/anomalyco/opencode/issues/27596)


### Description

# Bug: `external_directory` permission bypassed for cross-drive paths on Windows

## Summary

On Windows, when the workspace is on a different drive (e.g., `D:\`), tools like `read`, `write`, `edit`, `grep`, and `glob` bypass the `external_directory` permission check for paths on **other drives** (e.g., `C:\`). The root cause is a cross-drive bug in `AppFileSystem.contains()`.

### Version

Reproduced on v1.14.49 and v1.14.50 (Desktop, Windows 11).

---

## Root Cause

`packages/core/src/filesystem.ts:241-243`:

```typescript
export function contains(parent: string, child: string) {
  return !relative(parent, child).startsWith("..")
}
```

On Windows, Node.js `path.relative()` behaves differently across drives:

| Scenario | `path.relative()` result | `startsWith("..")` | `contains()` returns |
|---|---|---|---|
| Same drive: `D:\opencode\test0` → `D:\test.md` | `..\..\test.md` | `true` | `false` ✅ correct |
| Cross drive: `D:\opencode\test0` → `C:\Users\...\nDoc` | `C:\Users\...\nDoc` (absolute) | `false` | `true` ❌ **BUG** |

When drives differ, `path.relative` returns the **full absolute path** of the target, which does NOT start with `..`. This causes `contains()` to incorrectly return `true`, making `containsPath()` (in `instance-context.ts`) treat cross-drive paths as "inside the project" — completely skipping the `external_directory` permission gate.

The issue is also present in `normalizePathPattern()` and potentially affects `overlaps()` (same `path

> *[Truncado — 3818 chars totais]*

---

## #27559 — opencode run -s <missing-session-id> exits 0 with zero stdout instead of failing

📅 `2026-05-14` | ✏️ **paymog** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27559](https://github.com/anomalyco/opencode/issues/27559)


## Summary

`opencode run -s <session-id>` with a session id that doesn't exist locally exits with **code 0** and produces **zero stdout**, after only writing a `NotFoundError` to stderr. For consumers that script around opencode and rely on exit codes to decide success vs. failure, this looks indistinguishable from a successful no-op run.

## Version

`opencode 1.14.19` (Linux x64, installed via packaged binary in a Daytona sandbox).

## Repro

```bash
# Use any session id that doesn't exist on this machine:
echo "hi" | opencode run --format json -m amazon-bedrock/us.anthropic.claude-sonnet-4-6 --variant low -s ses_doesnotexist 2>stderr.log
echo "exit=$?"
cat stderr.log
```

Observed:

```
exit=0
NotFoundError: NotFoundError
 data: {
  message: "Session not found: ses_doesnotexist",
},

      at <anonymous> (/$bunfs/root/chunk-1q2thjd0.js:684:105806)
      at ~effect/Effect/successCont (/$bunfs/root/chunk-t65044z0.js:25:7738)
      ...
```

## Expected

`opencode run -s <missing>` should exit with a non-zero status (e.g. `2` for "not found" or `1` for any error). Ideally also emit a single JSON event on stdout when `--format json` is set, so JSON-stream consumers can detect the failure without parsing stderr.

## Why it matters

We script around `opencode run --format json -s <prior-session>` to resume agent conversations. Stale ids happen routinely (sandboxes get recycled, machines change, sessions get cleaned up). With exit code 0 + zero stdout + stderr-only error, the onl

> *[Truncado — 2140 chars totais]*

---

## #27557 — Desktop sidecar exits silently with code 1 — third-party plugin's global uncaughtException handler calls process.exit(1) on any unhandled rejection in the sidecar

📅 `2026-05-14` | ✏️ **ottosulin** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27557](https://github.com/anomalyco/opencode/issues/27557)


## Summary

OpenCode Desktop's sidecar process exits silently with **code 1** anywhere from 30 seconds to ~10 minutes after `server ready`, with no stderr written to `~/Library/Logs/@opencode-ai/desktop/main.log`. The Desktop UI then displays "server is dead". Repeats on every relaunch.

**Root cause traced**: a third-party opencode plugin (`oh-my-openagent`) installs a global Node `process.on('uncaughtException', …)` handler that catches ANY unhandled rejection in the sidecar — including ones thrown by opencode core itself — and unconditionally calls `process.exit(1)`. The plugin's maintainer has acknowledged this in [code-yeongyu/oh-my-openagent#3856](https://github.com/code-yeongyu/oh-my-openagent/issues/3856) (open, with proposed fixes) and the v4.1.1 regression specifically in [code-yeongyu/oh-my-openagent#3997](https://github.com/code-yeongyu/oh-my-openagent/issues/3997) (open).

I'm filing this against opencode anyway because **the architecture that lets a single plugin's global error handler take down the entire sidecar with zero diagnostic surface is itself the bug to fix in opencode**. Even after the upstream plugin fixes #3856, any future plugin can do the same thing and reproduce this exact failure.

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

## #27477 — MCP prompts/list polling storm causes 100% CPU and renderer crash (TypeError: Failed to fetch)

📅 `2026-05-14` | ✏️ **Philip2050** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27477](https://github.com/anomalyco/opencode/issues/27477)


## Issue: MCP `prompts/list` polling storm causes 100% CPU and renderer crash

### Description

OpenCode aggressively polls the `prompts/list` method on ALL connected MCP servers at startup. Many MCP servers do not implement this method (returning `-32601 Method not found`), but OpenCode keeps retrying in an aggressive loop. This causes:

1. **100% CPU usage** for 1-3 minutes on startup
2. **Memory spike** as MCP connection threads accumulate
3. **HTTP server unresponsiveness** - the main process is too busy polling MCPs to respond to renderer HTTP requests
4. **Renderer crash** - `TypeError: Failed to fetch` when `oc://` protocol fetch to local API times out

### Error Pattern

The log shows hundreds of these errors in milliseconds:
```
ERROR service=mcp clientName=oh-my-claudecode:t error=MCP error -32601: Method not found failed to get prompts
ERROR service=mcp clientName=mgrep error=MCP error -32601: Method not found failed to get prompts
ERROR service=mcp clientName=comet-bridge error=MCP error -32601: Method not found failed to get prompts
ERROR service=mcp clientName=open-computer-use error=MCP error -32601: Method not found failed to get prompts
ERROR service=mcp clientName=context7 error=MCP error -32601: Method not found failed to get prompts
ERROR service=mcp clientName=chrome-devtools error=MCP error -32601: Method not found failed to get prompts
ERROR service=mcp clientName=zai-mcp-server error=MCP error -32601: Method not found failed to get prompts
ERROR servic

> *[Truncado — 3079 chars totais]*

---

## #27456 — 1.14.49 regression: re-exporting .opencode/tool/index.ts barrel crashes ToolRegistry.state with 'Object.entries requires that input parameter not be null or undefined'

📅 `2026-05-14` | ✏️ **kunickiaj** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27456](https://github.com/anomalyco/opencode/issues/27456)


## Summary

`opencode` 1.14.49 and 1.14.50 crash during `SessionPrompt.resolveTools` with `TypeError: Object.entries requires that input parameter not be null or undefined` when a project's `.opencode/tool/index.ts` (or any user-config tool file) `export … from`'s another module.

End-user symptom: `opencode run "<anything>"` returns:

```
Error: {
  "name": "UnknownError",
  "data": {
    "message": "Unexpected server error. Check server logs for details."
  }
}
```

…on the very first prompt — the LLM is never reached. The only way to see the underlying cause is `opencode --print-logs`.

## Stack trace

```
ERROR service=server error=Object.entries requires that input parameter not be null or undefined cause=TypeError: Object.entries requires that input parameter not be null or undefined
    at entries (unknown)
    at _ (/$bunfs/root/chunk-82efwr7g.js:1799:849)
    at <anonymous> (/$bunfs/root/chunk-82efwr7g.js:1799:2033)
    at ToolRegistry.state (/$bunfs/root/chunk-djqek613.js:675:17303)
    at ToolRegistry.state (definition) (/$bunfs/root/chunk-82efwr7g.js:1799:766)
    at ToolRegistry.all (/$bunfs/root/chunk-82efwr7g.js:1802:62)
    at ToolRegistry.all (definition) (/$bunfs/root/chunk-82efwr7g.js:1799:2850)
    at ToolRegistry.tools (/$bunfs/root/chunk-82efwr7g.js:1884:897)
    at ToolRegistry.tools (definition) (/$bunfs/root/chunk-82efwr7g.js:1802:12)
    at SessionPrompt.resolveTools (/$bunfs/root/chunk-82efwr7g.js:1890:3276)
    at SessionPrompt.resolveTools (defini

> *[Truncado — 4665 chars totais]*

---

## #27451 — 1.14.50: opencode run crashes if project agents present

📅 `2026-05-14` | ✏️ **edwardsconnects90** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27451](https://github.com/anomalyco/opencode/issues/27451)


### Description

After auto-upgrade to **opencode 1.14.49**, then **1.14.50**, every `opencode run <message>` invocation and every TUI message submit terminates with `Object.entries on null` inside `ToolRegistry.state`. The TUI swallows the error: it accepts `/`-slash commands or plain prompts but Enter produces no visible response; the session crashes server-side without surfacing the error. Non-interactive `opencode run` exits 0 but prints the stack below when `--print-logs` is enabled.

```
ERROR service=server error=Object.entries requires that input parameter not be null or undefined cause=TypeError: Object.entries requires that input parameter not be null or undefined
    at entries (unknown)
    at T (/$bunfs/root/chunk-pdgzgk33.js:1799:849)
    at <anonymous> (/$bunfs/root/chunk-pdgzgk33.js:1799:2033)
    at ToolRegistry.state (/$bunfs/root/chunk-004r6c01.js:675:17293)
    at ToolRegistry.state (definition) (/$bunfs/root/chunk-pdgzgk33.js:1799:766)
    at ToolRegistry.all (/$bunfs/root/chunk-pdgzgk33.js:1802:63)
    at ToolRegistry.all (definition) (/$bunfs/root/chunk-pdgzgk33.js:1799:2832)
    at ToolRegistry.tools (/$bunfs/root/chunk-pdgzgk33.js:1884:897)
    at ToolRegistry.tools (definition) (/$bunfs/root/chunk-pdgzgk33.js:1802:12)
    at SessionPrompt.resolveTools (/$bunfs/root/chunk-pdgzgk33.js:1890:3277)
    at SessionPrompt.resolveTools (definition) (/$bunfs/root/chunk-pdgzgk33.js:1884:79)
    at SessionPrompt.run (/$bunfs/root/chunk-pdgzgk33.js:1891:1368)
   

> *[Truncado — 6754 chars totais]*

---

## #27446 — Unable to start opencode, it says bun has crashed.

📅 `2026-05-14` | ✏️ **kei-ya-131** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27446](https://github.com/anomalyco/opencode/issues/27446)


### Description

After upgrade the opencode to 1.14.50, Iaunched opencode in a Windows 11 64-bit environment, and it showed:

============================================================
Bun v1.3.13 (bf2e2cec) Windows x64 (baseline)
Windows v.win11_dt
CPU: sse42 avx avx2
Args: "C:\Users\[user]\AppData\Local\node\node_modules\opencode-ai\node_modules\opencode-windows-x64\bin\opencode.exe" "--user-agent=opencode/1.14.50" "--use-system-ca" "--"
Features: Bun.stderr(2) Bun.stdin(2) Bun.stdout(2) jsc standalone_executable
Builtins: "bun:ffi" "bun:main" "bun:sqlite" "node:assert" "node:async_hooks" "node:buffer" "node:child_process" "node:crypto" "node:dns" "node:events" "node:fs" "node:fs/promises" "node:http" "node:https" "node:module" "node:net" "node:os" "node:path" "node:path/win32" "node:process" "node:querystring" "node:readline" "node:stream" "node:stream/consumers" "node:stream/promises" "node:string_decoder" "node:timers" "node:timers/promises" "node:tls" "node:tty" "node:url" "node:util" "node:zlib" "undici" "ws" "node:v8" "node:http2" "node:diagnostics_channel" "node:dgram"
Elapsed: 489ms | User: 437ms | Sys: 109ms
RSS: 0.30GB | Peak: 0.30GB | Commit: 0.47GB | Faults: 73801 | Machine: 33.96GB

panic(thread 4208): Segmentation fault at address 0x0
oh no: Bun has crashed. This indicates a bug in Bun, not your code.

To send a redacted crash report to Bun's team,
please file a GitHub issue using the link below:

https://bun.report/1.3.13/ea1bf2e2ceEugggCCSntdll.dll017FCSnt

> *[Truncado — 1985 chars totais]*

---

## #27328 — The local server in OpenCode keeps crashing unexpectedly during use

📅 `2026-05-13` | ✏️ **Purple-Hyacinthi** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/27328](https://github.com/anomalyco/opencode/issues/27328)


### Description

The local server in OpenCode keeps crashing unexpectedly during use, which prevents me from accessing the model. While the task itself doesn't get interrupted, the interface freezes right after I grant permissions.When I restart it will recover again.

<img width="915" height="101" alt="Image" src="https://github.com/user-attachments/assets/7d26e06a-1ee2-432f-a2fa-ed0bc1046dd6" />

### Plugins

superpower

### OpenCode version

v1.14.48

### Steps to reproduce

I discovered this serious issue while using the opencode go package. And unlike when calling other APIs, this has affected the output of the agent.It appeared automatically. I'm not sure what caused it.I have witnessed the same phenomenon on both my Windows computer and my friend's Mac computer.

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

When the session is forcibly terminated, OpenCode reports "interactive Q&A aborted by user" on next launch, confirming the question was never dismissed.

## Root Cause Hypothesis

The warp flow (`/warp`) manipulates a **dialog stack** via `dialog.clear()`, `dialog.replace()`, etc. It appears the warp dialog lifecycle leaves a **modal overlay or event capture layer** that intercepts **all** input — both mouse and keyboard — and never releases it. The entire TUI event loop for the session becomes blocked.

Key code locations:
- `packages/opencode/src/cli/cmd/tui/routes/session/question.tsx` — QuestionPrompt with `onMouseUp` and key bindings
- `packages/opencode/src/cli/cmd/tui/component/dialog-workspace-create.tsx` — warp dialog lifecycle
- `packages/opencode/src/cli/cmd/tui/ui/` — dialog/overlay components

The fact that even Ctrl+C is captured suggests the issue is at the **TUI event loop or dialog overlay** level, not just the QuestionPrompt component.

## Severity

**High** — user is com

> *[Truncado — 2389 chars totais]*

---

## #27292 — [Bug]: Renderer crashes with TypeError: Failed to fetch in fetchMessages when background subagent completes

📅 `2026-05-13` | ✏️ **willowite** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27292](https://github.com/anomalyco/opencode/issues/27292)


## Description

OpenCode GUI (Electron renderer) crashes with `TypeError: Failed to fetch` when a background subagent task completes and the parent session tries to fetch updated messages. The crash kills the entire session — no recovery possible without restarting OpenCode.

## Environment

- OpenCode: 1.14.48
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

1. Start OpenCode TUI/GUI
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
- Backend logs (`~/.local/share/opencode/log/`) do NOT contain `TypeError` or `Failed to fetch` — this is purely renderer-sid

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
  "$schema": "https://opencode.ai/config.json",
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

### OpenCode version

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

## #27133 — [BUG]: Invalid agent/mode config files: agent crashes startup, mode silently disappears

📅 `2026-05-12` | ✏️ **EClinick** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27133](https://github.com/anomalyco/opencode/issues/27133)


### Description

A schema-invalid file in `.opencode/agent/` and the same file in `.opencode/mode/` produce very different results. A bad agent file throws `ConfigInvalidError` and breaks startup (4 different requests fail, no agent load at all). A bad mode file is silently dropped from the mode list with no error, log, or hint that anything was wrong.

Both behaviors are in `packages/opencode/src/config/agent.ts` `load()` calls `ConfigParse.schema(....)` which throws; `loadMode()` uses `Schema.decodeUnkownExit` and it just skips invalid entries. Ideally, as a user, both should surface an error and continue loading the rest of the files. So there's an inconsistency with the error handling of these two loading mechanisms. 




### Plugins

_No response_

### OpenCode version

1.14.48 (built from source, dev branch at commit `549b146e`

### Steps to reproduce

**Steps to Repro:**

1. In an empty dir, create `.opencode/agent/good.md` and `.opencode/mode/good.md` with valid frontmatter (e.g `temperature: 0.5`).
2. Create `.opencode/agent/broken.md` and `.opencode/mode/broken.md` with `temperature: "not a valid number"`.
3. Run `bun dev <dir you added agent and mode files>` or `opencode <dir you added agent and mode files>`.

Startup will fail with `4 of 5 requests failed: ConfigInvalidError`. No agents load.

If you delete `agent/broken.md` and rerun. Startup succeeds, but the broken mode is missing from the mode list, it'll show a `good` mode due to `good.md` but `broken` mode i

> *[Truncado — 2019 chars totais]*

---

## #27028 — [Windows] OpenCode crashes when executing git commands in Windows Terminal

📅 `2026-05-12` | ✏️ **xwh5** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27028](https://github.com/anomalyco/opencode/issues/27028)


## Issue Description

On Windows 11 with Windows Terminal, OpenCode crashes unexpectedly when executing git commands such as `git status`, `git stash`, or other git operations. The terminal window closes immediately instead of showing the command output.

## Environment

- OS: Windows 11 
- Terminal: Windows Terminal
- Shell: PowerShell
- OpenCode version: Latest (auto-updated)
- Installation method: npm (`npm install -g opencode-ai`)

## Steps to reproduce

1. Open Windows Terminal
2. Run `opencode`
3. Execute any git command (e.g., `git status`, `git branch`, `git stash")
4. Expected: Git command executes and shows output
5. Actual: OpenCode crashes and terminal window closes

## Expected behavior

Git commands should execute normally without crashing OpenCode or closing the terminal window.

## Actual behavior

The terminal window closes immediately when a git command is being executed. This appears to be related to how OpenCode manages child processes on Windows.

## Related issues

This issue may be related to:
- #24288 - Windows: self-kill issue when terminating node processes
- #7950 - [Windows] AI killing node.exe process terminates OpenCode itself
- #25930 - OpenCode closes when I terminate the running node processes

## Additional context

The crash happens frequently during git operations and makes OpenCode unusable for development workflows that rely on git commands. A workaround would be highly appreciated.

---

## #26890 — OpenCode Crashes with Segmentation Fault After Removing Plugin from Configuration

📅 `2026-05-11` | ✏️ **cheezmil** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26890](https://github.com/anomalyco/opencode/issues/26890)


### Description

OpenCode crashes with a Bun segmentation fault immediately after removing any plugin entry from the configuration file `opencode.jsonc`. Once this happens, OpenCode becomes permanently unusable and cannot be started again.


Bun v1.3.13 (bf2e2cec) Windows x64 (baseline)  
Windows v.win11_dt  
CPU: sse42 avx avx2  
Args: "D:\CodeRelated\Public\fnm\node\node-versions\v24.11.0\installation\node_modules\opencode-ai\node_modules\opencode-windows-x64\bin\opencode.exe" "-m" "local/mimo-v2.5"  
Elapsed: 2ms | User: 15ms | Sys: 0ms  
RSS: 18.06MB | Peak: 18.06MB | Commit: 24.71MB | Faults: 4560  

panic(main thread): Segmentation fault at address 0x7FF7207392CD  
oh no: Bun has crashed. This indicates a bug in Bun, not your code.

### Plugins

omo, opencode-pty

### OpenCode version

 Can't even see the version, I remember it was installed last week. panic(main thread): Segmentation fault at address 0x7FF7207392CD oh no: Bun has crashed. This indicates a bug in Bun, not your code.  To send a redacted crash report to Bun's team, please file a GitHub issue using the link below:   https://bun.report/1.3.13/e_1bf2e2ceAA4ky+FmrbqiM4jzn0DCYKERNEL32.DLLut0LCSntdll.dll4oijBA2u//B6spuugB

### Steps to reproduce

After deleting any plugin item from the `plugins` array in `C:\Users\xxxxx\.config\opencode\opencode.jsonc`, OpenCode fails to start and crashes with a Bun segmentation fault error. The application becomes completely unusable - it cannot be opened again even after subs

> *[Truncado — 1645 chars totais]*

---

## #26886 — Unhandled AI_APICallError on transient GitHub Copilot API disconnect ("input item ID does not belong to this connection")

📅 `2026-05-11` | ✏️ **sipa-echo-zaoa** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26886](https://github.com/anomalyco/opencode/issues/26886)


### Description

### Summary
When using the GitHub Copilot provider, if the upstream `api.githubcopilot.com` backend drops the connection or gets out of sync (returning an `input item ID does not belong to this connection` error), OpenCode fails to catch it gracefully. Instead, it throws a raw `AI_APICallError` stack trace. 

Since this appears to be a rare but known upstream API glitch, it would be great if OpenCode could catch this specific error and either automatically retry the request or surface a user-friendly UI message (e.g., "Connection to Copilot lost. Please try again.") rather than dumping the raw trace.

### Expected Behavior
OpenCode handles the upstream stream error gracefully via automatic retry or a clean UI notification.

### Actual Behavior
The application throws an unhandled exception from the internal session processor.

### Logs / Traceback
*Note: The `requestBodyValues` containing the codebase context have been redacted for security.*

```text
ERROR 2026-05-11T13:19:09 +1040ms service=llm providerID=github-copilot modelID=gpt-5.4 session.id=ses_2bbb04f7cffeQD0GtJEX7zbAI1 small=false agent=plan mode=primary error={"error":{"name":"AI_APICallError","url":"[https://api.githubcopilot.com/responses](https://api.githubcopilot.com/responses)","requestBodyValues": "[... TRUNCATED FOR SECURITY ...]"}}

responseBody: "{\"error\":{\"message\":\"input item ID does not belong to this connection\",\"code\":\"\"}}\n","isRetryable":false,"data":{"error":{"message":"in

> *[Truncado — 2356 chars totais]*

---

## #26878 — Illegal hardware instruction on macOS Intel Ivy Bridge (SIGILL on BMI2/shlxq)

📅 `2026-05-11` | ✏️ **linletian** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26878](https://github.com/anomalyco/opencode/issues/26878)


### Description

`opencode` crashes immediately on this machine with:
`zsh: illegal hardware instruction opencode`

I did some local debugging and the failure appears to be a CPU instruction-set incompatibility in the shipped macOS x64 binary.

Details:
- Machine: Mac Pro 6,1 (Late 2013)
- CPU: Intel Xeon E5-1680 v2 (Ivy Bridge)
- OS: macOS 12.7.6
- Binary path: `~/.opencode/bin/opencode`
- `file ~/.opencode/bin/opencode` reports a Mach-O x86_64 executable
- `opencode --version` crashes with `Illegal instruction: 4`
- macOS crash report shows `SIGILL / EXC_BAD_INSTRUCTION`
- `lldb` stops on `shlxq %rax, %rcx, %rdx`, which is a BMI2 instruction
- `sysctl machdep.cpu.features machdep.cpu.leaf7_features` shows AVX1.0, but no AVX2/BMI2 support on this CPU

This suggests the current macOS x64 build requires Haswell-era instructions (BMI2 and possibly AVX2), so it is not compatible with Ivy Bridge Xeons.

Possibly related to #8345, but I am filing this with the concrete low-level crash details from this machine.

### Plugins

none

### OpenCode version

Unable to retrieve, because the binary crashes before `opencode --version` can print anything.

The embedded Bun runtime strings in the binary include `v1.3.13`.

### Steps to reproduce

1. Use a Mac Pro 6,1 or another Intel Mac with an Ivy Bridge CPU lacking AVX2/BMI2.
2. Install the latest OpenCode CLI so that the binary is placed at `~/.opencode/bin/opencode`.
3. Run `opencode` or `opencode --version`.
4. Observe the immediate cr

> *[Truncado — 1827 chars totais]*

---

## #26877 — Illegal hardware instruction on macOS Intel Ivy Bridge (SIGILL on BMI2/shlxq)

📅 `2026-05-11` | ✏️ **linletian** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26877](https://github.com/anomalyco/opencode/issues/26877)


### Description

`opencode` crashes immediately on this machine with:
`zsh: illegal hardware instruction opencode`

I did some local debugging and the failure appears to be a CPU instruction-set incompatibility in the shipped macOS x64 binary.

Details:
- Machine: Mac Pro 6,1 (Late 2013)
- CPU: Intel Xeon E5-1680 v2 (Ivy Bridge)
- OS: macOS 12.7.6
- Binary path: `~/.opencode/bin/opencode`
- `file ~/.opencode/bin/opencode` reports a Mach-O x86_64 executable
- `opencode --version` crashes with `Illegal instruction: 4`
- macOS crash report shows `SIGILL / EXC_BAD_INSTRUCTION`
- `lldb` stops on `shlxq %rax, %rcx, %rdx`, which is a BMI2 instruction
- `sysctl machdep.cpu.features machdep.cpu.leaf7_features` shows AVX1.0, but no AVX2/BMI2 support on this CPU

This suggests the current macOS x64 build requires Haswell-era instructions (BMI2 and possibly AVX2), so it is not compatible with Ivy Bridge Xeons.

Possibly related to #8345, but I am filing this with the concrete low-level crash details from this machine.

### Plugins

none

### OpenCode version

Unable to retrieve, because the binary crashes before `opencode --version` can print anything.

The embedded Bun runtime strings in the binary include `v1.3.13`.

### Steps to reproduce

1. Use a Mac Pro 6,1 or another Intel Mac with an Ivy Bridge CPU lacking AVX2/BMI2.
2. Install the latest OpenCode CLI so that the binary is placed at `~/.opencode/bin/opencode`.
3. Run `opencode` or `opencode --version`.
4. Observe the immediate cr

> *[Truncado — 1827 chars totais]*

---

## #26871 — TUI crashes when task history references a missing child session

📅 `2026-05-11` | ✏️ **WarGloom** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26871](https://github.com/anomalyco/opencode/issues/26871)


## Summary

Opening a session in the TUI can terminate the process when historical task output references a child/subagent session that no longer exists.

## What happens

A completed `task` tool part can store `metadata.sessionId` for the child session it delegated to. When that child session has been removed or is otherwise missing, the parent session still renders the historical task entry. During render, the TUI tries to sync the missing child session and the rejected `Session not found` lookup becomes an unhandled process error.

## Expected behavior

The parent session should still open. The stale task entry should render as historical output, and navigation into the missing child session should be disabled or ignored.

## Notes

The affected code is in `packages/opencode/src/cli/cmd/tui/routes/session/index.tsx` in the task tool renderer.

---

## #26846 — Opencode segfaults in NixOS+WSL

📅 `2026-05-11` | ✏️ **muckelba** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/26846](https://github.com/anomalyco/opencode/issues/26846)


### Description

I'm not able to run opencode inside of WSL running NixOS:

Unstable:
```
nix run nixpkgs/nixos-unstable#opencode -- --version
zsh: segmentation fault  nix run nixpkgs/nixos-unstable#opencode -- --version
```
Dev:
```
nix run github:anomalyco/opencode
error: Cannot build '/nix/store/hpl0fz47xs1bs9qfggv2g0v9yzrcbx2v-opencode-1.14.46+a780186.drv'.
       Reason: builder failed with exit code 1.
       Output paths:
         /nix/store/nrsbqjxmr2f2jpvjq6ly9vi7nzvjarjv-opencode-1.14.46+a780186
       Last 25 log lines:
       > dist/assets/angular-ts-BwZT4LLn.js                          183.87 kB │ gzip:  16.73 kB │ map:   249.42 kB
       > dist/assets/vue-vine-8moa0y9V.js                            190.27 kB │ gzip:  18.16 kB │ map:   255.24 kB
       > dist/assets/wolfram-lXgVvXCa.js                             262.44 kB │ gzip:  77.10 kB │ map:   279.68 kB
       > dist/assets/session-CLdkD14I.js                             528.86 kB │ gzip: 174.86 kB │ map: 1,979.63 kB
       > dist/assets/wasm-CG6Dc4jp.js                                622.38 kB │ gzip: 231.20 kB │ map:   622.93 kB
       > dist/assets/cpp-CofmeUqb.js                                 626.12 kB │ gzip:  44.93 kB │ map:   816.15 kB
       > dist/assets/ghostty-web-CmRTNB3y.js                         652.83 kB │ gzip: 188.67 kB │ map:   793.29 kB
       > dist/assets/emacs-lisp-C9XAeP06.js                          779.90 kB │ gzip: 196.57 kB │ map:   789.84 kB
       > dist/assets/index-BtCt3uoZ

> *[Truncado — 3098 chars totais]*

---

## #26714 — Local stdio MCP servers leak processes on disconnect / replace / rollback

📅 `2026-05-10` | ✏️ **yangshuai0711** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26714](https://github.com/anomalyco/opencode/issues/26714)


### Description

When a local stdio MCP server is disconnected, replaced (via a second `MCP.add()` with the same name), or rolled back after tool discovery (`defs()`) failure, the spawned process tree is not terminated. Only `client.close()` is called, which stops the SDK transport but leaves the child process and its descendants running as orphans.

The existing cleanup code (added in #15516) only covers the instance disposal path, and even there it only kills descendant PIDs — not the transport's own root PID.

Over multiple sessions these orphaned processes accumulate, consuming memory and potentially holding ports.

### OpenCode version

1.3.13 (dev branch, commit d112da078)

### Steps to reproduce

1. Configure a local stdio MCP server in opencode.json (e.g. `"type": "local", "command": ["node", "server.js"]`)
2. Disconnect the server via `MCP.disconnect()` — or trigger a replace by calling `MCP.add()` twice with the same name
3. Check running processes: the MCP server process is still alive with PPID changed to 1

### Operating System

macOS (Apple Silicon)

### Terminal

Ghostty

### Additional context

This is related to #15808 and #8257 but covers a distinct gap:

**vs #15808** ("opencode run: MCP child processes not terminated on exit"): That issue is about the `opencode run` headless command not cleaning up MCP processes when the CLI exits. #15516 partially addressed it by adding descendant kill in the dispose handler. But the in-process teardown paths — `disconnec

> *[Truncado — 2255 chars totais]*

---

## #26667 — [BUG]:session.processor crashes sidecar on unhandled AbortError

📅 `2026-05-10` | ✏️ **lb714-bit** | 💬 6 | 🔗 [https://github.com/anomalyco/opencode/issues/26667](https://github.com/anomalyco/opencode/issues/26667)


### Description

The `session.processor` service does not gracefully handle `AbortError` from LLM streaming responses. When a stream is interrupted (network timeout, API disconnection, or internal cancellation), the unhandled `AbortError` propagates up the Effect.js fiber stack and crashes the entire sidecar process, causing the local server to become unreachable.

The UI displays "Failed to fetch" immediately before the disconnect. This is especially easy to trigger during long-running continuous operations (e.g., task loops that send repeated LLM requests), as the probability of hitting a stream interruption increases with runtime.

 Log Evidence
Crash https://github.com/code-yeongyu/oh-my-openagent/pull/1 (2026-05-10T000121.log):
ERROR 2026-05-10T00:11:53 +625366ms service=session.processor
session.id=ses_1f0c73b9bffdySyhyhZAER438S
messageID=msg_e0f39e7160024LtypELcfvOn1w
error=Aborted
stack=AbortError: Aborted
at new DOMException (node:internal/per_context/domexception:76:18)
at Array. (.../node-BaTHrJu2.js:284227:27)
at ~effect/Effect/successCont (.../node-BaTHrJu2.js:7884:29)
at ~effect/Effect/evaluate (.../node-BaTHrJu2.js:7898:25)
at FiberImpl.runLoop (.../node-BaTHrJu2.js:7710:112)
at FiberImpl.evaluate (.../node-BaTHrJu2.js:7680:26)
at process.processTicksAndRejections (node:internal/process/task_queues:104:5)

Crash https://github.com/code-yeongyu/oh-my-openagent/pull/2 (2026-05-10T001732.log) — identical signature, different chunk (app auto-updated):
ERROR 2026-05

> *[Truncado — 2580 chars totais]*

---

## #26666 — [macOS] Clicking window close button (X) fully quits the app instead of keeping it running

📅 `2026-05-10` | ✏️ **Theoz001** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26666](https://github.com/anomalyco/opencode/issues/26666)


### Description

## Description
On macOS, clicking the red close button (X) in the top-left corner of the window fully quits the OpenCode desktop app (Dock icon disappears), instead of the standard macOS behavior where the window closes but the app keeps running in the background.

## Steps to Reproduce
1. Open OpenCode desktop app on macOS
2. Click the red close button (X) on the window
3. Observe the Dock: OpenCode icon disappears, app fully exits
4. No confirmation dialog is shown

## Expected Behavior
Clicking X should only close the window while keeping the app running in the Dock. Clicking the Dock icon again should restore the window. This is the standard behavior for macOS apps (e.g., Safari, Notes, VS Code).

## Actual Behavior
The app fully quits without any warning when the close button is clicked.

## Environment
- **OS:** macOS
- **App Version:** Desktop (Electron)
- **Installation Method:** [Please specify, e.g., dmg / Homebrew]

## Possible Technical Cause
Looking at the Electron main process code:
1. No `app.on("window-all-closed")` event handler is registered
2. No `app.on("activate")` event handler is registered, so clicking the Dock icon after closing the window cannot restore it

Consider implementing the standard Electron macOS app pattern to prevent quitting when the window is closed.

---

Please 👍 if you're experiencing the same issue.

### Plugins

_No response_

### OpenCode version

1.14.46 (1.14.46)

### Steps to reproduce

1. Open OpenCode desktop

> *[Truncado — 1774 chars totais]*

---

## #26651 — opencode crashed when i run /init

📅 `2026-05-10` | ✏️ **zeekling** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/26651](https://github.com/anomalyco/opencode/issues/26651)


### Description

opencode crashed when i run /init
<img width="2429" height="424" alt="Image" src="https://github.com/user-attachments/assets/d245da78-bdf2-4cbf-a77c-c0ebe6ecde9b" />

### Plugins

superpowers tokenizer-aliases context-usage

### OpenCode version

v1.14.46

### Steps to reproduce
1、run /init opencode
2、when /init finished. run /init and opencode will crashed 

### Screenshot and/or share link

_No response_

### Operating System
windows 11

### Terminal

powershell

---

## #26642 — Title Binary file detection misses extension-less files, causing the preview pane to hang

📅 `2026-05-10` | ✏️ **nb5p** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26642](https://github.com/anomalyco/opencode/issues/26642)


### Description

opencode already has binary file handling — `File.read()` returns `{ type: "binary" }` for known binary extensions, and `FileMedia` / `isBinaryContent` render the proper "binary file" placeholder card on the frontend. This works for files like `foo.bin`, `foo.so`, `foo.exe`, etc.

It does **not** work for extension-less binaries. `File.read()`'s classification is purely extension-driven, so a file like a Go-compiled executable named `axonhub` (no suffix) misses every branch and falls through to `readFileString(full)` plus a `git diff` / `structuredPatch` round on the result — slurping a multi-megabyte binary into memory as UTF-8 and then attempting to diff it. The HTTP request takes ~10+ seconds to return (longer for larger binaries), during which the preview pane sits on "loading…".

The hung tab is persisted with the session, so closing and reopening the app re-creates the same long stall automatically every launch until the file is removed from the open tabs.

### Plugins

_No response_

### OpenCode version

OpenCode Desktop 1.14.39

### Steps to reproduce

1. In any project directory, place a compiled binary with no extension (e.g. `go build -o axonhub .`)
2. Open the project in opencode desktop
3. Click `axonhub` in the file tree

**Expected:** the existing `FileMedia` "binary file" placeholder card is shown — the same UI that already renders for `axonhub.bin`, `axonhub.so`, etc.

**Actual:** the preview pane stays on "loading…" for ~10+ seconds before 

> *[Truncado — 1859 chars totais]*

---

## #26630 — Crash: Segmentation fault in onnxruntime_binding.node on Windows (Bun 1.3.13)

📅 `2026-05-10` | ✏️ **romuelmartins** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26630](https://github.com/anomalyco/opencode/issues/26630)


### Description

**Environment:**
- Bun version: 1.3.13 (bf2e2cec) Windows x64 (baseline) StandaloneExecutable
- Operating System: Windows 11
- Application: OpenCode

**Problem:**
I'm experiencing a consistent segmentation fault when running OpenCode.

**Error:** 
Segmentation fault at address 0x00000004

**Stack trace summary:**
- `napi_open_escapable_handle_scope`
- `Bun::NapiHandleScopeImpl::reserveSlot` 
- `JSC::JSCellLock::lock`
- Called from inside `onnxruntime_binding.node`

The crash occurs during model initialization/loading (likely when using local embeddings or ONNX models).

**Related Bun issue (same crash):**
https://github.com/oven-sh/bun/issues/28008

**Automatic Bun crash report:**
(Paste your bun.report link here if you still have it)

**Steps to reproduce:**
1. Open OpenCode
2. Load a model that uses ONNX Runtime (embeddings, etc.)

Let me know if you need more logs or files.

### Plugins

_No response_

### OpenCode version

1.14.45

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #26628 — tui config schema mismatch + leader none crash

📅 `2026-05-10` | ✏️ **ovftank** | 💬 11 | 🔗 [https://github.com/anomalyco/opencode/issues/26628](https://github.com/anomalyco/opencode/issues/26628)


### Description

tui config seems out of sync with the published schema.

schema says to use `keymap`, but `1.14.46` rejects it:

```txt
Unrecognized key: "keymap"
```

if i switch back to `keybinds`, disabling the leader key crashes/blank-screens the tui:

```json
{
  "keybinds": {
    "leader": "none"
  }
}
```

log:

```txt
Invalid leader trigger: expected exactly one binding
```

also, if an old/invalid key is still in `tui.json`, for example:

```json
{
  "keybinds": {
    "username_toggle": "none"
  }
}
```

the whole tui config gets ignored and opencode loads the defaults, which makes it hard to tell what actually happened.

### Plugins

none

### OpenCode version

`1.14.46`

### Steps to reproduce

1. create `~/.config/opencode/tui.json` with `keymap`
2. start `opencode`
3. it gets rejected as an unknown key
4. change it to `keybinds.leader = "none"`
5. start `opencode` again
6. tui opens to a blank/white screen with `Invalid leader trigger`
7. add an invalid old key like `username_toggle`; the whole config is ignored and defaults are loaded

### Screenshot and/or share link

no share link. it just opens as a blank/white tui screen.

### Operating System

windows 10

### Terminal

windows terminal

---

## #26627 — Endless loop with massive token consumtion to just randomly stop

📅 `2026-05-10` | ✏️ **Amubus** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26627](https://github.com/anomalyco/opencode/issues/26627)


### Description

Minor issue since last few patches- when entering a request it will run large amounts of tools/executions that burn trough tokens- but never actually reply/answer/process request- this will continue on until it randomly stops- can be 5-10 minutes- have had request run over 20m. 

### Plugins

None

### OpenCode version

OpenCode Desktop v1.14.45

### Steps to reproduce

Open Opencode app
Run Request 
Leave PC on and logged in - screen goes black - then come back after 3 hours
Make another request
See forever loop. 

### Screenshot and/or share link

Unfortunately in my frustration of losing massive amounts of tokens with nothing to show for it- I never took a screen shot in my attempt to yeet the entire PC out into the rain....

### Operating System

Windows 10

### Terminal

No terminal - using the OpenCode Application.

---

## #26621 — TUI crashes silently on startup in v1.14.45 on Windows (upgrade EPERM)

📅 `2026-05-10` | ✏️ **leeeldridge-max** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26621](https://github.com/anomalyco/opencode/issues/26621)


## Description
TUI crashes silently on startup after upgrading from v1.14.44 to v1.14.45. The HTTP backend process runs normally — only the TUI process dies.

## Environment
- **Version:** 1.14.45
- **Platform:** Windows (win32)
- **Shell:** PowerShell 5.1
- **Install method:** npm global

## Evidence
The TUI log ends abruptly at 39 lines during plugin loading:

```
INFO  2026-05-10T01:39:29 +459ms service=default version=1.14.45 args=[] process_role=main run_id=43d27da4-f711-4c0f-b690-1c3a141d4bb8 opencode
...
INFO  2026-05-10T01:39:31 +0ms service=tui.plugin id=internal:plugin-manager loading internal tui plugin
INFO  2026-05-10T01:39:31 +0ms service=tui.plugin id=which-key loading internal tui plugin
(abrupt end)
```

No ERROR, fatal, panic, or exception lines appear in any log.

## Upgrade warning
During the upgrade from 1.14.44 to 1.14.45, npm reported an EPERM error trying to unlink the old binary:

```
npm warn cleanup [Error: EPERM: operation not permitted, 
  unlink ...\.opencode-ai-gD2hDZKJ\node_modules\opencode-windows-x64\bin\opencode.exe]
```

This may indicate the old binary was locked/in use during upgrade, potentially leaving a corrupted install.

## Workaround
Downgrading to 1.14.44 restores functionality.

---

## #26593 — Opencode Desktop crashes if the soure directory was deleted

📅 `2026-05-09` | ✏️ **vcode11** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26593](https://github.com/anomalyco/opencode/issues/26593)


### Description

The desktop app doesn't handle the deletion of directory well. 

### Plugins

N/a

### OpenCode version

1.14.44

### Steps to reproduce

1. Use opencode desktop app to open a project and close the app.
2. Delete the project.
3. Opencode crashes and shows an error log.  

### Screenshot and/or share link

_No response_

### Operating System

MacOs 26.4.1

### Terminal

N/A

---

## #26587 — v1.14.42+ flagged by Microsoft Deferder SmartScreen

📅 `2026-05-09` | ✏️ **ironcloudy** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26587](https://github.com/anomalyco/opencode/issues/26587)


### Description

Starting with version 1.14.42, the installer is once again being flagged by MDS.
Are there any known issues or security concerns we should be aware of?

### Plugins

_No response_

### OpenCode version

v1.14.42

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="534" height="500" alt="Image" src="https://github.com/user-attachments/assets/acf8bb43-8182-4c8a-91e4-cbd46447055d" />

### Operating System

Windows 11

### Terminal

_No response_

---

## #26480 — Default opencode (server+TUI) corrupts ConPTY-hosted parent shell on exit; shell crashes with NT_STATUS/CLR error code

📅 `2026-05-09` | ✏️ **Zyl0812** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26480](https://github.com/anomalyco/opencode/issues/26480)


### Description

### Summary
On Windows, exiting `opencode` in its **default server+TUI** mode (via `/exit` or Ctrl+C×2) **kills the parent shell** when that shell is hosted in a **ConPTY** (the standard Win32 pseudoconsole used by every modern Windows terminal: Warp, Windows Terminal, VS Code, etc.). The same opencode binary, run from a native `conhost.exe` window, leaves the parent shell alive. This points at console-handle / `FreeConsole` cleanup in opencode (or its bun runtime) that is benign against full conhost but corrupts ConPTY's internal state.

The user-visible symptom is that the host terminal's pane closes immediately, because the host terminal correctly reacts to its child shell dying.

This is a more focused diagnosis of the same issue partially addressed in #6189 (closed). #6189 only covered the Ctrl+C key-handler exit path; the bug here reproduces equally on `/exit` and is not about input handling.

### Differential reproduction matrix

| Console host | opencode mode | Parent shell dies? |
| --- | --- | --- |
| `conhost.exe` (classic Windows console window) | default (server+TUI) | **No** |
| ConPTY (Warp / Windows Terminal / VS Code) | default
(server+TUI) | **Y
| ConPTY | `opencode serve …` + `opencode attach …` | **No** |
| ConPTY, with `cmYes** |
| ConPTY, with `powershell -NoExit -Command "opencode"` | default | **Yes** |

Three things narrow the cause:
1. **Console-host ted shells die.Native conhost is fine.
2. **Server-child dependent** — `opencode att

> *[Truncado — 6301 chars totais]*

---

## #26435 — session list crashes on legacy sessions with modelID key (expected id)

📅 `2026-05-09` | ✏️ **AndroidRadish** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26435](https://github.com/anomalyco/opencode/issues/26435)


### Description

> After upgrading opencode, session list fails with Expected string, got undefined.  
> Root cause: session.ts:fromRow line 84 does ModelID.make(row.model.id) but old DB stores {"providerID":"opencode","modelID":"big-pickle"} — modelID wasn't migrated to id.  
> Single bad row kills the entire list.  
> Fix: add row.model.id ?? row.model.modelID fallback, and wrap listByProject row parsing in try/catch.

### Plugins

_No response_

### OpenCode version

1.14.31→1.14.41

### Steps to reproduce

Have any old session record in opencode.db where model column contains {"providerID":"opencode","modelID":"..."} instead of {"id":"...","providerID":"opencode"}. Run opencode session list → crash.

### Screenshot and/or share link

_No response_

### Operating System

Windows11

### Terminal

Powershell 7.6.1

---

## #26412 — Custom OpenAI-compatible provider: "Expected 'function.name' to be a string" on streaming tool call chunks

📅 `2026-05-08` | ✏️ **mazingerzzz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26412](https://github.com/anomalyco/opencode/issues/26412)


## Environment

- OpenCode: 1.14.41
- Provider: `@ai-sdk/openai-compatible` (custom, vLLM backend)
- OS: Linux (Debian)

## Description

When using a custom OpenAI-compatible provider with a vLLM backend, any tool call (Read, Edit, Bash…) fails immediately with:

```
Expected 'function.name' to be a string.
```

## Root cause (confirmed via curl)

The OpenAI streaming spec sends `function.name` only in the **first** delta chunk; subsequent chunks carry `"name": null`. This is correct per the [OpenAI API reference](https://platform.openai.com/docs/api-reference/chat/streaming). OpenCode's AI SDK validates each chunk independently and rejects `null` as invalid.

Raw streaming response from the backend (reproduced with curl):

```
# Chunk 1 — name is a string ✓
data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":"read_file","arguments":""}}]}}]}

# Chunk 2 — name is null per OpenAI spec → OpenCode crashes here
data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":null,"arguments":"{\"path\": \"test"}}]}}]}

# Chunk 3
data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":null,"arguments":".py\""}}]}}]}
```

Adding `"compatibility": "compatible"` to the provider options has no effect.

## Steps to reproduce

1. Configure a custom provider with `npm: "@ai-sdk/openai-compatible"` pointing to any OpenAI-compatible backend that streams tool calls (vLLM, LM Studio, llama.cpp server, etc.)
2. Ask the model to read or edit a file
3.

> *[Truncado — 1865 chars totais]*

---

## #26404 — macOS x86_64 binary in 1.14.41 fails with "invalid or unsupported format for signature" and gets Killed: 9

📅 `2026-05-08` | ✏️ **kowalski233** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26404](https://github.com/anomalyco/opencode/issues/26404)


### Description

After upgrading `opencode-ai` from `1.14.39` to `1.14.41`, the CLI stopped working on macOS x86_64.

Environment:
- macOS: x86_64
- `uname -m`: `x86_64`
- Node `process.arch`: `x64`

Installed binary:
- Path: `/Users/kowalski/.npm-global/lib/node_modules/opencode-ai/bin/.opencode`
- `file` output: `Mach-O 64-bit executable x86_64`

Symptoms:
- Running the binary directly:
  - `/Users/kowalski/.npm-global/lib/node_modules/opencode-ai/bin/.opencode --version`
  - Result: `Killed: 9`

Security / signature checks:
- `spctl --assess --verbose=4 /Users/kowalski/.npm-global/lib/node_modules/opencode-ai/bin/.opencode`
  - Output: `invalid or unsupported format for signature`
- `codesign --verify --verbose=4 /Users/kowalski/.npm-global/lib/node_modules/opencode-ai/bin/.opencode`
  - Output:
    - `/Users/kowalski/.npm-global/lib/node_modules/opencode-ai/bin/.opencode: invalid or unsupported format for signature`
    - `In architecture: x86_64`

Notes:
- Architecture appears correct, so this does not look like an arm64/x64 mismatch.
- `1.14.39` was working before the upgrade.
- This looks like a packaging/signing problem with the macOS x86_64 binary published in `1.14.41`.

### Plugins

_No response_

### OpenCode version

1.14.41

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

mac os  15.7.5 

### Terminal

_No response_

---

## #26377 — Desktop: Direct upgrade from <1.14.37 to >=1.14.41 fails silently (desktop migration skipped)

📅 `2026-05-08` | ✏️ **Kylinghu** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26377](https://github.com/anomalyco/opencode/issues/26377)


### Description

Upgrading OpenCode Desktop from v1.14.33 (or any version before v1.14.37) directly to v1.14.41 silently fails. The app installs but clicking the shortcut produces no window.

The root cause appears to be that v1.14.37 introduced a desktop path migration that runs on startup. When that migration is skipped (by jumping from .33 to .41 directly), the app crashes on launch.

### Steps to reproduce

1. Install OpenCode Desktop v1.14.33 (installed at `%LOCALAPPDATA%\OpenCode`)
2. Run the v1.14.41 installer -- it installs to `C:\Program Files\OpenCode` but does not trigger the .37 migration
3. Launch OpenCode -- the app exits immediately with no window

### Expected behavior

The app should start normally, or the installer should handle the missing migration state gracefully.

### Actual behavior

Application crashes silently. The console output shows:

```
GPU process exited unexpectedly: exit_code=-2147483645
FATAL: GPU process is not usable. Goodbye.
```

Windows Event Viewer also records an Application Error with exception code `0x80000003`.

### Workaround / Fix

Install v1.14.37 first (which runs the desktop path migration), then upgrade to v1.14.41:

1. Uninstall v1.14.41
2. Install v1.14.37 from [releases](https://github.com/anomalyco/opencode/releases/tag/v1.14.37)
3. Upgrade to v1.14.41 via the built-in updater

### Environment

- OS: Windows 10 x64
- OpenCode Desktop v1.14.33 to v1.14.41

---

## #26365 — [Web UI] Task never stops — agent runs indefinitely when using opencode serve

📅 `2026-05-08` | ✏️ **lileilei-camera** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26365](https://github.com/anomalyco/opencode/issues/26365)


## Bug Description
When using OpenCode via the web interface (`opencode serve`), tasks never stop. The agent enters an infinite loop and continues running indefinitely, even after the task appears to be completed. The TUI stops correctly — this issue only occurs in the web UI.

## Steps to Reproduce
1. Start OpenCode: `opencode serve`
2. Open browser, access web UI via SSH port forwarding
3. Give the agent a coding task
4. Agent completes the task but never stops — keeps running in an endless loop

## Expected Behavior
Agent should stop after completing the task.

## Actual Behavior
Agent runs indefinitely. Web UI shows task as still active with no way to stop it. No error message, agent just keeps "thinking".

## Environment
- **OpenCode Version**: 1.14.29
- **Server OS**: Linux (Ubuntu)
- **Browser**: Chrome 148 on Windows 10
- **Access method**: SSH port forwarding to `opencode serve`

## Additional Context
- The same task works correctly in TUI mode
- Only happens in web UI mode
- Wastes API credits as the agent keeps making calls in the loop
- This makes the web UI unusable for any meaningful work

---

## #26332 — MCP local server: env config not passed to spawned child process

📅 `2026-05-08` | ✏️ **phitonthel** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26332](https://github.com/anomalyco/opencode/issues/26332)


## Bug Report

### Description

When configuring a local MCP server in `opencode.json` with an `env` field, the environment variables are **not injected** into the spawned child process. The child process only inherits the parent shell's environment.

### Steps to Reproduce

1. Configure a local MCP server in `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "notion": {
      "type": "local",
      "command": ["npx", "-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_xxxxx"
      },
      "enabled": true
    }
  }
}
```

2. Start OpenCode
3. Use any Notion MCP tool (e.g., `notion_API-get-self`)
4. Observe 401 Unauthorized error

### Expected Behavior

The `NOTION_TOKEN` env var from the config should be passed to the spawned `notion-mcp-server` process, and the tool should authenticate successfully.

### Actual Behavior

The spawned process does not have `NOTION_TOKEN` in its environment. Verified via `ps -p <PID> -E` — the token is absent. The MCP server then sends unauthenticated requests to the Notion API, resulting in 401.

### Workaround

Export the env var in the shell before launching OpenCode:

```bash
export NOTION_TOKEN="ntn_xxxxx"
opencode
```

This works because the child process inherits the parent shell's environment.

### Environment

- **OS**: macOS (darwin arm64)
- **OpenCode model**: claude-opus-4.6 via github-copilot
- **MCP server**: `@notionhq/notion-mcp-server` v2.2.1
- **Node**: v24.13.0

---

## #26323 — opentui: fatal: Failed to start Worker thread

📅 `2026-05-08` | ✏️ **HaleTom** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26323](https://github.com/anomalyco/opencode/issues/26323)


### Description

```
Error: Failed to start Worker thread
    at Worker (native)
    at startWorker (/$bunfs/root/chunk-r23g6y18.js:33:4032)
    at new Sg (/$bunfs/root/chunk-r23g6y18.js:33:3631)
    at <anonymous> (/$bunfs/root/chunk-r23g6y18.js:72:1494)
    at Qa (/$bunfs/root/chunk-r23g6y18.js:8:1246)
    at new It (/$bunfs/root/chunk-r23g6y18.js:80:91753)
    at createElement (/$bunfs/root/src/index.js:882:124023)
    at children (/$bunfs/root/src/index.js:989:5702)
    at <anonymous> (/$bunfs/root/src/index.js:882:75752)
    at Km (/$bunfs/root/src/index.js:882:64605)
    at c9 (/$bunfs/root/src/index.js:882:64369)
    at Wm (/$bunfs/root/src/index.js:882:63287)
    at O (/$bunfs/root/src/index.js:882:120280)
    at W (/$bunfs/root/src/index.js:882:119674)
    at <anonymous> (/$bunfs/root/src/index.js:882:119699)
    at Km (/$bunfs/root/src/index.js:882:64605)
    at c9 (/$bunfs/root/src/index.js:882:64369)
    at B6 (/$bunfs/root/src/index.js:882:57794)
    at W (/$bunfs/root/src/index.js:882:119691)
    at <anonymous> (/$bunfs/root/src/index.js:882:119699)
    at Km (/$bunfs/root/src/index.js:882:64605)
    at c9 (/$bunfs/root/src/index.js:882:64369)
    at B6 (/$bunfs/root/src/index.js:882:57794)
    at W (/$bunfs/root/src/index.js:882:119691)
    at <anonymous> (/$bunfs/root/src/index.js:882:119699)
    at Km (/$bunfs/root/src/index.js:882:64605)
    at c9 (/$bunfs/root/src/index.js:882:64369)
    at B6 (/$bunfs/root/src/index.js:882:57794)
    at W (/$bunfs/root/src

> *[Truncado — 2400 chars totais]*

---

## #26300 — Tool-based file editing cannot distinguish between full-width and half-width punctuation marks, always writes half-width punctuation

📅 `2026-05-08` | ✏️ **dhbxs** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26300](https://github.com/anomalyco/opencode/issues/26300)


### Description

**Issue Description:**

When using OpenCode's tool to edit files, it fails to distinguish between full-width (fullwidth) and half-width (halfwidth) punctuation marks. Regardless of whether the original content contains full-width punctuation (such as `，。！？；：""''（）【】`), the tool always writes half-width punctuation marks (`,.!?;:""''()[]`) into the file.

**Steps to Reproduce:**
1. Open a project using OpenCode Web
2. Use a prompt to instruct the AI to write `‘你好’` and `“你好”` into an HTML file
3. Observe that all full-width quotation marks are converted to half-width equivalents

**Expected Behavior:**
The tool should preserve the original full-width punctuation marks as specified in the prompt.

**Actual Behavior:**
All punctuation marks are written as half-width characters, resulting in `'你好'` and `"你好"` instead of the requested full-width forms. This corrupts documents that require full-width punctuation (e.g., Chinese, Japanese, or Korean text).

### Plugins

not use

### OpenCode version

1.14.41

### Steps to reproduce

1. Open a project using OpenCode Web
2. Use a prompt to instruct the AI to write `‘你好’` and `“你好”` into an HTML file
3. Observe that all full-width quotation marks are converted to half-width equivalents

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows terminal

---

## #26220 — Bug: OpenCode enters infinite loop after tool calls complete (Zen/big-pickle)

📅 `2026-05-07` | ✏️ **Dvalin21** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26220](https://github.com/anomalyco/opencode/issues/26220)


# Bug: OpenCode Enters Infinite Loop After Tool Calls Complete

## Description

OpenCode (opencode) enters an infinite loop and stops responding to user input after completing tool calls. The process stays alive but never exits or continues meaningfully.

## Affected Versions

- **Big Pickle (opencode/big-pickle) with OpenCode Zen provider** ⚠️ **PRIMARY ISSUE**
- v1.1.60+ (GitHub Copilot provider with claude-sonnet-4.6) - similar symptoms
- v1.3.0+ (with OpenAI-compatible providers) - similar symptoms
- Issue #17516 confirmed in v1.1.65 through v1.3.0

## Symptoms

1. **Process never exits**: `opencode run` hangs indefinitely after tool calls complete
2. **Silent infinite loop**: Session processor keeps calling LLM with empty responses
3. **No CPU usage**: Process alive at 0-2% CPU, doing nothing useful
4. **No error output**: Logs show no errors, no timeouts
5. **Parent sessions block**: When used as subagent, parent hangs forever waiting

## Root Cause (from issue #17516)

**OpenCode doesn't detect "done" state properly.**

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

## #26200 — TUI crashes with `setRawMode failed errno: 9` when permission prompt fires mid-stream

📅 `2026-05-07` | ✏️ **kobicovaldev** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26200](https://github.com/anomalyco/opencode/issues/26200)


### Description

The opencode TUI crashes (exits to shell) when a permission prompt (e.g., `webfetch: ask`) is raised while the model is actively streaming response text. The crash is reproducible: setting the relevant tool's permission to `allow` (so no prompt fires) eliminates the crash entirely.

The failure looks like the TUI losing control of its tty when it tries to switch the terminal into raw mode for the permission dialog while the stream is still rendering — they race on stdin/stdout and one of them ends up with a closed/invalid fd.

**Log excerpt (the crash sequence, abridged):**

```
... many service=bus type=message.part.delta publishing (streaming model output) ...
INFO  service=permission permission=webfetch pattern=https://opencode.ai/docs/agents/ action={"permission":"webfetch","action":"ask","pattern":"*"} evaluated
INFO  service=permission id=per_... permission=webfetch patterns=["https://opencode.ai/docs/agents/"] asking
INFO  service=bus type=permission.asked publishing
... more message.part.updated events ...
ERROR service=default e=EINTR: interrupted system call, read exception
ERROR service=default error=EINTR: interrupted system call, read process error
INFO  service=default worker shutting down
ERROR service=default e=setRawMode failed with errno: 9 exception
ERROR service=default error=setRawMode failed with errno: 9 process error
INFO  service=default disposing all instances
ERROR service=default e=EIO: i/o error, write exception
ERROR service=sess

> *[Truncado — 3611 chars totais]*

---

## #26195 — opencode mcp auth fails to open browser for OAuth flow (Google Drive MCP)

📅 `2026-05-07` | ✏️ **JulioBuscer** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26195](https://github.com/anomalyco/opencode/issues/26195)


### Description

When running opencode mcp auth gdrive to authenticate with the Google Drive MCP server, the command outputs "Authentication successful!" but the OAuth flow never completes. The browser never opens, and no tokens are saved.

1. opencode mcp auth gdrive starts the OAuth flow but fails to open the browser (mcp.browser.open.failed in logs)
2. Without the browser opening, the user can't authorize, so no tokens are received
3. The command incorrectly says "Authentication successful!" even though it failed
4. All GDrive operations return "Unauthorized"

Expected behavior:
- Browser should open with Google OAuth authorization URL
- After authorizing, tokens should be saved to ~/.local/share/opencode/mcp-auth.json
- opencode mcp auth list should show "authenticated"
Actual behavior:
- Logs show mcp.browser.open.failed event
- No browser window opens
- Command prints "Authentication successful!" incorrectly
- Tokens file ends up as {"gdrive": {}} (empty)
- All GDrive operations return "Unauthorized"

Environment:
- OS: Ubuntu 24.04.4 LTS (Noble Numbat)
- Kernel: 6.17.0-22-generic
- OpenCode version: 1.14.39
- MCP server: Google Drive (https://drivemcp.googleapis.com/mcp/v1)

Logs:
INFO  service=mcp.oauth-callback port=19876 path=/mcp/oauth/callback oauth callback server started
...
INFO  service=bus type=mcp.browser.open.failed subscribing
...
◇  Authentication successful!


Additional context:
The opencode mcp debug gdrive command reports "Server responded successfull

> *[Truncado — 2778 chars totais]*

---

## #26187 — Bug: webfetch with format="text" crashes on HTML content in Electron desktop app (HTMLRewriter is not defined)

📅 `2026-05-07` | ✏️ **Innerpeace1990** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26187](https://github.com/anomalyco/opencode/issues/26187)


## Description

The `webfetch` tool crashes with `HTMLRewriter is not defined` when called with `format: "text"` on HTML content in the Electron desktop app (`OpenCode.exe`).

## Root Cause

The `extractTextFromHTML()` function in `packages/opencode/src/tool/webfetch.ts` calls `new HTMLRewriter()` as an un-imported global:

https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/tool/webfetch.ts

`HTMLRewriter` is a built-in global in **Bun** and **Cloudflare Workers (workerd)**, but it does **not exist** in **Node.js** or **Electron**.

| Runtime | `HTMLRewriter` available? |
|---|---|
| Bun (CLI/TUI mode) | Yes, built-in global |
| Cloudflare Workers | Yes, built-in global |
| Node.js | No |
| Electron (desktop app) | No |

The OpenCode desktop app (`OpenCode.exe`) runs on **Electron**, so `HTMLRewriter` is `undefined` at runtime.

## OpenCode Version

- Desktop app version: 1.14.39 (also confirmed in app.asar as 1.1.0)
- Platform: Windows (Electron)

## Steps to Reproduce

1. Open OpenCode desktop app (Electron version)
2. Use the `webfetch` tool with `format: "text"` on any HTML page:
   - e.g., `webfetch` with url `https://github.com` and format `"text"`
3. Observe the error: `HTMLRewriter is not defined`

## Workaround

Use `format: "markdown"` (the default) instead of `format: "text"`. The markdown path uses TurndownService (pure JavaScript) and works correctly in all runtimes.

## Suggested Fix

The simplest fix would be to replace `HTMLRewriter` with a r

> *[Truncado — 2805 chars totais]*

---

## #26177 — Run loop continues on orphaned interrupted tools, triggering "model does not support assistant message prefill" 400 errors

📅 `2026-05-07` | ✏️ **edevil** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26177](https://github.com/anomalyco/opencode/issues/26177)


### Bug

When a stream attempt is aborted or retried mid-tool, opencode's
`processor.cleanup()` force-marks the orphaned `tool_use` as
`state.status: "error"` with `metadata.interrupted: true`. The next
iteration of the run loop's tool-call check counts this orphan as open
work and fires another LLM request. `convertToModelMessages` then splits
the assistant message around the orphan and the resulting history ends
with an assistant turn — which Anthropic rejects with HTTP 400:

```
This model does not support assistant message prefill.
The conversation must end with a user message.
```

The session is then stuck: every retry replays the same corrupted
history from storage and re-triggers the 400.

### Trigger sequence

1. Model emits a `tool_use` block.
2. Stream is aborted/retried before the tool completes (network blip,
   user cancel, EmptyOther truncation, etc.).
3. `processor.cleanup()` writes
   `{ status: "error", metadata: { interrupted: true } }` on the tool
   part to mark it as not-running.
4. The run loop's `hasToolCalls` check at the bottom of `prompt.ts`
   sees the error tool, treats it as open work, and continues the loop.
5. Next LLM request is built from the assistant message that contains
   the orphan; the AI SDK splits the message and the request history
   ends with an assistant turn.
6. Anthropic returns 400 (or, for non-prefill-supporting models in
   general, an equivalent error).

### Real-world evidence

In my own opencode session database I found:


> *[Truncado — 2576 chars totais]*

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

## #26159 — Session permanently unresponsive when message timestamps are ~7h ahead of real wall clock time Repository: anomalyco/opencode

📅 `2026-05-07` | ✏️ **HiccupLY** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26159](https://github.com/anomalyco/opencode/issues/26159)


### Description

Title: Session permanently unresponsive when message timestamps are ~7h ahead of real wall clock time
Repository: anomalyco/opencode
Version: 1.14.39
Platform: Linux Manjaro ( timezone: UTC+8 )
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
1. Started an OpenCode session, used the AIgora skill to generate a long discussion output (~125KB across 4 assistant messages)
2. The AI

> *[Truncado — 5087 chars totais]*

---

## #26156 — bug: Kimi/Moonshot provider crashes with 'undefined is not an object (evaluating $.annotations)' since v1.14.23

📅 `2026-05-07` | ✏️ **LURENYUANSHI** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/26156](https://github.com/anomalyco/opencode/issues/26156)


## Bug Description

Since v1.14.23, using Kimi/Moonshot AI models (via `moonshotai-cn` provider, OpenAI-compatible protocol) causes all sessions to immediately crash with:

```
undefined is not an object (evaluating '$.annotations')
```

Followed by:
```
JSON Parse error: Unexpected EOF
```

## Versions (binary search confirmed)

- **1.14.22** ✅ works
- **1.14.23** ❌ broken (first broken version)
- **1.14.24 ~ 1.14.40** ❌ all broken

## Root Cause Analysis

Bisected the commits between v1.14.22 and v1.14.23. The AI SDK version is unchanged (`ai@6.0.168`) between both releases — the regression is in OpenCode's own code.

The most likely cause is PR #24005 (`refactor(session): migrate session domain to Effect Schema`), which migrated session/message schemas from zod to Effect Schema. Effect Schema's deserialization is stricter than zod — when Kimi/Moonshot's streaming response is missing a field (minified as `$.annotations`), zod silently ignores it but Effect Schema throws a TypeError.

Other PRs merged between v1.14.22 and v1.14.23 that touch related code:
- #24019 `refactor(sync): make session events schema-first`
- #24027 `refactor(provider): migrate provider domain to Effect Schema`
- #23244 `refactor(tool): migrate tool framework + all 18 built-in tools to Effect Schema`

The `$.annotations` is a minified variable name in the compiled binary, so the exact source location cannot be pinpointed externally. The error occurs immediately when the first streaming chunk arrives f

> *[Truncado — 2642 chars totais]*

---

## #26149 — opencode-auto-exit

📅 `2026-05-07` | ✏️ **dunlingzi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26149](https://github.com/anomalyco/opencode/issues/26149)


### Description

<html>
<body>
<!--StartFragment--><!-- obsidian -->
<h2 data-heading="Describe the bug">Describe the bug</h2>
<p>OpenCode Desktop automatically exits (clean shutdown, exit code 0) immediately after a session conversation completes. The user does not manually close the window — the Desktop window disappears on its own as soon as the AI finishes responding.</p>
<p><strong>Regression window</strong>: Between v1.14.33 (working) and v1.14.35 (affected). v1.14.34 was <strong>not tested</strong>. The last known-good version is <strong>v1.14.33</strong>. All tested versions from v1.14.35 through v1.14.40 are affected.</p>
<h2 data-heading="Environment">Environment</h2>
<ul>
<li><strong>Platform</strong>: Windows 11 (x64)</li>
<li><strong>OpenCode Desktop versions tested</strong>: v1.14.33 (working), v1.14.35 / v1.14.37 / v1.14.39 / v1.14.40 (all affected)</li>
<li><strong>Shell</strong>: cmd</li>
<li><strong>Installation path</strong>: <code>D:\OpenCode\OpenCode.exe</code></li>
<li><strong>Launch method</strong>: Direct double-click (also reproduced via debug batch with Electron crash diagnostics enabled)</li>
</ul>
<h2 data-heading="Expected behavior">Expected behavior</h2>
<p>The Desktop should remain open after a session conversation completes, allowing the user to continue working or ask follow-up questions.</p>
<h2 data-heading="Actual behavior">Actual behavior</h2>
<p>The Desktop exits cleanly (exit code 0) immediately after the AI's response completes. No cras

> *[Truncado — 6709 chars totais]*

---

## #26122 — Desktop crashes repeatedly with NotFoundError after task completion (non-git directory, 1.2GB DB)

📅 `2026-05-07` | ✏️ **yhl10000** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26122](https://github.com/anomalyco/opencode/issues/26122)


### Description

OpenCode Desktop crashes repeatedly with `service=server error=NotFoundError failed` after task completion. The CLI backend (`opencode.exe`) remains unaffected — only the Desktop (Electron) GUI crashes and auto-restarts.

**Pattern**: Task completes → Desktop crashes → restarts → crashes again within 3-6 seconds → eventually stabilizes after a few cycles.

Today alone the Desktop has restarted **8+ times** following this pattern.

### Environment

- **OpenCode Desktop**: Latest (installed 2026-05-07, `anomalyco/opencode` via electron-updater)
- **CLI**: `opencode.exe` from `~/.opencode/bin/`
- **OS**: Windows 11
- **Working directory**: `D:\yhl10000` (**NOT a git repository**)
- **Database size**: `opencode.db` = **1.2 GB** + WAL 6.3 MB
- **DB location**: `C:\Users\hoyu\.local\share\opencode\opencode.db`
- **DB created**: 2026-02-24 (3 months of accumulated session data)

### Error Logs

Every crash log (`~/.local/share/opencode/log/`) ends identically:

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

Multiple free models in OpenCode v1.14.40 intermittently fail during generation, returning a generic error:

> “Provider did not respond”

This behavior appears under specific conditions including long generations, repeated usage, and modified reasoning parameters. The issue is reproducible across multiple free-tier models and impacts stability of responses.

---

# Affected Models

* Nemotron 3 Super Free (primary and most consistent failure case)
* GPT-5 Nano (observed after extended usage sessions)
* Other free-tier models (inconsistent but recurring reports)

---

# Environment

* **OpenCode version:** v1.14.40
* **Operating System:** Windows 11 Pro (Version 10.0.26200, Build 26200)
* **Terminal:** Windows Terminal (Desktop)
* **Plugins:** None

---

# Steps to Reproduce

## Case 1: Nemotron 3 Super Free (mid-generation failure)

1. Open OpenCode v1.14.40 on Windows 11
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

## #26106 —  OpenAI-compatible providers: image_url content type fails deserialization when sending images

📅 `2026-05-07` | ✏️ **LifetimeVip** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26106](https://github.com/anomalyco/opencode/issues/26106)


## Description

When using DeepSeek V4 Flash (or other OpenAI-compatible providers) via a custom provider configuration with `modalities: { input: ["text", "image"] }`, attempting to paste/send an image attachment causes OpenCode to crash with a JSON deserialization error.

## Error message

```
Failed to deserialize the JSON body into the target type: messages[196]: unknown variant `image_url`, expected `text` at line 1 column 764958
```

## Root cause analysis

OpenCode's internal message content schema (used for validating request bodies) only recognizes `text`, `image`, and `audio` as valid `type` variants in message content parts. However, when building the actual HTTP API request for OpenAI-compatible providers, image file parts are correctly converted to the OpenAI `image_url` format (e.g. `{ type: "image_url", image_url: { url: "data:..." } }`). This converted format then fails schema validation because `image_url` is not a recognized variant in the internal schema.

The conversion from `file` parts to `image_url` happens correctly in the provider layer, but the request body is subsequently validated against a schema that was designed for the MCP-style `{ type: "image", data: ..., mimeType: ... }` format.

## Steps to reproduce

1. Configure an OpenAI-compatible provider (e.g., DeepSeek) with image modality enabled:
   ```json
   {
     "provider": {
       "deepseek": {
         "models": {
           "deepseek-v4-flash": {
             "modalities": {
              

> *[Truncado — 2549 chars totais]*

---

## #26075 — Bug: workspaceProxyURL forwards local 'directory' query to remote workspace, breaking sessionListQuery

📅 `2026-05-06` | ✏️ **MichielMAnalytics** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26075](https://github.com/anomalyco/opencode/issues/26075)


### Description

`workspaceProxyURL` in `packages/opencode/src/server/shared/workspace-routing.ts` strips `?workspace=` before proxying a request to a remote workspace, but **not `?directory=`**.

The SDK (`packages/sdk/js/src/v2/client.ts:16-44`) rewrites `x-opencode-directory` headers into a `?directory=` query for GET/HEAD requests. When such a request is then proxied to a remote workspace, the local-machine path leaks through. The remote can't resolve it, falls back to `worktree: "/"`, and that corrupts downstream `path.relative()` callers — most visibly `sessionListQuery` in the TUI sync context.

The chain:

1. TUI fetches `GET /path?workspace=wrk_xxx&directory=/Users/.../packages/opencode` (the `directory=` was rewritten from the SDK's `x-opencode-directory` header)
2. `workspaceProxyURL` strips `workspace`, leaves `directory`, forwards to the remote
3. Remote's instance middleware reads `query("directory")`, calls `Project.fromDirectory("/Users/.../packages/opencode")` — that path doesn't exist on the remote
4. Falls back to `ProjectID.global` and `worktree: "/"`
5. Remote responds `{worktree: "/", directory: "/Users/.../packages/opencode"}`
6. TUI's `sessionListQuery()` does `path.relative("/", "/Users/...")` → `"Users/.../packages/opencode"` (no leading slash)
7. `listSessions` filters by that bogus path, returns `[]`
8. `setStore("session", reconcile([]))` empties the store
9. `<Show when={session()}>` in the session route renders nothing → black screen

### Direct

> *[Truncado — 3045 chars totais]*

---

## #26068 — Desktop app polls raw.githubusercontent.com every ~10 minutes, downloading 25–145 MB to refresh a 1.9 MB models.json (~21 GB/day, 24/7)

📅 `2026-05-06` | ✏️ **fodurrr** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26068](https://github.com/anomalyco/opencode/issues/26068)


### Description

The OpenCode Desktop app (`ai.opencode.desktop` v1.14.29) downloads 25–145 MB from `raw.githubusercontent.com` every ~10 minutes, 24/7, while only writing a 1.9 MB local file (`~/.cache/opencode/models.json`). On a residential connection this is roughly 21 GB/day, ~630 GB/month of effectively wasted egress — mine, GitHub Pages/Fastly's, and my ISP's.

The pattern starts when the Desktop app is launched and stops when it is killed. Closing the app (no other config changes) made the rhythm vanish from my gateway chart within ~10 minutes.

I noticed this because the periodic load was visible as a clean 10-minute sine wave on my router's WAN throughput chart for the last few days. I traced it through packet captures and process inspection.

#### Evidence

**1. Identified process and live connection**

While the rhythm was active, `lsof -nP -i 4` showed (PID + username redacted):

```
OpenCode  <pid>  <user>  TCP 10.x.x.x:62092 -> 185.199.108.133:443 (ESTABLISHED)
```

The destination IP is in GitHub's documented Fastly range `185.199.108–111.x`, which serves both GitHub Pages and `raw.githubusercontent.com`. DNS confirms `raw.githubusercontent.com` resolves to exactly that IP set.

**2. Per-burst pcap (gateway WAN, 40-sec window)**

Top conversations during one captured burst (post-NAT WAN view):

```
Local         <-> Remote                   Bytes IN    Time slice
192.168.1.1   <-> 185.199.110.154           25 MB     t+30 -> t+40 sec
192.168.1.1   <-> 185.199.1

> *[Truncado — 8485 chars totais]*

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

## #25953 — Edit tool corrupts Python indentation in v1.14.39 (silent data loss)

📅 `2026-05-06` | ✏️ **riphet** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25953](https://github.com/anomalyco/opencode/issues/25953)


### Description

# Bug Report: Edit Tool Corrupts Python Indentation (v1.14.39)

## Description

The `edit` tool systematically corrupts Python file indentation when editing code inside indented blocks (try/except, functions, classes). The tool reports success but the file on disk has incorrect indentation, breaking Python syntax.

**This is a critical data loss bug** - the diff shows correct output but the actual file is corrupted.

## Reproduction Steps

1. Create a Python file with indented code inside a `try` block:
```python
def example():
    try:
        # Some code here
        result = process_data()
        return result
    except Exception as e:
        log_error(e)
```

2. Use the edit tool to modify the indented code:
```
oldString: "        result = process_data()\n        return result"
newString: "        result = process_data()\n        validate(result)\n        return result"
```

3. Tool reports "Edit applied successfully"

4. **Actual result on disk:**
```python
def example():
    try:
result = process_data()
validate(result)
        return result
    except Exception as e:
        log_error(e)
```

5. Python raises `IndentationError: expected an indented block`

## Root Cause Analysis

After running **200 systematic tests** (100 edit + 100 write), I've identified:

### What Works (100% success rate):
- ✅ Editing text that appears exactly once in the file
- ✅ Changes to constants, imports, comments (unique patterns)
- ✅ Using `write` tool for complete fil

> *[Truncado — 4699 chars totais]*

---

## #25946 — [Bug] Project edits (name, icon, color) not persisted after restart in v1.14.39

📅 `2026-05-06` | ✏️ **cherub-pan** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25946](https://github.com/anomalyco/opencode/issues/25946)


### Description

Description: In the OpenCode desktop app, after editing a project's name, icon, or color via the "Edit Project" dialog and clicking "Save", the changes appear to apply temporarily. However, once the dialog is closed or the app is restarted, all modifications revert to their default values.

Steps to Reproduce:

Right-click a project in the sidebar and select "Edit Project"
Change the "Name" field (e.g., to 09.files)
Select a different "Icon" or "Color"
Click the "Save" button
Close the dialog or fully restart OpenCode
Observe that the project reverts to its default name, icon, and color
Expected Behavior: Modified project name, icon, and color should persist across app restarts.

Actual Behavior: All changes are lost upon closing the dialog or restarting the application.

Environment:

OS: Windows 10/11
OpenCode Version: 1.14.39
Installation Method: Installer (exe)
Additional Context: I checked the config directory at %APPDATA%\opencode and found only EBWebView cache files. There is no standalone projects.json or similar configuration file. It appears project settings are stored in WebView's LocalStorage/IndexedDB, and the save action is not correctly triggering a persistent write.

### Plugins

_No response_

### OpenCode version

OpenCode Version: 1.14.39

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #25940 — [reopen] Opencode crashes the entire terminal session right after open

📅 `2026-05-06` | ✏️ **brunobmello25** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/25940](https://github.com/anomalyco/opencode/issues/25940)
 | 🏷️ `bug` `tui`


### Description

Continuation on [this issue](https://github.com/anomalyco/opencode/issues/1220#issuecomment-3221443999) that was closed automatically by github.

---

Here is a video showcasing the bug. this is happening on every directory I open, even if it's not a git repo

https://github.com/user-attachments/assets/dc93805b-6a4f-457d-a50b-e0f3ceeb4909

opencode current version: 1.14.39
first version I've seen this bug happen: 0.3.28
terminal used: kitty with tmux

solutions attempted: everytime this bug happens, deleting the ~/.opencode folder fixes the problem, but after a while it starts happening again

Not sure how to get opencode crash logs, but i can put them here if needed

---

## #25929 — Some skills occupy multiple lines in the drop-down menu, blocking other commands. Some skills cannot show its full description

📅 `2026-05-05` | ✏️ **Tao-Yida** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25929](https://github.com/anomalyco/opencode/issues/25929)


### Description

As described in the titile, some skills take many lines for its description, thus I cannot see other commands when press arrow buttons to select (see image). However, many other skills only take one line, and I cannot see its full desciption.

Notice that the selected command (should be a orange line) is not visible, which actually is another skill, and two other commands missing. It needs three ⬇ to see the orange line (back to the first line) again after losing visual.

There should be a solid solution that handles both circumstances.

### Plugins

oh-my-openagent

### OpenCode version

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

## #25914 — 🐛 MCP tool calls crash: TypeError on output.output in SessionProcessor (affects v1.14.39)

📅 `2026-05-05` | ✏️ **LeoNardo-LB** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25914](https://github.com/anomalyco/opencode/issues/25914)


## Bug Description

All MCP tool calls crash with `TypeError: undefined is not an object (evaluating 'output.length')` in OpenCode v1.14.39. This is a regression — MCP tools worked correctly in v1.14.30.

## Environment

- **OpenCode Version:** v1.14.39 (latest release, upgraded from v1.14.30)
- **Platform:** Linux (x86_64, Ubuntu)
- **Installation Method:** `curl -fsSL https://opencode.ai/install | bash`
- **MCP Server:** `@modelcontextprotocol/server-sequential-thinking@0.6.2` (reproduces with all MCP servers)

## Steps to Reproduce

1. Install OpenCode v1.14.39
2. Configure any MCP server (e.g., sequential-thinking, context7, etc.)
3. Trigger any MCP tool call
4. Observe the error: `undefined is not an object (evaluating 'output.length')`

## Root Cause Analysis

This is the same bug reported in **#12987**, **#13042**, **#13091** — but those were closed as duplicates or attributed to the Oh-My-OpenCode plugin. **I am NOT using any OMO plugin**, and the bug persists in v1.14.39 (the latest release).

### Technical Details

The `SessionProcessor` in the compiled binary handles `tool-result` events like this:

```javascript
case "tool-result": {
  // ...
  structured: g.output.metadata,           // ← undefined
  content: [{ type: "text", text: g.output.output }, ...],  // ← crash: undefined.output
  // ...
  yield* z(g.toolCallId, g.output);  // passes undefined to completeToolCall
}
```

The issue is that AI SDK 6.x's `createToolModelOutput()` in `stream-text.ts` wraps tool

> *[Truncado — 3827 chars totais]*

---

## #25880 — Desktop v1.14.39: Bun-target plugins fail to load (Node.js sidecar lacks Bun APIs)

📅 `2026-05-05` | ✏️ **ckforce** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25880](https://github.com/anomalyco/opencode/issues/25880)


## Description

OpenCode Desktop v1.14.30 → v1.14.39 update: the sidecar runtime switched from Bun to Node.js/Electron's bundled Node.js. This breaks all third-party plugins built with `--target bun`, because they depend on Bun-specific APIs such as `globalThis.Bun.spawn`, `Bun.file`, `Bun.serve`, `Bun.which`, etc.

## Reproduction

1. Install OpenCode Desktop v1.14.39
2. Add a Bun-built plugin to config, e.g. `oh-my-openagent@latest`
3. Start Desktop → sidecar crashes, logs show:
   - `Cannot destructure property 'spawn' of 'globalThis.Bun' as it is undefined`
   - Or 0-byte sidecar log files

## Affected Plugins

- **[oh-my-openagent](https://www.npmjs.com/package/oh-my-openagent)** (v3.17.14): uses `Bun.spawn`, `Bun.file`, `Bun.write`, `Bun.which`, `Bun.serve`, `Bun.hash`, `Bun.readableStreamToText`
- **[opencode-pty](https://www.npmjs.com/package/opencode-pty)**: depends on `bun-pty` native module (cannot work in Node.js)
- **[@tarquinen/opencode-dcp](https://www.npmjs.com/package/@tarquinen/opencode-dcp)**: ESM directory import resolution issue

## Workaround (temporary)

A Bun → Node.js polyfill can be injected at the top of the cached plugin file to fix oh-my-openagent, but it's fragile:
- It gets overwritten when Desktop re-downloads the plugin
- Some plugins (opencode-pty) use native Bun addons and cannot be polyfilled

## Suggested Fix

1. Restore Desktop sidecar to use Bun runtime, or
2. Provide a config option to select sidecar runtime (Bun / Node.js), or
3. Ship 

> *[Truncado — 1819 chars totais]*

---

## #25876 — opentui: fatal: Failed to start Worker thread (Windows, Bun 1.14.39)

📅 `2026-05-05` | ✏️ **YuryZZZ** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25876](https://github.com/anomalyco/opencode/issues/25876)


## Bug Report

### Description
OpenCode crashes on startup on Windows with `Failed to start Worker thread`. The Bun runtime cannot create Worker threads, resulting in a fatal SEH exception (exit code 2147483651 / 0x80000003 STATUS_BREAKPOINT).

### Steps to Reproduce
1. Install opencode-ai 1.14.39 via `npm install -g opencode-ai` on Windows 11
2. Run `opencode` in any project directory
3. Observe crash with `Error: Failed to start Worker thread`

### Expected Behavior
OpenCode TUI starts without crashing.

### Actual Behavior
```
Error: Failed to start Worker thread
    at Worker (unknown)
    at startWorker (B:/~BUN/root/chunk-jv7s7n1v.js:33:4044)
    at new Sg (B:/~BUN/root/chunk-jv7s7n1v.js:33:3633)
    at <anonymous> (B:/~BUN/root/chunk-jv7s7n1v.js:72:1500)
    at Qa (B:/~BUN/root/chunk-jv7s7n1v.js:8:1246)
    at new It (B:/~BUN/root/chunk-jv7s7n1v.js:80:91753)
    at createElement (B:/~BUN/root/src/index.js:882:124032)
    ...
```

The process exits with code 2147483651 (Windows SEH STATUS_BREAKPOINT).

### Environment
- **OS**: Windows 11
- **opencode version**: 1.14.39
- **Bun version**: bundled (opencode-windows-x64-baseline)
- **CPU**: x64 (non-AVX2, uses baseline binary)
- **Node.js**: v22+ (installed separately)
- **Installed via**: `npm install -g opencode-ai`

### Additional Context
- The crash occurs with both `opencode-windows-x64` and `opencode-windows-x64-baseline` binaries
- The error is a Bun runtime issue where it cannot spawn Worker threads
- This may be 

> *[Truncado — 1775 chars totais]*

---

## #25873 — Bash tool fails with 'Attempted to assign to readonly property' in v1.14.34

📅 `2026-05-05` | ✏️ **stephanschielke** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/25873](https://github.com/anomalyco/opencode/issues/25873)


### Description

In opencode v1.14.34+, tool calls crash with:

```
TypeError: Attempted to assign to readonly property
```

### Who is affected

Users who have **all four** of these conditions:

1. **`OPENCODE_EXPERIMENTAL=true`** set in their environment (this enables the v2 event system)
2. opencode **v1.14.34+** (ships [PR #24512](https://github.com/anomalyco/opencode/pull/24512) which added `EventV2.run` calls to `processor.ts`)
3. A **plugin that mutates tool args** in `tool.execute.before` hooks (e.g. [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent), which has [8 mutation sites](https://github.com/code-yeongyu/oh-my-openagent/issues/3816))
4. LLM makes a **tool call** (any tool: bash, task, webfetch, etc.)

Users without `OPENCODE_EXPERIMENTAL=true` or without oh-my-openagent are not affected.

### Root cause

The v2 event system (introduced in [PR #24512](https://github.com/anomalyco/opencode/pull/24512)) passes tool input by reference into [Immer](https://immerjs.github.io/immer/)'s `produce()`, which freezes the original object.

**Chain:**

1. LLM makes a tool call. The AI SDK creates an `args` object.
2. [`processor.ts:329`](https://github.com/anomalyco/opencode/blob/7ded0ec9e91f62e3f0fa9c0d058ac6e86cdb4cd8/packages/opencode/src/session/processor.ts#L329) passes `value.input` (same reference as `args`) to `EventV2.run()`:
   ```typescript
   EventV2.run(SessionEvent.Tool.Called.Sync, {
     input: value.input,  // <-- same object as tool args
   

> *[Truncado — 3931 chars totais]*

---

## #25824 — v1.14.35 Desktop shows plugin loaded, but oh-my-openagent custom agents not visible in GUI (TUI works when launched from same exe)

📅 `2026-05-05` | ✏️ **bc352562984** | 💬 16 | 🔗 [https://github.com/anomalyco/opencode/issues/25824](https://github.com/anomalyco/opencode/issues/25824)


### Description

After upgrading to OpenCode Desktop v1.14.35:

1. The Desktop plugin list correctly shows oh-my-openagent as loaded ✓
2. However, the custom agents (Sisyphus, Oracle, Librarian, etc.) are not visible in the GUI agent selector dropdown ✗
3. When launching TUI from the same Desktop exe via PowerShell, all custom agents appear correctly and work normally

### Plugins

oh-my-openagent@3.17.13

### OpenCode version

OpenCode Desktop v1.14.35

### Steps to reproduce

1. The Desktop plugin list correctly shows oh-my-openagent as loaded ✓
2. However, the custom agents (Sisyphus, Oracle, Librarian, etc.) are not visible in the GUI agent selector dropdown ✗
3. When launching TUI from the same Desktop exe via PowerShell, all custom agents appear correctly and work normally

### Screenshot and/or share link

<img width="1920" height="1008" alt="Image" src="https://github.com/user-attachments/assets/8ab9d0ce-e63b-40a7-9024-b5da952972be" />

<img width="1920" height="1008" alt="Image" src="https://github.com/user-attachments/assets/303723d1-f81d-463c-9d80-a12504046675" />

### Operating System

windows11

### Terminal

powershell

### Addendum

Two additional versions were released today, but the latest desktop release has completely broken TUI-based usage. As a result, the OpenCode desktop app can no longer be used with the oh-my-opencode plugin.

### I found that:

As mentioned in https://github.com/anomalyco/opencode/issues/25880: In v1.14.30+, the Desktop sidecar runti

> *[Truncado — 1582 chars totais]*

---

## #25803 — retry state cannot be explicitly stopped, making revert/reset ineffective and preventing context cleanup after quota recovery

📅 `2026-05-05` | ✏️ **sch246** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/25803](https://github.com/anomalyco/opencode/issues/25803)


### Description

### Description

When a session enters retry state after quota/capacity exhaustion, I can lose control of the session even after I recover the quota and want to clean up the failed/retry noise from the conversation.

A typical sequence looks like this:

1. The model/provider hits a quota/capacity exhaustion condition.
2. OpenCode enters retry behavior and keeps trying to continue the run.
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

## #25691 — OpenCode crashes terminal window on exit

📅 `2026-05-04` | ✏️ **catclaw** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25691](https://github.com/anomalyco/opencode/issues/25691)


### Description

Hi!
Every time I exit OpenCode, it crashes cmd.exe

<img width="3836" height="2106" alt="Image" src="https://github.com/user-attachments/assets/84da5843-10cf-4d40-a111-6747a6667c43" />

### Plugins

N/A

### OpenCode version

1.14.33

### Steps to reproduce

Ollama serve
Run cmd.exe
opencode
(Use OpenCode to write the code)
CTRL+P -> exit

<img width="3836" height="2106" alt="Image" src="https://github.com/user-attachments/assets/5d3bafe2-2783-4581-b480-91ff9e310ed8" />

### Screenshot and/or share link

<img width="3836" height="2106" alt="Image" src="https://github.com/user-attachments/assets/bee0f19d-3f0c-4a4e-9a58-6d8905c79a64" />

### Operating System

Windows 11 Enterprise 25H2

### Terminal

Windows Terminal / cmd.exe

---

## #25682 — MCP client connection status goes stale after initial connect

📅 `2026-05-04` | ✏️ **pingpangkuangmo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25682](https://github.com/anomalyco/opencode/issues/25682)


### Description

Once an MCP server connects successfully, opencode never checks whether the connection is still alive. The status stays connected indefinitely, even when the underlying
  connection is broken.

  This means:
  - GET /mcp returns stale {"status": "connected"} for dead servers
  - Tool calls fail at invocation time with no prior warning
  - SSE /event has no mechanism to notify clients of a status change
  - There is no way to detect the problem externally without reconnecting every server on a timer

  The only existing detection is ToolListChangedNotification in watch() (src/mcp/index.ts:460), which only fires when the server proactively sends a notification — it cannot
  detect silent connection failures like a crashed process, a restarted remote server, or a network interruption.

  This is especially problematic for users running opencode serve. The TUI has a human in the loop who can notice failures and restart, but serve mode is headless — typically
  consumed by other tools or services via the HTTP API. When an MCP connection silently breaks in this mode, the server continues accepting requests and reporting everything as
  healthy. There is no automatic reconnection, and no status change event for consumers to react to. The only external workaround is periodically calling POST /mcp/:name/connect
  for every configured server, which tears down and rebuilds the connection each time — wasteful and disruptive

### Plugins

_No response_

### OpenCode versi

> *[Truncado — 1671 chars totais]*

---

## #25551 — [Desktop] "New chat" icon disappears in compact window mode

📅 `2026-05-03` | ✏️ **Wdits** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25551](https://github.com/anomalyco/opencode/issues/25551)


### Description

When OpenCode Desktop is maximized, the title bar shows a small "new chat" icon next to the "toggle sidebar" button. This is one of the most convenient UI elements because it lets you start a chat instantly without opening the sidebar.

However, when the window is resized to a smaller width, this icon disappears entirely and gets replaced for this "burger" icon to open the sidebar. Losing quick access to new chat in compact mode feels like a regression in usability.

**Expected behavior:** The "new chat" icon should remain visible in the title bar even when the window is in compact/small mode, rather than being hidden behind the sidebar toggle, it's just a small icon that makes life easier for everyone.

### Plugins

None

### OpenCode version

v1.14.33 Desktop App

### Steps to reproduce

1. Maximize the OpenCode window.
2. Observe the "new chat" icon in the top-left of the title bar (next to the sidebar toggle).
3. Resize the window to a narrow width.
4. The new chat icon disappears; only the sidebar toggle remains.

### Screenshot and/or share link

Maximized Window
<img width="176" height="40" alt="Image" src="https://github.com/user-attachments/assets/cd70af9b-2631-44f8-9e86-7b2355d4f911" />

Resized window with a lot of space left!
<img width="374" height="36" alt="Image" src="https://github.com/user-attachments/assets/7794818a-b271-4146-968e-607b6983df83" />

### Operating System

Windows 11

### Terminal

-

---

## #25490 — Desktop memory grows to 3-4GB with multiple workspaces/session tabs on Windows

📅 `2026-05-02` | ✏️ **Psherman42000** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25490](https://github.com/anomalyco/opencode/issues/25490)


### Description

OpenCode Desktop is consuming very high memory on Windows after the recent desktop updates.

I first hit this on v1.14.32 with a Solid/WebView crash:

Error: Stale read from <Show>.
at castError (http://tauri.localhost/assets/index-SW_W208g.js:1:10383)
...
at get slug (http://tauri.localhost/assets/index-Akx15NeJ.js:2401:148703)
...
at Array.resolveSources (http://tauri.localhost/assets/index-SW_W208g.js:1:13202)

The desktop window also showed an "Out of Memory" page.

I upgraded again to v1.14.33, but the high memory behavior still happens. It see
o retain a lot of state in memory instead of releasing inactive projects/sessions.

Observed memory snapshots:

- OpenCode process group reached around 4.1 GB total private memory.
- Edge WebView2 renderer reached around 1.6-1.7 GB private memory.
- opencode-cli reached around 2.2 GB private memory.
- Windows Task Manager showed OpenCode / WebView2 around 3-4 GB.
- CPU also became high during the memory spike.

One local diagnostic detail: I had `C:\Users\<user>\.config\opencode` as a Git repo. Renaming its `.git` folder temporarily reduced memory a lot. My guess is that the Desktop UI may be scanning/restoring git/review/session state for every project/session tab and keeping too much of it alive.

I also tested with plugins disabled/trimmed. Plugins can make it worse, but the main issue still appears tied to Desktop UI state restoration with multiple projects/session tabs.




-----------------------MAIN ERROR O

> *[Truncado — 5350 chars totais]*

---

## #25482 — opencode upgrade fails with UpgradeFailedError when using `opencode upgrade`

📅 `2026-05-02` | ✏️ **munim** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25482](https://github.com/anomalyco/opencode/issues/25482)


### Description

```

$ opencode upgrade

                                   ▄
  █▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█
  █  █ █  █ █▀▀▀ █  █ █    █  █ █  █ █▀▀▀
  ▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀

┌  Upgrade
│
●  Using method: bun
Error: Unexpected error, check log file at /Users/meme/.local/share/opencode/log/2026-05-02T203557.log for more details

UpgradeFailedError
```

### Plugins

N/A

### OpenCode version

1.14.33

### Steps to reproduce

1. Run `opencode upgrade`

### Screenshot and/or share link

```
INFO  2026-05-02T20:34:18 +138ms service=server-proxy version=1.14.24 args=["upgrade"] process_role=main run_id=8af16183-edb6-4b1a-87f5-62eee51ad2f7 opencode
INFO  2026-05-02T20:34:18 +5ms service=file init
ERROR 2026-05-02T20:34:18 +66ms service=server-proxy name=UpgradeFailedError message= stack=Error
    at <anonymous> (/$bunfs/root/chunk-vhandrv0.js:1306:19254)
    at ~effect/Effect/successCont (/$bunfs/root/chunk-erjkv5bw.js:25:7738)
    at runLoop (/$bunfs/root/chunk-erjkv5bw.js:25:2045)
    at evaluate (/$bunfs/root/chunk-erjkv5bw.js:25:1435)
    at <anonymous> (/$bunfs/root/chunk-erjkv5bw.js:25:5589)
    at s7 (/$bunfs/root/chunk-erjkv5bw.js:25:37933)
    at <anonymous> (/$bunfs/root/chunk-dx9qdxw5.js:15:3723)
    at emit (node:events:98:22)
    at #maybeClose (node:child_process:766:16)
    at #handleOnExit (node:child_process:520:72)
    at processTicksAndRejections (native:7:39) fatal
```

### Operating System

macOS 26.3

### Terminal

Ghostty

---

## #25421 — ACP agent_message_chunk frames land after end_turn RPC reply due to event-subscription / prompt-RPC race

📅 `2026-05-02` | ✏️ **truenorth-lj** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25421](https://github.com/anomalyco/opencode/issues/25421)


## Summary

`Agent.prompt()` in `packages/opencode/src/acp/agent.ts:1471` returns `stopReason: "end_turn"` immediately after `await this.sdk.session.prompt(...)` resolves, but trailing `message.part.delta` events for the assistant's final text are still queued in the SDK event stream at that moment. They get processed by `runEventSubscription` and forwarded to the ACP connection as `agent_message_chunk` frames AFTER the RPC reply has already been sent.

This violates the ACP protocol expectation that `session/update` frames belong to a turn that ends with the prompt RPC reply. Clients consume `stopReason: end_turn` as the signal "the agent is done speaking" — disabling streaming indicators, re-enabling the input, etc. — but text continues to land on the wire after that signal, racing against the client's UI state.

## Reproducer

Send any streaming `session/prompt` to the ACP server. Inspect WebSocket frames (Chrome DevTools → Network → WS → Messages). Sort by time.

Expected order:

```
... earlier session/update frames (chunks, tool_call_update) ...
{ "method": "session/update", ... agent_message_chunk: "...final delta..." }
{ "id": 2, "result": { "stopReason": "end_turn", "usage": {...} } }    ← turn ends here
```

Actual order (current behavior):

```
... earlier session/update frames ...
{ "id": 2, "result": { "stopReason": "end_turn", "usage": {...} } }    ← reply sent first
{ "method": "session/update", ... agent_message_chunk: "...final delta..." }    ← chunk lands AF

> *[Truncado — 4953 chars totais]*

---

## #25392 — [BUG] Startup bulk-updates time_updated for all project sessions, corrupting /sessions timeline

📅 `2026-05-02` | ✏️ **boyingliu01** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25392](https://github.com/anomalyco/opencode/issues/25392)


## Description

On OpenCode startup, the `time_updated` field of ALL sessions belonging to the currently opened project is bulk-updated to the startup timestamp. This corrupts the session timeline and makes `/sessions` sorting completely useless — old sessions from months ago appear as if they were just used.

## Root Cause

The bug is caused by the combination of two mechanisms:

### 1. Drizzle ORM `$onUpdate` hook auto-touches `time_updated`
`packages/opencode/src/storage/schema.sql.ts`:
```ts
export const Timestamps = {
  time_created: integer().notNull().$default(() => Date.now()),
  time_updated: integer().notNull().$onUpdate(() => Date.now()),
}
```

Any `UPDATE` on a session row automatically sets `time_updated = Date.now()`, **regardless of whether the update is a substantive content change or just a metadata touch**.

### 2. Session projector updates all rows on Event.Updated
`packages/opencode/src/session/projectors.ts`:
```ts
const row = db
  .update(SessionTable)
  .set(toPartialRow(info as Session.Patch))
  .where(eq(SessionTable.id, data.sessionID))
  .returning()
  .get()
```

When OpenCode starts up and replays/indexes sessions for the current project, every session row gets an UPDATE through the projector, which triggers the `$onUpdate` hook and stamps `time_updated` with the current time.

## Evidence

I directly queried the SQLite database at `~/.local/share/opencode/opencode.db`:

| Metric | Value |
|--------|-------|
| Total sessions | 750 |
| Affected se

> *[Truncado — 4231 chars totais]*

---

## #25310 — [BUG]: Moving mouse quickly across menus (like plugin menu) can lead to infinite cycling loop

📅 `2026-05-01` | ✏️ **thoughtlesslabs** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25310](https://github.com/anomalyco/opencode/issues/25310)


### Description

If you open a pop-up menu in the TUI (like the plugins menu) and move your mouse up and down quickly over the options, the selected highlight will get stuck in an infinite loop, constantly cycling back and forth between the items you hovered over.

### Plugins

None

### OpenCode version

1.14.31

### Steps to reproduce

1. Run `bun dev` to open the CLI
2. Navigate to the Plugins menu (or any `DialogSelect` / `Autocomplete` component)
3. Move your mouse rapidly up and down across the list items
4. Stop moving the mouse
5. Observe the highlight selection rapidly bouncing/cycling endlessly.


### Screenshot and/or share link

https://github.com/user-attachments/assets/b0057182-4d95-4d8b-94f3-a39c61d03218

### Operating System

Tahoe 26.3

### Terminal

Ghostty, Terminal

---

## #25238 — GUI not working on windows

📅 `2026-05-01` | ✏️ **abhinavw86-coder** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25238](https://github.com/anomalyco/opencode/issues/25238)


### Description

I downloaded and installed OpenCode on my Dell running Windows 11. The CLI binary launches correctly but the GUI binary just displays a blank white screen

### Plugins

None used

### OpenCode version

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

After context compaction (manual `/compact` or auto-compaction), opencode consistently crashes with a jinja template error from LM Studio when the next message is sent. The error is:

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

- **opencode:** 1.14.30 (installed via bun)
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

### OpenCode version

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

OpenCode Desktop appears to persist `lastProjectSession` / workspace state across different remote servers. After switching servers, it may restore a stale session ID that does not exist on the newly selected server.

When this happens, the UI crashes with `Unknown error` instead of gracefully returning to project/session selection.

## Environment

- OpenCode Desktop: 1.14.30
- OS: Windows
- Setup:
  - Multiple OpenCode servers
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

When using opencode with thinking mode, the Qwen 3.6 Pro model gets stuck in a repetitive thinking loop where it outputs repeated characters like `!!!!!!!!!!!!!!!!!!...` or `...` indefinitely instead of producing useful reasoning. I had to switch to a different model (DeepSeek v4 Pro) just to be able to write this bug report, because the Qwen model had become completely unusable.

This manifests as a hanging/corrupted response that the user eventually has to interrupt, and opencode may then produce malformed tool calls (JSON parse errors, truncated function arguments).

## Steps to Reproduce

1. Use opencode with Qwen 3.6 Pro (thinking mode)
2. Execute a moderate-length session with multiple tool calls
3. Eventually the `thinking` blocks start containing infinite repetition of characters like `!!!!!!!!!` or `...`
4. This corrupts subsequent tool calls (JSON parse errors like `JSON Parse error: Expected '}'`)
5. At this point the model becomes unusable — even basic commands start producing corrupted output

## Expected Behavior

opencode should detect repetitive character patterns in thinking blocks and either:
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

## #25097 — Permission glob matcher doesn't match deep absolute paths; only **/<basename>/** works

📅 `2026-04-30` | ✏️ **bmeindl** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/25097](https://github.com/anomalyco/opencode/issues/25097)


## Summary

The permission-glob matcher in opencode 1.14.30 doesn't match patterns of the form `**/<segment>/<segment>/<dir>/**` against absolute resolved paths like `/private/tmp/<segment>/<segment>/<dir>/<file>`. Only single-segment patterns like `**/<basename>/**` match reliably. Patterns starting with a literal `/` (e.g. `/tmp/scope/**`) also don't match.

This makes it impossible to express "allow exactly this absolute path subtree" precisely — you have to fall back to `**/<basename>/**` which over-matches if the basename appears elsewhere in the filesystem.

## Environment

- opencode 1.14.30 (curl install, macOS 25.3.0)
- Permission engine in `OPENCODE_CONFIG_CONTENT` JSON

## Reproduce

```bash
mkdir -p /tmp/agent-out
rm -f /tmp/agent-out/x.txt

CFG_FAILS='{"permission":{"edit":{"*":"deny","**/private/tmp/agent-out/**":"allow"},"write":{"*":"deny","**/private/tmp/agent-out/**":"allow"},"read":"deny","bash":"deny","external_directory":"allow"},"tools":{"bash":false,"edit":true,"write":true,"web_fetch":true,"web_search":true}}'

echo "Use the write tool to create /tmp/agent-out/x.txt with content X. Reply DONE." | \
  OPENCODE_CONFIG_CONTENT="$CFG_FAILS" opencode run --model <any-model> --dangerously-skip-permissions
ls /tmp/agent-out/x.txt   # ❌ does not exist
```

Same setup but with `**/agent-out/**` instead of `**/private/tmp/agent-out/**`:

```bash
CFG_WORKS='{"permission":{"edit":{"*":"deny","**/agent-out/**":"allow"},"write":{"*":"deny","**/agent-out/**":"allow"}

> *[Truncado — 3553 chars totais]*

---

## #25078 — EventEmitter overflow (drain) when MCP server doesn't support resources/list

📅 `2026-04-30` | ✏️ **ozcajefff** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/25078](https://github.com/anomalyco/opencode/issues/25078)


### Description

When using mcp-server-excel (or any MCP server that doesn't support 
resources/list), OpenCode continuously polls resources/list and 
accumulates drain listeners until EventEmitter overflow.

The author of mcp-server-excel confirmed this is an OpenCode-side bug:
https://github.com/sbroenne/mcp-server-excel/issues/621

MCP client should handle -32601 (Method not available) without 
accumulating listeners or crashing.

Suggested fix: add an option to disable resources/list polling for 
servers that don't advertise resources.

### Plugins

mcp-server-excel (sbroenne)

### OpenCode version

1.14.30

### Steps to reproduce

1. Install mcp-server-excel via dotnet tool:
   dotnet tool install --global Sbroenne.ExcelMcp.McpServer

2. Add the MCP to opencode.json:
   "excel-sbroenne": {
     "type": "local",
     "enabled": true,
     "command": ["mcp-excel"],
     "timeout": 60000
   }

3. Open OpenCode

4. Observe the EventEmitter overflow error on startup:
   MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
   11 drain listeners added to [Socket]. MaxListeners is 10.
   type: "drain", count: 11

### Screenshot and/or share link

<img width="847" height="730" alt="Image" src="https://github.com/user-attachments/assets/6e47bfa6-1e78-4bb4-aadd-ac403b0ab1f5" />

### Operating System

Windows 11

### Terminal

Windows Terminal (PowerShell 7)

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

## #24972 — Glob tool returns zero results when broken symlinks exist in the search tree

📅 `2026-04-29` | ✏️ **aaronkyriesenbach** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24972](https://github.com/anomalyco/opencode/issues/24972)


### Description

The glob tool silently returns zero results when any broken symlink (or permission-denied path) exists anywhere in the directory tree being searched. This happens because `Ripgrep.files()` treats ripgrep exit code 2 as fatal and discards all stdout output, even though valid file paths were already emitted.

The `search()` function (used by the grep tool) already handles this correctly — it passes `--no-messages` and treats exit code 2 as non-fatal (returning `partial: true`). The `files()` function was missed.

### Plugins

oh-my-openagent@latest

### OpenCode version

1.14.28

### Steps to reproduce

1. Create a broken symlink anywhere in your home directory (or have one from a package manager like pnpm, Firefox lock files, etc.)
2. Use the glob tool to search for a file that exists
3. Glob returns zero results despite the file existing

Common sources of broken symlinks: pnpm stores pointing to deleted git worktrees, browser lock files, AUR/paru cache with restricted permissions.

### Operating System

Arch Linux (kernel 6.14.4)

### Terminal

Kitty

---

## #24876 — Crash on older Intel Macs (Illegal instruction / AVX2 incompatibility)

📅 `2026-04-29` | ✏️ **marcioganzer** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24876](https://github.com/anomalyco/opencode/issues/24876)


### Description

## Description

The `opencode` binary crashes immediately on launch on older Intel Macs with the following error:

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
- Installation method: Homebrew (`anomalyco/tap/opencode`)

---

## Crash details

Relevant excerpt:

```
Exception Type:        EXC_BAD_INSTRUCTION (SIGILL)
Termination Reason:    Illegal instruction: 4

Thread 0 Crashed:
0   opencode  ...
...
dyld4::Loader::findAndRunAllInitializers
```

Instruction stream shows AVX-prefixed opcodes (e.g. `c4 ...`), which indicates usage of instructions not supported by this CPU.

---

## Root cause (analysis)

The distributed binary:

```
opencode-darwin-x64.zip
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

## #24818 — OpenCode Desktop Beta Feedback

📅 `2026-04-28` | ✏️ **mxmlnkn** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/24818](https://github.com/anomalyco/opencode/issues/24818)


### Description

I am sorry for conflating many bug reports in one, but it is to cumbersome and may look like spamming if I were to open an issue for each one.
I wanted to try out the GUI. The look and feel is much more to my liking than the TUI. The wide selection of themes is nice and I even found some nice ones with high contrast, e.g., "AMOLED", or "OpenCode". It would be really nice if the GUI worked out. But currently, it seems that the Beta specifier for it is correct.

Issues **not** solved by switching to the electron version:

 - There is no onboarding at all. I.e., in my naive exploration, I sent a query and exfiltrated who knows what to the free Big Pickle models configured by default if I hadn't used OpenSnitch. I don't find this acceptable, especially, as I have heard about precedents for this kind of lack of data privacy guards, where prompts were sent to free models to generate titles/summaries even after a custom provider was configured. No idea if that has been fixed in the meantime.
 - Next, I tried adding a custom provider. It did not show up in the model selection list. It only shows up after restarting the whole GUI.
 - I tried to add the custom provider a second time, but the lowercase ID was not accepted.
   The field showed up red, which is nice, but the message under it was only about the allowed characters
   without any hint about that name already being in use. Suffixing a `2` made it work. It still did not show up in the model selection list unde

> *[Truncado — 11534 chars totais]*

---

## #24780 — opencode desktop crash seems to corrupt opencode.db

📅 `2026-04-28` | ✏️ **typoworx-de** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24780](https://github.com/anomalyco/opencode/issues/24780)


### Description

I recently had 2 times the situation that some opencode UI crash causes opencode.db to obviously corrupt. Next start opencode is stuck either showing only logo or just gray window. Nothing else happens!

### Plugins

_No response_

### OpenCode version

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

## #24742 — `edit` tool can delete large file ranges via loose fallback matching

📅 `2026-04-28` | ✏️ **JunnanZ** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24742](https://github.com/anomalyco/opencode/issues/24742)


### Description

## Environment

- Model provider: `deepseek`
- Model: `deepseek-v4-pro`
- Variant: `max`
- Affected file: `web/src/app/refresh.css`

## Summary

The `edit` tool appears to advertise exact string replacement, but in this session it accepted a non-contiguous `oldString` and replaced a much larger span than intended.

A one-line CSS change ended up deleting 2,337 lines from `refresh.css`.

## What happened

The agent intended to change:

```css
outline-offset: 3px;
```

to:

```css
outline-offset: 2px;
```

However, the generated `oldString` was accidentally composed from two distant locations in the file:

```text
  outline-offset: 3px;
}

/* ================================================================
   27. MOBILE TOUCH FEEDBACK
```

This was not a real contiguous exact match in the file, so I expected the edit to fail.

Instead, the edit succeeded and appears to have matched the first line as a start anchor and the section heading as an end anchor, replacing everything between them with the one-line `newString`.

## Observed tool call

```text
tool: edit

oldString:
"  outline-offset: 3px;\n}\n\n/* ================================================================\n   27. MOBILE TOUCH FEEDBACK"

newString:
"  outline-offset: 2px;"

result:
Edit applied successfully
```

## Expected behavior

If `oldString` is not an exact contiguous match in the file, the edit should fail.

## Actual behavior

The edit succeeded and deleted 2,337 lines from the file.

## I

> *[Truncado — 3650 chars totais]*

---

## #24737 — vscode plugin  sst-dev.opencode-v2 401

📅 `2026-04-28` | ✏️ **ioxera** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24737](https://github.com/anomalyco/opencode/issues/24737)


### Description

vscode 插件sst-dev.opencode-v在连接时出现
```
Initializing OpenCode application...
🚀 Starting OpenCode server...
🔍 Found config at: /home/john/.local/share/opencode/auth.json
✅ Loaded OpenCode configuration
🔍 Server URL: http://127.0.0.1:4096
✅ OpenCode server started on port: 4096
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
OpenCode client initialized: http://127.0.0.1:4096
❌ HTTP 401 Unauthorized http://127.0.0.1:4096/project/current?directory=%2Fhome%2Fjohn%2FDownloads%2Ftest
  Response body: Unauthorized
```
opencode 未设置“OPENCODE_SERVER_PASSWORD"。

### Plugins

vscode plugin  sst-dev.opencode-v2   0.1.1

### OpenCode version

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

Since yesterday opencode became completely unusable. Long running work suddenly crash with this error:

Unexpected value(s) `effort-2025-11-24` for the `anthropic-beta` header. Please consult our documentation at docs.anthropic.com or try again without the header.

Why are you using beta nonsense? I am not even using the latest model (Opus 4.7). That one does not work at all... Can I disable the bleeding edge stuff somehow?

I am using the Opus 4.6 and Sonnet 4.6 models via VertexAI.  Or I am trying to at least.


### Plugins

Vertex AI

### OpenCode version

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

When using OpenCode as an ACP agent inside Zed coding editor, the connection fails immediately with:
```
Internal error: "server shut down unexpectedly"
```

This happens both with the ACP registry agent and direct ACP integration in Zed.

### OpenCode version

CLI: `0.0.0-dev-202604260529`

### Plugins

```json
"plugin": [
  "@tarquinen/opencode-dcp@latest",
  "file:///Users/aungmyokyaw/Desktop/projects/life-projects/opencode-notify/dist/plugin.js"
]
```

Also using MCP servers: chrome-devtools, context7, exa

### Steps to reproduce

1. Configure Zed to use OpenCode as an ACP agent
2. Open any project in Zed
3. Try to chat with OpenCode agent
4. OpenCode server crashes with "server shut down unexpectedly"

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

## #24470 — [Subscriber Alert] OpenCode Go billing failure: Kimi disabled due to "insufficient balance" on proxy account

📅 `2026-04-26` | ✏️ **capem** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24470](https://github.com/anomalyco/opencode/issues/24470)


### Description

As a paying OpenCode Go subscriber, I am currently unable to use the Kimi models. The session is stuck in a permanent loop: Provider returned error [retrying in 5s attempt #3].

My debug logs reveal a critical backend failure. The OpenCode Go proxy is hitting a billing suspension on the upstream Moonshot AI account. The raw error log explicitly states:
"Your account org-446a70bb... is suspended due to insufficient balance, please recharge your account".

Furthermore, the CLI (v1.14.25) is mishandling this 429 error by treating it as a retryable rate limit instead of a fatal billing error, leading to the infinite UI hang.

### Plugins

None

### OpenCode version

1.14.25

### Steps to reproduce

1. Use OpenCode Go subscription.
2. Attempt to run a prompt using Kimi K2.6/2.5.
3. Observe the red error box and the persistent "retrying in 5s" loop.
4. Check debug logs to confirm the exceeded_current_quota_error from the Moonshot org account.

### Screenshot and/or share link

_No response_

### Operating System

CachyOs

### Terminal

konsole 26.04.0

---

## #24439 — Custom Tools with Zod schemas crash TUI in v1.4.3

📅 `2026-04-26` | ✏️ **Hayr06** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24439](https://github.com/anomalyco/opencode/issues/24439)


# Bug Report: Custom Tools with Zod schemas crash TUI in v1.4.3

## Description

Custom tools defined using `@opencode-ai/plugin` with `tool.schema` for argument validation cause the OpenCode TUI to crash immediately after starting a prompt. The crash occurs in the Bun worker when it tries to process the tool schemas.

## Error Message

```
TypeError: undefined is not an object (evaluating 'schema2._zod')
at process (/$bunfs/root/src/cli/cmd/tui/worker.js:81015:24)
```

## Steps to Reproduce

1. Create a project with custom tools in `.opencode/tools/` using `@opencode-ai/plugin`:
```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Generate PDF report",
  args: {
    title: tool.schema.string().describe("Title"),
    data: tool.schema.string().describe("JSON data"),
  },
  async execute(args) {
    return "result";
  },
});
```

2. Start OpenCode in that directory
3. Type any message (e.g., "Hello")
4. TUI crashes immediately

## Environment

- **OpenCode version**: 1.4.3
- **Bun version**: 1.3.13
- **@opencode-ai/plugin version**: 1.4.3 (in project) / bundled in OpenCode
- **Zod version**: 4.1.8 (installed in .opencode/node_modules)
- **Platform**: Linux (Ubuntu/Debian)
- **Node/Bun runtime**: Bun

## Additional Context

### Project Structure
```
project/
├── .opencode/
│   ├── package.json       ({"dependencies": {"@opencode-ai/plugin": "1.4.3"}})
│   ├── node_modules/
│   │   ├── @opencode-ai/plugin/
│   │   └── zod/ (v4.1.8)
│   

> *[Truncado — 2859 chars totais]*

---

## #24429 — Opencode intentionally leaving permission system broken?

📅 `2026-04-26` | ✏️ **621625** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24429](https://github.com/anomalyco/opencode/issues/24429)


### Question

Opencode intentionally leaving permission system broken? 

Hi,

I've been testing the permission system and found some issues. Here's what happened.

Test setup:
Working directory was /home/user/opencode. Configuration sets external_directory to ask.

What I let tested through opencode:
1. Tried to read /home/user/.config/opencode/opencode.json - it worked without asking for permission
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

## #24414 — JSON Parse error: Unrecognized token ' ' in MCP tool stdout parsing (Windows, v1.14.24+)

📅 `2026-04-26` | ✏️ **daveotero** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24414](https://github.com/anomalyco/opencode/issues/24414)


## Description

After upgrading to v1.14.24/v1.14.25, MCP operations (connect, auth, clear auth) fail with a JSON parse error. The error originates from `@modelcontextprotocol/sdk`'s `deserializeMessage()` (`shared/stdio.ts:41`) when it encounters non-JSON content (blank lines, startup output) on an MCP tool's stdout.

## Environment

- OpenCode version: v1.14.25 (was working on previous version)
- Platform: Windows
- Run as: `opencode serve` (managed by OpenChamber)

## Expected behavior

MCP tools that write non-JSON content to stdout should either have it tolerated (skip non-JSON lines) or produce a clear, recoverable error without breaking the entire MCP subsystem.

## Actual behavior

Server log during startup:
```
INFO  service=mcp key=perplexity-ask toolCount=1 create() successfully created client
INFO  service=mcp key=playwright toolCount=21 create() successfully created client
ERROR service=server-proxy name=SyntaxError message=JSON Parse error: Unrecognized token ' '
  stack=SyntaxError: JSON Parse error: Unrecognized token ' '
    at <parse> (:0)
    at parse (unknown)
    at ~effect/Effect/successCont (B:/~BUN/root/chunk-4crkreex.js:25:7738)
    at runLoop (B:/~BUN/root/chunk-4crkreex.js:25:2045)
    at evaluate (B:/~BUN/root/chunk-4crkreex.js:25:1435)
```

After this error, all MCP HTTP API calls (`mcp.connect()`, `mcp.auth.start()`, `mcp.auth.remove()`) fail. The error has no `key=` field (not tied to a specific MCP server), indicating the MCP subsystem enters a

> *[Truncado — 2830 chars totais]*

---

## #24402 — fix: MCP tool output undefined causes TypeError: output.split crash

📅 `2026-04-25` | ✏️ **leandrosnx** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24402](https://github.com/anomalyco/opencode/issues/24402)


## Description

When an MCP tool returns a result with no text content (e.g., only images, empty content array, or unexpected response format), opencode crashes with:

```
TypeError: undefined is not an object (evaluating 'output.split')
```

## Steps to Reproduce

1. Configure any MCP server that returns tool results with no text content (e.g., image generation tools like nano-banana-mcp, or custom MCP servers returning image-only responses)
2. Call the MCP tool
3. Observe the crash

## Root Cause

When an MCP tool result has no text content, `part.state.output` is stored as `undefined`. This flows into:

1. `truncateToolOutput()` in `packages/opencode/src/session/message-v2.ts:320` — calls `.length` on undefined
2. `Truncate.output()` in `packages/opencode/src/tool/truncate.ts:91` — calls `.split("\n")` on undefined

The undefined propagates into the AI SDK's `convertToModelMessages()`, which crashes.

## Expected Behavior

MCP tools returning non-text content (images, empty results) should not crash opencode. The tool output should gracefully handle `undefined` or empty outputs.

## Environment

- OpenCode version: 1.14.25 (latest)
- Platform: macOS (darwin)
- Any MCP server returning non-text tool results

## Suggested Fix

Add null/undefined guards in:
- `truncateToolOutput()` — return `""` when text is falsy
- `Truncate.output()` — early return safe default when text is null
- Call site in `toModelMessagesEffect()` — use `?? ""` fallback

I have a PR ready with the fix.

---

## #24357 — `.watchman-cookie-*` files in git worktrees cause periodic `/vcs/diff` requests

📅 `2026-04-25` | ✏️ **jasonyork** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24357](https://github.com/anomalyco/opencode/issues/24357)


### Description

When using **secondary workspaces** (git worktrees), `.watchman-cookie-*` files created by Watchman at the worktree root trigger the file watcher. This leads to frequent `refreshVcs()` calls and periodic requests to `/vcs/diff`.

This can be annoying when attempting to comment on the code because the file will refresh, losing anything typed in the comment.

Root cause(s)

1. `.watchman-cookie-*` files are **not ignored by default** (they likely should be).
2. The `watcher.ignore` config option is only applied to the project directory subscription, **not** to the `.git` directory subscription used for worktrees.

### Proposed Fix

Update `packages/opencode/src/file/watcher.ts` to apply config ignores to the VCS directory subscription:

```ts
// Currently:
yield* subscribe(vcsDir, ignore)

// Should be:
yield* subscribe(vcsDir, [...ignore, ...cfgIgnores])
Additionally, add .watchman-cookie-* to the default ignore patterns in src/file/ignore.ts.
```

### Workaround

Disabling the watcher with `OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER=true`


### Plugins

obra/superpowers

### OpenCode version

1.14.23

### Steps to reproduce


1. Use a project with "workspaces" enabled (secondary git worktree).
2. Let Watchman run (creates `.watchman-cookie-*` files in the secondary worktree root).
3. Observe periodic `/vcs/diff` requests in network tab or server logs.

### Screenshot and/or share link

_No response_

### Operating System

macOS Tahoe 26.4.1

### Terminal

iTer

> *[Truncado — 1502 chars totais]*

---

## #24342 — Main & Sub-agents Randomly Freeze Indefinitely: Frontend Permanently Shows "thinking" with No Errors, While Actual LLM Inference Has Already Terminated Prematurely

📅 `2026-04-25` | ✏️ **xsrtyq** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/24342](https://github.com/anomalyco/opencode/issues/24342)


### Description

When running workflows in OpenCode, we encounter an unpredictable, randomly occurring freeze bug that is reproducible in both main-agent and sub-agent scenarios:
A completely fixed, unmodified workflow that ran 100% successfully previously will start freezing randomly without any OpenCode version updates or environment configuration changes, with no identifiable trigger point;
The freeze occurs in two scenarios: ① main-agent directly calling basic tools (write/edit/question); ② main-agent invoking sub-agents via the Task tool;
When the main-agent freezes, the workflow can be forcibly advanced by manually clicking "Continue". When a sub-agent freezes, there is no corresponding interaction entry, and the entire session must be manually interrupted;
Freezes can occur during trivial, zero-complexity operations (e.g. asking fixed-option questions via the question tool, writing short text via the write tool), and are completely unrelated to task complexity or model inference difficulty;
When frozen, the frontend permanently displays "thinking", with no error messages, no tool call outputs, and no workflow termination signal. Through link troubleshooting, we have confirmed that the LLM-side inference has been fully completed with no subsequent outputs, but the frontend state is not synchronized and remains permanently in the executing state;
The bug is reproducible even in completely fresh, blank sessions, and even after fully restarting the OpenCode process before 

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

## #24287 — opencode not opening and crashing

📅 `2026-04-25` | ✏️ **rexadbapp** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24287](https://github.com/anomalyco/opencode/issues/24287)


### Description

when ever I run `opencode` I get this:|

```
  rexadb git:(main) opencode                     
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

### OpenCode version

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

## #24248 — [Windows] Desktop 'Install and Restart' kills external opencode CLI TUI sessions, corrupts terminal state

📅 `2026-04-25` | ✏️ **mekwall** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24248](https://github.com/anomalyco/opencode/issues/24248)


### Description

When the OpenCode Desktop app prompts the user to "Install and Restart" after detecting an update, it forcefully kills **all** running `opencode.exe` processes on the system — including external CLI TUI sessions that were launched independently from the terminal. These CLI sessions are killed without any graceful shutdown, leaving the terminal in a corrupted state with mouse tracking enabled, which floods the prompt with raw escape sequences like `^[[<35;77;46M`.

### Steps to reproduce

1. Open **two terminal tabs** in Windows Terminal
2. Launch `opencode` (CLI TUI) in both tabs — confirm they are running
3. Launch **OpenCode Desktop** app
4. If an update is available, the Desktop app shows an "Install and Restart" prompt
5. Click "Install and Restart"
6. **Observe**: Both CLI TUI sessions are immediately killed
7. **Observe**: The terminal tabs where the CLI was running now show mouse escape sequences spamming the prompt (`^[[<35;77;46M`, `^[[<35;62;19M`, etc.) and the shell becomes unresponsive

### Expected behavior

- The Desktop app should only terminate its **own embedded sidecar** (`opencode-cli`), not external `opencode.exe` CLI TUI processes
- If external processes must be terminated, they should receive a graceful shutdown signal (SIGTERM) allowing the TUI to restore terminal state (disable mouse tracking, restore cooked mode, etc.)
- Active user sessions should be preserved or the user should be warned before killing them

### Actual behavior

- A

> *[Truncado — 4115 chars totais]*

---

## #24227 — [BUG] Desktop blank screen: tauri-plugin-store async init blocking ServerProvider

📅 `2026-04-24` | ✏️ **gerard0D** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24227](https://github.com/anomalyco/opencode/issues/24227)


### Description

## Description

OpenCode Desktop (v1.14.24) shows a completely blank white window. The sidecar server starts successfully but the WebView never renders any content.

## Steps to Reproduce

1. Launch OpenCode Desktop on macOS
2. Observe: window appears but UI is completely blank
3. Server logs show "Server ready" and "Sidecar health check OK"
4. No errors in logs, app appears hung

## Root Cause

After extensive debugging, the issue is in `packages/app/src/providers/server-provider.tsx`:

The `ServerProvider` uses `createSimpleContext` with a `gate` option that blocks its children behind a `ready` signal:

```typescript
const ready = createMemo(() => ready() && !!state.active)
```

This `ready()` depends on async initialization of the persisted store (`opencode.global.dat` via `tauri-plugin-store`). 

**If the store async init doesn't resolve, `ready()` stays `false` permanently, and the entire component tree below `ServerProvider` never renders.**

## Temporary Fix

Delete the app data directory:
```bash
rm -rf ~/Library/Application\ Support/ai.opencode.desktop/
```

This removes the corrupted `opencode.global.dat` file, allowing the store to initialize fresh.

## Proposed Solutions

1. **Add timeout to persisted store**: If async init doesn't complete within N seconds, fall back to defaults
2. **Remove gating from ServerProvider**: Set `gate: false` in `createSimpleContext` or render children immediately with defaults
3. **Add error boundary**: If provider f

> *[Truncado — 2065 chars totais]*

---

## #24206 — [BUG] Garbled ANSI escape sequences and plugin connection failure with agentmemory

📅 `2026-04-24` | ✏️ **Webners1** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24206](https://github.com/anomalyco/opencode/issues/24206)


### Description

The OpenCode TUI is failing to maintain a stable connection with the agentmemory plugin. After a connection attempt, the terminal enters a corrupted state where it continuously prints raw SGR mouse mode escape sequences (e.g., [555;27;11M). Even after a restart of the virtual machine and ensuring the port is open, the connection status remains stuck at "connecting but not connected."

### Plugins

agentmemory

### OpenCode version

1.14.24

### Steps to reproduce

Steps to reproduce
Launch OpenCode in a Windows environment (tested in PowerShell and Bash).

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

## #24197 — OpenCode Desktop 1.14.22 ignores project.icon_url_override after webview refresh.

📅 `2026-04-24` | ✏️ **OrionDim** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24197](https://github.com/anomalyco/opencode/issues/24197)


### Description

Environment:

- macOS

- OpenCode Desktop 1.14.22

- App: /Applications/OpenCode.app

- Sidecar: /Applications/OpenCode.app/Contents/MacOS/opencode-cli

What I verified:

- The project row exists in ~/.local/share/opencode/opencode.db

- project.worktree = /Users/oriondim/Documents/OpenCode_projects/simbrief-checklists

- project.name = simbrief-checklists

- project.icon_color = orange

- project.icon_url_override contains a valid data:image/png;base64 PNG

- length(icon_url_override) = 34262

Behavior:

- After manually inserting icon_url_override into SQLite, the icon appeared once in the sidebar.

- After refreshing the webview, the sidebar reverted to the generated purple fallback avatar.

- The SQLite row did not change after refresh; icon_url_override is still present.

Expected:

Sidebar/project list should render the uploaded project icon from project.icon_url_override after webview refresh.

Actual:

After webview refresh, sidebar ignores project.icon_url_override and renders fallback avatar.

Additional:

The sidecar server is running but protected with Basic Auth, so I could not inspect /project/current directly via curl:

HTTP/1.1 401 Unauthorized

WWW-Authenticate: Basic realm="Secure Area"

### Plugins

 @tarquinen/opencode-dcp, @plannotator/opencode

### OpenCode version

1.14.22

### Steps to reproduce

1. Install and open OpenCode Desktop 1.14.22 on macOS.

2. Add a local project to the Desktop project list:
   /Users/oriondim/Documents/Open

> *[Truncado — 2397 chars totais]*

---

## #24177 — Tool calls fail with JSON Parse error when description ends with a dot

📅 `2026-04-24` | ✏️ **NicoMaillet** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24177](https://github.com/anomalyco/opencode/issues/24177)


### Description

When the model emits a tool call (e.g., bash) where the description field ends with a dot (.), OpenCode's text extractor truncates the JSON immediately after that dot. The closing " and  } are lost, causing `JSON Parse error: Unterminated string` or `JSON Parse error: Expected '}'`

Hypothesis: the pre-parser/regex that extracts JSON tool blocks from the model's raw text splits on sentence boundaries when it sees a dot inside the string value, cutting the JSON mid-object.

Workaround: just force to omit the trailing period in tool description fields. I created a skill for this and it kinda work, except when the model forget the skill.

Environment:
- Model: Kimi 2.6 (via LiteLLM proxy, API OpenAI-compatible)
- OpenCode version: 1.14.23 (from homebrew)
- LiteLLM backend logs: looks clean,  the malformed JSON seems generated client-side during text extraction

### Plugins

_No response_

### OpenCode version

1.14.23

### Steps to reproduce

Just prompt something like "run some bash commands to test" in a fresh opencode session.

An example:
```
Thinking: The user wants me to run some bash commands to test the system. I should run a few basic commands to test the bash tool functionality. Let me run some simple, non-destructive commands to demonstrate the tool
⚙ invalid [tool=bash, error=Invalid input for tool bash: JSON parsing failed: Text: {"command": "echo \"Hello World\"", "description": "Test basic echo.
Error message: JSON Parse error: Unterminated string

> *[Truncado — 1971 chars totais]*

---

## #24176 — Desktop: WebView2 RenderProcessGone crash — no recovery, UI freezes while sidecar stays healthy

📅 `2026-04-24` | ✏️ **pangxianggang** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24176](https://github.com/anomalyco/opencode/issues/24176)


## Summary

The Desktop app (Windows, Tauri + WebView2) has no recovery mechanism when the WebView2 renderer process crashes (`RenderProcessGone`). The sidecar/CLI stays healthy and fully functional, but the UI permanently freezes — leaving users stuck on a white or frozen screen.

I diagnosed this on a real instance (v1.14.x, Windows 11) where the app was "freezing on startup." The root cause turned out to be a WebView2 render crash due to corrupted GPU/EBWebView cache, and the app had zero ability to recover.

## Evidence from Breadcrumbs / Crash Log

The EBWebView Breadcrumbs file (`%APPDATA%\opencode\EBWebView\Breadcrumbs`) clearly shows the crash pattern:

```
0:00:00 Startup
0:00:00 Tab1 StartNav1 → FinishNav1 → PageLoad  ✓
0:00:00 Tab1 StartNav2 → FinishNav2 → PageLoad  ✓
0:00:00 Tab1 StartNav3 → FinishNav3              ✓
0:00:03 Tab1 StartNav4 → FinishNav4              ✓
0:00:03 Tab1 StartNav5 → FinishNav5              ✓
0:00:10 Tab1 RenderProcessGone                   ✕ CRASH
0:00:13 Tab1 StartNav6 #reload                   ↻ (fails)
```

All page navigations complete successfully, then the render process dies. The reload attempt at 0:00:13 fails silently because there's no logic watching for this event.

## Why This Affects Multiple Users

This is NOT a one-off. Searching existing issues shows the exact same pattern across platforms:

- **#17347** `STATUS_BREAKPOINT Renderer Crash on specific session` — Windows, v1.2.25, v1.3.14, v1.4.3
- **#15967** `macOS white scr

> *[Truncado — 5533 chars totais]*

---

## #24126 — OpenCode crashed when I opened the terminal through the web interface.

📅 `2026-04-24` | ✏️ **LerkoX** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24126](https://github.com/anomalyco/opencode/issues/24126)


### Description


╰─○ OPENCODE_SERVER_USERNAME=xxx OPENCODE_SERVER_PASSWORD=xxxx opencode web --hostname 0.0.0.0

                                   ▄
  █▀▀█ █▀▀█ █▀▀█ █▀▀▄ █▀▀▀ █▀▀█ █▀▀█ █▀▀█
  █  █ █  █ █▀▀▀ █  █ █    █  █ █  █ █▀▀▀
  ▀▀▀▀ █▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀ ▀▀▀▀

  Local access:        http://localhost:4096
============================================================
Bun v1.3.13 (bf2e2cec) Linux x64 (baseline)
WSL Kernel v6.6.87 | glibc v2.39
CPU: sse42 popcnt avx avx2
Args: "opencode" "--user-agent=opencode/1.14.22" "--use-system-ca" "--" "web" "--hostname" "0.0.0.0"
Features: Bun.stderr(2) Bun.stdin(2) Bun.stdout(2) abort_signal(4) fetch(64) http_server jsc spawn(1478) standalone_executable napi_module_register process_dlopen
Builtins: "bun:ffi" "bun:main" "bun:sqlite" "node:assert" "node:async_hooks" "node:buffer" "node:child_process" "node:console" "node:crypto" "node:dns" "node:events" "node:fs" "node:fs/promises" "node:http" "node:https" "node:module" "node:net" "node:os" "node:path" "node:process" "node:querystring" "node:readline" "node:stream" "node:stream/consumers" "node:stream/promises" "node:string_decoder" "node:timers" "node:timers/promises" "node:tls" "node:tty" "node:url" "node:util" "undici" "ws" "node:v8" "node:http2" "node:diagnostics_channel" "node:dgram"
Elapsed: 7634281ms | User: 116274ms | Sys: 96549ms
RSS: 0.02ZB | Peak: 0.41GB | Commit: 0.02ZB | Faults: 1157 | Machine: 8.16GB

panic(main thread): Segmentation fault at address 0x211
oh n

> *[Truncado — 2470 chars totais]*

---

## #24077 — opencode (default mode) closes entire terminal window on Linux / i3wm

📅 `2026-04-24` | ✏️ **brenoassp** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24077](https://github.com/anomalyco/opencode/issues/24077)


### Description

## Summary
 
Running the `opencode` command in its default mode (which starts both the server and the TUI in the same process) causes the **entire terminal window to close** — not just the opencode process exiting, but the emulator window itself disappearing. Running `opencode serve` and `opencode attach <url>` as two separate processes works perfectly, which strongly suggests the bug is in the combined server+TUI startup path.
 
 
## Environment
 
- **opencode version:** 1.14.21
- **OS:** Ubuntu (Linux)
- **Window manager:** i3wm
- **Shell:** zsh with oh-my-zsh
- **Terminal emulators tested (all reproduce the bug):** xterm, Terminator, GNOME Terminal
- **Installation path:** `~/.opencode/bin/opencode`
- **Installation method:** curl installer (`curl -fsSL https://opencode.ai/install | bash`) — inferred from binary location at `~/.opencode/bin/opencode`
## Steps to reproduce
 
1. Open any terminal emulator (xterm, Terminator, GNOME Terminal — all reproduce).
2. Run `opencode` (default mode, no subcommand).
3. The TUI briefly appears, then the **entire terminal window closes**.
## Expected behavior
 
The TUI should start and remain running until the user exits it. The terminal emulator window itself should never be closed by opencode.
 
## Actual behavior
 
The terminal emulator window disappears entirely. The shell process and the emulator process both terminate. On the next session, running opencode reproduces the same crash.
 
## What works (workaround)
 
S

> *[Truncado — 4961 chars totais]*

---

## #24075 — bun crash on opencode first start

📅 `2026-04-24` | ✏️ **cctyl** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24075](https://github.com/anomalyco/opencode/issues/24075)


### Description

use this command install opencode: `npm i -g opencode-ai` .

type opencode print:
```
============================================================
Bun v1.3.13 (bf2e2cec) Linux x64 (baseline)
Linux Kernel v5.15.0 | glibc v2.31
CPU: sse42 popcnt avx avx2
Args: "/root/.nvm/versions/node/v24.15.0/lib/node_modules/opencode-ai/bin/.opencode"
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

### OpenCode version

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

## #24049 — `/vcs/diff` can OOM in desktop-layout web UI on umbrella workspaces with many nested git repos

📅 `2026-04-23` | ✏️ **jeremyakers** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/24049](https://github.com/anomalyco/opencode/issues/24049)


### Description

I’m seeing repeated OpenCode OOM crashes caused by `GET /vcs/diff` on a workspace that is an umbrella/meta-repo containing many nested git repos and worktrees.

Important context:

- I am **not** intentionally using the review/diff UI.
- I am using the **web UI** in a normal desktop browser, not the desktop app.
- The issue still reproduces with **Oh-My-OpenCode disabled**.
- My workspace layout contains many nested repos/worktrees, and OpenCode’s `vcsDiff` does not handle that layout well.

What I found:

- In the logs, multiple actual `Out of memory failed` events happen while one or more `GET /vcs/diff` requests are in flight.
- In source, `/vcs/diff` ultimately builds full-file patches using `structuredPatch(..., { context: Number.MAX_SAFE_INTEGER })`, which looks extremely memory-heavy.
- In the app source, the desktop-layout session page can auto-enable review/diff behavior when the **file tree is open**, even if the review tab was not explicitly opened.

Source references:

- Route:
  - `packages/opencode/src/server/routes/instance/index.ts`
- Implementation:
  - `packages/opencode/src/project/vcs.ts`
- Auto-trigger path in app:
  - `packages/app/src/pages/session.tsx`

Specific code paths:

- `packages/opencode/src/server/routes/instance/index.ts:155-180`
- `packages/opencode/src/project/vcs.ts:49-50`
- `packages/app/src/pages/session.tsx:586-610`
- `packages/app/src/pages/session.tsx:1259-1289`

Relevant implementation detail from `packages/opencode/

> *[Truncado — 4598 chars totais]*

---

## #23949 — Windows GUI launches to pure white screen while CLI works normally

📅 `2026-04-23` | ✏️ **yexiaoxue2000-rgb** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23949](https://github.com/anomalyco/opencode/issues/23949)


### Description

# Windows GUI launches to pure white screen while CLI works normally

## Summary

On Windows, the OpenCode desktop GUI consistently opens to a **pure white screen**, while the CLI works normally.

I have already tried:

- full uninstall
- deleting all local app data / cache
- reinstalling
- disabling GPU
- disabling software rasterizer

None of these fixed the GUI white screen.

The CLI remains usable.

---

## Environment

- OS: Windows
- OpenCode version: **1.14.21**
- GUI executable:
  - `D:\OpenCode\OpenCode.exe`
- CLI executable:
  - `D:\OpenCode\opencode-cli.exe`

After reinstall, another mirrored install path also appears:

- `D:\opencode\OpenCode.exe`
- `D:\opencode\opencode-cli.exe`

### GPU environment

- NVIDIA GeForce RTX 2060
- Intel UHD Graphics 630

### WebView-related local data

The app recreates local data under:

- `%APPDATA%\OpenCode\EBWebView`
- `%LOCALAPPDATA%\ai.opencode.desktop`

---

## Actual behavior

- Launching the desktop GUI results in a **pure white window**
- The app process remains running
- The sidecar starts successfully
- No useful frontend error appears in the app log
- The CLI works normally

---

## Expected behavior

The GUI should render normally instead of showing a blank white screen.

---

## Reproduction steps

1. Install OpenCode on Windows
2. Launch the desktop GUI
3. The window opens but remains completely white
4. CLI still works as expected

---

## Relevant logs

Desktop log shows normal backend startup only

> *[Truncado — 2198 chars totais]*

---

## #23903 — Web UI: Failed to send prompt. Unable to retrieve session.

📅 `2026-04-22` | ✏️ **jeremyakers** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23903](https://github.com/anomalyco/opencode/issues/23903)


### Description

OpenCode crashes. A lot.

Since 1.14.18 or so, after I restart it, I can't send prompts on previous sessions in the Web UI anymore:

<img width="424" height="314" alt="Image" src="https://github.com/user-attachments/assets/a9582b0e-9167-4f74-84e7-a8b65f652f84" />

I have to go back to the TUI, and send a prompt there, and then only after I send a prompt on the TUI does the same session in the WebUI start working again

### Plugins

OmO

### OpenCode version

1.14.20

### Steps to reproduce

1. Wait for OpenCode to crash
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

OpenCode should gracefully handle a missing session directory — e.g. fall back to the current working directory, show a warning, or prompt the user.

#### Analysis

The session's `directory` field in the database points to a path that no longer exists. The `/experimental/workspace` endpoint fails with "No context found for instance", and this unhandled error eventually corrupts the TUI state, causing the PTY file descriptor to go bad (errno 9 = EBADF).

#### Workaround

Recreate the original directory (even empty) and run `opencode -s <session_id>` from within that directory.

### Plugins

none

### OpenCode version

1.4.10

### Steps to reproduce

1. Create a session in directory `/some/path/that/exists/`
2. Rename or delete that directory
3. Run `opencode -s <session_id>` (from any directory, including the original directory's location)
4. The UI loads briefly, then goes completely black after ~15-22 seconds
Note: Even running the command from a different directory does not hel

> *[Truncado — 1828 chars totais]*

---

## #23734 — [BUG] Windows: Sidecar handle leak causes desktop freeze + persistent server polling errors

📅 `2026-04-21` | ✏️ **DrDexter6000** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23734](https://github.com/anomalyco/opencode/issues/23734)


## Bug Description

On Windows 11, the OpenCode Desktop sidecar (`opencode-cli`) exhibits two critical issues:

1. **Windows Handle (HND) leak** — Handles explode from ~385 to 7,000–12,000+ in ~90 seconds, accompanied by connection spikes (32→287+), causing the sidecar to become unresponsive and the desktop UI to freeze.
2. **Persistent `service=server error= failed`** — A recurring server error fires every 6–31 seconds in every sidecar instance from the first second of startup, regardless of active sessions.

## Environment

- **OS**: Windows 11 Home (build 26200)
- **Desktop app**: v1.14.20 (upgraded from earlier version, issue persists)
- **Sidecar**: `opencode-cli` (bundled with desktop app)
- **MCP servers configured**: playwright, chrome-devtools, context7, grep_app, web-reader, zread, web-search-prime
- **Projects**: 8 registered projects with 30 sessions in SQLite DB

## Issue 1: Windows Handle Leak → Desktop Freeze

### Reproduction

The handle leak appears unpredictably during normal usage (sending messages, switching sessions). It does **not** occur during idle benchmark runs (HND stable at 382–384 for 50+ minutes with no interaction).

### Evidence: Process Monitor Data

A custom monitoring script captured the leak in real-time (sampled every 30s):

**Before leak (normal state):**
```
[19:08:39] PID=10228 PORT=1921 MEM=753MB CPU=34.2s THR=39 HND=355 CONN=41  health=401
```

**Leak triggered (2 user messages sent):**
```
[19:09:10] PID=10228 PORT=1921 MEM=882MB CPU

> *[Truncado — 6288 chars totais]*

---

## #23698 — Out of Memory Error in OpenCode Desktop

📅 `2026-04-21` | ✏️ **VIKASRP24** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23698](https://github.com/anomalyco/opencode/issues/23698)


### Question

I was working on a project of around 700mb ! OpenCode dektop Kept on Crashing with the error message Out of Memory! I tried re installing , still it doesn't work! i removed that project But still it keeps on getting Crashed

---

## #23664 — Remote MCP headers: {env:...} interpolation not working

📅 `2026-04-21` | ✏️ **nikf2001** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23664](https://github.com/anomalyco/opencode/issues/23664)


## Bug Report

`{env:VAR_NAME}` syntax in remote MCP server `headers` is not interpolated — the literal string `{env:VAR_NAME}` is sent as the header value instead of the resolved environment variable.

## Steps to Reproduce

1. Set an environment variable:
   ```bash
   export MY_TOKEN="actual_token_value"
   ```

2. Configure a remote MCP server in `opencode.json`:
   ```json
   {
     "mcp": {
       "my-server": {
         "type": "remote",
         "url": "https://example.com/api/mcp",
         "headers": {
           "Authorization": "Bearer {env:MY_TOKEN}",
           "X-Project-Id": "{env:MY_PROJECT_ID}"
         },
         "oauth": false
       }
     }
   }
   ```

3. Launch OpenCode from a shell where `MY_TOKEN` is confirmed set (`echo $MY_TOKEN` shows the value).

## Expected Behavior

`{env:MY_TOKEN}` should resolve to the value of the `MY_TOKEN` environment variable, resulting in the header `Authorization: Bearer actual_token_value`.

## Actual Behavior

The literal string `Bearer {env:MY_TOKEN}` is sent as the header value, causing 401 Unauthorized from the remote server.

Confirmed by testing with curl:
```bash
# Literal string → 401
curl -H "Authorization: Bearer {env:MY_TOKEN}" https://server/api/mcp
# Resolved value → 200
curl -H "Authorization: Bearer $MY_TOKEN" https://server/api/mcp
```

## Notes

- `{env:...}` **does** work correctly in the `environment` block of local (`"type": "local"`) MCP servers.
- The [docs](https://opencode.ai/docs/mcp-servers/)

> *[Truncado — 1752 chars totais]*

---

## #23608 — [BUG] UI Sync Error: Infinite thinking or blank response with GPT-5.4 Mini High

📅 `2026-04-21` | ✏️ **Markgatcha** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23608](https://github.com/anomalyco/opencode/issues/23608)


### Description

The AI model frequently fails to render responses in the UI. I have encountered two variations of this:
Infinite Thinking: The model enters a perpetual "thinking" state with the animation active. Closing and restarting the app reveals the response was actually completed.
Blank Response: After a period of thinking, the animation disappears, but the UI remains blank with no text output. 

### Plugins

No plugins only using tavily search mcp

### OpenCode version

v1.14.19

### Steps to reproduce

Start a conversation using GPT-5.4 Mini High.
Trigger a prompt that requires a "Thinking" state.
Observe the UI: it either gets stuck in the animation indefinitely or the animation stops and leaves a blank message area.
Restart the OpenCode desktop app.
Re-open the session to see that the response was successfully generated but just failed to display initially. 

### Screenshot and/or share link

https://opncd.ai/share/7Q7BjC5L

### Operating System

Windows 11 insiders beta 

### Terminal

Windows Powershell 7 Preview

---

## #23538 — [Linux/Fedora RPM] “Install and Restart” closes and relaunches OpenCode Desktop but does not upgrade the app

📅 `2026-04-20` | ✏️ **MoeDeeActual** | 💬 7 | 🔗 [https://github.com/anomalyco/opencode/issues/23538](https://github.com/anomalyco/opencode/issues/23538)


### Description

OpenCode Desktop’s in-app updater does not actually install updates on my Fedora system.

When the app launches and an update is available, I get the bottom-right notification offering “Install and Restart” or “Not Yet.” If I click “Install and Restart,” the app closes and relaunches immediately, but the update is not applied. After relaunch, I see the same update notification again for the same target version.

Current example:
- Installed version: 1.14.17
- Update offered: 1.14.19

This is not a one-off version-specific issue. I have been seeing the same behavior repeatedly across multiple releases, likely since before 1.14.10. Updating manually by downloading the latest RPM from GitHub Releases and installing it with DNF works, so the issue appears to be specific to the in-app update flow rather than the package itself.

Environment:
- OS: Fedora Workstation 43
- Desktop: KDE Plasma
- Session: Wayland
- Package type: RPM
- Install method: DNF install of the RPM package
- OpenCode CLI is also installed

Additional notes:
- No plugins are being used
- No privilege escalation prompt appears during the update attempt
- No error message or failure notification is shown
- The only result is that the app restarts without updating, and the same upgrade notification reappears

### Plugins

None

### OpenCode version

Installed version: 1.14.17

### Steps to reproduce

1. Launch OpenCode Desktop on Fedora.
2. Wait for the update notification to appear in the bottom-

> *[Truncado — 1864 chars totais]*

---

## #23536 — Cannot open on WSL

📅 `2026-04-20` | ✏️ **hanumanman** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23536](https://github.com/anomalyco/opencode/issues/23536)


### Description

Cannot open Opencode.

### Plugins

None

### OpenCode version

1.14.19

### Steps to reproduce

1. Install opencode with curl -fsSL https://opencode.ai/install | bash
2. Run opencode command

### Screenshot and/or share link

<img width="1223" height="763" alt="Image" src="https://github.com/user-attachments/assets/835a2638-1647-49cb-902f-ad63dbc120db" />

### Operating System

WSL Ubuntu 22.04

### Terminal

Windows Terminal

---

## #23519 — Permission rules not enforced for "edit" operation performed by Task subagents

📅 `2026-04-20` | ✏️ **Workhub-Shreyas** | 💬 8 | 🔗 [https://github.com/anomalyco/opencode/issues/23519](https://github.com/anomalyco/opencode/issues/23519)


### Description

File permission rules defined in .opencode/opencode.json are not enforced when file operations (Write, Edit) are performed by Task tool subagents. This allows any "general" subagents to bypass explicit deny rules, which kind of a is a security concern.

### Expected Behavior
Permission rules should propagate to Task subagents. Write/Edit calls matching "*": "deny" should be rejected.

### Actual Behavior
The subagent successfully writes to denied paths. Only direct (non-subagent) file operations respect the permission configuration.

### Impact
This completely undermines the user's attempt to enforce edit rules for opencode workflows that use the task tool. Users relying on permissions to protect sensitive files may not have any actual protection when subagents are involved.

### Plugins

I am using a custom MCP, which allows read only view on my specific app's state.

### OpenCode version

Opencode 1.4.7

### Steps to reproduce

1. Create an "opencode.json" settings file in the repository root without permission rules, but with something generic like a default model. 
2. Create another "opencode.json" under the path `.opencode/opencode.json` with restrictive permissions:
```json
{
  "permission": {
    "edit": {
      "*": "deny",
      "skills/*": "allow"
    }
  }
}
```
3. Ask the assistant to perform a task that requires editing files both inside and outside the allowed path.
4. When the assistant uses the Task tool to delegate work to a subagent, the sub

> *[Truncado — 1750 chars totais]*

---

## #23509 — 【IMPORTANT】v1.14.19 APP Installed ,but cannot opened.

📅 `2026-04-20` | ✏️ **idoceo** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23509](https://github.com/anomalyco/opencode/issues/23509)


### Description

opencode-electron-mac-x64.dmg installed，but app cannot opened .
Only v1.14.0 app can opened.

### Plugins

_No response_

### OpenCode version

v1.14.19

### Steps to reproduce

1.install v1.14.19
2.click opencode 
3.nothing happen

### Screenshot and/or share link

<img width="1179" height="1080" alt="Image" src="https://github.com/user-attachments/assets/1c35fac9-d86a-48c3-a0c6-aedd48e77ed3" />

### Operating System

MacOS 13.7.4 

### Terminal

_No response_

---

## #23462 — opencode plugin <name> crashes with 'fetch() proxy.url must be a non-empty string' when HTTP_PROXY is set

📅 `2026-04-20` | ✏️ **KaysonSear** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23462](https://github.com/anomalyco/opencode/issues/23462)


### Describe the bug
When attempting to install any plugin using the `opencode plugin <name>` command, it crashes immediately if the `HTTP_PROXY` or `HTTPS_PROXY` environment variables are set.

The error thrown is:
`request to https://registry.npmjs.org/<name> failed, reason: fetch() proxy.url must be a non-empty string`

### Steps to reproduce
1. Export a valid proxy URL in the terminal (e.g., `export HTTP_PROXY="http://127.0.0.1:7890"` and `export HTTPS_PROXY="http://127.0.0.1:7890"`).
2. Run `opencode plugin diff` (or any other plugin).
3. See error:
```
■  Could not install "diff"
■  request to https://registry.npmjs.org/diff failed, reason: fetch() proxy.url must be a non-empty string
```

### Expected behavior
The `opencode plugin` command's internal `fetch` logic should correctly parse the proxy URL from the environment variables and route the request, or cleanly bypass it. It seems to be an issue with how Bun's fetch or the custom proxy agent parses the environment variable string.

### Environment
- OS: Linux
- OpenCode Version: 1.14.18

---

## #23443 — [Bug] Desktop sidecar crashes with Bun panic "integer does not fit in destination type" after ~60s, RSS 22-25GB

📅 `2026-04-19` | ✏️ **evergzzerg-dotcom** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23443](https://github.com/anomalyco/opencode/issues/23443)


## Description

OpenCode Desktop (v1.14.18) on Windows 11 crashes the sidecar (opencode-cli.exe / Bun v1.3.11) approximately 60 seconds after launch with:

```
panic(thread XXXXX): integer does not fit in destination type
oh no: Bun has crashed. This indicates a bug in Bun, not your code.
RSS: 21.99GB | Peak: 21.99GB | Commit: 22.85GB | Machine: 68.64GB
```

The sidecar memory usage grows from ~0 to 22-25 GB RSS in ~60 seconds before the crash. The crash report URL is:
`https://bun.report/1.3.11/ea1af24e28moGuhooC6gngQs347Myw16Jg3rgNCYKERNEL32.DLLut0LCSntdll.dll4/hjBA0eNoFwcENACAMAsBVWM1ENHyosXzc3js53LyYxYYrWApkTHbkEZWRd/gBNAAPKQ`

This matches the known Bun Windows issue fixed in PR #29327 (merged Apr 15, 2026) where `uv_fs_read` return values were truncated from `ssize_t` to `int`.

## Environment

- **OpenCode version**: 1.14.18
- **Bun version**: v1.3.11 (bundled sidecar)
- **OS**: Windows 11
- **RAM**: 68.64 GB
- **Sidecar binary**: `C:\Users\evera\AppData\Local\OpenCode\opencode-cli.exe` (154 MB)

## Logs

The crash reproduces consistently. Sample from `opencode-desktop_2026-04-19_13-40-07.log`:

```
2026-04-19T19:40:09.465853Z  INFO opencode_lib: Loading done, completing initialisation
2026-04-19T19:40:12.022557Z  INFO sidecar: ERROR service=mcp clientName=github error=MCP error -32601: Method not found failed to get prompts
[... skill duplicate warnings ...]
2026-04-19T19:41:11.744061Z  INFO sidecar: Bun v1.3.11 (af24e281) Windows x64 (baseline)
2026-04-19T19:41:11.74

> *[Truncado — 2538 chars totais]*

---

## #23425 — [IMPORTANT] opencode-electron-mac-x64.dmg installed ，bug cannot open desktop。

📅 `2026-04-19` | ✏️ **idoceo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23425](https://github.com/anomalyco/opencode/issues/23425)


### Description

i installed from v1.14.0 ~ v1.14.18 ,only v.14.0 can open.
how can i solve this problem?

### Plugins

_No response_

### OpenCode version

v.14.18

### Steps to reproduce

1.open opencode
2.opencode not opened.

### Screenshot and/or share link

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/45bd2c2e-0778-48b2-96fb-3b9fcc0b0284" />

### Operating System

macos 13.7.5 intel chip

### Terminal

_No response_

---

## #23376 — bug(tui): agent label rendering corrupts when name contains invisible Unicode codepoints

📅 `2026-04-19` | ✏️ **CoderLuii** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23376](https://github.com/anomalyco/opencode/issues/23376)


## What I hit

Running OpenCode with the oh-my-opencode plugin installed, four core agent labels render with letters missing from the visible output. The labels that should read `Sisyphus: Ultraworker`, `Hephaestus: Deep Agent`, `Prometheus: Plan Builder`, and `Atlas: Plan Executor` instead render as:

1. `Sisyphus: ltraworker`
2. `Hephaestus: Deep ent`
3. `Prometheus: Plan ider`
4. `Atlas: Plan utor`

The count of missing characters matches the agent's position in the plugin's sort order (one for Sisyphus, two for Hephaestus, three for Prometheus, four for Atlas).

## How I confirmed it

I captured the raw bytes of the rendered agent line with `od`. The line started with:

```
3e 20 e2 80 8b 53 69 73 79 70 68 75 73 20 2d 20
```

That decodes to `>` space `U+200B` space `S` `i` `s` `y` `p` `h` `u` `s` space `:` space. The three bytes `e2 80 8b` are the UTF 8 encoding of `U+200B` (zero width space). The prefix is present in the string that reaches the renderer. This is not ANSI, not a color code, not cursor movement. It is an invisible codepoint, emitted as data, that OpenCode's TUI then tries to measure and truncate.

## Where it reproduces

Affected labels (4 total): Sisyphus (Ultraworker), Hephaestus (Deep Agent), Prometheus (Plan Builder), Atlas (Plan Executor).

Reproduced on:

1. Windows Terminal
2. macOS Terminal
3. The HolyCode/OpenCode browser terminal presentation

That rules out local terminal settings as the cause.

## Root cause

oh-my-opencode prepends `U+200B` c

> *[Truncado — 4180 chars totais]*

---

## #23338 — Github Copilot model selector shows unauthorized models and occasionally hides available ones

📅 `2026-04-18` | ✏️ **MertSoylu** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23338](https://github.com/anomalyco/opencode/issues/23338)


### Description

I've been using the GitHub Copilot integration and noticed an inconsistent bug with the model selection dropdown.

First, the list frequently displays models that my account doesn't have access to (such as Opus). When I select one of these unauthorized models, I naturally cannot use it, which creates a confusing user experience.

Second, the opposite issue occurs: sometimes the models that I should have access to completely disappear from the list. This makes it difficult to know which models are actually available to me at any given time.


Expected Behavior:
I expect the model selector to accurately reflect my account's current permissions. It should filter out models I cannot use to prevent dead ends, and it should consistently load and display all the models I am authorized to use without them randomly dropping off the list.

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

1.Open the GitHub Copilot model selector in the IDE/CLI.

2.Scroll through the available models.

3.Observe that unauthorized models (e.g., Opus4.7) are listed. Selecting them results in a failure to generate code.

4.Check the list periodically; notice that standard, accessible models are sometimes randomly missing from the dropdown.

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Powershell

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

### OpenCode version

1.4.x

### Operating System

macOS

### Terminal

Any

---

## #23322 — [BUG] Ctrl+X (agent switcher) is dangerously close to Ctrl+C (quit) — should be remapped to Ctrl+K

📅 `2026-04-18` | ✏️ **talha7k** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23322](https://github.com/anomalyco/opencode/issues/23322)


### Description

The `Ctrl+X` keybinding for opening the agent/session picker is too close to `Ctrl+C`, which immediately quits OpenCode and clears the current session. This makes it extremely easy to accidentally close the entire program when you intended to switch agents or view sub-agent tasks — losing your unsent prompt, current context, and interrupting running tasks.

### Current behavior

- `Ctrl+X` → Opens agent/session picker (chord: `Ctrl+X` then arrow keys)
- `Ctrl+C` → Immediately quits OpenCode, clearing everything with no confirmation

### Expected behavior

Remap the agent switcher to a safer keybinding that isn't adjacent to the quit shortcut. `Ctrl+K` would be a natural choice — it's the standard chord leader key used by many popular TUIs (lazygit, helix, etc.) and has no risk of accidental adjacency with `Ctrl+C`.

### Proposed fix

- Change agent/session picker from `Ctrl+X` → `Ctrl+K`
- This follows the convention used by lazygit, helix, and other modern terminal UIs where `Ctrl+K` is the leader key for navigation actions

### Alternative / complementary fix

See related issue: Ctrl+C should ask for confirmation before closing. Both fixes together would eliminate the problem entirely.

### OpenCode version

1.4.x

### Operating System

macOS

### Terminal

Any

---

## #23303 — Segmentation fault (Bun v1.3.5) on Windows while using CLI

📅 `2026-04-18` | ✏️ **rvoidex7** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23303](https://github.com/anomalyco/opencode/issues/23303)


### Description

The opencode CLI crashes with a "Segmentation fault" on Windows. The crash report indicates that the issue is within the embedded Bun v1.3.5 runtime, specifically a memory management error during finalization.

### Plugins

none

### OpenCode version

1.1.25

### Steps to reproduce

I'm not exactly sure which specific action triggered this, but here is the last output from my terminal before the crash:
Plaintext

Builtins: "bun:ffi" "bun:main" "node:assert" ... (and other node modules)
Elapsed: 3125931ms | User: 203187ms | Sys: 139531ms
RSS: 6.20GB | Peak: 8.11GB | Commit: 10.20GB | Faults: 5276432 | Machine: 33.52GB

panic(thread 16260): Segmentation fault at address 0x31FEA1E01A0
oh no: Bun has crashed. This indicates a bug in Bun, not your code.

The application was running for a while (Elapsed: 3125931ms) before it hit this memory limit or fault.

### Screenshot and/or share link

<img width="1683" height="302" alt="Image" src="https://github.com/user-attachments/assets/2ca6746f-b527-4b61-8efc-36f7487d15b1" />

### Operating System

Windows 11

### Terminal

Windows PowerShell

---

## #23141 — OpenCode crashing when it comes to editing

📅 `2026-04-17` | ✏️ **itzzjustmateo** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23141](https://github.com/anomalyco/opencode/issues/23141)


### Description

I tried to work on an old website with OpenCode and when it needed to edit, it crashed, I restarted it, crashed, I reinstalled it, crashed after working a small amount of time. This happend after my friend told me to change something in my Windows settings with RAM, idrk, btw. I am using WSL

### Plugins

None

### OpenCode version

1.4.9 (should be latest)

### Steps to reproduce

IDK that is my issue, I did everything like normally

### Screenshot and/or share link

<img width="1343" height="1021" alt="Image" src="https://github.com/user-attachments/assets/06408a02-8279-41ca-8e8e-9826715b5360" />

### Operating System

Windows 11 with WSL

### Terminal

Windows Terminal

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

## #23129 — v 1.4.8 Does not show anything in the right side bar

📅 `2026-04-17` | ✏️ **Darkov3** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23129](https://github.com/anomalyco/opencode/issues/23129)


### Description

As the title says, v 1.4.8 does not show anything in the right sidebar.
I am running it in Windows 11 PowerShell, using the Windows x64 zip package.

Only the session name and at the bottom: OpenCode, I can't remember if the version number was visible.
No to-do list, no modified files, no context data, nothing else.
I am pretty sure at the startup page, there was no version number either.

After reading other issues here, I switched to 1.4.6, and everything is back to normal.
Well, I haven't tested the todo list yet, but I see the other things, so once I get back to work, I expect the todo to appear as well.

I will mention that I tried using the auto update, but it failed. This might be due to my customized opencode pathing and other security and structural design I have; I did not investigate, I updated manually. I was on some lower version than 1.4.6 before this, which I cannot remember, but if relevant, I may be able to find out.

### Plugins

_No response_

### OpenCode version

1.4.8

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Windows 11

### Terminal

Windows Power Shell

---

## #23105 — Desktop macOS: blank/black screen + memory spike after repeated snapshot failures on nested repo path

📅 `2026-04-17` | ✏️ **hanfangyu** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23105](https://github.com/anomalyco/opencode/issues/23105)


### Description

On macOS Desktop, the app can get into a blank/black screen state after repeated snapshot failures against a nested repo/submodule path.

In my case, sidecar logs repeatedly emitted snapshot errors for `bona-hero/`:

```text
service=snapshot exitCode=128 stderr=error: 'bona-hero/' does not have a commit checked out
error: unable to index file 'bona-hero/'
fatal: adding files failed
```

I counted ~990 occurrences in one desktop log file (`opencode-desktop_2026-04-17_17-53-40.log`).

When this happens, Desktop UI eventually becomes blank/unresponsive, and WebKit WebContent memory spikes abnormally (observed up to ~4-6 GB RSS with sustained high CPU), while OpenCode main process is still alive.

I also observed stale/orphan `opencode-cli ... serve` processes in some relaunch attempts.

This feels like a robustness bug in snapshot failure handling + desktop renderer memory behavior under persistent error loops.

### Plugins

No custom plugins required to trigger this behavior in my environment.

### OpenCode version

1.4.8 (Desktop + CLI)

### Steps to reproduce

1. Open a workspace where snapshot tracking hits a nested repo/submodule path that is temporarily not in a valid checked-out state.
2. Let Desktop run while snapshot keeps failing (`exitCode=128` with `does not have a commit checked out`).
3. Continue normal usage for a while.
4. Observe UI degradation and eventual blank/black window.
5. Check process list: WebContent RSS can grow into multi-GB range; s

> *[Truncado — 2366 chars totais]*

---

## #23102 — The stuttering in OpenCode

📅 `2026-04-17` | ✏️ **IMhao-123** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23102](https://github.com/anomalyco/opencode/issues/23102)


### Description

When open it, It started lagging all of a sudden. Sometimes it freezes right after I perform an action, gets stuck for about ten seconds, recovers briefly, and then lags again. Even stranger, I can't open the right sidebar to view files.

P.S. I've recently discovered that most of the time when I opened Open Code the system memory jumps from 7GB to 11-13GB, I've try to close and open it again most of the time the memory will spike. 
### Plugins

_No response_

### OpenCode version

1.4.11

### Steps to reproduce

1. Open the OpenCode Desktop app.
2. The UI becomes extremely laggy immediately upon launch.
3. Try to interact with it (typing, clicking, opening a file, etc.). The app will freeze for about 5-15 seconds, recover briefly, and then lag again. The right sidebar to browse files is completely stuck and won't open.
4. While this freezing is happening, open macOS Activity Monitor. You will see that system memory jumps drastically from around 7 GB to about 12-13GB right after the app is launched.

But, some times this won't happen, and this app will not lag at all. 

Environment:
- OpenCode version: 1.4.8
- OS: macOS 26.4.1 (Apple Silicon)
- Client: OpenCode Desktop App

P.S. Given that the app is consuming roughly 5-6 GB of RAM just to start up and freezing simultaneously, I suspect the UI lag might actually be a secondary symptom of a severe memory leak, rather than just a rendering issue like in the WSL2 case.


### Screenshot and/or share link

_No res

> *[Truncado — 1667 chars totais]*

---

## #23040 — OPENCODE_CONFIG_DIR crashes on startup if directory is read-only and missing .gitignore

📅 `2026-04-17` | ✏️ **palekiwi** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23040](https://github.com/anomalyco/opencode/issues/23040)


### Description

When OPENCODE_CONFIG_DIR environment variable points to a read-only directory without a `.gitignore` in it, OpenCode crashes during TUI initialization.


The application crashes with an UnknownError error. 

```bash
{
  "name": "UnknownError",
  "data": {
    "message": "Error\n    at wA (/$bunfs/root/chunk-1w7cxnj4.js:71:4219)\n    at <anonymous> (/$bunfs/root/chunk-1sgce6jb.js:2:9961)\n    at processTicksAndRejections (native:7:39)"
  }
} 
```

### Workaround

Manually adding an empty .gitignore file to the directory allows opencode to start successfully. 

### Plugins

No plugins

### OpenCode version

1.4.7

### Steps to reproduce

1. Create a directory with read-only permissions. Remove the .gitignore file if it exists.
2. Set OPENCODE_CONFIG_DIR to point to that directory.
3. Run opencode

### Screenshot and/or share link

_No response_

### Operating System

Debian Trixie container

### Terminal

kitty

---

## #23009 — High CPU Usage & FileWatcher TimeoutError on Startup (Opencode Desktop)

📅 `2026-04-17` | ✏️ **KleirRampage45** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/23009](https://github.com/anomalyco/opencode/issues/23009)


### Description

When launching opencode-desktop, the application immediately consumes excessive CPU resources, even when no project or workspace is loaded. Terminal logs show the file.watcher service timing out while attempting to subscribe to /home/USER and the root directory /.   NOTE: this is on a high end system with a 7800X3D cpu, and its by far the most taxing IDE/agent that ive tested, this does not happen with Cursor, codex or antigravity. The CPU usage does not go down with time, 30 minutes can go by and it will still be using significant CPU resources and keep fans running. 

### Plugins

n/a

### OpenCode version

1.4.6-1 (Installed via AUR: opencode-desktop-bin)

### Steps to reproduce

1. Open Terminal
2. Run opencode-desktop
3. Observe TimeoutError in logs and immediate CPU spike in system monitor.

### Screenshot and/or share link

<img width="2610" height="710" alt="Image" src="https://github.com/user-attachments/assets/522eb1bf-c277-4980-b77c-52724a459209" />  

<img width="2285" height="968" alt="Image" src="https://github.com/user-attachments/assets/5583edb3-6fb2-45c7-acbb-47fd86bbed14" /> 

<img width="3425" height="1353" alt="Image" src="https://github.com/user-attachments/assets/7edaa785-79d0-44b2-8439-a3a34a0faf98" /> Note that my root / shows as a recent project opened (never created one at root or home)

<img width="2618" height="848" alt="Image" src="https://github.com/user-attachments/assets/e63431ee-644c-4341-82b3-a8204eb1c4f9" /> memory leak mayb

> *[Truncado — 1633 chars totais]*

---

## #22883 — [BUG] OpenCode crashes on long sessions.

📅 `2026-04-16` | ✏️ **HarshalRathore** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22883](https://github.com/anomalyco/opencode/issues/22883)


### Description

Hi, First of all thanks for this wonderfull tool really appreciate the hard work you people put in.

## 🐛 OpenCode Crashes on Long Sessions — OOM Kill

### Description

OpenCode crashes when running for extended periods. The process is killed by the OS (OOM killer) when RAM usage hits 100% during long sessions or when DCP plugin auto-compaction kicks in.
This appears to have worsened after the most recent update — crashes are more frequent during extended sessions.

---
### System Info
| Field | Value |
|-------|-------|
| **OS** | Arch Linux (rolling) |
| **Kernel** | 6.19.11-arch1-1 (PREEMPT_DYNAMIC) |
| **Shell** | zsh |
| **RAM** | 15Gi total · ~9.9Gi used · ~5.1Gi available |
| **Swap** | 15Gi total · ~11Gi used |
| **Architecture** | x86_64 GNU/Linux |
---
### OpenCode Version
1.4.6

---
### Expected Behavior

OpenCode should manage memory gracefully during long sessions and auto-compaction, without unbounded RAM consumption leading to OOM kill.

---
### Observed Symptoms
- Process return code: 137 (SIGKILL — OOM killer)
- RAM climbs to 100% before crash
- Auto-compaction / DCP compression appears to correlate with crash timing
- Frequency increased after updating to 1.4.6
- Crash does not occur on fresh short sessions
---
### Additional Context
- Frequency: Increased after last update (v1.4.6)
- Session length at crash: varies (observed at 5hr min – 50+ messages)
- DCP plugin: installed (auto-compaction suspected but not confirmed as root cause)
- Work

> *[Truncado — 2302 chars totais]*

---

## #22812 — Repeated requests from the web desktop client caused the local server to crash

📅 `2026-04-16` | ✏️ **KarasawaYikiho** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22812](https://github.com/anomalyco/opencode/issues/22812)


### Description

The local server went offline due to being repeatedly sent requests for unknown reasons.Currently, I solve this problem by launching it through a Powershell program.

[Boot.txt](https://github.com/user-attachments/files/26783685/Boot.txt)

[2026-04-16T112821.log](https://github.com/user-attachments/files/26783722/2026-04-16T112821.log)
[2026-04-16T113557.log](https://github.com/user-attachments/files/26783721/2026-04-16T113557.log)
[2026-04-16T113610.log](https://github.com/user-attachments/files/26783724/2026-04-16T113610.log)
[2026-04-16T113628.log](https://github.com/user-attachments/files/26783723/2026-04-16T113628.log)
[2026-04-16T113640.log](https://github.com/user-attachments/files/26783726/2026-04-16T113640.log)

### Plugins

Send a request to the thread with a large number of file changes (related to the crash of the review page and the local server)

### OpenCode version

Last

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

Windows11

### Terminal

_No response_

---

## #22808 — [Bug/Robustness] 400 Error: InternalError.Algo.InvalidParameter due to unclosed tool_calls after interruption

📅 `2026-04-16` | ✏️ **zhg4554** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22808](https://github.com/anomalyco/opencode/issues/22808)


### Description

## [Bug/Robustness] 400 Error: `InternalError.Algo.InvalidParameter` due to unclosed `tool_calls` after interruption

### Description
When using OpenCode with **Alibaba DashScope (阿里云百炼)** or similar providers, the session becomes permanently corrupted if an agent fails to provide a `tool` response following an `assistant` message that contains `tool_calls`. 

This typically occurs in multi-agent workflows when:
1. An agent crashes or timed out after generating a tool call.
2. The system/process is interrupted or rebooted before the tool execution completes.

Upon restarting the session, the API returns a **400 Bad Request**: 
`"An assistant message with 'tool_calls' must be followed by tool messages responding to each 'tool_call_id'."`



### Root Cause
Alibaba DashScope's inference engine (and OpenAI's strict mode) enforces a strict transactional sequence for tool calls. If the conversation history sent to the API ends with a "dangling" `tool_calls` without corresponding `tool` results, the API rejects the entire payload.

### Proposed Solution: The "Tombstone" Pattern (Preferred)
I recommend implementing a **Self-Healing/Auto-Completion** mechanism within the framework's message persistence or pre-request layer.

**Logic:**
Before dispatching the `messages` array to the LLM API, the framework should validate the integrity of the tool-call chain. If a dangling `tool_call_id` is detected, OpenCode should automatically inject a "Tombstone" (placeholder) messa

> *[Truncado — 2325 chars totais]*

---

## #22803 — Streaming ECONNRESET / "socket connection was closed unexpectedly" with SGLang OpenAI-compatible provider during tool-using agent runs (Qwen3.5 + reasoning content)

📅 `2026-04-16` | ✏️ **derlajsch** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/22803](https://github.com/anomalyco/opencode/issues/22803)


### Description

## What happened?

When using opencode with a self-hosted **SGLang** server serving **Qwen3.5-27B-FP8** as a custom OpenAI-compatible provider, streaming chat completions fail intermittently during agent/build-mode runs with:

- `ECONNRESET` on `POST /v1/chat/completions`
- UI message: `Cannot connect to API: The socket connection was closed unexpectedly. For more i...`
- Auto-retry loops indefinitely (`Connection reset by server, retrying in 25s - attempt #21`)

There is **no nginx / reverse proxy / load balancer** between opencode and SGLang — it is a direct TCP connection from the opencode sidecar to `http://<host>:8000/v1/chat/completions`.

### Sidecar error logs

```
ERROR service=llm providerID=aifactory modelID=qwen3.5-27b-fp8
  sessionID=... agent=build mode=primary
  error={"error":{"code":"ECONNRESET","path":"http://<host>:8000/v1/chat/completions","errno":0}}
  stream error

ERROR service=session.processor
  error=The socket connection was closed unexpectedly.
  For more information, pass `verbose: true` in the second argument to fetch()
```



### Plugins

none

### OpenCode version

1.4.3

### Steps to reproduce

1. Start SGLang serving Qwen3.5-27B-FP8 with an OpenAI-compatible endpoint:
```bash
   python3 -m sglang.launch_server \
     --model-path Qwen/Qwen3.5-27B-FP8 \
     --host 0.0.0.0 --port 8000 \
     --tp-size 2 \
     --mem-fraction-static 0.9 \
     --context-length 92000 \
     --chunked-prefill-size 8192 \
     --max-running-reques

> *[Truncado — 3574 chars totais]*

---

## #22798 — Deleting prompt in Neovim and closing with :wq does not delete prompt

📅 `2026-04-16` | ✏️ **olavsl** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22798](https://github.com/anomalyco/opencode/issues/22798)


### Description

Trying to delete a prompt by opening Neovim, deleting buffer contents, then write-quitting (:wq) Neovim after deleting the prompt does not end up deleting the prompt from the input field in opencode.

### Plugins

None

### OpenCode version

1.4.1

### Steps to reproduce

1. Write something in input field, e.g., "foo"
2. Open editor (e.g., using <C-x>-<e>)
3. Delete prompt (empty buffer)
4. Close editor using :wq specifically (first writing :w then closing using :q deletes the prompt as expected)
5. The prompt will not be deleted, even though you deleted the prompt in the buffer, then wrote-quit

### Screenshot and/or share link

1. Input "foo": 

<img width="779" height="158" alt="Image" src="https://github.com/user-attachments/assets/d5380ef1-cf62-4faf-8de3-6077bcfa4aef" />

2. Opened editor (with nvim plugin list): 

<img width="421" height="565" alt="Image" src="https://github.com/user-attachments/assets/af20827d-8ae3-4234-89cb-fc3fd78bfa72" />

3-4. Write-quitting: 

<img width="345" height="569" alt="Image" src="https://github.com/user-attachments/assets/6341fdeb-ae8d-47af-b3bd-45cfeda521f3" />

5. Input still present: 

<img width="758" height="169" alt="Image" src="https://github.com/user-attachments/assets/f16c443d-b4c9-4504-b7ea-ced264feb1a6" />

### Operating System

Arch Linux 6.19.11-arch1-1

### Terminal

Kitty

---

## #22792 — OpenCode repeatedly loops compaction-style summaries when using local vLLM (`@ai-sdk/openai-compatible`) with Qwen3-Coder

📅 `2026-04-16` | ✏️ **Zuozhuo** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22792](https://github.com/anomalyco/opencode/issues/22792)


### Description


## Summary

When using OpenCode with a **local vLLM backend** configured through `@ai-sdk/openai-compatible`, and serving **Qwen3-Coder-30B-A3B-Instruct-FP8**, simple user inputs such as `你好` or `你是谁` can trigger a pathological behavior:

- OpenCode repeatedly outputs a **compaction-like summary block**
- The output is unrelated to the current user query
- The content appears to be an old task summary from a previous conversation/session
- The pattern repeats across turns

This does **not** reproduce when directly calling the same vLLM endpoint with `curl`, and does **not** reproduce when switching the OpenCode model to `deepseek-reasoner`.

This strongly suggests the issue is in **OpenCode's conversation/compaction/summary injection logic for OpenAI-compatible local providers**, not in the model weights or the vLLM service itself.

---

## Environment

- OpenCode version: `1.4.6`
- Provider type: `@ai-sdk/openai-compatible`
- Backend: local `vLLM`
- Model: `Qwen3-Coder-30B-A3B-Instruct-FP8`
- Served model name: `qwen3-coder-30b`
- Local endpoint: `http://127.0.0.1:8000/v1`
- GPUs: 2 x RTX 3090 24GB
- OS: Linux

---

## OpenCode config (relevant part)

```json
{
  "provider": {
    "localvllm": {
      "name": "Local vLLM",
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:8000/v1",
        "apiKey": "EMPTY"
      },
      "models": {
        "qwen3-coder-30b": {
          "name": "Qwen3-Coder 30B Local",
     

> *[Truncado — 6261 chars totais]*

---

## #22774 — opentui: fatal: undefined is not an object (evaluating 'X()[0].name')

📅 `2026-04-16` | ✏️ **hyird** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22774](https://github.com/anomalyco/opencode/issues/22774)


### Description

```
TypeError: undefined is not an object (evaluating 'X()[0].name')
    at <anonymous> (B:/~BUN/root/src/index.js:891:56159)
    at init (B:/~BUN/root/src/index.js:891:56012)
    at provider (B:/~BUN/root/src/index.js:888:18934)
    at Z4 (B:/~BUN/root/src/index.js:881:57711)
    at S_ (B:/~BUN/root/src/index.js:881:61339)
    at W9 (B:/~BUN/root/src/index.js:881:61103)
    at u_ (B:/~BUN/root/src/index.js:881:59117)
    at children (B:/~BUN/root/src/index.js:888:19068)
    at <anonymous> (B:/~BUN/root/src/index.js:881:66180)
    at S_ (B:/~BUN/root/src/index.js:881:61339)
    at W9 (B:/~BUN/root/src/index.js:881:61103)
    at H0 (B:/~BUN/root/src/index.js:881:54964)
    at _J (B:/~BUN/root/src/index.js:881:59499)
    at Z4 (B:/~BUN/root/src/index.js:881:57711)
    at <anonymous> (B:/~BUN/root/src/index.js:881:66120)
    at S_ (B:/~BUN/root/src/index.js:881:61339)
    at W9 (B:/~BUN/root/src/index.js:881:61103)
    at x8 (B:/~BUN/root/src/index.js:881:54508)
    at <anonymous> (B:/~BUN/root/src/index.js:881:66111)
    at Z4 (B:/~BUN/root/src/index.js:881:57711)
    at S_ (B:/~BUN/root/src/index.js:881:61339)
    at W9 (B:/~BUN/root/src/index.js:881:61103)
    at u_ (B:/~BUN/root/src/index.js:881:59117)
    at <anonymous> (B:/~BUN/root/src/index.js:881:72493)
    at S_ (B:/~BUN/root/src/index.js:881:61339)
    at W9 (B:/~BUN/root/src/index.js:881:61103)
    at XK (B:/~BUN/root/src/index.js:881:62956)
    at x_ (B:/~BUN/root/src/index.js:881:63911)
    at dz0 

> *[Truncado — 1955 chars totais]*

---

## #22683 — 1.4.6 constantly crashing

📅 `2026-04-16` | ✏️ **jeremyakers** | 💬 17 | 🔗 [https://github.com/anomalyco/opencode/issues/22683](https://github.com/anomalyco/opencode/issues/22683)


### Description

After updating to version 1.4.6, instead of it throwing the memory leak errors, now it just crashes constantly with this:

<img width="1910" height="982" alt="Image" src="https://github.com/user-attachments/assets/81fabdce-b256-4e50-a7a8-ee5b1a77a977" />

### Plugins

OmO

### OpenCode version

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

## #22678 — Bug: /init command generates invalid opencode.json (instructions field is a string, expects an array)

📅 `2026-04-15` | ✏️ **ANGELUSD11** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22678](https://github.com/anomalyco/opencode/issues/22678)


### Description

When running the initialization command (`/init`), the generated `opencode.json` file formats the `instructions` field as a plain string instead of an array of strings. This causes the CLI to crash immediately when trying to run the tool afterwards.

The `/init` command should wrap the path in an array so it passes the strict validation. It should generate:
`"instructions": ["./AGENTS.md"]`

```text
Configuration is invalid at /home/.../opencode.json
↳ Invalid input: expected array, received string instructions

### Plugins

None

### OpenCode version

1.4.6

### Steps to reproduce

1. Run the initialization command in a folder of a project (e.g., `opencode /init`)
2. Open the generated `opencode.json` file.
3. Notice that the instructions field is formatted as: `"instructions": "./AGENTS.md"`
4. Run `opencode`.
5. See error.

### Screenshot and/or share link

_No response_

### Operating System

Linux Mint 22.3  | Linux 6.17.0-20-generic

### Terminal

_No response_

---

## #22669 — OpenCode 1.4.6  "silent failure" behavior

📅 `2026-04-15` | ✏️ **scottcali** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22669](https://github.com/anomalyco/opencode/issues/22669)


### Description


I am using opencode desktop, After I post the prompts into opencode for my project, it immediately return back said completed but actuall do nothing. It happens from yeterday night. Before that, it is working fine.

This "silent failure" behavior—where the prompt is marked complete instantly but nothing happens—often indicates that the local background server has crashed or lost its connection to the UI, even if the window looks normal.

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

## #22655 — Web UI crashes when browsing folders in the project picker

📅 `2026-04-15` | ✏️ **JtMotoX** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22655](https://github.com/anomalyco/opencode/issues/22655)


### Description

When using the web UI to add a new project, the entire opencode process crashes if you try to browse to or search for a folder that's more than a couple levels deep. This happens whether you click through directories one at a time or paste a full absolute path into the search box.

For example, trying to open something like `~/projects/org/repo` will kill the process before you ever get a chance to select it.

It looks like the directory picker walks through every intermediate directory in the path and boots a full server instance for each one (with file watchers, file scanning, LSP, snapshots, etc). Browsing to a path 4 levels deep ends up creating 4+ instances concurrently, which on Linux can exhaust inotify watch limits or memory and take down the process.

The directory picker really only needs to list folder names to let you browse around. It shouldn't need all of that heavy initialization just to do the equivalent of `readdir`.

### Steps to reproduce

1. Start opencode in web mode
2. Open the "Open Project" dialog
3. Type or paste a path that is 3 or more levels deep (e.g. `~/projects/org/repo`)
4. The opencode process crashes

### Plugins

None

### OpenCode version

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

After the `/undo` error happens, every later attempt to open that same workspace in OpenCode Desktop appears to fail with a local server / connection problem. In practice, the local sidecar/server is actually starting successfully, but the workspace keeps trying to restore a broken session state.

Rebuilding the workspace fixes it immediately.

### Environment

- OpenCode Desktop
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
3. The UI looks like it cannot connect to the local OpenCode server
4. Rebuilding / recreating the workspace fixes the problem

### Important observation

This does **not** seem to be a real local server startup failure.

From logs, the sidecar starts normally:

- `Spawning sidecar on http://127.0.0.1:...`
- `opencode server listening on http://127.0.0.1:...`
- `Server ready`

But immediately after that, OpenCode tries to restore a broken session and logs:

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
my assumption is as OpenCode is written in typescript and it uses bun for some background tasks, and cause of a bug which is forming an infinite loop, causing it to use way for resources than it should.

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

### OpenCode version

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

## #22481 — Gemma 4 generates broken herestring syntax for bash file writes

📅 `2026-04-14` | ✏️ **fishloa** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22481](https://github.com/anomalyco/opencode/issues/22481)


### Description

Gemma 4 models (google/gemma-4-31B-it via DeepInfra, also gemma-4-31b-it-8bit / gemma-4-26b-a4b-it-4bit locally via omlx) consistently generate broken bash syntax when writing files. Instead of heredoc (<<), the model outputs herestrings (<<<) with mangled quoting:

```
cat > file.rs <<< ' 'EOF'
fn main() {
    println!("it is working");
}
EOF
```

This produces `zsh: unmatched '` errors. The model retries with the same broken syntax in a loop, never self-correcting.

The correct syntax should be:

```bash
cat > file.rs << 'EOF'
fn main() {
    println!("it is working");
}
EOF
```

### Workaround

Adding a global ~/.config/opencode/AGENTS.md with instructions to use heredocs helps -- the model then prefers the Write tool over bash. But it does not fully prevent the issue when the model falls back to bash.

```markdown
# File editing

When editing files, prefer writing the complete file over using partial edits.

NEVER use herestrings (<<<) or echo/printf with quoted strings for multi-line file writes.
```

### Suggestion

Could opencode intercept bash tool calls that use `<<<` with `EOF` delimiters and rewrite them to proper `<<` heredoc syntax before execution? This would fix the issue for all affected models without relying on system prompt hinting.

Alternatively, for models known to struggle with bash file writes, opencode could bias toward using the Write/Edit tools instead of allowing bash file creation.

### Environment

- opencode 1.4.0
- Models: goog

> *[Truncado — 1749 chars totais]*

---

## #22477 — Snapshot service corrupts working repo git index when invoked from a pre-commit hook

📅 `2026-04-14` | ✏️ **MAnders333** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22477](https://github.com/anomalyco/opencode/issues/22477)


### Description

When opencode is run from inside a git pre-commit hook (e.g. an AI code review hook), the snapshot service corrupts the working repo's git index. After the opencode session completes, the index contains entries for files that were not staged (unstaged modifications, untracked files), and those entries reference blob objects that only exist in the snapshot's shadow object store — not in the working repo's own object store. Git then fails to commit with \`error: invalid object\`.

### Root cause

Git sets \`GIT_INDEX_FILE\` in the environment before running hooks (see \`commit.c:run_commit_hook\`). This variable is inherited by every subprocess the hook spawns. The snapshot service's \`git\` helper uses \`extendEnv: true\`, which merges the full parent environment into every git subprocess it spawns. Because \`GIT_INDEX_FILE\` takes priority over the index path implied by \`--git-dir\`, the snapshot's \`git add\` and \`git write-tree\` commands write into the **working repo's index** instead of the shadow repo's index.

The blobs they write go into the shadow's object store (because \`--git-dir\` correctly directs object storage), but the index entries end up in the working repo's \`.git/index\` pointing at those shadow-only blobs — leaving the working repo in an invalid state.

### Steps to reproduce

1. Set up a global git pre-commit hook that runs \`opencode run --agent reviewer ...\`
2. Stage some files, leave others unstaged, have some untracked files
3. R

> *[Truncado — 1844 chars totais]*

---

## #22455 — Grep tool returns 0 results in multi-repo workspace (workspace root is not a git repo)

📅 `2026-04-14` | ✏️ **jinxiaocheng** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22455](https://github.com/anomalyco/opencode/issues/22455)


## Environment

- **OpenCode version**: 1.4.1
- **OS**: Windows 11 64-bit (win32)
- **Shell**: PowerShell 5.1
- **Workspace root**: Not a git repository
- **Subdirectories**: Each is an independent git repo

## Summary

The built-in \Grep\ tool returns **0 results** for patterns that demonstrably exist in source files. Running \g\ (ripgrep) directly from the terminal on the same path returns all expected matches.

## Workspace Structure

\\\
D:\Code_fix\              # NOT a git repo (workspace root)
├── ygp-fms\              # Independent git repo
├── ygp-bciscm-fms\       # Independent git repo
└── ygp-invoice\          # Independent git repo
\\\

Each subdirectory is an independent Java microservice with its own \.git/\ and \.gitignore\.

## Steps to Reproduce

### 1. OpenCode Grep tool — 0 results

Called the \Grep\ tool (provided by OpenCode) with:

- **pattern**: \9203\
- **path**: \D:\Code_fix\ (also tried \D:\Code_fix\ygp-bciscm-fms\)
- **include**: \*.yml\, \*.properties\, \*.xml\, \*.java\ (tried each separately)
- **output_mode**: \content\

**Result**: \No matches found\ — across ALL attempts (6 separate calls with different filters).

### 2. ripgrep directly — 7 results

\\\powershell
rg "9203" "D:\Code_fix\ygp-bciscm-fms" --no-ignore -n
\\\

**Result**:

\\\
D:\Code_fix\ygp-bciscm-fms\bciscm-fms-service\Dockerfile:9:EXPOSE 9203 19203 29203
D:\Code_fix\ygp-bciscm-fms\bciscm-fms-service\target\classes\bootstrap-local-uat.yml:26:# http://127.0.0.1:9203/actuator/na

> *[Truncado — 4013 chars totais]*

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

oh-my-opencode

### OpenCode version

1.4.3

### Steps to reproduce

Not fully deterministic yet, but this happens during normal TUI usage:
1. Launch OpenCode in terminal
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

## #22334 — Mac OS Apple M3 OS 15.0 (24A335) white screen

📅 `2026-04-13` | ✏️ **A77dd** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22334](https://github.com/anomalyco/opencode/issues/22334)


### Description

Good afternoon!

A white screen pops up all the time, although the processes in the background are going on.

At first, a full restart to the application helped, but now immediately after restarting and loading - the current task is shown for a second, after which a static white screen immediately pops up. nothing is pressed, including opening settings, etc. via hotkeys

<img width="1710" height="1107" alt="Image" src="https://github.com/user-attachments/assets/a7af7f09-3e18-477f-bb80-8844ea6af6af" />

### Plugins

non

### OpenCode version

Version 1.4.3 (1.4.3)

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

MacOS 15.0 (24A335)

### Terminal

_No response_

---

## #22331 — Transparent theme crashes with "none" color value

📅 `2026-04-13` | ✏️ **yuto0226** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22331](https://github.com/anomalyco/opencode/issues/22331)


TypeError: undefined is not an object (evaluating 'c4[mode2])

When selecting a custom theme with "none" for background values, OpenCode crashes. The error occurs in resolveColor function when trying to resolve the "none" value.

---

**Environment:**
- OpenCode version: 1.4.3
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

## #22329 — Deepseek reasoner and deepseek chat go in an infinite loop in Opencode

📅 `2026-04-13` | ✏️ **davidemarchisio** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22329](https://github.com/anomalyco/opencode/issues/22329)


### Description

I am using deepseek API and connected from opencode. 

The issue happens both with deepseek reasoning AND deepseek chat.
It happens in plan and build mode. 

**description**
* start a new session
* select deepseek chat (or reasoning) as model
* ask anything, for example: tell me what this project is about
* opencode starts immediately with compaction (even in a new sessions)
* the agent goes in an inifnite loop withotu giving any answers.  

### Plugins

@franlol/opencode-md-table-formatter@0.0.3

### OpenCode version

1.4.3

### Steps to reproduce

1. start a new session
2. select deepseek chat (or reasoning) as model
3. ask anything, for example: tell me what this project is about
4. opencode starts immediately with compaction (even in a new sessions)
5. the agent goes in an inifnite loop withotu giving any answers.  

### Screenshot and/or share link

https://opncd.ai/share/jNWoZG1I

### Session transcript

>  # Project overview inquiry
> 
> **Session ID:** ses_27844084fffezUbjMDjNWoZG1I
> **Created:** 4/13/2026, 6:45:36 PM
> **Updated:** 4/13/2026, 6:49:20 PM
> 
> ---
> 
> ## User
> 
> what is this project about?
> 
> ---
> 
> ## Assistant (Build · DeepSeek chat local · 4.0s)
> 
> ---
> 
> ## User
> 
> ---
> 
> ## Assistant (Compaction · DeepSeek chat local · 14.2s)
> 
> ---
> ## Goal
> 
> The user is asking for a summary of the project's purpose and the work completed so far, with the explicit goal of creating a detailed prompt for another AI agent to co

> *[Truncado — 23066 chars totais]*

---

## #22318 — fix: parseManagedPlist crashes with TypeError on non-object JSON

📅 `2026-04-13` | ✏️ **shafdev** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22318](https://github.com/anomalyco/opencode/issues/22318)


### Description

`Config.parseManagedPlist` calls `Object.keys()` on the result of `JSON.parse()` without checking the type first. If a malformed MDM profile produces `null`, the function throws a hard `TypeError` instead of returning an empty config. Arrays and primitives also cause unexpected behaviour.


### Plugins

None

### OpenCode version

1.4.3

### Steps to reproduce

1. `cd packages/opencode`
2. Run: `bun -e "const { Config } = await import('./src/config/config'); Config.parseManagedPlist('null', 'test')"`
3. Observe: `TypeError: null is not an object (evaluating 'Object.keys(raw)')`

### Screenshot and/or share link

N/A

### Operating System

macOS

### Terminal

zsh

---

## #22275 — bug: stale snapshot index.lock breaks Modified Files and undo for one workspace

📅 `2026-04-13` | ✏️ **FreeBardL** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22275](https://github.com/anomalyco/opencode/issues/22275)


### Description
In one specific workspace, OpenCode stopped showing `Modified Files`, and `revert undo messages and file changes` no longer worked correctly. Other workspaces on the same machine were fine.

I traced it to a stale lock file in OpenCode's local snapshot cache for that workspace. The OpenCode logs repeatedly showed snapshot failures like:

```text
fatal: Unable to create .../snapshot/<project-id>/<hash>/index.lock: File exists.
```

After removing the stale `index.lock` and then backing up/removing the workspace's snapshot cache under `~/.local/share/opencode/snapshot/<project-id>`, the problem immediately went away.

This makes the workspace get stuck in a bad state where snapshot tracking is broken persistently, which seems to break both `Modified Files` and undo/revert behavior.

### Plugins
None that seem relevant.

### OpenCode version
1.3.7

### Steps to reproduce
1. Use OpenCode in a git workspace until its local snapshot repo ends up with a stale `index.lock` under `~/.local/share/opencode/snapshot/<project-id>/.../index.lock`.
2. Open that workspace again.
3. Make a file change through OpenCode.
4. Observe that `Modified Files` may not show up for that workspace, and `revert undo messages and file changes` does not correctly revert file changes.
5. Check OpenCode logs and see repeated snapshot failures with `index.lock: File exists`.
6. Remove the stale lock / reset the workspace snapshot cache, then restart OpenCode.
7. Observe that the workspace start

> *[Truncado — 1757 chars totais]*

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

## #22252 — Task subagent hangs when reading empty/corrupted files or fetching PDFs

📅 `2026-04-13` | ✏️ **Will-D-AER** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22252](https://github.com/anomalyco/opencode/issues/22252)


## Problem

When a researcher subagent (dispatched via the Task tool) encounters an empty file, a corrupted PDF, or attempts to read a large binary file, the subagent hangs indefinitely rather than failing fast. This blocks the entire batch dispatch pipeline.

## Observed Behavior

During a batch research campaign dispatching 5 parallel researcher agents, one agent hung on the following sequence:

1. **Read tool on empty file** — the file existed but had 0 bytes. The agent received no content but didn't error. It then tried alternative approaches:
2. **WebFetch on arXiv PDF URL** — returned a corrupted/unreadable result
3. **Bash curl + pdftotext** — worked but the agent had already consumed significant time on the failed approaches
4. **Read tool on extracted text** — the agent continued but the overall task took far longer than necessary

The hanging agent blocked the batch — the orchestrator waited for all 5 agents to return before proceeding.

## Expected Behavior

- **Read tool** should return an error quickly (within 5s) if the file is empty or unreadable (binary/corrupted)
- **WebFetch** should have a configurable timeout (currently seems to hang on PDF/binary content)
- **Task tool** should support a `timeout` parameter so the orchestrator can set a maximum wall-clock time per subagent (e.g., 5 minutes for research tasks)
- If a subagent exceeds its timeout, it should return a partial result or error message rather than hanging

## Feature Request

1. **Add `timeout` 

> *[Truncado — 2255 chars totais]*

---

## #22243 — opencode run produces no stdout output while running

📅 `2026-04-13` | ✏️ **Git-on-my-level** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22243](https://github.com/anomalyco/opencode/issues/22243)


## Bug

`opencode run '<prompt>'` buffers all output until completion with no progress indication. If the underlying operation is slow (API latency, cache warming, retries) or fails silently (bad auth), the process sits at 0% CPU indefinitely with zero stdout/stderr output. There's no way to distinguish "working but slow" from "stuck" or "failed" without inspecting the process or the SQLite DB.

## Steps to reproduce

1. Run `opencode run` with a prompt that requires multiple tool calls:
   ```bash
   opencode run 'Read all files in .codex-autorunner/tickets/ and implement the changes described in TICKET-001.md'
   ```
2. Observe: stdout is completely empty for the entire duration. No progress, no tool call indicators, nothing.

## Expected behavior

Some form of progress output while running, e.g.:
- Print each tool call as it happens (like the TUI does)
- Print a spinner or status indicator
- At minimum, print error output immediately when auth fails or API errors occur

## Actual behavior

- Zero output on stdout/stderr for the entire run duration
- Silent auth failure: `opencode run --model openrouter/anthropic/claude-sonnet-4 'test'` with no OpenRouter credentials produces no error, no output, and the process just hangs at 0% CPU indefinitely
- No session created in `~/.local/share/opencode/opencode.db` for failed runs, making post-mortem diagnosis harder
- Successful runs do buffer and eventually print, but for a multi-minute run this appears completely broken

## Envir

> *[Truncado — 2847 chars totais]*

---

## #22220 — 507 backend errors cause cryptic tool schema validation failures instead of clear error message

📅 `2026-04-12` | ✏️ **fishloa** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22220](https://github.com/anomalyco/opencode/issues/22220)


## Description

When the LLM backend returns a **507 (Insufficient Storage / Out of Memory)** error, opencode does not surface this to the user. Instead, the error silently corrupts the tool dispatch pipeline, resulting in a confusing schema validation error:

```
~ Delegating...
The task tool was called with invalid arguments: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": ["description"],
    "message": "Invalid input: expected string, received undefined"
  }
]
```

This gives the user zero indication of what actually went wrong.

## Steps to Reproduce

1. Configure opencode with an OpenAI-compatible local backend (e.g., omlx on Apple Silicon)
2. Pin enough models in memory that the server is near capacity
3. Request a model that requires evicting a pinned model (impossible)
4. Backend returns `507: Cannot free enough memory`
5. opencode shows the schema validation error above instead of the real error

## Expected Behavior

opencode should catch non-200 responses from the backend and display a clear error, e.g.:

```
Error: Model "gemma-4-31b-it-8bit" unavailable — backend returned 507: 
Cannot free enough memory. Need 33.02GB, current usage 73.91GB, all loaded models are pinned.
```

## Actual Behavior

The 507 response is not handled. The malformed/empty response is passed into the tool dispatch pipeline, which then fails on schema validation with an unrelated error about `description` being `undefined`.

## Environment

- opencode 1.4.0 (homebre

> *[Truncado — 1623 chars totais]*

---

## #22198 — Memory leak: SSE connections stuck in CLOSE_WAIT cause unbounded AsyncQueue growth (~14 MB/sec)

📅 `2026-04-12` | ✏️ **AlexZander85** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/22198](https://github.com/anomalyco/opencode/issues/22198)


### Description

`opencode-cli.exe` memory consumption grows up to 24.5 GB over time. The root cause is SSE connections that get stuck in TCP CLOSE_WAIT state — the server never detects client disconnection, so cleanup never runs and unbounded `AsyncQueue` buffers grow indefinitely.

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

## #22163 — Crash on startup when well-known credential endpoint is temporarily unavailable

📅 `2026-04-12` | ✏️ **felixscherz** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22163](https://github.com/anomalyco/opencode/issues/22163)


### Description

When a `wellknown` credential is configured but the associated endpoint (`<url>/.well-known/opencode`) is unavailable, opencode will fail to start with the following message:
```shell
$ opencode
{
  "name": "UnknownError",
  "data": {
    "message": "Error: Unable to connect. Is the computer able to access the url?"
  }
}
```

This was already reported in #10930 but closed due to inactivity, the issue still persists. A fix was attempted in #14522 but the PR is yet to be merged.

A similar thing happens when the JSON is malformed, then opencode also won't start, reporting:
```shell
$ opencode
{
  "name": "UnknownError",
  "data": {
    "message": "SyntaxError: Failed to parse JSON"
  }
}
```

In any case, I believe opencode should handle both of these cases gracefully, either ignoring unavailable/malformed endpoints or falling back to cached values.

### Plugins

_No response_

### OpenCode version

1.4.3

### Steps to reproduce

1. Configure a local HTTP server that serves a minimal JSON payload, e.g. on `http://127.0.0.1:8001/.well-known/opencode`
```json
{
  "auth": {
    "command": ["echo", "no-token"],
    "env": "DUMMY_ENV"
  },
  "config": {}
}
```
2. login with `opencode auth login http://127.0.0.1:8001/.well-known/opencode`
3. terminate the HTTP server
4. run `opencode` and observe the failure to start

### Screenshot and/or share link

_No response_

### Operating System

macOS 15.7.3

### Terminal

kitty

---

## #22131 — [BUG] Agent label renders incorrectly with OMO: 'Deep agent' becomes 'Deep ent'

📅 `2026-04-12` | ✏️ **liupengTk421** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/22131](https://github.com/anomalyco/opencode/issues/22131)


### Description

When OMO / oh-my-openagent is installed, the agent badge text in the OpenCode TUI can render incorrectly.

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

### Why this seems to be an OpenCode-side bug trigger

There are already two nearby classes of issues:

- OpenCode truncation/layout issues for long agent names:
  - #17755
  - #13529
- OMO / oh-my-openagent zero-width-space leakage into display names:
  - code-yeongyu/oh-my-openagent#3208
  - code-yeongyu/oh-my-openagent#3150

The current bug seems to happen when those two conditions meet:

1. agent names reaching OpenCode are polluted with `U+200B` prefixes
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

### OpenCode version

1.4.3
Bun:  1.3.12

### Steps to reproduce

1. open opencode in CLI
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

`opencode` v1.4.3 entered a pathological memory growth state, triggered a **global OOM**, and then terminated with **SIGILL**.

The SIGILL was **not** caused by an unsupported CPU instruction. The crashing instruction is an explicit **`ud2` trap**, which indicates an intentional fatal abort path.

I investigated the core dump and a loaded temporary shared module, and the strongest evidence points to a Zig-based renderer/runtime path involving:

- `renderer.CliRenderer.setTerminalTitle`
- Zig stdlib writer paths (`Io.Writer.writeAll`, `FixedBufferStream.write`, etc.)
- `OutOfMemory`
- recursive panic / panic-reporting failure

The strongest current hypothesis is:

> `opencode` hit an edge case that caused runaway memory growth, likely in renderer/text-buffer/grapheme/virtual-chunk

> *[Truncado — 9528 chars totais]*

---

## #22072 — opencode export returns "Session not found" for sessions with large part data (>1GB)

📅 `2026-04-11` | ✏️ **jonnxpr** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22072](https://github.com/anomalyco/opencode/issues/22072)


### Description

The opencode export command fails with Error: Session not found: <session_id> for sessions whose part table data exceeds approximately 1GB, even though the sessions exist in the database and appear normally in opencode session list.
The error message is misleading — the session IS found during listing, but the export process crashes during JSON serialization of the session data, and the crash is caught and surfaced as a "not found" error.

Environment
- OpenCode version: 1.4.3
- OS: Windows 11 (10.0.26100), x64
- Node.js: v24.14.1
- System RAM: 32GB
- Database size: 9.36GB (~/.local/share/opencode/opencode.db)
- Total parts in DB: 152,977 entries, ~3.15GB of part data

<img width="1342" height="437" alt="Image" src="https://github.com/user-attachments/assets/d27a20d6-2d75-4181-bcda-48ca84016ccc" />

The threshold appears to be around 1GB of serialized part data. Sessions below this threshold export successfully.
Root Cause Analysis
I investigated the SQLite database directly using better-sqlite3:
1. Sessions exist in the database — all failing session IDs are present in the session table with complete metadata (id, title, slug, timestamps, etc.)
2. Messages and parts exist — the message and part tables contain all expected records with valid JSON data
3. Database integrity is fine — PRAGMA integrity_check returns ok
4. No archiving or soft-delete — time_archived is NULL for all sessions
The export command is likely hitting a Node.js heap memory limit when it 

> *[Truncado — 2308 chars totais]*

---

## #22061 — Disabled project-local custom tools can crash startup when .opencode deps are missing

📅 `2026-04-11` | ✏️ **Astro-Han** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22061](https://github.com/anomalyco/opencode/issues/22061)


## Description

OpenCode crashes during startup in a project that contains a repo-local custom tool under `.opencode/tool`, even when that tool is disabled in `.opencode/opencode.jsonc`.

In this repo, `.opencode/tool/github-pr-search.ts` imports `@opencode-ai/plugin`, and the local config sets:

```jsonc
"tools": {
  "github-pr-search": false
}
```

Even so, OpenCode still imports the tool module before the disable flag is applied, and startup fails with:

```text
error: Cannot find module '@opencode-ai/plugin' from '/Users/yuhan/workspace/oss/opencode/.opencode/tool/github-pr-search.ts'
```

The local `.opencode/package.json` exists and declares `@opencode-ai/plugin`, but `.opencode/node_modules` is missing. From reading the source, the config dependency install path also appears to swallow install failures, which can leave the config directory partially prepared and later surface as this import error.

## Plugins

None. This is using repo-local custom tools under `.opencode/tool`, not external plugins.

## OpenCode version

1.4.3

## Steps to reproduce

1. Open a repo that contains a custom tool file under `.opencode/tool/*.ts`.
2. Have that tool import `@opencode-ai/plugin` at the top level.
3. Ensure `.opencode/package.json` exists but `.opencode/node_modules` is missing, or dependency installation does not complete.
4. Disable the tool in `.opencode/opencode.jsonc` with `"github-pr-search": false`.
5. Start OpenCode in that repo.

## Screenshot and/or share link

Screen

> *[Truncado — 1739 chars totais]*

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
2. Run `opencode` (or `bun run dev` from source)
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
- opencode 1.4.3

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

### OpenCode version

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

## #21924 — [HIGH PRIORITY] AI reads files outside permitted directory

📅 `2026-04-10` | ✏️ **mikegasche** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21924](https://github.com/anomalyco/opencode/issues/21924)


## Description

The AI assistant read files from a directory that was NOT the permitted workspace directory. The user explicitly restricted the AI to only access files within a specific project directory and files explicitly shared by the user.

Despite these restrictions, the AI accessed files from an unauthorized directory (/Users/Mike/Development/Python/autumo-psai/).

## Steps to Reproduce

1. Set workspace root to a specific directory
2. Explicitly tell the AI to only access files within that directory
3. Ask AI to read/analyze code that is NOT in the permitted directory
4. Observe that AI reads the file anyway without asking for permission

## Expected Behavior

The AI assistant must:
- Only read files within the explicitly permitted workspace directory
- Always ask for permission before accessing any file
- Never assume access is granted

## Actual Behavior

AI accessed files outside the permitted directory without explicit consent.

## Verification

- [ ] This bug is reproducible
- [ ] This bug is not related to a configuration error on my part
- [ ] I have verified that the file was accessed from an unauthorized directory

## Severity

HIGH - Privacy/security concern as code was processed without consent.

---

## #21908 — Valid PDF tool results can be forwarded to models without PDF input support

📅 `2026-04-10` | ✏️ **50sotero** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21908](https://github.com/anomalyco/opencode/issues/21908)


### Description
A valid PDF can be attached by `read.ts`, then forwarded back into model context from `MessageV2.toModelMessagesEffect()` even when the selected model does not support `input.pdf`. In the failing session, that led to a bogus `The file you uploaded is badly formatted or corrupted` verdict on a healthy PDF.

Important context: this session was running with the **Oh My OpenAgent plugin** enabled. The repeated `OH-MY-OPENCODE - TODO CONTINUATION` / continuation-style spam should therefore be treated as **plugin-influenced behavior**, not as a pure OpenCode core symptom by itself. The core issue I am reporting here is the incorrect PDF handling path, not the plugin-layer session spam.

The same file later read successfully and hashes as a healthy PDF:
- path: `debug/cv-print-test.pdf`
- header: `%PDF-1.4`
- sha256: `5ba26ba22bca394c29ab50d8ac1ba4097332a1100d76d9b1e2aae4195cc6216b`

Current upstream `packages/opencode/src/tool/read.ts` does not parse PDFs into text; it returns `PDF read successfully` plus a PDF attachment. The risky step is later, when `packages/opencode/src/session/message-v2.ts` forwards completed tool-result attachments without checking `model.capabilities.input.pdf`.

### Plugins
Oh My OpenAgent plugin enabled

### OpenCode version
`dev` branch (observed against local clone `bf601628db3c187478ff853fe33b91cec652355e`)

### Steps to reproduce
1. Start a session with a model that does not support PDF input.
2. Run the `read` tool on a valid PDF so 

> *[Truncado — 2208 chars totais]*

---

## #21862 — windows desktop cannot see samba's path session

📅 `2026-04-10` | ✏️ **MagiciSource** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21862](https://github.com/anomalyco/opencode/issues/21862)


### Description

Since version 1.3.x, on the Windows desktop version, after opening a Samba mapped drive path, the left sidebar becomes blank. It should display the session list and other information, but nothing shows up; the entire sidebar is empty. Also, opencode web cannot open the working folder under the Samba mapped path.

### Plugins

no

### OpenCode version

1.4.2

### Steps to reproduce

1. Map a Samba drive
2. open opencode desktop
3. Click the plus sign and select a folder path under the previously mapped Samba drive (e.g., Z drive).
4. At this point, the sidebar will become blank

### Screenshot and/or share link

_No response_

### Operating System

windows 10

### Terminal

desktop

---

## #21850 — Bug Model enters infinite loop due to hallucinated oldString in edit tool calls

📅 `2026-04-10` | ✏️ **stevensli** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21850](https://github.com/anomalyco/opencode/issues/21850)


### Description

While using the edit tool to fix a simple syntax error in a Rust file, the model (gemma4-31b) entered a repetitive failure loop. 
Steps to Reproduce:
1. The model calls read to get the content of a file.
2. The read tool returns the actual content (e.g., if guess << secret secret_number {).
3. The model attempts to call edit, but instead of using the string returned by read, it hallucinates a different string for oldString (e.g., if guess <<< secret secret secret_number {).
4. The edit tool correctly returns an error: "Could not find oldString in the file."
5. The model ignores this error and repeats the exact same incorrect edit call multiple times (10+ times) without updating the oldString to match the actual file content.
Expected Behavior:
The model should prioritize the output of the read tool and, upon receiving a "not found" error from the edit tool, it should re-examine the file content and correct the oldString parameter.
Actual Behavior:
The model ignores the tool's error message and persists in using a hallucinated string, resulting in an infinite loop of failed tool calls.
Environment:
- Model: gemma4-31b (local-vllm/gemma4-31b)
- Tool: edit

### Plugins

_No response_

### OpenCode version

1.3.14, 1.3.17, 1.4.0, 1.4.3

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21849 — Self-hosted web can hang on startup and crash on missing session path data

📅 `2026-04-10` | ✏️ **Leuconoe** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21849](https://github.com/anomalyco/opencode/issues/21849)


### Description
When I run the self-hosted web UI against a local OpenCode server, the page can stay on the loading screen indefinitely. I also hit crashes in the session/workspace UI when some session path or diff file values are missing.

### Plugins
None

### OpenCode version
- source-built dev binary during investigation: `0.0.0-dev-202604100729`
- also reproduced against the packaged Windows install before switching to a source build for debugging

### Steps to reproduce
1. Start a local OpenCode server and open the self-hosted web UI in the browser.
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

## #21738 — Custom @ai-sdk/google provider loads correctly but drops API key at runtime when using custom baseURL

📅 `2026-04-09` | ✏️ **tpwcnls** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21738](https://github.com/anomalyco/opencode/issues/21738)


﻿# Bug: Custom `@ai-sdk/google` provider loads correctly but drops API key at runtime when using custom `baseURL`

## Summary

On `OpenCode 1.4.2` on Windows, a custom Gemini native provider can be discovered correctly from `opencode.json`, and its model can be selected successfully.

However, when the model is actually executed, the runtime request fails with:

```text
401 invalid_request_error: You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth
```

In the same environment, with the same API key, the same project, and the same Gemini model, switching only the provider implementation to `@ai-sdk/openai-compatible` succeeds immediately and returns `OK`.

This strongly suggests a runtime auth propagation issue in OpenCode's handling of custom native Google/Gemini providers, rather than a config parsing issue.

## Environment

- OpenCode: `1.4.2`
- OS: `Windows`
- Entry point: `opencode-cli.exe run --print-logs`
- Proxy service: `ofox.ai`

## Minimal Reproduction Config

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ofox-google-native": {
      "npm": "@ai-sdk/google",
      "name": "Ofox Google Native",
      "options": {
        "baseURL": "https://api.ofox.ai/gemini",
        "apiKey": "{file:C:/Users/Roger/.config/opencode/.secrets/ofox-api-key}"
      },
      "models": {
        "gemini-3.1-flash-lite-preview": {
          "name": "Gemini 3.1 Flash Lite"
        }
      }
    },
   

> *[Truncado — 5770 chars totais]*

---

## #21737 — Custom @ai-sdk/anthropic provider loads correctly but drops API key at runtime when using custom baseURL

📅 `2026-04-09` | ✏️ **tpwcnls** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21737](https://github.com/anomalyco/opencode/issues/21737)


# Bug: Custom `@ai-sdk/anthropic` provider loads correctly but drops API key at runtime when using custom `baseURL`

## Summary

On `OpenCode 1.4.2` on Windows, a custom Anthropic native provider can be discovered correctly from `opencode.json`, and its model can be selected successfully.

However, when the model is actually executed, the runtime request fails with:

```text
401 invalid_request_error: You didn't provide an API key. You need to provide your API key in an Authorization header using Bearer auth
```

In the same environment, with the same API key, the same project, and the same Claude model, switching only the provider implementation to `@ai-sdk/openai-compatible` succeeds immediately and returns `OK`.

This strongly suggests a runtime auth propagation issue in OpenCode's handling of custom native Anthropic providers, rather than a config parsing issue.

## Environment

- OpenCode: `1.4.2`
- OS: `Windows`
- Entry point: `opencode-cli.exe run --print-logs`
- Proxy service: `ofox.ai`

## Minimal Reproduction Config

File:

- `F:\Project\AIBuilder\OpenCodeTest\opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ofox-anthropic-native": {
      "npm": "@ai-sdk/anthropic",
      "name": "Ofox Anthropic Native",
      "options": {
        "baseURL": "https://api.ofox.ai/anthropic",
        "apiKey": "{file:C:/Users/Roger/.config/opencode/.secrets/ofox-api-key}"
      },
      "models": {
        "claude-haiku-4.5": {
          

> *[Truncado — 5660 chars totais]*

---

## #21702 — MCP OAuth: opencode mcp auth doesn't refresh token in active sessions

📅 `2026-04-09` | ✏️ **duke8253** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21702](https://github.com/anomalyco/opencode/issues/21702)


### Description

After re-authenticating an OAuth MCP server with opencode mcp auth <server>, the new token is written to disk but the running MCP connection still uses the stale one.

opencode mcp debug <server> confirms: shows `authenticated` with a valid token and future expiry, but the HTTP connection test returns `401 Unauthorized`. The only workaround is restarting opencode entirely.

Expected: `opencode mcp auth` should refresh the active MCP connection with the new token, or there should be an `opencode mcp reconnect` command to re-establish the connection.

### Plugins

none

### OpenCode version

1.4.1

### Steps to reproduce

1. Connect to an OAuth-enabled MCP server (Streamable HTTP transport)
2. Wait for the token to expire or be invalidated server-side
3. Run `opencode mcp auth <server>` — completes successfully
4. MCP calls still fail with auth errors
5. `opencode mcp debug <server>` shows valid token but 401 on test

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

After several messages in a session (or when resuming any session that previously hit this error), OpenCode displays:

```
[Error: Connect error internal: Blob not found: 10,82,10,80,10,40,71,101,110,101,114,97,116,101,3...]
```

The error is **unrecoverable** for the affected session — retrying or resuming causes it to cascade, with each attempt embedding the previous error into the Connect-RPC request payload, growing the serialized protobuf body exponentially until the session is permanently wedged.

This affects **all projects**, not a specific one. I have 5 broken sessions across 4 different project contexts (including `global`).

## Root cause analysis

The comma-separated numbers in the error are **raw protobuf bytes** — they decode to the conversation history (user messages + assistant responses + message UUIDs). For example, `71,101,110,101,114,97,116,101` decodes to ASCII `"Generate"`.

The string `"Blob not found"` is **not in OpenCode's TypeScript source** — it originates from **Bun's runtime** (`ObjectURLRegistry.zig`), which manages `blob:` URL references. The `ObjectURLRegistry` maps UUIDs to JavaScript `Blob` objects; when a lookup fails (e.g. the Blob was garbage-collected or revoked), it returns `null`, which surfaces as this error.

**The failure chain:**

1. OpenCode's internal Connect-RPC server serializes conversation messages as protobuf for the TUI ↔ backend communication.
2. The request body passes through Bun's HTTP/fetch stack, wh

> *[Truncado — 4043 chars totais]*

---

## #21645 — opentui: fatal: Object.entries requires that input parameter not be null or undefined

📅 `2026-04-09` | ✏️ **jsevillanoStratio** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21645](https://github.com/anomalyco/opencode/issues/21645)


### Description

I have started 2 project and in both I have the same problem
After a while opencode project get corrupted somehow and I no longer can start opencode in that project, though it works normally in other folders


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

### OpenCode version

1.3.17

### Steps to reproduce

_No response_

### Screenshot and/or share link

simply running opencode in a project (that has become corrupted somehow)

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

### OpenCode version
0.0.0--202604082020 (reproduced on built local binary)

### Steps to reproduce
1. Build the local binary and run `opencode serve`.
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

When AI attempts to perform batch rename operations (renaming multiple files/folders), OpenCode Server (opencode-cli) crashes silently without showing an error dialog. The server process disappears while the TUI remains open but becomes unresponsive.

This issue occurs specifically when working in directories with Chinese characters (e.g., D:\肥牛的文件夹).

The error appears related to the set_permissions endpoint, as seen in previous attempts:
error sending request for url(http://127.0.0.1:7246//sp?directory=...)

The double slash in the URL path (//sp instead of /sp) suggests a URL construction bug when handling non-ASCII directory paths.

### Plugins

shell-strategy (https://github.com/JRedeker/opencode-shell-strategy) context7-mcp

### OpenCode version

1.3.16

### Steps to reproduce

1. Open OpenCode Desktop on Windows 11
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

## #21472 — @npmcli/arborist in Bun runtime fails to resolve proxy env vars: proxy.url must be a non-empty string

📅 `2026-04-08` | ✏️ **listen0406** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21472](https://github.com/anomalyco/opencode/issues/21472)


### Description

Starting from opencode 1.4.0, the plugin installer was switched from spawning bun add as a subprocess to using @npmcli/arborist directly inside the Bun runtime. When proxy environment variables (HTTP_PROXY/HTTPS_PROXY) are set, Arborist.reify() triggers an internal fetch that crashes with:
TypeError: proxy.url must be a non-empty string
This makes all remote npm plugins fail to install on startup. The issue does not occur when:
- Running bun add or npm install as a standalone subprocess (they correctly read proxy env vars)
- No proxy env vars are set
The proxy environment is valid and functional — curl -x http://127.0.0.1:7897 https://registry.npmjs.org/ returns 200 OK. The issue is specific to Arborist running inside Bun's fetch implementation, which fails to parse the proxy variables correctly.
Root Cause Analysis
In packages/opencode/src/npm/index.ts, Npm.add() creates an Arborist instance and calls reify(), which internally uses fetch() to download packages from the npm registry. Bun's fetch() has a known issue with proxy environment variable handling — it reads the variables but fails to construct a valid proxy URL internally, resulting in the "non-empty string" error.
Regression
This is a regression from opencode 1.3.x which used service=bun (bun add subprocess) for plugin installation. The subprocess correctly inherited and used proxy env vars.

### Plugins

- oh-my-openagent@latest (v3.15.3, 16 dependencies) - opencode-antigravity-auth@latest (v1.6.0)

> *[Truncado — 2410 chars totais]*

---

## #21469 — [BUG]: Integrated terminal is completely unresponsive (blank screen, no input)

📅 `2026-04-08` | ✏️ **dadadedahuamao** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21469](https://github.com/anomalyco/opencode/issues/21469)


﻿### Description

The integrated terminal in OpenCode is completely unresponsive - it displays a blank white screen and cannot receive any keyboard input. The terminal tab shows (e.g., 'Terminal 1'), but the content area remains empty and typing does nothing.

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

### OpenCode version

Latest version (as of April 2026)

### Steps to reproduce

1. Open OpenCode application
2. Click the terminal panel toggle (or press shortcut) to open integrated terminal
3. Click '+' to create new terminal
4. Attempt to type any command

**Result:** Terminal shows blank screen, no input accepted

### Screenshot and/or share link

Screenshot attached showing blank terminal with no shell prompt or output.

### Operating System

Windows 11

### Terminal

OpenCode integrated terminal (built-in)

---

**Additional context:**
- Restarting OpenCode does not resolve the issue
- Closing and reopening terminal tabs does not help
- PowerShell 5.1 and CMD both fail to load in the terminal
- This appears to be a terminal rendering layer bug in the OpenCode client

---

## #21463 — 1.4.0 standalone CLI in ~/.opencode/bin is killed on macOS 26.4 with Taskgated Invalid Signature

📅 `2026-04-08` | ✏️ **silentbalanceyh** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21463](https://github.com/anomalyco/opencode/issues/21463)


### Description

After updating OpenCode to 1.4.0 on April 8, 2026, running `opencode` from the terminal immediately exits with `killed` on macOS 26.4.

On this machine, the standalone CLI binary installed at `~/.opencode/bin/opencode` is terminated by macOS during process launch. System logs and the crash report show this as a code-signing failure, not an application-level crash.

Relevant diagnostics:

- Terminal output: `[1] 62905 killed opencode`
- Exit code: `137`
- macOS log: `load code signature error 2 for file "opencode"`
- Crash report: `SIGKILL (Code Signature Invalid)` / `Taskgated Invalid Signature`

Important detail: the app-bundled binary at `/Applications/OpenCode.app/Contents/MacOS/opencode-cli` works normally and reports version `1.4.0`, but the standalone CLI path `~/.opencode/bin/opencode` is killed by the OS.

I also verified that the two binaries are byte-identical with `cmp`, but only the copy launched from `~/.opencode/bin/opencode` is rejected. Replacing the file with another copied file did not help. The only working workaround so far is to replace `~/.opencode/bin/opencode` with a symlink to `/Applications/OpenCode.app/Contents/MacOS/opencode-cli`.

This looks like a packaging / installation / signing compatibility issue affecting the standalone CLI path on macOS 26.4.

### Plugins

`@opencode-ai/plugin` requested as `1.4.0`, installed package observed locally as `1.3.17 invalid: "1.4.0" from the root project`

### OpenCode version

`1.4.0`

### Ste

> *[Truncado — 2106 chars totais]*

---

## #21449 — opentui: fatal: Object.entries requires that input parameter not be null or undefined

📅 `2026-04-08` | ✏️ **telantan** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21449](https://github.com/anomalyco/opencode/issues/21449)


### Description

```
TypeError: Object.entries requires that input parameter not be null or undefined
    at entries (unknown)
    at mcp (B:/~BUN/root/src/index.js:575862:28)
    at runComputation (B:/~BUN/root/src/index.js:549134:24)
    at updateComputation (B:/~BUN/root/src/index.js:549117:17)
    at runTop (B:/~BUN/root/src/index.js:549242:24)
    at runQueue (B:/~BUN/root/src/index.js:549331:11)
    at completeUpdates (B:/~BUN/root/src/index.js:549278:15)
    at runUpdates (B:/~BUN/root/src/index.js:549264:20)
    at setStore (B:/~BUN/root/src/index.js:553944:10)
    at processTicksAndRejections (native:7:39)...
```

### Plugins

_No response_

### OpenCode version

1.4.0

### Steps to reproduce

_No response_

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---

## #21443 — Multi-pane/window setup Fails  (1.4.0 - SqliteError)

📅 `2026-04-08` | ✏️ **starzar** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/21443](https://github.com/anomalyco/opencode/issues/21443)


### Description

The first OpenCode launch actually succeeds,but opening a new pane/window(shft+alt++) in Windows10-Ubuntu-Wsl-WindowsTerminal results in SqliteError-

(Note -Linux Bash is too slow and is not usable )

SqliteError-

```
PS Microsoft.PowerShell.Core\FileSystem::\\wsl.localhost\Ubuntu-24.04> wsl
ubuntu_0@DESKTOP-123:~$ opencode
Error: Unexpected error, check log file at /home/ubuntu_0/.local/share/opencode/log/2026-04-08T040527.log for more details

Failed to run the query 'PRAGMA journal_mode = WAL'
```

---> Inorder to resolve this issue - **"Cleared Sqlite.db and log files in  \\wsl.localhost\Ubuntu-24.04\home\ubuntu_0\.local\share"**,
but the error still persists.

---------------------------------|||  Analysis |||----------------------------------

--->For analysis,attached opencode directory.zip after a new attempt at multi-pane/window execution.


```
The first OpenCode launch actually succeeds:

service=db path=/home/ubuntu_0/.local/share/opencode/opencode.db opening database
service=db count=10 mode=bundled applying migrations

It fully opens the DB and even starts TUI plugins.


A few seconds later second log starts:

2026-04-08T03:53:59 creating instance

and then stops abruptly.

That strongly indicates the second pane is trying to open the same SQLite WAL database while the first OpenCode session is still active.

OpenCode 1.4.0 currently does not reliably support multiple concurrent instances sharing the same DB path.

So the second pane crashes d

> *[Truncado — 2065 chars totais]*

---

## #21430 — 1.4.0 memory leak. Bun occupies more than 3g memory at most.

📅 `2026-04-08` | ✏️ **nUser0** | 💬 5 | 🔗 [https://github.com/anomalyco/opencode/issues/21430](https://github.com/anomalyco/opencode/issues/21430)


### Description

opencode-cli.exe web --hostname 192.168.1.25 --port 4095

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


### OpenCode Version

1.3.0

### Platform

Windows (Bun runtime)

### Bug Description

OpenCode TUI crashes with a fatal TypeError when `local.agent.current()` returns `undefined` during a SolidJS reactive update cycle.

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

## #21375 — opencode serve stops polling listener epoll fd; all connections hang until restart

📅 `2026-04-07` | ✏️ **dylangarcia** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/21375](https://github.com/anomalyco/opencode/issues/21375)


### Description

`opencode serve` can get into a state where the process is still alive and listening on `127.0.0.1:4096`, but it no longer responds to any HTTP request, including `/global/health`.

Restarting the `opencode serve` process immediately fixes it.

This does not look like a slow route, project bootstrap, MCP, LSP, or plugin initialization issue because `/global/health` also hangs and receives 0 bytes. The socket/runtime state suggests the listener remains open and registered in epoll, but the thread that normally polls the listener epoll fd stops doing so.

### OpenCode version

```text
1.3.17
```

### Command

```bash
opencode serve --hostname=127.0.0.1 --port=4096 --log-level=DEBUG
```

### Steps to reproduce

I do not have a deterministic reproduction yet. I observed this on a long-running `opencode serve` process inside a Linux sandbox/container while using the server from a local client.

When wedged, this request connects but times out with 0 bytes:

```bash
curl -sv --http1.1 --no-keepalive --max-time 5 http://127.0.0.1:4096/global/health
```

Output:

```text
*   Trying 127.0.0.1:4096...
* Connected to 127.0.0.1 (127.0.0.1) port 4096
> GET /global/health HTTP/1.1
> Host: 127.0.0.1:4096
> User-Agent: curl/8.5.0
> Accept: */*
>
* Operation timed out after 5002 milliseconds with 0 bytes received
* Closing connection
```

### Expected behavior

`/global/health` should return quickly:

```json
{"healthy":true,"version":"1.3.17"}
```

### Actual behavior

The T

> *[Truncado — 7108 chars totais]*

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

### OpenCode version

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

When OpenCode crashes or exits unexpectedly on Windows (PowerShell), the terminal is left in a broken state showing raw ANSI escape sequences as literal text at the bottom of the screen, e.g.:

```
555;59;86m
```

The terminal cursor may also be hidden, requiring the user to close and reopen PowerShell to recover.

## Environment

- OS: Windows 10
- Terminal: PowerShell 5.1
- OpenCode version: 1.3.17
- Install method: npm (`npm install -g opencode-ai`)

## Expected behavior

On crash or unexpected exit, OpenCode should reset the terminal state (`\x1b[0m`, `\x1b[?25h`) before exiting, similar to how other TUI apps (e.g., vim, btop) handle SIGINT/panic cleanup.

## Workaround

Wrapping the npm launcher (`opencode.ps1`) in a PowerShell `try/finally` block that runs `[Console]::ResetColor()` and `Write-Host -NoNewline "$([char]27)[0m$([char]27)[?25h"` mitigates the visible symptom but does not fix the root cause.

## Suggested fix

In the crash/exit handler of the binary, add terminal reset before process exit:
- Send `\x1b[0m` (reset all attributes)
- Send `\x1b[?25h` (show cursor)
- Call the platform terminal restore function if using a TUI library

---
