#!/usr/bin/env node
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { loadConfig } from "./config.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { evaluateWithOpenAI } from "./openai.js";
import type { EvaluationInput } from "./types.js";

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function usage(): never {
  console.error("Usage: open-ielts-ai evaluate --config configs/writing-task-2.yaml --input examples/writing-task-2.json [--output report.json] [--dry-run]");
  process.exit(1);
}

async function main(): Promise<void> {
  if (process.argv[2] !== "evaluate") usage();
  const configPath = option("--config");
  const inputPath = option("--input");
  if (!configPath || !inputPath) usage();

  const config = await loadConfig(resolve(configPath));
  const input = JSON.parse(await readFile(resolve(inputPath), "utf8")) as EvaluationInput;
  if (!input.question || !input.response) throw new Error("Input JSON must contain question and response strings.");

  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify({ evaluator: config.name, system_prompt: buildSystemPrompt(config), user_prompt: buildUserPrompt(input) }, null, 2));
    return;
  }

  const report = await evaluateWithOpenAI(config, input);
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  const outputPath = option("--output");
  if (outputPath) {
    const absoluteOutputPath = resolve(outputPath);
    await mkdir(dirname(absoluteOutputPath), { recursive: true });
    await writeFile(absoluteOutputPath, serialized);
    console.log(`Saved ${basename(outputPath)}`);
  } else {
    console.log(serialized);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
