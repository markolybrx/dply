"use client";

import React, { useEffect } from "react";
// Swapped CodePreview for LivePreview to enable the Sandpack runtime
import { LivePreview } from "@/components/mobile-studio/LivePreview";
import { useFileStore } from "@/store/useFileStore";
import { useToastStore } from "@/store/useToastStore";

export default function StudioPage({ params }: { params: { projectId: string } }) {
  const { fetchFiles, isLoading } = useFileStore();
  const { addToast } = useToastStore();

  // 1. Fetch Files on Mount
  useEffect(() => {
    if (params.projectId) {
      const loadData = async () => {
        try {
          await fetchFiles(params.projectId);
          // Optional: Notify user that system is ready
          // addToast("Project loaded successfully", "info");
        } catch (error) {
          console.error("Failed to load project:", error);
          addToast("Failed to load project files", "error");
        }
      };

      loadData();
    }
  }, [params.projectId, fetchFiles, addToast]);

  return (
    <div className="w-full h-full bg-black">
      {/* This component acts as your live 'Screen'. 
        It now uses the Sandpack Next.js runtime to compile and render the store's code.
      */}
      <LivePreview />
    </div>
  );
}
