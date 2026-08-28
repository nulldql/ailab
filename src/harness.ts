import type { Agent, Scenario, ScenarioModule, ScenarioResult } from "./types.js";

class TimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(`didn't respond within ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export async function runScenario(
  agent: Agent,
  scenario: Scenario,
  detect: ScenarioModule["detect"],
  timeoutMs: number,
): Promise<ScenarioResult> {
  const start = Date.now();

  try {
    const response = await withTimeout(agent.respond(scenario), timeoutMs);
    const durationMs = Date.now() - start;
    const verdict = await detect(scenario, response);
    return { scenario, outcome: verdict.outcome, reason: verdict.reason, durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;
    if (err instanceof TimeoutError) {
      return { scenario, outcome: "timeout", reason: err.message, durationMs };
    }
    return {
      scenario,
      outcome: "error",
      reason: `threw an exception: ${err instanceof Error ? err.message : String(err)}`,
      durationMs,
    };
  }
}
