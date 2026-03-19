# Backyard Produce

An app to list and share excess backyard produce with neighbors.

## Repo layout

| Folder | What it is |
|--------|------------|
| `backend-produce-api/` | FastAPI + PostgreSQL API |
| `backend-produce-app/` | Expo (React Native) mobile / web app |

## Quick start

1. **API:** See `backend-produce-api/README.md` — create DB, `.env`, `alembic upgrade head`, `uvicorn app.main:app --reload`.
2. **App:** See `backend-produce-app/README.md` — `npm install`, `npm start`.

Keep this folder as your **Git repository root** (where `.git` lives). Do **not** initialize Git in your user home directory.
