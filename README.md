# Smart CRM

Smart CRM is a web application for small businesses and individual salespeople. It keeps leads, customers, opportunities, conversations, and follow-ups in one workspace. A follow-up is never only a reminder. It shows the person, the priority, the sales stage, the last interaction, and the next action together.

**Author:** Pragati GP

## Features

- Registration, login, and JWT authentication with bcrypt password hashing
- Lead, customer, opportunity, and activity management
- A sales pipeline with the stages New Lead, Contacted, Qualified, Proposal, Won, and Lost
- A lead can be marked Contacted only after an interaction is recorded
- Moving a lead to Won creates a customer record
- Context-aware follow-ups, including automatic overdue status
- A dashboard counted from the signed-in user's records
- Search, filters, sorting, and pagination
- Light, dark, and system themes, with a layout that works on a phone

## Stack

MongoDB and Mongoose, Node.js and Express, React 18 and Vite, Tailwind CSS, JWT, and bcrypt.

## Local setup

Requirements: Node.js 20 or newer, npm, and MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas)).

1. Clone the repository and install dependencies.

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Create the environment files.

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

3. In `backend/.env`, set `MONGO_URI` to your database and replace `JWT_SECRET` with a long random string. Do not commit `backend/.env`.

4. Seed the demo workspace and start both apps.

```bash
npm run seed
npm run dev
```

5. Open `http://localhost:5173`. The API runs at `http://localhost:5000`.

If MongoDB is not installed yet, the API can be exercised against a temporary in-memory database:

```bash
node backend/scripts/memory-dev.js
```

That process seeds the demo account and listens on port 5000. It is only for local verification. Stop it before using a real `MONGO_URI`. If the frontend is not on `http://localhost:5173`, set `SMART_CRM_CLIENT_URL` to the frontend origin before starting the script.

### Demo account

After seeding:

- Email: `demo@smartcrm.com`
- Password: `Demo@123`

The demo user is Pragati GP. Seeding replaces only that user's records.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the API and the React app |
| `npm run seed` | Loads the demo workspace |
| `npm test` | Runs the backend and frontend tests and writes `docs/TEST_RESULTS.md` |
| `npm run lint` | Lints both apps |
| `npm run build` | Builds the frontend for production |
| `npm start` | Starts the API only |

## API

Endpoint details and examples are in [docs/API.md](docs/API.md).

## Screenshots

Place the captures listed in [docs/screenshots/README.md](docs/screenshots/README.md) into `docs/screenshots/`.

## Deployment

Use a free MongoDB Atlas cluster for the database.

**API (Render or Railway)**

- Root directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Environment: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CLIENT_URL` set to the frontend origin, `NODE_ENV=production`
- A Render blueprint is in `render.yaml`

**Frontend (Vercel or Netlify)**

- Root directory: `frontend`
- Build: `npm run build`
- Output: `dist`
- Environment: `VITE_API_URL=https://<your-api>/api`
- `frontend/vercel.json` rewrites every path to `index.html` so client-side routes work on refresh
- `frontend/public/_redirects` does the same for Netlify

Set the API `CLIENT_URL` to the exact frontend origin, including `https://`.

## Tests

The 16 cases from the project report are covered by Jest and Supertest on the API, plus a Vitest check for the phone layout. Results are written to [docs/TEST_RESULTS.md](docs/TEST_RESULTS.md). Design notes are in [docs/DECISIONS.md](docs/DECISIONS.md).

## Licence

MIT. See [LICENSE](LICENSE).
