import { test, type TestOptions } from "bun:test"
import { Cause, Duration, Effect, Exit, Layer, Scope } from "effect"
import type * as Scope_ from "effect/Scope"
import * as TestClock from "effect/testing/TestClock"
import * as TestConsole from "effect/testing/TestConsole"
import type { Config } from "@/config/config"
import { TestInstance, withTmpdirInstance } from "../fixture/fixture"

type Body<A, E, R> = Effect.Effect<A, E, R> | (() => Effect.Effect<A, E, R>)
type InstanceOptions = { git?: boolean; config?: Partial<Config.Info> }

function isInstanceOptions(options: InstanceOptions | number | TestOptions | undefined): options is InstanceOptions {
  return !!options && typeof options === "object" && ("git" in options || "config" in options)
}

function instanceArgs(
  options?: InstanceOptions | number | TestOptions,
  testOptions?: number | TestOptions,
): { instanceOptions: InstanceOptions | undefined; testOptions: number | TestOptions | undefined } {
  if (typeof options === "number") return { instanceOptions: undefined, testOptions: options }
  if (isInstanceOptions(options)) return { instanceOptions: options, testOptions }
  return { instanceOptions: undefined, testOptions: options }
}

const toEffect = <A, E, R>(value: Body<A, E, R>) =>
  Effect.suspend(() => (typeof value === "function" ? value() : value))

/**
 * Build a layer context once using a shared MemoMap, then provide that
 * context to every test via Effect.provideContext. The MemoMap ensures
 * the layer graph is evaluated ONCE per file. Each test still gets its
 * own scope via Effect.scoped so scoped resources are properly isolated.
 */
const buildContext = <R>(layer: Layer.Layer<R, never>) => {
  const scope = Scope.makeUnsafe()
  const memoMap = Layer.makeMemoMapUnsafe()
  const ctx = Effect.runSync(Layer.buildWithMemoMap(layer, memoMap, scope))
  return { ctx, scope }
}

const make = <R>(testLayer: Layer.Layer<R, never>, liveLayer: Layer.Layer<R, never>) => {
  const { ctx: testCtx } = buildContext(testLayer)
  const { ctx: liveCtx } = buildContext(liveLayer)

  const runTest = <A, E2>(value: Effect.Effect<A, E2, R | Scope_.Scope>) =>
    Effect.gen(function* () {
      const exit = yield* toEffect(value).pipe(Effect.provideContext(testCtx), Effect.scoped, Effect.exit)
      if (Exit.isFailure(exit)) {
        for (const err of Cause.prettyErrors(exit.cause)) {
          yield* Effect.logError(err)
        }
      }
      return yield* exit
    }).pipe(Effect.runPromise)

  const runLive = <A, E2>(value: Effect.Effect<A, E2, R | Scope_.Scope>) =>
    Effect.gen(function* () {
      const exit = yield* toEffect(value).pipe(Effect.provideContext(liveCtx), Effect.scoped, Effect.exit)
      if (Exit.isFailure(exit)) {
        for (const err of Cause.prettyErrors(exit.cause)) {
          yield* Effect.logError(err)
        }
      }
      return yield* exit
    }).pipe(Effect.runPromise)

  const effect = <A, E2>(name: string, value: Body<A, E2, R | Scope_.Scope>, opts?: number | TestOptions) =>
    test(name, () => runTest(toEffect(value)), opts)

  effect.only = <A, E2>(name: string, value: Body<A, E2, R | Scope_.Scope>, opts?: number | TestOptions) =>
    test.only(name, () => runTest(toEffect(value)), opts)

  effect.skip = <A, E2>(name: string, value: Body<A, E2, R | Scope_.Scope>, opts?: number | TestOptions) =>
    test.skip(name, () => runTest(toEffect(value)), opts)

  const live = <A, E2>(name: string, value: Body<A, E2, R | Scope_.Scope>, opts?: number | TestOptions) =>
    test(name, () => runLive(toEffect(value)), opts)

  live.only = <A, E2>(name: string, value: Body<A, E2, R | Scope_.Scope>, opts?: number | TestOptions) =>
    test.only(name, () => runLive(toEffect(value)), opts)

  live.skip = <A, E2>(name: string, value: Body<A, E2, R | Scope_.Scope>, opts?: number | TestOptions) =>
    test.skip(name, () => runLive(toEffect(value)), opts)

  const instance = <A, E2>(
    name: string,
    value: Body<A, E2, R | TestInstance | Scope_.Scope>,
    options?: InstanceOptions | number | TestOptions,
    opts?: number | TestOptions,
  ) => {
    const args = instanceArgs(options, opts)
    return test(
      name,
      () => runLive(toEffect(value).pipe(withTmpdirInstance(args.instanceOptions))),
      args.testOptions,
    )
  }

  instance.only = <A, E2>(
    name: string,
    value: Body<A, E2, R | TestInstance | Scope_.Scope>,
    options?: InstanceOptions | number | TestOptions,
    opts?: number | TestOptions,
  ) => {
    const args = instanceArgs(options, opts)
    return test.only(
      name,
      () => runLive(toEffect(value).pipe(withTmpdirInstance(args.instanceOptions))),
      args.testOptions,
    )
  }

  instance.skip = <A, E2>(
    name: string,
    value: Body<A, E2, R | TestInstance | Scope_.Scope>,
    options?: InstanceOptions | number | TestOptions,
    opts?: number | TestOptions,
  ) => {
    const args = instanceArgs(options, opts)
    return test.skip(
      name,
      () => runLive(toEffect(value).pipe(withTmpdirInstance(args.instanceOptions))),
      args.testOptions,
    )
  }

  return { effect, live, instance }
}

// Test environment with TestClock and TestConsole
const testEnv = Layer.mergeAll(TestConsole.layer, TestClock.layer())

// Live environment - uses real clock, but keeps TestConsole for output capture
const liveEnv = TestConsole.layer

export const it = make(testEnv, liveEnv)

export const testEffect = <R, E>(layer: Layer.Layer<R, E>) =>
  make(
    Layer.provideMerge(layer, testEnv) as unknown as Layer.Layer<R, never>,
    Layer.provideMerge(layer, liveEnv) as unknown as Layer.Layer<R, never>,
  )

export const awaitWithTimeout = <A, E, R>(
  self: Effect.Effect<A, E, R>,
  message: string,
  duration: Duration.Input = "2 seconds",
) =>
  self.pipe(
    Effect.timeoutOrElse({
      duration,
      orElse: () => Effect.fail(new Error(message)),
    }),
  )

export const pollWithTimeout = <A, E, R>(
  self: Effect.Effect<A | undefined, E, R>,
  message: string,
  duration: Duration.Input = "5 seconds",
) =>
  Effect.gen(function* () {
    while (true) {
      const result = yield* self
      if (result !== undefined) return result
      yield* Effect.sleep("20 millis")
    }
  }).pipe(
    Effect.timeoutOrElse({
      duration,
      orElse: () => Effect.fail(new Error(message)),
    }),
  )
