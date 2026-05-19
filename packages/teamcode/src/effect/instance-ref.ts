import { Context } from "effect"
import type { InstanceContext } from "@/project/instance-context"
import type { WorkspaceID } from "@/control-plane/schema"

export const InstanceRef = Context.Reference<InstanceContext | undefined>("~teamcode/InstanceRef", {
  defaultValue: () => undefined,
})

export const WorkspaceRef = Context.Reference<WorkspaceID | undefined>("~teamcode/WorkspaceRef", {
  defaultValue: () => undefined,
})
