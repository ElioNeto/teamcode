import { describe, expect, test } from "bun:test"
import { EventEmitter } from "node:events"
import { childEnv, installExitHook } from "../../src/router/go-core"

describe("router.go-core.childEnv", () => {
  test("passes port and parent pid to the child", () => {
    const env = childEnv({ PATH: "/bin" }, "43005", 4321)
    expect(env).toEqual({ PATH: "/bin", GO_CORE_PORT: "43005", GO_CORE_PARENT_PID: "4321" })
  })
})

describe("router.go-core.installExitHook", () => {
  test("stops the child when the host process exits", () => {
    const host = new EventEmitter()
    let stopped = 0
    installExitHook(host, () => stopped++)
    host.emit("exit")
    expect(stopped).toBe(1)
  })

  test("registers a single hook per host even when called repeatedly", () => {
    const host = new EventEmitter()
    let stopped = 0
    installExitHook(host, () => stopped++)
    installExitHook(host, () => stopped++)
    expect(host.listenerCount("exit")).toBe(1)
    host.emit("exit")
    expect(stopped).toBe(1)
  })
})
