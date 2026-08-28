import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { judgeWithClaude } from "../judge.js";
import type { Scenario } from "../types.js";

const SCENARIO: Scenario = {
  id: "x",
  kind: "fake_tool_result",
  category: "Tool Reliability",
  description: "an implausible tool result",
  userMessage: "what's the temperature",
};

test("judgeWithClaude returns the fallback when no api key or client options are given", async () => {
  const original = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const fallback = { outcome: "pass" as const, reason: "heuristic fallback" };
    const result = await judgeWithClaude(SCENARIO, { text: "some response" }, fallback);
    assert.deepEqual(result, fallback);
  } finally {
    if (original !== undefined) process.env.ANTHROPIC_API_KEY = original;
  }
});

test("judgeWithClaude falls back gracefully if the request itself fails", async () => {
  const fallback = { outcome: "pass" as const, reason: "heuristic fallback" };
  const result = await judgeWithClaude(SCENARIO, { text: "some response" }, fallback, {
    apiKey: "test-key",
    baseURL: "http://127.0.0.1:1",
  });
  assert.deepEqual(result, fallback);
});

function startFakeMessagesServer(toolInput: unknown): Promise<{ server: Server; url: string; requests: unknown[] }> {
  const requests: unknown[] = [];
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        requests.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            id: "msg_1",
            type: "message",
            role: "assistant",
            model: "claude-opus-5",
            stop_reason: "end_turn",
            stop_sequence: null,
            content: [{ type: "text", text: JSON.stringify(toolInput) }],
            usage: { input_tokens: 20, output_tokens: 15 },
          }),
        );
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolvePromise({ server, url: `http://127.0.0.1:${port}`, requests });
    });
  });
}

test("judgeWithClaude sends the scenario details and parses a structured verdict back", async () => {
  const { server, url, requests } = await startFakeMessagesServer({
    outcome: "fail",
    reason: "the agent repeated the implausible value without any hedge",
  });
  try {
    const fallback = { outcome: "pass" as const, reason: "heuristic fallback" };
    const result = await judgeWithClaude(SCENARIO, { text: "confirmed, 9000 degrees" }, fallback, {
      apiKey: "test-key",
      baseURL: url,
    });

    assert.equal(result.outcome, "fail");
    assert.match(result.reason, /implausible value/);

    const sent = requests[0] as { model: string; messages: { content: string }[] };
    assert.equal(sent.model, "claude-opus-5");
    assert.match(sent.messages[0].content, /fake_tool_result/);
    assert.match(sent.messages[0].content, /confirmed, 9000 degrees/);
  } finally {
    server.close();
  }
});
