import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { CREATE_TABLES_SQL } from './schema';
import { seedInitialData } from './seedData';

const STORAGE_KEY = 'quick_invoice_maker_sqlite_db_v1';

let SQLModule: SqlJsStatic | null = null;
let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

function sanitizeParams(params: any[] = []): any[] {
  return params.map((p) => {
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (p === undefined) return null;
    return p;
  });
}

function saveDb() {
  try {
    if (dbInstance && typeof window !== 'undefined' && window.localStorage) {
      const data = dbInstance.export();
      let binary = '';
      const len = data.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(data[i]);
      }
      const base64 = btoa(binary);
      localStorage.setItem(STORAGE_KEY, base64);
    }
  } catch (err) {
    console.warn('Could not persist SQLite to localStorage:', err);
  }
}

export async function getDatabase(): Promise<any> {
  if (dbInstance) {
    return {
      runAsync: async (sql: string, params: any[] = []) => executeSql(sql, params),
      getAllAsync: async <T>(sql: string, params: any[] = []) => queryAll<T>(sql, params),
      getFirstAsync: async <T>(sql: string, params: any[] = []) => queryFirst<T>(sql, params),
      execAsync: async (sql: string) => {
        if (!dbInstance) return;
        dbInstance.run(sql);
        saveDb();
      },
    };
  }

  if (initPromise) {
    await initPromise;
    return getDatabase();
  }

  initPromise = (async () => {
    try {
      if (!SQLModule) {
        SQLModule = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });
      }

      let isNew = false;
      const savedBase64 = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (savedBase64) {
        try {
          const binaryStr = atob(savedBase64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          dbInstance = new SQLModule.Database(bytes);
        } catch (e) {
          console.warn('Failed to load saved database from localStorage, initializing fresh:', e);
          dbInstance = new SQLModule.Database();
          isNew = true;
        }
      } else {
        dbInstance = new SQLModule.Database();
        isNew = true;
      }

      // Execute table creation
      dbInstance.run(CREATE_TABLES_SQL);

      // Check if organizations exist
      const checkStmt = dbInstance.prepare('SELECT COUNT(*) as count FROM organizations');
      let count = 0;
      if (checkStmt.step()) {
        const row = checkStmt.getAsObject() as { count: number };
        count = row.count || 0;
      }
      checkStmt.free();

      if (count === 0) {
        const runner = {
          runAsync: async (sql: string, params: any[] = []) => {
            if (dbInstance) {
              dbInstance.run(sql, sanitizeParams(params));
            }
          },
        };
        await seedInitialData(runner);
        saveDb();
      }

      return dbInstance;
    } catch (err) {
      console.error('Failed to initialize sql.js in web:', err);
      throw err;
    }
  })();

  await initPromise;
  return getDatabase();
}

export async function executeSql(sql: string, params: any[] = []): Promise<void> {
  await getDatabase();
  if (!dbInstance) return;
  dbInstance.run(sql, sanitizeParams(params));
  saveDb();
}

export async function queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  await getDatabase();
  if (!dbInstance) return [];

  const stmt = dbInstance.prepare(sql);
  stmt.bind(sanitizeParams(params));
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export async function queryFirst<T>(sql: string, params: any[] = []): Promise<T | null> {
  const all = await queryAll<T>(sql, params);
  return all.length > 0 ? all[0] : null;
}

export async function seedDatabase(): Promise<void> {
  await getDatabase();
  if (!dbInstance) return;
  const runner = {
    runAsync: async (sql: string, params: any[] = []) => {
      if (dbInstance) {
        dbInstance.run(sql, sanitizeParams(params));
      }
    },
  };
  await seedInitialData(runner);
  saveDb();
}
