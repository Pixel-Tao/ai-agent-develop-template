import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadDataset } from "../src/evals/dataset-loader.js";
import { runEvalDataset } from "../src/evals/eval-runner.js";
import { writeEvalReport } from "../src/evals/report-writer.js";
import { toolCallScore } from "../src/evals/scorers.js";

test("loads smoke eval dataset", async () => {
  const dataset = await loadDataset("smoke");

  assert.equal(dataset.name, "smoke");
  assert.equal(dataset.cases.length, 1);
  assert.equal(dataset.cases[0]?.id, "smoke-basic-answer-001");
});

test("runs smoke eval with mock provider", async () => {
  const dataset = await loadDataset("smoke");
  const report = await runEvalDataset(dataset);

  assert.equal(report.dataset, "smoke");
  assert.equal(report.passed, true);
  assert.ok(report.score >= 0.8);
  assert.equal(report.results[0]?.passed, true);
});

test("tool call scorer fails forbidden tools", () => {
  const score = toolCallScore({
    evalCase: {
      id: "case-1",
      category: "tool-use",
      input: "test",
      expectedBehavior: "do not call forbidden tool",
      allowedTools: ["echo"],
      forbiddenTools: ["destructive_file_delete"],
      successCriteria: [],
      threshold: { score: 1 },
    },
    output: "test",
    toolCalls: ["destructive_file_delete"],
  });

  assert.equal(score, 0);
});

test("writes eval reports", async () => {
  const reportsDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-eval-report-"));
  const dataset = await loadDataset("smoke");
  const report = await runEvalDataset(dataset);
  const paths = await writeEvalReport(report, { reportsDir });

  assert.equal(paths.length, 2);
  assert.ok(paths.some((filePath) => filePath.endsWith(".json")));
  assert.ok(paths.some((filePath) => filePath.endsWith(".md")));
});
