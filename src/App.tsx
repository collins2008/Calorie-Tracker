import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';
import { AppShell } from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import LogPage from './pages/LogPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { requestPersistentStorage } from './lib/db';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    requestPersistentStorage();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Configure Status Bar on Native Android
    StatusBar.setBackgroundColor({ color: '#09090b' }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

    // Handle hardware back button
    const backListenerPromise = CapApp.addListener('backButton', () => {
      if (location.pathname === '/' || location.pathname === '') {
        CapApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      backListenerPromise.then(listener => listener.remove());
    };
  }, [location.pathname, navigate]);

  return (
    <ErrorBoundary>
      <AppShell>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/log" element={<LogPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AnimatePresence>
      </AppShell>
    </ErrorBoundary>
  );
}
