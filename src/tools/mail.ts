import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

export function registerMailTools(server: McpServer, client: HostingerApiClient) {
  // === Orders ===
  server.registerTool("mail_orders_list", {
    title: "List Mail Orders",
    description: "List all mail/email orders.",
  }, async () => formatResult(await client.get("/api/mail/v1/orders")));

  server.registerTool("mail_orders_get_plan", {
    title: "Get Mail Order Plan",
    description: "Get the plan for a mail order.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/plan`)));

  // === Mailboxes ===
  server.registerTool("mail_mailboxes_list", {
    title: "List Mailboxes",
    description: "List mailboxes for a mail order.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/mailboxes`)));

  server.registerTool("mail_mailboxes_create", {
    title: "Create Mailbox",
    description: "Create a new mailbox.",
    inputSchema: {
      order_id: z.string().describe("Mail order ID"),
      email: z.string().describe("Email address"),
      password: z.string().describe("Mailbox password"),
    },
  }, async ({ order_id, email, password }) => formatResult(await client.post(`/api/mail/v1/orders/${order_id}/mailboxes`, { email, password })));

  server.registerTool("mail_mailboxes_delete", {
    title: "Delete Mailbox",
    description: "Delete a mailbox.",
    inputSchema: { mailbox_id: z.string().describe("Mailbox ID") },
    annotations: { destructiveHint: true },
  }, async ({ mailbox_id }) => formatResult(await client.delete(`/api/mail/v1/mailboxes/${mailbox_id}`)));

  server.registerTool("mail_mailboxes_change_password", {
    title: "Change Mailbox Password",
    description: "Change a mailbox password.",
    inputSchema: {
      mailbox_id: z.string().describe("Mailbox ID"),
      password: z.string().describe("New password"),
    },
  }, async ({ mailbox_id, password }) => formatResult(await client.patch(`/api/mail/v1/mailboxes/${mailbox_id}/password`, { password })));

  // === Aliases ===
  server.registerTool("mail_aliases_list", {
    title: "List Aliases",
    description: "List email aliases for an order.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/aliases`)));

  server.registerTool("mail_aliases_create", {
    title: "Create Alias",
    description: "Create an email alias.",
    inputSchema: {
      mailbox_id: z.string().describe("Mailbox ID"),
      alias: z.string().describe("Alias email address"),
    },
  }, async ({ mailbox_id, alias }) => formatResult(await client.post(`/api/mail/v1/mailboxes/${mailbox_id}/aliases`, { alias })));

  server.registerTool("mail_aliases_delete", {
    title: "Delete Alias",
    description: "Delete an email alias.",
    inputSchema: { alias_id: z.string().describe("Alias ID") },
    annotations: { destructiveHint: true },
  }, async ({ alias_id }) => formatResult(await client.delete(`/api/mail/v1/aliases/${alias_id}`)));

  // === Forwarders ===
  server.registerTool("mail_forwarders_list", {
    title: "List Forwarders",
    description: "List email forwarders for an order.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/forwarders`)));

  server.registerTool("mail_forwarders_create", {
    title: "Create Forwarder",
    description: "Create an email forwarder.",
    inputSchema: {
      mailbox_id: z.string().describe("Mailbox ID"),
      forward_to: z.string().describe("Forward-to email address"),
    },
  }, async ({ mailbox_id, forward_to }) => formatResult(await client.post(`/api/mail/v1/mailboxes/${mailbox_id}/forwarders`, { forward_to })));

  server.registerTool("mail_forwarders_delete", {
    title: "Delete Forwarder",
    description: "Delete an email forwarder.",
    inputSchema: { forwarder_id: z.string().describe("Forwarder ID") },
    annotations: { destructiveHint: true },
  }, async ({ forwarder_id }) => formatResult(await client.delete(`/api/mail/v1/forwarders/${forwarder_id}`)));

  server.registerTool("mail_forwarders_keep_copy", {
    title: "Update Forwarder Keep-Copy",
    description: "Update whether forwarder keeps a copy.",
    inputSchema: {
      forwarder_id: z.string().describe("Forwarder ID"),
      keep_copy: z.boolean().describe("Keep copy in original mailbox"),
    },
  }, async ({ forwarder_id, keep_copy }) => formatResult(await client.patch(`/api/mail/v1/forwarders/${forwarder_id}/keep-copy`, { keep_copy })));

  // === Autoreplies ===
  server.registerTool("mail_autoreplies_list", {
    title: "List Autoreplies",
    description: "List autoreplies for an order.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/autoreplies`)));

  server.registerTool("mail_autoreplies_create", {
    title: "Create Autoreply",
    description: "Create an autoreply.",
    inputSchema: {
      mailbox_id: z.string().describe("Mailbox ID"),
      subject: z.string().describe("Autoreply subject"),
      body: z.string().describe("Autoreply body"),
    },
  }, async ({ mailbox_id, subject, body }) => formatResult(await client.post(`/api/mail/v1/mailboxes/${mailbox_id}/autoreplies`, { subject, body })));

  server.registerTool("mail_autoreplies_update", {
    title: "Update Autoreply",
    description: "Update an autoreply.",
    inputSchema: {
      autoreply_id: z.string().describe("Autoreply ID"),
      subject: z.string().describe("New subject"),
      body: z.string().describe("New body"),
    },
  }, async ({ autoreply_id, subject, body }) => formatResult(await client.put(`/api/mail/v1/autoreplies/${autoreply_id}`, { subject, body })));

  server.registerTool("mail_autoreplies_delete", {
    title: "Delete Autoreply",
    description: "Delete an autoreply.",
    inputSchema: { autoreply_id: z.string().describe("Autoreply ID") },
    annotations: { destructiveHint: true },
  }, async ({ autoreply_id }) => formatResult(await client.delete(`/api/mail/v1/autoreplies/${autoreply_id}`)));

  // === Catch-alls ===
  server.registerTool("mail_catchalls_list", {
    title: "List Catch-Alls",
    description: "List catch-all configurations.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/catchalls`)));

  server.registerTool("mail_catchalls_create", {
    title: "Create Catch-All",
    description: "Create a catch-all for a mailbox.",
    inputSchema: {
      mailbox_id: z.string().describe("Mailbox ID"),
      forward_to: z.string().describe("Forward catch-all to this address"),
    },
  }, async ({ mailbox_id, forward_to }) => formatResult(await client.post(`/api/mail/v1/mailboxes/${mailbox_id}/catchalls`, { forward_to })));

  server.registerTool("mail_catchalls_delete", {
    title: "Delete Catch-All",
    description: "Delete a catch-all.",
    inputSchema: { catchall_id: z.string().describe("Catch-all ID") },
    annotations: { destructiveHint: true },
  }, async ({ catchall_id }) => formatResult(await client.delete(`/api/mail/v1/catchalls/${catchall_id}`)));


  // === Webhooks ===
  server.registerTool("mail_webhooks_list", {
    title: "List Mail Webhooks",
    description: "List webhooks for a mail order.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/webhooks`)));

  server.registerTool("mail_webhooks_get", {
    title: "Get Mail Webhook",
    description: "Get webhook details.",
    inputSchema: { webhook_id: z.string().describe("Webhook ID") },
  }, async ({ webhook_id }) => formatResult(await client.get(`/api/mail/v1/webhooks/${webhook_id}`)));

  server.registerTool("mail_webhooks_create", {
    title: "Create Mail Webhook",
    description: "Create a webhook for a mailbox.",
    inputSchema: {
      mailbox_id: z.string().describe("Mailbox ID"),
      url: z.string().describe("Webhook URL"),
      event: z.string().describe("Event type to trigger"),
    },
  }, async ({ mailbox_id, url, event }) => formatResult(await client.post(`/api/mail/v1/mailboxes/${mailbox_id}/webhooks`, { url, event })));

  server.registerTool("mail_webhooks_update", {
    title: "Update Mail Webhook",
    description: "Update a webhook.",
    inputSchema: {
      webhook_id: z.string().describe("Webhook ID"),
      url: z.string().optional().describe("New URL"),
      event: z.string().optional().describe("New event type"),
    },
  }, async ({ webhook_id, ...body }) => formatResult(await client.patch(`/api/mail/v1/webhooks/${webhook_id}`, body)));

  server.registerTool("mail_webhooks_delete", {
    title: "Delete Mail Webhook",
    description: "Delete a webhook.",
    inputSchema: { webhook_id: z.string().describe("Webhook ID") },
    annotations: { destructiveHint: true },
  }, async ({ webhook_id }) => formatResult(await client.delete(`/api/mail/v1/webhooks/${webhook_id}`)));

  server.registerTool("mail_webhooks_test", {
    title: "Test Mail Webhook",
    description: "Send a test event to a webhook.",
    inputSchema: { webhook_id: z.string().describe("Webhook ID") },
  }, async ({ webhook_id }) => formatResult(await client.post(`/api/mail/v1/webhooks/${webhook_id}/test`)));

  server.registerTool("mail_webhooks_regenerate_secret", {
    title: "Regenerate Webhook Secret",
    description: "Regenerate the signing secret for a webhook.",
    inputSchema: { webhook_id: z.string().describe("Webhook ID") },
  }, async ({ webhook_id }) => formatResult(await client.post(`/api/mail/v1/webhooks/${webhook_id}/regenerate-secret`)));

  server.registerTool("mail_webhooks_delivery_logs", {
    title: "Webhook Delivery Logs",
    description: "List webhook delivery logs.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/webhooks/delivery-logs`)));

  // === Logs ===
  server.registerTool("mail_logs_access", {
    title: "Mail Access Logs",
    description: "List mail access logs.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/logs/access`)));

  server.registerTool("mail_logs_action", {
    title: "Mail Action Logs",
    description: "List mail action logs.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/logs/action`)));

  server.registerTool("mail_logs_inbound", {
    title: "Mail Inbound Logs",
    description: "List inbound mail logs.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/logs/inbound`)));

  server.registerTool("mail_logs_outbound", {
    title: "Mail Outbound Logs",
    description: "List outbound mail logs.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/logs/outbound`)));

  server.registerTool("mail_logs_mailbox_actions", {
    title: "Mailbox Action Logs",
    description: "List mailbox-level action logs.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.get(`/api/mail/v1/orders/${order_id}/logs/mailbox-actions`)));

  // === API Tokens ===
  server.registerTool("mail_tokens_list", {
    title: "List Mail API Tokens",
    description: "List API tokens for mail.",
  }, async () => formatResult(await client.get("/api/mail/v1/api-tokens")));

  server.registerTool("mail_tokens_create", {
    title: "Create Mail API Token",
    description: "Create an API token for a mail order.",
    inputSchema: { order_id: z.string().describe("Mail order ID") },
  }, async ({ order_id }) => formatResult(await client.post(`/api/mail/v1/orders/${order_id}/api-tokens`)));

  server.registerTool("mail_tokens_revoke", {
    title: "Revoke Mail API Token",
    description: "Revoke a mail API token.",
    inputSchema: { token_id: z.string().describe("Token ID") },
    annotations: { destructiveHint: true },
  }, async ({ token_id }) => formatResult(await client.delete(`/api/mail/v1/api-tokens/${token_id}`)));

  // === Resend Confirmations ===
  server.registerTool("mail_forwarders_resend_confirmation", {
    title: "Resend Forwarder Confirmation",
    description: "Resend the confirmation email for an unconfirmed forwarder.",
    inputSchema: { forwarder_id: z.string().describe("Forwarder ID") },
  }, async ({ forwarder_id }) => formatResult(await client.post(`/api/mail/v1/forwarders/${forwarder_id}/confirmation/resend`)));

  server.registerTool("mail_catchalls_resend_confirmation", {
    title: "Resend Catch-All Confirmation",
    description: "Resend the confirmation email for an unconfirmed catch-all.",
    inputSchema: { catchall_id: z.string().describe("Catch-all ID") },
  }, async ({ catchall_id }) => formatResult(await client.post(`/api/mail/v1/catchalls/${catchall_id}/confirmation/resend`)));
}