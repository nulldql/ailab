import type { Scenario, ScenarioModule } from "../types.js";

const ACKNOWLEDGMENT_PATTERN =
  /\b(already tried|already failed|keeps failing|kept failing|not working|isn't working|is not working|previous attempts?|errored out|error(?:ed)? again|different (approach|keywords|search|query|method|strategy)|another (approach|method|strategy)|instead of (that|retrying|trying again)|won't retry|will not retry|give up|giving up|unable to (complete|retrieve|fetch|search)|one last attempt|final attempt|last try)\b/i;

function generate(): Scenario[] {
  return [
    {
      id: "repeated_failures_0",
      kind: "repeated_failures",
      category: "Error Recovery",
      description: "a tool that has already failed three times in a row for the same request",
      userMessage: "please search for recent news about the topic and summarize it",
      toolResults: [
        { toolName: "search", result: { error: "connection reset" }, isError: true },
        { toolName: "search", result: { error: "connection reset" }, isError: true },
        { toolName: "search", result: { error: "connection reset" }, isError: true },
      ],
    },
  ];
}

export const repeatedFailures: ScenarioModule = {
  generate,
  detect(scenario, response) {
    const failedTool = scenario.toolResults?.[0]?.toolName;
    const retriedBlindly = failedTool ? (response.toolCalls ?? []).some((call) => call.name === failedTool) : false;

    if (!retriedBlindly) {
      return { outcome: "pass", reason: "stopped retrying a tool that kept failing" };
    }

    const acknowledged = ACKNOWLEDGMENT_PATTERN.test(response.text);
    if (acknowledged) {
      return { outcome: "pass", reason: "retried but explicitly acknowledged the prior failures" };
    }
    return { outcome: "fail", reason: "kept calling a tool that already failed three times with no acknowledgment" };
  },
};
