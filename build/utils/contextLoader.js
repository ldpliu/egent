import path from 'node:path';
import fs from 'node:fs/promises';
import { parseMarkdownFile } from './markdown.js';

/**
 * Recursively find all markdown files under a directory.
 * @param {string} dir - The root directory to search.
 * @returns {Promise<string[]>} - Array of absolute file paths.
 */
async function findMarkdownFiles(dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Generate a key for a markdown file based on its relative path to the root directory.
 * E.g., /abs/knowledge/tool/git.md => tool/git
 * @param {string} rootDir
 * @param {string} filePath
 * @returns {string}
 */
function getMarkdownKey(rootDir, filePath) {
  const relPath = path.relative(rootDir, filePath);
  return relPath.replace(/\\/g, '/').replace(/\.md$/, '');
}

/**
 * Load all knowledge markdown files into a Map.
 * @param {string} knowledgeRoot
 * @returns {Promise<Map<string, object>>}
 */
export async function loadAllKnowledge(knowledgeRoot) {
  const files = await findMarkdownFiles(knowledgeRoot);
  const map = new Map();
  for (const file of files) {
    const key = getMarkdownKey(knowledgeRoot, file);
    const { metadata, content } = await parseMarkdownFile(file);

    // Ensure id field exists in metadata
    metadata.id = key;

    map.set(key, { key, file, metadata, content });
  }
  return map;
}

/**
 * Load all task-template markdown files into a Map.
 * @param {string} taskTemplatesRoot
 * @returns {Promise<Map<string, object>>}
 */
export async function loadAllTaskTemplates(taskTemplatesRoot) {
  const files = await findMarkdownFiles(taskTemplatesRoot);
  const map = new Map();
  for (const file of files) {
    const key = getMarkdownKey(taskTemplatesRoot, file);
    const { metadata, content } = await parseMarkdownFile(file);

    // Ensure id field exists in metadata
    metadata.id = key;

    map.set(key, { key, file, metadata, content });
  }
  return map;
}

/**
 * Link dependencies between task templates and knowledge.
 * Adds `knowledgeDeps` to each task template (array of knowledge objects),
 * and `dependents` to each knowledge (array of task template objects).
 * @param {Map<string, object>} knowledgeMap
 * @param {Map<string, object>} taskTemplateMap
 */
export function linkDependencies(knowledgeMap, taskTemplateMap) {
  // Initialize dependents array for each knowledge
  for (const knowledge of knowledgeMap.values()) {
    knowledge.dependents = [];
  }

  for (const taskTemplate of taskTemplateMap.values()) {
    const deps = Array.isArray(taskTemplate.metadata.dependencies)
      ? taskTemplate.metadata.dependencies
      : [];
    taskTemplate.knowledgeDeps = [];
    for (const dep of deps) {
      // Only handle knowledge dependencies like 'knowledge/tool/git.md' or 'knowledge/code/repo.md'
      const match = dep.match(/^knowledge\/(.+)\.md$/);
      if (match) {
        const knowledgeKey = match[1]; // e.g., 'tool/git'
        const knowledge = knowledgeMap.get(knowledgeKey);
        if (knowledge) {
          taskTemplate.knowledgeDeps.push(knowledge);
          knowledge.dependents.push(taskTemplate);
        }
      }
    }
  }
}