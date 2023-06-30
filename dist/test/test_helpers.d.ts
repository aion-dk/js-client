import 'dotenv/config';
export declare const bulletinBoardHost: string;
export declare const conferenceHost: string;
export declare const voterAuthorizerHost: string;
export declare const OTPProviderHost: string;
export declare const mailcatcherHost: string;
export declare const OTPProviderElectionContextId = "cca2b217-cedd-4d58-a103-d101ba472eb8";
export declare function resetDeterminism(): any;
export declare function deterministicRandomWords(nwords: any, _paranoia: any): number[];
export declare function resetDeterministicOffset(): void;
export declare function deterministicMathRandom(): number;
declare type SynchronousFunction = () => void;
export declare function expectError(promise: (Promise<unknown> | SynchronousFunction), errorType: any, message: string): Promise<unknown>;
export {};
