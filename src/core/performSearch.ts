import { searchCountries } from './searchCountries';

const DEFAULT_TIMEOUT_MS = 5000;

export function performSearch(
  query: string,
  signal: AbortSignal,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<unknown[]> {
  const combinedSignal = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
  return searchCountries(query, combinedSignal);
}
