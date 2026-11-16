import { mapCountryResponse } from './mapCountryResponse.js';
const rawSpain = {
    name: 'Spain',
    capital: 'Madrid',
    region: 'Europe',
    population: 47351567,
    flag: '🇪🇸',
    languages: [{ name: 'Spanish' }],
};
describe('mapCountryResponse', () => {
    it('преобразует полный ответ API в данные для карточки', () => {
        const result = mapCountryResponse(rawSpain);
        expect(result).toEqual({
            name: 'Spain',
            flag: '🇪🇸',
            capital: 'Madrid',
            region: 'Europe',
            population: 47351567,
            languages: 'Spanish',
        });
    });
    it('склеивает несколько языков через запятую', () => {
        const raw = {
            ...rawSpain,
            languages: [{ name: 'Spanish' }, { name: 'Catalan' }, { name: 'Galician' }],
        };
        const result = mapCountryResponse(raw);
        expect(result.languages).toBe('Spanish, Catalan, Galician');
    });
    it('возвращает пустую строку для языков, если их нет', () => {
        const raw = { ...rawSpain, languages: [] };
        const result = mapCountryResponse(raw);
        expect(result.languages).toBe('');
    });
    it('возвращает пустую строку для языков, если поле отсутствует', () => {
        const { languages: _ignored, ...rawWithoutLanguages } = rawSpain;
        const result = mapCountryResponse(rawWithoutLanguages);
        expect(result.languages).toBe('');
    });
    it('возвращает пустую строку для столицы, если её нет', () => {
        const raw = { ...rawSpain, capital: undefined };
        const result = mapCountryResponse(raw);
        expect(result.capital).toBe('');
    });
    it('не падает и возвращает 0 для отсутствующего населения', () => {
        const { population: _ignored, ...raw } = rawSpain;
        const result = mapCountryResponse(raw);
        expect(result.population).toBe(0);
    });
    it('результат является новым объектом, не мутирует вход', () => {
        const input = { ...rawSpain };
        const snapshot = JSON.parse(JSON.stringify(input));
        const result = mapCountryResponse(input);
        expect(result).not.toBe(input);
        expect(input).toEqual(snapshot);
    });
});
//# sourceMappingURL=mapCountryResponse.test.js.map