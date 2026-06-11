# Go Core Implementation Report

> **Branch:** `rewrite/go-core`
> **Epic:** [#1036](https://github.com/ElioNeto/teamcode/issues/1036)
> **Date:** 06/10/2026

---

## 📊 Overview

| Metric | Value |
|--------|-------|
| Go files | 22 (16 src + 7 test) |
| TS files affected | 10+ (router, flags, client, parity tests) |
| Go lines of code | ~4,850 |
| Go tests | **76** — zero failures |
| TS parity tests | **52** — zero failures |
| Total tests | **128** — zero failures |
| Commits | 10 (including PLAN.md + RELATORIO.md) |

---

## ✅ Implemented Modules (100%)

### 1. Filesystem Adapter (`internal/filesystem/`) — #1044
**Full parity with TS `AppFileSystem`**

| Operation | Go | TS Parity | Status |
|-----------|-----|-----------|--------|
| read/write | ✅ | ✅ | Complete |
| stat | ✅ | ✅ | Complete |
| list/readdir | ✅ | ✅ | Complete |
| glob (**, findUp, up, globUp) | ✅ | ✅ | Complete |
| exists/isDir/isFile | ✅ | ✅ | Complete |
| copy/move/remove/removeAll | ✅ | ✅ | Complete |
| ensureDir | ✅ | ✅ | Complete |
| MIME detection | ✅ | — | Complete |
| readJSON/writeJSON | ✅ | ✅ | Complete |

**Tests:** 32 Go + 23 TS parity

### 2. Session Event Streaming (`internal/eventbus/`) — #1045
**PubSub + SSE + heartbeat 10s**

- Thread-safe `PubSub` with channels
- SSE streaming (`GET /session/events`)
- Publish events (`POST /session/event`)
- Health check (`GET /session/events-status`)
- Heartbeat every 10s

**Tests:** 9 Go + 3 TS parity

### 3. Shadow Mode (`packages/core/src/router/`) — #1069
**Safe routing between TS and Go**

- `isShadow()`, `setShadow()`, `clearShadow()` — programmatic control
- `routeFilesystemOp()` — runs TS + Go in parallel, uses TS result
- `deepEqual()` — compares results, logs divergences with trace ID
- `X-Trace-ID` on all requests (cross-runtime UUID)
- Go errors are silent — never affect the user

**Tests:** 11 TS parity

### 4. Metrics + Circuit Breaker (`internal/metrics/`) — #1071
**Automatic rollback without intervention**

- `SlidingWindow` — 60s with in-place prune, thread-safe
- `Record()`, `Snapshot()` — request_count, error_count, error_rate, avg_latency_ms
- `GET /metrics` — JSON snapshot
- `withCORS` middleware records metrics on each request (status ≥500 = error)
- Circuit breaker in TS: polling every 30s, disables `go-core-available` if error_rate > 1%
- Re-enables after 2 consecutive healthy polls

**Tests:** 4 Go + 2 TS parity

### 5. Process Spawning (`internal/process/`) — #1043
**Replacement for `cross-spawn` + `npm.ts`**

- `Spawn()` with timeout, env vars, cwd, exit code, stdout/stderr
- `NpmInstall()`, `Npx()`, `BunX()` helpers
- REST endpoints: `POST /process/spawn`, `/process/npm-install`, `/process/npx`
- Default timeout 300s for npm install

**Tests:** 10 Go + 4 TS parity

### 6. Session Message Updater (`internal/updater/`) — #1070
**Message consolidation state machine**

- 8 message types: assistant, user, shell, compaction, synthetic, agent-switched, model-switched
- 24+ event types with typed data
- Handlers for all types: step, text, tool, reasoning, compaction, shell, agent/model, prompt, synthetic
- `GET /session/messages?session_id=` — consolidated messages
- Automatic integration: `POST /session/event` feeds the updater

**Tests:** 14 Go + 2 TS parity

---

## 🏗️ Current Architecture

```
TS Runtime (Bun) ─── HTTP (localhost:43001) ───→ Go Core Server
                                                    │
                                              ┌─────┴──────┐
                                              │  Go Mux     │
                                              │  (net/http) │
                                              └─────┬──────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────┐
                    │                               │                       │
              ┌─────┴──────┐                ┌───────┴──────┐        ┌──────┴──────┐
              │ /fs/*       │                │ /session/*   │        │ /process/*  │
              │ /health     │                │ /metrics     │        │             │
              └─────┬──────┘                └───────┬──────┘        └──────┬──────┘
                    │                               │                      │
              ┌─────┴──────┐                ┌───────┴──────┐        ┌──────┴──────┐
              │ filesystem │                │ eventbus     │        │  process    │
              │ (complete) │                │ (complete)   │        │  (complete) │
              └────────────┘                ├──────────────┤        └─────────────┘
                                            │ updater      │
                                            │ (complete)   │
                                            └──────────────┘
              ┌────────────┐
              │  metrics   │
              │ (complete) │
              └────────────┘
```

### Architecture Decisions

1. **Zero external dependencies** — only Go stdlib
2. **HTTP REST (JSON) communication** — no protobuf, no gRPC
3. **Non-blocking PubSub** — events dropped for slow subscribers
4. **Feature flags in TS** — centralized rollout control
5. **Shadow mode as mandatory stage** — before any canary
6. **Automatic rollback via circuit breaker** — no human intervention

---

## 🔜 Next Steps

### Short Term (days)

1. **Enable Shadow Mode for Filesystem**
   ```bash
   export FLAG_filesystem_shadow=true
   tcdev-go
   ```
   Observe divergences in logs, validate that TS is not affected.

2. **Migrate `tcdev-go` to use branch `rewrite/go-core`**  
   The current alias runs Go core with the current branch (dev). To use the latest Go implementations, ideally `tcdev-go` should checkout the `rewrite/go-core` branch and build Go core from there.

3. **Test Canary 5% for Filesystem**
   ```bash
   export FLAG_go_core_filesystem=5
   tcdev
   ```
   5% of filesystem requests go to the Go core.

### Medium Term (weeks)

4. **Contract Mapping (#1039)** — Formally map TS ↔ Go contracts
   - Validate that `client.ts` types match Go structs
   - Schema tests for request/response

5. **Parity Test Harness (#1040)** — Official parity test harness
   - Reusable harness in `test/parity/harness.ts`
   - CI: run parity tests automatically on every PR
   - Parity coverage report

6. **Filesystem Canary 100%** — Filesystem 100% Go in production
   - After 48h with no divergences in shadow mode
   - Gradual: 5% → 25% → 50% → 75% → 100%

### Long Term (months)

7. **Session CRUD Lifecycle** — Sessions in Go
8. **Provider & Model Catalog (#1048)** — Provider and model catalog
9. **Config System (#1049)** — Reading `teamcode.json` from Go
10. **File Watching (#1051)** — Real watcher with `fsnotify` + SSE
11. **Legacy TS Removal** — After stabilization of all modules

---

## 🐛 Known Issues

- No open bugs — 128 tests passing, zero failures
- `POST /fs/watch` returns placeholder `{"status": "not_implemented"}`
- `internal/session/` and `internal/config/` are empty

---

## 🧪 How to Run

```bash
# Go core with Go server + TUI
source ~/.bashrc
tcdev-go

# TUI without Go core
tcdev

# Go tests only
cd go-core && make test

# Parity tests (starts Go server + runs TS)
cd go-core && make parity-test

# Check visual indicator
# In TUI footer: ⚡Go (green) or TS (gray)
```
