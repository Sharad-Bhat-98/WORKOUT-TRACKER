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
    UNIQUE  (user_id, name),
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
    weight REAL NOT NULL,
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
                LEFT JOIN images ON images.name = workouts.image
                LEFT JOIN workout_exercises ON workouts.id = workout_exercises.workout_id
                WHERE workouts.user_id = $userid
                GROUP BY workouts.id
                ORDER BY workouts.created_at DESC;
              `,
  createWorkout:
    'INSERT INTO workouts (id , name , user_id , description , image) VALUES ($id , $name , $user_id , $description, $image);',
  deleteWorkout: 'delete from workouts where id = $id',
  updateWorkout: 'update workouts set name = $name, description = $description where id = $id',
  getWorkoutById: 'select id , name , description from workouts where id = $id',
  getWorkoutExerciseById:
    'select exercise_id as id ,position ,target_sets as sets from workout_exercises where workout_id = $workoutId',
  createExercise:
    'insert into exercises (id , name , user_id , image) values ($id , $name , $user_id , $image);',
  insertImage: 'insert into images (name , data) VALUES ($name , $image_data);',
  getImages: 'select * from images;',
  deleteImage: 'delete from images where name = $name',
  getExercise: `
                SELECT exercises.id,
                      exercises.name,
                      images.data AS image
                FROM exercises
                LEFT JOIN images ON exercises.image = images.name
                where exercises.user_id = $userId
              `,
  deleteExercise: 'delete from exercises where id = $id',
  getExerciseById: 'select id, name, image from exercises where id = $id',
  updateExercise: 'update exercises set name = $name, image = $image where id = $id',
  insertWorkoutExercises:
    'insert into workout_exercises (workout_id , exercise_id , position , target_sets) values ($WorkoutId , $ExerciseId , $Position , $Sets)',
  updateWorkoutExercise: `
      UPDATE workout_exercises
      set position = $position,
      target_sets = $targetSets
      where exercise_id = $exeriseId
      and workout_id = $workoutId
  `,
  deleteWorkoutExercise:
    'delete from workout_exercises where exercise_id = $exeriseId and workout_id = $workoutId',
  getWorkoutDetails: `
          SELECT workouts.id,
                   workouts.name,
                   images.data,
                   count(workout_exercises.exercise_id) AS count,
                   group_concat(workout_exercises.exercise_id, ',' ORDER BY workout_exercises.position) AS exerciseId
            FROM workouts
            LEFT JOIN images ON images.name = workouts.image
            LEFT JOIN workout_exercises ON workouts.id = workout_exercises.workout_id
            WHERE workouts.user_id = $userid
            GROUP BY workouts.id
            ORDER BY workouts.created_at DESC;
  `,
  getExerciseSessionDetails: `SELECT
                                exercises.name as ExerciseName,
                                images.data as ImageData,
                                workouts.name as WorkoutName,
                                workout_exercises.target_sets as TargetSets
                              FROM workout_exercises
                              LEFT JOIN exercises on exercises.id = workout_exercises.exercise_id
                              LEFT JOIN images on images.name = exercises.image
                              LEFT JOIN workouts on workouts.id = workout_exercises.workout_id
                              where exercise_id = $ExerciseId
                              and
                              workout_id = $WorkoutId`,
  createSession: 'INSERT INTO workout_sessions (id , workout_id) VALUES ($id , $WorkoutId)',
  updateSessionEndTime:
    "UPDATE workout_sessions SET ended_at = datetime('now') where id = $SessionId",
  getPrevSessionIds: `SELECT id
                    FROM workout_sessions
                    WHERE workout_id = $WorkoutId
                      AND id != $SessionId
                      AND ended_at IS NOT NULL
                    ORDER BY started_at DESC
                    LIMIT 4`,
  getPrevSessionExerciseDetails: `SELECT set_no , reps , weight
                                  from set_logs where
                                  session_id = $PrevSession
                                  AND
                                  exercise_id = $ExerciseId
                                  ORDER BY set_no`,
  insertSetLog:
    'INSERT INTO set_logs (id , session_id , exercise_id , set_no , reps , weight) VALUES ($id , $SessionId , $ExerciseId , $SetNo , $Reps , $Weight)',
  getPrevSetDetails: `
                      SELECT session_id,
                             date(MIN(logged_at), 'localtime')  AS logged_at,
                             MAX(weight * (1 + reps / 30.0))    AS est_1rm,
                             MAX(weight)                        AS max_weight,
                             SUM(reps)                          AS total_reps,
                             SUM(weight * reps)                 AS volume
                      FROM set_logs
                      WHERE session_id IN (SELECT value FROM json_each($SessionIds))
                        AND exercise_id = $ExerciseId
                      GROUP BY session_id
                      ORDER BY logged_at`,
};

export default QUERY;
