import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

export const placeholderPattern = /\{\{[A-Za-z0-9_-]+\}\}/;

export const defaultForbiddenPaths = [
  "AGENTS.md",
  "CLAUDE.md",
  "INIT.md",
  "skills/",
  "harness/",
  "docs/09_agent_state/",
];

const textExtensions = new Set([
  ".css",
  ".csv",
  ".env",
  ".example",
  ".gitignore",
  ".gitkeep",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ps1",
  ".sh",
  ".sql",
  ".ts",
  ".txt",
  ".yaml",
  ".yml",
]);

const builtInExcludes = [
  ".git/",
  "node_modules/",
  "dist/delivery/",
  "dist/internal-archive/",
];

export function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${arg}`);
    }

    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    const key = rawKey.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return options;
}

export function today() {
  const now = new Date();
  return [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

export function normalizeEntryPath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/+/g, "/");
}

export function resolveInside(root, requestedPath) {
  const absoluteRoot = path.resolve(root);
  const resolved = path.resolve(absoluteRoot, requestedPath);
  if (resolved !== absoluteRoot && !resolved.startsWith(`${absoluteRoot}${path.sep}`)) {
    throw new Error(`Refusing to access path outside project root: ${requestedPath}`);
  }

  return resolved;
}

export function walkFiles(root) {
  const files = [];

  function walk(current) {
    if (!fs.existsSync(current)) {
      return;
    }

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

export function isTextFile(filePath) {
  const baseName = path.basename(filePath);
  return textExtensions.has(path.extname(baseName)) || baseName === "Dockerfile";
}

export function readIgnorePatterns(root, ignoreFile = ".deliveryignore") {
  const ignorePath = path.join(root, ignoreFile);
  if (!fs.existsSync(ignorePath)) {
    return [];
  }

  return fs
    .readFileSync(ignorePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

export function parsePolicy(policyPath) {
  const content = fs.readFileSync(policyPath, "utf8");
  const policy = {
    delivery: {
      includeGitHistory: false,
    },
    categories: {
      deliver: { paths: [] },
      internalArchive: { paths: [] },
      purgeIfAllowed: { paths: [] },
      neverDeleteWithoutReview: { paths: [] },
    },
    reviewRequired: [],
    scan: {
      forbiddenPaths: [],
      suspiciousPatterns: [],
      allowedContexts: [],
    },
  };

  let section = null;
  let category = null;
  let listTarget = null;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, "");
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const topLevel = line.match(/^([A-Za-z_]+):/);
    if (topLevel) {
      section = topLevel[1];
      category = null;
      listTarget = null;
      continue;
    }

    if (section === "delivery") {
      const scalar = trimmed.match(/^([A-Za-z_]+):\s*(.+)$/);
      if (scalar?.[1] === "include_git_history") {
        policy.delivery.includeGitHistory = scalar[2] === "true";
      }
      continue;
    }

    if (section === "categories") {
      const categoryMatch = line.match(/^  ([A-Za-z_]+):/);
      if (categoryMatch) {
        category = toCamelCase(categoryMatch[1]);
        policy.categories[category] ??= { paths: [] };
        listTarget = null;
        continue;
      }

      if (category && /^    paths:\s*$/.test(line)) {
        listTarget = policy.categories[category].paths;
        continue;
      }
    }

    if (section === "scan") {
      const scanList = line.match(/^  ([A-Za-z_]+):/);
      if (scanList) {
        listTarget = policy.scan[toCamelCase(scanList[1])] ?? [];
        policy.scan[toCamelCase(scanList[1])] = listTarget;
        continue;
      }
    }

    if (section === "review_required") {
      listTarget = policy.reviewRequired;
    }

    const listItem = trimmed.match(/^-\s+(.+)$/);
    if (listItem && listTarget) {
      listTarget.push(stripYamlScalar(listItem[1]));
    }
  }

  if (policy.scan.forbiddenPaths.length === 0) {
    policy.scan.forbiddenPaths = [...defaultForbiddenPaths];
  }

  return policy;
}

function toCamelCase(value) {
  return value.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function stripYamlScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

export function collectRequestedFiles(root, requestedPaths) {
  const files = new Set();
  const missing = [];

  for (const requestedPath of requestedPaths) {
    const normalized = normalizeEntryPath(requestedPath);
    const absolutePath = resolveInside(root, normalized);

    if (!fs.existsSync(absolutePath)) {
      missing.push(normalized);
      continue;
    }

    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      for (const filePath of walkFiles(absolutePath)) {
        files.add(filePath);
      }
    } else if (stat.isFile()) {
      files.add(absolutePath);
    }
  }

  return { files: [...files].sort((a, b) => a.localeCompare(b)), missing };
}

export function selectDeliveryFiles(root, policy, options = {}) {
  const ignorePatterns = [
    ...builtInExcludes,
    ...readIgnorePatterns(root),
    ...(options.extraExcludePatterns ?? []),
    ...policy.scan.forbiddenPaths,
  ];

  if (options.includeGitHistory || policy.delivery.includeGitHistory) {
    removePattern(ignorePatterns, ".git/");
  }

  const deliverPaths = policy.categories.deliver.paths;
  const collected = deliverPaths.length > 0
    ? collectRequestedFiles(root, deliverPaths)
    : { files: walkFiles(root), missing: [] };

  const files = collected.files
    .map((filePath) => ({
      absolutePath: filePath,
      entryName: normalizeEntryPath(path.relative(root, filePath)),
    }))
    .filter((file) => !matchesAnyPattern(file.entryName, ignorePatterns))
    .sort((a, b) => a.entryName.localeCompare(b.entryName));

  return {
    files,
    missing: collected.missing,
    ignoredPatterns: ignorePatterns,
  };
}

function removePattern(patterns, pattern) {
  const index = patterns.indexOf(pattern);
  if (index >= 0) {
    patterns.splice(index, 1);
  }
}

export function matchesAnyPattern(entryName, patterns) {
  return patterns.some((pattern) => matchesPattern(entryName, pattern));
}

export function matchesPattern(entryName, pattern) {
  const normalizedEntry = normalizeEntryPath(entryName);
  const normalizedPattern = normalizeEntryPath(pattern);

  if (!normalizedPattern) {
    return false;
  }

  if (normalizedPattern.endsWith("/")) {
    return normalizedEntry.startsWith(normalizedPattern);
  }

  if (normalizedPattern.includes("*")) {
    return globToRegExp(normalizedPattern).test(normalizedEntry);
  }

  return normalizedEntry === normalizedPattern || normalizedEntry.startsWith(`${normalizedPattern}/`);
}

function globToRegExp(pattern) {
  const escaped = normalizeEntryPath(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*");
  return new RegExp(`^${escaped}$`);
}

export function scanFilesForPlaceholders(files) {
  const unresolved = [];

  for (const file of files) {
    const entryName = file.entryName ?? file.name;
    if (!isTextFile(entryName)) {
      continue;
    }

    const text = file.data ? file.data.toString("utf8") : fs.readFileSync(file.absolutePath, "utf8");
    if (placeholderPattern.test(text)) {
      unresolved.push(entryName);
    }
  }

  return unresolved;
}

export function scanFilesForSuspiciousPatterns(files, suspiciousPatterns) {
  const findings = [];
  const loweredPatterns = suspiciousPatterns.map((pattern) => pattern.toLowerCase());

  for (const file of files) {
    const entryName = file.entryName ?? file.name;
    if (!isTextFile(entryName)) {
      continue;
    }

    const text = (file.data ? file.data.toString("utf8") : fs.readFileSync(file.absolutePath, "utf8")).toLowerCase();
    for (const pattern of loweredPatterns) {
      if (pattern && text.includes(pattern)) {
        findings.push({ entryName, pattern });
      }
    }
  }

  return findings;
}

export function validateEntriesAreClean(entries, policy) {
  const files = entries.filter((entry) => !entry.directory);
  const errors = [];

  for (const entry of files) {
    if (matchesAnyPattern(entry.name, policy.scan.forbiddenPaths)) {
      errors.push({ filePath: entry.name, message: "Forbidden Agent operational path is present." });
    }
  }

  for (const filePath of scanFilesForPlaceholders(files)) {
    errors.push({ filePath, message: "Unresolved template placeholder is present." });
  }

  for (const finding of scanFilesForSuspiciousPatterns(files, policy.scan.suspiciousPatterns)) {
    errors.push({ filePath: finding.entryName, message: `Suspicious internal log pattern found: ${finding.pattern}` });
  }

  if (!files.some((entry) => entry.name === "README.md")) {
    errors.push({ filePath: "README.md", message: "Delivery package should include README.md." });
  }

  return errors;
}

export function createZipFromFiles(root, files, zipPath) {
  const localParts = [];
  const centralParts = [];
  const entries = [];
  let offset = 0;

  for (const file of files) {
    const data = fs.readFileSync(file.absolutePath);
    const stat = fs.statSync(file.absolutePath);
    const nameBuffer = Buffer.from(file.entryName, "utf8");
    const compressedData = zlib.deflateRawSync(data);
    const crc = crc32(data);
    const { dosDate, dosTime } = dosDateTime(stat.mtime);

    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(8),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(crc),
      writeUInt32(compressedData.length),
      writeUInt32(data.length),
      writeUInt16(nameBuffer.length),
      writeUInt16(0),
      nameBuffer,
    ]);

    localParts.push(localHeader, compressedData);
    entries.push({
      nameBuffer,
      crc,
      compressedSize: compressedData.length,
      uncompressedSize: data.length,
      dosDate,
      dosTime,
      offset,
    });
    offset += localHeader.length + compressedData.length;
  }

  const centralDirectoryOffset = offset;
  for (const entry of entries) {
    const centralHeader = Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(0x0314),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(8),
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
      writeUInt32(0),
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

  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  fs.writeFileSync(zipPath, Buffer.concat([...localParts, ...centralParts, endRecord]));
}

export function readZipEntries(zipPath) {
  const archive = fs.readFileSync(zipPath);
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

    entries.push({ name, directory, data });
    offset = dataEnd;
  }

  if (entries.length === 0) {
    throw new Error(`Zip archive has no readable entries: ${zipPath}`);
  }

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

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
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
  const dosDate = ((year - 1980) << 9) | (date.getMonth() + 1) << 5 | date.getDate();
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

export function readProjectMetadata(root) {
  const manifestPath = path.join(root, "delivery", "delivery-manifest.yaml");
  const fallback = path.basename(path.resolve(root));
  if (!fs.existsSync(manifestPath)) {
    return {
      id: fallback,
      name: fallback,
      owner: "",
      deliveryDate: today(),
    };
  }

  const content = fs.readFileSync(manifestPath, "utf8");
  return {
    id: extractScalar(content, "id") || fallback,
    name: extractScalar(content, "name") || fallback,
    owner: extractScalar(content, "owner") || "",
    deliveryDate: extractScalar(content, "delivery_date") || today(),
  };
}

function extractScalar(content, key) {
  const match = content.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"));
  if (!match) {
    return null;
  }

  return stripYamlScalar(match[1]);
}

export function writeDeliveryManifest(root, manifestPath, data) {
  const content = [
    "project:",
    `  id: "${data.project.id}"`,
    `  name: "${data.project.name}"`,
    `  delivery_date: "${data.project.deliveryDate}"`,
    `  owner: "${data.project.owner}"`,
    "",
    "delivery:",
    `  package_name: "${path.basename(data.packagePath)}"`,
    '  mode: "source-only"',
    `  includes_git_history: ${data.includeGitHistory ? "true" : "false"}`,
    "  includes_agent_artifacts: false",
    "  includes_internal_logs: false",
    "",
    "included:",
    ...data.included.map((entryName) => `  - ${entryName}`),
    "",
    "excluded:",
    ...data.excluded.map((entryName) => `  - ${entryName}`),
    "",
    "archive:",
    `  created: ${data.archiveCreated ? "true" : "false"}`,
    '  location: "dist/internal-archive"',
    "  encrypted: false",
    '  retention_policy: "project-policy-dependent"',
    "",
    "validation:",
    `  unresolved_placeholders: ${data.unresolvedPlaceholders.length}`,
    `  agent_artifacts_found: ${data.agentArtifactsFound}`,
    `  internal_logs_found: ${data.internalLogsFound}`,
    `  license_files_present: ${data.licenseFilesPresent ? "true" : "false"}`,
    "",
  ].join("\n");

  writeTextFile(path.join(root, manifestPath), content);
}

export function writeTextFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${content.trimEnd()}\n`, "utf8");
}

export function formatReport(title, sections) {
  const lines = [`# ${title}`, ""];
  for (const section of sections) {
    lines.push(`## ${section.title}`, "");
    if (Array.isArray(section.body)) {
      lines.push(...(section.body.length > 0 ? section.body : ["- None"]));
    } else {
      lines.push(section.body || "None");
    }
    lines.push("");
  }
  return lines.join("\n");
}
