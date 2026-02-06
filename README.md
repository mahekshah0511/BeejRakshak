# BeejRakshak

React (Vite + Tailwind) frontend and Express backend, with a single `npm run dev` to run both.

## Setup

1. **Install dependencies** (from project root):

   ```bash
   npm run install:all
   ```

   Or manually:

   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. **Configure environment**

   In the root `.env`, set only these three variables:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   PORT=3001
   ```

## Run

From the project root:

```bash
npm run dev
```

- **Frontend:** http://localhost:5173 (React UI)
- **Backend:** http://localhost:3001 (API); frontend proxies `/api` to the backend

## Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Run frontend + backend together      |
| `npm run dev:client` | Run only Vite (React) dev server  |
| `npm run dev:server` | Run only Express server           |
| `npm run build`   | Build client and server              |
| `npm run install:all` | Install root, client, and server deps |

## Auth and registration

- **Login/signup:** Combined page at `/login` with **Mobile OTP** (primary) and **Email/password** (optional). After sign-in, users are sent to `/registration` if they haven’t completed it, or to `/dashboard` if they have.
- **Phone OTP:** Supabase requires an SMS provider (e.g. [Twilio](https://supabase.com/docs/guides/auth/phone-login)) to be configured in the Supabase dashboard. Email/password works without extra setup.
- **Registration table:** The app expects a Supabase table (e.g. `registrations`) with one row per user, keyed by `user_id` (UUID from `auth.uid()`). Create it and enable RLS with a policy `auth.uid() = user_id` for SELECT, INSERT, UPDATE. Run the SQL in [docs/registration-table.sql](docs/registration-table.sql) in the Supabase SQL editor.

## Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS 3, React Router, Supabase client
- **Backend:** Express, CORS, dotenv
