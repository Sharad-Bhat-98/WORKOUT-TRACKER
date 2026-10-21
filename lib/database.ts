import QUERY, { INIT_SQL } from '@/lib/query';
import { executeInsertUpdateOneTransactionType } from '@/types/types';
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
  // console.log(`EXECUTING QUERY ${query} WITH ARGS ${JSON.stringify(args)}`);
  return db.getAllAsync<T>(query, args);
};

export const executeInsertUpdate = async (
  sql: string,
  args: Record<string, SQLite.SQLiteBindValue>
) => {
  if (!db) throw new Error('Database is not initialized');
  const query = QUERY[sql];
  console.log(`EXECUTING QUERY ${query} WITH ARGS ${JSON.stringify(args)}`);
  return db.runAsync(query, args);
};
export default executeQuery;

export const executeInsertUpdateOneTransaction = async (
  args: executeInsertUpdateOneTransactionType[]
) => {
  if (!db) throw new Error('Database is not initialized');

  return await db.withExclusiveTransactionAsync(async (txn) => {
    for (const arg of args) {
      await txn.runAsync(QUERY[arg.sql], arg.args);
    }
  });
};
