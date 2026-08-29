import { defineConfig } from 'vite';
import { adsenseHeadHtml } from './src/adsense.js';

export default defineConfig({
  plugins: [
    {
      name: 'quickroom-html-meta',
      transformIndexHtml(html) {
        const gsc = process.env.VITE_GOOGLE_SITE_VERIFICATION || '';
        const gscTag = gsc
          ? `<meta name="google-site-verification" content="${gsc.replace(/"/g, '')}" />`
          : '';
        const adsense = html.includes('google-adsense-account') ? '' : adsenseHeadHtml();
        return html.replace('</head>', `    ${gscTag}\n${adsense}\n  </head>`);
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
