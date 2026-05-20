import { createMemo, For, Show } from "solid-js"
import { useTheme } from "@tui/context/theme"
import { useTuiConfig } from "@tui/context/tui-config"
import { getScrollAcceleration } from "@tui/util/scroll"

export function DiffView(props: {
  diff: string
  filename: string
  onClose?: () => void
}) {
  const { theme } = useTheme()
  const tuiConfig = useTuiConfig()
  const scrollAcceleration = createMemo(() => getScrollAcceleration(tuiConfig))

  // Parse diff into structured lines for colorized rendering
  const diffLines = createMemo(() => {
    const lines = props.diff.split("\n")
    return lines.map((line) => {
      if (line.startsWith("diff --git")) return { type: "header" as const, text: line }
      if (line.startsWith("index ")) return { type: "index" as const, text: line }
      if (line.startsWith("--- ")) return { type: "file-old" as const, text: line }
      if (line.startsWith("+++ ")) return { type: "file-new" as const, text: line }
      if (line.startsWith("@@")) return { type: "hunk" as const, text: line }
      if (line.startsWith("+")) return { type: "addition" as const, text: line }
      if (line.startsWith("-")) return { type: "deletion" as const, text: line }
      if (line.startsWith("\\ ")) return { type: "note" as const, text: line }
      // Binary diffs
      if (line.startsWith("Binary files")) return { type: "note" as const, text: line }
      return { type: "context" as const, text: line }
    })
  })

  return (
    <box
      flexGrow={1}
      height="100%"
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      paddingRight={2}
    >
      {/* File header */}
      <box flexShrink={0} paddingBottom={1}>
        <text fg={theme.text}>
          <b>Diff: </b>
          <span style={{ fg: theme.accent }}>{props.filename}</span>
        </text>
        <Show when={props.onClose}>
          <text fg={theme.textMuted}> [Esc to close]</text>
        </Show>
      </box>

      {/* Diff content */}
      <scrollbox
        flexGrow={1}
        scrollAcceleration={scrollAcceleration()}
        verticalScrollbarOptions={{
          trackOptions: {
            backgroundColor: theme.background,
            foregroundColor: theme.borderActive,
          },
        }}
      >
        <Show
          when={diffLines().length > 0 && !(diffLines().length === 1 && diffLines()[0]?.text === "")}
          fallback={
            <text fg={theme.textMuted}>No diff content available</text>
          }
        >
          <For each={diffLines()}>
            {(line) => {
              if (line.type === "header") {
                return <text fg={theme.textMuted}>{line.text}</text>
              }
              if (line.type === "hunk") {
                return (
                  <text fg={theme.diffHunkHeader}>
                    {line.text}
                  </text>
                )
              }
              if (line.type === "addition") {
                return (
                  <text fg={theme.diffAdded}>
                    {line.text}
                  </text>
                )
              }
              if (line.type === "deletion") {
                return (
                  <text fg={theme.diffRemoved}>
                    {line.text}
                  </text>
                )
              }
              if (line.type === "file-old" || line.type === "file-new") {
                return <text fg={theme.textMuted}>{line.text}</text>
              }
              if (line.type === "note") {
                return <text fg={theme.textMuted}>{line.text}</text>
              }
              // Context
              return <text fg={theme.text}>{line.text}</text>
            }}
          </For>
        </Show>
      </scrollbox>
    </box>
  )
}
