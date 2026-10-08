# Developer Productivity Platform

This repository contains the Spring Boot backend and the React/Vite frontend.

## Run the backend

From the repository root, run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend listens on `http://localhost:8080` by default.

## Run the frontend

In a second terminal, run:

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:8080` as its default API URL. To use another
backend URL, set `VITE_API_BASE_URL` in `frontend/.env.local` before starting Vite.
For example:

```text
VITE_API_BASE_URL=https://your-backend.example.com
```
