import { Effect, Layer, Logger } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { OtlpLogger, OtlpSerialization } from "effect/unstable/observability"
import * as EffectLogger from "./logger"
import { Flag } from "../flag/flag"
import { InstallationChannel, InstallationVersion } from "../installation/version"
import { ensureProcessMetadata } from "../util/opencode-process"

const base = Flag.OTEL_EXPORTER_OTLP_ENDPOINT
export const enabled = !!base
const processID = crypto.randomUUID()

const headers = Flag.OTEL_EXPORTER_OTLP_HEADERS
  ? Flag.OTEL_EXPORTER_OTLP_HEADERS.split(",").reduce(
      (acc, x) => {
        const [key, ...value] = x.split("=")
        acc[key] = value.join("=")
        return acc
      },
      {} as Record<string, string>,
    )
  : undefined

export function resource(): { serviceName: string; serviceVersion: string; attributes: Record<string, string> } {
  const processMetadata = ensureProcessMetadata("main")
  const attributes: Record<string, string> = (() => {
    const value = process.env.OTEL_RESOURCE_ATTRIBUTES
    if (!value) return {}
    try {
      return Object.fromEntries(
        value.split(",").map((entry) => {
          const index = entry.indexOf("=")
          if (index < 1) throw new Error("Invalid OTEL_RESOURCE_ATTRIBUTES entry")
          return [decodeURIComponent(entry.slice(0, index)), decodeURIComponent(entry.slice(index + 1))]
        }),
      )
    } catch {
      return {}
    }
  })()

  return {
    serviceName: "opencode",
    serviceVersion: InstallationVersion,
    attributes: {
      ...attributes,
      "deployment.environment.name": InstallationChannel,
      "opencode.client": Flag.OPENCODE_CLIENT,
      "opencode.process_role": processMetadata.processRole,
      "opencode.run_id": processMetadata.runID,
      "service.instance.id": processID,
    },
  }
}

function logs() {
  return Logger.layer(
    [
      EffectLogger.logger,
      OtlpLogger.make({
        url: `${base}/v1/logs`,
        resource: resource(),
        headers,
      }),
    ],
    { mergeWithExisting: false },
  ).pipe(Layer.provide(OtlpSerialization.layerJson), Layer.provide(FetchHttpClient.layer))
}

export const layer = !base
  ? EffectLogger.layer
  : logs()

export const Observability = { enabled, layer }
