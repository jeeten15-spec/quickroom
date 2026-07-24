import {
  FirebaseAuthError,
  FirebaseConfigurationError,
  FirebaseRequestError,
  assertFirebaseConfiguration,
  type Env,
  verifyFirebaseIdToken
} from './firebase';
import {
  HttpError,
  cleanupExpiredRooms,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  reportMessage,
  sendMessage,
  uploadImage
} from './handlers';
import { ValidationError } from './validation';

export default {
  async fetch(request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    if (origin && !isAllowedOrigin(origin, env)) {
      return json({ error: 'Origin is not allowed.' }, 403, {});
    }
    const corsHeaders = getCorsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      assertFirebaseConfiguration(env);
      const user = await verifyFirebaseIdToken(request.headers.get('Authorization'), env);
      const url = new URL(request.url);

      if (request.method === 'POST' && url.pathname === '/api/createRoom') {
        return json(await createRoom(await readJson(request), user, env), 201, corsHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/joinRoom') {
        return json(await joinRoom(await readJson(request), user, env), 200, corsHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/sendMessage') {
        return json(await sendMessage(await readJson(request), user, env), 201, corsHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/uploadImage') {
        return json(await uploadImage(await readJson(request), user, env), 200, corsHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/report') {
        return json(await reportMessage(await readJson(request), user, env), 200, corsHeaders);
      }
      if (request.method === 'POST' && url.pathname === '/api/leaveRoom') {
        return json(await leaveRoom(await readJson(request), user, env), 200, corsHeaders);
      }

      const roomMatch = /^\/api\/room\/([A-Za-z0-9_-]+)$/.exec(url.pathname);
      if (request.method === 'GET' && roomMatch) {
        return json(
          await getRoom(roomMatch[1], url.searchParams.get('privateWith'), user, env),
          200,
          corsHeaders
        );
      }

      return json({ error: 'Not found.' }, 404, corsHeaders);
    } catch (error) {
      return errorResponse(error, corsHeaders);
    }
  },

  async scheduled(_controller, env: Env): Promise<void> {
    try {
      assertFirebaseConfiguration(env);
      await cleanupExpiredRooms(env);
    } catch (error) {
      console.error('QuickRoom scheduled cleanup failed.', error);
    }
  }
} satisfies ExportedHandler<Env>;

function getCorsHeaders(origin: string | null): HeadersInit {
  return {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin'
  };
}

async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
    throw new ValidationError('Content-Type must be application/json.');
  }
  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 32 * 1024) {
    throw new HttpError(413, 'Request body is too large.');
  }

  try {
    return await request.json();
  } catch {
    throw new ValidationError('Request body must contain valid JSON.');
  }
}

function isAllowedOrigin(origin: string, env: Env): boolean {
  return env.ALLOWED_ORIGINS.split(',').some((allowedOrigin) => allowedOrigin.trim() === origin);
}

function errorResponse(error: unknown, headers: HeadersInit): Response {
  if (error instanceof ValidationError) {
    return json({ error: error.message }, 400, headers);
  }
  if (error instanceof FirebaseAuthError) {
    return json({ error: error.message }, 401, headers);
  }
  if (error instanceof FirebaseConfigurationError) {
    return json({ error: error.message }, 503, headers);
  }
  if (error instanceof HttpError) {
    return json({ error: error.message }, error.status, headers);
  }
  if (error instanceof FirebaseRequestError) {
    return json({ error: 'The service is temporarily unavailable.' }, 502, headers);
  }

  console.error(error);
  return json({ error: 'Internal server error.' }, 500, headers);
}

function json(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), { status, headers });
}
