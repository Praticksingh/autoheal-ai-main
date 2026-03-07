# AutoHeal AI

Production-grade full-stack application for repository analysis, automated diagnostics, and run history tracking.

## Architecture

- `client/`: React + TypeScript + Vite frontend
- `server/`: Express + Socket.IO + MongoDB backend
- `shared/`: Shared contracts/types for cross-runtime usage
- `config/`: Centralized configuration scaffolding

## API Endpoints

- `GET /api/health`
- `POST /api/analyze-repo`
- `GET /api/history`

## Realtime Events

- `analysis_started`
- `repo_cloned`
- `tests_running`
- `bug_detected`
- `fix_applied`
- `pipeline_complete`

## Local Setup

1. Install dependencies:
   - `npm install`
   - `npm --prefix server install`
2. Create environment files:
   - Copy `.env.example` to `.env`
   - Copy `server/.env.example` to `server/.env`
3. Start both apps with one command:
   - `npm run dev`

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment Variables

Frontend (`.env`):

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

Backend (`server/.env`):

- `PORT`
- `CLIENT_ORIGIN`
- `MONGODB_URI`
- `NODE_ENV`
- `LOG_TO_FILE`
- `LOG_FILE_PATH`

## Production

- Frontend deploy target: Vercel (`vercel.json`)
- Backend deploy target: Railway (`railway.json`) or Docker (`server/Dockerfile`)

### Docker (backend)

- Build: `docker build -t autoheal-server ./server`
- Run: `docker run -p 5000:5000 --env-file ./server/.env autoheal-server`
