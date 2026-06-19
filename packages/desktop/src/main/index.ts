import { join } from "node:path"

import { app, BrowserWindow } from "electron"
import contextMenu from "electron-context-menu"

import type { InitStep } from "../preload/types"
import { CHANNEL } from "./constants"
import { initLogging } from "./logging"
import { createMenu } from "./menu"
import { registerIpcHandlers, sendMenuCommand } from "./ipc"
import { spawnServer, findAvailablePort, type ServerHandle } from "./server"
import { checkForUpdates } from "./updater"
import { createMainWindow, setDockIcon, registerRendererProtocol } from "./windows"

const APP_NAMES: Record<string, string> = {
  dev: "TeamCode Dev",
  beta: "TeamCode Beta",
  prod: "TeamCode",
}
const APP_IDS: Record<string, string> = {
  dev: "ai.teamcode.desktop.dev",
  beta: "ai.teamcode.desktop.beta",
  prod: "ai.teamcode.desktop",
}

let logger: ReturnType<typeof initLogging>
let mainWindow: BrowserWindow | null = null
let server: ServerHandle | null = null

async function killSidecar() {
  if (!server) return
  const current = server
  server = null
  await current.stop()
}

async function main() {
  contextMenu({ showSaveImageAs: true, showLookUpSelection: false, showSearchWithGoogle: false })

  try {
    process.chdir(app.getPath("home"))
  } catch {}

  const appId = app.isPackaged ? APP_IDS[CHANNEL] : "ai.teamcode.desktop.dev"
  app.setName(app.isPackaged ? APP_NAMES[CHANNEL] : "TeamCode Dev")
  app.setAppUserModelId(appId)
  app.setPath("userData", join(app.getPath("appData"), appId))

  logger = initLogging()

  logger.log("app starting", {
    version: app.getVersion(),
    packaged: app.isPackaged,
  })

  app.commandLine.appendSwitch("proxy-bypass-list", "<-loopback>")
  if (!app.isPackaged) app.commandLine.appendSwitch("remote-debugging-port", "9222")

  if (!app.requestSingleInstanceLock()) {
    app.quit()
    return
  }

  app.on("second-instance", () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
    }
  })

  app.on("activate", () => {
    if (process.platform === "darwin" && BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  app.on("before-quit", () => {
    void killSidecar()
  })

  app.on("will-quit", () => {
    if (!server) return
    const current = server
    server = null
    current.kill()
  })

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void killSidecar().finally(() => app.exit(0))
    })
  }

  registerIpcHandlers({
    killSidecar: () => killSidecar(),
    getServerPort: () => server?.port ?? 0,
  })

  await app.whenReady()

  registerRendererProtocol()
  setDockIcon()

  // ── Spawn Go core server ──────────────────────────

  const port = await findAvailablePort()

  logger.log("spawning go-core server", { port })

  try {
    server = await spawnServer(port, {
      onStdout: (message) => logger.log("go-core stdout", { message }),
      onStderr: (message) => logger.warn("go-core stderr", { message }),
      onExit: (code) => logger.warn("go-core exited", { code }),
    })
    logger.log("go-core server ready", { port: server.port })
  } catch (error) {
    logger.error("failed to start go-core server", error)
  }

  // ── Create window ─────────────────────────────────

  createWindow()
}

function createWindow() {
  mainWindow = createMainWindow()
  if (mainWindow) {
    createMenu({
      trigger: (id) => mainWindow && sendMenuCommand(mainWindow, id),
      checkForUpdates: () => {
        void checkForUpdates(true, killSidecar)
      },
      reload: () => mainWindow?.reload(),
      relaunch: () => {
        void killSidecar().finally(() => {
          app.relaunch()
          app.exit(0)
        })
      },
    })
  }
}

main().catch((error) => {
  console.error("Fatal error in main:", error)
  app.exit(1)
})
