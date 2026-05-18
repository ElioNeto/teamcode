/**
 * OpenAPI schema manipulation utilities for legacy SDK compatibility.
 *
 * These are workarounds for Effect's OpenAPI generation that should be removed
 * when upstream fixes land:
 *   - `Schema.optional` adds `{type:"null"}` to unions — upstream option to
 *     suppress this would eliminate `stripOptionalNull`.
 *   - Shared AST nodes produce self-referencing `$ref`s in component schemas.
 */

import type { OpenApiSchema } from "./types-base"

/** Strip `{type:"null"}` arms that Effect's `Schema.optional` adds to OpenAPI unions. */
export function stripOptionalNull(schema: OpenApiSchema): OpenApiSchema {
  if (schema.allOf?.length === 1) {
    const [constraint] = schema.allOf
    delete schema.allOf
    return stripOptionalNull({ ...schema, ...constraint })
  }
  if (isEmptyObjectUnion(schema)) return { type: "object", properties: {} }
  const options = flattenOptions(schema.anyOf ?? schema.oneOf)
  if (options) {
    const withoutNull = options.filter((item) => item.type !== "null")
    if (withoutNull.length === 1) return stripOptionalNull(withoutNull[0])
    if (schema.anyOf) schema.anyOf = withoutNull.map(stripOptionalNull)
    if (schema.oneOf) schema.oneOf = withoutNull.map(stripOptionalNull)
  }
  if (schema.allOf) {
    const allOf = schema.allOf.map(stripOptionalNull)
    if (schema.type) {
      delete schema.allOf
      for (const item of allOf) Object.assign(schema, item)
    } else {
      schema.allOf = allOf
    }
  }
  if (schema.prefixItems && schema.items) delete schema.prefixItems
  if (schema.items) schema.items = stripOptionalNull(schema.items)
  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      schema.properties[key] = stripOptionalNull(value)
    }
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
    schema.additionalProperties = stripOptionalNull(schema.additionalProperties)
  }
  return schema
}

export function isEmptyObjectUnion(schema: OpenApiSchema) {
  const options = schema.anyOf ?? schema.oneOf
  return options?.length === 2 && options.some(isBareObjectSchema) && options.some(isBareArraySchema)
}

export function isBareObjectSchema(schema: OpenApiSchema) {
  return schema.type === "object" && !schema.properties && !schema.additionalProperties
}

export function isBareArraySchema(schema: OpenApiSchema) {
  return schema.type === "array" && !schema.items && !schema.prefixItems
}

export function flattenOptions(options: OpenApiSchema[] | undefined): OpenApiSchema[] | undefined {
  return options?.flatMap((item) => flattenOptions(item.anyOf ?? item.oneOf) ?? [item])
}

/** Wrap a schema in `anyOf + null` for genuinely nullable fields. */
export function nullable(schema: OpenApiSchema): OpenApiSchema {
  if (flattenOptions(schema.anyOf ?? schema.oneOf)?.some((item) => item.type === "null")) return schema
  return { anyOf: [schema, { type: "null" }] }
}

export function makePropertiesNullable(properties: Record<string, OpenApiSchema>) {
  for (const [key, value] of Object.entries(properties)) {
    if (key === "share" && value.properties?.url) {
      value.properties.url = nullable(value.properties.url)
      continue
    }
    if (key === "time" && value.properties) {
      makePropertiesNullable(value.properties)
      continue
    }
    properties[key] = nullable(value)
  }
}
