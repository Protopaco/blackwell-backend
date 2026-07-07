export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnprocessableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnprocessableError';
  }
}
