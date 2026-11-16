import { searchCountries, HttpError } from './searchCountries.js';

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('searchCountries', () => {
  const controller = new AbortController();
  const signal = controller.signal;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('возвращает массив стран при успешном ответе', async () => {
    const rawCountries = [{ name: { common: 'Spain' } }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse(rawCountries, 200));

    const result = await searchCountries('spain', signal);

    expect(result).toEqual(rawCountries);
  });

  it('возвращает пустой массив при статусе 404 (нет совпадений)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse({ error: 'Not found' }, 404));

    const result = await searchCountries('qwerty', signal);

    expect(result).toEqual([]);
  });

  it('бросает HttpError при статусе 500', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockResponse({ error: 'Internal server error' }, 500),
    );

    await expect(searchCountries('spain', signal)).rejects.toThrow(HttpError);
  });

  it('HttpError содержит статус ответа', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse({ error: 'Server error' }, 503));

    try {
      await searchCountries('spain', signal);
      expect.fail('Должен был быть брошен HttpError');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(503);
    }
  });

  it('передаёт AbortSignal в fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse([], 200));

    await searchCountries('spain', signal);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/name/spain'),
      expect.objectContaining({ signal }),
    );
  });

  it('кодирует запрос через encodeURIComponent', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse([], 200));

    await searchCountries('south k', signal);

    const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('south%20k');
  });
});
