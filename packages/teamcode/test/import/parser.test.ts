import { describe, expect, test } from "bun:test"
import { ClaudeCode } from "@/import/parser/claude-code"
import { Codex } from "@/import/parser/codex"
import { CLAUDE_FILE, CLAUDE_SESSION, CODEX_FILE, CODEX_SESSION } from "./fixture"

describe("import.parser.claude-code", () => {
  test("keeps conversation lines, skips telemetry and reports bad lines", async () => {
    const raw = ClaudeCode.parse(await Bun.file(CLAUDE_FILE).text())
    expect(raw.sessionId).toBe(CLAUDE_SESSION)
    expect(raw.lines.map((l) => l.uuid)).toEqual(["u1", "a1", "a2", "a3", "u2", "u3", "a4"])
    expect(raw.skipped).toEqual({ "queue-operation": 1, attachment: 1, "last-prompt": 1 })
    expect(raw.warnings).toEqual(["line 10: invalid JSON"])
  })

  test("types content blocks and usage", async () => {
    const raw = ClaudeCode.parse(await Bun.file(CLAUDE_FILE).text())
    const prompt = raw.lines[0]!
    expect(ClaudeCode.isPrompt(prompt)).toBe(true)
    expect(prompt.message.content).toEqual([
      { type: "text", text: "List the files in the repo and tell me what the project does." },
    ])
    const thinking = raw.lines[1]!
    expect(thinking.message.id).toBe("msg_01AAA")
    expect(thinking.message.model).toBe("claude-fable-5-1")
    expect(thinking.message.usage).toEqual({ input: 2, output: 90, reasoning: 30, cacheRead: 4000, cacheWrite: 3000 })
    expect(thinking.message.content[0]).toEqual({
      type: "thinking",
      thinking: "I should look at the directory first.",
      signature: "sig1",
    })
    const toolUse = raw.lines[2]!.message.content[0]
    expect(toolUse).toEqual({
      type: "tool_use",
      id: "toolu_01",
      name: "Bash",
      input: { command: "ls", description: "List files" },
    })
    const result = raw.lines[5]!
    expect(ClaudeCode.isPrompt(result)).toBe(false)
    expect(result.message.content[0]).toEqual({
      type: "tool_result",
      toolUseID: "toolu_02",
      content: [{ type: "text", text: "<tool_use_error>File does not exist.</tool_use_error>" }],
      isError: true,
    })
  })

  test("reads summary lines and tolerates unknown blocks", () => {
    const raw = ClaudeCode.parse(
      [
        JSON.stringify({ type: "summary", summary: "Repo tour", leafUuid: "x" }),
        JSON.stringify({
          type: "assistant",
          uuid: "a",
          timestamp: "2026-01-01T00:00:00Z",
          message: {
            role: "assistant",
            content: [
              { type: "mystery", foo: 1 },
              { type: "redacted_thinking", data: "x" },
            ],
          },
        }),
        JSON.stringify({ type: "user", timestamp: "2026-01-01T00:00:00Z" }),
      ].join("\n"),
    )
    expect(raw.summary).toBe("Repo tour")
    expect(raw.lines[0]!.message.content).toEqual([
      { type: "unknown", raw: JSON.stringify({ type: "mystery", foo: 1 }) },
      { type: "redacted_thinking" },
    ])
    expect(raw.warnings).toEqual(["line 3: user line without message, uuid or timestamp"])
  })
})

describe("import.parser.codex", () => {
  test("reads meta, turn context, response items and token counts", async () => {
    const raw = Codex.parse(await Bun.file(CODEX_FILE).text())
    expect(raw.id).toBe(CODEX_SESSION)
    expect(raw.cwd).toBe("/home/dev/acme")
    expect(raw.cliVersion).toBe("0.42.0")
    expect(raw.branch).toBe("main")
    expect(raw.items.map((i) => i.kind)).toEqual([
      "model",
      "message",
      "reasoning",
      "tool_call",
      "tool_output",
      "tool_call",
      "tool_output",
      "message",
      "tokens",
    ])
    const call = raw.items[3]!
    expect(call.kind === "tool_call" && call.input).toEqual({ command: ["bash", "-lc", "bun test src/math.test.ts"] })
    const output = raw.items[4]!
    expect(output.kind === "tool_output" && output.isError).toBe(true)
    expect(output.kind === "tool_output" && output.output).toBe("1 fail\nexpected 4 got 5")
    expect(raw.skipped).toEqual({ "response_item.message": 1, event_msg: 2 })
  })

  test("accepts the legacy layout without envelopes", () => {
    const raw = Codex.parse(
      [
        JSON.stringify({
          id: "legacy-1",
          timestamp: "2026-01-01T00:00:00Z",
          instructions: null,
          git: { branch: "dev" },
        }),
        JSON.stringify({ type: "message", role: "user", content: [{ type: "input_text", text: "hi" }] }),
        JSON.stringify({ type: "message", role: "assistant", content: [{ type: "output_text", text: "hello" }] }),
      ].join("\n"),
    )
    expect(raw.id).toBe("legacy-1")
    expect(raw.branch).toBe("dev")
    expect(raw.items.map((i) => i.kind)).toEqual(["message", "message"])
    expect(raw.items[0]!.timestamp).toBeUndefined()
  })
})
