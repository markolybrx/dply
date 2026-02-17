import React, { useState } from "react";
import { ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogAccordionProps {
  title: string;
  description: string;
  isLast?: boolean;
}

export const LogAccordion = ({ title, description, isLast }: LogAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all",
          isOpen 
            ? "bg-zinc-800 border-zinc-700" 
            : "bg-zinc-900/50 border-white/5 hover:bg-zinc-800/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-medium text-zinc-300">{title}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", isOpen && "rotate-180")} />
      </button>
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-3 bg-black/20 rounded-lg text-xs text-zinc-400 border border-white/5 ml-2 font-mono leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
