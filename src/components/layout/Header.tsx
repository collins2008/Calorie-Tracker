import { Flame, Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { isInstallable, promptInstall, showManualBanner, dismissBanner } = usePWAInstall();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Detect iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
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
              className="flex items-center gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors animate-pulse"
            >
              <Download size={14} />
              Install App
            </button>
          )}
        </div>
      </header>

      {/* Fallback Install Banner */}
      <AnimatePresence>
        {showManualBanner && !isInstallable && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white px-4 py-3 shadow-lg"
          >
            <div className="max-w-lg mx-auto flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold text-sm flex items-center gap-2">
                  <Download size={16} /> Install RecompTracker
                </p>
                {isIOS ? (
                  <p className="text-xs mt-1 text-emerald-100">
                    Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari, then tap <strong>"Add to Home Screen"</strong>.
                  </p>
                ) : (
                  <p className="text-xs mt-1 text-emerald-100">
                    Tap the <strong>⋮ menu</strong> (3 dots) at the top right of Chrome, then tap <strong>"Add to Home Screen"</strong> or <strong>"Install app"</strong>.
                  </p>
                )}
              </div>
              <button onClick={dismissBanner} className="p-1 hover:bg-emerald-700 rounded-full mt-0.5">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
