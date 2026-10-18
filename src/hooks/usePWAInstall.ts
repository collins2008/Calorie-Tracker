import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

// Check if app is already installed as PWA or running as native app
function isStandalone(): boolean {
  return Capacitor.isNativePlatform()
    || window.matchMedia('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showManualBanner, setShowManualBanner] = useState(false);
  const hasPromptFired = useRef(false);

  useEffect(() => {
    // If already installed, do nothing
    if (isStandalone()) return;

    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
      setShowManualBanner(false);
      hasPromptFired.current = true;
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
      setShowManualBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If beforeinstallprompt hasn't fired after 3 seconds,
    // show a manual install banner with instructions
    const fallbackTimer = setTimeout(() => {
      if (!hasPromptFired.current) {
        setShowManualBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  };

  const dismissBanner = () => {
    setShowManualBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  return { isInstallable, promptInstall, showManualBanner, dismissBanner };
}
