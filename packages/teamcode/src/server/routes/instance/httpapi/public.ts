import { OpenApi } from "effect/unstable/httpapi"
import { OpenCodeHttpApi } from "./api"
import { QueryBooleanOpenApi } from "./groups/query"
import type { OpenApiSchema, OpenApiSpec, OpenApiOperation, OpenApiParameter } from "./openapi/types-base"
import {
  stripOptionalNull,
  normalizeComponentNames,
  collapseDuplicateComponents,
  applyLegacySchemaOverrides,
  normalizeComponentDescriptions,
  fixSelfReferencingComponents,
} from "./openapi"
import { addLegacyErrorSchemas, normalizeLegacyErrorResponses, normalizeLegacyOperation } from "./openapi/errors-legacy"

/*
 * ──────────────────────────────────────────────────────────────────────────────
 * Query Parameter Schemas — SDK-facing types
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Query schemas describe decoded Effect values, but the generated SDK needs the
 * public call shape. These keep SDK callers passing numbers/booleans while the
 * server still decodes string query params at runtime.
 */
const QueryParameterSchemas: Record<string, OpenApiSchema> = {
  "GET /experimental/session start": { type: "number" },
  "GET /experimental/session roots": QueryBooleanOpenApi,
  "GET /experimental/session archived": QueryBooleanOpenApi,
  "GET /find/file limit": { type: "integer", minimum: 1, maximum: 200 },
  "GET /experimental/session cursor": { type: "number" },
  "GET /experimental/session limit": { type: "number" },
  "GET /session start": { type: "number" },
  "GET /session roots": QueryBooleanOpenApi,
  "GET /session limit": { type: "number" },
  "GET /session/{sessionID}/message limit": { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
  "GET /api/session limit": { type: "number" },
  "GET /api/session start": { type: "number" },
  "GET /api/session roots": QueryBooleanOpenApi,
  "GET /api/session/{sessionID}/message limit": { type: "number" },
}

// ─── Main Transform ───────────────────────────────────────────────────────────

function matchLegacyOpenApi(input: Record<string, unknown>) {
  const spec = input as OpenApiSpec

  // Fix Effect OpenAPI generation bug: shared AST nodes produce
  // self-referencing component schemas.
  fixSelfReferencingComponents(spec)

  // Strip null from optional fields — Effect's Schema.optional emits
  // `anyOf: [T, {type:"null"}]` but the legacy SDK expects plain T.
  for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
    spec.components!.schemas![name] = stripOptionalNull(structuredClone(schema))
  }

  normalizeComponentNames(spec)
  collapseDuplicateComponents(spec)
  applyLegacySchemaOverrides(spec)
  normalizeComponentDescriptions(spec)
  addLegacyErrorSchemas(spec)

  // Clean up Effect-internal schemas not meant for external consumption.
  delete spec.components?.schemas?.Unauthorized
  delete spec.components?.schemas?.EffectHttpApiErrorBadRequest
  delete spec.components?.schemas?.EffectHttpApiErrorNotFound
  delete spec.components?.schemas?.effect_HttpApiError_BadRequest
  delete spec.components?.schemas?.effect_HttpApiError_NotFound
  delete spec.components?.securitySchemes

  // Per-operation normalization.
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const method of ["get", "post", "put", "delete", "patch"] as const) {
      const operation = item[method]
      if (!operation) continue

      // Legacy OpenAPI surface never marked request bodies as required.
      if (operation.requestBody) {
        delete operation.requestBody.required
        const body = operation.requestBody.content?.["application/json"]
        if (body?.schema) body.schema = stripOptionalNull(structuredClone(body.schema))

        // Re-add null for genuinely nullable workspace fields.
        if (path === "/experimental/workspace" && method === "post") {
          addNullableToProp(operation, spec, "branch")
          addNullableToProp(operation, spec, "extra")
        }
        if (path === "/experimental/workspace/warp" && method === "post") {
          addNullableToProp(operation, spec, "id")
        }
      }

      // Strip null from response schemas too.
      for (const response of Object.values(operation.responses ?? {})) {
        for (const content of Object.values(response.content ?? {})) {
          if (content.schema) content.schema = stripOptionalNull(structuredClone(content.schema))
        }
      }

      // Auth is runtime middleware — SDK should not expose auth schemes or 401s.
      delete operation.security
      delete operation.responses?.["401"]
      normalizeLegacyErrorResponses(operation)
      normalizeLegacyOperation(operation, path, method)

      // Document SSE endpoints with explicit wire-protocol schemas.
      if ((path === "/event" || path === "/global/event") && method === "get") {
        operation.responses!["200"] = {
          description: "Event stream",
          content: {
            "text/event-stream": {
              schema:
                path === "/event"
                  ? { $ref: "#/components/schemas/Event" }
                  : { $ref: "#/components/schemas/GlobalEvent" },
            },
          },
        }
      }

      const route = `${method.toUpperCase()} ${path}`
      for (const param of operation.parameters ?? []) normalizeParameter(param, route)
    }
  }
  return input
}

function addNullableToProp(operation: OpenApiOperation, spec: OpenApiSpec, prop: string) {
  const ref = operation.requestBody?.content?.["application/json"]?.schema?.$ref?.replace(
    "#/components/schemas/",
    "",
  )
  const properties = ref
    ? spec.components?.schemas?.[ref]?.properties
    : operation.requestBody?.content?.["application/json"]?.schema?.properties
  if (properties?.[prop]) properties[prop] = { anyOf: [properties[prop], { type: "null" }] }
}

function normalizeParameter(param: OpenApiParameter, route: string) {
  if (!param.schema || typeof param.schema !== "object") return
  if (param.in === "path") {
    param.schema = stripOptionalNull(param.schema)
    return
  }
  if (param.in === "query") {
    const override = QueryParameterSchemas[`${route} ${param.name}`]
    if (override) {
      param.schema = override
      return
    }
  }
  param.schema = stripOptionalNull(param.schema)
}

// ─── Public Export ────────────────────────────────────────────────────────────

export const PublicApi = OpenCodeHttpApi.annotateMerge(
  OpenApi.annotations({
    title: "teamcode",
    version: "1.0.0",
    description: "teamcode api",
    transform: matchLegacyOpenApi,
  }),
)
