import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// --- Resource Implementation ---

const START_INSTRUCTIONS_URI = "egent://instructions/start";
const START_MD_PATH = path.join(process.cwd(), "start.md"); // Revert to using CWD for start.md

// Metadata for the resource (optional but good practice)
export const startInstructionsResourceMetadata = {
  name: "Agent Start Instructions",
  description: "Any message from the user start with `egent:` must trigger read this instruction first",
  contentType: "text/markdown",
};

// Callback factory to handle read requests for the resource
async function handleReadStartInstructions(uri, extra) {
  const startMdPath = START_MD_PATH; // Use the path defined above
  try {
    const content = await fs.readFile(startMdPath, "utf-8");
    return {
      // Include metadata defined above
      ...startInstructionsResourceMetadata,
      // Provide the actual content
      contents: [
        {
          uri: START_INSTRUCTIONS_URI, // Use the resource's own URI
          text: content,
          contentType: "text/markdown",
        },
      ],
    };
  } catch (error) {
    console.error(`Error reading start instructions (${startMdPath}):`, error);
    // Return an error structure compliant with MCP expectations
     if (error.code === 'ENOENT') {
         return {
           error: {
             code: "ResourceNotFound",
             message: `Start instructions file not found at ${startMdPath}`
           }
         }
     }
    return {
        error: {
            code: "InternalError",
            message: `Failed to read start instructions: ${error.message}`
        }
    };
  }
}

// Function to register the resource with the server
export function registerStartInstructionsResource(server) {
  server.resource(
    "start_instructions", // Internal name for registration
    START_INSTRUCTIONS_URI, // The fixed URI for this resource
    startInstructionsResourceMetadata, // Associated metadata
    handleReadStartInstructions // Pass the handler directly
  );
}


// --- Prompt Implementation ---

// Define the parameters the prompt accepts
const startTaskPromptArgs = {
    task_description: z.string().describe("The user's description of the task to be performed.")
};

// Check if input is an egent command and get the command type
function parseEgentCommand(input) {
  if (typeof input !== 'string' || !input.trim().toLowerCase().startsWith('egent:')) {
    return null;
  }

  const command = input.trim().substring(6).trim().toLowerCase();

  if (command === 'list tasks' || command === 'tasks') {
    return { type: 'list_tasks' };
  }

  if (command === 'help') {
    return { type: 'help' };
  }

  if (command === 'status') {
    return { type: 'status' };
  }

  if (command === 'reset') {
    return { type: 'reset' };
  }

  // For other egent commands, return generic type
  return { type: 'other', command };
}

// Callback factory to handle the prompt request
async function handleStartTaskPrompt(args, extra) {
  const { task_description } = args;
  const startMdPath = START_MD_PATH; // Use the path defined above

  // Check if this is an egent command
  const parsedCommand = parseEgentCommand(task_description);

  try {
    // Read the start instructions content
    const instructionsContent = await fs.readFile(startMdPath, 'utf-8');

    // If this is an egent command
    if (parsedCommand) {
      // Create specific prompt based on command type
      let commandPrompt;

      switch (parsedCommand.type) {
        case 'list_tasks':
          commandPrompt = `I notice this is a command to list available tasks. I should follow these steps:
1. Read the task catalog using \`read egent://catalog/tasks\`
2. Format the list of tasks with their descriptions and examples
3. Present the information in a clear, organized way

Instructions from start.md:
---
${instructionsContent}
---`;
          break;

        case 'help':
          commandPrompt = `I notice this is a request for help. I should display information about available commands and my capabilities.

Instructions from start.md:
---
${instructionsContent}
---`;
          break;

        case 'status':
        case 'reset':
        case 'other':
        default:
          commandPrompt = `I recognize this is an egent command: "${task_description.trim().substring(6).trim()}".

Instructions from start.md:
---
${instructionsContent}
---

I will process this command according to these instructions.`;
      }

      return {
        name: "Process Egent Command",
        description: "Processing an egent special command",
        prompt: commandPrompt
      };
    }

    // Regular task handling (non-egent prefixed)
    const combinedPrompt = `Okay, I understand you want to: "${task_description}".\n\nHere are my operating instructions:\n---\n${instructionsContent}\n---\nI will now proceed according to these instructions, starting with step 1 (Match Task to Template).`;

    return {
      name: "Start Task Execution",
      description: `Initiating task based on provided description and start instructions.`,
      prompt: combinedPrompt
    };

  } catch (error) {
    console.error(`Error processing start_task prompt (${startMdPath}):`, error);
    return {
      name: "Error Starting Task",
      description: "Failed to load instructions for starting the task.",
      prompt: `Error: Could not load start instructions. ${error.message}`
    }
  }
}

// Function to register the prompt with the server
export function registerStartTaskPrompt(server) {
    server.prompt(
        "start_task", // The name the client will use to call the prompt
        "Initiates a task using the standard start instructions and a user-provided description.", // Description
        startTaskPromptArgs, // Parameter schema
        handleStartTaskPrompt // Pass the handler directly
    );
}

// Define arguments for the list tasks prompt
const listTasksPromptArgs = {
  format: z.enum(['table', 'list', 'json']).optional().describe('The format to display tasks in.')
};

// Handler for listing tasks
async function handleListTasksPrompt(args, extra) {
  try {
    // Create a formatted prompt to list tasks
    return {
      name: "List Available Tasks",
      description: "Displaying all available task templates with descriptions and examples",
      prompt: `I should list all available task templates. I'll use the task catalog resource (egent://catalog/tasks) to retrieve the list, then format and display it in a clear way.

The user wants to see all available tasks, their descriptions, and examples.`
    };
  } catch (error) {
    console.error("Error handling list_tasks prompt:", error);
    return {
      name: "Error Listing Tasks",
      description: "Failed to create prompt for listing tasks",
      prompt: `Error: Failed to create task listing prompt. ${error.message}`
    };
  }
}

// Function to register the list tasks prompt
export function registerListTasksPrompt(server) {
  server.prompt(
    "list_tasks",
    "Lists all available task templates with their descriptions and examples",
    listTasksPromptArgs,
    handleListTasksPrompt
  );
}
