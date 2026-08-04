import { Effect } from "effect"
import { GoCoreClient, flag, isGoCoreReady } from "@teamcode-ai/core/router"
import * as Log from "@teamcode-ai/core/util/log"

const log = Log.create({ service: "session.go-core-events" })

// Forwarding of v2 session events to the Go core sidecar's ephemeral bus
// (POST /session/event -> in-memory eventbus -> SSE). Off by default; enable
// with FLAG_go_core_session_events=true. Deliberately independent of
// TEAMCODE_EXPERIMENTAL_EVENT_SYSTEM, which governs the TS-side durable
// bridge — the sidecar stream is a different transport with a different cost
// profile (SP1: p99 0.134ms per publish, consolidation included).
export const goCoreSessionEvents = flag("go-core-session-events", false)

export interface GoCoreForwarder {
  readonly forward: (sessionID: string, eventType: string, data: Record<string, unknown>) => Effect.Effect<void>
}

// Translate a v2 payload into what go-core 0.1.0's updater.EventData
// unmarshals. Two compatibility gaps, both verified against the deployed
// binary and go-core/internal/updater/event.go:
//   1. The updater reads `data.timestamp` / `data.sessionID` (the envelope's
//      own stamp is separate), so both are injected here.
//   2. `EventData.Model` is a string, but the TS Step.Started schema sends an
//      object — object-into-string fails Go's json.Unmarshal, dropping the
//      event and orphaning the whole step. Flattened to "providerID/id".
// The proper fix is widening EventData in go-core (allowed — go-core takes
// new development); until a Go toolchain is available to build and test it,
// this shim keeps the deployed contract working.
export function toGoCoreWire(sessionID: string, eventType: string, data: Record<string, unknown>): unknown {
  const wire: Record<string, unknown> = { ...data, sessionID, timestamp: Date.now() }
  if (eventType === "session.next.step.started" && typeof wire.model === "object" && wire.model !== null) {
    const model = wire.model as { id?: string; providerID?: string }
    wire.model = `${model.providerID ?? "unknown"}/${model.id ?? "unknown"}`
  }
  return wire
}

export function makeGoCoreForwarder(deps?: {
  publish?: (sessionID: string, eventType: string, data: unknown) => Promise<void>
  isReady?: () => boolean
  isEnabled?: () => boolean
}): GoCoreForwarder {
  const publish = deps?.publish ?? GoCoreClient.session.publish
  const isReady = deps?.isReady ?? isGoCoreReady
  const isEnabled = deps?.isEnabled ?? (() => goCoreSessionEvents.isEnabled())
  // One failed publish disables forwarding for this forwarder's lifetime: a
  // dead sidecar must cost one failed request, not one per token. Restart to
  // re-enable.
  let broken = false

  const forward = (sessionID: string, eventType: string, data: Record<string, unknown>) =>
    Effect.suspend(() => {
      if (broken || !isEnabled() || !isReady()) return Effect.void
      // Awaited inline: SP1's verdict licenses the ~0.134ms cost, and awaiting
      // serializes deltas in stream order — concurrent fetches would not.
      // Rejections are absorbed here so the LLM stream can never fail because
      // the sidecar did.
      return Effect.promise(() =>
        publish(sessionID, eventType, toGoCoreWire(sessionID, eventType, data)).then(
          () => undefined,
          (error) => {
            broken = true
            log.warn("go-core event forwarding disabled after publish failure (restart to re-enable)", {
              eventType,
              error: String(error),
            })
            return undefined
          },
        ),
      )
    })

  return { forward }
}
