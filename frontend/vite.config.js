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
        return html.replace('</head>', `    ${extra}\n  </head>`);
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
