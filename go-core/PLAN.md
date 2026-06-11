# Go Core Rewrite — Plan

> **Branch:** `rewrite/go-core`
> **Version:** 0.1.0
> **Go Module:** `github.com/ElioNeto/teamcode/go-core` (go 1.22.2)
> **Port:** 43001 (env `GO_CORE_PORT`)
> **Communication:** HTTP REST (JSON) via localhost
> **Feature flags:** `packages/core/src/router/flag.ts`
> **Epic:** [#1036](https://github.com/ElioNeto/teamcode/issues/1036)
> **Open issues:** https://github.com/ElioNeto/teamcode/issues?q=label%3Aenhancement+is%3Aopen+rewrite
> **Report:** https://github.com/ElioNeto/teamcode/blob/rewrite/go-core/go-core/RELATORIO.md

---

## 🎯 Strategy: Strangler Fig Pattern

> **Epic #1036** — Incremental rewrite of the core without disrupting the current runtime.

- TypeScript runtime remains 100% functional throughout the migration
- New Go modules introduced behind stable HTTP contracts
- Each module coexists with the old one until full parity is validated
- Rollback via feature flag (no redeploy)
- Legacy code removed only after confirmed stabilization

### Out of scope
- TUI / frontend (`packages/app`, `packages/ui`)
- Desktop Tauri (`packages/desktop`)
- Active integrations (`packages/slack`, `packages/mcp-security-tools`)

---

## ✅ Completed

| Issue | Title | What was done | Tests |
|-------|-------|---------------|--------|
| [#1042](https://github.com/ElioNeto/teamcode/issues/1042) | Bootstrap go-core | HTTP server, graceful shutdown, CORS, minimal adapter | — |
| [#1041](https://github.com/ElioNeto/teamcode/issues/1041) | Feature flags | `flag.ts` (boolean + canary %), `client.ts` (GoCoreClient), TS ↔ Go routing | 7 TS parity |
| [#1038](https://github.com/ElioNeto/teamcode/issues/1038) | Branch strategy | Branch `rewrite/go-core` created | — |
| [#1044](https://github.com/ElioNeto/teamcode/issues/1044) | Complete filesystem adapter | 20+ operations (read/write/stat/glob/findUp/copy/move/remove/MIME), TS `AppFileSystem` parity | 32 Go + 23 TS parity |
| [#1045](https://github.com/ElioNeto/teamcode/issues/1045) | Session event streaming (partial) | `internal/eventbus` (PubSub), SSE streaming, publish, health, heartbeat 10s | 9 + 7 + 3 TS parity |
| [#1069](https://github.com/ElioNeto/teamcode/issues/1069) | Shadow mode | `isShadow()`, `setShadow()`, `routeFilesystemOp()`, `deepEqual()`, `X-Trace-ID` | 11 TS parity |
| [#1071](https://github.com/ElioNeto/teamcode/issues/1071) | Metrics + circuit breaker | `internal/metrics` (sliding window 60s), `GET /metrics`, polling 30s, auto-rollback >1% error | 4 Go + 2 TS parity |
| [#1043](https://github.com/ElioNeto/teamcode/issues/1043) | Process spawning | `internal/process` (spawn with timeout/env/cwd), npm/npx helpers | 10 Go + 4 TS parity |
| [#1070](https://github.com/ElioNeto/teamcode/issues/1070) | Session message updater | `internal/updater` (state machine, 24 event types → 8 message types), GET /session/messages | 14 Go + 2 TS parity |
| — | Visual engine indicator | `⚡Go`/`TS` indicator in TUI footer (home, sidebar and `run --interactive`); `tcdev-go` alias starts Go server automatically | — |
| [#1072](https://github.com/ElioNeto/teamcode/issues/1072) | Session CRUD lifecycle | `internal/session` (Go store with CRUD), REST endpoints + client.ts + 7 Go tests + 10 TS parity | 7 Go + 10 TS parity |
| [#1073](https://github.com/ElioNeto/teamcode/issues/1073) | Remove legacy TS | Pending — remove TS modules after Go parity | — |

### Totals
- **103 Go tests** (9 eventbus + 7 server + 32 filesystem + 4 metrics + 10 process + 7 session + 14 updater + 6 watcher + 10 config + 6 provider)
- **75 TS parity tests** (7 flag + 23 filesystem + 3 session + 11 shadow + 2 metrics + 4 process + 2 updater + 10 session-crud + 3 harness + 5 schema + 5 provider)
- **178 tests — zero failures**
- **14 commits** (including PLAN.md + RELATORIO.md)

---

## 🔜 Open Issues (in recommended order)

### #1040 — Parity Test Harness
**Part of epic #1036.** ✅ COMPLETE.

**What was done:**
- `test/parity/harness.ts` — Reusable harness with `describeParity()` + automatic Go server lifecycle
- `test/parity/harness.test.ts` — 3 integration tests for the harness itself
- Migration of `session-crud.test.ts` to use the harness (10 tests)
- No more duplicated setup/teardown code in new tests

**Usage:**
```ts
import { describeParity, getGoCoreAvailable } from "./harness"

describeParity("my test", () => {
  test("something", async () => {
    if (!getGoCoreAvailable()) return
    // test with GoCoreClient
  })
})
```

---

### #1039 — Contract Mapping
**Part of epic #1036.** ✅ COMPLETE.

**What was done:**
- `CONTRACTS.md` — Full documentation of all 20+ endpoints: request/response JSON, corresponding TS types, status codes, feature flags
- `test/parity/schema.test.ts` — 5 schema tests that validate the shape of Go core responses against expected types (health, metrics, session CRUD, session list, events-status)
- Includes compatibility rules (snake_case, ISO 8601 timestamps, empty arrays)

**Tests:** 5 TS parity

---

### #1073 — Legacy TypeScript Removal
**Part of epic #1036.** Pending (after canary 100% stable in production).

**Order:**
1. Filesystem (#1044) after canary 100% stable
2. Session events (#1045) after canary 100% stable
3. Process spawning (#1043) after canary 100% stable
4. Session CRUD (#1072) after implementation
5. Provider & Config (#1048, #1049)

---

### #1048 — Provider & Model Catalog (future)
Module `internal/provider/` (empty directory).
**Effort:** High

### #1049 — Config System (future)
Module `internal/config/` (empty directory).
**Effort:** Medium

### #1051 — File Watching (future)
**Part of epic #1036.** ✅ COMPLETE.

**What was done:**
- `internal/watcher/watcher.go` — Polling-based file watcher using only Go stdlib
- `internal/watcher/watcher_test.go` — 6 tests (watch, delete, directory, unwatch, non-existent, multiple)
- `cmd/server/fs_handlers.go` — `GET /fs/watch` SSE endpoint replaces placeholder
- `client.ts` — `fs.watch(path, intervalMs?)` returns EventSource
- Polling with configurable interval (default 1s, minimum 100ms)
- Events: `modify` (content/metadata changed), `delete` (file removed)
- Non-blocking: events dropped if buffer is full
- Zero external dependencies

**Tests:** 6 Go

---

### #1046 — Cutover & Rollback Plan
**Part of epic #1036.** ✅ COMPLETE (#1069 + #1071 + #1043).

**Cutover process per module:**
```
1. Feature flag: 0% Go / 100% TS   (development)
2. Shadow mode:  Go parallel, discarded  ← WE ARE HERE (Q3/2026)
3. Canary:       5% → 25% → 50% → 75% → 100%
4. Legacy TS removal
```

**ElioNeto analysis (#1046, comment 2026-06-10) — 3 gaps resolved:**

| # | Gap | Impact | Resolution |
|---|-----|--------|------------|
| 1 | Shadow mode not implemented | Cannot validate Go in production without risk | ✅ #1069: `routeFilesystemOp()` + `deepEqual()` + `isShadow()` |
| 2 | No metrics on Go server | Automatic rollback doesn't work | ✅ #1071: `internal/metrics` + `GET /metrics` + circuit breaker polling |
| 3 | No `X-Trace-ID` cross-runtime | Divergences cannot be correlated | ✅ #1069: `X-Trace-ID` on all requests, logged on Go server |

#### Runbook: Enable Shadow Mode for Filesystem

```bash
# 1. Enable shadow mode for filesystem via env var
export FLAG_filesystem_shadow=true

# 2. Observe divergences in logs
#    Logs appear as:
#   [shadow] divergence filesystem.<op> trace=<uuid> { ts: ..., go: ... }
#   [shadow] go_error filesystem.<op> trace=<uuid> { error: ... }

# 3. Check Go core metrics
curl http://127.0.0.1:43001/metrics
#   Returns: { request_count, error_count, error_rate, avg_latency_ms }

# 4. Rollback (if error_rate > 1%)
export FLAG_filesystem_shadow=false
#   OR automatically via circuit breaker (threshold 1%, 30s polling)
```

#### Runbook: Promote to Canary (after 48h with no divergences)

```bash
# 1. Increase canary gradually
export FLAG_go_core_filesystem=5    # 5%
# monitor 24h
export FLAG_go_core_filesystem=25   # 25%
# monitor 24h
export FLAG_go_core_filesystem=50   # 50%
# monitor 24h
export FLAG_go_core_filesystem=75   # 75%
# monitor 24h
export FLAG_go_core_filesystem=100  # 100%

# 2. Quick rollback
export FLAG_go_core_filesystem=0    # back to TS immediately
```

#### Recommended cutover order:
```
Module       Shadow      Canary      Criteria
──────────────────────────────────────────────────────
filesystem   ✅ ACTIVE  🔄 Next     Parity tests pass 48h CI
session/SSE  ⏳ Pending ⏳ Pending  Latency p95 ≤ legacy TS 24h
process      ⏳ Pending ⏳ Pending  Tested Linux + macOS + Windows
npm          ⏳ Pending ⏳ Pending  Tested Linux + macOS + Windows
```

**Rollback:** `export FLAG_<module>_enabled=0` — no redeploy.  
**Automatic rollback:** Circuit breaker disables Go core if `error_rate > 1%` for 30s.

---

### #1039 — Contract Mapping
**Part of epic #1036.**

**Objective:** Map public contracts between TS and Go.

- [ ] Define shared formal interfaces/types
- [ ] Validate that `client.ts` types match Go structs
- [ ] Document request/response for each endpoint
- [ ] Add schema tests
- [ ] **Blocker for #1069** (absolute path in findUp needs a contract)

---

### #1043 — Process Spawning
**Part of epic #1036.** Pending.

Module `internal/process/`:
- [ ] `spawn.go`: Spawn with timeout, env vars, cwd
- [ ] `npm.go`: Helper for `npm install`, `npx`, `bun x`
- [ ] Tests

**Parity with:** `process.ts`, `cross-spawn-spawner.ts`, `npm.ts`
**Effort:** Medium

---

### #1072 — Session CRUD Lifecycle
**Part of epic #1036.** ✅ COMPLETE.

**What was done:**
- `internal/session/store.go` — Thread-safe store with mutex, CRUD operations + list by directory
- `internal/session/store_test.go` — 7 tests (create, get, update, delete, count, list, concurrency)
- `cmd/server/session_crud_handlers.go` — 5 REST endpoints: `POST /session/create`, `GET /session/get`, `POST /session/update`, `POST /session/delete`, `GET /session/list`
- `client.ts` — `session.create()`, `.get()`, `.update()`, `.delete()`, `.list()`
- `test/parity/session-crud.test.ts` — 10 parity tests (full CRUD + list by directory + 404 handling)

**Tests:** 7 Go + 10 TS parity = 17 new tests

---

### #1073 — Legacy TypeScript Removal
**Part of epic #1036.** Pending.

**Objective:** Remove TS modules after confirming parity with Go.

**Order:**
1. Filesystem (#1044) after canary 100% stable
2. Session events (#1045) after canary 100% stable
3. Process spawning (#1043) after canary 100% stable
4. Session CRUD (#1072) after implementation
5. Provider & Config (#1048, #1049)

**Effort:** Low (each phase)

---

### #1070 — Session Message Updater (stateful)
**Part of epic #1036.** ✅ COMPLETE.

**What was done:**
- `internal/updater/message.go` — 8 message types: agent-switched, model-switched, user, synthetic, shell, assistant, compaction + tokens, tool states, content blocks
- `internal/updater/event.go` — 20+ event types with typed data
- `internal/updater/updater.go` — Complete state machine: processes raw events and consolidates into messages. Handlers for all 24 event types (step, text, tool, reasoning, compaction, shell, agent, model, prompt, synthetic)
- `internal/updater/updater_test.go` — 14 tests covering all flows (complete step/text/tool/reasoning/compaction cycle, multi-turn conversation, tool fail, multiple text blocks)
- `cmd/server/session_updater_handler.go` — GET /session/messages endpoint, automatic integration with POST /session/event
- `client.ts` — `session.messages()` method

**Tests:** 14 Go + 2 TS parity = 16 new tests

---

### #1040 — Parity Test Harness
**Part of epic #1036.** Pending.

**Objective:** Create official parity test harness for legacy vs Go.

- [ ] Reusable harness (`test/parity/harness.ts`)
- [ ] CI: run parity tests automatically
- [ ] Parity coverage report

---

### #1048 — Provider & Model Catalog
**Part of epic #1036.** ✅ COMPLETE.

**What was done:**
- `internal/provider/catalog.go` — Static catalog with 8 providers: OpenAI, Anthropic, Google, Mistral, DeepSeek, Groq, Together AI, GitHub Models
- `internal/provider/catalog_test.go` — 6 tests (list, get, models, provider fill, description)
- `cmd/server/provider_handlers.go` — `GET /providers` + `GET /providers/{name}/models` (Go 1.22 path params)
- `client.ts` — `providers.list()`, `providers.models(name)` with types
- `test/parity/provider.test.ts` — 5 parity tests
- Auto-fill of `Provider` field in each model via `addProvider()`
- Default descriptions for providers without explicit description

**Next step (future):** `POST /providers/:name/chat` for chat via provider

---

### #1049 — Config System
**Part of epic #1036.** ✅ COMPLETE.

**What was done:**
- `internal/config/config.go` — Config loader with cache, merge, JSONC support (// and /* */), findUp
- `internal/config/config_test.go` — 10 tests (strip comments, parse JSON/JSONC, findFiles, merge, cache, raw fields, no config)
- `cmd/server/config_handlers.go` — `POST /config/get` + `POST /config/invalidate`
- `client.ts` — `config.get(directory)`, `config.invalidate(directory)`
- Cache invalidation by directory
- Hierarchical merge: nearest directory config overrides parent directory configs
- Zero external dependencies

---

### #1051 — File Watching (future)
Replace placeholder `POST /fs/watch`:
- Real watcher (`fsnotify`)
- SSE streaming of file events

**Effort:** Medium

---

## 🗺️ Roadmap

```
Phase 1: Foundation         ✅ COMPLETED
  #1042 Bootstrap HTTP server
  #1041 Feature flags
  #1038 Branch strategy

Phase 2: Heavy I/O          ✅ COMPLETED
  #1044 Filesystem adapter (32 Go + 23 TS parity tests)
  #1040 Parity test harness (pending)
  #1045 Session event streaming (partial)

Phase 3: Observability      ✅ COMPLETED
  #1069 Shadow mode
  #1071 Metrics + circuit breaker
  #1046 Cutover plan + rollback
  #1039 Contract mapping (pending)

Phase 4: Process Spawning   ✅ COMPLETED
  #1043 process.ts + cross-spawn-spawner.ts

Phase 5: Session Completeness ✅ COMPLETED
  #1070 session-message-updater (stateful token aggregation)
  #1072 session CRUD lifecycle

Phase 6: Infra & Contracts  ✅ COMPLETED
  #1040 Parity test harness
  #1039 Contract mapping
  #1073 Legacy cleanup (after canary 100%)

Phase 7: Providers & Config ✅ COMPLETED
  #1048 Provider/model catalog
  #1049 Config system

Phase 8: Watch              ✅ COMPLETED
  #1051 File watching (fsnotify + SSE)
```

---

## 🏗️ Architecture

```
TS Runtime (Bun)
    │
    │ spawn + HTTP (localhost:43001)
    ▼
┌─────────────────────────────────────┐
│         Go Core Server              │
│                                     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ HTTP Mux  │  │   withCORS()     │ │
│  │ (net/http)│──│  middleware      │ │
│  └────┬─────┘  └──────────────────┘ │
│       │                             │
│  ┌────┴──────────┬──────────┬─────┐ │
│  │  /fs/*        │  /session/*   │ │
│  │  /health      │  /metrics     │ │
│  └────┬──────────┴──────────┬─────┘ │
│       │                     │       │
│  ┌───────────────┐  ┌────────────┐ │
│  │  filesystem/  │  │  eventbus/  │ │
│  │  (complete)   │  │  (complete) │ │
│  └───────────────┘  └────────────┘ │
│  ┌───────────────┐  ┌────────────┐ │
│  │  metrics/     │  │  updater/  │ │
│  │  (complete)   │  │ (complete) │ │
│  └───────────────┘  └────────────┘ │
│  ┌───────────────┐  ┌────────────┐ │
│  │  session/     │  │  process/  │ │
│  │  (complete)   │  │ (complete) │ │
│  └───────────────┘  └────────────┘ │
└─────────────────────────────────────┘
```

### Architecture Decisions
1. **No external dependencies**: Only Go stdlib
2. **Non-blocking PubSub**: Events dropped for slow subscribers
3. **SSE > WebSocket**: Simplicity, EventSource compatibility
4. **Feature flags in TS**: Rollout control on the TS side
5. **httptest.Server for integration**: Goroutines + channels for SSE
6. **X-Trace-ID cross-runtime**: UUID generated in TS, propagated in header, logged in Go

---

## 📊 TS Module Status

| Module | Epic Priority | Go | Issue |
|--------|---------------|-----|-------|
| `filesystem.ts` | 2nd | ✅ 100% | #1044 |
| `session.ts` (event streaming) | 3rd | ✅ SSE | #1045 |
| `process.ts` / `npm.ts` | 1st | ✅ 100% | #1043 |
| `session-message-updater.ts` | 3rd | ✅ 100% | #1070 |
| `session.ts` (CRUD lifecycle) | 3rd | ✅ 100% | #1072 |
| `session-message.ts` | 3rd | ❌ 0% | — |
| `session-prompt.ts` | 3rd | ❌ 0% | — |
| `provider.ts` | 4th | ❌ 0% | #1048 |
| `model.ts` / `models.ts` | 4th | ❌ 0% | #1048 |
| `catalog.ts` | 4th | ❌ 0% | #1048 |
| `aisdk.ts` | 4th | ❌ 0% | — |
| `npm-config.ts` | — | ❌ 0% | #1049 |
| `config.ts` (implicit) | — | ❌ 0% | #1049 |
| `event.ts` | — | ✅ via eventbus | #1045 |
| `auth.ts` | Out of scope | ❌ | — |
| `plugin/*` | Out of scope | ❌ | — |

---

## 🔗 Commits

| Commit | Date | Description |
|--------|------|-------------|
| `6c3cc87` | 2026-06-10 | docs(go-core): create comprehensive rewrite plan |
| `cfe1756` | 2026-06-10 | feat(go-core): implement session event streaming + PubSub |
| `7113849` | 2026-06-08 | feat(go-core): implement complete filesystem adapter |
| `12ebbbc` | 2026-06-08 | feat(go-core): bootstrap Go core |

---

## 📝 Notes

- `internal/config/` functional — teamcode.json[c] loader with cache + merge (#1049)
- `GET /fs/watch` SSE streaming functional (#1051)
- Version `0.1.0` in `health.go`
- Feature flags disabled by default (`go-core-available: false`, canary 0%)
- All Go modules implemented (Phases 1-5 completed)
- Next up: parity test harness (#1040) and contract mapping (#1039)
- Future: providers, config, file watching (#1048, #1049, #1051)
- This plan reflects the GitHub issues at https://github.com/ElioNeto/teamcode/issues
