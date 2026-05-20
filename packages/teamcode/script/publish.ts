#!/usr/bin/env bun
import { $ } from "bun"
import pkg from "../package.json"
import { Script } from "@teamcode-ai/script"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

async function published(name: string, version: string) {
  return (await $`npm view ${name}@${version} version`.nothrow()).exitCode === 0
}

async function publish(dir: string, name: string, version: string) {
  // GitHub artifact downloads can drop the executable bit, and Docker uses the
  // unpacked dist binaries directly rather than the published tarball.
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(dir)
  if (await published(name, version)) {
    console.log(`already published ${name}@${version}`)
    return
  }
  await $`bun pm pack`.cwd(dir)
  await $`npm publish *.tgz --access public --tag ${Script.channel}`.cwd(dir)
}

const binaries: Record<string, string> = {}
for (const filepath of new Bun.Glob("*/package.json").scanSync({ cwd: "./dist" })) {
  const pkg = await Bun.file(`./dist/${filepath}`).json()
  binaries[pkg.name] = pkg.version
}
console.log("binaries", binaries)
const version = Object.values(binaries)[0]

await $`mkdir -p ./dist/${pkg.name}`
await $`mkdir -p ./dist/${pkg.name}/bin`
await $`cp ./script/postinstall.mjs ./dist/${pkg.name}/postinstall.mjs`
await Bun.file(`./dist/${pkg.name}/LICENSE`).write(await Bun.file("../../LICENSE").text())
await Bun.file(`./dist/${pkg.name}/bin/${pkg.name}.exe`).write(
  [
    `echo "Error: ${pkg.name}-ai's postinstall script was not run." >&2`,
    'echo "" >&2',
    'echo "This occurs when using --ignore-scripts during installation, or when using a" >&2',
    'echo "package manager like pnpm that does not run postinstall scripts by default." >&2',
    'echo "" >&2',
    'echo "To fix this, run the postinstall script manually:" >&2',
    `echo "  cd node_modules/${pkg.name}-ai && node postinstall.mjs" >&2`,
    'echo "" >&2',
    `echo "Or reinstall ${pkg.name}-ai without the --ignore-scripts flag." >&2`,
    "exit 1",
    "",
  ].join("\n"),
)

await Bun.file(`./dist/${pkg.name}/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name + "-ai",
      bin: {
        [pkg.name]: `./bin/${pkg.name}.exe`,
      },
      scripts: {
        postinstall: "node ./postinstall.mjs",
      },
      version: version,
      license: pkg.license,
      os: ["darwin", "linux", "win32"],
      cpu: ["arm64", "x64"],
      optionalDependencies: binaries,
    },
    null,
    2,
  ),
)

// Create archives and upload all to GitHub Release
const ghRepo = process.env.GH_REPO
const upload = (pattern: string) => $`gh release upload "v${version}" ${pattern} --clobber --repo ${ghRepo}`.nothrow()

// Create tar.gz for Linux and zip for macOS/Windows
for (const [dirName, ext, cmd] of [
  ["teamcode-linux-arm64", "tar.gz", `tar -czf`],
  ["teamcode-linux-x64", "tar.gz", `tar -czf`],
  ["teamcode-linux-x64-baseline", "tar.gz", `tar -czf`],
  ["teamcode-linux-arm64-musl", "tar.gz", `tar -czf`],
  ["teamcode-linux-x64-musl", "tar.gz", `tar -czf`],
  ["teamcode-linux-x64-baseline-musl", "tar.gz", `tar -czf`],
  ["teamcode-darwin-arm64", "zip", `cd ./dist/${dirName}/bin && zip`],
  ["teamcode-darwin-x64", "zip", `cd ./dist/${dirName}/bin && zip`],
  ["teamcode-darwin-x64-baseline", "zip", `cd ./dist/${dirName}/bin && zip`],
  ["teamcode-windows-arm64", "zip", `cd ./dist/${dirName}/bin && zip`],
  ["teamcode-windows-x64", "zip", `cd ./dist/${dirName}/bin && zip`],
  ["teamcode-windows-x64-baseline", "zip", `cd ./dist/${dirName}/bin && zip`],
] as const) {
  const binPath = `./dist/${dirName}/bin/teamcode${ext === "zip" && dirName.includes("windows") ? ".exe" : ""}`
  const binExists = await Bun.file(binPath).exists()
  if (!binExists) continue

  const archiveName = `${dirName}.${ext}`
  if (ext === "tar.gz") {
    await $`tar -czf ./dist/${archiveName} -C ./dist/${dirName}/bin teamcode`.nothrow()
  } else {
    const bin = dirName.includes("windows") ? "teamcode.exe" : "teamcode"
    await $`cd ./dist/${dirName}/bin && zip ../../../${archiveName} ${bin}`.nothrow()
  }
  await upload(`./dist/${archiveName}`)
}

// Also upload any pre-built .tgz from bun pm pack (but don't fail if none exist)
for (const dirName of Object.keys(binaries)) {
  for (const f of ["tgz", "tar.gz", "zip"]) {
    await upload(`./dist/${dirName}/*.${f}`)
  }
}
await upload(`./dist/${pkg.name}/*.tgz`)
