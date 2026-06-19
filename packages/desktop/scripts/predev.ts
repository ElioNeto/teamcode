import { $ } from "bun"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

// Ensure Electron OS binary is installed before attempting to dev
const electronDir = resolve(import.meta.dir, "..", "node_modules", "electron")
const pathFile = resolve(electronDir, "path.txt")
if (!existsSync(pathFile)) {
  console.error("Electron package not properly installed. Run 'bun install' in packages/desktop/.")
  process.exit(1)
}
const binName = (await Bun.file(pathFile).text()).trim()
if (!existsSync(resolve(electronDir, "dist", binName))) {
  console.error("Electron binary not found. Run 'bun install' in packages/desktop/.")
  process.exit(1)
}

await $`bun ./scripts/copy-icons.ts ${process.env.TEAMCODE_CHANNEL ?? "dev"}`

// Build Go core for dev if not already built
const goCoreRoot = resolve(import.meta.dir, "../../../go-core")
const goCoreBinary = resolve(goCoreRoot, "build/go-core-server")
if (!existsSync(goCoreBinary)) {
  console.log("Building Go core server...")
  await $`cd ${goCoreRoot} && make build`
}
