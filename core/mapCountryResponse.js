export function mapCountryResponse(raw) {
    const country = (raw ?? {});
    return {
        name: country.name ?? '',
        flag: country.flag ?? '',
        capital: country.capital ?? '',
        region: country.region ?? '',
        population: country.population ?? 0,
        languages: (country.languages ?? [])
            .map((lang) => lang.name)
            .filter((name) => typeof name === 'string' && name.length > 0)
            .join(', '),
    };
}
//# sourceMappingURL=mapCountryResponse.js.map