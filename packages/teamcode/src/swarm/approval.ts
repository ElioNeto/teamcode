// Swarm approval — human-in-the-loop checkpoints for swarm execution.
//
// The swarm orchestrator can pause between agent stages and request human
// approval via the bus. While waiting, the CLI or TUI shows the approval
// prompt and collects the user's decision.
//
// Three checkpoint types:
//   - preflight: before the swarm starts (review the plan)
//   - interstage: between agent stages (review intermediate results)
//   - prepr: before creating a PR (review the final diff)
import { Bus } from "@/bus"
import { BusEvent } from "@/bus/bus-event"
import { Caveman, type CavemanLevel } from "@/caveman"
import { Config } from "@/config/config"
import { Effect, Layer, Schema, Context, Deferred } from "effect"
import * as Log from "@teamcode-ai/core/util/log"

const log = Log.create({ service: "swarm.approval" })

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const CheckpointType = Schema.Literals(["preflight", "interstage", "prepr"])
export type CheckpointType = Schema.Schema.Type<typeof CheckpointType>

export const ApprovalDecision = Schema.Literals(["approved", "rejected", "modified"])
export type ApprovalDecision = Schema.Schema.Type<typeof ApprovalDecision>

export const ApprovalRequest = Schema.Struct({
  id: Schema.String,
  swarmID: Schema.String,
  checkpointType: CheckpointType,
  stage: Schema.String,
  summary: Schema.String,
  details: Schema.optional(Schema.String),
})
export type ApprovalRequest = Schema.Schema.Type<typeof ApprovalRequest>

export const ApprovalResponse = Schema.Struct({
  requestID: Schema.String,
  decision: ApprovalDecision,
  feedback: Schema.optional(Schema.String),
})
export type ApprovalResponse = Schema.Schema.Type<typeof ApprovalResponse>

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const Event = {
  Requested: BusEvent.define("swarm.approval.requested", ApprovalRequest),
  Replied: BusEvent.define("swarm.approval.replied", ApprovalResponse),
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApprovalRejectedError extends Schema.TaggedErrorClass<ApprovalRejectedError>()(
  "SwarmApprovalRejectedError",
  {
    swarmID: Schema.String,
    stage: Schema.String,
    feedback: Schema.optional(Schema.String),
  },
) {
  override get message() {
    return this.feedback
      ? `Approval rejected at stage "${this.stage}": ${this.feedback}`
      : `Approval rejected at stage "${this.stage}"`
  }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type PendingRequest = {
  request: ApprovalRequest
  deferred: Deferred.Deferred<ApprovalResponse, ApprovalRejectedError>
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Interface {
  /** Request human approval at a checkpoint. Returns the decision. */
  readonly request: (input: ApprovalRequest) => Effect.Effect<ApprovalResponse, ApprovalRejectedError>
  /** Reply to a pending approval request (used by CLI/TUI handlers). */
  readonly reply: (input: ApprovalResponse) => Effect.Effect<boolean>
  /** List pending approval requests. */
  readonly pending: () => Effect.Effect<readonly ApprovalRequest[]>
}

export class Service extends Context.Service<Service, Interface>()("@teamcode/SwarmApproval") {}

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

export const layer: Layer.Layer<Service, never, Bus.Service> = Layer.effect(
  Service,
  Effect.gen(function* () {
    const bus = yield* Bus.Service
    const pending = new Map<string, PendingRequest>()

    // -----------------------------------------------------------------------
    // request
    // -----------------------------------------------------------------------

    const request = Effect.fn("SwarmApproval.request")(function* (input: ApprovalRequest) {
      const deferred = yield* Deferred.make<ApprovalResponse, ApprovalRejectedError>()

      pending.set(input.id, { request: input, deferred })

      yield* bus.publish(Event.Requested, input)
      log.info("approval requested", { id: input.id, stage: input.stage, type: input.checkpointType })

      // Await the reply
      const result = yield* Deferred.await(deferred)
      pending.delete(input.id)

      return result
    })

    // -----------------------------------------------------------------------
    // reply
    // -----------------------------------------------------------------------

    const reply = Effect.fn("SwarmApproval.reply")(function* (input: ApprovalResponse) {
      const entry = pending.get(input.requestID)
      if (!entry) return false

      if (input.decision === "rejected") {
        yield* Deferred.fail(
          entry.deferred,
          new ApprovalRejectedError({
            swarmID: entry.request.swarmID,
            stage: entry.request.stage,
            feedback: input.feedback,
          }),
        )
      } else {
        yield* Deferred.succeed(entry.deferred, input)
      }

      yield* bus.publish(Event.Replied, input)
      log.info("approval replied", { id: input.requestID, decision: input.decision })
      return true
    })

    // -----------------------------------------------------------------------
    // pending
    // -----------------------------------------------------------------------

    const getPending = Effect.fn("SwarmApproval.pending")(function* () {
      return Array.from(pending.values()).map((e) => e.request)
    })

    return Service.of({ request, reply, pending: getPending })
  }),
)

// ---------------------------------------------------------------------------
// Caveman-aware display helpers
// ---------------------------------------------------------------------------

/**
 * Compress an approval request's summary and details for caveman display.
 * Returns a new ApprovalRequest with compressed text fields.
 */
export function compressApprovalRequest(
  input: ApprovalRequest,
  level: CavemanLevel,
): ApprovalRequest {
  return {
    ...input,
    summary: Caveman.compress(input.summary, level),
    details: input.details ? Caveman.compress(input.details, level) : input.details,
  }
}

export const defaultLayer = layer

export * as SwarmApproval from "./approval"
