---
name: testing
description: Testing patterns and infrastructure for this monorepo. Use when writing, fixing, or debugging tests. Covers Bun test, Effect test helpers, fixtures, and E2E with Playwright.
---

# Testing

This monorepo uses **Bun test** as the primary test runner and **Playwright** for E2E tests.

## Running Tests

```bash
# Package-level tests (NEVER from root)
cd packages/teamcode && bun run test --timeout 120000

# Single file
cd packages/teamcode && bun test test/provider/provider.test.ts --timeout 120000

# Pattern match
cd packages/teamcode && bun test --timeout 120000 -t "provider"

# Typecheck
cd packages/teamcode && bun run typecheck
```

## Effect Test Helpers

The project uses `testEffect(...)` from `packages/teamcode/test/lib/effect.ts` for Effect-based tests.

### Test Lifecycle Helpers

| Helper | Use case |
|--------|----------|
| `it.effect(...)` | Tests with `TestClock`, `TestConsole` |
| `it.live(...)` | Tests needing real time, FS, git, processes |
| `it.instance(...)` | Tests needing temp directory + instance context |

### Fixtures

| Fixture | Purpose |
|---------|---------|
| `tmpdir()` | Temp directory with cleanup |
| `withTestInstance()` | Instance context with temp dir |
| `provideTmpdirInstance()` | Effect scoped temp dir + instance |
| `TestInstance` | Effect service with temp dir path |

### Synchronization

- **Do NOT use** `Effect.sleep(N)` to wait for concurrent work
- **Use** `pollWithTimeout(effect, message, timeout?)` to wait for readiness signals
- **Use** `SessionStatus.Service.get(sessionID)` to check session state
- **Use** `llm.wait(n)` to wait for mock LLM calls

## Guidelines

- Read `packages/teamcode/test/AGENTS.md` for comprehensive fixture guide
- Prefer integration tests over unit tests with mocks
- Use `Layer.mock` for partial service stubs
- Tests must pass before committing
