import { Flame } from 'lucide-react';

export function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-500" />
            <h1 className="text-lg font-bold tracking-tight">RecompTracker</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{dateStr}</p>
        </div>
      </div>
    </header>
  );
}
