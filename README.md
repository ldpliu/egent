# Egent

Egent is an MCP server that bridges **engineer teams** and **agents**.

<img src="./docs/logo.png" width="300" alt="Egent Logo">

## Table of Contents

- [Design](#design)
- [How to Use](#how-to-use)
  - [Setup](#setup)
  - [Chat with your code-agent, here I use Cursor as an example](#chat-with-your-code-agent-here-i-use-cursor-as-an-example)
  - [Recommanded Practices](#recommanded-practices)

## Design

<img src="./docs/design.png" width="800" alt="Design diagram">

Egent connects your context-repo to an MCP server, and for each of your team members, whether they use an AI IDE like Cursor, open-source tools with local models such as Cline+Ollama, or code-agents running in remote environments, they can quickly access the contextual information needed to execute tasks by configuring the Egent MCP Server.

Everyone in your team can continuously enrich and iterate the team's knowledge base by editing the context-repo (typically in the form of a GitHub repository), thereby enabling AI to automatically complete various tasks.

For details on the structure and organization of a context repository, please refer to [docs/context.md](docs/context.md).

## How to Use

### Setup

**Basic Configuration:**

To use Egent with a remote context repository:

```json
{
  "mcpServers": {
    "egent": {
      "command": "npx",
      "args": ["-y", "egent@latest", "--context-repo", "<your context repo>"]
    }
  }
}
```

**Local Development:**

For testing with a local context directory:

```json
{
  "mcpServers": {
    "egent-local": {
      "command": "npx",
      "args": [
        "-y",
        "egent@latest",
        "--context-path",
        "<your context files path>"
      ]
    }
  }
}
```

**Egent Development:**

For developing Egent itself:

```json
{
  "mcpServers": {
    "egent-dev": {
      "command": "node",
      "args": ["build/index.js", "--context-path", "<your context files path>"]
    }
  }
}
```

You can also use `inspector` to inspect the MCP resources:

```bash
npx @modelcontextprotocol/inspector node build/index.js --context-repo git@github.com:stolostron/server-foundation-dev-context.git
```

### Chat with your code-agent, here I use Cursor as an example

You can try this configuration in Cursor to see how it works.

```
{
  "mcpServers": {
    "egent": {
      "command": "npx",
      "args": ["-y", "egent@latest", "--context-repo", "git@github.com:xuezhaojun/egent-context.git"]
    }
  }
}
```

First command must be `egent_start`, to let the code-agent know you want to call Egent MCP Server.

```
egent_start Say Hi to Egent.
```

Then your code-agent will start to add a new comment on this [issue](https://github.com/xuezhaojun/egent-context/issues/2).

The interaction is like this:

<img src="./docs/example_say_hi.png" width="800" alt="Cursor interaction">

For a comprehensive overview of all tools supported by Egent, please refer to the [MCP documentation](docs/mcp.md).

### Recommanded Practices

Egent is designed to be used **across the team**, every task-template and knowledge update will enable everyone in the team to use it.

It is also recommended to use Egent for **multiple projects**, you can start you code-agent from a directory containing multiple projects.
