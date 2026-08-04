# SP1 Delta Ingest Measurement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a defensible number for what it costs to publish one v2 delta event per token to the Go core, and a go/no-go verdict on whether `go-core` needs a batch ingest endpoint.

**Architecture:** Two-level measurement. A standalone Bun benchmark script POSTs events at `POST /session/event` on a locally running Go core and reports latency percentiles plus throughput sustained over 10s. Only if that passes a pre-fixed threshold do we wire deltas into `processor.ts` as throwaway instrumentation and re-run the session suite against a known baseline, then revert. No production code survives this spike.

**Tech Stack:** Bun 1.3.14 (test runner and script runtime), Go core prebuilt binary (Go toolchain not installed), TypeScript, `fetch` against TCP loopback.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-04-sp1-delta-ingest-measurement-design.md`
- Platform: Windows. Shell examples below use PowerShell where invocation differs from POSIX.
- `bun` 1.3.14 is installed. Dependencies were installed with `--ignore-scripts`, so the `postinstall` that fetches the Go core binary never ran.
- No Go toolchain (`go: command not found`). Do not plan on building from source unless Task 1 Step 3 fails.
- Transport is **TCP loopback on all platforms**: `BASE_URL = "http://127.0.0.1:" + (GO_CORE_PORT ?? 43001)` (`packages/core/src/router/client.ts:17-18`). The Unix socket in `go-core/internal/transport` is the server listener's option and is not on this client's path.
- `POST /session/event` request body is exactly `{"session_id": string, "event_type": string, "data": <raw JSON>}`; success response is `204 No Content`; empty `session_id` or `event_type` yields `400`.
- The handler publishes to the bus **and** calls `processEventThroughUpdater(...)` synchronously before responding. Message consolidation is inside every measured figure and must be stated as such.
- Decision rule, fixed before any measurement (do not renegotiate after seeing numbers):
  - p99 ≤ 1ms → inline POST viable, no Go core change
  - p99 1–5ms → viable only with async publish; SP2 must be async
  - p99 > 5ms, **or** throughput below 200 events/sec sustained over 10s → batch endpoint required in `go-core`
- Macro baseline to compare against, already measured on this machine with the event-system flag both on and off: **108–114s wall clock, 307 pass / 17 skip / 1 todo / 0 fail** for `test/session/`.
- Current branch is `refactor/session-event-bridge` with an uncommitted event-bridge refactor to `packages/teamcode/src/session/processor.ts`. Do not revert or commit that refactor as part of this spike.
- Macro runs must execute `test/session/` **alone** on a verified-idle machine. Running it together with `test/v2/` produces 13–17 failures with different test names per run.

## File Structure

| File | Responsibility |
|---|---|
| `script/bench-delta-ingest.ts` (create) | Benchmark harness. Exports pure `percentile()` and `summarize()` for unit testing; `main()` drives steady and burst runs and prints a report. Preserved after the spike. |
| `script/bench-delta-ingest.test.ts` (create) | Unit tests for the statistics functions. A wrong percentile silently corrupts the verdict, so it gets real tests. |
| `docs/superpowers/results/2026-08-04-sp1-delta-ingest-results.md` (create) | Measured numbers, environment, caveats, and the go/no-go verdict. |
| `packages/teamcode/src/session/processor.ts` (modify, then revert) | Throwaway macro instrumentation only. Must end the spike byte-identical to how it started. |

---

### Task 1: Get a running Go core and prove it responds

**Files:**
- No source changes. This task produces a running process and a recorded address.

**Interfaces:**
- Consumes: nothing.
- Produces: a Go core listening on `http://127.0.0.1:43001` (or the port recorded in the results doc if `GO_CORE_PORT` is overridden), answering `GET /health`.

- [ ] **Step 1: Fetch the Go core binary**

The owner authorized this download. It pulls `teamcode-{platform}-{arch}.tar.gz` from the project's own GitHub releases.

```bash
bun run script/download-go-core.ts
```

- [ ] **Step 2: Locate the installed binary**

The script caches to `$XDG_DATA_HOME/teamcode/bin`, else `$HOME/.local/share/teamcode/bin`. On Windows `process.env.HOME` is frequently undefined, in which case the script's fallback resolves to `/tmp/.local/share/teamcode/bin`, which Git Bash maps under its own root. Check both:

```bash
ls "$HOME/.local/share/teamcode/bin" /tmp/.local/share/teamcode/bin 2>/dev/null
```

Record the resolved path. If neither exists, read the tail of the Step 1 output for the destination it printed.

- [ ] **Step 3: Start the server in the background**

Substitute the path from Step 2 for `<BIN>`.

```bash
GO_CORE_PORT=43001 "<BIN>" > /tmp/go-core.log 2>&1 &
```

If Step 1 produced no usable binary for this platform, stop and report. The fallback is installing Go 1.22.2+ per `go-core/go.mod` and running `go build ./cmd/server`, which requires a new authorization for a toolchain install.

- [ ] **Step 4: Verify it answers**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:43001/health
```

Expected: `200`. If it fails, read `/tmp/go-core.log`.

- [ ] **Step 5: Verify the endpoint under test accepts a delta event**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:43001/session/event \
  -H "Content-Type: application/json" \
  -d '{"session_id":"ses_bench","event_type":"session.next.text.delta","data":{"delta":"hi"}}'
```

Expected: `204`. Anything else means the shape assumption is wrong — stop and re-read `go-core/cmd/server/session_handlers.go` before continuing.

- [ ] **Step 6: Commit nothing**

This task changes no tracked files. Confirm the tree still shows only the pre-existing refactor:

```bash
git status --porcelain
```

Expected: `M packages/teamcode/src/session/processor.ts` plus untracked `docs/` entries. No new modifications.

---

### Task 2: Build the benchmark and apply the decision rule

**Files:**
- Create: `script/bench-delta-ingest.ts`
- Test: `script/bench-delta-ingest.test.ts`

**Interfaces:**
- Consumes: a running Go core from Task 1.
- Produces:
  - `percentile(sorted: number[], p: number): number` — linear-interpolated percentile over a pre-sorted ascending sample; throws on empty input.
  - `summarize(samples: number[]): { count: number; p50: number; p95: number; p99: number; min: number; max: number; mean: number }` — sorts a copy, does not mutate its argument.
  - A CLI entrypoint printing a report block that Task 4 transcribes.

- [ ] **Step 1: Write the failing tests for the statistics functions**

Create `script/bench-delta-ingest.test.ts`:

```ts
import { describe, expect, test } from "bun:test"
import { percentile, summarize } from "./bench-delta-ingest"

describe("percentile", () => {
  test("interpolates between neighbours", () => {
    expect(percentile([1, 2, 3, 4], 50)).toBe(2.5)
  })

  test("returns an exact element when the rank lands on one", () => {
    expect(percentile([10, 20, 30], 50)).toBe(20)
  })

  test("handles the upper tail without overrunning the array", () => {
    const sample = Array.from({ length: 100 }, (_, i) => i + 1)
    expect(percentile(sample, 99)).toBeCloseTo(99.01, 5)
  })

  test("p100 is the maximum", () => {
    expect(percentile([5, 9, 42], 100)).toBe(42)
  })

  test("throws on an empty sample rather than returning NaN", () => {
    expect(() => percentile([], 50)).toThrow("empty sample")
  })
})

describe("summarize", () => {
  test("does not mutate the caller's array", () => {
    const input = [3, 1, 2]
    summarize(input)
    expect(input).toEqual([3, 1, 2])
  })

  test("reports count, bounds and mean", () => {
    const s = summarize([4, 1, 3, 2])
    expect(s.count).toBe(4)
    expect(s.min).toBe(1)
    expect(s.max).toBe(4)
    expect(s.mean).toBe(2.5)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd script && bun test bench-delta-ingest.test.ts
```

Expected: FAIL — the module does not exist yet, so the import cannot resolve.

- [ ] **Step 3: Write the benchmark script**

Create `script/bench-delta-ingest.ts`:

```ts
// Measures the cost of publishing one v2 delta event per token to the Go core.
// See docs/superpowers/specs/2026-08-04-sp1-delta-ingest-measurement-design.md
//
// Reported latency includes the Go handler's synchronous call to
// processEventThroughUpdater, not transport alone.

const PORT = process.env["GO_CORE_PORT"] ?? "43001"
const BASE_URL = `http://127.0.0.1:${PORT}`
const SESSION_ID = "ses_bench_sp1"
const EVENT_TYPE = "session.next.text.delta"

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) throw new Error("percentile of empty sample")
  const rank = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(rank)
  const hi = Math.ceil(rank)
  if (lo === hi) return sorted[lo]!
  return sorted[lo]! + (rank - lo) * (sorted[hi]! - sorted[lo]!)
}

export function summarize(samples: number[]) {
  const sorted = [...samples].sort((a, b) => a - b)
  const total = sorted.reduce((acc, n) => acc + n, 0)
  return {
    count: sorted.length,
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    mean: total / sorted.length,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  }
}

async function publishOnce(index: number): Promise<number> {
  const body = JSON.stringify({
    session_id: SESSION_ID,
    event_type: EVENT_TYPE,
    data: { delta: `tok${index}` },
  })
  const start = performance.now()
  const res = await fetch(`${BASE_URL}/session/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  const elapsed = performance.now() - start
  if (res.status !== 204) throw new Error(`expected 204, got ${res.status}`)
  return elapsed
}

async function assertServerUp(): Promise<void> {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error(`go-core not healthy at ${BASE_URL}: ${res.status}`)
}

/** Fires sequentially for durationMs, mirroring the inline blocking publish in processor.ts. */
async function steady(durationMs: number) {
  const samples: number[] = []
  const started = performance.now()
  let i = 0
  while (performance.now() - started < durationMs) {
    samples.push(await publishOnce(i++))
  }
  const wall = performance.now() - started
  return { samples, wall, throughput: (samples.length / wall) * 1000 }
}

/** Fires `size` requests concurrently to model bursty token arrival. */
async function burst(size: number) {
  const started = performance.now()
  const samples = await Promise.all(Array.from({ length: size }, (_, i) => publishOnce(i)))
  const wall = performance.now() - started
  return { samples, wall, throughput: (size / wall) * 1000 }
}

function report(label: string, r: { samples: number[]; wall: number; throughput: number }) {
  const s = summarize(r.samples)
  console.log(`\n--- ${label} ---`)
  console.log(`events           ${s.count}`)
  console.log(`wall clock       ${r.wall.toFixed(0)} ms`)
  console.log(`throughput       ${r.throughput.toFixed(1)} events/sec`)
  console.log(`latency p50      ${s.p50.toFixed(3)} ms`)
  console.log(`latency p95      ${s.p95.toFixed(3)} ms`)
  console.log(`latency p99      ${s.p99.toFixed(3)} ms`)
  console.log(`latency min/max  ${s.min.toFixed(3)} / ${s.max.toFixed(3)} ms`)
  return s
}

async function main() {
  await assertServerUp()

  // Discard a short warmup so JIT and connection setup do not land in the sample.
  await steady(1000)

  const steadyRun = await steady(10_000)
  const steadyStats = report("steady, sequential, 10s", steadyRun)

  const burstRun = await burst(500)
  report("burst, 500 concurrent", burstRun)

  console.log(`\n--- decision rule ---`)
  const p99 = steadyStats.p99
  const tput = steadyRun.throughput
  if (tput < 200) {
    console.log(`throughput ${tput.toFixed(1)}/s < 200/s -> BATCH ENDPOINT REQUIRED`)
  } else if (p99 > 5) {
    console.log(`p99 ${p99.toFixed(3)}ms > 5ms -> BATCH ENDPOINT REQUIRED`)
  } else if (p99 > 1) {
    console.log(`p99 ${p99.toFixed(3)}ms in 1-5ms -> ASYNC PUBLISH REQUIRED in SP2`)
  } else {
    console.log(`p99 ${p99.toFixed(3)}ms <= 1ms -> INLINE POST VIABLE, no go-core change`)
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
cd script && bun test bench-delta-ingest.test.ts
```

Expected: PASS, 7 tests.

- [ ] **Step 5: Confirm the harness fails loudly when the server is down**

Stop the Go core, then:

```bash
bun run script/bench-delta-ingest.ts
```

Expected: exits non-zero printing `go-core not healthy`. A benchmark that silently reports zeros against a dead server is worse than no benchmark. Restart the server afterwards.

- [ ] **Step 6: Run the benchmark**

Confirm the machine is idle first — a loaded machine already produced one false 3× reading during this work.

```bash
bun run script/bench-delta-ingest.ts
```

Capture the full output verbatim for Task 4.

- [ ] **Step 7: Commit the harness**

```bash
git add script/bench-delta-ingest.ts script/bench-delta-ingest.test.ts
git commit -m "test: add delta ingest benchmark harness for SP1"
```

- [ ] **Step 8: Apply the gate**

Read the `decision rule` block the script printed.

- `BATCH ENDPOINT REQUIRED` → **skip Task 3 entirely** and go to Task 4. The verdict is settled; a macro run adds nothing.
- `ASYNC PUBLISH REQUIRED` or `INLINE POST VIABLE` → proceed to Task 3.

---

### Task 3: Macro measurement with throwaway instrumentation

Run this task **only** if Task 2 Step 8 sent you here.

**Files:**
- Modify then revert: `packages/teamcode/src/session/processor.ts`

**Interfaces:**
- Consumes: the verdict from Task 2; the running Go core from Task 1.
- Produces: a wall-clock figure and pass/fail count for `test/session/` with deltas publishing to the Go core. Produces **no** lasting source change.

- [ ] **Step 1: Record the exact pre-change state so the revert can be proven**

```bash
git rev-parse HEAD && git diff --stat packages/teamcode/src/session/processor.ts
```

Expected: `1 file changed, 97 insertions(+), 150 deletions(-)` — the pre-existing event-bridge refactor. Note this figure; Step 6 must reproduce it exactly.

- [ ] **Step 2: Add the throwaway publish**

In `packages/teamcode/src/session/processor.ts`, find the `text-delta` case (it currently reads):

```ts
          case "text-delta":
            if (!ctx.currentText) return
            ctx.currentText.text += value.text
```

Insert a fire-and-forget POST immediately after the `if (!ctx.currentText) return` guard:

```ts
          case "text-delta":
            if (!ctx.currentText) return
            // SP1 THROWAWAY INSTRUMENTATION — remove before ending the spike.
            void fetch(`http://127.0.0.1:${process.env["GO_CORE_PORT"] ?? "43001"}/session/event`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: ctx.sessionID,
                event_type: "session.next.text.delta",
                data: { delta: value.text },
              }),
            }).catch(() => {})
            ctx.currentText.text += value.text
```

Use `void fetch(...)` with a swallowed rejection deliberately: Task 2 measured the synchronous cost already, and the macro run is about whether the surrounding suite degrades. If Task 2's verdict was `INLINE POST VIABLE`, also run a second pass with `await` in place of `void` to measure the blocking variant, recording both.

- [ ] **Step 3: Typecheck**

```bash
cd packages/teamcode && bun run typecheck
```

Expected: exit 0.

- [ ] **Step 4: Run the session suite alone on an idle machine**

```bash
cd packages/teamcode && bun test --timeout 30000 test/session/
```

Record wall clock and the pass/fail/skip/todo counts.

Pass criteria: wall clock ≤ ~125s (under 10% over the 108–114s baseline) **and** 307 pass / 0 fail.

- [ ] **Step 5: Revert the instrumentation**

```bash
git checkout -- packages/teamcode/src/session/processor.ts
```

This restores the file to the committed state, which **discards the event-bridge refactor as well**. If that refactor has not been committed by now, do not run the bare checkout — instead delete only the inserted block by hand and verify with Step 6.

- [ ] **Step 6: Prove the revert is exact**

```bash
git diff --stat packages/teamcode/src/session/processor.ts && grep -c "SP1 THROWAWAY" packages/teamcode/src/session/processor.ts
```

Expected: the diffstat from Step 1 reproduced exactly, and `0` occurrences of the marker. If the marker count is not 0, the spike has violated its own contract — fix before continuing.

- [ ] **Step 7: Re-run the suite to confirm the revert restored the baseline**

```bash
cd packages/teamcode && bun test --timeout 30000 test/session/
```

Expected: back to 108–114s, 307 pass / 0 fail.

---

### Task 4: Write the results document and the verdict

**Files:**
- Create: `docs/superpowers/results/2026-08-04-sp1-delta-ingest-results.md`

**Interfaces:**
- Consumes: benchmark output from Task 2 Step 6; macro figures from Task 3 if it ran.
- Produces: the go/no-go verdict that gates SP2.

- [ ] **Step 1: Write the document**

Create `docs/superpowers/results/2026-08-04-sp1-delta-ingest-results.md` with these sections, filled from the captured output:

```markdown
# SP1 Results — Delta Ingest Measurement

**Date:** <date of the run>
**Spec:** ../specs/2026-08-04-sp1-delta-ingest-measurement-design.md
**Plan:** ../plans/2026-08-04-sp1-delta-ingest-measurement.md

## Environment

- OS, CPU, machine-idle confirmation
- bun version, Go core version/binary path, resolved port
- Transport: TCP loopback (127.0.0.1) — the Unix socket is not on this client's path

## What the number includes

Every latency figure covers the full `POST /session/event` round trip, which includes the Go
handler's synchronous `processEventThroughUpdater(...)` message consolidation. It is not
transport-only.

## Micro results

| run | events | wall | throughput | p50 | p95 | p99 | min/max |
|---|---|---|---|---|---|---|---|
| steady sequential 10s | | | | | | | |
| burst 500 concurrent | | | | | | | |

## Macro results

<Either the table of wall clock and pass counts versus the 108–114s / 307-pass baseline, or the
sentence "Not run — the micro gate returned BATCH ENDPOINT REQUIRED, which settles the verdict.">

## Verdict

<One of: INLINE POST VIABLE / ASYNC PUBLISH REQUIRED IN SP2 / BATCH ENDPOINT REQUIRED IN GO-CORE.>

Applying the rule fixed in the spec before measurement: <quote the threshold that decided it>.

## Consequences for SP2

<What the producer design must now assume.>

## Caveats

- <Anything that would make a reader distrust the number: variance across runs, background load,
  single-machine sample, etc.>
```

- [ ] **Step 2: Sanity-check the verdict against the rule**

Re-read the decision-rule table in the Global Constraints above and confirm the recorded verdict follows from the recorded numbers. If you are tempted to argue around the threshold, do not — record the verdict the rule gives and note the disagreement in Caveats.

- [ ] **Step 3: Confirm no source changes leaked out of the spike**

```bash
git status --porcelain && grep -rn "SP1 THROWAWAY" packages/ --include=*.ts | grep -v node_modules
```

Expected: no `SP1 THROWAWAY` matches anywhere, and the only modification to `processor.ts` is the pre-existing event-bridge refactor (or nothing, if that was committed).

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/results/2026-08-04-sp1-delta-ingest-results.md
git commit -m "docs: record SP1 delta ingest measurement results and verdict"
```

- [ ] **Step 5: Stop the Go core**

```bash
pkill -f teamcode-.*server 2>/dev/null || true
```

On Windows PowerShell: `Get-Process | Where-Object { $_.Path -like "*teamcode*" } | Stop-Process`.

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| Prerequisite: running Go core, owner-authorized download | Task 1 |
| Micro-benchmark first: p50/p95/p99 + throughput sustained over 10s | Task 2 Steps 3, 6 |
| Steady and burst rates | Task 2 Step 3 (`steady`, `burst`), Step 6 |
| Macro comparison gated on micro passing | Task 2 Step 8 gate, Task 3 |
| Macro uses throwaway instrumentation and is reverted | Task 3 Steps 2, 5, 6 |
| Macro compares against 108–114s / 307 pass / 0 fail | Task 3 Step 4 |
| Macro runs `test/session/` alone on an idle machine | Task 3 Step 4, Global Constraints |
| Decision rule fixed before measuring | Global Constraints; encoded in Task 2 Step 3 code |
| Deliverable: results doc | Task 4 |
| Deliverable: go/no-go verdict on batch endpoint | Task 4 Steps 1-2 |
| Deliverable: benchmark script preserved | Task 2 Step 7 |
| No `processor.ts` changes survive | Task 3 Step 6, Task 4 Step 3 |
| Cost includes `processEventThroughUpdater` and must be stated | Task 4 Step 1 ("What the number includes") |
| Transport is TCP loopback on all platforms | Global Constraints; Task 4 Step 1 Environment |

No gaps found.

**Placeholder scan:** The results document in Task 4 Step 1 contains intentionally empty table cells and angle-bracket prompts — that is a template to be filled from live output, not an unspecified implementation. Every code step contains complete runnable code. No `TBD`/`TODO`/"add error handling" instructions.

**Type consistency:** `percentile(sorted: number[], p: number): number` and `summarize(samples: number[])` are declared identically in the Task 2 interfaces block, the test file, and the implementation. `steady()` and `burst()` both return `{ samples, wall, throughput }`, which is exactly what `report()` accepts. The request body keys `session_id` / `event_type` / `data` match `sessionEventRequest` in `go-core/cmd/server/session_handlers.go` and are identical in the benchmark script and the Task 3 instrumentation. The event type string `session.next.text.delta` is identical in Task 1 Step 5, Task 2, and Task 3.

**Known sharp edge, deliberately left in place:** Task 3 Step 5 uses `git checkout --`, which would also discard the uncommitted event-bridge refactor. The step says so explicitly and gives the alternative, because silently rewriting that instruction to something safer would hide a real decision the executor needs to make about whether to commit the refactor first.
