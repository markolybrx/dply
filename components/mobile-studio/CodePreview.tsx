"use client";

import React from "react";
import { useFileStore } from "@/store/useFileStore";
import { SandpackProvider, SandpackLayout, SandpackPreview } from "@codesandbox/sandpack-react";
import { Monitor } from "lucide-react";

export const CodePreview = () => {
  const { files } = useFileStore();

  // Find the main entry file
  const mainFile = files.find(f => f.name === 'app/page.tsx');

  // If no files exist yet, show the "Initializing" state
  if (!mainFile || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black text-zinc-700 space-y-4">
        <div className="p-5 rounded-full bg-zinc-900/30 animate-pulse">
           <Monitor className="w-8 h-8 opacity-40" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-zinc-600 animate-pulse text-center">
           Awaiting Input
        </p>
      </div>
    );
  }

  // CONVERT: We map your 'app/page.tsx' to 'App.tsx' so Sandpack runs it instantly.
  // We also inject Tailwind via CDN for immediate styling support.
  const sandpackFiles = files.reduce((acc, file) => {
    if (file.name === 'app/page.tsx') {
      acc['/App.tsx'] = file.content;
    } else {
      // Clean up path names for the sandbox environment
      const cleanName = file.name.replace('app/', ''); 
      acc[`/${cleanName}`] = file.content;
    }
    return acc;
  }, {} as Record<string, string>);

  return (
    /* BOX 2 INTERNAL: 
       Strict 'h-full' ensures the preview fills the workspace exactly. 
    */
    <div className="h-full w-full bg-black overflow-hidden relative group">
      
      <SandpackProvider 
        template="react-ts"
        theme="dark"
        files={sandpackFiles}
        options={{ 
          // Inject Tailwind CSS so your AI-generated styles work instantly
          externalResources: ["https://cdn.tailwindcss.com"],
          classes: {
            "sp-layout": "h-full w-full block", // Force layout to fill container
            "sp-wrapper": "h-full w-full block",
            "sp-preview": "h-full w-full block",
          }
        }}
      >
        <SandpackLayout style={{ height: '100%', width: '100%', border: 'none', borderRadius: 0 }}>
           {/* The Live Screen */}
           <SandpackPreview 
             style={{ height: '100%' }} 
             showOpenInCodeSandbox={false} 
             showRefreshButton={true}
           />
        </SandpackLayout>
      </SandpackProvider>

      {/* Optional: 'Live' Indicator Badge */}
      <div className="absolute top-4 right-4 pointer-events-none z-50">
         <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Live</span>
         </div>
      </div>

    </div>
  );
};
