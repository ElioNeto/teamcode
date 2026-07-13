/**
 * VIM mode state machine for the TUI editor.
 *
 * Manages transitions between normal, insert, visual, and visual-line modes.
 * Handles VIM command sequences (e.g., `dd`, `yy`, `p`, `/search`).
 */

import type { EditorMode } from "./buffer"
import { TextBuffer } from "./buffer"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A pending VIM command being composed. */
interface PendingCommand {
  /** Raw key sequence (e.g. "dd", "yy", "3j") */
  sequence: string
  /** Numeric prefix (e.g. 3 in "3j") */
  count: number
}

/** Callbacks for actions triggered by VIM commands. */
export interface VimActionCallbacks {
  onSave?: () => void
  onSearch?: (query: string) => void
  onOpenFile?: (path: string) => void
  onCloseEditor?: () => void
}

// ---------------------------------------------------------------------------
// VimEngine
// ---------------------------------------------------------------------------

export class VimEngine {
  buffer: TextBuffer
  pending: PendingCommand = { sequence: "", count: 0 }
  callbacks: VimActionCallbacks = {}

  /** Search state */
  searchQuery = ""
  searchMode = false

  constructor(buffer: TextBuffer, callbacks?: VimActionCallbacks) {
    this.buffer = buffer
    this.callbacks = callbacks ?? {}
  }

  /** Process a key press in the context of the current mode. */
  handleKey(key: string): boolean {
    // If in search mode, keys go to search query
    if (this.searchMode) {
      return this.handleSearchKey(key)
    }

    switch (this.buffer.mode) {
      case "insert":
        return this.handleInsertKey(key)
      case "normal":
        return this.handleNormalKey(key)
      case "visual":
      case "visual-line":
        return this.handleVisualKey(key)
    }
    return false
  }

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------

  private handleSearchKey(key: string): boolean {
    if (key === "escape" || key === "return") {
      this.searchMode = false
      return true
    }
    if (key === "backspace") {
      this.searchQuery = this.searchQuery.slice(0, -1)
      return true
    }
    if (key.length === 1) {
      this.searchQuery += key
      // Perform search
      this.performSearch()
      return true
    }
    return false
  }

  private performSearch(): void {
    if (!this.searchQuery) return
    const buf = this.buffer
    // Search forward from cursor
    for (let r = buf.cursor.row; r < buf.lines.length; r++) {
      const col =
        r === buf.cursor.row
          ? buf.lines[r].indexOf(this.searchQuery, buf.cursor.col + 1)
          : buf.lines[r].indexOf(this.searchQuery)
      if (col !== -1) {
        buf.setCursor(r, col)
        buf.selection = {
          start: { row: r, col },
          end: { row: r, col: col + this.searchQuery.length },
        }
        return
      }
    }
    // Wrap around
    for (let r = 0; r <= buf.cursor.row; r++) {
      const col =
        r === buf.cursor.row ? buf.lines[r].indexOf(this.searchQuery, 0) : buf.lines[r].indexOf(this.searchQuery)
      if (col !== -1 && (r < buf.cursor.row || col < buf.cursor.col)) {
        buf.setCursor(r, col)
        buf.selection = {
          start: { row: r, col },
          end: { row: r, col: col + this.searchQuery.length },
        }
        return
      }
    }
  }

  // -----------------------------------------------------------------------
  // Insert mode
  // -----------------------------------------------------------------------

  private handleInsertKey(key: string): boolean {
    const buf = this.buffer

    switch (key) {
      case "escape":
        this.buffer.mode = "normal"
        // Move cursor left one (VIM behavior)
        if (buf.cursor.col > 0) buf.moveLeft()
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true

      case "return":
        buf.newline()
        return true

      case "backspace":
        buf.backspace()
        return true

      case "delete":
      case "del":
        buf.delete()
        return true

      case "tab":
        buf.indent()
        return true

      default:
        if (key.length === 1) {
          buf.insertText(key)
          return true
        }
        return false
    }
  }

  // -----------------------------------------------------------------------
  // Normal mode
  // -----------------------------------------------------------------------

  private handleNormalKey(key: string): boolean {
    const buf = this.buffer

    // Digit prefix for count
    if (/^[1-9]$/.test(key)) {
      this.pending.count = this.pending.count * 10 + Number.parseInt(key, 10)
      return true
    }

    const count = Math.max(1, this.pending.count)

    if (this.handleMovementKey(key, buf, count)) return true
    if (this.handleInsertEntryKey(key, buf)) return true
    if (this.handleEditingKey(key, buf, count)) return true
    if (this.handleVisualModeKey(key, buf)) return true
    if (this.handleOtherKey(key, buf)) return true

    this.clearPending()
    return false
  }

  private handleMovementKey(key: string, buf: TextBuffer, count: number): boolean {
    if (this.pending.sequence === "g" && key === "g") {
      buf.moveToFirstLine()
      this.clearPending()
      return true
    }
    switch (key) {
      case "h":
      case "left":
        buf.moveLeft(count)
        this.clearPending()
        return true
      case "j":
      case "down":
        buf.moveDown(count)
        this.clearPending()
        return true
      case "k":
      case "up":
        buf.moveUp(count)
        this.clearPending()
        return true
      case "l":
      case "right":
        buf.moveRight(count)
        this.clearPending()
        return true
      case "w":
        buf.moveWordForward()
        this.clearPending()
        return true
      case "b":
        buf.moveWordBackward()
        this.clearPending()
        return true
      case "0":
      case "home":
        buf.moveToLineStart()
        this.clearPending()
        return true
      case "$":
      case "end":
        buf.moveToLineEnd()
        this.clearPending()
        return true
      case "g":
        if (this.pending.sequence === "") {
          this.pending.sequence = "g"
          return true
        }
        return false
      case "G":
        buf.moveToLastLine()
        this.clearPending()
        return true
    }
    return false
  }

  private handleInsertEntryKey(key: string, buf: TextBuffer): boolean {
    switch (key) {
      case "i":
        buf.mode = "insert"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
      case "a":
        if (buf.cursor.col < buf.lineLength(buf.cursor.row)) buf.moveRight()
        buf.mode = "insert"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
      case "I":
        buf.moveToLineStart()
        buf.mode = "insert"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
      case "A":
        buf.moveToLineEnd()
        buf.mode = "insert"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
      case "o":
      case "p":
        buf.insertLineBelow()
        buf.mode = "insert"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
      case "O":
        buf.insertLineAbove()
        buf.mode = "insert"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
    }
    return false
  }

  private handleEditingKey(key: string, buf: TextBuffer, count: number): boolean {
    switch (key) {
      case "x":
        for (let i = 0; i < count; i++) buf.delete()
        this.clearPending()
        return true
      case "d":
        if (this.pending.sequence === "") {
          this.pending.sequence = "d"
          return true
        }
        if (this.pending.sequence === "d") {
          for (let i = 0; i < count; i++) buf.deleteLine()
          this.clearPending()
          return true
        }
        return false
      case "y":
        if (this.pending.sequence === "") {
          this.pending.sequence = "y"
          return true
        }
        if (this.pending.sequence === "y") {
          this.clearPending()
          return true
        }
        return false
      case "u":
        buf.undo()
        this.clearPending()
        return true
      case "r":
        buf.redo()
        this.clearPending()
        return true
      case "delete":
      case "del":
        buf.delete()
        this.clearPending()
        return true
    }
    return false
  }

  private handleVisualModeKey(key: string, buf: TextBuffer): boolean {
    switch (key) {
      case "v":
        buf.selection = { start: { ...buf.cursor }, end: { ...buf.cursor } }
        buf.mode = "visual"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
      case "V":
        buf.selection = {
          start: { row: buf.cursor.row, col: 0 },
          end: { row: buf.cursor.row, col: buf.lineLength(buf.cursor.row) },
        }
        buf.mode = "visual-line"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true
    }
    return false
  }

  private handleOtherKey(key: string, buf: TextBuffer): boolean {
    switch (key) {
      case "/":
        this.searchMode = true
        this.searchQuery = ""
        this.clearPending()
        return true
      case "ctrl+s":
        this.callbacks.onSave?.()
        this.clearPending()
        return true
      case "ctrl+q":
      case "ctrl+w":
        this.callbacks.onCloseEditor?.()
        this.clearPending()
        return true
    }
    return false
  }

  // -----------------------------------------------------------------------
  // Visual mode
  // -----------------------------------------------------------------------

  private handleVisualKey(key: string): boolean {
    const buf = this.buffer

    switch (key) {
      case "escape":
      case "v":
        buf.mode = "normal"
        buf.clearSelection()
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true

      case "V":
        buf.mode = "visual-line"
        buf.selection = {
          start: { row: buf.cursor.row, col: 0 },
          end: { row: buf.cursor.row, col: buf.lineLength(buf.cursor.row) },
        }
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true

      // Movement extends selection
      case "h":
      case "left":
        buf.moveLeft()
        if (buf.selection) buf.selection.end = { ...buf.cursor }
        return true
      case "j":
      case "down":
        buf.moveDown()
        if (buf.selection) buf.selection.end = { ...buf.cursor }
        return true
      case "k":
      case "up":
        buf.moveUp()
        if (buf.selection) buf.selection.end = { ...buf.cursor }
        return true
      case "l":
      case "right":
        buf.moveRight()
        if (buf.selection) buf.selection.end = { ...buf.cursor }
        return true

      // Delete selection
      case "x":
      case "d":
      case "delete":
        buf.deleteSelection()
        buf.mode = "normal"
        this.clearPending()
        buf.onModeChange?.(buf.mode)
        return true

      default:
        return false
    }
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private clearPending(): void {
    this.pending = { sequence: "", count: 0 }
  }

  /** Get the VIM mode indicator string (for status bar). */
  static modeLabel(mode: EditorMode): string {
    switch (mode) {
      case "normal":
        return "NORMAL"
      case "insert":
        return "INSERT"
      case "visual":
        return "VISUAL"
      case "visual-line":
        return "V-LINE"
    }
  }
}
