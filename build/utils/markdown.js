import fs from "node:fs/promises";
import yaml from 'js-yaml';

// Parse frontmatter and content from Markdown files
export async function parseMarkdownFile(filePath) {
  let content;
  try {
      content = await fs.readFile(filePath, 'utf-8');
  } catch (readError) {
      console.error(`Error reading file ${filePath}:`, readError);
      // Re-throw or return an error structure if preferred
      throw new Error(`Failed to read file: ${filePath}`);
  }


  // Look for frontmatter using a more robust regex
  const frontmatterMatch = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);

  let metadata = {};
  let markdownContent = content;

  if (frontmatterMatch) {
    try {
      metadata = yaml.load(frontmatterMatch[1]) || {};
      // Remove frontmatter, keep only Markdown content after the second --- line
      markdownContent = content.substring(frontmatterMatch[0].length);
    } catch (yamlError) {
      // Log the error but allow processing to continue without frontmatter
      console.error(`Error parsing YAML frontmatter in ${filePath}:`, yamlError);
      // Optionally, you might want to signal that frontmatter parsing failed
      // metadata.parseError = yamlError.message;
    }
  }

  return { metadata, content: markdownContent.trim() }; // Trim resulting content
}

// Split Markdown content into sections based on headings (h1-h6)
export function splitMarkdownIntoSections(content, baseUri) {
  // Regex to find Markdown headings (h1-h6)
  // Handles optional spaces after # and captures the title
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;

  const sections = [];
  let matches = Array.from(content.matchAll(headerRegex));

  // If no headings are found, return the entire content as a single section
  if (matches.length === 0) {
    // Ensure baseUri is valid before using it
    const sectionUri = baseUri ? `${baseUri}#content` : 'urn:uuid:' + crypto.randomUUID() + '#content';
    return [{
      uri: sectionUri, // Use a default fragment ID
      text: content.trim(), // Trim content here too
      contentType: "text/markdown"
    }];
  }

  // Process matches to create sections
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = i < matches.length - 1 ? matches[i + 1] : null;

    const level = match[1].length; // Heading level (1-6)
    const title = match[2].trim(); // Heading title
    const startIndex = match.index; // Starting index of the heading line

    // Determine the end index of the current section's content
    // It ends where the next heading starts, or at the end of the content
    const sectionEndIndex = nextMatch ? nextMatch.index : content.length;

    // Extract the section content (from the start of the heading line to the start of the next)
    const sectionContent = content.substring(startIndex, sectionEndIndex).trim();

    // Generate a URI fragment (section ID) from the heading title
    const safeTitle = title || 'section'; // Fallback if title is empty
    const sectionId = safeTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except space/hyphen
      .replace(/\s+/g, '-')    // Replace spaces/whitespace with hyphens
      .replace(/-+/g, '-')     // Collapse multiple hyphens
      .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens

    // Ensure baseUri is valid
    const baseSectionUri = baseUri || 'urn:uuid:' + crypto.randomUUID();

    sections.push({
      // Ensure unique fragment, even if titles are the same
      uri: `${baseSectionUri}#${sectionId || 'section'}-${i}`,
      text: sectionContent,
      contentType: "text/markdown",
      // Optional: Add metadata about the section
      metadata: {
          headingLevel: level,
          headingTitle: title
      }
    });
  }

  return sections;
}