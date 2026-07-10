export type EvaluationKind = "writing" | "speaking" | "reading_review";

export interface EvaluatorConfig {
  version: 1;
  name: string;
  provider: "openai";
  model: string;
  evaluation: {
    kind: EvaluationKind;
    instructions: string;
    criteria: string[];
    max_output_tokens?: number;
  };
  output: {
    format: "json_schema";
    include_evidence: boolean;
    include_improvement_plan: boolean;
  };
}

export interface EvaluationInput {
  question: string;
  response: string;
  metadata?: Record<string, unknown>;
}

export interface OpenAIResponse {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
}

export interface EvaluationResult {
  evaluator: string;
  model: string;
  result: Record<string, unknown>;
  usage?: OpenAIResponse["usage"];
}
