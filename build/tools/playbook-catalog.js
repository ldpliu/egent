// MCP Tool: playbook-catalog.js
// Returns a catalog of all available playbooks

/**
 * Create the MCP catalog tool handler for playbooks.
 * @param {Map<string, object>} playbookMap - The in-memory map of playbooks
 * @returns {Function} Tool handler function
 */
export default function createCatalogTool(playbookMap) {
  // Return the handler function
  return async () => {
    // Extract playbook info
    const playbooks = Array.from(playbookMap.values()).map(item => {
      const id = item.metadata.id || item.key;
      const description = item.content || "";
      return { id, description };
    });

    // Sort playbooks by ID for consistency
    playbooks.sort((a, b) => a.id.localeCompare(b.id));

    // Format the response
    const catalogText = playbooks.length === 0
      ? "No playbooks available."
      : `Found ${playbooks.length} playbooks:\n\n` +
        playbooks.map(p => `* **playbookID: ${p.id}** \n - description: ${p.description}`).join('\n');

    // Include formatting suggestion for the agent
    const response = catalogText;

    return {
      content: [{
        type: "text",
        text: response
      }]
    };
  };
}