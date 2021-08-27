export default class AuthenticateWithCodes {
    bulletinBoard: any;
    constructor(bulletinBoard: any);
    authenticate(electionCodes: string[], electionId: number, encryptionKey: string): Promise<{
        voterIdentifier: any;
        precinctId: any;
        keyPair: KeyPair;
        emptyCryptograms: any;
    }>;
    private electionCodesToKeyPair;
    private verifyEmptyCryptograms;
}
declare type KeyPair = {
    privateKey: string;
    publicKey: string;
};
export {};
