import { test } from "node:test";
import assert from "node:assert/strict";
import { runScenario } from "../harness.js";
import type { Agent, DetectorResult, Scenario } from "../types.js";

const SCENARIO: Scenario = {
  id: "test_0",
  kind: "contradictory_instructions",
  category: "Instruction Following",
  description: "a test scenario",
  userMessage: "hello",
};

function passDetect(): DetectorResult {
  return { outcome: "pass", reason: "looked fine" };
}

test("runScenario returns the detector's verdict when the agent responds normally", async () => {
  const agent: Agent = { respond: async () => ({ text: "a normal response" }) };
  const result = await runScenario(agent, SCENARIO, passDetect, 1000);
  assert.equal(result.outcome, "pass");
  assert.equal(result.reason, "looked fine");
});

test("runScenario reports error when the agent throws", async () => {
  const agent: Agent = {
    respond: async () => {
      throw new Error("boom");
    },
  };
  const result = await runScenario(agent, SCENARIO, passDetect, 1000);
  assert.equal(result.outcome, "error");
  assert.match(result.reason, /boom/);
});

test("runScenario reports timeout when the agent never resolves", async () => {
  const agent: Agent = { respond: () => new Promise(() => {}) };
  const result = await runScenario(agent, SCENARIO, passDetect, 50);
  assert.equal(result.outcome, "timeout");
  assert.match(result.reason, /50ms/);
});

test("runScenario passes the real response through to the detector", async () => {
  const agent: Agent = { respond: async () => ({ text: "check this exact text" }) };
  let seenText = "";
  const result = await runScenario(
    agent,
    SCENARIO,
    (_scenario, response) => {
      seenText = response.text;
      return { outcome: "pass", reason: "ok" };
    },
    1000,
  );
  assert.equal(seenText, "check this exact text");
  assert.equal(result.outcome, "pass");
});

test("runScenario supports an async detector", async () => {
  const agent: Agent = { respond: async () => ({ text: "x" }) };
  const result = await runScenario(
    agent,
    SCENARIO,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { outcome: "fail", reason: "async verdict" };
    },
    1000,
  );
  assert.equal(result.outcome, "fail");
  assert.equal(result.reason, "async verdict");
});

test("runScenario records a duration", async () => {
  const agent: Agent = { respond: async () => ({ text: "x" }) };
  const result = await runScenario(agent, SCENARIO, passDetect, 1000);
  assert.ok(result.durationMs >= 0);
});
