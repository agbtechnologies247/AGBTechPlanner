# AGBTech Planner - Desktop & Local Setup

This application can now be run locally as a web app or as a standalone Windows application.

## 1. Running Locally (Web Browser)
To run both the frontend and backend concurrently in your browser:
```bash
npm run dev:all
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 2. Running as Windows App (Development)
To launch the app in a standalone window during development:
```bash
npm run electron:dev
```

## 3. Building the Windows Installer (.exe)
To package the app into a downloadable Windows installer:
```bash
npm run electron:build
```
The installer will be generated in the `dist-electron` folder.

## Database Persistence
- When running via **Electron**, the database is stored in your user data directory (`%AppData%/AGBTech Planner/db_new`).
- When running via **npm run server**, it uses the `./server/db_new` directory.
