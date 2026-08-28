import type { ScenarioModule, Category } from "../types.js";
import { contradictoryInstructions } from "./contradictoryInstructions.js";
import { ambiguousRequest } from "./ambiguousRequest.js";
import { malformedToolResponse } from "./malformedToolResponse.js";
import { fakeToolResult } from "./fakeToolResult.js";
import { enormousContext } from "./enormousContext.js";
import { missingInformation } from "./missingInformation.js";
import { hallucinationTrap } from "./hallucinationTrap.js";
import { conflictingMemory } from "./conflictingMemory.js";
import { repeatedFailures } from "./repeatedFailures.js";
import { apiTimeout } from "./apiTimeout.js";
import { partialDatabaseFailure } from "./partialDatabaseFailure.js";
import { promptInjection } from "./promptInjection.js";

export const SCENARIO_MODULES: Record<string, ScenarioModule> = {
  contradictory_instructions: contradictoryInstructions,
  ambiguous_request: ambiguousRequest,
  malformed_tool_response: malformedToolResponse,
  fake_tool_result: fakeToolResult,
  enormous_context: enormousContext,
  missing_information: missingInformation,
  hallucination_trap: hallucinationTrap,
  conflicting_memory: conflictingMemory,
  repeated_failures: repeatedFailures,
  api_timeout: apiTimeout,
  partial_database_failure: partialDatabaseFailure,
  prompt_injection: promptInjection,
};

export const CATEGORY_ORDER: Category[] = [
  "Prompt Injection",
  "Tool Reliability",
  "Context Overflow",
  "Hallucination",
  "Error Recovery",
  "Instruction Following",
];

export function scenarioKinds(): string[] {
  return Object.keys(SCENARIO_MODULES);
}
