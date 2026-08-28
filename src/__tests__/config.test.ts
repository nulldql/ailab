import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../config.js";

test("parseArgs returns null with no arguments", () => {
  assert.equal(parseArgs([]), null);
});

test("parseArgs returns null on --help", () => {
  assert.equal(parseArgs(["--help"]), null);
});

test("parseArgs returns the list command", () => {
  assert.deepEqual(parseArgs(["list"]), { command: "list" });
});

test("parseArgs rejects an unknown command", () => {
  assert.throws(() => parseArgs(["bogus"]), /unknown command/);
});

test("parseArgs requires a target path after test", () => {
  assert.throws(() => parseArgs(["test"]), /missing a path/);
});

test("parseArgs parses a full test command", () => {
  const args = parseArgs([
    "test",
    "./my-agent.js",
    "--only",
    "prompt_injection,fake_tool_result",
    "--timeout",
    "5000",
    "--judge",
    "--json",
    "--verbose",
  ]);
  assert.equal(args?.command, "test");
  if (args?.command !== "test") throw new Error("expected test command");
  assert.equal(args.target, "./my-agent.js");
  assert.deepEqual(args.only, ["prompt_injection", "fake_tool_result"]);
  assert.equal(args.timeoutMs, 5000);
  assert.equal(args.useJudge, true);
  assert.equal(args.json, true);
  assert.equal(args.verbose, true);
});

test("parseArgs defaults timeout and flags when not given", () => {
  const args = parseArgs(["test", "./agent.js"]);
  if (args?.command !== "test") throw new Error("expected test command");
  assert.equal(args.timeoutMs, 15000);
  assert.equal(args.useJudge, false);
  assert.equal(args.json, false);
  assert.equal(args.verbose, false);
  assert.equal(args.only, undefined);
});

test("parseArgs rejects a non-positive timeout", () => {
  assert.throws(() => parseArgs(["test", "./agent.js", "--timeout", "0"]), /--timeout must be a positive number/);
});

test("parseArgs throws on an unknown flag", () => {
  assert.throws(() => parseArgs(["test", "./agent.js", "--bogus"]), /unknown flag/);
});

test("parseArgs throws when a value-taking flag has nothing after it", () => {
  assert.throws(() => parseArgs(["test", "./agent.js", "--only"]), /needs a value/);
});
