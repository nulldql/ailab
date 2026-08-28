import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { loadAgent } from "../loadAgent.js";
import { buildScenarios, runAll } from "../runner.js";
import { scoreResults } from "../score.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => join(here, "..", "__fixtures__", name);

test("buildScenarios returns every scenario from every module by default", () => {
  const entries = buildScenarios();
  const kinds = new Set(entries.map((e) => e.scenario.kind));
  assert.ok(kinds.size >= 12);
});

test("buildScenarios filters to the requested kinds with --only", () => {
  const entries = buildScenarios(["prompt_injection", "hallucination_trap"]);
  const kinds = new Set(entries.map((e) => e.scenario.kind));
  assert.deepEqual([...kinds].sort(), ["hallucination_trap", "prompt_injection"]);
});

test("buildScenarios throws on an unknown scenario kind", () => {
  assert.throws(() => buildScenarios(["not_a_real_kind"]), /unknown scenario kind/);
});

test("a well-behaved agent scores well across the whole suite", async () => {
  const agent = await loadAgent(fixture("goodAgent.js"));
  const results = await runAll(agent, { timeoutMs: 5000, useJudge: false });
  const report = scoreResults(results);
  assert.ok(report.overall >= 80, `expected a high overall score, got ${report.overall}`);
});

test("a poorly-behaved agent scores badly across the whole suite", async () => {
  const agent = await loadAgent(fixture("badAgent.js"));
  const results = await runAll(agent, { timeoutMs: 5000, useJudge: false });
  const report = scoreResults(results);
  assert.ok(report.overall <= 40, `expected a low overall score, got ${report.overall}`);
});

test("a bad agent scores 0 on prompt injection specifically", async () => {
  const agent = await loadAgent(fixture("badAgent.js"));
  const results = await runAll(agent, { timeoutMs: 5000, only: ["prompt_injection"], useJudge: false });
  const report = scoreResults(results);
  assert.equal(report.categories[0].score, 0);
});

test("a throwing agent gets marked as an error, not silently skipped", async () => {
  const agent = await loadAgent(fixture("throwingAgent.js"));
  const results = await runAll(agent, { timeoutMs: 1000, only: ["prompt_injection"], useJudge: false });
  assert.ok(results.every((r) => r.outcome === "error"));
});

test("a hanging agent gets marked as a timeout instead of hanging the whole run", async () => {
  const agent = await loadAgent(fixture("hangingAgent.js"));
  const results = await runAll(agent, { timeoutMs: 100, only: ["prompt_injection"], useJudge: false });
  assert.ok(results.every((r) => r.outcome === "timeout"));
});

test("onScenarioDone fires once per scenario", async () => {
  const agent = await loadAgent(fixture("goodAgent.js"));
  let count = 0;
  await runAll(agent, {
    timeoutMs: 5000,
    only: ["prompt_injection"],
    useJudge: false,
    onScenarioDone: () => {
      count += 1;
    },
  });
  const expected = buildScenarios(["prompt_injection"]).length;
  assert.equal(count, expected);
});
