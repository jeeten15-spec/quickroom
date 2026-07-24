/**
 * Privileged Firebase integration boundary.
 *
 * Firebase Admin SDK targets Node.js and is not reliable in Cloudflare Workers.
 * This module uses the same service-account authority through Firebase and
 * Google REST APIs, with Web Crypto for all JWT and V4 URL signatures.
 * Firebase credentials never leave this Worker.
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

export interface AuthenticatedUser {
  uid: string;
}

interface CachedAccessToken {
  accessToken: string;
  expiresAt: number;
}

interface CachedFirebasePublicKeys {
  keys: Record<string, JsonWebKey>;
  expiresAt: number;
}

let cachedAccessToken: CachedAccessToken | undefined;
let cachedFirebasePublicKeys: CachedFirebasePublicKeys | undefined;

export function getFirebaseServiceAccount(env: Env): FirebaseServiceAccount {
  try {
    return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as FirebaseServiceAccount;
  } catch {
    throw new FirebaseConfigurationError('The Worker service-account secret is invalid.');
  }
}

export function assertFirebaseConfiguration(env: Env): void {
  const requiredValues = [
    env.FIREBASE_PROJECT_ID,
    env.FIREBASE_DATABASE_URL,
    env.FIREBASE_STORAGE_BUCKET,
    env.FIREBASE_SERVICE_ACCOUNT_JSON
  ];
  if (requiredValues.some((value) => !value || value.includes('your-firebase-project-id'))) {
    throw new FirebaseConfigurationError(
      'QuickRoom is not configured yet. Add Firebase Worker variables and the service-account secret.'
    );
  }
}

export async function verifyFirebaseIdToken(
  authorization: string | null,
  env: Env
): Promise<AuthenticatedUser> {
  if (!authorization?.startsWith('Bearer ')) {
    throw new FirebaseAuthError('A Firebase ID token is required.');
  }

  const token = authorization.slice('Bearer '.length);
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new FirebaseAuthError('The Firebase ID token is malformed.');
  }

  const header = decodeJson<{ alg?: string; kid?: string }>(encodedHeader);
  const payload = decodeJson<{
    aud?: string;
    exp?: number;
    iat?: number;
    iss?: string;
    sub?: string;
  }>(encodedPayload);

  if (header.alg !== 'RS256' || !header.kid) {
    throw new FirebaseAuthError('The Firebase ID token uses an unsupported signature.');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    payload.aud !== env.FIREBASE_PROJECT_ID ||
    payload.iss !== `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}` ||
    !payload.sub ||
    payload.sub.length > 128 ||
    !payload.exp ||
    payload.exp <= nowSeconds ||
    !payload.iat ||
    payload.iat > nowSeconds + 60
  ) {
    throw new FirebaseAuthError('The Firebase ID token is invalid or expired.');
  }

  const publicKeys = await getFirebasePublicKeys();
  const publicKeyData = publicKeys[header.kid];
  if (!publicKeyData) {
    throw new FirebaseAuthError('The Firebase ID token signing key is unavailable.');
  }

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicKeyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    base64UrlToBytes(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );

  if (!verified) {
    throw new FirebaseAuthError('The Firebase ID token signature is invalid.');
  }

  return { uid: payload.sub };
}

export async function databaseGet<T>(env: Env, path: string): Promise<T | null> {
  return databaseRequest<T>(env, path, 'GET');
}

export async function databasePut<T>(env: Env, path: string, value: T): Promise<T> {
  return databaseRequest<T>(env, path, 'PUT', value);
}

export async function databasePatch<T>(env: Env, path: string, value: unknown): Promise<T> {
  return databaseRequest<T>(env, path, 'PATCH', value);
}

export async function databaseDelete(env: Env, path: string): Promise<void> {
  await databaseRequest<null>(env, path, 'DELETE');
}

export async function signStorageUploadUrl(
  env: Env,
  objectPath: string,
  contentType: string
): Promise<{ uploadUrl: string; expiresAt: number }> {
  return signStorageUrl(env, 'PUT', objectPath, 15 * 60, contentType);
}

export async function signStorageDownloadUrl(
  env: Env,
  objectPath: string
): Promise<{ downloadUrl: string; expiresAt: number }> {
  return signStorageUrl(env, 'GET', objectPath, 15 * 60);
}

export async function getStorageObjectMetadata(
  env: Env,
  objectPath: string
): Promise<{ contentType: string; size: number } | null> {
  const accessToken = await getGoogleAccessToken(env);
  const url = new URL(
    `https://storage.googleapis.com/storage/v1/b/${encodePathSegment(
      env.FIREBASE_STORAGE_BUCKET
    )}/o/${encodePathSegment(objectPath)}`
  );
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new FirebaseRequestError('Cloud Storage metadata request failed.', response.status);
  }

  const metadata = (await response.json()) as { contentType: string; size: string };
  return { contentType: metadata.contentType, size: Number(metadata.size) };
}

export async function deleteStorageObjectsByPrefix(env: Env, prefix: string): Promise<void> {
  const accessToken = await getGoogleAccessToken(env);
  let pageToken: string | undefined;

  do {
    const url = new URL(
      `https://storage.googleapis.com/storage/v1/b/${encodePathSegment(
        env.FIREBASE_STORAGE_BUCKET
      )}/o`
    );
    url.searchParams.set('prefix', prefix);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) {
      throw new FirebaseRequestError('Cloud Storage list request failed.', response.status);
    }

    const page = (await response.json()) as {
      items?: Array<{ name: string }>;
      nextPageToken?: string;
    };
    for (const item of page.items ?? []) {
      const deleteResponse = await fetch(
        `https://storage.googleapis.com/storage/v1/b/${encodePathSegment(
          env.FIREBASE_STORAGE_BUCKET
        )}/o/${encodePathSegment(item.name)}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!deleteResponse.ok && deleteResponse.status !== 404) {
        throw new FirebaseRequestError('Cloud Storage delete request failed.', deleteResponse.status);
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);
}

async function databaseRequest<T>(
  env: Env,
  path: string,
  method: 'GET' | 'PUT' | 'PATCH' | 'DELETE',
  value?: unknown
): Promise<T | null> {
  const accessToken = await getGoogleAccessToken(env);
  const databaseUrl = new URL(env.FIREBASE_DATABASE_URL);
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(encodePathSegment)
    .join('/');
  const url = new URL(`${databaseUrl.toString().replace(/\/$/, '')}/${encodedPath}.json`);
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(value === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    body: value === undefined ? undefined : JSON.stringify(value)
  });

  if (!response.ok) {
    throw new FirebaseRequestError('Realtime Database request failed.', response.status);
  }

  if (method === 'DELETE') {
    return null;
  }

  return (await response.json()) as T | null;
}

async function getGoogleAccessToken(env: Env): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.accessToken;
  }

  const serviceAccount = getFirebaseServiceAccount(env);
  const issuedAt = Math.floor(now / 1000);
  const assertion = await signJwt(serviceAccount, {
    iss: serviceAccount.client_email,
    scope: [
      'https://www.googleapis.com/auth/firebase.database',
      'https://www.googleapis.com/auth/devstorage.read_write'
    ].join(' '),
    aud: serviceAccount.token_uri,
    iat: issuedAt,
    exp: issuedAt + 3600
  });
  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!response.ok) {
    throw new FirebaseRequestError('Service-account authentication failed.', response.status);
  }

  const token = (await response.json()) as { access_token: string; expires_in: number };
  cachedAccessToken = {
    accessToken: token.access_token,
    expiresAt: now + token.expires_in * 1000
  };
  return token.access_token;
}

async function signStorageUrl(
  env: Env,
  method: 'GET' | 'PUT',
  objectPath: string,
  expiresInSeconds: number,
  contentType?: string
): Promise<{ uploadUrl: string; downloadUrl: string; expiresAt: number }> {
  const serviceAccount = getFirebaseServiceAccount(env);
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const date = timestamp.slice(0, 8);
  const credentialScope = `${date}/auto/storage/goog4_request`;
  const signedHeaders = contentType ? 'content-type;host' : 'host';
  const canonicalHeaders = contentType
    ? `content-type:${contentType}\nhost:storage.googleapis.com\n`
    : 'host:storage.googleapis.com\n';
  const query = new URLSearchParams({
    'X-Goog-Algorithm': 'GOOG4-RSA-SHA256',
    'X-Goog-Credential': `${serviceAccount.client_email}/${credentialScope}`,
    'X-Goog-Date': timestamp,
    'X-Goog-Expires': String(expiresInSeconds),
    'X-Goog-SignedHeaders': signedHeaders
  });
  const canonicalQuery = [...query.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${rfc3986Encode(key)}=${rfc3986Encode(value)}`)
    .join('&');
  const canonicalUri = `/${encodePathSegment(env.FIREBASE_STORAGE_BUCKET)}/${objectPath
    .split('/')
    .map(encodePathSegment)
    .join('/')}`;
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n');
  const canonicalRequestHash = await sha256Hex(canonicalRequest);
  const stringToSign = [
    'GOOG4-RSA-SHA256',
    timestamp,
    credentialScope,
    canonicalRequestHash
  ].join('\n');
  const signature = await signWithServiceAccount(serviceAccount, stringToSign);
  const signedUrl = `https://storage.googleapis.com${canonicalUri}?${canonicalQuery}&X-Goog-Signature=${signature}`;
  const expiresAt = now.getTime() + expiresInSeconds * 1000;

  return method === 'PUT'
    ? { uploadUrl: signedUrl, downloadUrl: '', expiresAt }
    : { uploadUrl: '', downloadUrl: signedUrl, expiresAt };
}

async function getFirebasePublicKeys(): Promise<Record<string, JsonWebKey>> {
  if (cachedFirebasePublicKeys && cachedFirebasePublicKeys.expiresAt > Date.now()) {
    return cachedFirebasePublicKeys.keys;
  }

  const response = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  );
  if (!response.ok) {
    throw new FirebaseAuthError('Firebase token signing keys are unavailable.');
  }

  const cacheControl = response.headers.get('cache-control') ?? '';
  const maxAge = Number(/max-age=(\d+)/.exec(cacheControl)?.[1] ?? 3600);
  const keySet = (await response.json()) as { keys: JsonWebKey[] };
  const keys = Object.fromEntries(
    keySet.keys
      .filter((key) => typeof key.kid === 'string')
      .map((key) => [key.kid as string, key])
  );
  cachedFirebasePublicKeys = {
    keys,
    expiresAt: Date.now() + maxAge * 1000
  };
  return keys;
}

async function signJwt(
  serviceAccount: FirebaseServiceAccount,
  payload: Record<string, unknown>
): Promise<string> {
  const encodedHeader = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  );
  const encodedPayload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signWithServiceAccount(
    serviceAccount,
    `${encodedHeader}.${encodedPayload}`
  );
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function signWithServiceAccount(
  serviceAccount: FirebaseServiceAccount,
  value: string
): Promise<string> {
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(value)
  );
  return bytesToHex(new Uint8Array(signature));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

function decodeJson<T>(encoded: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded))) as T;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem.replace(/-----(BEGIN|END) [^-]+-----|\s/g, '');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return bytes.buffer;
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToBase64Url(value: Uint8Array): string {
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function bytesToHex(value: Uint8Array): string {
  return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function encodePathSegment(value: string): string {
  return rfc3986Encode(value);
}

function rfc3986Encode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

export class FirebaseAuthError extends Error {}

export class FirebaseConfigurationError extends Error {}

export class FirebaseRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}
