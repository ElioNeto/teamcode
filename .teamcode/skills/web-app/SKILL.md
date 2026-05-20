---
name: web-app
description: Work with the SolidJS web application. Use when modifying the web interface, API routes, UI components, or frontend features.
---

# Web App

The web app is built with **SolidJS**, **Vite**, **Tailwind CSS v4**, and **Hono**.

## Architecture

```
packages/app/
├── src/
│   ├── index.ts              # Entry point
│   ├── components/           # UI components
│   ├── pages/                # Route pages
│   ├── context/              # SolidJS context providers
│   └── utils/                # Utilities and test helpers
```

## Key Technologies

- **SolidJS** — Reactive UI framework with signals, effects, memos
- **@solidjs/start** — Meta-framework with SSR and routing
- **@solidjs/router** — Client-side routing
- **@kobalte/core** — Accessible UI primitives (dialog, popover, etc.)
- **Tailwind CSS v4** — Utility-first CSS with `@tailwindcss/vite`
- **Hono** — API routes and middleware

## Development

```bash
bun run dev:web
```

## Conventions

- Use SolidJS signals (`createSignal`), effects (`createEffect`), and memos (`createMemo`)
- Prefer fine-grained reactivity over component re-renders
- Use Tailwind classes directly in JSX (no separate CSS files)
- Components should be focused and composable
- Follow existing patterns in `packages/app/src/`
