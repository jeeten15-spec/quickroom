// Serve the SPA shell for /room/:id so clients can join rooms.
// Marketing pages stay as static prerendered HTML; unknown paths 404.
// room.html is the Vite shell without Monetag tags.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const asset = await context.env.ASSETS.fetch(new URL('/room.html', url.origin));
  const headers = new Headers(asset.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Cache-Control', 'no-store');
  return new Response(asset.body, {
    status: 200,
    headers
  });
}
