#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const textExtensions = new Set([
  ".md",
  ".yaml",
  ".yml",
  ".template",
  ".gitkeep",
  ".txt",
]);
const placeholderPattern = /\{\{([A-Za-z0-9_-]+)\}\}/g;
const invalidProjectNameCharsPattern = /[<>:"/\\|?*\x00-\x1f]/;
const reservedWindowsNames = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

const templateSummaries = new Map([
  ["greenfield-basic", "New project starter for small teams and first implementation planning."],
  ["existing-project-onboarding", "Safely onboard an existing codebase with discovery, risk mapping, and first tasks."],
  ["large-team-collaboration", "Coordinate multi-agent or larger team work with ownership, reviews, and handoffs."],
  ["legacy-modernization", "Modernize legacy systems with discovery, migration planning, and controlled validation."],
  ["mvp-prototype", "Shape and build an MVP or prototype with fast scope decisions and feedback loops."],
  ["monorepo-multiservice", "Plan and operate monorepo or multi-service projects with service boundaries."],
  ["security-regulated", "Run projects that need security, compliance, approval, and audit discipline."],
  ["maintenance-operations", "Support maintenance, incident response, triage, and operational follow-up work."],
  ["ai-data-project", "Structure data, AI, evaluation, and research-oriented project workflows."],
  ["production-agent-system", "Build production AI Agent systems with tools, evals, memory, and guardrails."],
]);

function printHelp() {
  console.log(`Create a project archive from an Agent Project Template.

Usage:
  node scripts/create-project.mjs
  node scripts/create-project.mjs --template greenfield-basic --project-id Project.Name --project-name "My Project" --owner-name "Owner Name"

Options:
  --template, -t <id>       Template ID under templates/.
  --project-id <id>         Path-safe project id used for filenames and manifests. Defaults to lower-kebab-case project name.
  --project-name, -p <name> Display project name. Any filename-safe name is allowed.
  --owner-name, -o <name>   Owner name used for {{OWNER_NAME}}.
  --force                   Overwrite an existing root zip with the same project id.
  --list                    List available templates with short descriptions.
  --help, -h                Show this help.

Output:
  <project-name>.zip is created in the repository root.
`);
}

function parseArgs(argv) {
  const options = {
    template: null,
    projectId: null,
    projectName: null,
    ownerName: null,
    force: false,
    list: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;
      return argv[i];
    };

    switch (arg) {
      case "--template":
      case "-t":
        options.template = next();
        break;
      case "--project-id":
        options.projectId = next();
        break;
      case "--project-name":
      case "-p":
        options.projectName = next();
        break;
      case "--owner-name":
      case "-o":
        options.ownerName = next();
        break;
      case "--force":
        options.force = true;
        break;
      case "--list":
        options.list = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        if (arg.startsWith("--template=")) {
          options.template = arg.slice("--template=".length);
        } else if (arg.startsWith("--project-id=")) {
          options.projectId = arg.slice("--project-id=".length);
        } else if (arg.startsWith("--project-name=")) {
          options.projectName = arg.slice("--project-name=".length);
        } else if (arg.startsWith("--owner-name=")) {
          options.ownerName = arg.slice("--owner-name=".length);
        } else {
          throw new Error(`Unknown argument: ${arg}`);
        }
    }
  }

  return options;
}

function getRepoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function listTemplates(root) {
  const templatesRoot = path.join(root, "templates");
  return fs
    .readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function getTemplateSummary(templateId) {
  return templateSummaries.get(templateId) ?? "No summary available.";
}

function printTemplateList(templates) {
  const width = templates.reduce((max, templateId) => Math.max(max, templateId.length), 0);
  for (const templateId of templates) {
    console.log(`${templateId.padEnd(width)}  ${getTemplateSummary(templateId)}`);
  }
}

function deriveProjectId(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function validateProjectName(projectName) {
  if (!projectName) {
    throw new Error("Project name is required.");
  }

  if (projectName === "." || projectName === "..") {
    throw new Error("Project name cannot be '.' or '..'.");
  }

  if (invalidProjectNameCharsPattern.test(projectName)) {
    throw new Error('Project name cannot contain path-unsafe characters: < > : " / \\ | ? * or control characters.');
  }

  if (/[. ]$/.test(projectName)) {
    throw new Error("Project name cannot end with a space or dot.");
  }

  const firstPathSegment = projectName.split(".")[0].toUpperCase();
  if (reservedWindowsNames.has(firstPathSegment)) {
    throw new Error("Project name cannot be a reserved Windows device name such as CON, PRN, AUX, NUL, COM1, or LPT1.");
  }
}

function validateProjectId(projectId) {
  if (!projectId) {
    throw new Error("Project id is required. Use --project-id or provide a project name that can be converted to lower-kebab-case.");
  }

  validateProjectName(projectId);
}

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isTextFile(filePath) {
  const name = path.basename(filePath);
  return textExtensions.has(path.extname(name)) || name === "gitignore.template";
}

function walkFiles(root) {
  const files = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files.sort((a, b) => a.localeCompare(b));
}

function replaceVariables(projectRoot, variables) {
  let changedFiles = 0;
  const unresolved = new Map();

  for (const file of walkFiles(projectRoot)) {
    if (!isTextFile(file)) {
      continue;
    }

    const original = fs.readFileSync(file, "utf8");
    const missing = new Set();
    let updated = original.replace(placeholderPattern, (fullMatch, key) => {
      if (variables.has(key)) {
        return variables.get(key);
      }
      missing.add(key);
      return fullMatch;
    });

    if (missing.size > 0) {
      unresolved.set(path.relative(projectRoot, file), [...missing]);
    }

    if (updated !== original) {
      fs.writeFileSync(file, updated, "utf8");
      changedFiles += 1;
    }
  }

  return { changedFiles, unresolved };
}

async function promptMissingOptions(options, templates) {
  if (options.template && options.projectName && options.ownerName) {
    return options;
  }

  if (!input.isTTY) {
    throw new Error("Missing required options. Use --template, --project-name, and --owner-name. --project-id is optional.");
  }

  const rl = readline.createInterface({ input, output });
  try {
    if (!options.template) {
      console.log("Available templates:");
      templates.forEach((templateId, index) => {
        console.log(`  ${index + 1}. ${templateId} - ${getTemplateSummary(templateId)}`);
      });
      const answer = (await rl.question("Select template number or ID: ")).trim();
      const selectedIndex = Number(answer);
      options.template = Number.isInteger(selectedIndex) && selectedIndex >= 1 && selectedIndex <= templates.length
        ? templates[selectedIndex - 1]
        : answer;
    }

    if (!options.projectName) {
      options.projectName = (await rl.question("Project name: ")).trim();
    }

    if (!options.projectId) {
      const derivedProjectId = deriveProjectId(options.projectName);
      const answer = (await rl.question(`Project id [${derivedProjectId}]: `)).trim();
      options.projectId = answer || derivedProjectId;
    }

    if (!options.ownerName) {
      options.ownerName = (await rl.question("Owner name: ")).trim();
    }
  } finally {
    rl.close();
  }

  return options;
}

function copyDeliveryScripts(root, projectRoot) {
  const scriptNames = [
    "delivery-utils.mjs",
    "create-delivery-package.mjs",
    "archive-agent-workspace.mjs",
    "validate-delivery-clean.mjs",
  ];
  const sourceDir = path.join(root, "scripts");
  const targetDir = path.join(projectRoot, "scripts");
  fs.mkdirSync(targetDir, { recursive: true });

  for (const scriptName of scriptNames) {
    fs.copyFileSync(path.join(sourceDir, scriptName), path.join(targetDir, scriptName));
  }
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function writeUInt16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function writeUInt32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(sourceDir, zipPath) {
  const localParts = [];
  const centralParts = [];
  const entries = [];
  let offset = 0;

  function addEntry(relativePath, isDirectory, data, mtime) {
    const normalizedName = relativePath.replace(/\\/g, "/").replace(/\/+/g, "/");
    const entryName = isDirectory && !normalizedName.endsWith("/") ? `${normalizedName}/` : normalizedName;
    const nameBuffer = Buffer.from(entryName, "utf8");
    const compressionMethod = isDirectory ? 0 : 8;
    const uncompressedData = data ?? Buffer.alloc(0);
    const compressedData = isDirectory ? Buffer.alloc(0) : zlib.deflateRawSync(uncompressedData);
    const crc = isDirectory ? 0 : crc32(uncompressedData);
    const { dosDate, dosTime } = dosDateTime(mtime);
    const flags = 0x0800;

    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(flags),
      writeUInt16(compressionMethod),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(crc),
      writeUInt32(compressedData.length),
      writeUInt32(uncompressedData.length),
      writeUInt16(nameBuffer.length),
      writeUInt16(0),
      nameBuffer,
    ]);

    localParts.push(localHeader, compressedData);

    entries.push({
      nameBuffer,
      compressionMethod,
      crc,
      compressedSize: compressedData.length,
      uncompressedSize: uncompressedData.length,
      dosDate,
      dosTime,
      offset,
      flags,
      externalAttributes: isDirectory ? 0x10 : 0,
    });

    offset += localHeader.length + compressedData.length;
  }

  function walk(current, relative = "") {
    const entriesInDir = fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entriesInDir) {
      const fullPath = path.join(current, entry.name);
      const relativePath = relative ? `${relative}/${entry.name}` : entry.name;
      const stat = fs.statSync(fullPath);
      if (entry.isDirectory()) {
        addEntry(relativePath, true, null, stat.mtime);
        walk(fullPath, relativePath);
      } else if (entry.isFile()) {
        addEntry(relativePath, false, fs.readFileSync(fullPath), stat.mtime);
      }
    }
  }

  walk(sourceDir);

  const centralDirectoryOffset = offset;
  for (const entry of entries) {
    const centralHeader = Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(0x0314),
      writeUInt16(20),
      writeUInt16(entry.flags),
      writeUInt16(entry.compressionMethod),
      writeUInt16(entry.dosTime),
      writeUInt16(entry.dosDate),
      writeUInt32(entry.crc),
      writeUInt32(entry.compressedSize),
      writeUInt32(entry.uncompressedSize),
      writeUInt16(entry.nameBuffer.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(entry.externalAttributes),
      writeUInt32(entry.offset),
      entry.nameBuffer,
    ]);
    centralParts.push(centralHeader);
    offset += centralHeader.length;
  }

  const centralDirectorySize = offset - centralDirectoryOffset;
  const endRecord = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(entries.length),
    writeUInt16(entries.length),
    writeUInt32(centralDirectorySize),
    writeUInt32(centralDirectoryOffset),
    writeUInt16(0),
  ]);

  fs.writeFileSync(zipPath, Buffer.concat([...localParts, ...centralParts, endRecord]));
}

async function main() {
  const root = getRepoRoot();
  const options = parseArgs(process.argv.slice(2));
  const templates = listTemplates(root);

  if (options.help) {
    printHelp();
    return;
  }

  if (options.list) {
    printTemplateList(templates);
    return;
  }

  await promptMissingOptions(options, templates);

  if (!templates.includes(options.template)) {
    throw new Error(`Unknown template '${options.template}'. Use --list to see available templates.`);
  }

  const projectName = options.projectName.trim();
  const projectId = (options.projectId ?? deriveProjectId(projectName)).trim();
  const ownerName = options.ownerName.trim();
  validateProjectName(projectName);
  validateProjectId(projectId);
  if (!ownerName) {
    throw new Error("Owner name is required.");
  }

  const templateDir = path.join(root, "templates", options.template);
  const zipPath = path.join(root, `${projectId}.zip`);
  if (fs.existsSync(zipPath) && !options.force) {
    throw new Error(`${path.basename(zipPath)} already exists. Use --force to overwrite it.`);
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "agent-project-template-"));
  const projectRoot = path.join(tempRoot, projectId);

  try {
    fs.cpSync(templateDir, projectRoot, { recursive: true });
    copyDeliveryScripts(root, projectRoot);

    const variables = new Map([
      ["PROJECT_ID", projectId],
      ["PROJECT_NAME", projectName],
      ["PROJECT_TYPE", options.template],
      ["PROJECT_STATUS", "planning"],
      ["OWNER_NAME", ownerName],
      ["YYYY-MM-DD", today()],
    ]);

    const result = replaceVariables(projectRoot, variables);
    createZip(projectRoot, zipPath);

    console.log(`Template: ${options.template}`);
    console.log(`Project ID: ${projectId}`);
    console.log(`Project Name: ${projectName}`);
    console.log(`Owner: ${ownerName}`);
    console.log(`Date: ${variables.get("YYYY-MM-DD")}`);
    console.log(`Files changed: ${result.changedFiles}`);
    console.log(`Archive: ${zipPath}`);

    if (result.unresolved.size > 0) {
      console.log("");
      console.log("Unresolved placeholders:");
      for (const [file, keys] of result.unresolved.entries()) {
        console.log(`- ${file}: ${keys.sort().join(", ")}`);
      }
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
