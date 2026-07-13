# TUI Code Editor

> **Feature:** Issue #1111 — Editor/Visualizador de código na TUI (estilo VIM/NANO)
> **Branch:** `feat/editor-tui-vim-nano`
> **Status:** Implemented (v2.4.0)
> **Location:** `packages/teamcode/src/cli/cmd/tui/component/editor/`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Text Buffer](#3-text-buffer)
4. [VIM Mode Engine](#4-vim-mode-engine)
5. [Syntax Highlighting](#5-syntax-highlighting)
6. [File Tree](#6-file-tree)
7. [Editor Component](#7-editor-component)
8. [Editor Page](#8-editor-page)
9. [Integration](#9-integration)
10. [Keybindings Reference](#10-keybindings-reference)
11. [Extending the Editor](#11-extending-the-editor)
12. [Future Improvements](#12-future-improvements)

---

## 1. Overview

The TUI Code Editor is a **full-screen text editor** embedded in the TeamCode terminal interface. It provides:

- **VIM-style modal editing** — Normal, Insert, and Visual modes
- **File navigation** — Built-in file tree browser with keyboard navigation
- **Syntax highlighting** — 15+ languages supported
- **Session persistence** — Files can be loaded and saved
- **VIM keybindings** — `hjkl` movement, `dd` delete, `u` undo, `/` search, and more
- **Integration** — Accessible from the TUI command palette (`Ctrl+Shift+P`)

### Accessing the Editor

| Method               | Action                                                          |
| -------------------- | --------------------------------------------------------------- |
| **Command palette**  | `Ctrl+Shift+P` → "Open code editor"                             |
| **Route navigation** | Via `route.navigate({ type: "editor" })`                        |
| **With file path**   | `route.navigate({ type: "editor", filePath: "/path/to/file" })` |

---

## 2. Architecture

### File Structure

```
component/editor/
├── buffer.ts          # Text buffer — line storage, cursor, selection, undo/redo
├── vim-mode.ts        # VIM mode state machine (normal/insert/visual)
├── syntax.ts          # Syntax highlighting (15+ languages)
├── file-tree.tsx      # File tree browser component
└── editor.tsx         # Main editor component (integration, rendering)

routes/
└── editor.tsx         # Editor page route (buffer + VIM engine setup)

context/
└── route.tsx          # EditorRoute type definition

app.tsx                # Route matching + command registration
```

### Component Hierarchy

```
EditorPage (routes/editor.tsx)
  └── Editor (component/editor/editor.tsx)
       ├── [FileTree] (component/editor/file-tree.tsx) ← optional sidebar
       ├── [Tab Bar] (inline)
       ├── [Editor Body] (inline)
       │    ├── [Line Numbers]
       │    └── [Text Content] ← with selection highlighting
       └── [Status Bar] (inline)
            ├── Mode indicator (NORMAL/INSERT/VISUAL)
            ├── Line:Column
            └── File path

Data structures (not rendered):
├── TextBuffer (buffer.ts)
│    ├── lines[]                 ← line storage
│    ├── cursor {row, col}       ← cursor position
│    ├── selection {start, end}  ← selection range
│    ├── undoStack[]             ← undo history
│    └── redoStack[]             ← redo history
│
└── VimEngine (vim-mode.ts)
     ├── buffer: TextBuffer       ← reference
     ├── pending {sequence, count} ← VIM command being composed
     ├── searchMode               ← search state
     └── callbacks                ← save, close, search handlers
```

---

## 3. Text Buffer

**File:** `component/editor/buffer.ts` (262 lines)

The `TextBuffer` class is the core data structure for the editor. It manages:

### Line Storage

```typescript
class TextBuffer {
  lines: string[] // 0-indexed array of lines
  cursor: Cursor // { row: number, col: number }
  selection: Selection | null // { start: Cursor, end: Cursor }
  mode: EditorMode // "normal" | "insert" | "visual" | "visual-line"
  options: EditorOptions // { tabSize, readonly, filePath? }
  isDirty: boolean // true if modified since last save

  // Callbacks
  onEdit?: (buf: TextBuffer) => void
  onMove?: (buf: TextBuffer) => void
  onModeChange?: (mode: EditorMode) => void
}
```

### Cursor Movement

| Method                | Description                        |
| --------------------- | ---------------------------------- |
| `moveUp(n)`           | Move cursor up n lines             |
| `moveDown(n)`         | Move cursor down n lines           |
| `moveLeft(n)`         | Move cursor left n characters      |
| `moveRight(n)`        | Move cursor right n characters     |
| `moveToLineStart()`   | Jump to beginning of line          |
| `moveToLineEnd()`     | Jump to end of line                |
| `moveToFirstLine()`   | Jump to first line (gg)            |
| `moveToLastLine()`    | Jump to last line (G)              |
| `moveWordForward()`   | Jump to next word boundary (w)     |
| `moveWordBackward()`  | Jump to previous word boundary (b) |
| `setCursor(row, col)` | Set absolute cursor position       |

### Editing Operations

| Method              | Description                        |
| ------------------- | ---------------------------------- |
| `insertText(text)`  | Insert text at cursor              |
| `backspace()`       | Delete character before cursor     |
| `delete()`          | Delete character at cursor         |
| `newline()`         | Insert newline at cursor           |
| `deleteLine()`      | Delete current line                |
| `deleteSelection()` | Delete selected text               |
| `insertLineAbove()` | Insert empty line above cursor (O) |
| `insertLineBelow()` | Insert empty line below cursor (o) |
| `indent()`          | Insert spaces (tab)                |
| `outdent()`         | Remove leading spaces              |

### Selection

| Method                  | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `hasSelection()`        | Check if selection exists and is non-empty         |
| `getSelectedText()`     | Get the selected text                              |
| `clearSelection()`      | Remove selection                                   |
| `normalizedSelection()` | Return selection in normalized order (start < end) |

### Undo/Redo

The undo/redo system tracks operations with a **500-entry stack**:

| Operation Type | Kind          | Undo Behavior         | Redo Behavior |
| -------------- | ------------- | --------------------- | ------------- |
| Text insert    | `insert-text` | Remove inserted chars | Re-insert     |
| Text delete    | `delete-text` | Restore deleted chars | Re-delete     |
| Line insert    | `insert-line` | Remove line           | Re-insert     |
| Line delete    | `delete-line` | Restore line          | Re-delete     |
| Line split     | `split-line`  | Join lines            | Re-split      |
| Line join      | `join-line`   | Re-split              | Re-join       |

---

## 4. VIM Mode Engine

**File:** `component/editor/vim-mode.ts` (310 lines)

The `VimEngine` class implements a VIM-style modal editing state machine.

### Mode Transitions

```
                    ┌──────────┐
         ┌──────────│  NORMAL   │──────────┐
         │          └──────────┘          │
         │ i/a/I/A/o/O    escape          │ v/V
         ▼                                 ▼
    ┌──────────┐                    ┌──────────┐
    │  INSERT   │                    │  VISUAL   │
    └──────────┘                    └──────────┘
                                         │
                                         │ V
                                         ▼
                                    ┌──────────┐
                                    │V-LINE     │
                                    └──────────┘
```

### Normal Mode Commands

| Key                 | Action                            |
| ------------------- | --------------------------------- |
| `h` / `left`        | Move cursor left                  |
| `j` / `down`        | Move cursor down                  |
| `k` / `up`          | Move cursor up                    |
| `l` / `right`       | Move cursor right                 |
| `w`                 | Jump word forward                 |
| `b`                 | Jump word backward                |
| `0` / `home`        | Go to line start                  |
| `$` / `end`         | Go to line end                    |
| `gg`                | Go to first line                  |
| `G`                 | Go to last line                   |
| `i`                 | Enter insert mode (before cursor) |
| `a`                 | Enter insert mode (after cursor)  |
| `I`                 | Insert at line start              |
| `A`                 | Insert at line end                |
| `o`                 | Insert new line below             |
| `O`                 | Insert new line above             |
| `x`                 | Delete character (with count)     |
| `dd`                | Delete line (with count)          |
| `yy`                | Yank line (copy)                  |
| `u`                 | Undo                              |
| `Ctrl+r`            | Redo                              |
| `v`                 | Enter visual mode                 |
| `V`                 | Enter visual line mode            |
| `/`                 | Search mode                       |
| `Ctrl+s`            | Save file                         |
| `Ctrl+q` / `Ctrl+w` | Close editor                      |

### Insert Mode

| Key                | Action                |
| ------------------ | --------------------- |
| `escape`           | Return to normal mode |
| `return`           | Newline               |
| `backspace`        | Delete before cursor  |
| `delete` / `del`   | Delete at cursor      |
| `tab`              | Indent                |
| Any printable char | Insert at cursor      |

### Visual Mode

| Key                  | Action                                |
| -------------------- | ------------------------------------- |
| `escape` / `v`       | Return to normal mode                 |
| `V`                  | Switch to visual line mode            |
| Movement keys        | Extend selection                      |
| `x` / `d` / `delete` | Delete selection and return to normal |

### Count Prefix

Numeric prefixes work for movement and deletion commands:

- `3j` → Move down 3 lines
- `5dd` → Delete 5 lines
- `2x` → Delete 2 characters

### Search Mode

- Press `/` to enter search mode
- Type the search query (characters appear inline)
- Press `Enter` to confirm, `Escape` to cancel
- Searches forward from cursor position, wraps around to top

---

## 5. Syntax Highlighting

**File:** `component/editor/syntax.ts` (435 lines)

### Supported Languages (15+)

| Extension                     | Language   | Highlighting                          |
| ----------------------------- | ---------- | ------------------------------------- |
| `.ts`, `.tsx`                 | TypeScript | ✅ Keywords, types, strings, comments |
| `.js`, `.jsx`, `.mjs`, `.cjs` | JavaScript | ✅ Keywords, strings, comments        |
| `.go`                         | Go         | ✅ Keywords, types, strings           |
| `.py`                         | Python     | ✅ Keywords, strings, comments        |
| `.rs`                         | Rust       | ✅ Keywords, types, comments          |
| `.sh`, `.bash`, `.zsh`        | Bash       | ✅ Keywords, comments                 |
| `.json`                       | JSON       | ✅ Strings                            |
| `.yaml`, `.yml`               | YAML       | ✅ Comments                           |
| `.md`                         | Markdown   | Plain text                            |
| `.sql`                        | SQL        | ✅ Keywords, comments                 |
| `.css`                        | CSS        | Plain text (WIP)                      |
| `.html`, `.xml`               | HTML/XML   | Plain text (WIP)                      |
| `.toml`, `.ini`, `.cfg`       | Config     | Plain text                            |
| Others                        | Default    | Plain text                            |

### Architecture

```
SyntaxHighlighter
  └── SimpleHighlighter (keyword-based + regex fallback)
       ├── Tokenizer: regex-based
       ├── Keywords: language-specific keyword sets
       ├── Strings: double/single/backtick
       ├── Numbers: integers, floats, scientific
       ├── Comments: single-line (//, #) and block (/* */)
       └── Types: capitalized identifiers
```

The highlighter uses a **two-pass tokenization** strategy:

1. **Block comment detection** — tracks open/close across multiple lines
2. **Line tokenization** — regex-based with named capture groups

### Token Types

| Token Type    | Color Mapping      | Example                       |
| ------------- | ------------------ | ----------------------------- |
| `keyword`     | `theme.accent`     | `const`, `function`, `return` |
| `string`      | Theme string color | `"hello"`, `'world'`          |
| `comment`     | Theme muted        | `// comment`, `# comment`     |
| `number`      | Theme number color | `42`, `3.14`, `1e5`           |
| `type`        | Theme type color   | `string`, `Promise<T>`        |
| `punctuation` | Default            | `{`, `}`, `;`, `,`            |
| `normal`      | `theme.text`       | Identifiers, other text       |

### Adding a New Language

To add highlighting for a new language, add an entry to `LANGUAGE_MAP` in `syntax.ts`:

```typescript
const LANGUAGE_MAP: Record<string, LanguageDef> = {
  rb: {
    keywords: new Set([
      "def",
      "class",
      "module",
      "return",
      "if",
      "else",
      "end",
      "do",
      "yield",
      "require",
      "include",
      "extend",
      "attr_accessor",
      "nil",
      "true",
      "false",
    ]),
    lineComment: "#",
  },
  // ... add more languages
}
```

---

## 6. File Tree

**File:** `component/editor/file-tree.tsx` (150 lines)

### Features

- **Directory expansion** — Press `Enter`, `l`, or `→` to expand/collapse
- **Keyboard navigation** — `j`/`k` or `↑`/`↓` to move
- **File opening** — Press `Enter` on a file to open it
- **Fuzzy filter** — Type characters to filter the visible file list
- **Sorting** — Directories first, alphabetical within each group
- **Visual hierarchy** — ▶/▼ icons for collapsed/expanded directories

### Keybindings

| Key                     | Action                        |
| ----------------------- | ----------------------------- |
| `j` / `down`            | Move selection down           |
| `k` / `up`              | Move selection up             |
| `enter` / `l` / `right` | Expand directory or open file |
| `h` / `left`            | Collapse directory            |
| Printable chars         | Filter by name                |
| `backspace`             | Remove last filter character  |

---

## 7. Editor Component

**File:** `component/editor/editor.tsx` (200 lines)

The Editor component integrates all sub-components into a cohesive UI:

### Layout

```
┌─────────────────────────────────────────┐
│  filename.ts *            ← Tab Bar     │
├──────┬──────────────────────────────────┤
│      │                                  │
│  1 │ │  const x = 42;                   │
│  2 │ │  function hello() {              │
│  3 │ │    return "world";               │
│  4 │ │  }                               │
│      │                                  │
├──────┴──────────────────────────────────┤
│ NORMAL | 3:12 | filename.ts ← Status Bar│
└─────────────────────────────────────────┘
     ↑ Line numbers       ↑ Content
```

### Features

- **Line numbers** — Right-aligned with `│` separator
- **Cursor line highlight** — Cursor line number shown in accent color
- **Selection highlighting** — Selected text shown in accent color
- **Auto scroll** — Editor scrolls to keep cursor visible
- **Status bar** — Shows mode, cursor position, and file path
- **Dirty indicator** — `*` shown next to filename when unsaved changes exist

---

## 8. Editor Page

**File:** `routes/editor.tsx` (70 lines)

The EditorPage wraps the Editor component with:

- **TextBuffer creation** — Initialized with optional `filePath` from route
- **VimEngine setup** — Configured with save/close/search callbacks
- **File loading** — Via `file://` API on mount (if filePath provided)
- **Save handling** — Writes content back via `file://` PUT
- **Close confirmation** — Warns if buffer has unsaved changes
- **Project root** — Uses `ProjectProvider` for `rootDir` when not specified

### Route Parameters

```typescript
type EditorRoute = {
  type: "editor"
  filePath?: string // File to open on launch
  rootDir?: string // Project root directory for file tree
}
```

---

## 9. Integration

### Route Registration

In `context/route.tsx`:

```typescript
export type EditorRoute = {
  type: "editor"
  filePath?: string
  rootDir?: string
}

export type Route = HomeRoute | SessionRoute | PluginRoute | EditorRoute
```

### App Integration

In `app.tsx`:

```typescript
import { EditorPage } from "@tui/routes/editor"

// Route matching
<Match when={route.data.type === "editor"}>
  <EditorPage />
</Match>

// Command palette
{
  name: "editor.open",
  title: "Open code editor",
  category: "Editor",
  run: () => route.navigate({ type: "editor" }),
}
```

### Plugin API

In `plugin/api.tsx`, the `routeCurrent` function handles EditorRoute:

```typescript
if (route.data.type === "editor") {
  return { name: "editor", params: {} }
}
```

---

## 10. Keybindings Reference

### Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│              TUI EDITOR — KEYBINDINGS                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  MOVEMENT                    EDITING                 │
│    h,j,k,l  ←↓↑→  move        x        delete char   │
│    w         word forward     dd       delete line   │
│    b         word backward    u        undo          │
│    0         line start       Ctrl+r   redo          │
│    $         line end         .        (future)      │
│    gg        file start                               │
│    G         file end         MODES                   │
│    Ctrl+f    page down        i        insert mode   │
│    Ctrl+b    page up          a        append mode   │
│                               I        insert line   │
│  COUNTS                       A        append line   │
│    3j        3 lines down     o        open below    │
│    5dd       5 lines delete   O        open above    │
│    2x        2 chars delete   escape   normal mode   │
│                               v        visual mode   │
│  SEARCH                       V        visual line   │
│    /         search                                 │
│    n         next (future)    FILE                   │
│    N         prev (future)    Ctrl+s   save          │
│                               Ctrl+d   toggle tree   │
│  VISUAL MODE                  Ctrl+q   close         │
│    movement  extend select    Ctrl+w   close         │
│    x/d       delete selection                        │
│    escape    exit visual                             │
└─────────────────────────────────────────────────────┘
```

### Global Editor Keybindings

| Key Combination | Action           | Scope       |
| --------------- | ---------------- | ----------- |
| `Ctrl+s`        | Save file        | Editor page |
| `Ctrl+q`        | Close editor     | Editor page |
| `Ctrl+w`        | Close editor     | Editor page |
| `Ctrl+f`        | Page down        | Editor body |
| `Ctrl+b`        | Page up          | Editor body |
| `Ctrl+d`        | Toggle file tree | Editor body |

---

## 11. Extending the Editor

### Adding a New VIM Command

Add a case to the `handleNormalKey` method in `vim-mode.ts`:

```typescript
private handleNormalKey(key: string): boolean {
  switch (key) {
    // ... existing commands ...

    case "d": {
      if (this.pending.sequence === "") {
        this.pending.sequence = "d"
        return true
      }
      // Already handling "dd" - existing code
      break
    }

    case ".": {
      // Repeat last command (VIM behavior)
      this.repeatLast()
      this.clearPending()
      return true
    }
  }
}
```

### Adding a New Language for Syntax Highlighting

Add to `LANGUAGE_MAP` in `syntax.ts`:

```typescript
const LANGUAGE_MAP: Record<string, LanguageDef> = {
  // ... existing languages ...

  lua: {
    keywords: new Set([
      "function",
      "local",
      "return",
      "if",
      "then",
      "else",
      "elseif",
      "end",
      "for",
      "while",
      "do",
      "repeat",
      "until",
      "nil",
      "true",
      "false",
      "not",
      "and",
      "or",
      "require",
      "print",
    ]),
    lineComment: "--",
    blockComment: ["--[[", "]]"],
    stringDelimiters: ['"', "'"],
  },
}
```

### Adding Tree-Sitter Highlighting

The `SyntaxHighlighter` class in `syntax.ts` has a placeholder for tree-sitter integration:

```typescript
export class SyntaxHighlighter {
  private parser: Promise<Parser> | null = null

  async init(): Promise<void> {
    try {
      const Parser = await import("web-tree-sitter")
      await Parser.init()
      const parser = new Parser()
      // Load language grammar
      const Lang = await Parser.Language.load("/path/to/tree-sitter-<lang>.wasm")
      parser.setLanguage(Lang)
      this.parser = Promise.resolve(parser)
    } catch {
      this.parser = null
    }
  }

  highlightLine(line: string, language: string): HighlightedLine {
    if (this.parser) {
      // Use tree-sitter AST for precise highlighting
      return this.treeSitterHighlight(line, language)
    }
    return this.fallback.highlightLine(line, language)
  }
}
```

---

## 12. Future Improvements

### Short-term (Next Sprint)

- [ ] **Tree-sitter integration** — AST-based syntax highlighting via `web-tree-sitter`
- [ ] **Tab bar** — Multiple simultaneous file buffers
- [ ] **Undo history visualization** — Show undo/redo stack state
- [ ] **Line numbers in selection** — Visual line range in status bar

### Medium-term

- [ ] **Search/replace** — `:s/foo/bar/g` and `:%s/foo/bar/g` commands
- [ ] **Multiple cursors** — `Ctrl+d` for multi-cursor editing
- [ ] **Code folding** — Collapse functions/classes
- [ ] **Auto-indent** — Smart indentation based on language
- [ ] **Clipboard integration** — System clipboard for yank/paste

### Long-term

- [ ] **Agent integration** — "Follow mode" showing files the agent is editing
- [ ] **Diff view** — See agent-proposed changes before accepting
- [ ] **Git integration** — Blame, diff, commit from within editor
- [ ] **LSP integration** — Diagnostics, autocomplete, go-to-definition
- [ ] **Customizable keybindings** — User-defined VIM key maps
- [ ] **Plugin API** — Editor extensions via plugin system

---

## Appendix A: File Reference

| File                             | Lines     | Purpose                                   |
| -------------------------------- | --------- | ----------------------------------------- |
| `component/editor/buffer.ts`     | 262       | Text buffer, cursor, selection, undo/redo |
| `component/editor/vim-mode.ts`   | 310       | VIM mode state machine                    |
| `component/editor/syntax.ts`     | 435       | Syntax highlighting (15+ languages)       |
| `component/editor/file-tree.tsx` | 150       | File tree browser                         |
| `component/editor/editor.tsx`    | 200       | Main editor component                     |
| `routes/editor.tsx`              | 70        | Editor page                               |
| `context/route.tsx`              | 52 (+3)   | EditorRoute type                          |
| **Total**                        | **~1430** |                                           |

## Appendix B: Testing

Tests are located alongside the components. Run with:

```bash
cd packages/teamcode
bun run typecheck          # Verify types
bun run test               # Run all tests
bun run test test/cli/run/ # Run editor-related tests
```
