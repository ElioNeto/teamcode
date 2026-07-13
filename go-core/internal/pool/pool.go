// Package pool provides memory and worker pools to reduce allocations.
//
// Core design:
//   - Buffer pools for JSON serialization (zero-copy where possible)
//   - Worker pool for CPU-bound tasks
//   - Sync.Pool wrappers for common allocations
package pool

import (
	"encoding/json"
	"sync"
)

// ---------------------------------------------------------------------------
// Buffer pools
// ---------------------------------------------------------------------------

// BufferPool is a pool of byte slices for temporary use.
type BufferPool struct {
	pool sync.Pool
}

// NewBufferPool creates a buffer pool with the given initial size.
func NewBufferPool(initialSize int) *BufferPool {
	return &BufferPool{
		pool: sync.Pool{
			New: func() any {
				buf := make([]byte, 0, initialSize)
				return &buf
			},
		},
	}
}

// Get returns a zero-length buffer with the pool's initial capacity.
func (p *BufferPool) Get() *[]byte {
	buf := p.pool.Get().(*[]byte)
	*buf = (*buf)[:0]
	return buf
}

// Put returns a buffer to the pool.
func (p *BufferPool) Put(buf *[]byte) {
	if buf != nil {
		p.pool.Put(buf)
	}
}

// ---------------------------------------------------------------------------
// JSON encoder pool (reduces encoder allocations)
// ---------------------------------------------------------------------------

var jsonEncoderPool = sync.Pool{
	New: func() any {
		return json.NewEncoder(nil)
	},
}

// ---------------------------------------------------------------------------
// Worker pool for CPU-bound tasks
// ---------------------------------------------------------------------------

// WorkerPool limits concurrent goroutines for CPU-bound work.
type WorkerPool struct {
	workers chan struct{}
	wg      sync.WaitGroup
}

// NewWorkerPool creates a worker pool with the given concurrency limit.
func NewWorkerPool(limit int) *WorkerPool {
	if limit <= 0 {
		limit = 32 // default
	}
	return &WorkerPool{
		workers: make(chan struct{}, limit),
	}
}

// Run executes fn in a goroutine, respecting the concurrency limit.
func (p *WorkerPool) Run(fn func()) {
	p.workers <- struct{}{}
	p.wg.Add(1)
	go func() {
		defer func() {
			<-p.workers
			p.wg.Done()
		}()
		fn()
	}()
}

// Wait blocks until all running tasks complete.
func (p *WorkerPool) Wait() {
	p.wg.Wait()
}

// ---------------------------------------------------------------------------
// Global pools (convenience)
// ---------------------------------------------------------------------------

// Buffer8K is a pool of 8KB buffers (common for file reads).
var Buffer8K = NewBufferPool(8192)

// Buffer64K is a pool of 64KB buffers (for large JSON responses).
var Buffer64K = NewBufferPool(65536)

// GlobalWorkerPool is the default worker pool for CPU-bound tasks.
var GlobalWorkerPool = NewWorkerPool(32)
