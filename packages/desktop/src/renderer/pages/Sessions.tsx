import { createSignal, For, Show, onMount } from "solid-js"
import { A } from "@solidjs/router"
import { api, type Session } from "../services/api"

export function Sessions() {
  const [sessions, setSessions] = createSignal<Session[]>([])
  const [loading, setLoading] = createSignal(true)

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const r = await api.listSessions()
      setSessions(r.sessions)
    } catch (err) {
      console.error("[Sessions] fetch failed", err)
    } finally {
      setLoading(false)
    }
  }

  onMount(fetchSessions)

  // Create form
  const [showForm, setShowForm] = createSignal(false)
  const [newTitle, setNewTitle] = createSignal("")
  const [newDir, setNewDir] = createSignal("")
  const [newAgent, setNewAgent] = createSignal("default")
  const [newModel, setNewModel] = createSignal("")
  const [creating, setCreating] = createSignal(false)

  const handleCreate = async () => {
    if (!newTitle().trim()) return
    setCreating(true)
    try {
      await api.createSession({
        session_id: `ses_${Date.now()}`,
        title: newTitle().trim(),
        directory: newDir().trim(),
        agent: newAgent().trim(),
        model: newModel().trim(),
      })
      setShowForm(false)
      setNewTitle("")
      setNewDir("")
      setNewAgent("default")
      setNewModel("")
      await fetchSessions()
    } catch (err) {
      console.error("[Sessions] create failed", err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (session: Session) => {
    try {
      await api.deleteSession(session.id)
      await fetchSessions()
    } catch (err) {
      console.error("[Sessions] delete failed", err)
    }
  }

  return (
    <div class="page">
      <div class="page-header">
        <h2>Sessions</h2>
        <button class="btn btn-sm" onClick={() => setShowForm(!showForm())}>
          {showForm() ? "Cancel" : "+ New"}
        </button>
      </div>

      {/* Create form */}
      <Show when={showForm()}>
        <div class="create-form">
          <label>
            Title
            <input
              type="text"
              value={newTitle()}
              onInput={(e) => setNewTitle(e.currentTarget.value)}
              placeholder="Session name"
            />
          </label>
          <label>
            Directory
            <input
              type="text"
              value={newDir()}
              onInput={(e) => setNewDir(e.currentTarget.value)}
              placeholder="Working directory (optional)"
            />
          </label>
          <label>
            Agent
            <input
              type="text"
              value={newAgent()}
              onInput={(e) => setNewAgent(e.currentTarget.value)}
            />
          </label>
          <label>
            Model
            <input
              type="text"
              value={newModel()}
              onInput={(e) => setNewModel(e.currentTarget.value)}
              placeholder="AI model (optional)"
            />
          </label>
          <button class="btn btn-primary" onClick={handleCreate} disabled={creating() || !newTitle().trim()}>
            {creating() ? "Creating…" : "Create Session"}
          </button>
        </div>
      </Show>

      {/* Session list */}
      <Show when={!loading()} fallback={<p>Loading sessions…</p>}>
        <div class="session-grid">
          <For each={sessions()}>
            {(session) => (
              <div class="session-card">
                <div class="session-card-body">
                  <h3>{session.title}</h3>
                  <div class="session-meta">
                    <span>Agent: {session.agent}</span>
                    <span>Model: {session.model || "default"}</span>
                    <span>Created: {new Date(session.created_at).toLocaleDateString()}</span>
                  </div>
                  {session.directory && <div class="session-dir">📁 {session.directory}</div>}
                </div>
                <div class="session-card-actions">
                  <A href={`/chat?session_id=${session.id}`} class="btn btn-sm">
                    Open Chat
                  </A>
                  <button class="btn btn-sm btn-danger" onClick={() => handleDelete(session)}>
                    Delete
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
