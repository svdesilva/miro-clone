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

const STROKE_COLORS = [
  "#111827",
  "#6B7280",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
];

const FILL_COLORS = [
  "transparent",
  "#FDE047",
  "#A7F3D0",
  "#BFDBFE",
  "#FECACA",
  "#E9D5FF",
  "#FDBA74",
];

const STROKE_WIDTHS = [1, 2, 4, 8];

export default function Toolbar() {
  const {
    activeTool,
    strokeColor,
    fillColor,
    strokeWidth,
    setActiveTool,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
  } = useToolStore();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div className="absolute left-4 top-20 z-10 flex flex-col gap-3 bg-white rounded-xl shadow-lg px-3 py-3 border">
      <div className="flex flex-col gap-1">
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
            <TooltipContent side="right">{tool.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="h-px w-full bg-neutral-200" />

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">Stroke</span>
        <div className="grid grid-cols-4 gap-1">
          {STROKE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setStrokeColor(color)}
              className={cn(
                "h-5 w-5 rounded border",
                strokeColor === color ? "ring-2 ring-blue-500 ring-offset-1" : "border-neutral-200"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Stroke ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">Fill</span>
        <div className="grid grid-cols-4 gap-1">
          {FILL_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setFillColor(color)}
              className={cn(
                "h-5 w-5 rounded border",
                fillColor === color ? "ring-2 ring-blue-500 ring-offset-1" : "border-neutral-200"
              )}
              style={{
                backgroundColor: color === "transparent" ? "white" : color,
              }}
              aria-label={color === "transparent" ? "No fill" : `Fill ${color}`}
            >
              {color === "transparent" ? (
                <span className="block h-full w-full bg-[linear-gradient(135deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]" />
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">Stroke width</span>
        <div className="flex items-center gap-1">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => setStrokeWidth(width)}
              className={cn(
                "h-6 w-6 rounded border flex items-center justify-center",
                strokeWidth === width
                  ? "border-blue-500 text-blue-600"
                  : "border-neutral-200 text-neutral-500"
              )}
              aria-label={`Stroke width ${width}`}
            >
              <span
                className="block rounded-full bg-current"
                style={{ width: Math.max(2, width), height: Math.max(2, width) }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-neutral-200" />

      <div className="flex items-center gap-1">
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
          <TooltipContent side="right">Undo (Ctrl+Z)</TooltipContent>
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
          <TooltipContent side="right">Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
