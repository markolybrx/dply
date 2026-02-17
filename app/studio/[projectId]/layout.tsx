"use client";

import React, { useState } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";
import { ChatInterface } from "@/components/mobile-studio/ChatInterface";
import { FileExplorer } from "@/components/mobile-studio/FileExplorer";
import { LogicMap } from "@/components/mobile-studio/LogicMap";
import { ToastContainer } from "@/components/ui/ToastContainer"; // <--- Added this
import { cn } from "@/lib/utils";

export default function StudioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  // These string values must match the IDs in your BottomDock
  const [activeTab, setActiveTab] = useState<"view" | "ai" | "files" | "map">("view");

  return (
    // ROOT: Locked to viewport
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-full">

      {/* BOX 1: TOP HEADER (Z-60 to block panels) */}
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

      {/* BOX 2: THE WORKSPACE (The Containment Zone) */}
      <main className="relative flex-1 w-full bg-black overflow-hidden border-y border-transparent z-10">

        {/* 1. LIVE PREVIEW (Base Layer) */}
        <div className={cn(
          "absolute inset-0 z-0 transition-opacity duration-300", 
          activeTab === "view" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
          {children}
        </div>

        {/* 2. AI CHAT PANEL */}
        <div className={cn(
          "absolute inset-0 bg-black transition-all duration-500 ease-in-out flex flex-col", 
          activeTab === "ai" ? "translate-y-0 z-50 visible" : "translate-y-full z-0 invisible pointer-events-none"
        )}>
           <ChatInterface />
        </div>

        {/* 3. FILE EXPLORER PANEL */}
        <div className={cn(
          "absolute inset-0 bg-black transition-all duration-500 ease-in-out flex flex-col", 
          activeTab === "files" ? "translate-y-0 z-50 visible" : "translate-y-full z-0 invisible pointer-events-none"
        )}>
           <FileExplorer />
        </div>

        {/* 4. LOGIC MAP PANEL */}
        <div className={cn(
          "absolute inset-0 bg-black transition-all duration-500 ease-in-out flex flex-col", 
          activeTab === "map" ? "translate-y-0 z-50 visible" : "translate-y-full z-0 invisible pointer-events-none"
        )}>
           <LogicMap />
        </div>
      </main>

      {/* BOX 3: FOOTER / DOCK (Z-60 to block panels) */}
      <footer className="h-24 w-full shrink-0 bg-black border-t border-white/5 flex items-center justify-center z-[60] relative">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>

      {/* NOTIFICATION LAYER: Floats above everything (Z-200) */}
      <ToastContainer />
    </div>
  );
}
