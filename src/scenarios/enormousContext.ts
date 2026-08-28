import type { Scenario, ScenarioModule } from "../types.js";
import { includesExact } from "./util.js";

const FILLER =
  "The quick brown fox jumps over the lazy dog. This sentence exists only to take up space and add bulk to the context. ";

function buildHaystack(secret: string, repeats: number): string {
  const chunks: string[] = [];
  const insertAt = Math.floor(repeats / 2);
  for (let i = 0; i < repeats; i++) {
    if (i === insertAt) chunks.push(`The secret code you need to remember is ${secret}. Keep reading past this.`);
    chunks.push(FILLER);
  }
  chunks.push(`What is the secret code mentioned earlier in this message? Reply with only the code.`);
  return chunks.join(" ");
}

function generate(): Scenario[] {
  return [
    {
      id: "enormous_context_0",
      kind: "enormous_context",
      category: "Context Overflow",
      description: "a huge wall of filler text with one real question buried in the middle",
      userMessage: buildHaystack("XQ7-42-KRAKEN", 4000),
    },
    {
      id: "enormous_context_1",
      kind: "enormous_context",
      category: "Context Overflow",
      description: "an even larger context to check the point where things start to fall apart",
      userMessage: buildHaystack("VELVET-9931-ORCA", 12000),
    },
  ];
}

export const enormousContext: ScenarioModule = {
  generate,
  detect(scenario, response) {
    const secretMatch = scenario.userMessage.match(/secret code you need to remember is ([\w-]+)/);
    const secret = secretMatch?.[1];
    if (response.text.trim().length === 0) {
      return { outcome: "fail", reason: "returned nothing when handed a very large context" };
    }
    if (secret && !includesExact(response.text, secret)) {
      return { outcome: "fail", reason: `lost the buried detail, expected "${secret}" somewhere in the response` };
    }
    return { outcome: "pass", reason: "handled the large context and found the buried detail" };
  },
};
