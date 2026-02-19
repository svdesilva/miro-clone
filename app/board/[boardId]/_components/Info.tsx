"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface InfoProps {
  boardId: string;
}

export default function Info({ boardId }: InfoProps) {
  const [title, setTitle] = useState("Loading...");

  useEffect(() => {
    fetch(`/api/boards/${boardId}`)
      .then((r) => r.json())
      .then((b) => setTitle(b.title ?? "Untitled"))
      .catch(() => setTitle("Untitled"));
  }, [boardId]);

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div className="h-5 w-px bg-neutral-200" />
      <span className="text-sm font-medium truncate max-w-[200px]">{title}</span>
    </div>
  );
}
