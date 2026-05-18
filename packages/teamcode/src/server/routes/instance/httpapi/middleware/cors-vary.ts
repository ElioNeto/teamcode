import { Effect } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"

// effect-smol's HttpMiddleware.cors builds OPTIONS preflight responses by
// spreading allowOrigin() and allowHeaders() into the same record. Both set
// the `vary` key, so allowHeaders' `Vary: Access-Control-Request-Headers`
// overwrites allowOrigin's `Vary: Origin`. With dynamic origin echoing, the
// missing `Vary: Origin` lets shared caches reuse a preflight cached for one
// origin against a different origin.
//
// Workaround: headersFromRequestOptions merges Vary values by overwriting
// (effect-smol's HttpMiddleware). This middleware patches the response to
// include both `Origin` and `Access-Control-Request-Headers` in Vary.
// Track upstream fix at: https://github.com/EffectSmol/effect/issues/186
export const corsVaryFix = HttpRouter.middleware(
  (effect) =>
    Effect.gen(function* () {
      const response = yield* effect
      const allowOrigin = response.headers["access-control-allow-origin"]
      if (!allowOrigin || allowOrigin === "*") return response

      const vary = response.headers["vary"]
      if (!vary) return HttpServerResponse.setHeader(response, "vary", "Origin")

      const tokens = vary.split(",").map((s) => s.trim().toLowerCase())
      if (tokens.includes("origin") || tokens.includes("*")) return response

      return HttpServerResponse.setHeader(response, "vary", `${vary}, Origin`)
    }),
  { global: true },
)
