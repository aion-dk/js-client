import { ContestIndexed, EncryptedVote } from './types';
declare type Affidavit = string;
declare type SignAndSubmitArguments = {
    voterIdentifier: string;
    electionId: number;
    voteEncryptions: ContestIndexed<EncryptedVote>;
    privateKey: string;
    signatureKey: string;
    affidavit: Affidavit;
};
export default class SubmitVotes {
    bulletinBoard: BulletinBoard;
    constructor(bulletinBoard: BulletinBoard);
    signAndSubmitVotes({ voterIdentifier, electionId, voteEncryptions, privateKey, signatureKey, affidavit }: SignAndSubmitArguments): Promise<{
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
declare type CryptogramWithProof = {
    cryptogram: Cryptogram;
    proof: Proof;
};
declare type Proof = string;
declare type Cryptogram = string;
declare type Signature = string;
declare type HashValue = string;
export {};
