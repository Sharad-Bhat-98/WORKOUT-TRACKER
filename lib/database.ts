import QUERY, { INIT_SQL } from '@/lib/query';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDb = async () => {
  const database = await SQLite.openDatabaseAsync('workout.db');
  await Promise.all(INIT_SQL.map((e) => database.execAsync(e)));
  db = database;
};

const executeQuery = async <T>(sql: string, args: Record<string, SQLite.SQLiteBindValue>) => {
  if (!db) throw new Error('Database is not initialized');
  const query = QUERY[sql];
  console.log(`EXECUTING QUERY ${query} WITH ARGS ${args}`);
  return db.getAllAsync<T>(query, args);
};

export const executeInsertUpdate = async (
  sql: string,
  args: Record<string, SQLite.SQLiteBindValue>
) => {
  if (!db) throw new Error('Database is not initialized');
  const query = QUERY[sql];
  console.log(`EXECUTING QUERY ${query} WITH ARGS ${args}`);
  return await db.runAsync(query, args);
};
export default executeQuery;
