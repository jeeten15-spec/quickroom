const SESSION_KEY = 'quickroom.interstitial-shown';

export const INTERSTITIAL_CLOSE_AFTER_MS = 4_000;
export const INTERSTITIAL_SAFETY_CONTINUE_MS = 12_000;

export function interstitialAlreadyShown(storage = globalThis.sessionStorage) {
  try {
    return storage?.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function markInterstitialShown(storage = globalThis.sessionStorage) {
  try {
    storage?.setItem(SESSION_KEY, '1');
  } catch {
    /* private mode */
  }
}

export function isMobileAdViewport(media = globalThis.matchMedia) {
  try {
    return Boolean(media?.('(max-width: 959px)')?.matches);
  } catch {
    return false;
  }
}

/** Create-room finish or public-room join on a phone, once per tab session, only if ads are allowed. */
export function shouldShowMobileInterstitial({
  isMobile,
  adsAllowed,
  alreadyShown
} = {}) {
  return Boolean(isMobile && adsAllowed && !alreadyShown);
}

export function renderInterstitialMarkup() {
  return `<div class="ad-interstitial" role="dialog" aria-modal="true" aria-labelledby="ad-interstitial-title" data-ad-interstitial>
    <p class="ad-interstitial-kicker" id="ad-interstitial-title">Advertisement</p>
    <p class="ad-interstitial-copy">Your room is ready. This short pause is shown once per visit on phones.</p>
    <aside class="iab-slot iab-slot-box ad-interstitial-slot" data-iab="box" aria-label="Advertisement"></aside>
    <button class="button button-primary ad-interstitial-close" type="button" data-ad-interstitial-close disabled>
      Continue in a few seconds
    </button>
  </div>`;
}

/**
 * Full-screen 300×250 before ChatRoom.mount. Close unlocks after 4s; continue is immediate.
 * Safety continue at 12s if the button is never used.
 */
export function presentMobileInterstitial({ adsAllowed, fillSlot } = {}) {
  if (typeof document === 'undefined') return Promise.resolve(false);
  const show = shouldShowMobileInterstitial({
    isMobile: isMobileAdViewport(),
    adsAllowed: Boolean(adsAllowed),
    alreadyShown: interstitialAlreadyShown()
  });
  if (!show) return Promise.resolve(false);

  markInterstitialShown();
  document.documentElement.dataset.adInterstitial = '1';
  const wrap = document.createElement('div');
  wrap.innerHTML = renderInterstitialMarkup();
  const overlay = wrap.firstElementChild;
  document.body.append(overlay);
  const slot = overlay.querySelector('[data-iab]');
  try {
    fillSlot?.(slot);
  } catch {
    /* room entry still proceeds */
  }

  return new Promise((resolve) => {
    let done = false;
    const closeBtn = overlay.querySelector('[data-ad-interstitial-close]');
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(unlockTimer);
      window.clearTimeout(safetyTimer);
      overlay.remove();
      delete document.documentElement.dataset.adInterstitial;
      resolve(true);
    };
    const unlockTimer = window.setTimeout(() => {
      if (!closeBtn) return;
      closeBtn.disabled = false;
      closeBtn.textContent = 'Continue to room';
    }, INTERSTITIAL_CLOSE_AFTER_MS);
    const safetyTimer = window.setTimeout(finish, INTERSTITIAL_SAFETY_CONTINUE_MS);
    closeBtn?.addEventListener('click', finish);
  });
}
