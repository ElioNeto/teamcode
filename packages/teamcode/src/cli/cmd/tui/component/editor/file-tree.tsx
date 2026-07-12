/**
 * FileTree component — navigable file browser for the TUI editor.
 */

import { createSignal, createMemo, For, Show, onMount } from "solid-js"
import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useProject } from "@tui/context/project"

interface FileEntry {
  name: string
  path: string
  isDir: boolean
  children?: FileEntry[]
  expanded?: boolean
}

interface FileTreeProps {
  selectedPath?: string
  onSelectFile: (path: string) => void
  rootDir?: string
}

function sortEntries(entries: FileEntry[]): FileEntry[] {
  return [...entries].sort((a, b) => {
    if (a.isDir && !b.isDir) return -1
    if (!a.isDir && b.isDir) return 1
    return a.name.localeCompare(b.name)
  })
}

function flattenTree(entries: FileEntry[], depth = 0): { entry: FileEntry; depth: number }[] {
  const result: { entry: FileEntry; depth: number }[] = []
  for (const entry of sortEntries(entries)) {
    result.push({ entry, depth })
    if (entry.isDir && entry.expanded && entry.children) {
      result.push(...flattenTree(entry.children, depth + 1))
    }
  }
  return result
}

export function FileTree(props: FileTreeProps) {
  const { theme } = useTheme()
  const project = useProject()

  const [entries, setEntries] = createSignal<FileEntry[]>([])
  const [cursor, setCursor] = createSignal(0)
  const [filter, setFilter] = createSignal("")
  const [loading, setLoading] = createSignal(true)

  onMount(async () => {
    try {
      const dir = props.rootDir ?? project.instance.path().directory ?? ""
      const res = await fetch(`file://${dir}?list=1`)
      const text = await res.text()
      const files = text.split("\n").filter(Boolean)
      setEntries(buildTree(dir, files))
    } catch {
      /* ignore */
    }
    setLoading(false)
  })

  const flat = createMemo(() => flattenTree(entries()))
  const filtered = createMemo(() => {
    const q = filter().toLowerCase()
    if (!q) return flat()
    return flat().filter(({ entry }) => entry.name.toLowerCase().includes(q))
  })
  const selected = createMemo(() => filtered()[cursor()])

  return (
    <box width={30}>
      <text fg={theme.accent} attributes={TextAttributes.BOLD}>
        {" "}
        Files{" "}
      </text>
      <Show when={filter()}>
        <text fg={theme.textMuted}>{"> " + filter()}</text>
      </Show>
      <Show when={!loading()} fallback={<text fg={theme.textMuted}>Loading...</text>}>
        <For each={filtered()}>
          {(item, idx) => (
            <box height={1}>
              <text
                fg={idx() === cursor() ? theme.accent : item.entry.isDir ? "#ffaa00" : theme.text}
                attributes={item.entry.isDir ? TextAttributes.BOLD : undefined}
              >
                {"  ".repeat(item.depth)}
                {item.entry.isDir ? (item.entry.expanded ? "▼ " : "▶ ") : "  "}
                {item.entry.name}
              </text>
            </box>
          )}
        </For>
      </Show>
    </box>
  )
}

function buildTree(rootDir: string, files: string[]): FileEntry[] {
  const tree: FileEntry[] = []
  for (const file of files) {
    const relative = file.startsWith(rootDir) ? file.slice(rootDir.length).replace(/^\//, "") : file
    const parts = relative.split("/")
    let current = tree
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const existing = current.find((e) => e.name === part && e.isDir !== isLast)
      if (existing && existing.isDir) {
        current = existing.children!
      } else if (!isLast) {
        const dir: FileEntry = {
          name: part,
          path: rootDir + "/" + parts.slice(0, i + 1).join("/"),
          isDir: true,
          children: [],
          expanded: false,
        }
        current.push(dir)
        current = dir.children!
      } else {
        current.push({ name: part, path: rootDir + "/" + parts.join("/"), isDir: false })
      }
    }
  }
  for (const entry of tree) sortEntries(entry.children || [])
  return tree
}
