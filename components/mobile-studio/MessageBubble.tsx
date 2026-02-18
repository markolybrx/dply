"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { User, Sparkles, Check, ChevronDown, Loader, FileCode } from "lucide-react";
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
  const params = useParams();
  const projectId = params.projectId as string;

  const [userToggled, setUserToggled] = useState<Record<number, boolean>>({});

  const parsedData = useMemo(() => {
    if (!isAi) return { cleanContent: content, logs: [], updates: [] };

    const logs: { title: string; desc: string; isComplete: boolean }[] = [];
    const updates: { fileName: string; content: string }[] = [];
    const lines = content.split("\n");
    let cleanLines: string[] = [];

    let currentFile: string | null = null;
    let currentFileContent: string[] = [];

    lines.forEach((line) => {
      if (line.startsWith("PHASE:")) {
        const [title, ...descParts] = line.replace("PHASE:", "").split("|");
        logs.push({
          title: title.trim().replace(/_/g, " "),
          desc: descParts.join("|").trim(),
          isComplete: false
        });
        if (logs.length > 1) logs[logs.length - 2].isComplete = true;
      } 
      else if (line.startsWith("FILE:")) {
        currentFile = line.replace("FILE:", "").trim();
        currentFileContent = [];
      } 
      else if (line.startsWith("COMPLETED:")) {
        if (currentFile) {
          updates.push({
            fileName: currentFile,
            content: currentFileContent.join("\n").trim()
          });
        }
        currentFile = null;
        if (logs.length > 0) logs[logs.length - 1].isComplete = true;
      } 
      else {
        if (currentFile) {
          currentFileContent.push(line);
        } else if (!line.startsWith("PHASE:") && !line.startsWith("FILE:") && !line.startsWith("COMPLETED:")) {
          cleanLines.push(line);
        }
      }
    });

    return { 
      cleanContent: cleanLines.join("\n").trim(), 
      logs, 
      updates 
    };
  }, [content, isAi]);

  useEffect(() => {
    if (isAi && parsedData.updates.length > 0 && projectId) {
      parsedData.updates.forEach((update) => {
        updateFile(projectId, update.fileName, update.content);
      });
    }
  }, [parsedData.updates, isAi, updateFile, projectId]);

  return (
    <div className={cn("flex w-full gap-3 mb-6", role === "user" ? "justify-end" : "justify-start")}>
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1 border border-white/5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
      )}

      {/* FIXED: Enforce w-full and a max-width to keep accordions consistent */}
      <div className={cn(
        "relative flex flex-col gap-2 w-full max-w-[90%]", 
        role === "user" ? "items-end" : "items-start"
      )}>

        {parsedData.logs.map((log, index) => {
           const isLast = index === parsedData.logs.length - 1;
           const isWorking = isLast && !log.isComplete;
           const isOpen = userToggled[index] !== undefined ? userToggled[index] : isWorking;

           return (
            <div key={index} className="w-full bg-zinc-900 border border-white/5 rounded-lg overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setUserToggled(prev => ({ ...prev, [index]: !isOpen }))}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {isWorking ? (
                    <Loader className="w-3 h-3 text-blue-400 animate-spin shrink-0" />
                  ) : (
                    <Check className="w-3 h-3 text-green-500 shrink-0" />
                  )}
                  <span className={cn(
                    "text-[10px] font-mono uppercase tracking-widest truncate",
                    isWorking ? "text-blue-400" : "text-zinc-400"
                  )}>
                    {log.title}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-3 h-3 text-zinc-600 transition-transform duration-300",
                  isOpen ? "rotate-180" : ""
                )} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-[11px] font-mono text-zinc-500 leading-relaxed border-t border-white/5 pt-3 bg-black/20">
                  {log.desc || "Executing task protocols..."}
                </div>
              )}
            </div>
          );
        })}

        {parsedData.updates.length > 0 && (
          <div className="flex flex-wrap gap-2 my-1">
            {parsedData.updates.map((update, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <FileCode className="w-3 h-3 text-indigo-400" />
                <span className="text-[9px] font-mono text-indigo-300 uppercase tracking-tighter">
                  {update.fileName}
                </span>
              </div>
            ))}
          </div>
        )}

        {(parsedData.cleanContent || role === "user") && (
          <div className={cn(
            "rounded-2xl p-4 text-sm leading-relaxed shadow-sm break-words",
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

      {role === "user" && (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
