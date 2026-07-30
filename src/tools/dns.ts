import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

const dnsRecord = z.object({
  type: z.string().describe("Record type: A, AAAA, CNAME, MX, TXT, NS, SRV, CAA"),
  name: z.string().describe("Record name/host"),
  value: z.string().describe("Record value"),
  ttl: z.number().optional().describe("TTL in seconds"),
  priority: z.number().optional().describe("Priority (MX/SRV)"),
});

export function registerDnsTools(server: McpServer, client: HostingerApiClient) {
  server.registerTool("dns_get_records", {
    title: "Get DNS Records",
    description: "Get all DNS records for a domain.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.get(`/api/dns/v1/zones/${domain}`)));

  server.registerTool("dns_update_records", {
    title: "Update DNS Records",
    description: "Update/replace DNS records for a domain.",
    inputSchema: {
      domain: z.string().describe("Domain name"),
      records: z.array(dnsRecord).describe("DNS records to set"),
    },
  }, async ({ domain, records }) => formatResult(await client.put(`/api/dns/v1/zones/${domain}`, { records })));

  server.registerTool("dns_delete_records", {
    title: "Delete DNS Records",
    description: "Delete specific DNS records from a domain.",
    inputSchema: {
      domain: z.string().describe("Domain name"),
      records: z.array(z.object({
        type: z.string().describe("Record type"),
        name: z.string().describe("Record name"),
        value: z.string().describe("Record value"),
      })).describe("Records to delete"),
    },
  }, async ({ domain, records }) => formatResult(await client.delete(`/api/dns/v1/zones/${domain}`, { records })));

  server.registerTool("dns_reset_records", {
    title: "Reset DNS Records",
    description: "Reset all DNS records for a domain to defaults.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.post(`/api/dns/v1/zones/${domain}/reset`)));

  server.registerTool("dns_validate_records", {
    title: "Validate DNS Records",
    description: "Validate DNS records before applying them.",
    inputSchema: {
      domain: z.string().describe("Domain name"),
      records: z.array(dnsRecord).describe("Records to validate"),
    },
  }, async ({ domain, records }) => formatResult(await client.post(`/api/dns/v1/zones/${domain}/validate`, { records })));

  server.registerTool("dns_get_snapshots", {
    title: "Get DNS Snapshots",
    description: "List DNS snapshots for a domain.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.get(`/api/dns/v1/snapshots/${domain}`)));

  server.registerTool("dns_get_snapshot", {
    title: "Get DNS Snapshot",
    description: "Get a specific DNS snapshot details.",
    inputSchema: {
      domain: z.string().describe("Domain name"),
      snapshot_id: z.string().describe("Snapshot ID"),
    },
  }, async ({ domain, snapshot_id }) => formatResult(await client.get(`/api/dns/v1/snapshots/${domain}/${snapshot_id}`)));

  server.registerTool("dns_restore_snapshot", {
    title: "Restore DNS Snapshot",
    description: "Restore a DNS snapshot for a domain.",
    inputSchema: {
      domain: z.string().describe("Domain name"),
      snapshot_id: z.string().describe("Snapshot ID"),
    },
  }, async ({ domain, snapshot_id }) => formatResult(await client.post(`/api/dns/v1/snapshots/${domain}/${snapshot_id}/restore`)));
}
