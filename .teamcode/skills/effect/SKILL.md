---
name: effect
description: Work with Effect v4 / effect-smol TypeScript code in this repo
---

# Effect

This codebase uses Effect for typed, composable TypeScript services, schemas, and workflows.

## Source Of Truth

This repo uses Effect v4 (effect-smol). The config schema is in `packages/core/src/schema.ts`, and the canonical Effect patterns are documented in `packages/teamcode/AGENTS.md` under `# teamcode Effect rules`.

1. Read `packages/teamcode/AGENTS.md` for the project's Effect rules and conventions before writing Effect code.
2. Inspect existing repo code (e.g., `packages/teamcode/src/`, `packages/core/src/`) for local house style before introducing new patterns.
3. Search for specific Effect APIs in the `node_modules/.bun/effect@4.0.0-beta.65/` directory for exact API signatures when unsure.
4. Prefer answers and implementations backed by specific source files or nearby repo examples.

## Guidelines

- Prefer current Effect v4 APIs and project-local patterns over old blog posts, examples, or package-memory guesses.
- Use `Effect.gen(function* () { ... })` for multi-step workflows.
- Use `Effect.fn("Name")` or `Effect.fnUntraced(...)` for named effects when adding reusable service methods or important workflows.
- Prefer Effect `Schema` for API and domain data shapes. Use branded schemas for IDs and `Schema.TaggedErrorClass` for typed domain errors when modeling new error surfaces.
- Keep HTTP handlers thin: decode input, read request context, call services, and map transport errors. Put business rules in services.
- In Effect service code, prefer Effect-aware platform abstractions and dependencies over ad hoc promises where the surrounding code already does so.
- Keep layer composition explicit. Avoid broad hidden provisioning that makes missing dependencies hard to see.
- In tests, prefer the repo's existing Effect test helpers and live tests for filesystem, git, child process, locks, or timing behavior.
- Do not introduce `any`, non-null assertions, unchecked casts, or older Effect APIs just to satisfy types.
- Do not answer from memory. Verify against `.opencode/references/effect-smol` or nearby code first.

## Testing Patterns

- Use `testEffect(...)` from `packages/teamcode/test/lib/effect.ts` for tests that exercise Effect services, layers, runtime context, scoped resources, or platform integrations.
- Use `it.live(...)` for filesystem, git repositories, HTTP servers, sockets, child processes, locks, real time, and other live platform behavior.
- Run tests from package directories such as `packages/teamcode`; never run package tests from the repo root.
- Prefer explicit test layers over ad hoc managed runtimes. Keep dependency provisioning visible in the test file.
- Use scoped fixtures and finalizers for resources that must be cleaned up, including temporary directories, flags, databases, fibers, servers, and global state.
