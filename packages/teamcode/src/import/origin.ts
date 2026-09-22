// Sessions imported from other agents are told apart by the `version` column, which
// TeamCode fills with its own `Installation.VERSION` for native sessions. No schema
// change is needed (spike §2.5); if a real column arrives later, only this file changes.
export type Origin = "claude" | "codex" | "teamcode"

export const all: Origin[] = ["claude", "codex", "teamcode"]

const prefixes: Record<Exclude<Origin, "teamcode">, string> = {
  claude: "claude-code@",
  codex: "codex@",
}

export function of(session: { version: string }): Origin {
  if (session.version.startsWith(prefixes.claude)) return "claude"
  if (session.version.startsWith(prefixes.codex)) return "codex"
  return "teamcode"
}

export function version(origin: Exclude<Origin, "teamcode">, toolVersion: string | undefined) {
  return prefixes[origin] + (toolVersion?.trim() || "unknown")
}

export function label(origin: Origin) {
  return origin
}

export * as Origin from "./origin"
