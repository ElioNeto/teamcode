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

# Cross-compilation for all platforms (CGO_ENABLED=0 for static binaries)
GO_CORE_SRC := ./cmd/server
GO_FLAGS := CGO_ENABLED=0

.PHONY: build-ci cross-all cross-linux cross-darwin cross-windows

build-ci:
	$(GO_FLAGS) go build -o $(BUILD_DIR)/go-core-server-linux-amd64 $(GO_CORE_SRC)

# Cross-compile for all supported platforms
cross-all: cross-linux cross-darwin cross-windows

cross-linux:
	$(GO_FLAGS) GOOS=linux GOARCH=amd64 go build -o $(BUILD_DIR)/go-core-server-linux-x64 $(GO_CORE_SRC)
	$(GO_FLAGS) GOOS=linux GOARCH=arm64 go build -o $(BUILD_DIR)/go-core-server-linux-arm64 $(GO_CORE_SRC)

cross-darwin:
	$(GO_FLAGS) GOOS=darwin GOARCH=amd64 go build -o $(BUILD_DIR)/go-core-server-darwin-x64 $(GO_CORE_SRC)
	$(GO_FLAGS) GOOS=darwin GOARCH=arm64 go build -o $(BUILD_DIR)/go-core-server-darwin-arm64 $(GO_CORE_SRC)

cross-windows:
	$(GO_FLAGS) GOOS=windows GOARCH=amd64 go build -o $(BUILD_DIR)/go-core-server-windows-x64.exe $(GO_CORE_SRC)
	$(GO_FLAGS) GOOS=windows GOARCH=arm64 go build -o $(BUILD_DIR)/go-core-server-windows-arm64.exe $(GO_CORE_SRC)

# Run parity tests (clean build Go binary first, then runs TS tests)
parity-test: clean
	mkdir -p $(BUILD_DIR)
	go build -o $(SERVER_BIN) ./cmd/server
	cd ../packages/core && GO_CORE_BINARY=../../go-core/$(SERVER_BIN) bun test test/parity/ --timeout 30000
