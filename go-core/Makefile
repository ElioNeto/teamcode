.PHONY: build run clean test

# Go core build and development commands

BUILD_DIR := build
SERVER_BIN := $(BUILD_DIR)/go-core-server

build: $(SERVER_BIN)

$(SERVER_BIN):
	go build -o $(SERVER_BIN) ./cmd/server

run: build
	./$(SERVER_BIN)

clean:
	rm -rf $(BUILD_DIR)

test:
	go test ./...

# Development
dev:
	go run ./cmd/server

lint:
	go vet ./...

# Build for CI (cross-platform)
build-ci:
	CGO_ENABLED=0 go build -o $(BUILD_DIR)/go-core-server-linux-amd64 ./cmd/server

# Run parity tests
parity-test:
	cd ../packages/core && bun run test test/parity/
