import { exec as execCb } from "child_process"
import { promisify } from "util"

const exec = promisify(execCb)

export interface StatusItem {
  file: string
  staged: boolean
  status: "added" | "modified" | "deleted" | "untracked" | "renamed"
}

export interface BranchItem {
  name: string
  current: boolean
}

export interface StashItem {
  index: number
  message: string
}

export interface CommitItem {
  hash: string
  shortHash: string
  subject: string
  author: string
  date: string
  body: string
}

function parseStatusLine(line: string): StatusItem | undefined {
  const xy = line.slice(0, 2)
  const file = line.slice(3)
  if (!file) return

  // Staged status (first character)
  const staged: StatusItem["status"] | undefined =
    xy[0] === "M" ? "modified" :
    xy[0] === "A" ? "added" :
    xy[0] === "D" ? "deleted" :
    xy[0] === "R" ? "renamed" :
    undefined

  // Unstaged / worktree status (second character)
  const unstaged: StatusItem["status"] | undefined =
    xy[1] === "M" ? "modified" :
    xy[1] === "A" ? "added" :
    xy[1] === "D" ? "deleted" :
    xy[1] === "?" ? "untracked" :
    undefined

  const items: StatusItem[] = []
  if (staged) items.push({ file, staged: true, status: staged })
  if (unstaged) items.push({ file, staged: false, status: unstaged })
  return items[0]
}

export async function status(cwd: string): Promise<{ staged: StatusItem[]; unstaged: StatusItem[] }> {
  const { stdout } = await exec("git status --porcelain=v1 --untracked-files=all", { cwd })
  const staged: StatusItem[] = []
  const unstaged: StatusItem[] = []
  for (const line of stdout.split("\n")) {
    const item = parseStatusLine(line.trim())
    if (!item) continue
    if (item.staged) staged.push(item)
    else unstaged.push(item)
  }
  return { staged, unstaged }
}

export async function add(cwd: string, files: string[]): Promise<void> {
  await exec(`git add -- ${files.map((f) => `"${f}"`).join(" ")}`, { cwd })
}

export async function unstage(cwd: string, files: string[]): Promise<void> {
  await exec(`git reset HEAD -- ${files.map((f) => `"${f}"`).join(" ")}`, { cwd })
}

export async function restore(cwd: string, files: string[]): Promise<void> {
  await exec(`git checkout -- ${files.map((f) => `"${f}"`).join(" ")}`, { cwd })
}

export async function commit(cwd: string, message: string): Promise<string | undefined> {
  const { stdout } = await exec(`git commit -m ${JSON.stringify(message)}`, { cwd })
  return stdout.trim() || undefined
}

export async function log(cwd: string, count = 10): Promise<CommitItem[]> {
  const { stdout } = await exec(
    `git log --max-count=${count} --format="%H%n%h%n%s%n%an%n%ad%n%b%n---END---" --date=short`,
    { cwd },
  )
  return stdout.split("---END---\n").filter(Boolean).flatMap((entry) => {
    const lines = entry.trim().split("\n")
    if (lines.length < 5) return []
    return [{
      hash: lines[0] ?? "",
      shortHash: lines[1] ?? "",
      subject: lines[2] ?? "",
      author: lines[3] ?? "",
      date: lines[4] ?? "",
      body: lines.slice(5).join("\n").trim(),
    }]
  })
}

export async function currentBranch(cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await exec("git symbolic-ref --short HEAD", { cwd })
    return stdout.trim() || undefined
  } catch {
    return undefined
  }
}

export async function branches(cwd: string): Promise<BranchItem[]> {
  const { stdout } = await exec("git branch --format='%(refname:short)'", { cwd })
  const current = await currentBranch(cwd)
  return stdout.split("\n").filter(Boolean).map((name) => ({
    name: name.trim(),
    current: name.trim() === current,
  }))
}

export async function branchCreate(cwd: string, name: string): Promise<void> {
  await exec(`git branch ${JSON.stringify(name)}`, { cwd })
}

export async function branchDelete(cwd: string, name: string): Promise<void> {
  await exec(`git branch -D ${JSON.stringify(name)}`, { cwd })
}

export async function branchRename(cwd: string, oldName: string, newName: string): Promise<void> {
  await exec(`git branch -m ${JSON.stringify(oldName)} ${JSON.stringify(newName)}`, { cwd })
}

export async function checkout(cwd: string, branch: string): Promise<void> {
  await exec(`git checkout ${JSON.stringify(branch)}`, { cwd })
}

export async function stashList(cwd: string): Promise<StashItem[]> {
  try {
    const { stdout } = await exec("git stash list --format='%gd%n%s%n---'", { cwd })
    return stdout.split("---\n").filter(Boolean).flatMap((entry) => {
      const [ref, ...msgLines] = entry.trim().split("\n")
      if (!ref) return []
      const match = ref.match(/^stash@{(\d+)/)
      if (!match) return []
      return [{ index: Number(match[1]), message: msgLines.join("\n").trim() }]
    })
  } catch {
    return []
  }
}

export async function stashPop(cwd: string, index?: number): Promise<void> {
  const args = index !== undefined ? `stash@{${index}}` : ""
  await exec(`git stash pop ${args}`, { cwd })
}

export async function stashApply(cwd: string, index?: number): Promise<void> {
  const args = index !== undefined ? `stash@{${index}}` : ""
  await exec(`git stash apply ${args}`, { cwd })
}

export async function stashDrop(cwd: string, index?: number): Promise<void> {
  const args = index !== undefined ? `stash@{${index}}` : ""
  await exec(`git stash drop ${args}`, { cwd })
}

export async function stashPush(cwd: string, message?: string): Promise<void> {
  if (message) {
    await exec(`git stash push -m ${JSON.stringify(message)}`, { cwd })
  } else {
    await exec("git stash push", { cwd })
  }
}

export async function diffFile(cwd: string, file: string): Promise<string> {
  try {
    const { stdout } = await exec(`git diff --no-ext-diff -- ${JSON.stringify(file)}`, { cwd })
    return stdout
  } catch {
    return ""
  }
}

export async function diffStagedFile(cwd: string, file: string): Promise<string> {
  try {
    const { stdout } = await exec(`git diff --staged --no-ext-diff -- ${JSON.stringify(file)}`, { cwd })
    return stdout
  } catch {
    return ""
  }
}

export async function fetch(cwd: string): Promise<void> {
  await exec("git fetch --all --prune", { cwd })
}

export async function push(cwd: string): Promise<void> {
  const branch = await currentBranch(cwd)
  if (branch) {
    await exec(`git push origin ${JSON.stringify(branch)}`, { cwd })
  }
}

export async function pull(cwd: string): Promise<void> {
  await exec("git pull --ff-only", { cwd })
}
