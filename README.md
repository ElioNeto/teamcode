<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="">
    <img alt="TeamCode" src="" width="320">
  </picture>
</p>
<p align="center">An open-source AI coding agent for your terminal.</p>
<p align="center">
  <a href="https://discord.gg/teamcode"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord&color=5865F2" /></a>
  <a href="https://x.com/teamcode"><img alt="X / Twitter" src="https://img.shields.io/badge/x-@teamcode-1DA1F2?style=flat-square&logo=x" /></a>
  <a href="https://github.com/ElioNeto/teamcode/actions/workflows/publish.yml"><img alt="Build" src="https://img.shields.io/github/actions/workflow/status/ElioNeto/teamcode/publish.yml?style=flat-square&branch=main" /></a>
  <a href="https://www.npmjs.com/package/@teamcode-ai/teamcode"><img alt="npm" src="https://img.shields.io/npm/v/@teamcode-ai/teamcode?style=flat-square" /></a>
</p>

TeamCode is an open-source AI coding agent that runs in your terminal. It helps you navigate, understand, and modify codebases through natural-language conversations, with support for multiple agents, subagents, and autonomous workflows.

---

### Quick Start

```bash
# Install globally via npm
npm install -g @teamcode-ai/teamcode

# Or via bun
bun install -g @teamcode-ai/teamcode

# Launch in your project directory
teamcode
```

The first run downloads the platform-specific binary automatically. No other setup required.

### From Source

```bash
git clone https://github.com/ElioNeto/teamcode.git
cd teamcode
bun install
bun run --cwd packages/teamcode --conditions=browser src/index.ts
```

### Agents

TeamCode includes two built-in agents you can switch between with the `Tab` key.

- **build** — Default, full-access agent for development work
- **plan** — Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multi-step tasks.
It can be invoked with `@general` in messages.

Custom agents and subagents are configured via `teamcode.json` / `opencode.jsonc` in your project or global config directory.

---

**Join our community** [Discord](https://discord.gg/teamcode) | [X / Twitter](https://x.com/teamcode)

### Configuration

TeamCode looks for config in this order:

1. **Global config** — `~/.config/teamcode/config.json`, `~/.config/opencode.json`, or `XDG_CONFIG_HOME`
2. **Project config** — `teamcode.json`, `opencode.json`, or `opencode.jsonc` in the project root
3. **Environment variables** — `TEAMCODE_CONFIG_DIR`, `TEAMCODE_DISABLE_PROJECT_CONFIG`, etc.

A minimal `opencode.jsonc`:
```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-20250514",
  "agent": {
    "build": { /* agent overrides */ }
  }
}
```

---

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

_Based on [opencode](https://github.com/sst/opencode) (MIT)_
