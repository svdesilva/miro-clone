"use client";

import { useEffect, useState } from "react";
import BoardCard from "./BoardCard";
import NewBoardButton from "./NewBoardButton";
import EmptyBoards from "./EmptyBoards";

interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: number;
}

export default function BoardList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = async () => {
    try {
      const res = await fetch("/api/boards");
      const data = await res.json();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/boards/${id}`, { method: "DELETE" });
    setBoards((prev) => prev.filter((b) => b.id !== id));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-neutral-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <NewBoardButton onCreated={fetchBoards} />
      {boards.length === 0 ? (
        <EmptyBoards />
      ) : (
        boards.map((board) => (
          <BoardCard key={board.id} board={board} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
