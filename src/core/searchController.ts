import type { Country } from './types.js';

export default function createSearchController(
  _onResult: (countries: Country[]) => void,
  _onError: (message: string) => void,
  _timeoutMs = 8000,
) {
  return {
    onInput(_query: string): void {
      throw new Error('createSearchController: not implemented');
    },
  };
}
