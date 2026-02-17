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
    // Outer Container: Fixed to the screen, no scrolling allowed on the root
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      
      {/* 1. FIXED TOP HEADER: Fixed height (h-20) */}
      <header className="h-20 w-full shrink-0 border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[100]">
        <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
          Project Alpha
        </h1>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
          ID: {params.projectId}
        </p>
      </header>

      {/* 2. MAIN WORKSPACE: This area 'grows' to take all available middle space */}
      <main className="relative flex-1 w-full overflow-hidden bg-black">
        
        {/* Layer 1: App View (Live Preview) */}
        <div className={cn(
          "absolute inset-0 z-0 overflow-y-auto transition-opacity duration-300", 
          activeTab === "view" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          {children}
        </div>

        {/* Layer 2: AI Chat Interface */}
        <div className={cn(
          "absolute inset-0 z-20 bg-zinc-950 transition-all duration-500 ease-in-out", 
          activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <ChatInterface />
        </div>

        {/* Layer 3: File Explorer */}
        <div className={cn(
          "absolute inset-0 z-30 bg-zinc-950 transition-all duration-500 ease-in-out", 
          activeTab === "files" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <FileExplorer />
        </div>
      </main>

      {/* 3. FIXED BOTTOM DOCK: Takes its own height naturally at the bottom */}
      <div className="w-full shrink-0 h-24 relative z-[100]">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Background Visuals */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
