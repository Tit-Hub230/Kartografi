# kartografi

A minimal MERN starter with separate `backend` (Express) and `frontend` (Vite + React) folders, runnable with one command.

## Prereqs
- Node.js 18+ (Apple Silicon works great). Recommend installing via `nvm`.
- MongoDB running locally or a cloud URI.

## Quick start
```bash
# clone/add remote first if needed (see "Git" below)
npm install   # only needed at root for dev tooling (concurrently)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# run both servers from the project root
npm run dev
