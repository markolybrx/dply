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
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden select-none">
      
      {/* 1. FIXED TOP HEADER: High Z-index ensures panels slide BEHIND it */}
      <header className="h-[80px] w-full shrink-0 border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[100] relative">
        <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
          Project Alpha
        </h1>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
          ID: {params.projectId}
        </p>
      </header>

      {/* 2. THE CONSTRAINED WORKSPACE: This is the ONLY space panels are allowed to exist */}
      <main className="relative flex-1 w-full bg-zinc-950 overflow-hidden z-10">
        
        {/* VIEW PANEL */}
        <div className={cn(
          "absolute inset-0 z-10 overflow-hidden transition-opacity duration-300", 
          activeTab === "view" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
           {children}
        </div>

        {/* SLIDING PANELS: translate-y is now relative ONLY to the 'main' height */}
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

      {/* 3. FIXED BOTTOM DOCK: Solid floor */}
      <footer className="h-[96px] w-full shrink-0 bg-black border-t border-white/5 z-[100] relative">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
    </div>
  );
}
