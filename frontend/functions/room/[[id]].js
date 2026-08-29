// Keep /room/:id as a 200. Never fetch *.html files that Pages pretty-URLs
// (room.html → /room, chat-shell.html → /chat-shell) or the id is stripped.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const asset = await context.env.ASSETS.fetch(
    new Request(new URL('/index.html', url.origin), { redirect: 'manual' })
  );
  const headers = new Headers(asset.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  headers.set('Cache-Control', 'no-store');
  headers.delete('Location');
  return new Response(asset.body, {
    status: 200,
    headers
  });
}
