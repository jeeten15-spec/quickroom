// Serve the SPA shell for /room/:id. Do not use room.html — Cloudflare Pages
// pretty URLs map room.html to /room and 308 /room/:id → /room.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const asset = await context.env.ASSETS.fetch(new URL('/chat-shell.html', url.origin));
  const headers = new Headers(asset.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Cache-Control', 'no-store');
  return new Response(asset.body, {
    status: 200,
    headers
  });
}
