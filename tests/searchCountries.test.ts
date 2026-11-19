import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from '../src/core/searchCountries.js';
import { HttpError } from '../src/core/httpError.js';

const BRAZIL = { name: 'Brazil' };

describe('searchCountries', () => {
  const mockFetch = vi.fn();
  const { signal } = new AbortController();

  beforeEach(() => {
    // Подменяем глобальный fetch на мок-функцию
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    // Возвращаем оригинальный fetch после каждого теста
    vi.unstubAllGlobals();
    // Сброс мок-fetch
    mockFetch.mockReset();
  });

  it('requests the correct URL and passes the signal', async () => {
    // Настройка мок-fetch
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([BRAZIL]),
    });

    await searchCountries('bra', signal);
    expect(mockFetch).toHaveBeenCalledWith(
      `https://countries.dev/name/${encodeURIComponent('bra')}`,
      { signal },
    );
  });

  it('returns the list of countries in case of success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([BRAZIL]),
    });

    const resultPromise = searchCountries('bra', signal);
    await expect(resultPromise).resolves.toEqual([BRAZIL]);
  });

  it('returns an empty array and not throw an error when the status is 404', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve([]),
    });

    const resultPromise = searchCountries('nonExistentCountry', signal);
    await expect(resultPromise).resolves.toEqual([]);
  });

  it('throws HttpError when the status is 500', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    // Вызываем функцию и ЛОВИМ ошибку(ч/з catch), чтобы тест не упал
    const error = await searchCountries('bra', signal).catch((err) => err);

    expect(error).toBeInstanceOf(HttpError);
    // toMatchObject - проверяет, что объект частично совпадает с ожидаемым
    expect(error).toMatchObject({ status: 500 });
  });

  it('rethrows AbortError instead of swallowing it', async () => {
    // настройка мок fetch так, чтобы он отклонился при вызове
    // эмулируем ситуацию, когда пользователь отменил запрос
    mockFetch.mockRejectedValue(
      new DOMException('The request was cancelled by the user', 'AbortError'),
    );

    const resultPromise = searchCountries('bra', signal);
    // проверка, что у полученной ошибки есть свойство name = 'AbortError'
    await expect(resultPromise).rejects.toHaveProperty('name', 'AbortError');
  });

  it('rethrows TimeoutError instead of swallowing it', async () => {
    mockFetch.mockRejectedValue(
      new DOMException('The operation timed out.', 'TimeoutError'),
    );
    const resultPromise = searchCountries('bra', signal);
    await expect(resultPromise).rejects.toHaveProperty('name', 'TimeoutError');
  });
});
