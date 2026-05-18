import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(repoRoot, "templates");
const templateIds = fs.readdirSync(templatesRoot)
  .filter((name) => fs.statSync(path.join(templatesRoot, name)).isDirectory())
  .sort();

for (const templateId of templateIds) {
  test(`${templateId} includes skills.sh discovery recommendations`, () => {
    const file = path.join(templatesRoot, templateId, "skills", "skills-sh-recommendations.yaml");
    assert.ok(fs.existsSync(file), `${templateId} is missing skills-sh-recommendations.yaml`);

    const text = fs.readFileSync(file, "utf8");
    assert.match(text, /source: "https:\/\/www\.skills\.sh\/"/);
    assert.match(text, /default_command: "npx skills add <owner\/repo>"/);
    assert.match(text, /stack_detection:/);
    assert.match(text, /required: true/);
    assert.match(text, /evidence_files:/);
    assert.match(text, /query_sets:/);
    assert.match(text, /nodejs:/);
    assert.match(text, /dotnet:/);
    assert.match(text, /python:/);
    assert.match(text, /infra:/);
    assert.match(text, /"package\.json"/);
    assert.match(text, /"\*\.csproj"/);
    assert.match(text, /"pyproject\.toml"/);
    assert.match(text, /npx skills find <query>/);
    assert.match(text, /no_match:/);
    assert.match(text, /recommended_sources:/);
    assert.match(text, /install_command: "npx skills add [^"]+"/);
    assert.doesNotMatch(text, /scripts\/skills\.sh/);
    assert.doesNotMatch(text, /scripts\/skills\.mjs/);

    const initPath = path.join(templatesRoot, templateId, "INIT.md");
    const init = fs.readFileSync(initPath, "utf8");
    assert.match(init, /stack-specific Skill/);
    assert.match(init, /package\.json/);
    assert.match(init, /\.csproj/);
    assert.match(init, /npx skills find "nodejs typescript"/);
    assert.match(init, /검토했지만 적용하지 않음/);
    assert.match(init, /기술 스택별 Skill 후보를 검색하고 적용\/제외 사유가 기록되어 있다/);

    const selectedPath = path.join(templatesRoot, templateId, "skills", "selected-skills.md");
    assert.ok(fs.existsSync(selectedPath), `${templateId} is missing selected-skills.md`);
  });
}
