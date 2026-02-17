"use client";

import React from "react";
import { FileCode, ChevronRight, Folder } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { cn } from "@/lib/utils";

export const FileExplorer = () => {
  const { files, activeFile, setActiveFile } = useFileStore();

  return (
    // We use h-full and bg-transparent because the Layout provides the container
    <div className="flex flex-col h-full bg-transparent p-6">
      
      {/* 1. Header Section */}
      <div className="flex items-center gap-2 mb-6 px-1">
        <Folder className="w-4 h-4 text-primary" />
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
          Project Files
        </h2>
      </div>

      {/* 2. Scrollable File List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-20">
            <FileCode className="w-10 h-10 mb-2" />
            <p className="text-xs font-mono uppercase">System Empty</p>
          </div>
        ) : (
          files.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                activeFile === file.name 
                  ? "bg-primary/10 border border-primary/20" 
                  : "bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/80"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  activeFile === file.name ? "bg-primary/20" : "bg-black/40"
                )}>
                  <FileCode className={cn(
                    "w-5 h-5",
                    activeFile === file.name ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
                  )} />
                </div>
                
                <div className="text-left">
                  <p className={cn(
                    "text-sm font-medium tracking-tight",
                    activeFile === file.name ? "text-white" : "text-zinc-400"
                  )}>
                    {file.name.split('/').pop()}
                  </p>
                  <p className="text-[9px] text-zinc-600 font-mono mt-0.5">
                    {file.name}
                  </p>
                </div>
              </div>

              <ChevronRight className={cn(
                "w-4 h-4 transition-transform duration-300",
                activeFile === file.name ? "text-primary translate-x-1" : "text-zinc-800"
              )} />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
