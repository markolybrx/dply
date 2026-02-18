import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

// 1. Setup Google AI
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

EXAMPLE STREAM:
:::LOG::: Analyzing Request | Identifying necessary components for the calculator.
:::UPDATE::: app/page.tsx | import React from 'react'; export default function Page() { return <div>Calculator</div> }
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

    // Use Gemini 2.5 Flash for speed
    const geminiModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Or "gemini-2.0-flash-exp" if available to you
      generationConfig: {
        maxOutputTokens: 8000,
        temperature: 0.7,
      }
    });

    const formattedHistory = messages.map((msg: Message) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Inject System Instruction as the first "User" message to force compliance
    const promptWithSystem = [
      {
        role: "user",
        parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser Request: " + messages[messages.length - 1].content }]
      }
    ];

    const geminiStream = await geminiModel.generateContentStream({
      contents: formattedHistory.length > 1 ? formattedHistory : promptWithSystem, 
    });

    const stream = GoogleGenerativeAIStream(geminiStream);

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
