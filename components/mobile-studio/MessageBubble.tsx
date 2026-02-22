"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { User, Sparkles, Check, ChevronDown, Loader, FileCode, Terminal } from "lucide-react";
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
  const [visibleLogCount, setVisibleLogCount] = useState(0);
  const processedFiles = useRef<Set<string>>(new Set());
  
  // STALL DETECTOR: Tracks if the AI has hung or is processing heavy logic
  const [isStalled, setIsStalled] = useState(false);

  const parsedData = useMemo(() => {
    if (!isAi) return { cleanContent: content, logs: [], updates: [], activeFile: null };

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
      updates,
      activeFile: currentFile
    };
  }, [content, isAi]);

  // STALL DETECTOR QUEUE: Watch for stream hangs or heavy processing delays
  useEffect(() => {
    if (!isAi) return;
    setIsStalled(false); // Reset the stall state whenever new tokens arrive
    
    // If the stream hasn't grown in 8 seconds, flag it as stalled
    const stallTimer = setTimeout(() => {
      setIsStalled(true);
    }, 8000);
    
    return () => clearTimeout(stallTimer);
  }, [content, isAi]);

  // LABOR ILLUSION QUEUE: Dynamic weight-based delay
  useEffect(() => {
    if (isAi && parsedData.logs.length > visibleLogCount) {
      let delay = 2000; // Base 2 seconds

      if (visibleLogCount > 0) {
        const prevLog = parsedData.logs[visibleLogCount - 1];
        const isHeavyWork = prevLog.title.toLowerCase().match(/implement|architect|refin/);
        delay = isHeavyWork ? Math.floor(Math.random() * 5000) + 5000 : 2000;
      }

      const timer = setTimeout(() => {
        setVisibleLogCount((prev) => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [parsedData.logs.length, visibleLogCount, isAi]);

  // DB SYNCHRONIZATION
  useEffect(() => {
    if (isAi && parsedData.updates.length > 0 && projectId) {
      parsedData.updates.forEach((update) => {
        if (!processedFiles.current.has(update.fileName)) {
          updateFile(projectId, update.fileName, update.content);
          processedFiles.current.add(update.fileName);
        }
      });
    }
  }, [parsedData.updates, isAi, updateFile, projectId]);

  const isThinking = isAi && content.length < 15 && parsedData.logs.length === 0;
  
  // Extract the title of the log currently being worked on
  const activeLogTitle = visibleLogCount > 0 && parsedData.logs[visibleLogCount - 1] 
    ? (isStalled ? "Processing Heavy Logic" : parsedData.logs[visibleLogCount - 1].title)
    : "Executing Protocol";

  return (
    <div className={cn("flex w-full gap-3 mb-6", role === "user" ? "justify-end" : "justify-start")}>
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1 border border-white/5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </div>
      )}

      <div className={cn(
        "relative flex flex-col gap-2 w-full max-w-[90%]", 
        role === "user" ? "items-end" : "items-start"
      )}>

        {/* GEMINI-STYLE SHIMMER ANIMATION */}
        {isThinking && (
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-900 to-indigo-900/10 border border-white/5 rounded-lg w-fit animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
              Analyzing Request...
            </span>
          </div>
        )}

        {/* HOISTED: CLEAN CONVERSATIONAL TEXT NOW APPEARS ABOVE ACCORDIONS */}
        {(parsedData.cleanContent || role === "user") && !isThinking && (
          <div className={cn(
            "rounded-2xl p-4 text-sm leading-relaxed shadow-sm break-words",
            role === "user" 
              ? "bg-white text-black rounded-tr-sm" 
              : "bg-zinc-900 text-zinc-300 rounded-tl-sm border border-white/5 mb-2"
          )}>
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 max-w-none">
              <ReactMarkdown>{parsedData.cleanContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* STAGGERED ACCORDION LOGS */}
        {parsedData.logs.slice(0, visibleLogCount).map((log, index) => {
           const isLastVisible = index === visibleLogCount - 1;
           const isWorking = isLastVisible && (!log.isComplete || visibleLogCount < parsedData.logs.length);
           const isOpen = userToggled[index] !== undefined ? userToggled[index] : isWorking;

           return (
            <div key={index} className="w-full bg-zinc-900 border border-white/5 rounded-lg overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setUserToggled(prev => ({ ...prev, [index]: !isOpen }))}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {isWorking ? (
                    <Loader className={cn("w-3 h-3 animate-spin shrink-0", isStalled ? "text-amber-400" : "text-blue-400")} />
                  ) : (
                    <Check className="w-3 h-3 text-green-500 shrink-0" />
                  )}
                  <span className={cn(
                    "text-[10px] font-mono uppercase tracking-widest truncate",
                    isWorking ? (isStalled ? "text-amber-400" : "text-blue-400") : "text-zinc-400"
                  )}>
                    {isWorking && isStalled ? "Still working on the codes, hold on..." : log.title}
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

        {/* DYNAMIC WRITING CODE CURSOR */}
        {parsedData.activeFile && (
           <div className="flex items-center gap-2 p-3 mt-1 bg-gradient-to-r from-black/60 to-indigo-900/10 border border-indigo-500/20 rounded-lg w-fit shadow-[0_0_15px_rgba(99,102,241,0.1)]">
             <Terminal className={cn("w-3.5 h-3.5", isStalled ? "text-amber-400" : "text-indigo-400")} />
             <span className={cn("text-[10px] font-mono tracking-wider", isStalled ? "text-amber-300" : "text-indigo-300")}>
               {activeLogTitle} <span className="text-white opacity-70">({parsedData.activeFile})</span>
             </span>
             <div className={cn("w-1.5 h-3 ml-1 animate-[ping_1s_steps(1)_infinite]", isStalled ? "bg-amber-400" : "bg-indigo-400")} />
           </div>
        )}

        {/* COMPLETED FILE BADGES */}
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
      </div>

      {role === "user" && (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
