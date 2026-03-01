"use client";

import React, { useMemo } from "react";
import { FileCode, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { cn } from "@/lib/utils";

export const FileExplorer = () => {
  const { files, activeFile, setActiveFile } = useFileStore();

  // Group files by their directory path for a premium IDE tree view
  const groupedFiles = useMemo(() => {
    return files.reduce((acc, file) => {
      const parts = file.name.split('/');
      // If it's a root file, place it in 'root', otherwise join the directory parts
      const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '/';
      if (!acc[dir]) acc[dir] = [];
      acc[dir].push(file);
      return acc;
    }, {} as Record<string, typeof files>);
  }, [files]);

  return (
    <div className="flex flex-col h-full w-full bg-black overflow-hidden">
      {/* Internal Header */}
      <div className="shrink-0 p-4 md:p-6 pb-4 border-b border-white/5 bg-zinc-950/50">
        <div className="flex items-center gap-2 px-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Folder className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">
            Project Files
          </h2>
        </div>
      </div>

      {/* Scrollable File List (Native scrollbar enabled for desktop UX) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 py-20">
            <div className="w-16 h-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-center">
              No Files Found <br/> Describe your app to start
            </p>
          </div>
        ) : (
          Object.entries(groupedFiles).map(([dir, dirFiles]) => (
            <div key={dir} className="space-y-2">
              {/* Directory Header */}
              <div className="flex items-center gap-2 px-2 mb-2 opacity-70">
                <FolderOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  {dir === '/' ? 'root' : dir}
                </span>
              </div>

              {/* Files inside Directory */}
              <div className="space-y-1">
                {dirFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setActiveFile(file.name)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 md:p-4 rounded-xl transition-all duration-300 group",
                      activeFile === file.name 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-zinc-900/20 border border-white/5 hover:bg-zinc-900/50"
                    )}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={cn(
                        "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                        activeFile === file.name 
                          ? "bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
                          : "bg-black/40 border border-white/5"
                      )}>
                        <FileCode className={cn(
                          "w-4 h-4 md:w-5 md:h-5",
                          activeFile === file.name ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
                        )} />
                      </div>

                      <div className="text-left">
                        <p className={cn(
                          "text-xs md:text-sm font-medium tracking-tight transition-colors",
                          activeFile === file.name ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                        )}>
                          {file.name.split('/').pop()}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={cn(
                      "w-4 h-4 transition-all duration-300",
                      activeFile === file.name ? "text-primary translate-x-1" : "text-zinc-800 opacity-0 group-hover:opacity-100"
                    )} />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
        {/* Bottom Spacer */}
        <div className="h-6" />
      </div>
    </div>
  );
};
