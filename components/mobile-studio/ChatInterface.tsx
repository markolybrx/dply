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

    addMessage({
      id: nanoid(),
      role: "user",
      content: userText,
      timestamp: Date.now(),
    });

    try {
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
    <div className="flex flex-col h-full w-full bg-transparent">

      {/* 1. Messages Area: flex-1 ensures it fills all space NOT taken by the input */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 opacity-50">
            <Sparkles className="w-10 h-10" />
            <p className="text-xs uppercase tracking-widest font-mono">Ready to build</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-primary text-xs ml-4 mt-2">
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. Input Area: Pins to the bottom of the flex container */}
      <div className="p-4 bg-gradient-to-t from-zinc-950 to-transparent">
        <div className="relative flex items-center bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading} 
            placeholder={isLoading ? "AI is thinking..." : "Ask AI to change something..."}
            className="flex-1 bg-transparent border-none outline-none text-white px-3 h-10 text-sm placeholder:text-zinc-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all shadow-lg"
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
