export class AvClientError extends Error {
  public code: number;
  public statusCode: number;

  constructor(message: string, code = 0, statusCode = 0) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    // this is mandatory due:
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, AvClientError.prototype);
  }
}

export class AccessCodeInvalid extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AccessCodeInvalid.prototype);
    this.name = "AccessCodeInvalid";
  }
}

export class AccessCodeExpired extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AccessCodeExpired.prototype);
    this.name = "AccessCodeExpired";
  }
}

export class NetworkError extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkError.prototype);
    this.name = "NetworkError";
  }
}

export class InvalidConfigError extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidConfigError.prototype);
    this.name = "InvalidConfigError";
  }
}

export class InvalidStateError extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidStateError.prototype);
    this.name = "InvalidStateError";
  }
}

export class BulletinBoardError extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BulletinBoardError.prototype);
    this.name = "BulletinBoardError";
  }
}

export class EmailDoesNotMatchVoterRecordError extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EmailDoesNotMatchVoterRecordError.prototype);
    this.name = "EmailDoesNotMatchVoterRecordError";
  }
}

export class UnsupportedServerReplyError extends AvClientError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnsupportedServerReplyError.prototype);
    this.name = "UnsupportedServerReplyError";
  }
}
