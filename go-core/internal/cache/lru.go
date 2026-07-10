// Package cache provides a simple generics-based LRU cache.
//
// Thread-safe, O(1) get/set, with TTL expiration.
// Designed for caching filesystem stat results and config lookups
// to reduce disk I/O.
package cache

import (
	"container/list"
	"sync"
	"time"
)

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

type entry[V any] struct {
	key    string
	value  V
	expiry time.Time
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

// Cache is a generic LRU cache with TTL support.
type Cache[V any] struct {
	mu       sync.RWMutex
	ll       *list.List
	items    map[string]*list.Element
	capacity int
	ttl      time.Duration
	onEvict  func(key string, value V)
}

// New creates a new LRU cache.
// capacity: max items before eviction. ttl: time-to-live for each entry.
func New[V any](capacity int, ttl time.Duration) *Cache[V] {
	return &Cache[V]{
		ll:       list.New(),
		items:    make(map[string]*list.Element, capacity),
		capacity: capacity,
		ttl:      ttl,
	}
}

// WithEvictCallback sets a callback for evicted entries.
func (c *Cache[V]) WithEvictCallback(fn func(key string, value V)) *Cache[V] {
	c.onEvict = fn
	return c
}

// Get retrieves a value from the cache.
// Returns the value and true if found and not expired.
func (c *Cache[V]) Get(key string) (V, bool) {
	c.mu.RLock()
	elem, ok := c.items[key]
	if !ok {
		c.mu.RUnlock()
		var zero V
		return zero, false
	}

	entry := elem.Value.(*entry[V])
	if !entry.expiry.IsZero() && time.Now().After(entry.expiry) {
		c.mu.RUnlock()
		c.Delete(key)
		var zero V
		return zero, false
	}

	c.mu.RUnlock()

	// Move to front (LRU)
	c.mu.Lock()
	c.ll.MoveToFront(elem)
	c.mu.Unlock()

	return entry.value, true
}

// Set adds or updates a value in the cache.
func (c *Cache[V]) Set(key string, value V) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if elem, ok := c.items[key]; ok {
		c.ll.MoveToFront(elem)
		elem.Value.(*entry[V]).value = value
		elem.Value.(*entry[V]).expiry = time.Now().Add(c.ttl)
		return
	}

	elem := c.ll.PushFront(&entry[V]{
		key:    key,
		value:  value,
		expiry: time.Now().Add(c.ttl),
	})
	c.items[key] = elem

	if c.ll.Len() > c.capacity {
		c.evictOldest()
	}
}

// Delete removes a key from the cache.
func (c *Cache[V]) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if elem, ok := c.items[key]; ok {
		c.removeElement(elem)
	}
}

// Len returns the number of items in the cache.
func (c *Cache[V]) Len() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.ll.Len()
}

// evictOldest removes the least recently used item.
func (c *Cache[V]) evictOldest() {
	elem := c.ll.Back()
	if elem != nil {
		c.removeElement(elem)
	}
}

func (c *Cache[V]) removeElement(elem *list.Element) {
	c.ll.Remove(elem)
	entry := elem.Value.(*entry[V])
	delete(c.items, entry.key)
	if c.onEvict != nil {
		c.onEvict(entry.key, entry.value)
	}
}

// Clear removes all items from the cache.
func (c *Cache[V]) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.ll.Init()
	clear(c.items)
}

// ---------------------------------------------------------------------------
// Common cache instances
// ---------------------------------------------------------------------------

// StatCache caches filesystem stat results (reduces disk I/O).
var StatCache = New[StatEntry](10000, 5*time.Second)

// StatEntry represents cached stat information.
type StatEntry struct {
	Size    int64
	ModTime time.Time
	IsDir   bool
}
