package eventlog

import (
	"errors"
	"fmt"
	"strings"
	"sync"
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

func TestCloseRemovesSubscriber(t *testing.T) {
	l := New(10, 10)
	sub, err := l.Subscribe("ses_idle", 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	sub.Close()
	l.Publish("x", "ses_other", nil)
	if got := l.subscriberCount(); got != 0 {
		t.Fatalf("subscriberCount = %d, want 0", got)
	}
}

func TestReplayOnNeverPublishedSessionIsUnavailable(t *testing.T) {
	l := New(10, 10)
	_, err := l.Subscribe("ses_new", 1, 8)
	if !errors.Is(err, ErrReplayUnavailable) {
		t.Fatalf("got %v", err)
	}
}

func TestReplayBeyondNewestIsUnavailable(t *testing.T) {
	l := New(10, 10)
	for i := 0; i < 3; i++ {
		l.Publish("x", "ses_a", nil)
	}
	_, err := l.Subscribe("ses_a", 5, 8)
	if !errors.Is(err, ErrReplayUnavailable) {
		t.Fatalf("got %v", err)
	}
}

func TestReplayAtNewestIsEmptyBacklog(t *testing.T) {
	l := New(10, 10)
	var last Event
	for i := 0; i < 3; i++ {
		last = l.Publish("x", "ses_a", nil)
	}
	sub, err := l.Subscribe("ses_a", last.Seq, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	select {
	case ev := <-sub.Events():
		t.Fatalf("unexpected backlog event %+v", ev)
	default:
	}
	l.Publish("y", "ses_a", nil)
	if ev := recv(t, sub); ev.Type != "y" {
		t.Fatalf("got %s", ev.Type)
	}
}

func TestReplayAtOldestMinusOneReturnsWholeRing(t *testing.T) {
	l := New(3, 3)
	for i := 0; i < 5; i++ {
		l.Publish("x", "ses_a", nil)
	}
	sub, err := l.Subscribe("ses_a", 2, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	a, b, c := recv(t, sub).Seq, recv(t, sub).Seq, recv(t, sub).Seq
	if a != 3 || b != 4 || c != 5 {
		t.Fatalf("got %d %d %d", a, b, c)
	}
}

func TestConcurrentPublishSubscribeClose(t *testing.T) {
	const (
		publishers   = 8
		perPublisher = 200
		sessions     = 4
		subscribers  = 8
	)
	l := New(500, 500)
	sessionIDs := make([]string, sessions)
	for i := range sessionIDs {
		sessionIDs[i] = fmt.Sprintf("ses_%d", i)
	}

	var wg sync.WaitGroup
	wg.Add(publishers)
	for p := 0; p < publishers; p++ {
		go func(p int) {
			defer wg.Done()
			sessionID := sessionIDs[p%sessions]
			for i := 0; i < perPublisher; i++ {
				l.Publish("x", sessionID, map[string]int{"i": i})
			}
		}(p)
	}

	wg.Add(subscribers)
	for s := 0; s < subscribers; s++ {
		go func(s int) {
			defer wg.Done()
			sessionID := sessionIDs[s%sessions]
			for round := 0; round < 5; round++ {
				afterSeq := uint64(0)
				if round%2 == 1 {
					afterSeq = 1
				}
				sub, err := l.Subscribe(sessionID, afterSeq, 4)
				if err != nil {
					if errors.Is(err, ErrReplayUnavailable) {
						continue
					}
					t.Errorf("subscribe error: %v", err)
					continue
				}
				for i := 0; i < 2; i++ {
					select {
					case <-sub.Events():
					case <-time.After(20 * time.Millisecond):
					}
				}
				sub.Close()
			}
		}(s)
	}

	wg.Wait()

	for _, sessionID := range sessionIDs {
		seqs := l.sessionSeqs(sessionID)
		want := publishers / sessions * perPublisher
		if len(seqs) != want {
			t.Fatalf("session %s: got %d events, want %d", sessionID, len(seqs), want)
		}
		for i, seq := range seqs {
			if seq != uint64(i+1) {
				t.Fatalf("session %s: seq not contiguous at index %d: %v", sessionID, i, seqs)
			}
		}
	}

	if got := l.subscriberCount(); got != 0 {
		t.Fatalf("subscriberCount = %d, want 0 after all closes", got)
	}
}

func TestSubscribeDoesNotCreateRing(t *testing.T) {
	l := New(10, 10)
	sub, err := l.Subscribe("ses_new", 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	if _, ok := l.perSession["ses_new"]; ok {
		t.Fatal("subscribe created a ring")
	}
	if _, err := l.Subscribe("ses_other", 1, 8); !errors.Is(err, ErrReplayUnavailable) {
		t.Fatalf("got %v", err)
	}
	if _, ok := l.perSession["ses_other"]; ok {
		t.Fatal("failed replay created a ring")
	}
	l.Publish("y", "ses_new", nil)
	if ev := recv(t, sub); ev.Type != "y" {
		t.Fatalf("got %s", ev.Type)
	}
}

func TestDropRemovesRingAndClosesSubscribers(t *testing.T) {
	l := New(10, 10)
	sub, err := l.Subscribe("ses_a", 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer sub.Close()
	other, err := l.Subscribe("ses_b", 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer other.Close()
	l.Publish("x", "ses_a", nil)
	if ev := recv(t, sub); ev.Type != "x" {
		t.Fatalf("got %s", ev.Type)
	}
	l.Drop("ses_a")
	if _, ok := l.perSession["ses_a"]; ok {
		t.Fatal("ring not removed")
	}
	if got := l.subscriberCount(); got != 1 {
		t.Fatalf("subscriberCount = %d, want 1", got)
	}
	l.Publish("y", "ses_a", nil)
	select {
	case ev := <-sub.Events():
		t.Fatalf("dropped subscription received %+v", ev)
	default:
	}
	l.Publish("z", "ses_b", nil)
	if ev := recv(t, other); ev.Type != "z" {
		t.Fatalf("got %s", ev.Type)
	}
}

func TestPublishEmptySessionOnlyGlobal(t *testing.T) {
	l := New(10, 10)
	global, err := l.Subscribe("", 0, 8)
	if err != nil {
		t.Fatal(err)
	}
	defer global.Close()
	ev := l.Publish("x", "", nil)
	if ev.Seq != 1 {
		t.Fatalf("seq %d", ev.Seq)
	}
	if len(l.perSession) != 0 {
		t.Fatalf("rings %d", len(l.perSession))
	}
	if got := recv(t, global); got.Type != "x" {
		t.Fatalf("got %s", got.Type)
	}
}
