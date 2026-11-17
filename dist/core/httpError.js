export class HttpError extends Error {
    status;
    constructor(status, message = `HTTP error ${status}`) {
        super(message);
        this.status = status;
        this.name = 'HttpError';
        this.status = status;
    }
}
//# sourceMappingURL=httpError.js.map