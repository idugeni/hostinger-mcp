import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerReachTools(server: McpServer, client: HostingerApiClient) {
  // === Profiles ===
  server.registerTool("reach_profiles_list", {
    title: "List Profiles",
    description: "List email marketing profiles.",
  }, async () => formatResult(await client.get("/api/reach/v1/profiles")));

  server.registerTool("reach_profiles_dns_status", {
    title: "Get Profile DNS Status",
    description: "Check DNS configuration status for a profile domain.",
    inputSchema: { profile_uuid: z.string().describe("Profile UUID") },
  }, async ({ profile_uuid }) => formatResult(await client.get(`/api/reach/v1/profiles/${profile_uuid}/domains/dns-status`)));

  // === Contacts ===
  server.registerTool("reach_contacts_list", {
    title: "List Contacts",
    description: "List all email marketing contacts.",
  }, async () => formatResult(await client.get("/api/reach/v1/contacts")));

  server.registerTool("reach_contacts_create", {
    title: "Create Contact",
    description: "Create a new contact.",
    inputSchema: {
      email: z.string().describe("Contact email"),
      first_name: z.string().optional().describe("First name"),
      last_name: z.string().optional().describe("Last name"),
    },
  }, async (args) => formatResult(await client.post("/api/reach/v1/contacts", args)));

  server.registerTool("reach_contacts_create_bulk", {
    title: "Create Contacts (Bulk)",
    description: "Create multiple contacts for a profile.",
    inputSchema: {
      profile_uuid: z.string().describe("Profile UUID"),
      contacts: z.array(z.object({
        email: z.string().describe("Email"),
        first_name: z.string().optional().describe("First name"),
        last_name: z.string().optional().describe("Last name"),
      })).describe("Array of contacts"),
    },
  }, async ({ profile_uuid, contacts }) => formatResult(await client.post(`/api/reach/v1/profiles/${profile_uuid}/contacts`, { contacts })));

  server.registerTool("reach_contacts_delete", {
    title: "Delete Contact",
    description: "Delete a contact.",
    inputSchema: { uuid: z.string().describe("Contact UUID") },
    annotations: { destructiveHint: true },
  }, async ({ uuid }) => formatResult(await client.delete(`/api/reach/v1/contacts/${uuid}`)));

  server.registerTool("reach_contacts_groups", {
    title: "List Contact Groups",
    description: "List contact groups.",
  }, async () => formatResult(await client.get("/api/reach/v1/contacts/groups")));

  // === Segments ===
  server.registerTool("reach_segments_list", {
    title: "List Segments",
    description: "List contact segments.",
  }, async () => formatResult(await client.get("/api/reach/v1/segmentation/segments")));

  server.registerTool("reach_segments_get", {
    title: "Get Segment Details",
    description: "Get segment details.",
    inputSchema: { segment_uuid: z.string().describe("Segment UUID") },
  }, async ({ segment_uuid }) => formatResult(await client.get(`/api/reach/v1/segmentation/segments/${segment_uuid}`)));

  server.registerTool("reach_segments_create", {
    title: "Create Segment",
    description: "Create a new contact segment.",
    inputSchema: {
      name: z.string().describe("Segment name"),
      conditions: z.any().optional().describe("Segment filter conditions (JSON object)"),
    },
  }, async (args) => formatResult(await client.post("/api/reach/v1/segmentation/segments", args)));

  server.registerTool("reach_segments_contacts", {
    title: "List Segment Contacts",
    description: "List contacts in a segment.",
    inputSchema: { segment_uuid: z.string().describe("Segment UUID") },
  }, async ({ segment_uuid }) => formatResult(await client.get(`/api/reach/v1/segmentation/segments/${segment_uuid}/contacts`)));

  server.registerTool("reach_segments_profile_contacts", {
    title: "List Profile Segment Contacts",
    description: "List contacts for a segment within a specific profile.",
    inputSchema: {
      profile_uuid: z.string().describe("Profile UUID"),
      segment_uuid: z.string().describe("Segment UUID"),
    },
  }, async ({ profile_uuid, segment_uuid }) => formatResult(await client.get(`/api/reach/v1/profiles/${profile_uuid}/segmentation/segments/${segment_uuid}/contacts`)));
}
