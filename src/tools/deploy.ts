import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerDeployTools(server: McpServer, client: HostingerApiClient) {
  // === JS App Deployments ===
  server.registerTool("hosting_deploy_js_app", {
    title: "Deploy JS Application",
    description: "Deploy a JavaScript application from an archive. The archive must contain source files only (no node_modules, no build output). Build runs automatically on server. Use hosting_deploy_list_js to check status.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      archive_path: z.string().describe("Relative path to the archive file on the server (already uploaded via file manager)"),
      build_command: z.string().optional().describe("Build command override (auto-detected from package.json if omitted)"),
      output_dir: z.string().optional().describe("Output directory override (auto-detected if omitted)"),
      node_version: z.string().optional().describe("Node.js version to use"),
    },
  }, async ({ username, domain, archive_path, build_command, output_dir, node_version }) => {
    const body: Record<string, unknown> = { archive_path };
    if (build_command) body.build_command = build_command;
    if (output_dir) body.output_dir = output_dir;
    if (node_version) body.node_version = node_version;
    return formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds/from-archive`, body));
  });

  server.registerTool("hosting_deploy_list_js", {
    title: "List JS Deployments",
    description: "List JavaScript application deployments with their status. Use to check if deployment is pending, running, completed, or failed.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      states: z.string().optional().describe("Filter by states: pending, running, completed, failed (comma-separated)"),
    },
  }, async ({ username, domain, states }) => {
    const q: Record<string, string | undefined> = { states };
    return formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds`, q));
  });

  server.registerTool("hosting_deploy_js_logs", {
    title: "Get JS Deployment Logs",
    description: "Get logs for a JavaScript deployment build. Use for debugging failed deployments.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      uuid: z.string().describe("Build UUID"),
      from_line: z.number().optional().describe("Start from this line (for polling live logs)"),
    },
  }, async ({ username, domain, uuid, from_line }) => {
    const q: Record<string, string | undefined> = {};
    if (from_line != null) q.from_line = String(from_line);
    return formatResult(await client.get(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds/${uuid}/logs`, q));
  });

  // === Static Website Deploy ===
  server.registerTool("hosting_deploy_static", {
    title: "Deploy Static Website",
    description: "Deploy a static website from an archive (HTML/CSS/JS/images). Archive must contain pre-built files ready to serve. No build process. For JS apps with build step, use hosting_deploy_js_app instead.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      archive_path: z.string().describe("Path to archive file on server"),
    },
  }, async ({ username, domain, archive_path }) => {
    return formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds/from-archive`, {
      archive_path,
      build_command: "",
      output_dir: ".",
    }));
  });

  // === WordPress Import ===
  server.registerTool("hosting_deploy_wp_import", {
    title: "Import WordPress Website",
    description: "Import a WordPress website from an archive and database dump. Files are extracted and site deployed automatically.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      domain: z.string().describe("Website domain"),
      archive_path: z.string().describe("Path to website archive (zip/tar.gz) on server"),
      sql_path: z.string().optional().describe("Path to SQL dump file on server"),
    },
  }, async ({ username, domain, archive_path, sql_path }) => {
    const body: Record<string, unknown> = { archive_path };
    if (sql_path) body.sql_path = sql_path;
    return formatResult(await client.post(`/api/hosting/v1/accounts/${username}/websites/${domain}/nodejs/builds/from-archive`, body));
  });

  // === WordPress Plugin Deploy ===
  server.registerTool("hosting_deploy_wp_plugin", {
    title: "Deploy WordPress Plugin",
    description: "Deploy a custom WordPress plugin from a directory/archive. Uploads plugin files and triggers deployment.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      plugin_slug: z.string().describe("Plugin slug/directory name"),
      archive_path: z.string().describe("Path to plugin archive on server"),
    },
  }, async ({ username, software, plugin_slug, archive_path }) => {
    return formatResult(await client.post(
      `/api/hosting/v1/accounts/${username}/wordpress/${software}/plugins/install`,
      { plugins: [plugin_slug], archive_path }
    ));
  });

  // === WordPress Theme Deploy ===
  server.registerTool("hosting_deploy_wp_theme", {
    title: "Deploy WordPress Theme",
    description: "Deploy a custom WordPress theme from a directory/archive. Uploads theme files and optionally activates.",
    inputSchema: {
      username: z.string().describe("Hosting account username"),
      software: z.string().describe("WordPress software identifier"),
      theme_slug: z.string().describe("Theme slug/directory name"),
      archive_path: z.string().describe("Path to theme archive on server"),
      activate: z.boolean().optional().describe("Activate theme after install (default: false)"),
    },
  }, async ({ username, software, theme_slug, archive_path, activate }) => {
    const body: Record<string, unknown> = { theme: theme_slug, archive_path };
    if (activate) body.activate = true;
    return formatResult(await client.post(
      `/api/hosting/v1/accounts/${username}/wordpress/${software}/themes/install`,
      body
    ));
  });

  // === Agency Hosting Deploys ===
  server.registerTool("agency_deploy_node_static", {
    title: "Deploy Agency Node/Static Site",
    description: "Deploy a node-static Agency Plan website from an archive. Uploads archive, triggers build, deploys to public_html. Operation is synchronous — site is live when tool returns.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      archive_path: z.string().describe("Relative path to archive from document root"),
    },
  }, async ({ website_uid, archive_path }) => {
    return formatResult(await client.post(
      `/api/agency-hosting/v1/websites/${website_uid}/build-assets`,
      { archive_path }
    ));
  });

  server.registerTool("agency_deploy_php", {
    title: "Deploy Agency PHP Application",
    description: "Deploy a PHP application to an Agency Plan website from an archive. Extracts and serves as-is (no build step). Operation is synchronous.",
    inputSchema: {
      website_uid: z.string().describe("Website UID"),
      filename: z.string().describe("Archive filename (already uploaded to root). Supported: .zip, .tar, .tar.gz, .tgz"),
    },
  }, async ({ website_uid, filename }) => {
    return formatResult(await client.post(
      `/api/agency-hosting/v1/websites/${website_uid}/files/import-archive`,
      { filename }
    ));
  });
}
