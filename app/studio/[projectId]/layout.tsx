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
    // THE OUTER BOX: Fixed screen, flex column
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-full">

      {/* BOX 1: TOP HEADER */}
      <header className="h-20 w-full shrink-0 border-b border-white/5 flex flex-col justify-center px-6 bg-black relative">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
            Project Alpha
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
            ID: {params.projectId}
          </p>
        </div>
      </header>

      {/* BOX 2: THE WORKSPACE (The containment field) */}
      {/* 'overflow-hidden' here is what prevents panels from going into the header/footer */}
      <main className="relative flex-1 w-full bg-black overflow-hidden border-y border-transparent">
        
        {/* VIEW PANEL (Base content) */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-300", 
          activeTab === "view" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
          {children}
        </div>

        {/* SLIDING PANELS: These only exist within the 'main' box boundaries */}
        {/* AI PANEL */}
        <div className={cn(
          "absolute inset-0 bg-black transition-transform duration-500 ease-in-out flex flex-col", 
          activeTab === "ai" ? "translate-y-0" : "translate-y-full"
        )}>
           <ChatInterface />
        </div>

        {/* FILES PANEL */}
        <div className={cn(
          "absolute inset-0 bg-black transition-transform duration-500 ease-in-out flex flex-col", 
          activeTab === "files" ? "translate-y-0" : "translate-y-full"
        )}>
           <FileExplorer />
        </div>

        {/* LOGIC MAP PANEL */}
        <div className={cn(
          "absolute inset-0 bg-black transition-transform duration-500 ease-in-out flex flex-col", 
          activeTab === "map" ? "translate-y-0" : "translate-y-full"
        )}>
           <LogicMap />
        </div>
      </main>

      {/* BOX 3: FOOTER / DOCK */}
      <footer className="h-24 w-full shrink-0 bg-black border-t border-white/5 flex items-center justify-center relative">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
    </div>
  );
}
