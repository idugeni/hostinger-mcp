import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerDomainsTools(server: McpServer, client: HostingerApiClient) {
  // Availability
  server.registerTool("domains_check_availability", {
    title: "Check Domain Availability",
    description: "Check if a domain is available for registration.",
    inputSchema: { domain: z.string().describe("Domain name to check, e.g. example.com") },
  }, async ({ domain }) => formatResult(await client.post("/api/domains/v1/availability", { domain })));

  // Portfolio
  server.registerTool("domains_get_list", {
    title: "Get Domain List",
    description: "List all domains in your portfolio.",
  }, async () => formatResult(await client.get("/api/domains/v1/portfolio")));

  server.registerTool("domains_get_details", {
    title: "Get Domain Details",
    description: "Get detailed info about a specific domain.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.get(`/api/domains/v1/portfolio/${domain}`)));

  server.registerTool("domains_purchase", {
    title: "Purchase Domain",
    description: "Purchase a new domain.",
    inputSchema: {
      domain: z.string().describe("Domain to purchase"),
      whois_id: z.string().optional().describe("WHOIS profile ID"),
      payment_method_id: z.string().optional().describe("Payment method ID"),
    },
  }, async (args) => formatResult(await client.post("/api/domains/v1/portfolio", args)));

  server.registerTool("domains_update_nameservers", {
    title: "Update Nameservers",
    description: "Update nameservers for a domain.",
    inputSchema: {
      domain: z.string().describe("Domain name"),
      nameservers: z.array(z.string()).describe("Nameserver hostnames"),
    },
  }, async ({ domain, nameservers }) => formatResult(await client.put(`/api/domains/v1/portfolio/${domain}/nameservers`, { nameservers })));

  server.registerTool("domains_enable_lock", {
    title: "Enable Domain Lock",
    description: "Enable registrar lock (transfer protection).",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.put(`/api/domains/v1/portfolio/${domain}/domain-lock`)));

  server.registerTool("domains_disable_lock", {
    title: "Disable Domain Lock",
    description: "Disable registrar lock.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.delete(`/api/domains/v1/portfolio/${domain}/domain-lock`)));

  server.registerTool("domains_enable_privacy", {
    title: "Enable Privacy Protection",
    description: "Enable WHOIS privacy protection.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.put(`/api/domains/v1/portfolio/${domain}/privacy-protection`)));

  server.registerTool("domains_disable_privacy", {
    title: "Disable Privacy Protection",
    description: "Disable WHOIS privacy protection.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.delete(`/api/domains/v1/portfolio/${domain}/privacy-protection`)));

  server.registerTool("domains_get_auth_code", {
    title: "Get Auth Code",
    description: "Get domain authorization/EPP code for transfers.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.get(`/api/domains/v1/portfolio/${domain}/auth-code`)));

  server.registerTool("domains_get_renewal_info", {
    title: "Get Renewal Info",
    description: "Get renewal information for a domain.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.get(`/api/domains/v1/portfolio/${domain}/renewal`)));

  // Forwarding
  server.registerTool("domains_create_forwarding", {
    title: "Create Domain Forwarding",
    description: "Create a domain forwarding/redirect.",
    inputSchema: {
      domain: z.string().describe("Source domain"),
      redirect_to: z.string().describe("Target URL"),
      type: z.string().optional().describe("Redirect type: 301 or 302"),
    },
  }, async (args) => formatResult(await client.post("/api/domains/v1/forwarding", args)));

  server.registerTool("domains_get_forwarding", {
    title: "Get Domain Forwarding",
    description: "Get forwarding config for a domain.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.get(`/api/domains/v1/forwarding/${domain}`)));

  server.registerTool("domains_update_forwarding", {
    title: "Update Domain Forwarding",
    description: "Update domain forwarding/redirect.",
    inputSchema: {
      domain: z.string().describe("Domain name"),
      redirect_to: z.string().describe("New target URL"),
      type: z.string().optional().describe("Redirect type: 301 or 302"),
    },
  }, async ({ domain, redirect_to, type }) => formatResult(await client.put(`/api/domains/v1/forwarding/${domain}`, { redirect_to, type })));

  server.registerTool("domains_delete_forwarding", {
    title: "Delete Domain Forwarding",
    description: "Remove domain forwarding.",
    inputSchema: { domain: z.string().describe("Domain name") },
  }, async ({ domain }) => formatResult(await client.delete(`/api/domains/v1/forwarding/${domain}`)));

  // WHOIS
  server.registerTool("domains_get_whois_profiles", {
    title: "Get WHOIS Profiles",
    description: "List all WHOIS profiles.",
  }, async () => formatResult(await client.get("/api/domains/v1/whois")));

  server.registerTool("domains_get_whois_profile", {
    title: "Get WHOIS Profile",
    description: "Get a specific WHOIS profile.",
    inputSchema: { whois_id: z.string().describe("WHOIS profile ID") },
  }, async ({ whois_id }) => formatResult(await client.get(`/api/domains/v1/whois/${whois_id}`)));

  server.registerTool("domains_get_whois_profile_usage", {
    title: "Get WHOIS Profile Usage",
    description: "Get domains using a specific WHOIS profile.",
    inputSchema: { whois_id: z.string().describe("WHOIS profile ID") },
  }, async ({ whois_id }) => formatResult(await client.get(`/api/domains/v1/whois/${whois_id}/usage`)));

  server.registerTool("domains_create_whois_profile", {
    title: "Create WHOIS Profile",
    description: "Create a new WHOIS profile for domain registration.",
    inputSchema: {
      first_name: z.string().describe("First name"),
      last_name: z.string().describe("Last name"),
      email: z.string().describe("Email"),
      phone: z.string().describe("Phone number"),
      address: z.string().describe("Street address"),
      city: z.string().describe("City"),
      state: z.string().optional().describe("State/Province"),
      zip: z.string().describe("ZIP/Postal code"),
      country: z.string().describe("Country code (e.g. US, ID)"),
      organization: z.string().optional().describe("Organization name"),
    },
  }, async (args) => formatResult(await client.post("/api/domains/v1/whois", args)));

  server.registerTool("domains_delete_whois_profile", {
    title: "Delete WHOIS Profile",
    description: "Delete a WHOIS profile.",
    inputSchema: { whois_id: z.string().describe("WHOIS profile ID") },
  }, async ({ whois_id }) => formatResult(await client.delete(`/api/domains/v1/whois/${whois_id}`)));

  // Transfers
  server.registerTool("domains_get_transfers", {
    title: "Get Domain Transfers",
    description: "List all domain transfers.",
  }, async () => formatResult(await client.get("/api/domains/v1/transfers")));

  server.registerTool("domains_get_transfer", {
    title: "Get Transfer Details",
    description: "Get details of a specific domain transfer.",
    inputSchema: { domain: z.string().describe("Domain being transferred") },
  }, async ({ domain }) => formatResult(await client.get(`/api/domains/v1/transfers/${domain}`)));

  // Verifications
  server.registerTool("domains_get_verifications", {
    title: "Get Domain Verifications",
    description: "Get active domain verification requests.",
  }, async () => formatResult(await client.get("/api/v2/direct/verifications/active")));
}
