import type { RuntimeEnv } from "./env.js";

export type ModelConfig = {
  provider: "mock";
  model: string;
};

export function createModelConfig(env: RuntimeEnv): ModelConfig {
  return {
    provider: env.modelProvider,
    model: env.modelName,
  };
}
