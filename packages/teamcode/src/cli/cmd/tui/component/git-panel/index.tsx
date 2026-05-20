import { createSignal, createMemo, createEffect, For, Show, batch } from "solid-js"
import { useTheme } from "@tui/context/theme"
import { useToast } from "@tui/ui/toast"
import { useDialog } from "@tui/ui/dialog"
import { useTuiConfig } from "@tui/context/tui-config"
import { useBindings } from "@tui/keymap"
import { getScrollAcceleration } from "@tui/util/scroll"
import { DialogConfirm } from "@tui/ui/dialog-confirm"
import { CommitDialog } from "./commit-dialog"
import * as Git from "@tui/util/git"
import type { StatusItem, BranchItem, StashItem, CommitItem } from "@tui/util/git"

type Section = "changes" | "branches" | "stashes" | "commits"
type PanelMode = "sections" | "diff" | "commit"

export function GitPanel(props: {
  width: number
  directory: string
  onSelectDiff: (diff: string, filename: string) => void
}) {
  const { theme } = useTheme()
  const toast = useToast()
  const dialog = useDialog()
  const tuiConfig = useTuiConfig()
  const scrollAcceleration = createMemo(() => getScrollAcceleration(tuiConfig))

  // Panel state
  const [mode, setMode] = createSignal<PanelMode>("sections")
  const [activeSection, setActiveSection] = createSignal<Section>("changes")
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  const [collapsedSections, setCollapsedSections] = createSignal<Set<string>>(new Set())

  // Git data state
  const [stagedFiles, setStagedFiles] = createSignal<StatusItem[]>([])
  const [unstagedFiles, setUnstagedFiles] = createSignal<StatusItem[]>([])
  const [branches, setBranches] = createSignal<BranchItem[]>([])
  const [currentBranch, setCurrentBranch] = createSignal<string | undefined>()
  const [stashes, setStashes] = createSignal<StashItem[]>([])
  const [commits, setCommits] = createSignal<CommitItem[]>([])
  const [loading, setLoading] = createSignal(false)
  const [selectedCommit, setSelectedCommit] = createSignal<CommitItem | undefined>()

  // Commit message state
  const [commitMessage, setCommitMessage] = createSignal("")
  const [showCommitEditor, setShowCommitEditor] = createSignal(false)

  // Refresh counter to trigger data reload
  const [refreshKey, setRefreshKey] = createSignal(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  // Load git data
  createEffect(async () => {
    const cwd = props.directory
    if (!cwd) return

    void refreshKey() // track refresh signal
    setLoading(true)
    try {
      const [statusData, branchName, branchList, stashData, commitLog] = await Promise.all([
        Git.status(cwd),
        Git.currentBranch(cwd),
        Git.branches(cwd),
        Git.stashList(cwd),
        Git.log(cwd, 10),
      ])
      batch(() => {
        setStagedFiles(statusData.staged)
        setUnstagedFiles(statusData.unstaged)
        setCurrentBranch(branchName)
        setBranches(branchList)
        setStashes(stashData)
        setCommits(commitLog)
      })
    } catch (err) {
      toast.show({ message: `Git error: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    } finally {
      setLoading(false)
    }
  })

  // Get visible items for current section
  const visibleItems = createMemo(() => {
    const section = activeSection()
    const idx = selectedIndex()

    const staged = stagedFiles()
    const unstaged = unstagedFiles()
    const bList = branches()

    // Build flat item list with section headers and items
    interface FlatItem {
      type: "header" | "item"
      section: Section
      label?: string
      count?: number
      item?: StatusItem | BranchItem | StashItem | CommitItem
      index?: number
    }

    const items: FlatItem[] = []

    // Changes section
    const changesCollapsed = collapsedSections().has("changes")
    items.push({ type: "header", section: "changes", label: "Changes", count: staged.length + unstaged.length })
    if (!changesCollapsed) {
      if (staged.length > 0) {
        items.push({ type: "item", section: "changes", label: "Staged", item: undefined })
        for (const s of staged) {
          items.push({ type: "item", section: "changes", item: s, index: items.length })
        }
      }
      if (unstaged.length > 0) {
        items.push({ type: "item", section: "changes", label: "Unstaged", item: undefined })
        for (const s of unstaged) {
          items.push({ type: "item", section: "changes", item: s, index: items.length })
        }
      }
    }

    // Branches section
    const branchesCollapsed = collapsedSections().has("branches")
    items.push({ type: "header", section: "branches", label: "Branches", count: bList.length })
    if (!branchesCollapsed) {
      for (const b of bList) {
        items.push({ type: "item", section: "branches", item: b, index: items.length })
      }
    }

    // Stashes section
    const sList = stashes()
    const stashesCollapsed = collapsedSections().has("stashes")
    items.push({ type: "header", section: "stashes", label: "Stashes", count: sList.length })
    if (!stashesCollapsed) {
      for (const s of sList) {
        items.push({ type: "item", section: "stashes", item: s, index: items.length })
      }
    }

    // Commits section
    const cList = commits()
    const commitsCollapsed = collapsedSections().has("commits")
    items.push({ type: "header", section: "commits", label: "Recent Commits", count: cList.length })
    if (!commitsCollapsed) {
      for (const c of cList) {
        items.push({ type: "item", section: "commits", item: c, index: items.length })
      }
    }

    return items
  })

  // Get the selected item
  const selectedFlatItem = createMemo(() => {
    const items = visibleItems()
    const idx = selectedIndex()
    return items[idx]
  })

  // Navigation
  const navigateUp = () => {
    const items = visibleItems()
    const idx = selectedIndex()
    if (idx > 0) setSelectedIndex(idx - 1)
  }

  const navigateDown = () => {
    const items = visibleItems()
    const idx = selectedIndex()
    if (idx < items.length - 1) setSelectedIndex(idx + 1)
  }

  const cycleSection = (direction: 1 | -1) => {
    const sections: Section[] = ["changes", "branches", "stashes", "commits"]
    const current = activeSection()
    const pos = sections.indexOf(current)
    const next = (pos + direction + sections.length) % sections.length
    setActiveSection(sections[next])
    setSelectedIndex(0)
  }

  const toggleCollapse = () => {
    const section = activeSection()
    const collapsed = collapsedSections()
    const next = new Set(collapsed)
    if (next.has(section)) next.delete(section)
    else next.add(section)
    setCollapsedSections(next)
    setSelectedIndex(0)
  }

  // Actions
  const stageFile = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "changes") return
    const statusItem = item.item as StatusItem
    if (statusItem.staged) return
    try {
      await Git.add(props.directory, [statusItem.file])
      refresh()
      toast.show({ message: `Staged ${statusItem.file}`, variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to stage: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const stageAll = async () => {
    const unstaged = unstagedFiles().filter((f) => f.status !== "untracked")
    const untracked = unstagedFiles().filter((f) => f.status === "untracked")
    try {
      if (unstaged.length > 0) {
        await Git.add(props.directory, unstaged.map((f) => f.file))
      }
      if (untracked.length > 0) {
        await Git.add(props.directory, untracked.map((f) => f.file))
      }
      refresh()
      toast.show({ message: "Staged all files", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to stage all: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const unstageFile = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "changes") return
    const statusItem = item.item as StatusItem
    if (!statusItem.staged) return
    try {
      await Git.unstage(props.directory, [statusItem.file])
      refresh()
      toast.show({ message: `Unstaged ${statusItem.file}`, variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to unstage: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const unstageAll = async () => {
    try {
      await Git.unstage(props.directory, stagedFiles().map((f) => f.file))
      refresh()
      toast.show({ message: "Unstaged all files", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to unstage all: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const discardFile = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "changes") return
    const statusItem = item.item as StatusItem
    if (statusItem.status === "untracked") return
    const confirmed = await DialogConfirm.show(
      dialog,
      "Discard changes",
      `Discard changes in ${statusItem.file}?`,
    )
    if (confirmed !== true) return
    try {
      await Git.restore(props.directory, [statusItem.file])
      refresh()
      toast.show({ message: `Discarded changes in ${statusItem.file}`, variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to discard: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const openDiff = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "changes") return
    const statusItem = item.item as StatusItem
    try {
      const diff = statusItem.staged
        ? await Git.diffStagedFile(props.directory, statusItem.file)
        : await Git.diffFile(props.directory, statusItem.file)
      props.onSelectDiff(diff, statusItem.file)
    } catch (err) {
      toast.show({ message: `Failed to load diff: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const handleEnter = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item) return

    if (item.section === "changes") {
      await openDiff()
    } else if (item.section === "branches") {
      const branchItem = item.item as BranchItem
      if (branchItem.current) return
      const confirmed = await DialogConfirm.show(
        dialog,
        "Checkout branch",
        `Switch to branch ${branchItem.name}?`,
      )
      if (confirmed !== true) return
      try {
        await Git.checkout(props.directory, branchItem.name)
        refresh()
        toast.show({ message: `Switched to ${branchItem.name}`, variant: "success" })
      } catch (err) {
        toast.show({ message: `Failed to checkout: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
      }
    } else if (item.section === "stashes") {
      const stashItem = item.item as StashItem
      const confirmed = await DialogConfirm.show(
        dialog,
        "Pop stash",
        `Apply and drop "${stashItem.message}"?`,
      )
      if (confirmed !== true) return
      try {
        await Git.stashPop(props.directory, stashItem.index)
        refresh()
        toast.show({ message: "Stash applied and dropped", variant: "success" })
      } catch (err) {
        toast.show({ message: `Failed to pop stash: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
      }
    } else if (item.section === "commits") {
      const commitItem = item.item as CommitItem
      setSelectedCommit(commitItem)
      props.onSelectDiff(
        `commit ${commitItem.shortHash}\nAuthor: ${commitItem.author}\nDate: ${commitItem.date}\n\n${commitItem.subject}\n\n${commitItem.body}`,
        `commit-${commitItem.shortHash}`,
      )
    }
  }

  const handleSectionHeader = () => {
    toggleCollapse()
  }

  // Action handlers for buttons
  const createBranch = async () => {
    const name = prompt("Branch name:")
    if (!name) return
    try {
      await Git.branchCreate(props.directory, name)
      refresh()
      toast.show({ message: `Created branch ${name}`, variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to create branch: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const deleteBranch = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "branches") return
    const branchItem = item.item as BranchItem
    if (branchItem.current) {
      toast.show({ message: "Cannot delete current branch", variant: "warning" })
      return
    }
    const confirmed = await DialogConfirm.show(
      dialog,
      "Delete branch",
      `Delete branch "${branchItem.name}"?`,
    )
    if (confirmed !== true) return
    try {
      await Git.branchDelete(props.directory, branchItem.name)
      refresh()
      toast.show({ message: `Deleted branch ${branchItem.name}`, variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to delete branch: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const renameBranch = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "branches") return
    const branchItem = item.item as BranchItem
    const newName = prompt(`Rename "${branchItem.name}" to:`)
    if (!newName) return
    try {
      await Git.branchRename(props.directory, branchItem.name, newName)
      refresh()
      toast.show({ message: `Renamed branch to ${newName}`, variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to rename branch: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const newStash = async () => {
    const message = prompt("Stash message (optional):")
    try {
      await Git.stashPush(props.directory, message || undefined)
      refresh()
      toast.show({ message: "Changes stashed", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to stash: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const dropStash = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "stashes") return
    const stashItem = item.item as StashItem
    const confirmed = await DialogConfirm.show(
      dialog,
      "Drop stash",
      `Drop "${stashItem.message}"?`,
    )
    if (confirmed !== true) return
    try {
      await Git.stashDrop(props.directory, stashItem.index)
      refresh()
      toast.show({ message: "Stash dropped", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to drop stash: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const applyStash = async () => {
    const item = selectedFlatItem()
    if (!item || item.type !== "item" || !item.item || item.section !== "stashes") return
    const stashItem = item.item as StashItem
    try {
      await Git.stashApply(props.directory, stashItem.index)
      refresh()
      toast.show({ message: "Stash applied", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to apply stash: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const fetchRemote = async () => {
    try {
      await Git.fetch(props.directory)
      refresh()
      toast.show({ message: "Fetched from remote", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to fetch: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  const pushBranch = async () => {
    try {
      await Git.push(props.directory)
      refresh()
      toast.show({ message: "Pushed to remote", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to push: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  // Commit action
  const commitChanges = async (message: string) => {
    try {
      await Git.commit(props.directory, message)
      refresh()
      toast.show({ message: "Committed changes", variant: "success" })
    } catch (err) {
      toast.show({ message: `Failed to commit: ${err instanceof Error ? err.message : String(err)}`, variant: "error" })
    }
  }

  // Render status icon for a status item
  const statusIcon = (item: StatusItem) => {
    if (item.status === "added") return <span style={{ fg: theme.success }}>+ </span>
    if (item.status === "modified") return <span style={{ fg: item.staged ? theme.success : theme.warning }}>M </span>
    if (item.status === "deleted") return <span style={{ fg: theme.error }}>D </span>
    if (item.status === "untracked") return <span style={{ fg: theme.textMuted }}>? </span>
    return <span>  </span>
  }

  // Git panel keyboard navigation
  useBindings(() => ({
    enabled: dialog.stack.length === 0,
    bindings: [
      {
        key: "up",
        desc: "Navigate up",
        group: "Git",
        cmd: () => navigateUp(),
      },
      {
        key: "down",
        desc: "Navigate down",
        group: "Git",
        cmd: () => navigateDown(),
      },
      {
        key: "[",
        desc: "Previous section",
        group: "Git",
        cmd: () => cycleSection(-1),
      },
      {
        key: "]",
        desc: "Next section",
        group: "Git",
        cmd: () => cycleSection(1),
      },
      {
        key: "s",
        desc: "Stage selected file",
        group: "Git",
        cmd: () => void stageFile(),
      },
      {
        key: "S",
        desc: "Stage all files",
        group: "Git",
        cmd: () => void stageAll(),
      },
      {
        key: "u",
        desc: "Unstage selected file",
        group: "Git",
        cmd: () => void unstageFile(),
      },
      {
        key: "U",
        desc: "Unstage all files",
        group: "Git",
        cmd: () => void unstageAll(),
      },
      {
        key: "d",
        desc: "Discard selected file changes",
        group: "Git",
        cmd: () => void discardFile(),
      },
      {
        key: "c",
        desc: "Open commit dialog",
        group: "Git",
        cmd: () => setMode("commit"),
      },
      {
        key: "p",
        desc: "Push to remote",
        group: "Git",
        cmd: () => void pushBranch(),
      },
      {
        key: "f",
        desc: "Fetch from remote",
        group: "Git",
        cmd: () => void fetchRemote(),
      },
      {
        key: "return",
        desc: "Open selected item",
        group: "Git",
        cmd: () => void handleEnter(),
      },
      {
        key: "n",
        desc: "Create new branch",
        group: "Git",
        cmd: () => void createBranch(),
      },
      {
        key: "D",
        desc: "Delete selected item",
        group: "Git",
        cmd: () => {
          const section = activeSection()
          if (section === "branches") void deleteBranch()
          else if (section === "stashes") void dropStash()
        },
      },
      {
        key: "r",
        desc: "Rename branch",
        group: "Git",
        cmd: () => void renameBranch(),
      },
      {
        key: "a",
        desc: "Apply stash",
        group: "Git",
        cmd: () => void applyStash(),
      },
      {
        key: "z",
        desc: "Create stash",
        group: "Git",
        cmd: () => void newStash(),
      },
    ],
  }))

  // Render the panel content
  return (
    <box
      width={props.width}
      height="100%"
      backgroundColor={theme.backgroundPanel}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={1}
      paddingRight={1}
    >
      <Show when={mode() === "commit"}>
        <CommitDialog
          directory={props.directory}
          stagedCount={stagedFiles().length}
          onCommit={(message) => { commitChanges(message); setMode("sections") }}
          onCancel={() => setMode("sections")}
        />
      </Show>
      <Show when={mode() !== "commit"}>
        {/* Header */}
        <box flexShrink={0} paddingBottom={1} paddingLeft={1}>
          <text fg={theme.text}>
            <b>GIT</b>
          </text>
          <Show when={currentBranch()}>
            <text fg={theme.accent}> {currentBranch()}</text>
          </Show>
        </box>

        {/* Section list */}
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
          <For each={visibleItems()}>
            {(item, index) => {
              const isSelected = index() === selectedIndex()
              const bg = isSelected ? theme.primary : undefined
              const fg = isSelected ? theme.selectedListItemText : theme.text

              if (item.type === "header") {
                const collapsed = collapsedSections().has(item.section)
                return (
                  <box
                    paddingLeft={1}
                    paddingRight={1}
                    gap={1}
                    backgroundColor={bg}
                  >
                    <text fg={fg}>
                      {collapsed ? "▸" : "▾"} <b>{item.label}</b>
                      <Show when={item.count !== undefined}>
                        <span style={{ fg: isSelected ? fg : theme.textMuted }}> ({item.count})</span>
                      </Show>
                    </text>
                  </box>
                )
              }

              // Sub-header labels
              if (item.label && !item.item) {
                return (
                  <box paddingLeft={2} paddingRight={1} backgroundColor={bg}>
                    <text fg={isSelected ? fg : theme.textMuted}>{item.label}</text>
                  </box>
                )
              }

              // Items
              if (item.item) {
                const section = item.section

                if (section === "changes") {
                  const si = item.item as StatusItem
                  return (
                    <box paddingLeft={3} paddingRight={1} backgroundColor={bg}>
                      <text fg={isSelected ? fg : si.status === "untracked" ? theme.textMuted : theme.text}>
                        {statusIcon(si)}
                        {si.file}
                      </text>
                    </box>
                  )
                }

                if (section === "branches") {
                  const bi = item.item as BranchItem
                  return (
                    <box paddingLeft={2} paddingRight={1} backgroundColor={bg}>
                      <text fg={isSelected ? fg : bi.current ? theme.success : theme.text}>
                        {bi.current ? "* " : "  "}
                        {bi.name}
                      </text>
                    </box>
                  )
                }

                if (section === "stashes") {
                  const si = item.item as StashItem
                  return (
                    <box paddingLeft={2} paddingRight={1} backgroundColor={bg}>
                      <text fg={isSelected ? fg : theme.text}>
                        <span style={{ fg: theme.textMuted }}>stash@{si.index}: </span>
                        {si.message}
                      </text>
                    </box>
                  )
                }

                if (section === "commits") {
                  const ci = item.item as CommitItem
                  return (
                    <box paddingLeft={2} paddingRight={1} backgroundColor={bg}>
                      <text fg={isSelected ? fg : theme.text}>
                        <span style={{ fg: theme.accent }}>{ci.shortHash}</span>
                        <span style={{ fg: theme.textMuted }}> </span>
                        {ci.subject}
                      </text>
                    </box>
                  )
                }
              }

              return null
            }}
          </For>
        </scrollbox>

        {/* Footer with keybind hints */}
        <box flexShrink={0} paddingTop={1} paddingLeft={1}>
          <text fg={theme.textMuted}>
            <Show when={activeSection() === "changes"}>
              [s]tage [u]nstage [d]iscard [Enter]diff
            </Show>
            <Show when={activeSection() === "branches"}>
              [Enter]checkout [n]ew [D]elete [r]ename
            </Show>
            <Show when={activeSection() === "stashes"}>
              [Enter]pop [a]pply [z] stash [D]rop
            </Show>
            <Show when={activeSection() === "commits"}>
              [Enter]details
            </Show>
          </text>
        </box>
      </Show>
    </box>
  )
}
