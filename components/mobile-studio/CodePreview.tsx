"use client";

import React from "react";
import { useFileStore } from "@/store/useFileStore";
import { Globe, Monitor, Code2 } from "lucide-react";

export const CodePreview = () => {
  const { files } = useFileStore();

  // Prioritize app/page.tsx as the entry point
  const mainFile = files.find(f => f.name === 'app/page.tsx');

  if (!mainFile) {
    return (
      /* GRID-READY EMPTY STATE:
         Ensures the centered content stays centered in the middle grid row.
      */
      <div className="flex flex-col items-center justify-center h-full w-full bg-black text-zinc-700 space-y-4">
        <div className="p-5 rounded-full bg-zinc-900/30 animate-pulse">
           <Monitor className="w-8 h-8 opacity-40" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-zinc-600 animate-pulse">
           Initializing Viewport
        </p>
      </div>
    );
  }

  return (
    /* GRID-READY PREVIEW:
       Matches the height of Row 2 in StudioLayout exactly.
    */
    <div className="flex flex-col h-full w-full bg-black overflow-hidden">
      
      {/* 1. Address Bar Simulation (Shrink-0 pins it to the top of the middle row) */}
      <div className="shrink-0 px-6 py-4 flex items-center gap-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
        </div>
        <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-full py-1.5 px-4 flex items-center gap-3">
          <Globe className="w-3 h-3 text-zinc-600" />
          <span className="text-[10px] text-zinc-500 font-mono truncate tracking-tight">
            dply.dev/preview/main
          </span>
        </div>
      </div>

      {/* 2. Live Content Area: Internal scroll only within Row 2 */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
         <div className="w-full min-h-full rounded-2xl bg-zinc-900/10 border border-white/5 p-6 relative overflow-hidden">
            
            {/* Design Grid Overlay for 'Canvas' depth */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ 
                   backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                   backgroundSize: '30px 30px' 
                 }} 
            />

            <div className="relative z-10">
              {/* Source Indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-2 rounded-lg">
                   <Code2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Active Entry</span>
                   <span className="text-[9px] font-mono text-zinc-600 truncate">{mainFile.name}</span>
                </div>
              </div>

              {/* Code View Card */}
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 shadow-inner">
                <pre className="text-[11px] leading-relaxed text-zinc-300 font-mono whitespace-pre-wrap break-words">
                    {mainFile.content}
                </pre>
              </div>
            </div>
         </div>
         
         {/* Internal spacer to ensure the bottom edge of code isn't cut off */}
         <div className="h-4" />
      </div>
    </div>
  );
};
