package eventlog

import (
	"errors"
	"strings"
	"testing"
	"time"
)

func recv(t *testing.T, sub *Subscription) Event {
	t.Helper()
	select {
	case ev := <-sub.Events():
		return ev
	case <-time.After(time.Second):
		t.Fatal("timeout waiting for event")
		return Event{}
	}
}

func TestSeqIsMonotonicPerSessionAndGlobal(t *testing.T) {
	l := New(10, 10)
	a1 := l.Publish("session.updated", "ses_a", map[string]int{"n": 1})
	b1 := l.Publish("session.updated", "ses_b", map[string]int{"n": 1})
	a2 := l.Publish("session.updated", "ses_a", map[string]int{"n": 2})
	if a1.Seq != 1 || a2.Seq != 2 || b1.Seq != 1 {
		t.Fatalf("per-session seq: %d %d %d", a1.Seq, a2.Seq, b1.Seq)
	}
	if !strings.HasPrefix(a1.ID, "evt_") || a1.ID >= a2.ID {
		t.Fatalf("ids not ascending: %s %s", a1.ID, a2.ID)
	}
}

func TestLiveSubscriptionReceivesOnlyItsSession(t *testing.T) {
	l := New(10, 10)
	sub, err := l.Subscribe("ses_a", 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	l.Publish("x", "ses_b", nil)
	l.Publish("y", "ses_a", nil)
	if ev := recv(t, sub); ev.Type != "y" {
		t.Fatalf("got %s", ev.Type)
	}
}

func TestGlobalSubscriptionSeesEverything(t *testing.T) {
	l := New(10, 10)
	sub, _ := l.Subscribe("", 0, 8)
	defer sub.Close()
	l.Publish("x", "ses_b", nil)
	l.Publish("y", "ses_a", nil)
	if recv(t, sub).Type != "x" || recv(t, sub).Type != "y" {
		t.Fatal("global order broken")
	}
}

func TestReplayFromRing(t *testing.T) {
	l := New(10, 10)
	for i := 0; i < 5; i++ {
		l.Publish("x", "ses_a", map[string]int{"i": i})
	}
	sub, err := l.Subscribe("ses_a", 3, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	if recv(t, sub).Seq != 4 || recv(t, sub).Seq != 5 {
		t.Fatal("replay order broken")
	}
	l.Publish("x", "ses_a", nil)
	if recv(t, sub).Seq != 6 {
		t.Fatal("live after replay broken")
	}
}

func TestReplayUnavailableWhenRingOverflowed(t *testing.T) {
	l := New(3, 3)
	for i := 0; i < 10; i++ {
		l.Publish("x", "ses_a", nil)
	}
	_, err := l.Subscribe("ses_a", 2, 8)
	if !errors.Is(err, ErrReplayUnavailable) {
		t.Fatalf("got %v", err)
	}
}

func TestSlowSubscriberIsLaggedNotDropped(t *testing.T) {
	l := New(100, 100)
	sub, _ := l.Subscribe("ses_a", 0, 2)
	defer sub.Close()
	for i := 0; i < 5; i++ {
		l.Publish("x", "ses_a", nil)
	}
	select {
	case <-sub.Lagged():
	case <-time.After(time.Second):
		t.Fatal("expected lagged signal")
	}
}

func TestSSEFrame(t *testing.T) {
	ev := Event{Seq: 7, Type: "session.updated", Data: []byte(`{"a":1}`)}
	got := string(ev.SSE())
	if got != "event: session.updated\nid: 7\ndata: {\"a\":1}\n\n" {
		t.Fatalf("%q", got)
	}
}
