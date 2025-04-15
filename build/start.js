import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// --- Resource Implementation ---

const START_INSTRUCTIONS_URI = "egent://instructions/start";
const START_MD_PATH = path.join(process.cwd(), "start.md"); // Path to your start.md

// Metadata for the resource (optional but good practice)
export const startInstructionsResourceMetadata = {
  name: "Agent Start Instructions",
  description: "The initial set of instructions guiding the Egent's behavior.",
  contentType: "text/markdown",
};

// Callback to handle read requests for the resource
async function handleReadStartInstructions(uri, extra) {
  try {
    const content = await fs.readFile(START_MD_PATH, "utf-8");
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
    console.error(`Error reading start instructions (${START_MD_PATH}):`, error);
    // Return an error structure compliant with MCP expectations
     if (error.code === 'ENOENT') {
         return {
           error: {
             code: "ResourceNotFound",
             message: `Start instructions file not found at ${START_MD_PATH}`
           }
         }
     }
    return {
        error: {
            code: "InternalError",
            message: `Failed to read start instructions: ${error.message}`
        }
      // Alternatively, return error content:
      // contents: [{
      //   uri: START_INSTRUCTIONS_URI,
      //   text: `Error loading start instructions: ${error.message}`,
      //   contentType: "text/plain",
      // }],
    };
  }
}

// Function to register the resource with the server
export function registerStartInstructionsResource(server) {
  server.resource(
    "start_instructions", // Internal name for registration
    START_INSTRUCTIONS_URI, // The fixed URI for this resource
    startInstructionsResourceMetadata, // Associated metadata
    handleReadStartInstructions // The callback function
  );
}


// --- Prompt Implementation ---

// Define the parameters the prompt accepts
const startTaskPromptArgs = {
    task_description: z.string().describe("The user's description of the task to be performed.")
};

// Callback to handle the prompt request
async function handleStartTaskPrompt(args, extra) {
    const { task_description } = args;
    try {
        // Read the start instructions content (same as the resource)
        const instructionsContent = await fs.readFile(START_MD_PATH, 'utf-8');

        // Here you can decide how to combine the instructions and the task description.
        // Option 1: Just return the instructions, ignoring the task description for now.
        // Option 2: Prepend a confirmation using the task description.
        // Option 3: (More advanced) Parse instructions and try to integrate the task.

        // Let's go with Option 2 for demonstration:
        const combinedPrompt = `Okay, I understand you want to: "${task_description}".\n\nHere are my operating instructions:\n---\n${instructionsContent}\n---\nI will now proceed according to these instructions, starting with step 1 (Match Task to Template).`;

        return {
            // Metadata for the prompt result
            name: "Start Task Execution",
            description: `Initiating task based on provided description and start instructions.`,
            // The actual content/prompt to be potentially used by the agent
            prompt: combinedPrompt
        };

    } catch (error) {
         console.error(`Error processing start_task prompt (${START_MD_PATH}):`, error);
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
        handleStartTaskPrompt // The callback function
    );
}
