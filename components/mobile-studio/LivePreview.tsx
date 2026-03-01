"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview,
  useSandpack
} from "@codesandbox/sandpack-react";
import { useFileStore } from "@/store/useFileStore";
import { Loader2, Smartphone, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// PREMIUM INFRASTRUCTURE: Vite/React-TS Configuration
const BASE_FILES = {
  "/styles.css": `
@tailwind base;
@tailwind components;
@tailwind utilities;

body { 
  background-color: #000; 
  color: #fff; 
  font-family: system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}
  `,
  "/tailwind.config.js": `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
  `,
  "/postcss.config.js": `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
  `,
  // INJECTED TSCONFIG: Translates Next.js @/ aliases to Vite root paths
  "/tsconfig.json": `
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["./**/*.ts", "./**/*.tsx"]
}
  `
};

// THE ENGINE MASK
const SandpackBootMask = () => {
  const { sandpack } = useSandpack();
  const isBooting = sandpack.status === "initial" || sandpack.status === "idle";

  if (!isBooting) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-zinc-950">
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-4" />
      <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] uppercase animate-pulse">
        Mounting OS...
      </span>
    </div>
  );
};

// THE AUTO-FIX INTERCEPTOR
const SandpackErrorHandler = () => {
  const { sandpack } = useSandpack();
  const [isFixing, setIsFixing] = useState(false);
  const [isChatGenerating, setIsChatGenerating] = useState(false);

  // THE GLOBAL LOCK: Listen to the ChatInterface to see if the AI is already busy
  useEffect(() => {
    const handleStatus = (e: Event) => {
      const event = e as CustomEvent<{ isGenerating: boolean }>;
      setIsChatGenerating(event.detail.isGenerating);
    };

    window.addEventListener("DPLY_GENERATION_STATUS", handleStatus);
    return () => window.removeEventListener("DPLY_GENERATION_STATUS", handleStatus);
  }, []);

  // TYPE CORRECTION: Only mount if the engine has physically crashed and generated an error object
  if (!sandpack.error) return null;

  const handleAutoFix = () => {
    setIsFixing(true);

    // Extract the raw trace and beam it to the ChatInterface via a global window event
    const errorMessage = sandpack.error?.message || "Unknown compilation error in Sandpack engine.";
    window.dispatchEvent(new CustomEvent("DPLY_AUTO_FIX", { 
      detail: { error: errorMessage } 
    }));

    // Reset visual state after 3 seconds in case the network request is still pending
    setTimeout(() => setIsFixing(false), 3000);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-md p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
      </div>
      <p className="text-sm text-red-300 font-mono mb-8">System compilation failed.</p>

      <button
        onClick={handleAutoFix}
        disabled={isFixing || isChatGenerating}
        className={cn(
          "flex items-center gap-3 px-6 py-3 bg-zinc-900 border rounded-full shadow-2xl transition-all text-white font-mono text-xs",
          isFixing || isChatGenerating
            ? "border-white/5 opacity-50 cursor-not-allowed"
            : "border-white/10 hover:bg-zinc-800 hover:border-white/20"
        )}
      >
        {isFixing ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        ) : isChatGenerating ? (
          <AlertCircle className="w-4 h-4 text-zinc-500" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
            <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/>
            <path d="m14 7 3 3"/>
            <path d="M5 6v4"/>
            <path d="M19 14v4"/>
            <path d="M10 2v2"/>
            <path d="M7 8H3"/>
            <path d="M21 16h-4"/>
            <path d="M11 3H9"/>
          </svg>
        )}
        {isFixing ? "Initializing Auto-Fix..." : isChatGenerating ? "System Locked" : "Auto Fix"}
      </button>
    </div>
  );
};

export const LivePreview = () => {
  const { files, isCompiling } = useFileStore();
  const [isLandscape, setIsLandscape] = useState(false);

  // HARDWARE DETECTION: Listen to device orientation changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(orientation: landscape)");
    setIsLandscape(mediaQuery.matches);

    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches);
    };

    mediaQuery.addEventListener("change", handleOrientationChange);
    return () => mediaQuery.removeEventListener("change", handleOrientationChange);
  }, []);

  const sandpackFiles = useMemo(() => {
    // COMPILER OVERRIDE: Using explicit iteration instead of generic reduction to prevent SWC parser crash
    const dynamicFiles: Record<string, string> = {};

    files.forEach((file) => {
      let path = file.name.startsWith("/") ? file.name : `/${file.name}`;

      // VITE PROXY: Translate Next.js App Router to Vite's root App.tsx
      if (path === "/app/page.tsx" || path === "/app/page.jsx") {
        path = "/App.tsx";
      }
      if (path === "/app/globals.css") {
        path = "/styles.css"; 
      }
      // Strip layout.tsx completely as Vite mounts directly to index.html
      if (path === "/app/layout.tsx") {
        return;
      }

      dynamicFiles[path] = file.content;
    });

    return { ...BASE_FILES, ...dynamicFiles };
  }, [files]);

  // Safety Gate: Ensure we have the App.tsx entry point before booting
  const hasEntryPoint = Object.keys(sandpackFiles).some(path => path.includes("App.tsx") || path.includes("page.tsx"));

  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center p-4">

      {/* 1. COMPILING OVERLAY */}
      <div 
        className={cn(
          "absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300",
          isCompiling ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <span className="text-[11px] font-mono text-indigo-300 tracking-[0.2em] uppercase animate-pulse">
          Compiling Native Modules...
        </span>
      </div>

      {/* 2. THE HARDWARE BEZEL (16:9 or 9:16 Emulator Shell) */}
      <div 
        className={cn(
          "relative bg-zinc-950 border-[8px] border-zinc-800 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out overflow-hidden flex items-center justify-center ring-1 ring-white/10",
          isLandscape ? "w-full max-w-4xl aspect-video" : "h-full max-h-[850px] aspect-[9/16]"
        )}
      >
        {/* Hardware Notch Illusion */}
        {!isLandscape && (
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50 pointer-events-none">
             <div className="w-32 h-6 bg-zinc-800 rounded-b-xl" />
          </div>
        )}

        <div className={cn(
          "w-full h-full transition-opacity duration-500 relative bg-white",
          isCompiling ? "opacity-40 blur-sm" : "opacity-100 blur-0"
        )}>
          {hasEntryPoint ? (
            <SandpackProvider
              template="react-ts" // TRUE VITE ENGINE SWAP
              theme="light"
              files={sandpackFiles}
              customSetup={{
                dependencies: {
                  "lucide-react": "latest",
                  "tailwind-merge": "latest",
                  "clsx": "latest",
                  "tailwindcss": "^3.4.1",
                  "postcss": "^8.4.35",
                  "autoprefixer": "^10.4.17"
                }
              }}
            >
              <SandpackLayout className="h-full w-full !rounded-none !border-0 bg-transparent relative">
                <SandpackBootMask />
                <SandpackErrorHandler />
                <SandpackPreview 
                  className="h-full w-full bg-white" 
                  showOpenInCodeSandbox={false}
                  showRefreshButton={false}
                  showSandpackErrorOverlay={false}
                  showNavigator={false} // ANNIHILATES THE LOCALHOST BAR
                />
              </SandpackLayout>
            </SandpackProvider>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-zinc-500 font-mono text-xs gap-3 bg-zinc-950">
               <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5 shadow-inner">
                 <Smartphone className="w-5 h-5 text-zinc-600" />
               </div>
               Awaiting Build Payload...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
