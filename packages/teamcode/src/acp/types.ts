import type { McpServer } from "@agentclientprotocol/sdk"
import type { OpencodeClient } from "@teamcode-ai/sdk/v2"
import type { ProviderID, ModelID } from "../provider/schema"

export interface ACPSessionState {
  id: string
  cwd: string
  mcpServers: McpServer[]
  createdAt: Date
  /** The currently active model (restored from the last user message). */
  model?: {
    providerID: ProviderID
    modelID: ModelID
  }
  variant?: string
  /** The currently active agent/mode. */
  modeId?: string
  /**
   * Per-agent model overrides extracted from all user messages in the session.
   * Built during restore so that switching to a previously-used agent
   * recalls the model they were last used with.
   */
  agentModels?: Record<string, { providerID: ProviderID; modelID: ModelID; variant?: string }>
}

export interface ACPConfig {
  sdk: OpencodeClient
  defaultModel?: {
    providerID: ProviderID
    modelID: ModelID
  }
}
