import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Check if we're in a Node.js environment
const isNode = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

let db;

if (isNode) {
  const sqlite = new Database('polls.db');
  db = drizzle(sqlite, { schema });
} else {
  // For browser environment, we'll need to use a different approach
  // You might want to use IndexedDB or make API calls to a backend server
  console.warn('SQLite is not supported in browser environment');
  
  // Temporary mock implementation
  db = {
    query: async () => [],
    insert: async () => {},
    select: () => ({
      from: () => ({
        leftJoin: () => []
      })
    }),
    transaction: async (fn: any) => await fn(db),
  };
}

export { db };