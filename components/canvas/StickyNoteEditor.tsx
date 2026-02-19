"use client";

import { useEffect, useRef } from "react";

interface EditingStickyState {
  objectId: string;
  text: string;
  screenX: number;
  screenY: number;
  screenWidth: number;
  screenHeight: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  zoom: number;
}

interface StickyNoteEditorProps {
  editingSticky: EditingStickyState;
  onTextChange: (text: string) => void;
  onCommit: () => void;
}

export type { EditingStickyState };

export default function StickyNoteEditor({
  editingSticky,
  onTextChange,
  onCommit,
}: StickyNoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    // Small delay to ensure the textarea is rendered before focusing
    const timer = setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        // Place cursor at the end of existing text
        ta.setSelectionRange(ta.value.length, ta.value.length);
      }
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const padding = 10 * editingSticky.zoom;

  return (
    <div
      className="absolute z-40"
      style={{
        left: editingSticky.screenX,
        top: editingSticky.screenY,
        width: editingSticky.screenWidth,
        height: editingSticky.screenHeight,
      }}
    >
      {/* Colored background to match sticky */}
      <div
        className="absolute inset-0 rounded"
        style={{
          backgroundColor: editingSticky.backgroundColor,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      />
      {/* Blue editing border */}
      <div
        className="absolute inset-0 rounded pointer-events-none"
        style={{
          border: "2px solid #0b99ff",
        }}
      />
      {/* Textarea for editing */}
      <textarea
        ref={textareaRef}
        value={editingSticky.text}
        placeholder="Type something..."
        onChange={(e) => onTextChange(e.target.value)}
        onBlur={onCommit}
        className="absolute inset-0 w-full h-full resize-none border-none outline-none bg-transparent placeholder:text-black/30"
        style={{
          padding: `${padding}px`,
          color: editingSticky.textColor,
          fontSize: `${editingSticky.fontSize * editingSticky.zoom}px`,
          fontFamily: "sans-serif",
          lineHeight: 1.16,
          overflow: "hidden",
        }}
        // Prevent keyboard shortcuts from triggering canvas actions
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Escape") {
            onCommit();
          }
        }}
      />
    </div>
  );
}
