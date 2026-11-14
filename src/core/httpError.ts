export class HttpError extends Error {
  constructor(
    readonly status: number,
    _message?: string,
  ) {
    super();
    throw new Error('HttpError: not implemented');
  }
}
