/**
 * QuickRoom frontend entry point.
 *
 * The UI intentionally begins in the next implementation phase. It will call
 * only this application's Worker under `/api`; it must never access Firebase
 * Realtime Database or Storage directly.
 */

const app = document.querySelector('#app');

if (!app) {
  throw new Error('QuickRoom app root was not found.');
}
