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
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/health`)
  } catch {
    throw new Error(`go-core not healthy at ${BASE_URL}`)
  }
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
