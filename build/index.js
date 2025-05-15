#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// Import the sync function
import { syncContextRepo } from "./utils/githubRepoSync.js"; // Import the sync function
import path from 'path'; // Import path module
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs'; // Import fs for path checking
import { loadAllKnowledge, loadAllPlaybooks, linkDependencies } from './utils/loader.js';
import createCatalogTool from './tools/playbook-catalog.js';
import createExecuteTool from './tools/execute.js';
import createStartTool from './tools/start.js';
import { z } from "zod";

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('playbook-repo', {
    alias: 'c',
    type: 'string',
    description: 'URL of the Git repository containing playbook resources',
    default: process.env.PLAYBOOKMCP_PLAYBOOK_REPO
  })
  .option('playbook-repo-ref', {
    alias: 'r',
    type: 'string',
    description: 'Branch, tag, or commit hash in the playbook repository',
    default: process.env.PLAYBOOKMCP_PLAYBOOK_REPO_REF
  })
  .option('playbook-path', {
    alias: 'p',
    type: 'string',
    description: 'Path to a local directory containing playbook resources',
    default: process.env.PLAYBOOKMCP_PLAYBOOK_PATH
  })
  .help()
  .alias('help', 'h')
  .argv;

let playbookBasePath;
let knowledgeMap;
let playbookMap;

async function initializeContext() {
  if (argv.playbookRepo) {
    try {
      playbookBasePath = await syncContextRepo(argv.playbookRepo, argv.playbookRepoRef);
    } catch (error) {
      console.error('Fatal: Could not synchronize playbook repository. Exiting.', error);
      process.exit(1);
    }
  } else if (argv.playbookPath) {
    const localPath = path.resolve(argv.playbookPath);
    try {
      const stats = fs.statSync(localPath);
      if (!stats.isDirectory()) {
        console.error(`Fatal: Provided playbook path is not a directory: ${localPath}`);
        process.exit(1);
      }
      playbookBasePath = localPath;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`Fatal: Provided playbook path does not exist: ${localPath}`);
      } else {
        console.error(`Fatal: Error accessing playbook path ${localPath}:`, error);
      }
      process.exit(1);
    }
  } else {
    playbookBasePath = process.cwd();
    try {
        fs.statSync(path.join(playbookBasePath, 'knowledge'));
        fs.statSync(path.join(playbookBasePath, 'playbooks'));
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Fatal: Playbook path does not exist: ${playbookBasePath}`);
            process.exit(1);
        }
    }
  }
  // Load all knowledge and playbooks into memory
  knowledgeMap = await loadAllKnowledge(path.join(playbookBasePath, 'knowledge'));
  playbookMap = await loadAllPlaybooks(path.join(playbookBasePath, 'playbooks'));
  linkDependencies(knowledgeMap, playbookMap);
}

async function main() {
  await initializeContext();

  const server = new McpServer({
    name: "playbookmcp",
    version: "0.1.0"
  });

  // Register the MCP Tool: pb_catalogs
  server.tool(
    "pb_catalogs",
    {},  // No parameters needed
    createCatalogTool(playbookMap)
  );

  // Register the MCP Tool: pb_execute
  server.tool(
    "pb_execute",
    { id: z.string() },
    createExecuteTool(playbookMap)
  );

  // Register the MCP Tool: pb_start
  server.tool(
    "pb_start",
    { user_task: z.string() },
    createStartTool()
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error("playbookmcp failed to start:", err);
  process.exit(1);
});
