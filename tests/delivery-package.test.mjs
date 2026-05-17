import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  matchesAnyPattern,
  readZipEntries,
} from "../scripts/delivery-utils.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(repoRoot, "templates");
const templateIds = fs
  .readdirSync(templatesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));
const forbiddenDeliveryPaths = [
  "AGENTS.md",
  "CLAUDE.md",
  "INIT.md",
  "skills/",
  "agents/",
  "workflows/",
  "harness/",
  "inputs/",
  "outputs/",
  "docs/09_agent_state/",
  "scripts/skills.sh",
  "scripts/skills.mjs",
  "skills/selected-skills.md",
];

for (const templateId of templateIds) {
  test(`${templateId} delivery package excludes Agent operational materials`, (t) => {
    const projectId = `delivery-${templateId}`;
    const zipPath = path.join(repoRoot, `${projectId}.zip`);
    const tempRoot = fs.mkdtempSync(path.join(repoRoot, ".tmp-delivery-"));
    const projectRoot = path.join(tempRoot, projectId);

    removeIfExists(zipPath);
    t.after(() => {
      removeIfExists(zipPath);
      removeIfExists(tempRoot);
    });

    runCommand(process.execPath, [
      "scripts/create-project.mjs",
      "--template",
      templateId,
      "--project-id",
      projectId,
      "--project-name",
      `Delivery ${templateId}`,
      "--owner-name",
      "delivery-owner",
      "--force",
    ], repoRoot);

    extractZip(readZipEntries(zipPath), projectRoot);

    runCommand(process.execPath, [
      path.join(repoRoot, "scripts", "create-delivery-package.mjs"),
      "--policy",
      "delivery/sanitize-policy.yaml",
      "--output",
      "dist/delivery",
      "--force",
    ], projectRoot);

    const packagePath = findSingleZip(path.join(projectRoot, "dist", "delivery"));

    runCommand(process.execPath, [
      path.join(repoRoot, "scripts", "validate-delivery-clean.mjs"),
      "--package",
      path.relative(projectRoot, packagePath),
      "--policy",
      "delivery/sanitize-policy.yaml",
    ], projectRoot);

    const deliveryEntries = readZipEntries(packagePath).filter((entry) => !entry.directory);
    const forbidden = deliveryEntries
      .map((entry) => entry.name)
      .filter((entryName) => matchesAnyPattern(entryName, forbiddenDeliveryPaths));

    assert.deepEqual(forbidden, []);
    assert.ok(fs.existsSync(path.join(projectRoot, "delivery", "reports", "delivery-clean-report.md")));
    assert.ok(fs.existsSync(path.join(projectRoot, "delivery", "delivery-manifest.yaml")));
  });
}

function runCommand(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      env: {
        ...process.env,
        CI: "1",
      },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const stdout = error.stdout ? `\nstdout:\n${error.stdout}` : "";
    const stderr = error.stderr ? `\nstderr:\n${error.stderr}` : "";
    throw new Error(`Command failed: ${command} ${args.join(" ")}${stdout}${stderr}`);
  }
}

function extractZip(entries, destination) {
  fs.mkdirSync(destination, { recursive: true });
  const root = path.resolve(destination);

  for (const entry of entries) {
    if (entry.directory) {
      continue;
    }

    const target = path.resolve(root, ...entry.name.split("/"));
    if (!target.startsWith(`${root}${path.sep}`)) {
      throw new Error(`Refusing to extract path outside destination: ${entry.name}`);
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, entry.data);
  }
}

function findSingleZip(directory) {
  const zips = fs.readdirSync(directory)
    .filter((name) => name.endsWith(".zip"))
    .map((name) => path.join(directory, name));
  assert.equal(zips.length, 1, `Expected one delivery zip in ${directory}`);
  return zips[0];
}

function removeIfExists(targetPath) {
  fs.rmSync(targetPath, { force: true, recursive: true });
}
