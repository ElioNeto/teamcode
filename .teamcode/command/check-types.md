---
description: "Run typecheck across the entire monorepo or specific packages"
---

Run TypeScript type checking across the monorepo.

## Full typecheck (all packages):
```bash
bun run typecheck
```

## Specific package:
```bash
cd packages/$ARGUMENTS && bun run typecheck
```

Examples:
- `cd packages/teamcode && bun run typecheck`
- `cd packages/core && bun run typecheck`
- `cd packages/app && bun run typecheck`

This runs `tsgo --noEmit` for type checking without emitting compiled files.
