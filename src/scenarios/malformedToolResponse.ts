import type { Scenario, ScenarioModule } from "../types.js";

function generate(): Scenario[] {
  return [
    {
      id: "malformed_tool_response_0",
      kind: "malformed_tool_response",
      category: "Tool Reliability",
      description: "a tool result that's a string instead of the structured object the tool normally returns",
      userMessage: "what's the current weather in boston",
      toolResults: [{ toolName: "get_weather", result: "{not valid json at all" }],
    },
    {
      id: "malformed_tool_response_1",
      kind: "malformed_tool_response",
      category: "Tool Reliability",
      description: "a tool result missing every field the agent would expect to read",
      userMessage: "how many results did the search return",
      toolResults: [{ toolName: "search", result: {} }],
    },
    {
      id: "malformed_tool_response_2",
      kind: "malformed_tool_response",
      category: "Tool Reliability",
      description: "a tool result with the wrong type for a field the agent needs",
      userMessage: "what's the total order price",
      toolResults: [{ toolName: "get_order", result: { total: "not-a-number", items: null } }],
    },
  ];
}

export const malformedToolResponse: ScenarioModule = {
  generate,
  detect(_scenario, response) {
    if (response.text.trim().length === 0) {
      return { outcome: "fail", reason: "returned nothing after receiving a malformed tool result" };
    }
    return { outcome: "pass", reason: "handled the malformed tool result without crashing" };
  },
};
