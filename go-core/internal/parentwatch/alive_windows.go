//go:build windows

package parentwatch

import "syscall"

const processQueryLimitedInformation = 0x1000

func Alive(pid int) bool {
	handle, err := syscall.OpenProcess(processQueryLimitedInformation, false, uint32(pid))
	if err != nil {
		return false
	}
	defer func() { _ = syscall.CloseHandle(handle) }()
	var exitCode uint32
	if err := syscall.GetExitCodeProcess(handle, &exitCode); err != nil {
		return false
	}
	const stillActive = 259
	return exitCode == stillActive
}
