"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidStateError = exports.InvalidConfigError = exports.NetworkError = exports.AccessCodeExpired = exports.AccessCodeInvalid = exports.AvClientError = void 0;
class AvClientError extends Error {
    constructor(message, code = 0, statusCode = 0) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        // this is mandatory due:
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, AvClientError.prototype);
        this.setUpStackTrace();
    }
    setUpStackTrace() {
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AvClientError = AvClientError;
class AccessCodeInvalid extends AvClientError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, AccessCodeInvalid.prototype);
        this.setUpStackTrace();
    }
}
exports.AccessCodeInvalid = AccessCodeInvalid;
class AccessCodeExpired extends AvClientError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, AccessCodeExpired.prototype);
        this.setUpStackTrace();
    }
}
exports.AccessCodeExpired = AccessCodeExpired;
class NetworkError extends AvClientError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, NetworkError.prototype);
        this.setUpStackTrace();
    }
}
exports.NetworkError = NetworkError;
class InvalidConfigError extends AvClientError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, InvalidConfigError.prototype);
        this.setUpStackTrace();
    }
}
exports.InvalidConfigError = InvalidConfigError;
class InvalidStateError extends AvClientError {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, InvalidStateError.prototype);
        this.setUpStackTrace();
    }
}
exports.InvalidStateError = InvalidStateError;
//# sourceMappingURL=errors.js.map