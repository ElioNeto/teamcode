package main

import (
	"os"
	"strconv"
	"time"
)

const parentPidEnv = "GO_CORE_PARENT_PID"
const parentPollInterval = 2 * time.Second

func parentPidFromEnv() (int, bool) {
	raw := os.Getenv(parentPidEnv)
	if raw == "" {
		return 0, false
	}
	pid, err := strconv.Atoi(raw)
	if err != nil || pid <= 0 {
		return 0, false
	}
	return pid, true
}
