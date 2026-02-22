"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview,
  useSandpack
} from "@codesandbox/sandpack-react";
import { useFileStore } from "@/store/useFileStore";
import { Loader2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_FILES = {
  "/styles/globals.css": `
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
  "/pages/_app.tsx": `
import '../styles/globals.css';
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
  `,
  "/tailwind.config.js": `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
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
    const dynamicFiles = files.reduce((acc, file) => {
      let path = file.name.startsWith("/") ? file.name : `/${file.name}`;

      if (path === "/app/page.tsx" || path === "/app/page.jsx") {
        path = "/pages/index.tsx";
      }
      if (path === "/app/globals.css") {
        path = "/styles/globals.css"; 
      }
      if (path === "/app/layout.tsx") {
        return acc;
      }

      acc[path] = file.content;
      return acc;
    }, {} as Record<string, string>);

    return { ...BASE_FILES, ...dynamicFiles };
  }, [files]);

  const hasEntryPoint = Object.keys(sandpackFiles).some(path => path.includes("index.tsx") || path.includes("page.tsx"));

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
              template="nextjs"
              theme="light" // Apps usually default to light backgrounds unless specified
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
                <SandpackPreview 
                  className="h-full w-full bg-white" 
                  showOpenInCodeSandbox={false}
                  showRefreshButton={false}
                  showSandpackErrorOverlay={false}
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
