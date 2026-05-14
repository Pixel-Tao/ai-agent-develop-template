import fs from "node:fs";
import path from "node:path";
import type { EvalCase, EvalDataset } from "./types.js";

export type DatasetLoadOptions = {
  datasetsDir?: string;
};

export async function loadDataset(name: string, options: DatasetLoadOptions = {}): Promise<EvalDataset> {
  const datasetsDir = options.datasetsDir ?? path.join(process.cwd(), "evals", "datasets");
  const filePath = path.join(datasetsDir, `${name}.yaml`);
  const content = await fs.promises.readFile(filePath, "utf8");
  return {
    name,
    cases: parseEvalDataset(content),
  };
}

export async function loadDatasets(name: string, options: DatasetLoadOptions = {}): Promise<EvalDataset[]> {
  if (name !== "all") {
    return [await loadDataset(name, options)];
  }

  const datasetsDir = options.datasetsDir ?? path.join(process.cwd(), "evals", "datasets");
  const files = (await fs.promises.readdir(datasetsDir))
    .filter((file) => file.endsWith(".yaml"))
    .sort((a, b) => a.localeCompare(b));

  return Promise.all(files.map((file) => loadDataset(path.basename(file, ".yaml"), options)));
}

export function parseEvalDataset(content: string): EvalCase[] {
  const lines = content.split(/\r?\n/);
  const cases: Partial<EvalCase>[] = [];
  let current: Partial<EvalCase> | undefined;
  let activeList: "allowedTools" | "forbiddenTools" | "successCriteria" | undefined;
  let inThreshold = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed === "cases:") {
      continue;
    }

    const caseStart = trimmed.match(/^-\s+id:\s*(.+)$/);
    if (caseStart) {
      current = {
        id: readScalar(caseStart[1]),
        allowedTools: [],
        forbiddenTools: [],
        successCriteria: [],
        threshold: { score: 1 },
      };
      cases.push(current);
      activeList = undefined;
      inThreshold = false;
      continue;
    }

    if (!current) {
      continue;
    }

    const listValue = trimmed.match(/^-\s+(.+)$/);
    if (listValue && activeList) {
      current[activeList]?.push(readScalar(listValue[1]));
      continue;
    }

    const field = trimmed.match(/^([a-z_]+):\s*(.*)$/);
    if (!field) {
      continue;
    }

    const [, rawKey, rawValue] = field;
    const value = readScalar(rawValue);
    activeList = undefined;

    switch (rawKey) {
      case "category":
        current.category = value;
        inThreshold = false;
        break;
      case "input":
        current.input = value;
        inThreshold = false;
        break;
      case "expected_behavior":
        current.expectedBehavior = value;
        inThreshold = false;
        break;
      case "allowed_tools":
        current.allowedTools = [];
        activeList = "allowedTools";
        inThreshold = false;
        break;
      case "forbidden_tools":
        current.forbiddenTools = [];
        activeList = "forbiddenTools";
        inThreshold = false;
        break;
      case "success_criteria":
        current.successCriteria = [];
        activeList = "successCriteria";
        inThreshold = false;
        break;
      case "threshold":
        current.threshold = { score: 1 };
        inThreshold = true;
        break;
      case "score":
        if (inThreshold) {
          current.threshold = { score: Number(value) };
        }
        break;
    }
  }

  return cases.map(assertEvalCase);
}

function assertEvalCase(input: Partial<EvalCase>): EvalCase {
  const requiredFields: Array<keyof EvalCase> = ["id", "category", "input", "expectedBehavior"];
  for (const field of requiredFields) {
    if (!input[field]) {
      throw new Error(`Eval case is missing required field '${field}'.`);
    }
  }

  return {
    id: input.id as string,
    category: input.category as string,
    input: input.input as string,
    expectedBehavior: input.expectedBehavior as string,
    allowedTools: input.allowedTools ?? [],
    forbiddenTools: input.forbiddenTools ?? [],
    successCriteria: input.successCriteria ?? [],
    threshold: input.threshold ?? { score: 1 },
  };
}

function readScalar(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
