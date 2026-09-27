export const INIT_SQL = [
  'PRAGMA journal_mode = WAL;',
  'PRAGMA foreign_keys = ON;',
  `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS workout (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS exercise (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        workout_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (workout_id) REFERENCES workout(id)
    );
  `,
];

const QUERY: Record<string, string> = {
  CheckForUser: 'select id , name from users',
  CreateUser: 'insert into users (id , name) values ($id , $username)',
  DeleteUser: 'delete from users where id = $id',
};

export default QUERY;
