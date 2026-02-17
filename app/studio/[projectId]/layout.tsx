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
    // Outer container: Fills 100% of the viewport height and width
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col">
      
      {/* --- TOP HEADER --- */}
      <header className="absolute top-0 left-0 right-0 z-[100] p-6 bg-gradient-to-b from-black via-black/90 to-transparent pointer-events-none">
        <div className="flex flex-col select-none pointer-events-auto">
          <h1 className="text-xl font-bold text-white tracking-tight leading-none mb-1">
            Project Alpha
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
            ID: {params.projectId}
          </p>
        </div>
      </header>

      {/* Main Workspace: No forced aspect ratio. Fills the screen edges. */}
      <main className="relative flex-1 w-full bg-black flex flex-col overflow-hidden">
        
        {/* Layer 1: The App View */}
        <div className={cn(
          "absolute inset-0 z-0 pt-24 pb-24 transition-opacity duration-300", 
          activeTab === "view" ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
           <div className="w-full h-full overflow-y-auto">
              {children}
           </div>
        </div>

        {/* Layer 2: The AI Chat Interface */}
        <div className={cn(
          "absolute inset-0 z-20 bg-black/60 backdrop-blur-3xl pt-24 pb-24 transition-all duration-500 ease-in-out", 
          activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <ChatInterface />
        </div>

        {/* Layer 3: The File Explorer */}
        <div className={cn(
          "absolute inset-0 z-30 bg-black pt-24 pb-24 transition-all duration-500 ease-in-out", 
          activeTab === "files" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <FileExplorer />
        </div>

      </main>

      {/* Navigation (Fixed at bottom) */}
      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Background Visuals (Moved to background layer) */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
