"use client";

import React from "react";
import { useToastStore } from "@/store/useToastStore";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 w-80 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border border-white/10",
              // The 'Cream' Style requested:
              "bg-[#FDFBF7] text-black" 
            )}
          >
            {/* Icon based on type */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>

            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold leading-tight tracking-tight">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'System Info'}
              </p>
              <p className="text-xs text-zinc-600 mt-1 font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-zinc-400 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
