"use client";

import React, { useMemo } from "react";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview,
  useSandpack
} from "@codesandbox/sandpack-react";
import { useFileStore } from "@/store/useFileStore";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// PREMIUM INFRASTRUCTURE: Silent injection of essential configurations.
const BASE_FILES = {
  "/styles/globals.css": `
@tailwind base;
@tailwind components;
@tailwind utilities;

body { 
  background-color: #000; 
  color: #fff; 
  font-family: system-ui, -apple-system, sans-serif;
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

// THE ENGINE MASK: Intercepts Sandpack's ugly booting phase
const SandpackBootMask = () => {
  const { sandpack } = useSandpack();
  // We mask the UI completely while Sandpack initializes its virtual machine
  const isBooting = sandpack.status === "initializing" || sandpack.status === "idle";

  if (!isBooting) return null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black">
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-4" />
      <span className="text-[10px] font-mono text-zinc-400 tracking-[0.2em] uppercase animate-pulse">
        Booting Virtual Environment...
      </span>
    </div>
  );
};

export const LivePreview = () => {
  const { files, isCompiling } = useFileStore();

  // Map internal file state and proxy App Router to Pages Router
  const sandpackFiles = useMemo(() => {
    const dynamicFiles = files.reduce((acc, file) => {
      let path = file.name.startsWith("/") ? file.name : `/${file.name}`;
      
      // APP ROUTER PROXY: Transparently translate app/page to pages/index to prevent Sandpack crashes
      if (path === "/app/page.tsx" || path === "/app/page.jsx") {
        path = "/pages/index.tsx";
      }
      if (path === "/app/globals.css") {
        path = "/styles/globals.css"; // Overwrite base styles if AI writes them
      }
      // Strip layout.tsx completely as we handle wrappers in _app.tsx
      if (path === "/app/layout.tsx") {
        return acc;
      }

      acc[path] = file.content;
      return acc;
    }, {} as Record<string, string>);

    return { ...BASE_FILES, ...dynamicFiles };
  }, [files]);

  // Safety Gate: Don't boot the heavy iframe until the AI has actually written an entry file
  const hasEntryPoint = Object.keys(sandpackFiles).some(path => path.includes("index.tsx") || path.includes("page.tsx"));

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl">
      {/* 1. COMPILING OVERLAY (Your app state) */}
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
        "w-full h-full transition-opacity duration-500 relative",
        isCompiling ? "opacity-40 blur-sm" : "opacity-100 blur-0"
      )}>
        {hasEntryPoint ? (
          <SandpackProvider
            template="nextjs"
            theme="dark"
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
            {/* STRICT LAYOUT: Forces the engine to only mount the visual preview */}
            <SandpackLayout className="h-full w-full !rounded-none !border-0 bg-transparent relative">
              <SandpackBootMask />
              <SandpackPreview 
                className="h-full w-full bg-black" 
                showOpenInCodeSandbox={false}
                showRefreshButton={false}
                showSandpackErrorOverlay={false}
                showLoadingScreen={false}
              />
            </SandpackLayout>
          </SandpackProvider>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-zinc-600 font-mono text-xs gap-3">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
               <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
             </div>
             Awaiting application architecture...
          </div>
        )}
      </div>
    </div>
  );
};
