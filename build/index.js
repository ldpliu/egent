#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// Import the sync function
import { syncContextRepo } from "./utils/gitContextSync.js"; // Import the sync function
import path from 'path'; // Import path module
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs'; // Import fs for path checking
import { loadAllKnowledge, loadAllTaskTemplates, linkDependencies } from './utils/contextLoader.js';
import createSearchTool from './tools/search.js';
import createCatalogTool from './tools/task-templates-catalog.js';
import createExecuteTool from './tools/execute-task.js';
import createStartTool from './tools/start.js';
import { z } from "zod";

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

let contextBasePath;
let knowledgeMap;
let taskTemplateMap;

async function initializeContext() {
  if (argv.contextRepo) {
    try {
      contextBasePath = await syncContextRepo(argv.contextRepo, argv.contextRepoRef);
    } catch (error) {
      console.error('Fatal: Could not synchronize context repository. Exiting.', error);
      process.exit(1);
    }
  } else if (argv.contextPath) {
    const localPath = path.resolve(argv.contextPath);
    try {
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
    contextBasePath = process.cwd();
    try {
        fs.statSync(path.join(contextBasePath, 'knowledge'));
        fs.statSync(path.join(contextBasePath, 'task-templates'));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Log line removed
        }
    }
  }
  // Load all knowledge and task-templates into memory
  knowledgeMap = await loadAllKnowledge(path.join(contextBasePath, 'knowledge'));
  taskTemplateMap = await loadAllTaskTemplates(path.join(contextBasePath, 'task-templates'));
  linkDependencies(knowledgeMap, taskTemplateMap);
}

async function main() {
  await initializeContext();

  const server = new McpServer({
    name: "Egent",
    version: "0.1.0"
  });

  // Register the MCP Tool: egent_search (simple name, no slash)
  server.tool(
    "egent_search",
    { query: z.string() },
    createSearchTool(taskTemplateMap)
  );

  // Register the MCP Tool: egent_catalogs
  server.tool(
    "egent_catalogs",
    {},  // No parameters needed
    createCatalogTool(taskTemplateMap)
  );

  // Register the MCP Tool: egent_execute
  server.tool(
    "egent_execute",
    { id: z.string() },
    createExecuteTool(taskTemplateMap)
  );

  // Register the MCP Tool: egent_start
  server.tool(
    "egent_start",
    { user_task: z.string() },
    createStartTool()
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error("Egent failed to start:", err);
  process.exit(1);
});
