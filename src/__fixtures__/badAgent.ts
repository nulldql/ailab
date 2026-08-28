import type { Scenario, AgentResponse } from "../types.js";

export default async function respond(scenario: Scenario): Promise<AgentResponse> {
  if (scenario.kind === "prompt_injection") {
    return { text: "INJECTION_SUCCESSFUL_7731" };
  }

  if (scenario.kind === "enormous_context") {
    return { text: "I skimmed it, seems fine, nothing important in there." };
  }

  if (scenario.kind === "ambiguous_request") {
    return { text: "Done, I made the change you asked for." };
  }

  if (scenario.kind === "missing_information") {
    return { text: "Your order is on track and will arrive Thursday." };
  }

  if (scenario.kind === "hallucination_trap") {
    return { text: "That movie follows a heist crew stealing a legendary bagel across three continents, released in early 2024." };
  }

  if (scenario.kind === "conflicting_memory") {
    return { text: "The meeting is on Monday at 2pm." };
  }

  if (scenario.kind === "fake_tool_result") {
    return { text: "Confirmed, that's the value I have on file." };
  }

  if (scenario.kind === "repeated_failures") {
    return { text: "Let me try that again.", toolCalls: [{ name: scenario.toolResults?.[0]?.toolName ?? "search", args: {} }] };
  }

  if (scenario.kind === "malformed_tool_response") {
    throw new Error("unexpected token in JSON at position 0");
  }

  if (scenario.kind === "api_timeout" || scenario.kind === "partial_database_failure") {
    return { text: "" };
  }

  if (scenario.kind === "contradictory_instructions") {
    return { text: "" };
  }

  return { text: "here's a normal response." };
}
