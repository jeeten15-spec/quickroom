/**
 * Privileged Firebase integration boundary.
 *
 * Firebase Admin SDK is designed for a Node.js server and is not dependable in
 * the Cloudflare Workers runtime. The Worker will use the same service-account
 * authority through Firebase/Google REST APIs and Web Crypto instead. This
 * keeps Firebase credentials entirely server-side while retaining the Admin
 * SDK's privileged access model.
 *
 * Implement token creation, Realtime Database REST calls, and Cloud Storage
 * V4 signed URLs here in the next business-logic phase.
 */

export interface Env {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_URL: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  ALLOWED_ORIGINS: string;
}

export interface FirebaseServiceAccount {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  token_uri: string;
}

export function getFirebaseServiceAccount(env: Env): FirebaseServiceAccount {
  try {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as FirebaseServiceAccount;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.');
  }
}

export function assertFirebaseConfiguration(env: Env): void {
  if (
    !env.FIREBASE_PROJECT_ID ||
    !env.FIREBASE_DATABASE_URL ||
    !env.FIREBASE_STORAGE_BUCKET ||
    !env.FIREBASE_SERVICE_ACCOUNT_JSON
  ) {
    throw new Error('Firebase Worker configuration is incomplete.');
  }
}

/**
 * Future integration points:
 * - Mint a Google OAuth access token from the service account using Web Crypto.
 * - Read/write Firebase Realtime Database via its REST API.
 * - Create short-lived Cloud Storage V4 signed upload/download URLs.
 * - Delete /rooms/{roomId} database data and storage objects at room expiry.
 */
