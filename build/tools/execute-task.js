// MCP Tool: execute-task.js
// Returns a task template and all its knowledge dependencies

/**
 * Create the MCP execute tool handler for task-templates.
 * @param {Map<string, object>} taskTemplateMap - The in-memory map of task-templates
 * @returns {Function} Tool handler function
 */
export default function createExecuteTool(taskTemplateMap) {
  // Return the handler function
  return async ({ id }) => {
    // Check if the task template exists
    if (!id || typeof id !== 'string') {
      return {
        content: [{
          type: "text",
          text: "Please provide a valid task template ID."
        }]
      };
    }

    // Find the task template
    const template = taskTemplateMap.get(id);
    if (!template) {
      return {
        content: [{
          type: "text",
          text: `Task template with ID "${id}" not found.`
        }]
      };
    }

    // Extract task template info
    const templateId = template.metadata.id || template.key;
    const templateDesc = template.metadata.description || "";
    const templateContent = template.content || "";

    // Get knowledge dependencies
    const dependencies = template.knowledgeDeps || [];

    // Format the template content
    let responseText = `# Task Template: ${templateId}\n\n`;
    responseText += `## Description\n${templateDesc}\n\n`;
    responseText += `## Content\n${templateContent}\n\n`;

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
      responseText += "## Knowledge Dependencies\nThis task has no knowledge dependencies.\n\n";
    }

    responseText += `Suggestion for agent: When executing this task, reference the knowledge dependencies as needed for context and specific instructions. You can structure your response to clearly indicate when you're using information from the dependencies.`;

    return {
      content: [{
        type: "text",
        text: responseText
      }]
    };
  };
}