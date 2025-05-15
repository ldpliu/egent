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
    const guidanceText = `# Guidance

User requested:

<user_task>
${user_task}
</user_task>

## Getting Started

1. First, use the MCP tool \`pb_catalogs\` to view all available playbooks.

2. Compare the <user_task> with the available playbooks to identify the most relevant one.

3. If multiple playbooks match, ask the user to choose one from the options you present.

4. Once you have a playbook ID, use the MCP tool \`pb_execute\` with the ID to retrieve detailed step-by-step instructions and related knowledge dependencies.

5. If the playbook requires parameters, extract them from the <user_task> or ask the user to provide the missing information.

6. Based on the playbook and knowledge, create a detailed plan to complete the task.

7. Proceed with executing the plan, keeping the user informed about progress and any decisions that need to be made.

Remember to reference the knowledge dependencies throughout the process to ensure accurate implementation.`;

    return {
      content: [{
        type: "text",
        text: guidanceText
      }]
    };
  };
}