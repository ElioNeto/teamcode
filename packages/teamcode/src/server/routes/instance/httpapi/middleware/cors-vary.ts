import { Effect } from "effect"
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http"
import { CorsConfig, isAllowedCorsOrigin } from "@/server/cors"

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

// Combined CORS middleware that:
// 1. Reads CorsConfig to determine allowed origins
// 2. Adds CORS headers to responses when the request origin is allowed
// 3. Returns 204 for OPTIONS preflight requests
// 4. Fixes the Vary header to include both Origin and Access-Control-Request-Headers
export const corsLayer = HttpRouter.middleware<{ handles: unknown }>()(
  Effect.gen(function* () {
    const corsOptions = yield* CorsConfig

    return (effect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest
        const response = yield* effect

        const origin = request.headers["origin"]
        if (!origin || !isAllowedCorsOrigin(origin, corsOptions)) return response

        // Build CORS response headers
        const corsHeaders: Record<string, string> = {
          "access-control-allow-origin": origin,
          "access-control-allow-credentials": "true",
        }

        if (request.method === "OPTIONS") {
          corsHeaders["access-control-allow-methods"] = "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS"
          const reqHeaders = request.headers["access-control-request-headers"]
          if (reqHeaders) corsHeaders["access-control-allow-headers"] = reqHeaders
        }

        // Set CORS headers on response
        let newResponse = response
        for (const [key, value] of Object.entries(corsHeaders)) {
          newResponse = HttpServerResponse.setHeader(newResponse, key, value)
        }

        // Fix Vary header - merge with existing
        const isPreflight = request.method === "OPTIONS"
        const requestAcrh = isPreflight ? request.headers["access-control-request-headers"] : undefined
        const varyValues = ["Origin"]
        if (requestAcrh) varyValues.push("Access-Control-Request-Headers")

        const existingVary = newResponse.headers["vary"]
        const existingTokens = existingVary ? existingVary.split(",").map((s) => s.trim().toLowerCase()) : []
        const needed = varyValues.filter((v) => !existingTokens.includes(v.toLowerCase()) && !existingTokens.includes("*"))
        if (needed.length > 0) {
          newResponse = HttpServerResponse.setHeader(
            newResponse,
            "vary",
            existingVary ? `${existingVary}, ${needed.join(", ")}` : needed.join(", "),
          )
        }

        if (isPreflight) return HttpServerResponse.empty({ status: 204 })

        return newResponse
      })
  }),
).layer
