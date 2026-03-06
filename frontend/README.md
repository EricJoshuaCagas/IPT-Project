# Frontend (Vite + React + TypeScript)

A light CRUD dashboard for Departments, Projects, and Employees that talks to the Django REST API.

## Quick start

```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```

Set the API base with an environment variable:

```bash
# optional
set VITE_API_BASE=http://127.0.0.1:8000/api
```

Then open the dev server URL (default http://localhost:5173).

## Notes
- Uses plain fetch; no state management dependencies.
- Works with the paginated responses that return `{ results: [...] }` or plain arrays.
- Department ID fields accept numeric IDs; ensure related records exist in the backend.
