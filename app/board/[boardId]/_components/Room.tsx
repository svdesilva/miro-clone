"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import { Suspense } from "react";
import { RoomProvider } from "@/liveblocks.config";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import Info from "./Info";
import Participants from "./Participants";

interface RoomProps {
  boardId: string;
}

function BoardRoom({ boardId }: { boardId: string }) {
  return (
    <RoomProvider
      id={boardId}
      initialPresence={{
        cursor: null,
        selectedObjectId: null,
        name: "Anonymous",
        color: "#4FC3F7",
      }}
      initialStorage={{
        objects: new LiveMap(),
      }}
    >
      <div className="relative w-full h-screen overflow-hidden bg-neutral-100">
        <Info boardId={boardId} />
        <Participants />
        <Toolbar />
        <Canvas />
      </div>
    </RoomProvider>
  );
}

export default function Room({ boardId }: RoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center bg-neutral-100 text-neutral-400">
            Connecting to board...
          </div>
        }
      >
        <BoardRoom boardId={boardId} />
      </Suspense>
    </LiveblocksProvider>
  );
}
