"use client";

import React from "react";
import { useToastStore } from "@/store/useToastStore";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    /* CHANGED: 'fixed' -> 'absolute'. 
       Now it lives inside the container it's placed in. 
       z-[100] ensures it floats above the AI/File panels (which are z-50).
    */
    <div className="absolute top-4 right-4 z-[100] flex flex-col gap-3 w-72 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border border-white/10",
              // Creamy Notification Style
              "bg-[#FDFBF7] text-black" 
            )}
          >
            {/* Icon based on type */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            </div>

            <div className="flex-1">
              <p className="text-[11px] font-bold leading-tight tracking-tight uppercase opacity-80 mb-0.5">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
              </p>
              <p className="text-[10px] text-zinc-800 font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
