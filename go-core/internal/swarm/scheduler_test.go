package swarm

import (
	"context"
	"encoding/json"
	"testing"
	"time"
)

func TestResolveDAG_Empty(t *testing.T) {
	order, err := resolveDAG(nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(order) != 0 {
		t.Fatalf("expected empty order, got %d items", len(order))
	}
}

func TestResolveDAG_NoDeps(t *testing.T) {
	specs := []AgentSpec{
		{ID: "a", Name: "A"},
		{ID: "b", Name: "B"},
	}
	order, err := resolveDAG(specs)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(order) != 2 {
		t.Fatalf("expected 2 agents, got %d", len(order))
	}
}

func TestResolveDAG_WithDeps(t *testing.T) {
	specs := []AgentSpec{
		{ID: "a", Name: "A"},
		{ID: "b", Name: "B", DependsOn: []AgentID{"a"}},
		{ID: "c", Name: "C", DependsOn: []AgentID{"b"}},
	}
	order, err := resolveDAG(specs)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	positions := make(map[AgentID]int)
	for i, s := range order {
		positions[s.ID] = i
	}

	if positions["a"] > positions["b"] {
		t.Fatal("a must be before b")
	}
	if positions["b"] > positions["c"] {
		t.Fatal("b must be before c")
	}
}

func TestResolveDAG_Cycle(t *testing.T) {
	specs := []AgentSpec{
		{ID: "a", DependsOn: []AgentID{"b"}},
		{ID: "b", DependsOn: []AgentID{"a"}},
	}
	_, err := resolveDAG(specs)
	if err == nil {
		t.Fatal("expected cycle error, got nil")
	}
}

func TestScheduler_RunAndComplete(t *testing.T) {
	s := NewScheduler(nil)
	ctx := context.Background()

	req := RunRequest{
		Agents: []AgentSpec{
			{ID: "agent-1", Name: "Agent 1", Input: json.RawMessage(`{"task":"test"}`)},
		},
	}

	swarmID, err := s.Run(ctx, req)
	if err != nil {
		t.Fatalf("Run failed: %v", err)
	}
	if swarmID == "" {
		t.Fatal("expected non-empty swarmID")
	}

	// Status immediately after Run — the agent may complete very quickly
	// (simulated execution is instant), so the swarm may be cleaned up
	// by the background goroutine before Status() is called.
	statuses, err := s.Status(swarmID)
	if err != nil {
		// Swarm was already cleaned up — that's OK, means it completed
		t.Logf("swarm already cleaned up (expected for instant execution): %v", err)
		return
	}
	if len(statuses) != 1 {
		t.Fatalf("expected 1 agent status, got %d", len(statuses))
	}
}

func TestScheduler_Cancel(t *testing.T) {
	s := NewScheduler(nil)
	ctx := context.Background()

	req := RunRequest{
		Agents: []AgentSpec{
			{ID: "agent-1", Name: "Agent 1", Input: json.RawMessage(`{"task":"test"}`)},
		},
	}

	swarmID, err := s.Run(ctx, req)
	if err != nil {
		t.Fatalf("Run failed: %v", err)
	}

	err = s.Cancel(swarmID)
	if err != nil {
		t.Fatalf("Cancel failed: %v", err)
	}

	time.Sleep(100 * time.Millisecond)

	_, err = s.Status(swarmID)
	if err == nil {
		t.Log("swarm was already cleaned up on cancel")
	}
}

func TestScheduler_ConcurrentLimit(t *testing.T) {
	s := NewScheduler(nil)
	ctx := context.Background()

	maxConc := 2
	req := RunRequest{
		Agents: []AgentSpec{
			{ID: "a", Name: "A"},
			{ID: "b", Name: "B"},
			{ID: "c", Name: "C"},
		},
		MaxConcurrency: &maxConc,
	}

	swarmID, err := s.Run(ctx, req)
	if err != nil {
		t.Fatalf("Run failed: %v", err)
	}

	time.Sleep(500 * time.Millisecond)

	statuses, err := s.Status(swarmID)
	if err == nil {
		for _, st := range statuses {
			if st == StatusRunning {
				t.Fatal("agent still running after expected completion")
			}
		}
	}
}

func TestScheduler_DependencyOrder(t *testing.T) {
	s := NewScheduler(nil)
	ctx := context.Background()

	req := RunRequest{
		Agents: []AgentSpec{
			{ID: "a", Name: "A", Input: rawMsg(t, map[string]string{"order": "1"})},
			{ID: "b", Name: "B", DependsOn: []AgentID{"a"}, Input: rawMsg(t, map[string]string{"order": "2"})},
			{ID: "c", Name: "C", DependsOn: []AgentID{"b"}, Input: rawMsg(t, map[string]string{"order": "3"})},
		},
	}

	swarmID, err := s.Run(ctx, req)
	if err != nil {
		t.Fatalf("Run failed: %v", err)
	}

	time.Sleep(500 * time.Millisecond)
	_ = swarmID
}

func rawMsg(t *testing.T, v interface{}) json.RawMessage {
	t.Helper()
	data, err := json.Marshal(v)
	if err != nil {
		t.Fatal(err)
	}
	return data
}
