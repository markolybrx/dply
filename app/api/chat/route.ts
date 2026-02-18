import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    const geminiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { maxOutputTokens: 8000, temperature: 0.4 }
    });

    const formattedHistory = messages.map((msg: Message) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const promptWithSystem = [
      ...formattedHistory.slice(0, -1),
      {
        role: "user",
        parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser Request: " + lastMessage.content }]
      }
    ];

    const geminiStream = await geminiModel.generateContentStream({ contents: promptWithSystem });
    const stream = GoogleGenerativeAIStream(geminiStream);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
