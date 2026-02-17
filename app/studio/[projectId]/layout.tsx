"use client";

import React, { useState } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";
import { ChatInterface } from "@/components/mobile-studio/ChatInterface";
import { FileExplorer } from "@/components/mobile-studio/FileExplorer";
import { cn } from "@/lib/utils";

export default function StudioLayout({
  children,
  params, // We pull the projectId from the URL params
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const [activeTab, setActiveTab] = useState<"view" | "ai" | "files" | "map">("view");

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col items-center justify-center">
      
      {/* The "Device" Frame */}
      <main className="relative w-full h-full max-w-md aspect-[9/16] bg-black border border-white/5 shadow-2xl flex flex-col overflow-hidden">
        
        {/* --- NEW TOP HEADER --- */}
        <header className="absolute top-0 left-0 right-0 z-[50] p-6 bg-gradient-to-b from-black via-black/80 to-transparent">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
              Project Alpha
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">
              ID: {params.projectId}
            </p>
          </div>
        </header>
        {/* --------------------- */}

        {/* Layer 1: The App View (Live Preview) */}
        <div className={cn("absolute inset-0 z-0 pt-20", 
            activeTab === "view" ? "opacity-100" : "opacity-0 pointer-events-none transition-opacity"
        )}>
           {children}
        </div>

        {/* Layer 2: The AI Chat Interface */}
        <div className={cn(
          "absolute inset-0 z-20 bg-black/60 backdrop-blur-3xl pt-20 transition-all duration-500 ease-in-out", 
          activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <ChatInterface />
        </div>

        {/* Layer 3: The File Explorer */}
        <div className={cn(
          "absolute inset-0 z-30 bg-black pt-20 transition-all duration-500 ease-in-out", 
          activeTab === "files" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <FileExplorer />
        </div>

      </main>

      {/* Navigation */}
      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Ambient Background Visuals */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
