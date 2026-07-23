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

export async function apiGet(path) {
  const idToken = await getAnonymousIdToken();
  const response = await fetch(`${workerUrl}${path}`, {
    headers: { Authorization: `Bearer ${idToken}` }
  });

  return readResponse(response);
}

async function readResponse(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }
  return payload;
}
