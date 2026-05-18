/**
 * Component schema normalization for legacy SDK compatibility.
 *
 * Effect's HttpApi generates dotted component names and duplicate schemas from
 * shared AST nodes. These functions normalize names, collapse duplicates, and
 * apply hard-coded overrides that the legacy SDK expects.
 *
 * Can be removed when:
 *   - Effect HttpApi supports stable component naming
 *   - Schema deduplication is entirely upstream
 */

import { OpenApi } from "effect/unstable/httpapi"
import { OpenCodeHttpApi } from "../api"
import type { OpenApiSchema, OpenApiSpec } from "./types-base"
import { nullable, makePropertiesNullable } from "./schema"

const LegacyDescriptions: Record<string, string> = {
  LogLevel: "Log level",
  ServerConfig: "Server configuration for opencode serve and web commands",
  LayoutConfig: "@deprecated Always uses stretch layout.",
}

export function normalizeComponentNames(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  for (const name of Object.keys(schemas)) {
    const next = componentTypeName(name)
    if (next === name) continue
    if (schemas[next]) {
      if (stableSchema(schemas[name], schemas) === stableSchema(schemas[next], schemas)) {
        rewriteRefs(spec, name, next)
        delete schemas[name]
      }
      continue
    }
    schemas[next] = schemas[name]
    rewriteRefs(spec, name, next)
    delete schemas[name]
  }
}

function componentTypeName(name: string) {
  if (!name.includes(".")) return name
  return name
    .split(".")
    .filter((part) => !/^\d+$/.test(part))
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join("")
}

export function collapseDuplicateComponents(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  for (const name of Object.keys(schemas)) {
    const base = name.replace(/\d+$/, "")
    if (base === name || !schemas[base]) continue
    if (stableSchema(schemas[name], schemas) !== stableSchema(schemas[base], schemas)) continue
    rewriteRefs(spec, name, base)
    delete schemas[name]
  }
}

export function applyLegacySchemaOverrides(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  if (schemas.AgentConfig) schemas.AgentConfig.additionalProperties = {}
  if (schemas.Command?.properties?.template) schemas.Command.properties.template = { type: "string" }
  if (schemas.Workspace?.properties) {
    schemas.Workspace.properties.branch = nullable(schemas.Workspace.properties.branch)
    schemas.Workspace.properties.directory = nullable(schemas.Workspace.properties.directory)
    schemas.Workspace.properties.extra = nullable(schemas.Workspace.properties.extra)
  }
  if (schemas.GlobalSession?.properties?.project)
    schemas.GlobalSession.properties.project = nullable(schemas.GlobalSession.properties.project)
  const providerOptions = schemas.ProviderConfig?.properties?.options
  if (providerOptions) providerOptions.additionalProperties = {}
  const model = schemas.ProviderConfig?.properties?.models?.additionalProperties
  const variants = typeof model === "object" ? model.properties?.variants?.additionalProperties : undefined
  if (variants && typeof variants === "object") variants.additionalProperties = {}
  const syncInfo = schemas.SyncEventSessionUpdated?.properties?.data?.properties?.info
  if (syncInfo?.properties) makePropertiesNullable(syncInfo.properties)
}

export function normalizeComponentDescriptions(spec: OpenApiSpec) {
  for (const [name, schema] of Object.entries(spec.components?.schemas ?? {})) {
    const description = LegacyDescriptions[name]
    if (description) {
      schema.description = description
      continue
    }
    delete schema.description
  }
}

/** Fix self-referencing $ref components caused by shared AST nodes in Effect's OpenAPI generator. */
export function fixSelfReferencingComponents(spec: OpenApiSpec) {
  const schemas = spec.components?.schemas
  if (!schemas) return
  const selfRefs = new Set<string>()
  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.$ref === `#/components/schemas/${name}`) selfRefs.add(name)
  }
  if (selfRefs.size === 0) return
  // Re-generate a fresh spec without transforms to get correct schemas for
  // broken self-referencing components.
  const raw: OpenApiSpec = OpenApi.fromApi(OpenCodeHttpApi)
  const rawSchemas = raw.components?.schemas
  if (!rawSchemas) return
  for (const name of selfRefs) {
    if (rawSchemas[name]) schemas[name] = rawSchemas[name]
  }
}

function stableSchema(input: unknown, schemas: Record<string, OpenApiSchema>): string {
  return JSON.stringify(canonicalizeSchema(input, schemas))
}

function canonicalizeSchema(input: unknown, schemas: Record<string, OpenApiSchema>): unknown {
  if (Array.isArray(input)) return input.map((item) => canonicalizeSchema(item, schemas))
  if (!input || typeof input !== "object") return input
  const schema = input as OpenApiSchema
  if (schema.$ref) return { $ref: canonicalRef(schema.$ref, schemas) }
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key]) => key !== "description")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, canonicalizeSchema(value, schemas)]),
  )
}

function canonicalRef(ref: string, schemas: Record<string, OpenApiSchema>) {
  const name = ref.replace("#/components/schemas/", "")
  const base = name.replace(/\d+$/, "")
  if (base !== name && schemas[base]) return `#/components/schemas/${base}`
  return ref
}

function rewriteRefs(input: unknown, from: string, to: string): void {
  if (Array.isArray(input)) {
    for (const item of input) rewriteRefs(item, from, to)
    return
  }
  if (!input || typeof input !== "object") return
  const schema = input as OpenApiSchema
  if (schema.$ref === `#/components/schemas/${from}`) schema.$ref = `#/components/schemas/${to}`
  for (const value of Object.values(input)) rewriteRefs(value, from, to)
}
