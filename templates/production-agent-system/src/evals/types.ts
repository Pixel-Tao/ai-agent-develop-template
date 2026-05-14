export type EvalCase = {
  id: string;
  category: string;
  input: string;
  expectedBehavior: string;
  allowedTools: string[];
  forbiddenTools: string[];
  successCriteria: string[];
  threshold: {
    score: number;
  };
};

export type EvalDataset = {
  name: string;
  cases: EvalCase[];
};

export type EvalCaseResult = {
  id: string;
  category: string;
  input: string;
  output: string;
  score: number;
  passed: boolean;
  threshold: number;
  toolCalls: string[];
  scorerBreakdown: Record<string, number>;
  failureReasons: string[];
};

export type EvalReport = {
  dataset: string;
  generatedAt: string;
  score: number;
  passed: boolean;
  threshold: number;
  results: EvalCaseResult[];
};
