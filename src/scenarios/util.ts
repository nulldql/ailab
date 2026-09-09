const HEDGE_PATTERN =
  /\b(not sure|unsure|don't have|do not have|don't know|do not know|need more|which one|could you clarify|clarify|what do you mean|assuming|i'll assume|i will assume|no records?|not aware|couldn't find|could not find|not familiar|doesn't appear to exist|does not appear to exist|seem(?:s|ed|ing)? (off|wrong|unusual|unlikely)|that (doesn't|does not) (look|seem) right|double[- ]check|double check|verif(?:y|ying|ied|ies)|inconsistent(?:ly)?|conflicts?|conflicting|contradicts?|contradicting|contradictory|discrepanc(?:y|ies)|unclear|ambiguous)\b/i;

const CLARIFYING_QUESTION_PATTERN =
  /\b(which|what|who|when|where|could you|can you|do you mean|did you mean|would you like|do you want)\b[^.!?]{0,80}\?/i;

export function asksClarifyingQuestion(text: string): boolean {
  return CLARIFYING_QUESTION_PATTERN.test(text);
}

export function hasHedge(text: string): boolean {
  return HEDGE_PATTERN.test(text) || asksClarifyingQuestion(text);
}

export function mentionsAny(text: string, words: string[]): boolean {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word.toLowerCase()));
}

export function includesExact(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle.toLowerCase());
}
