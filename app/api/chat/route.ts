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
      1. First, breakdown your task into 3-4 logical execution steps.
      2. For each step, output a log line in this EXACT format:
         :::LOG::: Title of Action | Brief technical explanation of what you are checking or updating.
      3. After the logs, provide your final friendly response to the user.

      EXAMPLE RESPONSE:
      :::LOG::: Analysing Intent | Identifying user request to change background color.
      :::LOG::: Checking Files | Scanning tailwind.config.ts for color definitions.
      :::LOG::: Updating Theme | Modifying 'primary' color variable in globals.css.
      
      I've updated the background color to neon blue as requested! It looks much sharper now.
      
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
