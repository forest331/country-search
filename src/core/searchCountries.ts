const API_BASE = 'https://countries.dev';

export class HttpError extends Error {
  constructor(public readonly status: number) {
    super(`Http error ${status}`);
    this.name = 'HttpError';
  }
}

export async function searchCountries(query: string, signal: AbortSignal): Promise<unknown[]> {
  const url = `${API_BASE}/name/${encodeURIComponent(query)}`;

  const response = await fetch(url, { signal });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new HttpError(response.status);
  }

  return response.json() as Promise<unknown[]>;
}
