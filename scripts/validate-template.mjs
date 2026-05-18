#!/usr/bin/env node

import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const requiredTemplateFiles = [
  "README.md",
  "README.en.md",
  "AGENTS.md",
  "INIT.md",
  "manifest.yaml",
  "template.yaml",
  "validation-checklist.md",
  "harness/harness.yaml",
  "harness/commands.md",
  "harness/verification-matrix.md",
  "harness/evidence-log.md",
  "skills/skills-index.yaml",
  "skills/skills-sh-recommendations.yaml",
  "skills/selected-skills.md",
  "delivery/sanitize-policy.yaml",
  "delivery/delivery-manifest.yaml",
  "delivery/delivery-checklist.md",
  "delivery/archive-checklist.md",
  "delivery/purge-checklist.md",
  ".deliveryignore",
  ".agentignore",
];

const requiredRootFiles = [
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CHANGELOG.md",
  "docs/roadmap.md",
  "docs/template-authoring-guide.md",
];

const requiredEnglishCompanionFiles = [
  ["README.md", "README.en.md"],
  ["decision-guide.md", "decision-guide.en.md"],
  ["template-usage-guide.md", "template-usage-guide.en.md"],
  ["scripts/README.md", "scripts/README.en.md"],
  ["common/README.md", "common/README.en.md"],
  ["docs/localization.md", "docs/localization.en.md"],
  ["common/delivery/README.md", "common/delivery/README.en.md"],
  ["common/delivery/delivery-sanitization-guide.md", "common/delivery/delivery-sanitization-guide.en.md"],
];

const requiredManifestSections = {
  lifecycle: [
    "status",
    "allowed_statuses",
  ],
  delivery: [
    "sanitization_required",
    "policy",
    "manifest",
    "exclude_file",
    "agent_ignore_file",
    "package_output",
    "archive_output",
  ],
};

const allowedTemplateVariables = new Set([
  "OWNER_NAME",
  "PROJECT_ID",
  "PROJECT_NAME",
  "PROJECT_STATUS",
  "PROJECT_TYPE",
  "YYYY-MM-DD",
]);

const textExtensions = new Set([
  ".md",
  ".txt",
  ".yaml",
  ".yml",
  ".template",
]);

const placeholderPattern = /\{\{([A-Za-z0-9_-]+)\}\}/g;

function getRepoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function reportError(errors, filePath, message) {
  errors.push({ filePath: toPosix(filePath), message });
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath));
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

function findFirstColonOutsideQuotes(text) {
  let quote = null;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = index > 0 ? text[index - 1] : "";

    if ((char === '"' || char === "'") && previous !== "\\") {
      quote = quote === char ? null : quote ?? char;
      continue;
    }

    if (char === ":" && quote === null) {
      return index;
    }
  }

  return -1;
}

function hasBalancedQuotes(text) {
  let singleQuotes = 0;
  let doubleQuotes = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const previous = index > 0 ? text[index - 1] : "";

    if (char === "'" && previous !== "\\") {
      singleQuotes += 1;
    } else if (char === '"' && previous !== "\\") {
      doubleQuotes += 1;
    }
  }

  return singleQuotes % 2 === 0 && doubleQuotes % 2 === 0;
}

function validateBasicYaml(filePath, root, errors) {
  const relativePath = path.relative(root, filePath);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  let blockScalarIndent = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    if (/^\s*\t/.test(line)) {
      reportError(errors, relativePath, `YAML line ${lineNumber} uses a tab for indentation.`);
      return;
    }

    const indent = line.match(/^\s*/)[0].length;
    if (blockScalarIndent !== null) {
      if (indent > blockScalarIndent) {
        return;
      }

      blockScalarIndent = null;
    }

    if (trimmed === "---" || trimmed === "...") {
      return;
    }

    let valueToInspect = trimmed;
    if (trimmed.startsWith("- ")) {
      valueToInspect = trimmed.slice(2).trim();
      if (!valueToInspect) {
        return;
      }
    }

    const colonIndex = findFirstColonOutsideQuotes(valueToInspect);
    if (colonIndex === -1) {
      return;
    }

    const key = valueToInspect.slice(0, colonIndex).trim();
    const value = valueToInspect.slice(colonIndex + 1).trim();

    if (!key) {
      reportError(errors, relativePath, `YAML line ${lineNumber} has an empty mapping key.`);
      return;
    }

    if (!/^[A-Za-z0-9_. -]+$/.test(key)) {
      reportError(errors, relativePath, `YAML line ${lineNumber} has an unsupported mapping key '${key}'.`);
      return;
    }

    if (!hasBalancedQuotes(value)) {
      reportError(errors, relativePath, `YAML line ${lineNumber} has unbalanced quotes.`);
    }

    if (value === "|" || value === "|-" || value === "|+" || value === ">" || value === ">-" || value === ">+") {
      blockScalarIndent = indent;
    }
  });
}

function parseTemplatesIndex(indexPath, root, errors) {
  const relativePath = path.relative(root, indexPath);
  const content = fs.readFileSync(indexPath, "utf8");
  const templates = [];
  let current = null;

  content.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const idMatch = line.match(/^\s*-\s+id:\s*(.+)$/);
    if (idMatch) {
      if (current) {
        templates.push(current);
      }

      current = { id: stripQuotes(idMatch[1]), lineNumber };
      return;
    }

    if (!current) {
      return;
    }

    const fieldMatch = line.match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
    if (!fieldMatch) {
      return;
    }

    const [, key, rawValue] = fieldMatch;
    if (rawValue.trim()) {
      current[key] = stripQuotes(rawValue);
    }
  });

  if (current) {
    templates.push(current);
  }

  for (const template of templates) {
    if (!template.id) {
      reportError(errors, relativePath, `Template entry at line ${template.lineNumber} is missing id.`);
    }
    if (!template.path) {
      reportError(errors, relativePath, `Template '${template.id ?? "(unknown)"}' is missing path.`);
    }
  }

  const seen = new Set();
  for (const template of templates) {
    if (!template.id) {
      continue;
    }

    if (seen.has(template.id)) {
      reportError(errors, relativePath, `Duplicate template id '${template.id}'.`);
    }
    seen.add(template.id);
  }

  return templates;
}

function extractTopLevelScalar(filePath, key) {
  const content = fs.readFileSync(filePath, "utf8");
  const pattern = new RegExp(`^${key}:\\s*(.+)$`, "m");
  const match = content.match(pattern);
  return match ? stripQuotes(match[1]) : null;
}

function extractNestedScalar(filePath, parentKey, childKey) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  let parentIndent = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const indent = line.match(/^\s*/)[0].length;
    if (parentIndent !== null && indent <= parentIndent) {
      parentIndent = null;
    }

    if (parentIndent === null) {
      if (new RegExp(`^${parentKey}:\\s*$`).test(trimmed)) {
        parentIndent = indent;
      }
      continue;
    }

    const childMatch = trimmed.match(new RegExp(`^${childKey}:\\s*(.+)$`));
    if (childMatch) {
      return stripQuotes(childMatch[1]);
    }
  }

  return null;
}

function validateIndexAgainstDirectories(root, templates, errors) {
  const templatesRoot = path.join(root, "templates");
  const directoryIds = fs
    .readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const indexIds = templates.map((template) => template.id).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const indexIdSet = new Set(indexIds);
  const directoryIdSet = new Set(directoryIds);

  for (const id of indexIds) {
    if (!directoryIdSet.has(id)) {
      reportError(errors, "templates-index.yaml", `Template id '${id}' is registered but templates/${id} does not exist.`);
    }
  }

  for (const id of directoryIds) {
    if (!indexIdSet.has(id)) {
      reportError(errors, "templates-index.yaml", `templates/${id} exists but is not registered.`);
    }
  }
}

function validateCreateProjectList(root, templates, errors) {
  const output = childProcess.execFileSync(process.execPath, ["scripts/create-project.mjs", "--list"], {
    cwd: root,
    encoding: "utf8",
  });
  const listRows = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const listedIds = listRows.map((line) => line.split(/\s+/)[0]).sort((a, b) => a.localeCompare(b));
  const indexIds = templates.map((template) => template.id).filter(Boolean).sort((a, b) => a.localeCompare(b));

  if (listedIds.join("\n") !== indexIds.join("\n")) {
    reportError(
      errors,
      "scripts/create-project.mjs",
      `--list output does not match templates-index.yaml. listed=[${listedIds.join(", ")}], indexed=[${indexIds.join(", ")}]`,
    );
  }

  for (const row of listRows) {
    if (!/^\S+\s{2,}\S+/.test(row)) {
      reportError(errors, "scripts/create-project.mjs", `--list row is missing a template summary: ${row}`);
    }
  }
}

function validateGeneratorSnapshotHarness(root, errors) {
  const requiredFiles = [
    "package.json",
    "tests/generator.test.mjs",
    "tests/snapshots/production-agent-system-file-list.txt",
    "examples/generated-production-agent-system/README.md",
  ];

  for (const requiredFile of requiredFiles) {
    if (!fs.existsSync(path.join(root, requiredFile))) {
      reportError(errors, requiredFile, "Generator snapshot harness file is missing.");
    }
  }

  const packageJsonPath = path.join(root, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (packageJson.scripts?.["test:generator"] !== "node --test tests/generator.test.mjs") {
        reportError(errors, "package.json", "scripts.test:generator must run node --test tests/generator.test.mjs.");
      }
    } catch (error) {
      reportError(errors, "package.json", `package.json is not valid JSON: ${error.message}`);
    }
  }

  const snapshotPath = path.join(root, "tests/snapshots/production-agent-system-file-list.txt");
  if (fs.existsSync(snapshotPath) && !fs.readFileSync(snapshotPath, "utf8").trim()) {
    reportError(errors, "tests/snapshots/production-agent-system-file-list.txt", "Generator snapshot is empty.");
  }
}

function validateEnglishCompanionDocs(root, errors) {
  for (const [sourceFile, companionFile] of requiredEnglishCompanionFiles) {
    const sourcePath = path.join(root, sourceFile);
    const companionPath = path.join(root, companionFile);

    if (!fs.existsSync(sourcePath)) {
      reportError(errors, sourceFile, "Required Korean source document is missing.");
    }

    if (!fs.existsSync(companionPath)) {
      reportError(errors, companionFile, `Required English companion for ${sourceFile} is missing.`);
    }
  }
}

function validateRootFiles(root, errors) {
  for (const requiredFile of requiredRootFiles) {
    if (!fs.existsSync(path.join(root, requiredFile))) {
      reportError(errors, requiredFile, "Required repository file is missing.");
    }
  }
}

function validateRequiredFiles(root, template, errors) {
  const templatePath = path.join(root, template.path ?? `templates/${template.id}`);
  const templateRelativePath = path.relative(root, templatePath);

  if (!fs.existsSync(templatePath)) {
    reportError(errors, "templates-index.yaml", `Template '${template.id}' path does not exist: ${toPosix(template.path ?? "")}`);
    return;
  }

  for (const requiredFile of requiredTemplateFiles) {
    const fullPath = path.join(templatePath, requiredFile);
    if (!fs.existsSync(fullPath)) {
      reportError(errors, path.join(templateRelativePath, requiredFile), "Required template file is missing.");
    }
  }
}

function validateTemplateIds(root, template, errors) {
  const templatePath = path.join(root, template.path ?? `templates/${template.id}`);
  const manifestPath = path.join(templatePath, "manifest.yaml");
  const templateYamlPath = path.join(templatePath, "template.yaml");

  if (!fs.existsSync(manifestPath) || !fs.existsSync(templateYamlPath)) {
    return;
  }

  const manifestTemplateId = extractNestedScalar(manifestPath, "template", "id");
  const templateYamlId = extractTopLevelScalar(templateYamlPath, "id");

  if (!manifestTemplateId) {
    reportError(errors, path.relative(root, manifestPath), "manifest.yaml is missing template.id.");
  }

  if (!templateYamlId) {
    reportError(errors, path.relative(root, templateYamlPath), "template.yaml is missing top-level id.");
  }

  if (manifestTemplateId && templateYamlId && manifestTemplateId !== templateYamlId) {
    reportError(
      errors,
      path.relative(root, manifestPath),
      `manifest.yaml template.id '${manifestTemplateId}' does not match template.yaml id '${templateYamlId}'.`,
    );
  }

  if (template.id && templateYamlId && template.id !== templateYamlId) {
    reportError(
      errors,
      path.relative(root, templateYamlPath),
      `template.yaml id '${templateYamlId}' does not match templates-index.yaml id '${template.id}'.`,
    );
  }
}

function hasNestedKey(filePath, parentKey, childKey) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  let parentIndent = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const indent = line.match(/^\s*/)[0].length;
    if (parentIndent !== null && indent <= parentIndent) {
      parentIndent = null;
    }

    if (parentIndent === null) {
      if (new RegExp(`^${parentKey}:\\s*(.*)$`).test(trimmed)) {
        parentIndent = indent;
      }
      continue;
    }

    if (new RegExp(`^${childKey}:\\s*(.*)$`).test(trimmed)) {
      return true;
    }
  }

  return false;
}

function validateManifestDeliveryConfig(root, template, errors) {
  const templatePath = path.join(root, template.path ?? `templates/${template.id}`);
  const manifestPath = path.join(templatePath, "manifest.yaml");
  if (!fs.existsSync(manifestPath)) {
    return;
  }

  for (const [section, keys] of Object.entries(requiredManifestSections)) {
    for (const key of keys) {
      if (!hasNestedKey(manifestPath, section, key)) {
        reportError(
          errors,
          path.relative(root, manifestPath),
          `manifest.yaml is missing ${section}.${key}.`,
        );
      }
    }
  }
}

function validatePlaceholders(root, template, errors) {
  const templatePath = path.join(root, template.path ?? `templates/${template.id}`);
  if (!fs.existsSync(templatePath)) {
    return;
  }

  for (const filePath of walkFiles(templatePath)) {
    if (!isTextFile(filePath)) {
      continue;
    }

    const relativePath = path.relative(root, filePath);
    const content = fs.readFileSync(filePath, "utf8");
    const unknownVariables = new Set();
    let match = placeholderPattern.exec(content);

    while (match) {
      const variableName = match[1];
      if (!allowedTemplateVariables.has(variableName)) {
        unknownVariables.add(variableName);
      }
      match = placeholderPattern.exec(content);
    }

    if (unknownVariables.size > 0) {
      reportError(
        errors,
        relativePath,
        `Unrecognized template placeholder(s): ${[...unknownVariables].sort().join(", ")}.`,
      );
    }
  }
}

function validateYamlFiles(root, template, errors) {
  const templatePath = path.join(root, template.path ?? `templates/${template.id}`);
  if (!fs.existsSync(templatePath)) {
    return 0;
  }

  const yamlFiles = walkFiles(templatePath).filter((filePath) => [".yaml", ".yml"].includes(path.extname(filePath)));
  for (const yamlFile of yamlFiles) {
    validateBasicYaml(yamlFile, root, errors);
  }

  return yamlFiles.length;
}

function main() {
  const root = getRepoRoot();
  const errors = [];
  const indexPath = path.join(root, "templates-index.yaml");

  if (!fs.existsSync(indexPath)) {
    reportError(errors, "templates-index.yaml", "templates-index.yaml is missing.");
    return { root, errors, templates: [], yamlFileCount: 0 };
  }

  validateBasicYaml(indexPath, root, errors);
  const templates = parseTemplatesIndex(indexPath, root, errors);

  validateIndexAgainstDirectories(root, templates, errors);
  validateCreateProjectList(root, templates, errors);
  validateGeneratorSnapshotHarness(root, errors);
  validateEnglishCompanionDocs(root, errors);
  validateRootFiles(root, errors);

  let yamlFileCount = 1;
  for (const template of templates) {
    validateRequiredFiles(root, template, errors);
    validateTemplateIds(root, template, errors);
    validateManifestDeliveryConfig(root, template, errors);
    validatePlaceholders(root, template, errors);
    yamlFileCount += validateYamlFiles(root, template, errors);
  }

  return { root, errors, templates, yamlFileCount };
}

const { errors, templates, yamlFileCount } = main();

if (errors.length > 0) {
  console.error("Template validation failed:");
  for (const error of errors) {
    console.error(`- ${error.filePath}: ${error.message}`);
  }
  process.exitCode = 1;
} else {
  console.log("Template validation passed.");
  console.log(`Templates checked: ${templates.length}`);
  console.log(`YAML files checked: ${yamlFileCount}`);
}
