import { describe, expect, test } from "bun:test"
import { assetFileName, binaryName, extractCommand } from "./download-go-core"

// Release assets are packaged differently per platform (verified against the
// v2.3.1 release): linux ships .tar.gz, darwin and windows ship .zip.
describe("assetFileName", () => {
  test("linux uses tar.gz", () => {
    expect(assetFileName("linux", "x64")).toBe("teamcode-linux-x64.tar.gz")
    expect(assetFileName("linux", "arm64")).toBe("teamcode-linux-arm64.tar.gz")
  })

  test("windows uses zip and the 'windows' platform name", () => {
    expect(assetFileName("win32", "x64")).toBe("teamcode-windows-x64.zip")
    expect(assetFileName("win32", "arm64")).toBe("teamcode-windows-arm64.zip")
  })

  test("darwin uses zip", () => {
    expect(assetFileName("darwin", "x64")).toBe("teamcode-darwin-x64.zip")
    expect(assetFileName("darwin", "arm64")).toBe("teamcode-darwin-arm64.zip")
  })
})

describe("binaryName", () => {
  test("windows binary carries .exe", () => {
    expect(binaryName("win32")).toBe("go-core-server.exe")
    expect(binaryName("linux")).toBe("go-core-server")
    expect(binaryName("darwin")).toBe("go-core-server")
  })
})

describe("extractCommand", () => {
  test("tar.gz extracts the whole archive, preserving the original linux behavior", () => {
    expect(extractCommand("/tmp/a.tar.gz", "/tmp/bin", "go-core-server")).toBe('tar -xzf "/tmp/a.tar.gz" -C "/tmp/bin"')
  })

  test("zip extracts only the server binary, not the bundled CLI", () => {
    // The windows zip also contains teamcode.exe (~145 MB); extracting
    // everything would dump it into the bin dir for nothing.
    expect(extractCommand("C:/t/a.zip", "C:/t/bin", "go-core-server.exe")).toBe(
      'tar -xf "C:/t/a.zip" -C "C:/t/bin" "go-core-server.exe"',
    )
  })
})
