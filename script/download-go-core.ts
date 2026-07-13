/**
 * Download/install the Go core binary for the current platform.
 * The Go core runs as a sidecar server alongside the TypeScript CLI,
 * providing native-performance filesystem operations, process spawning,
 * session management, and file watching.
 * The binary is downloaded from GitHub releases and cached in
 * ~/.local/share/teamcode/bin/ (or XDG_DATA_HOME equivalent).
 */

import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"

const REPO = "ElioNeto/teamcode"
const VERSION = "v2.3.1" // should match the current release tag

type Platform = "linux" | "darwin" | "win32"
type Arch = "x64" | "arm64"

function detect(): { platform: Platform; arch: Arch } {
  const platform = process.platform as Platform
  const arch = process.arch as Arch
  if (platform !== "linux" && platform !== "darwin" && platform !== "win32") {
    throw new Error(`Unsupported platform: ${platform}`)
  }
  if (arch !== "x64" && arch !== "arm64") {
    throw new Error(`Unsupported architecture: ${arch}`)
  }
  return { platform, arch }
}

function platformName(platform: Platform): string {
  switch (platform) {
    case "win32":
      return "windows"
    default:
      return platform
  }
}

function binDir(): string {
  const dataDir = process.env.XDG_DATA_HOME
    ? path.join(process.env.XDG_DATA_HOME, "teamcode")
    : path.join(process.env.HOME || "/tmp", ".local", "share", "teamcode")
  return path.join(dataDir, "bin")
}

function binaryName(platform: Platform): string {
  return platform === "win32" ? "go-core-server.exe" : "go-core-server"
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

async function download(url: string, dest: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(dest, buffer)
  await fs.chmod(dest, 0o755)
}

async function downloadFromDist(platform: Platform, arch: Arch): Promise<string> {
  const dir = binDir()
  await ensureDir(dir)
  const name = binaryName(platform)
  const dest = path.join(dir, name)

  // Check if we already have it
  if (existsSync(dest)) {
    console.log(`[teamcode] Go core already installed at ${dest}`)
    return dest
  }

  // Try from the local go-core/dist/ first (development mode)
  const pn = platformName(platform)
  const localPath = path.join(import.meta.dirname, "..", "go-core", "dist", `teamcode-${pn}-${arch}`, "bin", name)
  if (existsSync(localPath)) {
    console.log(`[teamcode] Installing Go core from local build: ${localPath}`)
    await fs.copyFile(localPath, dest)
    await fs.chmod(dest, 0o755)
    return dest
  }

  // Download from GitHub releases
  const url = `https://github.com/${REPO}/releases/download/${VERSION}/go-core-${pn}-${arch}.tar.gz`
  console.log(`[teamcode] Downloading Go core from ${url}...`)

  const tmp = path.join(dir, `go-core-${Date.now()}.tar.gz`)
  try {
    await download(url, tmp)
    // Extract the binary from the tarball
    // For now, assume the tarball contains the binary at the root
    const { execSync } = await import("child_process")
    execSync(`tar -xzf "${tmp}" -C "${dir}"`, { stdio: "inherit" })
    await fs.chmod(dest, 0o755)
    console.log(`[teamcode] Go core installed at ${dest}`)
  } finally {
    await fs.unlink(tmp).catch(() => {})
  }

  return dest
}

async function main() {
  const { platform, arch } = detect()
  try {
    await downloadFromDist(platform, arch)
  } catch (error) {
    console.error(`[teamcode] Warning: could not install Go core:`, error)
    console.error(`[teamcode] The CLI will fall back to TypeScript-only mode.`)
  }
}

main()
