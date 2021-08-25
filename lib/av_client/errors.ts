export class AvClientError extends Error {
  public code: number;
  public statusCode: number;

  constructor(message: string, code: number = 0, statusCode: number = 0) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    // this is mandatory due:
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, AvClientError.prototype);
    this.setUpStackTrace();
  }

  protected setUpStackTrace() {
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AccessCodeInvalid extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AccessCodeInvalid.prototype);
    this.setUpStackTrace();
  }
}

export class AccessCodeExpired extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AccessCodeExpired.prototype);
    this.setUpStackTrace();
  }
}

export class NetworkError extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkError.prototype);
    this.setUpStackTrace();
  }
}
