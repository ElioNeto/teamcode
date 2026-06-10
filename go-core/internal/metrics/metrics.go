// Package metrics provides a simple sliding-window metrics collector
// for tracking request counts, errors, and latency.
//
// Used by the circuit breaker in the TypeScript runtime to detect
// when the Go core is unhealthy and should be rolled back.
package metrics

import (
	"sync"
	"time"
)

// Snapshot is a point-in-time view of the metrics.
type Snapshot struct {
	RequestCount int     `json:"request_count"`
	ErrorCount   int     `json:"error_count"`
	ErrorRate    float64 `json:"error_rate"`
	AvgLatencyMs float64 `json:"avg_latency_ms"`
}

// entry is a single event record.
type entry struct {
	at     time.Time
	latency time.Duration
	err    bool
}

// Collector holds sliding-window metrics with a configurable window size.
// It is safe for concurrent use.
type Collector struct {
	mu     sync.Mutex
	window time.Duration
	events []entry
}

// New creates a new Collector. The window parameter controls how far back
// the sliding window extends. A 60-second window is typical.
func New(window time.Duration) *Collector {
	return &Collector{
		window: window,
	}
}

// Record adds a request observation.
func (c *Collector) Record(latency time.Duration, err bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.events = append(c.events, entry{at: time.Now(), latency: latency, err: err})
}

// Snapshot returns the current metrics for the sliding window.
func (c *Collector) Snapshot() Snapshot {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-c.window)

	// Prune old entries in-place.
	start := 0
	for start < len(c.events) && c.events[start].at.Before(cutoff) {
		start++
	}
	if start > 0 {
		c.events = append([]entry{}, c.events[start:]...)
	}

	var totalLatency time.Duration
	var errCount int

	for _, e := range c.events {
		if e.err {
			errCount++
		}
		totalLatency += e.latency
	}

	total := len(c.events)
	var avgLatency float64
	var errorRate float64

	if total > 0 {
		avgLatency = totalLatency.Seconds() * 1000 / float64(total)
		errorRate = float64(errCount) / float64(total) * 100
	}

	return Snapshot{
		RequestCount: total,
		ErrorCount:   errCount,
		ErrorRate:    errorRate,
		AvgLatencyMs: avgLatency,
	}
}
