export interface CountryCard {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string;
}
export function mapCountryResponse(_raw: unknown): CountryCard {
  throw new Error('Not implemented');
}
