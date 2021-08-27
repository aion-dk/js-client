export default class SubmitVotes {
    bulletinBoard: any;
    constructor(bulletinBoard: BulletinBoard);
    signAndSubmitVotes({ voterIdentifier, electionId, voteEncryptions, privateKey, signatureKey, affidavit }: {
        voterIdentifier: any;
        electionId: any;
        voteEncryptions: any;
        privateKey: any;
        signatureKey: any;
        affidavit: any;
    }): Promise<{
        previousBoardHash: any;
        boardHash: any;
        registeredAt: any;
        serverSignature: any;
        voteSubmissionId: any;
    }>;
    private submit;
    private acknowledge;
    private sign;
    private verifyReceipt;
}
interface BulletinBoard {
    getBoardHash: () => any;
    submitVotes: (contentHash: HashValue, signature: Signature, cryptogramsWithProofs: ContestIndexed<CryptogramWithProof>) => any;
}
interface ContestIndexed<Type> {
    [index: string]: Type;
}
declare type CryptogramWithProof = {
    cryptogram: Cryptogram;
    proof: Proof;
};
declare type Proof = string;
declare type Cryptogram = string;
declare type Signature = string;
declare type HashValue = string;
export {};
