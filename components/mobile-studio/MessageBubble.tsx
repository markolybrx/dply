import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Message } from "@/store/useChatStore";
import ReactMarkdown from "react-markdown";
import { LogAccordion } from "./LogAccordion";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAi = message.role === "assistant";

  // PARSING LOGIC: Extract ":::LOG::: Title | Desc" lines
  const rawContent = message.content;
  const logRegex = /:::LOG::: (.*?)\|(.*)/g;
  
  const logs: { title: string; desc: string }[] = [];
  let finalMessage = rawContent;

  if (isAi) {
    const matches = [...rawContent.matchAll(logRegex)];
    matches.forEach((match) => {
      logs.push({ title: match[1].trim(), desc: match[2].trim() });
    });
    // Remove logs from the visible text body
    finalMessage = rawContent.replace(logRegex, "").trim();
  }

  return (
    <div className={cn("flex w-full mb-8", isAi ? "justify-start" : "justify-end")}>
      <div className={cn("flex max-w-[90%] gap-3", isAi ? "flex-row" : "flex-row-reverse")}>
        
        {/* Avatar */}
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1", 
          isAi ? "bg-black border-zinc-800 text-primary" : "bg-white text-black border-white")}>
          {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        <div className="flex flex-col w-full">
          {/* RENDER LOGS (Only for AI) */}
          {isAi && logs.length > 0 && (
            <div className="mb-4 space-y-1 w-full max-w-sm">
              {logs.map((log, i) => (
                <LogAccordion key={i} title={log.title} description={log.desc} />
              ))}
            </div>
          )}

          {/* RENDER FINAL TEXT */}
          {finalMessage && (
            <div className={cn("relative px-4 py-3 text-sm leading-relaxed shadow-lg overflow-hidden",
              isAi ? "bg-zinc-900/80 border border-white/10 text-zinc-100 rounded-2xl rounded-tl-none backdrop-blur-md" 
                   : "bg-white text-black rounded-2xl rounded-tr-none")}>
              {isAi ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{finalMessage}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{finalMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
