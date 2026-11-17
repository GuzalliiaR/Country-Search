import { HttpError } from './httpError.js';
export async function searchCountries(query, signal) {
    const response = await fetch(`https://countries.dev/name/${encodeURIComponent(query)}`, { signal });
    // 404 и response.ok=false означает что совпадений нет - это не ошибка
    if (response.status === 404)
        return [];
    // все остальные со статусом вне 200-299 - настоящие ошибки
    if (!response.ok)
        throw new HttpError(response.status);
    const data = await response.json();
    return data;
}
//# sourceMappingURL=searchCountries.js.map