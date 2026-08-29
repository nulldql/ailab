export type ParsedArgs =
  | { command: "test"; target: string; only?: string[]; timeoutMs: number; useJudge: boolean; json: boolean; verbose: boolean }
  | { command: "list" };

function printHelp(): void {
  console.log(`ailab <test|list> [target]

throws adversarial situations at an AI agent and scores how it holds up.

  test <target>          path to a module exporting your agent, then runs every scenario
  list                    print every scenario kind and which category it scores

  --only <kinds>          comma separated scenario kinds to run instead of all of them
  --timeout <ms>          how long to wait for a response before calling it a timeout (default: 15000)
  --judge                 use claude to grade ambiguous scenarios instead of keyword heuristics
                         (needs ANTHROPIC_API_KEY, falls back to heuristics without one)
  --json                  print the full report as JSON
  --verbose               list every scenario's individual result
  --help                  show this message

your target module needs to export a default async function(scenario) that returns
{ text, toolCalls? }, or an object with a respond(scenario) method that does the same.

examples:
  ailab test ./my-agent.js
  ailab test ./my-agent.js --only prompt_injection,fake_tool_result --verbose
  ailab test ./my-agent.js --judge --json
`);
}

export function parseArgs(argv: string[]): ParsedArgs | null {
  if (argv.length === 0 || argv.includes("--help")) {
    printHelp();
    return null;
  }

  const [command, ...rest] = argv;

  if (command === "list") {
    return { command: "list" };
  }

  if (command !== "test") {
    throw new Error(`unknown command "${command}", use "test" or "list"`);
  }

  const target = rest[0];
  if (!target || target.startsWith("--")) {
    throw new Error(`missing a path to your agent module after "test"`);
  }

  let only: string[] | undefined;
  let timeoutMs = 15000;
  let useJudge = false;
  let json = false;
  let verbose = false;

  function next(flag: string, i: number): string {
    const value = rest[i + 1];
    if (value === undefined) throw new Error(`${flag} needs a value`);
    return value;
  }

  for (let i = 1; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--only") {
      const raw = next(arg, i);
      only = raw
        .split(",")
        .map((kind) => kind.trim())
        .filter(Boolean);
      if (only.length === 0) throw new Error(`--only needs at least one scenario kind, got "${raw}"`);
      i += 1;
    } else if (arg === "--timeout") {
      const raw = next(arg, i);
      const value = Number(raw);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`--timeout needs a positive number of milliseconds, got "${raw}"`);
      }
      timeoutMs = value;
      i += 1;
    } else if (arg === "--judge") {
      useJudge = true;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--verbose") {
      verbose = true;
    } else {
      throw new Error(`unknown flag "${arg}"`);
    }
  }

  return { command: "test", target, only, timeoutMs, useJudge, json, verbose };
}
