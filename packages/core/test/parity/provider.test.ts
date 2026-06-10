/**
 * Parity tests: Provider & Model Catalog — Go Core.
 *
 * Tests that the Go core provider catalog endpoints behave correctly:
 * list providers and get models for a provider.
 */
import { expect, test } from "bun:test"
import { describeParity, getGoCoreAvailable } from "./harness"
import { GoCoreClient } from "@teamcode-ai/core/router"

describeParity("provider catalog", () => {
  test("go core is available", () => {
    expect(getGoCoreAvailable()).toBe(true)
  })

  test("list providers returns expected providers", async () => {
    if (!getGoCoreAvailable()) return

    const result = await GoCoreClient.providers.list()
    expect(result).toHaveProperty("providers")
    expect(result).toHaveProperty("count")
    expect(result.count).toBeGreaterThan(0)
    expect(Array.isArray(result.providers)).toBe(true)

    const ids = result.providers.map((p: { id: string }) => p.id)
    expect(ids).toContain("openai")
    expect(ids).toContain("anthropic")
    expect(ids).toContain("google")

    // Providers in list should NOT include models
    for (const p of result.providers) {
      expect(p).toHaveProperty("id")
      expect(p).toHaveProperty("name")
      expect(p).toHaveProperty("model_count")
      expect(p.model_count).toBeGreaterThan(0)
      // models should be omitted in list
      expect(p.models).toBeUndefined()
    }
  })

  test("get models for openai", async () => {
    if (!getGoCoreAvailable()) return

    const result = await GoCoreClient.providers.models("openai")
    expect(result.provider).toBe("openai")
    expect(result.count).toBeGreaterThan(0)
    expect(Array.isArray(result.models)).toBe(true)

    const model = result.models[0]
    expect(model).toHaveProperty("id")
    expect(model).toHaveProperty("name")
    expect(model).toHaveProperty("provider")
    expect(model.provider).toBe("openai")
    expect(model).toHaveProperty("context_length")
    expect(model.context_length).toBeGreaterThan(0)
  })

  test("get models for anthropic", async () => {
    if (!getGoCoreAvailable()) return

    const result = await GoCoreClient.providers.models("anthropic")
    expect(result.provider).toBe("anthropic")
    expect(result.count).toBeGreaterThan(0)

    // Should have Claude models
    const ids = result.models.map((m: { id: string }) => m.id)
    expect(ids.some((id: string) => id.includes("claude"))).toBe(true)
  })

  test("get models for non-existent provider returns 404", async () => {
    if (!getGoCoreAvailable()) return

    try {
      await GoCoreClient.providers.models("nonexistent-provider")
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeDefined()
    }
  })
})
