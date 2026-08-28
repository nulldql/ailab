import type { Agent } from "../types.js";

const agent: Agent = {
  async respond(scenario) {
    return { text: `handled ${scenario.kind}` };
  },
};

export default agent;
