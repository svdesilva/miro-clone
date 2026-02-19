"use client";

import dynamic from "next/dynamic";

const FabricCanvas = dynamic(
  () => import("@/components/canvas/FabricCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center text-neutral-400">
        Loading canvas...
      </div>
    ),
  }
);

export default function Canvas() {
  return (
    <div className="w-full h-full">
      <FabricCanvas />
    </div>
  );
}
