import { app } from "electron"

type Channel = "dev" | "beta" | "prod"
const raw = import.meta.env.TEAMCODE_CHANNEL
export const CHANNEL: Channel = raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const SETTINGS_STORE = "teamcode.settings"
export const UPDATER_ENABLED = app.isPackaged && CHANNEL !== "dev"
export const GO_CORE_PORT_ENV = "GO_CORE_PORT"
export const GO_CORE_DEFAULT_PORT = "43001"
