#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { HostingerApiClient } from "./api-client.js";
import { parseArgs, printHelp } from "./cli.js";
import { getOAuthToken, oauthLogin, clearCredentials } from "./auth/oauth.js";
import { registerBillingTools } from "./tools/billing.js";
import { registerDnsTools } from "./tools/dns.js";
import { registerDomainsTools } from "./tools/domains.js";
import { registerVpsTools } from "./tools/vps.js";
import { registerHostingTools } from "./tools/hosting.js";
import { registerWordPressTools } from "./tools/wordpress.js";
import { registerMailTools } from "./tools/mail.js";
import { registerReachTools } from "./tools/reach.js";
import { registerEcommerceTools } from "./tools/ecommerce.js";
import { registerAgencyTools } from "./tools/agency.js";
import { registerHorizonsTools } from "./tools/horizons.js";
import { registerDeployTools } from "./tools/deploy.js";
import { registerSmartTools } from "./tools/smart.js";

// === CLI parsing ===
const opts = parseArgs();

if (opts.help) {
  printHelp();
  process.exit(0);
}

if (opts.logout) {
  await clearCredentials();
  process.stderr.write("OAuth credentials cleared.\n");
  process.exit(0);
}

if (opts.login) {
  await oauthLogin();
  process.stderr.write("Login successful.\n");
  process.exit(0);
}

// === Determine domain filter from binary name ===
function detectDomainFromBinary(): string | undefined {
  const bin = process.argv[1] || "";
  const match = bin.match(/hostinger-(\w+)-mcp/);
  if (match && match[1] !== "api") return match[1];
  return undefined;
}

const domainFilter = opts.domain || detectDomainFromBinary();

// === Build API client ===
const apiToken = process.env.HOSTINGER_API_TOKEN || process.env.API_TOKEN;

const client = new HostingerApiClient(
  apiToken
    ? { token: apiToken }
    : { getToken: getOAuthToken }
);

// === Create MCP server ===
const server = new McpServer({
  name: "hostinger",
  version: "2.0.0",
});

// === Register tools based on domain filter ===
type RegistrationFn = (s: McpServer, c: HostingerApiClient) => void;

const registry: Record<string, RegistrationFn[]> = {
  billing: [registerBillingTools],
  dns: [registerDnsTools],
  domains: [registerDomainsTools],
  vps: [registerVpsTools],
  hosting: [registerHostingTools, registerDeployTools],
  wordpress: [registerWordPressTools],
  mail: [registerMailTools],
  reach: [registerReachTools],
  ecommerce: [registerEcommerceTools],
  agency: [registerAgencyTools],
  horizons: [registerHorizonsTools],
};

if (domainFilter && registry[domainFilter]) {
  // Register only the selected domain
  for (const fn of registry[domainFilter]) {
    fn(server, client);
  }
} else {
  // Register all
  for (const fns of Object.values(registry)) {
    for (const fn of fns) {
      fn(server, client);
    }
  }
  // Smart tools only in full mode
  registerSmartTools(server, client);
}

// === Start transport ===
if (opts.transport === "http") {
  if (!apiToken) {
    process.stderr.write("ERROR: HTTP transport requires HOSTINGER_API_TOKEN (OAuth not supported in HTTP mode).\n");
    process.exit(1);
  }

  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport);

  const httpServer = createServer(async (req, res) => {
    await transport.handleRequest(req, res);
  });

  httpServer.listen(opts.port, opts.host, () => {
    process.stderr.write(`Hostinger MCP server (HTTP) listening on http://${opts.host}:${opts.port}\n`);
  });
} else {
  // Default: stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
