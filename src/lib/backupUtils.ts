import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { db } from './db';
import { storage } from './storage';

export interface BackupData {
  _metadata: {
    app: string;
    version: number;
    exportedAt: string;
  };
  _settings?: {
    gemini_api_key?: string | null;
  };
  [tableName: string]: any;
}

/**
 * Exports all database tables and stored preferences.
 * - On Native: writes to file cache and opens the Android native share sheet (Drive, Files, WhatsApp, etc.)
 * - On Web: triggers browser file download as JSON.
 */
export async function exportDataAsJSON(): Promise<void> {
  const data: BackupData = {
    _metadata: {
      app: 'RecompTracker',
      version: 1,
      exportedAt: new Date().toISOString(),
    },
    _settings: {
      gemini_api_key: await storage.get('gemini_api_key'),
    },
  };

  // Extract all database tables dynamically
  for (const table of db.tables) {
    data[table.name] = await table.toArray();
  }

  const jsonStr = JSON.stringify(data, null, 2);
  const fileName = `recomptracker_backup_${new Date().toISOString().split('T')[0]}.json`;

  if (Capacitor.isNativePlatform()) {
    try {
      const written = await Filesystem.writeFile({
        path: fileName,
        data: jsonStr,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      await Share.share({
        title: 'RecompTracker Backup',
        text: `RecompTracker backup from ${new Date().toLocaleDateString()}`,
        url: written.uri,
        dialogTitle: 'Save or Share your RecompTracker backup',
      });
      return;
    } catch (nativeErr) {
      console.warn('[backupUtils] Native file share failed, falling back to blob download:', nativeErr);
    }
  }

  // Web fallback (or native fallback if share was cancelled/unsupported)
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports and restores all tables and settings from a JSON backup file.
 */
export async function importDataFromJSON(file: File): Promise<{ restoredTables: number; recordsCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as BackupData;

        // Basic schema validation
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid backup file: not a JSON object.');
        }

        let restoredTables = 0;
        let recordsCount = 0;

        // Restore settings if present
        if (data._settings?.gemini_api_key) {
          await storage.set('gemini_api_key', data._settings.gemini_api_key);
        }

        // Wrap database restore in a transaction for safety
        await db.transaction('rw', db.tables, async () => {
          for (const table of db.tables) {
            if (Array.isArray(data[table.name])) {
              const rows = data[table.name];
              await table.clear();
              if (rows.length > 0) {
                await table.bulkAdd(rows);
              }
              restoredTables++;
              recordsCount += rows.length;
            }
          }
        });

        resolve({ restoredTables, recordsCount });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
