"use client";

import { useOthers } from "@/liveblocks.config";

export default function LiveCursors() {
  const others = useOthers();

  return (
    <>
      {others.map((other) => {
        const cursor = other.presence?.cursor;
        if (!cursor) return null;

        const name = other.info?.name ?? "Anonymous";
        const color = other.presence?.color ?? "#888";

        return (
          <div
            key={other.connectionId}
            className="pointer-events-none absolute z-50"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={color}
              stroke="white"
              strokeWidth="1"
            >
              <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" />
            </svg>
            <div
              className="absolute left-4 top-4 text-xs font-medium text-white px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </>
  );
}
