package watcher

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestWatchFile(t *testing.T) {
	dir := t.TempDir()
	file := filepath.Join(dir, "test.txt")
	if err := os.WriteFile(file, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	w := New(100 * time.Millisecond)
	if err := w.Watch(file); err != nil {
		t.Fatal(err)
	}
	w.Start()
	defer w.Stop()

	// Modify the file
	time.Sleep(50 * time.Millisecond)
	if err := os.WriteFile(file, []byte("world"), 0644); err != nil {
		t.Fatal(err)
	}

	select {
	case ev := <-w.Events():
		if ev.Type != Modify {
			t.Errorf("expected Modify, got %s", ev.Type)
		}
		if ev.Path != file {
			t.Errorf("expected path %s, got %s", file, ev.Path)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("timeout waiting for modify event")
	}
}

func TestWatchDelete(t *testing.T) {
	dir := t.TempDir()
	file := filepath.Join(dir, "test.txt")
	if err := os.WriteFile(file, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	w := New(100 * time.Millisecond)
	if err := w.Watch(file); err != nil {
		t.Fatal(err)
	}
	w.Start()
	defer w.Stop()

	// Delete the file
	time.Sleep(50 * time.Millisecond)
	if err := os.Remove(file); err != nil {
		t.Fatal(err)
	}

	select {
	case ev := <-w.Events():
		if ev.Type != Delete {
			t.Errorf("expected Delete, got %s", ev.Type)
		}
		if ev.Path != file {
			t.Errorf("expected path %s, got %s", file, ev.Path)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("timeout waiting for delete event")
	}
}

func TestWatchDirectory(t *testing.T) {
	dir := t.TempDir()
	w := New(100 * time.Millisecond)
	if err := w.Watch(dir); err != nil {
		t.Fatal(err)
	}
	w.Start()
	defer w.Stop()

	// Create a new file in the directory
	time.Sleep(50 * time.Millisecond)
	newFile := filepath.Join(dir, "new.txt")
	if err := os.WriteFile(newFile, []byte("new"), 0644); err != nil {
		t.Fatal(err)
	}

	select {
	case ev := <-w.Events():
		if ev.Type != Modify {
			t.Errorf("expected Modify, got %s", ev.Type)
		}
		// The event might be for the directory itself (contents changed)
		// or polling will catch it
		if ev.Path != dir {
			t.Logf("got event for path %s (expected %s)", ev.Path, dir)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("timeout waiting for directory modify event")
	}
}

func TestUnwatch(t *testing.T) {
	dir := t.TempDir()
	file := filepath.Join(dir, "test.txt")
	if err := os.WriteFile(file, []byte("hello"), 0644); err != nil {
		t.Fatal(err)
	}

	w := New(100 * time.Millisecond)
	if err := w.Watch(file); err != nil {
		t.Fatal(err)
	}
	w.Start()
	defer w.Stop()

	w.Unwatch(file)

	// Modify the file
	time.Sleep(50 * time.Millisecond)
	os.WriteFile(file, []byte("world"), 0644)

	// Should not receive event since we unwatched
	select {
	case ev := <-w.Events():
		t.Errorf("unexpected event after unwatch: %+v", ev)
	case <-time.After(500 * time.Millisecond):
		// expected
	}
}

func TestWatchNonExistent(t *testing.T) {
	w := New(100 * time.Millisecond)
	err := w.Watch("/nonexistent/path/file.txt")
	if err == nil {
		t.Error("expected error watching non-existent path")
	}
}

func TestMultipleWatches(t *testing.T) {
	dir := t.TempDir()
	f1 := filepath.Join(dir, "a.txt")
	f2 := filepath.Join(dir, "b.txt")
	os.WriteFile(f1, []byte("a"), 0644)
	os.WriteFile(f2, []byte("b"), 0644)

	w := New(100 * time.Millisecond)
	w.Watch(f1)
	w.Watch(f2)

	if w.WatchedCount() != 2 {
		t.Errorf("expected 2 watched paths, got %d", w.WatchedCount())
	}
}
