<p align="center">
  <a href="https://teamcode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="TeamCode logo">
    </picture>
  </a>
</p>
<p align="center">TeamCode je open source AI agent za programiranje.</p>
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

### Instalacija

```bash
# YOLO
curl -fsSL https://teamcode.ai/install | bash

# Package manageri
npm i -g teamcode-ai        # ili bun/pnpm/yarn
scoop install teamcode             # Windows
choco install teamcode             # Windows
brew install teamcode/tap/teamcode # macOS i Linux (preporučeno, uvijek ažurno)
brew install teamcode              # macOS i Linux (zvanična brew formula, rjeđe se ažurira)
sudo pacman -S teamcode            # Arch Linux (Stable)
paru -S teamcode-bin               # Arch Linux (Latest from AUR)
mise use -g teamcode               # Bilo koji OS
nix run nixpkgs#teamcode           # ili github:teamcode/teamcode za najnoviji dev branch
```

> [!TIP]
> Ukloni verzije starije od 0.1.x prije instalacije.

### Desktop aplikacija (BETA)

TeamCode je dostupan i kao desktop aplikacija. Preuzmi je direktno sa [stranice izdanja](https://github.com/teamcode/teamcode/releases) ili sa [teamcode.ai/download](https://teamcode.ai/download).

| Platforma             | Preuzimanje                        |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `teamcode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `teamcode-desktop-mac-x64.dmg`     |
| Windows               | `teamcode-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, ili AppImage       |

```bash
# macOS (Homebrew)
brew install --cask teamcode-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/teamcode-desktop
```

#### Instalacijski direktorij

Instalacijska skripta koristi sljedeći redoslijed prioriteta za putanju instalacije:

1. `$TEAMCODE_INSTALL_DIR` - Prilagođeni instalacijski direktorij
2. `$XDG_BIN_DIR` - Putanja usklađena sa XDG Base Directory specifikacijom
3. `$HOME/bin` - Standardni korisnički bin direktorij (ako postoji ili se može kreirati)
4. `$HOME/.teamcode/bin` - Podrazumijevana rezervna lokacija

```bash
# Primjeri
TEAMCODE_INSTALL_DIR=/usr/local/bin curl -fsSL https://teamcode.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://teamcode.ai/install | bash
```

### Agenti

TeamCode uključuje dva ugrađena agenta između kojih možeš prebacivati tasterom `Tab`.

- **build** - Podrazumijevani agent sa punim pristupom za razvoj
- **plan** - Agent samo za čitanje za analizu i istraživanje koda
  - Podrazumijevano zabranjuje izmjene datoteka
  - Traži dozvolu prije pokretanja bash komandi
  - Idealan za istraživanje nepoznatih codebase-ova ili planiranje izmjena

Uključen je i **general** pod-agent za složene pretrage i višekoračne zadatke.
Koristi se interno i može se pozvati pomoću `@general` u porukama.

Saznaj više o [agentima](https://teamcode.ai/docs/agents).

### Dokumentacija

Za više informacija o konfiguraciji TeamCode-a, [**pogledaj dokumentaciju**](https://teamcode.ai/docs).

### Doprinosi

Ako želiš doprinositi TeamCode-u, pročitaj [upute za doprinošenje](./CONTRIBUTING.md) prije slanja pull requesta.

### Gradnja na TeamCode-u

Ako radiš na projektu koji je povezan s TeamCode-om i koristi "teamcode" kao dio naziva, npr. "teamcode-dashboard" ili "teamcode-mobile", dodaj napomenu u svoj README da projekat nije napravio TeamCode tim i da nije povezan s nama.

---

**Pridruži se našoj zajednici** [Discord](https://discord.gg/teamcode) | [X.com](https://x.com/teamcode)

_Based on [opencode](https://github.com/sst/opencode) (MIT)_
