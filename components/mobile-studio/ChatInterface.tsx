"use client";

import React, { useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Send, Sparkles, StopCircle, AlertCircle } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useToastStore } from "@/store/useToastStore";

export const ChatInterface = () => {
  // Extract 'append' to programmatically send hidden continuation and debug prompts
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, error, reload, append } = useChat({
    api: "/api/chat",
    streamProtocol: "data",
    onError: (err) => {
      console.error("Chat API Error:", err);
    }
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

  // AUTO-CONTINUATION: Fire a hidden prompt to the AI to resume the code
  const handleTruncate = (fileName: string) => {
    append({
      role: "user",
      content: `SYSTEM_CONTINUE: You were cut off due to server limits. Continue exactly where you left off for FILE: ${fileName}. Do NOT apologize. Do NOT write markdown codeblocks. Just start immediately with the next line of RAW code.`
    });
  };

  // THE SELF-HEALING LOOP: Listen for crash reports from the Live Preview engine
  useEffect(() => {
    const handleAutoFix = (e: Event) => {
      const event = e as CustomEvent<{ error: string }>;
      const rawError = event.detail.error;

      // DEFENSIVE SHIELD: Truncate massive error logs to prevent API payload crashes
      const errorMessage = rawError.length > 2000 
        ? rawError.substring(0, 2000) + "\n...[TRUNCATED TO PREVENT TOKEN OVERFLOW]" 
        : rawError;

      // Fire the hidden prompt with STRICT formatting rules to trigger the file parser
      append({
        role: "user",
        content: `SYSTEM_DEBUG: The compiler crashed. Analyze this error trace and fix the code:\n\n${errorMessage}\n\nYou MUST output the corrected code wrapped in a markdown block with the exact file path (e.g., \`\`\`tsx app/page.tsx\n[code]\n\`\`\`). Do not apologize. Do not explain. Output nothing but the markdown block.`
      });
    };

    window.addEventListener("DPLY_AUTO_FIX", handleAutoFix);
    return () => window.removeEventListener("DPLY_AUTO_FIX", handleAutoFix);
  }, [append]);

  // FILTER: Hide programmatic system prompts AND the AI's direct responses to them
  const visibleMessages = messages.filter((msg, index, array) => {
    const isHiddenPrompt = msg.content.startsWith("SYSTEM_CONTINUE:") || msg.content.startsWith("SYSTEM_DEBUG:");
    if (isHiddenPrompt) return false;

    // Look-back check: If this is an assistant message, check if it's replying to a hidden prompt
    if (msg.role === "assistant" && index > 0) {
      const prevMsg = array[index - 1];
      if (prevMsg.role === "user" && (prevMsg.content.startsWith("SYSTEM_CONTINUE:") || prevMsg.content.startsWith("SYSTEM_DEBUG:"))) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-black">
      {/* 1. Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {visibleMessages.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
            <Sparkles className="w-8 h-8 mb-3" />
            <p className="text-xs font-mono">Ready to build.</p>
          </div>
        )}

        {visibleMessages.map((msg, index) => (
          <MessageBubble 
            key={msg.id} 
            role={msg.role as "user" | "assistant" | "system"} 
            content={msg.content} 
            // Only the absolute last message in the array can actively stream
            isStreaming={isLoading && index === visibleMessages.length - 1}
            onTruncate={handleTruncate}
          />
        ))}

        {/* OPTIMISTIC ZERO-LATENCY LOADING STATE */}
        {isLoading && visibleMessages.length > 0 && visibleMessages[visibleMessages.length - 1].role === "user" && (
          <div className="flex w-full gap-3 mb-6 justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1 border border-white/5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="relative flex flex-col gap-2 w-full max-w-[90%] items-start">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-900 to-indigo-900/10 border border-white/5 rounded-lg w-fit animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  Analyzing Request...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ERROR STATE UI */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 mt-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-300 font-mono">Connection Failed</p>
              {/* MOBILE DEBUG OVERRIDE: Print the exact API crash trace directly to the screen */}
              <p className="text-[10px] text-red-400/80 mt-1 font-mono break-words">
                {error.message}
              </p>
              <button 
                onClick={() => reload()} 
                className="text-[10px] text-red-400 underline mt-2 hover:text-red-300 transition-colors"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

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
