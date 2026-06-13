<p align="center">
  <img src="https://raw.githubusercontent.com/ElioNeto/teamcode/rewrite/go-core/.github/logo.svg" alt="TeamCode" width="200" />
</p>
<p align="center">The open source AI coding agent — powered by a hybrid TypeScript + Go core.</p>
<p align="center">
  <a href="https://discord.gg/teamcode"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://github.com/ElioNeto/teamcode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/ElioNeto/teamcode/publish.yml?style=flat-square&branch=dev" /></a>
  <a href="https://www.npmjs.com/package/@teamcode-ai/teamcode"><img alt="npm" src="https://img.shields.io/npm/v/@teamcode-ai/teamcode?style=flat-square" /></a>
</p>

TeamCode is an open source AI-powered coding agent that runs in your terminal. It helps you navigate, understand, and modify codebases through natural language conversations.

---

## 🚀 v2.0.0 — Go Core Engine

TeamCode v2.0.0 introduces a **hybrid runtime architecture**: a Go core engine that handles I/O-heavy operations alongside the existing TypeScript runtime, delivering significant performance improvements:

- **Filesystem operations** — up to 10× faster reads, writes, and searches
- **Process spawning** — cross-platform process execution with timeouts
- **File watching** — real-time file change detection via SSE streaming
- **Session management** — CRUD lifecycle with consolidated message history
- **Provider catalog** — built-in registry of 25+ models across 8 providers
- **Configuration** — hierarchical `teamcode.json[c]` loading with caching

The Go core runs as a sidecar process, automatically spawned when you run TeamCode. Feature flags control routing between the engines, with a **circuit breaker** that falls back to 100% TypeScript if the Go core encounters errors.

---

## 📦 Installation

### Via npm (recommended)

```bash
npm install -g @teamcode-ai/teamcode
teamcode
```

### From source

```bash
git clone https://github.com/ElioNeto/teamcode.git
cd teamcode
bun install
bun run --cwd packages/teamcode dev
```

---

## 🎮 Usage

```bash
# Start TeamCode in the current directory
teamcode

# Start with a specific project
teamcode /path/to/project

# Run a single prompt non-interactively
teamcode run "explain this codebase"

# List available providers and models
teamcode providers

# Enable debug logging (verbose output to stderr)
teamcode --debug
teamcode --debug run "describe this codebase"
```

### Engine indicator

The TUI footer shows which engine is active:
- **`⚡Go`** — Go core running alongside TypeScript (shadow mode or canary)
- **`TS`** — 100% TypeScript (Go core not available)

---

## 🤖 Agents

TeamCode includes two built-in agents you can switch between with the `Tab` key.

- **build** — Default, full-access agent for development work
- **plan** — Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  TeamCode CLI                        │
│  (Bun-compiled binary: teamcode)                    │
├─────────────────────────────────────────────────────┤
│  TypeScript Runtime        │  Go Core (sidecar)     │
│  ┌───────────────────┐     │  ┌──────────────────┐  │
│  │ TUI / UI          │     │  │ Filesystem       │  │
│  │ Session management│     │  │ Process spawning │  │
│  │ LLM integration   │     │  │ File watching    │  │
│  │ Plugin system     │     │  │ Session CRUD     │  │
│  │ Feature flags     │────┼──│→ Provider catalog │  │
│  │ Circuit breaker   │     │  │ Config loading   │  │
│  └───────────────────┘     │  └──────────────────┘  │
│                            │  localhost:43001        │
└─────────────────────────────────────────────────────┘
```

### Debug Mode

Pass `--debug` to any command to enable verbose logging. This forces log level to `DEBUG` and prints logs to stderr, helping diagnose initialization bottlenecks, provider connection issues, and tool execution:

```bash
# Interactive TUI with debug logging
teamcode --debug

# Single prompt with debug logging
teamcode --debug run "explain this codebase"

# Debug persists into the TUI worker process
```

The debug flag is automatically forwarded to the background worker when using the TUI, so both the main thread and the server worker produce verbose output.

### Shadow mode

Before routing traffic to the Go core, TeamCode runs both engines in parallel, compares results, and logs divergences. This **shadow mode** validates correctness without affecting your workflow:

```bash
FLAG_filesystem_shadow=true teamcode /path/to/project
```

Divergences are logged to stderr:
```
[shadow] divergence filesystem.read trace=<uuid> { ts: ..., go: ... }
```

---

## 🧪 Test Suite

**500+ tests** spanning both TypeScript and Go:

| Layer | Tests | Stack |
|-------|-------|-------|
| Go unit | 103 | `go test` |
| TS core | 426 | `bun test` (core package) |
| TS parity | 75 | `bun test` + Go core |

```bash
# Run Go tests
cd go-core && make test

# Run core package tests
cd packages/core && bun test

# Run parity tests (requires Go core binary)
cd packages/core && GO_CORE_BINARY=../../go-core/server bun test test/parity/

# Run a specific test file
cd packages/core && bun test test/models.test.ts

# Full typecheck across all packages
bun turbo typecheck
```

---

## 🤝 Contributing

If you're interested in contributing to TeamCode, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

---

**Join our community** [Discord](https://discord.gg/teamcode) | [X.com](https://x.com/teamcode)

---

_Originally based on [opencode](https://github.com/sst/opencode) (MIT)_
