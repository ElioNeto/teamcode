# SessionEvent Schema Completeness Audit

> Prerequisite for Phase 3 (removing legacy v1 writes). Every claim below was verified
> against the working tree — event type strings and line numbers are from the actual source.

## Verdict: **Phase 3 is BLOCKED**

The v2 event system is **not yet a superset of the v1 write path**. Five event types are defined
in the schema but never published by any producer — and all five are the *incremental* ones.

Removing the legacy v1 writes today would degrade token-by-token streaming into a single
jump at end-of-block for any consumer reading only v2 events.

## Method

1. Enumerated every `EventV2.define({ type: "..." })` in `packages/core/src/session-event.ts`.
2. Enumerated every publish site across `packages/*/src`.
3. Diffed defined vs. published.
4. For each gap, traced whether the v1 path carries data the v2 path does not.

## Inventory

**26 event types defined**, **21 distinct types published**.

### The 5 never published

| Event type | Namespace | Category |
|---|---|---|
| `session.next.text.delta` | `Text.Delta` | incremental |
| `session.next.reasoning.delta` | `Reasoning.Delta` | incremental |
| `session.next.tool.input.delta` | `Tool.Input.Delta` | incremental |
| `session.next.tool.progress` | `Tool.Progress` | incremental |
| `session.next.compaction.delta` | `Compaction.Delta` | incremental |

Defined at `session-event.ts` lines 159, 191, 227, 266, 344 respectively. No producer anywhere
in `packages/*/src` emits them.

## The blocking gap, concretely

`processor.ts` handles streaming deltas by writing **only** to the v1 path:

`text-delta` (processor.ts:582–593):

```ts
case "text-delta":
  if (!ctx.currentText) return
  ctx.currentText.text += value.text
  if (value.providerMetadata) ctx.currentText.metadata = value.providerMetadata
  yield* session.updatePartDelta({ ..., field: "text", delta: value.text })   // v1 only
  return
```

`reasoning-delta` behaves identically (`session.updatePartDelta` at processor.ts:270).

Neither case publishes a v2 event. So a pure-v2 consumer's view of a streamed assistant reply is:

```
session.next.text.started        (no payload beyond sessionID/timestamp)
session.next.text.ended          (full text, all at once)
```

The intermediate tokens exist **only** in the v1 `updatePartDelta` stream. `tool-input-delta`
(processor.ts:319–320) is an outright no-op in both paths.

### Why this matters for the ordering in EVENT_MIGRATION_MAP.md

That map sequences Text as step 2 ("self-contained streaming path", lowest risk). That
assessment was wrong in an important way: Text is low-risk to *consolidate*, but it is the
**highest**-risk group to *cut over*, because it is precisely where the v2 stream is missing data.

## Required before Phase 3 can start

1. **Make per-token events affordable — this is the real blocker, not the emission itself.**

   An earlier draft of this audit claimed emitting the 3 delta events was "additive and safe to
   land on its own." **That was measured and disproven.** Emitting `Text.Delta`,
   `Reasoning.Delta` and `Tool.Input.Delta` next to the existing `session.updatePartDelta` calls
   produced, on the `test/session/` suite with the flag on (same command, same cwd, idle machine):

   | | wall clock | result |
   |---|---|---|
   | without delta events | 108–114s | 307 pass / 0 fail |
   | with delta events | 358s | 295 pass / 12 fail |

   A **3.3× slowdown**, and 12 failures — all in timing-sensitive `shell`/`loop` tests blowing
   their ~3s budgets, i.e. collateral from the global slowdown rather than event-specific
   assertions.

   Cause: `EventV2Bridge` is a persisting path. Every `publish` fans out to the legacy bus **and**
   `SyncEvent`, which opens a DB transaction (`storage/db.ts` → `sync/index.ts`). At
   one-event-per-token that write volume is untenable.

   So the delta events cannot simply be switched on. One of these has to happen first:
   - batch/coalesce deltas before publishing (e.g. flush on an interval or a size threshold), or
   - allow per-event-type opt-out of persistence, routing deltas through an in-memory channel only, or
   - accept that v2 carries no per-token granularity and have consumers read deltas from the v1
     part-delta stream — which means v1 cannot be removed for text/reasoning at all.

   That third option is worth taking seriously: it reframes the whole migration, because it means
   the v2 event stream was never designed to be the sole transport for streaming.

   The delta emission was implemented, measured, and **reverted**. The code on this branch does
   not contain it.
2. **Decide on `Tool.Progress`** — no v1 equivalent was found. Either wire a producer or drop it
   from the schema; a defined-but-never-emitted event is a trap for consumers.
3. **Decide on `Compaction.Delta`** — `Compaction.Started`/`Ended` are published;
   `Delta` is not. Same call as above.
4. **Verify payload-level parity per event**, not just presence. This audit establishes
   *type-level* coverage. It does not yet prove that, e.g., `Step.Ended` carries every field a
   v1 consumer reads off the assistant message. That is the next pass.
5. **Only then** flip `TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM` on by default and begin removing v1
   writes in the map's order.

Steps 1–3 are independent of each other and can be done in parallel.

## Non-blocking observations

- `Shell.Started` / `Shell.Ended` are published from outside `processor.ts`, so the
  `session/` test suite does not cover them.
- `AgentSwitched` and `ModelSwitched` each have two publish sites — worth checking they cannot
  double-fire for one logical switch.
- Test coverage for v2 events is thin: only `test/v2/session-message-updater.test.ts` asserts on
  `SessionEvent` at all (4 tests). No test in `test/session/` asserts that any v2 event is
  emitted, so the suite passing with the flag on proves the path does not *crash* — not that it
  emits correctly. Any cutover work needs assertion-level tests first.

## Status of this audit

Type-level coverage: **done** (this document).
Payload-level parity per event: **not done** — required before cutover.
