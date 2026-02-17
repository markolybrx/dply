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
    // ROOT: A strict grid that splits the screen into Header, Workspace, and Dock.
    <div className="fixed inset-0 bg-black grid grid-rows-[80px_1fr_96px] overflow-hidden w-full h-full">
      
      {/* ROW 1: HEADER (Strictly 80px) */}
      <header className="w-full border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[100] overflow-hidden">
        <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
          Project Alpha
        </h1>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
          ID: {params.projectId}
        </p>
      </header>

      {/* ROW 2: WORKSPACE (Takes all remaining space between Header and Dock) */}
      <main className="relative w-full h-full overflow-hidden bg-black">
        
        {/* Layer: View (App Content) */}
        <div className={cn(
          "absolute inset-0 z-10 transition-opacity duration-300 overflow-y-auto", 
          activeTab === "view" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
          {children}
        </div>

        {/* Layer: AI Panel (Slides up from the bottom of Row 2) */}
        <div className={cn(
          "absolute inset-0 z-20 bg-black transition-all duration-500 ease-out flex flex-col", 
          activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           {/* We wrap the component to ensure it stretches to full height of Row 2 */}
           <div className="flex-1 overflow-hidden">
             <ChatInterface />
           </div>
        </div>

        {/* Layer: Files Panel (Slides up from the bottom of Row 2) */}
        <div className={cn(
          "absolute inset-0 z-30 bg-black transition-all duration-500 ease-out flex flex-col", 
          activeTab === "files" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <div className="flex-1 overflow-hidden">
             <FileExplorer />
           </div>
        </div>
      </main>

      {/* ROW 3: DOCK (Strictly 96px) */}
      <footer className="w-full bg-black border-t border-white/5 flex items-center justify-center z-[100] overflow-hidden">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
    </div>
  );
}
