"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Send, Sparkles, StopCircle, AlertCircle } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useToastStore } from "@/store/useToastStore";

export const ChatInterface = () => {
  // Added error and reload for robust API failure handling
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, error, reload } = useChat({
    onError: (err) => {
      console.error("Chat API Error:", err);
    }
  });
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages or errors arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* 1. Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
            <Sparkles className="w-8 h-8 mb-3" />
            <p className="text-xs font-mono">Ready to build.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            role={msg.role as "user" | "assistant" | "system"} 
            content={msg.content} 
          />
        ))}

        {/* ERROR STATE UI */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 mt-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <p className="text-xs text-red-300 font-mono">Connection Failed</p>
              <button 
                onClick={() => reload()} 
                className="text-[10px] text-red-400 underline mt-1 hover:text-red-300 transition-colors"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

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
