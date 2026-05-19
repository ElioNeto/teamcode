import { Layer } from "effect"
import { InstanceStore } from "./instance-store"
import { InstanceBootstrap } from "./bootstrap"

export const layer: Layer.Layer<InstanceStore.Service> = InstanceStore.defaultLayer.pipe(
  Layer.provide(InstanceBootstrap.defaultLayer),
)

export * as InstanceLayer from "./instance-layer"
