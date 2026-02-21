"use client";

import React, { useState, useEffect } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";
import { ChatInterface } from "@/components/mobile-studio/ChatInterface";
import { FileExplorer } from "@/components/mobile-studio/FileExplorer";
import { LogicMap } from "@/components/mobile-studio/LogicMap";
import { ToastContainer } from "@/components/ui/ToastContainer"; 
import { cn } from "@/lib/utils";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function StudioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const [activeTab, setActiveTab] = useState<"view" | "ai" | "files" | "map">("view");
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch with resizable panels by rendering desktop layout only on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    // ROOT CONTAINER: Fixed to viewport, no scrolling on the body
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-full">

      {/* BOX 1: TOP HEADER (Fixed Height) */}
      <header className="h-16 md:h-20 w-full shrink-0 border-b border-white/5 flex flex-col justify-center px-6 bg-black z-[60] relative">
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
      <main className="relative flex-1 w-full bg-black overflow-hidden z-10">
        
        {/* --- MOBILE VIEW (< md) --- */}
        <div className="md:hidden relative w-full h-full">
          <div className={cn("absolute inset-0 w-full h-full bg-black", activeTab === "view" ? "block z-50" : "hidden z-0")}>
            {children}
          </div>
          <div className={cn("absolute inset-0 w-full h-full bg-black flex flex-col", activeTab === "ai" ? "flex z-50" : "hidden z-0")}>
             <ChatInterface />
          </div>
          <div className={cn("absolute inset-0 w-full h-full bg-black flex flex-col", activeTab === "files" ? "flex z-50" : "hidden z-0")}>
             <FileExplorer />
          </div>
          <div className={cn("absolute inset-0 w-full h-full bg-black flex flex-col", activeTab === "map" ? "flex z-50" : "hidden z-0")}>
             <LogicMap />
          </div>
        </div>

        {/* --- DESKTOP VIEW (>= md) --- */}
        {isMounted && (
          <div className="hidden md:flex w-full h-full">
            <PanelGroup direction="horizontal">
              
              {/* LEFT PANEL: Workspace (Preview, Files, or Map) */}
              <Panel defaultSize={65} minSize={30}>
                <div className="w-full h-full relative bg-black flex flex-col">
                  {/* Desktop Navigation Tabs */}
                  <div className="h-10 shrink-0 border-b border-white/5 bg-zinc-950 flex items-center px-4 gap-4 z-50">
                    <button 
                      onClick={() => setActiveTab("view")} 
                      className={cn("text-[10px] uppercase font-mono tracking-wider transition-colors", activeTab === "view" || activeTab === "ai" ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
                    >
                      Preview
                    </button>
                    <button 
                      onClick={() => setActiveTab("files")} 
                      className={cn("text-[10px] uppercase font-mono tracking-wider transition-colors", activeTab === "files" ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
                    >
                      Explorer
                    </button>
                    <button 
                      onClick={() => setActiveTab("map")} 
                      className={cn("text-[10px] uppercase font-mono tracking-wider transition-colors", activeTab === "map" ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
                    >
                      Logic Map
                    </button>
                  </div>

                  {/* Desktop Workspace Content */}
                  <div className="flex-1 w-full relative">
                    {activeTab === "files" ? (
                      <div className="absolute inset-0"><FileExplorer /></div>
                    ) : activeTab === "map" ? (
                      <div className="absolute inset-0"><LogicMap /></div>
                    ) : (
                      <div className="absolute inset-0">{children}</div>
                    )}
                  </div>
                </div>
              </Panel>

              {/* RESIZE HANDLE */}
              <PanelResizeHandle className="w-1 bg-white/5 hover:bg-indigo-500/50 transition-colors cursor-col-resize z-50 flex items-center justify-center">
                <div className="h-8 w-0.5 bg-white/20 rounded-full" />
              </PanelResizeHandle>

              {/* RIGHT PANEL: AI Chat */}
              <Panel defaultSize={35} minSize={25}>
                <div className="w-full h-full bg-zinc-950 flex flex-col">
                  <div className="h-10 shrink-0 border-b border-white/5 flex items-center px-4 bg-black">
                    <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest">AI Assistant</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChatInterface />
                  </div>
                </div>
              </Panel>

            </PanelGroup>
          </div>
        )}

        {/* NOTIFICATION LAYER */}
        <ToastContainer />

      </main>

      {/* BOX 3: FOOTER / DOCK (Fixed Height - MOBILE ONLY) */}
      <footer className="md:hidden h-24 w-full shrink-0 bg-black border-t border-white/5 flex items-center justify-center z-[60] relative">
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
    </div>
  );
}
