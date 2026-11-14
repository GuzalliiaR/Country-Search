import { describe, it, expect } from 'vitest';
import { HttpError } from '../src/core/httpError.js';

describe('HttpError', () => {
  it('instance of Error and HttpError', () => {
    const err = new HttpError(500);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
  });

  it('stores the status code of the status', () => {
    const err = new HttpError(404);

    expect(err.status).toBe(404);
  });

  it('has name HttpError', () => {
    const err = new HttpError(404);

    expect(err.name).toBe('HttpError');
  });

  it('has default message with status code', () => {
    const err = new HttpError(500);

    expect(err.message).toBe('HTTP error 500');
  });

  it('returns the set message', () => {
    const err = new HttpError(500, 'Server is down');

    expect(err.message).toBe('Server is down');
  });
});
