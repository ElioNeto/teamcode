# teamcode VS Code Extension

A Visual Studio Code extension that integrates [teamcode](https://teamcode.ai) directly into your development workflow.

## Prerequisites

This extension requires the [teamcode CLI](https://teamcode.ai) to be installed on your system. Visit [teamcode.ai](https://teamcode.ai) for installation instructions.

## Features

- **Quick Launch**: Use `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows/Linux) to open teamcode in a split terminal view, or focus an existing terminal session if one is already running.
- **New Session**: Use `Cmd+Shift+Esc` (Mac) or `Ctrl+Shift+Esc` (Windows/Linux) to start a new teamcode terminal session, even if one is already open. You can also click the teamcode button in the UI.
- **Context Awareness**: Automatically share your current selection or tab with teamcode.
- **File Reference Shortcuts**: Use `Cmd+Option+K` (Mac) or `Alt+Ctrl+K` (Linux/Windows) to insert file references. For example, `@File#L37-42`.

## Support

This is an early release. If you encounter issues or have feedback, please create an issue at https://github.com/teamcode/teamcode/issues.

## Development

1. `code sdks/vscode` - Open the `sdks/vscode` directory in VS Code. **Do not open from repo root.**
2. `bun install` - Run inside the `sdks/vscode` directory.
3. Press `F5` to start debugging - This launches a new VS Code window with the extension loaded.

#### Making Changes

`tsc` and `esbuild` watchers run automatically during debugging (visible in the Terminal tab). Changes to the extension are automatically rebuilt in the background.

To test your changes:

1. In the debug VS Code window, press `Cmd+Shift+P`
2. Search for `Developer: Reload Window`
3. Reload to see your changes without restarting the debug session
