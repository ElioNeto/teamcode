// Caveman mode — compressão de output tokens dos agentes.
//
// "why use many token when few do trick"
//   — JuliusBrussee/caveman
//
// Three compression levels:
//   lite  — remove filler words and pleasantries
//   full  — fragments, no formalities (default)
//   ultra — telegraphic, only the essentials

import { Schema, Effect, Context, Layer } from "effect"
import { Config } from "@/config/config"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const CavemanLevel = Schema.Literals(["lite", "full", "ultra"])
export type CavemanLevel = Schema.Schema.Type<typeof CavemanLevel>

export const CavemanConfig = Schema.Struct({
  enabled: Schema.optional(Schema.Boolean),
  level: Schema.optional(CavemanLevel),
})
export type CavemanConfig = Schema.Schema.Type<typeof CavemanConfig>

// ---------------------------------------------------------------------------
// Compression engine
// ---------------------------------------------------------------------------

/** Regex pattern that matches content to preserve verbatim */
const PROTECTED_RE = /(`[^`]+`)|(\bhttps?:\/\/\S+)|(\/[^\s]+\/[^\s]+)|(["'][^"']+["'])|(```[\s\S]*?```)/g

const FILLER = new Set([
  "actually", "basically", "essentially", "honestly", "literally",
  "obviously", "simply", "just", "really", "very", "quite", "rather",
  "somewhat", "pretty", "maybe", "perhaps", "probably", "definitely",
  "certainly", "absolutely", "surely", "interestingly", "importantly",
  "notably", "specifically", "particularly",
])

const PLEASANTRIES: RegExp[] = [
  /\bI'?m?\s+(happy|glad|excited|pleased)\s+to\s+(help|assist|be|answer)\b[^.]*\./gi,
  /\b(?:Sure|Of course|Absolutely|Certainly|Definitely|Happy to|Glad to)\s*[,!]?\s+(?:I'?d?\s+)?(?:be\s+)?(?:happy|glad)?\s*(?:to\s+)?(?:help|assist|answer|explain)\b[^.]*\./gi,
  /\b(?:Let me|I'?ll|I would|I can)\s+(?:take a look|help you|assist you|show you|explain|walk you through|guide you)\b[^.]*\./gi,
  /\b(?:Feel free to|Don't hesitate to|Please don't hesitate to)\s+[^.]*\./gi,
  /\b(?:I think|I believe|I feel|In my opinion|From my perspective|It seems|It appears)\b/gi,
  /\b(?:The reason|The issue|The problem|The challenge)\s+is\s+that\b/gi,
  /\b(?:If you have any|Let me know if|Please let me know)\b[^.]*\./gi,
  /^Thank\s+(?:you|you\s+for)\b[^.]*\.?/gim,
  /^You'?r?e?\s+welcome[.!]?$/gim,
  /^No problem[.!]?$/gim,
  /^Anytime[.!]?$/gim,
  /\b(?:Let me know if you have|Hope this|I hope|Happy coding|Good luck|Best of luck)\b[^.]*\.?$/gim,
]

const FRAGMENT_SUBS: [RegExp, string][] = [
  [/\b(?:This|That)\s+(?:means?|implies?|suggests?|indicates?)\s+that\b/gi, "=>"],
  [/\b(?:Due to|Because of|Owing to|As a result of)\b/gi, "Because"],
  [/\b(?:In order to|So as to)\b/gi, "To"],
  [/\b(?:As a result|Consequently|Therefore|Thus|Hence|Accordingly)\b/gi, "So"],
  [/\b(?:In addition|Furthermore|Moreover|Additionally|Besides)\b/gi, "Also"],
  [/\b(?:On the other hand|However|Nevertheless|Nonetheless|That said)\b/gi, "But"],
  [/\b(?:For example|For instance|e\.g\.)\b/gi, "e.g."],
  [/\b(?:In other words|That is|i\.e\.)\b/gi, "i.e."],
  [/\b(?:In particular|Specifically|More specifically)\b/gi, "Specifically"],
  [/\b(?:As mentioned|As noted|As discussed|As stated)\b/gi, "Per above"],
  [/\b(?:It is worth noting|It should be noted|Note that|Notably)\b/gi, "Note:"],
  [/\b(?:In the context of|With respect to|Regarding|Concerning|With regard to)\b/gi, "Re:"],
  [/\b(?:In summary|To summarize|To sum up|In conclusion|To conclude)\b/gi, "Summary:"],
  [/\b(?:It is|It's)\s+(?:important|essential|crucial|critical|necessary)\s+to\b/gi, "Must"],
  [/\b(?:It is|It's)\s+(?:recommended|advisable|suggested)\s+to\b/gi, "Should"],
  [/\b(?:It is|It's)\s+possible\s+to\b/gi, "Can"],
  [/\b(?:It is|It's)\s+(?:common|typical|standard)\s+(?:to|for)\b/gi, "Typically"],
  [/\b(?:(?:I would|I'?d)\s+)?recommend\s+(?:using|trying|adding)\b/gi, "Use"],
  [/\b(?:You can|You could|You may|You might)\s+(?:also\s+)?(?:use|try|add|do)\b/gi, "Use"],
  [/\b(?:Make sure|Ensure|Be sure|Verify)\s+(?:that\s+)?/gi, "Ensure "],
  [/\b(?:In this case|In that case)\b/gi, "If so"],
  [/\b(?:At this point|At this stage)\b/gi, "Now"],
  [/\b(?:At the end of the day)\b/gi, "Ultimately"],
  [/\b(?:A number of|A lot of|Lots of|Plenty of|Numerous)\b/gi, "Many"],
  [/\b(?:A majority of|Most of|The majority of)\b/gi, "Most"],
  [/\b(?:A small number of|A few|A handful of)\b/gi, "Few"],
]

const ULTRA_PATTERNS: [RegExp, string][] = [
  [/\bthe\s+/gi, ""],
  [/\ba\s+/gi, ""],
  [/\ban\s+/gi, ""],
  [/\b(?:is|are|was|were|be|been|being)\s+/gi, ""],
  [/\b(?:have|has|had|having)\s+/gi, ""],
  [/\b(?:do|does|did|doing)\s+/gi, ""],
  [/\b(?:will|would|shall|should|can|could|may|might|must)\s+/gi, ""],
  [/\b(?:there\s+)(?:is|are|was|were)\s+/gi, ""],
  [/\bthis\s+/gi, ""],
  [/\bthat\s+/gi, ""],
  [/\bthese\s+/gi, ""],
  [/\bthose\s+/gi, ""],
]

/**
 * Count approximate tokens in text.
 */
export function countTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

function restoreProtected(text: string, blocks: string[]): string {
  return text.replace(/\x00(\d+)\x00/g, (_, idx) => blocks[Number(idx)] ?? "")
}

/**
 * Compress text according to the specified caveman level.
 */
export function compress(text: string, level: CavemanLevel): string {
  if (!text) return text

  // Phase 0: protect code blocks, URLs, paths
  const blocks: string[] = []
  const protected_ = text.replace(PROTECTED_RE, (m) => {
    blocks.push(m)
    return `\x00${blocks.length - 1}\x00`
  })

  let r = protected_

  // Phase 1: remove pleasantries
  for (const p of PLEASANTRIES) r = r.replace(p, "")

  // Phase 2: remove filler words
  r = r.replace(/\b[a-zA-Z]+\b/g, (word) => {
    const lower = word.toLowerCase()
    if (word[0] !== word[0]?.toLowerCase() && word !== word.toLowerCase()) return word
    return FILLER.has(lower) ? "" : word
  })

  r = r.replace(/ {2,}/g, " ")

  if (level === "lite") {
    r = r.replace(/\n{3,}/g, "\n\n")
    return restoreProtected(r, blocks)
  }

  // Phase 3: fragment substitutions
  for (const [pattern, replacement] of FRAGMENT_SUBS) {
    r = r.replace(pattern, replacement)
  }

  r = r.replace(/ {2,}/g, " ").replace(/\n{3,}/g, "\n\n")

  if (level === "full") return restoreProtected(r.trim(), blocks)

  // Phase 4: ultra — remove articles, helping verbs
  const lines = r.split("\n").map((line) => {
    let l = line
    for (const [pattern, replacement] of ULTRA_PATTERNS) l = l.replace(pattern, replacement)
    l = l.replace(/ {2,}/g, " ").trim()
    return l
  })

  r = lines.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n")

  return restoreProtected(r.trim(), blocks)
}

/**
 * Compress file content preserving code blocks, URLs, paths exactly.
 */
export function compressFile(content: string, level: CavemanLevel): string {
  const blocks: string[] = []
  const withoutCode = content.replace(/(```[\s\S]*?```|`[^`]+`)/g, (m) => {
    blocks.push(m)
    return `\x00BLOCK${blocks.length - 1}\x00`
  })

  const compressed = compress(withoutCode, level)
  return compressed.replace(/\x00BLOCK(\d+)\x00/g, (_, idx) => blocks[Number(idx)] ?? "")
}

// ---------------------------------------------------------------------------
// CavemanInfo — session-scoped state shared via KV
// ---------------------------------------------------------------------------

export type CavemanSessionInfo = {
  enabled: boolean
  level: CavemanLevel
  tokens_saved: number
}

export function defaultSessionInfo(configLevel?: CavemanLevel): CavemanSessionInfo {
  return {
    enabled: false,
    level: configLevel ?? "full",
    tokens_saved: 0,
  }
}

export const CAVEMAN_KV_KEY = "caveman_state"

// ---------------------------------------------------------------------------
// Effect service
// ---------------------------------------------------------------------------

export interface Interface {
  readonly compress: (text: string, level: CavemanLevel) => string
  readonly compressFile: (content: string, level: CavemanLevel) => string
  readonly countTokens: (text: string) => number
}

export class Service extends Context.Service<Service, Interface>()("@opencode/Caveman") {}

export const layer = Layer.effect(
  Service,
  Effect.succeed(
    Service.of({
      compress,
      compressFile,
      countTokens,
    }),
  ),
)

export const defaultLayer = layer.pipe(
  Layer.provide(Config.defaultLayer),
)

export * as Caveman from "."
