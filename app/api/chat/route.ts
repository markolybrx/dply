import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server Error: Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    // 1. Format the Conversation History
    // We convert the previous messages into a single text block for context
    const conversationContext = history
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n");

    // 2. Construct the Prompt
    const finalPrompt = `
      You are an expert AI Mobile App Builder.
      Your goal is to help the user build, edit, and understand their code.
      
      PREVIOUS CONVERSATION:
      ${conversationContext}
      
      USER: ${message}
      
      ASSISTANT:
    `;

    // 3. CALL GEMINI 2.0 FLASH EXP (Direct REST API)
    // We use "gemini-2.0-flash-exp" because it has higher limits (15 RPM) than 2.5 (5 RPM)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: finalPrompt }],
            },
          ],
          generationConfig: {
            // We removed "application/json" so it can chat normally
            maxOutputTokens: 8000,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    // 4. Handle API Errors (like Quota Limit)
    if (data.error) {
      console.error("Gemini API Error:", JSON.stringify(data.error, null, 2));
      throw new Error(data.error.message || "Gemini API Refused");
    }

    // 5. Extract Text
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I heard you, but I have no words.";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Backend Handler Error:", error);
    return NextResponse.json(
      {
        error: "Neural Link disrupted. Check logs.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
