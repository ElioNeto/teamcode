/**
 * Router barrel export.
 * Use: import { flag, listFlags } from "@teamcode-ai/core/router"
 *      import { GoCoreClient } from "@teamcode-ai/core/router"
 */
export { flag, listFlags } from "./flag"
export type { Flag } from "./flag"
export { GoCoreClient } from "./client"
export type { GoCoreReadResult, GoCoreStatResult, GoCoreDirEntry, GoCoreGlobResponse, GoCoreFindUpResponse } from "./client"
