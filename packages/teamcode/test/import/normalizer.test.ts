import { describe, expect, test } from "bun:test"
import { Import } from "@/import/import"
import { ImportStorage } from "@/import/storage"
import { Origin } from "@/import/origin"
import { ModelID, ProviderID } from "@/provider/schema"
import { CLAUDE_APPENDED, CLAUDE_FILE, CODEX_FILE, PROJECT } from "./fixture"

const claude = async (file = CLAUDE_FILE) =>
  Import.normalize({ origin: "claude" }, await Bun.file(file).text(), { key: "k", projectID: PROJECT })
const codex = async () =>
  Import.normalize({ origin: "codex" }, await Bun.file(CODEX_FILE).text(), { key: "k", projectID: PROJECT })

describe("import.normalizer.claude-code", () => {
  test("produces a session that decodes through the TeamCode schemas", async () => {
    const out = await claude()
    expect(() => ImportStorage.validate(out)).not.toThrow()
    expect(out.session.id).toStartWith("ses_")
    expect(out.session.title).toBe("List the files in the repo and tell me what the project does.")
    expect(out.session.directory).toBe("/home/dev/acme")
    expect(out.session.version).toBe("claude-code@2.1.278")
    expect(Origin.of(out.session)).toBe("claude")
    expect(out.session.agent).toBe("claude-code")
    expect(out.session.model).toEqual({ id: ModelID.make("claude-fable-5-1"), providerID: ProviderID.anthropic })
    expect(out.session.time.created).toBe(Date.parse("2026-09-22T13:19:53.365Z"))
    expect(out.session.time.updated).toBe(Date.parse("2026-09-22T13:20:03.175Z"))
    expect(out.warnings).toEqual(["line 10: invalid JSON"])
  })

  test("groups assistant blocks by message id and folds tool results into tool parts", async () => {
    const out = await claude()
    expect(out.messages.map((m) => m.info.role)).toEqual(["user", "assistant", "assistant"])
    const [user, first, second] = out.messages
    expect(user!.parts.map((p) => p.type)).toEqual(["text"])
    expect(user!.info.role === "user" ? user!.info.model.modelID : undefined).toBe(ModelID.make("claude-fable-5-1"))

    expect(first!.parts.map((p) => p.type)).toEqual(["step-start", "reasoning", "tool", "tool", "step-finish"])
    const [, reasoning, ok, failed, finish] = first!.parts
    expect(reasoning!.type === "reasoning" && reasoning!.text).toBe("I should look at the directory first.")
    expect(ok!.type === "tool" && ok!.tool).toBe("Bash")
    expect(ok!.type === "tool" && ok!.state.status === "completed" && ok!.state.output).toBe(
      "README.md\nsrc\npackage.json",
    )
    expect(ok!.type === "tool" && ok!.state.status === "completed" && ok!.state.metadata).toEqual({
      stdout: "README.md\nsrc\npackage.json",
      stderr: "",
      interrupted: false,
      isImage: false,
    })
    expect(failed!.type === "tool" && failed!.state.status).toBe("error")
    expect(failed!.type === "tool" && failed!.state.status === "error" && failed!.state.error).toContain(
      "File does not exist",
    )
    expect(finish!.type === "step-finish" && finish!.tokens).toEqual({
      input: 2,
      output: 90,
      reasoning: 30,
      cache: { read: 4000, write: 3000 },
    })
    expect(finish!.type === "step-finish" && finish!.reason).toBe("tool_use")

    expect(first!.info.role === "assistant" ? first!.info.parentID : undefined).toBe(user!.info.id)
    expect(first!.info.role === "assistant" && first!.info.time.completed).toBe(Date.parse("2026-09-22T13:20:00.900Z"))
    expect(second!.parts.map((p) => p.type)).toEqual(["step-start", "text", "step-finish"])
    expect(second!.info.role === "assistant" && second!.info.finish).toBe("end_turn")
  })

  test("sums usage per assistant message, not per line", async () => {
    const out = await claude()
    expect(out.session.tokens).toEqual({ input: 7, output: 130, reasoning: 30, cache: { read: 11000, write: 3100 } })
  })

  test("orders messages and parts by id chronologically", async () => {
    const out = await claude(CLAUDE_APPENDED)
    const ids = out.messages.map((m) => m.info.id)
    expect(ids).toEqual(ids.toSorted())
    for (const message of out.messages) {
      const partIDs = message.parts.map((p) => p.id)
      expect(partIDs).toEqual(partIDs.toSorted())
      expect(message.parts[0]!.type).toBe(message.info.role === "assistant" ? "step-start" : message.parts[0]!.type)
    }
    const times = out.messages.map((m) => m.info.time.created)
    expect(times).toEqual(times.toSorted((a, b) => a - b))
  })

  test("ids are stable across runs and a longer transcript keeps the earlier ids", async () => {
    const short = await claude()
    const long = await claude(CLAUDE_APPENDED)
    expect(long.session.id).toBe(short.session.id)
    expect(long.messages.slice(0, 3).map((m) => m.info.id)).toEqual(short.messages.map((m) => m.info.id))
    expect(long.messages).toHaveLength(5)
    expect(long.session.time.updated).toBe(Date.parse("2026-09-22T13:25:02.000Z"))
  })

  test("synthesizes a user message when the transcript starts mid-turn", () => {
    const out = Import.normalize(
      { origin: "claude" },
      JSON.stringify({
        type: "assistant",
        uuid: "a",
        timestamp: "2026-01-01T00:00:01Z",
        message: { id: "m", model: "x", role: "assistant", content: [{ type: "text", text: "hello" }] },
      }),
      { key: "k", projectID: PROJECT },
    )
    expect(out.messages.map((m) => m.info.role)).toEqual(["user", "assistant"])
    expect(out.messages[0]!.info.time.created).toBeLessThan(out.messages[1]!.info.time.created)
    expect(() => ImportStorage.validate(out)).not.toThrow()
  })

  test("reports unmatched tool results without failing", () => {
    const out = Import.normalize(
      { origin: "claude" },
      JSON.stringify({
        type: "user",
        uuid: "u",
        timestamp: "2026-01-01T00:00:01Z",
        message: { role: "user", content: [{ type: "tool_result", tool_use_id: "ghost", content: "x" }] },
      }),
      { key: "k", projectID: PROJECT },
    )
    expect(out.messages).toHaveLength(0)
    expect(out.warnings).toEqual(["line 1: tool_result ghost without matching tool_use"])
  })
})

describe("import.normalizer.codex", () => {
  test("maps a rollout to one user and one assistant turn", async () => {
    const out = await codex()
    expect(() => ImportStorage.validate(out)).not.toThrow()
    expect(Origin.of(out.session)).toBe("codex")
    expect(out.session.version).toBe("codex@0.42.0")
    expect(out.session.title).toBe("Fix the failing test in src/math.ts")
    expect(out.session.directory).toBe("/home/dev/acme")
    expect(out.session.model).toEqual({ id: ModelID.make("gpt-5-codex"), providerID: ProviderID.openai })
    expect(out.messages.map((m) => m.info.role)).toEqual(["user", "assistant"])
    const assistant = out.messages[1]!
    expect(assistant.parts.map((p) => p.type)).toEqual([
      "step-start",
      "reasoning",
      "tool",
      "tool",
      "text",
      "step-finish",
    ])
    const [, , shell, patch] = assistant.parts
    expect(shell!.type === "tool" && shell!.tool).toBe("shell")
    expect(shell!.type === "tool" && shell!.state.status).toBe("error")
    expect(patch!.type === "tool" && patch!.state.status === "completed" && patch!.state.output).toContain(
      "M src/math.ts",
    )
    expect(out.session.tokens).toEqual({ input: 1200, output: 150, reasoning: 60, cache: { read: 800, write: 0 } })
    expect(assistant.info.role === "assistant" ? assistant.info.finish : undefined).toBe("stop")
  })
})
