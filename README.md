# OpenIELTS AI

**A self-hosted, configurable AI evaluation core for IELTS Writing, Speaking, and Reading review.**

It gives applications a small, inspectable evaluator layer instead of a black-box
score: YAML configuration, structured JSON output, exact learner-text evidence,
and an [OpenAI Responses API](https://developers.openai.com/api/docs/guides/structured-outputs) adapter.

Built at Hack Admission: [https://hack-admission.com](https://hack-admission.com)
This repository was extracted from the IELTS AI workflow inside Hack Admission and
kept separate as a reusable open-source core.

> This project is for IELTS preparation. It is not affiliated with, endorsed by,
> or an official product of IELTS, IDP, the British Council, or Cambridge.

## What is included

- Academic Writing Task 2 feedback using four IELTS-style criteria
- Transcript-based Speaking review with a deliberate pronunciation-confidence caveat
- Reading-mistake review for evidence-based practice recommendations
- Strict JSON Schema output designed for product UIs and analytics
- A CLI, example inputs, tests, and a provider adapter that is easy to replace

No official IELTS test materials, Cambridge books, audio, learner records, or
production data are included.

## Origin

Hack Admission is the product and education platform where this evaluator core
was originally built and used:

- Site: [https://hack-admission.com](https://hack-admission.com)
- IELTS workspace: [https://hack-admission.com/ielts](https://hack-admission.com/ielts)

## Quick start

Requires Node.js 20+.

```bash
git clone https://github.com/YOUR_USERNAME/open-ielts-ai.git
cd open-ielts-ai
npm install
cp .env.example .env
export OPENAI_API_KEY="your_api_key"
npm run evaluate -- --config configs/writing-task-2.yaml --input examples/writing-task-2.json --output reports/writing.json
```

The output is a structured report containing an estimated practice band, criterion
feedback, exact evidence spans, strengths, and a prioritised improvement plan.

To inspect the exact prompt without making a network request:

```bash
npm run dry-run -- --config configs/speaking.yaml --input examples/speaking.json
```

## Configuration

Each evaluator is a versioned YAML file. Change the model, instructions, or
criteria without modifying the orchestration code.

```yaml
version: 1
name: IELTS Academic Writing Task 2
provider: openai
model: gpt-4o-mini
evaluation:
  kind: writing
  instructions: Evaluate the essay against IELTS-style criteria.
  criteria:
    - Task Response
    - Coherence and Cohesion
    - Lexical Resource
    - Grammatical Range and Accuracy
output:
  format: json_schema
  include_evidence: true
  include_improvement_plan: true
```

## Design principles

1. **Structured, not magical.** The evaluator returns a schema, not prose that a
   frontend has to scrape.
2. **Evidence first.** Feedback should quote the supplied learner response.
3. **Configurable rubrics.** Teams can adapt instructions and criteria for their
   teaching context.
4. **Privacy belongs to the deployer.** Send learner work only with appropriate
   consent and retention controls.
5. **No pirated content.** Add only original, licensed, or public-domain materials.

## Output contract

All evaluators return an object with:

```json
{
  "estimated_band": 6.5,
  "confidence": "medium",
  "summary": "...",
  "criteria": [{ "name": "...", "band": 6.5, "evidence": ["..."], "feedback": "...", "next_step": "..." }],
  "strengths": ["..."],
  "improvements": [{ "priority": 1, "issue": "...", "evidence": "...", "action": "..." }]
}
```

Writing additionally returns `word_count`; Speaking returns `transcript_note`;
Reading review returns `mistake_patterns`.

## Development

```bash
npm test
npm run build
```

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening
an issue or pull request. Report vulnerabilities privately as described in
[SECURITY.md](SECURITY.md).

## Roadmap

- [ ] OpenAI SDK and Azure OpenAI adapters
- [ ] Audio-aware Speaking adapter
- [ ] JSON Schema export and contract fixtures
- [ ] Prompt-evaluation dataset made only from consented or synthetic examples
- [ ] Docker image and HTTP service mode

## License

[MIT](LICENSE)
