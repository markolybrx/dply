"use client";

import React, { useState } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";
import { ChatInterface } from "@/components/mobile-studio/ChatInterface";
import { FileExplorer } from "@/components/mobile-studio/FileExplorer";
import { cn } from "@/lib/utils";

export default function StudioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const [activeTab, setActiveTab] = useState<"view" | "ai" | "files" | "map">("view");

  return (
    // The Root: Locked to the viewport, no scrolling on this layer
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      
      {/* 1. TOP HEADER: Rigid height, non-negotiable space */}
      <header className="h-20 w-full shrink-0 border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[100]">
        <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
          Project Alpha
        </h1>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
          ID: {params.projectId}
        </p>
      </header>

      {/* 2. THE WORKSPACE: This is the ONLY area that can contain panels */}
      <main className="relative flex-1 w-full bg-black overflow-hidden">
        
        {/* VIEW PANEL: Occupies the middle ground exactly */}
        <div className={cn(
          "absolute inset-0 z-0 overflow-y-auto transition-opacity duration-300", 
          activeTab === "view" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          {children}
        </div>

        {/* AI PANEL: Bound by the main container's edges */}
        <div className={cn(
          "absolute inset-0 z-20 bg-zinc-950 transition-all duration-500 ease-in-out", 
          activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <ChatInterface />
        </div>

        {/* FILES PANEL: Bound by the main container's edges */}
        <div className={cn(
          "absolute inset-0 z-30 bg-zinc-950 transition-all duration-500 ease-in-out", 
          activeTab === "files" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <FileExplorer />
        </div>
      </main>

      {/* 3. BOTTOM DOCK AREA: Fixed height at the very bottom */}
      <div className="h-24 w-full shrink-0 bg-black border-t border-white/5 z-[100] relative">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Ambient Visuals (Absolute background) */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_50%)]" />
      </div>
    </div>
  );
}
