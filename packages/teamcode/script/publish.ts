#!/usr/bin/env bun
import { $ } from "bun"
import pkg from "../package.json"
import { Script } from "@teamcode-ai/script"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("..", import.meta.url))
process.chdir(dir)

const binaries: Record<string, string> = {}
for (const filepath of new Bun.Glob("*/package.json").scanSync({ cwd: "./dist" })) {
  const pkg = await Bun.file(`./dist/${filepath}`).json()
  binaries[pkg.name] = pkg.version
}
console.log("binaries", binaries)
const version = Object.values(binaries)[0]

const publish = async (dir: string, name: string, ver: string) => {
  if (process.platform !== "win32") await $`chmod -R 755 .`.cwd(dir)
  const result = await $`npm view ${name}@${ver} version`.nothrow()
  if (result.exitCode === 0) {
    console.log(`already published ${name}@${ver}`)
    return
  }
  const absDir = `${process.cwd()}/${dir}`
  // npm pack creates the tgz in the package dir
  await $`cd ${absDir} && npm pack 2>/dev/null`
  const tgzName = `${name.replace("@", "").replace("/", "-")}-${ver}.tgz`
  await $`npm publish ${absDir}/${tgzName} --access public --tag ${Script.channel}`.cwd(absDir)
}

// Publish each binary package (scoped names, e.g., @teamcode-ai/linux-x64)
for (const [scopedName, ver] of Object.entries(binaries).filter(([k]) => k.startsWith("@"))) {
  // Derive directory name from scoped name: @teamcode-ai/linux-x64 -> teamcode-linux-x64
  const suffix = scopedName.replace("@teamcode-ai/", "")
  const dirName = `${pkg.name}-${suffix}`
  const dirExists = await Bun.file(`./dist/${dirName}/package.json`).exists()
  if (!dirExists) {
    console.log(`skip ${scopedName} — directory ${dirName} not found`)
    continue
  }
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
