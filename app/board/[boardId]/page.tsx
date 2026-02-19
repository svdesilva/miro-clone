import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Room from "./_components/Room";

interface BoardPageProps {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { boardId } = await params;

  return <Room boardId={boardId} />;
}
