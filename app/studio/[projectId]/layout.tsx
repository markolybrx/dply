"use client";

import React, { useState } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";
import { ChatInterface } from "@/components/mobile-studio/ChatInterface";
import { FileExplorer } from "@/components/mobile-studio/FileExplorer";
import { LogicMap } from "@/components/mobile-studio/LogicMap";
import { ToastContainer } from "@/components/ui/ToastContainer"; 
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
    // ROOT CONTAINER: Fixed to viewport, no scrolling on the body
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-full">

      {/* BOX 1: TOP HEADER (Fixed Height) */}
      <header className="h-20 w-full shrink-0 border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[60] relative">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
            Project Alpha
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] opacity-80">
            ID: {params.projectId}
          </p>
        </div>
      </header>

      {/* BOX 2: WORKSPACE (Flexible Middle Container) */}
      <main className="relative flex-1 w-full bg-black overflow-hidden border-y border-transparent z-10">

        {/* 1. LIVE PREVIEW PANEL (Default Children) */}
        {/* Uses 'display: none' (hidden) when inactive for instant switching */}
        <div className={cn(
          "absolute inset-0 w-full h-full bg-black", 
          activeTab === "view" ? "block z-50" : "hidden z-0"
        )}>
          {children}
        </div>

        {/* 2. AI CHAT PANEL */}
        <div className={cn(
          "absolute inset-0 w-full h-full bg-black flex flex-col", 
          activeTab === "ai" ? "flex z-50" : "hidden z-0"
        )}>
           <ChatInterface />
        </div>

        {/* 3. FILE EXPLORER PANEL */}
        <div className={cn(
          "absolute inset-0 w-full h-full bg-black flex flex-col", 
          activeTab === "files" ? "flex z-50" : "hidden z-0"
        )}>
           <FileExplorer />
        </div>

        {/* 4. LOGIC MAP PANEL */}
        <div className={cn(
          "absolute inset-0 w-full h-full bg-black flex flex-col", 
          activeTab === "map" ? "flex z-50" : "hidden z-0"
        )}>
           <LogicMap />
        </div>

        {/* 5. NOTIFICATION LAYER */}
        {/* Stays persistent in the top-right of the middle box */}
        <ToastContainer />

      </main>

      {/* BOX 3: FOOTER / DOCK (Fixed Height) */}
      <footer className="h-24 w-full shrink-0 bg-black border-t border-white/5 flex items-center justify-center z-[60] relative">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
    </div>
  );
}
