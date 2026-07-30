/**
 * CLI argument parser for Hostinger MCP server.
 */

export interface CliOptions {
  transport: "stdio" | "http";
  host: string;
  port: number;
  login: boolean;
  logout: boolean;
  help: boolean;
  domain?: string; // for per-domain binary filtering
}

export function parseArgs(argv: string[] = process.argv.slice(2)): CliOptions {
  const opts: CliOptions = {
    transport: "stdio",
    host: "127.0.0.1",
    port: 8100,
    login: false,
    logout: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--http":
        opts.transport = "http";
        break;
      case "--stdio":
        opts.transport = "stdio";
        break;
      case "--host":
        opts.host = argv[++i] || "127.0.0.1";
        break;
      case "--port":
        opts.port = parseInt(argv[++i] || "8100", 10);
        break;
      case "--login":
        opts.login = true;
        break;
      case "--logout":
        opts.logout = true;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
      case "--domain":
        opts.domain = argv[++i];
        break;
    }
  }

  return opts;
}

export function printHelp() {
  const help = `
Hostinger MCP Server v2.0.0

Usage: hostinger-mcp [options]

Options:
  --stdio          Use stdio transport (default)
  --http           Use HTTP streaming transport
  --host <host>    HTTP host to bind (default: 127.0.0.1)
  --port <port>    HTTP port to bind (default: 8100)
  --login          Run OAuth sign-in flow and exit
  --logout         Revoke stored OAuth credentials and exit
  --domain <name>  Filter tools to specific domain (billing, dns, domains, vps, hosting, wordpress, mail, reach, ecommerce, agency, horizons)
  --help, -h       Show this help message

Environment Variables:
  HOSTINGER_API_TOKEN   API token (bypasses OAuth when set)
  OAUTH_ISSUER          OAuth server base URL (default: https://auth.hostinger.com)
  DEBUG                 Enable debug logging (true/false)

Authentication:
  If HOSTINGER_API_TOKEN is set, it is used directly.
  Otherwise, OAuth 2.0 with PKCE is used (interactive browser sign-in).

Per-domain binaries:
  hostinger-api-mcp          All tools (default)
  hostinger-billing-mcp      Billing tools only
  hostinger-dns-mcp          DNS tools only
  hostinger-domains-mcp      Domains tools only
  hostinger-vps-mcp          VPS tools only
  hostinger-hosting-mcp      Hosting tools only
  hostinger-wordpress-mcp    WordPress tools only
  hostinger-mail-mcp         Mail tools only
  hostinger-reach-mcp        Reach/Email Marketing tools only
  hostinger-ecommerce-mcp    Ecommerce tools only
  hostinger-agency-mcp       Agency Hosting tools only
  hostinger-horizons-mcp     Horizons tools only
`;
  process.stdout.write(help.trim() + "\n");
}
