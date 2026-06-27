import { createSignal, For, onMount, onCleanup, Show } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import { api, type Session, type Message } from "../services/api"

export function Chat() {
  // We read the initial session_id from the URL, but control state locally
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = createSignal<string | undefined>(
    searchParams.session_id as string | undefined,
  )

  // Sync URL when selectedId changes (for external navigation like Sessions page)
  const selectSession = (id: string) => {
    disconnectSSE()
    setSelectedId(id)
    setSearchParams({ session_id: id })
    fetchMessages(id)
    connectSSE(id)
  }

  // Session list (explicit fetch, no polling)
  const [sessions, setSessions] = createSignal<Session[]>([])
  const [sessionsLoading, setSessionsLoading] = createSignal(true)

  const fetchSessions = async () => {
    try {
      const r = await api.listSessions()
      setSessions(r.sessions)
    } catch (err) {
      console.error("[Chat] sessions fetch failed", err)
    } finally {
      setSessionsLoading(false)
    }
  }

  // Messages for selected session (explicit fetch)
  const [messages, setMessages] = createSignal<Message[]>([])
  const [messagesLoading, setMessagesLoading] = createSignal(false)

  const fetchMessages = async (sessionId: string) => {
    setMessagesLoading(true)
    try {
      const r = await api.getMessages(sessionId)
      setMessages(r.messages)
    } catch (err) {
      console.error("[Chat] messages fetch failed", err)
      setMessages([])
    } finally {
      setMessagesLoading(false)
    }
  }

  // SSE connection
  let eventSource: EventSource | null = null

  const connectSSE = async (sessionId: string) => {
    disconnectSSE()
    const url = await api.sseUrl(sessionId)
    const es = new EventSource(url)
    es.onmessage = () => fetchMessages(sessionId)
    es.onerror = () => {
      // EventSource auto-reconnects
    }
    eventSource = es
  }

  const disconnectSSE = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }

  // Initialize: fetch sessions + optionally connect SSE
  onMount(() => {
    fetchSessions()
    if (selectedId()) {
      fetchMessages(selectedId()!)
      connectSSE(selectedId()!)
    }
  })

  onCleanup(disconnectSSE)

  // Input state
  const [input, setInput] = createSignal("")
  const [sending, setSending] = createSignal(false)

  const sendMessage = async () => {
    const text = input().trim()
    if (!text || !selectedId()) return

    setSending(true)
    setInput("")

    try {
      // Post user message event
      await api.sendEvent(selectedId()!, "session.next.prompted", {
        timestamp: Date.now(),
        sessionID: selectedId(),
        prompt: { text, files: [], agents: [], references: [] },
      })

      // Fetch messages to show the user message
      await fetchMessages(selectedId()!)

      // Start swarm to process the message
      try {
        await api.runSwarm([
          {
            id: "agent_1",
            name: "assistant",
            input: { text },
          },
        ])
      } catch (err) {
        console.error("[Chat] swarm run failed (expected if not implemented):", err)
      }

      // Fetch again after a brief delay to pick up AI response
      setTimeout(() => {
        if (selectedId()) fetchMessages(selectedId()!)
      }, 500)
    } catch (err) {
      console.error("[Chat] send failed:", err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const createNewSession = async () => {
    const id = `ses_${Date.now()}`
    await api.createSession({
      session_id: id,
      title: `Chat ${new Date().toLocaleString()}`,
      directory: "",
      agent: "default",
      model: "",
    })
    await fetchSessions()
    selectSession(id)
  }

  return (
    <div class="chat-layout">
      {/* Session picker */}
      <div class="chat-sidebar">
        <div class="chat-sidebar-header">
          <h3>Sessions</h3>
          <button class="btn btn-sm" onClick={createNewSession}>
            + New
          </button>
        </div>
        <div class="session-list">
          <Show when={!sessionsLoading()} fallback={<p class="chat-status">Loading sessions…</p>}>
            <For each={sessions()}>
              {(session) => (
                <div
                  class={`session-item ${session.id === selectedId() ? "active" : ""}`}
                  onClick={() => selectSession(session.id)}
                >
                  <div class="session-title">{session.title}</div>
                  <div class="session-id">{session.id.slice(0, 16)}…</div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>

      {/* Chat area */}
      <div class="chat-main">
        <Show
          when={selectedId()}
          fallback={
            <div class="chat-empty">
              <p>Select a session or create a new one to start chatting</p>
              <button class="btn" onClick={createNewSession}>
                Create New Session
              </button>
            </div>
          }
        >
          {/* Messages */}
          <div class="message-list">
            <Show when={!messagesLoading()} fallback={<p class="chat-status">Loading messages…</p>}>
              <For each={messages()}>
                {(msg) => <MessageBubble message={msg} />}
              </For>
            </Show>
          </div>

          {/* Input */}
          <div class="chat-input-bar">
            <textarea
              class="chat-input"
              value={input()}
              onInput={(e) => setInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={3}
              disabled={sending()}
            />
            <button class="btn btn-primary" onClick={sendMessage} disabled={sending() || !input().trim()}>
              {sending() ? "Sending…" : "Send"}
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble(props: { message: Message }) {
  const m = () => props.message
  const isUser = () => m().type === "session.next.prompted"
  const text = () => {
    if (m().text) return m().text
    if (m().content) return m().content!.map((b) => b.text ?? "").join("")
    return ""
  }

  return (
    <div class={`message ${isUser() ? "message-user" : "message-assistant"}`}>
      <div class="message-role">{isUser() ? "You" : m().agent ?? "Assistant"}</div>
      <div class="message-text">{text()}</div>
      <div class="message-time">{new Date(m().time.created).toLocaleTimeString()}</div>
    </div>
  )
}
