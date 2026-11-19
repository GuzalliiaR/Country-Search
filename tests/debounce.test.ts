import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { debounce } from '../src/core/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a function', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 400);

    expect(typeof debounced).toBe('function');
  });

  it('does not return the result immediately', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 400);

    debounced();

    expect(mockFn).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(199);
    expect(mockFn).toHaveBeenCalledTimes(0);
  });

  it('will return the result after the delay', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 400);

    debounced();
    vi.advanceTimersByTime(400);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('reset timer on every call', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 400);

    debounced();
    vi.advanceTimersByTime(200);

    debounced();
    vi.advanceTimersByTime(300);

    debounced();
    vi.advanceTimersByTime(400);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('calls with last arguments', () => {
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 400);

    debounced('a');
    debounced('ab');
    debounced('abc');

    vi.advanceTimersByTime(400);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('abc');
  });
});
