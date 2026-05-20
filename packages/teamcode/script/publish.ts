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

// Upload binaries to GitHub Release instead of publishing to npm (token is scoped to @teamcode-ai)
for (const dir of Object.keys(binaries)) {
  const tgz = `${dir}-${version}.tgz`
  await $`gh release upload "v${version}" ./dist/${dir}/${tgz} --clobber --repo ${process.env.GH_REPO}`.nothrow()
}
// Also upload the meta-package
await $`gh release upload "v${version}" ./dist/${pkg.name}/${pkg.name}-ai-${version}.tgz --clobber --repo ${process.env.GH_REPO}`.nothrow()

// Upload archive packages
for (const ext of ["tar.gz", "zip"]) {
  for await (const file of new Bun.Glob(`./dist/*.${ext}`).scan()) {
    await $`gh release upload "v${version}" "${file}" --clobber --repo ${process.env.GH_REPO}`.nothrow()
  }
}

// Create tar.gz archives for Linux binaries
const archs = ["arm64", "x64", "x64-baseline", "arm64-musl", "x64-musl", "x64-baseline-musl"]
for (const arch of archs) {
  const dir = `teamcode-linux-${arch}`
  const binPath = `./dist/${dir}/bin/teamcode`
  const exists = await Bun.file(binPath).exists()
  if (!exists) continue
  const tarName = `teamcode-linux-${arch}.tar.gz`
  await $`tar -czf ./dist/${tarName} -C ./dist/${dir}/bin teamcode`.nothrow()
  await $`gh release upload "v${version}" ./dist/${tarName} --clobber --repo ${process.env.GH_REPO}`.nothrow()
}

// Create zip archives for macOS binaries
const macArchs = ["arm64", "x64", "x64-baseline"]
for (const arch of macArchs) {
  const dir = `teamcode-darwin-${arch}`
  const binPath = `./dist/${dir}/bin/teamcode`
  const exists = await Bun.file(binPath).exists()
  if (!exists) continue
  const zipName = `teamcode-darwin-${arch}.zip`
  await $`cd ./dist/${dir}/bin && zip ../../${zipName} teamcode`.nothrow()
  await $`gh release upload "v${version}" ./dist/${zipName} --clobber --repo ${process.env.GH_REPO}`.nothrow()
}
