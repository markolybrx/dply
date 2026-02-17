"use client";

import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Plus, Smartphone, Zap } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  // REAL FUNCTION: Generates a unique ID and opens a fresh studio
  const createNewProject = () => {
    const newId = nanoid(10); // Generates "V1StGXR8_Z"
    router.push(`/studio/${newId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6">
      
      {/* Header */}
      <header className="flex items-center justify-between py-4 mb-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center border border-primary/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">dply</span>
        </div>
      </header>

      {/* Main Action Area */}
      <main className="flex-1 flex flex-col justify-center items-center text-center gap-8">
        
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
          <h1 className="relative text-4xl font-bold tracking-tight mb-2">
            Build Native. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Fast.
            </span>
          </h1>
        </div>

        <p className="text-zinc-500 max-w-xs mx-auto">
          No mockups. No delays. Spin up a live Android environment instantly.
        </p>

        {/* The "Real" Create Button */}
        <button 
          onClick={createNewProject}
          className="group relative w-full max-w-xs bg-white text-black font-bold h-14 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Project</span>
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl ring-2 ring-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Empty State Indicator */}
        <div className="flex items-center gap-2 text-xs text-zinc-600 mt-8">
          <Zap className="w-4 h-4" />
          <span>System Ready. 0 Active Projects.</span>
        </div>

      </main>
    </div>
  );
}
