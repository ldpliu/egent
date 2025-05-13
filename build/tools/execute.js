// MCP Tool: execute-playbook.js
// Returns a playbook and all its knowledge dependencies

/**
 * Create the MCP execute tool handler for playbooks.
 * @param {Map<string, object>} playbookMap - The in-memory map of playbooks
 * @returns {Function} Tool handler function
 */
export default function createExecuteTool(playbookMap) {
  // Return the handler function
  return async ({ id }) => {
    // Check if the playbook exists
    if (!id || typeof id !== 'string') {
      return {
        content: [{
          type: "text",
          text: "Please provide a valid playbook ID."
        }]
      };
    }

    // Find the playbook
    const playbook = playbookMap.get(id);
    if (!playbook) {
      return {
        content: [{
          type: "text",
          text: `Playbook with ID "${id}" not found.`
        }]
      };
    }

    // Extract playbook info
    const playbookId = playbook.metadata.id || playbook.key;
    const playbookDesc = playbook.metadata.description || "";
    const playbookContent = playbook.content || "";

    // Get knowledge dependencies
    const dependencies = playbook.knowledgeDeps || [];

    // Format the playbook content
    let responseText = `# Playbook: ${playbookId}\n\n`;
    responseText += `## Description\n${playbookDesc}\n\n`;
    responseText += `## Content\n${playbookContent}\n\n`;

    // Add dependencies content if there are any
    if (dependencies.length > 0) {
      responseText += `## Knowledge Dependencies (${dependencies.length})\n\n`;

      for (const dep of dependencies) {
        const depId = dep.metadata.id || dep.key;
        const depDesc = dep.metadata.description || "";
        const depContent = dep.content || "";

        responseText += `### Knowledge: ${depId}\n`;
        responseText += `**Description**: ${depDesc}\n\n`;
        responseText += `${depContent}\n\n`;
        responseText += `---\n\n`;
      }
    } else {
      responseText += "## Knowledge Dependencies\nThis playbook has no knowledge dependencies.\n\n";
    }

    responseText += `Suggestion for agent: When executing this playbook, reference the knowledge dependencies as needed for context and specific instructions. You can structure your response to clearly indicate when you're using information from the dependencies.`;

    return {
      content: [{
        type: "text",
        text: responseText
      }]
    };
  };
}