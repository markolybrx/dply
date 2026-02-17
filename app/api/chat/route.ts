import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Initialize Gemini (Server-Side Only)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 2. Parse the incoming message
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini Key not found" }, { status: 500 });
    }

    // 3. Select the Model (Gemini Pro is best for text)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 


    // 4. Start the Chat Session (with history!)
    const chat = model.startChat({
      history: history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model", // Map 'assistant' to 'model'
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // 5. Send the new message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}
