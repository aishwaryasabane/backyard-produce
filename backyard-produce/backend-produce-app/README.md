# Backyard Produce

A React Native (Expo) app for connecting neighbors to buy, sell, or barter backyard produce locally. It uses a FastAPI + PostgreSQL backend (`backyard-produce-api`) for auth, listings, and image upload.

## Features: Implemented vs To-Do

### Implemented

| Feature | App | Backend |
|--------|-----|---------|
| **Auth** – Register / login, profile, neighborhood | Yes | Yes (JWT) |
| **Browse feed** – Listings from API | Yes | Yes |
| **Filters** – Produce type, distance, price | Yes | Client-side |
| **Listing detail** – Photo, quantity, price, location, payment methods, seller | Yes | Yes |
| **Contact seller** – Email from listing (when logged in) | Yes | Yes |
| **Create listing** – Photo upload, produce type, quantity, price, location, payment methods | Yes | Yes |
| **Edit / delete listing** | Yes | Yes |
| **My Listings** – View, edit, delete your listings | Yes | Yes |
| **Image upload** – Listing photos on server | Yes | Yes |

### To-Do (UI only or mock data)

| Feature | Status |
|--------|--------|
| **In-app messaging** – Messages list and chat | Mock data; need messages API |
| **Schedule pickup** – Choose day/time, notify seller | UI only; no API |
| **Scheduled Pickups** – Upcoming pickups | Mock data; need pickups API |
| **Reviews** – View seller reviews on listing | Mock data; need reviews API |
| **My Reviews** – Ratings received | Mock data; need reviews API |
| **Nearby by location** – Feed using getNearbyListings with user lat/lng | API exists; app uses getAllListings only |

## Design

Minimal, colorful, and welcoming: leafy green primary, warm golden accent, terracotta for barter, light background.

## How to start the app

The app talks to the **Backyard Produce API** at `http://localhost:8000`. Start the API first, then the app.

### 1. Start the API (backend)

From the **API** project folder:

```bash
cd backyard-produce-api
```

- **Create a PostgreSQL database** (if you haven't): `createdb backyard_produce`
- **Create a virtualenv and install dependencies:**

  ```bash
  python -m venv .venv
  .venv\Scripts\activate   # Windows
  pip install -r requirements.txt
  ```

- **Environment:** Copy `.env.example` to `.env` and set `DATABASE_URL` and `SECRET_KEY`.
- **Run migrations:** `alembic upgrade head`
- **Start the server:** `uvicorn app.main:app --reload`

  API: http://localhost:8000 | Docs: http://localhost:8000/docs

### 2. Start the app (frontend)

In a **second terminal**:

```bash
cd backyard-produce-app
npm install
npm start
```

Then: **Android** press `a` or scan QR | **iOS** press `i` | **Web** press `w`.

**Note:** On a physical device, set `API_BASE_URL` in `src/api/config.js` to your machine's IP (e.g. `http://192.168.1.x:8000`).

## Project structure

- `App.js` – Root with `AuthProvider` and `AppNavigator`
- `theme.js` – Colors, spacing, typography
- `src/context/AuthContext.js` – Auth state (login/register via API)
- `src/navigation/` – Stack + tab navigators
- `src/screens/` – All screens (Auth, Feed, Listing detail, Create listing, Messages, Chat, Schedule, Reviews, Profile, My Listings, Scheduled Pickups, My Reviews)
- `src/components/ListingCard.js` – Listing card for feed
- `src/data/mockListings.js`, `mockMessages.js` – Mock data for development

## Backend

The app uses the **backyard-produce-api** (FastAPI + PostgreSQL) for auth, listings, and image upload. Messages, scheduled pickups, and reviews still use mock data. See the To-Do section above for features still to be implemented.

## Optional: custom app icon and splash

To add your own icon and splash screen:

1. Add to project root:
   - `assets/icon.png` (1024×1024)
   - `assets/splash.png` (e.g. 1284×2778)
   - `assets/adaptive-icon.png` (1024×1024, Android)
2. In `app.json`, set:
   - `expo.icon` to `"./assets/icon.png"`
   - `expo.splash.image` to `"./assets/splash.png"`
   - `expo.android.adaptiveIcon.foregroundImage` to `"./assets/adaptive-icon.png"`