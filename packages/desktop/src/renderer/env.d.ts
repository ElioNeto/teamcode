import type { TeamCoreAPI } from "../preload/types"

declare global {
  interface Window {
    api: TeamCoreAPI
  }
}
