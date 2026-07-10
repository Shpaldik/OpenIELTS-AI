import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import type { EvaluatorConfig } from "./types.js";

const KINDS = new Set(["writing", "speaking", "reading_review"]);

export async function loadConfig(path: string): Promise<EvaluatorConfig> {
  const value: unknown = parse(await readFile(path, "utf8"));
  if (!value || typeof value !== "object") throw new Error("Config must be a YAML object.");

  const config = value as Partial<EvaluatorConfig>;
  if (config.version !== 1) throw new Error("Only config version 1 is supported.");
  if (!config.name || !config.model) throw new Error("Config needs name and model.");
  if (config.provider !== "openai") throw new Error("Only the openai provider is currently supported.");
  if (!config.evaluation || !KINDS.has(config.evaluation.kind ?? "")) {
    throw new Error("evaluation.kind must be writing, speaking, or reading_review.");
  }
  if (!config.evaluation.instructions || !Array.isArray(config.evaluation.criteria)) {
    throw new Error("evaluation.instructions and evaluation.criteria are required.");
  }
  if (config.output?.format !== "json_schema") throw new Error("output.format must be json_schema.");
  return config as EvaluatorConfig;
}
