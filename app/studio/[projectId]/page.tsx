"use client";

import React, { useEffect } from "react";
import { CodePreview } from "@/components/mobile-studio/CodePreview";
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
        It displays the content loaded into the store by the useEffect above.
      */}
      <CodePreview />
    </div>
  );
}
