"use client";

import React from "react";
import { useFileStore } from "@/store/useFileStore";
import { Globe, Monitor } from "lucide-react";

export const CodePreview = () => {
  const { files } = useFileStore();
  
  // Prioritize app/page.tsx as the entry point
  const mainFile = files.find(f => f.name === 'app/page.tsx');

  if (!mainFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-700 space-y-4">
        <Monitor className="w-12 h-12 opacity-20" />
        <p className="text-[10px] uppercase tracking-widest font-mono">Initializing Viewport...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex flex-col">
      {/* 1. Address Bar Simulation */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-white/5 bg-zinc-950/50">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
        </div>
        <div className="flex-1 bg-zinc-900 rounded-lg py-1 px-3 flex items-center gap-2">
          <Globe className="w-3 h-3 text-zinc-600" />
          <span className="text-[10px] text-zinc-500 font-mono truncate">localhost:3000/</span>
        </div>
      </div>

      {/* 2. Live Content Area */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
         <div className="w-full min-h-full rounded-2xl bg-zinc-900/20 border border-white/5 p-6 shadow-inner relative overflow-hidden">
            {/* Subtle Grid Background for that 'Canvas' feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
            />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 opacity-40">
                <div className="h-[1px] flex-1 bg-zinc-800" />
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">Source: {mainFile.name}</span>
                <div className="h-[1px] flex-1 bg-zinc-800" />
              </div>

              <pre className="text-[11px] leading-relaxed text-zinc-400 font-mono whitespace-pre-wrap break-all">
                  {mainFile.content}
              </pre>
            </div>
         </div>
      </div>
    </div>
  );
};
