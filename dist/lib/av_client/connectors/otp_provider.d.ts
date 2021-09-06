export interface IdentityConfirmationToken {
    token: 'authorized';
}
export declare class OTPProvider {
    private backend;
    constructor(baseURL: string, timeout?: number);
    requestOTPAuthorization(otpCode: string, email: string): Promise<IdentityConfirmationToken>;
    private createBackendClient;
}
