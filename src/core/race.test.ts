import { performSearch } from './performSearch';

interface PendingRequest {
  query: string;
  resolve: (value: Response) => void;
  reject: (reason: unknown) => void;
  signal: AbortSignal | undefined;
}

function createControlledFetch() {
  const pending: PendingRequest[] = [];

  const mockFetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    return new Promise<Response>((resolve, reject) => {
      const query = String(input);
      const signal = init?.signal ?? undefined;

      signal?.addEventListener(
        'abort',
        () => {
          reject(new DOMException('The operation was aborted', 'AbortError'));
        },
        { once: true },
      );

      pending.push({ query, resolve, reject, signal });
    });
  });

  return { mockFetch, pending };
}

describe('Отмена устаревших запросов (гонка)', () => {
  beforeEach(() => {
    vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => new AbortController().signal);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('реально отменяет предыдущий запрос и не даёт устаревшему ответу перезаписать результат', async () => {
    const { mockFetch, pending } = createControlledFetch();
    vi.spyOn(globalThis, 'fetch').mockImplementation(mockFetch);

    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const firstPromise = performSearch('sp', controller1.signal);
    const secondPromise = performSearch('spain', controller2.signal);

    const firstAssertion = expect(firstPromise).rejects.toMatchObject({
      name: 'AbortError',
    });
    const secondHandled = secondPromise.catch((e) => e);

    controller1.abort();

    await firstAssertion;
    expect(pending[0]?.signal?.aborted).toBe(true);

    const spainResponse = new Response(JSON.stringify([{ name: 'Spain' }]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    pending[1]?.resolve(spainResponse);

    const secondResult = await secondHandled;
    expect(secondResult).toEqual([{ name: 'Spain' }]);
  });
});
