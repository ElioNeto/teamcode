---
description: "Build a specific package in the monorepo"
---

Build a specific package in the monorepo.

## Usage

Pass the package name as the argument (e.g., `teamcode`, `core`, `desktop`, `app`, `sdk`).

$ARGUMENTS

Available packages:
- `teamcode` — Main CLI/TUI package
- `core` — Core library
- `desktop` — Desktop Electron app
- `app` — Web app
- `sdk/js` — JavaScript SDK
- `server` — HTTP server
- `ui` — UI components
- `plugin` — Plugin system

For typecheck:
```bash
bun run typecheck
```

For building the SDK specifically:
```bash
bun run packages/sdk/js/script/build.ts
```
