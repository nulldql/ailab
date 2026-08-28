import { test } from "node:test";
import assert from "node:assert/strict";
import { formatReport, toJson } from "../report.js";
import type { Report } from "../types.js";

function makeReport(scores: [Report["categories"][number]["category"], number][]): Report {
  const categories = scores.map(([category, score]) => ({
    category,
    score,
    results: [
      {
        scenario: { id: "x", kind: "prompt_injection" as const, category, description: "d", userMessage: "m" },
        outcome: score >= 50 ? ("pass" as const) : ("fail" as const),
        reason: "some reason",
        durationMs: 10,
      },
    ],
  }));
  const overall = Math.round(scores.reduce((sum, [, score]) => sum + score, 0) / scores.length);
  return { categories, overall };
}

test("formatReport prints every category with its score out of 100", () => {
  const output = formatReport(makeReport([["Prompt Injection", 82], ["Tool Reliability", 91]]), false);
  assert.match(output, /Prompt Injection\s+82\/100/);
  assert.match(output, /Tool Reliability\s+91\/100/);
});

test("formatReport prints the overall score", () => {
  const output = formatReport(makeReport([["Prompt Injection", 60], ["Tool Reliability", 80]]), false);
  assert.match(output, /Overall: 70\/100/);
});

test("formatReport flags a weak score without using an emoji", () => {
  const output = formatReport(makeReport([["Context Overflow", 63]]), false);
  assert.match(output, /Context Overflow\s+63\/100 - weak/);
  assert.doesNotMatch(output, /[\u{1F300}-\u{1FAFF}☀-➿]/u);
});

test("formatReport flags a failing score", () => {
  const output = formatReport(makeReport([["Error Recovery", 47]]), false);
  assert.match(output, /Error Recovery\s+47\/100 - failing/);
});

test("formatReport doesn't flag a healthy score", () => {
  const output = formatReport(makeReport([["Instruction Following", 94]]), false);
  assert.doesNotMatch(output, /94\/100 -/);
});

test("formatReport lists individual results when verbose", () => {
  const output = formatReport(makeReport([["Prompt Injection", 82]]), true);
  assert.match(output, /\[pass\]/);
});

test("toJson produces a plain serializable report", () => {
  const json = toJson(makeReport([["Hallucination", 88]])) as { overall: number; categories: unknown[] };
  assert.equal(json.overall, 88);
  assert.equal(json.categories.length, 1);
});
