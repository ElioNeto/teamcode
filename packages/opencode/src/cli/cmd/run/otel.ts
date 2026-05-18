// No-op telemetry stub — OpenTelemetry has been removed.
//
// Previously wrapped run operations in OTel spans. Now all functions are
// pass-through no-ops so callers don't need to change their import structure.

export type RunSpanAttributes = Record<string, string | number | boolean | undefined>

type NoopSpan = null

export function setRunSpanAttributes(_span: NoopSpan, _input?: RunSpanAttributes): void {}

export function recordRunSpanError(_span: NoopSpan, _error: unknown): void {}

export function withRunSpan<A>(
  _name: string,
  _input: RunSpanAttributes | undefined,
  fn: (_span: NoopSpan) => Promise<A> | A,
): A | Promise<A> {
  return fn(null)
}
