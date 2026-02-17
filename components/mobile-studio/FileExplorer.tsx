"use client";

import React from "react";
import { FileCode, ChevronRight, Folder } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { cn } from "@/lib/utils";

export const FileExplorer = () => {
  const { files, activeFile, setActiveFile } = useFileStore();

  return (
    /* THE GRID-READY CONTAINER:
       Uses h-full and w-full to fill exactly the 'Row 2' workspace.
       bg-zinc-950 provides a solid 'Matte Black' surface.
    */
    <div className="flex flex-col h-full w-full bg-zinc-950 overflow-hidden">

      {/* 1. Header Section: Fixed height within the panel */}
      <div className="shrink-0 p-6 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 px-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Folder className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
            Project Files
          </h2>
        </div>
      </div>

      {/* 2. Scrollable File List: flex-1 ensures it takes the remaining height */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 py-20">
            <div className="w-16 h-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              No Files Found
            </p>
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
                  : "bg-zinc-900/20 border border-white/5 hover:bg-zinc-900/50"
              )}
            >
              <div className="flex items-center gap-4">
                {/* File Icon with Status Glow */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  activeFile === file.name 
                    ? "bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
                    : "bg-black/40 border border-white/5"
                )}>
                  <FileCode className={cn(
                    "w-5 h-5",
                    activeFile === file.name ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
                  )} />
                </div>

                <div className="text-left">
                  <p className={cn(
                    "text-sm font-medium tracking-tight transition-colors",
                    activeFile === file.name ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                  )}>
                    {file.name.split('/').pop()}
                  </p>
                  <p className="text-[9px] text-zinc-600 font-mono mt-0.5 opacity-60">
                    {file.name}
                  </p>
                </div>
              </div>

              <ChevronRight className={cn(
                "w-4 h-4 transition-all duration-300",
                activeFile === file.name ? "text-primary translate-x-1" : "text-zinc-800 opacity-0 group-hover:opacity-100"
              )} />
            </button>
          ))
        )}
        
        {/* Bottom Spacer for smooth scrolling edge */}
        <div className="h-6" />
      </div>
    </div>
  );
};
