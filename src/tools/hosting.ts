import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerHostingTools(server: McpServer, client: HostingerApiClient) {
  // === Websites ===
  server.registerTool("hosting_websites_list", {
    title: "List Websites",
    description: "List all websites on your hosting account.",
  }, async () => formatResult(await client.get("/api/hosting/v1/websites")));

  server.registerTool("hosting_websites_create", {
    title: "Create Website",
    description: "Create a new website.",
    inputSchema: {
      domain: z.string().describe("Domain for the website"),
      order_id: z.string().optional().describe("Hosting order ID"),
    },
  }, async (args) => formatResult(await client.post("/api/hosting/v1/websites", args)));

  server.registerTool("hosting_websites_delete", {
    title: "Delete Website",
    description: "Delete a website.",
    inputSchema: { domain: z.string().describe("Website domain") },
    annotations: { destructiveHint: true },
  }, async ({ domain }) => formatResult(await client.delete(`/api/hosting/v1/websites/${domain}`)));

  // === Orders ===
  server.registerTool("hosting_orders_list", {
    title: "List Hosting Orders",
    description: "List all hosting orders.",
  }, async () => formatResult(await client.get("/api/hosting/v1/orders")));

  // === Datacenters ===
  server.registerTool("hosting_datacenters_list", {
    title: "List Hosting Datacenters",
    description: "List available datacenters.",
  }, async () => formatResult(await client.get("/api/hosting/v1/datacenters")));

  // === Cache ===
  server.registerTool("hosting_cache_clear", {
    title: "Clear Website Cache",
    description: "Clear cache for a hosted website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.delete(`/api/hosting/v1/accounts/${username}/websites/${domain}/cache/clear`)));

  server.registerTool("hosting_cache_toggle", {
    title: "Toggle Website Cache",
    description: "Toggle cache on/off for a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/websites/${domain}/cache/toggle`)));

  server.registerTool("hosting_cacheless_toggle", {
    title: "Toggle Cacheless Mode",
    description: "Toggle cacheless (bypass) mode for a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/websites/${domain}/cacheless-mode/toggle`)));

  // === Cron Jobs ===
  server.registerTool("hosting_cron_list", {
    title: "List Cron Jobs",
    description: "List cron jobs for a hosting account.",
    inputSchema: { username: z.string().describe("Hosting account username") },
  }, async ({ username }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/cron-jobs`)));

  server.registerTool("hosting_cron_create", {
    title: "Create Cron Job",
    description: "Create a cron job.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      command: z.string().describe("Command to execute"),
      schedule: z.string().describe("Cron schedule expression"),
    },
  }, async ({ username, command, schedule }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/cron-jobs`, { command, schedule })));

  server.registerTool("hosting_cron_get_output", {
    title: "Get Cron Job Output",
    description: "Get output of a cron job execution.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      uid: z.string().describe("Cron job UID"),
    },
  }, async ({ username, uid }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/cron-jobs/${uid}/output`)));

  server.registerTool("hosting_cron_delete", {
    title: "Delete Cron Job",
    description: "Delete a cron job.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      uid: z.string().describe("Cron job UID"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, uid }) => formatResult(await client.delete(`/api/hosting/v1/accounts/${username}/cron-jobs/${uid}`)));


  // === Databases ===
  server.registerTool("hosting_db_list", {
    title: "List Databases",
    description: "List databases for a hosting account.",
    inputSchema: { username: z.string().describe("Hosting account username") },
  }, async ({ username }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/databases`)));

  server.registerTool("hosting_db_create", {
    title: "Create Database",
    description: "Create a new database.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      name: z.string().describe("Database name"),
      password: z.string().describe("Database password"),
    },
  }, async ({ username, name, password }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/databases`, { name, password })));

  server.registerTool("hosting_db_delete", {
    title: "Delete Database",
    description: "Delete a database.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      name: z.string().describe("Database name"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, name }) => formatResult(await client.delete(`/api/hosting/v1/accounts/${username}/databases/${name}`)));

  server.registerTool("hosting_db_change_password", {
    title: "Change Database Password",
    description: "Change a database password.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      name: z.string().describe("Database name"),
      password: z.string().describe("New password"),
    },
  }, async ({ username, name, password }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/databases/${name}/change-password`, { password })));

  server.registerTool("hosting_db_repair", {
    title: "Repair Database",
    description: "Repair a corrupted database.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      name: z.string().describe("Database name"),
    },
  }, async ({ username, name }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/databases/${name}/repair`)));

  server.registerTool("hosting_db_phpmyadmin", {
    title: "Get phpMyAdmin Link",
    description: "Get a phpMyAdmin access link for a database.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      name: z.string().describe("Database name"),
    },
  }, async ({ username, name }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/databases/${name}/phpmyadmin-link`)));

  server.registerTool("hosting_db_remote_list", {
    title: "List Remote DB Connections",
    description: "List remote database connections.",
    inputSchema: { username: z.string().describe("Hosting account username") },
  }, async ({ username }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/databases/remote-connections`)));

  server.registerTool("hosting_db_remote_create", {
    title: "Create Remote DB Connection",
    description: "Allow a remote IP to connect to a database.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      name: z.string().describe("Database name"),
      ip: z.string().describe("Remote IP address"),
    },
  }, async ({ username, name, ip }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/databases/${name}/remote-connections`, { ip })));

  server.registerTool("hosting_db_remote_delete", {
    title: "Delete Remote DB Connection",
    description: "Remove a remote database connection.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      name: z.string().describe("Database name"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, name }) => formatResult(await client.delete(`/api/hosting/v1/accounts/${username}/databases/${name}/remote-connections`)));


  // === Domains / Subdomains ===
  server.registerTool("hosting_subdomains_list", {
    title: "List Subdomains",
    description: "List subdomains for a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/subdomains`)));

  server.registerTool("hosting_subdomains_create", {
    title: "Create Subdomain",
    description: "Create a subdomain.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      subdomain: z.string().describe("Subdomain prefix"),
    },
  }, async ({ username, domain, subdomain }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/subdomains`, { subdomain })));

  server.registerTool("hosting_subdomains_delete", {
    title: "Delete Subdomain",
    description: "Delete a subdomain.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      subdomain: z.string().describe("Subdomain to delete"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, domain, subdomain }) => formatResult(await client.delete(`/api/hosting/v1/accounts/${username}/websites/${domain}/subdomains/${subdomain}`)));

  server.registerTool("hosting_parked_list", {
    title: "List Parked Domains",
    description: "List parked domains for a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/parked-domains`)));

  server.registerTool("hosting_parked_create", {
    title: "Create Parked Domain",
    description: "Park a domain on a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      parked_domain: z.string().describe("Domain to park"),
    },
  }, async ({ username, domain, parked_domain }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/parked-domains`, { parked_domain })));

  server.registerTool("hosting_parked_delete", {
    title: "Delete Parked Domain",
    description: "Remove a parked domain.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      parked_domain: z.string().describe("Parked domain to remove"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, domain, parked_domain }) => formatResult(await client.delete(`/api/hosting/v1/accounts/${username}/websites/${domain}/parked-domains/${parked_domain}`)));

  server.registerTool("hosting_free_subdomain", {
    title: "Generate Free Subdomain",
    description: "Generate a free subdomain for testing.",
  }, async () => formatResult(await client.post("/api/hosting/v1/domains/free-subdomains")));

  server.registerTool("hosting_verify_domain", {
    title: "Verify Domain Ownership",
    description: "Verify ownership of a domain for hosting.",
    inputSchema: {
      domain: z.string().describe("Domain to verify"),
    },
  }, async ({ domain }) => formatResult(await client.post("/api/hosting/v1/domains/verify-ownership", { domain })));


  // === PHP ===
  server.registerTool("hosting_php_details", {
    title: "Get PHP Details",
    description: "Get PHP configuration for a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/php/details`)));

  server.registerTool("hosting_php_info", {
    title: "Get PHP Info",
    description: "Get full phpinfo() output.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/php/php-info`)));

  server.registerTool("hosting_php_update_version", {
    title: "Update PHP Version",
    description: "Change PHP version for a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      version: z.string().describe("PHP version (e.g. '8.3')"),
    },
  }, async ({ username, domain, version }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/websites/${domain}/php/version`, { version })));

  server.registerTool("hosting_php_update_options", {
    title: "Update PHP Options",
    description: "Update PHP options (ini settings).",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      options: z.record(z.string()).describe("PHP options key-value pairs"),
    },
  }, async ({ username, domain, options }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/websites/${domain}/php/options`, { options })));

  server.registerTool("hosting_php_update_extensions", {
    title: "Update PHP Extensions",
    description: "Enable/disable PHP extensions.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      extensions: z.record(z.boolean()).describe("Extension name -> enabled/disabled"),
    },
  }, async ({ username, domain, extensions }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/websites/${domain}/php/extensions`, { extensions })));

  server.registerTool("hosting_php_reset_extensions", {
    title: "Reset PHP Extensions",
    description: "Reset PHP extensions to defaults.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.patch(`/api/hosting/v1/accounts/${username}/websites/${domain}/php/extensions/reset`)));

  // === Node.js ===
  server.registerTool("hosting_nodejs_builds_list", {
    title: "List Node.js Builds",
    description: "List Node.js builds for a website.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds`)));

  server.registerTool("hosting_nodejs_build_logs", {
    title: "Get Node.js Build Logs",
    description: "Get logs for a Node.js build.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      uuid: z.string().describe("Build UUID"),
    },
  }, async ({ username, domain, uuid }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds/${uuid}/logs`)));

  server.registerTool("hosting_nodejs_build_from_archive", {
    title: "Create Node.js Build from Archive",
    description: "Create a Node.js build from an uploaded archive.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds/from-archive`)));

  server.registerTool("hosting_nodejs_restart", {
    title: "Restart Node.js App",
    description: "Restart a Node.js application.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/server/restart`)));

  server.registerTool("hosting_nodejs_vulnerabilities", {
    title: "List Node.js Vulnerabilities",
    description: "List known vulnerabilities in Node.js dependencies.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/vulnerabilities`)));

  server.registerTool("hosting_nodejs_patch_vulnerabilities", {
    title: "Patch Node.js Vulnerabilities",
    description: "Auto-patch known Node.js vulnerabilities.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
    },
  }, async ({ username, domain }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/vulnerabilities/patch`)));
}
