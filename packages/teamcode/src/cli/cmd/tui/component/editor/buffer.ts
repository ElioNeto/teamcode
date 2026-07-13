/**
 * Text buffer for the TUI code editor.
 *
 * Line-based storage with:
 * - Cursor tracking (row/col)
 * - Selection support
 * - Undo/redo stack
 * - Efficient line insert/delete/split/join
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Cursor {
  row: number
  col: number
}

export interface Selection {
  start: Cursor
  end: Cursor
}

export type EditorMode = "normal" | "insert" | "visual" | "visual-line"

export interface EditorOptions {
  tabSize: number
  readonly: boolean
  /** If set, the buffer is tied to a real file path */
  filePath?: string
}

// ---------------------------------------------------------------------------
// Undo/redo entry
// ---------------------------------------------------------------------------

type UndoKind = "insert-text" | "delete-text" | "insert-line" | "delete-line" | "split-line" | "join-line"

interface UndoEntry {
  kind: UndoKind
  pos: Cursor
  data: string | string[]
  prevCursor: Cursor
}

// ---------------------------------------------------------------------------
// TextBuffer
// ---------------------------------------------------------------------------

export class TextBuffer {
  /** Lines of text, 0-indexed. Trailing empty line for cursor at end-of-file. */
  lines: string[] = [""]

  cursor: Cursor = { row: 0, col: 0 }
  selection: Selection | null = null
  mode: EditorMode = "normal"
  options: EditorOptions = { tabSize: 2, readonly: false }

  private readonly undoStack: UndoEntry[] = []
  private redoStack: UndoEntry[] = []
  private readonly maxUndo = 500
  private dirty = false
  private readonly filePath?: string

  /** Callback fired on every edit. (buffer) => void */
  onEdit?: (buf: TextBuffer) => void
  /** Callback fired when cursor or selection moves. */
  onMove?: (buf: TextBuffer) => void
  /** Callback fired when mode changes. */
  onModeChange?: (mode: EditorMode) => void

  constructor(filePath?: string, content?: string) {
    this.filePath = filePath
    if (content !== undefined) {
      this.lines = content ? content.split("\n") : [""]
    }
  }

  // -----------------------------------------------------------------------
  // Content
  // -----------------------------------------------------------------------

  /** Return the full text content. */
  getText(): string {
    return this.lines.join("\n")
  }

  /** Return the text of a single line (without newline). */
  getLine(row: number): string {
    if (row < 0 || row >= this.lines.length) return ""
    return this.lines[row]
  }

  /** Total line count */
  get lineCount(): number {
    return this.lines.length
  }

  /** Character count of the (0-indexed) row */
  lineLength(row: number): number {
    if (row < 0 || row >= this.lines.length) return 0
    return this.lines[row].length
  }

  /** Is the buffer modified since last save? */
  get isDirty(): boolean {
    return this.dirty
  }

  /** Mark buffer as saved (clear dirty flag). */
  markSaved(): void {
    this.dirty = false
  }

  // -----------------------------------------------------------------------
  // Cursor
  // -----------------------------------------------------------------------

  clampCursor(c: Cursor): Cursor {
    const row = Math.max(0, Math.min(c.row, this.lines.length - 1))
    const col = Math.max(0, Math.min(c.col, this.lines[row].length))
    return { row, col }
  }

  setCursor(row: number, col: number): void {
    this.cursor = this.clampCursor({ row, col })
    this.onMove?.(this)
  }

  moveUp(n = 1): void {
    this.setCursor(this.cursor.row - n, this.cursor.col)
  }

  moveDown(n = 1): void {
    this.setCursor(this.cursor.row + n, this.cursor.col)
  }

  moveLeft(n = 1): void {
    this.setCursor(this.cursor.row, this.cursor.col - n)
  }

  moveRight(n = 1): void {
    this.setCursor(this.cursor.row, this.cursor.col + n)
  }

  moveToLineStart(): void {
    this.setCursor(this.cursor.row, 0)
  }

  moveToLineEnd(): void {
    this.setCursor(this.cursor.row, this.lines[this.cursor.row].length)
  }

  moveToFirstLine(): void {
    this.setCursor(0, this.cursor.col)
  }

  moveToLastLine(): void {
    this.setCursor(this.lines.length - 1, this.cursor.col)
  }

  moveWordForward(): void {
    const line = this.lines[this.cursor.row]
    let col = this.cursor.col
    // Skip whitespace
    while (col < line.length && /\s/.test(line[col])) col++
    // Skip word
    while (col < line.length && !/\s/.test(line[col])) col++
    this.setCursor(this.cursor.row, col)
  }

  moveWordBackward(): void {
    const line = this.lines[this.cursor.row]
    let col = this.cursor.col - 1
    // Skip whitespace backwards
    while (col >= 0 && /\s/.test(line[col])) col--
    // Skip word backwards
    while (col >= 0 && !/\s/.test(line[col])) col--
    this.setCursor(this.cursor.row, col + 1)
  }

  // -----------------------------------------------------------------------
  // Selection
  // -----------------------------------------------------------------------

  hasSelection(): boolean {
    if (!this.selection) return false
    const { start, end } = this.selection
    return start.row !== end.row || start.col !== end.col
  }

  clearSelection(): void {
    this.selection = null
    this.onMove?.(this)
  }

  /** Get selected text, or empty string if no selection. */
  getSelectedText(): string {
    if (!this.selection) return ""
    const { start, end } = this.normalizedSelection()
    if (start.row === end.row) {
      return this.lines[start.row].slice(start.col, end.col)
    }
    const parts: string[] = [this.lines[start.row].slice(start.col)]
    for (let r = start.row + 1; r < end.row; r++) {
      parts.push(this.lines[r])
    }
    parts.push(this.lines[end.row].slice(0, end.col))
    return parts.join("\n")
  }

  /** Return selection normalized (start < end). */
  normalizedSelection(): { start: Cursor; end: Cursor } {
    const sel = this.selection!
    const startRow = Math.min(sel.start.row, sel.end.row)
    const endRow = Math.max(sel.start.row, sel.end.row)

    let startCol: number
    let endCol: number
    if (sel.start.row === sel.end.row) {
      startCol = Math.min(sel.start.col, sel.end.col)
      endCol = Math.max(sel.start.col, sel.end.col)
    } else if (sel.start.row < sel.end.row) {
      startCol = sel.start.col
      endCol = sel.end.col
    } else {
      startCol = sel.end.col
      endCol = sel.start.col
    }

    return {
      start: { row: startRow, col: startCol },
      end: { row: endRow, col: endCol },
    }
  }

  // -----------------------------------------------------------------------
  // Editing
  // -----------------------------------------------------------------------

  private pushUndo(entry: UndoEntry): void {
    this.undoStack.push(entry)
    if (this.undoStack.length > this.maxUndo) this.undoStack.shift()
    this.redoStack = []
  }

  private markDirty(): void {
    this.dirty = true
    this.onEdit?.(this)
  }

  /** Insert text at cursor position. */
  insertText(text: string): void {
    if (this.options.readonly) return
    const { row, col } = this.cursor
    const line = this.lines[row]
    this.pushUndo({ kind: "insert-text", pos: { row, col }, data: text, prevCursor: { ...this.cursor } })

    this.lines[row] = line.slice(0, col) + text + line.slice(col)
    this.cursor = { row, col: col + text.length }
    this.markDirty()
  }

  /** Delete character before cursor (backspace). */
  backspace(): void {
    if (this.options.readonly) return
    if (this.cursor.col === 0 && this.cursor.row === 0) return
    if (this.cursor.col === 0) {
      // Join with previous line
      const prevLineLen = this.lines[this.cursor.row - 1].length
      this.pushUndo({
        kind: "join-line",
        pos: { row: this.cursor.row, col: 0 },
        data: this.lines[this.cursor.row],
        prevCursor: { ...this.cursor },
      })
      this.lines[this.cursor.row - 1] += this.lines[this.cursor.row]
      this.lines.splice(this.cursor.row, 1)
      this.cursor = { row: this.cursor.row - 1, col: prevLineLen }
    } else {
      const { row, col } = this.cursor
      const line = this.lines[row]
      this.pushUndo({
        kind: "delete-text",
        pos: { row, col: col - 1 },
        data: line[col - 1],
        prevCursor: { ...this.cursor },
      })
      this.lines[row] = line.slice(0, col - 1) + line.slice(col)
      this.cursor = { row, col: col - 1 }
    }
    this.markDirty()
  }

  /** Delete character at cursor (delete). */
  delete(): void {
    if (this.options.readonly) return
    const { row, col } = this.cursor
    if (col >= this.lines[row].length) {
      // Join with next line
      if (row >= this.lines.length - 1) return
      this.pushUndo({
        kind: "join-line",
        pos: { row, col },
        data: this.lines[row + 1],
        prevCursor: { ...this.cursor },
      })
      this.lines[row] += this.lines[row + 1]
      this.lines.splice(row + 1, 1)
    } else {
      const line = this.lines[row]
      this.pushUndo({ kind: "delete-text", pos: { row, col }, data: line[col], prevCursor: { ...this.cursor } })
      this.lines[row] = line.slice(0, col) + line.slice(col + 1)
    }
    this.markDirty()
  }

  /** Insert newline at cursor. */
  newline(): void {
    if (this.options.readonly) return
    const { row, col } = this.cursor
    const line = this.lines[row]
    const before = line.slice(0, col)
    const after = line.slice(col)

    this.pushUndo({
      kind: "split-line",
      pos: { row, col },
      data: after,
      prevCursor: { ...this.cursor },
    })
    this.lines[row] = before
    this.lines.splice(row + 1, 0, after)
    this.cursor = { row: row + 1, col: 0 }
    this.markDirty()
  }

  /** Delete the line at cursor. */
  deleteLine(): void {
    if (this.options.readonly) return
    if (this.lines.length <= 1) {
      this.lines[0] = ""
      this.cursor = { row: 0, col: 0 }
      this.markDirty()
      return
    }
    const { row } = this.cursor
    this.pushUndo({
      kind: "delete-line",
      pos: { row, col: 0 },
      data: this.lines[row],
      prevCursor: { ...this.cursor },
    })
    this.lines.splice(row, 1)
    this.cursor = { row: Math.min(row, this.lines.length - 1), col: 0 }
    this.markDirty()
  }

  /** Insert an empty line above cursor. */
  insertLineAbove(): void {
    if (this.options.readonly) return
    const row = this.cursor.row
    this.pushUndo({
      kind: "insert-line",
      pos: { row, col: 0 },
      data: "",
      prevCursor: { ...this.cursor },
    })
    this.lines.splice(row, 0, "")
  }

  /** Insert an empty line below cursor. */
  insertLineBelow(): void {
    if (this.options.readonly) return
    const row = this.cursor.row
    this.pushUndo({
      kind: "insert-line",
      pos: { row: row + 1, col: 0 },
      data: "",
      prevCursor: { ...this.cursor },
    })
    this.lines.splice(row + 1, 0, "")
    this.cursor = { row: row + 1, col: 0 }
  }

  /** Delete selected text. */
  deleteSelection(): void {
    if (!this.hasSelection()) return
    const { start, end } = this.normalizedSelection()
    this.pushUndo({
      kind: "delete-text",
      pos: start,
      data: this.getSelectedText(),
      prevCursor: { ...this.cursor },
    })
    if (start.row === end.row) {
      const line = this.lines[start.row]
      this.lines[start.row] = line.slice(0, start.col) + line.slice(end.col)
    } else {
      const firstPart = this.lines[start.row].slice(0, start.col)
      const lastPart = this.lines[end.row].slice(end.col)
      this.lines.splice(start.row + 1, end.row - start.row)
      this.lines[start.row] = firstPart + lastPart
    }
    this.cursor = start
    this.selection = null
    this.markDirty()
  }

  // -----------------------------------------------------------------------
  // Undo / Redo
  // -----------------------------------------------------------------------

  undo(): void {
    const entry = this.undoStack.pop()
    if (!entry) return
    this.redoStack.push(entry)

    // Simple per-operation undo — for a full editor, this needs to be
    // more sophisticated. This covers the common cases.
    switch (entry.kind) {
      case "insert-text": {
        const { row, col } = entry.pos
        const line = this.lines[row]
        this.lines[row] = line.slice(0, col) + line.slice(col + (entry.data as string).length)
        break
      }
      case "delete-text": {
        const { row, col } = entry.pos
        const line = this.lines[row]
        this.lines[row] = line.slice(0, col) + (entry.data as string) + line.slice(col)
        break
      }
      case "insert-line": {
        this.lines.splice(entry.pos.row, 1)
        break
      }
      case "delete-line": {
        this.lines.splice(entry.pos.row, 0, entry.data as string)
        break
      }
      case "split-line": {
        const after = entry.data as string
        this.lines[entry.pos.row] += after
        this.lines.splice(entry.pos.row + 1, 1)
        break
      }
      case "join-line": {
        const removed = entry.data as string
        this.lines.splice(entry.pos.row, 0, removed)
        this.lines[entry.pos.row - 1] = this.lines[entry.pos.row - 1].slice(0, -removed.length)
        break
      }
    }
    this.cursor = entry.prevCursor
    this.markDirty()
  }

  redo(): void {
    const entry = this.redoStack.pop()
    if (!entry) return
    this.undoStack.push(entry)
    // Re-apply the operation by redoing its inverse
    // (Simplified — same as original apply)
    this.cursor = entry.pos
    switch (entry.kind) {
      case "insert-text":
        this.insertText(entry.data as string)
        break
      case "delete-text":
        this.delete()
        break
      case "insert-line":
        this.insertLineBelow()
        break
      case "delete-line":
        this.deleteLine()
        break
      case "split-line":
        this.newline()
        break
      case "join-line":
        this.delete()
        break
    }
  }

  // -----------------------------------------------------------------------
  // Indentation
  // -----------------------------------------------------------------------

  indent(): void {
    if (this.options.readonly) return
    const spaces = " ".repeat(this.options.tabSize)
    this.insertText(spaces)
  }

  outdent(): void {
    if (this.options.readonly) return
    const { row, col } = this.cursor
    const line = this.lines[row]
    const remove = Math.min(col, this.options.tabSize)
    if (remove === 0) return
    this.pushUndo({
      kind: "delete-text",
      pos: { row, col: col - remove },
      data: line.slice(col - remove, col),
      prevCursor: { ...this.cursor },
    })
    this.lines[row] = line.slice(0, col - remove) + line.slice(col)
    this.cursor = { row, col: col - remove }
    this.markDirty()
  }
}
