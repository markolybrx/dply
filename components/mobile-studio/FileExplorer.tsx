"use client";

import React from "react";
import { FileCode, ChevronRight, Folder } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { cn } from "@/lib/utils";

export const FileExplorer = () => {
  const { files, activeFile, setActiveFile } = useFileStore();

  return (
    <div className="flex flex-col h-full bg-black p-4 pt-12">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Folder className="w-5 h-5 text-zinc-500" />
        <h2 className="text-lg font-bold text-white uppercase tracking-widest text-xs">Project Files</h2>
      </div>

      <div className="space-y-1">
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => setActiveFile(file.name)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
              activeFile === file.name 
                ? "bg-primary/10 border border-primary/20" 
                : "hover:bg-zinc-900 border border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <FileCode className={cn(
                "w-5 h-5",
                activeFile === file.name ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
              )} />
              <div className="text-left">
                <p className={cn(
                  "text-sm font-medium",
                  activeFile === file.name ? "text-white" : "text-zinc-500"
                )}>{file.name.split('/').pop()}</p>
                <p className="text-[10px] text-zinc-600 font-mono">{file.name}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-800" />
          </button>
        ))}
      </div>
    </div>
  );
};
