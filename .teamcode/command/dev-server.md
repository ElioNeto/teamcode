---
description: "Start development servers for the project"
---

Start the development server for the specified target.

## Options

- `tui` — Start the TUI (default):
  ```bash
  bun run dev
  ```
  This runs from `packages/teamcode` and opens the interactive terminal UI.

- `desktop` — Start the desktop app:
  ```bash
  bun run dev:desktop
  ```
  This runs from `packages/desktop` and opens the Electron app.

- `web` — Start the web app:
  ```bash
  bun run dev:web
  ```
  This runs from `packages/app` and starts the Vite dev server.

- `console` — Start the console/management UI:
  ```bash
  bun run dev:console
  ```
  This runs from `packages/console/app`.

$ARGUMENTS

If no target is specified, defaults to TUI.
