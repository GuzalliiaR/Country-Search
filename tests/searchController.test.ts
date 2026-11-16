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

function okResponse(body: RawCountry[]) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

describe('test on race of requests in createSearchController', () => {
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

  it('aborts the previous request when a new query arrives', async () => {
    const signals: AbortSignal[] = [];
    const rejections: DOMException[] = [];

    mockFetch.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signals.push(init.signal); // Сохраняем сигнал
          init.signal.addEventListener(
            'abort',
            () => {
              rejections.push(init.signal.reason as DOMException); // Сохраняем ошибку отмены
              reject(init.signal.reason); // Отклоняем промис (как это делает реальный fetch)
            },
            { once: true },
          );
        }),
    );

    const controller = createSearchController(onResult, onError);

    controller.onInput('br');
    await vi.advanceTimersByTimeAsync(500); // Ждем 500мс (срабатывает дебаунс)
    expect(signals[0].aborted).toBe(false); // Проверяем, что запрос ('br') ушел и он НЕ отменен
    expect(rejections).toHaveLength(0); // Ошибки отмены не было

    controller.onInput('bra');
    await vi.advanceTimersByTimeAsync(0); // Прокручиваем 0мс (просто ждем микрозадачи)

    expect(signals[0].aborted).toBe(true); // Старый запрос ('br') отменен
    expect(rejections).toHaveLength(1); // Ошибка отмены зафиксирована
    expect(rejections[0].name).toBe('AbortError'); // Это именно AbortError

    expect(onResult).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('ignores a stale response that arrives after a newer one', async () => {
    const pending: Array<{ resolve: (value: unknown) => void }> = [];

    mockFetch.mockImplementation(() => {
      return new Promise((resolve) => {
        pending.push({ resolve }); // Сохраняем функцию resolve, чтобы вызвать её позже вручную
      });
    });

    const controller = createSearchController(onResult, onError);

    controller.onInput('xyz'); // Запрос №1
    await vi.advanceTimersByTimeAsync(500); // ушел запрос №1 ушел первым

    controller.onInput('bra'); // Запрос №2
    await vi.advanceTimersByTimeAsync(500); // ушел запрос №2 ушел вторым

    pending[1].resolve(okResponse([{ name: 'Brazil' }])); // быстрый запрос №2 ответил первым (перевод промиса в состояние "выполнено")
    await vi.advanceTimersByTimeAsync(0); // Прокрутка  на 0 мс + Именно в этот момент выполнится код, который ждал разрешения промиса pending[1]

    pending[0].resolve(okResponse([{ name: 'Stale' }])); // медленный запрос №1 ответил позже
    await vi.advanceTimersByTimeAsync(0);

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Brazil' }),
    ]);
  });
});
