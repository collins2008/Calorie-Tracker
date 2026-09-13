import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { parseNaturalLanguage } from '../lib/aiLogger';
import { useToast } from '../components/ui/Toast';
import { useStreak } from './useStreak';

export function useSyncQueue() {
  const queue = useLiveQuery(() => db.syncQueue.toArray()) || [];
  const { toast } = useToast();
  const { checkIn } = useStreak();
  const [isSyncing, setIsSyncing] = useState(false);

  const processQueue = async () => {
    if (!navigator.onLine) {
      toast('Still offline. Waiting for connection...', 'info');
      return;
    }
    
    const items = await db.syncQueue.toArray();
    if (items.length === 0) return;
    
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) return;

    setIsSyncing(true);
    let successCount = 0;

    const userProfile = await db.profile.get('default');
    const userWeight = userProfile?.weight || 75;

    for (const item of items) {
      try {
        const parsed = await parseNaturalLanguage(item.input, item.date, apiKey, item.imageBase64, userWeight);
        if (parsed) {
          await db.dailyLogs.add({ ...parsed, date: item.date, createdAt: Date.now() });
          await db.syncQueue.delete(item.id!);
          successCount++;
          await checkIn();
        }
      } catch (e) {
        console.error("Failed to sync item", item.id, e);
      }
    }
    
    setIsSyncing(false);
    
    if (successCount > 0) {
      toast(`Successfully analyzed ${successCount} offline meal(s)!`, 'success');
    } else if (items.length > 0) {
      toast('Failed to analyze some offline meals.', 'error');
    }
  };

  useEffect(() => {
    const handleOnline = () => processQueue();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return { queue, processQueue, isSyncing };
}
