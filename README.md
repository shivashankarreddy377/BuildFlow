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

## Deploy to Render

The root `render.yaml` defines a free Spring Boot web service and a free static
frontend. Connect this repository to Render and create a Blueprint from
`render.yaml`.

The backend requires an externally hosted MySQL database. In the Blueprint setup,
provide these backend environment variables using the database provider's remote
connection details:

- `SPRING_DATASOURCE_URL` (JDBC URL, such as
  `jdbc:mysql://HOST:3306/DATABASE?useSSL=true`)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Do not use `localhost` for a hosted database. The frontend API URL is wired to
the backend by the Blueprint. Set `APP_CORS_ALLOWED_ORIGIN` to the frontend's
exact Render URL (including `https://`) in the backend environment.
`SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, and `GEMINI_API_KEY` can also be
set in the backend environment if email and AI features are needed.

Free backend instances can spin down when idle, and local uploads are temporary.
Uploaded attachments can be lost when the service restarts or redeploys.
