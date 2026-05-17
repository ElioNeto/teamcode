<p align="center">
  <a href="https://teamcode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Logo TeamCode">
    </picture>
  </a>
</p>
<p align="center">L'agent de codage IA open source.</p>
<p align="center">
  <a href="https://teamcode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/teamcode-ai"><img alt="npm" src="https://img.shields.io/npm/v/teamcode-ai?style=flat-square" /></a>
  <a href="https://github.com/teamcode/teamcode/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/teamcode/teamcode/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![TeamCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://teamcode.ai)

---

### Installation

```bash
# YOLO
curl -fsSL https://teamcode.ai/install | bash

# Gestionnaires de paquets
npm i -g teamcode-ai        # ou bun/pnpm/yarn
scoop install teamcode             # Windows
choco install teamcode             # Windows
brew install teamcode/tap/teamcode # macOS et Linux (recommandé, toujours à jour)
brew install teamcode              # macOS et Linux (formule officielle brew, mise à jour moins fréquente)
sudo pacman -S teamcode            # Arch Linux (Stable)
paru -S teamcode-bin               # Arch Linux (Latest from AUR)
mise use -g teamcode               # n'importe quel OS
nix run nixpkgs#teamcode           # ou github:teamcode/teamcode pour la branche dev la plus récente
```

> [!TIP]
> Supprimez les versions antérieures à 0.1.x avant d'installer.

### Application de bureau (BETA)

TeamCode est aussi disponible en application de bureau. Téléchargez-la directement depuis la [page des releases](https://github.com/teamcode/teamcode/releases) ou [teamcode.ai/download](https://teamcode.ai/download).

| Plateforme            | Téléchargement                     |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `teamcode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `teamcode-desktop-mac-x64.dmg`     |
| Windows               | `teamcode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, ou AppImage        |

```bash
# macOS (Homebrew)
brew install --cask teamcode-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/teamcode-desktop
```

#### Répertoire d'installation

Le script d'installation respecte l'ordre de priorité suivant pour le chemin d'installation :

1. `$TEAMCODE_INSTALL_DIR` - Répertoire d'installation personnalisé
2. `$XDG_BIN_DIR` - Chemin conforme à la spécification XDG Base Directory
3. `$HOME/bin` - Répertoire binaire utilisateur standard (s'il existe ou peut être créé)
4. `$HOME/.teamcode/bin` - Repli par défaut

```bash
# Exemples
TEAMCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://teamcode.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://teamcode.ai/install | bash
```

### Agents

TeamCode inclut deux agents intégrés que vous pouvez basculer avec la touche `Tab`.

- **build** - Par défaut, agent avec accès complet pour le travail de développement
- **plan** - Agent en lecture seule pour l'analyse et l'exploration du code
  - Refuse les modifications de fichiers par défaut
  - Demande l'autorisation avant d'exécuter des commandes bash
  - Idéal pour explorer une base de code inconnue ou planifier des changements

Un sous-agent **general** est aussi inclus pour les recherches complexes et les tâches en plusieurs étapes.
Il est utilisé en interne et peut être invoqué via `@general` dans les messages.

En savoir plus sur les [agents](https://teamcode.ai/docs/agents).

### Documentation

Pour plus d'informations sur la configuration d'TeamCode, [**consultez notre documentation**](https://teamcode.ai/docs).

### Contribuer

Si vous souhaitez contribuer à TeamCode, lisez nos [docs de contribution](./CONTRIBUTING.md) avant de soumettre une pull request.

### Construire avec TeamCode

Si vous travaillez sur un projet lié à TeamCode et que vous utilisez "teamcode" dans le nom du projet (par exemple, "teamcode-dashboard" ou "teamcode-mobile"), ajoutez une note dans votre README pour préciser qu'il n'est pas construit par l'équipe TeamCode et qu'il n'est pas affilié à nous.

---

**Rejoignez notre communauté** [Discord](https://discord.gg/teamcode) | [X.com](https://x.com/teamcode)

_Based on [opencode](https://github.com/sst/opencode) (MIT)_
