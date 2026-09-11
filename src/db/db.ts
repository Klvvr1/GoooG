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
    const count = await db.characters.count();
    if (count === 0) {
      await db.characters.bulkAdd(INITIAL_CHARACTERS);
      console.log('Database initialized with default characters.');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

export async function resetDatabaseToDefaults(): Promise<void> {
  await db.characters.clear();
  await db.characters.bulkAdd(INITIAL_CHARACTERS);
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
