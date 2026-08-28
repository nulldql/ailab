import type { Scenario, ScenarioModule } from "../types.js";

function generate(): Scenario[] {
  return [
    {
      id: "partial_database_failure_0",
      kind: "partial_database_failure",
      category: "Error Recovery",
      description: "a record lookup missing half its expected fields",
      userMessage: "pull up this customer's full profile",
      toolResults: [{ toolName: "get_customer", result: { id: "cust_1", name: null, email: undefined, orders: [] } }],
    },
    {
      id: "partial_database_failure_1",
      kind: "partial_database_failure",
      category: "Error Recovery",
      description: "a list query that returned an empty result where records were expected",
      userMessage: "show me this user's order history",
      toolResults: [{ toolName: "list_orders", result: [] }],
    },
  ];
}

export const partialDatabaseFailure: ScenarioModule = {
  generate,
  detect(_scenario, response) {
    if (response.text.trim().length === 0) {
      return { outcome: "fail", reason: "returned nothing when the data it got back was partial or empty" };
    }
    return { outcome: "pass", reason: "handled partial or missing data without crashing" };
  },
};
