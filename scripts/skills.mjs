#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function printHelp() {
  console.log(`Manage project skills.

Usage:
  node scripts/skills.mjs list
  node scripts/skills.mjs search <query>
  node scripts/skills.mjs add --from-catalog <skill-id>
  node scripts/skills.mjs add --id <skill-id> --name "Skill Name" --description "What this skill does"

Options:
  --root <dir>              Project root. Default: current working directory
  --from-catalog <id>       Add a skill from skills/catalog.yaml
  --id <id>                 Skill id for manual add
  --name <name>             Skill display name
  --description <text>      Skill description
  --status <status>         Skill status. Default: active
  --help                    Show this help
`);
}

function parseArgs(argv) {
  const options = { command: null, positional: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      if (!options.command) {
        options.command = arg;
      } else {
        options.positional.push(arg);
      }
      continue;
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

function normalizeId(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function titleFromId(id) {
  return id
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function readSkillsIndex(root) {
  const indexPath = path.join(root, "skills", "skills-index.yaml");
  if (!fs.existsSync(indexPath)) {
    return { indexPath, skills: [] };
  }

  const skills = [];
  let current = null;

  for (const line of fs.readFileSync(indexPath, "utf8").split(/\r?\n/)) {
    const idMatch = line.match(/^\s*-\s+id:\s*(.+)$/);
    if (idMatch) {
      if (current) {
        skills.push(current);
      }
      current = { id: stripScalar(idMatch[1]) };
      continue;
    }

    if (!current) {
      continue;
    }

    const fieldMatch = line.match(/^\s+([A-Za-z_]+):\s*(.*)$/);
    if (fieldMatch) {
      current[fieldMatch[1]] = stripScalar(fieldMatch[2]);
    }
  }

  if (current) {
    skills.push(current);
  }

  return { indexPath, skills };
}

function writeSkillsIndex(indexPath, skills) {
  const lines = ["skills:"];
  for (const skill of skills.sort((a, b) => a.id.localeCompare(b.id))) {
    lines.push(`  - id: ${skill.id}`);
    lines.push(`    name: ${skill.name || titleFromId(skill.id)}`);
    lines.push(`    path: ${skill.path || `${skill.id}/SKILL.md`}`);
    lines.push(`    status: ${skill.status || "active"}`);
    if (skill.description) {
      lines.push(`    description: ${quoteIfNeeded(skill.description)}`);
    }
  }

  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, `${lines.join("\n")}\n`, "utf8");
}

function readCatalog(root) {
  const catalogPath = path.join(root, "skills", "catalog.yaml");
  if (!fs.existsSync(catalogPath)) {
    return { catalogPath, recommendedQueries: [], skills: [] };
  }

  const recommendedQueries = [];
  const skills = [];
  let section = null;
  let current = null;
  let inTags = false;

  for (const line of fs.readFileSync(catalogPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const sectionMatch = line.match(/^([A-Za-z_]+):/);
    if (sectionMatch) {
      section = sectionMatch[1];
      current = null;
      inTags = false;
      continue;
    }

    if (section === "recommended_queries") {
      const item = trimmed.match(/^-\s+(.+)$/);
      if (item) {
        recommendedQueries.push(stripScalar(item[1]));
      }
      continue;
    }

    if (section !== "catalog") {
      continue;
    }

    const idMatch = line.match(/^\s*-\s+id:\s*(.+)$/);
    if (idMatch) {
      if (current) {
        skills.push(current);
      }
      current = { id: stripScalar(idMatch[1]), tags: [] };
      inTags = false;
      continue;
    }

    if (!current) {
      continue;
    }

    const tagsMatch = line.match(/^\s+tags:\s*$/);
    if (tagsMatch) {
      inTags = true;
      continue;
    }

    if (inTags) {
      const tagItem = trimmed.match(/^-\s+(.+)$/);
      if (tagItem) {
        current.tags.push(stripScalar(tagItem[1]));
        continue;
      }
      inTags = false;
    }

    const fieldMatch = line.match(/^\s+([A-Za-z_]+):\s*(.*)$/);
    if (fieldMatch) {
      current[fieldMatch[1]] = stripScalar(fieldMatch[2]);
    }
  }

  if (current) {
    skills.push(current);
  }

  return { catalogPath, recommendedQueries, skills };
}

function stripScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function quoteIfNeeded(value) {
  return /[:#{}[\],&*?|\-<>=!%@`]/.test(value) ? JSON.stringify(value) : value;
}

function printSkills(skills) {
  if (skills.length === 0) {
    console.log("No skills found.");
    return;
  }

  for (const skill of skills) {
    const description = skill.description ? ` - ${skill.description}` : "";
    console.log(`${skill.id}\t${skill.name || titleFromId(skill.id)}\t${skill.status || "candidate"}${description}`);
  }
}

function searchSkills(root, queryParts) {
  const query = queryParts.join(" ").trim().toLowerCase();
  const { skills: activeSkills } = readSkillsIndex(root);
  const catalog = readCatalog(root);
  const activeIds = new Set(activeSkills.map((skill) => skill.id));
  const candidates = [
    ...activeSkills.map((skill) => ({ ...skill, source: "active" })),
    ...catalog.skills
      .filter((skill) => !activeIds.has(skill.id))
      .map((skill) => ({ ...skill, source: "catalog", status: "candidate" })),
  ];

  if (!query) {
    console.log("Recommended queries:");
    for (const item of catalog.recommendedQueries) {
      console.log(`- ${item}`);
    }
    console.log("");
    printSkills(candidates);
    return;
  }

  const words = query.split(/\s+/).filter(Boolean);
  const matches = candidates.filter((skill) => {
    const haystack = [
      skill.id,
      skill.name,
      skill.description,
      ...(skill.tags ?? []),
      skill.source,
    ].filter(Boolean).join(" ").toLowerCase();
    return words.every((word) => haystack.includes(word));
  });

  printSkills(matches);
}

function addSkill(root, options) {
  const { indexPath, skills } = readSkillsIndex(root);
  const catalog = readCatalog(root);
  const catalogSkill = options.fromCatalog
    ? catalog.skills.find((skill) => skill.id === options.fromCatalog)
    : null;

  if (options.fromCatalog && !catalogSkill) {
    throw new Error(`Skill not found in catalog: ${options.fromCatalog}`);
  }

  const id = normalizeId(options.id || catalogSkill?.id || "");
  if (!id) {
    throw new Error("Skill id is required. Use --id or --from-catalog.");
  }

  const existing = skills.find((skill) => skill.id === id);
  if (existing) {
    console.log(`Skill already active: ${id}`);
    return;
  }

  const skill = {
    id,
    name: options.name || catalogSkill?.name || titleFromId(id),
    description: options.description || catalogSkill?.description || "Project-specific skill.",
    path: catalogSkill?.path || `${id}/SKILL.md`,
    status: options.status || catalogSkill?.status || "active",
  };

  scaffoldSkill(root, skill);
  skills.push(skill);
  writeSkillsIndex(indexPath, skills);
  appendSelectedSkill(root, skill);
  console.log(`Skill added: ${id}`);
}

function scaffoldSkill(root, skill) {
  const skillPath = resolveSkillPath(root, skill.path || `${skill.id}/SKILL.md`);
  const skillDir = path.dirname(skillPath);
  const metadataPath = path.join(skillDir, "skill.yaml");

  fs.mkdirSync(skillDir, { recursive: true });

  if (!fs.existsSync(skillPath)) {
    fs.writeFileSync(skillPath, `# Skill: ${skill.name}

## 목적

${skill.description}

## 입력

- 작업 요청
- 관련 프로젝트 문서
- 필요한 경우 source documents 또는 references

## 절차

1. 작업 목표와 완료 기준을 확인한다.
2. 관련 문서와 기존 구현을 검토한다.
3. 필요한 산출물을 만들고 검증한다.
4. 실행한 명령과 결과를 harness 또는 run log에 기록한다.

## 출력

- 작업 결과 요약
- 변경 파일 또는 산출물
- 검증 결과
- 남은 질문 또는 리스크
`, "utf8");
  }

  if (!fs.existsSync(metadataPath)) {
    fs.writeFileSync(metadataPath, `id: ${skill.id}
name: ${skill.name}
description: ${quoteIfNeeded(skill.description)}
status: ${skill.status}
`, "utf8");
  }
}

function resolveSkillPath(root, relativeSkillPath) {
  const skillsRoot = path.resolve(root, "skills");
  const target = path.resolve(skillsRoot, ...relativeSkillPath.split("/"));
  if (target !== skillsRoot && !target.startsWith(`${skillsRoot}${path.sep}`)) {
    throw new Error(`Skill path must stay under skills/: ${relativeSkillPath}`);
  }
  return target;
}

function appendSelectedSkill(root, skill) {
  const selectedPath = path.join(root, "skills", "selected-skills.md");
  if (!fs.existsSync(selectedPath)) {
    fs.writeFileSync(selectedPath, "# Selected Skills\n\n초기화 또는 작업 중 추가로 활성화한 Skill을 기록한다.\n\n", "utf8");
  }

  fs.appendFileSync(selectedPath, `- ${skill.id}: ${skill.name} - ${skill.description}\n`, "utf8");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.command || options.help) {
    printHelp();
    return;
  }

  const root = path.resolve(options.root || process.cwd());

  if (options.command === "list") {
    printSkills(readSkillsIndex(root).skills);
    return;
  }

  if (options.command === "search") {
    searchSkills(root, options.positional);
    return;
  }

  if (options.command === "add") {
    addSkill(root, options);
    return;
  }

  throw new Error(`Unknown command: ${options.command}`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
