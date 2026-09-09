//go:build !windows

package parentwatch

import (
	"errors"
	"syscall"
)

func Alive(pid int) bool {
	err := syscall.Kill(pid, 0)
	return err == nil || errors.Is(err, syscall.EPERM)
}
