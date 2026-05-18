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
    assert.match(text, /recommended_sources:/);
    assert.match(text, /install_command: "npx skills add [^"]+"/);
    assert.doesNotMatch(text, /scripts\/skills\.sh/);
    assert.doesNotMatch(text, /scripts\/skills\.mjs/);
  });
}
