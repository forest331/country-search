const API_BASE = 'https://countries.dev';
export class HttpError extends Error {
    status;
    constructor(status) {
        super(`Http error ${status}`);
        this.status = status;
        this.name = 'HttpError';
    }
}
export async function searchCountries(query, signal) {
    const url = `${API_BASE}/name/${encodeURIComponent(query)}`;
    const response = await fetch(url, { signal });
    if (response.status === 404) {
        return [];
    }
    if (!response.ok) {
        throw new HttpError(response.status);
    }
    return response.json();
}
//# sourceMappingURL=searchCountries.js.map