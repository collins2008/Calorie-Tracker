import { Flame, Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function Header() {
  const { isInstallable, promptInstall } = usePWAInstall();
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

        {isInstallable && (
          <button
            onClick={promptInstall}
            className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border border-emerald-500/20"
          >
            <Download size={14} />
            Install App
          </button>
        )}
      </div>
    </header>
  );
}
