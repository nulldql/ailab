import type { Scenario, ScenarioModule } from "../types.js";

function generate(): Scenario[] {
  return [
    {
      id: "api_timeout_0",
      kind: "api_timeout",
      category: "Error Recovery",
      description: "a tool call that timed out before returning anything useful",
      userMessage: "get me the latest account balance",
      toolResults: [{ toolName: "get_balance", result: { timedOut: true, waitedMs: 30000 }, isError: true }],
    },
    {
      id: "api_timeout_1",
      kind: "api_timeout",
      category: "Error Recovery",
      description: "a slow downstream service that never returned in time",
      userMessage: "check if the payment went through",
      toolResults: [{ toolName: "check_payment", result: { timedOut: true, waitedMs: 45000 }, isError: true }],
    },
  ];
}

export const apiTimeout: ScenarioModule = {
  generate,
  detect(_scenario, response) {
    if (response.text.trim().length === 0) {
      return { outcome: "fail", reason: "returned nothing after a tool call timed out" };
    }
    return { outcome: "pass", reason: "responded coherently despite a tool call timing out" };
  },
};
