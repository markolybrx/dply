"use client";

import React, { useState } from "react";
import { useFileStore } from "@/store/useFileStore";
import { Move, Link as LinkIcon, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LogicMap = () => {
  const { files, updateFilePosition } = useFileStore();
  
  // Local state to track which page is being dragged
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, fileName: string) => {
    if (dragging !== fileName) return;
    
    // Get coordinates from Mouse or Touch
    const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    
    // Adjusting for header (80px) and offset
    updateFilePosition(fileName, x - 50, y - 120);
  };

  return (
    <div 
      className="w-full h-full bg-zinc-950 relative overflow-hidden"
      onMouseMove={(e) => dragging && handleDrag(e, dragging)}
      onMouseUp={() => setDragging(null)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full">
          <Share2 className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Architect Mode</span>
        </div>
      </div>

      {/* Page Nodes */}
      {files.map((file, idx) => {
        const pos = file.position || { x: 50 + idx * 100, y: 100 + idx * 50 };
        
        return (
          <div
            key={file.name}
            style={{ left: pos.x, top: pos.y }}
            className={cn(
              "absolute w-40 p-3 rounded-2xl border bg-zinc-900 shadow-2xl cursor-grab active:cursor-grabbing transition-shadow",
              dragging === file.name ? "border-primary shadow-primary/20 scale-105" : "border-white/10"
            )}
            onMouseDown={() => setDragging(file.name)}
            onTouchStart={() => setDragging(file.name)}
            onTouchEnd={() => setDragging(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <Move className="w-3 h-3 text-zinc-600" />
            </div>

            <p className="text-[10px] font-bold text-white truncate mb-1">{file.name.split('/').pop()}</p>
            <p className="text-[8px] text-zinc-500 font-mono mb-3">{file.name}</p>

            {/* Mini Preview Mock */}
            <div className="w-full h-20 bg-black rounded-lg border border-white/5 flex items-center justify-center">
               <div className="w-8 h-1 bg-zinc-800 rounded-full" />
            </div>

            {/* Link Indicators */}
            <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
               <LinkIcon className="w-3 h-3 text-zinc-700" />
               <div className="flex-1 h-1 bg-zinc-800 rounded-full mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
