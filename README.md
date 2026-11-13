# Workout Tracker

A local-first workout log for iOS, Android, and web. Workouts, exercises, set history, and images stay on the device in SQLite. There is no account server.

## Features

- **Setup.** On first launch, create a username or import an existing database backup. A new profile is seeded with default exercises and images.
- **Home.** Start a session from a workout and open past sessions.
- **Sessions.** Log sets (reps and weight), compare them with the last session, and see recent trends (estimated 1RM, max weight, total reps, and volume). Edit finished sessions later.
- **Workouts.** Create, edit, and delete routines. Attach exercises with an order and a target set count.
- **Exercises.** Create, edit, and delete exercises, each with an image.
- **Images.** Upload photos used by exercises and workouts. Images are stored in the database.
- **Profile.** Export the SQLite database to a file, or import a backup and reload the app.
- **Appearance.** Light and dark mode follow the system theme.

## Stack

- [Expo](https://expo.dev/) (SDK 58) and [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/) with the New Architecture
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for local storage
- [TanStack Query](https://tanstack.com/query) and [Zustand](https://zustand.docs.pmnd.rs/)
- [NativeWind](https://www.nativewind.dev/) and [React Native Reusables](https://reactnativereusables.com)

## Requirements

- Node.js
- [pnpm](https://pnpm.io/)
- For a device or simulator: [Expo Go](https://expo.dev/go), or a development build (`expo-dev-client` is included)

## Getting started

```bash
pnpm install
pnpm dev
```

That starts the Expo dev server. From there:

- **Android:** press `a`, or run `pnpm android`
- **iOS:** press `i` (macOS only), or run `pnpm ios`
- **Web:** press `w`, or run `pnpm web`

You can also scan the QR code with Expo Go.

`pnpm clean` removes `.expo` and `node_modules`.

## Data

The app opens a local database named `workout.db` and creates tables for users, images, exercises, workouts, workout exercises, sessions, and set logs.

Export writes a `.db` file to a folder you pick. Import checks that the file is a SQLite database that contains a `workouts` table, replaces the live database, and reloads the app. Import is also available on the setup screen before a profile exists.

## Project layout

| Path | What it holds |
| --- | --- |
| `app/(setup)` | First-run username and database import |
| `app/(app)/HomePage` | Workout list and active session logging |
| `app/(app)/PrevSessions` | Past sessions and edits |
| `app/(app)/Workout` | Workout create, edit, and exercise mapping |
| `app/(app)/Exercises` | Exercise create and edit |
| `app/(app)/Images` | Image library |
| `app/(app)/Profile` | Database export and import |
| `lib/query.ts` | Schema and SQL |
| `hooks/useDatabase.ts` | Query runner plus export and import |
| `store/` | User, active session, and workout-exercise state |
