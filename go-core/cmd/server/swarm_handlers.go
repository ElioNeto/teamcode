package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/ElioNeto/teamcode/go-core/internal/eventbus"
	"github.com/ElioNeto/teamcode/go-core/internal/swarm"
)

var scheduler *swarm.Scheduler

func getScheduler() *swarm.Scheduler {
	if scheduler == nil {
		scheduler = swarm.NewScheduler(eventbus.NewBus())
	}
	return scheduler
}

// POST /swarm/run
func handleSwarmRun(w http.ResponseWriter, r *http.Request) {
	var req swarm.RunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, "invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	swarmID, err := getScheduler().Run(r.Context(), req)
	if err != nil {
		writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, swarm.RunResponse{SwarmID: swarmID})
}

// DELETE /swarm/{id}
func handleSwarmCancel(w http.ResponseWriter, r *http.Request) {
	id := swarm.SwarmID(r.PathValue("id"))
	if id == "" {
		writeError(w, "swarm id is required", http.StatusBadRequest)
		return
	}

	if err := getScheduler().Cancel(id); err != nil {
		writeError(w, err.Error(), http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GET /swarm/{id}/status
func handleSwarmStatus(w http.ResponseWriter, r *http.Request) {
	id := swarm.SwarmID(r.PathValue("id"))
	if id == "" {
		writeError(w, "swarm id is required", http.StatusBadRequest)
		return
	}

	statuses, err := getScheduler().Status(id)
	if err != nil {
		writeError(w, err.Error(), http.StatusNotFound)
		return
	}

	writeJSON(w, map[string]interface{}{
		"swarm_id": id,
		"agents":   statuses,
	})
}

// POST /swarm/{id}/agent/{agentId}/tool_result
func handleSwarmToolResult(w http.ResponseWriter, r *http.Request) {
	id := swarm.SwarmID(r.PathValue("id"))
	agentID := swarm.AgentID(r.PathValue("agentId"))
	if id == "" || agentID == "" {
		writeError(w, "swarm id and agent id are required", http.StatusBadRequest)
		return
	}

	var payload swarm.ToolResultPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, "invalid request: "+err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("[swarm] tool result received: swarm=%s agent=%s call=%s", id, agentID, payload.CallID)
	w.WriteHeader(http.StatusNoContent)
}


