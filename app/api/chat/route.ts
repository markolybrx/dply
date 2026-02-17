import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Server Error: Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const conversationContext = history
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n");

        const finalPrompt = `
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
      
      I've updated your home page with the new hero section!
      
      REAL CONVERSATION:
      ${conversationContext}
      
      USER: ${message}
      
      ASSISTANT:
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: {
            maxOutputTokens: 8000,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      if (data.error.code === 429) {
         throw new Error("I'm thinking too fast! Please wait a moment.");
      }
      throw new Error(data.error.message);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "System Error";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
