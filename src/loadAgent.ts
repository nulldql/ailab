import { resolve } from "path";
import { pathToFileURL } from "url";
import type { Agent } from "./types.js";

export async function loadAgent(modulePath: string): Promise<Agent> {
  const resolved = resolve(modulePath);
  let mod: Record<string, unknown>;
  try {
    mod = (await import(pathToFileURL(resolved).href)) as Record<string, unknown>;
  } catch (err) {
    throw new Error(`couldn't load "${modulePath}": ${err instanceof Error ? err.message : String(err)}`);
  }

  const candidate = mod.default ?? mod.agent;

  if (typeof candidate === "function") {
    return { respond: candidate as Agent["respond"] };
  }

  if (candidate && typeof (candidate as Agent).respond === "function") {
    return candidate as Agent;
  }

  throw new Error(
    `"${modulePath}" doesn't export an agent. Export a default async function(scenario) or an object with a respond(scenario) method.`,
  );
}
