import path from "path"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import { UI } from "../ui"
import { effectCmd } from "../effect-cmd"
import { Effect } from "effect"
import { detect, type ProjectProfile } from "@/config/detect"
import { CONFIG_SCHEMA_URL, TUI_SCHEMA_URL } from "@/config/config"

const TEAMCODE_DIR = ".teamcode"

function p(base: string, ...parts: string[]) {
  return path.join(base, TEAMCODE_DIR, ...parts)
}

/**
 * Generate the opencode.jsonc based on the detected project profile.
 */
function generateConfig(d: ProjectProfile): string {
  const commands: Record<string, { description: string; prompt: string }> = {}

  // Dev command
  if (d.scripts.dev) {
    commands.dev = {
      description: "Start the development server",
      prompt: `Start the dev server. Usage: \`dev\` — runs \`${d.runCommand} dev\`.`,
    }
  } else {
    commands.dev = {
      description: "Start the development server",
      prompt: "Start the dev server.",
    }
  }

  // Build command
  if (d.scripts.build) {
    commands.build = {
      description: "Build the project",
      prompt: `Build the project. Usage: \`build\` — runs \`${d.runCommand} build\`.`,
    }
  }

  // Test command
  if (d.scripts.test || d.testFrameworks.length > 0) {
    commands.test = {
      description: "Run tests",
      prompt: `Run tests. Usage: \`test <path>\` — runs ${d.testCommand}.`,
    }
  }

  // TypeScript typecheck
  if (d.hasTypeScript) {
    commands.typecheck = {
      description: "Run TypeScript type checking",
      prompt: `Run TypeScript type checking. Usage: \`typecheck\` — runs \`${d.runCommand} typecheck\` if available, or \`tsgo --noEmit\`.`,
    }
  }

  // Lint
  if (d.scripts.lint) {
    commands.lint = {
      description: "Lint the codebase",
      prompt: `Lint the codebase. Usage: \`lint\` — runs \`${d.runCommand} lint\`.`,
    }
  }

  return JSON.stringify(
    {
      $schema: CONFIG_SCHEMA_URL,
      default_agent: "god",
      instructions: ["AGENTS.md"],
      tools: {},
      command: Object.keys(commands).length > 0 ? commands : undefined,
      agent: {
        god: {
          model: "anthropic/claude-sonnet-4-6",
          description: "Omnipotent agent with unrestricted access to all tools and permissions",
        },
      },
      provider: {
        opencode: {
          options: {},
        },
      },
      mcp: {},
      permission: {
        edit: "allow",
        bash: {
          "git *": "allow",
          ...(d.packageManager === "bun" ? { "bun *": "allow" } : {}),
          ...(d.packageManager === "npm" ? { "npm *": "allow" } : {}),
          ...(d.packageManager === "yarn" ? { "yarn *": "allow" } : {}),
          ...(d.packageManager === "pnpm" ? { "pnpm *": "allow" } : {}),
          "ls *": "allow",
          "mkdir *": "allow",
          "cp *": "allow",
          "mv *": "allow",
          "gh *": "allow",
          "*": "ask",
        },
        external_directory: {
          "/tmp": "allow",
          "*": "ask",
        },
      },
      experimental: {},
      tool_output: {
        max_lines: 200,
        max_bytes: 16384,
      },
      compaction: {
        auto: true,
        tail_turns: 15,
      },
    },
    null,
    2,
  ) + "\n"
}

/**
 * Generate the god.md agent file based on the detected project.
 */
function generateGodAgent(d: ProjectProfile): string {
  const frameworkHints = d.frameworks.length > 0
    ? `Specializes in ${d.frameworks.slice(0, 3).join(", ")}${d.frameworks.length > 3 ? "..." : ""}.`
    : ""

  const pmHints = d.packageManager
    ? `Uses \`${d.packageManager}\` as package manager (run: \`${d.runCommand}\`, add: \`${d.addCommand}\`).`
    : ""

  return [
    "---",
    "name: god",
    "description: Agent with unrestricted access to all tools and permissions.",
    "mode: primary",
    "temperature: 0.3",
    'color: "#ffd700"',
    "permission:",
    "  read: allow",
    "  edit: allow",
    "  write: allow",
    "  glob: allow",
    "  grep: allow",
    "  bash:",
    '    "*": allow',
    ...(d.packageManager ? [`    "${d.packageManager} *": allow`] : []),
    "    git *: allow",
    "    gh *: allow",
    "  task:",
    "    god: allow",
    "  external_directory: allow",
    "  webfetch: allow",
    "  websearch: allow",
    "  skill: allow",
    "---",
    "You are God — the omnipotent agent of this project.",
    "",
    d.projectName ? `**Project:** ${d.projectName}` : "",
    d.language ? `**Language:** ${d.language}` : "",
    frameworkHints,
    pmHints,
    d.hasTypeScript ? "**TypeScript:** TypeScript is configured." : "",
    d.isMonorepo ? "**Monorepo:** This is a monorepo." : "",
    "",
    "You have **zero restrictions**. Every tool, permission, and resource is yours to command.",
    "",
    "## Purpose",
    "- Execute any operation requested, no matter how complex or sensitive",
    "- Access external resources, spawn subagents, install dependencies",
    "- Act as the ultimate fallback when other agents encounter limits",
    "",
    "## Guidelines",
    "- With great power comes great responsibility",
    "- Prefer surgical changes over sledgehammers",
    "- Document your reasoning in commits so others understand why drastic measures were taken",
    "",
  ].filter(Boolean).join("\n")
}

/**
 * Generate the dev command file.
 */
function generateDevCommand(d: ProjectProfile): string {
  const lines = [
    "---",
    'description: "Start the development server"',
    "---",
    "",
    "Start the development server for this project.",
    "",
  ]

  if (d.scripts.dev) {
    lines.push("```bash")
    lines.push(`${d.runCommand} dev`)
    lines.push("```")
    lines.push("")
    lines.push("This starts the dev server with hot reload enabled.")
  } else {
    lines.push("No `dev` script found in package.json. Check package.json for available scripts.")
  }

  return lines.join("\n")
}

/**
 * Generate the test command file.
 */
function generateTestCommand(d: ProjectProfile): string {
  const lines = [
    "---",
    'description: "Run tests"',
    "---",
    "",
    "Run tests for this project.",
    "",
  ]

  const testFrameworksStr = d.testFrameworks.length > 0
    ? ` (${d.testFrameworks.join(", ")})`
    : ""

  lines.push(`Uses ${d.testCommand}${testFrameworksStr}.`)
  lines.push("")

  if (d.scripts.test) {
    lines.push("```bash")
    lines.push(`${d.runCommand} test`)
    lines.push("```")
    lines.push("")
  }

  lines.push("## Specific test file:")
  lines.push("```bash")
  lines.push(`${d.testCommand} path/to/test.test.ts`)
  lines.push("```")
  lines.push("")

  return lines.join("\n")
}

/**
 * Generate the build command file.
 */
function generateBuildCommand(d: ProjectProfile): string {
  const lines = [
    "---",
    'description: "Build the project"',
    "---",
    "",
    "Build the project for production.",
    "",
  ]

  if (d.scripts.build) {
    lines.push("```bash")
    lines.push(`${d.runCommand} build`)
    lines.push("```")
    lines.push("")
  }

  const buildToolsStr = d.buildTools.length > 0
    ? `Build tool: ${d.buildTools.join(", ")}.`
    : ""

  if (buildToolsStr) {
    lines.push(buildToolsStr)
    lines.push("")
  }

  lines.push("Output is written to the dist/ directory.")
  lines.push("")

  return lines.join("\n")
}

/**
 * Generate the check-types command file.
 */
function generateTypecheckCommand(d: ProjectProfile): string {
  if (!d.hasTypeScript) return ""

  return [
    "---",
    'description: "Run TypeScript type checking"',
    "---",
    "",
    "Run TypeScript type checking across the project.",
    "",
    "```bash",
    d.scripts.typecheck
      ? `${d.runCommand} typecheck`
      : `${d.packageManager === "bun" ? "bunx tsc" : "npx tsc"} --noEmit`,
    "```",
    "",
  ].join("\n")
}

async function scaffold(dir: string, force: boolean): Promise<{ created: boolean; profile: ProjectProfile }> {
  const target = path.join(dir, TEAMCODE_DIR)
  const alreadyExists = existsSync(target)

  if (alreadyExists) {
    if (!force) {
      UI.println()
      UI.println(UI.Style.TEXT_WARNING_BOLD + "⚠  .teamcode already exists at " + target + UI.Style.TEXT_NORMAL)
      UI.println(UI.Style.TEXT_DIM + "   Use --force to overwrite existing files." + UI.Style.TEXT_NORMAL)
      UI.println()
      return { created: false, profile: await detect(dir) }
    }
    UI.println(UI.Style.TEXT_WARNING_BOLD + "~  Overwriting .teamcode at " + target + UI.Style.TEXT_NORMAL)
  }

  UI.println()
  UI.println(UI.Style.TEXT_INFO_BOLD + "~  Analyzing project..." + UI.Style.TEXT_NORMAL)
  const profile = await detect(dir)

  UI.println(UI.Style.TEXT_DIM + "   directory:       " + dir + UI.Style.TEXT_NORMAL)
  UI.println(UI.Style.TEXT_DIM + "   language:        " + profile.language + UI.Style.TEXT_NORMAL)
  UI.println(UI.Style.TEXT_DIM + "   package manager: " + (profile.packageManager ?? "(unknown)") + UI.Style.TEXT_NORMAL)
  if (profile.frameworks.length > 0) {
    UI.println(UI.Style.TEXT_DIM + "   frameworks:      " + profile.frameworks.join(", ") + UI.Style.TEXT_NORMAL)
  }
  if (profile.isMonorepo) {
    UI.println(UI.Style.TEXT_DIM + "   monorepo:        " + (profile.monorepoTool ?? "yes") + UI.Style.TEXT_NORMAL)
  }
  UI.println()

  UI.println(UI.Style.TEXT_INFO_BOLD + "~  Scaffolding .teamcode structure..." + UI.Style.TEXT_NORMAL)
  UI.println()

  // ── Directories ──────────────────────────────────────────────────────
  const dirs = [
    p(dir, "agent"),
    p(dir, "agents"),
    p(dir, "agents", "resolver"),
    p(dir, "command"),
    p(dir, "instructions"),
    p(dir, "skills"),
    p(dir, "themes"),
    p(dir, "plugins"),
    p(dir, "tool"),
  ]

  for (const d of dirs) {
    await mkdir(d, { recursive: true })
  }

  // ── opencode.jsonc ───────────────────────────────────────────────────
  await writeFile(p(dir, "opencode.jsonc"), generateConfig(profile))

  // ── agent/god.md ─────────────────────────────────────────────────────
  await writeFile(p(dir, "agent", "god.md"), generateGodAgent(profile))

  // ── agents/planner.md ────────────────────────────────────────────────
  await writeFile(
    p(dir, "agents", "planner.md"),
    [
      "---",
      "name: planner",
      "description: Decompose complex tasks into structured execution plans.",
      "mode: subagent",
      "permission:",
      "  edit: deny",
      "  glob: allow",
      "  grep: allow",
      "  read: allow",
      "  bash:",
      "    git *: allow",
      "    ls *: allow",
      '    "*": deny',
      "---",
      "",
      "You are a **Planner agent** responsible for breaking complex tasks into clear, actionable plans.",
      "",
      "## Your role",
      "- Analyze the user's request and understand the full scope",
      "- Break work into logical steps: research, implementation, review",
      "- Identify dependencies between steps (parallel vs sequential)",
      "- Define clear acceptance criteria for each step",
      "",
      "## Output format",
      "",
      "```yaml",
      'goal: "<one-sentence summary>"',
      "steps:",
      "  - id: 1",
      "    role: researcher",
      '    description: "<what to investigate>"',
      '    acceptance_criteria: "<how to verify>"',
      "  - id: 2",
      "    role: executor",
      '    description: "<what to implement>"',
      "    depends_on: [1]",
      '    acceptance_criteria: "<how to verify>"',
      "  - id: 3",
      "    role: reviewer",
      '    description: "<what to review>"',
      "    depends_on: [2]",
      '    acceptance_criteria: "<how to verify>"',
      "```",
      "",
      "## Guidelines",
      "- Be specific about what files need to be touched",
      "- If ambiguous, ask clarifying questions before producing the plan",
      "- Do NOT make any edits — your output is a plan only",
      "",
    ].join("\n"),
  )

  // ── agents/researcher.md ─────────────────────────────────────────────
  await writeFile(
    p(dir, "agents", "researcher.md"),
    [
      "---",
      "name: researcher",
      "description: Explore and investigate the codebase to gather evidence before changes.",
      "mode: subagent",
      "permission:",
      "  edit: deny",
      "  write: deny",
      "  glob: allow",
      "  grep: allow",
      "  read: allow",
      "  bash:",
      "    ls *: allow",
      "    cat *: allow",
      '    "*": deny',
      "---",
      "",
      "You are a **Researcher agent** — you explore codebases to find answers.",
      "",
      "## Your role",
      "- Search for relevant files and patterns",
      "- Read and understand existing code",
      "- Trace dependencies and data flow",
      "- Report findings clearly so others can act on them",
      "",
      "## Guidelines",
      "- Be thorough: check multiple locations and naming conventions",
      "- Report exact file paths and line numbers",
      "- Do NOT make any edits",
      "",
    ].join("\n"),
  )

  // ── agents/executor.md ───────────────────────────────────────────────
  await writeFile(
    p(dir, "agents", "executor.md"),
    [
      "---",
      "name: executor",
      "description: Implement code changes following an established plan.",
      "mode: subagent",
      "permission:",
      "  edit: allow",
      "  write: allow",
      "  glob: allow",
      "  grep: allow",
      "  read: allow",
      "  bash:",
      "    git *: allow",
      "    npm *: allow",
      "    bun *: allow",
      '    "*": ask',
      "---",
      "",
      "You are an **Executor agent** — you write code based on a plan.",
      "",
      "## Your role",
      "- Implement changes according to the plan's specifications",
      "- Follow existing code patterns and conventions",
      "- Keep changes surgical and focused",
      "- Do NOT change files unrelated to the task",
      "",
      "## Guidelines",
      "- Write clean, well-structured code",
      "- Add comments for non-obvious logic",
      "- Run typecheck after making changes",
      "",
    ].join("\n"),
  )

  // ── agents/reviewer.md ───────────────────────────────────────────────
  await writeFile(
    p(dir, "agents", "reviewer.md"),
    [
      "---",
      "name: reviewer",
      "description: Review code changes for quality, correctness, and consistency.",
      "mode: subagent",
      "permission:",
      "  edit: deny",
      "  write: deny",
      "  glob: allow",
      "  grep: allow",
      "  read: allow",
      "  bash:",
      "    git *: allow",
      "    ls *: allow",
      '    "*": deny',
      "---",
      "",
      "You are a **Reviewer agent** — you ensure code quality before commits.",
      "",
      "## Your role",
      "- Check for bugs, logic errors, and edge cases",
      "- Verify the implementation matches the plan",
      "- Ensure code follows project style and conventions",
      "- Check for debug artifacts (console.log, debugger, etc.)",
      "",
      "## Guidelines",
      "- Be thorough but constructive",
      "- Report issues with specific file paths and suggestions",
      "- Approve only when the code is ready to commit",
      "- Do NOT make any edits yourself",
      "",
    ].join("\n"),
  )

  // ── command/*.md ─────────────────────────────────────────────────────
  await writeFile(p(dir, "command", "dev.md"), generateDevCommand(profile))
  await writeFile(p(dir, "command", "test.md"), generateTestCommand(profile))
  await writeFile(p(dir, "command", "build.md"), generateBuildCommand(profile))

  // Optional: typecheck command for TypeScript projects
  const typecheckContent = generateTypecheckCommand(profile)
  if (typecheckContent) {
    await writeFile(p(dir, "command", "check-types.md"), typecheckContent)
  }

  // ── skills / instructions / plugins / tool — gitkeeps ────────────────
  await writeFile(p(dir, "skills", ".gitkeep"), "")
  await writeFile(p(dir, "instructions", ".gitkeep"), "")
  await writeFile(p(dir, "plugins", ".gitkeep"), "")
  await writeFile(p(dir, "tool", ".gitkeep"), "")

  // ── themes/mytheme.json ──────────────────────────────────────────────
  await writeFile(
    p(dir, "themes", "mytheme.json"),
    JSON.stringify(
      {
        defs: {
          bg: "#1a1a2e",
          surface: "#16213e",
          accent: "#0f3460",
          text: "#e0e0e0",
          muted: "#a0a0a0",
          success: "#4caf50",
          warning: "#ff9800",
          error: "#f44336",
          info: "#2196f3",
        },
        theme: {
          primary: { dark: "accent", light: "accent" },
          background: { dark: "bg", light: "bg" },
          backgroundPanel: { dark: "surface", light: "surface" },
          text: { dark: "text", light: "text" },
          textMuted: { dark: "muted", light: "muted" },
          success: { dark: "success", light: "success" },
          warning: { dark: "warning", light: "warning" },
          error: { dark: "error", light: "error" },
          info: { dark: "info", light: "info" },
        },
      },
      null,
      2,
    ) + "\n",
  )

  // ── env.d.ts ─────────────────────────────────────────────────────────
  await writeFile(
    p(dir, "env.d.ts"),
    ['declare module "*.txt" {', "  const content: string", "  export default content", "}", ""].join("\n"),
  )

  // ── tui.json ─────────────────────────────────────────────────────────
  await writeFile(
    p(dir, "tui.json"),
    JSON.stringify(
      {
        $schema: TUI_SCHEMA_URL,
        plugin: [],
      },
      null,
      2,
    ) + "\n",
  )

  // ── package.json ─────────────────────────────────────────────────────
  await writeFile(
    p(dir, "package.json"),
    JSON.stringify(
      {
        name: "teamcode-plugins",
        private: true,
        type: "module",
        dependencies: {
          "@teamcode-ai/plugin": "*",
        },
      },
      null,
      2,
    ) + "\n",
  )

  // ── .gitignore ───────────────────────────────────────────────────────
  await writeFile(
    p(dir, ".gitignore"),
    ["node_modules/", ".Turbo/", "dist/", "build/", "*.tsbuildinfo", ""].join("\n"),
  )

  return { created: true, profile }
}

function printSummary(profile: ProjectProfile) {
  const created = [
    "opencode.jsonc",
    "agent/god.md",
    "agents/planner.md",
    "agents/researcher.md",
    "agents/executor.md",
    "agents/reviewer.md",
    "command/dev.md",
    "command/test.md",
    "command/build.md",
    ...(profile.hasTypeScript ? ["command/check-types.md"] : []),
    "themes/mytheme.json",
    "env.d.ts",
    "tui.json",
    "package.json",
    ".gitignore",
  ]

  UI.println(UI.Style.TEXT_SUCCESS_BOLD + "✓  .teamcode structure created!" + UI.Style.TEXT_NORMAL)
  UI.println()

  const detected = [
    `Language: ${profile.language}`,
    `Package manager: ${profile.packageManager ?? "(unknown)"}`,
    ...(profile.frameworks.length > 0 ? [`Frameworks: ${profile.frameworks.join(", ")}`] : []),
    ...(profile.testFrameworks.length > 0 ? [`Test: ${profile.testFrameworks.join(", ")}`] : []),
    ...(profile.buildTools.length > 0 ? [`Build: ${profile.buildTools.join(", ")}`] : []),
    ...(profile.isMonorepo ? [`Monorepo: ${profile.monorepoTool ?? "yes"}`] : []),
  ]

  UI.println(UI.Style.TEXT_DIM + "   Detected:" + UI.Style.TEXT_NORMAL)
  for (const line of detected) {
    UI.println(UI.Style.TEXT_DIM + "     • " + line + UI.Style.TEXT_NORMAL)
  }

  UI.println()
  UI.println(UI.Style.TEXT_DIM + "   Created:" + UI.Style.TEXT_NORMAL)
  for (const file of created) {
    UI.println(UI.Style.TEXT_DIM + "     • " + file + UI.Style.TEXT_NORMAL)
  }

  UI.println()
  UI.println(UI.Style.TEXT_DIM + "   Next steps:" + UI.Style.TEXT_NORMAL)
  UI.println(UI.Style.TEXT_DIM + "     1. Edit opencode.jsonc to configure your agents and provider" + UI.Style.TEXT_NORMAL)
  UI.println(UI.Style.TEXT_DIM + "     2. Add custom commands under command/" + UI.Style.TEXT_NORMAL)
  UI.println(UI.Style.TEXT_DIM + "     3. Create skills under skills/" + UI.Style.TEXT_NORMAL)
  UI.println(UI.Style.TEXT_DIM + "     4. Add custom tools under tool/" + UI.Style.TEXT_NORMAL)
  UI.println(UI.Style.TEXT_DIM + "     5. Write AGENTS.md with project-specific guidance" + UI.Style.TEXT_NORMAL)
  UI.println()
}

/**
 * Scaffold the initial `.teamcode/` directory structure for a project.
 * Analyzes the project (language, package manager, frameworks, etc.)
 * and generates personalised files.
 */
export const InitCommand = effectCmd({
  command: "init [directory]",
  describe: "Scaffold the .teamcode directory structure in a project",
  instance: false,
  builder: (yargs) =>
    yargs
      .positional("directory", {
        type: "string",
        describe: "Project directory (defaults to current working directory)",
      })
      .option("force", {
        alias: "f",
        type: "boolean",
        describe: "Overwrite existing files",
        default: false,
      }),
  handler: Effect.fn("Cli.init")(function* (args) {
    const dir = path.resolve((args.directory as string | undefined) ?? process.cwd())
    const force = !!args.force

    const { created, profile } = yield* Effect.promise(() => scaffold(dir, force))
    if (created) printSummary(profile)
  }),
})
