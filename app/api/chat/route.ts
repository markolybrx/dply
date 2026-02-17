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

    // 1. Format History
    // We convert the previous messages into a single text block
    const conversationContext = history
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n");

    // 2. Construct Prompt
    const finalPrompt = `
      You are an expert AI Mobile App Builder.
      Your goal is to help the user build, edit, and understand their code.
      
      PREVIOUS CONVERSATION:
      ${conversationContext}
      
      USER: ${message}
      
      ASSISTANT:
    `;

    // 3. CALL GEMINI 2.5 FLASH (Using your proven endpoint)
    // Note: This model has a 5 RPM limit, so don't send messages too fast!
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
            maxOutputTokens: 8000,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    // 4. Handle Errors (Specifically Rate Limits)
    if (data.error) {
      console.error("Gemini API Error:", JSON.stringify(data.error, null, 2));
      
      // If we hit the 5 RPM limit, tell the user gracefully
      if (data.error.code === 429) {
         throw new Error("I'm thinking too fast! Please wait 10 seconds.");
      }
      
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
        error: "Connection Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
