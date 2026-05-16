#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseArgs,
  resolveInside,
  toPosix,
  walkFiles,
  writeTextFile,
} from "./delivery-utils.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function printHelp() {
  console.log(`Safely apply a template to an existing project.

Usage:
  node scripts/apply-template.mjs --template existing-project-onboarding --target ../existing-project --dry-run
  node scripts/apply-template.mjs --template existing-project-onboarding --target ../existing-project --no-overwrite --write-conflicts

Options:
  --template <id>       Template id under templates/.
  --target <dir>        Existing project directory.
  --dry-run             Report actions without writing files.
  --no-overwrite        Keep existing target files. This is the default.
  --write-conflicts     Write conflict details to dist/apply-template-conflicts.md.
  --backup              Copy existing conflicting files to dist/template-backup before overwrite.
  --overwrite           Allow overwriting existing files. Use with care.
  --help                Show this help.
`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  if (!options.template) {
    throw new Error("--template is required.");
  }
  if (!options.target) {
    throw new Error("--target is required.");
  }

  const templateRoot = path.join(repoRoot, "templates", options.template);
  if (!fs.existsSync(templateRoot)) {
    throw new Error(`Unknown template: ${options.template}`);
  }

  const targetRoot = path.resolve(options.target);
  fs.mkdirSync(targetRoot, { recursive: true });

  const dryRun = Boolean(options.dryRun);
  const overwrite = Boolean(options.overwrite) && !options.noOverwrite;
  const files = walkFiles(templateRoot);
  const added = [];
  const skipped = [];
  const conflicts = [];
  const overwritten = [];

  for (const sourcePath of files) {
    const relativePath = toPosix(path.relative(templateRoot, sourcePath));
    const targetPath = resolveInside(targetRoot, relativePath);

    if (fs.existsSync(targetPath)) {
      const same = fs.readFileSync(sourcePath).equals(fs.readFileSync(targetPath));
      if (same) {
        skipped.push(relativePath);
        continue;
      }

      conflicts.push(relativePath);
      if (!overwrite) {
        continue;
      }

      if (!dryRun && options.backup) {
        const backupPath = resolveInside(targetRoot, path.join("dist", "template-backup", relativePath));
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
        fs.copyFileSync(targetPath, backupPath);
      }

      if (!dryRun) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
      }
      overwritten.push(relativePath);
      continue;
    }

    if (!dryRun) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }
    added.push(relativePath);
  }

  const report = [
    "# Apply Template Report",
    "",
    `template: ${options.template}`,
    `target: ${targetRoot}`,
    `dry_run: ${dryRun}`,
    "",
    `added: ${added.length}`,
    `skipped: ${skipped.length}`,
    `conflicts: ${conflicts.length}`,
    `overwritten: ${overwritten.length}`,
    "",
    "## Added",
    ...formatList(added),
    "",
    "## Skipped",
    ...formatList(skipped),
    "",
    "## Conflicts",
    ...formatList(conflicts),
    "",
    "## Overwritten",
    ...formatList(overwritten),
    "",
  ].join("\n");

  const reportPath = path.join(targetRoot, "dist", "apply-template-report.md");
  if (!dryRun) {
    writeTextFile(reportPath, report);
    if (options.writeConflicts) {
      writeTextFile(path.join(targetRoot, "dist", "apply-template-conflicts.md"), [
        "# Apply Template Conflicts",
        "",
        ...formatList(conflicts),
        "",
      ].join("\n"));
    }
  }

  console.log("Apply template completed.");
  console.log(`added: ${added.length}`);
  console.log(`skipped: ${skipped.length}`);
  console.log(`conflicts: ${conflicts.length}`);
  console.log(`merged: 0`);
  console.log(`report: ${toPosix(path.relative(targetRoot, reportPath))}`);
}

function formatList(items) {
  return items.length > 0 ? items.map((item) => `- ${item}`) : ["- None"];
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
