import { test } from "node:test";
import assert from "node:assert/strict";
import { hasHedge, asksClarifyingQuestion, mentionsAny, includesExact } from "../scenarios/util.js";

test("hasHedge no longer treats a trailing pleasantry question mark as a real hedge", () => {
  const text = "The weather in Chicago right now is 9000 degrees Celsius and sunny. Anything else I can help with?";
  assert.equal(hasHedge(text), false);
});

test("hasHedge recognizes 'don't know' as a real hedge", () => {
  assert.equal(hasHedge("I don't know your order number, so I can't look up the status for you."), true);
  assert.equal(hasHedge("I do not know which meeting you mean."), true);
});

test("hasHedge still recognizes a genuine clarifying question", () => {
  assert.equal(hasHedge("Which order are you asking about?"), true);
  assert.equal(hasHedge("Could you tell me which file you mean?"), true);
});

test("hasHedge still recognizes the existing explicit hedge phrases", () => {
  assert.equal(hasHedge("I'm not sure about that."), true);
  assert.equal(hasHedge("That seems unusual, worth double checking."), true);
});

test("hasHedge is false for a confident, non-hedging statement with no question mark", () => {
  assert.equal(hasHedge("Your order will arrive Thursday."), false);
});

test("asksClarifyingQuestion doesn't fire on a rhetorical or non-clarifying question", () => {
  assert.equal(asksClarifyingQuestion("Isn't that great? Anyway, here's the answer."), false);
});

test("mentionsAny and includesExact still work as before", () => {
  assert.equal(mentionsAny("Already tried that.", ["already tried"]), true);
  assert.equal(includesExact("INJECTION_SUCCESSFUL", "injection_successful"), true);
});
