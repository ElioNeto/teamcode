import { Flag } from "@teamcode-ai/core/flag/flag"
import { Effect } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http"
import * as Fence from "@/server/shared/fence"
import { RuntimeFlags } from "@/effect/runtime-flags"

const ignoredMethods = new Set(["GET", "HEAD", "OPTIONS"])

export const fenceLayer = HttpRouter.middleware(
  (effect) =>
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      const flags = yield* RuntimeFlags.Service
      // Prefer Flag.TEAMCODE_WORKSPACE_ID (set dynamically in tests) over
      // RuntimeFlags (read from env at layer build time) so that dynamic
      // overrides like withFixedWorkspaceID() are visible here.
      const workspaceId = Flag.TEAMCODE_WORKSPACE_ID ?? flags.workspaceId
      if (!workspaceId || ignoredMethods.has(request.method)) return yield* effect

      const previous = Fence.load()
      const response = yield* effect
      const current = Fence.diff(previous, Fence.load())
      if (Object.keys(current).length === 0) return response

      return HttpServerResponse.setHeader(response, Fence.HEADER, JSON.stringify(current))
    }),
  { global: true },
)
