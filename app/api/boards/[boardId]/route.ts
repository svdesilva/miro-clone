import { auth } from "@clerk/nextjs/server";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "boards.json");

interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: number;
}

async function readBoards(): Promise<Board[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeBoards(boards: Board[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(boards, null, 2));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { boardId } = await params;
  const boards = await readBoards();
  const board = boards.find((b) => b.id === boardId);

  if (!board) return new Response("Not found", { status: 404 });
  if (board.ownerId !== userId) return new Response("Forbidden", { status: 403 });

  return Response.json(board);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { boardId } = await params;
  const boards = await readBoards();
  const board = boards.find((b) => b.id === boardId);

  if (!board) return new Response("Not found", { status: 404 });
  if (board.ownerId !== userId) return new Response("Forbidden", { status: 403 });

  const updated = boards.filter((b) => b.id !== boardId);
  await writeBoards(updated);

  return new Response(null, { status: 204 });
}
