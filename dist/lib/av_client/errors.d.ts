export declare class AvClientError extends Error {
    code: number;
    statusCode: number;
    constructor(message: string, code?: number, statusCode?: number);
    protected setUpStackTrace(): void;
}
export declare class AccessCodeInvalid extends AvClientError {
    constructor(message: string);
}
export declare class AccessCodeExpired extends AvClientError {
    constructor(message: string);
}
export declare class NetworkError extends AvClientError {
    constructor(message: string);
}
export declare class InvalidConfigError extends AvClientError {
    constructor(message: string);
}
export declare class InvalidStateError extends AvClientError {
    constructor(message: string);
}
