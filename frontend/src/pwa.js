export function registerPwa() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      const registration = await navigator.serviceWorker.ready;
      const appAssets = performance
        .getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((url) => new URL(url).origin === window.location.origin);
      registration.active?.postMessage({ type: 'CACHE_ASSETS', urls: appAssets });
    } catch {
      // The application remains fully usable when service workers are unavailable.
    }
  });
}
