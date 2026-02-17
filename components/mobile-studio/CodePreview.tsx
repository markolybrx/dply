"use client";

import React, { useMemo } from "react";
import { useFileStore } from "@/store/useFileStore";

export const CodePreview = () => {
  const { files } = useFileStore();
  
  // We prioritize rendering app/page.tsx as the main view
  const mainFile = files.find(f => f.name === 'app/page.tsx');

  if (!mainFile) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No preview available.
      </div>
    );
  }

  // NOTE: In a production environment, we would use a Sandpack or Iframe
  // For this mobile-first version, we are simulating the render of the code
  return (
    <div className="w-full h-full bg-black overflow-y-auto">
      <div className="p-6">
         {/* We display the AI's content. In Phase 4, we'll add a compiler */}
         <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 min-h-[400px]">
            <pre className="text-xs text-zinc-500 font-mono whitespace-pre-wrap">
                {mainFile.content}
            </pre>
         </div>
      </div>
    </div>
  );
};
