# v2 Event System — Migration Map

> Phase 1 deliverable. Every line number below was verified against the working tree
> (branch `main`, clean) — not inferred.

## Critical correction to the original plan

The refactoring plan described these as **"dual-write blocks to remove"**. That framing is
backwards and, if followed literally, would **delete the v2 event system instead of finishing
its migration**.

The actual shape of the code is:

```ts
// FIXME(v2-migration): remove this dual-write block once v2 event system fully replaces legacy session messages
if (flags.experimentalEventSystem) {
  yield* events.publish(SessionEvent.Reasoning.Started, { ... })
}
```

`experimentalEventSystem` is defined in [`src/effect/runtime-flags.ts:69`](../packages/teamcode/src/effect/runtime-flags.ts)
as `enabledByExperimental("TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM")` — i.e. **off by default**.

So the guarded block is the **new (v2)** path, and the surrounding unguarded code is the
**legacy (v1)** path. Completing the migration therefore means:

1. Validate v2 events carry everything v1 consumers need.
2. Flip the flag on by default.
3. **Remove the flag guard, keep the `events.publish` call.**
4. **Remove the adjacent legacy v1 write.**
5. Delete the `FIXME(v2-migration)` comment.

Deleting the `if (flags.experimentalEventSystem) { ... }` block wholesale — the literal reading
of "remove this dual-write block" — would silently regress every v2 consumer.

## Verified inventory — 15 sites

### `packages/teamcode/src/session/processor.ts` (884 lines, 13 sites)

| # | Line | Event published | Group |
|---|------|-----------------|-------|
| 1 | 234 | `SessionEvent.Reasoning.Started` | Reasoning |
| 2 | 272 | `SessionEvent.Reasoning.Ended` | Reasoning |
| 3 | 293 | `SessionEvent.Tool.Input.Started` | Tool |
| 4 | 324 | `SessionEvent.Tool.Input.Ended` | Tool |
| 5 | 341 | `SessionEvent.Tool.Called` | Tool |
| 6 | 437 | `SessionEvent.Tool.Success` | Tool |
| 7 | 475 | `SessionEvent.Tool.Failed` | Tool |
| 8 | 503 | `SessionEvent.Step.Started` | Step |
| 9 | 535 | `SessionEvent.Step.Ended` | Step |
| 10 | 599 | `SessionEvent.Text.Started` | Text |
| 11 | 659 | `SessionEvent.Text.Ended` | Text |
| 12 | 755 | `SessionEvent.Step.Failed` | Step |
| 13 | 810 | `SessionEvent.Retried` | Retry |

Site 13 differs structurally — it is a **ternary**, not an `if` block:

```ts
const event = flags.experimentalEventSystem
  ? events.publish(SessionEvent.Retried, { ... })
  : ...
```

It needs individual handling; a mechanical block-removal pass will not cover it.

### `packages/teamcode/src/session/prompt.ts` (2298 lines, 2 sites)

| # | Line | Event published |
|---|------|-----------------|
| 14 | 1619 | `SessionEvent.Prompted` |
| 15 | 1633 | `SessionEvent.Synthetic` |

### Group totals (corrects the plan)

The plan claimed `Reasoning 2, Step 3, Text 2, Tool 4, Retry 2`. Verified actual:

| Group | Plan said | Actual |
|-------|-----------|--------|
| Reasoning | 2 | 2 ✓ |
| Tool | 4 | **5** |
| Step | 3 | 3 ✓ |
| Text | 2 | 2 ✓ |
| Retry | 2 | **1** |
| Prompt (`prompt.ts`) | 2 | 2 ✓ |

## Flag-coupled code outside the 15 sites

Flipping the default touches more than `processor.ts` and `prompt.ts`. Other readers of
`experimentalEventSystem`:

| File | Sites | Note |
|------|-------|------|
| `src/session/prompt.ts` | 4 | 2 are the FIXME sites; 2 are other reads |
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
the suite with the flag both off and on.

1. **Reasoning** (sites 1–2) — smallest surface, no downstream dependents.
2. **Text** (sites 10–11) — self-contained streaming path.
3. **Step** (sites 8, 9, 12) — note site 12 (`Step.Failed`) sits in the error path.
4. **Tool** (sites 3–7) — largest group; `Tool.Called` → `Tool.Success`/`Tool.Failed` ordering
   is observable by consumers, so sequence assertions matter here.
5. **Retry** (site 13) — structurally distinct (ternary).
6. **Prompt** (sites 14–15) — separate file, separate review.
7. **Compaction** — flag reads with no FIXME; audit last, once the pattern is settled.

## Prerequisite before any of this — NOW ANSWERED: BLOCKED

The schema audit has been done: see [SESSION_EVENT_SCHEMA_AUDIT.md](./SESSION_EVENT_SCHEMA_AUDIT.md).

**Result: this migration cannot start yet.** Five event types are defined but never published,
and all five are the incremental ones (`Text.Delta`, `Reasoning.Delta`, `Tool.Input.Delta`,
`Tool.Progress`, `Compaction.Delta`). The delta path exists **only** in v1
(`session.updatePartDelta`). Cutting over today would turn token-by-token streaming into a single
jump at end-of-block.

This also **corrects the sequencing below**: Text is listed as step 2 on the grounds of being a
"self-contained streaming path", but it is in fact the *highest*-risk group to cut over, because
it is exactly where the v2 stream is missing data. The order below is still valid for
*consolidating* call sites; it is not valid for *removing* v1 writes until the delta events are
emitted.

## Blocked

This migration cannot currently be executed or validated in this environment: `bun` is not
installed and `node_modules` is absent, so `bun test` and `tsgo --noEmit` cannot run. See the
plan file's Blockers section.
