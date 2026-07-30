import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerSmartTools(server: McpServer, client: HostingerApiClient) {
  // === Health Check ===
  server.registerTool("health_check", {
    title: "Health Check",
    description: "Check connectivity and authentication with Hostinger API. Returns account info and service status summary.",
  }, async () => {
    const results: Record<string, unknown> = {};

    try {
      const subs = await client.get("/api/billing/v1/subscriptions");
      results.auth = "ok";
      results.subscriptions_count = Array.isArray(subs.data) ? subs.data.length : 0;
    } catch (e: any) {
      results.auth = "failed";
      results.error = e.message;
      return {
        content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
        isError: true,
      };
    }

    // Quick summary of services
    try {
      const [vps, domains, websites, mail] = await Promise.allSettled([
        client.get("/api/vps/v1/virtual-machines"),
        client.get("/api/domains/v1/portfolio"),
        client.get("/api/hosting/v1/websites"),
        client.get("/api/mail/v1/orders"),
      ]);

      results.vps_count = vps.status === "fulfilled" && Array.isArray(vps.value.data) ? vps.value.data.length : 0;
      results.domains_count = vps.status === "fulfilled" && Array.isArray(domains.status === "fulfilled" ? (domains as any).value.data : []) ?
        (domains.status === "fulfilled" ? ((domains as any).value.data as any[]).length : 0) : 0;

      if (domains.status === "fulfilled" && Array.isArray(domains.value.data)) {
        results.domains_count = domains.value.data.length;
      }
      if (websites.status === "fulfilled") {
        const wd = (websites.value as any).data;
        results.websites_count = wd?.data ? wd.data.length : (Array.isArray(wd) ? wd.length : 0);
      }
      if (mail.status === "fulfilled" && Array.isArray((mail.value as any).data)) {
        results.mail_orders_count = ((mail.value as any).data as any[]).length;
      }
    } catch {
      // non-critical
    }

    results.status = "healthy";
    return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
  });

  // === Batch Execute ===
  server.registerTool("batch_dns_update", {
    title: "Batch DNS Update",
    description: "Update DNS records for multiple domains at once. Useful for applying the same records across many domains.",
    inputSchema: {
      domains: z.array(z.string()).describe("Array of domain names"),
      records: z.array(z.object({
        type: z.string().describe("Record type"),
        name: z.string().describe("Record name"),
        value: z.string().describe("Record value"),
        ttl: z.number().optional().describe("TTL"),
      })).describe("Records to apply to all domains"),
      overwrite: z.boolean().optional().describe("Replace existing records (default: false)"),
    },
  }, async ({ domains, records, overwrite }) => {
    const results: Record<string, unknown> = {};
    const body: any = { records };
    if (overwrite) body.overwrite = true;

    await Promise.allSettled(
      domains.map(async (domain) => {
        try {
          const res = await client.put(`/api/dns/v1/zones/${domain}`, body);
          results[domain] = { status: res.status, success: res.status >= 200 && res.status < 300 };
        } catch (e: any) {
          results[domain] = { status: "error", error: e.message };
        }
      })
    );

    return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
  });

  // === Paginated List All ===
  server.registerTool("list_all_domains_paginated", {
    title: "List All Domains (Full)",
    description: "Auto-paginate to fetch ALL domains in portfolio (handles pagination automatically).",
  }, async () => {
    const all = await client.paginate("/api/domains/v1/portfolio");
    return { content: [{ type: "text" as const, text: JSON.stringify(all, null, 2) }] };
  });

  server.registerTool("list_all_websites_paginated", {
    title: "List All Websites (Full)",
    description: "Auto-paginate to fetch ALL hosting websites (handles pagination automatically).",
  }, async () => {
    const all = await client.paginate("/api/hosting/v1/websites");
    return { content: [{ type: "text" as const, text: JSON.stringify(all, null, 2) }] };
  });

  server.registerTool("list_all_subscriptions_paginated", {
    title: "List All Subscriptions (Full)",
    description: "Auto-paginate to fetch ALL billing subscriptions.",
  }, async () => {
    const all = await client.paginate("/api/billing/v1/subscriptions");
    return { content: [{ type: "text" as const, text: JSON.stringify(all, null, 2) }] };
  });

  // === Multi-VPS Operations ===
  server.registerTool("batch_vps_restart", {
    title: "Batch Restart VPS",
    description: "Restart multiple VPS instances at once.",
    inputSchema: {
      vm_ids: z.array(z.number()).describe("Array of virtual machine IDs to restart"),
    },
    annotations: { destructiveHint: true },
  }, async ({ vm_ids }) => {
    const results: Record<number, unknown> = {};
    await Promise.allSettled(
      vm_ids.map(async (id) => {
        try {
          const res = await client.post(`/api/vps/v1/virtual-machines/${id}/restart`);
          results[id] = { status: res.status, success: res.status >= 200 && res.status < 300 };
        } catch (e: any) {
          results[id] = { error: e.message };
        }
      })
    );
    return { content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }] };
  });

  // === Account Overview ===
  server.registerTool("account_overview", {
    title: "Account Overview",
    description: "Get a comprehensive overview of all Hostinger services: VPS count, domains, websites, mail, subscriptions, and their statuses.",
  }, async () => {
    const overview: Record<string, unknown> = {};

    const [subs, vps, domains, websites, mail] = await Promise.allSettled([
      client.get("/api/billing/v1/subscriptions"),
      client.get("/api/vps/v1/virtual-machines"),
      client.get("/api/domains/v1/portfolio"),
      client.get("/api/hosting/v1/websites"),
      client.get("/api/mail/v1/orders"),
    ]);

    if (subs.status === "fulfilled") {
      const data = subs.value.data as any[];
      overview.subscriptions = {
        total: data.length,
        active: data.filter((s: any) => s.status === "active" || s.status === "non_renewing").length,
        cancelled: data.filter((s: any) => s.status === "cancelled").length,
      };
    }

    if (vps.status === "fulfilled") {
      const data = vps.value.data as any[];
      overview.vps = {
        total: data.length,
        running: data.filter((v: any) => v.state === "running").length,
        stopped: data.filter((v: any) => v.state === "stopped").length,
      };
    }

    if (domains.status === "fulfilled") {
      const data = domains.value.data as any[];
      overview.domains = {
        total: data.length,
        active: data.filter((d: any) => d.status === "active").length,
        expired: data.filter((d: any) => d.status === "expired").length,
      };
    }

    if (websites.status === "fulfilled") {
      const wd = (websites.value.data as any);
      const data = wd?.data || wd;
      if (Array.isArray(data)) {
        overview.websites = {
          total: data.length,
          enabled: data.filter((w: any) => w.is_enabled).length,
        };
      }
    }

    if (mail.status === "fulfilled") {
      const data = mail.value.data as any[];
      overview.mail_orders = { total: data.length };
    }

    return { content: [{ type: "text" as const, text: JSON.stringify(overview, null, 2) }] };
  });

  // === Cache Control ===
  server.registerTool("clear_api_cache", {
    title: "Clear API Cache",
    description: "Clear the internal response cache. Use when you need fresh data after making changes.",
  }, async () => {
    client.clearCache();
    return { content: [{ type: "text" as const, text: "API response cache cleared." }] };
  });
}
