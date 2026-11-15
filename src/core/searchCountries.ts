import type { RawCountry } from './types.js';

export function searchCountries(
  _query: string,
  _signal: AbortSignal,
): Promise<RawCountry[]> {
  throw new Error('searchCountries: not implemented');
}
