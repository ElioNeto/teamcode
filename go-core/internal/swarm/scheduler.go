package swarm

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/eventbus"
)

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const (
	DefaultMaxConcurrency = 10
	DefaultEventChanSize  = 256
)

// ---------------------------------------------------------------------------
// Scheduler
// ---------------------------------------------------------------------------

// Scheduler manages and coordinates agent swarms.
// It is thread-safe and can handle multiple concurrent swarms.
type Scheduler struct {
	mu      sync.RWMutex
	swarms  map[SwarmID]*Swarm
	bus     *eventbus.Bus
	maxConc int
	nextID  int
}

// NewScheduler creates a new Scheduler.
// bus is optional; if nil, events are not published to an event bus.
func NewScheduler(bus *eventbus.Bus) *Scheduler {
	return &Scheduler{
		swarms:  make(map[SwarmID]*Swarm),
		bus:     bus,
		maxConc: DefaultMaxConcurrency,
		nextID:  1,
	}
}

// Swarm represents a running swarm of agents.
type Swarm struct {
	ID      SwarmID
	spec    RunRequest
	agents  []*Agent
	cancel  context.CancelFunc
	results chan AgentResult
}

// Run starts a swarm with the given agent specs and returns immediately.
// Results arrive via Events (SSE) and optionally Event Bus.
func (s *Scheduler) Run(ctx context.Context, req RunRequest) (SwarmID, error) {
	if len(req.Agents) == 0 {
		return "", errors.New("swarm: no agents provided")
	}

	// Generate or use provided swarm ID
	swarmID := req.SwarmID
	if swarmID == nil || *swarmID == "" {
		id := SwarmID(fmt.Sprintf("swarm_%d", s.nextID))
		swarmID = &id
		s.nextID++
	}

	// Resolve DAG and compute execution order
	order, err := resolveDAG(req.Agents)
	if err != nil {
		return "", fmt.Errorf("swarm: DAG resolution failed: %w", err)
	}

	// Determine max concurrency
	maxConc := s.maxConc
	if req.MaxConcurrency != nil && *req.MaxConcurrency > 0 {
		maxConc = *req.MaxConcurrency
	}
	if maxConc > len(req.Agents) {
		maxConc = len(req.Agents)
	}

	// Create swarm context with cancel propagation
	swarmCtx, swarmCancel := context.WithCancel(ctx)

	// Semaphore channel for concurrency limiting
	sem := make(chan struct{}, maxConc)

	// Track completed agents for dependency resolution
	var (
		completed   sync.Map
		agentErrors sync.Map
		wg          sync.WaitGroup
	)

	results := make(chan AgentResult, len(req.Agents))
	swarm := &Swarm{
		ID:      *swarmID,
		spec:    req,
		cancel:  swarmCancel,
		results: results,
	}

	// Store swarm before starting goroutines so Status() is available immediately
	s.mu.Lock()
	s.swarms[*swarmID] = swarm
	s.mu.Unlock()

	// Start agents according to DAG order
	for i := range order {
		agentSpec := order[i]

		agentCtx, agentCancel := context.WithCancel(swarmCtx)
		if agentSpec.TimeoutMs > 0 {
			agentCtx, agentCancel = context.WithTimeout(swarmCtx, time.Duration(agentSpec.TimeoutMs)*time.Millisecond)
		}

		agent := &Agent{
			ID:       agentSpec.ID,
			Spec:     agentSpec,
			resultCh: make(chan AgentResult, 1),
			cancel:   agentCancel,
		}
		agent.setStatus(StatusPending)
		swarm.agents = append(swarm.agents, agent)

		wg.Add(1)
		go func(a *Agent) {
			defer wg.Done()

			// Acquire semaphore (limit concurrency)
			select {
			case sem <- struct{}{}:
			case <-agentCtx.Done():
				a.setStatus(StatusCanceled)
				return
			}
			defer func() { <-sem }()

			a.setStatus(StatusRunning)
			a.startedAt = time.Now()

			// Wait for dependencies
			for _, depID := range a.Spec.DependsOn {
				// Check if dependency already completed
				if _, ok := completed.Load(depID); ok {
					continue
				}
				// Check if dependency failed
				if _, ok := agentErrors.Load(depID); ok {
					a.setStatus(StatusFailed)
					errData, _ := json.Marshal(map[string]string{
						"error": fmt.Sprintf("dependency %s failed", depID),
					})
					emitEvent(s, *swarmID, a.ID, EventAgentError, errData)
					return
				}
				// Poll for dependency completion
				ticker := time.NewTicker(50 * time.Millisecond)
				defer ticker.Stop()
				for {
					select {
					case <-agentCtx.Done():
						a.setStatus(StatusCanceled)
						emitEvent(s, *swarmID, a.ID, EventAgentError,
							json.RawMessage(`{"error":"canceled while waiting for dependency"}`))
						return
					case <-ticker.C:
						if _, ok := completed.Load(depID); ok {
							goto depMet
						}
						// Check if dependency failed while we wait
						if _, ok := agentErrors.Load(depID); ok {
							a.setStatus(StatusFailed)
							errData, _ := json.Marshal(map[string]string{
								"error": fmt.Sprintf("dependency %s failed", depID),
							})
							emitEvent(s, *swarmID, a.ID, EventAgentError, errData)
							return
						}
					}
				}
			depMet:
			}

			// Emit agent.started
			emitEvent(s, *swarmID, a.ID, EventAgentStarted, a.Spec.Input)

			// Simulate agent execution
			// In production this would call the LLM, handle tool calls, etc.
			// For now, emit done with the input as output.
			emitEvent(s, *swarmID, a.ID, EventAgentDone, a.Spec.Input)

			a.setStatus(StatusDone)

			// Mark as completed
			completed.Store(a.ID, true)

			select {
			case results <- AgentResult{AgentID: a.ID, Output: a.Spec.Input}:
			default:
			}
		}(agent)
	}

	// Wait for swarm to finish in background, then emit swarm.done
	go func() {
		wg.Wait()
		close(sem)

		// Check if any agent was canceled
		allDone := true
		for _, a := range swarm.agents {
			if a.Status() == StatusCanceled {
				allDone = false
				break
			}
		}

		s.mu.Lock()
		delete(s.swarms, *swarmID)
		s.mu.Unlock()

		if !allDone {
			emitEvent(s, *swarmID, "", EventSwarmCanceled, json.RawMessage(`{}`))
			return
		}

		emitEvent(s, *swarmID, "", EventSwarmDone, json.RawMessage(`{}`))
	}()

	return *swarmID, nil
}

// Cancel cancels all agents in a swarm via context propagation.
func (s *Scheduler) Cancel(id SwarmID) error {
	s.mu.RLock()
	swarm, ok := s.swarms[id]
	s.mu.RUnlock()

	if !ok {
		return fmt.Errorf("swarm %s not found", id)
	}

	swarm.cancel()
	emitEvent(s, id, "", EventSwarmCanceled, json.RawMessage(`{}`))
	return nil
}

// Status returns the current status of all agents in a swarm.
func (s *Scheduler) Status(id SwarmID) ([]AgentStatus, error) {
	s.mu.RLock()
	swarm, ok := s.swarms[id]
	s.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("swarm %s not found", id)
	}

	statuses := make([]AgentStatus, len(swarm.agents))
	for i, agent := range swarm.agents {
		statuses[i] = agent.Status()
	}
	return statuses, nil
}

// SwarmCount returns the number of active swarms.
func (s *Scheduler) SwarmCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.swarms)
}

// ---------------------------------------------------------------------------
// DAG Resolution
// ---------------------------------------------------------------------------

// resolveDAG computes a topological order of agents based on dependsOn.
// Returns error if a cycle is detected.
func resolveDAG(specs []AgentSpec) ([]AgentSpec, error) {
	if len(specs) == 0 {
		return nil, nil
	}

	// Build adjacency list and in-degree map
	inDegree := make(map[AgentID]int)
	dependents := make(map[AgentID][]AgentID)
	agentMap := make(map[AgentID]*AgentSpec)

	for i := range specs {
		spec := &specs[i]
		agentMap[spec.ID] = spec
		if _, ok := inDegree[spec.ID]; !ok {
			inDegree[spec.ID] = 0
		}
		for _, dep := range spec.DependsOn {
			dependents[dep] = append(dependents[dep], spec.ID)
			inDegree[spec.ID]++
		}
	}

	// Kahn's algorithm
	var queue []AgentID
	for id, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, id)
		}
	}

	var order []AgentSpec
	visited := 0

	for len(queue) > 0 {
		id := queue[0]
		queue = queue[1:]

		if spec, ok := agentMap[id]; ok {
			order = append(order, *spec)
		}
		visited++

		for _, dep := range dependents[id] {
			inDegree[dep]--
			if inDegree[dep] == 0 {
				queue = append(queue, dep)
			}
		}
	}

	if visited != len(specs) {
		return nil, errors.New("cycle detected in agent dependency graph")
	}

	return order, nil
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

func emitEvent(s *Scheduler, swarmID SwarmID, agentID AgentID, typ AgentEventType, data json.RawMessage) {
	evt := NewAgentEvent(swarmID, agentID, typ, data)

	// Log to stdout
	LogEvent(evt)

	// If we have an event bus, publish the event
	if s.bus != nil {
		jsonData, err := json.Marshal(evt)
		if err == nil {
			s.bus.Publish(eventbus.Event{
				ID:        fmt.Sprintf("swarm_evt_%d", evt.Timestamp),
				Type:      string(typ),
				SessionID: string(swarmID),
				Data:      jsonData,
				Timestamp: evt.Timestamp,
			})
		}
	}
}

// LogEvent logs an agent event to stdout (used for testing and debugging).
func LogEvent(evt AgentEvent) {
	data, _ := json.Marshal(evt)
	log.Printf("[swarm] %s", string(data))
}
