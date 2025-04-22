#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createKnowledgeResource, knowledgeResourceMetadata, handleKnowledgeResource } from "./resources/knowledge.js";
// Import the new task template resource handlers
import { createTaskTemplateResource, taskTemplateResourceMetadata, handleTaskTemplateResource } from "./resources/task-templates.js";
// Import the new registration functions
import { registerStartInstructionsResource, registerStartTaskPrompt } from "./start.js"; // Adjust path if needed
import { syncContextRepo } from "./utils/gitContextSync.js"; // Import the sync function
import path from 'path'; // Import path module
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs'; // Import fs for path checking

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('context-repo', {
    alias: 'c',
    type: 'string',
    description: 'URL of the Git repository containing context resources',
    default: process.env.EGENT_CONTEXT_REPO
  })
  .option('context-repo-ref', {
    alias: 'r',
    type: 'string',
    description: 'Branch, tag, or commit hash in the context repository',
    default: process.env.EGENT_CONTEXT_REF
  })
  .option('context-path', {
    alias: 'p',
    type: 'string',
    description: 'Path to a local directory containing context resources',
    default: process.env.EGENT_CONTEXT_PATH
  })
  .help()
  .alias('help', 'h')
  .argv;

// Determine the base path for context resources
let contextBasePath;

async function initializeContext() {
  if (argv.contextRepo) {
    // Priority 1: Use Git Repo
    try {
      contextBasePath = await syncContextRepo(argv.contextRepo, argv.contextRepoRef);
    } catch (error) {
      console.error('Fatal: Could not synchronize context repository. Exiting.', error);
      process.exit(1);
    }
  } else if (argv.contextPath) {
    // Priority 2: Use local path specified by --context-path
    const localPath = path.resolve(argv.contextPath);
    try {
      // Check if path exists and is a directory
      const stats = fs.statSync(localPath);
      if (!stats.isDirectory()) {
        console.error(`Fatal: Provided context path is not a directory: ${localPath}`);
        process.exit(1);
      }
      contextBasePath = localPath;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`Fatal: Provided context path does not exist: ${localPath}`);
      } else {
        console.error(`Fatal: Error accessing context path ${localPath}:`, error);
      }
      process.exit(1);
    }
  } else {
    // Priority 3: Default to CWD
    contextBasePath = process.cwd();
    // Optional: Add checks here to warn if ./knowledge or ./task-templates don't exist in CWD
    try {
        fs.statSync(path.join(contextBasePath, 'knowledge'));
        fs.statSync(path.join(contextBasePath, 'task-templates'));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Log line removed
        }
    }
  }
}

async function main() {
  await initializeContext();

  // Create an MCP server
  const server = new McpServer({
    name: "Egent",
    version: "0.0.1"
  });

  // --- Resource Registration ---
  // We now need to pass the contextBasePath to the resource handlers
  // Note: The resource handler functions need to be updated to accept this path

  // Register knowledge base resource handler
  server.resource(
    "knowledge",
    createKnowledgeResource(path.join(contextBasePath, 'knowledge')), // Pass path
    knowledgeResourceMetadata,
    handleKnowledgeResource(path.join(contextBasePath, 'knowledge'))  // Pass path
  );

  // Register task template resource handler
  server.resource(
    "task-template",
    createTaskTemplateResource(path.join(contextBasePath, 'task-templates')), // Pass task-templates path
    taskTemplateResourceMetadata,
    // Pass BOTH task-templates path AND knowledge path to the factory
    handleTaskTemplateResource(
      path.join(contextBasePath, 'task-templates'), // taskTemplatesBasePath
      path.join(contextBasePath, 'knowledge')       // knowledgeBasePath
    )
  );

  // Register the start instructions resource
  registerStartInstructionsResource(server);

  // Register the start task prompt
  registerStartTaskPrompt(server);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error("Egent failed to start:", err);
  process.exit(1);
});
