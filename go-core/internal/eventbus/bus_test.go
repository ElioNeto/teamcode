package eventbus

import (
	"encoding/json"
	"strings"
	"sync"
	"testing"
	"time"
)

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

func TestNewEvent(t *testing.T) {
	data := json.RawMessage(`{"text":"hello"}`)
	e := NewEvent("session.next.text.delta", "ses_123", data)

	if e.Type != "session.next.text.delta" {
		t.Fatalf("expected type, got %s", e.Type)
	}
	if e.SessionID != "ses_123" {
		t.Fatalf("expected ses_123, got %s", e.SessionID)
	}
	if e.ID == "" {
		t.Fatal("expected non-empty ID")
	}
	if e.Timestamp == 0 {
		t.Fatal("expected non-zero timestamp")
	}
}

func TestEventMarshalSSE(t *testing.T) {
	data := json.RawMessage(`{"delta":"Hello"}`)
	e := NewEvent("session.next.text.delta", "ses_123", data)

	frame := e.MarshalSSE()
	if frame == nil {
		t.Fatal("expected non-nil SSE frame")
	}

	got := string(frame)

	// SSE format: "event: message\ndata: {...}\n\n"
	if len(got) < 30 {
		t.Fatalf("SSE frame too short: %q", got)
	}

	// Must contain standard SSE fields
	if !strings.HasPrefix(got, "event:") {
		t.Fatalf("expected 'event:' prefix, got %q", got[:6])
	}
	if !strings.Contains(got, "\ndata: ") {
		t.Fatalf("expected '\\ndata: ' in SSE frame, got: %q", got)
	}
	if !strings.HasSuffix(got, "\n\n") {
		t.Fatalf("expected '\\n\\n' suffix, got: %q", got[len(got)-4:])
	}

	// Should contain event fields
	if !strings.Contains(got, `"session_id":"ses_123"`) {
		t.Fatal("expected session_id in SSE frame")
	}
	if !strings.Contains(got, `"type":"session.next.text.delta"`) {
		t.Fatal("expected event type in SSE frame")
	}
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

func TestSubscription(t *testing.T) {
	sub := NewSubscription("ses_test", 10)

	if sub.SessionID != "ses_test" {
		t.Fatalf("expected ses_test, got %s", sub.SessionID)
	}

	// Should not be done initially
	select {
	case <-sub.Done():
		t.Fatal("subscription should not be done initially")
	default:
	}

	// Close and verify done
	sub.Close()

	// Double close should not panic
	sub.Close()

	select {
	case <-sub.Done():
		// OK
	default:
		t.Fatal("subscription should be done after close")
	}
}

// ---------------------------------------------------------------------------
// Bus
// ---------------------------------------------------------------------------

func TestBusPublishSubscribe(t *testing.T) {
	bus := NewBus()
	sub := bus.Subscribe("ses_abc")

	data := json.RawMessage(`{"hello":"world"}`)
	event := NewEvent("test.event", "ses_abc", data)

	bus.Publish(event)

	select {
	case received := <-sub.Events:
		if received.Type != "test.event" {
			t.Fatalf("expected test.event, got %s", received.Type)
		}
		if received.SessionID != "ses_abc" {
			t.Fatalf("expected ses_abc, got %s", received.SessionID)
		}
	case <-time.After(time.Second):
		t.Fatal("timeout waiting for event")
	}

	sub.Close()
}

func TestBusPublishDifferentSession(t *testing.T) {
	bus := NewBus()
	sub := bus.Subscribe("ses_abc")

	// Publish to a different session — should NOT be received
	event := NewEvent("test.event", "ses_xyz", json.RawMessage(`{}`))
	bus.Publish(event)

	select {
	case <-sub.Events:
		t.Fatal("should not receive events from different session")
	case <-time.After(100 * time.Millisecond):
		// OK — timed out as expected
	}

	sub.Close()
}

func TestBusMultipleSubscribers(t *testing.T) {
	bus := NewBus()
	sub1 := bus.Subscribe("ses_multi")
	sub2 := bus.Subscribe("ses_multi")

	event := NewEvent("multi.event", "ses_multi", json.RawMessage(`{}`))
	bus.Publish(event)

	// Both should receive
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		select {
		case <-sub1.Events:
		case <-time.After(time.Second):
			t.Error("sub1 timeout")
		}
	}()
	go func() {
		defer wg.Done()
		select {
		case <-sub2.Events:
		case <-time.After(time.Second):
			t.Error("sub2 timeout")
		}
	}()

	wg.Wait()
	sub1.Close()
	sub2.Close()
}

func TestBusPublishNonBlocking(t *testing.T) {
	bus := NewBus()
	sub := bus.Subscribe("ses_full") // buffer = 64

	// Publish events — should not block
	for i := 0; i < 100; i++ {
		bus.Publish(NewEvent("e", "ses_full", json.RawMessage(`{}`)))
	}

	// Should receive at least one event
	select {
	case <-sub.Events:
		// OK
	case <-time.After(100 * time.Millisecond):
		t.Fatal("expected at least one event")
	}

	sub.Close()
}

func TestSubscriberCount(t *testing.T) {
	bus := NewBus()
	s1 := bus.Subscribe("ses_cnt")
	s2 := bus.Subscribe("ses_cnt")

	if bus.SubscriberCount("ses_cnt") != 2 {
		t.Fatalf("expected 2, got %d", bus.SubscriberCount("ses_cnt"))
	}

	s1.Close()
	s2.Close()
}

func TestSessionCount(t *testing.T) {
	bus := NewBus()
	bus.Subscribe("ses_a")
	bus.Subscribe("ses_b")

	if bus.SessionCount() != 2 {
		t.Fatalf("expected 2 sessions, got %d", bus.SessionCount())
	}
}
