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
(`1h`, `6h`, `24h`, `7d`, `3mo`), room type, nickname, text length, and image
metadata. It uses per-isolate in-memory rate limiting for now; production-grade
cross-isolate limits can replace this boundary with a Durable Object later.

The chat frontend polls the Worker once per second for messages and sends a
presence heartbeat every five seconds. The Worker expires inactive presence
entries after 15 seconds. This keeps all browser data access on the Worker
boundary while providing near-real-time updates without a direct Firebase
connection.

## Expiry cleanup

QuickRoom uses two free-tier cleanup paths:

1. Lazy cleanup: any read, join heartbeat, send, upload, report, or leave
   operation that encounters an expired room immediately returns an expired
   response, removes `/rooms/{roomId}`, removes
   `/private/{roomId}`, and starts deletion of every Storage object under
   `/rooms/{roomId}/`.
2. Scheduled cleanup: the Worker has an hourly Cloudflare Cron Trigger
   (`0 * * * *`) that finds expired rooms nobody revisits and retries Storage
   deletion when an earlier attempt failed.

During cleanup, `/expiredRooms/{roomId}` is a seven-day internal tombstone. It
keeps the user-facing result calm (`410 This room has expired`) while making
Storage cleanup retryable. Tombstones are removed after seven days.

Private messages are room-scoped at
`/private/{roomId}/{sortedUidPair}/messages/{messageId}`. This small data-model
extension makes private messages delete with their room. Invite Only uses the
unguessable shared room link as its MVP invitation; explicit invite tokens are
a future extension.

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

## Go Live

Follow these steps in order. Values labelled `your-...` must be replaced with
your own Firebase or Cloudflare values.

1. Create Firebase resources.
   - In the [Firebase console](https://console.firebase.google.com/), select
     **Add project** and create `quickroom`.
   - Open **Authentication → Sign-in method**, enable **Anonymous**, then open
     **Settings → Authorized domains** and add your Pages domain and
     `localhost`.
   - Open **Realtime Database**, create the database, then open **Storage** and
     create the default bucket. Note its exact bucket name.
   - Add a Web app in **Project settings → General**. Copy its API key, auth
     domain, project ID, and app ID.
2. Lock down Firebase browser access.
   - Install the Firebase CLI and authenticate: `npx firebase-tools login`.
   - Replace the placeholder project ID in `firebase/.firebaserc`, then deploy
     the rules:

     ```bash
     npx firebase-tools deploy --config firebase/firebase.json --project your-firebase-project-id
     ```

3. Create the Worker service account.
   - In Firebase, open **Project settings → Service accounts → Generate new
     private key**. Save the downloaded JSON in a password manager or secure
     local location; never commit it or add it to Pages.
   - In `worker/wrangler.toml`, replace `FIREBASE_PROJECT_ID`,
     `FIREBASE_DATABASE_URL`, `FIREBASE_STORAGE_BUCKET`, and
     `ALLOWED_ORIGINS`. These are Worker variables, not browser secrets.
   - Authenticate Wrangler, then paste the complete JSON only when prompted:

     ```bash
     cd worker
     npx wrangler login
     npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
     ```

4. Apply Storage CORS.
   - Add every production Pages URL to the `origin` list in
     `firebase/storage.cors.json`.
   - Apply it with Google Cloud CLI:

     ```bash
     gcloud storage buckets update gs://your-firebase-storage-bucket \
       --cors-file=firebase/storage.cors.json
     ```

5. Deploy the Worker.
   - From `worker/`, run `npm run deploy`.
   - In Cloudflare, attach the Worker to an HTTPS route such as
     `api.quickroom.org/*`. Confirm the variables and secret appear in
     **Worker Settings → Variables and Secrets**.
   - `worker/wrangler.toml` includes the hourly Cron Trigger. After deployment,
     confirm `0 * * * *` appears in **Worker → Triggers**.
6. Deploy Pages.
   - Create a Cloudflare Pages project connected to this repository.
   - Set build root to `frontend`, build command to `npm run build`, and output
     directory to `frontend/dist`.
   - Add these Pages environment variables from the Firebase Web app:
     `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
     `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID`.
   - Set `VITE_WORKER_URL` to the Worker origin, for example
     `https://api.quickroom.org`. Add the Pages URL to the Worker's
     `ALLOWED_ORIGINS`, then redeploy the Worker if it changed.

### First live test

1. In browser A, open Pages, confirm age, create a room with **1 hour** expiry,
   and click **Share**.
2. In an incognito window or browser B, open the shared link, confirm age,
   choose a nickname, and join.
3. Send text in both directions, then upload a JPEG, PNG, WebP, or GIF under
   5 MB. Open the image to confirm the full-size view.
4. Confirm the participant count and summary update. Test a private message if
   enabled, then leave browser B and confirm its participant entry disappears.
5. After the room expires, revisit the link. It should show the expired state;
   the lazy cleanup runs immediately and the hourly Cron catches untouched
   rooms.

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

## Search Console, country analytics, ads, and EU consent

1. **Google Search Console.** Add `https://quickroom.org` as a URL-prefix property. Choose **HTML tag**, copy the `content` value, and set `VITE_GOOGLE_SITE_VERIFICATION` on the Pages build. Redeploy, then verify. Submit `https://quickroom.org/sitemap.xml` (the build regenerates it). Prefer the US, UK, Australia, Canada, France, and Germany country filters in performance reports.
2. **Country pageviews.** Content pages call `POST /api/pageview`. Country is taken from Cloudflare (`CF-IPCountry`). Open `/dashboard` with `METRICS_ADMIN_TOKEN` to see 14-day country and path tables. Optionally set `VITE_CF_WEB_ANALYTICS_TOKEN` for Cloudflare Web Analytics (also has country reports).
3. **Ads.** Google AdSense (`ca-pub-2208705874716134`) stays in the HTML head plus `/ads.txt` for review. Home (`/` and `/fr`) IAB placeholder frames are off until approval (`ADSENSE_HOME_PLACEHOLDERS` in `frontend/src/adsense.js` — set to `true` to restore three 160×600 rails plus leader/footer/300×250). Other AdSense pages still show frames: five 160×600 per side on `/blog`, four on use cases, three on guides/articles, two on legal pages. **About has no AdSense** — Monetag in-page push, vignette, and the sponsored link run only there. Chat, Create, and the dashboard have no ads. Keep Auto ads overlays/anchors/vignettes **off**. Do not use OnClick/pop-under.
4. **Until Funding Choices is on,** visitors in the EEA, UK, and Switzerland see QuickRoom’s consent banner; AdSense/GA do not load until they accept. `/privacy`, `/cookies`, and `/privacy-choices` are linked in the footer.
5. **French pages:** `/fr` plus `/fr/chat-prive-sans-inscription`, `/fr/salle-de-discussion-temporaire`, `/fr/groupe-etude-sans-whatsapp`, `/fr/chat-hackathon`.
6. Organiser emails and four short posts: `docs/distribution-us-uk.md`.
