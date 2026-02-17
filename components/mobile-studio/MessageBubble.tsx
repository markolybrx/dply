import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Message } from "@/store/useChatStore";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAi = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full mb-6",
        isAi ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] gap-3",
          isAi ? "flex-row" : "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
            isAi
              ? "bg-black border-white/10 text-primary"
              : "bg-white text-black border-white"
          )}
        >
          {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "relative px-4 py-3 text-sm leading-relaxed shadow-lg overflow-hidden",
            isAi
              ? "bg-zinc-900/80 border border-white/10 text-zinc-100 rounded-2xl rounded-tl-none backdrop-blur-md"
              : "bg-white text-black rounded-2xl rounded-tr-none"
          )}
        >
          {isAi ? (
            <div className="prose prose-invert prose-sm max-w-none">
               {/* This renders code blocks nicely */}
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
};
