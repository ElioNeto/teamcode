package parentwatch

import (
	"context"
	"os"
	"os/exec"
	"runtime"
	"testing"
	"time"
)

func TestAliveReportsOwnProcess(t *testing.T) {
	if !Alive(os.Getpid()) {
		t.Fatal("own process reported as not alive")
	}
}

func TestAliveReportsExitedChild(t *testing.T) {
	pid := exitedChildPid(t)
	if Alive(pid) {
		t.Fatalf("exited child %d reported as alive", pid)
	}
}

func TestWatchFiresWhenParentGone(t *testing.T) {
	pid := exitedChildPid(t)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	gone := make(chan struct{})
	go Watch(ctx, pid, 10*time.Millisecond, func() { close(gone) })

	select {
	case <-gone:
	case <-ctx.Done():
		t.Fatal("watch did not fire for exited parent")
	}
}

func TestWatchStopsOnContextCancel(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan struct{})
	go func() {
		Watch(ctx, os.Getpid(), 10*time.Millisecond, func() { t.Error("onGone fired for live parent") })
		close(done)
	}()
	cancel()

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("watch did not return after cancel")
	}
}

func exitedChildPid(t *testing.T) int {
	t.Helper()
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("cmd", "/c", "exit 0")
	} else {
		cmd = exec.Command("true")
	}
	if err := cmd.Run(); err != nil {
		t.Fatalf("spawn helper child: %v", err)
	}
	return cmd.Process.Pid
}
