export * as ConfigCaveman from "./caveman"

import { Schema } from "effect"

const CavemanLevel = Schema.Literals(["lite", "full", "ultra"])

export const Info = Schema.Struct({
  enabled: Schema.optional(Schema.Boolean).annotate({
    description: "Enable caveman mode (default: false)",
  }),
  level: Schema.optional(CavemanLevel).annotate({
    description: "Compression level: 'lite' (remove filler), 'full' (fragments, default), 'ultra' (telegraphic)",
  }),
}).annotate({ identifier: "CavemanConfig" })

export type Info = Schema.Schema.Type<typeof Info>
