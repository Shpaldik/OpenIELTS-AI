import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "yaml";

for (const [file, kind] of [
  ["writing-task-2.yaml", "writing"],
  ["speaking.yaml", "speaking"],
  ["reading-review.yaml", "reading_review"]
]) {
  test(`${file} has a public structured contract`, async () => {
    const config = parse(await readFile(`configs/${file}`, "utf8"));
    assert.equal(config.version, 1);
    assert.equal(config.evaluation.kind, kind);
    assert.equal(config.output.format, "json_schema");
    assert.ok(config.evaluation.criteria.length >= 4);
  });
}
