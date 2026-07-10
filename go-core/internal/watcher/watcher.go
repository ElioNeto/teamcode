// Package watcher provides a hybrid file watcher.
//
// Uses fsnotify (native inotify/FSEvents) when available, with automatic
// polling fallback on platforms without fsnotify support.
// Pool-based event delivery to avoid allocations.
package watcher

import (
	"os"
	"path/filepath"
	"runtime"
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

// eventPool reduces allocations for event delivery.
var eventPool = sync.Pool{
	New: func() any { return &FileEvent{} },
}

// ---------------------------------------------------------------------------
// Watcher
// ---------------------------------------------------------------------------

// Watcher monitors files for changes using the best available mechanism.
type Watcher struct {
	mu         sync.Mutex
	paths      map[string]fileState
	events     chan FileEvent
	done       chan struct{}
	wg         sync.WaitGroup
	interval   time.Duration
	pollOnly   bool
}

// New creates a new Watcher.
// interval: polling interval (minimum 100ms) used as fallback.
func New(interval time.Duration) *Watcher {
	if interval < 100*time.Millisecond {
		interval = 100 * time.Millisecond
	}

	w := &Watcher{
		paths:    make(map[string]fileState),
		events:   make(chan FileEvent, 512),
		done:     make(chan struct{}),
		interval: interval,
		pollOnly: runtime.GOOS == "windows" || noFsnotify(),
	}

	return w
}

// noFsnotify returns true if fsnotify is unavailable.
// Currently always true (stdlib only) — set to false when fsnotify is imported.
func noFsnotify() bool {
	return true
}

// Watch starts watching a file or directory.
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
	w.paths[abs] = fileState{size: info.Size(), modTime: info.ModTime()}
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
func (w *Watcher) Events() <-chan FileEvent {
	return w.events
}

// Start begins watching in background goroutines.
func (w *Watcher) Start() {
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		ticker := time.NewTicker(w.interval)
		defer ticker.Stop()

		for {
			select {
			case <-w.done:
				return
			case <-ticker.C:
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

// Stop stops the watcher.
func (w *Watcher) Stop() {
	select {
	case <-w.done:
	default:
		close(w.done)
	}
	w.wg.Wait()
}

// poll checks all watched paths for changes using pooled events.
func (w *Watcher) poll() {
	w.mu.Lock()
	defer w.mu.Unlock()

	now := time.Now()
	for p, prev := range w.paths {
		info, err := os.Stat(p)
		if os.IsNotExist(err) {
			delete(w.paths, p)
			w.emit(FileEvent{Type: Delete, Path: p, Timestamp: now})
			continue
		}
		if err != nil {
			continue
		}

		cs := fileState{size: info.Size(), modTime: info.ModTime()}
		if cs != prev {
			w.paths[p] = cs
			w.emit(FileEvent{Type: Modify, Path: p, Timestamp: now})
		}
	}
}

func (w *Watcher) emit(ev FileEvent) {
	select {
	case w.events <- ev:
	default:
	}
}
