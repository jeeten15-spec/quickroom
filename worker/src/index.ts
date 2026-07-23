import type { Env } from './firebase';

type RouteName =
  | 'createRoom'
  | 'joinRoom'
  | 'sendMessage'
  | 'uploadImage'
  | 'report'
  | 'leaveRoom'
  | 'getRoom';

const routeMethods: Record<RouteName, string> = {
  createRoom: 'POST',
  joinRoom: 'POST',
  sendMessage: 'POST',
  uploadImage: 'POST',
  report: 'POST',
  leaveRoom: 'POST',
  getRoom: 'GET'
};

export default {
  async fetch(request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const pathname = new URL(request.url).pathname;
    const route = pathname.replace(/^\/api\//, '') as RouteName;

    if (!Object.hasOwn(routeMethods, route)) {
      return json({ error: 'Not found.' }, 404, corsHeaders);
    }

    if (request.method !== routeMethods[route]) {
      return json({ error: 'Method not allowed.' }, 405, corsHeaders);
    }

    return handlePlaceholder(route, corsHeaders);
  }
} satisfies ExportedHandler<Env>;

function getCorsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((value) => value.trim());
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin'
  };
}

function handlePlaceholder(route: RouteName, headers: HeadersInit): Response {
  /**
   * Each route will validate the anonymous identity, request payload, room
   * state, expiry, health state, and private-chat permission before writing.
   *
   * - createRoom: validate room input; create exact Room data and system message.
   * - joinRoom: validate room/link and nickname; update presence.
   * - sendMessage: enforce 500 characters and 1 message per 1.5 seconds.
   * - uploadImage: validate JPEG/PNG/WebP/GIF and 5 MB max; issue signed URLs.
   * - report: record report and apply moderation/room-health hooks.
   * - leaveRoom: remove presence and update statistics.
   * - getRoom: return a read model for the frontend.
   *
   * Firebase Realtime Database writes, rate-limit state, moderation calls,
   * expiry cleanup, future payments, analytics, ads, and AI participant hooks
   * remain exclusively in this Worker.
   */
  return json(
    { error: `${route} is scaffolded but not implemented.` },
    501,
    headers
  );
}

function json(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), { status, headers });
}
