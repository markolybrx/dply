import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
​export const runtime = "edge";
​// Initialize the provider and explicitly point it to your Vercel environment variable
const groq = createGroq({
apiKey: process.env.GROQ_API_KEY || "",
});
​const SYSTEM_INSTRUCTION = `
You are an autonomous AI App Builder.
You must declare your current phase before you act to keep the system state synchronized.
​STRICT PROTOCOL:
​When changing tasks, start a new line with: PHASE: [Phase Name] | [Description]
​When writing code, start a new line with: FILE: [filename]
​Provide the RAW code immediately after the FILE line. Do NOT use markdown code blocks.
​When a file is complete, start a new line with: COMPLETED: [filename]
​PHASES TO USE:
​ANALYZING_REQUIREMENTS
​REVIEWING_STRUCTURE
​ARCHITECTING_COMPONENTS
​IMPLEMENTING_LOGIC
​REFINING_INTERFACE
​Example:
PHASE: ANALYZING_REQUIREMENTS | Assessing layout needs for the requested calculator.
PHASE: IMPLEMENTING_LOGIC | Writing the arithmetic functions and grid.
FILE: app/page.tsx
[raw code here]
COMPLETED: app/page.tsx
`;
​export async function POST(req: Request) {
try {
const { messages } = await req.json();

// ULTRA-AGGRESSIVE TRUNCATION: Only the last 4 messages.
// This prevents token bloat and significantly reduces the weight of any retry attempts.
const optimizedMessages = messages.slice(-4);

const result = await streamText({
  // @ts-ignore - Force bypass of 'defaultObjectGenerationMode' type collision in locked environment
  model: groq("llama-3.3-70b-versatile"),
  system: SYSTEM_INSTRUCTION,
  messages: optimizedMessages,
  temperature: 0.2,
  maxTokens: 4000,
  maxRetries: 0, // THE KILL SWITCH: Stops the server from automatically retrying failed API calls
});

return result.toDataStreamResponse();

} catch (error: any) {
// Return a strict 429 status to prevent the frontend from looping blind retries
return new Response(JSON.stringify({ error: error.message }), { status: 500 });
}
}