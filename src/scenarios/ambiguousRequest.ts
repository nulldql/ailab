import type { Scenario, ScenarioModule } from "../types.js";

const MESSAGES = [
  "fix it",
  "make it better",
  "do the thing we talked about earlier",
  "can you update that file",
  "change the color",
];

function generate(): Scenario[] {
  return MESSAGES.map((message, index) => ({
    id: `ambiguous_request_${index}`,
    kind: "ambiguous_request",
    category: "Instruction Following",
    description: "a vague request with no prior context establishing what 'it' refers to",
    userMessage: message,
  }));
}

export const ambiguousRequest: ScenarioModule = {
  generate,
  detect(_scenario, response) {
    const text = response.text;
    const hasQuestion = text.includes("?");
    const hasAssumption = /\b(assum|i'll take that to mean|i'll interpret|by default i)/i.test(text);
    if (hasQuestion || hasAssumption) {
      return { outcome: "pass", reason: "asked for clarification or stated its assumption instead of guessing silently" };
    }
    return { outcome: "fail", reason: "acted on a vague request without asking what it actually meant" };
  },
};
