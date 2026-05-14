import fs from "node:fs";
import path from "node:path";
import type { EvalReport } from "./types.js";

export type ReportWriterOptions = {
  reportsDir?: string;
};

export async function writeEvalReport(report: EvalReport, options: ReportWriterOptions = {}): Promise<string[]> {
  const reportsDir = options.reportsDir ?? path.join(process.cwd(), "evals", "reports");
  await fs.promises.mkdir(reportsDir, { recursive: true });

  const baseName = `${report.dataset}-latest`;
  const jsonPath = path.join(reportsDir, `${baseName}.json`);
  const markdownPath = path.join(reportsDir, `${baseName}.md`);

  await fs.promises.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");
  await fs.promises.writeFile(markdownPath, renderMarkdownReport(report), "utf8");

  return [jsonPath, markdownPath];
}

function renderMarkdownReport(report: EvalReport): string {
  const lines = [
    `# Eval Report: ${report.dataset}`,
    "",
    `- Generated: ${report.generatedAt}`,
    `- Score: ${report.score.toFixed(3)}`,
    `- Threshold: ${report.threshold.toFixed(3)}`,
    `- Passed: ${report.passed ? "yes" : "no"}`,
    "",
    "| Case | Category | Score | Passed | Failures |",
    "|---|---|---:|---|---|",
  ];

  for (const result of report.results) {
    lines.push(
      `| ${result.id} | ${result.category} | ${result.score.toFixed(3)} | ${result.passed ? "yes" : "no"} | ${result.failureReasons.join("; ")} |`,
    );
  }

  return `${lines.join("\n")}\n`;
}
