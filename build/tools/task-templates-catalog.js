// MCP Tool: task-templates-catalog.js
// Returns a catalog of all available task templates

/**
 * Create the MCP catalog tool handler for task-templates.
 * @param {Map<string, object>} taskTemplateMap - The in-memory map of task-templates
 * @returns {Function} Tool handler function
 */
export default function createCatalogTool(taskTemplateMap) {
  // Return the handler function
  return async () => {
    // Extract task template info
    const templates = Array.from(taskTemplateMap.values()).map(item => {
      const id = item.metadata.id || item.key;
      const description = item.metadata.description || "";
      return { id, description };
    });

    // Sort templates by ID for consistency
    templates.sort((a, b) => a.id.localeCompare(b.id));

    // Format the response
    const catalogText = templates.length === 0
      ? "No task templates available."
      : `Found ${templates.length} task templates:\n\n` +
        templates.map(t => `* **${t.id}**: ${t.description}`).join('\n');

    // Include formatting suggestion for the agent
    const response = catalogText + `\n\nSuggestion for agent: Consider formatting this catalog as a table for better readability:

| ID | Description |
|---|---|
${templates.map(t => `| ${t.id} | ${t.description} |`).join('\n')}

This makes the catalog easier to scan and understand.`;

    return {
      content: [{
        type: "text",
        text: response
      }]
    };
  };
}