import { A } from "@solidjs/router"
import { createSignal, onMount, type ParentProps } from "solid-js"

function getInitialTheme(): string {
  try {
    return localStorage.getItem("teamcode-theme") || "dark"
  } catch {
    return "dark"
  }
}

export function App(props: ParentProps) {
  const [theme, setTheme] = createSignal(getInitialTheme())

  onMount(() => {
    document.documentElement.setAttribute("data-theme", theme())
  })

  const toggleTheme = () => {
    const next = theme() === "light" ? "dark" : "light"
    setTheme(next)
    document.documentElement.setAttribute("data-theme", next)
    try {
      localStorage.setItem("teamcode-theme", next)
    } catch {}
  }

  return (
    <div class="app-shell">
      <nav class="sidebar">
        <div class="sidebar-header">
          <h1>TeamCode</h1>
        </div>
        <ul class="nav-list">
          <li>
            <A href="/" class="nav-link" end>Home</A>
          </li>
          <li>
            <A href="/chat" class="nav-link">Chat</A>
          </li>
          <li>
            <A href="/sessions" class="nav-link">Sessions</A>
          </li>
        </ul>
        <div class="sidebar-footer">
          <button class="theme-toggle" onClick={toggleTheme}>
            {theme() === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </nav>
      <main class="main-content">
        {props.children}
      </main>
    </div>
  )
}
