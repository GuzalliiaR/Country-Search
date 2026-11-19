export interface RawLanguage {
  readonly name?: string;
  readonly iso639_1?: string;
  readonly iso639_2?: string;
  readonly nativeName?: string;
}

export interface RawCurrency {
  readonly code?: string;
  readonly name?: string;
  readonly symbol?: string;
}

export interface RawFlags {
  readonly png?: string;
  readonly svg?: string;
}

export interface RawCountry {
  readonly name: string;
  readonly capital?: string;
  readonly region?: string;
  readonly flags?: RawFlags;
  readonly population?: number;

  readonly subregion?: string;
  readonly latlng?: number[];
  readonly area?: number;
  readonly borders?: string[];
  readonly languages?: RawLanguage[];
  readonly currencies?: RawCurrency[];
  readonly timezones?: string[];
}

export interface Coordinates {
  readonly lat: number;
  readonly lng: number;
}

export interface Language {
  readonly name: string;
  readonly nativeName: string;
}

export interface Currency {
  readonly code: string;
  readonly name: string;
  readonly symbol: string;
}

export interface Country {
  readonly name: string;
  readonly flagUrl: string; // svg or png
  readonly capital: string;
  readonly region: string;
  readonly subregion: string;
  readonly population: number;
  readonly area: number | null;
  readonly coordinates: Coordinates | null;
  readonly borders: readonly string[];
  readonly timezones: readonly string[];
  readonly languages: readonly Language[];
  readonly currencies: readonly Currency[];
}
