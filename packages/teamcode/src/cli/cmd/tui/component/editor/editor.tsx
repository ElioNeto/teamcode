/**
 * Main Editor component.
 *
 * Renders text buffer with line numbers, cursor, selection,
 * syntax highlighting, and VIM mode status bar.
 */

import { createSignal, createEffect, createMemo, For, Show } from "solid-js"
import { TextAttributes } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import { useTheme } from "@tui/context/theme"
import { TextBuffer } from "./buffer"
import { VimEngine } from "./vim-mode"
import { FileTree } from "./file-tree"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditorProps {
  buffer: TextBuffer
  /** VimEngine instance for keyboard handling. Passed through for child components. */
  vim?: VimEngine
  onSave?: () => void
  onClose?: () => void
  showFileTree?: boolean
  rootDir?: string
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export function Editor(props: EditorProps) {
  const { theme } = useTheme()
  const dims = useTerminalDimensions()
  const { buffer, vim } = props

  const [scrollRow, setScrollRow] = createSignal(0)
  const [showTree, setShowTree] = createSignal(props.showFileTree ?? false)
  const [message] = createSignal("")

  // Process keyboard events through VIM engine
  function handleKey(key: string): boolean {
    return vim?.handleKey(key) ?? false
  }

  // Editor height (terminal - status bar - tab bar)
  const editorHeight = createMemo(() => {
    const h = dims().height
    return Math.max(5, h - 3)
  })

  // Line number width
  const lineNumWidth = createMemo(() => {
    const count = buffer.lines.length
    return Math.max(2, Math.ceil(Math.log10(count + 1)))
  })

  // Visible lines
  const visibleLines = createMemo(() => {
    const start = scrollRow()
    const end = Math.min(start + editorHeight(), buffer.lines.length)
    return buffer.lines.slice(start, end)
  })

  // Auto-scroll to keep cursor visible
  createEffect(() => {
    const cur = buffer.cursor
    const scroll = scrollRow()
    const height = editorHeight()
    if (cur.row < scroll) setScrollRow(cur.row)
    else if (cur.row >= scroll + height - 1) setScrollRow(cur.row - height + 2)
  })

  return (
    <box flexGrow={1} flexDirection="row">
      <Show when={showTree()}>
        <FileTree
          rootDir={props.rootDir}
          onSelectFile={(filePath) => {
            setShowTree(false)
            loadFileIntoBuffer(filePath, buffer)
          }}
        />
      </Show>

      <box flexGrow={1} flexDirection="column">
        {/* Tab bar */}
        <box height={1}>
          <text fg={theme.accent} attributes={TextAttributes.BOLD}>
            {buffer.options.filePath ?? "untitled"}
          </text>
          <Show when={buffer.isDirty}>
            <text fg="#ffaa00"> *</text>
          </Show>
        </box>

        {/* Editor body */}
        <box flexGrow={1} flexDirection="row">
          {/* Line numbers */}
          <box>
            <For each={visibleLines()}>
              {(_, idx) => {
                const lineNum = scrollRow() + idx() + 1
                const isCursorLine = lineNum - 1 === buffer.cursor.row
                return (
                  <box height={1}>
                    <text fg={isCursorLine ? theme.accent : theme.textMuted}>
                      {String(lineNum).padStart(lineNumWidth())}
                    </text>
                    <text fg={theme.border}>│</text>
                  </box>
                )
              }}
            </For>
          </box>

          {/* Content */}
          <box flexGrow={1}>
            <For each={visibleLines()}>
              {(line, idx) => {
                const absRow = scrollRow() + idx()
                const hasSelection = buffer.hasSelection()
                if (hasSelection && buffer.selection) {
                  return renderSelectedLine(line, absRow, buffer, theme)
                }
                return (
                  <box height={1}>
                    <text fg={theme.text}>{line}</text>
                  </box>
                )
              }}
            </For>
          </box>
        </box>

        {/* Status bar */}
        <box height={1}>
          <text fg={theme.textMuted}>
            {VimEngine.modeLabel(buffer.mode)} | {buffer.cursor.row + 1}:{buffer.cursor.col + 1}
            {buffer.options.filePath ? ` | ${buffer.options.filePath}` : ""}
          </text>
          <Show when={message()}>
            <text fg="#ffaa00"> [{message()}]</text>
          </Show>
        </box>
      </box>
    </box>
  )
}

// ---------------------------------------------------------------------------
// Selection renderer
// ---------------------------------------------------------------------------

function renderSelectedLine(line: string, absRow: number, buffer: TextBuffer, theme: any) {
  if (!buffer.selection) {
    return (
      <box height={1}>
        <text fg={theme.text}>{line}</text>
      </box>
    )
  }

  const startRow = Math.min(buffer.selection.start.row, buffer.selection.end.row)
  const endRow = Math.max(buffer.selection.start.row, buffer.selection.end.row)
  const startCol =
    buffer.selection.start.row < buffer.selection.end.row
      ? buffer.selection.start.col
      : Math.min(buffer.selection.start.col, buffer.selection.end.col)
  const endCol =
    buffer.selection.start.row < buffer.selection.end.row
      ? buffer.selection.end.col
      : Math.max(buffer.selection.start.col, buffer.selection.end.col)

  if (absRow > startRow && absRow < endRow) {
    return (
      <box height={1}>
        <text fg={theme.text}>{line}</text>
      </box>
    )
  }
  if (absRow === startRow && absRow === endRow) {
    return (
      <box height={1}>
        <text fg={theme.text}>{line.slice(0, startCol)}</text>
        <text fg={theme.accent}>{line.slice(startCol, endCol)}</text>
        <text fg={theme.text}>{line.slice(endCol)}</text>
      </box>
    )
  }
  if (absRow === startRow) {
    return (
      <box height={1}>
        <text fg={theme.text}>{line.slice(0, startCol)}</text>
        <text fg={theme.accent}>{line.slice(startCol)}</text>
      </box>
    )
  }
  if (absRow === endRow) {
    return (
      <box height={1}>
        <text fg={theme.accent}>{line.slice(0, endCol)}</text>
        <text fg={theme.text}>{line.slice(endCol)}</text>
      </box>
    )
  }
  return (
    <box height={1}>
      <text fg={theme.text}>{line}</text>
    </box>
  )
}

// ---------------------------------------------------------------------------
// File loading
// ---------------------------------------------------------------------------

async function loadFileIntoBuffer(filePath: string, buffer: TextBuffer) {
  try {
    const res = await fetch(`file://${filePath}`)
    const text = await res.text()
    buffer.lines = text.split("\n")
    buffer.options.filePath = filePath
    buffer.setCursor(0, 0)
    buffer.markSaved()
  } catch {
    buffer.lines = [`// Failed to load: ${filePath}`]
  }
}
