"use client";

import React from "react";
import { CodePreview } from "@/components/mobile-studio/CodePreview";

export default function StudioPage() {
  return (
    <div className="w-full h-full bg-black">
      {/* This component now acts as your live 'Screen'. 
          It will automatically update whenever the AI sends an :::UPDATE::: command 
          targeting 'app/page.tsx'.
      */}
      <CodePreview />
    </div>
  );
}
