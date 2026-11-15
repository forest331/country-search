export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  return function debounced(this: unknown, ...args: Parameters<T>) {
    if (timerId !== null) {
      clearInterval(timerId);
    }

    timerId = setTimeout(() => {
      timerId = null;
      fn.apply(this, args);
    }, delay);
  } as T;
}
