#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { spawn } from "child_process"

const server = new Server(
  {
    name: "mcp-security-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

interface ToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: "object"
    properties: Record<string, unknown>
    required?: string[]
  }
  command: string
  args: (target: string, params?: Record<string, unknown>) => string[]
  timeout: number
}

const tools: ToolDefinition[] = [
  {
    name: "nmap_scan",
    description: "Perform network scan to discover open ports, services, and versions. Uses nmap with service detection and default scripts.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Target IP address or domain to scan",
        },
        ports: {
          type: "string",
          description: "Port range to scan (e.g., '1-1000', '80,443,8080'). Default: common ports",
        },
      },
      required: ["target"],
    },
    command: "nmap",
    args: (target, params) => {
      const args = ["-sV", "-sC", "-T4", "--open"]
      if (params?.ports) args.push("-p", params.ports as string)
      args.push(target)
      return args
    },
    timeout: 180000,
  },
  {
    name: "whois_lookup",
    description: "Query WHOIS database for domain registration information including registrar, creation date, expiration, and nameservers.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Domain name to query (e.g., 'example.com')",
        },
      },
      required: ["target"],
    },
    command: "whois",
    args: (target) => [target],
    timeout: 30000,
  },
  {
    name: "whatweb_scan",
    description: "Identify web technologies, frameworks, and server software using WhatWeb fingerprinting tool.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "URL or domain to analyze (e.g., 'https://example.com')",
        },
        aggression: {
          type: "number",
          description: "Aggression level 1-4 (default: 3). Higher = more thorough but slower",
        },
      },
      required: ["target"],
    },
    command: "whatweb",
    args: (target, params) => {
      const aggression = params?.aggression ?? 3
      return ["-a", String(aggression), target]
    },
    timeout: 60000,
  },
  {
    name: "curl_headers",
    description: "Fetch HTTP headers from a URL. Useful for identifying server software, security headers, and redirects.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "URL to fetch headers from (e.g., 'https://example.com')",
        },
        follow_redirects: {
          type: "boolean",
          description: "Follow HTTP redirects (default: true)",
        },
      },
      required: ["target"],
    },
    command: "curl",
    args: (target, params) => {
      const args: string[] = ["-sI", "--max-time", "10"]
      if (params?.follow_redirects !== false) args.push("--location")
      args.push("-k", target)
      return args
    },
    timeout: 20000,
  },
  {
    name: "dig_dns",
    description: "Query DNS records for a domain. Supports A, AAAA, MX, NS, TXT, CNAME, and SOA record types.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Domain name to query (e.g., 'example.com')",
        },
        record_type: {
          type: "string",
          description: "DNS record type: A, AAAA, MX, NS, TXT, CNAME, SOA (default: A)",
          enum: ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"],
        },
      },
      required: ["target"],
    },
    command: "dig",
    args: (target, params) => {
      const recordType = (params?.record_type as string) ?? "A"
      return ["+short", target, recordType]
    },
    timeout: 15000,
  },
  {
    name: "nikto_scan",
    description: "Perform web server vulnerability scan using Nikto. Checks for outdated software, misconfigurations, and known vulnerabilities.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Target URL or host:port (e.g., 'http://example.com' or 'example.com:80')",
        },
        ssl: {
          type: "boolean",
          description: "Force SSL/TLS (default: false)",
        },
      },
      required: ["target"],
    },
    command: "nikto",
    args: (target, params) => {
      const args = ["-h", target, "-nointeractive"]
      if (params?.ssl) args.push("-ssl")
      return args
    },
    timeout: 300000,
  },
]

function executeCommand(command: string, args: string[], timeout: number): Promise<{ stdout: string; stderr: string; exitCode: number | null }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""
    let killed = false

    const timer = setTimeout(() => {
      killed = true
      proc.kill("SIGTERM")
      setTimeout(() => {
        if (!proc.killed) proc.kill("SIGKILL")
      }, 5000)
    }, timeout)

    proc.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    proc.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    proc.on("error", (error) => {
      clearTimeout(timer)
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        resolve({
          stdout: "",
          stderr: `Error: Command '${command}' not found. Please install it first.`,
          exitCode: 127,
        })
      } else {
        resolve({
          stdout: "",
          stderr: `Error executing command: ${error.message}`,
          exitCode: 1,
        })
      }
    })

    proc.on("close", (code) => {
      clearTimeout(timer)
      if (killed) {
        resolve({
          stdout,
          stderr: stderr + `\n\n[Timeout: Command killed after ${timeout / 1000}s]`,
          exitCode: code,
        })
      } else {
        resolve({ stdout, stderr, exitCode: code })
      }
    })
  })
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const tool = tools.find((t) => t.name === name)

  if (!tool) {
    return {
      content: [
        {
          type: "text",
          text: `Error: Unknown tool '${name}'`,
        },
      ],
      isError: true,
    }
  }

  const target = args?.target as string
  if (!target) {
    return {
      content: [
        {
          type: "text",
          text: "Error: 'target' parameter is required",
        },
      ],
      isError: true,
    }
  }

  const commandArgs = tool.args(target, args)

  try {
    const result = await executeCommand(tool.command, commandArgs, tool.timeout)

    let output = ""

    if (result.stdout) {
      output += result.stdout
    }

    if (result.stderr) {
      if (output) output += "\n\n"
      output += "STDERR:\n" + result.stderr
    }

    if (!output) {
      output = "No output from command"
    }

    const isError = result.exitCode !== 0 && result.exitCode !== null

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
      isError,
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${tool.name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("MCP Security Tools server running on stdio")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
