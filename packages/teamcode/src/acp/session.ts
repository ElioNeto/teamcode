import { RequestError, type McpServer } from "@agentclientprotocol/sdk"
import type { ACPSessionState } from "./types"
import * as Log from "@teamcode-ai/core/util/log"
import type { OpencodeClient } from "@teamcode-ai/sdk/v2"
import { ModelID, ProviderID } from "../provider/schema"

const log = Log.create({ service: "acp-session-manager" })

export class ACPSessionManager {
  private sessions = new Map<string, ACPSessionState>()
  private sdk: OpencodeClient

  constructor(sdk: OpencodeClient) {
    this.sdk = sdk
  }

  tryGet(sessionId: string): ACPSessionState | undefined {
    return this.sessions.get(sessionId)
  }

  async create(cwd: string, mcpServers: McpServer[], model?: ACPSessionState["model"]): Promise<ACPSessionState> {
    const session = await this.sdk.session
      .create(
        {
          directory: cwd,
        },
        { throwOnError: true },
      )
      .then((x) => x.data!)

    const sessionId = session.id
    const resolvedModel = model

    const state: ACPSessionState = {
      id: sessionId,
      cwd,
      mcpServers,
      createdAt: new Date(),
      model: resolvedModel,
    }
    log.info("creating_session", { state })

    this.sessions.set(sessionId, state)
    return state
  }

  async load(
    sessionId: string,
    cwd: string,
    mcpServers: McpServer[],
    model?: ACPSessionState["model"],
  ): Promise<ACPSessionState> {
    const session = await this.sdk.session
      .get(
        {
          sessionID: sessionId,
          directory: cwd,
        },
        { throwOnError: true },
      )
      .then((x) => x.data!)

    const resolvedModel = session.model
      ? { providerID: ProviderID.make(session.model.providerID), modelID: ModelID.make(session.model.id) }
      : model

    const state: ACPSessionState = {
      id: sessionId,
      cwd,
      mcpServers,
      createdAt: new Date(session.time.created),
      model: resolvedModel,
    }
    log.info("loading_session", { state })

    this.sessions.set(sessionId, state)
    return state
  }

  get(sessionId: string): ACPSessionState {
    const session = this.sessions.get(sessionId)
    if (!session) {
      log.error("session not found", { sessionId })
      throw RequestError.invalidParams(JSON.stringify({ error: `Session not found: ${sessionId}` }))
    }
    return session
  }

  getModel(sessionId: string) {
    const session = this.get(sessionId)
    return session.model
  }

  setModel(sessionId: string, model: ACPSessionState["model"]) {
    const session = this.get(sessionId)
    session.model = model
    this.sessions.set(sessionId, session)
    return session
  }

  getVariant(sessionId: string) {
    const session = this.get(sessionId)
    return session.variant
  }

  setVariant(sessionId: string, variant?: string) {
    const session = this.get(sessionId)
    session.variant = variant
    this.sessions.set(sessionId, session)
    return session
  }

  setMode(sessionId: string, modeId: string) {
    const session = this.get(sessionId)
    session.modeId = modeId
    this.sessions.set(sessionId, session)
    return session
  }

  remove(sessionId: string): ACPSessionState | undefined {
    const session = this.sessions.get(sessionId)
    this.sessions.delete(sessionId)
    return session
  }

  /**
   * Register a session that was not created via create()/load() (e.g. a child
   * session created by the Task tool for a subagent). Uses the SDK to fetch
   * session metadata and registers it with the parent's config.
   */
  async autoRegister(sessionId: string, directory: string): Promise<ACPSessionState | undefined> {
    if (this.sessions.has(sessionId)) return this.sessions.get(sessionId)

    try {
      const session = await this.sdk.session
        .get({ sessionID: sessionId, directory }, { throwOnError: true })
        .then((x) => x.data)

      if (!session) return undefined

      const state: ACPSessionState = {
        id: sessionId,
        cwd: directory,
        mcpServers: [],
        createdAt: new Date(session.time.created),
        model: session.model
          ? { providerID: ProviderID.make(session.model.providerID), modelID: ModelID.make(session.model.id) }
          : undefined,
      }
      log.info("auto-registered child session", { sessionId, parentCwd: directory })
      this.sessions.set(sessionId, state)
      return state
    } catch (error) {
      log.warn("failed to auto-register session", { sessionId, error })
      return undefined
    }
  }
}
