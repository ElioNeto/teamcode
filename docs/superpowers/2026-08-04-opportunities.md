# Opportunity Analysis — 2026-08-04

Every item below came out of verified findings from the v2 event-system investigation and the
SP1 measurement spike — none is speculative. Status reflects what was actually done.

## Implemented

### 1. `script/download-go-core.ts` broken on Windows/macOS — FIXED

Branch `fix/go-core-download-platform` (off `main`). The script hardcoded `.tar.gz` for every
platform; the release only ships `.tar.gz` on linux — darwin/windows ship `.zip`. The
postinstall go-core fetch therefore 404'd for every non-linux developer.

Verified end-to-end on Windows: the fixed script downloaded `teamcode-windows-x64.zip` and
produced a binary SHA256-identical to the manually-extracted one used in SP1. 6 unit tests.

### 2. SP2 — v2 delta producer to the Go core — IMPLEMENTED (flag off by default)

Branch `feat/sp2-delta-producer` (stacked on `refactor/session-event-bridge`). See
[the SP2 spec](./specs/2026-08-04-sp2-delta-producer-design.md). Enable with
`FLAG_go_core_session_events=true`. Verified by 9 unit tests, a green `test/session/` suite with
the flag off (316 pass / 0 fail), and a live smoke test: the deployed go-core 0.1.0 consolidated
the forwarded delta sequence into `"Hello, world"` via `GET /session/messages`.

**New finding from this work:** the Go updater's `EventData` disagrees with the TS v2 schema
(`model` string vs object; `data.timestamp` expected inside the payload). The parity suite never
catches it because it sends simplified payloads the real producer never emits. A tested wire
translation (`toGoCoreWire`) bridges the deployed binary; the real fix belongs in go-core.

## Documented, deliberately not implemented

### 3. Fix `EventData` in go-core (follow-up to #2)

Widening `updater.EventData.Model` to accept the TS object shape — and adding a parity test that
uses the *real* producer payloads — is the proper fix for the mismatch above. go-core takes new
development, so policy allows it. Not done here because no Go toolchain is available in this
environment: shipping uncompiled, untested Go would be guesswork.

### 4. Root `script/` is outside CI and typecheck

`script/` at the repo root is not a workspace member; root `test` is a deliberate `exit 1`. The
benchmark harness (7 tests) and the download-script tests (6 tests) pass locally but nothing
runs them in CI. Wiring root `script/` into turbo is build-system surgery with ripple effects —
needs its own change, not a rider.

### 5. Delta channel A/C decision — owner's call, still open

Whether v1 `MessageV2.Event.PartDelta` is eventually removed (A) or kept permanently (C) —
see [the decision record](./specs/2026-08-04-v2-event-delta-channel-design.md). SP2 is
compatible with both. SP3 (TUI consumes the go-core SSE) and SP4 (public SDK deprecation of
`EventMessagePartDelta`) depend on this choice.

### 6. Known pre-existing flake

`snapshot-tool-race.test.ts` failed in 4 of ~8 `test/session/` runs across the day, including on
fully reverted code — pre-existing, not related to any change above. Worth its own
investigation; timing-sensitive.
