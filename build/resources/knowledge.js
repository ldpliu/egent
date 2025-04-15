import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import path from "node:path";
import fs from "node:fs/promises";
import { parseMarkdownFile, splitMarkdownIntoSections } from "../utils/markdown.js";

// Create and export the knowledge resource handler
export function createKnowledgeResource() {
  return new ResourceTemplate("knowledge://{category}/{topic}", {
    // Provide listing capability for enumerating resources
    list: async () => {
      try {
        // Get knowledge directory listing
        const knowledgeDir = path.join(process.cwd(), "knowledge");
        const categories = await fs.readdir(knowledgeDir, { withFileTypes: true });

        const resources = [];

        // Iterate through each category (e.g., tool, code)
        for (const category of categories) {
          if (category.isDirectory()) {
            const categoryPath = path.join(knowledgeDir, category.name);
            const files = await fs.readdir(categoryPath, { withFileTypes: true });

            // Iterate through each Markdown file
            for (const file of files) {
              if (file.isFile() && file.name.endsWith('.md')) {
                const filePath = path.join(categoryPath, file.name);
                // Use the imported parseMarkdownFile
                const { metadata } = await parseMarkdownFile(filePath);

                // Use name from metadata, or fallback to filename (without extension)
                const name = metadata.name || path.basename(file.name, '.md');
                const topic = path.basename(file.name, '.md');

                resources.push({
                  uri: `knowledge://${category.name}/${topic}`,
                  name,
                  description: metadata.description || `${name} knowledge resource`,
                  contentType: "text/markdown"
                });
              }
            }
          }
        }

        return { resources };
      } catch (error) {
        console.error("Error listing knowledge resources:", error);
        return { resources: [] };
      }
    },

    // Optional: Add autocompletion functionality to help clients discover available resources
    complete: {
      category: async () => {
        try {
          const knowledgeDir = path.join(process.cwd(), "knowledge");
          const categories = await fs.readdir(knowledgeDir, { withFileTypes: true });
          return categories
            .filter(entry => entry.isDirectory())
            .map(dir => dir.name);
        } catch (error) {
          console.error("Error completing categories:", error);
          return [];
        }
      },

      topic: async (value, { category }) => {
        try {
          if (!category) return [];

          const categoryPath = path.join(process.cwd(), "knowledge", category);
          const files = await fs.readdir(categoryPath, { withFileTypes: true });

          return files
            .filter(file => file.isFile() && file.name.endsWith('.md'))
            .map(file => path.basename(file.name, '.md'));
        } catch (error) {
          console.error("Error completing topics:", error);
          return [];
        }
      }
    }
  });
}

// Export the resource metadata
export const knowledgeResourceMetadata = {
  contentType: "text/markdown"
};

// Export the resource handler
export async function handleKnowledgeResource(uri, { category, topic }) {
  try {
    // Build file path
    const filePath = path.join(process.cwd(), "knowledge", category, `${topic}.md`);

    // Parse Markdown file using the imported function
    const { metadata, content } = await parseMarkdownFile(filePath);

    // Split Markdown into sections based on headings using the imported function
    const sections = splitMarkdownIntoSections(content, uri.href);

    // Add a metadata entry providing overall document information
    const name = metadata.name || topic;
    const description = metadata.description || `${topic} knowledge resource`;

    // Create metadata section for the contents array
    const metaSection = {
      uri: `${uri.href}#meta`,
      text: JSON.stringify({
        name,
        description,
        category,
        topic,
        ...metadata // Include any other metadata
      }, null, 2),
      contentType: "application/json"
    };

    // Return content list WITH the metadata section
    return {
      // Add metadata at the resource level as well
      name: name,
      description: description,
      contentType: "text/markdown",
      // Include meta item as the first content item
      contents: [metaSection, ...sections]
    };
  } catch (error) {
    console.error(`Error reading knowledge resource:`, error);
    return {
      contents: [{
        uri: uri.href,
        text: `Could not load knowledge resource: ${category}/${topic}. Error: ${error.message}`,
        contentType: "text/plain"
      }]
    };
  }
}