export declare abstract class AvClientError extends Error {
    code: number;
    statusCode: number;
    abstract readonly name: string;
    constructor(message: string, code?: number, statusCode?: number);
}
export declare class AccessCodeInvalid extends AvClientError {
    readonly name = "AccessCodeInvalid";
    constructor(message: string);
}
export declare class AccessCodeExpired extends AvClientError {
    readonly name = "AccessCodeExpired";
    constructor(message: string);
}
export declare class NetworkError extends AvClientError {
    readonly name = "NetworkError";
    constructor(message: string);
}
export declare class InvalidConfigError extends AvClientError {
    readonly name = "InvalidConfigError";
    constructor(message: string);
}
export declare class InvalidStateError extends AvClientError {
    readonly name = "InvalidStateError";
    constructor(message: string);
}
export declare class BulletinBoardError extends AvClientError {
    readonly name = "BulletinBoardError";
    constructor(message: string);
}
export declare class EmailDoesNotMatchVoterRecordError extends AvClientError {
    readonly name = "EmailDoesNotMatchVoterRecordError";
    constructor(message: string);
}
export declare class VoterRecordNotFoundError extends AvClientError {
    readonly name = "VoterRecordNotFoundError";
    constructor(message: string);
}
export declare class UnsupportedServerReplyError extends AvClientError {
    readonly name = "UnsupportedServerReplyError";
    constructor(message: string);
}
export declare class CorruptCvrError extends AvClientError {
    readonly name = "CorruptCvrError";
    constructor(message: string);
}
export declare class CorruptSelectionError extends AvClientError {
    readonly name = "CorruptSelectionError";
    constructor(message: string);
}
export declare class TimeoutError extends AvClientError {
    readonly name = "TimeoutError";
    constructor(message: string);
}
export declare class InvalidTokenError extends AvClientError {
    readonly name = "InvalidTokenError";
    constructor(message: string);
}
export declare class VoterSessionTimeoutError extends AvClientError {
    readonly name = "VoterSessionTimeoutError";
    constructor(message: string);
}
export declare class InvalidTrackingCodeError extends AvClientError {
    readonly name = "InvalidTrackingCodeError";
    constructor(message: string);
}
export declare class InvalidContestError extends AvClientError {
    readonly name = "InvalidContestError";
    constructor(message: string);
}
export declare class InvalidOptionError extends AvClientError {
    readonly name = "InvalidOptionError";
    constructor(message: string);
}
