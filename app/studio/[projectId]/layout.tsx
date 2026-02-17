"use client";

import React, { useState } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";
import { ChatInterface } from "@/components/mobile-studio/ChatInterface";
import { FileExplorer } from "@/components/mobile-studio/FileExplorer";
import { LogicMap } from "@/components/mobile-studio/LogicMap";
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
    // ROOT: Lock the entire app to the viewport
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-full">
      
      {/* THE WRAPPER: This creates the 3-section stack */}
      <div className="relative flex flex-col h-full w-full overflow-hidden">
        
        {/* 1. TOP HEADER: High Z-index (50) ensures panels slide BEHIND it */}
        <header className="h-20 w-full shrink-0 border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[50] relative">
          <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
            Project Alpha
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
            ID: {params.projectId}
          </p>
        </header>

        {/* 2. THE WORKSPACE: Only this middle section can contain panels */}
        <main className="relative flex-1 w-full bg-black overflow-hidden z-10">
          
          {/* VIEW PANEL (The base layer) */}
          <div className={cn(
            "absolute inset-0 z-0 transition-opacity duration-300", 
            activeTab === "view" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}>
            {children}
          </div>

          {/* SLIDING PANELS: Controlled by translate-y relative to 'main' height only */}
          <div className={cn(
            "absolute inset-0 z-20 bg-black transition-all duration-500 ease-out flex flex-col overflow-hidden", 
            activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          )}>
             <ChatInterface />
          </div>

          <div className={cn(
            "absolute inset-0 z-30 bg-black transition-all duration-500 ease-out flex flex-col overflow-hidden", 
            activeTab === "files" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          )}>
             <FileExplorer />
          </div>

          <div className={cn(
            "absolute inset-0 z-40 bg-black transition-all duration-500 ease-out flex flex-col overflow-hidden", 
            activeTab === "map" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
          )}>
             <LogicMap />
          </div>
        </main>

        {/* 3. DOCK AREA: Fixed floor at bottom */}
        <footer className="h-24 w-full shrink-0 bg-black border-t border-white/5 flex items-center justify-center z-[50] relative">
          <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
        </footer>
      </div>

      {/* Global Background Glow (Hidden in panels via bg-black) */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
