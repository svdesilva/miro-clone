import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BoardList from "@/components/dashboard/BoardList";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Boards</h1>
      </div>
      <BoardList />
    </div>
  );
}
