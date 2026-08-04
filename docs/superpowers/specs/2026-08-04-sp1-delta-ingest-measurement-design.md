# SP1 — Delta Ingest Measurement Spike

**Date:** 2026-08-04
**Status:** Design approved by owner. Not yet executed.
**Parent context:** [v2 event delta channel](./2026-08-04-v2-event-delta-channel-design.md)

## Context

The v2 event system defines `Text.Delta`, `Reasoning.Delta` and `Tool.Input.Delta`, but no
TypeScript producer publishes them. The Go core, by contrast, already consumes them: it has an
in-memory ephemeral bus (`go-core/internal/eventbus`), serves SSE at `GET /session/events`,
accepts publishes at `POST /session/event`, and `packages/core/test/parity/parity.test.ts`
exercises the full v2 sequence including two `session.next.text.delta` events.

So the delta events are the Go core's contract, and closing the gap means having the TS producer
publish them. Before designing that producer, one number has to exist.

**Why this spike is a gate.** Earlier in this work, delta events were wired into the TypeScript
durable event log without measuring first. Result: a 3.3× slowdown on `test/session/`
(108–114s → 358s) and 12 failures, because each publish became a DB transaction — one per token.
That change was reverted. The same shape of risk exists here: `POST /session/event` has no batch
endpoint, and `go-core/internal/transport` uses a Unix domain socket locally but **falls back to
TCP on Windows**. One event per POST means one round-trip per token.

This spike produces the number instead of assuming it.

## Question

Can the TypeScript producer publish one v2 delta event per token to the Go core via
`POST /session/event`, at realistic streaming rates, without degrading the session — over TCP on
Windows?

## Decision rule — fixed before measuring

Stated up front deliberately. Choosing the threshold after seeing the number invites motivated
reasoning.

Reference points: LLM output streams at roughly 20–100 tokens/sec; the publish call site in
`processor.ts` is an inline `yield*` inside `handleEvent`, so it **blocks the token stream**. At
50 tokens/sec (20ms between tokens), an inline 1ms POST adds 5% overhead. That is the budget.

| p99 latency per POST | Verdict |
|---|---|
| ≤ 1ms | Inline POST viable. No Go core change needed. |
| 1–5ms | Viable only with asynchronous (fire-and-forget) publish. SP2 must be async. |
| > 5ms, or throughput below 200 events/sec sustained over 10s | **Batch endpoint required** in `go-core`. That is new development in `go-core/`, which the deprecation policy permits. |

"Sustained over 10s" is specified so the figure cannot be satisfied by a short burst against a
warm, empty bus.

## Prerequisite

A running Go core. Neither the binary nor the Go toolchain is present in this environment
(`go: command not found`; only `script/download-go-core.ts` exists — the repo was installed with
`--ignore-scripts`, which skipped the `postinstall` that fetches it).

Route chosen: `bun run script/download-go-core.ts`, which downloads
`teamcode-{platform}-{arch}.tar.gz` from the project's own GitHub releases and caches it.
**Owner authorized this download.**

Alternative, if the release asset is unavailable for this platform: install Go 1.22.2+ (per
`go-core/go.mod`) and build from source.

## Method

Two levels, in order. The second runs only if the first passes.

### Micro-benchmark (first)

A standalone script that fires N events at a running Go core and reports the latency distribution
(p50 / p95 / p99) and sustained throughput.

- Isolates transport cost from all session machinery.
- Cheap — can disqualify per-token POST in minutes without touching `processor.ts`.
- Should cover both a steady rate and a burst, since token arrival is bursty.

### Macro comparison (second, gated on the micro passing)

Wire the deltas to the Go core **as throwaway instrumentation** and run the session suite,
comparing against the established baseline.

This unavoidably touches `processor.ts` — a measurement of end-to-end cost cannot avoid the
producer. The distinction from SP2 is intent and lifetime: this wiring is temporary, is not
designed for production (no async handling, no error policy, no batching), and is **reverted once
the number is recorded**. That is precisely the loop already run for the durable-log path in this
work: implemented, measured, reverted.

If the throwaway wiring is left in place, SP1 has failed its own contract.

```bash
cd packages/teamcode && bun test --timeout 30000 test/session/
```

Baseline to beat, already measured on this machine with the flag on and off:
**108–114s, 307 pass / 17 skip / 1 todo / 0 fail.**

Pass criteria: wall-clock regression under 10% (≤ ~125s) **and** zero new failures.

This comparison is directly meaningful because it is the identical measurement that caught the
durable-log regression.

## Deliverable

1. A results document with the measured numbers.
2. A go/no-go verdict on the Go core batch endpoint, per the decision rule above.
3. The benchmark script, kept for regression use.

No change to `processor.ts` in this sub-project.

## Out of scope and known limitations

- **No `processor.ts` changes.** Producing deltas for real is SP2.
- **Unix domain socket is not on this client's path at all** — corrected after reading the code.
  `packages/core/src/router/client.ts:17-18` resolves
  `BASE_URL = "http://127.0.0.1:" + (GO_CORE_PORT ?? 43001)`, i.e. **TCP loopback on every
  platform**. The socket auto-detection in `go-core/internal/transport` applies to the server's
  *listener*, but this client never dials it. An earlier draft of this spec claimed a
  Windows-only measurement would be biased against inline POST for this reason; that claim was
  wrong and is withdrawn. Loopback TCP is the production path for this client.
- **The measured cost includes more than transport.** `handleSessionEvent`
  (`go-core/cmd/server/session_handlers.go`) publishes to the bus **and** calls
  `processEventThroughUpdater(...)` synchronously before returning `204`. Message consolidation is
  therefore inside the number. This is the right thing to measure — it is what a real publish
  costs — but the results document must say so, or the figure will be misread as pure transport.
- **Suite flakiness under contention.** `test/session/` and `test/v2/` run together produce 13–17
  failures with *different* test names per run (timeouts in `shell` / `loop` / `revert + compact`);
  run separately they are green. The macro measurement must therefore run `test/session/` alone,
  and must not be interpreted while other test processes are active. Machine idleness should be
  confirmed before each macro run — a loaded machine already produced a false 3× reading once
  during this work.

## Success criteria for the spike itself

The spike succeeds when it yields a defensible number and a verdict — not when it yields a
particular answer. "Batch endpoint required" is a successful outcome.
