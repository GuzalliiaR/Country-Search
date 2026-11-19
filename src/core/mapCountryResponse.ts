import type {
  RawCountry,
  Country,
  Currency,
  Coordinates,
  Language,
} from './types.js';

export function mapCountryResponse(raw: RawCountry): Country {
  let flagUrl: string = '';
  let coordinates: Coordinates | null = null;
  let languages: Language[] = [];
  let currencies: Currency[] = [];

  if (raw.flags) {
    flagUrl = raw.flags.svg ?? raw.flags.png ?? '';
  }

  if (raw.latlng && raw.latlng.length === 2) {
    coordinates = { lat: raw.latlng[0], lng: raw.latlng[1] };
  }

  if (raw.languages) {
    languages = raw.languages.map((lang) => {
      return { name: lang.name ?? '', nativeName: lang.nativeName ?? '' };
    });
  }

  if (raw.currencies) {
    currencies = raw.currencies.map((currency) => {
      return {
        code: currency.code ?? '',
        name: currency.name ?? '',
        symbol: currency.symbol ?? '',
      };
    });
  }

  const result = {
    name: raw.name,
    flagUrl: flagUrl,
    capital: raw.capital ?? '',
    region: raw.region ?? '',
    subregion: raw.subregion ?? '',
    population: raw.population ?? 0,
    area: raw.area ?? null,
    coordinates: coordinates,
    borders: [...(raw.borders ?? [])],
    timezones: [...(raw.timezones ?? [])],
    languages: languages,
    currencies: currencies,
  };

  return result;
}
