import { InstanceRef, WorkspaceRef } from "@/effect/instance-ref"
import { InstanceStore } from "@/project/instance-store"
import { Effect, Layer } from "effect"
import { HttpRouter, HttpServerResponse } from "effect/unstable/http"
import { HttpApiMiddleware } from "effect/unstable/httpapi"
import type { WorkspaceID } from "@/control-plane/schema"
import { WorkspaceRouteContext } from "./workspace-routing"

export class InstanceContextMiddleware extends HttpApiMiddleware.Service<
  InstanceContextMiddleware,
  { requires: WorkspaceRouteContext }
>()("@teamcode/ExperimentalHttpApiInstanceContext") {}

function decode(input: string): string {
  // Only decode if the string contains percent-encoded sequences.
  // Raw filesystem paths with literal '%' (e.g., folders named "test%200test")
  // must not be decoded or '%20' would be incorrectly turned into a space.
  if (/%[0-9a-fA-F]{2}/.test(input)) {
    try {
      return decodeURIComponent(input)
    } catch {
      return input
    }
  }
  return input
}

function provideInstanceContext<E>(
  effect: Effect.Effect<HttpServerResponse.HttpServerResponse, E>,
  store: InstanceStore.Interface,
  route: { directory: string; workspaceID?: WorkspaceID },
): Effect.Effect<HttpServerResponse.HttpServerResponse, E> {
  return Effect.gen(function* () {
    const ctx = yield* store.load({ directory: decode(route.directory) })
    return yield* effect.pipe(
      Effect.provideService(InstanceRef, ctx),
      Effect.provideService(WorkspaceRef, route.workspaceID),
    )
  })
}

export const instanceContextLayer = Layer.effect(
  InstanceContextMiddleware,
  Effect.gen(function* () {
    const store = yield* InstanceStore.Service
    return InstanceContextMiddleware.of((effect) =>
      Effect.gen(function* () {
        const route = yield* WorkspaceRouteContext
        return yield* provideInstanceContext(effect, store, route).pipe(
          Effect.provideService(WorkspaceRouteContext, route),
        )
      }),
    )
  }),
)

export const instanceRouterMiddleware = HttpRouter.middleware()(
  Effect.gen(function* () {
    const store = yield* InstanceStore.Service
    return (effect) =>
      Effect.gen(function* () {
        const route = yield* WorkspaceRouteContext
        return yield* provideInstanceContext(effect, store, route).pipe(
          Effect.provideService(WorkspaceRouteContext, route),
        )
      })
  }),
)
