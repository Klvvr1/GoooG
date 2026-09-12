import Dexie, { type EntityTable } from 'dexie';
import { Character } from '../types';
import { INITIAL_CHARACTERS } from './seed';

export class GoooGDatabase extends Dexie {
  characters!: EntityTable<Character, 'id'>;

  constructor() {
    super('GoooGDatabase');
    this.version(1).stores({
      characters: 'id, name, category, enabled, createdAt, stats.nextReviewDate',
    });
  }
}

export const db = new GoooGDatabase();

export async function initializeDatabase(): Promise<void> {
  try {
    // One-time cleanup of all legacy and default characters from local IndexedDB
    const hasCleaned = localStorage.getItem('gooog_cleared_all_characters_v2');
    if (!hasCleaned) {
      await db.characters.clear();
      localStorage.setItem('gooog_cleared_all_characters_v2', 'true');
      console.log('Database cleared of all existing and default characters.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export async function resetDatabaseToDefaults(): Promise<void> {
  await db.characters.clear();
}

export async function exportCharactersJSON(): Promise<string> {
  const all = await db.characters.toArray();
  return JSON.stringify(all, null, 2);
}

export async function importCharactersJSON(jsonString: string): Promise<number> {
  const data = JSON.parse(jsonString) as Character[];
  if (!Array.isArray(data)) throw new Error('Invalid JSON format');
  await db.characters.bulkPut(data);
  return data.length;
}
