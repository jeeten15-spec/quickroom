# QuickRoom

QuickRoom is a temporary, 18+ text-and-image discussion tool. The landing,
Create Room, Join Room, and text-and-image chat flows are implemented.

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
│   ├── public/_redirects
│   ├── src/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── main.js
│   │   ├── nickname.js
│   │   ├── pwa.js
│   │   └── style.css
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
│   ├── storage.cors.json
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

The chat frontend polls the Worker once per second for messages and sends a
presence heartbeat every five seconds. The Worker expires inactive presence
entries after 15 seconds. This keeps all browser data access on the Worker
boundary while providing near-real-time updates without a direct Firebase
connection.

## PWA and offline behavior

QuickRoom includes a web manifest and service worker. After the app shell has
loaded, the service worker caches it along with the most recently viewed room
response. When offline, that room remains available in read-only mode; sending,
uploading, reporting, joining, and leaving require a network connection.

## Environment variables

The Firebase web configuration values below are public Firebase project
identifiers. They are used solely for Firebase Anonymous Authentication, which
issues the ID token required by the Worker. They do not grant database or
Storage access; those Firebase rules remain deny-all for browser clients.

| Variable | Where set | Purpose |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | `frontend/.env` | Firebase web API key for Anonymous Authentication |
| `VITE_FIREBASE_AUTH_DOMAIN` | `frontend/.env` | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | `frontend/.env` | Firebase project identifier used by the Auth client |
| `VITE_FIREBASE_APP_ID` | `frontend/.env` | Firebase web app identifier |
| `VITE_WORKER_URL` | `frontend/.env` | Worker origin; leave empty for same-origin `/api` |
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
   Configure CORS for the Storage bucket so browser uploads can use the
   Worker-issued, short-lived signed URLs. Replace the production origin in
   `firebase/storage.cors.json` if needed, then run:

   ```bash
   gcloud storage buckets update gs://your-firebase-storage-bucket \
     --cors-file=firebase/storage.cors.json
   ```
3. Install workspace dependencies:

   ```bash
   npm install
   ```

4. In Firebase **Project settings → General**, add a Web app if one does not
   exist and copy its configuration values into `frontend/.env`. In Firebase
   Authentication **Settings → Authorized domains**, add the local and deployed
   Pages origins. Copy the Worker example variables as well, then start both
   services in separate terminals:

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
   `frontend/dist` as the output directory. Set the five `VITE_*` frontend
   variables from `frontend/.env`; `VITE_WORKER_URL` must point to the deployed
   Worker unless Pages serves the Worker under the same `/api` origin. Add the
   Pages URL to the Worker's `ALLOWED_ORIGINS`.

The frontend only calls the Worker after Firebase Anonymous Authentication
provides an ID token. It never imports Firebase Realtime Database or Storage.

Cloudflare Workers cannot reliably run the Node-oriented Firebase Admin SDK.
The Worker uses a service-account integration boundary for Firebase and Google
REST APIs using Web Crypto. This provides the same server-only privileged
access while remaining compatible with the Workers runtime.

The service account needs access to the Realtime Database and the default
Firebase Storage bucket. The standard Firebase Admin service account role is
sufficient for development; production should use a dedicated service account
with only the required database and storage permissions.

## Production Deployment Checklist

1. Firebase: create the project, enable Realtime Database and the default
   Storage bucket, enable Anonymous Authentication, and deploy the deny-all
   Database and Storage rules with the Firebase CLI.
2. Firebase identity: create a Web app, enable the intended Pages domains in
   Firebase Authentication's Authorized domains, and set the four public
   `VITE_FIREBASE_*` values in Cloudflare Pages.
3. Worker service account: create a dedicated Firebase/Google service account
   with Realtime Database and Storage access. Set its full JSON as
   `FIREBASE_SERVICE_ACCOUNT_JSON` with `wrangler secret put`; set
   `FIREBASE_PROJECT_ID`, `FIREBASE_DATABASE_URL`,
   `FIREBASE_STORAGE_BUCKET`, and `ALLOWED_ORIGINS` as Worker variables.
4. Storage CORS: update `firebase/storage.cors.json` with every local and
   production Pages origin, then apply it to the bucket using the `gcloud
   storage buckets update ... --cors-file=...` command above.
5. Cloudflare: deploy the Worker first, configure its HTTPS route, then deploy
   the `frontend` directory to Pages with `npm run build` and `frontend/dist`.
   Set `VITE_WORKER_URL` to the Worker origin unless `/api` is same-origin.
6. Two-browser acceptance test: in browser A, confirm age, create a room, and
   copy Share. In browser B (separate anonymous session), open that link,
   confirm age, choose a nickname, and join. Send text in both directions,
   upload a supported image under 5 MB, open a private chat when enabled, and
   verify the participant count, room summary, report health change, and
   offline read-only cache.

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
