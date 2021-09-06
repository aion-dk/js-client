export default class BenalohChallenge {
    bulletinBoard: any;
    constructor(bulletinBoard: any);
    getServerRandomizers(): Promise<any>;
    getServerCommitmentOpening(voterCommitmentOpening: ContestIndexed<BigNum[]>, encryptedBallotCryptograms: ContestIndexed<Cryptogram>): Promise<any>;
    verifyCommitmentOpening(serverCommitmentOpening: ContestIndexed<BigNum[]>, serverCommitment: PublicKey, serverEmptyCryptograms: ContestIndexed<Cryptogram>): boolean;
}
interface ContestIndexed<Type> {
    [index: string]: Type;
}
declare type PublicKey = string;
declare type Cryptogram = string;
declare type BigNum = string;
export {};
