export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string = `HTTP error ${status}`,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
