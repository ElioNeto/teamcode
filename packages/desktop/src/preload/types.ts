export type InitStep =
  | { phase: "server_waiting" }
  | { phase: "done" }
  | { phase: "error"; message: string }

export type TitlebarTheme = {
  mode: "light" | "dark"
}

export type TeamCoreAPI = {
  // ── Store ──────────────────────────────────────────
  storeGet: (name: string, key: string) => Promise<string | null>
  storeSet: (name: string, key: string, value: string) => Promise<void>
  storeDelete: (name: string, key: string) => Promise<void>
  storeClear: (name: string) => Promise<void>
  storeKeys: (name: string) => Promise<string[]>
  storeLength: (name: string) => Promise<number>

  // ── Dialogs ────────────────────────────────────────
  openDirectoryPicker: (opts?: {
    multiple?: boolean
    title?: string
    defaultPath?: string
  }) => Promise<string | string[] | null>
  openFilePicker: (opts?: {
    multiple?: boolean
    title?: string
    defaultPath?: string
    extensions?: string[]
  }) => Promise<string | string[] | null>
  saveFilePicker: (opts?: { title?: string; defaultPath?: string }) => Promise<string | null>

  // ── Links & Paths ──────────────────────────────────
  openLink: (url: string) => void
  openPath: (path: string) => Promise<string>

  // ── Clipboard ──────────────────────────────────────
  readClipboardImage: () => Promise<{ buffer: ArrayBuffer; width: number; height: number } | null>

  // ── Notifications ──────────────────────────────────
  showNotification: (title: string, body?: string) => void

  // ── Window ─────────────────────────────────────────
  getWindowCount: () => Promise<number>
  getWindowFocused: () => Promise<boolean>
  setWindowFocus: () => Promise<void>
  showWindow: () => Promise<void>
  getZoomFactor: () => Promise<number>
  setZoomFactor: (factor: number) => Promise<void>
  setTitlebar: (theme: TitlebarTheme) => Promise<void>
  setBackgroundColor: (color: string) => Promise<void>

  // ── App ────────────────────────────────────────────
  relaunch: () => void
  onMenuCommand: (cb: (id: string) => void) => () => void

  // ── Server ─────────────────────────────────────────
  killSidecar: () => Promise<void>
  getServerPort: () => Promise<number>

  // ── Updater ────────────────────────────────────────
  runUpdater: (alertOnFail: boolean) => Promise<void>
  checkUpdate: () => Promise<{ updateAvailable: boolean; version?: string }>
  installUpdate: () => Promise<void>
}

declare global {
  interface Window {
    api: TeamCoreAPI
  }
}
