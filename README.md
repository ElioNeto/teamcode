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

_Based on [opencode](https://github.com/sst/opencode) (MIT)_
