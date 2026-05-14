import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectName = "phase-9-generated-production-agent-system";
const zipPath = path.join(repoRoot, `${projectName}.zip`);
const snapshotPath = path.join(repoRoot, "tests", "snapshots", "production-agent-system-file-list.txt");
const npmInvocation = createNpmInvocation();
const placeholderPattern = /\{\{[A-Za-z0-9_-]+\}\}/;
const textExtensions = new Set([
  ".css",
  ".example",
  ".gitignore",
  ".gitkeep",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".txt",
  ".yaml",
  ".yml",
]);

test("production-agent-system generated output matches the golden snapshot and passes smoke verification", (t) => {
  removeIfExists(zipPath);

  runCommand(process.execPath, [
    "scripts/create-project.mjs",
    "--template",
    "production-agent-system",
    "--project-name",
    projectName,
    "--owner-name",
    "snapshot-owner",
    "--force",
  ], repoRoot);
  t.after(() => removeIfExists(zipPath));

  const entries = readZipEntries(zipPath);
  const files = entries.filter((entry) => !entry.directory).sort((a, b) => a.name.localeCompare(b.name));
  const actualSnapshot = `${files.map((entry) => entry.name).join("\n")}\n`;
  const expectedSnapshot = fs.readFileSync(snapshotPath, "utf8").replace(/\r\n/g, "\n");
  assert.equal(actualSnapshot, expectedSnapshot);

  assertGeneratedArchiveIsClean(files);
  assertNoUnresolvedPlaceholders(files);

  const tempRoot = fs.mkdtempSync(path.join(repoRoot, ".tmp-generator-"));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
  const projectRoot = path.join(tempRoot, projectName);
  extractZipEntries(files, projectRoot);

  runCommand(process.execPath, ["scripts/validate-structure.mjs"], projectRoot);
  runCommand(process.execPath, ["scripts/validate-tools.mjs"], projectRoot);
  runNpm(["install"], projectRoot);
  runNpm(["run", "build"], projectRoot);
  runNpm(["run", "test"], projectRoot);
  runNpm(["run", "eval:smoke"], projectRoot);
});

function createNpmInvocation() {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath && fs.existsSync(npmExecPath)) {
    return { command: process.execPath, args: [npmExecPath] };
  }

  const npmCliPath = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  if (fs.existsSync(npmCliPath)) {
    return { command: process.execPath, args: [npmCliPath] };
  }

  return { command: process.platform === "win32" ? "npm.cmd" : "npm", args: [] };
}

function runNpm(args, cwd) {
  return runCommand(npmInvocation.command, [...npmInvocation.args, ...args], cwd);
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
    const cause = error.code || `status ${error.status ?? "unknown"}`;
    const stdout = error.stdout ? `\nstdout:\n${error.stdout}` : "";
    const stderr = error.stderr ? `\nstderr:\n${error.stderr}` : "";
    throw new Error(`Command failed (${cause}): ${command} ${args.join(" ")}${stdout}${stderr}`);
  }
}

function readZipEntries(archivePath) {
  const archive = fs.readFileSync(archivePath);
  const entries = [];
  let offset = 0;

  while (offset + 4 <= archive.length) {
    const signature = archive.readUInt32LE(offset);
    if (signature !== 0x04034b50) {
      break;
    }

    const compressionMethod = archive.readUInt16LE(offset + 8);
    const compressedSize = archive.readUInt32LE(offset + 18);
    const uncompressedSize = archive.readUInt32LE(offset + 22);
    const nameLength = archive.readUInt16LE(offset + 26);
    const extraLength = archive.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    const name = archive.subarray(nameStart, nameStart + nameLength).toString("utf8");
    const compressedData = archive.subarray(dataStart, dataEnd);
    const directory = name.endsWith("/");
    const data = directory ? Buffer.alloc(0) : inflateEntry(compressedData, compressionMethod);

    if (!directory && data.length !== uncompressedSize) {
      throw new Error(`Invalid zip entry size for ${name}.`);
    }

    entries.push({
      name,
      directory,
      data,
    });

    offset = dataEnd;
  }

  assert.ok(entries.length > 0, "Generated archive should contain entries.");
  return entries;
}

function inflateEntry(compressedData, compressionMethod) {
  if (compressionMethod === 0) {
    return Buffer.from(compressedData);
  }

  if (compressionMethod === 8) {
    return zlib.inflateRawSync(compressedData);
  }

  throw new Error(`Unsupported zip compression method: ${compressionMethod}`);
}

function assertGeneratedArchiveIsClean(files) {
  const names = files.map((entry) => entry.name);
  assert.ok(names.includes("README.en.md"));
  assert.ok(names.includes("src/index.ts"));
  assert.ok(names.includes("src/api/healthcheck.ts"));
  assert.ok(names.includes("src/workers/queue.ts"));
  assert.ok(names.includes("tests/deployment.test.ts"));
  assert.ok(names.includes("deploy/Dockerfile"));

  const forbidden = names.filter(
    (name) =>
      name.startsWith("node_modules/") ||
      name.startsWith("dist/") ||
      name.startsWith(".docker-tmp/") ||
      /evals\/reports\/.+-latest\.(json|md)$/.test(name),
  );
  assert.deepEqual(forbidden, []);
}

function assertNoUnresolvedPlaceholders(files) {
  const unresolved = [];

  for (const entry of files) {
    if (!isTextFile(entry.name)) {
      continue;
    }

    const text = entry.data.toString("utf8");
    if (placeholderPattern.test(text)) {
      unresolved.push(entry.name);
    }
  }

  assert.deepEqual(unresolved, []);
}

function isTextFile(name) {
  const baseName = path.basename(name);
  return textExtensions.has(path.extname(baseName)) || baseName === "Dockerfile";
}

function extractZipEntries(files, destination) {
  fs.mkdirSync(destination, { recursive: true });
  const root = path.resolve(destination);

  for (const entry of files) {
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
