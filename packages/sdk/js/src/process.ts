import { type ChildProcess, spawnSync } from "node:child_process"

// Duplicated from `packages/teamcode/src/util/process.ts` because the SDK cannot
// import `opencode` without creating a cycle (`opencode` depends on `@teamcode-ai/sdk`).
export function stop(proc: ChildProcess) {
  if (proc.exitCode !== null || proc.signalCode !== null) return
  if (!proc.pid) return
  if (process.platform === "win32") {
    spawnSync("C:\\Windows\\System32\\taskkill.exe", ["/pid", String(proc.pid), "/T", "/F"], { windowsHide: true })
    return
  }
  // On Unix, kill the process group first (SIGTERM) so orphaned children are
  // cleaned up. If the process ignores the signal, escalate to SIGKILL after
  // a brief grace period.
  try {
    process.kill(-proc.pid, "SIGTERM")
  } catch {
    // Process group may not exist (wrapper like Deno may not create one).
  }
  // Signal the direct process in case process group kill didn't reach it.
  // Use SIGKILL for the direct process to ensure termination even when
  // running through wrappers that may intercept or not forward SIGTERM.
  proc.kill("SIGKILL")
}

export function bindAbort(proc: ChildProcess, signal?: AbortSignal, onAbort?: () => void) {
  if (!signal) return () => {}
  const abort = () => {
    clear()
    stop(proc)
    onAbort?.()
  }
  const clear = () => {
    signal.removeEventListener("abort", abort)
    proc.off("exit", clear)
    proc.off("error", clear)
  }
  signal.addEventListener("abort", abort, { once: true })
  proc.on("exit", clear)
  proc.on("error", clear)
  if (signal.aborted) abort()
  return clear
}
