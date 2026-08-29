// Return SPA HTML at /room/:id with status 200. Follow asset redirects internally
// so Pages pretty-URL 308s on index.html never leak to the browser (they drop the id).
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const asset = await context.env.ASSETS.fetch(new URL('/', url.origin));
  const html = await asset.text();
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store'
    }
  });
}
