import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { makeGoCoreForwarder, toGoCoreWire } from "@/session/go-core-events"

describe("toGoCoreWire", () => {
  test("injects timestamp and sessionID into the data payload", () => {
    const wire = toGoCoreWire("ses_1", "session.next.text.delta", { delta: "a" }) as Record<string, unknown>
    expect(wire.delta).toBe("a")
    expect(wire.sessionID).toBe("ses_1")
    expect(typeof wire.timestamp).toBe("number")
  })

  test("flattens the step.started model object to the string go-core 0.1.0 expects", () => {
    // go-core's updater.EventData types `model` as string; the TS v2 schema
    // sends an object. Object-into-string fails Go's json.Unmarshal, which
    // drops the event and orphans every subsequent event in the step.
    const wire = toGoCoreWire("ses_1", "session.next.step.started", {
      agent: "coder",
      model: { id: "claude-4", providerID: "anthropic", variant: "default" },
      snapshot: undefined,
    }) as Record<string, unknown>
    expect(wire.model).toBe("anthropic/claude-4")
    expect(wire.agent).toBe("coder")
  })

  test("leaves non-step events untouched apart from the envelope fields", () => {
    const wire = toGoCoreWire("ses_1", "session.next.tool.called", {
      callID: "c1",
      tool: "bash",
      input: { command: "ls" },
      provider: { executed: false },
    }) as Record<string, unknown>
    expect(wire.tool).toBe("bash")
    expect(wire.provider).toEqual({ executed: false })
  })
})

type Call = { sessionID: string; eventType: string; data: unknown }

function harness(overrides?: {
  enabled?: boolean
  ready?: boolean
  publish?: (sessionID: string, eventType: string, data: unknown) => Promise<void>
}) {
  const calls: Call[] = []
  const forwarder = makeGoCoreForwarder({
    isEnabled: () => overrides?.enabled ?? true,
    isReady: () => overrides?.ready ?? true,
    publish:
      overrides?.publish ??
      (async (sessionID, eventType, data) => {
        calls.push({ sessionID, eventType, data })
      }),
  })
  return { calls, forwarder }
}

describe("makeGoCoreForwarder", () => {
  test("does not publish when the flag is disabled", async () => {
    const { calls, forwarder } = harness({ enabled: false })
    await Effect.runPromise(forwarder.forward("ses_1", "session.next.text.delta", { delta: "a" }))
    expect(calls).toEqual([])
  })

  test("does not publish when the go core is not ready", async () => {
    const { calls, forwarder } = harness({ ready: false })
    await Effect.runPromise(forwarder.forward("ses_1", "session.next.text.delta", { delta: "a" }))
    expect(calls).toEqual([])
  })

  test("publishes the wire-translated payload when enabled and ready", async () => {
    const { calls, forwarder } = harness()
    await Effect.runPromise(forwarder.forward("ses_1", "session.next.reasoning.delta", { reasoningID: "r1", delta: "x" }))
    expect(calls.length).toBe(1)
    expect(calls[0]!.sessionID).toBe("ses_1")
    expect(calls[0]!.eventType).toBe("session.next.reasoning.delta")
    const data = calls[0]!.data as Record<string, unknown>
    expect(data.reasoningID).toBe("r1")
    expect(data.delta).toBe("x")
    expect(data.sessionID).toBe("ses_1")
    expect(typeof data.timestamp).toBe("number")
  })

  test("preserves stream order across sequential forwards", async () => {
    const { calls, forwarder } = harness()
    await Effect.runPromise(
      Effect.gen(function* () {
        yield* forwarder.forward("ses_1", "session.next.text.delta", { delta: "a" })
        yield* forwarder.forward("ses_1", "session.next.text.delta", { delta: "b" })
        yield* forwarder.forward("ses_1", "session.next.text.delta", { delta: "c" })
      }),
    )
    expect(calls.map((c) => (c.data as { delta: string }).delta)).toEqual(["a", "b", "c"])
  })

  test("a publish failure trips the breaker: no error escapes and later forwards are dropped", async () => {
    let attempts = 0
    const { forwarder } = harness({
      publish: async () => {
        attempts++
        throw new Error("connect ECONNREFUSED")
      },
    })
    // Must not reject even though publish does.
    await Effect.runPromise(forwarder.forward("ses_1", "session.next.text.delta", { delta: "a" }))
    await Effect.runPromise(forwarder.forward("ses_1", "session.next.text.delta", { delta: "b" }))
    await Effect.runPromise(forwarder.forward("ses_1", "session.next.text.delta", { delta: "c" }))
    expect(attempts).toBe(1)
  })

  test("breaker state is per-forwarder, not global", async () => {
    const failing = harness({
      publish: async () => {
        throw new Error("boom")
      },
    })
    const healthy = harness()
    await Effect.runPromise(failing.forwarder.forward("ses_1", "t", {}))
    await Effect.runPromise(healthy.forwarder.forward("ses_1", "session.next.text.delta", { delta: "ok" }))
    expect(healthy.calls.length).toBe(1)
  })
})
