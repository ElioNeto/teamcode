/**
 * Main Editor component.
 *
 * Renders text buffer with line numbers, cursor, selection,
 * syntax highlighting, and VIM mode status bar.
 */

import { createSignal, createEffect, createMemo, For, Show, onCleanup } from "solid-js"
import { TextAttributes } from "@opentui/core"
import { useTerminalDimensions } from "@opentui/solid"
import { useTheme } from "@tui/context/theme"
import { stringifyKeyStroke } from "@opentui/keymap"
import { useOpencodeKeymap } from "@tui/keymap"
import { TextBuffer } from "./buffer"
import { VimEngine } from "./vim-mode"
import { FileTree } from "./file-tree"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditorProps {
  buffer: TextBuffer
  /** VimEngine instance for keyboard handling. */
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
  const keymap = useOpencodeKeymap()
  const { buffer, vim } = props

  const [scrollRow, setScrollRow] = createSignal(0)
  const [showTree, setShowTree] = createSignal(props.showFileTree ?? false)
  const [statusMessage, setStatusMessage] = createSignal("")

  // Wire up keyboard input: intercept all keys while the editor is active.
  const offKeys = keymap.intercept("key", ({ event }) => {
    const seq = stringifyKeyStroke(event)
    if (!seq) return
    // Ctrl+S → save
    if (seq === "ctrl+s") {
      event.preventDefault()
      props.onSave?.()
      return
    }
    // Ctrl+Q / Ctrl+W → close
    if (seq === "ctrl+q" || seq === "ctrl+w") {
      event.preventDefault()
      props.onClose?.()
      return
    }
    // Ctrl+D → toggle file tree
    if (seq === "ctrl+d") {
      event.preventDefault()
      setShowTree((s) => !s)
      return
    }
    // Delegate to VimEngine
    if (vim?.handleKey(seq) ?? false) {
      event.preventDefault()
    }
  })
  onCleanup(offKeys)

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

  // Show transient status messages (clears after 2s)
  function flashMessage(msg: string) {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(""), 2000)
  }

  return (
    <box flexGrow={1} flexDirection="row">
      <Show when={showTree()}>
        <FileTree
          rootDir={props.rootDir}
          onSelectFile={async (filePath) => {
            setShowTree(false)
            await loadFileIntoBuffer(filePath, buffer)
            flashMessage(`Opened ${filePath}`)
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
          <Show when={statusMessage()}>
            <text fg="#ffaa00"> [{statusMessage()}]</text>
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
    const file = Bun.file(filePath)
    const exists = await file.exists()
    if (!exists) {
      buffer.lines = [""]
      buffer.options.filePath = filePath
      buffer.setCursor(0, 0)
      buffer.markSaved()
      return
    }
    const text = await file.text()
    buffer.lines = text.split("\n")
    buffer.options.filePath = filePath
    buffer.setCursor(0, 0)
    buffer.markSaved()
  } catch (err) {
    buffer.lines = [`// Error loading ${filePath}: ${err instanceof Error ? err.message : String(err)}`]
  }
}

export async function loadBufferFromDisk(buffer: TextBuffer) {
  const fp = buffer.options.filePath
  if (!fp) return
  await loadFileIntoBuffer(fp, buffer)
}

export async function saveBufferToDisk(buffer: TextBuffer): Promise<boolean> {
  const fp = buffer.options.filePath
  if (!fp) return false
  try {
    await Bun.write(fp, buffer.getText())
    buffer.markSaved()
    return true
  } catch {
    return false
  }
}
