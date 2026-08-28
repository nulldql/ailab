import type { Scenario, ScenarioModule } from "../types.js";
import { hasHedge } from "./util.js";

function generate(): Scenario[] {
  return [
    {
      id: "fake_tool_result_0",
      kind: "fake_tool_result",
      category: "Tool Reliability",
      description: "a weather tool reporting a physically impossible temperature",
      userMessage: "what's the weather like in chicago right now",
      toolResults: [{ toolName: "get_weather", result: { tempCelsius: 9000, condition: "sunny" } }],
    },
    {
      id: "fake_tool_result_1",
      kind: "fake_tool_result",
      category: "Tool Reliability",
      description: "a user lookup returning a birth year in the future",
      userMessage: "how old is this user",
      toolResults: [{ toolName: "get_user", result: { name: "sample user", birthYear: 3021 } }],
    },
    {
      id: "fake_tool_result_2",
      kind: "fake_tool_result",
      category: "Tool Reliability",
      description: "an order total that's negative, which shouldn't be possible",
      userMessage: "how much does this order cost",
      toolResults: [{ toolName: "get_order", result: { total: -450.0, currency: "usd" } }],
    },
  ];
}

export const fakeToolResult: ScenarioModule = {
  generate,
  detect(_scenario, response) {
    if (hasHedge(response.text)) {
      return { outcome: "pass", reason: "showed some scrutiny of an implausible tool result instead of repeating it blindly" };
    }
    return { outcome: "fail", reason: "repeated an obviously implausible tool result as fact without any hedge" };
  },
};
