/**
 * Schema validation tests — verifies that Go core responses match
 * the expected TypeScript types defined in client.ts.
 *
 * This tests the contract mapping between TS and Go (issue #1039).
 */
import { expect, test } from "bun:test"
import { describeParity, getGoCoreAvailable } from "./harness"
import { GoCoreClient } from "@teamcode-ai/core/router"

describeParity("contract schema validation", () => {
  test("health response matches expected shape", async () => {
    if (!getGoCoreAvailable()) return
    const health = await GoCoreClient.health()

    expect(health).toHaveProperty("status")
    expect(typeof health.status).toBe("string")
    expect(health).toHaveProperty("version")
    expect(typeof health.version).toBe("string")
    expect(health).toHaveProperty("time")
    expect(typeof health.time).toBe("string")
  })

  test("metrics response matches expected shape", async () => {
    if (!getGoCoreAvailable()) return
    const metrics = await GoCoreClient.metrics()

    expect(metrics).toHaveProperty("request_count")
    expect(typeof metrics.request_count).toBe("number")
    expect(metrics).toHaveProperty("error_count")
    expect(typeof metrics.error_count).toBe("number")
    expect(metrics).toHaveProperty("error_rate")
    expect(typeof metrics.error_rate).toBe("number")
    expect(metrics).toHaveProperty("avg_latency_ms")
    expect(typeof metrics.avg_latency_ms).toBe("number")
  })

  test("session CRUD create response matches GoCoreSession shape", async () => {
    if (!getGoCoreAvailable()) return
    const sess = await GoCoreClient.session.create(
      "ses_schema_test",
      "Schema Test",
      "/tmp/schema",
      "test",
      "gpt-4",
    )

    expect(sess).toHaveProperty("id")
    expect(typeof sess.id).toBe("string")
    expect(sess).toHaveProperty("title")
    expect(typeof sess.title).toBe("string")
    expect(sess).toHaveProperty("directory")
    expect(typeof sess.directory).toBe("string")
    expect(sess).toHaveProperty("agent")
    expect(typeof sess.agent).toBe("string")
    expect(sess).toHaveProperty("model")
    expect(typeof sess.model).toBe("string")
    expect(sess).toHaveProperty("created_at")
    expect(typeof sess.created_at).toBe("string")
    expect(sess).toHaveProperty("updated_at")
    expect(typeof sess.updated_at).toBe("string")

    await GoCoreClient.session.delete("ses_schema_test")
  })

  test("session list response matches GoCoreSessionListResponse shape", async () => {
    if (!getGoCoreAvailable()) return
    await GoCoreClient.session.create("ses_schema_list", "List", "/tmp/list-schema", "test", "gpt-4")

    const list = await GoCoreClient.session.list("/tmp/list-schema")

    expect(list).toHaveProperty("count")
    expect(typeof list.count).toBe("number")
    expect(list).toHaveProperty("sessions")
    expect(Array.isArray(list.sessions)).toBe(true)

    if (list.sessions.length > 0) {
      const s = list.sessions[0]
      expect(s).toHaveProperty("id")
      expect(s).toHaveProperty("title")
      expect(s).toHaveProperty("directory")
      expect(s).toHaveProperty("agent")
      expect(s).toHaveProperty("model")
    }

    await GoCoreClient.session.delete("ses_schema_list")
  })

  test("session events status matches expected shape", async () => {
    if (!getGoCoreAvailable()) return
    const status = await GoCoreClient.session.status()

    expect(status).toHaveProperty("status")
    expect(typeof status.status).toBe("string")
    expect(status).toHaveProperty("sessions")
    expect(typeof status.sessions).toBe("number")
  })
})
