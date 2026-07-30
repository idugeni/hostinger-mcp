import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerAgencyTools(server: McpServer, client: HostingerApiClient) {
  // === Orders ===
  server.registerTool("agency_orders_list", {
    title: "List Agency Orders",
    description: "List Agency Plan orders.",
  }, async () => formatResult(await client.get("/api/agency-hosting/v1/orders")));

  server.registerTool("agency_datacenters", {
    title: "List Agency Datacenters",
    description: "List available datacenters for an Agency Plan order.",
    inputSchema: { order_id: z.string().describe("Agency order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/agency-hosting/v1/orders/${order_id}/datacenters`)));

  // === Domains ===
  server.registerTool("agency_domains_list", {
    title: "List Agency Domains",
    description: "List all Agency Plan domains.",
  }, async () => formatResult(await client.get("/api/agency-hosting/v1/domains")));

  // === Websites ===
  server.registerTool("agency_website_provision", {
    title: "Provision Agency Website",
    description: "Provision a new Agency Plan website.",
    inputSchema: {
      order_id: z.string().describe("Agency order ID"),
      domain: z.string().optional().describe("Domain for the website"),
    },
  }, async ({ order_id, ...body }) => formatResult(await client.post(`/api/agency-hosting/v1/orders/${order_id}/websites/setups`, body)));

  server.registerTool("agency_website_setup_status", {
    title: "Get Setup Status",
    description: "Get Agency Plan website setup status.",
    inputSchema: {
      order_id: z.string().describe("Agency order ID"),
      setup_uuid: z.string().describe("Setup UUID"),
    },
  }, async ({ order_id, setup_uuid }) => formatResult(await client.get(`/api/agency-hosting/v1/orders/${order_id}/websites/setups/${setup_uuid}`)));

  server.registerTool("agency_website_get", {
    title: "Get Agency Website",
    description: "Get Agency Plan website details.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.get(`/api/agency-hosting/v1/websites/${website_uid}`)));

  server.registerTool("agency_website_delete", {
    title: "Delete Agency Website",
    description: "Delete an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
    annotations: { destructiveHint: true },
  }, async ({ website_uid }) => formatResult(await client.delete(`/api/agency-hosting/v1/websites/${website_uid}`)));

  server.registerTool("agency_website_processes", {
    title: "List Website Processes",
    description: "List running processes on an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.get(`/api/agency-hosting/v1/websites/${website_uid}/processes`)));

  server.registerTool("agency_website_build_assets", {
    title: "Build Node.js Assets",
    description: "Build Node.js assets for an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.post(`/api/agency-hosting/v1/websites/${website_uid}/build-assets`)));

  // === Domains on Website ===
  server.registerTool("agency_website_link_domain", {
    title: "Link Domain",
    description: "Link a domain to an Agency Plan website.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      domain: z.string().describe("Domain to link"),
    },
  }, async ({ website_uid, domain }) => formatResult(await client.post(`/api/agency-hosting/v1/websites/${website_uid}/domains`, { domain })));

  server.registerTool("agency_website_unlink_domain", {
    title: "Unlink Domain",
    description: "Unlink a domain from an Agency Plan website.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      domain: z.string().describe("Domain to unlink"),
    },
    annotations: { destructiveHint: true },
  }, async ({ website_uid, domain }) => formatResult(await client.delete(`/api/agency-hosting/v1/websites/${website_uid}/domains/${domain}`)));

  server.registerTool("agency_website_change_domain", {
    title: "Change Website Domain",
    description: "Change the primary domain of an Agency Plan website.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      from_domain: z.string().describe("Current domain"),
      to_domain: z.string().describe("New domain"),
    },
  }, async ({ website_uid, from_domain, to_domain }) => formatResult(await client.put(`/api/agency-hosting/v1/websites/${website_uid}/domains/${from_domain}`, { to_domain })));

  // === Cache ===
  server.registerTool("agency_cache_clear", {
    title: "Clear Agency Cache",
    description: "Clear cache for an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.delete(`/api/agency-hosting/v1/websites/${website_uid}/cache`)));

  // === Cron Jobs ===
  server.registerTool("agency_cron_list", {
    title: "List Agency Cron Jobs",
    description: "List cron jobs for an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.get(`/api/agency-hosting/v1/websites/${website_uid}/cron-jobs`)));

  server.registerTool("agency_cron_create", {
    title: "Create Agency Cron Job",
    description: "Create a cron job.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      command: z.string().describe("Command to execute"),
      schedule: z.string().describe("Cron schedule"),
    },
  }, async ({ website_uid, command, schedule }) => formatResult(await client.post(`/api/agency-hosting/v1/websites/${website_uid}/cron-jobs`, { command, schedule })));

  server.registerTool("agency_cron_delete", {
    title: "Delete Agency Cron Job",
    description: "Delete a cron job.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      uuid: z.string().describe("Cron job UUID"),
    },
    annotations: { destructiveHint: true },
  }, async ({ website_uid, uuid }) => formatResult(await client.delete(`/api/agency-hosting/v1/websites/${website_uid}/cron-jobs/${uuid}`)));

  // === Databases ===
  server.registerTool("agency_db_list", {
    title: "List Agency Databases",
    description: "List databases for an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.get(`/api/agency-hosting/v1/websites/${website_uid}/databases`)));

  server.registerTool("agency_db_create", {
    title: "Create Agency Database",
    description: "Create a database.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      name: z.string().describe("Database name"),
      password: z.string().describe("Database password"),
    },
  }, async ({ website_uid, name, password }) => formatResult(await client.post(`/api/agency-hosting/v1/websites/${website_uid}/databases`, { name, password })));

  server.registerTool("agency_db_delete", {
    title: "Delete Agency Database",
    description: "Delete a database.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      database_name: z.string().describe("Database name"),
    },
    annotations: { destructiveHint: true },
  }, async ({ website_uid, database_name }) => formatResult(await client.delete(`/api/agency-hosting/v1/websites/${website_uid}/databases/${database_name}`)));

  server.registerTool("agency_db_create_user", {
    title: "Create DB User",
    description: "Create a database user.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      database_name: z.string().describe("Database name"),
      username: z.string().describe("Username"),
      password: z.string().describe("Password"),
    },
  }, async ({ website_uid, database_name, username, password }) => formatResult(await client.post(`/api/agency-hosting/v1/websites/${website_uid}/databases/${database_name}/users`, { username, password })));

  server.registerTool("agency_db_delete_user", {
    title: "Delete DB User",
    description: "Delete a database user.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      database_name: z.string().describe("Database name"),
      database_user_name: z.string().describe("Database user name"),
    },
    annotations: { destructiveHint: true },
  }, async ({ website_uid, database_name, database_user_name }) => formatResult(await client.delete(`/api/agency-hosting/v1/websites/${website_uid}/databases/${database_name}/users/${database_user_name}`)));

  // === Files ===
  server.registerTool("agency_import_archive", {
    title: "Import from Archive",
    description: "Import an Agency Plan website from an archive.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.post(`/api/agency-hosting/v1/websites/${website_uid}/files/import-archive`)));

  // === WordPress ===
  server.registerTool("agency_wp_settings", {
    title: "Get WP Settings",
    description: "Get WordPress settings for an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.get(`/api/agency-hosting/v1/websites/${website_uid}/wordpress/settings`)));

  server.registerTool("agency_wp_versions", {
    title: "List WP Versions",
    description: "List available WordPress versions for an Agency Plan website.",
    inputSchema: { website_uid: z.string().describe("Website UID") },
  }, async ({ website_uid }) => formatResult(await client.get(`/api/agency-hosting/v1/websites/${website_uid}/wordpress/settings/versions`)));

  server.registerTool("agency_wp_change_version", {
    title: "Change WP Version",
    description: "Change WordPress core version for an Agency Plan website.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      version: z.string().describe("WordPress version"),
    },
  }, async ({ website_uid, version }) => formatResult(await client.patch(`/api/agency-hosting/v1/websites/${website_uid}/wordpress/settings/version`, { version })));
}
