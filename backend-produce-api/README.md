# Backyard Produce API

FastAPI + PostgreSQL backend for the [Backyard Produce](https://github.com/your-org/backyard-produce-app) app. Handles **user signup/login**, **create listing**, and **view nearby listings**.

## Stack

- **FastAPI** – REST API
- **PostgreSQL** – users, listings
- **SQLAlchemy 2** – ORM
- **Alembic** – migrations
- **JWT** – auth (python-jose + passlib/bcrypt)

## Setup

1. **Create a PostgreSQL database**

   ```bash
   createdb backyard_produce
   ```

2. **Clone / enter project and install deps**

   ```bash
   cd backyard-produce-api
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```

3. **Environment**

   Copy `.env.example` to `.env` and set `DATABASE_URL` and `SECRET_KEY`.

4. **Run migrations**

   ```bash
   alembic upgrade head
   ```

5. **Start the server**

   ```bash
   uvicorn app.main:app --reload
   ```

   API: http://localhost:8000  
   Docs: http://localhost:8000/docs

## API (current)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST   | `/api/auth/register` | No  | Sign up (name, email, password, optional neighborhood). Returns `access_token` + `user`. |
| POST   | `/api/auth/login`    | No  | Log in (email, password). Returns `access_token` + `user`. |
| POST   | `/api/listings`      | Yes | Create a produce listing. Bearer token required. |
| GET    | `/api/listings/nearby?lat=&lng=&radius_km=&limit=` | No | Listings with lat/lng, sorted by distance. `location.distance` in km. |

### Auth

- **Register body:** `{ "name": "...", "email": "...", "password": "...", "neighborhood": "..." }`
- **Login body:** `{ "email": "...", "password": "..." }`
- **Protected routes:** Header `Authorization: Bearer <access_token>`

### Create listing (body)

- `produce_type`, `title` (required); `description`, `quantity` optional.
- `price` (number), `price_type`: `"free"` | `"per_lb"` | `"per_item"` | `"per_bunch"`.
- `latitude`, `longitude`, `address_approximate` for location / nearby.
- `image_url` optional; `payment_methods`: array of `"cash"` | `"card"` | `"barter"`.

### Nearby

- `lat`, `lng` (required): user’s location.
- `radius_km` (default 50), `limit` (default 50): max distance and number of results.
- Only listings with non-null `latitude`/`longitude` are included; sorted by distance.

## Project layout

```
backyard-produce-api/
  app/
    main.py           # FastAPI app, CORS, routers
    config.py         # Settings (env)
    database.py       # SQLAlchemy engine, session, Base
    models/           # User, Listing
    schemas/          # Pydantic request/response
    core/security.py  # Password hash, JWT
    api/
      deps.py         # get_current_user
      routes/
        auth.py       # register, login
        listings.py   # create, nearby
  alembic/            # Migrations
  requirements.txt
  .env.example
```

## Next steps (not implemented yet)

- File upload for listing images (e.g. S3 or local storage)
- Messages, scheduled pickups, reviews
- Optional: PostGIS for “nearby” in the database
