/**
 * Test the parity test harness itself.
 */
import { expect, test } from "bun:test"
import { describeParity, getGoCoreAvailable } from "./harness"
import { GoCoreClient } from "@teamcode-ai/core/router"

describeParity("harness integration", () => {
  test("go core is available when binary is present", () => {
    console.log(`[harness test] goCoreAvailable: ${getGoCoreAvailable()}`)
  })

  test("health endpoint works when available", async () => {
    if (!getGoCoreAvailable()) return
    const health = await GoCoreClient.health()
    expect(health).toBeDefined()
    expect(health.status).toBe("ok")
  })

  test("session CRUD works when available", async () => {
    if (!getGoCoreAvailable()) return
    const sess = await GoCoreClient.session.create(
      "ses_harn_test",
      "Harness Test",
      "/tmp/harness",
      "test",
      "gpt-4",
    )
    expect(sess.id).toBe("ses_harn_test")
    expect(sess.title).toBe("Harness Test")

    const got = await GoCoreClient.session.get("ses_harn_test")
    expect(got.title).toBe("Harness Test")

    await GoCoreClient.session.delete("ses_harn_test")
  })
})
