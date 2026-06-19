import { contextBridge, ipcRenderer } from "electron"
import type { TeamCoreAPI } from "./types"

const api: TeamCoreAPI = {
  // ── Store ──────────────────────────────────────────
  storeGet: (name, key) => ipcRenderer.invoke("store-get", name, key),
  storeSet: (name, key, value) => ipcRenderer.invoke("store-set", name, key, value),
  storeDelete: (name, key) => ipcRenderer.invoke("store-delete", name, key),
  storeClear: (name) => ipcRenderer.invoke("store-clear", name),
  storeKeys: (name) => ipcRenderer.invoke("store-keys", name),
  storeLength: (name) => ipcRenderer.invoke("store-length", name),

  // ── Dialogs ────────────────────────────────────────
  openDirectoryPicker: (opts) => ipcRenderer.invoke("open-directory-picker", opts),
  openFilePicker: (opts) => ipcRenderer.invoke("open-file-picker", opts),
  saveFilePicker: (opts) => ipcRenderer.invoke("save-file-picker", opts),

  // ── Links & Paths ──────────────────────────────────
  openLink: (url) => ipcRenderer.send("open-link", url),
  openPath: (path) => ipcRenderer.invoke("open-path", path),

  // ── Clipboard ──────────────────────────────────────
  readClipboardImage: () => ipcRenderer.invoke("read-clipboard-image"),

  // ── Notifications ──────────────────────────────────
  showNotification: (title, body) => ipcRenderer.send("show-notification", title, body),

  // ── Window ─────────────────────────────────────────
  getWindowCount: () => ipcRenderer.invoke("get-window-count"),
  getWindowFocused: () => ipcRenderer.invoke("get-window-focused"),
  setWindowFocus: () => ipcRenderer.invoke("set-window-focus"),
  showWindow: () => ipcRenderer.invoke("show-window"),
  getZoomFactor: () => ipcRenderer.invoke("get-zoom-factor"),
  setZoomFactor: (factor) => ipcRenderer.invoke("set-zoom-factor", factor),
  setTitlebar: (theme) => ipcRenderer.invoke("set-titlebar", theme),
  setBackgroundColor: (color) => ipcRenderer.invoke("set-background-color", color),

  // ── App ────────────────────────────────────────────
  relaunch: () => ipcRenderer.send("relaunch"),
  onMenuCommand: (cb) => {
    const handler = (_: unknown, id: string) => cb(id)
    ipcRenderer.on("menu-command", handler)
    return () => ipcRenderer.removeListener("menu-command", handler)
  },

  // ── Server ─────────────────────────────────────────
  killSidecar: () => ipcRenderer.invoke("kill-sidecar"),
  getServerPort: () => ipcRenderer.invoke("get-server-port"),

  // ── Updater ────────────────────────────────────────
  runUpdater: (alertOnFail) => ipcRenderer.invoke("run-updater", alertOnFail),
  checkUpdate: () => ipcRenderer.invoke("check-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
}

contextBridge.exposeInMainWorld("api", api)
