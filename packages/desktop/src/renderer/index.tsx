// @refresh reload

import "./styles.css"

import { Router } from "@solidjs/router"
import { render } from "solid-js/web"

import { App } from "./App"
import { Home } from "./pages/Home"
import { Chat } from "./pages/Chat"
import { Sessions } from "./pages/Sessions"

const routes = [
  { path: "/", component: Home },
  { path: "/chat", component: Chat },
  { path: "/sessions", component: Sessions },
]

const root = document.getElementById("root")
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found")
}

render(
  () => <Router root={App}>{routes}</Router>,
  root!,
)
