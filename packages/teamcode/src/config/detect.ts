import { readdir, readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

/** Detected project profile. */
export type ProjectProfile = {
  /** Root language/ecosystem. */
  language: "TypeScript" | "JavaScript" | "Python" | "Go" | "Rust" | "Ruby" | "Java/Kotlin" | "PHP" | "Unknown"
  /** Has TypeScript config. */
  hasTypeScript: boolean
  /** Detected package manager. */
  packageManager: "bun" | "npm" | "yarn" | "pnpm" | undefined
  /** Detected frameworks from dependencies. */
  frameworks: string[]
  /** Detected test frameworks. */
  testFrameworks: string[]
  /** Detected build tools. */
  buildTools: string[]
  /** Is this a monorepo? */
  isMonorepo: boolean
  /** Monorepo tool if detected. */
  monorepoTool: string | undefined
  /** Has `workspaces` field in package.json. */
  hasWorkspaces: boolean
  /** Git repo detected. */
  hasGit: boolean
  /** Git branch name. */
  gitBranch: string | undefined
  /** project name from package.json. */
  projectName: string | undefined
  /** scripts from package.json. */
  scripts: Record<string, string>
  /** dependencies from package.json. */
  dependencies: Record<string, string>
  /** devDependencies from package.json. */
  devDependencies: Record<string, string>
  /** Package manager run command. */
  runCommand: string
  /** Package manager add command. */
  addCommand: string
  /** Package manager test command. */
  testCommand: string
}

const FRAMEWORK_PATTERNS: Record<string, string[]> = {
  "SolidJS": ["solid-js", "solid-start"],
  "React": ["react", "react-dom", "next", "remix", "gatsby"],
  "Vue": ["vue", "nuxt", "vue-router", "pinia"],
  "Svelte": ["svelte", "sveltekit"],
  "Angular": ["@angular/core"],
  "Astro": ["astro"],
  "Express": ["express"],
  "Fastify": ["fastify"],
  "Hono": ["hono"],
  "NestJS": ["@nestjs/core"],
  "Electron": ["electron"],
  "SolidStart": ["solid-start"],
  "Next.js": ["next"],
  "Nuxt": ["nuxt"],
  "Tailwind": ["tailwindcss"],
  "tRPC": ["@trpc/server", "@trpc/client"],
  "Prisma": ["prisma", "@prisma/client"],
  "Drizzle": ["drizzle-orm", "drizzle-kit"],
}

const TEST_FRAMEWORK_PATTERNS: Record<string, string[]> = {
  "Vitest": ["vitest"],
  "Jest": ["jest"],
  "Mocha": ["mocha"],
  "Playwright": ["@playwright/test"],
  "Cypress": ["cypress"],
  "Bun:test": [],
}

const BUILD_TOOL_PATTERNS: Record<string, string[]> = {
  "Vite": ["vite"],
  "tsc": ["typescript"],
  "Webpack": ["webpack"],
  "esbuild": ["esbuild"],
  "Rollup": ["rollup"],
  "tsup": ["tsup"],
  "unbuild": ["unbuild"],
  "Turborepo": ["turbo"],
}

const MONOREPO_INDICATORS = ["turbo.json", "nx.json", "lerna.json", "rush.json", "pnpm-workspace.yaml"]

function matchDeps(deps: Record<string, string>, patterns: Record<string, string[]>): string[] {
  const matched: string[] = []
  const allKeys = Object.keys(deps)
  for (const [name, keywords] of Object.entries(patterns)) {
    if (keywords.length === 0) continue
    if (keywords.some((k) => allKeys.includes(k))) matched.push(name)
  }
  return matched
}

function detectPackageManager(rootFiles: Set<string>): ProjectProfile["packageManager"] {
  if (rootFiles.has("bun.lock") || rootFiles.has("bun.lockb")) return "bun"
  if (rootFiles.has("pnpm-lock.yaml")) return "pnpm"
  if (rootFiles.has("yarn.lock")) return "yarn"
  if (rootFiles.has("package-lock.json")) return "npm"
  // No lock file? Try to infer from presence of certain files
  if (rootFiles.has("bunfig.toml")) return "bun"
  return undefined
}

function detectLanguage(rootFiles: Set<string>, pkg?: { devDependencies: Record<string, string> }): ProjectProfile["language"] {
  if (rootFiles.has("Cargo.toml")) return "Rust"
  if (rootFiles.has("go.mod")) return "Go"
  if (rootFiles.has("pyproject.toml") || rootFiles.has("requirements.txt")) return "Python"
  if (rootFiles.has("Gemfile")) return "Ruby"
  if (rootFiles.has("build.gradle") || rootFiles.has("build.gradle.kts") || rootFiles.has("pom.xml")) return "Java/Kotlin"
  if (rootFiles.has("composer.json")) return "PHP"
  if (rootFiles.has("package.json")) {
    if (rootFiles.has("tsconfig.json") || pkg?.devDependencies?.typescript) return "TypeScript"
    return "JavaScript"
  }
  return "Unknown"
}

/** Build a run command prefix from package manager. */
function pmCommands(pm: ProjectProfile["packageManager"]): {
  run: string
  add: string
  test: string
} {
  switch (pm) {
    case "bun": return { run: "bun run", add: "bun add", test: "bun test" }
    case "pnpm": return { run: "pnpm", add: "pnpm add", test: "pnpm test" }
    case "yarn": return { run: "yarn", add: "yarn add", test: "yarn test" }
    case "npm": return { run: "npm run", add: "npm install", test: "npm test" }
    default: return { run: "bun run", add: "bun add", test: "bun test" }
  }
}

/**
 * Analyze a project directory and return a detected profile.
 */
export async function detect(dir: string): Promise<ProjectProfile> {
  const rootFiles = new Set<string>()
  let gitBranch: string | undefined
  let projectName: string | undefined
  let scripts: Record<string, string> = {}
  let dependencies: Record<string, string> = {}
  let devDependencies: Record<string, string> = {}

  // Scan root files
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() || entry.isDirectory()) rootFiles.add(entry.name)
    }
  } catch {
    // Directory may not exist yet
  }

  // Check git
  const hasGit = rootFiles.has(".git") || existsSync(path.join(dir, ".git"))
  if (hasGit) {
    try {
      const { execSync } = await import("child_process")
      gitBranch = execSync("git rev-parse --abbrev-ref HEAD", {
        cwd: dir,
        encoding: "utf8",
        timeout: 3000,
      }).trim()
    } catch {
      // Not a git repo or git not installed
    }
  }

  // Parse package.json if present
  if (rootFiles.has("package.json")) {
    try {
      const raw = await readFile(path.join(dir, "package.json"), "utf8")
      const pkg = JSON.parse(raw)
      projectName = pkg.name
      scripts = pkg.scripts ?? {}
      dependencies = pkg.dependencies ?? {}
      devDependencies = pkg.devDependencies ?? {}
      // Check for workspaces
      if (pkg.workspaces) rootFiles.add("pnpm-workspace.yaml") // placeholder
    } catch {
      // Ignore parse errors
    }
  }

  const language = detectLanguage(rootFiles, { devDependencies })
  const hasTypeScript = language === "TypeScript" || rootFiles.has("tsconfig.json") || !!devDependencies.typescript
  const packageManager = detectPackageManager(rootFiles)
  const allDeps = { ...dependencies, ...devDependencies }
  const frameworks = matchDeps(allDeps, FRAMEWORK_PATTERNS)
  const testFrameworks = matchDeps(allDeps, TEST_FRAMEWORK_PATTERNS)
  const buildTools = matchDeps(allDeps, BUILD_TOOL_PATTERNS)

  // Check for bun:test separately
  if (packageManager === "bun" && testFrameworks.length === 0) {
    testFrameworks.push("Bun:test")
  }

  const isMonorepo = MONOREPO_INDICATORS.some((f) => rootFiles.has(f)) ||
    rootFiles.has("pnpm-workspace.yaml") ||
    "workspaces" in scripts ||
    (rootFiles.has("package.json") && (await checkPackageJsonWorkspaces(dir)))

  const monorepoTool = MONOREPO_INDICATORS.find((f) => rootFiles.has(f))?.replace(/\.(json|yaml)$/, "")

  const { run, add, test } = pmCommands(packageManager)

  return {
    language,
    hasTypeScript,
    packageManager,
    frameworks,
    testFrameworks,
    buildTools,
    isMonorepo,
    monorepoTool,
    hasWorkspaces: isMonorepo,
    hasGit,
    gitBranch,
    projectName,
    scripts,
    dependencies,
    devDependencies,
    runCommand: run,
    addCommand: add,
    testCommand: test,
  }
}

async function checkPackageJsonWorkspaces(dir: string): Promise<boolean> {
  try {
    const raw = await readFile(path.join(dir, "package.json"), "utf8")
    const pkg = JSON.parse(raw)
    return !!pkg.workspaces
  } catch {
    return false
  }
}
