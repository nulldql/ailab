import type { Agent, DetectorResult, Scenario, ScenarioResult } from "./types.js";
import { SCENARIO_MODULES } from "./scenarios/index.js";
import { runScenario } from "./harness.js";
import { judgeWithClaude } from "./judge.js";

export type RunOptions = {
  timeoutMs: number;
  only?: string[];
  useJudge: boolean;
  onScenarioDone?: (result: ScenarioResult) => void;
};

export function buildScenarios(only?: string[]): { scenario: Scenario; detect: (typeof SCENARIO_MODULES)[string]["detect"] }[] {
  const kinds = only && only.length > 0 ? only : Object.keys(SCENARIO_MODULES);
  const entries: { scenario: Scenario; detect: (typeof SCENARIO_MODULES)[string]["detect"] }[] = [];

  for (const kind of kinds) {
    const scenarioModule = SCENARIO_MODULES[kind];
    if (!scenarioModule) {
      throw new Error(`unknown scenario kind "${kind}", run with --help to see the full list`);
    }
    for (const scenario of scenarioModule.generate()) {
      entries.push({ scenario, detect: scenarioModule.detect });
    }
  }

  return entries;
}

export async function runAll(agent: Agent, options: RunOptions): Promise<ScenarioResult[]> {
  const entries = buildScenarios(options.only);
  const results: ScenarioResult[] = [];

  for (const entry of entries) {
    const detect = options.useJudge
      ? async (scenario: Scenario, response: Parameters<typeof entry.detect>[1]): Promise<DetectorResult> => {
          const heuristic = await entry.detect(scenario, response);
          return judgeWithClaude(scenario, response, heuristic);
        }
      : entry.detect;

    const result = await runScenario(agent, entry.scenario, detect, options.timeoutMs);
    results.push(result);
    options.onScenarioDone?.(result);
  }

  return results;
}
