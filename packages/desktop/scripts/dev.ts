import { $ } from "bun"

// electron-vite dev does not accept positional arguments (like project directory).
// Strip them out so only electron-vite flags (e.g. --clearScreen, --force) are passed.
const electronViteFlags = process.argv.slice(2).filter((arg) => arg.startsWith("-"))

await $`electron-vite dev ${electronViteFlags}`
