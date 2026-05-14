#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const textExtensions = new Set([
  ".env",
  ".example",
  ".gitignore",
  ".gitkeep",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".txt",
  ".yaml",
  ".yml",
]);
const placeholderPattern = /\{\{[A-Za-z0-9_-]+\}\}/g;

function getProjectRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function parseRequiredFiles(templateYamlPath) {
  const lines = fs.readFileSync(templateYamlPath, "utf8").split(/\r?\n/);
  const requiredFiles = [];
  let inRequiredFiles = false;

  for (const line of lines) {
    if (/^required_files:\s*$/.test(line)) {
      inRequiredFiles = true;
      continue;
    }

    if (inRequiredFiles && /^\S/.test(line)) {
      break;
    }

    if (!inRequiredFiles) {
      continue;
    }

    const match = line.match(/^\s+-\s+(.+)$/);
    if (match) {
      requiredFiles.push(match[1].trim().replace(/^["']|["']$/g, ""));
    }
  }

  return requiredFiles;
}

function walkFiles(root) {
  const files = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "dist") {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files.sort((a, b) => a.localeCompare(b));
}

function isTextFile(filePath) {
  const baseName = path.basename(filePath);
  return textExtensions.has(path.extname(baseName)) || baseName === "Dockerfile";
}

function main() {
  const root = getProjectRoot();
  const errors = [];
  const templateYamlPath = path.join(root, "template.yaml");

  if (!fs.existsSync(templateYamlPath)) {
    errors.push("template.yaml is missing.");
  } else {
    for (const requiredFile of parseRequiredFiles(templateYamlPath)) {
      if (!fs.existsSync(path.join(root, requiredFile))) {
        errors.push(`${requiredFile} is listed in template.yaml required_files but is missing.`);
      }
    }
  }

  for (const filePath of walkFiles(root)) {
    if (!isTextFile(filePath)) {
      continue;
    }

    const text = fs.readFileSync(filePath, "utf8");
    if (placeholderPattern.test(text)) {
      errors.push(`${toPosix(path.relative(root, filePath))} contains an unresolved template placeholder.`);
    }
  }

  if (errors.length > 0) {
    console.error("Generated project structure validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Generated project structure validation passed.");
}

main();
