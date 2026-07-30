import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

const wpBase = (u: string, sw: string) => `/api/hosting/v1/accounts/${u}/wordpress/${sw}`;

export function registerWordPressTools(server: McpServer, client: HostingerApiClient) {
  // === Installations ===
  server.registerTool("wp_installations_list", {
    title: "List WordPress Installations",
    description: "List all WordPress installations across all hosting accounts.",
  }, async () => formatResult(await client.get("/api/hosting/v1/wordpress/installations")));

  server.registerTool("wp_install", {
    title: "Install WordPress",
    description: "Install WordPress on a hosting account.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      title: z.string().optional().describe("Site title"),
      admin_username: z.string().optional().describe("WP admin username"),
      admin_password: z.string().optional().describe("WP admin password"),
      admin_email: z.string().optional().describe("WP admin email"),
    },
  }, async ({ username, ...body }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/wordpress/installations`, body)));

  server.registerTool("wp_detect_installations", {
    title: "Detect WordPress Installations",
    description: "Auto-detect WordPress installations on a hosting account.",
    inputSchema: { username: z.string().describe("Hosting account username") },
  }, async ({ username }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/wordpress/installations/detect`)));

  server.registerTool("wp_check_valid", {
    title: "Check WordPress Validity",
    description: "Check if WordPress installations are valid/intact.",
    inputSchema: { username: z.string().describe("Hosting account username") },
  }, async ({ username }) => formatResult(await client.post(`/api/hosting/v1/accounts/${username}/wordpress/installations/check-is-valid`)));

  server.registerTool("wp_delete", {
    title: "Delete WordPress Installation",
    description: "Delete a WordPress installation.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, software }) => formatResult(await client.delete(wpBase(username, software))));

  server.registerTool("wp_get_version", {
    title: "Get WordPress Version",
    description: "Show WordPress core version.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/version`)));

  server.registerTool("wp_list_updates", {
    title: "List WordPress Updates",
    description: "List available WordPress core updates.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/updates`)));

  server.registerTool("wp_update_core", {
    title: "Update WordPress Core",
    description: "Update WordPress core to latest version.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.post(`${wpBase(username, software)}/update`)));

  server.registerTool("wp_jwt_token", {
    title: "Get WP JWT Token",
    description: "Get installation JWT token for API access.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/jwt-token`)));


  // === Plugins ===
  server.registerTool("wp_plugins_list", {
    title: "List Installed Plugins",
    description: "List installed WordPress plugins.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/plugins`)));

  server.registerTool("wp_plugins_available", {
    title: "List Available Plugins",
    description: "List plugins available for installation.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/plugins/available`)));

  server.registerTool("wp_plugins_search", {
    title: "Search WordPress Plugins",
    description: "Search the WordPress plugin repository.",
    inputSchema: {
      query: z.string().optional().describe("Search query"),
    },
  }, async ({ query }) => formatResult(await client.get("/api/hosting/v1/wordpress/plugins", { query })));

  server.registerTool("wp_plugins_suggested", {
    title: "List Suggested Plugins",
    description: "Get suggested WordPress plugins.",
  }, async () => formatResult(await client.get("/api/hosting/v1/wordpress/plugins/suggested")));

  server.registerTool("wp_plugins_install", {
    title: "Install WordPress Plugins",
    description: "Install plugins by slug.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      plugins: z.array(z.string()).describe("Plugin slugs to install"),
    },
  }, async ({ username, software, plugins }) => formatResult(await client.post(`${wpBase(username, software)}/plugins/install`, { plugins })));

  server.registerTool("wp_plugins_activate", {
    title: "Activate Plugin",
    description: "Activate a WordPress plugin.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      plugin: z.string().describe("Plugin slug"),
    },
  }, async ({ username, software, plugin }) => formatResult(await client.post(`${wpBase(username, software)}/plugins/activate`, { plugin })));

  server.registerTool("wp_plugins_deactivate", {
    title: "Deactivate Plugin",
    description: "Deactivate a WordPress plugin.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      plugin: z.string().describe("Plugin slug"),
    },
  }, async ({ username, software, plugin }) => formatResult(await client.post(`${wpBase(username, software)}/plugins/deactivate`, { plugin })));

  server.registerTool("wp_plugins_update", {
    title: "Update Plugins",
    description: "Update WordPress plugins.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      plugins: z.array(z.string()).describe("Plugin slugs to update"),
    },
  }, async ({ username, software, plugins }) => formatResult(await client.post(`${wpBase(username, software)}/plugins/update`, { plugins })));

  server.registerTool("wp_plugins_uninstall", {
    title: "Uninstall Plugins",
    description: "Uninstall WordPress plugins.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      plugins: z.array(z.string()).describe("Plugin slugs to uninstall"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, software, plugins }) => formatResult(await client.post(`${wpBase(username, software)}/plugins/uninstall`, { plugins })));

  server.registerTool("wp_plugins_update_hostinger", {
    title: "Update Hostinger Plugin",
    description: "Update the Hostinger WordPress plugin.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.post(`${wpBase(username, software)}/plugins/hostinger/update`)));

  server.registerTool("wp_woocommerce_check", {
    title: "Check WooCommerce",
    description: "Check if WooCommerce is installed.",
  }, async () => formatResult(await client.get("/api/hosting/v1/wordpress/plugins/is-woocommerce-installed")));


  // === Themes ===
  server.registerTool("wp_themes_list_installed", {
    title: "List Installed Themes",
    description: "List installed WordPress themes.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/themes`)));

  server.registerTool("wp_themes_list_available", {
    title: "List Available Themes",
    description: "Browse WordPress themes.",
  }, async () => formatResult(await client.get("/api/hosting/v1/wordpress/themes")));

  server.registerTool("wp_themes_install", {
    title: "Install Theme",
    description: "Install a WordPress theme.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      theme: z.string().describe("Theme slug"),
    },
  }, async ({ username, software, theme }) => formatResult(await client.post(`${wpBase(username, software)}/themes/install`, { theme })));

  server.registerTool("wp_themes_activate", {
    title: "Activate Theme",
    description: "Activate a WordPress theme.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      theme: z.string().describe("Theme slug"),
    },
  }, async ({ username, software, theme }) => formatResult(await client.post(`${wpBase(username, software)}/themes/activate`, { theme })));

  server.registerTool("wp_themes_update", {
    title: "Update Themes",
    description: "Update WordPress themes.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      themes: z.array(z.string()).describe("Theme slugs to update"),
    },
  }, async ({ username, software, themes }) => formatResult(await client.post(`${wpBase(username, software)}/themes/update`, { themes })));

  server.registerTool("wp_themes_uninstall", {
    title: "Uninstall Themes",
    description: "Uninstall WordPress themes.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      themes: z.array(z.string()).describe("Theme slugs to uninstall"),
    },
    annotations: { destructiveHint: true },
  }, async ({ username, software, themes }) => formatResult(await client.post(`${wpBase(username, software)}/themes/uninstall`, { themes })));

  // === Cache / LiteSpeed ===
  server.registerTool("wp_litespeed_status", {
    title: "LiteSpeed Cache Status",
    description: "Show LiteSpeed Cache status.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/litespeed-cache/status`)));

  server.registerTool("wp_litespeed_purge", {
    title: "Purge LiteSpeed Cache",
    description: "Purge the LiteSpeed Cache.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.post(`${wpBase(username, software)}/litespeed-cache/purge`)));

  // === Object Cache (Memcached) ===
  server.registerTool("wp_memcached_status", {
    title: "Memcached Status",
    description: "Show Memcached object cache status.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/memcached/status`)));

  server.registerTool("wp_memcached_toggle", {
    title: "Toggle Memcached",
    description: "Toggle Memcached object cache on/off.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.patch(`${wpBase(username, software)}/memcached/toggle`)));

  // === Maintenance ===
  server.registerTool("wp_maintenance_status", {
    title: "Maintenance Status",
    description: "Show maintenance mode status.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/maintenance/status`)));

  server.registerTool("wp_maintenance_toggle", {
    title: "Toggle Maintenance",
    description: "Toggle maintenance mode on/off.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.patch(`${wpBase(username, software)}/maintenance/toggle`)));

  // === Login ===
  server.registerTool("wp_login_link", {
    title: "Create Login Link",
    description: "Create a one-click WP admin login link.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.post(`${wpBase(username, software)}/login/links`)));

  // === AI Tools ===
  server.registerTool("wp_ai_status", {
    title: "Show AI Option Status",
    description: "Show AI tools option status for WordPress.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
    },
  }, async ({ username, software }) => formatResult(await client.get(`${wpBase(username, software)}/hostinger-plugins/ai-option/status`)));

  server.registerTool("wp_ai_toggle", {
    title: "Set AI Option Status",
    description: "Enable or disable AI tools for WordPress.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      enabled: z.boolean().describe("Enable (true) or disable (false)"),
    },
  }, async ({ username, software, enabled }) => formatResult(await client.patch(`${wpBase(username, software)}/hostinger-plugins/ai-option/status`, { enabled })));
}
