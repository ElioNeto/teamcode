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

// Publish scoped binary packages and meta-package to npm
const publish = async (dir: string, name: string, ver: string) => {
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(dir)
  const result = await $`npm view ${name}@${ver} version`.nothrow()
  if (result.exitCode === 0) {
    console.log(`already published ${name}@${ver}`)
    return
  }
  await $`bun pm pack`.cwd(dir)
  await $`npm publish *.tgz --access public --tag ${Script.channel}`.cwd(dir)
}

// Publish each binary package (scoped names, e.g., @teamcode-ai/linux-x64)
for (const [scopedName, ver] of Object.entries(binaries).filter(([k]) => k.startsWith("@"))) {
  const dirName = Object.entries(binaries).find(([, v]) => v === ver && !k.startsWith("@"))?.[0]
  if (!dirName) continue
  await publish(`./dist/${dirName}`, scopedName, ver)
}

// Create and publish the meta-package teamcode-ai under @teamcode-ai scope
await $`mkdir -p ./dist/${pkg.name}`
await $`mkdir -p ./dist/${pkg.name}/bin`
await $`cp ./script/postinstall.mjs ./dist/${pkg.name}/postinstall.mjs`
await Bun.file(`./dist/${pkg.name}/LICENSE`).write(await Bun.file("../../LICENSE").text())

const scopedBinaries: Record<string, string> = {}
for (const [k, v] of Object.entries(binaries)) {
  if (k.startsWith("@")) scopedBinaries[k] = v
}

await Bun.file(`./dist/${pkg.name}/package.json`).write(
  JSON.stringify({
    name: `@teamcode-ai/${pkg.name}`,
    version,
    bin: { [pkg.name]: `./bin/${pkg.name}.exe` },
    scripts: { postinstall: "node ./postinstall.mjs" },
    license: pkg.license,
    os: ["darwin", "linux", "win32"],
    cpu: ["arm64", "x64"],
    optionalDependencies: scopedBinaries,
  }),
)
await $`cp ../../LICENSE ./dist/${pkg.name}/`.nothrow()
// Create stub .exe for postinstall instruction
await Bun.file(`./dist/${pkg.name}/bin/${pkg.name}.exe`).write(
  `echo "Error: ${pkg.name} postinstall failed" && exit 1`,
)
await publish(`./dist/${pkg.name}`, `@teamcode-ai/${pkg.name}`, version)

// Also upload archives to GitHub Release for direct download
const ghRepo = process.env.GH_REPO
if (ghRepo) {
  const upload = (pattern: string) => $`gh release upload "v${version}" ${pattern} --clobber --repo ${ghRepo}`.nothrow()
  for await (const file of new Bun.Glob("./dist/*.zip").scan()) await upload(file)
  for await (const file of new Bun.Glob("./dist/*.tar.gz").scan()) await upload(file)
}
