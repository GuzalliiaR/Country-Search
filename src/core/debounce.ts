export function debounce<Args extends unknown[]>(
  _fn: (...args: Args) => void,
  _delay: number,
): () => void {
  return () => {};
}
