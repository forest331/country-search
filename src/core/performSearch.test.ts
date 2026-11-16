import { performSearch } from './performSearch.js';
import { HttpError } from './searchCountries.js';

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('performSearch', () => {
  const controller = new AbortController();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('возвращает данные при успешном запросе', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse([{ name: 'Spain' }], 200));

    const result = await performSearch('spain', controller.signal);

    expect(result).toEqual([{ name: 'Spain' }]);
  });

  it('возвращает пустой массив при 404 (не ошибка)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse({ error: 'Not found' }, 404));

    const result = await performSearch('qwerty', controller.signal);

    expect(result).toEqual([]);
  });

  it('бросает TimeoutError при истечении таймаута', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            // Эмулируем поведение AbortSignal.timeout
            reject(new DOMException('The operation was aborted due to timeout', 'TimeoutError'));
          });
        }),
    );

    await expect(performSearch('spain', controller.signal, 10)).rejects.toThrow(
      expect.objectContaining({ name: 'TimeoutError' }),
    );
  });

  it('не бросает ошибку при AbortError от пользователя', async () => {
    const userController = new AbortController();

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const promise = performSearch('spain', userController.signal);
    userController.abort();

    await expect(promise).rejects.toThrow(expect.objectContaining({ name: 'AbortError' }));
  });

  it('бросает HttpError при статусе 500', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse({ error: 'Server error' }, 500));

    await expect(performSearch('spain', controller.signal)).rejects.toThrow(HttpError);
  });

  it('использует AbortSignal.any для комбинирования сигналов', async () => {
    const anySpy = vi.spyOn(AbortSignal, 'any');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse([], 200));

    await performSearch('spain', controller.signal, 5000);

    expect(anySpy).toHaveBeenCalled();
  });
});
