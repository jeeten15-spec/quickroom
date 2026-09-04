/** QuickRoom AdSense publisher. Env can override; production always has this fallback. */
export const ADSENSE_CLIENT = 'ca-pub-2208705874716134';
export const ADSENSE_ADS_TXT = 'google.com, pub-2208705874716134, DIRECT, f08c47fec0942fa0\n';

/**
 * Home (`/` and `/fr`) IAB placeholder frames. Keep false until AdSense is approved
 * so empty grey boxes do not sit next to Create/Join. Rails, leader, footer, and
 * in-content 300×250 for those views stay in code — set this to true to restore them.
 * ads.txt, the head script, and the google-adsense-account meta stay on regardless.
 */
export const ADSENSE_HOME_PLACEHOLDERS = false;

function viteEnv(key) {
  try {
    return import.meta.env?.[key];
  } catch {
    return undefined;
  }
}

export function adsenseClientId() {
  return String(viteEnv('VITE_ADSENSE_CLIENT') || ADSENSE_CLIENT).trim() || ADSENSE_CLIENT;
}

export function adsenseHeadHtml() {
  const client = adsenseClientId();
  return `    <meta name="google-adsense-account" content="${client}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`;
}
