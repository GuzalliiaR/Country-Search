import { debounce } from './debounce.js';
import { searchCountries } from './searchCountries.js';
import { mapCountryResponse } from './mapCountryResponse.js';
import { HttpError } from './httpError.js';
export default function createSearchController(onResult, onError, timeoutMs = 8000) {
    let controller = null;
    let requestId = 0;
    async function run(query, id) {
        controller = new AbortController();
        const { signal } = controller;
        // Компановка двух источников для AbortSignal в один:
        //  - controller?.abort() - отмена запроса из-за нового ввода (ошибка приходит как DOMException с name === 'AbortError')
        //  - AbortSignal.timeout(ms) - отмена запроса из-за отсутствия ответа долгое время (ошибка приходит как DOMException с name === 'TimeoutError')
        const composed = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
        try {
            const rawData = await searchCountries(query, composed);
            // проверяем устарел ли ответ от сервера, если да, то onResult(data) не выполняем
            if (id !== requestId)
                return;
            const data = rawData.map((countryObj) => mapCountryResponse(countryObj));
            onResult(data);
        }
        catch (error) {
            // проверяем устарел ли ответ от сервера, если да, то не выполняем никакой из сценариев в catch
            if (id !== requestId)
                return;
            if (error instanceof DOMException && error.name === 'AbortError')
                return;
            if (error instanceof DOMException && error.name === 'TimeoutError') {
                onError('Превышено время ожидания ответа сервера ⌛');
                return;
            }
            if (error instanceof HttpError) {
                onError(`Произошла ошибка сервера, статус ошибки: ${error.status}`);
                return;
            }
            // Выброс ошибки, если она вызвана не в searchCountries (нет сети, DNS, CORS, прерванное соединение, баг в UI-рендере onResult(...))
            throw error;
        }
    }
    const delayedFn = (query) => {
        // отмена выполнения запроса к серверу при каждом изменении ввода после ожидания времени delay
        controller?.abort();
        if (query.trim() === '') {
            onResult([]);
            return;
        }
        run(query, requestId);
    };
    // возвращает выполнение фун-ции delayedFn через 500 мс после вызова debouncedRun(query)
    const debouncedRun = debounce(delayedFn, 500);
    return {
        onInput(query) {
            controller?.abort(); // отмена запроса при каждом изменении ввода, не только в момент когда debounce запускает новый сетевой запрос
            requestId += 1;
            debouncedRun(query);
        },
    };
}
//# sourceMappingURL=searchController.js.map