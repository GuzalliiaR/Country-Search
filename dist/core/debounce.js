export function debounce(fn, delay) {
    let timeoutId = null;
    return (...args) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}
//# sourceMappingURL=debounce.js.map