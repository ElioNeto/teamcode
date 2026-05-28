import type { EditorTraits } from "@opentui/core"

export type PromptMode = "normal" | "shell"

export interface PromptTraitsInput {
  mode: PromptMode
  autocompleteVisible: boolean
}

export type PromptTraits = EditorTraits & {
  owner: "teamcode"
  role: "prompt"
}

/**
 * Compute the textarea editor traits for the prompt.
 *
 * The OpenTUI managed textarea keymap owns `traits.suspend`. Prompt traits
 * only expose capture/status metadata so focus changes cannot unsuspend the
 * keymap-managed editor mappings.
 */
export function computePromptTraits(input: PromptTraitsInput): PromptTraits {
  // ESC is deliberately omitted from capture when autocomplete is visible
  // so it falls through to the global keybinding which dispatches the
  // session.interrupt / abort command. The interrupt handler itself
  // closes autocomplete before aborting.
  const capture =
    input.mode === "normal"
      ? input.autocompleteVisible
        ? (["navigate", "submit", "tab"] as const)
        : (["tab"] as const)
      : undefined
  return {
    capture,
    status: input.mode === "shell" ? "SHELL" : undefined,
    owner: "teamcode",
    role: "prompt",
  }
}
