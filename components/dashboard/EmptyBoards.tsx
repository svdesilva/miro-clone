export default function EmptyBoards() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-neutral-400">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4 opacity-40">
        <rect x="4" y="4" width="56" height="56" rx="8" stroke="currentColor" strokeWidth="2" />
        <path d="M20 32h24M32 20v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-lg font-medium">No boards yet</p>
      <p className="text-sm mt-1">Create your first board to get started</p>
    </div>
  );
}
