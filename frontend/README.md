# Frontend (React + Vite)

This folder contains the React UI for the calendar alarm app.

## API expectations

The UI expects these backend endpoints:

- `GET /api/events`
  - Accepted response shapes:
    - `[{ ...event }]`
    - `{ "items": [{ ...event }] }`
    - `{ "events": [{ ...event }] }`
- `GET /api/health`
- `POST /api/alarm-settings`
- `POST /api/test-sound`

## Event shape notes

For each event, UI supports:

- `id` (preferred)
- `iCalUID` (fallback)
- `summary`
- `start.dateTime` or `start.date` (Google Calendar style)

If no id is present, UI generates a fallback id so selection still works.

## Run

```bash
cd frontend
npm install
npm run dev
```

## Build

```bash
cd frontend
npm run build
```

## Mini tasks (next)

1. Wire real date filter and calendar filter in `src/components/Filters.jsx` + `src/App.jsx`.
2. Add polling for `checkConnection` when sync is active.
3. Persist selected events and sound settings to `localStorage`.
4. Replace static sound options with `GET /api/sounds` response.
