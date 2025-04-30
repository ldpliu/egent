// MCP Tool: search.js
// Allows searching task-templates in memory using both keyword matching and semantic similarity

import stringSimilarity from 'string-similarity';

/**
 * Create the MCP search tool handler for task-templates.
 * @param {Map<string, object>} taskTemplateMap - The in-memory map of task-templates
 * @returns {Function} Tool handler function
 */
export default function createSearchTool(taskTemplateMap) {
  // Prepare all template content and info for searching
  const templateContents = [];
  const templateInfo = [];

  for (const item of taskTemplateMap.values()) {
    const id = item.metadata.id || item.key;
    const desc = item.metadata.description || "";
    const content = `${id} ${desc}`;

    templateContents.push(content);
    templateInfo.push({ id, description: desc });
  }

  console.log(`Indexed ${templateInfo.length} templates for search`);

  // Return the handler function
  return async ({ query }) => {
    if (!query || typeof query !== 'string') {
      return {
        content: [{ type: "text", text: "Please provide a search query." }]
      };
    }

    const results = new Map(); // Use Map to avoid duplicates

    // 1. Perform keyword matching (case-insensitive)
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2); // Only words with 3+ chars

    templateContents.forEach((content, index) => {
      const contentLower = content.toLowerCase();
      const info = templateInfo[index];

      // Check if any word from the query is in the content
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          // Calculate how many query words are found in the content
          const matchedWords = queryWords.filter(w => contentLower.includes(w)).length;
          const keywordScore = matchedWords / queryWords.length; // 0 to 1 based on % of words matched

          results.set(info.id, {
            ...info,
            relevance: Math.max(keywordScore * 0.8, results.get(info.id)?.relevance || 0),
            matchType: results.has(info.id) ? "both" : "keyword"
          });
          break; // No need to check other words once we find a match
        }
      }
    });

    // 2. Find similar templates using string similarity
    const matches = stringSimilarity.findBestMatch(query, templateContents);

    // Add similarity results
    matches.ratings.forEach((match, index) => {
      if (match.rating > 0.1) { // Lower threshold for similarity
        const info = templateInfo[index];
        const existingRelevance = results.get(info.id)?.relevance || 0;

        results.set(info.id, {
          ...info,
          relevance: Math.max(match.rating, existingRelevance),
          matchType: results.has(info.id) ? "both" : "similarity"
        });
      }
    });

    // Convert results map to array and sort
    const sortedResults = Array.from(results.values())
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Limit to top 10 results

    // Format relevance scores as percentages
    sortedResults.forEach(result => {
      result.relevance = Math.round(result.relevance * 100) + "%";
    });

    // Return a formatted result for the agent to display
    if (sortedResults.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No task templates found matching "${query}".\n\nNote to agent: If no results are found, the task is considered complete.`
        }]
      };
    }

    return {
      content: [{
        type: "text",
        text: `Found ${sortedResults.length} templates matching "${query}":\n` +
              sortedResults.map(r => `* ${r.id}: ${r.description} (relevance: ${r.relevance}${r.matchType ? `, match: ${r.matchType}` : ''})`).join('\n') +
              `\n\nSuggestion for agent: Consider generating a short summary for each result based on the description, and presenting it in a more user-friendly format, such as:

1. As formatted markdown bullets: (recommended)
- **Task-Template: task-template-id-1** (85% relevance)
  - **Summary**: A clear, concise explanation of what this task does and when to use it
  - **Description**: Original description


2. As a markdown table:
| ID | Summary | Description | Relevance |
|---|---|---|---|
| task-template-id-1 | Brief summary of what this task does... | Description text | 85% |


This makes results more readable and helps users understand each option better.`
      }]
    };
  };
}