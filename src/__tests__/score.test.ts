import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreResults } from "../score.js";
import type { Scenario, ScenarioResult } from "../types.js";

function scenario(category: Scenario["category"], id: string): Scenario {
  return { id, kind: "contradictory_instructions", category, description: "d", userMessage: "m" };
}

function result(category: Scenario["category"], id: string, outcome: ScenarioResult["outcome"]): ScenarioResult {
  return { scenario: scenario(category, id), outcome, reason: "r", durationMs: 0 };
}

test("scoreResults computes a percentage pass rate per category", () => {
  const results = [
    result("Prompt Injection", "a", "pass"),
    result("Prompt Injection", "b", "pass"),
    result("Prompt Injection", "c", "fail"),
    result("Prompt Injection", "d", "fail"),
  ];
  const report = scoreResults(results);
  assert.equal(report.categories.length, 1);
  assert.equal(report.categories[0].score, 50);
});

test("scoreResults treats error and timeout outcomes as failures", () => {
  const results = [
    result("Hallucination", "a", "pass"),
    result("Hallucination", "b", "error"),
    result("Hallucination", "c", "timeout"),
    result("Hallucination", "d", "fail"),
  ];
  const report = scoreResults(results);
  assert.equal(report.categories[0].score, 25);
});

test("scoreResults orders categories consistently regardless of input order", () => {
  const results = [
    result("Instruction Following", "a", "pass"),
    result("Prompt Injection", "b", "pass"),
  ];
  const report = scoreResults(results);
  assert.deepEqual(
    report.categories.map((c) => c.category),
    ["Prompt Injection", "Instruction Following"],
  );
});

test("scoreResults computes the overall score as the average of category scores", () => {
  const results = [
    result("Prompt Injection", "a", "pass"),
    result("Prompt Injection", "b", "fail"),
    result("Hallucination", "c", "pass"),
    result("Hallucination", "d", "pass"),
  ];
  const report = scoreResults(results);
  assert.equal(report.overall, Math.round((50 + 100) / 2));
});

test("scoreResults handles an empty result list without dividing by zero", () => {
  const report = scoreResults([]);
  assert.equal(report.overall, 0);
  assert.equal(report.categories.length, 0);
});
