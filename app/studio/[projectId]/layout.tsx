"use client";

import React, { useState } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";
import { ChatInterface } from "@/components/mobile-studio/ChatInterface";
import { cn } from "@/lib/utils";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"view" | "ai" | "files" | "map">("view");

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col items-center justify-center">
      <main className="relative w-full h-full max-w-md aspect-[9/16] bg-black border border-white/5 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Layer 1: The App View (Always rendered, hidden via CSS if needed) */}
        <div className={cn("absolute inset-0 z-0", activeTab === "view" ? "block" : "hidden")}>
           {children}
        </div>

        {/* Layer 2: The AI Chat Interface */}
        <div className={cn("absolute inset-0 z-10 bg-black/50 backdrop-blur-3xl transition-all duration-300", 
            activeTab === "ai" ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
           <ChatInterface />
        </div>

      </main>

      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
         <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
