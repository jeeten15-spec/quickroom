/** Always serve ads.txt as 200 text/plain so AdSense does not see an SPA/HTML 404. */
const BODY = 'google.com, pub-2208705874716134, DIRECT, f08c47fec0942fa0\n';

export function onRequest() {
  return new Response(BODY, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300, must-revalidate',
      'access-control-allow-origin': '*',
      'x-content-type-options': 'nosniff'
    }
  });
}
