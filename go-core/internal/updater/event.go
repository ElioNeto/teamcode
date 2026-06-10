package updater

// SessionEvent is a raw event from the session event bus (JSON envelope).
// The EventBus publishes events with these fields.
type SessionEvent struct {
	ID        string         `json:"id"`
	Type      string         `json:"type"`
	SessionID string         `json:"sessionID,omitempty"`
	Metadata  map[string]any `json:"metadata,omitempty"`
	Data      EventData      `json:"data"`
}

// EventData holds the type-specific payload.
//
// This mirrors the event types in SessionEvent (TS):
//   session-event.ts → EventV2.define() payload.data
type EventData struct {
	Timestamp int64  `json:"timestamp"`
	SessionID string `json:"sessionID"`

	// Agent / model switching (agent.switched, model.switched)
	Agent string `json:"agent,omitempty"`
	Model string `json:"model,omitempty"`

	// Prompt (session.next.prompted)
	Prompt *PromptData `json:"prompt,omitempty"`

	// Synthetic (session.next.synthetic)
	Text string `json:"text,omitempty"`

	// Shell (shell.started, shell.ended)
	CallID  string `json:"callID,omitempty"`
	Command string `json:"command,omitempty"`
	Output  string `json:"output,omitempty"`

	// Step (step.started, step.ended, step.failed)
	Snapshot string       `json:"snapshot,omitempty"`
	Finish   string       `json:"finish,omitempty"`
	Cost     *float64     `json:"cost,omitempty"`
	Tokens   *TokenCount  `json:"tokens,omitempty"`
	Error    *UnknownError `json:"error,omitempty"`

	// Text deltas (text.delta, text.ended)
	Delta string `json:"delta,omitempty"`

	// Tool (tool.*)
	Name       string         `json:"name,omitempty"`
	Tool       string         `json:"tool,omitempty"`
	Provider   *Provider      `json:"provider,omitempty"`
	Input      any            `json:"input,omitempty"`
	Structured map[string]any `json:"structured,omitempty"`
	Content    []any          `json:"content,omitempty"`

	// Reasoning (reasoning.*)
	ReasoningID string `json:"reasoningID,omitempty"`

	// Compaction (compaction.*)
	Reason  string `json:"reason,omitempty"`
	Include string `json:"include,omitempty"`
}

// PromptData mirrors the prompt field in session events.
type PromptData struct {
	Text       string `json:"text"`
	Files      []any  `json:"files,omitempty"`
	Agents     []any  `json:"agents,omitempty"`
	References []any  `json:"references,omitempty"`
}
