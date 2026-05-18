#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(root, "templates");
const allowedRiskLevels = new Set(["low", "medium", "high", "destructive"]);
const requiredTemplateFiles = [
  "mcp/README.md",
  "mcp/mcp-policy.yaml",
  "mcp/mcp-servers.yaml",
  "mcp/mcp-selection-log.md",
  "mcp/reports/.gitkeep",
];
const requiredDeliveryExcludes = [
  "mcp/reports/",
  "mcp/mcp-selection-log.md",
  ".mcp.local.json",
  ".mcp*.local.json",
];

const errors = [];

for (const templateId of listTemplateIds()) {
  validateTemplateMcp(templateId);
}

if (errors.length > 0) {
  console.error("MCP config validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("MCP config validation passed.");
}

function listTemplateIds() {
  return fs.readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function validateTemplateMcp(templateId) {
  const templatePath = path.join(templatesRoot, templateId);
  for (const requiredFile of requiredTemplateFiles) {
    assertExists(path.join(templatePath, requiredFile), `${templateId}: missing ${requiredFile}`);
  }

  validatePolicy(templateId, path.join(templatePath, "mcp", "mcp-policy.yaml"));
  validateServers(templateId, path.join(templatePath, "mcp", "mcp-servers.yaml"));
  validateSelectionLog(templateId, path.join(templatePath, "mcp", "mcp-selection-log.md"));
  validateDeliveryExclusions(templateId, templatePath);
  validateInitGuidance(templateId, path.join(templatePath, "INIT.md"));
}

function validatePolicy(templateId, policyPath) {
  if (!fs.existsSync(policyPath)) {
    return;
  }

  const text = fs.readFileSync(policyPath, "utf8");
  for (const required of [
    'mode: "mcp-control"',
    "auto_install: false",
    "auto_start: false",
    "allow_plaintext: false",
    "record_selection: mcp/mcp-selection-log.md",
    "record_runtime_logs: docs/09_agent_state/run-log.md",
  ]) {
    assertIncludes(text, required, `${templateId}: mcp-policy.yaml missing ${required}`);
  }

  for (const item of requiredDeliveryExcludes) {
    assertIncludes(text, item, `${templateId}: mcp-policy.yaml missing delivery exclude ${item}`);
  }
}

function validateServers(templateId, serversPath) {
  if (!fs.existsSync(serversPath)) {
    return;
  }

  const text = fs.readFileSync(serversPath, "utf8");
  const serverBlocks = text.split(/\n\s+- id: /).slice(1).map((block) => `id: ${block}`);
  if (serverBlocks.length === 0) {
    errors.push(`${templateId}: mcp-servers.yaml must define at least one server candidate`);
    return;
  }

  for (const block of serverBlocks) {
    const id = block.match(/^id:\s*"?([^"\n]+)"?/m)?.[1]?.trim() ?? "unknown";
    for (const field of [
      "purpose:",
      "status:",
      "risk_level:",
      "transport:",
      "approval:",
      "credentials:",
      "allowed_operations:",
      "denied_operations:",
    ]) {
      assertIncludes(block, field, `${templateId}: MCP server '${id}' missing ${field}`);
    }

    const riskLevel = block.match(/risk_level:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
    if (!allowedRiskLevels.has(riskLevel)) {
      errors.push(`${templateId}: MCP server '${id}' has invalid risk_level '${riskLevel}'`);
    }

    if ((riskLevel === "high" || riskLevel === "destructive") && !/approval:\s*\n\s+required:\s+true/m.test(block)) {
      errors.push(`${templateId}: MCP server '${id}' risk '${riskLevel}' must require approval`);
    }

    if (!/plaintext_allowed:\s+false/m.test(block)) {
      errors.push(`${templateId}: MCP server '${id}' must disallow plaintext credentials`);
    }
  }
}

function validateSelectionLog(templateId, selectionLogPath) {
  if (!fs.existsSync(selectionLogPath)) {
    return;
  }

  const text = fs.readFileSync(selectionLogPath, "utf8");
  for (const required of ["MCP Selection Log", "| Date | Capability | MCP Server | Risk | Decision | Approval | Reason |"]) {
    assertIncludes(text, required, `${templateId}: mcp-selection-log.md missing ${required}`);
  }
}

function validateDeliveryExclusions(templateId, templatePath) {
  const deliveryIgnorePath = path.join(templatePath, ".deliveryignore");
  const sanitizePolicyPath = path.join(templatePath, "delivery", "sanitize-policy.yaml");
  const deliveryManifestPath = path.join(templatePath, "delivery", "delivery-manifest.yaml");

  for (const filePath of [deliveryIgnorePath, sanitizePolicyPath, deliveryManifestPath]) {
    if (!fs.existsSync(filePath)) {
      errors.push(`${templateId}: missing ${path.relative(templatePath, filePath)}`);
      continue;
    }

    const text = fs.readFileSync(filePath, "utf8");
    for (const item of requiredDeliveryExcludes) {
      assertIncludes(text, item, `${templateId}: ${path.relative(templatePath, filePath)} missing ${item}`);
    }
  }
}

function validateInitGuidance(templateId, initPath) {
  if (!fs.existsSync(initPath)) {
    errors.push(`${templateId}: missing INIT.md`);
    return;
  }

  const text = fs.readFileSync(initPath, "utf8");
  for (const required of [
    "MCP 구성 초기화",
    "mcp/mcp-policy.yaml",
    "mcp/mcp-servers.yaml",
    "mcp/mcp-selection-log.md",
    "MCP 후보를 검토하고 승인/보류/거절 사유가 기록되어 있다.",
  ]) {
    assertIncludes(text, required, `${templateId}: INIT.md missing MCP guidance '${required}'`);
  }

  if (templateId === "production-agent-system") {
    assertIncludes(text, "tool/MCP bridge", `${templateId}: INIT.md must distinguish product runtime tool/MCP bridge from Agent operating MCP`);
  }
}

function assertExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    errors.push(message);
  }
}

function assertIncludes(text, value, message) {
  if (!text.includes(value)) {
    errors.push(message);
  }
}
