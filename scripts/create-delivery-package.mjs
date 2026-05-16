#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  createZipFromFiles,
  formatReport,
  parseArgs,
  parsePolicy,
  readProjectMetadata,
  readZipEntries,
  scanFilesForPlaceholders,
  scanFilesForSuspiciousPatterns,
  selectDeliveryFiles,
  today,
  validateEntriesAreClean,
  writeDeliveryManifest,
  writeTextFile,
} from "./delivery-utils.mjs";

function printHelp() {
  console.log(`Create a clean delivery package.

Usage:
  node scripts/create-delivery-package.mjs --policy delivery/sanitize-policy.yaml --output dist/delivery

Options:
  --policy <path>             Sanitization policy path. Default: delivery/sanitize-policy.yaml
  --output <dir>              Output directory. Default: dist/delivery
  --project-root <dir>        Project root. Default: current working directory
  --package-name <name>       Override output package filename.
  --include-git-history       Include .git history. Requires policy review.
  --dry-run                   Print planned actions without writing files.
  --force                     Overwrite an existing delivery package.
  --help                      Show this help.
`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const projectRoot = path.resolve(options.projectRoot || process.cwd());
  const policyPath = path.resolve(projectRoot, options.policy || "delivery/sanitize-policy.yaml");
  const outputDir = path.resolve(projectRoot, options.output || "dist/delivery");

  if (!fs.existsSync(policyPath)) {
    throw new Error(`Policy file not found: ${path.relative(projectRoot, policyPath)}`);
  }

  const policy = parsePolicy(policyPath);
  const metadata = readProjectMetadata(projectRoot);
  const packageName = options.packageName || `${metadata.id}-delivery-${metadata.deliveryDate || today()}.zip`;
  const packagePath = path.join(outputDir, packageName);
  const includeGitHistory = Boolean(options.includeGitHistory);

  const selection = selectDeliveryFiles(projectRoot, policy, { includeGitHistory });
  const unresolvedPlaceholders = scanFilesForPlaceholders(selection.files);
  const suspiciousFindings = scanFilesForSuspiciousPatterns(selection.files, policy.scan.suspiciousPatterns);

  if (selection.files.length === 0) {
    throw new Error("No files selected for delivery package.");
  }

  if (unresolvedPlaceholders.length > 0) {
    throw new Error(`Unresolved placeholders found: ${unresolvedPlaceholders.join(", ")}`);
  }

  if (suspiciousFindings.length > 0) {
    throw new Error(`Suspicious internal log patterns found: ${suspiciousFindings.map((item) => `${item.entryName}:${item.pattern}`).join(", ")}`);
  }

  if (fs.existsSync(packagePath) && !options.force && !options.dryRun) {
    throw new Error(`${path.relative(projectRoot, packagePath)} already exists. Use --force to overwrite it.`);
  }

  if (includeGitHistory) {
    console.warn("Warning: --include-git-history is enabled. Confirm review_required items before delivery.");
  }

  const licenseFilesPresent = selection.files.some((file) => ["LICENSE", "NOTICE"].includes(file.entryName));
  const reportPath = path.join(projectRoot, "delivery", "reports", "delivery-clean-report.md");
  const manifestPath = "delivery/delivery-manifest.yaml";

  if (!options.dryRun) {
    createZipFromFiles(projectRoot, selection.files, packagePath);
    const entries = readZipEntries(packagePath);
    const validationErrors = validateEntriesAreClean(entries, policy);
    if (validationErrors.length > 0) {
      throw new Error(`Delivery package validation failed: ${validationErrors.map((error) => `${error.filePath}: ${error.message}`).join("; ")}`);
    }

    writeDeliveryManifest(projectRoot, manifestPath, {
      project: {
        id: metadata.id,
        name: metadata.name,
        owner: metadata.owner,
        deliveryDate: metadata.deliveryDate || today(),
      },
      packagePath,
      includeGitHistory,
      included: selection.files.map((file) => file.entryName),
      excluded: policy.scan.forbiddenPaths,
      archiveCreated: false,
      unresolvedPlaceholders,
      agentArtifactsFound: false,
      internalLogsFound: false,
      licenseFilesPresent,
    });

    writeTextFile(reportPath, formatReport("Delivery Clean Report", [
      { title: "Package", body: path.relative(projectRoot, packagePath) },
      { title: "Included Files", body: selection.files.map((file) => `- ${file.entryName}`) },
      { title: "Missing Policy Paths", body: selection.missing.map((filePath) => `- ${filePath}`) },
      { title: "Warnings", body: licenseFilesPresent ? ["- None"] : ["- LICENSE or NOTICE was not included. Confirm whether this is expected."] },
    ]));
  }

  console.log(options.dryRun ? "Delivery package dry run completed." : "Delivery package created.");
  console.log(`package: ${path.relative(projectRoot, packagePath)}`);
  console.log(`files: ${selection.files.length}`);
  if (selection.missing.length > 0) {
    console.log(`missing policy paths: ${selection.missing.length}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
