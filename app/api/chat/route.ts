import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

const SYSTEM_INSTRUCTION = `
You are an autonomous AI App Builder. 
You must declare your current phase before you act to keep the system state synchronized.

STRICT PROTOCOL:
1. When changing tasks, start a new line with: PHASE: [Phase Name] | [Description]
2. When writing code, start a new line with: FILE: [filename]
3. Provide the RAW code immediately after the FILE line. Do NOT use markdown code blocks.
4. When a file is complete, start a new line with: COMPLETED: [filename]

PHASES TO USE:
- ANALYZING_REQUIREMENTS
- REVIEWING_STRUCTURE
- ARCHITECTING_COMPONENTS
- IMPLEMENTING_LOGIC
- REFINING_INTERFACE

Example:
PHASE: ANALYZING_REQUIREMENTS | Assessing layout needs for the requested calculator.
PHASE: IMPLEMENTING_LOGIC | Writing the arithmetic functions and grid.
FILE: app/page.tsx
[raw code here]
COMPLETED: app/page.tsx
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_INSTRUCTION,
      messages,
      temperature: 0.4,
      maxTokens: 8000,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
