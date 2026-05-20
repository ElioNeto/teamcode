---
description: "Run a full dependency audit across the monorepo — checks for outdated, conflicting, duplicate, or vulnerable dependencies in all package.json files."
agent: deps
subtask: true
---

Run a dependency audit across the entire monorepo.

Use the @deps agent to:

1. Read ALL package.json files in the repository (root + all packages/)
2. Check for:
   - Outdated dependencies (newer versions available)
   - Version drift (same dep at different versions across packages)
   - Deprecated or unmaintained packages
   - Peer dependency mismatches
   - Potential unused dependencies
   - Security vulnerabilities (via `bun audit` / `npm audit`)
   - Duplicate packages (hoisting issues)
   - Bun runtime compatibility issues
3. Generate a comprehensive `dependency-audit-report.md`

$ARGUMENTS

Focus areas if specified in arguments:
- Specific packages to audit
- Specific dependency categories to check
- Output format preferences
