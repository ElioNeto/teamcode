---
description: "Run tests for specific packages or test files"
---

Run tests for the specified package or test file.

## Run all tests in a package:
```bash
cd packages/$ARGUMENTS && bun run test --timeout 120000
```

## Run a specific test file:
```bash
cd packages/teamcode && bun test path/to/test.test.ts --timeout 120000
```

## Run tests matching a pattern:
```bash
cd packages/teamcode && bun test --timeout 120000 -t "pattern"
```

## Examples

- `teamcode` — Run all teamcode package tests
- `core` — Run all core package tests
- `test/provider/provider.test.ts` — Run a specific test file
- `provider` — Run tests matching "provider"

**IMPORTANT**: Never run tests from the repo root. Always `cd` into the package directory first.
