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
    /* OUTER WRAPPER: Forced grid structure */
    <div className="fixed inset-0 bg-black grid grid-rows-[80px_1fr_96px] overflow-hidden">
      
      {/* 1. TOP HEADER: Row 1 */}
      <header className="w-full border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[100]">
        <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
          Project Alpha
        </h1>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
          ID: {params.projectId}
        </p>
      </header>

      {/* 2. THE MAIN WORKSPACE: Row 2 (Flexible Middle) */}
      <main className="relative w-full h-full overflow-hidden bg-black">
        
        {/* VIEW PANEL */}
        <div className={cn(
          "absolute inset-0 z-10 transition-opacity duration-300", 
          activeTab === "view" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
          {/* Internal scroll for content */}
          <div className="h-full w-full overflow-y-auto">
            {children}
          </div>
        </div>

        {/* AI PANEL: Bound strictly by Main boundaries */}
        <div className={cn(
          "absolute inset-0 z-20 bg-black transition-all duration-500 ease-out", 
          activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <ChatInterface />
        </div>

        {/* FILES PANEL: Bound strictly by Main boundaries */}
        <div className={cn(
          "absolute inset-0 z-30 bg-black transition-all duration-500 ease-out", 
          activeTab === "files" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <FileExplorer />
        </div>
      </main>

      {/* 3. BOTTOM DOCK AREA: Row 3 */}
      <footer className="w-full bg-black border-t border-white/5 flex items-center justify-center relative z-[100]">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>

      {/* Global Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full" />
      </div>
    </div>
  );
}
