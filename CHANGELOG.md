# Changelog

## [2.0.0] - 2025-07-30

### Added
- 280+ MCP tools covering the entire Hostinger API surface
- OAuth 2.0 with PKCE authentication (interactive browser sign-in)
- HTTP streaming transport (`--http` flag)
- CLI with full argument parsing (`--help`, `--login`, `--logout`, `--domain`, `--host`, `--port`)
- Per-domain binaries (12 separate commands for scoped tool access)
- Smart tools: `health_check`, `account_overview`, `batch_dns_update`, `batch_vps_restart`, `clear_api_cache`
- Auto-pagination helpers: `list_all_domains_paginated`, `list_all_websites_paginated`, `list_all_subscriptions_paginated`
- Deploy tools: JS app deploy, static deploy, WP import, WP plugin/theme deploy, Agency deploys
- Retry with exponential backoff (max 3 retries)
- Rate-limit 429 handling with `retry-after` header respect
- GET response caching (15s TTL, 500-entry max, auto-evict)
- Request timeout (30s default, configurable)
- `destructiveHint` annotations on all destructive operations
- `billing_renew_subscription` endpoint
- Mail resend confirmation endpoints (forwarder + catch-all)
- Horizons (AI website builder) tools

### Technical
- ESM (`"type": "module"`)
- TypeScript strict + `verbatimModuleSyntax`
- Target: ESNext + NodeNext module resolution
- MCP SDK 1.30.0 with `registerTool` (non-deprecated API)
- Zod schema validation on all inputs
- Native `fetch` — zero external HTTP dependencies
- Node.js 18+ compatible (vs official requiring Node 24)

## [1.0.0] - 2025-07-30

### Added
- Initial release with 90 tools
- Basic stdio transport
- Token-based authentication
