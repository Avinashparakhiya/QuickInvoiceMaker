import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CREATE_TABLES_SQL } from './schema';
import { seedInitialData } from './seedData';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  
  dbInstance = await SQLite.openDatabaseAsync('quick_invoice_maker.db');
  
  if (!isInitialized) {
    // Enable WAL mode & foreign keys
    await dbInstance.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
    
    // Execute schema creation
    await dbInstance.execAsync(CREATE_TABLES_SQL);
    
    // Check if initial seeding is required
    const orgCount = await dbInstance.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM organizations'
    );
    
    if (!orgCount || orgCount.count === 0) {
      await seedInitialData(dbInstance);
    }
    
    isInitialized = true;
  }
  
  return dbInstance;
}

export async function executeSql(sql: string, params: any[] = []): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(sql, params);
}

export async function queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDatabase();
  return await db.getAllAsync<T>(sql, params);
}

export async function queryFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<T>(sql, params);
}

export async function seedDatabase(): Promise<void> {
  const db = await getDatabase();
  await seedInitialData(db);
}
