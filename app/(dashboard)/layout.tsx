import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <header className="h-14 border-b flex items-center justify-between px-6 bg-white">
        <span className="font-semibold text-lg tracking-tight">Miro Clone</span>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>
      <main className="flex-1 overflow-auto bg-neutral-50 p-8">
        {children}
      </main>
    </div>
  );
}
