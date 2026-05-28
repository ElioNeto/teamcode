declare global {
  const TEAMCODE_VERSION: string
  const TEAMCODE_CHANNEL: string
}

export const InstallationVersion = typeof TEAMCODE_VERSION === "string" ? TEAMCODE_VERSION : "local"
export const InstallationChannel = typeof TEAMCODE_CHANNEL === "string" ? TEAMCODE_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
