# QuickRoom

QuickRoom is a temporary, 18+ text-and-image discussion tool. This repository
contains only the initial locked-architecture scaffold; no product UI or
business logic has been implemented yet.

## Architecture

Vite with vanilla JavaScript is used for the frontend. It is the cleaner MVP
choice here because the requested screens are small, state is limited, and it
keeps the initial Pages bundle and dependency surface minimal. The browser will
call only the Cloudflare Worker API. It has no Firebase database or Storage
client configuration.

```
Browser → Cloudflare Pages (frontend) → Cloudflare Worker (API) →
Firebase Realtime Database + Firebase Storage
```

```
.
├── frontend/                 # Vite + vanilla JavaScript, for Cloudflare Pages
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── src/main.js
│   └── vite.config.js
├── worker/                   # Cloudflare Worker API boundary
│   ├── .dev.vars.example
│   ├── package.json
│   ├── src/
│   │   ├── firebase.ts
│   │   └── index.ts
│   └── wrangler.toml
├── shared/                   # Exact Firebase record types and helpers
│   ├── package.json
│   └── src/models.ts
├── firebase/                 # Locked-down Realtime Database and Storage rules
│   ├── .firebaserc
│   ├── database.rules.json
│   ├── firebase.json
│   └── storage.rules
├── package.json
└── .gitignore
```

## API scaffold

The Worker currently accepts CORS preflight requests and exposes these
unimplemented API route placeholders:

| Route | Method |
| --- | --- |
| `/api/createRoom` | `POST` |
| `/api/joinRoom` | `POST` |
| `/api/sendMessage` | `POST` |
| `/api/uploadImage` | `POST` |
| `/api/report` | `POST` |
| `/api/leaveRoom` | `POST` |
| `/api/getRoom` | `GET` |

Each returns `501` until the next implementation phase. The Worker source marks
the locations for validation, rate limiting, service-account REST access,
Cloud Storage signed URLs, moderation, cleanup, and future payments/AI hooks.

## Environment variables

The frontend needs no Firebase variables.

| Variable | Where set | Purpose |
| --- | --- | --- |
| `VITE_WORKER_URL` | `frontend/.env` | Worker URL when not using the local Vite proxy |
| `FIREBASE_PROJECT_ID` | Worker variable | Firebase project identifier |
| `FIREBASE_DATABASE_URL` | Worker variable | Realtime Database URL |
| `FIREBASE_STORAGE_BUCKET` | Worker variable | Cloud Storage bucket |
| `ALLOWED_ORIGINS` | Worker variable | Comma-separated Pages and local origins |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Worker secret | Complete Firebase service-account JSON |

Copy `frontend/.env.example` to `frontend/.env` and
`worker/.dev.vars.example` to `worker/.dev.vars` for local values. Never commit
either local file or a service account key.

## Local Development & Deployment Steps

1. Create a Firebase project in the Firebase console. Enable **Realtime
   Database**, choose the desired region, and create the default **Storage**
   bucket. Enable Firebase Anonymous Authentication for the later identity
   implementation. Create a service account key in **Project settings → Service
   accounts** and keep its complete JSON private.
2. Replace `your-firebase-project-id` in `firebase/.firebaserc`,
   `worker/wrangler.toml`, and the local Worker variables. Install the Firebase
   CLI, authenticate with `firebase login`, then deploy the deny-all client
   rules from the repository root:

   ```bash
   npx firebase-tools deploy --config firebase/firebase.json --project your-firebase-project-id
   ```

   These rules intentionally deny every browser read and write. The future
   Worker uses service-account authority, which bypasses client security rules.
3. Install workspace dependencies:

   ```bash
   npm install
   ```

4. Copy the example environment files, fill in non-secret values, and start
   both services in separate terminals:

   ```bash
   npm run dev
   npm run dev:worker
   ```

5. Create a Cloudflare Worker project by authenticating with `npx wrangler
   login`. Set the service account as an encrypted Worker secret, then deploy:

   ```bash
   cd worker
   npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
   npm run deploy
   ```

   Configure the deployed Worker route, for example
   `api.quickroom.org/*`, and update `ALLOWED_ORIGINS` with the Pages domain.
6. Create a Cloudflare Pages project connected to this repository. Use
   `frontend` as the build root, `npm run build` as the build command, and
   `frontend/dist` as the output directory. Set `VITE_WORKER_URL` to the
   deployed Worker origin only if Pages will not proxy `/api` through the same
   origin.

Cloudflare Workers cannot reliably run the Node-oriented Firebase Admin SDK.
The Worker scaffold therefore reserves a service-account integration boundary
for Firebase and Google REST APIs using Web Crypto. This provides the same
server-only privileged access while remaining compatible with the Workers
runtime.
