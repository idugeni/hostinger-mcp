import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HostingerApiClient } from "../api-client.js";
import { formatResult } from "../helpers.js";

const vmId = { vm_id: z.number().describe("Virtual machine ID") };

export function registerVpsTools(server: McpServer, client: HostingerApiClient) {
  // === Virtual Machines ===
  server.registerTool("vps_list", {
    title: "List VPS",
    description: "Get list of all virtual machines.",
  }, async () => formatResult(await client.get("/api/vps/v1/virtual-machines")));

  server.registerTool("vps_get", {
    title: "Get VPS Details",
    description: "Get details of a specific virtual machine.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}`)));

  server.registerTool("vps_purchase", {
    title: "Purchase VPS",
    description: "Purchase a new virtual machine.",
    inputSchema: {
      payment_method_id: z.string().describe("Payment method ID"),
      item_id: z.string().describe("Catalog item ID for VPS plan"),
    },
  }, async (args) => formatResult(await client.post("/api/vps/v1/virtual-machines", args)));

  server.registerTool("vps_setup", {
    title: "Setup VPS",
    description: "Setup a purchased virtual machine with OS and credentials.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      template_id: z.number().describe("OS template ID"),
      password: z.string().optional().describe("Root password"),
      hostname: z.string().optional().describe("Hostname"),
      post_install_script_id: z.number().optional().describe("Post-install script ID"),
      public_key_ids: z.array(z.number()).optional().describe("SSH public key IDs to attach"),
    },
  }, async ({ vm_id, ...body }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/setup`, body)));

  server.registerTool("vps_start", {
    title: "Start VPS",
    description: "Start a virtual machine.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/start`)));

  server.registerTool("vps_stop", {
    title: "Stop VPS",
    description: "Stop a virtual machine.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/stop`)));

  server.registerTool("vps_restart", {
    title: "Restart VPS",
    description: "Restart a virtual machine.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/restart`)));

  server.registerTool("vps_recreate", {
    title: "Recreate VPS",
    description: "Recreate (reinstall) a virtual machine. DESTROYS ALL DATA.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      template_id: z.number().describe("OS template ID"),
      password: z.string().optional().describe("New root password"),
    },
    annotations: { destructiveHint: true },
  }, async ({ vm_id, ...body }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/recreate`, body)));

  server.registerTool("vps_set_hostname", {
    title: "Set VPS Hostname",
    description: "Set hostname for a virtual machine.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      hostname: z.string().describe("New hostname"),
    },
  }, async ({ vm_id, hostname }) => formatResult(await client.put(`/api/vps/v1/virtual-machines/${vm_id}/hostname`, { hostname })));

  server.registerTool("vps_reset_hostname", {
    title: "Reset VPS Hostname",
    description: "Reset hostname to default.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.delete(`/api/vps/v1/virtual-machines/${vm_id}/hostname`)));

  server.registerTool("vps_set_root_password", {
    title: "Set Root Password",
    description: "Set root password for a virtual machine.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      password: z.string().describe("New root password"),
    },
  }, async ({ vm_id, password }) => formatResult(await client.put(`/api/vps/v1/virtual-machines/${vm_id}/root-password`, { password })));

  server.registerTool("vps_set_panel_password", {
    title: "Set Panel Password",
    description: "Set panel password for a VPS (e.g. cPanel/Plesk).",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      password: z.string().describe("New panel password"),
    },
  }, async ({ vm_id, password }) => formatResult(await client.put(`/api/vps/v1/virtual-machines/${vm_id}/panel-password`, { password })));

  server.registerTool("vps_set_nameservers", {
    title: "Set VPS Nameservers",
    description: "Set nameservers for a virtual machine.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      nameservers: z.array(z.string()).describe("Nameserver addresses"),
    },
  }, async ({ vm_id, nameservers }) => formatResult(await client.put(`/api/vps/v1/virtual-machines/${vm_id}/nameservers`, { nameservers })));

  server.registerTool("vps_get_metrics", {
    title: "Get VPS Metrics",
    description: "Get performance metrics (CPU, RAM, disk, network).",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/metrics`)));

  server.registerTool("vps_get_attached_keys", {
    title: "Get Attached Public Keys",
    description: "Get SSH public keys attached to a VPS.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/public-keys`)));

  // === Actions ===
  server.registerTool("vps_get_actions", {
    title: "Get VPS Actions",
    description: "Get list of actions/operations for a VPS.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/actions`)));

  server.registerTool("vps_get_action", {
    title: "Get Action Details",
    description: "Get details of a specific VPS action.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      action_id: z.number().describe("Action ID"),
    },
  }, async ({ vm_id, action_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/actions/${action_id}`)));


  // === Backups ===
  server.registerTool("vps_get_backups", {
    title: "Get VPS Backups",
    description: "List backups for a virtual machine.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/backups`)));

  server.registerTool("vps_restore_backup", {
    title: "Restore VPS Backup",
    description: "Restore a backup.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      backup_id: z.number().describe("Backup ID"),
    },
    annotations: { destructiveHint: true },
  }, async ({ vm_id, backup_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/backups/${backup_id}/restore`)));

  // === Snapshots ===
  server.registerTool("vps_create_snapshot", {
    title: "Create VPS Snapshot",
    description: "Create a snapshot of a virtual machine.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/snapshot`)));

  server.registerTool("vps_get_snapshot", {
    title: "Get VPS Snapshot",
    description: "Get snapshot details.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/snapshot`)));

  server.registerTool("vps_restore_snapshot", {
    title: "Restore VPS Snapshot",
    description: "Restore a VPS from snapshot.",
    inputSchema: vmId,
    annotations: { destructiveHint: true },
  }, async ({ vm_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/snapshot/restore`)));

  server.registerTool("vps_delete_snapshot", {
    title: "Delete VPS Snapshot",
    description: "Delete the VPS snapshot.",
    inputSchema: vmId,
    annotations: { destructiveHint: true },
  }, async ({ vm_id }) => formatResult(await client.delete(`/api/vps/v1/virtual-machines/${vm_id}/snapshot`)));

  // === Docker ===
  server.registerTool("vps_docker_list", {
    title: "List Docker Projects",
    description: "List Docker projects on a VPS.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/docker`)));

  server.registerTool("vps_docker_create", {
    title: "Create Docker Project",
    description: "Create a new Docker Compose project.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
      compose_content: z.string().describe("Docker Compose YAML content"),
    },
  }, async ({ vm_id, project_name, compose_content }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/docker`, { project_name, compose_content })));

  server.registerTool("vps_docker_get", {
    title: "Get Docker Project",
    description: "Get Docker project contents (compose file).",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
    },
  }, async ({ vm_id, project_name }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}`)));

  server.registerTool("vps_docker_update", {
    title: "Update Docker Project",
    description: "Update a Docker project (re-deploy).",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
      compose_content: z.string().optional().describe("Updated compose YAML"),
    },
  }, async ({ vm_id, project_name, compose_content }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}/update`, { compose_content })));

  server.registerTool("vps_docker_start", {
    title: "Start Docker Project",
    description: "Start a Docker project.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
    },
  }, async ({ vm_id, project_name }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}/start`)));

  server.registerTool("vps_docker_stop", {
    title: "Stop Docker Project",
    description: "Stop a Docker project.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
    },
  }, async ({ vm_id, project_name }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}/stop`)));

  server.registerTool("vps_docker_restart", {
    title: "Restart Docker Project",
    description: "Restart a Docker project.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
    },
  }, async ({ vm_id, project_name }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}/restart`)));

  server.registerTool("vps_docker_delete", {
    title: "Delete Docker Project",
    description: "Delete a Docker project.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
    },
    annotations: { destructiveHint: true },
  }, async ({ vm_id, project_name }) => formatResult(await client.delete(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}/down`)));

  server.registerTool("vps_docker_logs", {
    title: "Get Docker Logs",
    description: "Get logs of a Docker project.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
    },
  }, async ({ vm_id, project_name }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}/logs`)));

  server.registerTool("vps_docker_containers", {
    title: "Get Docker Containers",
    description: "Get containers of a Docker project.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      project_name: z.string().describe("Project name"),
    },
  }, async ({ vm_id, project_name }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/docker/${project_name}/containers`)));


  // === Firewall ===
  server.registerTool("vps_firewall_list", {
    title: "List Firewalls",
    description: "Get all firewalls.",
  }, async () => formatResult(await client.get("/api/vps/v1/firewall")));

  server.registerTool("vps_firewall_create", {
    title: "Create Firewall",
    description: "Create a new firewall.",
    inputSchema: { name: z.string().describe("Firewall name") },
  }, async ({ name }) => formatResult(await client.post("/api/vps/v1/firewall", { name })));

  server.registerTool("vps_firewall_get", {
    title: "Get Firewall Details",
    description: "Get firewall details with rules.",
    inputSchema: { firewall_id: z.number().describe("Firewall ID") },
  }, async ({ firewall_id }) => formatResult(await client.get(`/api/vps/v1/firewall/${firewall_id}`)));

  server.registerTool("vps_firewall_delete", {
    title: "Delete Firewall",
    description: "Delete a firewall.",
    inputSchema: { firewall_id: z.number().describe("Firewall ID") },
    annotations: { destructiveHint: true },
  }, async ({ firewall_id }) => formatResult(await client.delete(`/api/vps/v1/firewall/${firewall_id}`)));

  server.registerTool("vps_firewall_create_rule", {
    title: "Create Firewall Rule",
    description: "Add a rule to a firewall.",
    inputSchema: {
      firewall_id: z.number().describe("Firewall ID"),
      protocol: z.string().describe("Protocol: tcp, udp, icmp"),
      port: z.string().describe("Port or range (e.g. '80', '8000:9000')"),
      source: z.string().describe("Source IP/CIDR (e.g. '0.0.0.0/0')"),
      direction: z.string().optional().describe("inbound or outbound"),
      action: z.string().optional().describe("accept or drop"),
    },
  }, async ({ firewall_id, ...rule }) => formatResult(await client.post(`/api/vps/v1/firewall/${firewall_id}/rules`, rule)));

  server.registerTool("vps_firewall_update_rule", {
    title: "Update Firewall Rule",
    description: "Update an existing firewall rule.",
    inputSchema: {
      firewall_id: z.number().describe("Firewall ID"),
      rule_id: z.number().describe("Rule ID"),
      protocol: z.string().describe("Protocol: tcp, udp, icmp"),
      port: z.string().describe("Port or range"),
      source: z.string().describe("Source IP/CIDR"),
      direction: z.string().optional().describe("inbound or outbound"),
      action: z.string().optional().describe("accept or drop"),
    },
  }, async ({ firewall_id, rule_id, ...rule }) => formatResult(await client.put(`/api/vps/v1/firewall/${firewall_id}/rules/${rule_id}`, rule)));

  server.registerTool("vps_firewall_delete_rule", {
    title: "Delete Firewall Rule",
    description: "Remove a firewall rule.",
    inputSchema: {
      firewall_id: z.number().describe("Firewall ID"),
      rule_id: z.number().describe("Rule ID"),
    },
    annotations: { destructiveHint: true },
  }, async ({ firewall_id, rule_id }) => formatResult(await client.delete(`/api/vps/v1/firewall/${firewall_id}/rules/${rule_id}`)));

  server.registerTool("vps_firewall_activate", {
    title: "Activate Firewall",
    description: "Activate a firewall on a VPS.",
    inputSchema: {
      firewall_id: z.number().describe("Firewall ID"),
      vm_id: z.number().describe("Virtual machine ID"),
    },
  }, async ({ firewall_id, vm_id }) => formatResult(await client.post(`/api/vps/v1/firewall/${firewall_id}/activate/${vm_id}`)));

  server.registerTool("vps_firewall_deactivate", {
    title: "Deactivate Firewall",
    description: "Deactivate a firewall from a VPS.",
    inputSchema: {
      firewall_id: z.number().describe("Firewall ID"),
      vm_id: z.number().describe("Virtual machine ID"),
    },
  }, async ({ firewall_id, vm_id }) => formatResult(await client.post(`/api/vps/v1/firewall/${firewall_id}/deactivate/${vm_id}`)));

  server.registerTool("vps_firewall_sync", {
    title: "Sync Firewall",
    description: "Sync firewall rules to a VPS.",
    inputSchema: {
      firewall_id: z.number().describe("Firewall ID"),
      vm_id: z.number().describe("Virtual machine ID"),
    },
  }, async ({ firewall_id, vm_id }) => formatResult(await client.post(`/api/vps/v1/firewall/${firewall_id}/sync/${vm_id}`)));


  // === SSH Public Keys ===
  server.registerTool("vps_keys_list", {
    title: "List SSH Keys",
    description: "Get all SSH public keys.",
  }, async () => formatResult(await client.get("/api/vps/v1/public-keys")));

  server.registerTool("vps_keys_create", {
    title: "Create SSH Key",
    description: "Upload a new SSH public key.",
    inputSchema: {
      name: z.string().describe("Key name"),
      key: z.string().describe("SSH public key content"),
    },
  }, async ({ name, key }) => formatResult(await client.post("/api/vps/v1/public-keys", { name, key })));

  server.registerTool("vps_keys_delete", {
    title: "Delete SSH Key",
    description: "Delete an SSH public key.",
    inputSchema: { public_key_id: z.number().describe("Public key ID") },
    annotations: { destructiveHint: true },
  }, async ({ public_key_id }) => formatResult(await client.delete(`/api/vps/v1/public-keys/${public_key_id}`)));

  server.registerTool("vps_keys_attach", {
    title: "Attach SSH Key to VPS",
    description: "Attach an SSH public key to a virtual machine.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      public_key_id: z.number().describe("Public key ID"),
    },
  }, async ({ vm_id, public_key_id }) => formatResult(await client.post(`/api/vps/v1/public-keys/attach/${vm_id}`, { id: public_key_id })));

  // === OS Templates ===
  server.registerTool("vps_templates_list", {
    title: "List OS Templates",
    description: "Get available OS templates for VPS.",
  }, async () => formatResult(await client.get("/api/vps/v1/templates")));

  server.registerTool("vps_templates_get", {
    title: "Get OS Template",
    description: "Get details of a specific OS template.",
    inputSchema: { template_id: z.number().describe("Template ID") },
  }, async ({ template_id }) => formatResult(await client.get(`/api/vps/v1/templates/${template_id}`)));

  // === Data Centers ===
  server.registerTool("vps_datacenters_list", {
    title: "List VPS Data Centers",
    description: "Get available VPS data centers.",
  }, async () => formatResult(await client.get("/api/vps/v1/data-centers")));

  // === Post-Install Scripts ===
  server.registerTool("vps_scripts_list", {
    title: "List Post-Install Scripts",
    description: "Get all post-install scripts.",
  }, async () => formatResult(await client.get("/api/vps/v1/post-install-scripts")));

  server.registerTool("vps_scripts_get", {
    title: "Get Post-Install Script",
    description: "Get a specific post-install script.",
    inputSchema: { script_id: z.number().describe("Script ID") },
  }, async ({ script_id }) => formatResult(await client.get(`/api/vps/v1/post-install-scripts/${script_id}`)));

  server.registerTool("vps_scripts_create", {
    title: "Create Post-Install Script",
    description: "Create a new post-install script.",
    inputSchema: {
      name: z.string().describe("Script name"),
      content: z.string().describe("Script content (bash)"),
    },
  }, async ({ name, content }) => formatResult(await client.post("/api/vps/v1/post-install-scripts", { name, content })));

  server.registerTool("vps_scripts_update", {
    title: "Update Post-Install Script",
    description: "Update an existing post-install script.",
    inputSchema: {
      script_id: z.number().describe("Script ID"),
      name: z.string().describe("Script name"),
      content: z.string().describe("Script content"),
    },
  }, async ({ script_id, name, content }) => formatResult(await client.put(`/api/vps/v1/post-install-scripts/${script_id}`, { name, content })));

  server.registerTool("vps_scripts_delete", {
    title: "Delete Post-Install Script",
    description: "Delete a post-install script.",
    inputSchema: { script_id: z.number().describe("Script ID") },
    annotations: { destructiveHint: true },
  }, async ({ script_id }) => formatResult(await client.delete(`/api/vps/v1/post-install-scripts/${script_id}`)));


  // === Recovery ===
  server.registerTool("vps_recovery_start", {
    title: "Start Recovery Mode",
    description: "Boot VPS into recovery mode.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/recovery`)));

  server.registerTool("vps_recovery_stop", {
    title: "Stop Recovery Mode",
    description: "Exit recovery mode and reboot normally.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.delete(`/api/vps/v1/virtual-machines/${vm_id}/recovery`)));

  // === Malware Scanner (Monarx) ===
  server.registerTool("vps_malware_metrics", {
    title: "Get Malware Scan Metrics",
    description: "Get malware scan statistics for a VPS.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.get(`/api/vps/v1/virtual-machines/${vm_id}/monarx`)));

  server.registerTool("vps_malware_install", {
    title: "Install Malware Scanner",
    description: "Install Monarx malware scanner on a VPS.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/monarx`)));

  server.registerTool("vps_malware_uninstall", {
    title: "Uninstall Malware Scanner",
    description: "Remove Monarx malware scanner from a VPS.",
    inputSchema: vmId,
  }, async ({ vm_id }) => formatResult(await client.delete(`/api/vps/v1/virtual-machines/${vm_id}/monarx`)));

  // === PTR Records ===
  server.registerTool("vps_ptr_create", {
    title: "Create PTR Record",
    description: "Create a PTR (reverse DNS) record for a VPS IP.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      ip_address_id: z.number().describe("IP address ID"),
      value: z.string().describe("PTR record value (hostname)"),
    },
  }, async ({ vm_id, ip_address_id, value }) => formatResult(await client.post(`/api/vps/v1/virtual-machines/${vm_id}/ptr/${ip_address_id}`, { value })));

  server.registerTool("vps_ptr_delete", {
    title: "Delete PTR Record",
    description: "Delete a PTR record from a VPS IP.",
    inputSchema: {
      vm_id: z.number().describe("Virtual machine ID"),
      ip_address_id: z.number().describe("IP address ID"),
    },
    annotations: { destructiveHint: true },
  }, async ({ vm_id, ip_address_id }) => formatResult(await client.delete(`/api/vps/v1/virtual-machines/${vm_id}/ptr/${ip_address_id}`)));
}
