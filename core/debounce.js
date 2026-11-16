export function debounce(fn, delay) {
    let timerId = null;
    return function debounced(...args) {
        if (timerId !== null) {
            clearInterval(timerId);
        }
        timerId = setTimeout(() => {
            timerId = null;
            fn.apply(this, args);
        }, delay);
    };
}
//# sourceMappingURL=debounce.js.map