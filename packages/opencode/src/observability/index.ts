// Observability — lightweight in-process metrics for swarm, sandbox, and session
// operations. Aggregates counters from bus events and exposes them via a query
// interface for the dashboard and CLI stats.
import { Bus } from "@/bus"
import { BusEvent } from "@/bus/bus-event"
import { SwarmEvents } from "@/swarm/events"
import { Sandbox } from "@/sandbox"
import { Session } from "@/session/session"
import { Effect, Layer, Schema, Context } from "effect"
import * as Log from "@opencode-ai/core/util/log"

const log = Log.create({ service: "observability" })

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const MetricsSnapshot = Schema.Struct({
  swarms: Schema.Struct({
    total: Schema.Finite,
    completed: Schema.Finite,
    failed: Schema.Finite,
    agentsLaunched: Schema.Finite,
  }),
  sandboxes: Schema.Struct({
    total: Schema.Finite,
    active: Schema.Finite,
    discarded: Schema.Finite,
    prCreated: Schema.Finite,
  }),
  sessions: Schema.Struct({
    total: Schema.Finite,
    withErrors: Schema.Finite,
  }),
})
export type MetricsSnapshot = Schema.Schema.Type<typeof MetricsSnapshot>

const empty = <T extends Record<string, number>>(): T => ({}) as T

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Interface {
  /** Return a snapshot of all accumulated metrics. */
  readonly snapshot: () => MetricsSnapshot
  /** Reset all counters to zero. */
  readonly reset: () => void
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Observability") {}

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

export const layer: Layer.Layer<Service, never, Bus.Service> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const bus = yield* Bus.Service

    let swarmsTotal = 0
    let swarmsCompleted = 0
    let swarmsFailed = 0
    let agentsLaunched = 0
    let sandboxesTotal = 0
    let sandboxesActive = 0
    let sandboxesDiscarded = 0
    let sandboxesPrCreated = 0
    let sessionsTotal = 0
    let sessionsWithErrors = 0

    // -----------------------------------------------------------------------
    // Swarm event subscriptions
    // -----------------------------------------------------------------------

    yield* bus.subscribeCallback(SwarmEvents.Event.SwarmCreated, () => {
      swarmsTotal++
    })

    yield* bus.subscribeCallback(SwarmEvents.Event.SwarmAgentStarted, () => {
      agentsLaunched++
    })

    yield* bus.subscribeCallback(SwarmEvents.Event.SwarmCompleted, (event) => {
      if (event.properties.status === "completed") swarmsCompleted++
      else swarmsFailed++
    })

    yield* bus.subscribeCallback(SwarmEvents.Event.SwarmAgentFailed, () => {
      swarmsFailed++
    })

    // -----------------------------------------------------------------------
    // Sandbox event subscriptions
    // -----------------------------------------------------------------------

    yield* bus.subscribeCallback(Sandbox.Event.Entered, () => {
      sandboxesTotal++
      sandboxesActive++
    })

    yield* bus.subscribeCallback(Sandbox.Event.Exited, (event) => {
      sandboxesActive = Math.max(0, sandboxesActive - 1)
      if (event.properties.discarded) {
        sandboxesDiscarded++
      } else {
        sandboxesPrCreated++
      }
    })

    yield* bus.subscribeCallback(Sandbox.Event.Failed, () => {
      sandboxesActive = Math.max(0, sandboxesActive - 1)
    })

    // -----------------------------------------------------------------------
    // Session event subscriptions
    // -----------------------------------------------------------------------

    yield* bus.subscribeCallback(Session.Event.Created, () => {
      sessionsTotal++
    })

    yield* bus.subscribeCallback(Session.Event.Deleted, () => {
      // No active tracking for sessions via events
    })

    yield* bus.subscribeCallback(Session.Event.Error, () => {
      sessionsWithErrors++
    })

    log.info("observability subscriptions active")

    // -----------------------------------------------------------------------
    // snapshot
    // -----------------------------------------------------------------------

    const snapshot = (): MetricsSnapshot => ({
      swarms: {
        total: swarmsTotal,
        completed: swarmsCompleted,
        failed: swarmsFailed,
        agentsLaunched,
      },
      sandboxes: {
        total: sandboxesTotal,
        active: sandboxesActive,
        discarded: sandboxesDiscarded,
        prCreated: sandboxesPrCreated,
      },
      sessions: {
        total: sessionsTotal,
        withErrors: sessionsWithErrors,
      },
    })

    const reset = () => {
      swarmsTotal = 0
      swarmsCompleted = 0
      swarmsFailed = 0
      agentsLaunched = 0
      sandboxesTotal = 0
      sandboxesActive = 0
      sandboxesDiscarded = 0
      sandboxesPrCreated = 0
      sessionsTotal = 0
      sessionsWithErrors = 0
    }

    return Service.of({ snapshot, reset })
  }),
)

export const defaultLayer = layer

export * as Observability from "."
