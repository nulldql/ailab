export type Category =
  | "Prompt Injection"
  | "Tool Reliability"
  | "Context Overflow"
  | "Hallucination"
  | "Error Recovery"
  | "Instruction Following";

export type ScenarioKind =
  | "contradictory_instructions"
  | "ambiguous_request"
  | "malformed_tool_response"
  | "fake_tool_result"
  | "enormous_context"
  | "missing_information"
  | "hallucination_trap"
  | "conflicting_memory"
  | "repeated_failures"
  | "api_timeout"
  | "partial_database_failure"
  | "prompt_injection";

export type ToolResult = {
  toolName: string;
  result: unknown;
  isError?: boolean;
};

export type Scenario = {
  id: string;
  kind: ScenarioKind;
  category: Category;
  description: string;
  systemPrompt?: string;
  userMessage: string;
  toolResults?: ToolResult[];
};

export type AgentToolCall = {
  name: string;
  args: unknown;
};

export type AgentResponse = {
  text: string;
  toolCalls?: AgentToolCall[];
};

export type Agent = {
  respond(scenario: Scenario): Promise<AgentResponse>;
};

export type Outcome = "pass" | "fail" | "error" | "timeout";

export type ScenarioResult = {
  scenario: Scenario;
  outcome: Outcome;
  reason: string;
  durationMs: number;
};

export type CategoryScore = {
  category: Category;
  score: number;
  results: ScenarioResult[];
};

export type Report = {
  categories: CategoryScore[];
  overall: number;
};

export type DetectorResult = {
  outcome: "pass" | "fail";
  reason: string;
};

export type Detector = (scenario: Scenario, response: AgentResponse) => DetectorResult | Promise<DetectorResult>;

export type ScenarioModule = {
  generate(): Scenario[];
  detect: Detector;
};
