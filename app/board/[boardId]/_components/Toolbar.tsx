"use client";

import {
  MousePointer2,
  StickyNote,
  Square,
  Circle,
  MoveRight,
  Pencil,
  Type,
  Undo2,
  Redo2,
} from "lucide-react";
import { useToolStore } from "@/store/useToolStore";
import type { ToolType } from "@/types/canvas";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@/liveblocks.config";
import { cn } from "@/lib/utils";

const TOOLS: { type: ToolType; icon: React.ReactNode; label: string }[] = [
  { type: "select", icon: <MousePointer2 className="h-5 w-5" />, label: "Select (V)" },
  { type: "sticky-note", icon: <StickyNote className="h-5 w-5" />, label: "Sticky Note (S)" },
  { type: "rectangle", icon: <Square className="h-5 w-5" />, label: "Rectangle (R)" },
  { type: "circle", icon: <Circle className="h-5 w-5" />, label: "Circle (C)" },
  { type: "arrow", icon: <MoveRight className="h-5 w-5" />, label: "Arrow (A)" },
  { type: "pen", icon: <Pencil className="h-5 w-5" />, label: "Pen (P)" },
  { type: "text", icon: <Type className="h-5 w-5" />, label: "Text (T)" },
];

export default function Toolbar() {
  const { activeTool, setActiveTool } = useToolStore();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-10 flex items-center gap-1 bg-white rounded-xl shadow-lg px-3 py-2 border">
      {TOOLS.map((tool) => (
        <Tooltip key={tool.type}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setActiveTool(tool.type)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                activeTool === tool.type
                  ? "bg-blue-100 text-blue-600"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {tool.icon}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{tool.label}</TooltipContent>
        </Tooltip>
      ))}

      <div className="h-6 w-px bg-neutral-200 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Redo (Ctrl+Y)</TooltipContent>
      </Tooltip>
    </div>
  );
}
