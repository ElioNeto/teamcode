// Package updater implements a stateful session message updater.
//
// It receives raw session events and consolidates them into a
// conversation view (messages), mirroring session-message-updater.ts.
package updater

// Message is a union of all possible message types, identified by Type.
type Message struct {
	Type string `json:"type"`

	// Shared fields
	ID       string                 `json:"id"`
	Metadata map[string]any         `json:"metadata,omitempty"`
	Time     MessageTime            `json:"time"`

	// Agent-switched
	Agent string `json:"agent,omitempty"`

	// Model-switched
	Model string `json:"model,omitempty"`

	// User
	Text       string      `json:"text,omitempty"`
	Files      []any       `json:"files,omitempty"`
	Agents     []any       `json:"agents,omitempty"`
	References []any       `json:"references,omitempty"`

	// Synthetic
	SessionID string `json:"sessionID,omitempty"`

	// Shell
	CallID  string `json:"callID,omitempty"`
	Command string `json:"command,omitempty"`
	Output  string `json:"output,omitempty"`

	// Assistant
	Content  []ContentBlock `json:"content,omitempty"`
	Snapshot *Snapshot      `json:"snapshot,omitempty"`
	Finish   string         `json:"finish,omitempty"`
	Cost     *float64       `json:"cost,omitempty"`
	Tokens   *TokenCount    `json:"tokens,omitempty"`
	Error    *UnknownError  `json:"error,omitempty"`

	// Compaction
	Reason  string `json:"reason,omitempty"`
	Summary string `json:"summary,omitempty"`
	Include string `json:"include,omitempty"`
}

// MessageTime holds creation/completion timestamps.
type MessageTime struct {
	Created   int64  `json:"created"`
	Completed *int64 `json:"completed,omitempty"`
}

// Snapshot captures the state before/after a step.
type Snapshot struct {
	Start string `json:"start,omitempty"`
	End   string `json:"end,omitempty"`
}

// TokenCount records token usage.
type TokenCount struct {
	Input     int      `json:"input"`
	Output    int      `json:"output"`
	Reasoning int      `json:"reasoning"`
	Cache     CacheUse `json:"cache"`
}

// CacheUse records cache hit rates.
type CacheUse struct {
	Read  int `json:"read"`
	Write int `json:"write"`
}

// UnknownError represents a generic error.
type UnknownError struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

// ContentBlock is a union of text, reasoning, and tool blocks.
type ContentBlock struct {
	Type string `json:"type"`

	// Text
	Text string `json:"text,omitempty"`

	// Reasoning
	ID string `json:"id,omitempty"`

	// Tool
	Name     string     `json:"name,omitempty"`
	Provider *Provider  `json:"provider,omitempty"`
	State    *ToolState `json:"state,omitempty"`
	ToolTime *ToolTime  `json:"time,omitempty"`
}

// ToolTime tracks tool execution phases.
type ToolTime struct {
	Created   int64  `json:"created"`
	Ran       *int64 `json:"ran,omitempty"`
	Completed *int64 `json:"completed,omitempty"`
}

// Provider records whether a tool was executed.
type Provider struct {
	Executed bool                   `json:"executed"`
	Metadata map[string]any         `json:"metadata,omitempty"`
}

// ToolState tracks the status of a tool call.
type ToolState struct {
	Status     string         `json:"status"`
	Input      any            `json:"input"`
	Structured map[string]any `json:"structured,omitempty"`
	Content    []any          `json:"content,omitempty"`
	Error      *UnknownError  `json:"error,omitempty"`
}
