# Nest Hub (MERN)

NestHub is now structured as a MERN stack project:

- `client/` React (Vite)
- `backend/` Express + MongoDB (Mongoose)
- root `package.json` for monorepo-style scripts

## Project structure

- `client/src/App.jsx`: Landing page UI in React
- `client/src/styles.css`: App styling
- `backend/src/server.js`: Backend entrypoint
- `backend/src/app.js`: Express app setup
- `backend/src/config/db.js`: MongoDB connection
- `backend/src/routes/health.routes.js`: API routes
- `backend/src/controllers/health.controller.js`: Route controllers
- `backend/.env.example`: Backend environment template

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create backend env file:

```bash
cp backend/.env.example backend/.env
```

3. Ensure MongoDB is running locally (or update `MONGO_URI` in `backend/.env`).

## Run in development

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:5000`
- Health API: `http://127.0.0.1:5000/api/health`

## Useful scripts

- `npm run dev:client`
- `npm run dev:backend`
- `npm run build`
- `npm run start`
