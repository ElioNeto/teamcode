import { existsSync, readFileSync } from "fs"
import path from "path"

/**
 * Compile-time injected schema JSON (set via `define` in build.ts).
 * In dev mode this is undefined and schemas are read from the schemas/ directory.
 */
declare const TEAMCODE_CONFIG_SCHEMA_JSON: string | undefined
declare const TEAMCODE_TUI_SCHEMA_JSON: string | undefined

const SCHEMA_DIR_CANDIDATES = (() => {
  // __dirname is the directory of this source file
  // From packages/teamcode/src/server/ -> up to repo root -> schemas/
  const pkgDir = import.meta.dirname
  return [
    path.join(pkgDir, "..", "..", "..", "..", "schemas"), // from src/server/ -> root/schemas
    path.join(pkgDir, "..", "..", "..", "..", "..", "schemas"), // from src/server/ -> root/schemas (alt)
    path.join(process.cwd(), "schemas"),
  ]
})()

function readSchemaJson(name: string): string | null {
  for (const dir of SCHEMA_DIR_CANDIDATES) {
    const filePath = path.join(dir, name)
    try {
      if (existsSync(filePath)) return readFileSync(filePath, "utf-8")
    } catch {
      // Try next candidate
    }
  }
  return null
}

let configSchemaJson: string | null = null
let tuiSchemaJson: string | null = null

export function getConfigSchemaJson(): string {
  if (configSchemaJson) return configSchemaJson
  if (typeof TEAMCODE_CONFIG_SCHEMA_JSON !== "undefined") {
    configSchemaJson = TEAMCODE_CONFIG_SCHEMA_JSON
    return configSchemaJson
  }
  const read = readSchemaJson("teamcode.json")
  if (read) {
    configSchemaJson = read
    return read
  }
  configSchemaJson = "{}"
  return configSchemaJson
}

export function getTuiSchemaJson(): string {
  if (tuiSchemaJson) return tuiSchemaJson
  if (typeof TEAMCODE_TUI_SCHEMA_JSON !== "undefined") {
    tuiSchemaJson = TEAMCODE_TUI_SCHEMA_JSON
    return tuiSchemaJson
  }
  const read = readSchemaJson("tui.json")
  if (read) {
    tuiSchemaJson = read
    return read
  }
  tuiSchemaJson = "{}"
  return tuiSchemaJson
}

export * as ServerSchema from "./schema"
