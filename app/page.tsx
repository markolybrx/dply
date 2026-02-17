import Link from "next/link";
import { Plus, Smartphone, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight">dply</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
      </header>

      {/* Hero / Create Section */}
      <main className="flex-1 flex flex-col gap-6">
        <h1 className="text-3xl font-light text-zinc-400">
          Good evening, <br />
          <span className="text-white font-bold">Builder.</span>
        </h1>

        {/* New Project Card */}
        <Link href="/studio/new-project" className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-6 transition-all active:scale-95">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">New Project</h2>
              <p className="text-sm text-zinc-500">Start from scratch or import</p>
            </div>
          </div>
        </Link>

        {/* Recent Projects List */}
        <div className="mt-4">
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4">Recent</p>
          
          <Link href="/studio/project-alpha" className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-white/5 mb-2 active:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <span className="text-xs font-bold text-zinc-400">PA</span>
              </div>
              <div>
                <h3 className="font-medium text-white">Project Alpha</h3>
                <p className="text-xs text-zinc-500">Edited 2m ago</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </Link>

          <Link href="/studio/ecommerce-app" className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-white/5 mb-2 active:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                <span className="text-xs font-bold text-zinc-400">EC</span>
              </div>
              <div>
                <h3 className="font-medium text-white">E-Commerce App</h3>
                <p className="text-xs text-zinc-500">Edited 1d ago</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600" />
          </Link>
        </div>
      </main>
    </div>
  );
}
