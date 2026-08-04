# v2 Event System — Delta Channel: Findings and Options

**Date:** 2026-08-04
**Status:** SUPERSEDED IN PART — see "Correction" immediately below. No code change made.
**Purpose of v2 (confirmed by owner):** multi-client sync — remote clients (web console, mobile,
shared sessions) reconstruct and catch up on session state by sequence number.

## Correction (supersedes Option C and part of Finding 4)

Two constraints supplied by the owner after this document was first written invalidate its
recommendation:

1. **The TypeScript core (`packages/core`) is deprecated** — bugfixes and security patches only.
   `docs/ARCHITECTURE.md` records the same ("core TS = deprecated" in CODEOWNERS). Any design that
   moves code *into* `packages/core` is therefore wrong, including this document's original
   framing of Option A.
2. **The delta work belongs in the client**, with the Go core checked for required adjustment.

Investigating the Go core changes the conclusion outright:

- `go-core/internal/eventbus` is an in-memory PubSub bus for session events, explicitly
  "matching the EventV2 + Bus system in the TypeScript core", with `MarshalSSE()`. Grepping it for
  `sql|db|Insert|persist` returns nothing — it is purely ephemeral.
- It is wired into the server: `POST /session/event` publishes, `GET /session/events` serves SSE
  (with `server.connected` / `server.heartbeat` frames mirroring the TS `handlers/event.ts`).
- Its own tests use `"session.next.text.delta"` as the example event type.
- `packages/core/test/parity/parity.test.ts` publishes the **full v2 sequence including two
  `session.next.text.delta` events** to the Go core and then reads consolidated messages back via
  `GET /session/messages`.

**Therefore the three `*.Delta` types are not vestigial — they are the Go core's contract.**
Option C ("delete the three vestigial types") would have deleted an interface the Go core already
implements and tests against. Do not do it.

**And the Go core needs no adjustment for the delta change.** It already accepts, buses, streams,
and consolidates delta events. The gap is entirely on the TypeScript producer side: `processor.ts`
never publishes them.

What survives from the original analysis: the measured finding that routing deltas through the
**durable seq log** is prohibitively expensive (Finding 3) is still correct and still matters — the
seq log is simply not where deltas were ever meant to go.

**New open question this raises:** `/session/event` has no batch endpoint, and
`go-core/internal/transport` uses a Unix domain socket locally but falls back to **TCP on
Windows**. One event per POST means one round-trip per token. That is the same shape of problem as
the DB-transaction-per-token issue and must be measured, not assumed.

## Why this document exists

The approved refactoring plan contained a Phase 3: "complete the v2 event system migration —
remove all 15 dual-write blocks, reach 100% v2 adoption." This document records why that goal is
not achievable as written, what the actual architecture is, and what the real options are.

Nothing here is speculative — every claim was verified against the source or measured.

## Finding 1 — The migration goal was based on an inverted reading

The 15 `FIXME(v2-migration)` sites have this shape:

```ts
// FIXME(v2-migration): remove this dual-write block once v2 event system fully replaces legacy session messages
if (flags.experimentalEventSystem) {
  yield* events.publish(SessionEvent.Reasoning.Started, { ... })
}
```

`experimentalEventSystem` is `enabledByExperimental("TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM")`
(`src/effect/runtime-flags.ts:69`) — **off by default**. The guarded block is therefore the *new*
v2 path; the surrounding unguarded code is the *legacy* v1 path.

"Remove this dual-write block" read literally would delete the v2 event system. Completing the
migration means the opposite: drop the flag guard, keep the publish, remove the adjacent legacy
write.

See `docs/EVENT_MIGRATION_MAP.md` for the verified inventory of all 15 sites.

## Finding 2 — Five event types are defined but never published

Of 26 event types defined in `packages/core/src/session-event.ts`, 21 are published somewhere in
`packages/*/src`. The 5 that are not:

| Event type | Namespace |
|---|---|
| `session.next.text.delta` | `Text.Delta` |
| `session.next.reasoning.delta` | `Reasoning.Delta` |
| `session.next.tool.input.delta` | `Tool.Input.Delta` |
| `session.next.tool.progress` | `Tool.Progress` |
| `session.next.compaction.delta` | `Compaction.Delta` |

All five are incremental. A pure-v2 consumer therefore sees `text.started` then `text.ended`
(full text), with nothing in between.

See `docs/SESSION_EVENT_SCHEMA_AUDIT.md`.

## Finding 3 — Emitting the deltas naively is prohibitively expensive (measured)

Emitting `Text.Delta`, `Reasoning.Delta` and `Tool.Input.Delta` alongside the existing
`session.updatePartDelta` calls, on `test/session/` with the flag on, same command, same cwd,
verified-idle machine:

| | wall clock | result |
|---|---|---|
| without delta events | 108–114s | 307 pass / 0 fail |
| with delta events | 358s | 295 pass / **12 fail** |

A 3.3× slowdown. The 12 failures were all timing-sensitive `shell`/`loop` tests blowing ~3s
budgets — collateral from the global slowdown, not event-specific assertions.

**Cause:** `SessionEvent` declares `options = { aggregate: "sessionID", version: 1 }` for every
event. In `EventV2Bridge` (`src/event-v2-bridge.ts:62-77`) that routes every publish down the
persisting branch:

```ts
if (definition.version !== undefined && typeof aggregateID === "string") {
  return provideEventLocation(event, sync.run(toSyncDefinition(definition), event.data))  // persisted
}
return provideEventLocation(event, bus.publish(...))                                       // ephemeral
```

`sync.run` writes two rows in a transaction (`src/sync/index.ts`): an upsert into
`EventSequenceTable` (monotonic `seq` per aggregate) and an insert into `EventTable`. At one event
per token that is one transaction per token.

This log is authoritative, not incidental: it is read by `control-plane/workspace.ts:716`
(ordered by `seq`) and by the client sync endpoint `handlers/sync.ts:84-90` (events after the
client's known `seq`), and replayed via `SyncEvent.replay` / `replayAll`.

## Finding 4 — There is no bug. v1 already does the right thing.

`Session.updatePartDelta` (`src/session/session.ts:914-922`) is, in full:

```ts
const updatePartDelta = Effect.fnUntraced(function* (input: {...}) {
  yield* bus.publish(MessageV2.Event.PartDelta, input)
})
```

A pure ephemeral bus publish — no database write. And the bus is the live transport to remote
clients: `handlers/event.ts` does `bus.subscribeAll()` with
`contentType: "text/event-stream"`.

So streaming to remote clients **already works today**, and already works the way it should:
increments ephemeral over SSE, settled state durable in the seq log.

The routing mechanism for exactly this distinction already exists and is deliberate:

| concern | declaration | path | transport | remote client |
|---|---|---|---|---|
| durable facts | has `version` | `sync.run` → `EventTable` + `seq` | sync endpoint | catch-up by seq |
| ephemeral increments | no `version` | `bus.publish` | SSE | live |

The three v2 `*.Delta` types are on the wrong side of that line. They were never the missing
piece; they were the wrong piece.

## Options

### A — Migrate the delta channel

Define the 3 `*.Delta` types without `version` (routing them to the ephemeral bus) **and** remove
the v1 `bus.publish(MessageV2.Event.PartDelta)`. One delta event, cost identical to today, and the
dual-write genuinely eliminated for streaming.

Benefit for the stated multi-client-sync purpose: today a remote client must subscribe to two
vocabularies — `MessageV2.Event.PartDelta` for tokens and `SessionEvent.*` for facts. This gives
one.

Cost: **breaking change for consumers**, though a smaller surface than first assumed. Verified
consumers of `message.part.delta`:

- `src/cli/cmd/tui/context/sync.tsx` — the TUI, which maintains its own delta buffering
  (`pendingPartDeltas`)
- `packages/sdk/js/src/v2/gen/types.gen.ts:2480` — the generated **public SDK** type
  `EventMessagePartDelta`

`packages/console/app/src` has **no** references — the web console does not consume deltas.

The SDK exposure is the real constraint: external consumers may depend on
`"message.part.delta"`, so this is a public API change, not just an internal refactor.

There is also a layering consequence: `message.part.delta` is defined in **teamcode**
(`src/session/message-v2.ts:548`), whereas `SessionEvent` lives in **core**. Option A therefore
moves the delta vocabulary from the runtime package up into core — it raises the abstraction a
layer rather than merely swapping transports.

### B — Batch deltas into the persisted log

Keep `version: 1`, flush deltas on an interval or size threshold.

Rejected. It pays complexity (a flush state machine in the processor, with ordering hazards
against `Ended`) *and* storage, in order to durably persist data that is already correctly
ephemeral — and every syncing client would have to download the whole token stream.

### C — Delete the three vestigial types

Keep v1 `PartDelta` as the permanent delta channel; remove `Text.Delta`, `Reasoning.Delta` and
`Tool.Input.Delta` from the schema.

Zero risk, zero work. Price: the "100% v2" goal is explicitly abandoned and two event
vocabularies become permanent.

## Recommendation

**A is the principled end state; C is the honest pragmatic one. B is out.**

The difference between A and C is not technical — it is whether a consumer migration is worth
paying for a single event vocabulary.

Independently of that choice, two things should happen:

1. **`Tool.Progress` and `Compaction.Delta`** need a decision too. `Tool.Progress` has no v1
   equivalent; `Compaction.Started`/`Ended` are published but `Delta` is not. A defined-but-never-
   emitted event is a trap for consumers.
2. **Phase 3's stated goal should be rewritten to name its scope explicitly.** "100% v2 adoption /
   remove all dual-writes" is achievable *only* under option A, and only after a consumer
   migration. Under option C it is permanently unachievable by design, and that is a legitimate
   outcome — not a failure. Either way the goal as currently written is misleading, because it
   reads as applying to all 15 sites when the streaming sites are a separate question with a
   separate answer. Restate it as: complete the migration for the **durable-fact** events, and
   decide the delta channel separately.

## Decision

Owner elected to **document and stop** — no code change to the delta channel pending team
discussion.

## What did change (separate from this decision)

On branch `refactor/session-event-bridge`, `src/session/processor.ts` only:

- The 13 repeated flag-guard/`sessionID`/`timestamp` blocks were consolidated into one
  `publishSessionEvent` helper. 13 flag guards → 1; 13 `FIXME` markers → 1; 884 → 831 lines
  (+97/−150).
- Practical effect: flipping the flag to on-by-default is now a one-line change instead of 13
  scattered edits.
- Verified: `tsgo --noEmit` exit 0; `test/session/` 307 pass / 0 fail with the flag both on and
  off, matching the pre-change baseline.

The delta emission described in Finding 3 was implemented, measured, and reverted. It is not on
the branch.

## Open items not addressed

- Payload-level parity per event (this work established type-level coverage only). Required before
  any cutover of the durable-fact events.
- v2 assertion coverage is thin: only `test/v2/session-message-updater.test.ts` asserts on
  `SessionEvent` at all (4 tests). No test in `test/session/` asserts that any v2 event is
  emitted, so a green suite with the flag on proves the path does not crash — not that it emits
  correctly.
- `test/session/` and `test/v2/` run together produce 13–17 flaky failures with *different* test
  names per run (timeouts in `shell`/`loop`/`revert + compact`). Run separately they are green.
  Suite interference under contention, unexamined.
