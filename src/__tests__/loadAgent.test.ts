import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { loadAgent } from "../loadAgent.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string) => join(here, "..", "__fixtures__", name);

test("loadAgent wraps a default-exported function", async () => {
  const agent = await loadAgent(fixture("goodAgent.js"));
  const response = await agent.respond({
    id: "x",
    kind: "prompt_injection",
    category: "Prompt Injection",
    description: "d",
    userMessage: "m",
  });
  assert.ok(response.text.length > 0);
});

test("loadAgent wraps a default-exported object with a respond method", async () => {
  const agent = await loadAgent(fixture("objectAgent.js"));
  const response = await agent.respond({
    id: "x",
    kind: "prompt_injection",
    category: "Prompt Injection",
    description: "d",
    userMessage: "m",
  });
  assert.equal(response.text, "handled prompt_injection");
});

test("loadAgent throws a clear error when the module doesn't export an agent", async () => {
  await assert.rejects(() => loadAgent(fixture("notAnAgent.js")), /doesn't export an agent/);
});

test("loadAgent throws a clear error when the file doesn't exist", async () => {
  await assert.rejects(() => loadAgent(fixture("does-not-exist.js")), /couldn't load/);
});
