import { test, type TestOptions } from "bun:test"
import { Cause, Duration, Effect, Exit, Layer, Scope, Context } from "effect"
import type * as Scope_ from "effect/Scope"
import * as TestClock from "effect/testing/TestClock"
import * as TestConsole from "effect/testing/TestConsole"
import type { Config } from "@/config/config"
import { TestInstance, withTmpdirInstance } from "../fixture/fixture"

/**
 * Service that test modules can provide to register a cleanup/reset effect
 * that runs before each individual test. This is used to reset mutable
 * shared state (e.g. mock servers) between tests in the same file.
 */
class BeforeEach extends Context.Service<BeforeEach, Effect.Effect<void>>()("@test/BeforeEach") {}

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
 * Build a layer context using runPromise. Layers that start fibers internally
 * (e.g. watchers, background jobs) cannot use runSync, which throws
 * AsyncFiberError. runPromise handles async initialization correctly.
 */
const buildContext = <R>(layer: Layer.Layer<R, never>): Context.Context<R> => {
  const scope = Scope.makeUnsafe()
  const memoMap = Layer.makeMemoMapUnsafe()
  return Effect.runSync(Layer.buildWithMemoMap(layer, memoMap, scope))
}

/**
 * Same as buildContext but tolerates AsyncFiberError by falling back to
 * runPromise. This is used for layers known to start fibers.
 */
async function buildContextAsync<R>(layer: Layer.Layer<R, never>): Promise<Context.Context<R>> {
  const scope = Scope.makeUnsafe()
  const memoMap = Layer.makeMemoMapUnsafe()
  return await Effect.runPromise(Layer.buildWithMemoMap(layer, memoMap, scope))
}

const make = <R>(testLayer: Layer.Layer<R, never>, liveLayer: Layer.Layer<R, never>) => {
  // Build contexts eagerly using runSync. If a layer spawns fibers, the
  // AsyncFiberError is caught and we fall back to building lazily with
  // runPromise on first actual test run.
  let testCtx: Context.Context<R> | undefined
  let liveCtx: Context.Context<R> | undefined
  let testBuild: Promise<void> | undefined
  let liveBuild: Promise<void> | undefined
  let testError: unknown
  let liveError: unknown

  try {
    testCtx = buildContext(testLayer)
  } catch (e) {
    testError = e
    testBuild = buildContextAsync(testLayer).then(
      (ctx) => { testCtx = ctx; testError = undefined },
      (e2) => { testError = e2 },
    )
  }

  try {
    liveCtx = buildContext(liveLayer)
  } catch (e) {
    liveError = e
    liveBuild = buildContextAsync(liveLayer).then(
      (ctx) => { liveCtx = ctx; liveError = undefined },
      (e2) => { liveError = e2 },
    )
  }

  const ensureTestCtx = async () => {
    if (testCtx) return
    if (testBuild) { await testBuild; if (testError) throw testError }
    // If we get here, buildContext didn't throw but also didn't set testCtx — retry async
    if (!testBuild) {
      testBuild = buildContextAsync(testLayer).then(
        (ctx) => { testCtx = ctx; testError = undefined },
        (e2) => { testError = e2 },
      )
    }
    await testBuild
    if (testError) throw testError
  }

  const ensureLiveCtx = async () => {
    if (liveCtx) return
    if (liveBuild) { await liveBuild; if (liveError) throw liveError }
    if (!liveBuild) {
      liveBuild = buildContextAsync(liveLayer).then(
        (ctx) => { liveCtx = ctx; liveError = undefined },
        (e2) => { liveError = e2 },
      )
    }
    await liveBuild
    if (liveError) throw liveError
  }

  const runTest = <A, E2>(value: Effect.Effect<A, E2, R | Scope_.Scope>) =>
    ensureTestCtx().then(() => {
      const ctx = testCtx!
      return Effect.gen(function* () {
        // Run the BeforeEach cleanup if one is registered in the context
        const cleanup = Context.getOption(ctx, BeforeEach)
        if (cleanup._tag === "Some") yield* cleanup.value
        const exit = yield* toEffect(value).pipe(Effect.provideContext(ctx), Effect.scoped, Effect.exit)
        if (Exit.isFailure(exit)) {
          for (const err of Cause.prettyErrors(exit.cause)) {
            yield* Effect.logError(err)
          }
        }
        return yield* exit
      }).pipe(Effect.runPromise)
    })

  const runLive = <A, E2>(value: Effect.Effect<A, E2, R | Scope_.Scope>) =>
    ensureLiveCtx().then(() => {
      const ctx = liveCtx!
      return Effect.gen(function* () {
        // Run the BeforeEach cleanup if one is registered in the context
        const cleanup = Context.getOption(ctx, BeforeEach)
        if (cleanup._tag === "Some") yield* cleanup.value
        const exit = yield* toEffect(value).pipe(Effect.provideContext(ctx), Effect.scoped, Effect.exit)
        if (Exit.isFailure(exit)) {
          for (const err of Cause.prettyErrors(exit.cause)) {
            yield* Effect.logError(err)
          }
        }
        return yield* exit
      }).pipe(Effect.runPromise)
    })

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

export { BeforeEach }

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
