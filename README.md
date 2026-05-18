<p align="center">
 
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://discord.gg/teamcode"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://github.com/teamcode/teamcode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/teamcode/teamcode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

TeamCode is an open source AI-powered coding agent that runs in your terminal. It helps you navigate, understand, and modify codebases through natural language conversations.

---

### Getting Started

```bash
git clone https://github.com/teamcode/teamcode.git
cd teamcode
bun install
bun run --cwd packages/teamcode --conditions=browser src/index.ts
```

> TeamCode is in active development. Pre-built packages will be available once the project reaches a stable release.

### Agents

TeamCode includes two built-in agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

Also included is a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

### Contributing

If you're interested in contributing to TeamCode, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

---

**Join our community** [Discord](https://discord.gg/teamcode) | [X.com](https://x.com/teamcode)

### Visual Validation Agent

TeamCode includes an automated visual validation system for the web UI (`packages/app`). It uses Playwright to navigate routes, capture screenshots, compare against baselines, and generate detailed reports.

**Routes validated:** Home, Session, Dashboard, Error, Directory layout — each tested at desktop (1280×800), tablet (768×1024), and mobile (375×667) viewports.

**Run locally:**

```bash
# Validate against a running dev server (http://localhost:3000)
bun run visual-validation

# Capture new baselines after intentional UI changes
bun run visual-validation:capture

# Via Playwright (produces HTML report)
bun run test:e2e:visual

# CI mode with JUnit output and 1% diff threshold
bun run test:e2e:visual:ci
```

**CI:** The `visual-validation.yml` workflow runs automatically on pushes/PRs touching UI files. It uploads screenshots, diff images, and a self-contained HTML report as artifacts, publishes JUnit results, and comments on PRs with a summary.

**Architecture:**

| File | Purpose |
|------|---------|
| `packages/app/visual-validation/routes.ts` | Route definitions with viewports, interactions, baseline names |
| `packages/app/visual-validation/validator.ts` | Playwright-based navigation, capture, pixelmatch comparison |
| `packages/app/visual-validation/reporter.ts` | JSON, self-contained HTML, and Markdown summary reports |
| `packages/app/visual-validation/cli.ts` | Standalone CLI entry point |
| `packages/app/e2e/visual-validation.spec.ts` | Playwright test suite with per-route diff thresholds |
| `.github/workflows/visual-validation.yml` | CI workflow triggered on UI changes |

---

### Delivery Loop Agent

TeamCode includes a **Delivery Loop** agent — an autonomous pipeline that continuously resolves open GitHub issues. It fetches issues in batches of 10 and runs each through a **Plan → Implement → Validate → Review → (next)** cycle. If validation or review fails, it retries the implementation. If the issue is too complex, it returns to planning. It never stops until no eligible issues remain or the user presses Ctrl+C.

**Architecture:**

The Delivery Loop is configured as a primary agent (`.opencode/agent/delivery-loop.md`) with the same unrestricted permissions as the **god** agent. It orchestrates the following subagents:

| Agent | File | Role |
|-------|------|------|
| **planner** | `.opencode/agents/planner.md` | Decomposes tasks into structured steps, identifies dependencies |
| **researcher** | `.opencode/agents/researcher.md` | Explores codebase, traces dependencies, gathers evidence |
| **executor** | `.opencode/agents/executor.md` | Implements code changes following the plan |
| **reviewer** | `.opencode/agents/reviewer.md` | Reviews quality, correctness, consistency post-implementation |

**Pipeline:**

```
┌─────────────────────────────────────────────────────────────┐
│  Fetch 10 open issues from GitHub                           │
│       │                                                     │
│       ▼                                                     │
│  For each issue (sequentially):                             │
│       │                                                     │
│       ▼                                                     │
│  ┌───────┐     ┌──────────┐     ┌──────────┐     ┌──────┐  │
│  │ Plan  │────→│Implement │────→│ Validate │────→│Review│  │
│  └───┬───┘     └────┬─────┘     └────┬─────┘     └──┬───┘  │
│      │              │                │              │      │
│      │              │    ┌───────────┘              │      │
│      │              │    │  (validation failed)     │      │
│      │              └────┼──────────────────────────┘      │
│      │                   │  (review failed — simple)       │
│      └───────────────────┼─────────────────────────────────┘
│                          │  (review failed — complex)       │
│                          ▼                                  │
│                     ┌─────────┐                             │
│                     │  Commit │────→ Close Issue ───→ Next  │
│                     └─────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

**Error recovery:**

| Situation | Action |
|-----------|--------|
| Validate fails | Return to **Implement** with error context |
| Review fails (simple issue) | Return to **Implement** |
| Review fails (complex issue, score ≥5) | Return to **Plan** |
| 3 consecutive failures on same issue | Skip issue with explanatory comment |
| Issue too complex at planning | Skip with comment "needs manual triage" |

**Switch to the Delivery Loop agent:**
Use the `Tab` key to switch between agents in the TeamCode TUI, or set it as the default in `opencode.jsonc`.

**Standalone script (alternative):**

```bash
bun run scripts/issue-resolver/resolver.ts
```

The standalone script uses `$GH_TOKEN` for GitHub API access and requires a clean working tree. It follows the same pipeline and supports these flags:

| Flag | Description |
|------|-------------|
| `--bugs-only` | Only process issues labeled as bugs |
| `--labels=X,Y` | Only process issues with these labels |
| `--batch=N` | Issues per batch (default: 10) |
| `--max-attempts=N` | Max attempts per issue (default: 3) |
| `--once` | Process one batch and exit |
| `--dry-run` | Fetch and list issues without processing |

---

_Based on [opencode](https://github.com/sst/opencode) (MIT)_
