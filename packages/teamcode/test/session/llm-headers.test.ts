import { describe, expect, test } from "bun:test"
import { LLMHeaders } from "../../src/session/llm-headers"

const base = {
  sessionID: "ses_123",
  requestID: "msg_456",
  client: "cli",
  version: "9.9.9",
}

describe("session.llm-headers", () => {
  test("opencode zen providers send x-opencode-* headers and opencode user agent", () => {
    const headers = LLMHeaders.build({ ...base, providerID: "opencode", projectID: "prj_1" })
    expect(headers).toEqual({
      "x-opencode-project": "prj_1",
      "x-opencode-session": "ses_123",
      "x-opencode-request": "msg_456",
      "x-opencode-client": "cli",
      "User-Agent": "opencode/9.9.9",
    })
  })

  test("opencode-go is treated as an opencode provider", () => {
    const headers = LLMHeaders.build({ ...base, providerID: "opencode-go", projectID: "prj_1" })
    expect(headers["x-opencode-session"]).toBe("ses_123")
    expect(headers["User-Agent"]).toBe("opencode/9.9.9")
  })

  test("opencode providers omit x-opencode-project when project id is missing", () => {
    const headers = LLMHeaders.build({ ...base, providerID: "opencode" })
    expect(headers).not.toHaveProperty("x-opencode-project")
    expect(headers["x-opencode-session"]).toBe("ses_123")
  })

  test("other providers send session affinity and teamcode user agent", () => {
    const headers = LLMHeaders.build({ ...base, providerID: "anthropic" })
    expect(headers).toEqual({
      "x-session-affinity": "ses_123",
      "X-Session-Id": "ses_123",
      "User-Agent": "teamcode/9.9.9",
    })
    expect(headers).not.toHaveProperty("x-opencode-session")
  })

  test("parent session id is forwarded for every provider", () => {
    const zen = LLMHeaders.build({ ...base, providerID: "opencode", parentSessionID: "ses_parent" })
    const other = LLMHeaders.build({ ...base, providerID: "anthropic", parentSessionID: "ses_parent" })
    expect(zen["x-parent-session-id"]).toBe("ses_parent")
    expect(other["x-parent-session-id"]).toBe("ses_parent")
  })
})
