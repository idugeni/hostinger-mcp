# hostinger-mcp

> The most complete MCP server for Hostinger — surpasses the official with 280+ tools, OAuth, HTTP transport, smart caching, batch operations, and deploy automation.

[![CI](https://github.com/rifqi96/hostinger-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/rifqi96/hostinger-mcp/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why This Over Official?

| Feature | Official | **This** |
|---------|----------|----------|
| Tools | 276 | **280+** |
| Node.js | 24+ required | **18+** |
| Retry + backoff | No | **Yes** (exponential, 3 retries) |
| Rate-limit (429) | No | **Yes** (respects `retry-after`) |
| Response caching | No | **Yes** (GET, 15s TTL) |
| Request timeout | No | **Yes** (30s, configurable) |
| Batch operations | No | **Yes** (multi-domain DNS, multi-VPS) |
| Smart pagination | No | **Yes** (auto-fetch all pages) |
| Health check | No | **Yes** |
| Account overview | No | **Yes** (full service summary) |
| `destructiveHint` | No | **Yes** (on all destructive ops) |
| OAuth 2.0 + PKCE | Yes | **Yes** |
| HTTP transport | Yes | **Yes** |
| Per-domain binaries | Yes | **Yes** (12 binaries) |
| Deploy tools | Yes | **Yes** |

## Quick Start

```bash
# Install globally
npm install -g hostinger-mcp

# Or run directly with npx
npx hostinger-mcp
```

### With API Token (recommended)

```bash
export HOSTINGER_API_TOKEN="your-token-from-hpanel"
hostinger-mcp
```

Get your token at: https://hpanel.hostinger.com/api

### With OAuth (interactive)

```bash
hostinger-mcp --login
```

## MCP Client Configuration

### Claude Desktop / Kiro / Cursor

```json
{
  "mcpServers": {
    "hostinger": {
      "command": "npx",
      "args": ["-y", "hostinger-mcp"],
      "env": {
        "HOSTINGER_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### HTTP Mode (for remote/shared access)

```bash
HOSTINGER_API_TOKEN=your-token hostinger-mcp --http --host 0.0.0.0 --port 8100
```

## Per-Domain Binaries

Pick only the tools you need:

| Binary | Tools | Domain |
|--------|-------|--------|
| `hostinger-mcp` | 280+ | All (default) |
| `hostinger-billing-mcp` | 9 | Billing |
| `hostinger-dns-mcp` | 8 | DNS |
| `hostinger-domains-mcp` | 23 | Domains |
| `hostinger-vps-mcp` | 62 | VPS |
| `hostinger-hosting-mcp` | 48+ | Hosting + Deploy |
| `hostinger-wordpress-mcp` | 35 | WordPress |
| `hostinger-mail-mcp` | 38 | Mail |
| `hostinger-reach-mcp` | 12 | Email Marketing |
| `hostinger-ecommerce-mcp` | 12 | Ecommerce |
| `hostinger-agency-mcp` | 25 | Agency Hosting |
| `hostinger-horizons-mcp` | 2 | AI Website Builder |

## Tool Categories

### Billing (9 tools)
Catalog browsing, order creation, payment methods, subscriptions, auto-renewal, subscription renewal.

### DNS (8 tools)
Zone record CRUD, validation, reset, snapshots, restore.

### Domains (23 tools)
Portfolio management, availability check, purchase, nameservers, registrar lock, privacy protection, forwarding, WHOIS profiles, transfers, verifications.

### VPS (62 tools)
VM lifecycle (start/stop/restart/recreate), Docker Compose projects (CRUD + logs + containers), firewall (rules + activate/sync), SSH keys, backups, snapshots, OS templates, data centers, post-install scripts, recovery mode, Monarx malware scanner, PTR records, metrics, actions.

### Hosting (48+ tools)
Websites, cache (clear/toggle/cacheless), cron jobs (CRUD + output), databases (CRUD + repair + remote + phpMyAdmin), subdomains, parked domains, domain verification, PHP (version/options/extensions/reset/phpinfo), Node.js (builds/logs/restart/vulnerabilities/patch), deploy tools (JS app/static/WP import/plugin/theme).

### WordPress (35 tools)
Installations (list/install/detect/validate/delete), core (version/updates/update), plugins (list/search/suggested/available/install/activate/deactivate/update/uninstall), themes (list/install/activate/update/uninstall), LiteSpeed Cache, Memcached, maintenance mode, login links, JWT tokens, AI tools.

### Mail (38 tools)
Orders, mailboxes (CRUD + password), aliases, forwarders (+ resend confirmation), autoreplies, catch-alls (+ resend confirmation), webhooks (CRUD + test + regenerate secret + delivery logs), logs (access/action/inbound/outbound/mailbox-actions), API tokens.

### Email Marketing / Reach (12 tools)
Profiles, DNS status, contacts (single/bulk/delete), groups, segments (CRUD + contacts).

### Ecommerce (12 tools)
Stores (CRUD + metadata), products (physical/digital), sales channels (CRUD), shipping, manual payments, storefront instructions.

### Agency Hosting (25 tools)
Orders, datacenters, website provisioning (+ setup status), website management (details/delete/processes/build-assets), domains (link/unlink/change), cache, cron jobs, databases (+ users), file import, WordPress settings.

### Horizons (2 tools)
Create AI-built website, get website details/edit link.

### Smart Tools (7 tools)
`health_check`, `account_overview`, `batch_dns_update`, `batch_vps_restart`, `list_all_domains_paginated`, `list_all_websites_paginated`, `list_all_subscriptions_paginated`, `clear_api_cache`.

## CLI Options

```
Options:
  --stdio          Use stdio transport (default)
  --http           Use HTTP streaming transport
  --host <host>    HTTP host (default: 127.0.0.1)
  --port <port>    HTTP port (default: 8100)
  --login          Run OAuth sign-in flow and exit
  --logout         Revoke stored OAuth credentials and exit
  --domain <name>  Filter tools to specific domain
  --help, -h       Show help
```

## Architecture

```
src/
├── index.ts              # Entry point — CLI, transport, tool registration
├── api-client.ts         # HTTP client (retry, cache, rate-limit, pagination)
├── helpers.ts            # Response formatting
├── cli.ts                # CLI argument parser
├── auth/
│   └── oauth.ts          # OAuth 2.0 PKCE flow
├── tools/
│   ├── billing.ts        # 9 tools
│   ├── dns.ts            # 8 tools
│   ├── domains.ts        # 23 tools
│   ├── vps.ts            # 62 tools
│   ├── hosting.ts        # 41 tools
│   ├── wordpress.ts      # 35 tools
│   ├── mail.ts           # 38 tools
│   ├── reach.ts          # 12 tools
│   ├── ecommerce.ts      # 12 tools
│   ├── agency.ts         # 25 tools
│   ├── horizons.ts       # 2 tools
│   ├── deploy.ts         # 8 tools
│   └── smart.ts          # 7 tools
└── bin/                   # Per-domain entry points
    ├── hostinger-api-mcp.ts
    ├── hostinger-billing-mcp.ts
    ├── hostinger-dns-mcp.ts
    └── ... (12 total)
```

## Development

```bash
git clone https://github.com/rifqi96/hostinger-mcp.git
cd hostinger-mcp
npm install
npm run build
```

## Security

- Never hardcode API tokens — use environment variables
- OAuth credentials stored at `~/.config/hostinger-mcp/credentials.json` (mode 0600)
- Token has full account access — rotate immediately if exposed
- Tools with `destructiveHint: true` signal AI clients to confirm before executing

## References

- [Hostinger API Documentation](https://developers.hostinger.com)
- [Hostinger Official MCP](https://github.com/hostinger/api-mcp-server)
- [MCP Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## License

[MIT](LICENSE)
