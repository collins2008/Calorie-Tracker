import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppShell } from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import LogPage from './pages/LogPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
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
