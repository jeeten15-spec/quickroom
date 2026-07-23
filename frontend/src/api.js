import { getAnonymousIdToken } from './auth';

const workerUrl = import.meta.env.VITE_WORKER_URL?.replace(/\/$/, '') ?? '';

export async function apiRequest(path, body) {
  const idToken = await getAnonymousIdToken();
  const response = await fetch(`${workerUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return readResponse(response);
}

async function readResponse(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || 'Something went wrong. Please try again.');
  }
  return payload;
}
