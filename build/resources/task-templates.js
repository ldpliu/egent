import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs/promises";
import path from "node:path";
import { parseMarkdownFile, splitMarkdownIntoSections } from "../utils/markdown.js";

// Create a task template resource handler
export function createTaskTemplateResource() {
  // Use a wildcard template to capture any .md file in task-templates
  return new ResourceTemplate("task-template://{templateId}", {
    list: async () => {
      try {
        const templateDir = path.join(process.cwd(), "task-templates");
        const files = await fs.readdir(templateDir, { withFileTypes: true });

        const resources = [];

        for (const file of files) {
          if (file.isFile() && file.name.endsWith('.md')) {
            const filePath = path.join(templateDir, file.name);
            // A quick parse just for name/description might be too slow here,
            // consider caching or simpler listing if performance is an issue.
            const { metadata } = await parseMarkdownFile(filePath);

            const templateId = path.basename(file.name, '.md');
            const name = metadata.name || templateId;

            resources.push({
              uri: `task-template://${templateId}`,
              name,
              description: metadata.description || `Task template: ${name}`,
              contentType: "text/markdown" // Base type, actual content might be mixed
            });
          }
        }

        return { resources };
      } catch (error) {
        console.error("Error listing task templates:", error);
        return { resources: [] };
      }
    },

    complete: {
      templateId: async () => {
        try {
          const templateDir = path.join(process.cwd(), "task-templates");
          const files = await fs.readdir(templateDir, { withFileTypes: true });

          return files
            .filter(file => file.isFile() && file.name.endsWith('.md'))
            .map(file => path.basename(file.name, '.md'));
        } catch (error) {
          console.error("Error completing template IDs:", error);
          return [];
        }
      }
      // Parameter completion could be added dynamically based on metadata
    }
  });
}

// Task template resource metadata (can be generic)
export const taskTemplateResourceMetadata = {
  contentType: "text/markdown" // Base content type
};

// Helper to parse dependency string like "knowledge/category/topic.md"
function parseDependencyString(depString) {
  const parts = depString.split('/');
  if (parts.length >= 3 && parts[0] === 'knowledge') {
    const topicFile = parts[parts.length - 1];
    const topic = path.basename(topicFile, '.md');
    const category = parts.slice(1, -1).join('/'); // Handle nested categories if needed
    return { type: 'knowledge', category, topic };
  }
  return null; // Or throw an error for invalid format
}

// Function to get content of a knowledge dependency
async function getKnowledgeDependencyContent(category, topic) {
  try {
    const filePath = path.join(process.cwd(), "knowledge", category, `${topic}.md`);
    const { metadata, content } = await parseMarkdownFile(filePath);
    const baseUri = `knowledge://${category}/${topic}`; // Base URI for sections
    const sections = splitMarkdownIntoSections(content, baseUri);

    // Add a marker or modify URIs to indicate this is dependency content
    const dependencySections = sections.map(section => ({
      ...section,
      // Example: Add metadata or adjust URI
      uri: section.uri.replace('knowledge://', 'knowledge-dep://'),
      metadata: { dependencySource: `knowledge://${category}/${topic}`, ...metadata }
    }));

    // Optional: Add a meta section for the dependency itself
    const dependencyMetaSection = {
        uri: `knowledge-dep://${category}/${topic}#meta`,
        text: JSON.stringify({
          name: metadata.name || topic,
          description: metadata.description || `Knowledge resource: ${topic}`,
          category,
          topic,
          ...metadata
        }, null, 2),
        contentType: "application/json",
        metadata: { dependencySource: `knowledge://${category}/${topic}` }
      };


    return [dependencyMetaSection, ...dependencySections];
  } catch (error) {
    console.error(`Error fetching knowledge dependency ${category}/${topic}:`, error);
    // Return an error marker section
    return [{
      uri: `error://knowledge/${category}/${topic}`,
      text: `Failed to load knowledge dependency: ${category}/${topic}. Error: ${error.message}`,
      contentType: "text/plain",
      metadata: { dependencyError: true }
    }];
  }
}


// Handle task template resource requests, including dependencies
export async function handleTaskTemplateResource(uri, { templateId }) {
    // Note: This implementation doesn't handle URI parameters yet.
    // Add parameter handling logic here if needed, similar to previous examples.
  try {
    // Build file path for the task template
    const templateFilePath = path.join(process.cwd(), "task-templates", `${templateId}.md`);

    // Parse the main task template Markdown file
    let metadata, content;
    try {
        ({ metadata, content } = await parseMarkdownFile(templateFilePath));
    } catch (parseError) {
        // Handle file not found specifically
        console.error(`Error reading task template: ${templateId}`, parseError);
        return {
          contents: [{
            uri: uri.href,
            text: `Could not load task template: ${templateId}. Error: ${parseError.message}`,
            contentType: "text/plain"
          }]
        };
    }

    // Split the main task content into sections
    const taskSections = splitMarkdownIntoSections(content, uri.href);

    // Process dependencies
    const dependencies = metadata.dependencies || [];
    let dependencyContents = [];

    for (const depString of dependencies) {
      const parsedDep = parseDependencyString(depString);
      if (parsedDep && parsedDep.type === 'knowledge') {
        const depContentSections = await getKnowledgeDependencyContent(parsedDep.category, parsedDep.topic);
        dependencyContents = dependencyContents.concat(depContentSections);
      } else {
        console.warn(`Skipping unsupported dependency format: ${depString}`);
        // Optionally add a marker for skipped dependencies
         dependencyContents.push({
            uri: `error://dependency/skipped/${depString.replace(/[^a-zA-Z0-9]/g, '-')}`,
            text: `Skipped dependency (unsupported format): ${depString}`,
            contentType: "text/plain",
            metadata: { dependencySkipped: true }
         });
      }
    }

    // Create metadata section for the main task template
    const metaSection = {
      uri: `${uri.href}#meta`,
      text: JSON.stringify({
        name: metadata.name || templateId,
        description: metadata.description || `Task template: ${templateId}`,
        parameters: metadata.parameters || [], // Include parameter definitions
        dependencies: metadata.dependencies || [], // List raw dependencies
        // Add other relevant metadata from the template file
        ...metadata
      }, null, 2),
      contentType: "application/json"
    };

    // Combine meta, task sections, and dependency sections
    const allContents = [metaSection, ...taskSections, ...dependencyContents];

    return {
      name: metadata.name || templateId,
      description: metadata.description || `Task template: ${templateId}`,
      contentType: "text/markdown", // Base type, contents list has mixed types
      contents: allContents
    };
  } catch (error) {
    console.error(`Error reading task template resource:`, error);
    // Check if it's a file not found error
     if (error.code === 'ENOENT') {
         return {
           error: {
             code: "ResourceNotFound",
             message: `Task template not found: ${templateId}`
           }
         }
     }
    // Return a generic error response
    return {
      contents: [{
        uri: uri.href,
        text: `Could not load task template: ${templateId}. Error: ${error.message}`,
        contentType: "text/plain"
      }]
    };
  }
}
