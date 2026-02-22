"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { Send, Sparkles, StopCircle, AlertCircle, Loader2 } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { useToastStore } from "@/store/useToastStore";

export const ChatInterface = () => {
  // Extract 'append' to programmatically send hidden continuation and debug prompts
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, error, reload, append } = useChat({
    api: "/api/chat",
    streamProtocol: "data",
    maxRetries: 0, // THE KILL SWITCH: Prevents the SDK from secretly spamming the API on failure
    onError: (err) => {
      console.error("Chat API Error:", err);
    }
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  // THE GLOBAL LOCK: Broadcast generation status to prevent UI cross-contamination
  useEffect(() => {
    if (!isLoading) {
      setIsDebugging(false); // Reset debug state when generation finishes
    }

    window.dispatchEvent(new CustomEvent("DPLY_GENERATION_STATUS", {
      detail: { isGenerating: isLoading }
    }));
  }, [isLoading]);

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

      setIsDebugging(true);

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
    <div className="flex flex-col h-full w-full bg-black relative overflow-hidden">

      {/* THE RATE LIMIT SHIELD: Glassmorphic UI Lock */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md transition-all duration-300">
          <div className="w-16 h-16 relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <p className="text-xs font-mono text-indigo-300 tracking-[0.2em] uppercase animate-pulse text-center px-6">
            {isDebugging ? "Debugging System Architecture..." : "Synthesizing Code Payload..."}
          </p>
          <p className="text-[10px] text-zinc-500 font-mono mt-4 text-center px-8">
            System locked to prevent API rate limit overflow.
          </p>
          <button
            onClick={() => stop()}
            className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-400 rounded-full text-xs font-mono border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <StopCircle className="w-4 h-4" /> Force Stop
          </button>
        </div>
      )}

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

        {/* ERROR STATE UI */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-2 mt-4 relative z-40">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-xs text-red-300 font-mono font-bold uppercase tracking-wide">
                {error.message.includes("API_QUOTA_REACHED") || error.message.includes("429") || error.message.includes("quota") 
                  ? "Rate Limit Reached" 
                  : "Connection Failed"}
              </p>
            </div>
            <p className="text-[10px] text-red-400/80 font-mono leading-relaxed break-words">
              {error.message.includes("API_QUOTA_REACHED") || error.message.includes("429") || error.message.includes("quota")
                ? "The Gemini Free Tier is restricted to 5 requests per minute. Your quota has been exhausted. Please wait exactly 60 seconds before issuing the next command."
                : error.message}
            </p>
            <button 
              onClick={() => reload()} 
              className="w-full mt-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-mono rounded-lg transition-colors border border-red-500/20"
            >
              Retry Connection
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 2. Input Area */}
      <div className="shrink-0 p-4 bg-zinc-900/50 border-t border-white/5 relative z-40">
        <form onSubmit={onSend} className="relative flex items-center">
          <input
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="Ask AI to change something..."
            className="w-full bg-black border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-zinc-200 focus:outline-none focus:border-white/20 placeholder:text-zinc-600 disabled:opacity-50"
          />

          <button 
            type="submit"
            disabled={!input.trim() && !isLoading}
            className="absolute right-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
