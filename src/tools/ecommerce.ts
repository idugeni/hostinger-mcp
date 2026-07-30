import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerEcommerceTools(server: McpServer, client: HostingerApiClient) {
  // === Stores ===
  server.registerTool("ecommerce_stores_list", {
    title: "List Stores",
    description: "Get all ecommerce stores.",
  }, async () => formatResult(await client.get("/api/ecommerce/v1/stores")));

  server.registerTool("ecommerce_stores_create", {
    title: "Create Store",
    description: "Create a new ecommerce store.",
    inputSchema: { name: z.string().describe("Store name") },
  }, async ({ name }) => formatResult(await client.post("/api/ecommerce/v1/stores", { name })));

  server.registerTool("ecommerce_stores_delete", {
    title: "Delete Store",
    description: "Delete an ecommerce store.",
    inputSchema: { store_id: z.string().describe("Store ID") },
    annotations: { destructiveHint: true },
  }, async ({ store_id }) => formatResult(await client.delete(`/api/ecommerce/v1/stores/${store_id}`)));

  server.registerTool("ecommerce_stores_metadata", {
    title: "Get Store Metadata",
    description: "Get metadata for a store.",
    inputSchema: { store_id: z.string().describe("Store ID") },
  }, async ({ store_id }) => formatResult(await client.get(`/api/ecommerce/v1/stores/${store_id}/metadata`)));

  // === Products ===
  server.registerTool("ecommerce_products_create_physical", {
    title: "Create Physical Product",
    description: "Create a physical product in a store.",
    inputSchema: {
      store_id: z.string().describe("Store ID"),
      name: z.string().describe("Product name"),
      price: z.number().describe("Price"),
      description: z.string().optional().describe("Product description"),
    },
  }, async ({ store_id, ...body }) => formatResult(await client.post(`/api/ecommerce/v1/stores/${store_id}/products/physical`, body)));

  server.registerTool("ecommerce_products_create_digital", {
    title: "Create Digital Product",
    description: "Create a digital product in a store.",
    inputSchema: {
      store_id: z.string().describe("Store ID"),
      name: z.string().describe("Product name"),
      price: z.number().describe("Price"),
      description: z.string().optional().describe("Product description"),
    },
  }, async ({ store_id, ...body }) => formatResult(await client.post(`/api/ecommerce/v1/stores/${store_id}/products/digital`, body)));

  // === Sales Channels ===
  server.registerTool("ecommerce_channels_list", {
    title: "List Sales Channels",
    description: "List sales channels for a store.",
    inputSchema: { store_id: z.string().describe("Store ID") },
  }, async ({ store_id }) => formatResult(await client.get(`/api/ecommerce/v1/stores/${store_id}/sales-channels`)));

  server.registerTool("ecommerce_channels_create", {
    title: "Create Sales Channel",
    description: "Create a custom sales channel.",
    inputSchema: {
      store_id: z.string().describe("Store ID"),
      name: z.string().describe("Channel name"),
      url: z.string().optional().describe("Channel URL"),
    },
  }, async ({ store_id, ...body }) => formatResult(await client.post(`/api/ecommerce/v1/stores/${store_id}/sales-channels`, body)));

  server.registerTool("ecommerce_channels_update", {
    title: "Update Sales Channel",
    description: "Update a sales channel.",
    inputSchema: {
      store_id: z.string().describe("Store ID"),
      sales_channel_id: z.string().describe("Sales channel ID"),
      name: z.string().optional().describe("New name"),
      url: z.string().optional().describe("New URL"),
    },
  }, async ({ store_id, sales_channel_id, ...body }) => formatResult(await client.patch(`/api/ecommerce/v1/stores/${store_id}/sales-channels/${sales_channel_id}`, body)));

  // === Shipping ===
  server.registerTool("ecommerce_shipping_set", {
    title: "Set Shipping",
    description: "Set shipping configuration for a store.",
    inputSchema: {
      store_id: z.string().describe("Store ID"),
      shipping: z.any().describe("Shipping configuration object"),
    },
  }, async ({ store_id, shipping }) => formatResult(await client.post(`/api/ecommerce/v1/stores/${store_id}/shipping`, shipping)));

  // === Payments ===
  server.registerTool("ecommerce_payment_manual", {
    title: "Enable Manual Payment",
    description: "Enable manual payment method for a store.",
    inputSchema: { store_id: z.string().describe("Store ID") },
  }, async ({ store_id }) => formatResult(await client.post(`/api/ecommerce/v1/stores/${store_id}/payment-methods/manual`)));

  // === Miscellaneous ===
  server.registerTool("ecommerce_storefront_instructions", {
    title: "Get Storefront Setup Instructions",
    description: "Get custom storefront setup instructions.",
  }, async () => formatResult(await client.get("/api/ecommerce/v1/miscellaneous/custom-storefront-instructions")));
}
