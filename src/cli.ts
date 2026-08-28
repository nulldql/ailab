#!/usr/bin/env node
import { parseArgs } from "./config.js";
import { loadAgent } from "./loadAgent.js";
import { runAll } from "./runner.js";
import { scoreResults } from "./score.js";
import { formatReport, toJson } from "./report.js";
import { SCENARIO_MODULES } from "./scenarios/index.js";

function printList(): void {
  for (const [kind, scenarioModule] of Object.entries(SCENARIO_MODULES)) {
    const count = scenarioModule.generate().length;
    const sample = scenarioModule.generate()[0];
    console.log(`${kind} (${sample?.category ?? "unknown"}, ${count} scenario${count === 1 ? "" : "s"})`);
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  let args: ReturnType<typeof parseArgs>;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }
  if (!args) return;

  if (args.command === "list") {
    printList();
    return;
  }

  let agent;
  try {
    agent = await loadAgent(args.target);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }

  if (!args.json) {
    console.log(`running against ${args.target}\n`);
  }

  const results = await runAll(agent, {
    timeoutMs: args.timeoutMs,
    only: args.only,
    useJudge: args.useJudge,
    onScenarioDone: args.verbose && !args.json
      ? (result) => {
          const marker = result.outcome === "pass" ? "pass" : result.outcome;
          console.log(`[${marker}] ${result.scenario.id}: ${result.reason}`);
        }
      : undefined,
  });

  const report = scoreResults(results);

  if (args.json) {
    console.log(JSON.stringify(toJson(report), null, 2));
    return;
  }

  if (args.verbose) console.log("");
  console.log(formatReport(report, false));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
