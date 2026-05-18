import { NamedError } from "@teamcode-ai/core/util/error"
import * as Log from "@teamcode-ai/core/util/log"
import { ConfigError } from "@/config/error"
import { Cause, Effect } from "effect"
import { HttpRouter, HttpServerError, HttpServerRespondable, HttpServerResponse, HttpServerRequest } from "effect/unstable/http"
import { HttpApiError } from "effect/unstable/httpapi"

const log = Log.create({ service: "server" })

const isBadRequest = (u: unknown): u is HttpApiError.BadRequest => u instanceof HttpApiError.BadRequest

// Keep typed HttpApi failures on their declared error path; this boundary only replaces defect-only empty 500s.
export const errorLayer = HttpRouter.middleware<{ handles: unknown }>()((effect) =>
  effect.pipe(
    Effect.catchCause((cause) => {
      const defect = cause.reasons.filter(Cause.isDieReason).find((reason) => {
        if (HttpServerResponse.isHttpServerResponse(reason.defect)) return false
        if (HttpServerError.isHttpServerError(reason.defect)) return false
        // Give framework BadRequest errors a meaningful body instead of empty 400
        if (isBadRequest(reason.defect)) return true
        if (HttpServerRespondable.isRespondable(reason.defect)) return false
        return true
      })
      if (!defect) return Effect.failCause(cause)

      const error: unknown = defect.defect
      if (
        error instanceof NamedError &&
        (ConfigError.InvalidError.isInstance(error) || ConfigError.JsonError.isInstance(error))
      ) {
        return Effect.succeed(HttpServerResponse.jsonUnsafe(error.toObject(), { status: 400 }))
      }

      if (isBadRequest(error)) {
        log.warn("bad request", { error, message: error.message })
        return Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest
          const url = new URL(request.url, "http://localhost")
          return HttpServerResponse.jsonUnsafe(
            new NamedError.Unknown({
              message: `Bad request: ${request.method} ${url.pathname}${url.search ? "?" + url.search : ""}`,
            }).toObject(),
            { status: 400 },
          )
        })
      }

      log.error("failed", { error, cause: Cause.pretty(cause) })

      return Effect.succeed(
        HttpServerResponse.jsonUnsafe(
          new NamedError.Unknown({
            message: "Unexpected server error. Check server logs for details.",
          }).toObject(),
          { status: 500 },
        ),
      )
    }),
  ),
).layer
