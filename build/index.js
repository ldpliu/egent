import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createKnowledgeResource, knowledgeResourceMetadata, handleKnowledgeResource } from "./resources/knowledge.js";

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

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
