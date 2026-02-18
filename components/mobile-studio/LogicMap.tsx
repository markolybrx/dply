"use client";

import React, { useRef } from "react";
import { useFileStore } from "@/store/useFileStore";
import { motion } from "framer-motion";
import { FileCode, Move } from "lucide-react";
import { useParams } from "next/navigation";

export const LogicMap = () => {
  const { files, updateFilePosition } = useFileStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. GET THE PROJECT ID
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#0D0D0D] overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(#2a2a2a 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* MAP TITLE */}
      <div className="absolute top-6 left-6 pointer-events-none opacity-50">
        <h2 className="text-xs font-bold text-white tracking-widest uppercase mb-1">Logic Map</h2>
        <p className="text-[10px] text-zinc-500 font-mono">
          {files.length} Nodes Active
        </p>
      </div>

      {/* DRAGGABLE NODES */}
      {files.map((file) => (
        <motion.div
          key={file.name}
          drag
          dragMomentum={false}
          // Use saved position or default to center
          initial={{ 
            x: file.position?.x || 100, 
            y: file.position?.y || 100 
          }}
          // Update Store + Database on release
          onDragEnd={(_, info) => {
            if (!containerRef.current) return;
            
            // Calculate new position relative to the container
            const newX = (file.position?.x || 100) + info.offset.x;
            const newY = (file.position?.y || 100) + info.offset.y;

            // 2. PASS PROJECT ID TO THE FUNCTION
            updateFilePosition(projectId, file.name, newX, newY);
          }}
          className="absolute flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing group"
        >
          {/* Node Card */}
          <div className="w-44 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl group-hover:border-white/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                <FileCode className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-zinc-200 truncate flex-1">
                {file.name}
              </span>
              <Move className="w-3 h-3 text-zinc-600" />
            </div>
            
            {/* Mini Code Preview */}
            <div className="h-12 w-full bg-zinc-900/50 rounded-lg p-2 overflow-hidden">
               <div className="space-y-1 opacity-40">
                  <div className="h-1 w-1/2 bg-zinc-600 rounded-full" />
                  <div className="h-1 w-3/4 bg-zinc-700 rounded-full" />
                  <div className="h-1 w-2/3 bg-zinc-700 rounded-full" />
               </div>
            </div>
          </div>

          {/* Connection Point */}
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </motion.div>
      ))}
    </div>
  );
};
