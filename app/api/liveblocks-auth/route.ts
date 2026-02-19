import { auth, currentUser } from "@clerk/nextjs/server";
import { liveblocks } from "@/lib/liveblocks";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = await request.json();

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: user.firstName ?? user.username ?? "Anonymous",
      avatar: user.imageUrl ?? "",
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { body, status } = await session.authorize();
  return new Response(body, { status });
}
