"use client";

import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { useOthers, useSelf } from "@liveblocks/react/suspense";

function ParticipantsInner() {
  const others = useOthers();
  const self = useSelf();

  // ...your existing rendering logic
  return (
    <div>
      {/* render participants */}
    </div>
  );
}

export default function Participants() {
  return (
    <ClientSideSuspense fallback={<div />}>
      {() => <ParticipantsInner />}
    </ClientSideSuspense>
  );
}