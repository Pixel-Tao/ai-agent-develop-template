#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const placeholderPattern = /\{\{([A-Za-z0-9_-]+)\}\}/g;
const defaultIncludes = ["*.md", "*.yaml", "*.yml", "*.template", "*.gitkeep", "gitignore.template"];
const defaultExcludeDirs = [".git", "node_modules", ".venv", "venv", "dist", "build", "coverage"];

function printHelp() {
  console.log(`Replace {{VARIABLE}} placeholders in copied template files.

Usage:
  node scripts/replace-template-variables.mjs --root . --variables-file scripts/template-variables.example.yaml
  node scripts/replace-template-variables.mjs --root . --variables-file ./my-project.variables.yaml --apply
  node scripts/replace-template-variables.mjs --root . --set PROJECT_NAME=my-project --set PROJECT_STATUS=active --apply

Options:
  --root, -r <path>             Root directory to scan. Default: .
  --variables-file, -f <path>   Flat YAML file with KEY: value pairs.
  --set <KEY=VALUE>             Override or provide a variable. Can be repeated.
  --apply                       Write changes. Without this, the script runs in Dry Run mode.
  --dry-run                     Explicit Dry Run mode.
  --backup                      Write .bak files before changing files. Requires --apply.
  --fail-on-unresolved          Exit with an error if placeholders remain unresolved.
  --include <patterns>          Comma-separated file name patterns. Can be repeated.
  --exclude-dir <names>         Comma-separated directory names to skip. Can be repeated.
  --help, -h                    Show this help.
`);
}

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const options = {
    root: ".",
    variablesFile: null,
    set: [],
    apply: false,
    dryRun: false,
    backup: false,
    failOnUnresolved: false,
    includes: [...defaultIncludes],
    excludeDirs: [...defaultExcludeDirs],
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
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--root":
      case "-r":
        options.root = next();
        break;
      case "--variables-file":
      case "-f":
        options.variablesFile = next();
        break;
      case "--set":
        options.set.push(next());
        break;
      case "--apply":
        options.apply = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--backup":
        options.backup = true;
        break;
      case "--fail-on-unresolved":
        options.failOnUnresolved = true;
        break;
      case "--include":
        options.includes.push(...splitList(next()));
        break;
      case "--exclude-dir":
        options.excludeDirs.push(...splitList(next()));
        break;
      default:
        if (arg.startsWith("--set=")) {
          options.set.push(arg.slice("--set=".length));
        } else if (arg.startsWith("--root=")) {
          options.root = arg.slice("--root=".length);
        } else if (arg.startsWith("--variables-file=")) {
          options.variablesFile = arg.slice("--variables-file=".length);
        } else if (arg.startsWith("--include=")) {
          options.includes.push(...splitList(arg.slice("--include=".length)));
        } else if (arg.startsWith("--exclude-dir=")) {
          options.excludeDirs.push(...splitList(arg.slice("--exclude-dir=".length)));
        } else {
          throw new Error(`Unknown argument: ${arg}`);
        }
    }
  }

  if (options.apply && options.dryRun) {
    throw new Error("Use either --dry-run or --apply, not both.");
  }

  return options;
}

function normalizeVariableName(name) {
  let key = String(name).trim();
  if (key.startsWith("{{") && key.endsWith("}}")) {
    key = key.slice(2, -2).trim();
  }
  if (!/^[A-Za-z0-9_-]+$/.test(key)) {
    throw new Error(`Invalid variable name '${name}'. Use letters, numbers, underscore, or hyphen.`);
  }
  return key;
}

function unquoteScalar(value) {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"');
  }
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
}

function loadVariablesFile(filePath, variables) {
  const resolved = path.resolve(filePath);
  const lines = fs.readFileSync(resolved, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const match = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/);
    if (!match) {
      throw new Error(`${resolved}:${index + 1}: unsupported syntax. Use flat 'KEY: value' pairs.`);
    }

    variables.set(normalizeVariableName(match[1]), unquoteScalar(match[2]));
  });
}

function loadSetArguments(items, variables) {
  for (const item of items) {
    const index = item.indexOf("=");
    if (index <= 0) {
      throw new Error(`Invalid --set value '${item}'. Use KEY=VALUE.`);
    }
    variables.set(normalizeVariableName(item.slice(0, index)), item.slice(index + 1));
  }
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*").replace(/\?/g, ".")}$`);
}

function shouldIncludeFile(filePath, includeRegexes) {
  const name = path.basename(filePath);
  return includeRegexes.some((regex) => regex.test(name));
}

function shouldExcludeDir(dirPath, root, excludeDirs) {
  const relative = path.relative(root, dirPath);
  if (!relative) {
    return false;
  }
  return relative.split(path.sep).some((part) => excludeDirs.has(part));
}

function walkFiles(root, includeRegexes, excludeDirs) {
  const files = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!shouldExcludeDir(fullPath, root, excludeDirs)) {
          walk(fullPath);
        }
        continue;
      }
      if (entry.isFile() && shouldIncludeFile(fullPath, includeRegexes)) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

function formatList(items) {
  if (!items || items.length === 0) {
    return "-";
  }
  return [...new Set(items)].sort().join(", ");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const variables = new Map();
  if (options.variablesFile) {
    loadVariablesFile(options.variablesFile, variables);
  }
  loadSetArguments(options.set, variables);

  if (variables.size === 0) {
    throw new Error("No variables provided. Use --variables-file or --set KEY=VALUE.");
  }

  const root = path.resolve(options.root);
  const isDryRun = !options.apply;
  const includeRegexes = [...new Set(options.includes)].map(wildcardToRegExp);
  const excludeDirs = new Set(options.excludeDirs);
  const files = walkFiles(root, includeRegexes, excludeDirs);
  const rows = [];
  const unresolved = new Map();
  let changedFiles = 0;

  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");
    const usedKeys = new Set();
    const missingKeys = new Set();

    const updated = original.replace(placeholderPattern, (fullMatch, key) => {
      if (variables.has(key)) {
        usedKeys.add(key);
        return variables.get(key);
      }
      missingKeys.add(key);
      return fullMatch;
    });

    const relative = path.relative(root, file);
    if (missingKeys.size > 0) {
      unresolved.set(relative, [...missingKeys]);
    }

    if (updated !== original) {
      changedFiles += 1;
      rows.push({ file: relative, variables: [...usedKeys] });

      if (!isDryRun) {
        if (options.backup) {
          fs.writeFileSync(`${file}.bak`, original, "utf8");
        }
        fs.writeFileSync(file, updated, "utf8");
      }
    }
  }

  for (const row of rows.sort((a, b) => a.file.localeCompare(b.file))) {
    console.log(`${row.file}: ${formatList(row.variables)}`);
  }

  if (unresolved.size > 0) {
    console.log("");
    console.log("Unresolved placeholders:");
    for (const [file, keys] of [...unresolved.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      console.log(`- ${file}: ${formatList(keys)}`);
    }
  }

  console.log("");
  console.log(`Mode: ${isDryRun ? "DryRun" : "Write"}`);
  console.log(`Root: ${root}`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Files changed: ${changedFiles}`);
  console.log(`Variable keys loaded: ${variables.size}`);

  if (options.failOnUnresolved && unresolved.size > 0) {
    throw new Error("Unresolved placeholders remain. Provide more variables or remove --fail-on-unresolved.");
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
