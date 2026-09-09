export namespace LLMHeaders {
  export type Input = {
    providerID: string
    sessionID: string
    requestID: string
    client: string
    version: string
    projectID?: string
    parentSessionID?: string
  }

  const ZEN_PROVIDER_PREFIX = "opencode"

  export function isZenProvider(providerID: string) {
    return providerID.startsWith(ZEN_PROVIDER_PREFIX)
  }

  export function build(input: Input): Record<string, string> {
    const headers: Record<string, string> = isZenProvider(input.providerID)
      ? {
          "x-opencode-session": input.sessionID,
          "x-opencode-request": input.requestID,
          "x-opencode-client": input.client,
          "User-Agent": `opencode/${input.version}`,
        }
      : {
          "x-session-affinity": input.sessionID,
          "X-Session-Id": input.sessionID,
          "User-Agent": `teamcode/${input.version}`,
        }
    if (isZenProvider(input.providerID) && input.projectID) headers["x-opencode-project"] = input.projectID
    if (input.parentSessionID) headers["x-parent-session-id"] = input.parentSessionID
    return headers
  }
}
