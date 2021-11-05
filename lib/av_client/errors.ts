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
  readonly name = "AccessCodeInvalid";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AccessCodeInvalid.prototype);
  }
}

export class AccessCodeExpired extends AvClientError {
  readonly name = "AccessCodeExpired";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AccessCodeExpired.prototype);
  }
}

export class NetworkError extends AvClientError {
  readonly name = "NetworkError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class InvalidConfigError extends AvClientError {
  readonly name = "InvalidConfigError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidConfigError.prototype);
  }
}

export class InvalidStateError extends AvClientError {
  readonly name = "InvalidStateError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidStateError.prototype);
  }
}

export class BulletinBoardError extends AvClientError {
  readonly name = "BulletinBoardError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BulletinBoardError.prototype);
  }
}

export class EmailDoesNotMatchVoterRecordError extends AvClientError {
  readonly name = "EmailDoesNotMatchVoterRecordError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, EmailDoesNotMatchVoterRecordError.prototype);
  }
}

export class VoterRecordNotFoundError extends AvClientError {
  readonly name = "VoterRecordNotFoundError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, VoterRecordNotFoundError.prototype);
  }
}

export class UnsupportedServerReplyError extends AvClientError {
  readonly name = "UnsupportedServerReplyError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnsupportedServerReplyError.prototype);
  }
}

export class CorruptCvrError extends AvClientError {
  readonly name = "CorruptCvrError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CorruptCvrError.prototype);
  }
}
