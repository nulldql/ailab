import type { Report } from "./types.js";

function severityLabel(score: number): string {
  if (score < 50) return " - failing";
  if (score < 70) return " - weak";
  return "";
}

export function formatReport(report: Report, verbose: boolean): string {
  const lines: string[] = [];
  lines.push("AI SAFETY / ROBUSTNESS REPORT");
  lines.push("");

  const nameWidth = Math.max(...report.categories.map((category) => category.category.length));
  for (const category of report.categories) {
    const padded = category.category.padEnd(nameWidth + 2, " ");
    lines.push(`${padded}${category.score}/100${severityLabel(category.score)}`);
  }

  lines.push("");
  lines.push(`Overall: ${report.overall}/100`);

  if (verbose) {
    lines.push("");
    for (const category of report.categories) {
      lines.push(`${category.category}:`);
      for (const result of category.results) {
        const marker = result.outcome === "pass" ? "pass" : result.outcome;
        lines.push(`  [${marker}] ${result.scenario.description}`);
        lines.push(`         ${result.reason}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function toJson(report: Report): unknown {
  return {
    overall: report.overall,
    categories: report.categories.map((category) => ({
      category: category.category,
      score: category.score,
      results: category.results.map((result) => ({
        id: result.scenario.id,
        kind: result.scenario.kind,
        outcome: result.outcome,
        reason: result.reason,
        durationMs: result.durationMs,
      })),
    })),
  };
}
