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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-2 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <Icon
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive && tab.id === "ai" ? "text-primary drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" : "",
                  isActive && tab.id === "view" ? "text-secondary" : ""
                )}
              />
              
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
