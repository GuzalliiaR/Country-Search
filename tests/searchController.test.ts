import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import createSearchController from '../src/core/searchController.js';
import type { Country, RawCountry } from '../src/core/types.js';

const BRAZIL_RAW: RawCountry = {
  name: 'Brazil',
  capital: 'Brasília',
  region: 'Americas',
  population: 212559409,
  flags: { svg: 'br.svg' },
};

describe('createSearchController', () => {
  const mockFetch = vi.fn();
  let onResult: Mock<(countries: Country[]) => void>;
  let onError: Mock<(message: string) => void>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset(); // Сброс мок-fetch
    vi.stubGlobal('fetch', mockFetch); // Подменяем глобальный fetch на мок-функцию
    onResult = vi.fn();
    onError = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // Возвращаем оригинальный fetch после каждого теста
    vi.useRealTimers(); // Возвращаем реальное время
  });

  it('return an object with the onInput method', () => {
    const controller = createSearchController(onResult, onError);

    expect(typeof controller.onInput).toBe('function');
  });

  it('waits for the debounce delay before requesting', async () => {
    // Настройка мок-fetch
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([BRAZIL_RAW]),
    });
    const controller = createSearchController(onResult, onError);

    controller.onInput('b');
    expect(mockFetch).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(200);
    expect(mockFetch).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(300);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('clears the results for an empty query without requesting', () => {
    const controller = createSearchController(onResult, onError);

    controller.onInput('    ');
    vi.advanceTimersByTime(500);

    expect(onResult).toHaveBeenCalledWith([]);
    expect(mockFetch).toHaveBeenCalledTimes(0);
  });

  it('maps the response and passes it to onResult', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([BRAZIL_RAW]),
    });
    const controller = createSearchController(onResult, onError);

    controller.onInput('bra');
    await vi.advanceTimersByTimeAsync(500);

    expect(onResult).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Brazil',
        flagUrl: 'br.svg',
        region: 'Americas',
      }),
    ]);
    expect(onError).toHaveBeenCalledTimes(0);
  });

  it('reports a server error with status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const controller = createSearchController(onResult, onError);

    controller.onInput('bra');
    await vi.advanceTimersByTimeAsync(500);

    // Проверка, что вызван onError с строкой в аргументах, в которой указан status 500
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('500'));
    expect(onResult).toHaveBeenCalledTimes(0);
  });

  it('ignores an AbortError from fetch', async () => {
    // настройка мок fetch так, чтобы он отклонился при вызове
    // эмулируем ситуацию, когда пользователь отменил запрос
    mockFetch.mockRejectedValue(
      new DOMException('The request was cancelled by the user', 'AbortError'),
    );
    const controller = createSearchController(onResult, onError);

    controller.onInput('bra');
    await vi.advanceTimersByTimeAsync(500);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledTimes(0);
  });

  it('if the server response time is exceeded, it returns an error', async () => {
    mockFetch.mockRejectedValue(
      new DOMException('The operation timed out', 'TimeoutError'),
    );
    const controller = createSearchController(onResult, onError);

    controller.onInput('bra');
    await vi.advanceTimersByTimeAsync(500);

    expect(onResult).toHaveBeenCalledTimes(0);
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('Превышено время ожидания ответа сервера'),
    );
  });
});
