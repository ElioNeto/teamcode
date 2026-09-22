import { createHash } from "crypto"

// Same wire layout as `src/id/id.ts` (`<prefix>_` + 12 hex of time + 14 base62), but
// the 14-char tail is derived from a hash of the source id instead of random bytes.
// The same external line therefore always yields the same TeamCode id, which is what
// makes incremental re-import a plain set difference on `id` (spike §2.1).
const prefixes = { session: "ses", message: "msg", part: "prt" } as const
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

export type Kind = keyof typeof prefixes

export function deterministic(kind: Kind, input: { timestamp: number; seed: string; counter?: number }) {
  const value = BigInt(Math.max(0, Math.floor(input.timestamp))) * BigInt(0x1000) + BigInt((input.counter ?? 0) & 0xfff)
  // Sessions sort newest-first in TeamCode, so their time bytes are bit-inverted like `Identifier.descending`.
  const encoded = kind === "session" ? ~value : value
  const bytes = Array.from({ length: 6 }, (_, i) => Number((encoded >> BigInt(40 - 8 * i)) & BigInt(0xff)))
  const time = Buffer.from(bytes).toString("hex")
  const hash = createHash("sha256").update(input.seed).digest()
  const tail = Array.from(hash.subarray(0, 14), (b) => chars[b % 62]).join("")
  return `${prefixes[kind]}_${time}${tail}`
}

export * as ImportIdent from "./ident"
