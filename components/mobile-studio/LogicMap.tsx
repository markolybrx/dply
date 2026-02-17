"use client";

import React, { useState } from "react";
import { useFileStore } from "@/store/useFileStore";
import { Move, Link2, Layout, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LogicMap = () => {
  const { files, updateFilePosition } = useFileStore();
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, fileName: string) => {
    if (dragging !== fileName) return;

    // Get viewport coordinates
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;

    /**
     * OFFSET MATH:
     * clientX/Y are viewport-relative. 
     * Our 'main' workspace starts 80px down from the top (Header height).
     * We subtract ~80-90px from X and ~120px from Y to center the node 
     * under the user's touch point.
     */
    updateFilePosition(fileName, clientX - 88, clientY - 120);
  };

  return (
    /* BOX 2 INTERNAL:
       Strictly contained within the workspace. 
       'select-none' prevents text highlighting while dragging.
    */
    <div 
      className="relative flex flex-col h-full w-full bg-black overflow-hidden select-none"
      onMouseMove={(e) => dragging && handleDrag(e, dragging)}
      onMouseUp={() => setDragging(null)}
      onTouchMove={(e) => dragging && handleDrag(e, dragging)}
      onTouchEnd={() => setDragging(null)}
    >
      {/* 1. Designer Canvas Grid (Fixed to the box) */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* 2. Map HUD Overlay (Floating inside Box 2) */}
      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-2xl">
          <Share2 className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-[0.2em] font-bold">
            Logic Architect
          </span>
        </div>
      </div>

      {/* 3. The Canvas Workspace */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {files.map((file, idx) => {
          // Calculate default staggered positions for new pages
          const pos = file.position || { x: 40 + (idx * 20), y: 60 + (idx * 40) };

          return (
            <div
              key={file.name}
              style={{ 
                left: `${pos.x}px`, 
                top: `${pos.y}px`,
                touchAction: 'none' // Prevents browser pull-to-refresh while dragging
              }}
              className={cn(
                "absolute w-44 bg-zinc-900 rounded-2xl border transition-all duration-75 shadow-2xl overflow-hidden",
                dragging === file.name 
                  ? "border-primary scale-105 shadow-primary/30 z-[100] ring-4 ring-primary/10" 
                  : "border-white/5 z-10"
              )}
            >
              {/* Node Header / Drag Handle */}
              <div 
                className="p-3 bg-white/5 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/5"
                onMouseDown={() => setDragging(file.name)}
                onTouchStart={() => setDragging(file.name)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                   <Layout className="w-3 h-3 text-primary/70 shrink-0" />
                   <span className="text-[9px] font-bold text-white truncate uppercase tracking-tighter">
                      {file.name.split('/').pop()}
                   </span>
                </div>
                <Move className="w-3 h-3 text-zinc-600" />
              </div>

              {/* Node Content Preview */}
              <div className="p-3 bg-black/20">
                 <div className="aspect-[16/10] w-full bg-black/60 rounded-lg border border-white/5 p-2 flex flex-col gap-1.5 overflow-hidden">
                    <div className="h-1 w-1/3 bg-zinc-800 rounded-full" />
                    <div className="h-1 w-2/3 bg-zinc-800 rounded-full" />
                    <div className="mt-auto h-3 w-full bg-zinc-900/50 rounded-sm" />
                 </div>
              </div>

              {/* Node Footer */}
              <div className="px-3 py-2 bg-zinc-950/50 flex items-center justify-between">
                 <div className="flex gap-1">
                    <div className={cn("w-1 h-1 rounded-full", file.linksTo?.length ? "bg-primary" : "bg-zinc-800")} />
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Link2 className="w-2.5 h-2.5 text-zinc-600" />
                    <span className="text-[8px] font-mono text-zinc-500">
                      {file.linksTo?.length || 0} conn
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
