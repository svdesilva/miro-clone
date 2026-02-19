import { createClient, LiveMap, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

// Liveblocks Storage values must satisfy LsonObject (JSON-serializable, index signature Lson | undefined)
// We use a flat record with explicit primitive fields + index sig so TypeScript is happy.
export type CanvasObjectLson = {
  [key: string]: string | number | boolean | null | undefined;
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  createdBy: string;
  createdAt: number;
};

declare global {
  interface Liveblocks {
    Storage: {
      objects: LiveMap<string, LiveObject<CanvasObjectLson>>;
    };
    Presence: {
      cursor: { x: number; y: number } | null;
      selectedObjectId: string | null;
      name: string;
      color: string;
    };
    // Must match Liveblocks IUserInfo shape: name?: string, avatar?: string, color?: string
    UserMeta: {
      id: string;
      info: {
        name?: string;
        avatar?: string;
      };
    };
    RoomEvent:
      | { type: "CLEAR_CANVAS" }
      | { type: "UNDO" }
      | { type: "REDO" };
  }
}

const roomContext = createRoomContext(client);

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useHistory,
  useBroadcastEvent,
  useEventListener,
  useCanUndo,
  useCanRedo,
  useUndo,
  useRedo,
} = roomContext.suspense;
