import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerHorizonsTools(server: McpServer, client: HostingerApiClient) {
  server.registerTool("horizons_create_website", {
    title: "Create Horizons Website",
    description: "Create a new website using Hostinger Horizons (AI website builder).",
    inputSchema: {
      prompt: z.string().optional().describe("Description/prompt for the AI to build the website"),
    },
  }, async (args) => formatResult(await client.post("/api/horizons/v1/websites", args)));

  server.registerTool("horizons_get_website", {
    title: "Get Horizons Website",
    description: "Get details of a Horizons website.",
    inputSchema: { website_id: z.string().describe("Website ID") },
  }, async ({ website_id }) => formatResult(await client.get(`/api/horizons/v1/websites/${website_id}`)));
}
