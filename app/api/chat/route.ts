import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

// 1. Setup Google AI
// We check for both variable names to be safe
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

// 2. Use Edge Runtime for speed
export const runtime = "edge";

const SYSTEM_INSTRUCTION = `
You are an expert AI Mobile App Builder using Next.js 14, Tailwind CSS, and Lucide React.

STRICT PROTOCOL - FOLLOW THIS EXACTLY:
1. ANALYSIS: Break down the request into logical steps.
2. EXECUTION: For every step, output a LOG and then the UPDATE.
3. FORMAT:
   :::LOG::: Action Title | Brief technical description of what you are doing.
   :::UPDATE::: path/to/file.ext | [RAW CODE CONTENT HERE - NO MARKDOWN BACKTICKS]

4. RULES:
   - Do NOT wrap the file content in \`\`\` (markdown code blocks). Just output the raw code.
   - Always update 'app/page.tsx' if the user wants to see a visual change.
   - Ensure 'app/page.tsx' exports a default component.
   - Use 'lucide-react' for icons.
   - If creating a complex UI, break it into smaller components if needed, but 'app/page.tsx' is the priority entry point.

EXAMPLE STREAM:
:::LOG::: Analyzing Request | Identifying necessary components for the calculator.
:::UPDATE::: app/page.tsx | import React from 'react'; export default function Page() { return <div className="p-4"><h1>Calculator</h1></div> }
:::LOG::: Adding Styles | Applying Tailwind classes for the grid layout.
:::UPDATE::: app/globals.css | @tailwind base; @tailwind components; @tailwind utilities;

FINAL SUMMARY:
(After all logs and updates are done, provide a short, friendly message here).
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return new Response("No messages found", { status: 400 });
    }

    // 3. Initialize Model
    // 'gemini-1.5-flash' is currently the fastest and most reliable for this streaming setup
    const geminiModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 8000,
        temperature: 0.7,
      }
    });

    // 4. Format Conversation
    // We strictly define the roles for Gemini (user/model)
    const formattedHistory = messages.map((msg: Message) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 5. Inject System Instruction
    // We attach the system instruction to the very last user message to ensure it's "fresh" in the AI's context
    // This trick often works better than a separate system message for keeping the AI on track
    const lastMessage = messages[messages.length - 1];
    const promptWithSystem = [
      ...formattedHistory.slice(0, -1), // Previous history
      {
        role: "user",
        parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser Request: " + lastMessage.content }]
      }
    ];

    // 6. Generate Stream
    const geminiStream = await geminiModel.generateContentStream({
      contents: promptWithSystem, 
    });

    // 7. Return Stream
    const stream = GoogleGenerativeAIStream(geminiStream);

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
