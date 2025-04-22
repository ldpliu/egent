import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdownFile } from "../utils/markdown.js";

// Metadata for the task catalog resource
export const taskCatalogResourceMetadata = {
  name: "Task Catalog",
  description: "Lists all supported tasks with their descriptions and examples",
  contentType: "application/json"
};

// Resource URI
const TASK_CATALOG_URI = "egent://catalog/tasks";

// Function to create the task catalog resource
export function createTaskCatalogResource(taskTemplatesBasePath) {
  // Define a wildcard template for the catalog
  return new ResourceTemplate(TASK_CATALOG_URI, {
    // Just implement list operation for the catalog
    list: async () => {
      try {
        const resources = [{
          uri: TASK_CATALOG_URI,
          name: taskCatalogResourceMetadata.name,
          description: taskCatalogResourceMetadata.description,
          contentType: taskCatalogResourceMetadata.contentType
        }];

        return { resources };
      } catch (error) {
        console.error("Error listing task catalog:", error);
        return { resources: [] };
      }
    }
  });
}

// Handler for reading the task catalog
export function handleTaskCatalogResource(taskTemplatesBasePath) {
  return async (uri) => {
    try {
      // Read all task templates from the directory
      const templateDir = taskTemplatesBasePath;
      const files = await fs.readdir(templateDir, { withFileTypes: true });

      // Array to store task information
      const tasks = [];

      // Process each template file
      for (const file of files) {
        if (file.isFile() && file.name.endsWith('.md')) {
          const filePath = path.join(templateDir, file.name);
          const templateId = path.basename(file.name, '.md');

          try {
            // Parse the template file to extract metadata and content
            const { metadata, content } = await parseMarkdownFile(filePath);

            // Extract relevant information
            tasks.push({
              id: templateId,
              name: metadata.name || templateId,
              description: metadata.description || "",
              example: metadata.example || "",
              parameters: metadata.parameters || []
            });
          } catch (parseError) {
            console.error(`Error parsing template ${templateId}:`, parseError);
            // Include error information in the task list
            tasks.push({
              id: templateId,
              name: templateId,
              description: "Error: Could not parse template",
              error: parseError.message
            });
          }
        }
      }

      // Return the catalog content
      return {
        ...taskCatalogResourceMetadata,
        contents: [{
          uri: TASK_CATALOG_URI,
          text: JSON.stringify({ tasks }, null, 2),
          contentType: "application/json"
        }]
      };
    } catch (error) {
      console.error("Error generating task catalog:", error);

      // Return error information
      return {
        error: {
          code: "InternalError",
          message: `Failed to generate task catalog: ${error.message}`
        }
      };
    }
  };
}

// Register the task catalog resource with the server
export function registerTaskCatalogResource(server, taskTemplatesBasePath) {
  server.resource(
    "task_catalog",
    createTaskCatalogResource(taskTemplatesBasePath),
    taskCatalogResourceMetadata,
    handleTaskCatalogResource(taskTemplatesBasePath)
  );
}