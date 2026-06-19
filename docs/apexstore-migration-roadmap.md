# ApexStore Evolution Roadmap: v2.3 → v6

## TeamCode Migration Strategy

**Last updated:** 2026-06-13  
**Authors:** AI-assisted analysis  
**Repositories:** `ElioNeto/ApexStore` (Rust KV engine), `ElioNeto/teamcode` (TypeScript app)

---

## Overview

This document maps ApexStore's versioned roadmap (v2.3–v6) against TeamCode's
storage needs, defining a phased migration from SQLite to ApexStore as the
single storage backend. Each phase identifies which ApexStore features are
required, which TeamCode modules must be refactored, and how to validate
the migration without disrupting users.

---

## Phase 0 — Foundation (Current: ApexStore v2.3, TeamCode current)

**Goal:** Establish observability, client completeness, and developer confidence.

### ApexStore deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #387 | REST transaction endpoints | P0 |
| #393 | TTL via REST API | P0 |
| #392 | Batch delete by prefix | P1 |
| #388 | Paginated cursor scan | P1 |

### TeamCode deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #1090 | Benchmark suite | P0 |
| — | Extend `ApexStoreClient` to use new endpoints | P0 |
| — | Add `ApexStoreClient.batchDelete(keys)` | P1 |
| — | Add `ApexStoreClient.scanWithCursor(prefix, cursor, limit)` | P1 |

### Validation
- Benchmark suite runs green with ApexStore within 30% of SQLite
- Transactional writes succeed and rollback correctly
- TTL-expired keys are invisible to reads

---

## Phase 1 — Cache & State Migration (ApexStore v2.4–2.5)

**Goal:** Move ephemeral cache and temporary state completely off SQLite
onto ApexStore. SQLite retains only durable relational data.

### ApexStore deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #391 | WebSocket/SSE subscriptions | P1 |
| #394 | Composite key range query | P1 |

### TeamCode deliverables
- Move all `CacheService` usage from SQLite to ApexStore
- Refactor `InstanceState` (worker state, agent execution state) to
  use ApexStore with TTL auto-expiry
- Implement real-time UI updates via ApexStore WebSocket subscriptions
  (replace polling in TUI)
- Add feature flag `apexstore_cache: true` — enabled by default

### Schema mapping (cache namespace)
```
cache:{key} → raw value
cache:ttl:{key} → expires_at timestamp
instance:{project_id}:{worker_id} → worker state JSON
```

### Validation
- TUI has no SQLite reads for cache data
- Agent execution state survives process restart (WAL durability)
- Real-time updates arrive within 100ms of data change

---

## Phase 2 — Event Store Migration (ApexStore v2.5–2.6)

**Goal:** Move the event store (domain events) from SQLite `StorageFile`
onto ApexStore, the second-largest SQLite consumer.

### ApexStore deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #390 | Secondary indexes | P0 |
| #389 | Value search / LIKE / substring | P1 |

### TeamCode deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #1088 | Event store migration | P0 |

### Schema mapping (event store)
```
event:{aggregate_type}:{aggregate_id}:{timestamp}:{event_id} → event JSON
# Secondary index (for query-by-type):
__idx:event_type:{event_type}:{aggregate_id}:{timestamp}:{event_id} → ""
```

### Migration strategy
1. Implement `ApexStoreEventStore` in parallel with `StorageFile`
2. Feature flag `apexstore_events: false` → `true` per workspace
3. Dual-write for 1 week (both stores receive every append)
4. One-way backfill script for existing events (SQLite → ApexStore)
5. Remove `StorageFile` and SQLite event tables

### Validation
- Event replay produces identical results from both stores
- Event append latency ≤ 5ms p95 (identical to SQLite)
- Aggregate history queries complete within 100ms

---

## Phase 3 — Session Store Migration (ApexStore v2.6–3.0)

**Goal:** Move session CRUD (the largest SQLite consumer) to ApexStore.

### ApexStore deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #394 | Composite key range query | P0 (production-ready) |
| #388 | Paginated cursor scan | P0 (production-ready) |
| — | Reverse prefix scan (descending order) | P1 |

### TeamCode deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #1089 | Session store migration | P0 |

### Schema mapping (session store)
```
session:{project_id}:{created_at_hex}:{session_id} → session JSON
session:agent:{agent_id}:{created_at_hex}:{session_id} → session_id (secondary)
session:recent:{time_updated_hex}:{session_id} → session_id (for ordering)
```

### Query translation
| SQL | ApexStore |
|-----|-----------|
| `SELECT * FROM session WHERE project_id = ? ORDER BY time_updated DESC LIMIT 50` | `GET /keys/range?prefix=session:{project_id}:&limit=50&desc=true` |
| `SELECT * FROM session WHERE agent_id = ? LIMIT 50` | `GET /keys?prefix=session:agent:{agent_id}:&limit=50` |
| `SELECT COUNT(*) FROM session WHERE project_id = ?` | `POST /keys/count` with prefix |
| `SELECT * FROM session WHERE title LIKE '%query%'` | `GET /keys/search?q=query&mode=contains` |

### Migration strategy
1. Implement `ApexStoreSessionStore` implementing the existing `SessionStore` interface
2. Dual-write sessions to both stores for 2 weeks
3. Feature flag `apexstore_sessions` — roll out per-project
4. Backfill existing sessions from SQLite
5. Remove SQLite session table + Drizzle schema

### Validation
- Session list queries are 2x faster (sorted iteration, no JOIN)
- Session creation latency ≤ 10ms p95
- Session search (LIKE) completes within 200ms
- Pagination works correctly with cursor-based tokens

---

## Phase 4 — VFS Adapter & SQLite Deprecation (ApexStore v3.0–4.0)

**Goal:** Eliminate SQLite entirely by providing a virtual file system
adapter that maps any remaining relational access patterns to ApexStore.

### ApexStore deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #387 | REST transactions | P0 |
| #390 | Secondary indexes | P0 |
| #389 | Value search / LIKE | P0 |
| — | Prefix count API | P1 |
| — | Reverse/descending scan | P1 |

### TeamCode deliverables
| Issue | Feature | Priority |
|-------|---------|----------|
| #1087 | VFS adapter | P0 |

### VFS architecture
```
┌─────────────────────────────────────────────────────┐
│                    TeamCode App                      │
├─────────────────────────────────────────────────────┤
│   Drizzle ORM ──► VFS Adapter ──► ApexStoreClient   │
│   (migration)         (driver)        (HTTP REST)    │
└─────────────────────────────────────────────────────┘
```

Alternative: skip Drizzle entirely and write a thin `StorageAdapter`
interface that both `SQLiteAdapter` and `ApexStoreAdapter` implement.

### Migration strategy
1. Build `VfsAdapter` as a Drizzle driver replacement
2. All remaining SQLite queries route through VfsAdapter
3. Run in "shadow mode" — queries execute against both stores, compare results
4. When shadow mode shows 100% consistency for 2 weeks, switch primary to ApexStore
5. Remove SQLite dependency entirely

---

## Phase 5 — Advanced Features (ApexStore v4.0–6.0)

**Goal:** Leverage ApexStore's unique capabilities beyond what SQLite offers.

### ApexStore roadmap alignment
| ApexStore v | Feature | TeamCode Benefit |
|-------------|---------|------------------|
| v4 | Data tiering (hot/warm/cold) | Archive old sessions to colder storage automatically |
| v4 | Multi-model queries (documents, graph, time-series) | Unified query API for project metadata, agent dependency graphs, usage analytics |
| v5 | Autonomous compaction tuning | Zero-maintenance storage — no manual `compact()` calls |
| v5 | CRDT engine | Offline-first collaboration between multiple TeamCode instances |
| v5 | Time travel (snapshot history) | Point-in-time recovery of any session or project state |
| v6 | Vector index | Semantic search over session content and agent outputs |
| v6 | WASM plugins | Custom compaction, custom index strategies, custom data transforms |
| v6 | Cross-datacenter replication | Multi-region TeamCode deployments |

### TeamCode enhancements enabled
- **Time travel debugging:** "Show me the project state as of yesterday at 3pm"
- **Semantic search:** Find sessions by natural language query (not just LIKE)
- **Offline collaboration:** Multiple TeamCode instances sync via CRDT
- **Automatic archiving:** Old sessions move to cold storage based on access patterns
- **Dependency graphs:** Use graph model for agent → tool → session relationships
- **Usage analytics:** Time-series queries over action frequency

---

## Timeline

```
Phase 0: Foundation              2026-Q2 (now)
Phase 1: Cache & state migration 2026-Q3
Phase 2: Event store migration   2026-Q3/Q4
Phase 3: Session store migration 2026-Q4
Phase 4: SQLite deprecation      2027-Q1
Phase 5: Advanced features       2027-Q2+
```

Each phase includes a 2-week "shadow mode" validation period before
the old store is removed. Rollback is possible at any phase boundary
by toggling the feature flag.

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ApexStore performance regresses vs SQLite | Medium | High | Phase 0 benchmarks; rollback flag per-feature |
| Data loss during migration | Low | Critical | Dual-write + backfill + shadow comparison |
| ApexStore upstream roadmap slips | Medium | High | Implement critical features in-house first |
| VFS adapter complexity too high | Low | Medium | Skip Drizzle compat; use direct adapter |
| TeamCode devs unfamiliar with ApexStore | Medium | Low | Phase 0 builds tooling + docs confidence |

---

## Dependency Graph

```
Phase 0 ──────────────────────────────────────────────┐
  ├─ Benchmarks (no deps)                               │
  ├─ Transactions ─── depends on ApexStore #387         │
  ├─ TTL API ────────── depends on ApexStore #393       │
  └─ Cursor scan ────── depends on ApexStore #388       │
                                                       │
Phase 1 ──────────────────────────────────────────────┤
  ├─ WebSocket ──────── depends on ApexStore #391       │
  └─ Range query ────── depends on ApexStore #394       │
                                                       │
Phase 2 ──────────────────────────────────────────────┤
  ├─ Event store ────── depends on ApexStore #390, #389 │
  └─ TeamCode #1088 ─── depends on Phase 1             │
                                                       │
Phase 3 ──────────────────────────────────────────────┤
  ├─ Session store ──── depends on ApexStore #394, #388 │
  └─ TeamCode #1089 ─── depends on Phase 2             │
                                                       │
Phase 4 ──────────────────────────────────────────────┤
  ├─ VFS adapter ────── depends on all ApexStore issues│
  └─ TeamCode #1087 ─── depends on Phase 3             │
                                                       │
Phase 5 ──────────────────────────────────────────────┘
  └─ Advanced features ─ depends on ApexStore v4–v6
```

---

## Success Criteria

ApexStore can be considered a complete SQLite replacement when:

1. **All 121+ SQLite usage points** are migrated — zero SQLite reads in production
2. **Performance parity** — all queries within 20% of SQLite latency (p95)
3. **Data durability** — no data loss scenarios that SQLite didn't also have
4. **Feature parity** — all query patterns (WHERE, ORDER BY, LIKE, COUNT, JOIN alternatives) are supported
5. **Operational simplicity** — no manual compaction, no WAL management, no vacuum
6. **Migration confidence** — shadow mode ran for 2+ weeks with zero discrepancies

---

## Related Issues

### ApexStore (`ElioNeto/ApexStore`)
| # | Title |
|---|-------|
| #387 | REST endpoint for multi-key transactions |
| #388 | Paginated range scan with cursor-based pagination |
| #389 | Value-based search / LIKE / substring matching |
| #390 | Secondary / multi-dimensional index support |
| #391 | WebSocket/SSE subscription for real-time change notifications |
| #392 | Batch delete by key prefix |
| #393 | TTL-based auto-expiry via REST API |
| #394 | Composite key range query endpoint |

### TeamCode (`ElioNeto/teamcode`)
| # | Title |
|---|-------|
| #1087 | Design and implement a VFS adapter to replace SQLite with ApexStore |
| #1088 | Migrate event store from SQLite StorageFile to ApexStore event stream |
| #1089 | Replace SQL session queries with ApexStore prefix + range scans |
| #1090 | ApexStore vs SQLite benchmark suite for TeamCode workloads |
