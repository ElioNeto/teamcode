// Issue Service — CRUD for issues stored as markdown in `.opencode/data/`.
//
// Each issue is persisted as a markdown entry inside a priority/category
// file. The directory layout mirrors GitHub-style issue organization:
//
//   .opencode/data/
//     summary.md
//     duplicates.md
//     01-critical/bugs.md
//     02-high/bugs.md
//     03-medium/bugs.md
//     03-medium/features.md
//     04-low/debt.md
//     04-low/docs.md
//     04-low/questions.md
//     04-low/uncategorized.md
import path from "path"
import { Effect, Context, Layer, Schema } from "effect"
import { AppFileSystem } from "@teamcode-ai/core/filesystem"
import { InstanceState } from "@/effect/instance-state"
import { Bus } from "@/bus"
import { Event } from "./events"
import {
  IssueID,
  ISSUE_FILE_INDEX,
  type Issue as IssueType,
  type IssuePriority as IssuePriorityType,
  type IssueCategory as IssueCategoryType,
  type IssueStatus as IssueStatusType,
  type IssueFilter,
} from "./types"
import * as Log from "@teamcode-ai/core/util/log"

const log = Log.create({ service: "swarm.issue" })

// ---------------------------------------------------------------------------
// Config: path to the data directory relative to the worktree
// ---------------------------------------------------------------------------

const DATA_DIR = ".opencode/data"

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface Interface {
  /** List all issues, optionally filtered. */
  readonly list: (filter?: IssueFilter) => Effect.Effect<readonly IssueType[]>
  /** Get a single issue by numeric ID. */
  readonly get: (id: IssueID) => Effect.Effect<IssueType, IssueNotFoundError>
  /** Create a new issue in the appropriate file. */
  readonly create: (input: CreateIssueInput) => Effect.Effect<IssueType>
  /** Update an existing issue's fields. */
  readonly update: (id: IssueID, input: UpdateIssueInput) => Effect.Effect<IssueType, IssueNotFoundError>
  /** Remove an issue by ID. */
  readonly remove: (id: IssueID) => Effect.Effect<void, IssueNotFoundError>
  /** Read the summary markdown file content. */
  readonly readSummary: () => Effect.Effect<string | undefined>
  /** Read the duplicates markdown file content. */
  readonly readDuplicates: () => Effect.Effect<string | undefined>
  /** Get all available priority/category file paths. */
  readonly files: () => Effect.Effect<readonly string[]>
}

export class Service extends Context.Service<Service, Interface>()("@opencode/SwarmIssue") {}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class IssueNotFoundError extends Schema.TaggedErrorClass<IssueNotFoundError>()(
  "IssueNotFoundError",
  { id: IssueID },
) {
  override get message() {
    return `Issue #${this.id} not found`
  }
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface CreateIssueInput {
  title: string
  description: string
  priority: IssuePriorityType
  category: IssueCategoryType
  status?: IssueStatusType
  author?: { login: string; url?: string }
  url?: string
  labels?: string[]
}

export interface UpdateIssueInput {
  title?: string
  description?: string
  priority?: IssuePriorityType
  category?: IssueCategoryType
  status?: IssueStatusType
  labels?: string[]
}

// ---------------------------------------------------------------------------
// State: cached per-directory
// ---------------------------------------------------------------------------

type State = {
  /** Root path of `.opencode/data/` for the current instance. */
  readonly dataDir: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveFile(dataDir: string, priority: IssuePriorityType, category: IssueCategoryType): string {
  const entry = ISSUE_FILE_INDEX.find((e) => e.priority === priority && e.category === category)
  if (!entry) {
    return path.join(dataDir, priority, `${category}.md`)
  }
  return path.join(dataDir, entry.relativePath)
}

// ---------------------------------------------------------------------------
// Markdown parsing
// ---------------------------------------------------------------------------

/**
 * Parse all issues from a single markdown file.
 *
 * Format:
 * ```md
 * ## #<id> — <title>
 *
 * 📅 `<date>` | ✏️ **<author>** | 💬 <count> | 🔗 <url>
 *
 * ### Description
 * ...
 * ### Section
 * ...
 * ```
 */
function parseIssuesFromMarkdown(
  content: string,
  defaultPriority: IssuePriorityType,
  defaultCategory: IssueCategoryType,
): IssueType[] {
  const blocks = content.split(/(?=^## #)/m).filter(Boolean)
  const issues: IssueType[] = []

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    const titleMatch = trimmed.match(/^## #(\d+)\s*[—–-]\s*(.+)$/m)
    if (!titleMatch) continue

    const id = titleMatch[1]!
    const title = titleMatch[2]!.trim()

    const metaMatch = trimmed.match(
      /📅\s*`([^`]*)`\s*\|\s*✏️\s*\*\*([^*]+)\*\*\s*\|\s*💬\s*(\d+)\s*\|\s*🔗\s*(\S+)/,
    )

    let author: IssueType["author"] = { login: "unknown" }
    let createdAt = ""
    let commentCount: number | undefined
    let url: string | undefined

    if (metaMatch) {
      createdAt = metaMatch[1]!
      author = { login: metaMatch[2]!.trim() }
      commentCount = Number.parseInt(metaMatch[3]!, 10)
      url = metaMatch[4]!
    }

    const descMatch = trimmed.match(/### Description\n+(.+?)(?=\n### |\n## #|\n*$)/s)
    const description = descMatch
      ? descMatch[1]!.trim()
      : trimmed.replace(/^## #\d+\s*[—–-]\s*.+(\n.*)*/s, "").trim()

    const sections: Record<string, string> = {}
    const sectionRegex = /### (.+?)\n+(.+?)(?=\n### |\n## #|\n*$)/gs
    let sectionMatch
    while ((sectionMatch = sectionRegex.exec(trimmed)) !== null) {
      const sectionName = sectionMatch[1]!
      const sectionContent = sectionMatch[2]!.trim()
      if (sectionName !== "Description") {
        sections[sectionName] = sectionContent
      }
    }

    issues.push({
      id: id as IssueID,
      title,
      description: description || trimmed,
      priority: defaultPriority,
      category: defaultCategory,
      status: "open" as IssueStatusType,
      author,
      createdAt: createdAt || new Date().toISOString(),
      commentCount,
      url,
      sections: Object.keys(sections).length > 0 ? sections : undefined,
    })
  }

  return issues
}

/**
 * Render a collection of issues back to markdown for the given
 * priority/category file.
 */
function renderIssuesToMarkdown(
  issues: IssueType[],
  priority: IssuePriorityType,
  category: IssueCategoryType,
): string {
  const header = generateFileHeader(priority, category)
  const body = issues.map(renderSingleIssue).join("\n\n")
  return `${header}\n\n${body}\n`
}

function generateFileHeader(priority: IssuePriorityType, category: IssueCategoryType): string {
  const icon = category === "bugs" ? "🐛" : category === "features" ? "✨" : category === "debt" ? "🏗️" : "📋"
  const catLabel = categoryName(category)
  return `# ${icon} ${catLabel} Prioritários\n\n> **Total:** {count} | Extraído em ${new Date().toISOString().slice(0, 10)}\n\n---`
}

function priorityLabel(p: IssuePriorityType): string {
  switch (p) {
    case "01-critical": return "Críticos"
    case "02-high":     return "Altos"
    case "03-medium":   return "Médios"
    case "04-low":      return "Baixos"
  }
}

function categoryName(c: IssueCategoryType): string {
  switch (c) {
    case "bugs":         return "Bugs"
    case "features":     return "Features"
    case "debt":         return "Dívida Técnica"
    case "docs":         return "Documentação"
    case "questions":    return "Questões"
    case "uncategorized": return "Sem Categoria"
  }
}

function renderSingleIssue(issue: IssueType): string {
  const lines: string[] = []

  lines.push(`## #${issue.id} — ${issue.title}`)
  lines.push("")

  const date = issue.createdAt ? `\`${issue.createdAt.slice(0, 10)}\`` : "`unknown`"
  const author = issue.author.login
  const comments = issue.commentCount ?? 0
  const url = issue.url ?? ""
  lines.push(`📅 ${date} | ✏️ **${author}** | 💬 ${comments} | 🔗 ${url}`)
  lines.push("")

  if (issue.status !== "open") {
    lines.push(`> **Status:** ${issue.status}`)
    lines.push("")
  }

  lines.push("### Description")
  lines.push("")
  lines.push(issue.description)
  lines.push("")

  if (issue.sections) {
    for (const [name, content] of Object.entries(issue.sections)) {
      lines.push(`### ${name}`)
      lines.push("")
      lines.push(content)
      lines.push("")
    }
  }

  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Safe I/O helpers — catch AppFileSystem errors so the interface stays clean
// ---------------------------------------------------------------------------

function safeRead(afs: AppFileSystem.Interface, filePath: string): Effect.Effect<string | undefined> {
  return afs.readFileStringSafe(filePath).pipe(Effect.catch(() => Effect.succeed(undefined)))
}

function safeReadOrEmpty(afs: AppFileSystem.Interface, filePath: string): Effect.Effect<string> {
  return afs.readFileStringSafe(filePath).pipe(
    Effect.map((c) => c ?? ""),
    Effect.catch(() => Effect.succeed("")),
  )
}

function safeWrite(afs: AppFileSystem.Interface, filePath: string, content: string): Effect.Effect<void> {
  return afs.writeWithDirs(filePath, content).pipe(Effect.catch(() => Effect.void))
}

function safeGlob(afs: AppFileSystem.Interface, cwd: string): Effect.Effect<string[]> {
  return afs.glob("**/*.md", { cwd }).pipe(Effect.catch(() => Effect.succeed([])))
}

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const afs = yield* AppFileSystem.Service
    const bus = yield* Bus.Service

    const instanceState: InstanceState.InstanceState<State> = yield* InstanceState.make<State>(
      Effect.fn("IssueService.state")(function* () {
        const ctx = yield* InstanceState.context
        return { dataDir: path.join(ctx.worktree, DATA_DIR) }
      }),
    )

    // -----------------------------------------------------------------------
    // list
    // -----------------------------------------------------------------------
    const list = Effect.fn("IssueService.list")(function* (filter?: IssueFilter) {
      const { dataDir } = yield* InstanceState.get(instanceState)
      const allIssues: IssueType[] = []

      for (const entry of ISSUE_FILE_INDEX) {
        const filePath = path.join(dataDir, entry.relativePath)
        const content = yield* safeRead(afs, filePath)
        if (!content) continue

        const issues = parseIssuesFromMarkdown(content, entry.priority, entry.category)
        allIssues.push(...issues)
      }

      let result = allIssues
      if (filter) {
        if (filter.priority) {
          result = result.filter((i) => i.priority === filter.priority)
        }
        if (filter.category) {
          result = result.filter((i) => i.category === filter.category)
        }
        if (filter.status) {
          result = result.filter((i) => i.status === filter.status)
        }
        if (filter.search) {
          const q = filter.search.toLowerCase()
          result = result.filter(
            (i) =>
              i.title.toLowerCase().includes(q) ||
              i.description.toLowerCase().includes(q) ||
              i.id.toLowerCase().includes(q),
          )
        }
      }

      return result
    })

    // -----------------------------------------------------------------------
    // get
    // -----------------------------------------------------------------------
    const get = Effect.fn("IssueService.get")(function* (id: IssueID) {
      const all = yield* list()
      const found = all.find((i) => i.id === id)
      if (!found) {
        return yield* new IssueNotFoundError({ id })
      }
      return found
    })

    // -----------------------------------------------------------------------
    // create
    // -----------------------------------------------------------------------
    const create = Effect.fn("IssueService.create")(function* (input: CreateIssueInput) {
      const { dataDir } = yield* InstanceState.get(instanceState)

      const all = yield* list()
      const maxId = all.reduce((max, i) => {
        const num = Number.parseInt(i.id, 10)
        return num > max ? num : max
      }, 0)
      const newId = String(maxId + 1) as IssueID

      const now = new Date().toISOString()
      const issue: IssueType = {
        id: newId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        category: input.category,
        status: input.status ?? "open",
        author: input.author ? { login: input.author.login, url: input.author.url } : { login: "local" },
        createdAt: now,
        updatedAt: now,
        url: input.url,
        labels: input.labels,
      }

      const filePath = resolveFile(dataDir, input.priority, input.category)
      const existingOrEmpty = yield* safeReadOrEmpty(afs, filePath)
      const existing = existingOrEmpty === "" ? undefined : existingOrEmpty

      const rendered = renderSingleIssue(issue)
      const newContent = existing
        ? existing.replace(
            /(\*\*Total:\s*)(\d+)/,
            (_, prefix, count) => `${prefix}${Number.parseInt(count, 10) + 1}`,
          ).trimEnd() + `\n\n${rendered}\n`
        : `${generateFileHeader(input.priority, input.category)}\n\n${rendered}\n`

      yield* safeWrite(afs, filePath, newContent)

      yield* bus.publish(Event.IssueCreated, {
        issueID: issue.id,
        title: issue.title,
        priority: issue.priority,
        category: issue.category,
        status: issue.status,
        author: issue.author.login,
      })

      log.info("issue created", { id: issue.id, title: issue.title })
      return issue
    })

    // -----------------------------------------------------------------------
    // update
    // -----------------------------------------------------------------------
    const update = Effect.fn("IssueService.update")(function* (id: IssueID, input: UpdateIssueInput) {
      const all = yield* list()
      const oldIssue = all.find((i) => i.id === id)
      if (!oldIssue) {
        return yield* new IssueNotFoundError({ id })
      }

      const changedFields: string[] = []
      if (input.title && input.title !== oldIssue.title) changedFields.push("title")
      if (input.description && input.description !== oldIssue.description) changedFields.push("description")
      if (input.priority && input.priority !== oldIssue.priority) changedFields.push("priority")
      if (input.category && input.category !== oldIssue.category) changedFields.push("category")
      if (input.status && input.status !== oldIssue.status) changedFields.push("status")

      const issue: IssueType = {
        ...oldIssue,
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.labels !== undefined ? { labels: input.labels } : {}),
      }

      const newPriority = input.priority ?? oldIssue.priority
      const newCategory = input.category ?? oldIssue.category

      if (oldIssue.priority !== newPriority || oldIssue.category !== newCategory) {
        const { dataDir } = yield* InstanceState.get(instanceState)
        yield* removeFromFile(dataDir, afs, oldIssue)
        yield* appendToFile(dataDir, afs, issue)
      } else {
        const { dataDir } = yield* InstanceState.get(instanceState)
        const filePath = resolveFile(dataDir, newPriority, newCategory)
        const content = yield* safeRead(afs, filePath)
        if (content) {
          const blockRegex = new RegExp(`(## #${id}\\s*[—–-][^#]*)`, "m")
          const rendered = renderSingleIssue(issue)
          const newContent = content.replace(blockRegex, rendered)
          yield* safeWrite(afs, filePath, newContent)
        }
      }

      yield* bus.publish(Event.IssueUpdated, {
        issueID: issue.id,
        title: issue.title,
        priority: issue.priority,
        category: issue.category,
        status: issue.status,
        changedFields,
      })

      log.info("issue updated", { id: issue.id, changedFields })
      return issue
    })

    // -----------------------------------------------------------------------
    // remove
    // -----------------------------------------------------------------------
    const remove = Effect.fn("IssueService.remove")(function* (id: IssueID) {
      const all = yield* list()
      const issue = all.find((i) => i.id === id)
      if (!issue) {
        return yield* new IssueNotFoundError({ id })
      }

      const { dataDir } = yield* InstanceState.get(instanceState)
      yield* removeFromFile(dataDir, afs, issue)

      yield* bus.publish(Event.IssueRemoved, {
        issueID: issue.id,
        title: issue.title,
      })

      log.info("issue removed", { id: issue.id })
    })

    // -----------------------------------------------------------------------
    // readSummary
    // -----------------------------------------------------------------------
    const readSummary = Effect.fn("IssueService.readSummary")(function* () {
      const { dataDir } = yield* InstanceState.get(instanceState)
      return yield* safeRead(afs, path.join(dataDir, "summary.md"))
    })

    // -----------------------------------------------------------------------
    // readDuplicates
    // -----------------------------------------------------------------------
    const readDuplicates = Effect.fn("IssueService.readDuplicates")(function* () {
      const { dataDir } = yield* InstanceState.get(instanceState)
      return yield* safeRead(afs, path.join(dataDir, "duplicates.md"))
    })

    // -----------------------------------------------------------------------
    // files
    // -----------------------------------------------------------------------
    const files = Effect.fn("IssueService.files")(function* () {
      const { dataDir } = yield* InstanceState.get(instanceState)
      return yield* safeGlob(afs, dataDir)
    })

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    function removeFromFile(
      dataDir: string,
      afsLocal: AppFileSystem.Interface,
      issue: IssueType,
    ): Effect.Effect<void> {
      return Effect.gen(function* () {
        const filePath = resolveFile(dataDir, issue.priority, issue.category)
        const content = yield* safeRead(afsLocal, filePath)
        if (!content) return

        const blockRegex = new RegExp(`(## #${issue.id}\\s*[—–-][^#]*?)(?=\n## #|\n*$)`, "s")
        const cleaned = content.replace(blockRegex, "").trim()

        const withCount = cleaned.replace(
          /(\*\*Total:\s*)(\d+)/,
          (_, prefix, count) => `${prefix}${Math.max(0, Number.parseInt(count, 10) - 1)}`,
        )

        yield* safeWrite(afsLocal, filePath, withCount + "\n")
      })
    }

    function appendToFile(
      dataDir: string,
      afsLocal: AppFileSystem.Interface,
      issue: IssueType,
    ): Effect.Effect<void> {
      return Effect.gen(function* () {
const filePath = resolveFile(dataDir, issue.priority, issue.category)
      const existing = yield* safeReadOrEmpty(afsLocal, filePath)
      if (!existing) {
        return
      }

      const withCount = existing
          ? existing.replace(
              /(\*\*Total:\s*)(\d+)/,
              (_, prefix, count) => `${prefix}${Number.parseInt(count, 10) + 1}`,
            )
          : ""

        const rendered = renderSingleIssue(issue)
        const newContent = withCount
          ? `${withCount.trimEnd()}\n\n${rendered}\n`
          : `${generateFileHeader(issue.priority, issue.category)}\n\n${rendered}\n`

        yield* safeWrite(afsLocal, filePath, newContent)
      })
    }

    return Service.of({
      list,
      get,
      create,
      update,
      remove,
      readSummary,
      readDuplicates,
      files,
    })
  }),
)

export const defaultLayer = layer.pipe(
  Layer.provide(AppFileSystem.defaultLayer),
  Layer.provide(Bus.layer),
)

export * as IssueService from "./service"
