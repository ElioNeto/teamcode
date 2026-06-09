export function decodeDataUrl(url: string) {
  const idx = url.indexOf(",")
  if (idx === -1) return ""

  const head = url.slice(0, idx)
  const body = url.slice(idx + 1)

  // Prevent processing of oversized data URLs (>500KB decoded) to avoid
  // OOM/crashes in the session pipeline. The LLM context window would be
  // exhausted by such content anyway.
  if (head.includes(";base64")) {
    // Rough estimate: base64 is ~33% larger than binary, so 666KB base64 ≈ 500KB binary
    if (body.length > 666_000) return `[Content too large: ${(body.length / 1024).toFixed(0)}KB base64 — truncated]`
    return Buffer.from(body, "base64").toString("utf8")
  }
  return decodeURIComponent(body)
}
