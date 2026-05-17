import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  isTextFile,
  readZipEntries,
} from "../scripts/delivery-utils.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(repoRoot, "templates");
const templateIds = fs
  .readdirSync(templatesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));
const placeholderPattern = /\{\{[A-Za-z0-9_-]+\}\}/;

for (const templateId of templateIds) {
  test(`${templateId} generated archive passes smoke checks`, (t) => {
    const projectId = `smoke-${templateId}`;
    const zipPath = path.join(repoRoot, `${projectId}.zip`);
    removeIfExists(zipPath);
    t.after(() => removeIfExists(zipPath));

    runCommand(process.execPath, [
      "scripts/create-project.mjs",
      "--template",
      templateId,
      "--project-id",
      projectId,
      "--project-name",
      `Smoke ${templateId}`,
      "--owner-name",
      "smoke-owner",
      "--force",
    ], repoRoot);

    const entries = readZipEntries(zipPath);
    const files = entries.filter((entry) => !entry.directory);
    const names = files.map((entry) => entry.name).sort((a, b) => a.localeCompare(b));

    for (const requiredFile of [
      "README.md",
      "README.en.md",
      "AGENTS.md",
      "INIT.md",
      "manifest.yaml",
      "template.yaml",
      "scripts/skills.sh",
      "scripts/skills.mjs",
      "skills/skills-index.yaml",
      "skills/catalog.yaml",
      "harness/harness.yaml",
      "delivery/sanitize-policy.yaml",
      "delivery/delivery-manifest.yaml",
      "delivery/delivery-checklist.md",
      "delivery/archive-checklist.md",
      "delivery/purge-checklist.md",
      ".deliveryignore",
      ".agentignore",
    ]) {
      assert.ok(names.includes(requiredFile), `${templateId} should include ${requiredFile}`);
    }

    assertNoUnresolvedPlaceholders(files);
    assertTemplateIdsMatch(files, templateId);
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

function assertNoUnresolvedPlaceholders(files) {
  const unresolved = [];
  for (const file of files) {
    if (!isTextFile(file.name)) {
      continue;
    }

    if (placeholderPattern.test(file.data.toString("utf8"))) {
      unresolved.push(file.name);
    }
  }

  assert.deepEqual(unresolved, []);
}

function assertTemplateIdsMatch(files, templateId) {
  const manifest = getFileText(files, "manifest.yaml");
  const templateYaml = getFileText(files, "template.yaml");
  const manifestTemplateId = manifest.match(/^template:\s*\n\s+id:\s*"([^"]+)"/m)?.[1];
  const templateYamlId = templateYaml.match(/^id:\s*"([^"]+)"/m)?.[1];

  assert.equal(manifestTemplateId, templateId);
  assert.equal(templateYamlId, templateId);
}

function getFileText(files, name) {
  const file = files.find((entry) => entry.name === name);
  assert.ok(file, `${name} should exist`);
  return file.data.toString("utf8");
}

function removeIfExists(targetPath) {
  fs.rmSync(targetPath, { force: true, recursive: true });
}
