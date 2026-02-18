"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { User, Sparkles, Check, ChevronDown, Loader2, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileStore } from "@/store/useFileStore";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const isAi = role === "assistant";
  const { updateFile } = useFileStore();
  const params = useParams();
  const projectId = params.projectId as string;
  
  // State to toggle accordions
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});

  // --- SMART PARSING ENGINE ---
  const parsedData = useMemo(() => {
    if (!isAi) return { cleanContent: content, logs: [], updates: [] };

    const logs: { title: string; desc: string }[] = [];
    const updates: { fileName: string; content: string }[] = [];
    
    // 1. Extract Logs (:::LOG::: Title | Description)
    const logRegex = /:::LOG:::\s*(.*?)\s*\|\s*(.*?)(?=(:::|$))/g;
    let logMatch;
    while ((logMatch = logRegex.exec(content)) !== null) {
      logs.push({ title: logMatch[1].trim(), desc: logMatch[2].trim() });
    }

    // 2. Extract Updates (:::UPDATE::: File | Content)
    // Relaxed Regex: Captures content until the next ':::' or End of String
    const updateRegex = /:::UPDATE:::\s*(.*?)\s*\|\s*([\s\S]*?)(?=(:::LOG|:::UPDATE|$))/g;
    let updateMatch;
    while ((updateMatch = updateRegex.exec(content)) !== null) {
      updates.push({
        fileName: updateMatch[1].trim(),
        content: updateMatch[2].trim()
      });
    }

    // 3. Clean Content (Remove all technical blocks to show only the friendly summary)
    let cleanContent = content
      .replace(logRegex, "")
      .replace(updateRegex, "")
      .trim();

    // Fallback if AI only sends code/logs and no summary
    if (!cleanContent && (logs.length > 0 || updates.length > 0)) {
      cleanContent = ""; // Empty string allows the UI to just show the logs
    }

    return { cleanContent, logs, updates };
  }, [content, isAi]);

  // --- AUTO-SAVE SIDE EFFECT ---
  useEffect(() => {
    if (isAi && parsedData.updates.length > 0 && projectId) {
      parsedData.updates.forEach((update) => {
        // Trigger the store update (Connects to File Explorer & Live Preview)
        updateFile(projectId, update.fileName, update.content);
      });
    }
  }, [parsedData.updates, isAi, updateFile, projectId]);

  // --- UI RENDER ---
  return (
    <div className={cn(
      "flex w-full gap-3 mb-6",
      role === "user" ? "justify-end" : "justify-start"
    )}>
      {/* AI Avatar */}
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mt-1 border border-white/5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
      )}

      <div className={cn(
        "relative max-w-[90%] flex flex-col gap-2",
        role === "user" ? "items-end" : "items-start"
      )}>
        
        {/* 1. LOGS ACCORDION (The "Thinking" Process) */}
        {parsedData.logs.map((log, index) => {
           const isLast = index === parsedData.logs.length - 1;
           // If it's the last log and no summary yet, it might be "active/loading"
           const isActive = isLast && !parsedData.cleanContent; 
           
           return (
            <div key={index} className="w-full min-w-[300px] bg-[#111] border border-white/5 rounded-lg overflow-hidden">
              <button 
                onClick={() => setExpandedLogs(prev => ({ ...prev, [index]: !prev[index] }))}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  )}
                  <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
                    {log.title}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-zinc-500 transition-transform duration-200",
                  expandedLogs[index] ? "rotate-180" : ""
                )} />
              </button>
              
              <AnimatePresence>
                {expandedLogs[index] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 text-[11px] font-mono text-zinc-500 border-t border-white/5 bg-black/20">
                      {log.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* 2. FILE UPDATE INDICATORS */}
        {parsedData.updates.length > 0 && (
          <div className="flex flex-wrap gap-2 my-1">
            {parsedData.updates.map((update, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <FileCode className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-mono text-indigo-300">
                  {update.fileName}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 3. MAIN MESSAGE (The Summary) */}
        {parsedData.cleanContent && (
          <div className={cn(
            "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
            role === "user" 
              ? "bg-white text-black rounded-tr-sm" 
              : "bg-zinc-900 text-zinc-300 rounded-tl-sm border border-white/5"
          )}>
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
              <ReactMarkdown>{parsedData.cleanContent}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {role === "user" && (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};