import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
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

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const boards = await readBoards();
  const userBoards = boards.filter((b) => b.ownerId === userId);
  return Response.json(userBoards);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { title } = await request.json();
  const boards = await readBoards();

  const newBoard: Board = {
    id: nanoid(),
    title: title ?? "Untitled Board",
    ownerId: userId,
    createdAt: Date.now(),
  };

  boards.push(newBoard);
  await writeBoards(boards);

  return Response.json(newBoard, { status: 201 });
}
