import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from 'js-yaml';

// Create an MCP server
const server = new McpServer({
  name: "Egent",
  version: "0.0.1"
});

// Parse frontmatter and content from Markdown files
async function parseMarkdownFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');

  // Look for frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);

  let metadata = {};
  let markdownContent = content;

  if (frontmatterMatch) {
    try {
      metadata = yaml.load(frontmatterMatch[1]) || {};
      // Remove frontmatter, keep only Markdown content
      markdownContent = content.substring(frontmatterMatch[0].length);
    } catch (error) {
      console.error(`Error parsing frontmatter in ${filePath}:`, error);
    }
  }

  return { metadata, content: markdownContent };
}

// Split Markdown content into sections based on headings
function splitMarkdownIntoSections(content, baseUri) {
  // Use regex to find all headings
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;

  const sections = [];
  let currentMatch;
  let matches = [];

  // Collect all matches
  while ((currentMatch = headerRegex.exec(content)) !== null) {
    matches.push({
      level: currentMatch[1].length,
      title: currentMatch[2],
      index: currentMatch.index
    });
  }

  // If no headings found, return the entire content as one section
  if (matches.length === 0) {
    return [{
      uri: baseUri,
      text: content,
      contentType: "text/markdown"
    }];
  }

  // Process matches and create sections
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = i < matches.length - 1 ? matches[i + 1] : null;

    // Determine the end position of the section content
    const endIndex = nextMatch ? nextMatch.index : content.length;

    // Extract section content (including the heading)
    const sectionContent = content.substring(match.index, endIndex);

    // Generate section ID (for URI fragment)
    const sectionId = match.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-');    // Replace spaces with hyphens

    sections.push({
      uri: `${baseUri}#${sectionId}`,
      text: sectionContent,
      contentType: "text/markdown"
    });
  }

  return sections;
}

// Register knowledge base resource handler
server.resource(
  "knowledge",
  new ResourceTemplate("knowledge://{category}/{topic}", {
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
  }),
  // Add resource metadata
  {
    contentType: "text/markdown"
  },
  // Handle read requests
  async (uri, { category, topic }) => {
    try {
      // Build file path
      const filePath = path.join(process.cwd(), "knowledge", category, `${topic}.md`);

      // Parse Markdown file
      const { metadata, content } = await parseMarkdownFile(filePath);

      // Split Markdown into sections based on headings
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
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
