"use client";

import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { useOthers, useSelf } from "@liveblocks/react/suspense";

function ParticipantsInner() {
  const _others = useOthers();
  const _self = useSelf();

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