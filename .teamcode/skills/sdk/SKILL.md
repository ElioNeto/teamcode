---
name: sdk
description: Work with the JavaScript/TypeScript SDK for teamcode. Use when modifying the SDK package, its types, or API client code.
---

# SDK

The JavaScript SDK lives in `packages/sdk/js/` and provides a typed client for the teamcode API.

## Architecture

```
packages/sdk/js/
├── src/
│   ├── v2/              # API v2 client
│   │   ├── gen/         # Auto-generated types and client
│   │   │   ├── types.gen.ts
│   │   │   └── client.gen.ts
│   │   └── ...          # Custom extensions
│   └── ...              # Legacy v1 client
├── script/
│   └── build.ts         # Build script
└── package.json
```

## Key Types

- `VcsInfo` — Git repository info (`branch`, `default_branch`)
- Session types — Messages, sessions, projects
- Provider types — Model, provider configurations

## Regenerating the SDK

```bash
bun run packages/sdk/js/script/build.ts
```

## Guidelines

- The SDK is the public API contract — changes must be backward compatible
- Auto-generated files in `src/v2/gen/` should not be manually edited
- Custom extensions go in separate files alongside the gen directory
- Keep the SDK dependency-free where possible
