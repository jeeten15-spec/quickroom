# QuickRoom

QuickRoom is a temporary, 18+ text-and-image discussion tool. The Worker API is
implemented; the frontend UI has intentionally not been started.

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
│   │   ├── handlers.ts
│   │   ├── index.ts
│   │   └── validation.ts
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

## Worker API

All API routes require a Firebase Anonymous Authentication ID token in
`Authorization: Bearer <id-token>`. The Worker verifies the token with
Firebase's public signing keys before it reads or writes data.

| Route | Method |
| --- | --- |
| `/api/createRoom` | `POST` |
| `/api/joinRoom` | `POST` |
| `/api/sendMessage` | `POST` |
| `/api/uploadImage` | `POST` |
| `/api/report` | `POST` |
| `/api/leaveRoom` | `POST` |
| `/api/room/:roomId` | `GET` |

`POST /api/uploadImage` validates image metadata and returns a 15-minute signed
Cloud Storage upload URL. The browser uploads directly to that one-time scoped
URL, then calls `sendMessage` with the returned `imagePath`, `contentType`, and
`size`. Before creating the image message, the Worker reads object metadata to
verify its actual type and byte size.

The Worker validates all required input: templates, room names, expiry options
(`1h`, `6h`, `24h`, `7d`, `never`), room type, nickname, text length, and image
metadata. It uses per-isolate in-memory rate limiting for now; production-grade
cross-isolate limits can replace this boundary with a Durable Object later.

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
   bucket. Enable **Anonymous** in Firebase Authentication's sign-in providers.
   API callers must obtain an Anonymous Authentication ID token and pass it to
   the Worker; the API verifies it server-side. Create a service account key in
   **Project settings → Service accounts** and keep its complete JSON private.
2. Replace `your-firebase-project-id` in `firebase/.firebaserc`,
   `worker/wrangler.toml`, and the local Worker variables. Install the Firebase
   CLI, authenticate with `firebase login`, then deploy the deny-all client
   rules from the repository root:

   ```bash
   npx firebase-tools deploy --config firebase/firebase.json --project your-firebase-project-id
   ```

   These rules intentionally deny every browser read and write. The Worker uses
   service-account authority, which bypasses client security rules. Firebase
   rules cannot identify a Cloudflare Worker directly, so deny-all is the
   strictest correct client rule.
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
The Worker uses a service-account integration boundary for Firebase and Google
REST APIs using Web Crypto. This provides the same server-only privileged
access while remaining compatible with the Workers runtime.

The service account needs access to the Realtime Database and the default
Firebase Storage bucket. The standard Firebase Admin service account role is
sufficient for development; production should use a dedicated service account
with only the required database and storage permissions.

## Known advisories

`npm audit` reports no advisories in `frontend`. It reports three high-severity
development-only transitive advisories in `worker`:

| Package | Installed version | Dependency path | Advisory |
| --- | --- | --- | --- |
| `wrangler` | `4.113.0` | direct development dependency | inherits `miniflare` advisory |
| `miniflare` | `4.20260721.0` | `wrangler → miniflare` | inherits `sharp` advisory |
| `sharp` | `0.34.5` | `wrangler → miniflare → sharp` | `GHSA-f88m-g3jw-g9cj` / CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 |

The installed Wrangler release is the latest available release and still
depends on this Miniflare/Sharp chain. `npm audit fix` cannot resolve it without
forcing an incompatible dependency override. These packages are used only for
local Worker development and dry-run deployment; they are not bundled into the
deployed Worker. No override was added to avoid risking Wrangler compatibility.
