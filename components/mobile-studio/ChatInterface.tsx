"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Send, Sparkles, StopCircle } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useToastStore } from "@/store/useToastStore";

export const ChatInterface = () => {
  // Standard Vercel AI SDK hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* 1. Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
            <Sparkles className="w-8 h-8 mb-3" />
            <p className="text-xs font-mono">Ready to build.</p>
          </div>
        )}

        {messages.map((msg) => (
          /* FIX: Pass 'role' and 'content' separately to match the new component */
          <MessageBubble 
            key={msg.id} 
            role={msg.role as "user" | "assistant" | "system"} 
            content={msg.content} 
          />
        ))}
        
        {/* Invisible element to scroll to */}
        <div ref={bottomRef} />
      </div>

      {/* 2. Input Area */}
      <div className="shrink-0 p-4 bg-zinc-900/50 border-t border-white/5">
        <form onSubmit={onSend} className="relative flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask AI to change something..."
            className="w-full bg-black border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-zinc-200 focus:outline-none focus:border-white/20 placeholder:text-zinc-600"
          />
          
          <button 
            type="submit"
            disabled={!input.trim() && !isLoading}
            className="absolute right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <StopCircle className="w-4 h-4 animate-pulse" onClick={stop} /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
