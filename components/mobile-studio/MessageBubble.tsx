"use client";

import React, { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { User, Sparkles, FileCode, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileStore } from "@/store/useFileStore";
import { useParams } from "next/navigation";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const isAi = role === "assistant";
  const { updateFile } = useFileStore();
  
  // 1. GET PROJECT ID FROM URL
  const params = useParams();
  const projectId = params.projectId as string;

  // Smart Parsing: Detects if the AI is trying to write code updates
  // Looks for blocks like: :::UPDATE app/page.tsx::: [code] :::END:::
  const parsedData = useMemo(() => {
    const updates: { fileName: string; content: string }[] = [];
    let cleanContent = content;

    if (isAi && content.includes(":::UPDATE")) {
      const regex = /:::UPDATE\s+(.*?):::\n([\s\S]*?):::END:::/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        updates.push({
          fileName: match[1].trim(),
          content: match[2].trim()
        });
      }
      // Remove the raw code blocks from the visible message to keep it clean
      cleanContent = content.replace(regex, "").trim();
      if (!cleanContent) cleanContent = "I've updated the files for you.";
    }

    return { cleanContent, updates };
  }, [content, isAi]);

  // 2. AUTO-SAVE UPDATES
  // If the AI sent code, save it to the store + database immediately
  useEffect(() => {
    if (isAi && parsedData.updates.length > 0) {
      parsedData.updates.forEach((update) => {
        if (projectId) {
            // FIX: Now passing 3 arguments (ProjectID, FileName, Content)
            updateFile(projectId, update.fileName, update.content);
        }
      });
    }
  }, [parsedData.updates, isAi, updateFile, projectId]);

  return (
    <div className={cn(
      "flex w-full gap-3 mb-6",
      role === "user" ? "justify-end" : "justify-start"
    )}>
      {/* AI Avatar */}
      {isAi && (
        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      )}

      <div className={cn(
        "relative max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed",
        role === "user" 
          ? "bg-white text-black rounded-tr-sm" 
          : "bg-zinc-900 text-zinc-300 rounded-tl-sm border border-white/5"
      )}>
        {/* Message Content */}
        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
          <ReactMarkdown>{parsedData.cleanContent}</ReactMarkdown>
        </div>

        {/* Update Indicators (If AI modified files) */}
        {parsedData.updates.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {parsedData.updates.map((update, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] bg-green-500/10 text-green-400 px-3 py-2 rounded-lg border border-green-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-mono">Updated: {update.fileName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {role === "user" && (
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
      )}
    </div>
  );
};
