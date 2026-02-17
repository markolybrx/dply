"use client";

import React, { useState } from "react";
import { useFileStore } from "@/store/useFileStore";
import { Move, Link2, Layout, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LogicMap = () => {
  const { files, updateFilePosition } = useFileStore();
  const [dragging, setDragging] = useState<string | null>(null);

  // Simple drag logic for mobile and desktop
  const handleDrag = (e: React.MouseEvent | React.TouchEvent, fileName: string) => {
    if (dragging !== fileName) return;
    
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    
    // We adjust for the 80px header offset
    updateFilePosition(fileName, clientX - 80, clientY - 140);
  };

  return (
    <div 
      className="w-full h-full bg-zinc-950 relative overflow-hidden select-none"
      onMouseMove={(e) => dragging && handleDrag(e, dragging)}
      onMouseUp={() => setDragging(null)}
      onTouchMove={(e) => dragging && handleDrag(e, dragging)}
      onTouchEnd={() => setDragging(null)}
    >
      {/* 1. Designer Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />

      {/* 2. Map HUD Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-2xl">
          <Share2 className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-[0.2em]">
            Logic Architect
          </span>
        </div>
      </div>

      {/* 3. Page Nodes (The draggable previews) */}
      <div className="relative w-full h-full">
        {files.map((file, idx) => {
          // Fallback position if not yet set
          const pos = file.position || { x: 40 + idx * 40, y: 80 + idx * 60 };
          
          return (
            <div
              key={file.name}
              style={{ left: pos.x, top: pos.y }}
              className={cn(
                "absolute w-44 bg-zinc-900 rounded-2xl border transition-all duration-75 shadow-2xl overflow-hidden",
                dragging === file.name 
                  ? "border-primary scale-105 shadow-primary/20 z-50 ring-4 ring-primary/5" 
                  : "border-white/5 z-10"
              )}
            >
              {/* Header / Drag Handle */}
              <div 
                className="p-3 bg-white/5 flex items-center justify-between cursor-grab active:cursor-grabbing"
                onMouseDown={() => setDragging(file.name)}
                onTouchStart={() => setDragging(file.name)}
              >
                <div className="flex items-center gap-2">
                   <Layout className="w-3 h-3 text-zinc-500" />
                   <span className="text-[9px] font-bold text-white truncate w-24 uppercase tracking-tighter">
                      {file.name.split('/').pop()}
                   </span>
                </div>
                <Move className="w-3 h-3 text-zinc-700" />
              </div>

              {/* Mini Preview Box (Simulated for now) */}
              <div className="p-3">
                 <div className="aspect-[4/3] w-full bg-black rounded-lg border border-white/5 p-2 flex flex-col gap-1 overflow-hidden opacity-60">
                    <div className="h-1 w-1/2 bg-zinc-800 rounded-full" />
                    <div className="h-1 w-3/4 bg-zinc-800 rounded-full" />
                    <div className="mt-2 h-4 w-full bg-zinc-900 rounded-md" />
                 </div>
              </div>

              {/* Metadata Footer */}
              <div className="px-3 pb-3 flex items-center justify-between">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                 </div>
                 <div className="flex items-center gap-1">
                    <Link2 className="w-3 h-3 text-zinc-700" />
                    <span className="text-[8px] font-mono text-zinc-600">
                      {file.linksTo?.length || 0} links
                    </span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
