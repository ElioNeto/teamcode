# SP2 — v2 Delta Producer: TypeScript → Go Core

**Date:** 2026-08-04
**Status:** Implemented behind an off-by-default flag.
**Depends on:** [SP1 results](../results/2026-08-04-sp1-delta-ingest-results.md) — verdict
**INLINE POST VIABLE** (steady p99 0.134ms, 18,365 events/sec, TCP loopback, includes the Go
updater's consolidation work).
**Owner directive:** the TS core (`packages/core`) is deprecated (bugfixes/security only); the
delta changes belong in the client; the Go core was verified to need no adjustment.

## Problem

The three v2 delta events (`session.next.text.delta`, `session.next.reasoning.delta`,
`session.next.tool.input.delta`) are the Go core's contract — its eventbus tests use them, its
updater consolidates them (`internal/updater/updater.go:49` → `handleTextDelta`), and the parity
suite publishes them. But **no production TypeScript producer publishes them**, so the Go core's
SSE stream (`GET /session/events`) never carries streaming tokens.

They cannot go through `EventV2Bridge.publish` — `SessionEvent` declares `version: 1`, which
routes every publish into the durable seq log at one DB transaction per token (measured: 3.3×
suite slowdown, reverted). The correct transport is the Go core's own ephemeral bus, fed by
`POST /session/event`, which SP1 measured at 0.134ms p99 inclusive of consolidation.

## Design

### New module: `packages/teamcode/src/session/go-core-events.ts`

A single forwarding point with constructor injection for tests:

```ts
makeGoCoreForwarder(deps?: { publish?, isReady?, isEnabled? }): {
  forward(sessionID: string, eventType: string, data: Record<string, unknown>): Effect<void>
}
```

Defaults bind to existing `@teamcode-ai/core/router` exports — `GoCoreClient.session.publish`
and `isGoCoreReady` — which are **used, not modified**, so the deprecation policy is untouched.

### Gating — three layers, all cheap

1. **Feature flag** `go-core-session-events` via the router's strangler-fig flag system,
   default `false`, enabled with `FLAG_go_core_session_events=true`. Deliberately independent of
   `TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM`: that flag governs the TS-side v2 bridge (durable log);
   this one governs forwarding to the sidecar. Tests that enable one do not accidentally pay for
   the other.
2. **Readiness**: `isGoCoreReady()` — if this process did not start a Go core, forwarding is a
   boolean check and nothing else.
3. **Circuit breaker**: the first publish failure disables forwarding for the rest of the
   process and logs one warning. A dead sidecar mid-session costs one failed request, not one
   per token. Re-enabling requires a restart — acceptable for an experimental flag, documented
   in the warning.

When the flag is off (the default), the entire feature is one function call and one boolean
test per event. The suite measured no regression (see Verification).

### Inline, not fire-and-forget — ordering is the reason

SP1's verdict licenses a synchronous inline publish (0.134ms inside a ~20ms inter-token gap ≈
0.7%). Fire-and-forget `fetch` calls have **no cross-request ordering guarantee**; interleaved
deltas would corrupt the Go updater's text assembly. The forwarder awaits each POST
(`yield* Effect.promise`), so the generator serializes them in stream order. Rejections are
handled inside the promise (breaker + log), never in the Effect error channel — the stream can
never fail because the sidecar hiccuped.

### Wiring in `processor.ts`

- `publishSessionEvent` forwards **every** v2 event to the Go core *before* the
  `experimentalEventSystem` guard — the sidecar stream needs the full sequence
  (`step.started` … `text.ended`) to consolidate, regardless of whether the TS durable bridge is
  on.

### Wire translation — a schema mismatch found during implementation

The Go updater was written against the parity test's simplified payloads, not the actual TS v2
schema, and the two disagree (verified against `go-core/internal/updater/event.go` and by live
test against the deployed 0.1.0 binary):

1. The updater reads `data.timestamp` / `data.sessionID` — the envelope's own stamp from
   `eventbus.NewEvent` is a separate field it does not use for message times.
2. `EventData.Model` is a **string**, while the TS `Step.Started` schema sends an **object**
   (`{ id, providerID, variant }`). Object-into-string fails Go's `json.Unmarshal`, the event is
   dropped, no assistant message is created, and every subsequent event of the step is orphaned —
   consolidation silently produces nothing. The parity suite never catches this because it sends
   `model: "gpt-4"`, a payload the real producer never emits.

`toGoCoreWire` in `go-core-events.ts` bridges both gaps (injects `timestamp`/`sessionID`,
flattens `model` to `"providerID/id"`), unit-tested. The proper fix is widening `EventData` in
go-core — permitted, since go-core takes new development — but Go changes cannot be built or
tested in this environment (no Go toolchain), so the shim keeps the deployed contract working
and the go-core fix is left as recorded follow-up work.
- The three delta sites call `forward` directly with schema-shaped payloads
  (`{ delta }`, `{ reasoningID, delta }`, `{ callID, delta }`) — they must **not** go through
  `events.publish` (that is the 3.3× path).

### Relationship to the open A/C decision

This change implements the Go-core leg only. The v1 `MessageV2.Event.PartDelta` bus publish
stays untouched, so SP2 is compatible with either option A (later remove `PartDelta`) or option
C (keep it) from the [delta channel decision record](./2026-08-04-v2-event-delta-channel-design.md).
SP3 (TUI consuming the Go core SSE) and SP4 (public SDK) remain future work.

## Verification

- Unit tests (`packages/teamcode/test/session/go-core-events.test.ts`): flag off → no publish;
  not ready → no publish; enabled → exact `(sessionID, type, data)` args; rejection trips the
  breaker, subsequent calls no-op, warning logged once; sequential ordering preserved.
- `tsgo --noEmit` clean.
- `test/session/` suite green with the flag at its default (off).
- Live smoke test with a running Go core and `FLAG_go_core_session_events=true`: publish the
  delta sequence, then `GET /session/messages` shows the consolidated text.
