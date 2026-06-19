import { createSignal, onMount } from "solid-js"
import { A } from "@solidjs/router"
import { api } from "../services/api"

export function Home() {
  const [status, setStatus] = createSignal<"checking" | "online" | "offline">("checking")
  const [version, setVersion] = createSignal("")
  const [errorMsg, setErrorMsg] = createSignal("")

  onMount(async () => {
    try {
      const result = await api.health()
      console.log("[Home] health ok", result)
      setStatus("online")
      setVersion(result.version)
    } catch (err) {
      console.error("[Home] health failed", err)
      setStatus("offline")
      setErrorMsg(String(err))
    }
  })

  return (
    <div class="page home-page">
      <div class="hero">
        <h2>Welcome to TeamCode</h2>
        <p class="subtitle">AI-powered development environment</p>
      </div>

      <div class="status-bar">
        Server status:
        <span class={`status-badge ${status()}`}>
          {status() === "checking" ? "Checking…" : status() === "online" ? "Online" : "Offline"}
        </span>
        {version() && <span class="version">v{version()}</span>}
        {errorMsg() && <span class="error-msg">{errorMsg()}</span>}
      </div>

      {status() === "online" && (
        <div class="quick-actions">
          <A href="/chat" class="action-card">
            <div class="action-icon">💬</div>
            <div class="action-text">
              <strong>Start Chat</strong>
              <span>Create a new conversation</span>
            </div>
          </A>
          <A href="/sessions" class="action-card">
            <div class="action-icon">📋</div>
            <div class="action-text">
              <strong>Manage Sessions</strong>
              <span>View and organize your sessions</span>
            </div>
          </A>
        </div>
      )}
    </div>
  )
}
