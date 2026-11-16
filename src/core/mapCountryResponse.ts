export interface CountryCard {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string;
}

interface RawCountry {
  name?: string;
  flag?: string;
  capital?: string;
  region?: string;
  population?: number;
  languages?: Array<{ name?: string }>;
}
export function mapCountryResponse(raw: unknown): CountryCard {
  const country = (raw ?? {}) as RawCountry;

  return {
    name: country.name ?? '',
    flag: country.flag ?? '',
    capital: country.capital ?? '',
    region: country.region ?? '',
    population: country.population ?? 0,
    languages: (country.languages ?? [])
      .map((lang) => lang.name)
      .filter((name): name is string => typeof name === 'string' && name.length > 0)
      .join(', '),
  };
}
