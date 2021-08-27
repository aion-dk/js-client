export default class OTPProvider {
    private backend;
    constructor(baseURL: string, timeout?: number);
    requestOTPAuthorization(otpCode: string, email: string): Promise<any>;
    private createBackendClient;
}
