"use client";

import React, { useMemo } from "react";
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackPreview 
} from "@codesandbox/sandpack-react";
import { useFileStore } from "@/store/useFileStore";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// PREMIUM INFRASTRUCTURE: Silent injection of essential configurations.
// This prevents the AI from wasting tokens on boilerplate and ensures Tailwind works instantly.
const BASE_FILES = {
  "/app/globals.css": `
@tailwind base;
@tailwind components;
@tailwind utilities;

body { 
  background-color: #000; 
  color: #fff; 
  font-family: system-ui, -apple-system, sans-serif;
}
  `,
  "/app/layout.tsx": `
import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
  `,
  "/tailwind.config.js": `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
  // BRIDGE: Sandpack defaults to Pages router. We force its index to mount your AI's App Router page.
  "/pages/index.js": `
import App from '../app/page';
export default App;
  `,
  "/pages/_app.js": `
import '../app/globals.css';
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
  `
};

export const LivePreview = () => {
  const { files, isCompiling } = useFileStore();

  // Map internal file state and merge it with our silent infrastructure
  const sandpackFiles = useMemo(() => {
    const dynamicFiles = files.reduce((acc, file) => {
      const path = file.name.startsWith("/") ? file.name : `/${file.name}`;
      acc[path] = file.content;
      return acc;
    }, {} as Record<string, string>);

    return { ...BASE_FILES, ...dynamicFiles };
  }, [files]);

  // Safety Gate: Don't boot the heavy iframe until the AI has actually written the main page
  const hasEntryPoint = Object.keys(sandpackFiles).some(path => path.includes("page.tsx"));

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
            <SandpackLayout className="h-full w-full !rounded-none !border-0 bg-transparent">
              <SandpackPreview 
                className="h-full w-full bg-black" 
                showOpenInCodeSandbox={false}
                showRefreshButton={true}
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
