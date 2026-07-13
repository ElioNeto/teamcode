/**
 * Syntax highlighting for the TUI editor using tree-sitter.
 *
 * Falls back to simple extension-based highlighting when tree-sitter
 * is unavailable or unsupported for a given language.
 */

// ---------------------------------------------------------------------------
// Simple keyword-based highlighting (fallback)
// ---------------------------------------------------------------------------

interface LanguageDef {
  /** Keywords for the language */
  keywords: Set<string>
  /** Single-line comment prefix */
  lineComment?: string
  /** Multi-line comment delimiters */
  blockComment?: [string, string]
  /** String delimiters */
  stringDelimiters?: string[]
}

const LANGUAGE_MAP: Record<string, LanguageDef> = {
  ts: {
    keywords: new Set([
      "import",
      "export",
      "from",
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "new",
      "class",
      "interface",
      "type",
      "extends",
      "implements",
      "async",
      "await",
      "yield",
      "throw",
      "try",
      "catch",
      "finally",
      "typeof",
      "instanceof",
      "this",
      "super",
      "null",
      "undefined",
      "true",
      "false",
      "in",
      "of",
      "as",
      "is",
      "satisfies",
      "keyof",
      "readonly",
      "static",
      "public",
      "private",
      "protected",
      "abstract",
      "enum",
      "namespace",
      "module",
      "declare",
      "default",
      "with",
      "get",
      "set",
      "any",
      "void",
      "never",
      "unknown",
      "string",
      "number",
      "boolean",
      "symbol",
      "bigint",
      "object",
      "Array",
      "Promise",
      "Map",
      "Set",
      "Record",
      "Partial",
      "Required",
      "Pick",
      "Omit",
    ]),
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  js: {
    keywords: new Set([
      "import",
      "export",
      "from",
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "new",
      "class",
      "extends",
      "async",
      "await",
      "yield",
      "throw",
      "try",
      "catch",
      "finally",
      "typeof",
      "instanceof",
      "this",
      "super",
      "null",
      "undefined",
      "true",
      "false",
      "in",
      "of",
      "default",
      "static",
      "get",
      "set",
      "delete",
      "void",
    ]),
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  go: {
    keywords: new Set([
      "package",
      "import",
      "func",
      "return",
      "if",
      "else",
      "for",
      "range",
      "switch",
      "case",
      "default",
      "break",
      "continue",
      "go",
      "defer",
      "select",
      "chan",
      "map",
      "struct",
      "interface",
      "type",
      "var",
      "const",
      "nil",
      "true",
      "false",
      "new",
      "make",
      "append",
      "len",
      "cap",
      "error",
      "string",
      "int",
      "int64",
      "float64",
      "bool",
      "byte",
      "rune",
      "uint",
      "uint64",
      "complex128",
      "error",
      "panic",
      "recover",
      "fallthrough",
    ]),
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  py: {
    keywords: new Set([
      "import",
      "from",
      "as",
      "def",
      "class",
      "return",
      "if",
      "elif",
      "else",
      "for",
      "while",
      "break",
      "continue",
      "try",
      "except",
      "finally",
      "raise",
      "with",
      "as",
      "yield",
      "lambda",
      "pass",
      "in",
      "not",
      "and",
      "or",
      "is",
      "None",
      "True",
      "False",
      "async",
      "await",
      "self",
      "super",
      "global",
      "nonlocal",
      "assert",
      "del",
      "print",
    ]),
    lineComment: "#",
    blockComment: ['"""', '"""'],
  },
  rust: {
    keywords: new Set([
      "fn",
      "let",
      "mut",
      "const",
      "static",
      "return",
      "if",
      "else",
      "for",
      "while",
      "loop",
      "match",
      "break",
      "continue",
      "struct",
      "enum",
      "impl",
      "trait",
      "use",
      "mod",
      "pub",
      "crate",
      "self",
      "super",
      "where",
      "as",
      "in",
      "ref",
      "move",
      "async",
      "await",
      "unsafe",
      "dyn",
      "type",
      "union",
      "macro_rules",
      "i32",
      "i64",
      "u32",
      "u64",
      "f32",
      "f64",
      "bool",
      "char",
      "str",
      "String",
      "Vec",
      "Option",
      "Result",
      "Box",
      "Rc",
      "Arc",
      "true",
      "false",
      "Some",
      "None",
      "Ok",
      "Err",
    ]),
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  bash: {
    keywords: new Set([
      "if",
      "then",
      "else",
      "elif",
      "fi",
      "for",
      "while",
      "do",
      "done",
      "case",
      "esac",
      "function",
      "return",
      "exit",
      "export",
      "local",
      "source",
      "echo",
      "cd",
      "ls",
      "cat",
      "rm",
      "mv",
      "cp",
      "mkdir",
      "chmod",
      "sudo",
      "grep",
      "find",
      "sed",
      "awk",
      "cut",
      "sort",
      "uniq",
      "wc",
      "head",
      "tail",
    ]),
    lineComment: "#",
  },
  json: {
    keywords: new Set([]),
    stringDelimiters: ['"'],
  },
  yaml: {
    keywords: new Set([]),
    lineComment: "#",
  },
  md: {
    keywords: new Set([]),
    lineComment: "",
  },
  sql: {
    keywords: new Set([
      "SELECT",
      "FROM",
      "WHERE",
      "INSERT",
      "INTO",
      "VALUES",
      "UPDATE",
      "SET",
      "DELETE",
      "CREATE",
      "TABLE",
      "ALTER",
      "DROP",
      "INDEX",
      "JOIN",
      "LEFT",
      "RIGHT",
      "INNER",
      "OUTER",
      "ON",
      "AND",
      "OR",
      "NOT",
      "IN",
      "IS",
      "NULL",
      "AS",
      "ORDER",
      "BY",
      "GROUP",
      "HAVING",
      "LIMIT",
      "OFFSET",
      "UNION",
      "ALL",
      "DISTINCT",
      "COUNT",
      "SUM",
      "AVG",
      "MIN",
      "MAX",
      "BETWEEN",
      "LIKE",
      "PRIMARY",
      "KEY",
      "FOREIGN",
      "REFERENCES",
      "CASCADE",
    ]),
    lineComment: "--",
    blockComment: ["/*", "*/"],
  },
}

// ---------------------------------------------------------------------------
// Token types (maps to theme syntax highlight colors)
// ---------------------------------------------------------------------------

export type SyntaxTokenType =
  | "normal"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "type"
  | "function"
  | "operator"
  | "builtin"
  | "punctuation"
  | "tag"
  | "attribute"

export interface SyntaxToken {
  start: number
  end: number
  type: SyntaxTokenType
}

export interface HighlightedLine {
  /** The line text */
  text: string
  /** Tokens with syntax types for coloring */
  tokens: SyntaxToken[]
  /** True if the line is part of a block comment (open) */
  inBlockComment?: boolean
}

// ---------------------------------------------------------------------------
// SyntaxHighlighter
// ---------------------------------------------------------------------------

export class SyntaxHighlighter {
  private readonly fallback: SimpleHighlighter

  constructor() {
    this.fallback = new SimpleHighlighter()
  }

  /** Detect language from file extension. */
  static detectLanguage(filePath: string): string {
    const dot = filePath.lastIndexOf(".")
    if (dot === -1) return "txt"
    const ext = filePath.slice(dot + 1).toLowerCase()
    const extMap: Record<string, string> = {
      ts: "ts",
      tsx: "ts",
      js: "js",
      jsx: "js",
      mjs: "js",
      cjs: "js",
      go: "go",
      py: "py",
      rs: "rust",
      rb: "ruby",
      sh: "bash",
      bash: "bash",
      zsh: "bash",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      md: "md",
      markdown: "md",
      sql: "sql",
      css: "css",
      html: "html",
      xml: "xml",
      toml: "toml",
      ini: "ini",
      cfg: "ini",
      c: "c",
      h: "c",
      cpp: "cpp",
      hpp: "cpp",
      cc: "cpp",
      java: "java",
      kt: "kotlin",
      scala: "scala",
      swift: "swift",
      dart: "dart",
      lua: "lua",
      r: "r",
    }
    return extMap[ext] ?? "txt"
  }

  /** Highlight a line of text, returning token info. */
  highlightLine(line: string, language: string, inBlockComment?: boolean): HighlightedResult {
    return this.fallback.highlightLine(line, language, inBlockComment)
  }

  /** Highlight all lines of a buffer. */
  highlightAll(lines: string[], language: string): HighlightedLine[] {
    return this.fallback.highlightAll(lines, language)
  }
}

// ---------------------------------------------------------------------------
// Fallback simple highlighter (keyword-based + regex)
// ---------------------------------------------------------------------------

interface HighlightedResult {
  tokens: SyntaxToken[]
  endsInBlockComment: boolean
}

class SimpleHighlighter {
  highlightLine(line: string, language: string, inBlockComment?: boolean): HighlightedResult {
    const lang = LANGUAGE_MAP[language]
    if (!lang) return { tokens: [], endsInBlockComment: false }

    const tokens: SyntaxToken[] = []

    // Handle block comment continuation from previous line
    if (inBlockComment) {
      if (this.handleOpenBlockComment(line, lang, tokens)) {
        return { tokens, endsInBlockComment: true }
      }
    }

    const endsBlock = this.scanLineTokens(line, lang, tokens)
    return { tokens, endsInBlockComment: endsBlock }
  }

  /** Handles a line that continues from a block comment on the previous line.
   *  Returns true if the entire line is still inside the block comment. */
  private handleOpenBlockComment(line: string, lang: LanguageDef, tokens: SyntaxToken[]): boolean {
    const end = lang.blockComment![1]
    const endIdx = line.indexOf(end)
    if (endIdx !== -1) {
      tokens.push({ start: 0, end: endIdx + end.length, type: "comment" })
      return false
    }
    tokens.push({ start: 0, end: line.length, type: "comment" })
    return true
  }

  /** Scans a line character-by-character and classifies tokens.
   *  Returns true if the line ends inside an unclosed block comment. */
  private scanLineTokens(line: string, lang: LanguageDef, tokens: SyntaxToken[]): boolean {
    let i = 0

    while (i < line.length) {
      const ch = line[i]
      const next = i + 1 < line.length ? line[i + 1] : ""

      // Line comment
      if (ch === "/" && next === "/") {
        tokens.push({ start: i, end: line.length, type: "comment" })
        break
      }

      // Block comment start
      if (ch === "/" && next === "*" && lang.blockComment) {
        const closed = this.handleBlockCommentStart(line, i, tokens)
        if (closed === -1) return true // unclosed — line ends in block comment
        i = closed
        continue
      }

      // Block comment end (orphan)
      if (ch === "*" && next === "/") {
        tokens.push({ start: i, end: i + 2, type: "comment" })
        i += 2
        continue
      }

      // String literal
      if (ch === '"' || ch === "'" || ch === "`") {
        const end = this.scanString(line, i)
        tokens.push({ start: i, end, type: "string" })
        i = end
        continue
      }

      // Number
      if (/^\d$/.test(ch)) {
        const end = this.scanNumber(line, i)
        tokens.push({ start: i, end, type: "number" })
        i = end
        continue
      }

      // Word (identifier)
      if (/^[a-zA-Z_$]$/.test(ch)) {
        const end = this.scanWord(line, i, lang, tokens)
        i = end
        continue
      }

      // Whitespace — skip
      if (/^\s$/.test(ch)) {
        i++
        continue
      }

      // Other non-whitespace (punctuation or operator)
      if ("[]{}();,.:=+*-/<>&|!~^%".includes(ch)) {
        tokens.push({ start: i, end: i + 1, type: "punctuation" })
      } else {
        tokens.push({ start: i, end: i + 1, type: "operator" })
      }
      i++
    }

    return false
  }

  /** Handle block comment start marker.
   *  Returns the position after the closing marker if found, or -1 if unclosed. */
  private handleBlockCommentStart(line: string, pos: number, tokens: SyntaxToken[]): number {
    tokens.push({ start: pos, end: pos + 2, type: "comment" })
    const closeIdx = line.indexOf("*/", pos + 2)
    if (closeIdx !== -1) {
      tokens.push({ start: pos + 2, end: closeIdx + 2, type: "comment" })
      return closeIdx + 2
    }
    if (pos + 2 < line.length) {
      tokens.push({ start: pos + 2, end: line.length, type: "comment" })
    }
    return -1
  }

  /** Consume a string literal starting at pos and return the end position. */
  private scanString(line: string, pos: number): number {
    const quote = line[pos]
    let j = pos + 1
    while (j < line.length && line[j] !== quote) {
      if (line[j] === "\\") j++ // skip escaped character
      j++
    }
    if (j < line.length) j++ // include closing quote
    return j
  }

  /** Consume a number starting at pos and return the end position. */
  private scanNumber(line: string, pos: number): number {
    let j = pos + 1
    while (j < line.length && /^[\d.]$/.test(line[j])) j++
    // Handle scientific notation
    if (j + 1 < line.length && /^[eE][+-]?\d/.test(line.slice(j))) {
      j += 2
      while (j < line.length && /^\d$/.test(line[j])) j++
    }
    return j
  }

  /** Consume a word/identifier starting at pos and classify its token type. */
  private scanWord(line: string, pos: number, lang: LanguageDef, tokens: SyntaxToken[]): number {
    let j = pos + 1
    while (j < line.length && /^[\w$]$/.test(line[j])) j++
    const word = line.slice(pos, j)
    const tokenType = this.classifyWord(word, lang)
    tokens.push({ start: pos, end: j, type: tokenType })
    return j
  }

  /** Classify a word as keyword, type, or normal. */
  private classifyWord(word: string, lang: LanguageDef): SyntaxTokenType {
    if (lang.keywords.has(word)) {
      if (/^[A-Z]/.test(word) && !/^(const|let|var|import|export|from|return)$/.test(word)) {
        return "type"
      }
      return "keyword"
    }
    if (/^[A-Z]/.test(word)) return "type"
    return "normal"
  }

  highlightAll(lines: string[], language: string): HighlightedLine[] {
    const result: HighlightedLine[] = []
    let inBlockComment = false

    for (const line of lines) {
      const { tokens, endsInBlockComment } = this.highlightLine(line, language, inBlockComment)
      result.push({ text: line, tokens, inBlockComment })
      inBlockComment = endsInBlockComment
    }

    return result
  }
}
