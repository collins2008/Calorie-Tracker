import { db } from './db';

export async function exportDataAsJSON() {
  const data: Record<string, any> = {};
  
  // Extract all tables dynamically
  for (const table of db.tables) {
    data[table.name] = await table.toArray();
  }
  
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `recomptracker_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

export async function importDataFromJSON(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Wrap in transaction for safety
        await db.transaction('rw', db.tables, async () => {
          for (const table of db.tables) {
            if (data[table.name] && Array.isArray(data[table.name])) {
              await table.clear();
              await table.bulkAdd(data[table.name]);
            }
          }
        });
        
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
