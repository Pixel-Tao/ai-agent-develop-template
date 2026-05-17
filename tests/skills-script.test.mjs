import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { readZipEntries } from "../scripts/delivery-utils.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("generated project can search and add skills during initialization", (t) => {
  const projectId = "skills-init-smoke";
  const zipPath = path.join(repoRoot, `${projectId}.zip`);
  const tempRoot = fs.mkdtempSync(path.join(repoRoot, ".tmp-skills-"));
  const projectRoot = path.join(tempRoot, projectId);

  removeIfExists(zipPath);
  t.after(() => {
    removeIfExists(zipPath);
    removeIfExists(tempRoot);
  });

  runCommand(process.execPath, [
    "scripts/create-project.mjs",
    "--template",
    "greenfield-basic",
    "--project-id",
    projectId,
    "--project-name",
    "Skills Init Smoke",
    "--owner-name",
    "skills-owner",
    "--force",
  ], repoRoot);

  extractZip(readZipEntries(zipPath), projectRoot);

  const listOutput = runCommand(process.execPath, ["scripts/skills.mjs", "list"], projectRoot);
  assert.match(listOutput, /project-discovery-interview/);

  const rootOptionOutput = runCommand(process.execPath, [
    path.join(repoRoot, "scripts", "skills.mjs"),
    "--root",
    projectRoot,
    "list",
  ], repoRoot);
  assert.match(rootOptionOutput, /project-discovery-interview/);

  const searchOutput = runCommand(process.execPath, ["scripts/skills.mjs", "search", "frontend"], projectRoot);
  assert.match(searchOutput, /frontend-implementation/);

  const addOutput = runCommand(process.execPath, ["scripts/skills.mjs", "add", "--from-catalog", "frontend-implementation"], projectRoot);
  assert.match(addOutput, /Skill added: frontend-implementation/);

  const index = fs.readFileSync(path.join(projectRoot, "skills", "skills-index.yaml"), "utf8");
  assert.match(index, /id: frontend-implementation/);
  assert.ok(fs.existsSync(path.join(projectRoot, "skills", "frontend-implementation", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(projectRoot, "skills", "selected-skills.md")));
});

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

function removeIfExists(targetPath) {
  fs.rmSync(targetPath, { force: true, recursive: true });
}
