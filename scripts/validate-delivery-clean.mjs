#!/usr/bin/env node

import path from "node:path";
import {
  parseArgs,
  parsePolicy,
  readZipEntries,
  validateEntriesAreClean,
} from "./delivery-utils.mjs";

function printHelp() {
  console.log(`Validate a delivery package.

Usage:
  node scripts/validate-delivery-clean.mjs --package dist/delivery/project-delivery.zip --policy delivery/sanitize-policy.yaml

Options:
  --package <path>      Delivery zip path.
  --policy <path>       Sanitization policy path. Default: delivery/sanitize-policy.yaml
  --project-root <dir>  Project root. Default: current working directory
  --help                Show this help.
`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (!options.package) {
    throw new Error("--package is required.");
  }

  const projectRoot = path.resolve(options.projectRoot || process.cwd());
  const packagePath = path.resolve(projectRoot, options.package);
  const policyPath = path.resolve(projectRoot, options.policy || "delivery/sanitize-policy.yaml");
  const policy = parsePolicy(policyPath);
  const entries = readZipEntries(packagePath);
  const errors = validateEntriesAreClean(entries, policy);

  if (errors.length > 0) {
    console.error("Delivery clean validation failed:");
    for (const error of errors) {
      console.error(`- ${error.filePath}: ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Delivery clean validation passed.");
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
