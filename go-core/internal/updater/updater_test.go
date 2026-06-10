package updater_test

import (
	"encoding/json"
	"testing"

	"github.com/ElioNeto/teamcode/go-core/internal/updater"
)

func event(t *testing.T, typeStr string, overrides map[string]any) updater.SessionEvent {
	t.Helper()
	base := map[string]any{
		"id":   "evt_001",
		"type": typeStr,
		"data": map[string]any{
			"timestamp": 1000000,
			"sessionID": "ses_001",
		},
	}
	for k, v := range overrides {
		switch k {
		case "data":
			if data, ok := v.(map[string]any); ok {
				d := base["data"].(map[string]any)
				for dk, dv := range data {
					d[dk] = dv
				}
			}
		default:
			base[k] = v
		}
	}
	b, err := json.Marshal(base)
	if err != nil {
		t.Fatal(err)
	}
	var ev updater.SessionEvent
	if err := json.Unmarshal(b, &ev); err != nil {
		t.Fatal(err)
	}
	return ev
}

func messagesJSON(t *testing.T, u *updater.Updater) string {
	t.Helper()
	b, _ := json.MarshalIndent(u.Messages(), "", "  ")
	return string(b)
}

func TestEmptyUpdater(t *testing.T) {
	u := updater.New()
	if len(u.Messages()) != 0 {
		t.Errorf("expected 0 messages, got %d", len(u.Messages()))
	}
}

func TestAgentSwitched(t *testing.T) {
	u := updater.New()
	u.ProcessEvent(event(t, "session.next.agent.switched", map[string]any{
		"data": map[string]any{"agent": "coder"},
	}))
	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d:\n%s", len(msgs), messagesJSON(t, u))
	}
	if msgs[0].Type != "agent-switched" {
		t.Errorf("expected agent-switched type, got %s", msgs[0].Type)
	}
	if msgs[0].Agent != "coder" {
		t.Errorf("expected agent coder, got %s", msgs[0].Agent)
	}
}

func TestModelSwitched(t *testing.T) {
	u := updater.New()
	u.ProcessEvent(event(t, "session.next.model.switched", map[string]any{
		"data": map[string]any{"model": "gpt-4"},
	}))
	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if msgs[0].Model != "gpt-4" {
		t.Errorf("expected model gpt-4, got %s", msgs[0].Model)
	}
}

func TestPrompted(t *testing.T) {
	u := updater.New()
	u.ProcessEvent(event(t, "session.next.prompted", map[string]any{
		"data": map[string]any{
			"prompt": map[string]any{
				"text": "hello",
			},
		},
	}))
	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if msgs[0].Type != "user" {
		t.Errorf("expected user type, got %s", msgs[0].Type)
	}
	if msgs[0].Text != "hello" {
		t.Errorf("expected text 'hello', got %s", msgs[0].Text)
	}
}

func TestSynthetic(t *testing.T) {
	u := updater.New()
	u.ProcessEvent(event(t, "session.next.synthetic", map[string]any{
		"data": map[string]any{
			"sessionID": "ses_001",
			"text":      "system message",
		},
	}))
	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if msgs[0].Type != "synthetic" {
		t.Errorf("expected synthetic type, got %s", msgs[0].Type)
	}
	if msgs[0].Text != "system message" {
		t.Errorf("expected text 'system message', got %s", msgs[0].Text)
	}
}

func TestShellStartEnd(t *testing.T) {
	u := updater.New()
	u.ProcessEvent(event(t, "session.next.shell.started", map[string]any{
		"data": map[string]any{
			"callID":  "call_001",
			"command": "ls -la",
		},
	}))
	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message after start, got %d", len(msgs))
	}
	if msgs[0].Type != "shell" {
		t.Errorf("expected shell type, got %s", msgs[0].Type)
	}
	if msgs[0].CallID != "call_001" {
		t.Errorf("expected callID call_001, got %s", msgs[0].CallID)
	}

	u.ProcessEvent(event(t, "session.next.shell.ended", map[string]any{
		"data": map[string]any{
			"callID":  "call_001",
			"output":  "file1.txt\nfile2.txt",
			"timestamp": 2000000,
		},
	}))
	msgs = u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message after end, got %d", len(msgs))
	}
	if msgs[0].Output != "file1.txt\nfile2.txt" {
		t.Errorf("expected output, got %s", msgs[0].Output)
	}
	if msgs[0].Time.Completed == nil {
		t.Error("expected completed timestamp to be set")
	}
}

func TestStepFullCycle(t *testing.T) {
	u := updater.New()

	// Start a step
	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{
			"agent": "coder",
			"model": "gpt-4",
		},
	}))
	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message after step.started, got %d", len(msgs))
	}
	if msgs[0].Type != "assistant" {
		t.Errorf("expected assistant type, got %s", msgs[0].Type)
	}

	// Send text delta events
	u.ProcessEvent(event(t, "session.next.text.started", nil))
	u.ProcessEvent(event(t, "session.next.text.delta", map[string]any{
		"data": map[string]any{"delta": "Hello "},
	}))
	u.ProcessEvent(event(t, "session.next.text.delta", map[string]any{
		"data": map[string]any{"delta": "World!"},
	}))
	u.ProcessEvent(event(t, "session.next.text.ended", map[string]any{
		"data": map[string]any{"text": "Hello World!"},
	}))

	// End the step
	u.ProcessEvent(event(t, "session.next.step.ended", map[string]any{
		"data": map[string]any{
			"finish": "stop",
			"cost":   0.002,
			"tokens": map[string]any{
				"input":     10,
				"output":    20,
				"reasoning": 0,
				"cache":     map[string]any{"read": 0, "write": 0},
			},
			"timestamp": 2000000,
		},
	}))

	msgs = u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message after full cycle, got %d", len(msgs))
	}
	m := msgs[0]
	if len(m.Content) != 1 {
		t.Fatalf("expected 1 content block, got %d", len(m.Content))
	}
	if m.Content[0].Type != "text" {
		t.Errorf("expected text content, got %s", m.Content[0].Type)
	}
	if m.Content[0].Text != "Hello World!" {
		t.Errorf("expected 'Hello World!', got %s", m.Content[0].Text)
	}
	if m.Finish != "stop" {
		t.Errorf("expected finish 'stop', got %s", m.Finish)
	}
	if m.Tokens == nil {
		t.Fatal("expected tokens to be set")
	}
	if m.Tokens.Input != 10 {
		t.Errorf("expected input tokens 10, got %d", m.Tokens.Input)
	}
}

func TestToolCallCycle(t *testing.T) {
	u := updater.New()

	// Start a step
	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{"agent": "coder", "model": "gpt-4"},
	}))

	// Tool input
	u.ProcessEvent(event(t, "session.next.tool.input.started", map[string]any{
		"data": map[string]any{
			"callID": "tool_001",
			"name":   "read_file",
		},
	}))
	u.ProcessEvent(event(t, "session.next.tool.input.delta", map[string]any{
		"data": map[string]any{
			"callID": "tool_001",
			"delta":  "/path/to/file",
		},
	}))

	// Tool called
	u.ProcessEvent(event(t, "session.next.tool.called", map[string]any{
		"data": map[string]any{
			"callID": "tool_001",
			"tool":   "read_file",
			"input":  map[string]any{"path": "/path/to/file"},
			"provider": map[string]any{
				"executed": true,
			},
			"timestamp": 2000000,
		},
	}))

	// Tool progress
	u.ProcessEvent(event(t, "session.next.tool.progress", map[string]any{
		"data": map[string]any{
			"callID": "tool_001",
			"structured": map[string]any{"progress": 50},
			"content": []any{},
		},
	}))

	// Tool success
	u.ProcessEvent(event(t, "session.next.tool.success", map[string]any{
		"data": map[string]any{
			"callID": "tool_001",
			"structured": map[string]any{"result": "ok"},
			"content":    []any{},
			"provider":   map[string]any{"executed": true},
			"timestamp":  3000000,
		},
	}))

	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if len(msgs[0].Content) != 1 {
		t.Fatalf("expected 1 content block, got %d", len(msgs[0].Content))
	}
	tool := msgs[0].Content[0]
	if tool.Type != "tool" {
		t.Errorf("expected tool content, got %s", tool.Type)
	}
	if tool.State == nil {
		t.Fatal("expected tool state to be set")
	}
	if tool.State.Status != "completed" {
		t.Errorf("expected completed status, got %s", tool.State.Status)
	}
}

func TestStepFailed(t *testing.T) {
	u := updater.New()

	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{"agent": "coder", "model": "gpt-4"},
	}))
	u.ProcessEvent(event(t, "session.next.step.failed", map[string]any{
		"data": map[string]any{
			"error":     map[string]any{"type": "unknown", "message": "something went wrong"},
			"timestamp": 2000000,
		},
	}))

	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if msgs[0].Finish != "error" {
		t.Errorf("expected finish 'error', got %s", msgs[0].Finish)
	}
	if msgs[0].Error == nil {
		t.Fatal("expected error to be set")
	}
	if msgs[0].Error.Message != "something went wrong" {
		t.Errorf("expected 'something went wrong', got %s", msgs[0].Error.Message)
	}
}

func TestReasoningCycle(t *testing.T) {
	u := updater.New()

	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{"agent": "coder", "model": "gpt-4"},
	}))
	u.ProcessEvent(event(t, "session.next.reasoning.started", map[string]any{
		"data": map[string]any{"reasoningID": "reason_001"},
	}))
	u.ProcessEvent(event(t, "session.next.reasoning.delta", map[string]any{
		"data": map[string]any{
			"reasoningID": "reason_001",
			"delta":       "Let me think...",
		},
	}))
	u.ProcessEvent(event(t, "session.next.reasoning.ended", map[string]any{
		"data": map[string]any{
			"reasoningID": "reason_001",
			"text":        "Let me think... I've got it!",
		},
	}))

	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if len(msgs[0].Content) != 1 {
		t.Fatalf("expected 1 content block, got %d", len(msgs[0].Content))
	}
	r := msgs[0].Content[0]
	if r.Type != "reasoning" {
		t.Errorf("expected reasoning type, got %s", r.Type)
	}
	if r.Text != "Let me think... I've got it!" {
		t.Errorf("expected full reasoning text, got %s", r.Text)
	}
}

func TestCompactionCycle(t *testing.T) {
	u := updater.New()

	u.ProcessEvent(event(t, "session.next.compaction.started", map[string]any{
		"data": map[string]any{"reason": "auto"},
	}))
	u.ProcessEvent(event(t, "session.next.compaction.delta", map[string]any{
		"data": map[string]any{"text": "Summarizing..."},
	}))
	u.ProcessEvent(event(t, "session.next.compaction.ended", map[string]any{
		"data": map[string]any{
			"text":    "Summarizing the conversation",
			"include": "key points",
		},
	}))

	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if msgs[0].Type != "compaction" {
		t.Errorf("expected compaction type, got %s", msgs[0].Type)
	}
	if msgs[0].Reason != "auto" {
		t.Errorf("expected reason 'auto', got %s", msgs[0].Reason)
	}
	if msgs[0].Summary != "Summarizing the conversation" {
		t.Errorf("expected summary, got %s", msgs[0].Summary)
	}
	if msgs[0].Include != "key points" {
		t.Errorf("expected include 'key points', got %s", msgs[0].Include)
	}
}

func TestFullConversation(t *testing.T) {
	u := updater.New()

	// Simulate a full conversation:
	// 1. user prompt
	// 2. agent switched
	// 3. step started → tool call → reasoning → text → step ended
	// 4. another user prompt
	// 5. step started → step ended
	// 6. compaction

	u.ProcessEvent(event(t, "session.next.prompted", map[string]any{
		"data": map[string]any{
			"prompt": map[string]any{"text": "Hello, how are you?"},
			"timestamp": 1000,
		},
	}))

	u.ProcessEvent(event(t, "session.next.agent.switched", map[string]any{
		"data": map[string]any{"agent": "assistant", "timestamp": 2000},
	}))

	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{"agent": "assistant", "model": "gpt-4", "timestamp": 3000},
	}))

	u.ProcessEvent(event(t, "session.next.text.started", map[string]any{
		"data": map[string]any{"timestamp": 4000},
	}))
	u.ProcessEvent(event(t, "session.next.text.delta", map[string]any{
		"data": map[string]any{"delta": "I'm ", "timestamp": 5000},
	}))
	u.ProcessEvent(event(t, "session.next.text.delta", map[string]any{
		"data": map[string]any{"delta": "doing great!", "timestamp": 6000},
	}))
	u.ProcessEvent(event(t, "session.next.text.ended", map[string]any{
		"data": map[string]any{"text": "I'm doing great!", "timestamp": 7000},
	}))

	u.ProcessEvent(event(t, "session.next.step.ended", map[string]any{
		"data": map[string]any{
			"finish": "stop",
			"cost":   0.001,
			"tokens": map[string]any{
				"input": 5, "output": 3, "reasoning": 0,
				"cache": map[string]any{"read": 0, "write": 0},
			},
			"timestamp": 8000,
		},
	}))

	u.ProcessEvent(event(t, "session.next.prompted", map[string]any{
		"data": map[string]any{
			"prompt": map[string]any{"text": "Tell me a joke"},
			"timestamp": 9000,
		},
	}))

	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{"agent": "assistant", "model": "gpt-4", "timestamp": 10000},
	}))
	u.ProcessEvent(event(t, "session.next.text.started", map[string]any{
		"data": map[string]any{"timestamp": 11000},
	}))
	u.ProcessEvent(event(t, "session.next.text.delta", map[string]any{
		"data": map[string]any{"delta": "Why did the chicken cross the road?", "timestamp": 12000},
	}))
	u.ProcessEvent(event(t, "session.next.text.ended", map[string]any{
		"data": map[string]any{"text": "Why did the chicken cross the road?", "timestamp": 13000},
	}))
	u.ProcessEvent(event(t, "session.next.step.ended", map[string]any{
		"data": map[string]any{
			"finish": "stop",
			"cost":   0.002,
			"tokens": map[string]any{
				"input": 8, "output": 7, "reasoning": 0,
				"cache": map[string]any{"read": 0, "write": 0},
			},
			"timestamp": 14000,
		},
	}))

	u.ProcessEvent(event(t, "session.next.compaction.started", map[string]any{
		"data": map[string]any{"reason": "auto", "timestamp": 15000},
	}))
	u.ProcessEvent(event(t, "session.next.compaction.ended", map[string]any{
		"data": map[string]any{
			"text": "User asked about feelings, assistant responded.",
			"timestamp": 16000,
		},
	}))

	msgs := u.Messages()
	expected := []string{"user", "agent-switched", "assistant", "user", "assistant", "compaction"}
	if len(msgs) != len(expected) {
		t.Fatalf("expected %d messages in full conversation, got %d:\n%s", len(expected), len(msgs), messagesJSON(t, u))
	}
	for i, m := range msgs {
		if m.Type != expected[i] {
			t.Errorf("message %d: expected type %s, got %s", i, expected[i], m.Type)
		}
	}
}

func TestToolFailed(t *testing.T) {
	u := updater.New()

	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{"agent": "coder", "model": "gpt-4"},
	}))
	u.ProcessEvent(event(t, "session.next.tool.input.started", map[string]any{
		"data": map[string]any{"callID": "tool_001", "name": "read_file"},
	}))
	u.ProcessEvent(event(t, "session.next.tool.called", map[string]any{
		"data": map[string]any{
			"callID":   "tool_001",
			"tool":     "read_file",
			"input":    map[string]any{},
			"provider": map[string]any{"executed": true},
			"timestamp": 2000,
		},
	}))
	u.ProcessEvent(event(t, "session.next.tool.failed", map[string]any{
		"data": map[string]any{
			"callID":   "tool_001",
			"error":    map[string]any{"type": "unknown", "message": "file not found"},
			"provider": map[string]any{"executed": true},
			"timestamp": 3000,
		},
	}))

	msgs := u.Messages()
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	tool := msgs[0].Content[0]
	if tool.State == nil || tool.State.Status != "error" {
		t.Errorf("expected error status, got %v", tool.State)
	}
	if tool.State.Error == nil || tool.State.Error.Message != "file not found" {
		t.Errorf("expected error message, got %v", tool.State.Error)
	}
}

func TestMultipleTextBlocks(t *testing.T) {
	u := updater.New()

	u.ProcessEvent(event(t, "session.next.step.started", map[string]any{
		"data": map[string]any{"agent": "coder", "model": "gpt-4"},
	}))
	u.ProcessEvent(event(t, "session.next.text.started", nil))
	u.ProcessEvent(event(t, "session.next.text.delta", map[string]any{
		"data": map[string]any{"delta": "First"},
	}))
	u.ProcessEvent(event(t, "session.next.text.ended", map[string]any{
		"data": map[string]any{"text": "First"},
	}))
	u.ProcessEvent(event(t, "session.next.text.started", nil))
	u.ProcessEvent(event(t, "session.next.text.delta", map[string]any{
		"data": map[string]any{"delta": "Second"},
	}))
	u.ProcessEvent(event(t, "session.next.text.ended", map[string]any{
		"data": map[string]any{"text": "Second"},
	}))

	msgs := u.Messages()
	if len(msgs[0].Content) != 2 {
		t.Fatalf("expected 2 content blocks, got %d", len(msgs[0].Content))
	}
	if msgs[0].Content[0].Text != "First" {
		t.Errorf("expected 'First', got %s", msgs[0].Content[0].Text)
	}
	if msgs[0].Content[1].Text != "Second" {
		t.Errorf("expected 'Second', got %s", msgs[0].Content[1].Text)
	}
}
