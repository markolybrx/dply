"use client";

import React from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { useFileStore } from "@/store/useFileStore";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LivePreview = () => {
  const { files, isCompiling } = useFileStore();

  // Map our internal file state to Sandpack's required format
  const sandpackFiles = files.reduce((acc, file) => {
    // Sandpack expects paths to start with a forward slash
    const path = file.name.startsWith("/") ? file.name : `/${file.name}`;
    acc[path] = file.content;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl">
      {/* 1. COMPILING OVERLAY */}
      <div 
        className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300",
          isCompiling ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <span className="text-[11px] font-mono text-indigo-300 tracking-[0.2em] uppercase animate-pulse">
          Compiling Code...
        </span>
      </div>

      {/* 2. NEXT.JS RUNTIME ENVIRONMENT */}
      <div className={cn(
        "w-full h-full transition-opacity duration-500",
        isCompiling ? "opacity-40 blur-sm" : "opacity-100 blur-0"
      )}>
        {Object.keys(sandpackFiles).length > 0 ? (
          <Sandpack
            template="nextjs"
            theme="dark"
            files={sandpackFiles}
            options={{
              showNavigator: false,
              showTabs: false,
              showEditor: false,
              showPreview: true,
              editorHeight: "100%",
              editorWidthPercentage: 0,
            }}
            customSetup={{
              dependencies: {
                "lucide-react": "^0.358.0",
                "tailwind-merge": "^2.2.1",
                "clsx": "^2.1.0"
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-zinc-600 font-mono text-xs">
            Awaiting project initialization...
          </div>
        )}
      </div>
    </div>
  );
};
