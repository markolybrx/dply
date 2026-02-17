"use client";

import React, { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Message } from "@/store/useChatStore";
import { useFileStore } from "@/store/useFileStore";
import ReactMarkdown from "react-markdown";
import { LogAccordion } from "./LogAccordion";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isAi = message.role === "assistant";
  const { updateFile } = useFileStore();

  // We use useMemo to parse the content once per message
  const parsedData = useMemo(() => {
    const rawContent = message.content;
    const logs: { title: string; desc: string }[] = [];
    const updates: { fileName: string; content: string }[] = [];
    let cleanMessage = rawContent;

    if (!isAi) return { logs, updates, cleanMessage };

    // 1. Extract Logs: :::LOG::: Title | Description
    const logRegex = /:::LOG::: (.*?)\|(.*)/g;
    const logMatches = [...rawContent.matchAll(logRegex)];
    logMatches.forEach((match) => {
      logs.push({ title: match[1].trim(), desc: match[2].trim() });
    });

    // 2. Extract File Updates: :::UPDATE::: filename | code_content
    // This regex looks for :::UPDATE::: followed by a filename, a pipe, 
    // and then everything until it hits another ::: command or the end of the string.
    const updateRegex = /:::UPDATE::: (.*?)\s*\|([\s\S]*?)(?=(?:\n:::|$))/g;
    const updateMatches = [...rawContent.matchAll(updateRegex)];
    updateMatches.forEach((match) => {
      updates.push({ fileName: match[1].trim(), content: match[2].trim() });
    });

    // 3. Clean the final message (Remove the metadata tags from UI)
    cleanMessage = rawContent
      .replace(/:::LOG::: (.*?)\|(.*)/g, "")
      .replace(/:::UPDATE::: (.*?)\s*\|([\s\S]*?)(?=(?:\n:::|$))/g, "")
      .trim();

    return { logs, updates, cleanMessage };
  }, [message.content, isAi]);

  // EFFECT: Physically update the file store when a new message with updates arrives
  useEffect(() => {
    if (isAi && parsedData.updates.length > 0) {
      parsedData.updates.forEach((update) => {
        updateFile(update.fileName, update.content);
      });
    }
  }, [parsedData.updates, isAi, updateFile]);

  return (
    <div className={cn("flex w-full mb-8", isAi ? "justify-start" : "justify-end")}>
      <div className={cn("flex max-w-[95%] gap-3", isAi ? "flex-row" : "flex-row-reverse")}>

        {/* Avatar */}
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1", 
          isAi ? "bg-black border-zinc-800 text-primary" : "bg-white text-black border-white")}>
          {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        <div className="flex flex-col w-full min-w-0">
          {/* RENDER LOGS (Accordions) */}
          {isAi && parsedData.logs.length > 0 && (
            <div className="mb-4 space-y-1 w-full max-w-sm">
              {parsedData.logs.map((log, i) => (
                <LogAccordion key={i} title={log.title} description={log.desc} />
              ))}
            </div>
          )}

          {/* RENDER FINAL TEXT (Clean Message) */}
          {parsedData.cleanMessage && (
            <div className={cn("relative px-4 py-3 text-sm leading-relaxed shadow-lg overflow-hidden",
              isAi ? "bg-zinc-900/80 border border-white/10 text-zinc-100 rounded-2xl rounded-tl-none backdrop-blur-md" 
                   : "bg-white text-black rounded-2xl rounded-tr-none")}>
              {isAi ? (
                <div className="prose prose-invert prose-sm max-w-none break-words">
                  <ReactMarkdown>{parsedData.cleanMessage}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap break-words">{parsedData.cleanMessage}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
