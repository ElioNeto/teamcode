package metrics_test

import (
	"testing"
	"time"

	"github.com/ElioNeto/teamcode/go-core/internal/metrics"
)

func TestEmptySnapshot(t *testing.T) {
	c := metrics.New(60 * time.Second)
	s := c.Snapshot()
	if s.RequestCount != 0 {
		t.Errorf("expected 0 requests, got %d", s.RequestCount)
	}
	if s.ErrorCount != 0 {
		t.Errorf("expected 0 errors, got %d", s.ErrorCount)
	}
	if s.ErrorRate != 0 {
		t.Errorf("expected 0 error rate, got %f", s.ErrorRate)
	}
	if s.AvgLatencyMs != 0 {
		t.Errorf("expected 0 avg latency, got %f", s.AvgLatencyMs)
	}
}

func TestRecordAndSnapshot(t *testing.T) {
	c := metrics.New(60 * time.Second)

	c.Record(10*time.Millisecond, false)
	c.Record(20*time.Millisecond, true)
	c.Record(30*time.Millisecond, false)

	s := c.Snapshot()
	if s.RequestCount != 3 {
		t.Errorf("expected 3 requests, got %d", s.RequestCount)
	}
	if s.ErrorCount != 1 {
		t.Errorf("expected 1 error, got %d", s.ErrorCount)
	}
	// Error rate: 1/3 = 0.333...%
	// But it's rate * 100, so 33.33%
	if s.ErrorRate < 33 || s.ErrorRate > 34 {
		t.Errorf("expected ~33.33 error rate, got %f", s.ErrorRate)
	}
	// Average latency: (10+20+30)/3 = 20ms
	if s.AvgLatencyMs < 19 || s.AvgLatencyMs > 21 {
		t.Errorf("expected ~20ms avg latency, got %f", s.AvgLatencyMs)
	}
}

func TestWindowPruning(t *testing.T) {
	c := metrics.New(50 * time.Millisecond)

	// Add entries then wait for window to expire
	c.Record(5*time.Millisecond, false)
	c.Record(5*time.Millisecond, false)

	time.Sleep(60 * time.Millisecond)

	// Add an entry after the window
	c.Record(5*time.Millisecond, false)

	s := c.Snapshot()
	if s.RequestCount != 1 {
		t.Errorf("expected 1 request after pruning, got %d", s.RequestCount)
	}
}

func TestConcurrency(t *testing.T) {
	c := metrics.New(60 * time.Second)

	done := make(chan struct{})
	go func() {
		for i := 0; i < 100; i++ {
			c.Record(time.Millisecond, i%10 == 0)
		}
		done <- struct{}{}
	}()
	go func() {
		for i := 0; i < 100; i++ {
			c.Snapshot()
		}
		done <- struct{}{}
	}()

	<-done
	<-done

	s := c.Snapshot()
	if s.RequestCount != 100 {
		t.Errorf("expected 100 requests, got %d", s.RequestCount)
	}
}
