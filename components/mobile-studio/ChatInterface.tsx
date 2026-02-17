"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { MessageBubble } from "./MessageBubble";
import { nanoid } from "nanoid";

export const ChatInterface = () => {
  const { messages, addMessage, isLoading, setLoading } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput(""); // Clear input immediately

    // 1. Add User Message to Store
    const userMsg = {
      id: nanoid(),
      role: "user" as const,
      content: userText,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setLoading(true);

    try {
      // 2. Call the Real API
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

      // 3. Add AI Response to Store
      const aiMsg = {
        id: nanoid(),
        role: "assistant" as const,
        content: data.reply,
        timestamp: Date.now(),
      };
      addMessage(aiMsg);
    } catch (error) {
      console.error("Chat Error:", error);
      // Optional: Add an error message to chat
      addMessage({
        id: nanoid(),
        role: "assistant",
        content: "⚠️ I lost connection. Please check your API Key or try again.",
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
        
        {/* Welcome Message if empty */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4 opacity-50">
            <Sparkles className="w-12 h-12" />
            <p>Describe your app to start building.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-zinc-500 text-xs ml-4">
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="absolute bottom-20 left-0 right-0 px-4">
        <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI to change something..."
            className="flex-1 bg-transparent border-none outline-none text-white px-4 h-10 placeholder:text-zinc-600"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center disabled:opacity-50 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
