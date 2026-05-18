<p align="center">
  <picture>
    <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="TeamCode logo">
  </picture>
</p>
<p align="center">The open source AI coding agent.</p>
<p align="center">
  <a href="https://discord.gg/teamcode"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/teamcode-ai"><img alt="npm" src="https://img.shields.io/npm/v/teamcode-ai?style=flat-square" /></a>
  <a href="https://github.com/teamcode/teamcode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/teamcode/teamcode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

TeamCode is an open source AI-powered coding agent that runs in your terminal. It helps you navigate, understand, and modify codebases through natural language conversations.

---

### Installation

```bash
# Package managers
npm i -g teamcode-ai        # or bun/pnpm/yarn
scoop install teamcode             # Windows
choco install teamcode             # Windows
brew install teamcode/tap/teamcode # macOS and Linux (recommended, always up to date)
brew install teamcode              # macOS and Linux (official brew formula, updated less)
sudo pacman -S teamcode            # Arch Linux (Stable)
paru -S teamcode-bin               # Arch Linux (Latest from AUR)
mise use -g teamcode               # Any OS
nix run nixpkgs#teamcode           # or github:teamcode/teamcode for latest dev branch
```

> [!TIP]
> Remove versions older than 0.1.x before installing.

### Desktop App (BETA)

TeamCode is also available as a desktop application. Download directly from the [releases page](https://github.com/teamcode/teamcode/releases).

| Platform              | Download                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `teamcode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `teamcode-desktop-mac-x64.dmg`     |
| Windows               | `teamcode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, or `.AppImage`     |

```bash
# macOS (Homebrew)
brew install --cask teamcode-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/teamcode-desktop
```

#### Installation Directory

The install script respects the following priority order for the installation path:

1. `$TEAMCODE_INSTALL_DIR` - Custom installation directory
2. `$XDG_BIN_DIR` - XDG Base Directory Specification compliant path
3. `$HOME/bin` - Standard user binary directory (if it exists or can be created)
4. `$HOME/.teamcode/bin` - Default fallback

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

_Based on [opencode](https://github.com/sst/opencode) (MIT)_
