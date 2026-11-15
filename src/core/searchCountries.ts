export class HttpError extends Error {
  constructor(public readonly status: number) {
    super(`Http error ${status}`);
    this.name = 'HttpError';
  }
}

export async function searchCountries(_query: string, _signal: AbortSignal): Promise<unknown[]> {
  throw new Error('not implemented');
}
