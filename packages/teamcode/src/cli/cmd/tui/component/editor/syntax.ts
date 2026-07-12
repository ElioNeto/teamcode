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
  private fallback: SimpleHighlighter

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
    let remaining = line
    let pos = 0
    let endsBlock = false

    // Handle block comments
    if (lang.blockComment && inBlockComment) {
      const [_, end] = lang.blockComment
      const endIdx = remaining.indexOf(end)
      if (endIdx !== -1) {
        tokens.push({ start: pos, end: pos + endIdx + end.length, type: "comment" })
        pos += endIdx + end.length
        remaining = remaining.slice(endIdx + end.length)
      } else {
        // Entire line is still in block comment
        return { tokens: [{ start: 0, end: line.length, type: "comment" }], endsInBlockComment: true }
      }
    }

    // Tokenize the remaining text
    const tokenRegex =
      /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[a-zA-Z_$][\w$]*\b)|(\/[*]|[*]\/)|(\S)|(\s+)/g
    tokenRegex.lastIndex = 0

    let match: RegExpExecArray | null
    while ((match = tokenRegex.exec(line)) !== null) {
      const start = match.index
      const end = start + match[0].length
      const full = match[0]

      // Line comment
      if (match[1]) {
        tokens.push({ start, end, type: "comment" })
        break // rest of the line is comment
      }

      // String
      if (match[2]) {
        tokens.push({ start, end, type: "string" })
        continue
      }

      // Number
      if (match[3]) {
        tokens.push({ start, end, type: "number" })
        continue
      }

      // Word
      if (match[4]) {
        const word = full
        if (lang.keywords.has(word)) {
          // Check if it's a type keyword (starts with uppercase)
          if (/^[A-Z]/.test(word) && !/^(const|let|var|import|export|from|return)$/.test(word)) {
            tokens.push({ start, end, type: "type" })
          } else {
            tokens.push({ start, end, type: "keyword" })
          }
        } else if (/^[A-Z]/.test(word)) {
          tokens.push({ start, end, type: "type" })
        } else {
          tokens.push({ start, end, type: "normal" })
        }
        continue
      }

      // Block comment start/end
      if (match[5]) {
        if (full === "/*" && lang.blockComment) {
          tokens.push({ start, end, type: "comment" })
          // Find closing */
          const rest = line.slice(end)
          const closeIdx = rest.indexOf("*/")
          if (closeIdx !== -1) {
            tokens.push({ start: end, end: end + closeIdx + 2, type: "comment" })
            tokenRegex.lastIndex = end + closeIdx + 2
          } else {
            endsBlock = true
            // Rest of the line is comment
            if (end < line.length) {
              tokens.push({ start: end, end: line.length, type: "comment" })
            }
            break
          }
        } else {
          tokens.push({ start, end, type: "punctuation" })
        }
        continue
      }

      // Other non-whitespace
      if (match[6]) {
        if (/^[{}()\[\];,.:=+\-*/<>&|!~^%]$/.test(full)) {
          tokens.push({ start, end, type: "punctuation" })
        } else {
          tokens.push({ start, end, type: "operator" })
        }
        continue
      }

      // Whitespace — skip
    }

    return { tokens, endsInBlockComment: endsBlock }
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
