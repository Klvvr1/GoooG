import { db } from '../db/db';
import { Character } from '../types';

export interface SyncResult {
  success: boolean;
  source: 'd1' | 'kv' | 'none';
  syncedCount: number;
  totalServerCount: number;
  message?: string;
}

export async function syncWithCloud(): Promise<SyncResult> {
  const localChars = await db.characters.toArray();

  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characters: localChars }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.characters) && data.characters.length > 0) {
      await db.characters.bulkPut(data.characters as Character[]);
    }

    return {
      success: true,
      source: data.source || 'none',
      syncedCount: data.syncedCount || 0,
      totalServerCount: data.totalServerCount || 0,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    console.warn('Cloud sync offline (running with local IndexedDB):', message);
    return {
      success: false,
      source: 'none',
      syncedCount: 0,
      totalServerCount: localChars.length,
      message,
    };
  }
}
