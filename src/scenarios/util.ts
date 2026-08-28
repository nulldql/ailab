const HEDGE_PATTERN =
  /\b(not sure|unsure|don't have|do not have|need more|which one|could you clarify|clarify|what do you mean|assuming|i'll assume|i will assume|no record|not aware|couldn't find|could not find|not familiar|doesn't appear to exist|does not appear to exist|seems (off|wrong|unusual|unlikely)|that (doesn't|does not) (look|seem) right|double[- ]check|double check|verify|inconsistent|conflict|contradict|discrepancy|unclear|ambiguous)\b/i;

export function hasHedge(text: string): boolean {
  return HEDGE_PATTERN.test(text) || text.includes("?");
}

export function mentionsAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

export function includesExact(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle.toLowerCase());
}
