"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Board {
  id: string;
  title: string;
  createdAt: number;
}

interface BoardCardProps {
  board: Board;
  onDelete: (id: string) => void;
}

export default function BoardCard({ board, onDelete }: BoardCardProps) {
  return (
    <div className="group relative flex flex-col h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/board/${board.id}`} className="flex-1 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 transition-colors">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <rect x="8" y="8" width="20" height="20" rx="3" fill="#bfdbfe" />
          <rect x="32" y="8" width="20" height="20" rx="3" fill="#bbf7d0" />
          <rect x="8" y="32" width="20" height="20" rx="3" fill="#fef08a" />
          <rect x="32" y="32" width="20" height="20" rx="3" fill="#fecaca" />
        </svg>
      </Link>
      <div className="flex items-center justify-between p-3 border-t">
        <div>
          <p className="font-medium text-sm truncate max-w-[140px]">{board.title}</p>
          <p className="text-xs text-neutral-400">
            {new Date(board.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => {
            e.preventDefault();
            onDelete(board.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
