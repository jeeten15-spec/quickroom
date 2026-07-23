import { getAnonymousIdToken } from './auth';

const workerUrl = import.meta.env.VITE_WORKER_URL?.replace(/\/$/, '') ?? '';

export async function apiRequest(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function apiGet(path) {
  return request(path);
}

async function request(path, options = {}) {
  const idToken = await getAnonymousIdToken();
  try {
    const response = await fetch(`${workerUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${idToken}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {})
      }
    });

    return readResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach QuickRoom. Check your connection and try again.');
    }
    throw error;
  }
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
