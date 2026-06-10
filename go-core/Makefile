.PHONY: build run clean test dev lint build-ci parity-test

# Go core build and development commands
BUILD_DIR := build
SERVER_BIN := $(BUILD_DIR)/go-core-server

build: $(SERVER_BIN)

$(SERVER_BIN):
	mkdir -p $(BUILD_DIR)
	go build -o $(SERVER_BIN) ./cmd/server

run: build
	./$(SERVER_BIN)

clean:
	rm -rf $(BUILD_DIR)

test:
	go test ./... -count=1 -v

dev:
	go run ./cmd/server

lint:
	go vet ./...

# Build for CI (cross-platform)
build-ci:
	CGO_ENABLED=0 go build -o $(BUILD_DIR)/go-core-server-linux-amd64 ./cmd/server

# Run parity tests (clean build Go binary first, then runs TS tests)
parity-test: clean
	mkdir -p $(BUILD_DIR)
	go build -o $(SERVER_BIN) ./cmd/server
	cd ../packages/core && GO_CORE_BINARY=../../go-core/$(SERVER_BIN) bun test test/parity/ --timeout 30000
