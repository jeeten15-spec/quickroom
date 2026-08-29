import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'quickroom-html-meta',
      transformIndexHtml(html) {
        const gsc = process.env.VITE_GOOGLE_SITE_VERIFICATION || '';
        const extra = gsc
          ? `<meta name="google-site-verification" content="${gsc.replace(/"/g, '')}" />`
          : '';
        const tag =
          '<script src="https://quge5.com/88/tag.min.js" data-zone="274291" async data-cfasync="false"></script>';
        let next = html.includes('quge5.com/88/tag.min.js')
          ? html
          : html.replace('<head>', `<head>\n    ${tag}`);
        return next.replace('</head>', `    ${extra}\n  </head>`);
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_WORKER_URL || 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  }
});
