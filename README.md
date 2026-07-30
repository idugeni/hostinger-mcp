<div align="center">

# hostinger-mcp-server

**The most powerful MCP server for Hostinger — built for AI agents that manage infrastructure.**

[![npm version](https://img.shields.io/npm/v/hostinger-mcp-server?style=flat-square&color=cb3837)](https://www.npmjs.com/package/hostinger-mcp-server)
[![CI](https://img.shields.io/github/actions/workflow/status/idugeni/hostinger-mcp/ci.yml?style=flat-square&label=ci)](https://github.com/idugeni/hostinger-mcp/actions)
[![Node](https://img.shields.io/node/v/hostinger-mcp-server?style=flat-square&color=339933)](https://nodejs.org)
[![License](https://img.shields.io/github/license/idugeni/hostinger-mcp?style=flat-square)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/hostinger-mcp-server?style=flat-square&color=blue)](https://www.npmjs.com/package/hostinger-mcp-server)

[Getting Started](#-getting-started) · [Why This?](#-why-this-over-official) · [Tools](#-tool-categories) · [Config](#-mcp-client-configuration) · [Architecture](#-architecture)

</div>

---

## Overview

`hostinger-mcp-server` connects any MCP-compatible AI agent (Claude, Kiro, Cursor, Windsurf, etc.) to the full Hostinger platform. Manage VPS, domains, DNS, hosting, WordPress, email, ecommerce, and more — all through natural language.

```
"Restart my VPS and purge the LiteSpeed cache on my WordPress site"
"Add A record for api.example.com pointing to 203.0.113.1"
"Deploy my Node.js app from the uploaded archive"
```

The agent calls the right tools. You stay in control.

---

## Why This Over Official?

| | Official `hostinger-api-mcp` | **This** `hostinger-mcp-server` |
|---|:---:|:---:|
| Tools | 276 | **280+** |
| Min Node.js | 24 | **18** |
| Retry + backoff | — | **Exponential, 3x** |
| Rate-limit handling | — | **429 + retry-after** |
| Response caching | — | **GET, 15s TTL** |
| Request timeout | — | **30s configurable** |
| Batch operations | — | **Multi-domain, multi-VPS** |
| Auto-pagination | — | **Fetches all pages** |
| Health check | — | **Built-in** |
| Account overview | — | **One-call summary** |
| Destructive hints | — | **On all risky ops** |
| HTTP dependencies | 7 (axios, express…) | **0** (native fetch) |
| OAuth 2.0 + PKCE | Yes | **Yes** |
| HTTP transport | Yes | **Yes** |
| Per-domain binaries | Yes | **Yes (12)** |

---

## Getting Started

### Install

```bash
# Global install
npm install -g hostinger-mcp-server

# Or run directly (no install)
npx hostinger-mcp-server
```

### Authenticate

**Option A — API Token** (recommended for CI/scripts):
```bash
export HOSTINGER_API_TOKEN="your-token-from-hpanel"
```
Get your token at [hpanel.hostinger.com/api](https://hpanel.hostinger.com/api)

**Option B — OAuth** (interactive):
```bash
hostinger-mcp --login
```

---

## MCP Client Configuration

### Claude Desktop / Kiro / Cursor / Windsurf

```json
{
  "mcpServers": {
    "hostinger": {
      "command": "npx",
      "args": ["-y", "hostinger-mcp-server"],
      "env": {
        "HOSTINGER_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### HTTP Mode (remote / shared)

```bash
HOSTINGER_API_TOKEN=your-token hostinger-mcp --http --host 0.0.0.0 --port 8100
```

Then connect any MCP client to `http://your-server:8100`.

---

## Per-Domain Binaries

Only expose what your agent needs:

```bash
hostinger-mcp              # All 280+ tools
hostinger-vps-mcp          # 62 VPS tools
hostinger-hosting-mcp      # 48 Hosting + Deploy tools
hostinger-wordpress-mcp    # 35 WordPress tools
hostinger-mail-mcp         # 38 Mail tools
hostinger-dns-mcp          # 8 DNS tools
hostinger-domains-mcp      # 23 Domain tools
hostinger-billing-mcp      # 9 Billing tools
hostinger-reach-mcp        # 12 Email Marketing tools
hostinger-ecommerce-mcp    # 12 Ecommerce tools
hostinger-agency-mcp       # 25 Agency Hosting tools
hostinger-horizons-mcp     # 2 AI Website Builder tools
```

---

## Tool Categories

<details>
<summary><strong>VPS (62 tools)</strong> — Full VM lifecycle + Docker + Firewall</summary>

- VM: list, get, purchase, setup, start, stop, restart, recreate
- Config: hostname, root password, panel password, nameservers
- Monitoring: metrics (CPU/RAM/disk/network), actions
- Docker: create, get, update, start, stop, restart, delete, logs, containers
- Firewall: CRUD rules, activate, deactivate, sync
- SSH Keys: list, create, delete, attach
- Backups & Snapshots: list, restore, create, delete
- Templates & Data Centers: browse OS templates, list locations
- Scripts: CRUD post-install scripts
- Recovery: start/stop recovery mode
- Security: Monarx malware scanner (install/uninstall/metrics)
- Network: PTR records (create/delete)

</details>

<details>
<summary><strong>Hosting (48 tools)</strong> — Websites, PHP, Node.js, Databases</summary>

- Websites: list, create, delete
- Cache: clear, toggle, cacheless mode
- Cron Jobs: list, create, delete, get output
- Databases: CRUD, change password, repair, phpMyAdmin link, remote connections
- Domains: subdomains, parked domains, free subdomain, verify ownership
- PHP: version, options, extensions, reset, phpinfo
- Node.js: builds, logs, restart, vulnerabilities, auto-patch
- Deploy: JS app, static site, WP import, WP plugin, WP theme

</details>

<details>
<summary><strong>WordPress (35 tools)</strong> — Plugins, Themes, Cache, Maintenance</summary>

- Installations: list, install, detect, validate, delete
- Core: version, updates, update
- Plugins: list, search, suggested, available, install, activate, deactivate, update, uninstall
- Themes: list, browse, install, activate, update, uninstall
- Performance: LiteSpeed Cache (status/purge), Memcached (status/toggle)
- Operations: maintenance mode, login links, JWT tokens, AI tools

</details>

<details>
<summary><strong>Mail (38 tools)</strong> — Mailboxes, Forwarding, Webhooks, Logs</summary>

- Orders & Plans
- Mailboxes: list, create, delete, change password
- Aliases: list, create, delete
- Forwarders: list, create, delete, keep-copy, resend confirmation
- Autoreplies: list, create, update, delete
- Catch-alls: list, create, delete, resend confirmation
- Webhooks: CRUD, test, regenerate secret, delivery logs
- Logs: access, action, inbound, outbound, mailbox-actions
- API Tokens: list, create, revoke

</details>

<details>
<summary><strong>Domains (23 tools)</strong> — Portfolio, DNS, WHOIS, Transfers</summary>

- Availability check, purchase
- Portfolio: list, details, nameservers
- Security: domain lock, privacy protection, auth code
- Forwarding: create, get, update, delete
- WHOIS: profiles CRUD, usage
- Transfers: list, details
- Verifications

</details>

<details>
<summary><strong>DNS (8 tools)</strong> — Records, Validation, Snapshots</summary>

- Records: get, update, delete, reset, validate
- Snapshots: list, get, restore

</details>

<details>
<summary><strong>Billing (9 tools)</strong> — Catalog, Orders, Subscriptions</summary>

- Catalog: browse products & pricing
- Orders: create purchase order
- Payment Methods: list, set default, delete
- Subscriptions: list, enable/disable auto-renewal, renew

</details>

<details>
<summary><strong>Reach / Email Marketing (12 tools)</strong></summary>

- Profiles: list, DNS status
- Contacts: list, create (single/bulk), delete, groups
- Segments: list, create, get, contacts

</details>

<details>
<summary><strong>Ecommerce (12 tools)</strong></summary>

- Stores: list, create, delete, metadata
- Products: physical, digital
- Sales Channels: list, create, update
- Shipping, Payments, Storefront instructions

</details>

<details>
<summary><strong>Agency Hosting (25 tools)</strong></summary>

- Orders, Datacenters
- Websites: provision, status, details, delete, processes, build assets
- Domains: link, unlink, change
- Cache, Cron Jobs, Databases (+ users)
- File import, WordPress settings/versions

</details>

<details>
<summary><strong>Smart Tools (8 tools)</strong> — Exclusive to this server</summary>

- `health_check` — Verify API connectivity + auth
- `account_overview` — Full service summary in one call
- `batch_dns_update` — Apply records to multiple domains
- `batch_vps_restart` — Restart multiple VMs at once
- `list_all_domains_paginated` — Auto-fetch all pages
- `list_all_websites_paginated` — Auto-fetch all pages
- `list_all_subscriptions_paginated` — Auto-fetch all pages
- `clear_api_cache` — Force fresh data

</details>

---

## CLI

```
Usage: hostinger-mcp [options]

Options:
  --stdio          Stdio transport (default)
  --http           HTTP streaming transport
  --host <host>    Bind host (default: 127.0.0.1)
  --port <port>    Bind port (default: 8100)
  --login          OAuth sign-in and exit
  --logout         Clear stored credentials and exit
  --domain <name>  Load only one domain's tools
  --help           Show help
```

---

## Architecture

```
src/
├── index.ts              Entry point — CLI, auth, registration, transport
├── api-client.ts         HTTP engine: retry, cache, rate-limit, pagination
├── cli.ts                Argument parser
├── helpers.ts            Response formatter
├── auth/
│   └── oauth.ts          OAuth 2.0 PKCE + credential storage
├── tools/
│   ├── billing.ts        9 tools
│   ├── dns.ts            8 tools
│   ├── domains.ts        23 tools
│   ├── vps.ts            62 tools
│   ├── hosting.ts        41 tools
│   ├── wordpress.ts      35 tools
│   ├── mail.ts           38 tools
│   ├── reach.ts          12 tools
│   ├── ecommerce.ts      12 tools
│   ├── agency.ts         25 tools
│   ├── horizons.ts       2 tools
│   ├── deploy.ts         8 tools
│   └── smart.ts          8 tools
└── bin/                   Per-domain entry points (12 files)
```

**Tech Stack:**
- Runtime: Node.js 18+ (ESM)
- Language: TypeScript (strict)
- MCP SDK: `@modelcontextprotocol/sdk` ^1.30 (`registerTool` API)
- Validation: Zod ^3.25
- HTTP: Native `fetch` — zero external deps
- Target: ESNext + NodeNext

---

## Security

| Practice | Implementation |
|----------|---------------|
| Token storage | Environment variable only |
| OAuth credentials | `~/.config/hostinger-mcp/credentials.json` (mode 0600) |
| Destructive operations | Annotated with `destructiveHint: true` |
| Token in code | Never — always via ENV |

If a token is compromised, revoke immediately at [hpanel.hostinger.com/api](https://hpanel.hostinger.com/api).

---

## Contributing

```bash
git clone https://github.com/idugeni/hostinger-mcp.git
cd hostinger-mcp
npm install
npm run build
```

PRs welcome. Please ensure `npm run build` passes with zero errors before submitting.

---

## References

- [Hostinger API Documentation](https://developers.hostinger.com)
- [MCP Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---

<div align="center">

**Built with precision for AI-powered infrastructure management.**

[Report Bug](https://github.com/idugeni/hostinger-mcp/issues) · [Request Feature](https://github.com/idugeni/hostinger-mcp/issues)

</div>
