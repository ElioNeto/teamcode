import { afterEach, describe, expect, test } from "bun:test"
import { Option, Redacted } from "effect"
import { ServerAuth } from "../../src/server/auth"

const original = {
  envPassword: process.env.TEAMCODE_SERVER_PASSWORD,
  envUsername: process.env.TEAMCODE_SERVER_USERNAME,
}

function setEnv(password: string | undefined, username: string | undefined) {
  if (password === undefined) delete process.env.TEAMCODE_SERVER_PASSWORD
  else process.env.TEAMCODE_SERVER_PASSWORD = password
  if (username === undefined) delete process.env.TEAMCODE_SERVER_USERNAME
  else process.env.TEAMCODE_SERVER_USERNAME = username
}

afterEach(() => {
  if (original.envPassword === undefined) delete process.env.TEAMCODE_SERVER_PASSWORD
  else process.env.TEAMCODE_SERVER_PASSWORD = original.envPassword
  if (original.envUsername === undefined) delete process.env.TEAMCODE_SERVER_USERNAME
  else process.env.TEAMCODE_SERVER_USERNAME = original.envUsername
})

describe("ServerAuth", () => {
  test("does not emit auth headers without a password", () => {
    setEnv(undefined, "alice")

    expect(ServerAuth.header()).toBeUndefined()
    expect(ServerAuth.headers()).toBeUndefined()
  })

  test("defaults to the teamcode username", () => {
    setEnv("secret", undefined)

    expect(ServerAuth.headers()).toEqual({
      Authorization: `Basic ${Buffer.from("teamcode:secret").toString("base64")}`,
    })
  })

  test("uses the configured username", () => {
    setEnv("secret", "alice")

    expect(ServerAuth.headers()).toEqual({
      Authorization: `Basic ${Buffer.from("alice:secret").toString("base64")}`,
    })
  })

  test("prefers explicit credentials", () => {
    setEnv("secret", "alice")

    expect(ServerAuth.headers({ password: "cli-secret", username: "bob" })).toEqual({
      Authorization: `Basic ${Buffer.from("bob:cli-secret").toString("base64")}`,
    })
  })

  test("validates decoded credentials against effect config", () => {
    const config = { password: Option.some("secret"), username: "alice" }

    expect(ServerAuth.required(config)).toBe(true)
    expect(ServerAuth.authorized({ username: "alice", password: Redacted.make("secret") }, config)).toBe(true)
    expect(ServerAuth.authorized({ username: "opencode", password: Redacted.make("secret") }, config)).toBe(false)
  })
})
