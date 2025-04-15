import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createKnowledgeResource, knowledgeResourceMetadata, handleKnowledgeResource } from "./resources/knowledge.js";
// Import the new task template resource handlers
import { createTaskTemplateResource, taskTemplateResourceMetadata, handleTaskTemplateResource } from "./resources/task-templates.js";

// Create an MCP server
const server = new McpServer({
  name: "Egent",
  version: "0.0.1"
});

// Register knowledge base resource handler
server.resource(
  "knowledge",
  createKnowledgeResource(),
  knowledgeResourceMetadata,
  handleKnowledgeResource
);

// Register task template resource handler
server.resource(
  "task-template",
  createTaskTemplateResource(),
  taskTemplateResourceMetadata,
  handleTaskTemplateResource
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
