import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { resultSchema, validateResult } from "./schemas.js";
import type { EvaluationInput, EvaluationResult, EvaluatorConfig, OpenAIResponse } from "./types.js";

function extractText(response: OpenAIResponse): string {
  if (response.output_text) return response.output_text;
  for (const output of response.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.refusal) throw new Error(`Model refusal: ${content.refusal}`);
      if (content.text) return content.text;
    }
  }
  throw new Error("The provider response did not contain text output.");
}

export async function evaluateWithOpenAI(config: EvaluatorConfig, input: EvaluationInput): Promise<EvaluationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required. Copy .env.example to .env or export it in your shell.");

  const endpoint = `${(process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "")}/responses`;
  const output = resultSchema(config.evaluation.kind);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      input: [
        { role: "system", content: [{ type: "input_text", text: buildSystemPrompt(config) }] },
        { role: "user", content: [{ type: "input_text", text: buildUserPrompt(input) }] }
      ],
      text: { format: { type: "json_schema", name: output.name, strict: true, schema: output.schema } },
      max_output_tokens: config.evaluation.max_output_tokens ?? 1600
    })
  });

  const body = await response.json() as OpenAIResponse & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message ?? `OpenAI request failed (${response.status}).`);
  const result: unknown = JSON.parse(extractText(body));
  validateResult(result);
  return { evaluator: config.name, model: config.model, result, usage: body.usage };
}
