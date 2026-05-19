import { TuiConfig } from "@/cli/cmd/tui/config/tui"
import { Rpc } from "@/util/rpc"
import { tui } from "@/cli/cmd/tui/app"

process.on("SIGPIPE", () => {})
process.on("SIGCHLD", () => {})

const workerPath = new URL("./src/cli/cmd/tui/worker.ts", import.meta.url)

console.error("1. Spawning worker...")
const worker = new Worker(workerPath, {
  env: {
    OPENCODE_PROCESS_ROLE: "worker",
    OPENCODE_RUN_ID: crypto.randomUUID(),
  },
})

worker.onerror = (e) => {
  console.error("Worker error:", e.message)
}

const client = Rpc.client<typeof import("./src/cli/cmd/tui/worker").rpc>(worker)

console.error("2. Getting config...")
const config = await TuiConfig.get()

function createWorkerFetch(client: typeof client): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init)
    const body = request.body ? await request.text() : undefined
    const result = await client.call("fetch", {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
    })
    return new Response(result.body, {
      status: result.status,
      headers: result.headers,
    })
  }
}

function createEventSource(client: typeof client) {
  return {
    subscribe: async (handler: (e: any) => void) => {
      return client.on("global.event", (e) => { handler(e) })
    },
  }
}

console.error("3. Starting TUI (internal mode)...")
let stopped = false
const stop = async () => {
  if (stopped) return
  stopped = true
  console.error("4. Shutting down...")
  await client.call("shutdown", undefined).catch(() => {})
  worker.terminate()
  console.error("5. Worker terminated")
}

try {
  await tui({
    url: "http://teamcode.internal",
    config,
    args: {},
    fetch: createWorkerFetch(client),
    events: createEventSource(client),
  })
} finally {
  await stop()
}

console.error("6. TUI exited, calling process.exit(0)")
process.exit(0)
