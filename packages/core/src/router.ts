/**
 * Router module — feature flags and Go core client.
 *
 * This file is the entry point for `@teamcode-ai/core/router`.
 * See src/router/ for the actual implementation files.
 */
export { flag, listFlags } from "./router/flag"
export type { Flag } from "./router/flag"
export { GoCoreClient } from "./router/client"
export type { GoCoreReadResult, GoCoreStatResult, GoCoreDirEntry, GoCoreGlobResponse, GoCoreFindUpResponse } from "./router/client"
