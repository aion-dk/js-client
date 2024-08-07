export abstract class AvClientError extends Error {
  public code: number;
  public statusCode: number;
  public abstract readonly name: string;

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

export class BallotReferenceNotOnVoterRecord extends AvClientError {
  readonly name = "BallotReferenceNotOnVoterRecord";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BallotReferenceNotOnVoterRecord.prototype);
  }
}

export class DBBError extends AvClientError {
  readonly name = "DBB_ERROR";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DBBError.prototype);
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

export class CorruptSelectionError extends AvClientError {
  readonly name = "CorruptSelectionError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CorruptSelectionError.prototype);
  }
}

export class TimeoutError extends AvClientError {
  readonly name = "TimeoutError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class InvalidTokenError extends AvClientError {
  readonly name = "InvalidTokenError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

export class VoterSessionTimeoutError extends AvClientError {
  readonly name = "VoterSessionTimeoutError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, VoterSessionTimeoutError.prototype);
  }
}
export class InvalidTrackingCodeError extends AvClientError {
  readonly name = "InvalidTrackingCodeError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidTrackingCodeError.prototype);
  }
}

export class InvalidReceiptError extends AvClientError {
  readonly name = "InvalidReceiptError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidReceiptError.prototype);
  }
}

export class InvalidContestError extends AvClientError {
  readonly name = "InvalidContestError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidContestError.prototype);
  }
}

export class InvalidOptionError extends AvClientError {
  readonly name = "InvalidOptionError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidOptionError.prototype);
  }
}
