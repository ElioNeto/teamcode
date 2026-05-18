/**
 * Route definitions for visual validation.
 *
 * Each entry describes a page/route to visit, optional interactions
 * to perform before capturing, and the viewport/baseline metadata.
 */

export interface ValidationRoute {
  /** Human-readable label used in reports */
  label: string
  /** URL path relative to base URL */
  path: string
  /** Viewport width in px (default 1280) */
  width?: number
  /** Viewport height in px (default 800) */
  height?: number
  /** Millis to wait after navigation before capturing */
  settleMs?: number
  /** Optional CSS selector to wait for before capture */
  waitFor?: string
  /** Optional interactions to perform before capture */
  interactions?: Interaction[]
  /** Baseline screenshot filename (without extension) */
  baseline: string
  /** Tags for categorising the route */
  tags?: string[]
}

export interface Interaction {
  type: "click" | "fill" | "hover" | "scrollTo" | "keyboard"
  selector?: string
  value?: string
  key?: string
  x?: number
  y?: number
}

/** Viewport presets for responsive testing */
export const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const

export const ROUTES: ValidationRoute[] = [
  {
    label: "Home — desktop",
    path: "/",
    width: 1280,
    height: 800,
    settleMs: 2000,
    waitFor: "main",
    baseline: "home-desktop",
    tags: ["desktop", "landing"],
  },
  {
    label: "Home — tablet",
    path: "/",
    width: 768,
    height: 1024,
    settleMs: 2000,
    waitFor: "main",
    baseline: "home-tablet",
    tags: ["tablet", "landing", "responsive"],
  },
  {
    label: "Home — mobile",
    path: "/",
    width: 375,
    height: 667,
    settleMs: 2000,
    waitFor: "main",
    baseline: "home-mobile",
    tags: ["mobile", "landing", "responsive"],
  },
  {
    label: "Session view",
    path: "/session",
    settleMs: 3000,
    waitFor: "main",
    baseline: "session",
    tags: ["desktop", "session"],
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    settleMs: 2000,
    waitFor: "main",
    baseline: "dashboard",
    tags: ["desktop", "dashboard"],
  },
  {
    label: "Error page",
    path: "/error",
    settleMs: 1000,
    baseline: "error",
    tags: ["desktop", "error"],
  },
  {
    label: "Directory layout",
    path: "/directory",
    settleMs: 2000,
    waitFor: "main",
    baseline: "directory-layout",
    tags: ["desktop", "directory"],
  },
]

/**
 * Build a list of routes expanded across the viewport presets
 * for a full responsive sweep.
 */
export function responsiveRoutes(
  baseRoutes: ValidationRoute[],
  targetTags: string[] = ["responsive"],
): ValidationRoute[] {
  const result: ValidationRoute[] = []
  for (const route of baseRoutes) {
    if (route.tags?.some((t) => targetTags.includes(t))) continue // already expanded
    result.push(route)
    for (const [label, viewport] of Object.entries(VIEWPORTS)) {
      if (viewport.width === route.width && viewport.height === route.height) continue
      if (label === "desktop") continue // desktop is the default
      result.push({
        ...route,
        label: `${route.label} — ${label}`,
        width: viewport.width,
        height: viewport.height,
        baseline: `${route.baseline}-${label}`,
        tags: [...(route.tags ?? []), "responsive", label],
      })
    }
  }
  return result
}
