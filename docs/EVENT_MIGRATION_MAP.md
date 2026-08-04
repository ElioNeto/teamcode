# v2 Event System — Migration Map

> Phase 1 deliverable. Originally written against `main` before commit `e8ebe7f`
> (`refactor(session): consolidate v2 event publishing into one helper`). That refactor has
> since landed and this document has been updated to describe the code as it now stands.
> Structural claims below were re-verified with `grep` against the current tree.

## Critical correction to the original plan

The refactoring plan described these as **"dual-write blocks to remove"**. That framing is
backwards and, if followed literally, would **delete the v2 event system instead of finishing
its migration**.

Before `e8ebe7f`, each of the 13 call sites in `processor.ts` repeated the same shape:

```ts
// FIXME(v2-migration): remove this dual-write block once v2 event system fully replaces legacy session messages
if (flags.experimentalEventSystem) {
  yield* events.publish(SessionEvent.Reasoning.Started, { ... })
}
```

`e8ebe7f` consolidated that repetition into a single helper, defined once near the top of the
processor's Effect.gen block:

```ts
// FIXME(v2-migration): to finish the migration, drop the flag guard below
// and remove the *legacy* writes at each call site. Deleting these calls
// would remove the v2 event system rather than complete its migration —
// see docs/EVENT_MIGRATION_MAP.md.
const publishSessionEvent = <D extends EventV2.Definition>(
  definition: D,
  data: Omit<EventV2.Data<D>, "sessionID" | "timestamp">,
) =>
  Effect.gen(function* () {
    if (!flags.experimentalEventSystem) return
    yield* events.publish(definition, {
      ...data,
      sessionID: ctx.sessionID,
      timestamp: DateTime.makeUnsafe(Date.now()),
    } as EventV2.Data<D>)
  })
```

Each of the 13 sites now just calls `publishSessionEvent(SomeEvent, { ...payload })`; the flag
check, `sessionID`, and `timestamp` boilerplate live in exactly one place.

`experimentalEventSystem` is defined in [`src/effect/runtime-flags.ts:69`](../packages/teamcode/src/effect/runtime-flags.ts)
as `enabledByExperimental("TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM")` — i.e. **off by default**.

So the guarded path inside `publishSessionEvent` is the **new (v2)** path, and the unguarded
legacy writes still sitting next to each call site are the **v1** path. Completing the migration
therefore means:

1. Validate v2 events carry everything v1 consumers need.
2. Flip the flag on by default.
3. **Remove the single flag guard inside `publishSessionEvent`** (one edit, not 13 — the
   consolidation already did the hard part).
4. **Remove the adjacent legacy v1 write at each of the 13 call sites** (still per-site work;
   the helper only consolidated the v2 emission, not the v1 write it sits beside).
5. Delete the `FIXME(v2-migration)` comment on `publishSessionEvent`.

Deleting the guarded call sites wholesale — the literal reading of "remove this dual-write
block" — would silently regress every v2 consumer, because the flag defaults to off and the
guarded path is the *only* place v2 events are ever published.

## Post-refactor structure (verified against the current tree)

- `packages/teamcode/src/session/processor.ts` is **831 lines**.
- There is **one** flag guard (`if (!flags.experimentalEventSystem) return`, inside
  `publishSessionEvent`) and **one** `FIXME(v2-migration)` marker, both inside that same helper.
- There are **13 call sites** of `publishSessionEvent(...)` in `processor.ts`.
- The former `SessionEvent.Retried` **ternary no longer exists**. It is now a plain
  `publishSessionEvent(SessionEvent.Retried, { ... })` call like every other site — see
  "Ternary special case (removed)" below.

Re-verify with:

```bash
wc -l packages/teamcode/src/session/processor.ts
grep -n "experimentalEventSystem\|FIXME(v2-migration)\|publishSessionEvent(" packages/teamcode/src/session/processor.ts
```

## Verified inventory — 15 sites

Line numbers below are **as of commit `e8ebe7f`** and will drift as the file is edited. Treat
the `case` label (or, for the two sites outside a `case`, the surrounding function) as the
durable anchor, and re-derive line numbers with the grep command above rather than trusting
this table across commits.

### `packages/teamcode/src/session/processor.ts` (13 sites, all via `publishSessionEvent`)

| # | Line (as of `e8ebe7f`) | `case` / location | Event published | Group |
|---|------|-----------------|-----------------|-------|
| 1 | 253 | `reasoning-start` | `SessionEvent.Reasoning.Started` | Reasoning |
| 2 | 284 | `reasoning-end` | `SessionEvent.Reasoning.Ended` | Reasoning |
| 3 | 300 | `tool-input-start` | `SessionEvent.Tool.Input.Started` | Tool |
| 4 | 326 | `tool-input-end` | `SessionEvent.Tool.Input.Ended` | Tool |
| 5 | 335 | `tool-call` | `SessionEvent.Tool.Called` | Tool |
| 6 | 426 | `tool-result` | `SessionEvent.Tool.Success` | Tool |
| 7 | 459 | `tool-error` | `SessionEvent.Tool.Failed` | Tool |
| 8 | 482 | `start-step` | `SessionEvent.Step.Started` | Step |
| 9 | 509 | `finish-step` | `SessionEvent.Step.Ended` | Step |
| 10 | 568 | `text-start` | `SessionEvent.Text.Started` | Text |
| 11 | 622 | `text-end` | `SessionEvent.Text.Ended` | Text |
| 12 | 711 | (error path after `finish`) | `SessionEvent.Step.Failed` | Step |
| 13 | 761 | (inside `SessionRetry.policy` `set` callback) | `SessionEvent.Retried` | Retry |

### `packages/teamcode/src/session/prompt.ts` (2298 lines, 2 sites — not consolidated by `e8ebe7f`)

`e8ebe7f` only touched `processor.ts`. `prompt.ts` still has its own inline
`if (flags.experimentalEventSystem) { yield* events.publish(...) }` blocks:

| # | Event published |
|---|-----------------|
| 14 | `SessionEvent.Prompted` |
| 15 | `SessionEvent.Synthetic` |

Re-locate these with:

```bash
grep -n "SessionEvent\.\(Prompted\|Synthetic\)\|experimentalEventSystem" packages/teamcode/src/session/prompt.ts
```

### Group totals

| Group | Count | Where |
|-------|-------|-------|
| Reasoning | 2 | `processor.ts` |
| Tool | 5 | `processor.ts` |
| Step | 3 | `processor.ts` |
| Text | 2 | `processor.ts` |
| Retry | 1 | `processor.ts` |
| Prompt | 2 | `prompt.ts` |

### Ternary special case (removed)

Before `e8ebe7f`, the `Retried` site (then site 13) was structurally different from the rest —
a ternary rather than an `if` block:

```ts
const event = flags.experimentalEventSystem
  ? events.publish(SessionEvent.Retried, { ... })
  : ...
```

`e8ebe7f` folded it into the same `publishSessionEvent(...)` call used everywhere else (see
line 761 in the table above). There is no longer a structurally distinct site to handle
individually; a mechanical per-site pass now treats all 13 `processor.ts` sites uniformly.

## Flag-coupled code outside the 15 sites

Flipping the default touches more than `processor.ts` and `prompt.ts`. Other readers of
`experimentalEventSystem` (re-verify with `grep -rn experimentalEventSystem packages/teamcode/src packages/teamcode/test`):

| File | Sites | Note |
|------|-------|------|
| `src/session/prompt.ts` | 4 | 2 are the FIXME-adjacent sites above; 2 are other reads |
| `src/session/compaction.ts` | 2 | no FIXME marker — easy to miss |
| `src/cli/cmd/tui/plugin/internal.ts` | 2 | TUI consumer |
| `src/effect/runtime-flags.ts` | 1 | definition |
| `test/session/snapshot-tool-race.test.ts` | 4 | |
| `test/session/prompt.test.ts` | 4 | |
| `test/session/compaction.test.ts` | 3 | |
| `test/session/processor-effect.test.ts` | 1 | |
| `test/effect/runtime-flags.test.ts` | 1 | |

`compaction.ts` is the notable one: it branches on the flag but carries no `FIXME` marker, so
a grep for `FIXME(v2-migration)` alone under-reports the migration surface.

## Recommended sequencing

Ordered by blast radius, lowest first. Each step should be independently verifiable by running
the suite with the flag both off and on. Steps 1–5 below are all "remove the legacy v1 write at
this site" work in `processor.ts` — the flag guard itself is a single edit inside
`publishSessionEvent` and is not repeated per group.

1. **Reasoning** (sites 1–2) — smallest surface, no downstream dependents.
2. **Text** (sites 10–11) — self-contained streaming path. See the caveat below: this is
   low-risk to *consolidate* but high-risk to *cut over*.
3. **Step** (sites 8, 9, 12) — note site 12 (`Step.Failed`) sits in the error path.
4. **Tool** (sites 3–7) — largest group; `Tool.Called` → `Tool.Success`/`Tool.Failed` ordering
   is observable by consumers, so sequence assertions matter here.
5. **Retry** (site 13) — no longer structurally distinct (see "Ternary special case" above);
   treat it the same as any other site.
6. **Prompt** (sites 14–15) — separate file (`prompt.ts`), not yet consolidated, separate review.
7. **Compaction** — flag reads with no FIXME; audit last, once the pattern is settled.
8. Once all legacy v1 writes are removed: delete the single flag guard inside
   `publishSessionEvent` and the `FIXME(v2-migration)` comment.

## Prerequisite before any of this — NOW ANSWERED: BLOCKED

The schema audit has been done: see [SESSION_EVENT_SCHEMA_AUDIT.md](./SESSION_EVENT_SCHEMA_AUDIT.md).

**Result: this migration cannot start yet.** Five event types are defined but never published,
and all five are the incremental ones (`Text.Delta`, `Reasoning.Delta`, `Tool.Input.Delta`,
`Tool.Progress`, `Compaction.Delta`). The delta path exists **only** in v1
(`session.updatePartDelta`). Cutting over today would turn token-by-token streaming into a single
jump at end-of-block.

This also **corrects the sequencing above**: Text is listed as step 2 on the grounds of being a
"self-contained streaming path", but it is in fact the *highest*-risk group to cut over, because
it is exactly where the v2 stream is missing data. The order above is still valid for
*consolidating* call sites (already done, by `e8ebe7f`, for the 13 `processor.ts` sites); it is
not valid for *removing* v1 writes until the delta events are emitted.

## Blocked

This migration cannot currently be executed or validated in this environment: `bun` is not
installed and `node_modules` is absent, so `bun test` and `tsgo --noEmit` cannot run. See the
plan file's Blockers section.
