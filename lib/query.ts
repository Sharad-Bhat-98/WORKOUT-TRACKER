export const INIT_SQL = [
  'PRAGMA journal_mode = WAL;',
  'PRAGMA foreign_keys = ON;',
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS images (
    name TEXT PRIMARY KEY NOT NULL,
    data TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (image) REFERENCES images(name) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (image) REFERENCES images(name) ON DELETE SET NULL
  );`,
  `CREATE TABLE IF NOT EXISTS workout_exercises (
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    target_sets INTEGER NOT NULL CHECK (target_sets > 0),
    PRIMARY KEY (workout_id, exercise_id),
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS workout_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    workout_id TEXT NOT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS set_logs (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    set_no INTEGER NOT NULL CHECK (set_no > 0),
    reps INTEGER NOT NULL CHECK (reps >= 0),
    weight REAL,
    logged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, exercise_id, set_no),
    FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
  );`,
  'CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_sessions_workout ON workout_sessions(workout_id);',
  'CREATE INDEX IF NOT EXISTS idx_sets_session ON set_logs(session_id);',
  'CREATE INDEX IF NOT EXISTS idx_sets_exercise ON set_logs(exercise_id);',
  'CREATE INDEX IF NOT EXISTS idx_we_exercise ON workout_exercises(exercise_id);',
];

const QUERY: Record<string, string> = {
  CheckForUser: 'select id , name from users;',
  CreateUser: 'insert into users (id , name) values ($id , $username);',
  DeleteUser: 'delete from users where id = $id;',
  getWorkout: `
                SELECT workouts.id, workouts.name, images.data , count(workout_exercises.exercise_id) as count
                FROM workouts
                INNER JOIN images ON images.name = workouts.image
                LEFT JOIN workout_exercises ON workouts.id = workout_exercises.workout_id
                WHERE workouts.user_id = $userid
                ORDER BY workouts.created_at DESC;
              `,
  createWorkout:
    'INSERT INTO workouts (id , name , user_id , description , image) VALUES ($id , $name , $user_id , $description, $image);',
  deleteWorkout: 'delete from workouts where id = $id',
  deleteExcerisesForWorkout: 'delete from exercises where workout_id = $id',
  updateWorkout: 'update workouts set name = $name, description = $description where id = $id',
  getWorkoutById: 'select id , name , description from workouts where id = $id',
  createExercise:
    'insert into exercises (id , name , user_id , image_data) values ($id , $name , $user_id , $image_data);',
  insertImage: 'insert into images (name , data) VALUES ($name , $image_data);',
  getImages: 'select * from images;',
  deleteImage: 'delete from images where name = $name',
  getExcerise: `
                SELECT exercises.id,
                      exercises.name,
                      images.data AS image
                FROM exercises
                LEFT JOIN images ON exercises.image = images.name
              `,
};

export default QUERY;
