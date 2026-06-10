// Package eventbus provides an in-memory PubSub event bus for session events,
// matching the EventV2 + Bus system in the TypeScript core.
//
// Events are opaque JSON blobs routed by session ID.
// The bus manages subscriptions per session and delivers events to all
// subscribers concurrently.
package eventbus

import (
	"encoding/json"
	"sync"
	"sync/atomic"
	"time"
)

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

// Event represents a session event flowing over SSE.
// The Data field holds the full JSON payload (including type, data, version).
type Event struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	SessionID string          `json:"session_id"`
	Data      json.RawMessage `json:"data"`
	Timestamp int64           `json:"timestamp"` // epoch ms
}

// NewEvent creates a new event with a generated ID.
func NewEvent(eventType, sessionID string, data json.RawMessage) Event {
	return Event{
		ID:        generateID(),
		Type:      eventType,
		SessionID: sessionID,
		Data:      data,
		Timestamp: time.Now().UnixMilli(),
	}
}

// MarshalSSE serializes the event as an SSE frame.
// Format:
//
//	event: message
//	data: {"id":"...","type":"...","session_id":"...","data":{...},"timestamp":...}
func (e Event) MarshalSSE() []byte {
	payload, err := json.Marshal(e)
	if err != nil {
		return nil
	}
	return []byte("event: message\ndata: " + string(payload) + "\n\n")
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

var idCounter atomic.Int64

func generateID() string {
	n := idCounter.Add(1)
	return "evt_" + formatTimestamp(time.Now()) + "_" + itoa(n)
}

func formatTimestamp(t time.Time) string {
	return t.UTC().Format("20060102150405")
}

func itoa(n int64) string {
	return time.Unix(n, 0).UTC().Format("150405") + "000000"
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

// Subscription represents a single subscriber's channel for a session.
// Events are delivered on the channel. Close it to unsubscribe.
type Subscription struct {
	SessionID string
	Events    chan Event
	done      chan struct{}
	once      sync.Once
}

// NewSubscription creates a subscription with a buffered channel.
func NewSubscription(sessionID string, bufferSize int) *Subscription {
	if bufferSize <= 0 {
		bufferSize = 64
	}
	return &Subscription{
		SessionID: sessionID,
		Events:    make(chan Event, bufferSize),
		done:      make(chan struct{}),
	}
}

// Close marks the subscription as done and closes the events channel.
func (s *Subscription) Close() {
	s.once.Do(func() {
		close(s.done)
		close(s.Events)
	})
}

// Done returns a channel that is closed when the subscription is closed.
func (s *Subscription) Done() <-chan struct{} {
	return s.done
}

// ---------------------------------------------------------------------------
// Bus
// ---------------------------------------------------------------------------

// Bus is an in-memory event bus for session events.
// It maintains a map of sessionID → []*Subscription.
// All operations are thread-safe.
type Bus struct {
	mu      sync.RWMutex
	subs    map[string][]*Subscription
	running atomic.Bool
}

// NewBus creates a new event bus.
func NewBus() *Bus {
	return &Bus{
		subs: make(map[string][]*Subscription),
	}
}

// Subscribe creates a new subscription for the given session ID.
func (b *Bus) Subscribe(sessionID string) *Subscription {
	sub := NewSubscription(sessionID, 64)

	b.mu.Lock()
	b.subs[sessionID] = append(b.subs[sessionID], sub)
	b.mu.Unlock()

	// Auto-cleanup when subscription is closed
	go func() {
		<-sub.Done()
		b.unsubscribe(sub)
	}()

	return sub
}

// Unsubscribe removes a subscription from the bus.
func (b *Bus) unsubscribe(sub *Subscription) {
	b.mu.Lock()
	defer b.mu.Unlock()

	subs := b.subs[sub.SessionID]
	for i, s := range subs {
		if s == sub {
			b.subs[sub.SessionID] = append(subs[:i], subs[i+1:]...)
			break
		}
	}
	// Clean up empty entries
	if len(b.subs[sub.SessionID]) == 0 {
		delete(b.subs, sub.SessionID)
	}
}

// Publish delivers an event to all subscribers of the given session.
// Non-blocking: if a subscriber's channel is full, the event is dropped
// for that subscriber.
func (b *Bus) Publish(event Event) {
	b.mu.RLock()
	subs := b.subs[event.SessionID]
	b.mu.RUnlock()

	for _, sub := range subs {
		select {
		case sub.Events <- event:
		default:
			// Drop event if subscriber is slow
		}
	}
}

// SubscriberCount returns the number of subscribers for a session.
func (b *Bus) SubscriberCount(sessionID string) int {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return len(b.subs[sessionID])
}

// SessionCount returns the number of sessions with active subscribers.
func (b *Bus) SessionCount() int {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return len(b.subs)
}
