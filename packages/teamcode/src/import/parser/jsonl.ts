import { Schema } from "effect"

const decode = Schema.decodeUnknownOption(Schema.UnknownFromJsonString)

export type Parsed = { index: number; value: Record<string, unknown> }

// Splits a JSONL document into objects. Lines that are blank, not JSON, or not an
// object are reported in `warnings` and skipped; a single bad line never aborts the
// import of a whole session (spike §4 contract 6).
export function parse(text: string): { lines: Parsed[]; warnings: string[] } {
  const warnings: string[] = []
  const lines = text
    .split(/\r?\n/)
    .map((raw, index) => ({ raw: raw.trim(), index: index + 1 }))
    .filter((line) => line.raw.length > 0)
    .flatMap((line) => {
      const result = decode(line.raw)
      if (result._tag === "None") {
        warnings.push(`line ${line.index}: invalid JSON`)
        return []
      }
      const value = result.value
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        warnings.push(`line ${line.index}: not an object`)
        return []
      }
      return [{ index: line.index, value: value as Record<string, unknown> }]
    })
  return { lines, warnings }
}

export function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

export function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

export function obj(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

export function arr(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined
}

export function millis(value: unknown): number | undefined {
  if (typeof value === "number") return value
  if (typeof value !== "string") return undefined
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : undefined
}
