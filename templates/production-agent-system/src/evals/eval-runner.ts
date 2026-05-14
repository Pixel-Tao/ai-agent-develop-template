import { createInMemoryMetrics, type Metrics } from "../observability/metrics.js";
import { runAgent } from "../agent/runner.js";
import { createRunContext } from "../runtime/run-context.js";
import { loadDatasets } from "./dataset-loader.js";
import { scoreEvalCase } from "./scorers.js";
import { writeEvalReport } from "./report-writer.js";
import type { EvalCaseResult, EvalDataset, EvalReport } from "./types.js";

export type EvalRunOptions = {
  dataset: string;
  writeReport?: boolean;
  metrics?: Metrics;
};

export async function runEvalSuites(options: EvalRunOptions): Promise<EvalReport[]> {
  const datasets = await loadDatasets(options.dataset);
  const reports: EvalReport[] = [];
  const metrics = options.metrics ?? createInMemoryMetrics();

  for (const dataset of datasets) {
    const report = await runEvalDataset(dataset, { metrics });
    reports.push(report);
    if (options.writeReport !== false) {
      await writeEvalReport(report);
    }
  }

  return reports;
}

export async function runEvalDataset(dataset: EvalDataset, options: { metrics?: Metrics } = {}): Promise<EvalReport> {
  const results: EvalCaseResult[] = [];
  const metrics = options.metrics ?? createInMemoryMetrics();

  for (const evalCase of dataset.cases) {
    const context = createRunContext({
      userId: "eval-user",
      threadId: `eval-${evalCase.id}`,
      projectId: "eval-project",
    });
    const runResult = await runAgent({ message: evalCase.input }, context);
    const output = runResult.status === "completed" ? runResult.output : runResult.error.message;
    const toolCalls = runResult.status === "completed"
      ? runResult.toolCalls.map((toolCall) => {
          if (typeof toolCall === "object" && toolCall !== null && "name" in toolCall) {
            return String((toolCall as { name: unknown }).name);
          }
          return String(toolCall);
        })
      : [];
    const scored = scoreEvalCase({ evalCase, output, toolCalls });
    const passed = scored.score >= evalCase.threshold.score;
    metrics.gauge("eval_case_score", scored.score, {
      dataset: dataset.name,
      case_id: evalCase.id,
      category: evalCase.category,
    });

    results.push({
      id: evalCase.id,
      category: evalCase.category,
      input: evalCase.input,
      output,
      score: scored.score,
      passed,
      threshold: evalCase.threshold.score,
      toolCalls,
      scorerBreakdown: scored.breakdown,
      failureReasons: passed ? [] : [`score ${scored.score.toFixed(3)} below threshold ${evalCase.threshold.score}`],
    });
  }

  const score = results.reduce((sum, result) => sum + result.score, 0) / Math.max(results.length, 1);
  const threshold = Math.min(...results.map((result) => result.threshold));
  const passed = results.every((result) => result.passed);
  metrics.gauge("eval_suite_pass_rate", passed ? 1 : 0, {
    dataset: dataset.name,
  });

  return {
    dataset: dataset.name,
    generatedAt: new Date().toISOString(),
    score,
    passed,
    threshold,
    results,
  };
}

function parseArgs(argv: string[]): EvalRunOptions {
  const datasetIndex = argv.indexOf("--dataset");
  return {
    dataset: datasetIndex >= 0 ? argv[datasetIndex + 1] ?? "smoke" : "smoke",
    writeReport: true,
  };
}

if (process.argv[1]?.endsWith("eval-runner.js")) {
  const reports = await runEvalSuites(parseArgs(process.argv.slice(2)));
  for (const report of reports) {
    console.log(`${report.dataset}: ${report.passed ? "pass" : "fail"} score=${report.score.toFixed(3)}`);
  }
  if (reports.some((report) => !report.passed)) {
    process.exitCode = 1;
  }
}
