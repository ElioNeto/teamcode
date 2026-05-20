---
name: desktop-app
description: Work with the Electron-based desktop application. Use when modifying the desktop renderer, main process, IPC, or Electron-specific features.
---

# Desktop App

The desktop app is built with **Electron**, **SolidJS**, and **Vite**.

## Architecture

```
packages/desktop/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Entry point, window creation
│   │   └── server.ts   # Backend server management
│   └── renderer/       # SolidJS renderer (UI)
│       └── index.tsx   # Renderer entry point
```

### Main Process (`packages/desktop/src/main/`)

- Creates BrowserWindow instances
- Manages IPC handlers
- Starts/stops the backend server
- Handles native OS integration (notifications, menus, tray)

### Renderer (`packages/desktop/src/renderer/`)

- SolidJS application
- Communicates with main process via IPC
- Uses the same app components from `packages/app/`

## Development

```bash
bun run dev:desktop
```

## Key Patterns

- **IPC communication**: Use `contextBridge` in preload, `ipcRenderer`/`ipcMain` for communication
- **Window management**: Single window per instance
- **Server**: The desktop app starts an embedded HTTP server for the backend
- **Auto-update**: Uses `electron-updater`
