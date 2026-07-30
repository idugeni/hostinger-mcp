import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerBillingTools(server: McpServer, client: HostingerApiClient) {
  server.registerTool("billing_get_catalog", {
    title: "Get Catalog",
    description: "Browse available Hostinger products and pricing. Optionally filter by category or name.",
    inputSchema: {
      category: z.string().optional().describe("Filter by category (domain, hosting, vps, email)"),
      name: z.string().optional().describe("Filter by name. Use * for wildcard, e.g. '.COM*'"),
    },
  }, async ({ category, name }) => {
    const q: Record<string, string | undefined> = { category, name };
    return formatResult(await client.get("/api/billing/v1/catalog", q));
  });

  server.registerTool("billing_create_order", {
    title: "Create Purchase Order",
    description: "Create a purchase order for Hostinger services.",
    inputSchema: {
      items: z.array(z.object({
        item_id: z.string().describe("Catalog item ID"),
        quantity: z.number().describe("Quantity"),
      })).describe("Items to purchase"),
      payment_method_id: z.string().describe("Payment method ID"),
    },
  }, async ({ items, payment_method_id }) => {
    return formatResult(await client.post("/api/billing/v1/orders", { items, payment_method_id }));
  });

  server.registerTool("billing_get_payment_methods", {
    title: "Get Payment Methods",
    description: "List all configured payment methods.",
  }, async () => {
    return formatResult(await client.get("/api/billing/v1/payment-methods"));
  });

  server.registerTool("billing_set_default_payment_method", {
    title: "Set Default Payment Method",
    description: "Set a payment method as the default.",
    inputSchema: {
      payment_method_id: z.string().describe("Payment method ID"),
    },
  }, async ({ payment_method_id }) => {
    return formatResult(await client.post(`/api/billing/v1/payment-methods/${payment_method_id}`));
  });

  server.registerTool("billing_delete_payment_method", {
    title: "Delete Payment Method",
    description: "Delete a payment method.",
    inputSchema: {
      payment_method_id: z.string().describe("Payment method ID to delete"),
    },
  }, async ({ payment_method_id }) => {
    return formatResult(await client.delete(`/api/billing/v1/payment-methods/${payment_method_id}`));
  });

  server.registerTool("billing_get_subscriptions", {
    title: "Get Subscriptions",
    description: "List all active subscriptions.",
  }, async () => {
    return formatResult(await client.get("/api/billing/v1/subscriptions"));
  });

  server.registerTool("billing_enable_auto_renewal", {
    title: "Enable Auto-Renewal",
    description: "Enable auto-renewal for a subscription.",
    inputSchema: {
      subscription_id: z.string().describe("Subscription ID"),
    },
  }, async ({ subscription_id }) => {
    return formatResult(await client.patch(`/api/billing/v1/subscriptions/${subscription_id}/auto-renewal/enable`));
  });

  server.registerTool("billing_disable_auto_renewal", {
    title: "Disable Auto-Renewal",
    description: "Disable auto-renewal for a subscription.",
    inputSchema: {
      subscription_id: z.string().describe("Subscription ID"),
    },
  }, async ({ subscription_id }) => {
    return formatResult(await client.delete(`/api/billing/v1/subscriptions/${subscription_id}/auto-renewal/disable`));
  });

  server.registerTool("billing_renew_subscription", {
    title: "Renew Subscription",
    description: "Create a renewal order for an existing subscription. If no payment method is provided, your default will be used.",
    inputSchema: {
      subscription_id: z.string().describe("Subscription ID"),
      payment_method_id: z.string().optional().describe("Payment method ID (optional, uses default)"),
    },
  }, async ({ subscription_id, payment_method_id }) => {
    const body: Record<string, unknown> = {};
    if (payment_method_id) body.payment_method_id = payment_method_id;
    return formatResult(await client.post(`/api/billing/v1/subscriptions/${subscription_id}/renew`, body));
  });
}
