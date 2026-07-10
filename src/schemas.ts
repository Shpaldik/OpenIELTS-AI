import type { EvaluationKind } from "./types.js";

type JsonSchema = Record<string, unknown>;

const band = { type: "number", minimum: 0, maximum: 9 };
const criterion = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    band: { ...band },
    evidence: { type: "array", items: { type: "string" } },
    feedback: { type: "string" },
    next_step: { type: "string" }
  },
  required: ["name", "band", "evidence", "feedback", "next_step"]
};

export function resultSchema(kind: EvaluationKind): { name: string; schema: JsonSchema } {
  const properties: Record<string, unknown> = {
    estimated_band: band,
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    summary: { type: "string" },
    criteria: { type: "array", items: criterion },
    strengths: { type: "array", items: { type: "string" } },
    improvements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          priority: { type: "integer", minimum: 1, maximum: 3 },
          issue: { type: "string" },
          evidence: { type: "string" },
          action: { type: "string" }
        },
        required: ["priority", "issue", "evidence", "action"]
      }
    }
  };

  if (kind === "writing") properties.word_count = { type: "integer", minimum: 0 };
  if (kind === "speaking") properties.transcript_note = { type: "string" };
  if (kind === "reading_review") properties.mistake_patterns = { type: "array", items: { type: "string" } };

  return {
    name: `ielts_${kind}_feedback`,
    schema: {
      type: "object",
      additionalProperties: false,
      properties,
      required: [...Object.keys(properties)]
    }
  };
}

export function validateResult(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The provider returned a non-object structured result.");
  }
  const result = value as Record<string, unknown>;
  if (typeof result.estimated_band !== "number" || !Array.isArray(result.criteria)) {
    throw new Error("The provider response did not satisfy the evaluator contract.");
  }
}
