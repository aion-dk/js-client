export declare type IdentityConfirmationToken = string;
export declare class OTPProvider {
    private backend;
    private electionContextUuid;
    constructor(baseURL: string, electionContextUuid: string, timeout?: number);
    requestOTPAuthorization(otpCode: string, email: string): Promise<IdentityConfirmationToken>;
    private createBackendClient;
}
