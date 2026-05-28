---
name: cli
description: Work with the CLI application. Use when modifying CLI commands, the TUI, argument parsing, or command-line workflows.
---

# CLI

The CLI application is in `packages/teamcode/src/cli/` and provides the terminal user interface and commands.

## Architecture

```
packages/teamcode/src/cli/
├── cmd/                  # CLI commands
│   ├── tui/              # Terminal UI (SolidJS/Ink-style)
│   │   ├── app.tsx       # Main TUI app component
│   │   ├── thread.ts     # CLI entry point
│   │   ├── component/    # TUI components
│   │   ├── context/      # SolidJS context providers
│   │   └── config/       # TUI configuration
│   ├── run/              # Run mode (direct prompt)
│   ├── kill.ts           # Kill running instance
│   └── cmd.ts            # Command framework
├── ui.ts                 # UI utilities
└── index.ts              # CLI entry point
```

## Key Commands

| Command | Description | File |
|---------|-------------|------|
| `tui` | Interactive terminal UI | `packages/teamcode/src/cli/cmd/tui/thread.ts` |
| `run` | Direct prompt mode | `packages/teamcode/src/cli/cmd/run/` |
| `kill [dir]` | Kill running instance | `packages/teamcode/src/cli/cmd/kill.ts` |

## TUI Features

- Built with OpenTUI (custom terminal rendering library)
- SolidJS for reactive UI components
- Keyboard-driven navigation
- Session management, model selection, provider configuration
- Terminal title shows: `TC | {title}@{branch}`
