"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { MessageBubble } from "./MessageBubble";
import { nanoid } from "nanoid";

export const ChatInterface = () => {
  const { messages, addMessage, isLoading, setLoading } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput(""); 
    setLoading(true);

    // 1. Add User Message
    addMessage({
      id: nanoid(),
      role: "user",
      content: userText,
      timestamp: Date.now(),
    });

    try {
      // 2. Call the API directly (No fake delays)
      // The AI prompt itself will generate the "thinking logs" which slows down the response naturally
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch");

      // 3. Add AI Response (Contains :::LOG::: lines for the accordion)
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: data.reply,
        timestamp: Date.now(),
      });

    } catch (error: any) {
      console.error("Chat Error:", error);
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: `⚠️ Error: ${error.message || "Something went wrong."}`,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-2 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 opacity-50">
            <Sparkles className="w-12 h-12" />
            <p>Describe your app to start building.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {/* Simple visual indicator while waiting for the first byte */}
        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs ml-4 mt-2">
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading} 
            placeholder={isLoading ? "AI is thinking..." : "Ask AI to change something..."}
            className="flex-1 bg-transparent border-none outline-none text-white px-4 h-10 placeholder:text-zinc-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
