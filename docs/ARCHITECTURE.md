# TeamCode Architecture

> Version: 2.4.0+
> Last updated: 2026-07-12

---

## Table of Contents

1. [Overview](#1-overview)
2. [Repository Structure](#2-repository-structure)
3. [Architecture Principles](#3-architecture-principles)
4. [Core Engine: TypeScript vs Go](#4-core-engine-typescript-vs-go)
5. [Data Layer](#5-data-layer)
6. [TUI (Terminal User Interface)](#6-tui-terminal-user-interface)
7. [Event System](#7-event-system)
8. [Provider System](#8-provider-system)
9. [Agent System](#9-agent-system)
10. [Plugin System](#10-plugin-system)
11. [Go Core Server](#11-go-core-server)
12. [Storage Architecture](#12-storage-architecture)
13. [Session Lifecycle](#13-session-lifecycle)
14. [Performance Characteristics](#14-performance-characteristics)
15. [Appendices](#15-appendices)

---

## 1. Overview

TeamCode is an AI-powered coding assistant that operates in the terminal. It provides:

- **Interactive TUI** — full-screen terminal interface with sessions, prompts, and file management
- **AI provider integration** — supports 50+ LLM providers (OpenAI, Anthropic, Google, open-source, etc.)
- **Autonomous agents** — configurable AI agents with tool access (filesystem, shell, web, etc.)
- **Session management** — persistent sessions with message history, checkpoint/restore
- **Code editor** — built-in VIM-style code editor with syntax highlighting and file navigation
- **Go core** — high-performance sidecar server for filesystem operations, sessions, and LLM routing

### High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                    teamcode CLI                        │
│  (Bun/TypeScript - TUI + orchestration)               │
├──────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐ │
│  │   TUI    │  │  Session  │  │ Config │  │ Provider │ │
│  │(OpenTUI) │  │  Manager  │  │ System │  │ Catalog  │ │
│  └─────────┘  └──────────┘  └────────┘  └─────────┘ │
│                      │                                    │
│         ┌────────────┴────────────┐                      │
│         │    SDK (HTTP Client)    │                      │
│         └────────────┬────────────┘                      │
│                      │                                    │
├──────────────────────┼───────────────────────────────────┤
│         ┌────────────┴────────────┐                      │
│         │   Go Core (Sidecar)     │                      │
│         │  - Filesystem Ops       │                      │
│         │  - Session CRUD         │                      │
│         │  - Provider Catalog     │                      │
│         │  - Swarm Engine         │                      │
│         │  - File Watching        │                      │
│         │  - Event Bus            │                      │
│         └─────────────────────────┘                      │
└──────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer    | Technology                          | Purpose                              |
| -------- | ----------------------------------- | ------------------------------------ |
| Runtime  | **Bun** v1.3+                       | JavaScript/TypeScript runtime        |
| CLI      | **yargs**                           | Argument parsing                     |
| TUI      | **OpenTUI** 0.2 + **Solid.js**      | Terminal UI framework                |
| State    | **Solid.js** stores + `createStore` | Reactive state management            |
| Effects  | **Effect** v4 beta                  | Composable effect system             |
| Database | **SQLite** (Drizzle ORM)            | Session/message persistence          |
| KV Store | **ApexStore** (Rust LSM-tree)       | High-performance key-value storage   |
| Go Core  | **Go** 1.22+                        | Sidecar server for perf-critical ops |
| SDK      | **hey-api** generated               | Type-safe HTTP client                |
| Auth     | **OAuth 2.0** + API keys            | Provider authentication              |

---

## 2. Repository Structure

```
teamcode/
├── .github/                          # CI/CD, CODEOWNERS, templates
│   ├── CODEOWNERS                    # Ownership rules (core TS = deprecated)
│   ├── workflows/                    # GitHub Actions pipelines
│   └── pull_request_template.md
│
├── packages/
│   ├── teamcode/                     # ★ Main application package
│   │   ├── src/
│   │   │   ├── cli/
│   │   │   │   ├── cmd/              # CLI commands (run, session, config, etc.)
│   │   │   │   │   ├── run/          # Interactive session mode
│   │   │   │   │   ├── tui/          ★ TUI implementation
│   │   │   │   │   │   ├── app.tsx   # Main TUI entry, component tree
│   │   │   │   │   │   ├── context/  # Solid.js contexts (route, theme, sync, etc.)
│   │   │   │   │   │   ├── routes/   # Route pages (home, session, editor)
│   │   │   │   │   │   ├── component/# Reusable TUI components
│   │   │   │   │   │   │   ├── editor/  ★ Code editor
│   │   │   │   │   │   │   ├── prompt/  # Prompt input
│   │   │   │   │   │   │   ├── dialog-*.# Dialog components
│   │   │   │   │   │   │   └── .../
│   │   │   │   │   │   ├── ui/       # UI utilities (toast, dialog)
│   │   │   │   │   │   └── plugin/   # TUI plugin API
│   │   │   │   │   ├── session/      # Session management command
│   │   │   │   │   └── ...
│   │   │   │   └── ui.ts             # Fallback CLI UI
│   │   │   ├── server/               # HTTP API server
│   │   │   ├── v2/                   # V2 services (session, event)
│   │   │   ├── storage/              # SQLite + ApexStore storage
│   │   │   ├── provider/             # LLM provider management
│   │   │   ├── session/              # Session logic
│   │   │   ├── project/              # Project management
│   │   │   └── effect/               # Effect service wrappers
│   │   └── test/
│   │
│   ├── core/                         ★ DEPRECATED TypeScript core
│   │   ├── src/
│   │   │   ├── router/               # Go core HTTP client + circuit breaker
│   │   │   ├── filesystem.ts         # File system operations
│   │   │   ├── models.ts             # Model catalog (models.dev)
│   │   │   ├── global.ts             # Path resolution
│   │   │   ├── flag/                 # Feature flags
│   │   │   └── ...
│   │   └── test/
│   │
│   ├── sdk/                          # TypeScript SDK (hey-api generated)
│   ├── ui/                           # UI assets (icons, spritesheets)
│   ├── server/                       # Server package
│   ├── llm/                          # LLM integration
│   └── ...                           # Other packages
│
├── go-core/                          ★ Go core sidecar server
│   ├── cmd/server/                   # HTTP server, handlers
│   ├── internal/
│   │   ├── session/                  # Session store (persistent + TTL)
│   │   ├── cache/                    # Generic LRU cache
│   │   ├── provider/                 # Static provider catalog
│   │   ├── config/                   # Configuration management
│   │   ├── filesystem/               # Filesystem adapter
│   │   ├── eventbus/                 # Event bus (chan-based)
│   │   ├── watcher/                  # File watcher (fsnotify)
│   │   ├── pool/                     # Worker pool
│   │   ├── swarm/                    # Swarm agent scheduler
│   │   ├── transport/                # Unix/TCP transport
│   │   └── metrics/                  # Metrics collection
│   └── build/                        # Compiled binaries
│
└── docs/                             # Documentation
    ├── ARCHITECTURE.md               # This file
    ├── EDITOR.md                     # TUI editor documentation
    ├── PERFORMANCE_PLAN.md           # Performance improvement plan
    ├── database-analysis.md          # Database analysis
    └── ...
```

### Path Aliases (@tui)

The TUI codebase uses path aliases for clean imports:

| Alias                | Target                       |
| -------------------- | ---------------------------- |
| `@tui/routes/...`    | `src/cli/cmd/tui/routes/`    |
| `@tui/context/...`   | `src/cli/cmd/tui/context/`   |
| `@tui/ui/...`        | `src/cli/cmd/tui/ui/`        |
| `@tui/component/...` | `src/cli/cmd/tui/component/` |
| `@/...`              | `src/`                       |
| `@teamcode-ai/...`   | External packages            |

---

## 3. Architecture Principles

### 3.1 Go Core as Source of Truth

As of v2.4.0, the **Go core** is the primary execution engine for performance-critical operations:

| Operation         | Owner       | Reason                                         |
| ----------------- | ----------- | ---------------------------------------------- |
| Filesystem I/O    | Go core     | 10-50x faster than Node.js for bulk operations |
| Session CRUD      | Go core     | Persistent store with LRU cache                |
| File watching     | Go core     | OS-native inotify/kqueue via fsnotify          |
| Provider catalog  | Go core     | Static + dynamic, built-in                     |
| Swarm scheduling  | Go core     | Parallel goroutine execution                   |
| **Session state** | **Go core** | LRU + disk persistence + TTL                   |

### 3.2 TypeScript Core Deprecated

The `packages/core/` package is **DEPRECATED as of v2.4.0**:

- ✅ Only **bug fixes and security patches** accepted
- ❌ No new features implemented here
- ✅ All new feature development targets `go-core/`

See [CODEOWNERS](../.github/CODEOWNERS) for ownership rules.

### 3.3 Thin Client Architecture

The TypeScript layer serves as a **thin orchestration layer**:

- **TUI rendering** — OpenTUI + Solid.js for terminal UI
- **Command routing** — yargs for CLI argument parsing
- **Session orchestration** — coordinating Go core, providers, and TUI
- **Plugin system** — loading and managing plugins
- **Configuration** — reading and applying user configuration

---

## 4. Core Engine: TypeScript vs Go

### 4.1 TypeScript Core (Deprecated)

| File                                  | Purpose                       | Status             |
| ------------------------------------- | ----------------------------- | ------------------ |
| `packages/core/src/router/go-core.ts` | Go core process manager       | ✅ Maintenance     |
| `packages/core/src/router/client.ts`  | HTTP client + circuit breaker | ✅ Maintenance     |
| `packages/core/src/models.ts`         | Model catalog (models.dev)    | ✅ Maintenance     |
| `packages/core/src/filesystem.ts`     | File system interface         | 🔄 Migrating to Go |
| `packages/core/src/session.ts`        | Session interface             | 🔄 Migrating to Go |

### 4.2 Go Core

**Location:** `go-core/`

**Key features:**

- Unix domain socket + TCP transport (auto-detected)
- Generic LRU cache (`internal/cache/lru.go`) with TTL
- Persistent session store with 7-day TTL (`internal/session/persistent_store.go`)
- Worker pool for CPU-bound tasks (`internal/pool/pool.go`)
- File watcher via fsnotify (`internal/watcher/watcher.go`)
- Event bus for async communication (`internal/eventbus/event.go`)
- Swarm agent scheduler (`internal/swarm/`)
- Prometheus-style metrics (`internal/metrics/`)

**Session Store Architecture:**

```
┌─────────────────────────────────────────┐
│           PersistentStore               │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────┐  │
│  │ In-Memory│  │ LRU Cache│  │ TTL  │  │
│  │ Store    │  │ (hot)    │  │ Track│  │
│  └──────────┘  └──────────┘  └──────┘  │
│  ┌──────────────────────────────────┐   │
│  │    Disk Persistence (JSON)       │   │
│  │  Atomic writes (tmp + rename)    │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**TTL Policy:** Sessions expire after **7 days** (configurable). TTL is renewed on every `Get()`, `List()`, or `Create()` call. Background cleanup runs every hour.

---

## 5. Data Layer

### 5.1 Storage Locations

| Path                                            | Purpose                              |
| ----------------------------------------------- | ------------------------------------ |
| `~/.local/share/teamcode/`                      | Primary data directory               |
| `~/.local/share/teamcode/opencode.db`           | SQLite database (sessions, messages) |
| `~/.local/share/teamcode/storage/`              | Legacy JSON storage (migrating away) |
| `~/.local/share/teamcode/go-core/sessions.json` | Go core session persistence          |
| `~/.local/share/teamcode/log/`                  | Application logs                     |
| `~/.local/share/teamcode/apexstore/`            | ApexStore LSM-tree data (future)     |
| `~/.cache/teamcode/bin/`                        | Downloaded Go core binaries          |
| `~/.cache/teamcode/models.json`                 | Model catalog cache                  |

### 5.2 SQLite Schema

**Core tables** (defined in `packages/teamcode/src/session/session.sql.ts`):

| Table             | Key Columns                                   | Purpose                          |
| ----------------- | --------------------------------------------- | -------------------------------- |
| `project`         | `id`, `worktree`, `vcs`, `name`               | Project metadata                 |
| `session`         | `id`, `project_id`, `title`, `model`, `agent` | Session metadata                 |
| `message`         | `id`, `session_id`, `data` (JSON)             | Message content                  |
| `part`            | `id`, `message_id`, `data` (JSON)             | Message parts (tool calls, etc.) |
| `session_message` | `id`, `session_id`, `type`, `data` (JSON)     | V2 event-sourced messages        |
| `workspace`       | `id`, `project_id`, `directory`               | Workspace state                  |
| `todo`            | `session_id`, `content`, `status`             | Task tracking                    |

### 5.3 ApexStore (Future)

ApexStore is a Rust-based LSM-tree database that will eventually replace SQLite for:

- Session storage (with native TTL)
- Message event streams
- Configuration storage
- Project indices

---

## 6. TUI (Terminal User Interface)

### 6.1 Technology

- **OpenTUI** 0.2 — terminal UI framework providing `<box>`, `<text>`, `<textarea>`, `<scrollbox>` JSX elements
- **Solid.js** — reactive UI library
- **@opentui/keymap** — keyboard shortcut system
- **tree-sitter** (available) — for advanced syntax highlighting

### 6.2 Component Tree

```
<ErrorBoundary>
  <OpencodeKeymapProvider>
    <RouteProvider>                   ← home | session | editor | plugin
      <ThemeProvider>
        <SDKProvider>
          <ProjectProvider>
            <SyncProvider>
              <App>
                <Switch>
                  <Match when="home">    → <Home />
                  <Match when="session"> → <Session />
                  <Match when="editor">  → <EditorPage />
                  <Match when="plugin">  → Plugin route
                </Switch>
              </App>
            </SyncProvider>
          </ProjectProvider>
        </SDKProvider>
      </ThemeProvider>
    </RouteProvider>
  </OpencodeKeymapProvider>
</ErrorBoundary>
```

### 6.3 Route Types

| Route     | Props                   | Description                         |
| --------- | ----------------------- | ----------------------------------- |
| `home`    | `prompt?`               | Main home screen with logo + prompt |
| `session` | `sessionID`, `prompt?`  | Active session view                 |
| `editor`  | `filePath?`, `rootDir?` | Code editor                         |
| `plugin`  | `id`, `data?`           | Plugin-provided route               |

### 6.4 Context System

| Context                 | Provider      | Purpose                                |
| ----------------------- | ------------- | -------------------------------------- |
| `RouteProvider`         | `route.tsx`   | Navigation state                       |
| `ThemeProvider`         | `theme.tsx`   | Color theme, mode, syntax highlighting |
| `SDKProvider`           | `sdk.tsx`     | API client + SSE events                |
| `ProjectProvider`       | `project.tsx` | Project paths, workspace               |
| `SyncProvider`          | `sync.tsx`    | Central store (sessions, messages)     |
| `LocalProvider`         | `local.tsx`   | Local UI state (selected model, etc.)  |
| `EditorContextProvider` | `editor.ts`   | IDE integration (WebSocket, ZED)       |

---

## 7. Event System

### 7.1 Event Flow

```
User Input / Agent Action
        │
        ▼
┌───────────────┐
│   Event Bus    │
│  (EventV2)     │
└───────┬───────┘
        │
    ┌───┴───┐
    ▼       ▼
┌──────┐ ┌──────┐
│SQLite│ │ Go   │
│Store │ │ Core │
└──────┘ └──────┘
```

The event system uses **Event Sourcing** — all state changes are recorded as events:

- `Prompted`, `Synthetic` — user/agent messages
- `Text.Started/Delta/Ended` — streaming text responses
- `Tool.Started/Delta/Ended` — tool calls
- `Shell.Started/Ended` — shell commands
- `Reasoning.*` — AI reasoning traces
- `Compaction.*` — session compaction

---

## 8. Provider System

### 8.1 Provider Discovery

Providers are discovered through:

1. **Built-in catalog** (Go core `internal/provider/`) — static list of 50+ providers
2. **models.dev** — dynamic catalog fetched from `https://models.dev/api.json`
3. **User config** — custom providers defined in `teamcode.json`
4. **Plugins** — dynamic provider additions via plugin hooks

### 8.2 Provider Flow

```
1. User types a prompt
2. Session manager selects provider/model
3. Provider SDK formats the request
4. LLM API is called (streaming)
5. Response is streamed back through event bus
6. Events are persisted to SQLite
```

---

## 9. Agent System

TeamCode supports configurable AI agents with:

- **Tool access** — filesystem, shell, web, MCP, etc.
- **Agent routing** — main agent + subagents for subtasks
- **Swarm scheduling** (Go core) — parallel agent execution
- **Mode system** — normal, caveman (compressed), autonomous

---

## 10. Plugin System

Plugins are loaded from the filesystem or npm and can:

- Add new providers and models
- Register TUI components (slots)
- Hook into session lifecycle
- Provide custom commands
- Add MCP servers

---

## 11. Go Core Server

### 11.1 Startup Sequence

```
1. TypeScript imports @teamcode-ai/core/router
2. startGoCore() called (fire-and-forget)
   a. resolveBinary() — search 4 locations
   b. downloadGoCore() — fetch from GitHub if missing (30s timeout)
   c. findAvailablePort() — scan ports 43001-43100
   d. spawn() — start Go core process
   e. Poll /health — every 200ms, up to 5s
   f. triggerCbPoll() → start circuit breaker
3. CLI middleware runs (log, heap, migration)
4. User command executes
```

### 11.2 HTTP API

| Method | Path                       | Purpose                 |
| ------ | -------------------------- | ----------------------- |
| `GET`  | `/health`                  | Health check            |
| `GET`  | `/metrics`                 | Circuit breaker metrics |
| `GET`  | `/info`                    | Version/build info      |
| `POST` | `/fs/read`                 | Read file               |
| `POST` | `/fs/write`                | Write file              |
| `POST` | `/fs/list`                 | List directory          |
| `POST` | `/fs/glob`                 | Glob pattern matching   |
| `GET`  | `/providers`               | List providers          |
| `GET`  | `/providers/{name}/models` | Provider models         |
| `POST` | `/session/create`          | Create session          |
| `GET`  | `/session/get`             | Get session             |
| `POST` | `/session/update`          | Update session          |
| `POST` | `/session/delete`          | Delete session          |
| `GET`  | `/session/list`            | List sessions           |
| `GET`  | `/session/events`          | SSE event stream        |

### 11.3 Circuit Breaker

The circuit breaker (in `client.ts`) monitors Go core health:

- Polls `GET /metrics` every **30 seconds**
- If error rate > **1%**, sets `go-core-available = false`
- After **2 consecutive healthy polls**, re-enables Go core
- Starts **only after Go core health check succeeds** (not at module load)

---

## 12. Storage Architecture

### 12.1 Current State

```
TeamCode Data (~/.local/share/teamcode/)
├── opencode.db              # SQLite (main storage)
├── go-core/
│   └── sessions.json        # Go core session persistence
├── storage/                 # Legacy JSON (migrating)
├── log/                     # Application logs
└── index/                   # Project indices
```

### 12.2 Target State (Post-Migration)

```
TeamCode Data (~/.local/share/teamcode/)
├── apexstore/               # LSM-tree (ApexStore)
├── projects/
│   └── <project-hash>/
│       ├── index/           # File tree, deps, symbols
│       ├── objects/         # Content-addressable blobs
│       ├── logs/            # Per-project logs
│       └── sessions/        # Active session state
├── logs/                    # Global logs
└── opencode.db              # SQLite (to be removed)
```

---

## 13. Session Lifecycle

```
                    ┌──────────┐
                    │  Create   │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
           ┌────────┤  Active   │◄────────┐
           │        └────┬─────┘         │
           │             │               │
     ┌─────▼────┐  ┌────▼─────┐   ┌──────┴──────┐
     │  Prompt   │  │  Agent   │   │   Resume    │
     │  (user)   │  │ (reply)  │   │ (reconnect) │
     └─────┬────┘  └────┬─────┘   └──────┬──────┘
           │             │               │
           └──────┬──────┘               │
                  │                      │
            ┌─────▼──────┐               │
            │   Stream    │              │
            │  (response) │              │
            └─────┬──────┘              │
                  │                      │
            ┌─────▼──────┐              │
            │   Complete  │──────────────┘
            └─────┬──────┘
                  │
            ┌─────▼──────┐
            │  Archived   │──→ TTL (7 days) → Purge
            └────────────┘
```

### Session TTL

- Sessions are automatically deleted after **7 days** of inactivity
- TTL is renewed on every access:
  - Opening a session
  - Sending a prompt
  - Listing sessions
- Background cleanup runs every hour
- Implemented in Go core's `PersistentStore`

---

## 14. Performance Characteristics

### Benchmarks (v2.4.0 target)

| Metric                 | Before (v2.3.1) | Target (v2.4.0) | Improvement |
| ---------------------- | --------------- | --------------- | ----------- |
| Cold startup           | >10 min         | <30s            | 20x         |
| Warm startup           | ~30s            | <5s             | 6x          |
| Session load (200 msg) | ~2s             | <200ms          | 10x         |
| RAM (idle)             | ~150MB          | <50MB           | 3x          |
| RAM (active session)   | ~500MB          | <200MB          | 2.5x        |

### Known Bottlenecks (Fixed)

| Issue                              | Fix                             | File                                           |
| ---------------------------------- | ------------------------------- | ---------------------------------------------- |
| Session truncation at 200 messages | Increased LIMIT to 5000         | `session.shared.ts`                            |
| Circuit breaker starts too early   | Now starts after Go core ready  | `client.ts`                                    |
| Flock lock timeout too long        | 60s → 10s                       | `models.ts`                                    |
| Go core session store is in-memory | Added persistent store with TTL | `go-core/internal/session/persistent_store.go` |

---

## 15. Appendices

### A. Key Configuration Files

| File                              | Purpose                   |
| --------------------------------- | ------------------------- |
| `teamcode.json`                   | Per-project configuration |
| `~/.config/teamcode/config.json`  | User-wide configuration   |
| `~/.config/teamcode/keybind.json` | Custom keybindings        |
| `opencode.db`                     | SQLite database           |
| `go-core/build/go-core-server`    | Go core binary            |

### B. Environment Variables

| Variable              | Purpose                            |
| --------------------- | ---------------------------------- |
| `TEAMCODE_DEBUG`      | Enable debug logging               |
| `TEAMCODE_PURE`       | Disable plugins                    |
| `GO_CORE_PORT`        | Go core port (default: 43001)      |
| `GO_CORE_BINARY`      | Go core binary path override       |
| `GO_CORE_CB_DISABLED` | Disable circuit breaker            |
| `GO_CORE_CB_POLL`     | Circuit breaker poll interval (ms) |
| `TEAMCODE_ROUTE`      | Initial TUI route                  |
| `TEAMCODE_MODELS_URL` | Model catalog URL                  |

### C. Build Commands

```bash
# Run development mode
cd packages/teamcode && bun dev

# Build Go core
cd go-core && make build

# Run tests
cd packages/core && bun run test
cd packages/teamcode && bun run test
cd go-core && go test ./...

# Type check
cd packages/teamcode && bun run typecheck
cd packages/core && bun run typecheck
```

### D. Migration Path: TS Core → Go Core

See [PERFORMANCE_PLAN.md](./PERFORMANCE_PLAN.md) for the detailed 5-phase migration plan.
