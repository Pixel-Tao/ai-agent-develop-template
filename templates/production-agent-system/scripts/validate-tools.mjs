#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const allowedRiskLevels = new Set(["low", "medium", "high", "destructive"]);
const requiredPermissionLevels = ["low", "medium", "high", "destructive"];

function getProjectRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function parseToolRegistry(content) {
  const tools = [];
  let current = null;

  for (const line of content.split(/\r?\n/)) {
    const nameMatch = line.match(/^\s*-\s+name:\s*(.+)$/);
    if (nameMatch) {
      current = { name: stripQuotes(nameMatch[1]), raw: [] };
      tools.push(current);
      continue;
    }

    if (!current) {
      continue;
    }

    current.raw.push(line);
    const fieldMatch = line.match(/^\s+([a-z_]+):\s*(.+)$/);
    if (fieldMatch) {
      current[fieldMatch[1]] = stripQuotes(fieldMatch[2]);
    }
  }

  return tools;
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function main() {
  const root = getProjectRoot();
  const errors = [];
  const registryPath = path.join(root, "tools", "tool-registry.yaml");
  const permissionsPath = path.join(root, "tools", "permissions.yaml");

  if (!fs.existsSync(registryPath)) {
    errors.push("tools/tool-registry.yaml is missing.");
  }

  if (!fs.existsSync(permissionsPath)) {
    errors.push("tools/permissions.yaml is missing.");
  }

  if (errors.length > 0) {
    return errors;
  }

  const tools = parseToolRegistry(fs.readFileSync(registryPath, "utf8"));
  const names = new Set();

  for (const tool of tools) {
    if (!tool.name) {
      errors.push("A tool entry is missing name.");
    }

    if (names.has(tool.name)) {
      errors.push(`Duplicate tool name '${tool.name}'.`);
    }
    names.add(tool.name);

    if (!tool.description) {
      errors.push(`Tool '${tool.name}' is missing description.`);
    }

    if (!tool.risk_level || !allowedRiskLevels.has(tool.risk_level)) {
      errors.push(`Tool '${tool.name}' has invalid risk_level '${tool.risk_level ?? ""}'.`);
    }

    if (!tool.implementation) {
      errors.push(`Tool '${tool.name}' is missing implementation.`);
    } else if (!fs.existsSync(path.join(root, tool.implementation))) {
      errors.push(`Tool '${tool.name}' implementation does not exist: ${tool.implementation}.`);
    }

    const rawText = tool.raw.join("\n");
    if (!rawText.includes("input_schema:")) {
      errors.push(`Tool '${tool.name}' is missing input_schema.`);
    }
    if (!rawText.includes("output_schema:")) {
      errors.push(`Tool '${tool.name}' is missing output_schema.`);
    }
  }

  const permissions = fs.readFileSync(permissionsPath, "utf8");
  for (const riskLevel of requiredPermissionLevels) {
    if (!permissions.includes(`  ${riskLevel}:`)) {
      errors.push(`tools/permissions.yaml is missing risk level '${riskLevel}'.`);
    }
  }

  for (const requiredApproval of ["high", "destructive"]) {
    if (!new RegExp(`\\n\\s*-\\s*${requiredApproval}\\s*(\\n|$)`).test(permissions)) {
      errors.push(`tools/permissions.yaml approval.required_for is missing '${requiredApproval}'.`);
    }
  }

  return errors;
}

const errors = main();
if (errors.length > 0) {
  console.error("Tool registry validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("Tool registry validation passed.");
}
