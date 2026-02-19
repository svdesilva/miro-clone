"use client";

import { useOthers, useSelf } from "@/liveblocks.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MAX_SHOWN = 4;

export default function Participants() {
  const others = useOthers();
  const self = useSelf();

  const allUsers = [
    ...(self ? [{ id: "self", info: self.info, color: self.presence?.color }] : []),
    ...others.map((o) => ({ id: o.connectionId.toString(), info: o.info, color: o.presence?.color })),
  ];

  const shown = allUsers.slice(0, MAX_SHOWN);
  const overflow = allUsers.length - MAX_SHOWN;

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
      {shown.map((user) => (
        <Tooltip key={user.id}>
          <TooltipTrigger>
            <Avatar className="h-8 w-8 border-2" style={{ borderColor: user.color ?? "#888" }}>
              <AvatarImage src={user.info?.avatar} />
              <AvatarFallback style={{ backgroundColor: user.color ?? "#888" }} className="text-white text-xs font-bold">
                {(user.info?.name ?? "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            {user.id === "self" ? `${user.info?.name} (You)` : user.info?.name}
          </TooltipContent>
        </Tooltip>
      ))}
      {overflow > 0 && (
        <div className="h-8 w-8 rounded-full bg-neutral-300 border-2 border-white flex items-center justify-center text-xs font-bold text-neutral-600">
          +{overflow}
        </div>
      )}
    </div>
  );
}
