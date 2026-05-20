import { createSignal, createMemo, Show, For } from "solid-js"
import { useTheme } from "@tui/context/theme"
import { useTerminalDimensions } from "@opentui/solid"
import { useBindings } from "@tui/keymap"
import * as Git from "@tui/util/git"

const CONVENTIONAL_PREFIXES = ["feat:", "fix:", "chore:", "docs:", "style:", "refactor:", "perf:", "test:", "build:", "ci:", "revert:"]

export function CommitDialog(props: {
  directory: string
  stagedCount: number
  onCommit: (message: string) => void
  onCancel: () => void
}) {
  const { theme } = useTheme()
  const dimensions = useTerminalDimensions()
  const [message, setMessage] = createSignal("")
  const [subject, setSubject] = createSignal("")
  const [body, setBody] = createSignal("")
  const [showPrefixes, setShowPrefixes] = createSignal(false)
  const [prefix, setPrefix] = createSignal("")

  const fullMessage = createMemo(() => {
    const s = subject().trim()
    const b = body().trim()
    if (!s && !b) return ""
    if (s && !b) return s
    return `${s}\n\n${b}`
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      props.onCancel()
      return
    }
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault()
      const msg = fullMessage()
      if (msg.trim()) {
        props.onCommit(msg)
      }
      return
    }
    // Tab to toggle prefix suggestions
    if (e.key === "Tab" && !e.shiftKey && !showPrefixes()) {
      e.preventDefault()
      setShowPrefixes(true)
      return
    }
  }

  const selectPrefix = (p: string) => {
    setPrefix(p)
    setShowPrefixes(false)
    // Focus on subject input
    const input = document.querySelector<HTMLInputElement>(".commit-subject-input")
    input?.focus()
  }

  const handleSubjectInput = (e: Event & { currentTarget: HTMLInputElement }) => {
    const val = e.currentTarget.value
    setSubject(val)
  }

  const handleBodyInput = (e: Event & { currentTarget: HTMLTextAreaElement }) => {
    setBody(e.currentTarget.value)
  }

  // Register keybinds
  useBindings(() => ({
    enabled: true,
    bindings: [
      {
        key: "escape",
        desc: "Cancel commit",
        group: "Git",
        cmd: () => props.onCancel(),
      },
      {
        key: "ctrl+return",
        desc: "Confirm commit",
        group: "Git",
        cmd: () => {
          const msg = fullMessage()
          if (msg.trim()) props.onCommit(msg)
        },
      },
    ],
  }))

  const width = Math.min(60, dimensions().width - 4)

  return (
    <box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      alignItems="center"
      backgroundColor="transparent"
    >
      <box
        width={width}
        backgroundColor={theme.backgroundPanel}
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
        flexDirection="column"
      >
        {/* Title */}
        <box flexShrink={0} paddingBottom={1}>
          <text fg={theme.text}>
            <b>Commit</b>
          </text>
          <Show when={props.stagedCount > 0}>
            <text fg={theme.textMuted}> — {props.stagedCount} file(s) staged</text>
          </Show>
        </box>

        {/* Prefix selector */}
        <Show when={showPrefixes()}>
          <box flexShrink={0} flexDirection="row" gap={1} flexWrap="wrap" paddingBottom={1}>
            <For each={CONVENTIONAL_PREFIXES}>
              {(cp: string) => (
                <box
                  onMouseUp={() => selectPrefix(cp)}
                  backgroundColor={theme.backgroundElement}
                >
                  <text fg={theme.accent} paddingLeft={1} paddingRight={1}>
                    {cp}
                  </text>
                </box>
              )}
            </For>
          </box>
        </Show>

        {/* Subject line */}
        <box flexShrink={0} paddingBottom={1}>
          <text fg={theme.textMuted}>Subject</text>
        </box>
        <box
          flexShrink={0}
          paddingBottom={1}
          border={["left"]}
          customBorderChars={{
            topLeft: "", bottomLeft: "", vertical: "┃",
            topRight: "", bottomRight: "", horizontal: " ",
            bottomT: "", topT: "", cross: "", leftT: "", rightT: "",
          }}
          borderColor={theme.border}
        >
          <text fg={theme.text}>
            {prefix()}{subject()}
            <span style={{ fg: theme.textMuted }}>▌</span>
          </text>
        </box>

        {/* Body */}
        <box flexShrink={0} paddingBottom={1}>
          <text fg={theme.textMuted}>Body (optional)</text>
        </box>
        <box
          flexGrow={1}
          paddingBottom={1}
          border={["left"]}
          customBorderChars={{
            topLeft: "", bottomLeft: "", vertical: "┃",
            topRight: "", bottomRight: "", horizontal: " ",
            bottomT: "", topT: "", cross: "", leftT: "", rightT: "",
          }}
          borderColor={theme.border}
        >
          <text fg={theme.textMuted}>
            {body() || "Write commit body here... (type in terminal)"}
            <span style={{ fg: theme.textMuted }}>▌</span>
          </text>
        </box>

        {/* Hint */}
        <box flexShrink={0} paddingTop={1}>
          <text fg={theme.textMuted}>
            <span style={{ fg: theme.accent }}>Ctrl+Enter</span> to commit ·{" "}
            <span style={{ fg: theme.textMuted }}>Esc</span> to cancel ·{" "}
            <span style={{ fg: theme.textMuted }}>Tab</span> for conventional prefixes
          </text>
        </box>
      </box>
    </box>
  )
}
