// Package swarm implements a goroutine-based agent scheduler.
//
// This is a clean-break from the TypeScript Effect-fiber model (#1074):
// agents are native goroutines communicating via typed channels,
// coordinated via errgroup, and cancellable via context.
//
// # ADR
//
// See docs/rewrite/adr-swarm-scheduler.md for the full architecture decision.
package swarm

import (
	"context"
	"encoding/json"
	"sync"
	"time"
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// AgentID is a unique identifier for an agent within a swarm.
type AgentID string

// AgentStatus represents the lifecycle state of an agent.
type AgentStatus string

const (
	StatusPending  AgentStatus = "pending"
	StatusRunning  AgentStatus = "running"
	StatusDone     AgentStatus = "done"
	StatusFailed   AgentStatus = "failed"
	StatusCanceled AgentStatus = "canceled"
)

// AgentSpec describes an agent to be scheduled.
// Sent by the TypeScript runtime via POST /swarm/run.
type AgentSpec struct {
	ID       AgentID          `json:"id"`
	Name     string           `json:"name"`
	Input    json.RawMessage  `json:"input"`
	DependsOn []AgentID       `json:"depends_on,omitempty"`
	TimeoutMs int             `json:"timeout,omitempty"`
	Model    *ModelSpec       `json:"model,omitempty"`
}

// ModelSpec describes an optional model override for an agent.
type ModelSpec struct {
	Provider string `json:"provider"`
	Model    string `json:"model"`
}

// SwarmID is a unique identifier for a swarm run.
type SwarmID string

// ---------------------------------------------------------------------------
// AgentEvent (output via SSE)
// ---------------------------------------------------------------------------

// AgentEventType enumerates all event types emitted by agents.
type AgentEventType string

const (
	EventAgentStarted  AgentEventType = "agent.started"
	EventAgentToken    AgentEventType = "agent.token"
	EventAgentToolCall AgentEventType = "agent.tool_call"
	EventAgentToolResult AgentEventType = "agent.tool_result"
	EventAgentDone     AgentEventType = "agent.done"
	EventAgentError    AgentEventType = "agent.error"
	EventSwarmDone     AgentEventType = "swarm.done"
	EventSwarmCanceled AgentEventType = "swarm.canceled"
)

// AgentEvent is emitted by an agent during execution.
// It flows through the Event Bus to SSE subscribers.
type AgentEvent struct {
	SwarmID   SwarmID         `json:"swarm_id"`
	AgentID   AgentID         `json:"agent_id"`
	Type      AgentEventType  `json:"type"`
	Data      json.RawMessage `json:"data,omitempty"`
	Timestamp int64           `json:"timestamp"`
}

// NewAgentEvent creates a new event with the current timestamp.
func NewAgentEvent(swarmID SwarmID, agentID AgentID, typ AgentEventType, data json.RawMessage) AgentEvent {
	return AgentEvent{
		SwarmID:   swarmID,
		AgentID:   agentID,
		Type:      typ,
		Data:      data,
		Timestamp: time.Now().UnixMilli(),
	}
}

// ---------------------------------------------------------------------------
// Agent (runtime instance)
// ---------------------------------------------------------------------------

// Agent represents a single agent goroutine managed by the scheduler.
// All exported fields are safe for concurrent read access via the getter methods.
// Status changes must go through setStatus to ensure thread safety.
type Agent struct {
	mu       sync.Mutex
	ID       AgentID
	Spec     AgentSpec
	status   AgentStatus
	resultCh chan AgentResult // receives result when done
	eventCh  chan AgentEvent  // emits events for the Event Bus
	cancel   context.CancelFunc
	startedAt time.Time
}

// Status returns the current agent status (thread-safe).
func (a *Agent) Status() AgentStatus {
	a.mu.Lock()
	defer a.mu.Unlock()
	return a.status
}

// setStatus updates the agent status (thread-safe).
func (a *Agent) setStatus(s AgentStatus) {
	a.mu.Lock()
	defer a.mu.Unlock()
	a.status = s
}

// IsDone returns true if the agent is in a terminal state.
func (a *Agent) IsDone() bool {
	st := a.Status()
	return st == StatusDone || st == StatusFailed || st == StatusCanceled
}

// AgentResult is sent to the scheduler when an agent finishes.
type AgentResult struct {
	AgentID AgentID        `json:"agent_id"`
	Output  json.RawMessage `json:"output,omitempty"`
	Err     error          `json:"error,omitempty"`
}

// ToolCallPayload is sent in AgentEvent when an agent requests a tool execution.
type ToolCallPayload struct {
	ToolName string          `json:"tool_name"`
	Args     json.RawMessage `json:"args"`
	CallID   string          `json:"call_id"`
}

// ToolResultPayload is received via POST /swarm/:id/agent/:id/tool_result.
type ToolResultPayload struct {
	CallID string          `json:"call_id"`
	Output json.RawMessage `json:"output,omitempty"`
	Error  string          `json:"error,omitempty"`
}

// ---------------------------------------------------------------------------
// RunRequest / RunResponse (HTTP contract)
// ---------------------------------------------------------------------------

// RunRequest is the JSON body for POST /swarm/run.
type RunRequest struct {
	SwarmID        *SwarmID    `json:"swarm_id,omitempty"`
	Agents         []AgentSpec `json:"agents"`
	MaxConcurrency *int        `json:"max_concurrency,omitempty"`
}

// RunResponse is the JSON response for POST /swarm/run.
type RunResponse struct {
	SwarmID SwarmID `json:"swarm_id"`
}
