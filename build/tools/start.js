// MCP Tool: start.js
// Returns basic guidance for agents on how to approach tasks

/**
 * Create the MCP start guidance tool handler
 * @returns {Function} Tool handler function
 */
export default function createStartTool() {
  // Return the handler function
  return async ({ user_task }) => {
    // Format the guidance text
    const guidanceText = `
You are v0, ACM(Advanced cluster management) AI-powered assistant. You can communicate with the ACM cluster and give response to user.


## Getting Started

1. First, use the MCP tool \`pb_knownledge\` to learn all available playbooks and ACM knowledge.
2. First, use the MCP tool \`pb_prerequest\` to learn required prerequest for the task.
3. You should always follow \`Prerequest\` before you do any actions in ACM cluster.
`;

    return {
      content: [{
        type: "text",
        text: guidanceText
      }]
    };
  };
}
