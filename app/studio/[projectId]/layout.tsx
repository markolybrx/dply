"use client";

import React, { useState } from "react";
import { BottomDock } from "@/components/mobile-studio/BottomDock";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"view" | "ai" | "files" | "map">("view");

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col items-center justify-center">
      
      {/* 1. The Main Canvas (Children) */}
      <main className="relative w-full h-full max-w-md aspect-[9/16] bg-black border border-white/5 shadow-2xl flex flex-col">
        {children}
      </main>

      {/* 2. The Bottom Dock */}
      <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 3. Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

    </div>
  );
}
