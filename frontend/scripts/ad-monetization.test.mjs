import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INTERSTITIAL_CLOSE_AFTER_MS,
  shouldShowMobileInterstitial
} from '../src/interstitial.js';
import { ADSTERRA, bannerRefreshDelayMs, chatControlsAreActive } from '../src/adsterra.js';

describe('mobile interstitial gate', () => {
  it('shows once on mobile when ads are allowed', () => {
    assert.equal(
      shouldShowMobileInterstitial({ isMobile: true, adsAllowed: true, alreadyShown: false }),
      true
    );
  });

  it('skips desktop, opted-out ads, and a second show in the same session', () => {
    assert.equal(
      shouldShowMobileInterstitial({ isMobile: false, adsAllowed: true, alreadyShown: false }),
      false
    );
    assert.equal(
      shouldShowMobileInterstitial({ isMobile: true, adsAllowed: false, alreadyShown: false }),
      false
    );
    assert.equal(
      shouldShowMobileInterstitial({ isMobile: true, adsAllowed: true, alreadyShown: true }),
      false
    );
  });

  it('unlocks the close control between 3 and 5 seconds', () => {
    assert.ok(INTERSTITIAL_CLOSE_AFTER_MS >= 3_000);
    assert.ok(INTERSTITIAL_CLOSE_AFTER_MS <= 5_000);
  });
});

describe('banner refresh timing', () => {
  it('stays in the 60–90 second window', () => {
    for (let i = 0; i < 40; i += 1) {
      const ms = bannerRefreshDelayMs(() => 0.5);
      assert.ok(ms >= 60_000 && ms <= 90_000, String(ms));
    }
    assert.equal(bannerRefreshDelayMs(() => 0), 60_000);
    assert.equal(bannerRefreshDelayMs(() => 0.999), 89_970);
  });

  it('uses the real 320×50 Adsterra zone on mobile', () => {
    assert.equal(ADSTERRA.mobile.key, '231c5d8e0023ea517cb0c057c290a85b');
    assert.equal(ADSTERRA.mobile.width, 320);
    assert.equal(ADSTERRA.mobile.height, 50);
  });
});

describe('chat control protection', () => {
  it('does not treat empty documents as active chat typing', () => {
    assert.equal(chatControlsAreActive({ activeElement: null, body: null }), false);
  });

  it('skips a refresh cycle while the composer or a chat button is focused', () => {
    const composer = { closest: (sel) => (sel === '.chat-page' ? {} : null), tagName: 'TEXTAREA' };
    const send = { closest: (sel) => (sel === '.chat-page' ? {} : null), tagName: 'BUTTON' };
    const outside = { closest: () => null, tagName: 'A' };
    assert.equal(chatControlsAreActive({ activeElement: composer }), true);
    assert.equal(chatControlsAreActive({ activeElement: send }), true);
    assert.equal(chatControlsAreActive({ activeElement: outside }), false);
  });
});
