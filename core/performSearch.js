import { searchCountries } from './searchCountries.js';
const DEFAULT_TIMEOUT_MS = 5000;
export async function performSearch(query, signal, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const combinedSignal = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
    return searchCountries(query, combinedSignal);
}
//# sourceMappingURL=performSearch.js.map