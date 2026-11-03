import QUERY, { INIT_SQL } from '@/lib/query';
import { executeInsertUpdateOneTransactionType } from '@/types/types';
import { Directory, File, PickSingleFileResult } from 'expo-file-system';
import { useSQLiteContext } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

export default function useDatabase() {
  const db = useSQLiteContext();

  const initDb = async () => {
    await Promise.all(INIT_SQL.map((e) => db.execAsync(e)));
  };

  const executeQuery = async <T>(sql: string, args: Record<string, SQLite.SQLiteBindValue>) => {
    const query = QUERY[sql];
    // console.log(`EXECUTING QUERY ${query} WITH ARGS ${JSON.stringify(args)}`);
    return db.getAllAsync<T>(query, args);
  };

  const executeInsertUpdate = async (sql: string, args: Record<string, SQLite.SQLiteBindValue>) => {
    const query = QUERY[sql];
    console.log(`EXECUTING QUERY ${query} WITH ARGS ${JSON.stringify(args)}`);
    return db.runAsync(query, args);
  };

  const executeInsertUpdateOneTransaction = async (
    args: executeInsertUpdateOneTransactionType[]
  ) => {
    return await db.withExclusiveTransactionAsync(async (txn) => {
      for (const arg of args) {
        await txn.runAsync(QUERY[arg.sql], arg.args);
      }
    });
  };

  async function exportDb() {
    // Flush the WAL so the .db file has all the data

    await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');

    const bytes = await db.serializeAsync(); // Uint8Array of the whole DB
    const dir = await Directory.pickDirectoryAsync();
    const dest = dir.createFile(`workout-${Date.now()}.db`, 'application/octet-stream');
    dest.write(bytes);

    return dest.uri;
  }

  async function importDb() {
    // 1. Let the user pick a file ('*/*' because Android often has no .db MIME type)
    let picked: PickSingleFileResult | PickSingleFileResult[];
    try {
      picked = await File.pickFileAsync({ initialUri: undefined, mimeTypes: '*/*' });
    } catch {
      return null; // user cancelled
    }
    const file = Array.isArray(picked) ? picked[0]?.result : picked.result;
    if (!file) return null;

    // 2. Read the file and make sure it's actually a SQLite database
    const bytes = await file.bytes();
    if (!isSqliteFile(bytes)) {
      throw new Error('Selected file is not a valid SQLite database');
    }
    // WAL (2) -> legacy journal (1), required for in-memory deserialize
    bytes[18] = 1;
    bytes[19] = 1;
    // 3. Load it as an in-memory database
    const imported = await SQLite.deserializeDatabaseAsync(bytes);

    try {
      // 4. (Optional) Check that it belongs to your app
      const tables = await imported.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      if (!tables.map((t) => t.name).includes('workouts'))
        throw new Error('This backup does not look like a workout database');

      // 5. Replace the live DB's contents with the imported data
      await SQLite.backupDatabaseAsync({
        sourceDatabase: imported,
        destDatabase: db,
      });
    } finally {
      await imported.closeAsync();
    }

    return file.uri;
  }

  function isSqliteFile(bytes: Uint8Array) {
    if (bytes.length < 16) return false;
    const header = String.fromCharCode(...bytes.slice(0, 16));
    return header === 'SQLite format 3\0';
  }

  return {
    initDb,
    executeQuery,
    executeInsertUpdate,
    executeInsertUpdateOneTransaction,
    exportDb,
    importDb,
  };
}
