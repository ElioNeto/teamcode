package parentwatch

import (
	"context"
	"time"
)

func Watch(ctx context.Context, pid int, interval time.Duration, onGone func()) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if !Alive(pid) {
				onGone()
				return
			}
		}
	}
}
