import { LocalContext } from "@/util/local-context"
import { AppFileSystem } from "@teamcode-ai/core/filesystem"
import type * as Project from "./project"

export interface InstanceContext {
  directory: string
  worktree: string
  project: Project.Info
}

export const context = LocalContext.create<InstanceContext>("instance")

/**
 * Check if a path is within the project boundary.
 * Returns true only if path is inside ctx.directory.
 * This strictly enforces the project directory boundary, preventing
 * file operations outside the user's specified project directory.
 */
export function containsPath(filepath: string, ctx: InstanceContext): boolean {
  return AppFileSystem.contains(ctx.directory, filepath)
}
