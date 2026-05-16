#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  collectRequestedFiles,
  createZipFromFiles,
  formatReport,
  normalizeEntryPath,
  parseArgs,
  parsePolicy,
  readProjectMetadata,
  today,
  writeTextFile,
} from "./delivery-utils.mjs";

function printHelp() {
  console.log(`Create an internal archive of Agent workspace materials.

Usage:
  node scripts/archive-agent-workspace.mjs --policy delivery/sanitize-policy.yaml --output dist/internal-archive

Options:
  --policy <path>       Sanitization policy path. Default: delivery/sanitize-policy.yaml
  --output <dir>        Output directory. Default: dist/internal-archive
  --project-root <dir>  Project root. Default: current working directory
  --archive-name <name> Override archive filename.
  --dry-run             Print planned actions without writing files.
  --force               Overwrite an existing archive.
  --help                Show this help.
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
  const outputDir = path.resolve(projectRoot, options.output || "dist/internal-archive");

  if (!fs.existsSync(policyPath)) {
    throw new Error(`Policy file not found: ${path.relative(projectRoot, policyPath)}`);
  }

  const policy = parsePolicy(policyPath);
  const metadata = readProjectMetadata(projectRoot);
  const archiveName = options.archiveName || `${metadata.id}-internal-archive-${metadata.deliveryDate || today()}.zip`;
  const archivePath = path.join(outputDir, archiveName);
  const archivePaths = policy.categories.internalArchive.paths;
  const collected = collectRequestedFiles(projectRoot, archivePaths);
  const files = collected.files.map((filePath) => ({
    absolutePath: filePath,
    entryName: normalizeEntryPath(path.relative(projectRoot, filePath)),
  }));

  if (fs.existsSync(archivePath) && !options.force && !options.dryRun) {
    throw new Error(`${path.relative(projectRoot, archivePath)} already exists. Use --force to overwrite it.`);
  }

  if (!options.dryRun) {
    createZipFromFiles(projectRoot, files, archivePath);
    writeTextFile(path.join(outputDir, "archive-manifest.yaml"), [
      "project:",
      `  id: "${metadata.id}"`,
      `  name: "${metadata.name}"`,
      `  archived_at: "${today()}"`,
      "",
      `archive_package: "${path.basename(archivePath)}"`,
      "included:",
      ...files.map((file) => `  - ${file.entryName}`),
      "",
      "review_required:",
      ...policy.reviewRequired.map((item) => `  - ${item}`),
      "",
    ].join("\n"));
    writeTextFile(path.join(projectRoot, "delivery", "reports", "archive-report.md"), formatReport("Agent Workspace Archive Report", [
      { title: "Archive", body: path.relative(projectRoot, archivePath) },
      { title: "Included Files", body: files.map((file) => `- ${file.entryName}`) },
      { title: "Missing Policy Paths", body: collected.missing.map((filePath) => `- ${filePath}`) },
      { title: "Review Required", body: policy.reviewRequired.map((item) => `- ${item}`) },
    ]));
  }

  console.log(options.dryRun ? "Agent workspace archive dry run completed." : "Agent workspace archive created.");
  console.log(`archive: ${path.relative(projectRoot, archivePath)}`);
  console.log(`files: ${files.length}`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
