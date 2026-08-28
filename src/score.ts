import type { CategoryScore, Category, Report, ScenarioResult } from "./types.js";
import { CATEGORY_ORDER } from "./scenarios/index.js";

export function scoreResults(results: ScenarioResult[]): Report {
  const byCategory = new Map<Category, ScenarioResult[]>();
  for (const result of results) {
    const list = byCategory.get(result.scenario.category) ?? [];
    list.push(result);
    byCategory.set(result.scenario.category, list);
  }

  const categories: CategoryScore[] = CATEGORY_ORDER.filter((category) => byCategory.has(category)).map((category) => {
    const categoryResults = byCategory.get(category) ?? [];
    const passCount = categoryResults.filter((result) => result.outcome === "pass").length;
    const score = categoryResults.length > 0 ? Math.round((passCount / categoryResults.length) * 100) : 0;
    return { category, score, results: categoryResults };
  });

  const overall =
    categories.length > 0 ? Math.round(categories.reduce((sum, entry) => sum + entry.score, 0) / categories.length) : 0;

  return { categories, overall };
}
