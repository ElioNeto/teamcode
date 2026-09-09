package eventlog

import (
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/ident"
)

var ErrReplayUnavailable = errors.New("replay_unavailable")

type Event struct {
	ID        string          `json:"id"`
	Seq       uint64          `json:"seq"`
	Type      string          `json:"type"`
	SessionID string          `json:"sessionID,omitempty"`
	Data      json.RawMessage `json:"data"`
	Timestamp int64           `json:"timestamp"`
}

func (e Event) SSE() []byte {
	data := e.Data
	if len(data) == 0 {
		data = json.RawMessage("{}")
	}
	return []byte(fmt.Sprintf("event: %s\nid: %d\ndata: %s\n\n", e.Type, e.Seq, data))
}

type ring struct {
	size    int
	items   []Event
	nextSeq uint64
}

func newRing(size int) *ring { return &ring{size: size, nextSeq: 1} }

func (r *ring) append(ev Event) Event {
	ev.Seq = r.nextSeq
	r.nextSeq++
	r.items = append(r.items, ev)
	if len(r.items) > r.size {
		r.items = r.items[len(r.items)-r.size:]
	}
	return ev
}

func (r *ring) after(seq uint64) ([]Event, error) {
	if len(r.items) == 0 {
		if seq >= r.nextSeq-1 {
			return nil, nil
		}
		return nil, ErrReplayUnavailable
	}
	oldest := r.items[0].Seq
	if seq+1 < oldest {
		return nil, ErrReplayUnavailable
	}
	var out []Event
	for _, ev := range r.items {
		if ev.Seq > seq {
			out = append(out, ev)
		}
	}
	return out, nil
}

type Subscription struct {
	sessionID string
	events    chan Event
	lagged    chan struct{}
	closeOnce sync.Once
	done      chan struct{}
}

func (s *Subscription) Events() <-chan Event    { return s.events }
func (s *Subscription) Lagged() <-chan struct{} { return s.lagged }
func (s *Subscription) Close() {
	s.closeOnce.Do(func() { close(s.done) })
}

func (s *Subscription) deliver(ev Event) bool {
	select {
	case <-s.done:
		return false
	default:
	}
	select {
	case s.events <- ev:
		return true
	default:
		select {
		case s.lagged <- struct{}{}:
		default:
		}
		s.Close()
		return false
	}
}

type Log struct {
	mu          sync.Mutex
	perSession  map[string]*ring
	global      *ring
	ringSize    int
	subscribers map[*Subscription]struct{}
}

func New(perSessionRing, globalRing int) *Log {
	return &Log{perSession: map[string]*ring{}, global: newRing(globalRing), ringSize: perSessionRing, subscribers: map[*Subscription]struct{}{}}
}

func (l *Log) sessionRing(sessionID string) *ring {
	r, ok := l.perSession[sessionID]
	if !ok {
		r = newRing(l.ringSize)
		l.perSession[sessionID] = r
	}
	return r
}

func (l *Log) Publish(eventType, sessionID string, data any) Event {
	body, err := json.Marshal(data)
	if err != nil || data == nil {
		body = json.RawMessage("{}")
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	ev := Event{ID: ident.Event(), Type: eventType, SessionID: sessionID, Data: body, Timestamp: time.Now().UnixMilli()}
	stored := l.sessionRing(sessionID).append(ev)
	globalCopy := l.global.append(ev)
	for sub := range l.subscribers {
		var toDeliver Event
		switch sub.sessionID {
		case "":
			toDeliver = globalCopy
		case sessionID:
			toDeliver = stored
		default:
			continue
		}
		if !sub.deliver(toDeliver) {
			delete(l.subscribers, sub)
		}
	}
	return stored
}

func (l *Log) Subscribe(sessionID string, afterSeq uint64, buffer int) (*Subscription, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	source := l.global
	if sessionID != "" {
		source = l.sessionRing(sessionID)
	}
	var backlog []Event
	if afterSeq > 0 {
		var err error
		if backlog, err = source.after(afterSeq); err != nil {
			return nil, err
		}
	}
	if buffer < len(backlog)+1 {
		buffer = len(backlog) + 1
	}
	sub := &Subscription{sessionID: sessionID, events: make(chan Event, buffer), lagged: make(chan struct{}, 1), done: make(chan struct{})}
	for _, ev := range backlog {
		sub.events <- ev
	}
	l.subscribers[sub] = struct{}{}
	return sub, nil
}
