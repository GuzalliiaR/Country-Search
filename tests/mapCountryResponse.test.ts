import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from '../src/core/mapCountryResponse.js';
import rawCountries from './fixtures/country-brazil.json';

const rawCountryInfo = rawCountries[0];
const minimalInfo = { name: 'Antarctica' };

describe('mapCountryResponse', () => {
  it('should return an object', () => {
    const mapCountry = mapCountryResponse(rawCountryInfo);

    expect(mapCountry).not.toBeNull();
    expect(typeof mapCountry).toBe('object');
  });

  it('should return the correct object for the complete data', () => {
    const mapCountry = mapCountryResponse(rawCountryInfo);

    expect(mapCountry).toStrictEqual({
      name: 'Brazil',
      flagUrl: 'https://flagcdn.com/br.svg',
      capital: 'Brasília',
      region: 'Americas',
      subregion: 'South America',
      population: 212559409,
      area: 8515767,
      coordinates: { lat: -10, lng: -55 },
      borders: [
        'ARG',
        'BOL',
        'COL',
        'FRA',
        'GUF',
        'GUY',
        'PRY',
        'PER',
        'SUR',
        'URY',
        'VEN',
      ],
      timezones: ['UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00'],
      languages: [{ name: 'Portuguese', nativeName: 'Português' }],
      currencies: [{ code: 'BRL', name: 'Brazilian real', symbol: 'R$' }],
    });
  });

  it('should return the correct object for the incomplete data', () => {
    const mapCountry = mapCountryResponse(minimalInfo);

    expect(mapCountry).toStrictEqual({
      name: 'Antarctica',
      flagUrl: '',
      capital: '',
      region: '',
      subregion: '',
      population: 0,
      area: null,
      coordinates: null,
      borders: [],
      timezones: [],
      languages: [],
      currencies: [],
    });
  });

  it('back to png when svg is missing', () => {
    const pngOnly = { name: 'X', flags: { png: 'x.png' } };
    expect(mapCountryResponse(pngOnly).flagUrl).toBe('x.png');
  });

  it('does not mutate the input data', () => {
    const input = structuredClone(rawCountryInfo);
    const snapshot = structuredClone(rawCountryInfo);
    mapCountryResponse(input);

    expect(input).toStrictEqual(snapshot);
  });

  it('uses deep array copying', () => {
    const mapCountry = mapCountryResponse(rawCountryInfo);

    expect(mapCountry.borders).not.toBe(rawCountryInfo.borders);
    expect(mapCountry.currencies).not.toBe(rawCountryInfo.currencies);
  });
});
