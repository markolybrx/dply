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
    /* STACKED BOX COMPONENT: 
       Takes 100% of parent (Middle Box) and prevents content leaks. 
    */
    <div className="flex flex-col h-full w-full bg-black overflow-hidden">

      {/* 1. Message Box: Fills available space, scrolls internally */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-6 no-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4 opacity-40">
            <div className="p-4 rounded-full bg-zinc-900/50">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-center">
              System Online <br/> Ready to build
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-primary text-xs ml-4 py-2">
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
             <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* 2. Input Box: Sits at the bottom of the Middle Box */}
      <div className="shrink-0 p-4 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md">
        <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-2xl p-1.5 shadow-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading} 
            placeholder={isLoading ? "AI is processing..." : "Ask AI to change something..."}
            className="flex-1 bg-transparent border-none outline-none text-white px-3 h-10 text-sm placeholder:text-zinc-600 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all"
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
