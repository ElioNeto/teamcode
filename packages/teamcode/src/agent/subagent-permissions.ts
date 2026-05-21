import type { Permission } from "../permission"
import type { Agent } from "./agent"

/**
 * Build the `permission` ruleset for a subagent's session when it's spawned
 * via the task tool. Combines:
 *
 * 1. The parent **agent's** edit-class deny rules — Plan Mode's file-edit
 *    restriction lives on the agent ruleset, not on the session, so a
 *    subagent that only inherited the parent SESSION's permission would
 *    silently bypass it. (#26514)
 * 2. The parent **session's** deny rules and external_directory rules —
 *    same forwarding the original code already did.
 * 3. Default `todowrite` and `task` denies if the subagent's own ruleset
 *    doesn't already permit them.
 */

const EDIT_CLASS = new Set(["edit", "write", "apply_patch"])

export function deriveSubagentSessionPermission(input: {
  parentSessionPermission: Permission.Ruleset
  parentAgent: Agent.Info | undefined
  subagent: Agent.Info
}): Permission.Ruleset {
  const canTask = input.subagent.permission.some((rule) => rule.permission === "task")
  const canTodo = input.subagent.permission.some((rule) => rule.permission === "todowrite")
  // Only propagate edit-class denies from the parent agent — other
  // self-restrictions (read, bash, etc.) belong to the parent's own
  // ruleset and should not cascade to subagents. (#26700)
  const parentAgentDenies =
    input.parentAgent?.permission.filter(
      (rule) => rule.action === "deny" && EDIT_CLASS.has(rule.permission),
    ) ?? []
  return [
    // Subagent's own rules come first; parent denies and session restricts
    // come after so the Permission.evaluate last-match-wins semantics make
    // parent restrictions override subagent permissions.
    ...input.subagent.permission,
    ...parentAgentDenies,
    ...input.parentSessionPermission.filter(
      (rule) => rule.permission === "external_directory" || rule.action === "deny",
    ),
    ...(canTodo ? [] : [{ permission: "todowrite" as const, pattern: "*" as const, action: "deny" as const }]),
    ...(canTask ? [] : [{ permission: "task" as const, pattern: "*" as const, action: "deny" as const }]),
  ]
}
