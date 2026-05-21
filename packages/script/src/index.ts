import { $ } from "bun"
import semver from "semver"
import path from "path"

const rootPkgPath = path.resolve(import.meta.dir, "../../../package.json")
const rootPkg = await Bun.file(rootPkgPath).json()
const expectedBunVersion = rootPkg.packageManager?.split("@")[1]

if (!expectedBunVersion) {
  throw new Error("packageManager field not found in root package.json")
}

// relax version requirement
const expectedBunVersionRange = `^${expectedBunVersion}`

if (!semver.satisfies(process.versions.bun, expectedBunVersionRange)) {
  throw new Error(`This script requires bun@${expectedBunVersionRange}, but you are using bun@${process.versions.bun}`)
}

const env = {
  TEAMCODE_CHANNEL: process.env["TEAMCODE_CHANNEL"],
  TEAMCODE_BUMP: process.env["TEAMCODE_BUMP"],
  TEAMCODE_VERSION: process.env["TEAMCODE_VERSION"],
  TEAMCODE_RELEASE: process.env["TEAMCODE_RELEASE"],
}
const CHANNEL = await (async () => {
  if (env.TEAMCODE_CHANNEL) return env.TEAMCODE_CHANNEL
  if (env.TEAMCODE_BUMP) return "latest"
  if (env.TEAMCODE_VERSION && !env.TEAMCODE_VERSION.startsWith("0.0.0-")) return "latest"
  return await $`git branch --show-current`.text().then((x) => x.trim())
})()
const IS_PREVIEW = CHANNEL !== "latest"

const VERSION = await (async () => {
  if (env.TEAMCODE_VERSION) return env.TEAMCODE_VERSION
  if (IS_PREVIEW) return `0.0.0-${CHANNEL}-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}`
  const npmName = "teamcode-ai"
  const version = await fetch(`https://registry.npmjs.org/${npmName}/latest`)
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText)
      return res.json()
    })
    .then((data: any) => data.version)
    .catch(async () => {
      // Fallback to local package.json version (e.g. for first publish)
      const pkg = await Bun.file(
        import.meta.dir + "/../../teamcode/package.json",
      ).json() as { version: string }
      return pkg.version
    })
  const [major, minor, patch] = version.split(".").map((x: string) => Number(x) || 0)
  const t = env.TEAMCODE_BUMP?.toLowerCase()
  if (t === "major") return `${major + 1}.0.0`
  if (t === "minor") return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
})()

const bot = ["actions-user", "teamcode", "teamcode-agent[bot]"]
const teamPath = path.resolve(import.meta.dir, "../../../.github/TEAM_MEMBERS")
const teamFileExists = await Bun.file(teamPath).exists()
const team = [
  ...(teamFileExists
    ? await Bun.file(teamPath)
        .text()
        .then((x) => x.split(/\r?\n/).map((x) => x.trim()))
        .then((x) => x.filter((x) => x && !x.startsWith("#")))
    : []),
  ...bot,
]

export const Script = {
  get channel() {
    return CHANNEL
  },
  get version() {
    return VERSION
  },
  get preview() {
    return IS_PREVIEW
  },
  get release(): boolean {
    return !!env.TEAMCODE_RELEASE
  },
  get team() {
    return team
  },
}
console.log(`opencode script`, JSON.stringify(Script, null, 2))
