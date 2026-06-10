// Package watcher provides a polling-based file watcher.
//
// Uses time.Ticker + os.Stat to detect file changes at a configurable
// interval. No external dependencies beyond Go stdlib.
//
// Event types detected: Modify (content or metadata change), Delete.
package watcher

import (
	"os"
	"path/filepath"
	"sync"
	"time"
)

// EventType describes what happened to a file.
type EventType string

const (
	Modify EventType = "modify"
	Delete EventType = "delete"
)

// FileEvent represents a file system change.
type FileEvent struct {
	Type      EventType `json:"type"`
	Path      string    `json:"path"`
	Timestamp time.Time `json:"timestamp"`
}

// fileState tracks the last known state of a file.
type fileState struct {
	size    int64
	modTime time.Time
}

// Watcher polls files for changes at a configurable interval.
// Thread-safe.
type Watcher struct {
	mu       sync.Mutex
	paths    map[string]fileState
	events   chan FileEvent
	ticker   *time.Ticker
	quit     chan struct{}
	wg       sync.WaitGroup
	interval time.Duration
}

// New creates a new Watcher with the given poll interval.
// Minimum interval is 100ms. Use Start() to begin polling.
func New(interval time.Duration) *Watcher {
	if interval < 100*time.Millisecond {
		interval = 100 * time.Millisecond
	}
	return &Watcher{
		paths:    make(map[string]fileState),
		events:   make(chan FileEvent, 256),
		quit:     make(chan struct{}),
		interval: interval,
	}
}

// Watch starts watching a file or directory.
// The initial state is captured synchronously; change events begin arriving
// after Start() is called.
func (w *Watcher) Watch(path string) error {
	abs, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	info, err := os.Stat(abs)
	if err != nil {
		return err
	}

	w.mu.Lock()
	w.paths[abs] = fileState{
		size:    info.Size(),
		modTime: info.ModTime(),
	}
	w.mu.Unlock()
	return nil
}

// Unwatch stops watching a path.
func (w *Watcher) Unwatch(path string) {
	abs, _ := filepath.Abs(path)
	w.mu.Lock()
	delete(w.paths, abs)
	w.mu.Unlock()
}

// Events returns a read-only channel of file events.
// The channel is NOT closed on Stop (consumers should call Stop and then
// stop reading from Events in their own goroutine).
func (w *Watcher) Events() <-chan FileEvent {
	return w.events
}

// Start begins polling in a background goroutine.
func (w *Watcher) Start() {
	w.ticker = time.NewTicker(w.interval)
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		for {
			select {
			case <-w.quit:
				return
			case <-w.ticker.C:
				w.poll()
			}
		}
	}()
}

// WatchedCount returns the number of currently watched paths.
func (w *Watcher) WatchedCount() int {
	w.mu.Lock()
	defer w.mu.Unlock()
	return len(w.paths)
}

// Stop stops the polling loop. Safe to call multiple times.
func (w *Watcher) Stop() {
	if w.ticker != nil {
		w.ticker.Stop()
	}
	select {
	case <-w.quit:
	default:
		close(w.quit)
	}
	w.wg.Wait()
}

// poll checks all watched paths for changes under lock.
func (w *Watcher) poll() {
	w.mu.Lock()
	defer w.mu.Unlock()

	now := time.Now()
	for path, prev := range w.paths {
		info, err := os.Stat(path)
		if os.IsNotExist(err) {
			delete(w.paths, path)
			w.emit(FileEvent{Type: Delete, Path: path, Timestamp: now})
			continue
		}
		if err != nil {
			continue
		}

		cs := fileState{size: info.Size(), modTime: info.ModTime()}
		if cs != prev {
			w.paths[path] = cs
			w.emit(FileEvent{Type: Modify, Path: path, Timestamp: now})
		}
	}
}

// emit sends an event to the channel, dropping it if the buffer is full.
func (w *Watcher) emit(ev FileEvent) {
	select {
	case w.events <- ev:
	default:
	}
}
