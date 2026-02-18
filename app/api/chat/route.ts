import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from "ai";

// 1. Setup Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

// 2. Use Edge Runtime for speed
export const runtime = "edge";

const SYSTEM_INSTRUCTION = `
You are an expert AI Mobile App Builder.

INSTRUCTIONS:
1. First, breakdown your task into 3-4 logical execution steps using :::LOG::: format.
2. If you need to modify or create a file, use the :::UPDATE::: format.
3. Use the :::UPDATE::: format ONLY for the code itself.
4. After the logs and updates, provide a friendly summary to the user.

FORMAT RULES:
:::LOG::: Title | Brief technical explanation.
:::UPDATE::: filename | [Full code content for that file]

EXAMPLE:
:::LOG::: Updating Home | Adding a new hero section.
:::UPDATE::: app/page.tsx | export default function Page() { return <div>Hello World</div> }
`;

export async function POST(req: Request) {
  try {
    // FIX 1: Extract 'messages' (Standard Vercel format)
    const { messages } = await req.json();

    if (!messages) {
      return new Response("No messages found", { status: 400 });
    }

    // FIX 2: Use the model that works for you (2.5 Flash)
    // We explicitly point to the latest flash model
    const geminiModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 8000,
        temperature: 0.7,
      }
    });

    // 4. Format Conversation for Gemini
    const formattedHistory = messages.map((msg: Message) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Inject System Instruction at the very start
    const promptWithSystem = [
      {
        role: "user",
        parts: [{ text: SYSTEM_INSTRUCTION + "\n\nUser asked: " + messages[messages.length - 1].content }]
      }
    ];

    // 5. Generate Stream
    const geminiStream = await geminiModel.generateContentStream({
      contents: formattedHistory.length > 1 ? formattedHistory : promptWithSystem, 
    });

    // 6. Return Stream
    const stream = GoogleGenerativeAIStream(geminiStream);

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("Chat API Error:", error);
    // Return the actual error message so we can see it in logs if it fails again
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
