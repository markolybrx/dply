"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Eye, Bot, FolderOpen, GitGraph } from "lucide-react";

type Tab = "view" | "ai" | "files" | "map";

interface BottomDockProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const BottomDock = ({ activeTab, setActiveTab }: BottomDockProps) => {
  const tabs = [
    { id: "view", icon: Eye, label: "View" },
    { id: "ai", icon: Bot, label: "AI" },
    { id: "files", icon: FolderOpen, label: "Files" },
    { id: "map", icon: GitGraph, label: "Logic" },
  ];

  return (
    /* REMOVED 'fixed bottom-6'. 
       The component now centers itself within the footer box of Box 3. 
    */
    <div className="flex items-center justify-center w-full h-full px-4">
      <div className="flex items-center gap-1 p-1.5 bg-zinc-900/50 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                console.log("Switching to tab:", tab.id); // Debugging log
                setActiveTab(tab.id as Tab);
              }}
              className={cn(
                "relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 mb-1",
                  isActive ? "scale-110" : "scale-100",
                  isActive && tab.id === "ai" ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : ""
                )}
              />

              <span className={cn(
                "text-[9px] font-bold uppercase tracking-tighter transition-opacity",
                isActive ? "opacity-100" : "opacity-40"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
