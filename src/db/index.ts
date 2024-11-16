import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

// Check if we're in a Node.js environment
const isNode = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

let db: BetterSQLite3Database<typeof schema>;

if (isNode) {
  const sqlite = new Database('polls.db');
  db = drizzle(sqlite, { schema });
} else {
  // For browser environment, we'll need to use a different approach
  // You might want to use IndexedDB or make API calls to a backend server
  console.warn('SQLite is not supported in browser environment');
  
  // Mock implementation with proper types
  const mockDb = {
    query: async () => [],
    insert: async () => ({}),
    select: () => ({
      from: () => ({
        leftJoin: () => [],
        where: () => ({
          get: () => null,
          all: () => []
        })
      })
    }),
    transaction: async <T>(fn: (tx: any) => Promise<T>) => await fn(mockDb),
    _: {},
    resultKind: 'sync' as const,
    $with: () => mockDb,
    with: () => mockDb,
    execute: async () => [],
    get: () => null,
    values: () => [],
    run: () => ({ changes: 0, lastInsertRowid: 0 }),
    all: () => [],
    prepare: () => ({ all: () => [], get: () => null }),
  };

  db = mockDb as unknown as BetterSQLite3Database<typeof schema>;
}

export { db };