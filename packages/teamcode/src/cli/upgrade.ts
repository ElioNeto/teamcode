import { Effect } from "effect"
import { Installation } from "@/installation"
import { InstallationVersion } from "@teamcode-ai/core/installation/version"
import { GlobalBus } from "@/bus/global"
import { RuntimeFlags } from "@/effect/runtime-flags"

export async function upgrade(autoupdate: boolean | "notify" | undefined) {
  const flags = Effect.runSync(
    RuntimeFlags.Service.useSync((flags) => flags).pipe(Effect.provide(RuntimeFlags.defaultLayer)),
  )
  if (autoupdate === false || flags.disableAutoupdate) return
  const method = await Installation.method()
  const latest = await Installation.latest(method).catch(() => {})
  if (!latest) return

  if (flags.alwaysNotifyUpdate) {
    GlobalBus.emit("event", {
      directory: "global",
      payload: {
        type: Installation.Event.UpdateAvailable.type,
        properties: { version: latest },
      },
    })
    return
  }

  if (InstallationVersion === latest) return

  const kind = Installation.getReleaseType(InstallationVersion, latest)

  if (autoupdate === "notify" || kind !== "patch") {
    GlobalBus.emit("event", {
      directory: "global",
      payload: {
        type: Installation.Event.UpdateAvailable.type,
        properties: { version: latest },
      },
    })
    return
  }

  if (method === "unknown") return
  await Installation.upgrade(method, latest)
    .then(() =>
      GlobalBus.emit("event", {
        directory: "global",
        payload: {
          type: Installation.Event.Updated.type,
          properties: { version: latest },
        },
      }),
    )
    .catch(() => {})
}
