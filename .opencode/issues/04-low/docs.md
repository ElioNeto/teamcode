# 📖 Documentação

> **Total:** 5 | Extraído em 2026-05-17

---

## #27707 — docs: experimental flags table in CLI reference is out of sync with runtime-flags.ts

📅 `2026-05-15` | ✏️ **gzb1128** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/27707](https://github.com/anomalyco/opencode/issues/27707)


### Description

The CLI reference's Experimental environment variables table is missing `OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS` even though the flag exists in `packages/opencode/src/effect/runtime-flags.ts` and is required for the background subagents feature added in #27084.

The docs table is manually maintained across localized `packages/web/src/content/docs/*/cli.mdx` files, so it can drift from the runtime flags in code.

Related PR: #27708

### Plugins

N/A

### OpenCode version

Current `dev`

### Steps to reproduce

1. Open `packages/opencode/src/effect/runtime-flags.ts`.
2. Confirm `OPENCODE_EXPERIMENTAL_BACKGROUND_SUBAGENTS` is defined.
3. Open `packages/web/src/content/docs/cli.mdx` or localized `cli.mdx` docs.
4. Confirm the Experimental environment variables table does not list the flag.

### Screenshot and/or share link

N/A

### Operating System

N/A

### Terminal

N/A

---

## #27642 — docs: zht locale community link routes to Feishu, which excludes most Traditional Chinese readers

📅 `2026-05-15` | ✏️ **TsurumaruTsuyoshi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27642](https://github.com/anomalyco/opencode/issues/27642)


### Description

After #16908, the footer community link and `README.zht.md` for the Traditional Chinese (`zht`) locale point to a Feishu group instead of the Discord community used by every other locale.
The Traditional Chinese audience is primarily located in Hong Kong, Taiwan, Macau, and overseas Chinese-speaking communities, where Feishu has very little adoption.

### Why

A few practical barriers for the `zht` audience joining via Feishu:
- Feishu signup requires a phone number, and the flow is heavily oriented toward mainland Chinese numbers.
- Feishu's primary service is operated out of mainland China, which is a non-trivial consideration for users in jurisdictions with different data-handling expectations.
- The `applink.feishu.cn/.../add_by_link` URL requires a logged-in Feishu client to actually join the group; visitors without an account hit a dead end.
The net effect is that the official community entry point for Traditional Chinese readers leads to a destination most of them cannot realistically use.

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

## #25687 — docs(es): providers.mdx is out of sync with the English version

📅 `2026-05-04` | ✏️ **aperez0x** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25687](https://github.com/anomalyco/opencode/issues/25687)


### Description

The Spanish providers page (`packages/web/src/content/docs/es/providers.mdx`) is outdated compared to the English version.

I found at least these inconsistencies:
- Anthropic still mentions Claude Pro/Max OAuth login, but the English docs say only API key auth is supported now.
- GitLab Duo is missing newer sections and warnings present in English.
- OpenCode Zen has an outdated link / flow in Spanish.
- Cloudflare AI Gateway steps do not match the current interactive flow.
- Amazon Bedrock formatting/content is not fully aligned with the English page.

This can confuse Spanish-speaking users because the auth/setup steps no longer match the current behavior.

Affected file:
- `packages/web/src/content/docs/es/providers.mdx`
- https://github.com/anomalyco/opencode/blob/dev/packages/web/src/content/docs/es/providers.mdx

Reference:
- `packages/web/src/content/docs/providers.mdx`
- https://github.com/anomalyco/opencode/blob/dev/packages/web/src/content/docs/providers.mdx

### Plugins

None

### OpenCode version

Current docs site / dev branch

### Steps to reproduce

1. Open the English providers page and the Spanish providers page.
2. Compare the same provider sections, especially Anthropic, GitLab Duo, OpenCode Zen, Cloudflare AI Gateway, and Amazon Bedrock.
3. Notice that the Spanish page contains outdated or missing information compared to English.

### Screenshot and/or share link

_No response_

### Operating System

Windows

### Terminal

Warp

---

## #21678 — docs(opencode): fix typo in README

📅 `2026-04-09` | ✏️ **ghost** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21678](https://github.com/anomalyco/opencode/issues/21678)


### Description

Minor typo in README - capitalize Neovim (simple fix in order to learn anomalyco/opencode process)

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

## #21409 — docs: plugins page is outdated for TUI plugins, jsonc configs, and install behavior

📅 `2026-04-08` | ✏️ **timrichardson** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21409](https://github.com/anomalyco/opencode/issues/21409)


### Description

The `/docs/plugins` page is out of date relative to the current plugin implementation.

A few parts of the page are currently incorrect or incomplete:

- it does not clearly distinguish server plugins from TUI plugins
- it does not document `opencode.jsonc` as an alternative to `opencode.json`
- it does not explain what happens when both `.json` and `.jsonc` are present in the same directory
- it implies local plugin directory auto-loading applies more broadly than it actually does
- it does not accurately describe how npm plugin targets are split between `opencode.json[c]` and `tui.json[c]`
- install / upgrade / cache wording is outdated

This makes it easy to misconfigure plugins, especially when working with local TUI plugins or trying to understand server-vs-TUI plugin package entrypoints.

### Plugins

_No response_

### OpenCode version

Current docs / `dev`

### Steps to reproduce

1. Open `https://opencode.ai/docs/plugins`
2. Compare the page with the current plugin implementation
3. Notice the mismatch around server vs TUI plugins, `opencode.jsonc`, and install / upgrade behavior

### Screenshot and/or share link

_No response_

### Operating System

_No response_

### Terminal

_No response_

---
